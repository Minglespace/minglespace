package com.minglers.minglespace.common.converter;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.sql.Timestamp;
import java.time.LocalDateTime;

@Converter(autoApply = true) //autoApply = true면 모든 LocalDateTime 필드에서 자동으로 변환기를 적용
public class LocalDateTimeAttributeConverter implements AttributeConverter<LocalDateTime, Timestamp> {
    @Override
    public Timestamp convertToDatabaseColumn(LocalDateTime attribute) {
        return (attribute == null ? null : Timestamp.valueOf(attribute));
    }

    @Override
    public LocalDateTime convertToEntityAttribute(Timestamp dbData) {
        return (dbData == null ? null : dbData.toLocalDateTime());
    }
}
