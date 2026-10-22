package com.fit.project.converter;

import jakarta.persistence.AttributeConverter;

import java.util.Locale;

/**
 * Lưu enum xuống DB bằng chữ thường để khớp với schema của nhóm (job_portal_db.sql),
 * ví dụ JobStatus.PENDING_REVIEW <-> 'pending_review'. Trong Java và API vẫn dùng tên chữ hoa.
 */
public abstract class LowercaseEnumConverter<E extends Enum<E>> implements AttributeConverter<E, String> {

    private final Class<E> type;

    protected LowercaseEnumConverter(Class<E> type) {
        this.type = type;
    }

    @Override
    public String convertToDatabaseColumn(E value) {
        return value == null ? null : value.name().toLowerCase(Locale.ROOT);
    }

    @Override
    public E convertToEntityAttribute(String dbValue) {
        return dbValue == null ? null : Enum.valueOf(type, dbValue.toUpperCase(Locale.ROOT));
    }
}
