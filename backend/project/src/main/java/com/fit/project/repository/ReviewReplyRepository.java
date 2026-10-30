package com.fit.project.repository;

import com.fit.project.entity.ReviewReply;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ReviewReplyRepository extends JpaRepository<ReviewReply, Integer> {
    Optional<ReviewReply> findByReviewId(Integer reviewId);
}

