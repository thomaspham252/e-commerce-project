package com.fit.project.dto.ml;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record MlRelatedJobDto(
        @JsonProperty("job_id") Integer jobId,
        String title,
        @JsonProperty("similarity_score") Double similarityScore,
        @JsonProperty("match_percentage") Integer matchPercentage,
        @JsonProperty("matched_skills") List<String> matchedSkills,
        String location,
        String level
) {}

