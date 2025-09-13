package org.example.entity;

import org.springframework.stereotype.Component;

import javax.persistence.*;
import java.math.BigDecimal;
import java.math.BigInteger;


@Entity
@Table(name = "exam_answers")
public class ExamAnswers {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "exam_id")
    private Long examId;

    @Column(name = "participant_id")
    private Long participantId;

    @Column(name = "question_id")
    private Long questionId;

    @Column(name = "question_order")
    private Integer questionOrder;

    @Column(name = "student_answer")
    private String studentAnswer;

    @Column(name = "selected_options")
    private String selectedOptions;

    @Column(name = "answer_time")
    private Integer answerTime;

    @Column(name = "is_correct", columnDefinition = "TINYINT(1) DEFAULT 1")
    private Boolean isCorrect;

    @Column(name = "score")
    private BigDecimal score;

    @Column(name = "max_score")
    private BigDecimal maxScore;

    @Column(name = "auto_scored", columnDefinition = "TINYINT(1) DEFAULT 1")
    private Boolean autoScored;

    @Column(name = "manual_score")
    private BigDecimal manualScore;

    @Column(name = "teacher_comment")
    private String teacherComment;

    @Column(name = "scored_by")
    private BigInteger scoredBy;

    @Column(name = "scored_at")
    private String scoredAt;

    @Column(name = "answer_changges")
    private String answerChangges;

    @Column(name = "first_answer_time")
    private String firstAnswerTime;

    @Column(name = "last_modified_time")
    private String lastModifiedTime;

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

    public Long getParticipantId() {
        return participantId;
    }

    public void setParticipantId(Long participantId) {
        this.participantId = participantId;
    }

    public Long getQuestionId() {
        return questionId;
    }

    public void setQuestionId(Long questionId) {
        this.questionId = questionId;
    }

    public Integer getQuestionOrder() {
        return questionOrder;
    }

    public void setQuestionOrder(Integer questionOrder) {
        this.questionOrder = questionOrder;
    }

    public String getStudentAnswer() {
        return studentAnswer;
    }

    public void setStudentAnswer(String studentAnswer) {
        this.studentAnswer = studentAnswer;
    }

    public String getSelectedOptions() {
        return selectedOptions;
    }

    public void setSelectedOptions(String selectedOptions) {
        this.selectedOptions = selectedOptions;
    }

    public Integer getAnswerTime() {
        return answerTime;
    }

    public void setAnswerTime(Integer answerTime) {
        this.answerTime = answerTime;
    }

    public Boolean getCorrect() {
        return isCorrect;
    }

    public void setCorrect(Boolean correct) {
        isCorrect = correct;
    }

    public BigDecimal getScore() {
        return score;
    }

    public void setScore(BigDecimal score) {
        this.score = score;
    }

    public BigDecimal getMaxScore() {
        return maxScore;
    }

    public void setMaxScore(BigDecimal maxScore) {
        this.maxScore = maxScore;
    }

    public Boolean getAutoScored() {
        return autoScored;
    }

    public void setAutoScored(Boolean autoScored) {
        this.autoScored = autoScored;
    }

    public BigDecimal getManualScore() {
        return manualScore;
    }

    public void setManualScore(BigDecimal manualScore) {
        this.manualScore = manualScore;
    }

    public String getTeacherComment() {
        return teacherComment;
    }

    public void setTeacherComment(String teacherComment) {
        this.teacherComment = teacherComment;
    }

    public BigInteger getScoredBy() {
        return scoredBy;
    }

    public void setScoredBy(BigInteger scoredBy) {
        this.scoredBy = scoredBy;
    }

    public String getScoredAt() {
        return scoredAt;
    }

    public void setScoredAt(String scoredAt) {
        this.scoredAt = scoredAt;
    }

    public String getAnswerChangges() {
        return answerChangges;
    }

    public void setAnswerChangges(String answerChangges) {
        this.answerChangges = answerChangges;
    }

    public String getFirstAnswerTime() {
        return firstAnswerTime;
    }

    public void setFirstAnswerTime(String firstAnswerTime) {
        this.firstAnswerTime = firstAnswerTime;
    }

    public String getLastModifiedTime() {
        return lastModifiedTime;
    }

    public void setLastModifiedTime(String lastModifiedTime) {
        this.lastModifiedTime = lastModifiedTime;
    }
}
