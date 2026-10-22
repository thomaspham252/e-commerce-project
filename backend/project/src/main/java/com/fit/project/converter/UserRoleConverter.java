package com.fit.project.converter;

import com.fit.project.enums.UserRole;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class UserRoleConverter extends LowercaseEnumConverter<UserRole> {
    public UserRoleConverter() {
        super(UserRole.class);
    }
}
