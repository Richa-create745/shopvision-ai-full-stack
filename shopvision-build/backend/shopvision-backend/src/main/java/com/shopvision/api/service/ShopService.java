package com.shopvision.api.service;

import com.shopvision.api.dto.ShopDtos.*;
import com.shopvision.api.entity.*;
import com.shopvision.api.repository.*;
import org.springframework.stereotype.Service;

@Service
public class ShopService {

    private final ShopRepository shops;
    private final UserRepository users;
    private final GeocodingService geocodingService;

    public ShopService(
            ShopRepository shops,
            UserRepository users,
            GeocodingService geocodingService
    ) {
        this.shops = shops;
        this.users = users;
        this.geocodingService = geocodingService;
    }

    public Shop create(CreateShopRequest r) {

        User owner = users.findById(r.ownerId())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Owner not found"
                        )
                );

        if (owner.getRole() != Role.SHOPKEEPER) {
            throw new IllegalArgumentException(
                    "Owner must be a shopkeeper"
            );
        }

        Double latitude = r.latitude();
        Double longitude = r.longitude();

        /*
         * OPTION 1:
         * Shopkeeper is physically at the shop
         * and provided GPS coordinates.
         */
        if (latitude == null || longitude == null) {

            /*
             * OPTION 2:
             * Shopkeeper is somewhere else.
             * Convert the written shop location
             * into GPS coordinates.
             */
            String fullLocation = String.join(
                    ", ",
                    r.mohalla(),
                    r.pincode(),
                    r.address(),
                    "India"
            );

            GeocodingService.Coordinates coordinates =
                    geocodingService.geocode(fullLocation);

            latitude = coordinates.latitude();
            longitude = coordinates.longitude();
        }

        return shops.save(
                Shop.builder()
                        .owner(owner)
                        .name(r.name())
                        .mohalla(r.mohalla())
                        .pincode(r.pincode())
                        .address(r.address())
                        .latitude(latitude)
                        .longitude(longitude)
                        .status(ShopStatus.VERIFIED)
                        .build()
        );
    }
}