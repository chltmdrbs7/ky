# KY 중소기업지원센터 홈페이지 프로젝트

## 브랜드 정보

### 기본 정보
- **브랜드명**: KY 중소기업지원센터
- **도메인**: kybiz.co.kr
- **사업자명**: 케이와이
- **사업자번호**: 837-05-02123
- **대표**: 최승균

### 연락처
- **대표번호**: 1555-0238
- **핸드폰**: 010-4141-2468
- **이메일**: jmfood12@naver.com

### 주소
전북특별자치도 익산시 평동로3길 32, 1층(인화동1가)

---

## 디자인 컨셉

### 컬러 시스템 (차분한 블루톤)
```css
/* Primary - 딥 네이비 */
--primary: #1E3A5F;
--primary-light: #2D5A87;
--primary-dark: #0F1D2F;
--primary-pale: #E8F0F8;

/* Accent - 스카이 블루 */
--accent: #3B82F6;
--accent-light: #60A5FA;
--accent-dark: #2563EB;
--accent-pale: #EFF6FF;

/* Gradients */
--gradient-hero: linear-gradient(135deg, #0F1D2F 0%, #1E3A5F 100%);
--gradient-accent: linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%);
```

### 컬러 가이드 파일
`color-guide.html` 참고

---

## 페이지 구조 (6개)

| # | 파일명 | 페이지 | 상태 |
|---|--------|--------|------|
| 1 | index.html | 메인 | 대기 |
| 2 | company.html | 회사소개 | 대기 |
| 3 | process.html | 진행절차 | 대기 |
| 4 | fund.html | 정책자금 | 대기 |
| 5 | pro.html | 전문분야 | 대기 |
| 6 | mkt.html | 마케팅 | 대기 |

---

## 원본 파일 위치

```
origin/
├── 1.main/      ← 메인 페이지 (6개 섹션)
├── 2.company/   ← 회사소개 (4개 섹션)
├── 3.process/   ← 진행절차 (4개 섹션)
├── 4.fund/      ← 정책자금 (3개 섹션)
├── 5.pro/       ← 전문분야 (3개 섹션)
└── 6.mkt/       ← 마케팅 (3개 섹션)
```

### 원본 참고 방법
- 디자인/레이아웃: 원본 그대로 유지
- 브랜드 정보: KY 중소기업지원센터로 변경
- 컬러: 블루톤으로 변경

---

## 개발 환경

### GitHub
- **계정**: chltmdrbs7
- **저장소**: ky-homepage
- **SSH**: git@github.com:chltmdrbs7/ky-homepage.git

### Vercel
- **계정**: ky
- **토큰**: 2FhxlunFaNo5WHHe357mxSdD

### Cloudflare
- **계정**: ky
- **API 토큰**: h4oGDHVKmUw0f_tNzv4hwFibfiNcsKD9cereudSD

---

## SEO 정보

### 메타 태그
```html
<title>KY 중소기업지원센터 | 중소기업 정책자금 전문 컨설팅</title>
<meta name="description" content="정책자금, 기업인증, 경영컨설팅 전문. 중소기업 성장을 위한 맞춤형 지원 서비스를 제공합니다.">
<meta name="keywords" content="중소기업지원, 정책자금, 기업인증, 경영컨설팅, 익산, 전북">
```

---

## 작업 규칙

1. **HTML 로컬 개발** → 프로덕션 배포
2. **디자인/레이아웃**: origin 파일 참고 (구조 유지)
3. **브랜드 정보**: KY 중소기업지원센터로 변경
4. **컬러**: 차분한 블루톤 적용
5. **SEO**: AI 친화적 구조화

---

## 리라이팅 규칙 (페이지 변환 시 필수 적용)

### 1. 필수 유지 사항
- **레이아웃**: 원본의 섹션 구조, 그리드 배치 유지
- **형식**: HTML 태그 구조 유지
- **반응형**: 데스크톱/태블릿/모바일 미디어쿼리 유지
- **글자수**: 원본 텍스트 글자수 ±10% 이내
- **맥락/의도**: 원본 메시지 의도 동일하게 유지

