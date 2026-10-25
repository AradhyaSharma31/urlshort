package com.urlshort.urlshort.service;

import com.urlshort.urlshort.dto.AnalyticsResponse;
import com.urlshort.urlshort.dto.ShortenRequest;
import com.urlshort.urlshort.dto.UrlResponse;
import com.urlshort.urlshort.entity.ClickAnalytics;
import com.urlshort.urlshort.entity.Url;
import com.urlshort.urlshort.repository.ClickAnalyticsRepository;
import com.urlshort.urlshort.repository.UrlRepository;
import com.urlshort.urlshort.util.UserAgentParser;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UrlService {

    private final UrlRepository urlRepository;
    private final ClickAnalyticsRepository analyticsRepository;

    @Value("${app.base-url:http://localhost:8090}")
    private String baseUrl;

    @Transactional
    public UrlResponse createShortUrl(ShortenRequest request) {
        String cleanUrl = request.getOriginalUrl().trim();
        if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
            cleanUrl = "https://" + cleanUrl;
        }

        String shortCode;
        if (request.getCustomAlias() != null && !request.getCustomAlias().trim().isEmpty()) {
            shortCode = request.getCustomAlias().trim();
            if (urlRepository.existsByShortCode(shortCode)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Custom alias '" + shortCode + "' is already in use.");
            }
        } else {
            shortCode = generateUniqueShortCode();
        }

        String title = request.getTitle();
        if (title == null || title.trim().isEmpty()) {
            title = extractDomain(cleanUrl);
        }

        Url url = Url.builder()
                .originalUrl(cleanUrl)
                .shortCode(shortCode)
                .title(title)
                .expiresAt(request.getExpiresAt())
                .clickCount(0L)
                .isActive(true)
                .build();

        Url saved = urlRepository.save(url);
        return toResponse(saved);
    }

    @Transactional
    public String resolveAndTrack(String shortCode, HttpServletRequest request) {
        Url url = urlRepository.findByShortCode(shortCode)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Short URL not found"));

        if (!Boolean.TRUE.equals(url.getIsActive())) {
            throw new ResponseStatusException(HttpStatus.GONE, "This short URL has been disabled");
        }

        if (url.getExpiresAt() != null && url.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.GONE, "This short URL has expired");
        }

        // Track Analytics
        String ua = request.getHeader("User-Agent");
        String referer = request.getHeader("Referer");
        String ip = UserAgentParser.extractClientIp(request);

        ClickAnalytics analytics = ClickAnalytics.builder()
                .url(url)
                .ipAddress(ip)
                .userAgent(ua != null && ua.length() > 500 ? ua.substring(0, 500) : ua)
                .browser(UserAgentParser.parseBrowser(ua))
                .os(UserAgentParser.parseOs(ua))
                .deviceType(UserAgentParser.parseDeviceType(ua))
                .referer(referer != null && referer.length() > 500 ? referer.substring(0, 500) : (referer != null ? referer : "Direct"))
                .build();

        analyticsRepository.save(analytics);
        urlRepository.incrementClickCount(url.getId(), LocalDateTime.now());

        return url.getOriginalUrl();
    }

    @Transactional(readOnly = true)
    public List<UrlResponse> getAllUrls() {
        return urlRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UrlResponse getUrlByShortCode(String shortCode) {
        Url url = urlRepository.findByShortCode(shortCode)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Short URL not found"));
        return toResponse(url);
    }

    @Transactional
    public void deleteUrl(Long id) {
        if (!urlRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "URL not found");
        }
        urlRepository.deleteById(id);
    }

    @Transactional
    public UrlResponse toggleActive(Long id) {
        Url url = urlRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "URL not found"));
        url.setIsActive(!Boolean.TRUE.equals(url.getIsActive()));
        Url saved = urlRepository.save(url);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public AnalyticsResponse getAnalytics(String shortCode) {
        Url url = urlRepository.findByShortCode(shortCode)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Short URL not found"));

        List<Map<String, Object>> browserStats = analyticsRepository.getBrowserStats(url.getId());
        List<Map<String, Object>> osStats = analyticsRepository.getOsStats(url.getId());
        List<Map<String, Object>> deviceStats = analyticsRepository.getDeviceStats(url.getId());
        List<Map<String, Object>> refererStats = analyticsRepository.getRefererStats(url.getId());

        List<ClickAnalytics> recentClicks = analyticsRepository.findByUrlIdOrderByClickedAtDesc(url.getId(), PageRequest.of(0, 20));

        List<AnalyticsResponse.RecentClickDto> recentDtos = recentClicks.stream()
                .map(c -> AnalyticsResponse.RecentClickDto.builder()
                        .id(c.getId())
                        .clickedAt(c.getClickedAt())
                        .browser(c.getBrowser())
                        .os(c.getOs())
                        .deviceType(c.getDeviceType())
                        .referer(c.getReferer())
                        .ipAddress(maskIp(c.getIpAddress()))
                        .build())
                .collect(Collectors.toList());

        return AnalyticsResponse.builder()
                .urlId(url.getId())
                .shortCode(url.getShortCode())
                .originalUrl(url.getOriginalUrl())
                .title(url.getTitle())
                .totalClicks(url.getClickCount())
                .createdAt(url.getCreatedAt())
                .lastAccessedAt(url.getLastAccessedAt())
                .browserStats(browserStats)
                .osStats(osStats)
                .deviceStats(deviceStats)
                .refererStats(refererStats)
                .recentClicks(recentDtos)
                .build();
    }

    private String generateUniqueShortCode() {
        for (int i = 0; i < 10; i++) {
            String code = UserAgentParser.generateRandomCode(6);
            if (!urlRepository.existsByShortCode(code)) {
                return code;
            }
        }
        return UserAgentParser.generateRandomCode(8);
    }

    private String extractDomain(String url) {
        try {
            java.net.URI uri = new java.net.URI(url);
            String host = uri.getHost();
            return host != null ? host.replaceFirst("^www\\.", "") : url;
        } catch (Exception e) {
            return url;
        }
    }

    private String maskIp(String ip) {
        if (ip == null || ip.isBlank()) return "Anonymous";
        if (ip.contains(".")) {
            String[] parts = ip.split("\\.");
            if (parts.length == 4) {
                return parts[0] + "." + parts[1] + ".*.*";
            }
        }
        return "Protected";
    }

    private UrlResponse toResponse(Url url) {
        boolean isExpired = url.getExpiresAt() != null && url.getExpiresAt().isBefore(LocalDateTime.now());
        return UrlResponse.builder()
                .id(url.getId())
                .originalUrl(url.getOriginalUrl())
                .shortCode(url.getShortCode())
                .shortUrl(baseUrl + "/" + url.getShortCode())
                .title(url.getTitle())
                .clickCount(url.getClickCount())
                .expiresAt(url.getExpiresAt())
                .createdAt(url.getCreatedAt())
                .lastAccessedAt(url.getLastAccessedAt())
                .isActive(url.getIsActive())
                .isExpired(isExpired)
                .build();
    }
}
