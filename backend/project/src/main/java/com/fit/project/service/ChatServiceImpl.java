package com.fit.project.service;

import com.fit.project.dto.chat.*;
import com.fit.project.entity.ChatMessage;
import com.fit.project.entity.Company;
import com.fit.project.entity.Conversation;
import com.fit.project.entity.Job;
import com.fit.project.entity.User;
import com.fit.project.exception.ApiException;
import com.fit.project.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {

    private final ConversationRepository conversationRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final JobRepository jobRepository;

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    @Override
    @Transactional
    public ConversationResponse findOrCreateConversation(Integer candidateUserId, CreateConversationRequest request) {
        if (request.getCompanyId() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Thiếu ID công ty tuyển dụng");
        }

        User candidate = userRepository.findById(candidateUserId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy tài khoản ứng viên"));

        Company company = companyRepository.findById(request.getCompanyId().intValue())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy thông tin doanh nghiệp"));

        Job job = null;
        if (request.getJobId() != null) {
            job = jobRepository.findById(request.getJobId().intValue()).orElse(null);
        }

        Integer jobIdVal = (job != null) ? job.getId() : null;
        Optional<Conversation> existing = conversationRepository.findByCandidateIdAndCompanyIdAndJobId(
                candidate.getId(), company.getId(), jobIdVal);

        Conversation conv;
        if (existing.isPresent()) {
            conv = existing.get();
        } else {
            LocalDateTime now = LocalDateTime.now();
            conv = Conversation.builder()
                    .candidate(candidate)
                    .company(company)
                    .employer(company.getOwner())
                    .job(job)
                    .lastMessage("Bắt đầu cuộc trò chuyện với nhà tuyển dụng")
                    .lastMessageAt(now)
                    .candidateUnreadCount(0)
                    .employerUnreadCount(0)
                    .createdAt(now)
                    .updatedAt(now)
                    .build();
            conv = conversationRepository.save(conv);
        }

        return mapToConversationResponse(conv, candidateUserId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ConversationResponse> getConversationsForCandidate(Integer candidateUserId) {
        List<Conversation> list = conversationRepository.findByCandidateIdOrderByLastMessageAtDesc(candidateUserId);
        return list.stream()
                .map(c -> mapToConversationResponse(c, candidateUserId))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ConversationResponse> getConversationsForEmployer(Integer employerUserId) {
        Optional<Company> companyOpt = companyRepository.findFirstByOwnerIdOrderByIdAsc(employerUserId);
        if (companyOpt.isEmpty()) {
            return Collections.emptyList();
        }
        Company company = companyOpt.get();
        List<Conversation> list = conversationRepository.findByCompanyIdOrderByLastMessageAtDesc(company.getId());
        return list.stream()
                .map(c -> mapToConversationResponse(c, employerUserId))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatMessageResponse> getMessages(Integer conversationId, Integer userId) {
        Conversation conv = getAndValidateConversationAccess(conversationId, userId);
        List<ChatMessage> messages = chatMessageRepository.findByConversationIdOrderByCreatedAtAsc(conv.getId());
        return messages.stream()
                .map(this::mapToChatMessageResponse)
                .toList();
    }

    @Override
    @Transactional
    public ChatMessageResponse sendMessage(Integer conversationId, Integer senderUserId, SendMessageRequest request) {
        if (request == null || request.getContent() == null || request.getContent().trim().isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Nội dung tin nhắn không được để trống");
        }

        Conversation conv = getAndValidateConversationAccess(conversationId, senderUserId);
        User sender = userRepository.findById(senderUserId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy người gửi"));

        LocalDateTime now = LocalDateTime.now();
        String senderType;

        if (senderUserId.equals(conv.getCandidate().getId())) {
            senderType = "CANDIDATE";
            conv.setEmployerUnreadCount(conv.getEmployerUnreadCount() + 1);
        } else {
            senderType = "EMPLOYER";
            conv.setCandidateUnreadCount(conv.getCandidateUnreadCount() + 1);
        }

        ChatMessage msg = ChatMessage.builder()
                .conversation(conv)
                .sender(sender)
                .senderType(senderType)
                .content(request.getContent().trim())
                .attachmentUrl(request.getAttachmentUrl())
                .isRead(false)
                .createdAt(now)
                .build();
        msg = chatMessageRepository.save(msg);

        conv.setLastMessage(request.getContent().trim());
        conv.setLastMessageAt(now);
        conv.setUpdatedAt(now);
        conversationRepository.save(conv);

        return mapToChatMessageResponse(msg);
    }

    @Override
    @Transactional
    public void markConversationAsRead(Integer conversationId, Integer userId) {
        Conversation conv = getAndValidateConversationAccess(conversationId, userId);

        if (userId.equals(conv.getCandidate().getId())) {
            conv.setCandidateUnreadCount(0);
            chatMessageRepository.markMessagesAsRead(conv.getId(), "CANDIDATE");
        } else {
            conv.setEmployerUnreadCount(0);
            chatMessageRepository.markMessagesAsRead(conv.getId(), "EMPLOYER");
        }
        conversationRepository.save(conv);
    }

    @Override
    @Transactional(readOnly = true)
    public Integer getUnreadCount(Integer userId) {
        Integer candidateCount = conversationRepository.sumCandidateUnreadCount(userId);
        Optional<Company> companyOpt = companyRepository.findFirstByOwnerIdOrderByIdAsc(userId);
        Integer employerCount = 0;
        if (companyOpt.isPresent()) {
            employerCount = conversationRepository.sumEmployerUnreadCount(companyOpt.get().getId());
        }
        return (candidateCount != null ? candidateCount : 0) + (employerCount != null ? employerCount : 0);
    }

    private Conversation getAndValidateConversationAccess(Integer conversationId, Integer userId) {
        Conversation conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy cuộc hội thoại"));

        boolean isCandidate = userId.equals(conv.getCandidate().getId());
        boolean isEmployerOwner = conv.getCompany().getOwner() != null &&
                userId.equals(conv.getCompany().getOwner().getId());

        if (!isCandidate && !isEmployerOwner) {
            throw ApiException.forbidden("Bạn không có quyền truy cập vào cuộc hội thoại này");
        }

        return conv;
    }

    private ConversationResponse mapToConversationResponse(Conversation c, Integer currentUserId) {
        String companyInitials = "DN";
        if (c.getCompany().getName() != null && !c.getCompany().getName().isBlank()) {
            String[] words = c.getCompany().getName().trim().split("\\s+");
            if (words.length >= 2) {
                companyInitials = ("" + words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
            } else {
                companyInitials = c.getCompany().getName().substring(0, Math.min(2, c.getCompany().getName().length())).toUpperCase();
            }
        }

        String jobTitle = (c.getJob() != null) ? c.getJob().getTitle() : "Vị trí tuyển dụng";
        String salary = (c.getJob() != null && c.getJob().getSalaryMin() != null)
                ? String.format("%,d - %,d %s", c.getJob().getSalaryMin().longValue() / 1_000_000,
                c.getJob().getSalaryMax().longValue() / 1_000_000, "Triệu")
                : "Thương lượng";
        String location = (c.getJob() != null && c.getJob().getLocation() != null)
                ? c.getJob().getLocation()
                : "Toàn quốc";

        boolean isCandidateViewing = currentUserId.equals(c.getCandidate().getId());
        int unread = isCandidateViewing ? c.getCandidateUnreadCount() : c.getEmployerUnreadCount();

        return ConversationResponse.builder()
                .id(c.getId().longValue())
                .candidateId(c.getCandidate().getId().longValue())
                .candidateName(c.getCandidate().getEmail())
                .candidateEmail(c.getCandidate().getEmail())
                .companyId(c.getCompany().getId().longValue())
                .companyName(c.getCompany().getName())
                .companyInitials(companyInitials)
                .recruiterName(c.getCompany().getOwner() != null ? c.getCompany().getOwner().getEmail() : "Bộ phận Tuyển dụng")
                .jobId(c.getJob() != null ? c.getJob().getId().longValue() : null)
                .jobTitle(jobTitle)
                .salary(salary)
                .location(location)
                .lastMessage(c.getLastMessage())
                .lastMessageAt(c.getLastMessageAt())
                .unreadCount(unread)
                .isOnline(true)
                .build();
    }

    private ChatMessageResponse mapToChatMessageResponse(ChatMessage m) {
        return ChatMessageResponse.builder()
                .id(m.getId().longValue())
                .conversationId(m.getConversation().getId().longValue())
                .senderId(m.getSender().getId().longValue())
                .senderName(m.getSender().getEmail())
                .senderType(m.getSenderType())
                .content(m.getContent())
                .attachmentUrl(m.getAttachmentUrl())
                .isRead(m.getIsRead())
                .createdAt(m.getCreatedAt())
                .timeFormatted(m.getCreatedAt().format(TIME_FORMATTER))
                .build();
    }
}
