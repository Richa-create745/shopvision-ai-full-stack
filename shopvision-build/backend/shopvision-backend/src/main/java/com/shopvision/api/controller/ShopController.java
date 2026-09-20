package com.shopvision.api.controller;

import com.shopvision.api.dto.ShopDtos.*;
import com.shopvision.api.entity.Shop;
import com.shopvision.api.entity.ShopStatus;
import com.shopvision.api.repository.ShopRepository;
import com.shopvision.api.service.ShopService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shops")
public class ShopController {

 private final ShopService service;
 private final ShopRepository shops;

 public ShopController(
         ShopService service,
         ShopRepository shops
 ) {
  this.service = service;
  this.shops = shops;
 }

 @PostMapping
 public Shop create(
         @Valid @RequestBody CreateShopRequest request
 ) {
  return service.create(request);
 }

 @GetMapping
 public List<Shop> all() {
  return shops.findAll();
 }

 @GetMapping("/verified")
 public List<Shop> verified() {
  return shops.findByStatus(ShopStatus.VERIFIED);
 }

 // IMPORTANT:
 // Used when an existing shopkeeper logs in.
 @GetMapping("/owner/{ownerId}")
 public Shop getByOwner(
         @PathVariable Long ownerId
 ) {
  return shops.findByOwnerId(ownerId)
          .orElseThrow(() ->
                  new IllegalArgumentException(
                          "Shop not found for this owner"
                  )
          );
 }

 @PutMapping("/{id}/status")
 public Shop status(
         @PathVariable Long id,
         @RequestParam ShopStatus status
 ) {
  Shop shop = shops.findById(id)
          .orElseThrow(() ->
                  new IllegalArgumentException(
                          "Shop not found"
                  )
          );

  shop.setStatus(status);

  return shops.save(shop);
 }
}