package com.projectplan.scheduler.dto;

import lombok.Data;

@Data
public class CreateWorkspaceRequest {
    private String name;
    private String userId;
}
