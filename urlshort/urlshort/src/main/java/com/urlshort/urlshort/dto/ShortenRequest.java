package com.urlshort.urlshort.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShortenRequest {

    @NotBlank(message = "Original URL cannot be empty")
    @Size(max = 2048, message = "URL is too long")
    private String originalUrl;

    @Pattern(regexp = "^[a-zA-Z0-9_-]{3,20}$|^$", message = "Custom alias must be 3-20 alphanumeric characters, hyphens or underscores")
    private String customAlias;

    @Size(max = 255, message = "Title is too long")
    private String title;

    private LocalDateTime expiresAt;
}
