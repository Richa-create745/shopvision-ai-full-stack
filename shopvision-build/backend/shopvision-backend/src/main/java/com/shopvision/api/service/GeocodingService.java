package com.shopvision.api.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class GeocodingService {

    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public GeocodingService() {

        this.objectMapper = new ObjectMapper();

        this.restClient = RestClient.builder()
                .baseUrl("https://nominatim.openstreetmap.org")
                .defaultHeader(
                        "User-Agent",
                        "ShopVisionAI/1.0"
                )
                .build();
    }

    public Coordinates geocode(String address) {

        try {

            String response = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/search")
                            .queryParam("q", address)
                            .queryParam("format", "json")
                            .queryParam("limit", 1)
                            .build())
                    .retrieve()
                    .body(String.class);

            JsonNode results =
                    objectMapper.readTree(response);

            if (!results.isArray() || results.isEmpty()) {
                throw new IllegalArgumentException(
                        "Could not find this shop address: "
                                + address
                );
            }

            JsonNode location = results.get(0);

            double latitude =
                    location.get("lat").asDouble();

            double longitude =
                    location.get("lon").asDouble();

            return new Coordinates(
                    latitude,
                    longitude
            );

        } catch (Exception e) {

            throw new IllegalArgumentException(
                    "Unable to find coordinates for address: "
                            + address,
                    e
            );
        }
    }

    public record Coordinates(
            double latitude,
            double longitude
    ) {}
}