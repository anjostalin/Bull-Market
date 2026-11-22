package com.stocksim.sts.controller;

import com.stocksim.sts.security.SecurityUtil;
import com.stocksim.sts.service.ReportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/portfolio.pdf")
    public ResponseEntity<byte[]> portfolioPdf() {
        byte[] pdf = reportService.portfolioPdf(SecurityUtil.currentUserId());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=portfolio-statement.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/trades.csv")
    public ResponseEntity<byte[]> tradesCsv() {
        byte[] csv = reportService.tradesCsv(SecurityUtil.currentUserId());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=trade-history.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv);
    }
}
