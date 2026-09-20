package com.shopvision.api.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity @Table(name="media_uploads") @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MediaUpload {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @ManyToOne(optional=false) private Shop shop;
 @Column(nullable=false) private String originalFileName;
 @Column(nullable=false) private String storedPath;
 private String contentType;
 private Long sizeBytes;
 private String aiStatus;
 private Instant createdAt;
 @PrePersist void prePersist(){createdAt=Instant.now(); if(aiStatus==null) aiStatus="UPLOADED";}
}
