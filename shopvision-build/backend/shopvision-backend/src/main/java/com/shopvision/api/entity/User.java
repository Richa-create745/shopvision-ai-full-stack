package com.shopvision.api.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity @Table(name="users") @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(nullable=false, unique=true, length=120) private String email;
    @Column(nullable=false) private String passwordHash;
    @Column(nullable=false, length=100) private String name;
    @Column(length=30) private String phone;
    @Enumerated(EnumType.STRING) @Column(nullable=false, length=20) private Role role;
    @Builder.Default private boolean active=true;
    @Builder.Default private Instant lastActiveAt=Instant.now();
    private Instant createdAt;
    @PrePersist void prePersist(){ if(createdAt==null) createdAt=Instant.now(); if(lastActiveAt==null) lastActiveAt=Instant.now(); }
}
