-- ============================================================
-- Bull Market seed data (idempotent inserts)
-- Runs after Hibernate creates the schema (defer-datasource-initialization=true)
-- Uses INSERT ... SELECT ... WHERE NOT EXISTS with aliased columns so re-runs
-- never duplicate rows and MySQL does not complain about derived column names.
-- ============================================================

-- 20 NSE stocks ---------------------------------------------------------------
INSERT INTO stocks (symbol, company_name, sector, current_price, previous_close, day_high, day_low, volume, market_cap, active, created_at, updated_at)
SELECT 'RELIANCE','Reliance Industries Ltd.','Energy',2847.50,2789.20,2855.00,2788.00,4200000,1925000000000.00,TRUE,NOW(),NOW()
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM stocks WHERE symbol='RELIANCE');

INSERT INTO stocks (symbol, company_name, sector, current_price, previous_close, day_high, day_low, volume, market_cap, active, created_at, updated_at)
SELECT 'TCS','Tata Consultancy Services','IT',3412.00,3426.30,3440.00,3405.00,1800000,1248000000000.00,TRUE,NOW(),NOW()
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM stocks WHERE symbol='TCS');

INSERT INTO stocks (symbol, company_name, sector, current_price, previous_close, day_high, day_low, volume, market_cap, active, created_at, updated_at)
SELECT 'INFY','Infosys Ltd.','IT',1589.00,1570.10,1595.00,1565.00,2900000,658000000000.00,TRUE,NOW(),NOW()
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM stocks WHERE symbol='INFY');

INSERT INTO stocks (symbol, company_name, sector, current_price, previous_close, day_high, day_low, volume, market_cap, active, created_at, updated_at)
SELECT 'HDFCBANK','HDFC Bank Ltd.','Banking',1720.00,1706.40,1728.00,1702.00,3500000,1305000000000.00,TRUE,NOW(),NOW()
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM stocks WHERE symbol='HDFCBANK');

INSERT INTO stocks (symbol, company_name, sector, current_price, previous_close, day_high, day_low, volume, market_cap, active, created_at, updated_at)
SELECT 'ICICIBANK','ICICI Bank Ltd.','Banking',1024.00,1018.70,1030.00,1015.00,4100000,718000000000.00,TRUE,NOW(),NOW()
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM stocks WHERE symbol='ICICIBANK');

INSERT INTO stocks (symbol, company_name, sector, current_price, previous_close, day_high, day_low, volume, market_cap, active, created_at, updated_at)
SELECT 'WIPRO','Wipro Ltd.','IT',452.00,466.50,468.00,450.00,2200000,236000000000.00,TRUE,NOW(),NOW()
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM stocks WHERE symbol='WIPRO');

INSERT INTO stocks (symbol, company_name, sector, current_price, previous_close, day_high, day_low, volume, market_cap, active, created_at, updated_at)
SELECT 'SBIN','State Bank of India','Banking',624.00,618.30,628.00,616.00,5600000,557000000000.00,TRUE,NOW(),NOW()
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM stocks WHERE symbol='SBIN');

INSERT INTO stocks (symbol, company_name, sector, current_price, previous_close, day_high, day_low, volume, market_cap, active, created_at, updated_at)
SELECT 'TATAMOTORS','Tata Motors Ltd.','Automobile',945.00,906.80,952.00,905.00,6700000,348000000000.00,TRUE,NOW(),NOW()
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM stocks WHERE symbol='TATAMOTORS');

INSERT INTO stocks (symbol, company_name, sector, current_price, previous_close, day_high, day_low, volume, market_cap, active, created_at, updated_at)
SELECT 'SUNPHARMA','Sun Pharmaceutical Industries','Pharma',1456.00,1416.20,1465.00,1414.00,1500000,349000000000.00,TRUE,NOW(),NOW()
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM stocks WHERE symbol='SUNPHARMA');

