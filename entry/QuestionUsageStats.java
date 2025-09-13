package org.example.entity;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Date;

@Entity
@Table(name = "question_usage_stats")
public class QuestionUsageStats {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "question_id")
    private Long questionId;

    @Column(name = "exam_id")
    private Long examId;

    @Column(name = "answer_count")
    private Integer answerCount;

    @Column(name = "correct_count")
    private Integer correctCount;

    @Column(name = "correct_rate")
    private Double correctRate;

    @Column(name = "avg_time")
    private BigDecimal avgTime;

    @Column(name = "difficulty_index")
    private BigDecimal difficultyIndex;

    @Column(name = "discrimination")
    private BigDecimal discrimination;

    @Column(name = "usage_date")
    private Date usageDate;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getQuestionId() {
        return questionId;
    }

    public void setQuestionId(Long questionId) {
        this.questionId = questionId;
    }

    public Long getExamId() {
        return examId;
    }

    public void setExamId(Long examId) {
        this.examId = examId;
    }

    public Integer getAnswerCount() {
        return answerCount;
    }

    public void setAnswerCount(Integer answerCount) {
        this.answerCount = answerCount;
    }

    public Integer getCorrectCount() {
        return correctCount;
    }

    public void setCorrectCount(Integer correctCount) {
        this.correctCount = correctCount;
    }

    public Double getCorrectRate() {
        return correctRate;
    }

    public void setCorrectRate(Double correctRate) {
        this.correctRate = correctRate;
    }

    public BigDecimal getAvgTime() {
        return avgTime;
    }

    public void setAvgTime(BigDecimal avgTime) {
        this.avgTime = avgTime;
    }

    public BigDecimal getDifficultyIndex() {
        return difficultyIndex;
    }

    public void setDifficultyIndex(BigDecimal difficultyIndex) {
        this.difficultyIndex = difficultyIndex;
    }

    public BigDecimal getDiscrimination() {
        return discrimination;
    }

    public void setDiscrimination(BigDecimal discrimination) {
        this.discrimination = discrimination;
    }

    public Date getUsageDate() {
        return usageDate;
    }

    public void setUsageDate(Date usageDate) {
        this.usageDate = usageDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
