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
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class AuthServiceTest {

    private final UserRepository userRepository = mock(UserRepository.class);
    private final CandidateProfileRepository candidateProfileRepository = mock(CandidateProfileRepository.class);
    private final PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);
    private final AuthService authService = new AuthService(userRepository, candidateProfileRepository, passwordEncoder);

    @Test
    void registerCreatesCandidateAccountAndProfile() {
        User user = User.builder()
                .id(17)
                .email("candidate@example.com")
                .passwordHash("{bcrypt}encoded")
                .role(UserRole.CANDIDATE)
                .status(UserStatus.ACTIVE)
                .build();
        when(userRepository.existsByEmailIgnoreCase("candidate@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("{bcrypt}encoded");
        when(userRepository.save(any(User.class))).thenReturn(user);

        LoginResponse response = authService.register(
                new RegisterRequest(" Candidate Name ", " CANDIDATE@example.com ", "password123"));

        assertEquals(new LoginResponse(17, "candidate@example.com", UserRole.CANDIDATE), response);
        verify(candidateProfileRepository).save(any(CandidateProfile.class));
        verify(passwordEncoder).encode(eq("password123"));
    }

    @Test
    void registerRejectsAnEmailThatIsAlreadyUsed() {
        when(userRepository.existsByEmailIgnoreCase("candidate@example.com")).thenReturn(true);

        ApiException exception = assertThrows(ApiException.class,
                () -> authService.register(new RegisterRequest("Candidate", "candidate@example.com", "password123")));

        assertEquals(HttpStatus.CONFLICT, exception.getStatus());
    }

    @Test
    void loginReturnsUserWithoutPassword() {
        User user = User.builder()
                .id(17)
                .email("candidate@example.com")
                .passwordHash("{noop}password")
                .role(UserRole.CANDIDATE)
                .status(UserStatus.ACTIVE)
                .build();
        when(userRepository.findByEmailIgnoreCase("candidate@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password", "{noop}password")).thenReturn(true);

        LoginResponse response = authService.login(new LoginRequest(" candidate@example.com ", "password"));

        assertEquals(new LoginResponse(17, "candidate@example.com", UserRole.CANDIDATE), response);
    }

    @Test
    void loginRejectsInvalidCredentials() {
        when(userRepository.findByEmailIgnoreCase("missing@example.com")).thenReturn(Optional.empty());

        ApiException exception = assertThrows(ApiException.class,
                () -> authService.login(new LoginRequest("missing@example.com", "wrong")));

        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatus());
    }

    @Test
    void loginRejectsLockedAccount() {
        User user = User.builder()
                .id(17)
                .email("candidate@example.com")
                .passwordHash("{noop}password")
                .role(UserRole.CANDIDATE)
                .status(UserStatus.LOCKED)
                .build();
        when(userRepository.findByEmailIgnoreCase("candidate@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password", "{noop}password")).thenReturn(true);

        ApiException exception = assertThrows(ApiException.class,
                () -> authService.login(new LoginRequest("candidate@example.com", "password")));

        assertEquals(HttpStatus.FORBIDDEN, exception.getStatus());
    }
}