INSERT INTO stocks (symbol, company_name, sector, current_price, previous_close, day_high, day_low, volume, market_cap, active, created_at, updated_at)
SELECT 'BHARTIARTL','Bharti Airtel Ltd.','Telecom',1187.00,1175.40,1192.00,1170.00,2800000,665000000000.00,TRUE,NOW(),NOW()
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM stocks WHERE symbol='BHARTIARTL');

INSERT INTO stocks (symbol, company_name, sector, current_price, previous_close, day_high, day_low, volume, market_cap, active, created_at, updated_at)
SELECT 'ITC','ITC Ltd.','FMCG',462.00,458.90,465.00,457.00,3900000,577000000000.00,TRUE,NOW(),NOW()
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM stocks WHERE symbol='ITC');

INSERT INTO stocks (symbol, company_name, sector, current_price, previous_close, day_high, day_low, volume, market_cap, active, created_at, updated_at)
SELECT 'LT','Larsen & Toubro Ltd.','Infrastructure',3654.00,3598.10,3670.00,3590.00,1200000,502000000000.00,TRUE,NOW(),NOW()
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM stocks WHERE symbol='LT');

INSERT INTO stocks (symbol, company_name, sector, current_price, previous_close, day_high, day_low, volume, market_cap, active, created_at, updated_at)
SELECT 'AXISBANK','Axis Bank Ltd.','Banking',1098.00,1087.60,1105.00,1083.00,3100000,339000000000.00,TRUE,NOW(),NOW()
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM stocks WHERE symbol='AXISBANK');

INSERT INTO stocks (symbol, company_name, sector, current_price, previous_close, day_high, day_low, volume, market_cap, active, created_at, updated_at)
SELECT 'MARUTI','Maruti Suzuki India Ltd.','Automobile',12450.00,12280.50,12520.00,12250.00,420000,391000000000.00,TRUE,NOW(),NOW()
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM stocks WHERE symbol='MARUTI');

INSERT INTO stocks (symbol, company_name, sector, current_price, previous_close, day_high, day_low, volume, market_cap, active, created_at, updated_at)
SELECT 'ASIANPAINT','Asian Paints Ltd.','FMCG',2890.00,2912.70,2925.00,2880.00,890000,277000000000.00,TRUE,NOW(),NOW()
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM stocks WHERE symbol='ASIANPAINT');

INSERT INTO stocks (symbol, company_name, sector, current_price, previous_close, day_high, day_low, volume, market_cap, active, created_at, updated_at)
SELECT 'HCLTECH','HCL Technologies Ltd.','IT',1534.00,1512.30,1542.00,1508.00,1700000,416000000000.00,TRUE,NOW(),NOW()
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM stocks WHERE symbol='HCLTECH');

INSERT INTO stocks (symbol, company_name, sector, current_price, previous_close, day_high, day_low, volume, market_cap, active, created_at, updated_at)
SELECT 'BAJFINANCE','Bajaj Finance Ltd.','Finance',6789.00,6698.40,6820.00,6680.00,760000,420000000000.00,TRUE,NOW(),NOW()
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM stocks WHERE symbol='BAJFINANCE');

INSERT INTO stocks (symbol, company_name, sector, current_price, previous_close, day_high, day_low, volume, market_cap, active, created_at, updated_at)
SELECT 'KOTAKBANK','Kotak Mahindra Bank Ltd.','Banking',1745.00,1738.90,1755.00,1732.00,1900000,347000000000.00,TRUE,NOW(),NOW()
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM stocks WHERE symbol='KOTAKBANK');

INSERT INTO stocks (symbol, company_name, sector, current_price, previous_close, day_high, day_low, volume, market_cap, active, created_at, updated_at)
SELECT 'TITAN','Titan Company Ltd.','FMCG',3321.00,3287.60,3340.00,3280.00,980000,295000000000.00,TRUE,NOW(),NOW()
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM stocks WHERE symbol='TITAN');

INSERT INTO stocks (symbol, company_name, sector, current_price, previous_close, day_high, day_low, volume, market_cap, active, created_at, updated_at)
SELECT 'NTPC','NTPC Ltd.','Energy',362.00,357.80,365.00,356.00,4400000,351000000000.00,TRUE,NOW(),NOW()
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM stocks WHERE symbol='NTPC');

