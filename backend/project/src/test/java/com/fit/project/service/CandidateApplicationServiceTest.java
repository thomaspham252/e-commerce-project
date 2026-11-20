package com.fit.project.service;

import com.fit.project.dto.candidate.CandidateProfileResponse;
import com.fit.project.dto.candidate.UpdateCandidateProfileRequest;
import com.fit.project.entity.CandidateProfile;
import com.fit.project.entity.User;
import com.fit.project.repository.ApplicationRepository;
import com.fit.project.repository.CandidateProfileRepository;
import com.fit.project.repository.CvRepository;
import com.fit.project.repository.InterviewInvitationRepository;
import com.fit.project.repository.JobRepository;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class CandidateApplicationServiceTest {

    private final ApplicationRepository applicationRepository = mock(ApplicationRepository.class);
    private final CandidateProfileRepository candidateProfileRepository = mock(CandidateProfileRepository.class);
    private final CvRepository cvRepository = mock(CvRepository.class);
    private final JobRepository jobRepository = mock(JobRepository.class);
    private final InterviewInvitationRepository invitationRepository = mock(InterviewInvitationRepository.class);
    private final CandidateApplicationService service = new CandidateApplicationService(
            applicationRepository, candidateProfileRepository, cvRepository, jobRepository, invitationRepository);

    @Test
    void updateProfilePersistsAndReturnsGeneralInformation() {
        User candidate = User.builder().id(17).email("candidate@example.com").build();
        CandidateProfile profile = CandidateProfile.builder()
                .userId(candidate.getId())
                .user(candidate)
                .fullName("Candidate")
                .build();
        when(candidateProfileRepository.findById(candidate.getId())).thenReturn(Optional.of(profile));
        when(candidateProfileRepository.save(profile)).thenReturn(profile);

        CandidateProfileResponse response = service.updateProfile(candidate, new UpdateCandidateProfileRequest(
                null, null, LocalDate.of(1999, 3, 10), "Nữ", null, null, null,
                " 3 năm ", " Nhân viên ", " Hybrid ", " 20-30 triệu/tháng ", false));

        assertEquals(LocalDate.of(1999, 3, 10), response.dob());
        assertEquals("Nữ", response.gender());
        assertEquals("3 năm", response.experienceYears());
        assertEquals("Nhân viên", response.currentLevel());
        assertEquals("Hybrid", response.workType());
        assertEquals("20-30 triệu/tháng", response.expectedSalary());
        assertFalse(response.isSearchable());
        verify(candidateProfileRepository).save(profile);
    }
}
