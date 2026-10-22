package com.fit.project.converter;

import com.fit.project.enums.TokenTransactionType;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class TokenTransactionTypeConverter extends LowercaseEnumConverter<TokenTransactionType> {
    public TokenTransactionTypeConverter() {
        super(TokenTransactionType.class);
    }
}
