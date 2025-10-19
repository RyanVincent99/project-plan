package com.projectplan.scheduler.dto; // CHANGED

import com.projectplan.scheduler.model.PostStatus; // CHANGED
import lombok.Data;

@Data
public class UpdateStatusRequest {
    private PostStatus status;
}