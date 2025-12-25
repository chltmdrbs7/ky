# BAS 홈페이지 입력폼 알림 시스템 (확정)

## 개요
KY 중소기업지원센터 BAS 홈페이지 상담 신청 폼 알림 시스템
- **Worker URL**: https://ky-form.chltmdrbs7.workers.dev
- **코드 위치**: `worker/src/index.js`

---

## 입력 폼 필드

| 필드명 | 변수명 | 필수 |
|--------|--------|------|
| 기업명 | company | O |
| 사업자번호 | bizno | O |
| 대표자명 | name | O |
| 연락처 | phone | O |
| 이메일 | email | - |
| 업종 | industry | - |
| 설립연도 | founded | - |
| 통화가능시간 | consultTime | O |
| 필요자금규모 | amount | O |
| 자금종류 | fundType | O |
| 문의사항 | message | - |

---

## 1. 고객 접수 확인 이메일 (확정)

### 발신 정보
- **From**: `KY 중소기업지원센터 <noreply@mail.policy-fund.online>`
- **To**: 고객 이메일
- **Subject**: `[KY 중소기업지원센터] 무료 상담 신청이 접수되었습니다`

### 색상
| 용도 | 색상코드 |
|------|----------|
| 헤더 그라디언트 시작 | #1E3A5F |
| 헤더 그라디언트 끝 | #3B82F6 |
| 배경 | #f8fafc |
| 정보박스 배경 | #f1f5f9 |
| 정보박스 강조선 | #3B82F6 (좌측 4px) |
| 본문 텍스트 | #1e293b |
| 보조 텍스트 | #475569 |
| 레이블 텍스트 | #64748b |
| 푸터 배경 | #1E3A5F |

### 레이아웃
- 컨테이너: 600px, border-radius 12px
- 헤더 패딩: 32px
- 콘텐츠 패딩: 32px
- 정보박스: border-radius 8px, 패딩 20px

### 표시 필드
1. 기업명
2. 대표자명
3. 연락처
4. 통화 가능 시간
5. 필요 자금 규모
6. 자금 종류
7. 접수일시

### 함수
`buildCustomerEmailHtml()`

---

## 2. 내부 수신용 이메일 (확정)

### 발신 정보
- **From**: `KY 중소기업지원센터 <noreply@mail.policy-fund.online>`
- **To**: jmfood12@naver.com
- **BCC**: mkt@polarad.co.kr
- **Subject**: `[KY] {기업명} - {대표자명}`

### 색상
| 용도 | 색상코드 |
|------|----------|
| 헤더 배경 | #dc2626 |
| 알림박스 배경 | #fef2f2 |
| 알림박스 테두리 | #fecaca (2px) |
| 알림박스 텍스트 | #991b1b |
| 본문 배경 | #f1f5f9 |
| 카드 배경 | #ffffff |
| 테이블 교차행 | #f9fafb |
| 테이블 테두리 | #e5e7eb |
| 레이블 텍스트 | #6b7280 |
| 값 텍스트 (강조) | #111827 |
| 값 텍스트 (일반) | #374151 |
| 푸터 배경 | #f3f4f6 |
| 푸터 텍스트 | #9ca3af |

### 반응형 CSS
```css
@media only screen and (max-width: 600px) {
  .email-container { width: 100% !important; }
  .content-padding { padding: 16px !important; }
  .info-label { width: 90px !important; font-size: 12px !important; }
  .info-value { font-size: 13px !important; }
}
```

### 레이아웃
- 컨테이너: max-width 560px, width 100%
- border-radius: 8px (외부), 6px (내부)
- table-layout: fixed (오버플로우 방지)
- word-break: break-all (긴 텍스트 줄바꿈)
- 외부 패딩: 12px
- 콘텐츠 패딩: 16px

### 섹션 구조

#### 헤더
- 배경: #dc2626
- 패딩: 14px 16px
- 제목: "🔔 KY 신규 상담" (16px, white, bold)

#### 통화가능시간 알림 (최상단)
- 배경: #fef2f2
- 테두리: 2px solid #fecaca
- 패딩: 10px 12px
- 아이콘: ⏰
- 텍스트: 14px, #991b1b

#### 고객정보 테이블 (👤)
| 필드 | 스타일 |
|------|--------|
| 기업명 | bold, #111827 |
| 사업자번호 | normal, #374151 |
| 대표자명 | bold, #111827 |
| 연락처 | bold, #111827 |
| 이메일 | normal, #374151 |
| 업종 | normal, #374151 |
| 설립연도 | normal, #374151 |

#### 자금정보 테이블 (💰)
| 필드 | 스타일 |
|------|--------|
| 필요자금 | bold, #111827 |
| 자금종류 | normal, #374151 |

#### 문의사항 (💬)
- 배경: #f9fafb
- 테두리: 1px solid #e5e7eb
- 패딩: 10px 12px
- 텍스트: 13px, #374151, line-height 1.5
- white-space: pre-wrap

#### 푸터
- 배경: #f3f4f6
- 패딩: 12px 16px
- 텍스트: 11px, #9ca3af, 중앙정렬
- 내용: "📅 {날짜} {시간} | KY 중소기업지원센터"

### 테이블 셀 스타일
- 레이블: width 100px, font-size 12px, color #6b7280, padding 8px 10px
- 값: font-size 13px, padding 8px 10px

### 함수
`buildStaffEmailHtml()`

---

## 3. 텔레그램 알림 (확정)

### API 설정
```javascript
{
  chat_id: TELEGRAM_CHAT_ID,
  text: telegramText,
  parse_mode: 'HTML',
  disable_web_page_preview: true
}
```

### 메시지 포맷
```
🔔 <b>KY 신규 상담</b>

👤 <b>고객정보</b>
├ 기업명: <b>{company}</b>
├ 사업자번호: {bizno}
├ 대표자명: <b>{name}</b>
├ 연락처: <code>{phone}</code>
├ 이메일: {email}
├ 업종: {industry}
└ 설립연도: {founded}

💰 <b>자금정보</b>
├ 통화가능: <b>{consultTime}</b>
├ 규모: {amount}
└ 종류: {fundType}

💬 <b>문의</b>
{message}

📅 {submitDate} {submitTime}

📊 <a href="https://airtable.com/appVtpUDzH23zDUdu/shrVORVT7BCdZqfQ4">Airtable에서 보기</a>
👆 클릭하면 전체 접수 내역을 확인할 수 있습니다
```

### HTML 태그
- `<b>` - 강조 (기업명, 대표자명, 통화가능시간)
- `<code>` - 복사 가능 (연락처)
- `<a href="">` - 링크 (Airtable)

### 트리 구조 문자
- 중간: `├`
- 마지막: `└`

### Airtable 연동
- **공유 링크**: https://airtable.com/appVtpUDzH23zDUdu/shrVORVT7BCdZqfQ4
- **안내 문구**: "👆 클릭하면 전체 접수 내역을 확인할 수 있습니다"

### 함수
`buildTelegramMessage()`

---

## 환경변수

```
AIRTABLE_BASE_ID=appVtpUDzH23zDUdu
AIRTABLE_TOKEN=pat***
AIRTABLE_TABLE_NAME=consulting
RESEND_API_KEY=re_***
STAFF_EMAIL=jmfood12@naver.com
TELEGRAM_BOT_TOKEN=***
TELEGRAM_CHAT_ID=***
```

---

## 적용 페이지

- index.html
- about.html
- process.html
- pro.html
- fund.html
