# OKX Futures Dashboard

> 선물(FUTURES) 매매내역 기반 성과 분석 데스크탑 앱  
> Tauri + Rust + React + TypeScript + SQLite

---

## 빠른 시작 (로컬 개발)

### 사전 조건
```bash
# 1. Rust 설치
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# 2. Node.js 18+ 설치 (https://nodejs.org)

# 3. Tauri CLI 의존성
# macOS:
xcode-select --install
# Ubuntu:
sudo apt install libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf
```

### 실행
```bash
cd okx-dashboard
npm install
npm run tauri:dev   # 개발 모드 (핫리로드)
```

### 빌드/패키징
```bash
npm run tauri:build   # 릴리즈 빌드 → src-tauri/target/release/bundle/
```

---

## 폴더 구조

```
okx-dashboard/
├── src/                        # React 프론트엔드 (TS)
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── Dashboard.tsx   # 메인 대시보드 페이지
│   │   │   ├── KpiCards.tsx    # KPI 5개 카드
│   │   │   ├── EquityCurve.tsx # Equity Curve 차트 (Recharts)
│   │   │   └── TradeTable.tsx  # 매매내역 테이블 + 복사 버튼
│   │   ├── settings/
│   │   │   └── Settings.tsx    # API 키 설정 + 동기화
│   │   └── common/
│   │       └── Sidebar.tsx     # 네비게이션 사이드바
│   ├── store/index.ts          # Zustand 글로벌 상태
│   ├── types/index.ts          # TypeScript 타입 정의
│   ├── utils/
│   │   ├── tauri.ts            # Tauri invoke 래퍼 (type-safe)
│   │   └── format.ts           # 포맷팅 유틸 (KST 변환 포함)
│   └── index.css               # 다크 트레이딩 터미널 테마
│
├── src-tauri/                  # Rust 백엔드
│   ├── src/
│   │   ├── main.rs             # 엔트리포인트
│   │   ├── lib.rs              # Tauri 앱 설정
│   │   ├── commands.rs         # Tauri IPC 커맨드 (모든 OKX 호출)
│   │   ├── okx.rs              # OKX API 클라이언트 (서명 ← Rust only)
│   │   ├── db.rs               # SQLite 스키마 + CRUD
│   │   ├── security.rs         # OS Keychain 저장/로드
│   │   ├── trade_builder.rs    # 트레이드 재구성 엔진 + KPI
│   │   └── error.rs            # 통합 에러 타입 (민감정보 마스킹)
│   ├── Cargo.toml
│   ├── build.rs
│   └── tauri.conf.json
│
├── package.json
├── vite.config.ts
└── index.html
```

---

## 보안 아키텍처

```
┌─────────────────────────────────────────────┐
│              React (WebView / JS)            │
│                                              │
│  ✗ API Key 없음    ✗ Secret 없음             │
│  ✗ Signature 없음  ✗ 인증 헤더 없음          │
│                                              │
│  invoke("sync_data") ──────────────────────► │
└─────────────────────────────────────────────┘
                         │ Tauri IPC (커맨드 이름만)
                         ▼
┌─────────────────────────────────────────────┐
│              Rust Backend                    │
│                                             │
│  1. OS Keychain에서 크리덴셜 로드            │
│  2. HMAC-SHA256 서명 생성 (메모리 내)        │
│  3. OKX REST 호출 (헤더에 서명 삽입)         │
│  4. 응답에서 마켓 데이터만 추출              │
│  5. SQLite에 저장 (인증 정보 제외)           │
│  6. 결과 데이터만 JS로 반환                  │
└─────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────┐
│           OS Keychain                        │
│  API Key / Secret / Passphrase              │
│  (암호화 저장, 앱 종료 후에도 유지)           │
└─────────────────────────────────────────────┘
```

---

## 트레이드 재구성 알고리즘

### 핵심 정의
- **1 Trade** = 포지션 수량이 `0`이 되는 순간까지의 모든 fills 묶음
- **Leg** = 한 trade 내의 개별 fill (부분청산, 추가진입 등)

### 처리 흐름

