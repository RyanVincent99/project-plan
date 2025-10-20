package com.projectplan.scheduler.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CreatePostRequest {
    private String content;
    private String authorId;
    private LocalDateTime scheduledAt; // Optional: for scheduling
}