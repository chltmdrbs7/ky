# KY 중소기업지원센터 - 게시판 에디터 PRD

## 1. 개요

### 목적
KY 중소기업지원센터 홈페이지의 공지사항/뉴스 게시판을 관리하기 위한 대시보드 에디터 구현

### 참고 프로젝트
- BIZEN 대시보드: `F:\pola_homepage\1.14th_jeonyejin_bizen\dashboard\board.html`
- K-EAI 프로젝트 (있는 경우)

---

## 2. 기능 요구사항

### 2.1 게시글 목록 (Board List)

| 기능 | 설명 |
|------|------|
| 전체 목록 조회 | 모든 게시글 표시 |
| 카테고리 필터 | 공지, 뉴스, 정보, 성공사례 등 |
| 페이지네이션 | 10개씩 페이징 |
| 검색 기능 | 제목/내용 검색 |
| 정렬 기능 | 최신순, 조회수순 |

### 2.2 게시글 작성/수정 (Board Editor)

#### 필수 입력 필드
| 필드명 | 타입 | 설명 |
|--------|------|------|
| 제목 | text | 필수, 최대 100자 |
| 내용 | textarea | 필수, HTML 지원 |
| 카테고리 | select | 공지/뉴스/정보/성공사례 |
| 썸네일 URL | text | 이미지 URL (선택) |
| 작성일 | date | YYYY-MM-DD 형식 |
| 조회수 | number | 기본값 0 |

#### 에디터 기능
- 기본 텍스트 입력 (textarea)
- HTML 태그 지원 (볼드, 줄바꿈 등)
- 썸네일 미리보기
- 저장 전 미리보기

### 2.3 게시글 삭제

- 삭제 확인 모달
- 완전 삭제 (휴지통 없음)

---

## 3. 데이터 구조

### Google Sheets 컬럼 구조

| 컬럼 | 필드명 | 타입 | 설명 |
|------|--------|------|------|
| A | 제목 | string | 게시글 제목 |
| B | 내용 | string | 게시글 본문 |
| C | 카테고리 | string | 공지/뉴스/정보/성공사례 |
| D | 썸네일URL | string | 이미지 URL |
| E | 작성일 | string | YYYY-MM-DD |
| F | 조회수 | number | 조회 카운트 |

### 시트 정보
- 스프레드시트 ID: `1-vLZeao8YbNfoh2Epa9T7yYZukdmxeDiTMOUJukSp2g`
- 시트 이름: `board`

---

## 4. 페이지 구조

### 4.1 대시보드 (추후 구현)

```
/admin/
├── index.html      # 대시보드 메인
├── board.html      # 게시판 관리
└── css/
    └── dashboard.css
```

### 4.2 프론트엔드 페이지

```
/
├── index.html      # 메인 (게시판 섹션 포함)
└── post.html       # 게시글 상세 페이지
```

---

## 5. 게시글 상세 페이지 (post.html)

### URL 구조
```
post.html?id=1
```

### 페이지 구성
1. **헤더**: index.html 헤더 동일
2. **게시글 영역**:
   - 카테고리 배지
   - 제목
   - 작성일 / 조회수
   - 썸네일 이미지 (있는 경우)
   - 본문 내용
   - 목록으로 돌아가기 버튼
3. **푸터**: index.html 푸터 동일

### 디자인 가이드
- 배경: 다크 그라데이션 (#0F172A ~ #1E3A5F)
- 카드 스타일: 글래스모피즘 효과
- 반응형 레이아웃

---

## 6. API 연동

### Google Sheets API (읽기 전용)
```javascript
const SHEET_ID = '1-vLZeao8YbNfoh2Epa9T7yYZukdmxeDiTMOUJukSp2g';
const SHEET_NAME = 'board';
const API_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(SHEET_NAME)}`;
```

### 데이터 쓰기 옵션 (추후 구현)
1. **Google Apps Script**: 웹훅 방식으로 POST 요청
2. **Cloudflare Workers**: D1 또는 KV 저장소 활용
3. **Supabase**: PostgreSQL + REST API

---

## 7. 구현 우선순위

### Phase 1 (현재)
- [x] 메인 페이지 게시판 섹션
- [x] Google Sheets 연동 (읽기)
- [ ] 게시글 상세 페이지 (post.html)

### Phase 2
- [ ] 대시보드 기본 구조
- [ ] 게시글 목록 관리 페이지
- [ ] 게시글 작성/수정 폼

### Phase 3
- [ ] Google Apps Script 연동 (쓰기)
- [ ] 이미지 업로드 기능
- [ ] 조회수 자동 증가

---

## 8. 참고: BIZEN 게시판 에디터 구조

### 모달 폼 구성
```html
<form id="postForm">
  <input type="hidden" id="postId">
  <div class="form-group">
    <label>제목 *</label>
    <input type="text" id="postTitle" required>
  </div>
  <div class="form-group">
    <label>요약</label>
    <input type="text" id="postSummary">
  </div>
  <div class="form-group">
    <label>내용 *</label>
    <textarea id="postContent" rows="12"></textarea>
  </div>
  <div class="form-group">
    <label>카테고리</label>
    <select id="postCategory">
      <option value="공지">공지</option>
      <option value="뉴스">뉴스</option>
      <option value="정보">정보</option>
      <option value="성공사례">성공사례</option>
    </select>
  </div>
  <div class="form-group">
    <label>썸네일 URL</label>
    <input type="text" id="postThumbnail">
  </div>
</form>
```

### 테이블 구조
| 썸네일 | 제목 | 카테고리 | 작성일 | 조회수 | 상태 | 관리 |

---

## 9. 작성일
- 문서 작성: 2024-12-23
- 최종 수정: 2024-12-23
