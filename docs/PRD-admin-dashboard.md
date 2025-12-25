# PRD: KY 중소기업지원센터 관리자 대시보드

## 1. 개요

### 1.1 프로젝트 목적
KY 중소기업지원센터 웹사이트의 관리자 대시보드를 구축하여, 상담 접수 현황 관리, 게시판 CRUD, 방문 통계 확인 등의 관리 기능을 제공한다.

### 1.2 참고 프로젝트
- **소스**: `F:\pola_homepage\2.16th_joeunye_eunin` (은인자금파트너스)
- **Worker URL**: `https://euninbiz.swdoor15.workers.dev`

### 1.3 대상 프로젝트
- **경로**: `F:\pola_homepage\3.20tb_choiseungkyun_ky`
- **브랜드명**: KY 중소기업지원센터
- **Worker URL**: `https://ky-form.chltmdrbs7.workers.dev/`
- **Primary Color**: #1E3A5F
- **Accent Color**: #3B82F6

---

## 2. 기능 요구사항

### 2.1 Worker API 확장

| 엔드포인트 | 메서드 | 설명 |
|-----------|--------|------|
| `/auth` | POST | 관리자 로그인 (비밀번호 검증) |
| `/leads` | GET | 접수 내역 전체 조회 |
| `/leads/:id` | PATCH | 접수 상태/메모 수정 |
| `/board/all` | GET | 게시글 전체 조회 (비공개 포함) |
| `/board` | POST | 게시글 생성 |
| `/board/:id` | PATCH | 게시글 수정 |
| `/board` | DELETE | 게시글 삭제 (id 쿼리) |
| `/upload` | POST | 이미지 업로드 (R2) |
| `/delete` | POST | 이미지 삭제 (R2) |

### 2.2 관리자 페이지 구성

#### 2.2.1 대시보드 (admin/index.html)
- 통계 카드 4개: 전체접수, 대기중, 완료, 게시글수
- 최근 접수 내역 테이블 (5건)
- 최근 게시글 테이블 (5건)

#### 2.2.2 접수내역 (admin/leads.html)
- 필터: 상태별, 기간별
- 검색: 이름, 연락처, 회사명
- 테이블: 접수일, 이름, 연락처, 회사명, 업종, 지역, 통화가능, 직전매출, 희망금액, 상태, 메모, 관리
- 엑셀 다운로드 기능
- 상세보기 모달
- 상태 변경 (대기→상담중→완료→취소)

#### 2.2.3 게시판관리 (admin/board.html)
- 카테고리 탭: 전체, 공지, 뉴스, 정보, 성공사례
- 게시글 목록 테이블
- 새 글 작성 버튼 → post-edit.html로 이동
- 수정/삭제 기능

#### 2.2.4 게시글편집 (admin/post-edit.html)
- 제목, 요약, 내용(HTML 지원)
- 썸네일 업로드 (webp 변환)
- 태그 선택 (최대 5개)
- 카테고리, 작성일, 공개상태
- 저장/취소 버튼

#### 2.2.5 방문통계 (admin/analytics.html)
- 기간 선택: 7일, 30일, 90일
- 차트: 일별 방문자 추이
- 인사이트 카드
- 전환율 표시

#### 2.2.6 설정 (admin/settings.html)
- 서비스 스택 정보
- 요금 안내 (무료 티어 vs 유료)
- 트래픽 시뮬레이션

---

## 3. 파일 구조

```
3.20tb_choiseungkyun_ky/
├── admin/
│   ├── index.html        # 대시보드
│   ├── leads.html        # 접수내역
│   ├── board.html        # 게시판관리
│   ├── post-edit.html    # 게시글편집
│   ├── analytics.html    # 방문통계
│   └── settings.html     # 설정
├── styles/
│   └── dashboard.css     # 관리자 대시보드 CSS
├── scripts/
│   ├── admin-auth.js     # 인증 모듈
│   ├── components.js     # 공통 컴포넌트 (사이드바, 헤더)
│   └── leads.js          # 접수내역 로직
└── worker/
    └── src/
        └── index.js      # API 확장
```

---

## 4. 브랜드 커스터마이징

