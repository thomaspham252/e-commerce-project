package com.fit.project.converter;

import com.fit.project.enums.OrderStatus;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class OrderStatusConverter extends LowercaseEnumConverter<OrderStatus> {
    public OrderStatusConverter() {
        super(OrderStatus.class);
    }
}
