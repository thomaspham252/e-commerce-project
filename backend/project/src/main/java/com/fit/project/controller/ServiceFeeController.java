package com.fit.project.controller;

import com.fit.project.entity.ServiceFee;
import com.fit.project.exception.ApiException;
import com.fit.project.repository.ServiceFeeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller quản lý Biểu phí tiêu thụ Token cho từng tính năng ứng viên (service_fees).
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/service-fees")
@RequiredArgsConstructor
public class ServiceFeeController {

    private final ServiceFeeRepository serviceFeeRepository;

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> getServiceFees() {
        List<ServiceFee> fees = serviceFeeRepository.findByIsActiveTrue();
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", fees
        ));
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<Map<String, Object>> updateServiceFee(
            @PathVariable String id,
            @RequestBody Map<String, Object> payload) {
        ServiceFee fee = null;
        try {
            Integer numId = Integer.parseInt(id);
            fee = serviceFeeRepository.findById(numId).orElse(null);
        } catch (NumberFormatException ignored) {
        }
        if (fee == null) {
            fee = serviceFeeRepository.findByFeatureKey(id)
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy tính năng có ID/Mã: " + id));
        }

        if (payload.containsKey("tokenCost") && payload.get("tokenCost") != null) {
            int cost = Integer.parseInt(payload.get("tokenCost").toString());
            if (cost <= 0) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Mức trừ Token phải lớn hơn 0");
            }
            fee.setTokenCost(cost);
        }

        if (payload.containsKey("featureName") && payload.get("featureName") != null) {
            fee.setFeatureName(payload.get("featureName").toString());
        }

        if (payload.containsKey("description") && payload.get("description") != null) {
            fee.setDescription(payload.get("description").toString());
        }

        if (payload.containsKey("badge") && payload.get("badge") != null) {
            fee.setBadge(payload.get("badge").toString());
        }

        ServiceFee saved = serviceFeeRepository.save(fee);
        log.info("Admin đã cập nhật biểu phí tính năng: featureKey={}, newCost={}", saved.getFeatureKey(), saved.getTokenCost());

        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", saved
        ));
    }
}
