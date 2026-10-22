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
 * Tạm thời đọc id từ header X-User-Id; thay bằng SecurityContext khi có xác thực token/session.
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

    public User requireUser(Integer userId) {
        if (userId == null) {
            // Nếu không truyền X-User-Id trong lúc test dev, lấy user đầu tiên
            return userRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Chưa có tài khoản nào trong hệ thống"));
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Tài khoản không tồn tại"));
        if (user.getStatus() == UserStatus.LOCKED) {
            throw ApiException.forbidden("Tài khoản đã bị khóa");
        }
        return user;
    }
}
