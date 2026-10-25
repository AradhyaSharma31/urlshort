package com.urlshort.urlshort.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "click_analytics", indexes = {
    @Index(name = "idx_analytics_url_id", columnList = "url_id"),
    @Index(name = "idx_analytics_clicked_at", columnList = "clickedAt")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClickAnalytics {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "url_id", nullable = false)
    @JsonIgnore
    private Url url;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime clickedAt;

    @Column(length = 64)
    private String ipAddress;

    @Column(length = 512)
    private String userAgent;

    @Column(length = 100)
    private String browser;

    @Column(length = 100)
    private String os;

    @Column(length = 50)
    private String deviceType; // DESKTOP, MOBILE, TABLET, BOT, UNKNOWN

    @Column(length = 512)
    private String referer;

    @Column(length = 100)
    private String country;
}
