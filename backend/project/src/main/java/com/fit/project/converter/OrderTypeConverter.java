package com.fit.project.converter;

import com.fit.project.enums.OrderType;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class OrderTypeConverter extends LowercaseEnumConverter<OrderType> {
    public OrderTypeConverter() {
        super(OrderType.class);
    }
}
