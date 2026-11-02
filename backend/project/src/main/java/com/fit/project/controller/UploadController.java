package com.fit.project.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.*;

/**
 * Controller xử lý tải tệp tin và ảnh đại diện, logo doanh nghiệp lên server.
 * Tệp được lưu trực tiếp vào thư mục uploads/ của dự án và phục vụ qua URL /uploads/**.
 */
@RestController
@RequestMapping("/api/upload")
public class UploadController {

    private static final String UPLOAD_BASE_DIR = "uploads";
    private static final String IMAGES_SUBDIR = "images";
    private static final String DOCUMENTS_SUBDIR = "documents";

    private static final Set<String> ALLOWED_IMAGE_EXTS = Set.of(
            "jpg", "jpeg", "png", "webp", "gif", "svg"
    );

    private static final Set<String> ALLOWED_DOC_EXTS = Set.of(
            "jpg", "jpeg", "png", "webp", "gif", "svg", "pdf", "doc", "docx"
    );

    @PostMapping("/image")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) {
        return handleFileUpload(file, IMAGES_SUBDIR, ALLOWED_IMAGE_EXTS, 10 * 1024 * 1024L);
    }

    @PostMapping("/file")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        return handleFileUpload(file, DOCUMENTS_SUBDIR, ALLOWED_DOC_EXTS, 15 * 1024 * 1024L);
    }

    private ResponseEntity<?> handleFileUpload(MultipartFile file, String subDir, Set<String> allowedExts, long maxBytes) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Tệp tin không được để trống."));
        }

        if (file.getSize() > maxBytes) {
            long maxMb = maxBytes / (1024 * 1024);
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Kích thước tệp vượt quá giới hạn " + maxMb + "MB."
            ));
        }

        String originalName = file.getOriginalFilename();
        String ext = "";
        if (originalName != null && originalName.contains(".")) {
            ext = originalName.substring(originalName.lastIndexOf(".") + 1).toLowerCase();
        }

        if (!allowedExts.contains(ext)) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Định dạng tệp ." + ext + " không được hỗ trợ. Chấp nhận: " + String.join(", ", allowedExts)
            ));
        }

        try {
            Path targetDir = Paths.get(UPLOAD_BASE_DIR, subDir);
            if (!Files.exists(targetDir)) {
                Files.createDirectories(targetDir);
            }

            String uniqueName = UUID.randomUUID().toString().replace("-", "").substring(0, 12) + "_" + System.currentTimeMillis() + "." + ext;
            Path targetPath = targetDir.resolve(uniqueName);

            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            String url = "/uploads/" + subDir + "/" + uniqueName;

            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("url", url);
            result.put("fileName", originalName);
            result.put("storedName", uniqueName);
            result.put("size", file.getSize());

            return ResponseEntity.ok(result);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Lỗi máy chủ khi lưu tệp tin: " + e.getMessage()
            ));
        }
    }
}

