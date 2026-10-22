package com.fit.project.converter;

import com.fit.project.enums.JobStatus;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class JobStatusConverter extends LowercaseEnumConverter<JobStatus> {
    public JobStatusConverter() {
        super(JobStatus.class);
    }
}
