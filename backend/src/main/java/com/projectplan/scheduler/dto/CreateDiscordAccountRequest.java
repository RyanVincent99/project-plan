package com.projectplan.scheduler.dto;

import lombok.Data;

@Data
public class CreateDiscordAccountRequest {
    private String name;
    private String webhookUrl;
}
