package com.fit.project.converter;

import com.fit.project.enums.UserStatus;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class UserStatusConverter extends LowercaseEnumConverter<UserStatus> {
    public UserStatusConverter() {
        super(UserStatus.class);
    }
}
