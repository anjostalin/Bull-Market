package com.stocksim.sts;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class StsApplication {
    public static void main(String[] args) {
        SpringApplication.run(StsApplication.class, args);
    }
}
