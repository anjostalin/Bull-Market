package com.stocksim.sts.service;

import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.stocksim.sts.dto.PortfolioDtos.HoldingView;
import com.stocksim.sts.dto.PortfolioDtos.PortfolioSummary;
import com.stocksim.sts.entity.Trade;
import com.stocksim.sts.entity.User;
import com.stocksim.sts.exception.ApiException;
import com.stocksim.sts.repository.TradeRepository;
import com.stocksim.sts.repository.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class ReportService {

    private final PortfolioService portfolioService;
    private final TradeRepository tradeRepository;
    private final UserRepository userRepository;

    public ReportService(PortfolioService portfolioService, TradeRepository tradeRepository,
                         UserRepository userRepository) {
        this.portfolioService = portfolioService;
        this.tradeRepository = tradeRepository;
        this.userRepository = userRepository;
    }

    public byte[] portfolioPdf(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("User not found"));
        PortfolioSummary s = portfolioService.summary(userId);

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (PdfWriter writer = new PdfWriter(baos);
             PdfDocument pdf = new PdfDocument(writer);
             Document doc = new Document(pdf)) {

            doc.add(new Paragraph("StockSim Pro — Portfolio Statement")
                    .setBold().setFontSize(18));
            doc.add(new Paragraph("Investor: " + user.getFullName() + "  (" + user.getEmail() + ")")
                    .setFontSize(10));
            doc.add(new Paragraph("Generated: " +
                    LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"))).setFontSize(10));
            doc.add(new Paragraph("All values are virtual (simulation only).").setFontSize(9).setItalic());
            doc.add(new Paragraph(" "));

            Table summary = new Table(UnitValue.createPercentArray(new float[]{3, 2})).useAllAvailableWidth();
            summary.addCell(kv("Total Invested")); summary.addCell(val("Rs " + s.totalInvested()));
            summary.addCell(kv("Current Value")); summary.addCell(val("Rs " + s.totalCurrentValue()));
            summary.addCell(kv("Unrealized P&L")); summary.addCell(val("Rs " + s.totalUnrealizedPnl() + " (" + s.totalUnrealizedPnlPercent() + "%)"));
            summary.addCell(kv("Realized P&L")); summary.addCell(val("Rs " + s.totalRealizedPnl()));
            summary.addCell(kv("Wallet Balance")); summary.addCell(val("Rs " + s.walletBalance()));
            summary.addCell(kv("Net Worth")); summary.addCell(val("Rs " + s.netWorth()));
            doc.add(summary);
            doc.add(new Paragraph(" "));

            doc.add(new Paragraph("Holdings").setBold().setFontSize(13));
            Table h = new Table(UnitValue.createPercentArray(new float[]{2, 1, 2, 2, 2, 2})).useAllAvailableWidth();
            for (String head : new String[]{"Stock", "Qty", "Avg Price", "LTP", "Value", "Unrealized P&L"}) {
                h.addHeaderCell(new Cell().add(new Paragraph(head).setBold().setFontSize(9)));
            }
            for (HoldingView v : s.holdings()) {
                h.addCell(cell(v.symbol()));
                h.addCell(cell(String.valueOf(v.quantity())));
                h.addCell(cell("Rs " + v.avgBuyPrice()));
                h.addCell(cell("Rs " + v.currentPrice()));
                h.addCell(cell("Rs " + v.currentValue()));
                h.addCell(cell("Rs " + v.unrealizedPnl() + " (" + v.unrealizedPnlPercent() + "%)"));
            }
            if (s.holdings().isEmpty()) {
                h.addCell(new Cell(1, 6).add(new Paragraph("No holdings.").setFontSize(9)));
            }
            doc.add(h);
        } catch (Exception e) {
            throw new ApiException(500, "Failed to generate PDF: " + e.getMessage());
        }
        return baos.toByteArray();
    }

    public byte[] tradesCsv(Long userId) {
        StringBuilder sb = new StringBuilder();
        sb.append("TradeId,Symbol,Direction,Quantity,Price,TotalValue,Paper,ExecutedAt\n");
        for (Trade t : tradeRepository.findByUserIdOrderByExecutedAtDesc(userId, PageRequest.of(0, 10000))) {
            sb.append(t.getId()).append(',')
                    .append(t.getStock().getSymbol()).append(',')
                    .append(t.getDirection()).append(',')
                    .append(t.getQuantity()).append(',')
                    .append(t.getPrice()).append(',')
                    .append(t.getTotalValue()).append(',')
                    .append(t.isPaper()).append(',')
                    .append(t.getExecutedAt()).append('\n');
        }
        return sb.toString().getBytes();
    }

    private Cell kv(String s) { return new Cell().add(new Paragraph(s).setBold().setFontSize(10)); }
    private Cell val(String s) { return new Cell().add(new Paragraph(s).setFontSize(10)).setTextAlignment(TextAlignment.RIGHT); }
    private Cell cell(String s) { return new Cell().add(new Paragraph(s).setFontSize(9)); }
}
