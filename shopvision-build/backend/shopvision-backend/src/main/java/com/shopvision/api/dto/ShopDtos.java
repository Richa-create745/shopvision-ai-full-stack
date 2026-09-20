package com.shopvision.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public final class ShopDtos {

 private ShopDtos() {}

 public record CreateShopRequest(

         @NotBlank
         String name,

         @NotBlank
         String mohalla,

         @NotBlank
         @Pattern(
                 regexp = "\\d{6}",
                 message = "Pincode must be exactly 6 digits"
         )
         String pincode,

         @NotBlank
         String address,

         Double latitude,

         Double longitude,

         @NotNull
         Long ownerId
 ) {}
}