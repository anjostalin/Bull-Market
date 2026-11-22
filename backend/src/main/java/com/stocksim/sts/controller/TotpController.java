package com.stocksim.sts.controller;

import com.stocksim.sts.security.SecurityUtil;
import com.stocksim.sts.service.TotpService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/2fa")
public class TotpController {

    private final TotpService totpService;

    public TotpController(TotpService totpService) {
        this.totpService = totpService;
    }

    @PostMapping("/setup")
    public Map<String, String> setup() {
        String uri = totpService.setup(SecurityUtil.currentUserId());
        return Map.of("otpauthUri", uri);
    }

    @PostMapping("/enable")
    public Map<String, Boolean> enable(@RequestBody Map<String, Integer> body) {
        boolean ok = totpService.enable(SecurityUtil.currentUserId(), body.getOrDefault("code", -1));
        return Map.of("enabled", ok);
    }

    @PostMapping("/disable")
    public Map<String, Boolean> disable() {
        totpService.disable(SecurityUtil.currentUserId());
        return Map.of("enabled", false);
    }
}