```
fills (시계열 정렬, inst_id별)
        │
        ▼
 각 fill 처리:
 ┌─ 신규 오픈 (qty == 0 → fill.side가 현재 pos_side와 같음)
 │   → 포지션 열기, avg_entry 계산 시작
 │
 ├─ 추가진입 (qty > 0 + 같은 방향)
 │   → VWAP 평균가 업데이트 (cost_basis 누적)
 │
 ├─ 부분청산 (qty > 0 + 반대 방향, fill.sz < 현재 qty)
 │   → qty 감소, 손익 누적, leg 기록
 │
 ├─ 완전청산 (fill.sz == 현재 qty)
 │   → trade 종료, DB에 저장
 │
 └─ 역전 (fill.sz > 현재 qty) ← 주의 케이스
     → 현재 qty 분으로 trade 종료
     → 나머지(fill.sz - qty)로 반대 방향 신규 trade 시작
```

### PnL 계산
```
gross_pnl = Σ fill.realized_pnl  (OKX가 계산한 값)
fee       = Σ fill.fee           (음수 = 비용)
funding   = bills에서 매칭한 펀딩비
net_pnl   = gross_pnl + fee + funding
```

### 평균 보유시간
```
hold_time_sec = (close_ts - open_ts) / 1000  (per trade)
avg_hold_time = Σ hold_time_sec / N
```

### 헤지모드 처리
- OKX 헤지모드: `posSide = "long"` 또는 `"short"` 명시
- 네트모드: `posSide = "net"`, side(buy/sell)로 방향 추론
- 헤지모드에서는 long 포지션과 short 포지션이 독립적으로 관리됨

---

## DB 스키마

```sql
-- 원본 fills (마켓 데이터만, 인증정보 제외)
okx_fills_raw: fill_id, trade_id, inst_id, ts_ms, raw_json

-- 원본 bills (수수료/펀딩 소스)
okx_bills_raw: bill_id, type_code, inst_id, ts_ms, raw_json

-- 재구성된 트레이드
trades: trade_id, inst_id, side, open_ts_ms, close_ts_ms,
        avg_entry, avg_exit, qty, gross_pnl, fee, funding, net_pnl,
        hold_time_sec, status

-- 트레이드 내 개별 체결
trade_legs: leg_id, trade_id, ts_ms, price, qty, action, fee, fill_id

-- 자산 곡선
equity_points: ts_ms, equity_usdt, pnl_cum_usdt

-- 동기화 커서
sync_state: key, value, updated_ms
```

---

## 복사 출력 포맷 (ChatGPT 상담용)

```
OKX Futures Performance Summary (USDT)
Period (KST): 2026-02-01 ~ 2026-02-23
Total Trades: 12
Win Rate: 58.3% (7W / 5L)
Total PnL (Net): +237.70 USDT
Avg Win / Avg Loss: +71.25 / -47.30 (R = 1.51)
Avg Hold Time: 17h 00m
Return (%): +4.75% (Denominator = Period Start Equity: 5,000.00 USDT)

| # | Symbol | Side | Open (KST) | Close (KST) | Entry | Exit | Qty | Gross PnL | Fee | Funding | Net PnL | Hold |
|---|--------|------|------------|-------------|-------|------|-----|-----------|-----|---------|---------|------|
| 1 | BTC-USDT-FUTURES | Long | 2026-02-03 09:15 | 2026-02-03 21:40 | 42100.00 | 42650.00 | 0.0200 | +11.0 | -1.1 | +0.0 | +9.9 | 12h25m |
```

**보안**: 화이트리스트 필드만 포함 (API 키/시크릿/서명 절대 미포함)

---

## 단위 테스트

```bash
cd src-tauri
cargo test
```

포함된 테스트:
- `test_sign_deterministic` — 서명 결정론적 검증
- `test_sign_different_secrets_differ` — 서명 보안성 검증
- `test_simple_long_trade` — 기본 롱 트레이드
- `test_simple_short_trade` — 기본 숏 트레이드
- `test_partial_close_multiple_times` — 분할 청산
- `test_pyramiding_add_to_position` — 피라미딩 (추가진입)
- `test_direction_reversal` — 방향 역전
- `test_multiple_instruments_isolated` — 종목 분리
- `test_split_fills_same_trade` — 분할 체결
- `test_net_pnl_includes_fee` — PnL + 수수료
- `test_kpi_basic` — KPI 계산
- `test_kpi_zero_equity_guard` — 0 분모 방어

---

## 시간대 정책

| 레이어 | 시간대 |
|--------|--------|
| DB 저장 | UTC (Unix ms) |
| Rust 내부 계산 | UTC |
| API 호출/서명 | UTC (OKX 요구사항) |
| UI 표시 | Asia/Seoul (KST, UTC+9) |
| 복사 출력 | Asia/Seoul (KST 명시) |
