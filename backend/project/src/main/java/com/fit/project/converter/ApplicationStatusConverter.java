package com.fit.project.converter;

import com.fit.project.enums.ApplicationStatus;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class ApplicationStatusConverter extends LowercaseEnumConverter<ApplicationStatus> {
    public ApplicationStatusConverter() {
        super(ApplicationStatus.class);
    }
}
