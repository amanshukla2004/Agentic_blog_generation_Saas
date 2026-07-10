package com.saas.gateway.system;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/public")
public class PublicController {

    private final SystemSettingRepository systemSettingRepository;

    public PublicController(SystemSettingRepository systemSettingRepository) {
        this.systemSettingRepository = systemSettingRepository;
    }

    @GetMapping("/settings")
    public ResponseEntity<Map<String, String>> getPublicSettings() {
        Map<String, String> settings = new HashMap<>();
        
        systemSettingRepository.findBySettingKey("MAINTENANCE_MODE")
            .ifPresent(setting -> settings.put("maintenanceMode", setting.getSettingValue()));
            
        systemSettingRepository.findBySettingKey("SYSTEM_ANNOUNCEMENT_TEXT")
            .ifPresent(setting -> settings.put("systemAnnouncementText", setting.getSettingValue()));
            
        return ResponseEntity.ok(settings);
    }
}
