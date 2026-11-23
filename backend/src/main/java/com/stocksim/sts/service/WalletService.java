package com.stocksim.sts.service;

import com.stocksim.sts.entity.Wallet;
import com.stocksim.sts.entity.WalletTransaction;
import com.stocksim.sts.exception.ApiException;
import com.stocksim.sts.repository.WalletRepository;
import com.stocksim.sts.repository.WalletTransactionRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class WalletService {

    private final WalletRepository walletRepository;
    private final WalletTransactionRepository txRepository;

    public WalletService(WalletRepository walletRepository, WalletTransactionRepository txRepository) {
        this.walletRepository = walletRepository;
        this.txRepository = txRepository;
    }

    public Wallet getByUser(Long userId) {
        return walletRepository.findByUserId(userId)
                .orElseThrow(() -> ApiException.notFound("Wallet not found"));
    }

    public boolean hasBalance(Long userId, BigDecimal amount, String currency) {
        return balanceOf(getByUser(userId), currency).compareTo(amount) >= 0;
    }

    @Transactional
    public void debit(Long userId, BigDecimal amount, String currency,
                      WalletTransaction.Type type, Long refId, String note) {
        Wallet wallet = getByUser(userId);
        BigDecimal current = balanceOf(wallet, currency);
        if (current.compareTo(amount) < 0) {
            throw ApiException.badRequest("Insufficient " + normalize(currency) + " balance");
        }
        BigDecimal updated = current.subtract(amount);
        setBalance(wallet, currency, updated);
        walletRepository.save(wallet);
        recordTx(wallet.getId(), type, amount, updated, normalize(currency), refId, note);
    }

    @Transactional
    public void credit(Long userId, BigDecimal amount, String currency,
                       WalletTransaction.Type type, Long refId, String note) {
        Wallet wallet = getByUser(userId);
        BigDecimal updated = balanceOf(wallet, currency).add(amount);
        setBalance(wallet, currency, updated);
        walletRepository.save(wallet);
        recordTx(wallet.getId(), type, amount, updated, normalize(currency), refId, note);
    }

    @Transactional
    public Wallet deposit(Long userId, BigDecimal amount, String currency) {
        if (amount == null || amount.signum() <= 0) throw ApiException.badRequest("Amount must be positive");
        credit(userId, amount, currency, WalletTransaction.Type.DEPOSIT, null, "Manual deposit");
        return getByUser(userId);
    }

    @Transactional
    public Wallet withdraw(Long userId, BigDecimal amount, String currency) {
        if (amount == null || amount.signum() <= 0) throw ApiException.badRequest("Amount must be positive");
        debit(userId, amount, currency, WalletTransaction.Type.WITHDRAWAL, null, "Manual withdrawal");
        return getByUser(userId);
    }

    public Page<WalletTransaction> transactions(Long userId, Pageable pageable) {
        Wallet wallet = getByUser(userId);
        return txRepository.findByWalletIdOrderByCreatedAtDesc(wallet.getId(), pageable);
    }

    // --- currency helpers ---

    private String normalize(String currency) {
        if (currency == null) return "INR";
        String c = currency.trim().toUpperCase();
        if (!c.equals("INR") && !c.equals("USD")) {
            throw ApiException.badRequest("Unsupported currency: " + currency);
        }
        return c;
    }

    private BigDecimal balanceOf(Wallet wallet, String currency) {
        return normalize(currency).equals("USD") ? wallet.getBalanceUsd() : wallet.getBalanceInr();
    }

    private void setBalance(Wallet wallet, String currency, BigDecimal value) {
        if (normalize(currency).equals("USD")) wallet.setBalanceUsd(value);
        else wallet.setBalanceInr(value);
    }

    private void recordTx(Long walletId, WalletTransaction.Type type, BigDecimal amount,
                          BigDecimal balanceAfter, String currency, Long refId, String note) {
        txRepository.save(WalletTransaction.builder()
                .walletId(walletId)
                .type(type)
                .amount(amount)
                .balanceAfter(balanceAfter)
                .currency(currency)
                .referenceId(refId)
                .note(note)
                .build());
    }
}
