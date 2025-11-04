package com.projectplan.scheduler.dto;

import com.projectplan.scheduler.model.UserRole;
import lombok.Data;

@Data
public class InviteUserRequest {
    private String email;
    private UserRole role;
    private String inviterUserId;
}