-- Backfill market metadata for the Indian stocks (columns added after initial seed) -----------
UPDATE stocks
SET market = 'IN', currency = 'INR', yahoo_symbol = CONCAT(symbol, '.NS')
WHERE (market IS NULL OR yahoo_symbol IS NULL)
  AND symbol IN ('RELIANCE','TCS','INFY','HDFCBANK','ICICIBANK','WIPRO','SBIN','TATAMOTORS',
                 'SUNPHARMA','BHARTIARTL','ITC','LT','AXISBANK','MARUTI','ASIANPAINT','HCLTECH',
                 'BAJFINANCE','KOTAKBANK','TITAN','NTPC');

-- US stocks (yahoo_symbol = ticker; prices are placeholders, overwritten by live fetch) --------
INSERT INTO stocks (symbol, company_name, sector, current_price, previous_close, day_high, day_low, volume, market_cap, active, market, currency, yahoo_symbol, created_at, updated_at)
SELECT 'AAPL','Apple Inc.','Technology',230.00,229.00,232.00,228.00,50000000,3500000000000.00,TRUE,'US','USD','AAPL',NOW(),NOW()
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM stocks WHERE symbol='AAPL');

INSERT INTO stocks (symbol, company_name, sector, current_price, previous_close, day_high, day_low, volume, market_cap, active, market, currency, yahoo_symbol, created_at, updated_at)
SELECT 'MSFT','Microsoft Corp.','Technology',430.00,428.00,433.00,426.00,22000000,3200000000000.00,TRUE,'US','USD','MSFT',NOW(),NOW()
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM stocks WHERE symbol='MSFT');

INSERT INTO stocks (symbol, company_name, sector, current_price, previous_close, day_high, day_low, volume, market_cap, active, market, currency, yahoo_symbol, created_at, updated_at)
SELECT 'GOOGL','Alphabet Inc.','Technology',175.00,173.50,176.50,172.00,25000000,2150000000000.00,TRUE,'US','USD','GOOGL',NOW(),NOW()
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM stocks WHERE symbol='GOOGL');

INSERT INTO stocks (symbol, company_name, sector, current_price, previous_close, day_high, day_low, volume, market_cap, active, market, currency, yahoo_symbol, created_at, updated_at)
SELECT 'AMZN','Amazon.com Inc.','Consumer',185.00,183.00,187.00,182.50,35000000,1950000000000.00,TRUE,'US','USD','AMZN',NOW(),NOW()
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM stocks WHERE symbol='AMZN');

INSERT INTO stocks (symbol, company_name, sector, current_price, previous_close, day_high, day_low, volume, market_cap, active, market, currency, yahoo_symbol, created_at, updated_at)
SELECT 'NVDA','NVIDIA Corp.','Technology',140.00,138.00,142.00,137.00,120000000,3450000000000.00,TRUE,'US','USD','NVDA',NOW(),NOW()
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM stocks WHERE symbol='NVDA');

INSERT INTO stocks (symbol, company_name, sector, current_price, previous_close, day_high, day_low, volume, market_cap, active, market, currency, yahoo_symbol, created_at, updated_at)
SELECT 'META','Meta Platforms Inc.','Technology',560.00,555.00,565.00,552.00,14000000,1420000000000.00,TRUE,'US','USD','META',NOW(),NOW()
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM stocks WHERE symbol='META');

INSERT INTO stocks (symbol, company_name, sector, current_price, previous_close, day_high, day_low, volume, market_cap, active, market, currency, yahoo_symbol, created_at, updated_at)
SELECT 'TSLA','Tesla Inc.','Automobile',250.00,245.00,255.00,244.00,90000000,800000000000.00,TRUE,'US','USD','TSLA',NOW(),NOW()
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM stocks WHERE symbol='TSLA');

