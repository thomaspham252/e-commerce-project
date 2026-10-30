package com.fit.project.service;

import com.fit.project.dto.auth.LoginRequest;
import com.fit.project.dto.auth.LoginResponse;
import com.fit.project.dto.auth.RegisterRequest;
import com.fit.project.entity.CandidateProfile;
import com.fit.project.entity.User;
import com.fit.project.enums.UserRole;
import com.fit.project.enums.UserStatus;
import com.fit.project.exception.ApiException;
import com.fit.project.repository.CandidateProfileRepository;
import com.fit.project.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final GoogleIdentityService googleIdentityService;
    private final EmailVerificationService emailVerificationService;

    @Transactional
    public LoginResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw ApiException.conflict("Địa chỉ email này đã được đăng ký");
        }

        User user = userRepository.save(User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(UserRole.CANDIDATE)
                .status(UserStatus.ACTIVE)
                .emailVerified(false)
                .build());
        candidateProfileRepository.save(CandidateProfile.builder()
                .user(user)
                .fullName(request.name().trim())
                .build());
        emailVerificationService.sendVerificationCode(user);

        return new LoginResponse(user.getId(), user.getEmail(), user.getRole());
    }

    @Transactional
    public LoginResponse loginWithGoogle(String credential) {
        GoogleIdentityService.GoogleIdentity identity = googleIdentityService.verify(credential);
        String email = identity.email().trim().toLowerCase(Locale.ROOT);
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseGet(() -> createGoogleCandidate(email, identity.name()));

        if (user.getStatus() == UserStatus.LOCKED) {
            throw ApiException.forbidden("Tài khoản đã bị khóa");
        }

        if (!user.isEmailVerified()) {
            user.setEmailVerified(true);
            userRepository.save(user);
            emailVerificationService.deleteVerificationCode(user);
        }

        return new LoginResponse(user.getId(), user.getEmail(), user.getRole());
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmailIgnoreCase(request.email().trim())
                .orElseThrow(() -> invalidCredentials());

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw invalidCredentials();
        }
        if (user.getStatus() == UserStatus.LOCKED) {
            throw ApiException.forbidden("Tài khoản đã bị khóa");
        }
        if (!user.isEmailVerified()) {
            throw ApiException.forbidden("Vui lòng xác minh email trước khi đăng nhập");
        }

        return new LoginResponse(user.getId(), user.getEmail(), user.getRole());
    }

    public LoginResponse verifyEmail(String email, String code) {
        User user = emailVerificationService.verifyEmail(email, code);
        return new LoginResponse(user.getId(), user.getEmail(), user.getRole());
    }

    public void resendVerificationCode(String email) {
        emailVerificationService.resendVerificationCode(email);
    }

    private ApiException invalidCredentials() {
        return new ApiException(HttpStatus.UNAUTHORIZED, "Email hoặc mật khẩu không chính xác");
    }

    private User createGoogleCandidate(String email, String name) {
        User user = userRepository.save(User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(UUID.randomUUID().toString()))
                .role(UserRole.CANDIDATE)
                .status(UserStatus.ACTIVE)
                .emailVerified(true)
                .build());
        String fullName = name == null || name.isBlank()
                ? email.substring(0, email.indexOf('@'))
                : name.trim();
        candidateProfileRepository.save(CandidateProfile.builder()
                .user(user)
                .fullName(fullName)
                .build());
        return user;
    }
}
