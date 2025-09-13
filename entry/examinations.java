package org.example.entity;

import javax.persistence.*;
import java.math.BigDecimal;
import java.math.BigInteger;


@Entity
@Table(name="examinations")
public class Examinations {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "start_time")
    private String startTime;

    @Column(name = "end_time")
    private String endTime;

    @Column(name = "created_at")
    private String createdAt;

    @Column(name = "description")
    private String description;

    @Column(name ="created_by")
    private BigInteger createdBy;

    @Column(name = "duration")
    private Integer duration;

    @Column(name = "late_limit")
    private Integer lateLimit;

    @Column(name = "early_submit_limit")
    private Integer earlySubmitLimit;

    @Column(name = "max_attempts")
    private Integer maxAttempts;

    @Column(name = "supervisor_ids")
    private String supervisorIds;

    @Column(name = "location")
    private String location;

    @Column(name = "camera_enabled")
    private boolean cameraEnabled = false;

    @Column(name = "screen_record_enabled")
    private boolean screenRecordEnabled = false;

    @Column(name = "prevent_switch")
    private boolean preventSwitch = true;

    @Column(name = "prevent_copy")
    private boolean preventCopy = true;

    @Column(name = "random_questions")
    private boolean randomQuestions = false;

    @Column(name = "random_options")
    private boolean randomOptions = false;

    @Column(name = "status")
    private String status;

    @Column(name = "sub_title")
    private String subTitle;

    @Column(name = "total_participants")
    private Integer totalParticipants;

    @Column(name = "submitted_count")
    private Integer submittedCount;

    @Column(name = "avg_score")
    private BigDecimal avgScore;

    @Column(name = "invigilator")
    private String invigilator;

    @Column(name = "pass_rate")
    private BigDecimal passRate;

    @Column(name = "exam_name")
    private String examName;

    @Column(name = "total_score")
    private Integer totalScore;

    @Column(name = "paper_id")
    private BigInteger paperId;

    @Column(name = "subject_id")
    private BigInteger subjectId;

    @Column(name = "exam_type")
    private String examType;

    @Column(name = "updated_at")
    private String updatedAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getStartTime() {
        return startTime;
    }

    public void setStartTime(String startTime) {
        this.startTime = startTime;
    }

    public String getEndTime() {
        return endTime;
    }

    public void setEndTime(String endTime) {
        this.endTime = endTime;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigInteger getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(BigInteger createdBy) {
        this.createdBy = createdBy;
    }

    public Integer getDuration() {
        return duration;
    }

    public void setDuration(Integer duration) {
        this.duration = duration;
    }

    public Integer getLateLimit() {
        return lateLimit;
    }

    public void setLateLimit(Integer lateLimit) {
        this.lateLimit = lateLimit;
    }

    public Integer getEarlySubmitLimit() {
        return earlySubmitLimit;
    }

    public void setEarlySubmitLimit(Integer earlySubmitLimit) {
        this.earlySubmitLimit = earlySubmitLimit;
    }

    public Integer getMaxAttempts() {
        return maxAttempts;
    }

    public void setMaxAttempts(Integer maxAttempts) {
        this.maxAttempts = maxAttempts;
    }

    public String getSupervisorIds() {
        return supervisorIds;
    }

    public void setSupervisorIds(String supervisorIds) {
        this.supervisorIds = supervisorIds;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public boolean isCameraEnabled() {
        return cameraEnabled;
    }

    public void setCameraEnabled(boolean cameraEnabled) {
        this.cameraEnabled = cameraEnabled;
    }

    public boolean isScreenRecordEnabled() {
        return screenRecordEnabled;
    }

    public void setScreenRecordEnabled(boolean screenRecordEnabled) {
        this.screenRecordEnabled = screenRecordEnabled;
    }

    public boolean isPreventSwitch() {
        return preventSwitch;
    }

    public void setPreventSwitch(boolean preventSwitch) {
        this.preventSwitch = preventSwitch;
    }

    public boolean isPreventCopy() {
        return preventCopy;
    }

    public void setPreventCopy(boolean preventCopy) {
        this.preventCopy = preventCopy;
    }

    public boolean isRandomQuestions() {
        return randomQuestions;
    }

    public void setRandomQuestions(boolean randomQuestions) {
        this.randomQuestions = randomQuestions;
    }

    public boolean isRandomOptions() {
        return randomOptions;
    }

    public void setRandomOptions(boolean randomOptions) {
        this.randomOptions = randomOptions;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getTotalParticipants() {
        return totalParticipants;
    }

    public void setTotalParticipants(Integer totalParticipants) {
        this.totalParticipants = totalParticipants;
    }

    public Integer getSubmittedCount() {
        return submittedCount;
    }

    public void setSubmittedCount(Integer submittedCount) {
        this.submittedCount = submittedCount;
    }

    public String getInvigilator() {
        return invigilator;
    }

    public void setInvigilator(String invigilator) {
        this.invigilator = invigilator;
    }

    public BigDecimal getAvgScore() {
        return avgScore;
    }

    public void setAvgScore(BigDecimal avgScore) {
        this.avgScore = avgScore;
    }

    public Integer getTotalScore() {
        return totalScore;
    }

    public void setTotalScore(Integer totalScore) {
        this.totalScore = totalScore;
    }

    public BigDecimal getPassRate() {
        return passRate;
    }

    public void setPassRate(BigDecimal passRate) {
        this.passRate = passRate;
    }

    public String getExamName() {
        return examName;
    }

    public void setExamName(String examName) {
        this.examName = examName;
    }

    public BigInteger getPaperId() {
        return paperId;
    }

    public void setPaperId(BigInteger paperId) {
        this.paperId = paperId;
    }

    public BigInteger getSubjectId() {
        return subjectId;
    }

    public void setSubjectId(BigInteger subjectId) {
        this.subjectId = subjectId;
    }

    public String getExamType() {
        return examType;
    }

    public void setExamType(String examType) {
        this.examType = examType;
    }

    public String getSubTitle() {
        return subTitle;
    }

    public void setSubTitle(String subTitle) {
        this.subTitle = subTitle;
    }

    public String getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(String updatedAt) {
        this.updatedAt = updatedAt;
    }
}
