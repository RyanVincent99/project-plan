package com.projectplan.scheduler.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;
import java.util.List;

@Data
@Entity
@Table(name = "\"Post\"")
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
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
}