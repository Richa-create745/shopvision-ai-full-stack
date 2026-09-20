package com.shopvision.api.repository;

import com.shopvision.api.entity.Product;
import com.shopvision.api.entity.ShopStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

 List<Product>
 findByAvailableTrueAndShop_StatusAndNormalizedNameContainingIgnoreCase(
         ShopStatus status,
         String name
 );

 List<Product> findByShopId(Long shopId);

 Optional<Product> findByShopIdAndNormalizedName(
         Long shopId,
         String normalizedName
 );
}