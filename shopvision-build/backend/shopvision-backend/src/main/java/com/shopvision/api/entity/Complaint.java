package com.shopvision.api.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity @Table(name="complaints") @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Complaint {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @ManyToOne(optional=false) private User createdBy;
 @Enumerated(EnumType.STRING) @Column(nullable=false,length=20) private Role complainantRole;
 @ManyToOne private Shop shop;
 @Column(nullable=false,length=500) private String issue;
 @Enumerated(EnumType.STRING) @Column(nullable=false,length=20) @Builder.Default private ComplaintStatus status=ComplaintStatus.PENDING;
 private Instant createdAt;
 @PrePersist void prePersist(){createdAt=Instant.now();}
}
