package com.stocksim.sts.repository;

import com.stocksim.sts.entity.PaperWallet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PaperWalletRepository extends JpaRepository<PaperWallet, Long> {
    Optional<PaperWallet> findByUserId(Long userId);
}