INSERT INTO stocks (symbol, company_name, sector, current_price, previous_close, day_high, day_low, volume, market_cap, active, market, currency, yahoo_symbol, created_at, updated_at)
SELECT 'JPM','JPMorgan Chase & Co.','Banking',220.00,218.00,222.00,217.00,9000000,630000000000.00,TRUE,'US','USD','JPM',NOW(),NOW()
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM stocks WHERE symbol='JPM');

INSERT INTO stocks (symbol, company_name, sector, current_price, previous_close, day_high, day_low, volume, market_cap, active, market, currency, yahoo_symbol, created_at, updated_at)
SELECT 'V','Visa Inc.','Finance',290.00,288.00,292.00,287.00,6500000,580000000000.00,TRUE,'US','USD','V',NOW(),NOW()
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM stocks WHERE symbol='V');

INSERT INTO stocks (symbol, company_name, sector, current_price, previous_close, day_high, day_low, volume, market_cap, active, market, currency, yahoo_symbol, created_at, updated_at)
SELECT 'WMT','Walmart Inc.','Retail',85.00,84.00,86.00,83.50,15000000,680000000000.00,TRUE,'US','USD','WMT',NOW(),NOW()
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM stocks WHERE symbol='WMT');

INSERT INTO stocks (symbol, company_name, sector, current_price, previous_close, day_high, day_low, volume, market_cap, active, market, currency, yahoo_symbol, created_at, updated_at)
SELECT 'NFLX','Netflix Inc.','Media',700.00,690.00,710.00,688.00,4000000,300000000000.00,TRUE,'US','USD','NFLX',NOW(),NOW()
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM stocks WHERE symbol='NFLX');

INSERT INTO stocks (symbol, company_name, sector, current_price, previous_close, day_high, day_low, volume, market_cap, active, market, currency, yahoo_symbol, created_at, updated_at)
SELECT 'AMD','Advanced Micro Devices','Technology',165.00,162.00,167.00,161.00,45000000,265000000000.00,TRUE,'US','USD','AMD',NOW(),NOW()
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM stocks WHERE symbol='AMD');

INSERT INTO stocks (symbol, company_name, sector, current_price, previous_close, day_high, day_low, volume, market_cap, active, market, currency, yahoo_symbol, created_at, updated_at)
SELECT 'DIS','The Walt Disney Co.','Media',95.00,94.00,96.50,93.50,10000000,172000000000.00,TRUE,'US','USD','DIS',NOW(),NOW()
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM stocks WHERE symbol='DIS');

INSERT INTO stocks (symbol, company_name, sector, current_price, previous_close, day_high, day_low, volume, market_cap, active, market, currency, yahoo_symbol, created_at, updated_at)
SELECT 'KO','The Coca-Cola Co.','FMCG',62.00,61.50,62.80,61.20,13000000,267000000000.00,TRUE,'US','USD','KO',NOW(),NOW()
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM stocks WHERE symbol='KO');

-- Demo account ----------------------------------------------------------------
-- One pre-verified ADMIN account for demoing the admin panel (password: Password123).
-- Regular traders register live (new accounts verify by email via MailHog).
INSERT INTO users (full_name, email, password_hash, role, verified, suspended, totp_enabled, created_at, updated_at)
SELECT 'Platform Admin','admin@stocksim.local','$2a$12$8ShPoGMKydZthMJfLLPJ6OKJe2Y4BYx4P02mgbRmNs.JTiPwkLyUa','ADMIN',TRUE,FALSE,FALSE,NOW(),NOW()
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM users WHERE email='admin@stocksim.local');

-- Wallet for the admin account (dual-currency INR + USD). -----------------------
INSERT INTO wallets (user_id, balance_inr, balance_usd, created_at, updated_at)
SELECT u.id, 100000.00, 1000.00, NOW(), NOW() FROM users u
WHERE u.email='admin@stocksim.local'
  AND NOT EXISTS (SELECT 1 FROM wallets w WHERE w.user_id = u.id);

-- Backfill any pre-existing wallet rows created before the dual-currency columns existed.
UPDATE wallets SET balance_inr = 100000.00 WHERE balance_inr IS NULL;
UPDATE wallets SET balance_usd = 1000.00 WHERE balance_usd IS NULL;

