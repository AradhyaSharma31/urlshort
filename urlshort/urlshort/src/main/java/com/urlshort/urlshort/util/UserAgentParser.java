package com.urlshort.urlshort.util;

import jakarta.servlet.http.HttpServletRequest;

import java.security.SecureRandom;
import java.util.regex.Pattern;

public class UserAgentParser {

    private static final String BASE62 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private static final SecureRandom RANDOM = new SecureRandom();

    public static String generateRandomCode(int length) {
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(BASE62.charAt(RANDOM.nextInt(BASE62.length())));
        }
        return sb.toString();
    }

    public static String parseBrowser(String ua) {
        if (ua == null || ua.isBlank()) return "Unknown";
        String lower = ua.toLowerCase();
        if (lower.contains("edg/")) return "Microsoft Edge";
        if (lower.contains("chrome/") && !lower.contains("edg/")) return "Google Chrome";
        if (lower.contains("safari/") && !lower.contains("chrome/")) return "Apple Safari";
        if (lower.contains("firefox/")) return "Mozilla Firefox";
        if (lower.contains("opera/") || lower.contains("opr/")) return "Opera";
        if (lower.contains("curl") || lower.contains("postman")) return "API Client";
        if (lower.contains("bot") || lower.contains("crawler") || lower.contains("spider")) return "Web Bot";
        return "Other";
    }

    public static String parseOs(String ua) {
        if (ua == null || ua.isBlank()) return "Unknown";
        String lower = ua.toLowerCase();
        if (lower.contains("windows")) return "Windows";
        if (lower.contains("mac os") || lower.contains("macintosh")) return "macOS";
        if (lower.contains("android")) return "Android";
        if (lower.contains("iphone") || lower.contains("ipad") || lower.contains("ipod")) return "iOS";
        if (lower.contains("linux")) return "Linux";
        return "Other";
    }

    public static String parseDeviceType(String ua) {
        if (ua == null || ua.isBlank()) return "Unknown";
        String lower = ua.toLowerCase();
        if (lower.contains("bot") || lower.contains("crawler") || lower.contains("spider")) return "Bot";
        if (lower.contains("ipad") || lower.contains("tablet")) return "Tablet";
        if (lower.contains("mobi") || lower.contains("iphone") || lower.contains("android")) return "Mobile";
        return "Desktop";
    }

    public static String extractClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader != null && !xfHeader.isEmpty()) {
            return xfHeader.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
