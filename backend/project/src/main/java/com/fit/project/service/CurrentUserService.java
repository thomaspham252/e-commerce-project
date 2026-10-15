package com.fit.project.service;

import com.fit.project.entity.User;
import com.fit.project.enums.UserRole;
import com.fit.project.enums.UserStatus;
import com.fit.project.exception.ApiException;
import com.fit.project.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

/**
 * Xác định người dùng hiện tại.
 * TẠM THỜI: đọc id từ header X-User-Id vì module Đăng nhập (JWT) chưa có.
 * Khi module tài khoản xong, chỉ cần đổi chỗ này sang lấy từ SecurityContext.
 */
@Service
@RequiredArgsConstructor
public class CurrentUserService {

    public static final String HEADER = "X-User-Id";

    private final UserRepository userRepository;

    public User require(Integer userId, UserRole role) {
        if (userId == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Chưa đăng nhập");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Tài khoản không tồn tại"));
        if (user.getStatus() == UserStatus.LOCKED) {
            throw ApiException.forbidden("Tài khoản đã bị khóa");
        }
        if (user.getRole() != role) {
            throw ApiException.forbidden("Bạn không có quyền truy cập chức năng này");
        }
        return user;
    }
}
