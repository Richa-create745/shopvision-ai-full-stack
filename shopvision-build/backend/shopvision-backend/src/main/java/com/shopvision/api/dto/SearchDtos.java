package com.shopvision.api.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public final class SearchDtos {

 private SearchDtos() {}

 public record SearchRequest(
         Long checklistId,
         @NotEmpty List<String> products,
         @NotNull Double latitude,
         @NotNull Double longitude
 ) {}

 public record SearchItem(
         Long productId,
         String product,
         boolean available,
         Long shopId,
         String shopName,
         Double distanceKm,
         Integer quantity,
         Double price,
         Double latitude,
         Double longitude
 ) {}

 public record VerifyProductRequest(
         @NotNull Long productId,
         @NotNull Long shopId,
         @NotNull Boolean gotProduct,
         Long checklistId,
         @NotEmpty List<String> products,
         @NotNull Double latitude,
         @NotNull Double longitude
 ) {}

 public record VerifyProductResponse(
         boolean success,
         String message,
         SearchResponse updatedSearch
 ) {}

 public record SearchResponse(
         List<String> requestedProducts,
         List<SearchItem> matches,
         List<Long> visitOrder,
         String routeSummary
 ) {}
}