### 4.1 색상 변경 (CSS Variables)
```css
:root {
  --primary: #1E3A5F;       /* 은인: #0066CC */
  --primary-dark: #0F1F33;  /* 은인: #003D7A */
  --primary-light: #E8EEF4; /* 은인: #E6F2FF */
  --accent: #3B82F6;        /* 동일 */
}
```

### 4.2 브랜드명 변경
- 로고: "KY 중소기업지원센터"
- 로그인 모달 제목: "KY 중소기업지원센터 관리자"

### 4.3 Worker URL 변경
```javascript
const WORKER_URL = 'https://ky-form.chltmdrbs7.workers.dev';
```

---

## 5. Airtable 테이블 구조

### 5.1 consulting (접수 테이블)
| 필드명 | 타입 | 설명 |
|--------|------|------|
| company | Text | 기업명 |
| bizno | Text | 사업자번호 |
| name | Text | 대표자명 |
| phone | Text | 연락처 |
| email | Email | 이메일 |
| industry | Text | 업종 |
| founded | Text | 설립연도 |
| consultTime | Text | 통화가능시간 |
| amount | Text | 필요자금규모 |
| fundType | Text | 자금종류 |
| message | Long Text | 문의사항 |
| submitDate | Date | 접수일 |
| submitTime | Text | 접수시간 |
| status | Single Select | 상태 (신규/상담중/완료/취소) |
| memo | Long Text | 관리자 메모 |

### 5.2 board (게시판 테이블)
| 필드명 | 타입 | 설명 |
|--------|------|------|
| 제목 | Text | 게시글 제목 |
| 내용 | Long Text | HTML 내용 |
| 요약 | Text | 카드 표시용 요약 |
| 썸네일 | URL | 썸네일 이미지 URL |
| 태그 | Text | 쉼표 구분 태그 |
| 카테고리 | Single Select | 공지/뉴스/정보/성공사례 |
| 작성일 | Date | 게시일 |
| 조회수 | Number | 조회수 |
| 게시여부 | Checkbox | 공개/비공개 |

---

## 6. 구현 순서

### Phase 1: Worker API 확장
1. `/auth` 인증 엔드포인트 추가
2. `/leads` CRUD 엔드포인트 추가
3. `/board/all`, `/board` CRUD 엔드포인트 추가
4. Cloudflare에 ADMIN_PASSWORD secret 설정

### Phase 2: CSS 및 공통 모듈
1. `styles/dashboard.css` 생성 (KY 색상 적용)
2. `scripts/admin-auth.js` 생성
3. `scripts/components.js` 생성

### Phase 3: 관리자 페이지
1. `admin/index.html` - 대시보드
2. `admin/leads.html` - 접수내역
3. `admin/board.html` - 게시판관리
4. `admin/post-edit.html` - 게시글편집
5. `admin/analytics.html` - 방문통계
6. `admin/settings.html` - 설정

### Phase 4: 테스트 및 배포
1. 로컬 테스트
2. Worker 배포 (`wrangler deploy`)
3. Vercel 배포

---

## 7. 환경변수 (Cloudflare Secrets)

```bash
# 기존
wrangler secret put AIRTABLE_TOKEN
wrangler secret put RESEND_API_KEY
wrangler secret put TELEGRAM_BOT_TOKEN
wrangler secret put TELEGRAM_CHAT_ID

# 신규 추가
wrangler secret put ADMIN_PASSWORD
```

---

## 8. 보안 고려사항

1. **인증**: 비밀번호 기반 로그인, localStorage 토큰 저장
2. **토큰 만료**: 24시간 후 자동 만료
3. **CORS**: Worker에서 허용 도메인 설정 가능
4. **Rate Limiting**: Cloudflare 기본 보호 적용

---

## 9. 예상 작업 시간

| 단계 | 예상 시간 |
|------|----------|
| Worker API 확장 | - |
| CSS/JS 모듈 | - |
| 관리자 페이지 6개 | - |
| 테스트 및 수정 | - |
| **총계** | - |

---

## 10. 참고 사항

- 참고 프로젝트의 코드를 기반으로 브랜드 커스터마이징
- 모바일 반응형 지원 (768px 이하)
- Airtable 필드명은 현재 KY 프로젝트 기준으로 조정 필요
