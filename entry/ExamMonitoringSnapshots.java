package org.example.entity;

import javax.persistence.*;
import java.math.Long;
import java.time.LocalDateTime;

/**
 * 监控快照表
 * 存储考试过程中的摄像头快照
 */
@Entity
@Table(name = "exam_monitoring_snapshots")
public class ExamMonitoringSnapshots {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "exam_id", nullable = false)
    private Long examId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    // 快照数据
    @Column(name = "snapshot_url", length = 500)
    private String snapshotUrl;

    @Column(name = "snapshot_data", columnDefinition = "LONGTEXT")
    private String snapshotData; // base64图片数据（可选）

    @Column(name = "snapshot_size")
    private Integer snapshotSize; // 图片大小（字节）

    // 检测结果
    @Column(name = "face_detected")
    private Boolean faceDetected;

    @Column(name = "face_confidence", precision = 5, scale = 2)
    private Long faceConfidence; // 人脸检测置信度

    @Column(name = "user_present")
    private Boolean userPresent;

    // 元数据
    @Column(name = "image_width")
    private Integer imageWidth;

    @Column(name = "image_height")
    private Integer imageHeight;

    @Column(name = "image_quality", precision = 3, scale = 2)
    private Long imageQuality;

    // 时间戳
    @Column(name = "captured_at", nullable = false)
    private LocalDateTime capturedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

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

    public String getSnapshotUrl() {
        return snapshotUrl;
    }

    public void setSnapshotUrl(String snapshotUrl) {
        this.snapshotUrl = snapshotUrl;
    }

    public String getSnapshotData() {
        return snapshotData;
    }

    public void setSnapshotData(String snapshotData) {
        this.snapshotData = snapshotData;
    }

    public Integer getSnapshotSize() {
        return snapshotSize;
    }

    public void setSnapshotSize(Integer snapshotSize) {
        this.snapshotSize = snapshotSize;
    }

    public Boolean getFaceDetected() {
        return faceDetected;
    }

    public void setFaceDetected(Boolean faceDetected) {
        this.faceDetected = faceDetected;
    }

    public Long getFaceConfidence() {
        return faceConfidence;
    }

    public void setFaceConfidence(Long faceConfidence) {
        this.faceConfidence = faceConfidence;
    }

    public Boolean getUserPresent() {
        return userPresent;
    }

    public void setUserPresent(Boolean userPresent) {
        this.userPresent = userPresent;
    }

    public Integer getImageWidth() {
        return imageWidth;
    }

    public void setImageWidth(Integer imageWidth) {
        this.imageWidth = imageWidth;
    }

    public Integer getImageHeight() {
        return imageHeight;
    }

    public void setImageHeight(Integer imageHeight) {
        this.imageHeight = imageHeight;
    }

    public Long getImageQuality() {
        return imageQuality;
    }

    public void setImageQuality(Long imageQuality) {
        this.imageQuality = imageQuality;
    }

    public LocalDateTime getCapturedAt() {
        return capturedAt;
    }

    public void setCapturedAt(LocalDateTime capturedAt) {
        this.capturedAt = capturedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (capturedAt == null) capturedAt = LocalDateTime.now();
        if (faceDetected == null) faceDetected = false;
        if (userPresent == null) userPresent = false;
    }
}

