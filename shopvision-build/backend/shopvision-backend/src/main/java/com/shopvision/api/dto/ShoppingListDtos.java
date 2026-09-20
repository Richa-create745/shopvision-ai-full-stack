package com.shopvision.api.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.List;

public final class ShoppingListDtos {

    private ShoppingListDtos() {}

    public record ParseShoppingListRequest(
            @NotBlank String text
    ) {}

    public record ParseShoppingListResponse(
            List<String> products
    ) {}
}