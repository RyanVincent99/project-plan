package com.projectplan.scheduler.dto;

import com.projectplan.scheduler.model.UserRole;
import lombok.Data;

@Data
public class UpdateUserRoleRequest {
    private UserRole role;
    private String adminUserId;
}
