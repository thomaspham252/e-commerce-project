package com.fit.project.dto.ml;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.Map;

@JsonIgnoreProperties(ignoreUnknown = true)
public record MlJobModerationDto(
        String label,
        Double score,
        String reasons,
        Map<String, Double> probabilities
) {
}

