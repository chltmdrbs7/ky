# KY 홈페이지 섹션별 YouTube 영상 링크

## 영상 URL 목록

| 섹션명 | YouTube URL | 임베드 코드 |
|--------|-------------|-------------|
| 메인 (히어로) | https://youtu.be/HGrAntOmJtk | `<iframe src="https://www.youtube.com/embed/HGrAntOmJtk" frameborder="0" allowfullscreen></iframe>` |
| 회사소개 | https://youtu.be/W56I-a4V3cw | `<iframe src="https://www.youtube.com/embed/W56I-a4V3cw" frameborder="0" allowfullscreen></iframe>` |
| 진행과정 | https://youtu.be/saT5iG12H1w | `<iframe src="https://www.youtube.com/embed/saT5iG12H1w" frameborder="0" allowfullscreen></iframe>` |
| 자금상담 | https://youtu.be/LlYM9MvGds8 | `<iframe src="https://www.youtube.com/embed/LlYM9MvGds8" frameborder="0" allowfullscreen></iframe>` |
| 전문서비스 | https://youtu.be/iqmBZURAsjE | `<iframe src="https://www.youtube.com/embed/iqmBZURAsjE" frameborder="0" allowfullscreen></iframe>` |
| 온라인마케팅 | https://youtu.be/aSJfdEQfI5c | `<iframe src="https://www.youtube.com/embed/aSJfdEQfI5c" frameborder="0" allowfullscreen></iframe>` |

## 섹션 ID 매핑

| 메뉴명 | 섹션 ID | 영상 Video ID |
|--------|---------|---------------|
| 홈 | #hero | HGrAntOmJtk |
| 회사소개 | #company | W56I-a4V3cw |
| 진행과정 | #process | saT5iG12H1w |
| 자금상담 | #fund | LlYM9MvGds8 |
| 전문서비스 | #service | iqmBZURAsjE |
| 온라인마케팅 | #marketing | aSJfdEQfI5c |

## 사용 방법

### 반응형 iframe 적용 예시

```html
<div class="video-container">
    <iframe
        src="https://www.youtube.com/embed/VIDEO_ID"
        title="섹션 영상"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen>
    </iframe>
</div>
```

### CSS 스타일

```css
.video-container {
    position: relative;
    padding-bottom: 56.25%; /* 16:9 비율 */
    height: 0;
    overflow: hidden;
    max-width: 100%;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.video-container iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}
```

---

**작성일**: 2025-12-23
**프로젝트**: KY 홈페이지
