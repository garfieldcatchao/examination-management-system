package org.example.entity;

import javax.persistence.*;
import java.time.LocalDateTime;

/**
 * 考试监控记录表
 * 记录每个考生的实时监控状态
 */
@Entity
@Table(name = "exam_monitoring_records")
public class ExamMonitoringRecords {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "exam_id", nullable = false)
    private Long examId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    // WebSocket连接状态
    @Column(name = "connection_status", length = 20)
    private String connectionStatus; // connected, disconnected, reconnecting

    @Column(name = "is_online", columnDefinition = "TINYINT(1) DEFAULT 0")
    private Boolean isOnline;

    // 摄像头监控状态
    @Column(name = "is_camera_active", columnDefinition = "TINYINT(1) DEFAULT 0")
    private Boolean isCameraActive;

    @Column(name = "face_detected", columnDefinition = "TINYINT(1) DEFAULT 0")
    private Boolean faceDetected;

    @Column(name = "user_present", columnDefinition = "TINYINT(1) DEFAULT 0")
    private Boolean userPresent;

    @Column(name = "last_face_detection_time")
    private LocalDateTime lastFaceDetectionTime;

    // 活动时间
    @Column(name = "last_activity_time")
    private LocalDateTime lastActivityTime;

    @Column(name = "last_snapshot_time")
    private LocalDateTime lastSnapshotTime;

    // 异常统计
    @Column(name = "warning_count")
    private Integer warningCount;

    @Column(name = "absence_count")
    private Integer absenceCount;

    @Column(name = "face_lost_count")
    private Integer faceLostCount;

    // 时间戳
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getExamId() {
        return examId;
    }

    public void setExamId(Long examId) {
        this.examId = examId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getConnectionStatus() {
        return connectionStatus;
    }

    public void setConnectionStatus(String connectionStatus) {
        this.connectionStatus = connectionStatus;
    }

    public Boolean getIsOnline() {
        return isOnline;
    }

    public void setIsOnline(Boolean isOnline) {
        this.isOnline = isOnline;
    }

    public Boolean getIsCameraActive() {
        return isCameraActive;
    }

    public void setIsCameraActive(Boolean isCameraActive) {
        this.isCameraActive = isCameraActive;
    }

    public Boolean getFaceDetected() {
        return faceDetected;
    }

    public void setFaceDetected(Boolean faceDetected) {
        this.faceDetected = faceDetected;
    }

    public Boolean getUserPresent() {
        return userPresent;
    }

    public void setUserPresent(Boolean userPresent) {
        this.userPresent = userPresent;
    }

    public LocalDateTime getLastFaceDetectionTime() {
        return lastFaceDetectionTime;
    }

    public void setLastFaceDetectionTime(LocalDateTime lastFaceDetectionTime) {
        this.lastFaceDetectionTime = lastFaceDetectionTime;
    }

    public LocalDateTime getLastActivityTime() {
        return lastActivityTime;
    }

    public void setLastActivityTime(LocalDateTime lastActivityTime) {
        this.lastActivityTime = lastActivityTime;
    }

    public LocalDateTime getLastSnapshotTime() {
        return lastSnapshotTime;
    }

    public void setLastSnapshotTime(LocalDateTime lastSnapshotTime) {
        this.lastSnapshotTime = lastSnapshotTime;
    }

    public Integer getWarningCount() {
        return warningCount;
    }

    public void setWarningCount(Integer warningCount) {
        this.warningCount = warningCount;
    }

    public Integer getAbsenceCount() {
        return absenceCount;
    }

    public void setAbsenceCount(Integer absenceCount) {
        this.absenceCount = absenceCount;
    }

    public Integer getFaceLostCount() {
        return faceLostCount;
    }

    public void setFaceLostCount(Integer faceLostCount) {
        this.faceLostCount = faceLostCount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (isOnline == null) isOnline = false;
        if (isCameraActive == null) isCameraActive = false;
        if (faceDetected == null) faceDetected = false;
        if (userPresent == null) userPresent = false;
        if (warningCount == null) warningCount = 0;
        if (absenceCount == null) absenceCount = 0;
        if (faceLostCount == null) faceLostCount = 0;
        if (connectionStatus == null) connectionStatus = "disconnected";
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

