package com.fit.project.controller;

import com.fit.project.dto.auth.AuthMessageResponse;
import com.fit.project.dto.auth.ChangePasswordRequest;
import com.fit.project.dto.auth.ForgotPasswordRequest;
import com.fit.project.dto.auth.GoogleLoginRequest;
import com.fit.project.dto.auth.LoginRequest;
import com.fit.project.dto.auth.LoginResponse;
import com.fit.project.dto.auth.RegisterRequest;
import com.fit.project.dto.auth.ResetPasswordRequest;
import com.fit.project.dto.auth.ResendVerificationRequest;
import com.fit.project.dto.auth.VerifyEmailRequest;
import com.fit.project.entity.User;
import com.fit.project.service.AuthService;
import com.fit.project.service.CurrentUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final CurrentUserService currentUserService;

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/google")
    public LoginResponse loginWithGoogle(@Valid @RequestBody GoogleLoginRequest request) {
        return authService.loginWithGoogle(request.credential());
    }

    @PostMapping("/register")
    public LoginResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/verify-email")
    public LoginResponse verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        return authService.verifyEmail(request.email(), request.code());
    }

    @PostMapping("/resend-verification")
    public AuthMessageResponse resendVerificationCode(
            @Valid @RequestBody ResendVerificationRequest request) {
        authService.resendVerificationCode(request.email());
        return new AuthMessageResponse(
                "Nếu email đã đăng ký và cần xác minh, mã mới sẽ được gửi đến hộp thư của bạn.");
    }

    @PostMapping("/forgot-password")
    public AuthMessageResponse forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        return authService.requestPasswordReset(request);
    }

    @PostMapping("/reset-password")
    public AuthMessageResponse resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        return authService.resetPassword(request);
    }

    @PostMapping("/change-password")
    public AuthMessageResponse changePassword(
            @RequestHeader(value = CurrentUserService.HEADER, required = false) Integer userId,
            @Valid @RequestBody ChangePasswordRequest request) {
        User user = currentUserService.requireUser(userId);
        return authService.changePassword(user, request);
    }
}
