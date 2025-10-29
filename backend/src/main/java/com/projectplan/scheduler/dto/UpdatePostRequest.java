package com.projectplan.scheduler.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class UpdatePostRequest {
    private String content;
    private List<String> targetAccountIds;
    private LocalDateTime scheduledAt;
}
