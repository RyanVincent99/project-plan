package com.projectplan.scheduler.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List; // Required for comments
import java.util.Set;   // Required for targets

@Data 
@Entity
@Table(name = "\"Post\"")
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID) // Use standard UUID
    private String id;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    private PostStatus status;
    
    @CreationTimestamp
    @Column(name = "createdAt")
    private LocalDateTime createdAt;
    
    @Column(name = "authorId")
    private String authorId;
    
    @Column(name = "scheduledAt")
    private LocalDateTime scheduledAt;

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @OrderBy("createdAt ASC")
    private List<Comment> comments;

    // NEW: Relationship to SocialAccounts
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "\"PostTarget\"", // Name of the join table
        joinColumns = @JoinColumn(name = "postId"),
        inverseJoinColumns = @JoinColumn(name = "socialAccountId")
    )
    private Set<SocialAccount> targets = new java.util.HashSet<>();
}