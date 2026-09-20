package com.shopvision.api.repository;

import com.shopvision.api.entity.Shop;
import com.shopvision.api.entity.ShopStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ShopRepository extends JpaRepository<Shop, Long> {

    Optional<Shop> findByOwnerId(Long ownerId);

    List<Shop> findByStatus(ShopStatus status);
}