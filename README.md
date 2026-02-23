# 슬기로운 3-1 생활 🌸

잠실여자중학교 3학년 1반 학급 운영 사이트 (2026학년도)

## 📦 파일 구성
```
index.html   ← 메인 페이지
style.css    ← 스타일시트
app.js       ← 기능 스크립트 (급식, 사진 업로드, ZIP 다운로드)
README.md    ← 이 파일
```

## 🚀 GitHub Pages 배포 방법

1. GitHub에서 새 저장소 생성 (예: `class301`)
2. 이 폴더의 파일 4개를 모두 업로드
3. Settings → Pages → Source: **Deploy from a branch** → `main` / `root`
4. 저장 후 `https://<username>.github.io/class301/` 접속

## 🍱 급식 API 설정 (선택)

현재 NEIS 오픈API `sample` 키로 설정되어 있습니다.

실제 데이터를 불러오려면:
1. [NEIS 오픈API](https://open.neis.go.kr/) 회원가입 후 API 키 발급
2. `app.js` 상단 `const NEIS_API_KEY = 'sample';` 부분을 발급받은 키로 교체

> ⚠️ CORS 이슈로 로컬 환경에서는 급식 API가 동작하지 않을 수 있습니다. GitHub Pages에 배포 후 테스트하세요.

## 📸 사진 업로드 기능

- 학생이 브라우저에서 사진을 업로드하면 **브라우저 로컬스토리지**에 저장됩니다
- 선생님은 **"전체 사진 ZIP 다운로드"** 버튼으로 모든 사진을 한 번에 다운로드 가능
- 사진은 각 학생의 기기 브라우저에 저장되므로, 실제 공유 수집을 원하시면 Google Forms + Drive 연동 방식을 추천합니다

## 💡 개선 아이디어

- Google Firebase Storage 연동 시 학생 업로드 사진을 서버에 저장 가능
- 급식 알림을 매일 아침 카카오톡으로 발송 (카카오 채널 API 활용)
