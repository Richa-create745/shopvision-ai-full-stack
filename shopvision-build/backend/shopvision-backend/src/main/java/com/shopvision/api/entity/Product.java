package com.shopvision.api.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity @Table(name="products", indexes={@Index(name="idx_product_name", columnList="normalizedName")})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Product {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(optional=false) @JoinColumn(name="shop_id") private Shop shop;
    @Column(nullable=false, length=180) private String name;
    @Column(nullable=false, length=180) private String normalizedName;
    @Column(length=80) private String category;
    private Double price;
    private Integer quantity;
    @Column(length=30) private String unit;
    @Builder.Default private boolean available=true;
    private String sourceMediaName;
    private Instant updatedAt;
    @PrePersist @PreUpdate void touch(){ updatedAt=Instant.now(); }
}
