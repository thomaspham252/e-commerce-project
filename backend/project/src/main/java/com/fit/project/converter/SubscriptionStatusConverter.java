package com.fit.project.converter;

import com.fit.project.enums.SubscriptionStatus;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class SubscriptionStatusConverter extends LowercaseEnumConverter<SubscriptionStatus> {
    public SubscriptionStatusConverter() {
        super(SubscriptionStatus.class);
    }
}
