package com.ist.idp.dto.request;

import lombok.Data;

@Data
public class LinkedInPostRequest {
    private String accessToken;
    private String content;
}