### 2. 필수 변경 사항

| 항목 | 원본 (자금치유연구소) | 변경 (KY) |
|------|----------------------|-----------|
| 브랜드명 | 자금치유연구소 | KY 중소기업지원센터 |
| 전화번호 | 1533-9510 | 1555-0238 |
| 대표색 | #d4af37 (골드) | #3B82F6 (블루) |
| 섹션ID | 랜덤해시 | ky 접두사 (예: kyProcessHero) |

### 3. 컬러 변환 가이드

```css
/* 원본 → KY 변환 */
#d4af37 → #3B82F6  /* 액센트 색상 */
#8b6f3f → #1E3A5F  /* 다크 액센트 */
#e8d4a8 → #93C5FD  /* 라이트 액센트 */
#faf8f3 → #FFFFFF  /* 텍스트 */
#0f172e → #0F172A  /* 배경 (유사하게 유지) */

/* 그라데이션 변환 */
linear-gradient(135deg, #8b6f3f, #d4af37)
→ linear-gradient(135deg, #1E3A5F, #3B82F6)

/* 글로우 효과 변환 */
box-shadow: 0 0 20px rgba(212, 175, 55, 0.6)
→ box-shadow: 0 0 20px rgba(59, 130, 246, 0.6)
```

### 4. SEO 키워드 삽입
- "정책자금", "중소기업", "컨설팅", "승인율 96%"
- 자연스러운 문맥 내 배치

### 5. 모바일 줄바꿈
```html
<br class="mobile-br">
```
- 767px 이하에서만 표시
- CSS: `.mobile-br { display: none; } @media (max-width: 767px) { .mobile-br { display: inline; } }`

### 6. 공통 면책 문구 (모든 페이지 포함)
```
※ KY 중소기업지원센터는 정책자금 서류작성을 대행하지 않습니다.
※ 기업평가를 하지 않습니다.
```

### 7. 작업 체크리스트

#### 페이지 생성 시
- [ ] 원본 txt 파일 읽기 (origin/ 폴더)
- [ ] 섹션 ID 변경 (ky 접두사)
- [ ] 컬러 팔레트 변환
- [ ] 브랜드명 변경
- [ ] 전화번호 변경
- [ ] 면책 문구 확인
- [ ] 모바일 줄바꿈 적용
- [ ] SEO 키워드 자연스럽게 삽입

#### 검증 시
- [ ] 브라우저에서 렌더링 확인
- [ ] 모바일 반응형 확인
- [ ] 링크/버튼 동작 확인
- [ ] 한글 깨짐 없음 확인
- [ ] 원본 대비 글자수 검증

---

## 공통 컴포넌트 규칙

### 동일하게 적용 (모든 페이지)
| 컴포넌트 | 기준 파일 | 비고 |
|----------|-----------|------|
| 헤더 CSS | about.html | 스타일 동일 |
| 푸터 | about.html | 내용/스타일 동일 |
| 입력폼 (#contact) | index.html | 스타일 동일 |

### 페이지별 변경 사항
| 항목 | 변경 내용 |
|------|-----------|
| 헤더 active | 현재 페이지 메뉴에 `.active` 클래스 |
| 상담신청 이동 | 해당 페이지에 `#contact` 있으면 `#contact`, 없으면 `index.html#contact` |
| 모바일 메뉴 active | 현재 페이지 메뉴에 `.active` 클래스 |

### 적용 예시
```html
<!-- index.html -->
<li><a href="index.html" class="ky-nav-link active">홈</a></li>
<a href="#contact" class="ky-nav-cta">상담신청</a>

<!-- about.html -->
<li><a href="about.html" class="ky-nav-link active">회사소개</a></li>
<a href="#contact" class="ky-nav-cta">상담신청</a>

<!-- process.html (#contact 없음) -->
<li><a href="process.html" class="ky-nav-link active">진행과정</a></li>
<a href="index.html#contact" class="ky-nav-cta">상담신청</a>
```

---

## 프로젝트 경로

```
F:\pola_homepage\3.20tb_choiseungkyun_ky\
```
