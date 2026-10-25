package com.urlshort.urlshort.controller;

import com.urlshort.urlshort.dto.AnalyticsResponse;
import com.urlshort.urlshort.dto.ShortenRequest;
import com.urlshort.urlshort.dto.UrlResponse;
import com.urlshort.urlshort.service.UrlService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@CrossOrigin(originPatterns = "*", allowedHeaders = "*")
public class UrlController {

    private final UrlService urlService;

    @PostMapping("/api/urls")
    public ResponseEntity<UrlResponse> createShortUrl(@Valid @RequestBody ShortenRequest request) {
        UrlResponse response = urlService.createShortUrl(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/api/urls")
    public ResponseEntity<List<UrlResponse>> getAllUrls() {
        return ResponseEntity.ok(urlService.getAllUrls());
    }

    @GetMapping("/api/urls/{shortCode}")
    public ResponseEntity<UrlResponse> getUrlDetails(@PathVariable String shortCode) {
        return ResponseEntity.ok(urlService.getUrlByShortCode(shortCode));
    }

    @GetMapping("/api/urls/{shortCode}/analytics")
    public ResponseEntity<AnalyticsResponse> getAnalytics(@PathVariable String shortCode) {
        return ResponseEntity.ok(urlService.getAnalytics(shortCode));
    }

    @PatchMapping("/api/urls/{id}/toggle")
    public ResponseEntity<UrlResponse> toggleUrlStatus(@PathVariable Long id) {
        return ResponseEntity.ok(urlService.toggleActive(id));
    }

    @DeleteMapping("/api/urls/{id}")
    public ResponseEntity<Map<String, String>> deleteUrl(@PathVariable Long id) {
        urlService.deleteUrl(id);
        return ResponseEntity.ok(Map.of("message", "URL successfully deleted", "id", id.toString()));
    }

    @GetMapping("/{shortCode:[a-zA-Z0-9_-]+}")
    public void redirect(
            @PathVariable String shortCode,
            HttpServletRequest request,
            HttpServletResponse response
    ) throws IOException {
        if ("api".equalsIgnoreCase(shortCode) || "error".equalsIgnoreCase(shortCode) || "favicon.ico".equalsIgnoreCase(shortCode)) {
            response.sendError(HttpServletResponse.SC_NOT_FOUND);
            return;
        }
        String originalUrl = urlService.resolveAndTrack(shortCode, request);
        response.sendRedirect(originalUrl);
    }
}
