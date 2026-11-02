package com.fit.project.service;

import com.fit.project.dto.auth.AuthMessageResponse;
import com.fit.project.dto.auth.ChangePasswordRequest;
import com.fit.project.dto.auth.ForgotPasswordRequest;
import com.fit.project.dto.auth.EmployerRegisterRequest;
import com.fit.project.dto.auth.LoginRequest;
import com.fit.project.dto.auth.LoginResponse;
import com.fit.project.dto.auth.RegisterRequest;
import com.fit.project.dto.auth.ResetPasswordRequest;
import com.fit.project.entity.CandidateProfile;
import com.fit.project.entity.Company;
import com.fit.project.entity.User;
import com.fit.project.enums.UserRole;
import com.fit.project.enums.UserStatus;
import com.fit.project.enums.VerificationStatus;
import com.fit.project.exception.ApiException;
import com.fit.project.repository.CandidateProfileRepository;
import com.fit.project.repository.CompanyRepository;
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
    private final CompanyRepository companyRepository;
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

        return toLoginResponse(user);
    }

    /**
     * Đăng ký tài khoản Nhà tuyển dụng mới:
     * - Tạo tài khoản User vai trò EMPLOYER, trạng thái email_verified = false
     * - Tạo hồ sơ Company ở trạng thái PENDING
     * - Gửi mã OTP xác thực qua email
     */
    @Transactional
    public LoginResponse registerEmployer(EmployerRegisterRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw ApiException.conflict("Địa chỉ email này đã được đăng ký");
        }

        User user = userRepository.save(User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(UserRole.EMPLOYER)
                .status(UserStatus.ACTIVE)
                .emailVerified(false)
                .build());

        Company company = Company.builder()
                .owner(user)
                .name(request.companyName().trim())
                .industry(request.industry() != null ? request.industry().trim() : null)
                .size(request.size() != null ? request.size().trim() : null)
                .address(request.address() != null ? request.address().trim() : null)
                .website(request.website() != null && !request.website().isBlank() ? request.website().trim() : null)
                .verificationStatus(VerificationStatus.PENDING)
                .build();
        companyRepository.save(company);

        emailVerificationService.sendVerificationCode(user);

        return toLoginResponse(user);
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

        return toLoginResponse(user);
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

        return toLoginResponse(user);
    }

    public LoginResponse verifyEmail(String email, String code) {
        User user = emailVerificationService.verifyEmail(email, code);
        return toLoginResponse(user);
    }

    public void resendVerificationCode(String email) {
        emailVerificationService.resendVerificationCode(email);
    }

    public AuthMessageResponse requestPasswordReset(ForgotPasswordRequest request) {
        emailVerificationService.requestPasswordReset(request.email());
        return new AuthMessageResponse(
                "Nếu email đã đăng ký và đã xác minh, mã đặt lại mật khẩu sẽ được gửi đến hộp thư của bạn.");
    }

    public AuthMessageResponse resetPassword(ResetPasswordRequest request) {
        emailVerificationService.resetPassword(request.email(), request.code(), request.newPassword());
        return new AuthMessageResponse("Đặt lại mật khẩu thành công. Bạn có thể đăng nhập bằng mật khẩu mới.");
    }

    @Transactional
    public AuthMessageResponse changePassword(User user, ChangePasswordRequest request) {
        boolean isFirstPassword = !user.isPasswordLoginEnabled();
        if (!isFirstPassword) {
            if (request.currentPassword() == null || request.currentPassword().isBlank()
                    || !passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
                throw ApiException.badRequest("Mật khẩu hiện tại không chính xác");
            }
            if (passwordEncoder.matches(request.newPassword(), user.getPasswordHash())) {
                throw ApiException.badRequest("Mật khẩu mới phải khác mật khẩu hiện tại");
            }
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        user.setPasswordLoginEnabled(true);
        userRepository.save(user);
        return new AuthMessageResponse(isFirstPassword
                ? "Đặt mật khẩu thành công. Bạn có thể đăng nhập bằng email hoặc Google."
                : "Đổi mật khẩu thành công.");
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
                .passwordLoginEnabled(false)
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

    private LoginResponse toLoginResponse(User user) {
        return new LoginResponse(user.getId(), user.getEmail(), user.getRole(), user.isPasswordLoginEnabled());
    }
}
