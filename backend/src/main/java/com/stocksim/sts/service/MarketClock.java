package com.stocksim.sts.service;

import com.stocksim.sts.entity.Stock;
import org.springframework.stereotype.Component;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;

/**
 * Determines whether a given market is currently open, purely from the wall clock
 * (exchange timezone + weekday + session window). Yahoo's chart endpoint does not
 * reliably return a market-state flag, so we compute it ourselves.
 *
 *   IN (NSE): Mon–Fri, 09:15–15:30 Asia/Kolkata
 *   US (NYSE/NASDAQ): Mon–Fri, 09:30–16:00 America/New_York (DST handled by ZoneId)
 */
@Component
public class MarketClock {

    private static final ZoneId IN_ZONE = ZoneId.of("Asia/Kolkata");
    private static final ZoneId US_ZONE = ZoneId.of("America/New_York");

    private static final LocalTime IN_OPEN = LocalTime.of(9, 15);
    private static final LocalTime IN_CLOSE = LocalTime.of(15, 30);
    private static final LocalTime US_OPEN = LocalTime.of(9, 30);
    private static final LocalTime US_CLOSE = LocalTime.of(16, 0);

    public boolean isOpen(Stock.Market market) {
        return switch (market) {
            case IN -> withinSession(IN_ZONE, IN_OPEN, IN_CLOSE);
            case US -> withinSession(US_ZONE, US_OPEN, US_CLOSE);
        };
    }

    private boolean withinSession(ZoneId zone, LocalTime open, LocalTime close) {
        ZonedDateTime now = ZonedDateTime.now(zone);
        DayOfWeek day = now.getDayOfWeek();
        if (day == DayOfWeek.SATURDAY || day == DayOfWeek.SUNDAY) return false;
        LocalTime t = now.toLocalTime();
        return !t.isBefore(open) && !t.isAfter(close);
    }
}
