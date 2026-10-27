package com.fit.project.service;

import com.fit.project.exception.ApiException;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.List;
import java.util.Objects;

@Service
public class GoogleIdentityService {

    private final String clientId;
    private final GoogleIdTokenVerifier verifier;

    public GoogleIdentityService(@Value("${app.google.client-id:}") String clientId) {
        this.clientId = clientId;
        try {
            this.verifier = new GoogleIdTokenVerifier.Builder(
                    GoogleNetHttpTransport.newTrustedTransport(),
                    GsonFactory.getDefaultInstance())
                    .setAudience(List.of(clientId))
                    .build();
        } catch (GeneralSecurityException | IOException exception) {
            throw new IllegalStateException("Could not initialize Google ID token verification", exception);
        }
    }

    public GoogleIdentity verify(String credential) {
        if (clientId.isBlank()) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Đăng nhập Google chưa được cấu hình");
        }

        try {
            GoogleIdToken idToken = verifier.verify(credential);
            if (idToken == null) {
                throw invalidCredential();
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            if (!Boolean.TRUE.equals(payload.getEmailVerified()) || email == null || email.isBlank()) {
                throw invalidCredential();
            }

            return new GoogleIdentity(email, Objects.toString(payload.get("name"), ""));
        } catch (IOException | GeneralSecurityException exception) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Không thể xác thực tài khoản Google lúc này");
        }
    }

    private ApiException invalidCredential() {
        return new ApiException(HttpStatus.UNAUTHORIZED, "Thông tin đăng nhập Google không hợp lệ");
    }

    public record GoogleIdentity(String email, String name) {
    }
}
