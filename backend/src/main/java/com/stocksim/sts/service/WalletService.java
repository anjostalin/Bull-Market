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

    public boolean hasBalance(Long userId, BigDecimal amount) {
        return getByUser(userId).getBalance().compareTo(amount) >= 0;
    }

    @Transactional
    public void debit(Long userId, BigDecimal amount, WalletTransaction.Type type, Long refId, String note) {
        Wallet wallet = getByUser(userId);
        if (wallet.getBalance().compareTo(amount) < 0) {
            throw ApiException.badRequest("Insufficient balance");
        }
        wallet.setBalance(wallet.getBalance().subtract(amount));
        wallet.setBuyingPower(wallet.getBalance());
        walletRepository.save(wallet);
        recordTx(wallet.getId(), type, amount, wallet.getBalance(), refId, note);
    }

    @Transactional
    public void credit(Long userId, BigDecimal amount, WalletTransaction.Type type, Long refId, String note) {
        Wallet wallet = getByUser(userId);
        wallet.setBalance(wallet.getBalance().add(amount));
        wallet.setBuyingPower(wallet.getBalance());
        walletRepository.save(wallet);
        recordTx(wallet.getId(), type, amount, wallet.getBalance(), refId, note);
    }

    @Transactional
    public Wallet deposit(Long userId, BigDecimal amount) {
        if (amount.signum() <= 0) throw ApiException.badRequest("Amount must be positive");
        credit(userId, amount, WalletTransaction.Type.DEPOSIT, null, "Manual deposit");
        return getByUser(userId);
    }

    @Transactional
    public Wallet withdraw(Long userId, BigDecimal amount) {
        if (amount.signum() <= 0) throw ApiException.badRequest("Amount must be positive");
        debit(userId, amount, WalletTransaction.Type.WITHDRAWAL, null, "Manual withdrawal");
        return getByUser(userId);
    }

    public Page<WalletTransaction> transactions(Long userId, Pageable pageable) {
        Wallet wallet = getByUser(userId);
        return txRepository.findByWalletIdOrderByCreatedAtDesc(wallet.getId(), pageable);
    }

    private void recordTx(Long walletId, WalletTransaction.Type type, BigDecimal amount,
                          BigDecimal balanceAfter, Long refId, String note) {
        txRepository.save(WalletTransaction.builder()
                .walletId(walletId)
                .type(type)
                .amount(amount)
                .balanceAfter(balanceAfter)
                .referenceId(refId)
                .note(note)
                .build());
    }
}
