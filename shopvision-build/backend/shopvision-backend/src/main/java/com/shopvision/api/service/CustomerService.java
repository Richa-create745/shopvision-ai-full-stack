package com.shopvision.api.service;

import com.shopvision.api.dto.SearchDtos.*;
import com.shopvision.api.entity.Product;
import com.shopvision.api.entity.Shop;
import com.shopvision.api.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class CustomerService {

    private final ProductRepository products;

    public CustomerService(ProductRepository products) {
        this.products = products;
    }

    public SearchResponse searchProducts(SearchRequest req) {

        List<String> names = req.products()
                .stream()
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .toList();

        List<SearchItem> matches = new ArrayList<>();

        /*
         * Stores the shops that contain at least one
         * requested product.
         *
         * LinkedHashMap prevents the same shop from
         * appearing multiple times.
         */
        Map<Long, Shop> selectedShops = new LinkedHashMap<>();

        for (String name : names) {

            String normalizedName = InventoryService.normalize(name);

            List<Product> found =
                    products.findByAvailableTrueAndShop_StatusAndNormalizedNameContainingIgnoreCase(
                            com.shopvision.api.entity.ShopStatus.VERIFIED,
                            normalizedName
                    );

            // Product not available anywhere
            if (found.isEmpty()) {

                matches.add(
                        new SearchItem(
                                null,
                                name,
                                false,
                                null,
                                null,
                                null,
                                null,
                                null,
                                null,
                                null
                        )
                );

                continue;
            }

            /*
             * Find the nearest shop containing this product.
             */
            Product best = found.stream()
                    .min(
                            Comparator.comparingDouble(
                                    product -> RouteService.distance(
                                            req.latitude(),
                                            req.longitude(),
                                            product.getShop().getLatitude(),
                                            product.getShop().getLongitude()
                                    )
                            )
                    )
                    .orElse(null);

            if (best == null) {

                matches.add(
                        new SearchItem(
                                null,
                                name,
                                false,
                                null,
                                null,
                                null,
                                null,
                                null,
                                null,
                                null
                        )
                );

                continue;
            }

            Shop shop = best.getShop();

            double distance = RouteService.distance(
                    req.latitude(),
                    req.longitude(),
                    shop.getLatitude(),
                    shop.getLongitude()
            );

            /*
             * Add this shop to the route.
             *
             * If another product also belongs to this shop,
             * it will NOT be added again.
             */
            selectedShops.put(shop.getId(), shop);

            matches.add(
                    new SearchItem(
                            best.getId(),
                            name,
                            true,
                            shop.getId(),
                            shop.getName(),
                            distance,
                            best.getQuantity(),
                            best.getPrice(),
                            shop.getLatitude(),
                            shop.getLongitude()
                    )
            );
        }

        /*
         * Calculate the order in which the customer
         * should visit the selected shops.
         */
        List<Shop> route = calculateRoute(
                req.latitude(),
                req.longitude(),
                new ArrayList<>(selectedShops.values())
        );

        List<Long> visitOrder = route.stream()
                .map(Shop::getId)
                .toList();

        /*
         * Create a human-readable route summary.
         */
        String routeSummary;

        if (route.isEmpty()) {

            routeSummary = "No nearby inventory matched the list.";

        } else {

            routeSummary =
                    "Start from your current location and visit: "
                            + route.stream()
                            .map(Shop::getName)
                            .reduce((a, b) -> a + " → " + b)
                            .orElse("");
        }

        return new SearchResponse(
                names,
                matches,
                visitOrder,
                routeSummary
        );
    }

    /*
     * Nearest-neighbor route calculation.
     *
     * Start from customer's current location.
     * Then go to the nearest selected shop.
     * From there, go to the nearest remaining shop.
     */
    private List<Shop> calculateRoute(
            double latitude,
            double longitude,
            List<Shop> shops
    ) {

        List<Shop> remaining = new ArrayList<>(shops);
        List<Shop> route = new ArrayList<>();

        double currentLat = latitude;
        double currentLng = longitude;

        while (!remaining.isEmpty()) {

            Shop nearestShop = null;
            double shortestDistance = Double.MAX_VALUE;

            for (Shop shop : remaining) {

                double distance = RouteService.distance(
                        currentLat,
                        currentLng,
                        shop.getLatitude(),
                        shop.getLongitude()
                );

                if (distance < shortestDistance) {
                    shortestDistance = distance;
                    nearestShop = shop;
                }
            }

            if (nearestShop == null) {
                break;
            }

            route.add(nearestShop);
            remaining.remove(nearestShop);

            currentLat = nearestShop.getLatitude();
            currentLng = nearestShop.getLongitude();
        }

        return route;
    }
}