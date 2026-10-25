package com.urlshort.urlshort.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalyticsResponse {

    private Long urlId;
    private String shortCode;
    private String originalUrl;
    private String title;
    private Long totalClicks;
    private LocalDateTime createdAt;
    private LocalDateTime lastAccessedAt;

    private List<Map<String, Object>> browserStats;
    private List<Map<String, Object>> osStats;
    private List<Map<String, Object>> deviceStats;
    private List<Map<String, Object>> refererStats;

    private List<RecentClickDto> recentClicks;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RecentClickDto {
        private Long id;
        private LocalDateTime clickedAt;
        private String browser;
        private String os;
        private String deviceType;
        private String referer;
        private String ipAddress;
    }
}
