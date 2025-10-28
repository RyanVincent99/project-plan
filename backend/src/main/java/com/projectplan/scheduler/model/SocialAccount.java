package com.projectplan.scheduler.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "\"SocialAccount\"")
public class SocialAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String provider; // e.g., "linkedin", "facebook"
    
    @Enumerated(EnumType.STRING)
    private SocialAccountStatus status;

    private String providerAccountId; // The user's ID on that platform

    private String name; // e.g., "Andre's LinkedIn Profile"

    @Column(columnDefinition = "TEXT")
    private String accessToken;

    @Column(columnDefinition = "TEXT")
    private String refreshToken;

    private LocalDateTime expiresAt;
    
    // In a real app, you would link this to a Workspace or User
    // @ManyToOne
    // private Workspace workspace;
}