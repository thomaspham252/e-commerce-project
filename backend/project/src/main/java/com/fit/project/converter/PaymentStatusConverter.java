package com.fit.project.converter;

import com.fit.project.enums.PaymentStatus;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class PaymentStatusConverter extends LowercaseEnumConverter<PaymentStatus> {
    public PaymentStatusConverter() {
        super(PaymentStatus.class);
    }
}
