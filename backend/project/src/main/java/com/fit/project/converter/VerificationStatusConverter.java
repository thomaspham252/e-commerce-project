package com.fit.project.converter;

import com.fit.project.enums.VerificationStatus;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class VerificationStatusConverter extends LowercaseEnumConverter<VerificationStatus> {
    public VerificationStatusConverter() {
        super(VerificationStatus.class);
    }
}
