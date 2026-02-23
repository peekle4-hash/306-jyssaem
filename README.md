# 슬기로운 3학년 1반 (Github Pages)

잠실여자중학교 3학년 1반 학급 운영용 사이트 템플릿입니다.  
출결 / 생기부 / 고입 / 급식(자동) / 추억사진 업로드(Drive 저장) / 우리 반 규칙 메뉴가 포함되어 있어요.

---

## 1) Github Pages로 배포하기

1. 이 폴더를 그대로 GitHub 저장소에 업로드
2. GitHub → **Settings → Pages**
3. Source: **Deploy from a branch**
4. Branch: **main / (root)** 선택 → Save
5. 발급된 주소로 접속하면 끝!

---

## 2) 급식 자동 불러오기(NEIS OpenAPI)

이 사이트의 급식 메뉴는 **나이스 교육정보 개방 포털(NEIS) OpenAPI**를 사용합니다.

- 필요한 것: **인증키(KEY)**
- 사이트에서 KEY를 1번 입력하고 저장하면 브라우저(LocalStorage)에 저장됩니다.

> 급식 페이지에서 학교명(기본: 잠실여자중학교)을 바꿔도 자동으로 학교코드를 찾아서 조회합니다.

---

## 3) 추억사진 업로드(학생 → 선생님 Google Drive)

⚠️ Github Pages는 정적 사이트라서, 학생 사진을 GitHub에 직접 저장할 수 없어요.  
대신 **Google Apps Script(Web App)** 로 받아서 **Google Drive 폴더에 저장**하도록 구성했습니다.

### A. Drive 폴더 만들기
1. Google Drive에서 폴더 생성 (예: `2026_잠실여중_3-1_추억사진`)
2. 폴더 링크에서 **폴더 ID**를 복사  
   - 링크 형태: `https://drive.google.com/drive/folders/여기가_ID`

### B. Apps Script 배포
1. https://script.google.com 에서 새 프로젝트 만들기
2. 이 저장소의 `gas/Code.gs` 내용을 붙여넣기
3. 코드 상단의 `FOLDER_ID`를 방금 복사한 폴더 ID로 변경
4. 오른쪽 상단 **배포(Deploy) → 새 배포(New deployment)**
5. 유형: **웹 앱(Web app)**
   - 실행: 나(프로젝트 소유자)
   - 액세스: **모든 사용자(Anyone)**  *(학생 업로드용)*
6. 배포 후 나오는 **웹 앱 URL**을 복사

### C. 사이트에 WebApp URL 넣기
- 사이트의 **추억사진 업로드** 페이지에서 WebApp URL을 입력 → 저장
- 학생들은 이후 사진 선택 후 업로드하면, 자동으로 Drive 폴더에 저장됩니다.

### D. 선생님이 “한 파일로 모으기”
- Drive에서 해당 폴더를 열고 **폴더 다운로드**를 하면 자동으로 ZIP으로 받아집니다.
- 또는 Drive에서 “공유”로 편하게 관리할 수 있어요.

---

## 4) 내용 수정 방법
- 텍스트는 `pages/*.html` 파일을 열어서 수정하면 됩니다.
- 색/폰트/전체 분위기는 `assets/css/style.css`에서 수정하면 됩니다.

즐거운 3학년 1반 되세요! 🌷
