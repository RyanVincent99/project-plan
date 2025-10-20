package com.projectplan.scheduler.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "\"Comment\"") // Use quotes in case 'Comment' is a reserved word
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID) // Simpler ID for comments
    private String id;

    @Column(columnDefinition = "TEXT")
    private String text;
    
    private String authorId; // The ID of the user who commented

    @CreationTimestamp
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "postId")
    @JsonIgnore // Prevents infinite loops when serializing
    private Post post;
}