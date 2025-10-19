package com.projectplan.scheduler.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;

@Data 
@Entity
@Table(name = "\"Post\"")
public class Post {

    @Id
    private String id;

    @Column(columnDefinition = "TEXT") // For longer text
    private String content;

    @Enumerated(EnumType.STRING)
    private PostStatus status;
    
    @CreationTimestamp // Automatically set the creation time
    @Column(name = "createdAt")
    private LocalDateTime createdAt;
    
    // We will just store the author's ID from NextAuth.
    // The frontend will have to use this ID.
    @Column(name = "authorId")
    private String authorId;
}