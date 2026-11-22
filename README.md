# StockSim Pro — Stock Trading System

A full-stack simulated equity trading platform built for the FSAD (Full Stack Application Development) project.

- **Backend:** Java 17, Spring Boot 3, Spring Security (JWT), Spring Data JPA, WebSocket (STOMP)
- **Frontend:** React 18, TypeScript, Vite, Recharts, TradingView Lightweight Charts
- **Database:** MySQL 8
- **Email (dev):** MailHog
- **Docs:** OpenAPI 3 (Swagger UI)

All trading is simulated with virtual money. No real brokerage or market data is involved.

## Features

- JWT auth with email verification, password reset (OTP), and optional TOTP 2FA
- 20 seeded NSE stocks with a simulated price engine (±0.5–2% every 5s) broadcast over WebSocket
- Market / Limit / Stop-Loss orders with an automated matching engine
- Portfolio with holdings, realized/unrealized P&L, allocation pie, value-over-time chart
- Virtual wallet (₹1,00,000) with transaction ledger and deposit/withdrawal simulation
- Watchlists and price alerts (in-app + email notifications)
- AI signals: SMA-7/14, RSI-14, STRONG BUY → STRONG SELL, volatility risk score
- Paper trading sandbox (₹10,00,000) with a public leaderboard
- Admin panel: user management, suspend, price override, platform metrics
- PDF portfolio statement (iText) and CSV trade-history export
- Per-stock news feed with sentiment tags

## Run with Docker Compose (recommended)

```bash
docker compose up --build
```

- Frontend: http://localhost (Nginx)
- Backend API: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui.html
- MailHog (captured emails): http://localhost:8025

## Run locally (dev)

Start MySQL + MailHog only:

```bash
docker compose -f docker-compose.infra.yml up -d
```

Backend:

```bash
cd backend
JAVA_HOME=<jdk17+> mvn spring-boot:run
```

Frontend:

```bash
cd frontend
npm install
npm run dev     # http://localhost:5173 (proxies /api and /ws to :8080)
```

## Demo accounts

| Role   | Email                   | Password    |
|--------|-------------------------|-------------|
| Trader | trader@stocksim.local   | Password123 |
| Admin  | admin@stocksim.local    | Password123 |

## Project structure

```
backend/   Spring Boot app (controllers, services, repositories, entities)
frontend/  React + Vite SPA
docker-compose.yml         Full stack (mysql + backend + frontend + mailhog)
docker-compose.infra.yml   Infra only (mysql + mailhog) for local dev
```