-- News articles (seeded per stock, with sentiment) ----------------------------
INSERT INTO news_articles (stock_id, headline, body, sentiment, published_at)
SELECT s.id, 'Reliance Q3 net profit rises 12% on retail strength',
       'Reliance Industries reported a 12% YoY jump in quarterly profit driven by its retail and Jio segments.',
       'POSITIVE', NOW()
FROM stocks s WHERE s.symbol='RELIANCE'
  AND NOT EXISTS (SELECT 1 FROM news_articles n WHERE n.stock_id=s.id AND n.headline LIKE 'Reliance Q3%');

INSERT INTO news_articles (stock_id, headline, body, sentiment, published_at)
SELECT s.id, 'Jio announces nationwide 5G expansion',
       'Jio will extend 5G coverage to 500 more towns this quarter.',
       'POSITIVE', NOW()
FROM stocks s WHERE s.symbol='RELIANCE'
  AND NOT EXISTS (SELECT 1 FROM news_articles n WHERE n.stock_id=s.id AND n.headline LIKE 'Jio announces%');

INSERT INTO news_articles (stock_id, headline, body, sentiment, published_at)
SELECT s.id, 'TCS wins multi-year deal with European bank',
       'Tata Consultancy Services signed a large multi-year digital transformation contract.',
       'POSITIVE', NOW()
FROM stocks s WHERE s.symbol='TCS'
  AND NOT EXISTS (SELECT 1 FROM news_articles n WHERE n.stock_id=s.id AND n.headline LIKE 'TCS wins%');

INSERT INTO news_articles (stock_id, headline, body, sentiment, published_at)
SELECT s.id, 'IT sector faces margin pressure amid wage hikes',
       'Analysts flag near-term margin pressure across Indian IT majors.',
       'NEGATIVE', NOW()
FROM stocks s WHERE s.symbol='TCS'
  AND NOT EXISTS (SELECT 1 FROM news_articles n WHERE n.stock_id=s.id AND n.headline LIKE 'IT sector faces%');

INSERT INTO news_articles (stock_id, headline, body, sentiment, published_at)
SELECT s.id, 'Infosys revises FY guidance upward',
       'Infosys raised its revenue growth guidance citing a strong deal pipeline.',
       'POSITIVE', NOW()
FROM stocks s WHERE s.symbol='INFY'
  AND NOT EXISTS (SELECT 1 FROM news_articles n WHERE n.stock_id=s.id AND n.headline LIKE 'Infosys revises%');

INSERT INTO news_articles (stock_id, headline, body, sentiment, published_at)
SELECT s.id, 'Wipro reports flat sequential revenue',
       'Wipro quarterly revenue was broadly flat, below street expectations.',
       'NEGATIVE', NOW()
FROM stocks s WHERE s.symbol='WIPRO'
  AND NOT EXISTS (SELECT 1 FROM news_articles n WHERE n.stock_id=s.id AND n.headline LIKE 'Wipro reports%');

INSERT INTO news_articles (stock_id, headline, body, sentiment, published_at)
SELECT s.id, 'HDFC Bank maintains steady deposit growth',
       'HDFC Bank reported steady deposit growth and stable asset quality.',
       'NEUTRAL', NOW()
FROM stocks s WHERE s.symbol='HDFCBANK'
  AND NOT EXISTS (SELECT 1 FROM news_articles n WHERE n.stock_id=s.id AND n.headline LIKE 'HDFC Bank maintains%');

INSERT INTO news_articles (stock_id, headline, body, sentiment, published_at)
SELECT s.id, 'Tata Motors EV sales hit record high',
       'Tata Motors reported record electric vehicle sales for the quarter.',
       'POSITIVE', NOW()
FROM stocks s WHERE s.symbol='TATAMOTORS'
  AND NOT EXISTS (SELECT 1 FROM news_articles n WHERE n.stock_id=s.id AND n.headline LIKE 'Tata Motors EV%');
