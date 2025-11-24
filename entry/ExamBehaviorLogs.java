package org.example.entity;

import javax.persistence.*;
import java.time.LocalDateTime;

/**
 * 考试行为日志表
 * 记录考生在考试过程中的各种行为
 */
@Entity
@Table(name = "exam_behavior_logs")
public class ExamBehaviorLogs {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "exam_id", nullable = false)
    private Long examId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    // 行为类型
    @Column(name = "behavior_type", length = 50, nullable = false)
    private String behaviorType; // normal, warning, violation

    @Column(name = "behavior_code", length = 50, nullable = false)
    private String behaviorCode; // tab_switch, face_lost, user_absent, etc.

    // 行为详情
    @Column(name = "behavior_message", columnDefinition = "TEXT", nullable = false)
    private String behaviorMessage;

    @Column(name = "behavior_data", columnDefinition = "JSON")
    private String behaviorData;

    // 严重程度
    @Column(name = "severity", length = 20)
    private String severity; // low, medium, high

    // 是否需要人工审核
    @Column(name = "requires_review", columnDefinition = "TINYINT(1) DEFAULT 0")
    private Boolean requiresReview;

    @Column(name = "reviewed", columnDefinition = "TINYINT(1) DEFAULT 0")
    private Boolean reviewed;

    @Column(name = "reviewed_by")
    private Long reviewedBy;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "review_result", length = 500)
    private String reviewResult;

    // 时间戳
    @Column(name = "occurred_at", nullable = false)
    private LocalDateTime occurredAt;

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

    public String getBehaviorType() {
        return behaviorType;
    }

    public void setBehaviorType(String behaviorType) {
        this.behaviorType = behaviorType;
    }

    public String getBehaviorCode() {
        return behaviorCode;
    }

    public void setBehaviorCode(String behaviorCode) {
        this.behaviorCode = behaviorCode;
    }

    public String getBehaviorMessage() {
        return behaviorMessage;
    }

    public void setBehaviorMessage(String behaviorMessage) {
        this.behaviorMessage = behaviorMessage;
    }

    public String getBehaviorData() {
        return behaviorData;
    }

    public void setBehaviorData(String behaviorData) {
        this.behaviorData = behaviorData;
    }

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }

    public Boolean getRequiresReview() {
        return requiresReview;
    }

    public void setRequiresReview(Boolean requiresReview) {
        this.requiresReview = requiresReview;
    }

    public Boolean getReviewed() {
        return reviewed;
    }

    public void setReviewed(Boolean reviewed) {
        this.reviewed = reviewed;
    }

    public Long getReviewedBy() {
        return reviewedBy;
    }

    public void setReviewedBy(Long reviewedBy) {
        this.reviewedBy = reviewedBy;
    }

    public LocalDateTime getReviewedAt() {
        return reviewedAt;
    }

    public void setReviewedAt(LocalDateTime reviewedAt) {
        this.reviewedAt = reviewedAt;
    }

    public String getReviewResult() {
        return reviewResult;
    }

    public void setReviewResult(String reviewResult) {
        this.reviewResult = reviewResult;
    }

    public LocalDateTime getOccurredAt() {
        return occurredAt;
    }

    public void setOccurredAt(LocalDateTime occurredAt) {
        this.occurredAt = occurredAt;
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
        if (occurredAt == null) occurredAt = LocalDateTime.now();
        if (severity == null) severity = "low";
        if (requiresReview == null) requiresReview = false;
        if (reviewed == null) reviewed = false;
    }
}

