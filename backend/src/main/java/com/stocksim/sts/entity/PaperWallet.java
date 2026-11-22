package com.stocksim.sts.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "paper_wallets")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PaperWallet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long userId;

    @Column(nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal balance = new BigDecimal("1000000.00");
}
