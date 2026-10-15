package com.fit.project.converter;

import com.fit.project.enums.InvitationStatus;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class InvitationStatusConverter extends LowercaseEnumConverter<InvitationStatus> {
    public InvitationStatusConverter() {
        super(InvitationStatus.class);
    }
}
