package com.projectplan.scheduler.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List; // Required for targetAccountIds

@Data
public class CreatePostRequest {
    private String content;
    private String authorId;
    private LocalDateTime scheduledAt;
    private List<String> targetAccountIds; // The IDs of channels to post to
}