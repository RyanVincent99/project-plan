package com.projectplan.scheduler.dto;

import lombok.Data;

@Data
public class CreateCommentRequest {
    private String text;
    private String authorId;
}