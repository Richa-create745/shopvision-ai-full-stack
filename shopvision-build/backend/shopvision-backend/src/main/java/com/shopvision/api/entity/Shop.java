package com.shopvision.api.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name="shops")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Shop {

    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional=false)
    @JoinColumn(name="owner_id", unique=true)
    private User owner;

    @Column(nullable=false, length=150)
    private String name;

    @Column(nullable=false, length=150)
    private String mohalla;

    @Column(nullable=false, length=6)
    private String pincode;

    @Column(length=255)
    private String address;

    @Column(nullable=false)
    private Double latitude;

    @Column(nullable=false)
    private Double longitude;

    @Enumerated(EnumType.STRING)
    @Column(nullable=false, length=20)
    @Builder.Default
    private ShopStatus status = ShopStatus.VERIFIED;

    private Instant createdAt;

    @PrePersist
    void prePersist() {
        if (createdAt == null)
            createdAt = Instant.now();
    }
}