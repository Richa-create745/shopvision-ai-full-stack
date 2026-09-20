package com.shopvision.api.service;

import com.shopvision.api.entity.MediaUpload;
import com.shopvision.api.entity.Product;
import com.shopvision.api.entity.Shop;
import com.shopvision.api.repository.MediaUploadRepository;
import com.shopvision.api.repository.ProductRepository;
import com.shopvision.api.repository.ShopRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
public class InventoryService {

    private final ShopRepository shops;
    private final MediaUploadRepository media;
    private final ProductRepository products;
    private final FileStorageService storage;
    private final GeminiService gemini;

    public InventoryService(
            ShopRepository shops,
            MediaUploadRepository media,
            ProductRepository products,
            FileStorageService storage,
            GeminiService gemini
    ) {
        this.shops = shops;
        this.media = media;
        this.products = products;
        this.storage = storage;
        this.gemini = gemini;
    }

    public List<Product> process(
            Long shopId,
            MultipartFile file
    ) throws Exception {

        Shop shop = shops.findById(shopId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Shop not found"
                        )
                );

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException(
                    "Uploaded file is empty"
            );
        }

        /*
         * Store uploaded media.
         */
        Path path = storage.store(file);

        MediaUpload upload = media.save(
                MediaUpload.builder()
                        .shop(shop)
                        .originalFileName(
                                file.getOriginalFilename()
                        )
                        .storedPath(path.toString())
                        .contentType(file.getContentType())
                        .sizeBytes(file.getSize())
                        .aiStatus("PROCESSING")
                        .build()
        );

        try {

            /*
             * Gemini analyzes the video/image.
             */
            List<GeminiService.ProductDraft> drafts =
                    gemini.extractProducts(
                            path,
                            file.getContentType()
                    );

            List<Product> saved =
                    new ArrayList<>();

            /*
             * Process every product detected by Gemini.
             */
            for (GeminiService.ProductDraft draft : drafts) {

                String normalizedName =
                        normalize(draft.name());

                /*
                 * IMPORTANT:
                 *
                 * Search ONLY inside this shop.
                 */
                Product product =
                        products
                                .findByShopIdAndNormalizedName(
                                        shopId,
                                        normalizedName
                                )
                                .orElse(null);

                /*
                 * PRODUCT DOES NOT EXIST
                 * IN THIS SHOP
                 */
                if (product == null) {

                    product = Product.builder()
                            .shop(shop)
                            .name(draft.name())
                            .normalizedName(normalizedName)
                            .category(draft.category())
                            .price(draft.price())
                            .quantity(draft.quantity())
                            .unit(draft.unit())
                            .available(
                                    draft.quantity() == null ||
                                            draft.quantity() > 0
                            )
                            .sourceMediaName(
                                    file.getOriginalFilename()
                            )
                            .build();

                } else {

                    /*
                     * PRODUCT ALREADY EXISTS
                     * IN THIS SHOP.
                     *
                     * UPDATE it instead of creating
                     * another row.
                     */
                    product.setName(draft.name());
                    product.setCategory(draft.category());
                    product.setPrice(draft.price());
                    product.setQuantity(draft.quantity());
                    product.setUnit(draft.unit());

                    product.setAvailable(
                            draft.quantity() == null ||
                                    draft.quantity() > 0
                    );

                    product.setSourceMediaName(
                            file.getOriginalFilename()
                    );
                }

                saved.add(
                        products.save(product)
                );
            }

            upload.setAiStatus("COMPLETED");
            media.save(upload);

            return saved;

        } catch (Exception e) {

            upload.setAiStatus("FAILED");
            media.save(upload);

            throw e;
        }
    }

    public List<Product> list(Long shopId) {

        return products.findByShopId(shopId);
    }

    /*
     * Remove product ONLY from the specified shop.
     */
    public void removeProductFromShop(
            Long productId,
            Long shopId
    ) {

        Product product =
                products.findById(productId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Product not found"
                                )
                        );

        /*
         * Security check:
         *
         * Product must belong to the shop
         * from which we are removing it.
         */
        if (
                product.getShop() == null ||
                        !product.getShop()
                                .getId()
                                .equals(shopId)
        ) {

            throw new IllegalArgumentException(
                    "Product does not belong to this shop"
            );
        }

        products.delete(product);
    }

    public static String normalize(String value) {

        if (value == null) {
            return "";
        }

        return value
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9 ]", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }
}