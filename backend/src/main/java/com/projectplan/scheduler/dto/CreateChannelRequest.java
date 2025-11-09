package com.projectplan.scheduler.dto;

import lombok.Data;

@Data
public class CreateChannelRequest {
    private String name;
    private String provider;
    private Long workspaceId;
}
