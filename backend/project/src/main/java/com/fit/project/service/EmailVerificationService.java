package com.fit.project.service;

import com.fit.project.entity.EmailVerification;
import com.fit.project.entity.User;
import com.fit.project.enums.UserStatus;
import com.fit.project.exception.ApiException;
import com.fit.project.repository.EmailVerificationRepository;
import com.fit.project.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Locale;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class EmailVerificationService {

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final int CODE_VALIDITY_MINUTES = 10;
    private static final int RESEND_COOLDOWN_SECONDS = 60;

    private final EmailVerificationRepository verificationRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;

    @Value("${spring.mail.host:}")
    private String mailHost;

    @Value("${app.mail.from:}")
    private String fromAddress;

    @Transactional
    public void sendVerificationCode(User user) {
        sendCode(user, "Mã xác minh email JobViet", "Mã xác minh email của bạn là: ");
    }

    @Transactional
    public void requestPasswordReset(String email) {
        Optional<User> candidate = userRepository.findByEmailIgnoreCase(normalizeEmail(email));
        if (candidate.isEmpty() || !candidate.get().isEmailVerified()
                || candidate.get().getStatus() == UserStatus.LOCKED) {
            return;
        }

        User user = candidate.get();
        Optional<EmailVerification> existing = verificationRepository.findByUser_Id(user.getId());
        LocalDateTime now = LocalDateTime.now();
        if (existing.isEmpty()
                || !existing.get().getSentAt().plusSeconds(RESEND_COOLDOWN_SECONDS).isAfter(now)) {
            sendCode(user, "Đặt lại mật khẩu JobViet", "Mã đặt lại mật khẩu của bạn là: ");
        }
    }

    @Transactional(noRollbackFor = ApiException.class)
    public void resetPassword(String email, String code, String newPassword) {
        User user = userRepository.findByEmailIgnoreCase(normalizeEmail(email))
                .filter(User::isEmailVerified)
                .orElseThrow(this::invalidCode);
        EmailVerification verification = verificationRepository.findByUser_Id(user.getId())
                .orElseThrow(this::invalidCode);
        validateCode(verification, code);

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setPasswordLoginEnabled(true);
        userRepository.save(user);
        verificationRepository.delete(verification);
    }

    private void sendCode(User user, String subject, String codePrefix) {
        String code = String.format(Locale.ROOT, "%06d", RANDOM.nextInt(1_000_000));
        LocalDateTime now = LocalDateTime.now();
        EmailVerification verification = verificationRepository.findByUser_Id(user.getId())
                .orElseGet(() -> EmailVerification.builder().user(user).build());
        verification.setCodeHash(passwordEncoder.encode(code));
        verification.setExpiresAt(now.plusMinutes(CODE_VALIDITY_MINUTES));
        verification.setSentAt(now);
        verification.setFailedAttempts(0);
        verificationRepository.save(verification);

        if (mailHost.isBlank() || fromAddress.isBlank()) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Dịch vụ email chưa được cấu hình. Vui lòng liên hệ quản trị viên.");
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(user.getEmail());
        message.setSubject(subject);
        message.setText(codePrefix + code
                + "\nMã có hiệu lực trong " + CODE_VALIDITY_MINUTES + " phút."
                + "\nNếu bạn không yêu cầu tạo tài khoản, hãy bỏ qua email này.");
        try {
            mailSender.send(message);
        } catch (MailException exception) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Không thể gửi email xác minh. Vui lòng thử lại sau.");
        }
    }

    @Transactional(noRollbackFor = ApiException.class)
    public User verifyEmail(String email, String code) {
        User user = userRepository.findByEmailIgnoreCase(normalizeEmail(email))
                .orElseThrow(this::invalidCode);
        if (user.isEmailVerified()) {
            throw ApiException.badRequest("Email này đã được xác minh");
        }

        EmailVerification verification = verificationRepository.findByUser_Id(user.getId())
                .orElseThrow(this::invalidCode);
        validateCode(verification, code);

        user.setEmailVerified(true);
        userRepository.save(user);
        verificationRepository.delete(verification);
        return user;
    }

    private void validateCode(EmailVerification verification, String code) {
        LocalDateTime now = LocalDateTime.now();
        if (!verification.getExpiresAt().isAfter(now)
                || verification.getFailedAttempts() >= MAX_FAILED_ATTEMPTS) {
            throw invalidCode();
        }

        if (!passwordEncoder.matches(code, verification.getCodeHash())) {
            verification.setFailedAttempts(verification.getFailedAttempts() + 1);
            verificationRepository.save(verification);
            throw invalidCode();
        }
    }

    @Transactional
    public void resendVerificationCode(String email) {
        Optional<User> candidate = userRepository.findByEmailIgnoreCase(normalizeEmail(email));
        if (candidate.isPresent() && !candidate.get().isEmailVerified()) {
            User user = candidate.get();
            Optional<EmailVerification> existing = verificationRepository.findByUser_Id(user.getId());
            LocalDateTime now = LocalDateTime.now();
            if (existing.isEmpty()
                    || !existing.get().getSentAt().plusSeconds(RESEND_COOLDOWN_SECONDS).isAfter(now)) {
                sendVerificationCode(user);
            }
        }
    }

    @Transactional
    public void deleteVerificationCode(User user) {
        verificationRepository.deleteByUser_Id(user.getId());
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private ApiException invalidCode() {
        return ApiException.badRequest("Mã xác minh không hợp lệ hoặc đã hết hạn");
    }
}
