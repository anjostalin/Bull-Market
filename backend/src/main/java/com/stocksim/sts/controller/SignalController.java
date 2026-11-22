package com.stocksim.sts.controller;

import com.stocksim.sts.dto.SignalDtos.SignalView;
import com.stocksim.sts.service.SignalService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stocks")
public class SignalController {

    private final SignalService signalService;

    public SignalController(SignalService signalService) {
        this.signalService = signalService;
    }

    @GetMapping("/{id}/signal")
    public SignalView signal(@PathVariable Long id) {
        return signalService.compute(id);
    }
}
