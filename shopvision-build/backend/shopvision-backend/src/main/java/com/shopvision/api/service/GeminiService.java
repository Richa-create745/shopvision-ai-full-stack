package com.shopvision.api.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.genai.Client;
import com.google.genai.types.Content;
import com.google.genai.types.File;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.GenerateContentResponse;
import com.google.genai.types.Part;
import com.shopvision.api.entity.Product;
import com.shopvision.api.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.file.Path;
import java.util.*;

@Service
public class GeminiService {

    private final ProductRepository products;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final String apiKey;
    private final String model;

    public GeminiService(
            ProductRepository products,
            @Value("${gemini.api.key:}") String apiKey,
            @Value("${gemini.model:gemini-3.8-flash}") String model
    ) {
        this.products = products;
        this.apiKey = apiKey;
        this.model = model;
    }

    public List<ProductDraft> extractProducts(Path media, String mimeType) throws Exception {

        // Do NOT create fake products if Gemini key is missing.
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException(
                    "Gemini API key is missing. Set GEMINI_API_KEY before uploading inventory."
            );
        }

        try (Client client = Client.builder().apiKey(apiKey).build()) {

            // Upload the complete video/image to Gemini.
            File uploaded = client.files.upload(media.toString(), null);

            String fileName = uploaded.name()
                    .orElseThrow(() -> new IllegalStateException(
                            "Gemini did not return a file name."
                    ));

            System.out.println("Gemini file uploaded: " + fileName);

// Video files need time to be processed by Gemini.
            File processedFile = uploaded;

            for (int attempt = 1; attempt <= 60; attempt++) {

                String state = processedFile.state()
                        .map(Object::toString)
                        .orElse("UNKNOWN");

                System.out.println(
                        "Gemini file processing state: " + state +
                                " (attempt " + attempt + ")"
                );

                if (state.contains("ACTIVE")) {
                    break;
                }

                if (state.contains("FAILED")) {
                    throw new IllegalStateException(
                            "Gemini failed to process the uploaded video."
                    );
                }

                Thread.sleep(2000);

                processedFile = client.files.get(fileName, null);
            }

            String finalState = processedFile.state()
                    .map(Object::toString)
                    .orElse("UNKNOWN");

            if (!finalState.contains("ACTIVE")) {
                throw new IllegalStateException(
                        "Gemini video processing timed out. Final state: "
                                + finalState
                );
            }

            String uri = processedFile.uri()
                    .orElseThrow(() -> new IllegalStateException(
                            "Gemini did not return a processed video URI."
                    ));

            String mime = processedFile.mimeType()
                    .orElse(
                            mimeType == null
                                    ? "video/mp4"
                                    : mimeType
                    );

            System.out.println("Gemini video is ACTIVE. Starting analysis...");

            /*
             * IMPORTANT:
             * Ask Gemini to inspect the ENTIRE video and extract
             * every distinct product visible in the shop.
             */
            String prompt = """
        You are an AI inventory scanner for a retail grocery/local shop.

        IMPORTANT:
        The uploaded video is a real shop inventory recording.
        Your job is to extract products that are VISIBLY PRESENT in the video.

        Carefully inspect the entire video from beginning to end.

        PRODUCT DETECTION RULES:

        1. Look at every shelf, rack, counter, refrigerator and product area.
        2. Detect packaged goods, bottles, boxes, packets, cans, food items,
           beverages, household products and other clearly sellable items.
        3. If you can visually recognize a product, include it.
        4. Do NOT require the price to be visible.
        5. Do NOT require the quantity to be visible.
        6. If the price is not visible, use null.
        7. If the quantity cannot be determined, use null.
        8. If the unit cannot be determined, use null.
        9. If the brand is visible, preserve the brand.
        10. If the product size is visible, include it in the name.
        11. Do not use the uploaded filename as a product name.
        12. Do not invent products that are not visually present.
        13. If the same product appears multiple times, return it only once.
        14. Use "Other" when the category cannot be determined.

        VERY IMPORTANT:
        Even if price, quantity, category or unit are unknown,
        still return the product if the product itself is visible.

        For example, if you can see an Amul milk packet but cannot read
        its price or quantity, return:

        {
          "name": "Amul Milk",
          "category": "Dairy",
          "price": null,
          "quantity": null,
          "unit": null
        }

        Return ONLY a JSON array.

        Required format:

        [
          {
            "name": "Product name",
            "category": "Category",
            "price": 30.0,
            "quantity": 10,
            "unit": "packet"
          }
        ]

        Do not return markdown.
        Do not return explanations.
        Do not return ```json.
        """;

            GenerateContentConfig config = GenerateContentConfig.builder()
                    .responseMimeType("application/json")
                    .temperature(0.1F)
                    .maxOutputTokens(12000)
                    .build();

            GenerateContentResponse response =
                    client.models.generateContent(
                            model,
                            Content.fromParts(
                                    Part.fromText(prompt),
                                    Part.fromUri(uri, mime)
                            ),
                            config
                    );

            String raw = response.text();

            System.out.println("======================================");
            System.out.println("GEMINI RAW RESPONSE:");
            System.out.println(raw);
            System.out.println("======================================");

            if (raw == null || raw.isBlank()) {
                throw new IllegalStateException(
                        "Gemini returned an empty response while analyzing the inventory."
                );
            }

            return parseJson(raw);
        }
    }

    public String understandShoppingList(String text) {

        if (apiKey == null || apiKey.isBlank()) {
            return text;
        }

        try (Client client = Client.builder().apiKey(apiKey).build()) {

            String prompt =
                    "Convert the customer's shopping request into a simple " +
                            "comma-separated product list. " +
                            "Preserve product names. " +
                            "Return only the list. " +
                            "Request: " + text;

            return client.models
                    .generateContent(model, prompt, null)
                    .text();
        }
    }

    private List<ProductDraft> parseJson(String raw) throws Exception {

        String json = raw.trim();

        // Remove markdown if Gemini accidentally adds it.
        if (json.startsWith("```")) {
            json = json
                    .replaceFirst("^```json\\s*", "")
                    .replaceFirst("^```\\s*", "");

            if (json.endsWith("```")) {
                json = json.substring(0, json.length() - 3).trim();
            }
        }

        List<Map<String, Object>> items =
                objectMapper.readValue(
                        json,
                        new TypeReference<List<Map<String, Object>>>() {}
                );

        List<ProductDraft> productsList = new ArrayList<>();

        // Prevent exact duplicate products from Gemini.
        Set<String> seenProducts = new HashSet<>();

        for (Map<String, Object> item : items) {

            Object nameObject = item.get("name");

            if (nameObject == null) {
                continue;
            }

            String name = String.valueOf(nameObject).trim();

            if (name.isBlank()) {
                continue;
            }

            String normalizedName = name
                    .toLowerCase(Locale.ROOT)
                    .replaceAll("\\s+", " ")
                    .trim();

            if (!seenProducts.add(normalizedName)) {
                continue;
            }

            String category = item.get("category") == null
                    ? "Other"
                    : String.valueOf(item.get("category"));

            Double price = parseDouble(item.get("price"));
            Integer quantity = parseInteger(item.get("quantity"));

            String unit = item.get("unit") == null
                    ? null
                    : String.valueOf(item.get("unit"));

            productsList.add(
                    new ProductDraft(
                            name,
                            category,
                            price,
                            quantity,
                            unit
                    )
            );
        }

        if (productsList.isEmpty()) {
            throw new IllegalStateException(
                    "Gemini could not identify any products in the uploaded media."
            );
        }

        return productsList;
    }

    private Double parseDouble(Object value) {

        if (value == null) {
            return null;
        }

        if (value instanceof Number number) {
            return number.doubleValue();
        }

        String text = String.valueOf(value).trim();

        if (text.isBlank() || text.equalsIgnoreCase("null")) {
            return null;
        }

        try {
            return Double.parseDouble(
                    text.replaceAll("[^0-9.]", "")
            );
        } catch (Exception e) {
            return null;
        }
    }

    private Integer parseInteger(Object value) {

        if (value == null) {
            return null;
        }

        if (value instanceof Number number) {
            return number.intValue();
        }

        String text = String.valueOf(value).trim();

        if (text.isBlank() || text.equalsIgnoreCase("null")) {
            return null;
        }

        try {
            return Integer.parseInt(
                    text.replaceAll("[^0-9]", "")
            );
        } catch (Exception e) {
            return null;
        }
    }

    public record ProductDraft(
            String name,
            String category,
            Double price,
            Integer quantity,
            String unit
    ) {
    }
    public List<String> parseShoppingList(String text) {

        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException(
                    "Gemini API key is missing."
            );
        }

        String prompt = """
            You are a shopping-list parser for a local market application.

            Convert the customer's request into a clean list of
            individual product names.

            Rules:
            1. Return ONLY a JSON array of strings.
            2. Do not return markdown.
            3. Do not return explanations.
            4. Do not invent products.
            5. Keep product names short and searchable.
            6. Remove quantities.
            7. Do not combine multiple products into one string.

            Examples:

            Customer: "pen and seeds"
            Output: ["pen", "seeds"]

            Customer: "I need a pen, notebook and seeds"
            Output: ["pen", "notebook", "seeds"]

            Customer: "2 pens and 3 notebooks"
            Output: ["pen", "notebook"]

            Customer request:
            %s
            """.formatted(text);

        try (Client client = Client.builder().apiKey(apiKey).build()) {

            GenerateContentConfig config =
                    GenerateContentConfig.builder()
                            .responseMimeType("application/json")
                            .temperature(0.1F)
                            .build();

            GenerateContentResponse response =
                    client.models.generateContent(
                            model,
                            prompt,
                            config
                    );

            String raw = response.text();

            if (raw == null || raw.isBlank()) {
                throw new IllegalStateException(
                        "Gemini returned an empty response."
                );
            }

            String cleaned = raw
                    .replace("```json", "")
                    .replace("```", "")
                    .trim();

            List<String> productsList =
                    objectMapper.readValue(
                            cleaned,
                            new TypeReference<List<String>>() {}
                    );

            return productsList.stream()
                    .map(String::trim)
                    .filter(product -> !product.isBlank())
                    .distinct()
                    .toList();

        } catch (Exception e) {
            throw new RuntimeException(
                    "Failed to parse shopping list with Gemini: "
                            + e.getMessage(),
                    e
            );
        }
    }
}