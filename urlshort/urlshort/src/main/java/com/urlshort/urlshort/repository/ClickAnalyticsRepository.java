package com.urlshort.urlshort.repository;

import com.urlshort.urlshort.entity.ClickAnalytics;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface ClickAnalyticsRepository extends JpaRepository<ClickAnalytics, Long> {

    List<ClickAnalytics> findByUrlIdOrderByClickedAtDesc(Long urlId, Pageable pageable);

    long countByUrlId(Long urlId);

    @Query("SELECT c.browser AS name, COUNT(c) AS count FROM ClickAnalytics c WHERE c.url.id = :urlId GROUP BY c.browser ORDER BY COUNT(c) DESC")
    List<Map<String, Object>> getBrowserStats(@Param("urlId") Long urlId);

    @Query("SELECT c.os AS name, COUNT(c) AS count FROM ClickAnalytics c WHERE c.url.id = :urlId GROUP BY c.os ORDER BY COUNT(c) DESC")
    List<Map<String, Object>> getOsStats(@Param("urlId") Long urlId);

    @Query("SELECT c.deviceType AS name, COUNT(c) AS count FROM ClickAnalytics c WHERE c.url.id = :urlId GROUP BY c.deviceType ORDER BY COUNT(c) DESC")
    List<Map<String, Object>> getDeviceStats(@Param("urlId") Long urlId);

    @Query("SELECT c.referer AS name, COUNT(c) AS count FROM ClickAnalytics c WHERE c.url.id = :urlId GROUP BY c.referer ORDER BY COUNT(c) DESC")
    List<Map<String, Object>> getRefererStats(@Param("urlId") Long urlId);
}
