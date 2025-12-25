# KY 중소기업지원센터 프로젝트

## 필수 참조 문서
작업 전 반드시 `docs/PROJECT-INFO.md` 파일을 읽어 프로젝트 구조와 배포 정보를 확인하세요.

## 핵심 정보

### 배포 URL
- **메인 사이트**: https://kybiz.co.kr
- **관리자 대시보드**: https://admin-kybiz.vercel.app
- **API**: https://ky-form.chltmdrbs7.workers.dev

### 배포 명령어

**메인 사이트 (루트):**
```bash
cd F:/pola_homepage/3.20tb_choiseungkyun_ky
npx vercel --prod --token 2FhxlunFaNo5WHHe357mxSdD --yes
```

**관리자 대시보드:**
```bash
cd F:/pola_homepage/3.20tb_choiseungkyun_ky/admin
npx vercel --prod --token 2FhxlunFaNo5WHHe357mxSdD --yes
```

**Worker API:**
```bash
cd F:/pola_homepage/3.20tb_choiseungkyun_ky/worker
npx wrangler deploy
```

### Git 저장소
- 메인: https://github.com/chltmdrbs7/ky (브랜치: master)
- Admin: https://github.com/chltmdrbs7/admin.kybiz.co.kr- (별도 git)

### 주의사항
1. admin 폴더는 별도 Git 저장소
2. Vercel 배포 시 반드시 토큰 사용
3. 이미지는 `/admin/images/board/`에 저장
