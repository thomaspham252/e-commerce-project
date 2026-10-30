package com.fit.project.service;

import com.fit.project.entity.EmailVerification;
import com.fit.project.entity.User;
import com.fit.project.exception.ApiException;
import com.fit.project.repository.EmailVerificationRepository;
import com.fit.project.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class EmailVerificationServiceTest {

    private final EmailVerificationRepository verificationRepository = mock(EmailVerificationRepository.class);
    private final UserRepository userRepository = mock(UserRepository.class);
    private final PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);
    private final JavaMailSender mailSender = mock(JavaMailSender.class);
    private final EmailVerificationService service = new EmailVerificationService(
            verificationRepository, userRepository, passwordEncoder, mailSender);

    @Test
    void verifyEmailMarksTheAccountVerifiedAndConsumesCode() {
        User user = User.builder().id(17).email("candidate@example.com").emailVerified(false).build();
        EmailVerification verification = EmailVerification.builder()
                .user(user)
                .codeHash("hashed-code")
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .failedAttempts(0)
                .build();
        when(userRepository.findByEmailIgnoreCase("candidate@example.com")).thenReturn(Optional.of(user));
        when(verificationRepository.findByUser_Id(17)).thenReturn(Optional.of(verification));
        when(passwordEncoder.matches("012345", "hashed-code")).thenReturn(true);

        User verifiedUser = service.verifyEmail(" CANDIDATE@example.com ", "012345");

        assertTrue(user.isEmailVerified());
        assertEquals(user, verifiedUser);
        verify(userRepository).save(user);
        verify(verificationRepository).delete(verification);
    }

    @Test
    void verifyEmailPersistsFailedAttempts() {
        User user = User.builder().id(17).email("candidate@example.com").emailVerified(false).build();
        EmailVerification verification = EmailVerification.builder()
                .user(user)
                .codeHash("hashed-code")
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .failedAttempts(0)
                .build();
        when(userRepository.findByEmailIgnoreCase("candidate@example.com")).thenReturn(Optional.of(user));
        when(verificationRepository.findByUser_Id(17)).thenReturn(Optional.of(verification));
        when(passwordEncoder.matches("wrong1", "hashed-code")).thenReturn(false);

        assertThrows(ApiException.class, () -> service.verifyEmail("candidate@example.com", "wrong1"));

        assertEquals(1, verification.getFailedAttempts());
        verify(verificationRepository).save(verification);
    }

    @Test
    void verifyEmailRejectsExpiredCodes() {
        User user = User.builder().id(17).email("candidate@example.com").emailVerified(false).build();
        EmailVerification verification = EmailVerification.builder()
                .user(user)
                .codeHash("hashed-code")
                .expiresAt(LocalDateTime.now().minusSeconds(1))
                .failedAttempts(0)
                .build();
        when(userRepository.findByEmailIgnoreCase("candidate@example.com")).thenReturn(Optional.of(user));
        when(verificationRepository.findByUser_Id(17)).thenReturn(Optional.of(verification));

        assertThrows(ApiException.class, () -> service.verifyEmail("candidate@example.com", "012345"));
    }
}
