package com.fit.project.converter;

import com.fit.project.enums.SalaryUnit;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class SalaryUnitConverter extends LowercaseEnumConverter<SalaryUnit> {
    public SalaryUnitConverter() {
        super(SalaryUnit.class);
    }
}
