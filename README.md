# 2026년 보훈사적지 탐방 프로그램 미션 — 카메라 웹앱

학생 팀이 보훈사적지에서 프레임을 골라 사진을 찍고, 학교/팀명/팀원/퀴즈 정답을 함께 제출하는 모바일 웹앱입니다.

> **운영 담당자라면 → [📘 관리자 운영 가이드](관리자_가이드.md) 부터 보세요.**

## 화면 구성

| 탭 | 설명 |
|----|------|
| 🎨 테마선택 | Drive 또는 로컬에 등록된 PNG 프레임을 갤러리에서 선택 |
| 📷 촬영 | 카메라 + 프레임 오버레이 → 셔터 → 결과 이미지 크게 표시 → `다시 찍기` / `정보 입력하기` |
| 📝 정보입력 | 학교명·팀명·팀원 이름·퀴즈 정답 4개 필드 + `제출하기` 단일 버튼 |

## 운영 전 교체 필수

`index.html` 상단 `appState.appsScriptUrl` **하나만** 채우면 됩니다 (나머지 ID는 이미 입력됨):

```js
appsScriptUrl: '',                                            // ← 배포 후 받은 웹앱 URL
frameFolderId: '1yk8EQ68XpoOm8GYUJbguYgY2NftdVd5B',           // ✅ 입력 완료
spreadsheetId: '1PVFXUE3nAuAkcm49i12E7K7wl-QprR07VrfOrh0PBBs', // ✅ 입력 완료
```

`appsScriptUrl` 이 비어 있으면 `frames/manifest.json` 의 로컬 PNG로 자동 fallback 되고, 제출 시 사진은 로컬 다운로드 + 입력 정보는 클립보드 복사로 처리됩니다.

### Apps Script 배포 (5분)

백엔드 코드는 [`apps-script/Code.gs`](apps-script/Code.gs) 에 들어 있습니다 (폴더/스프레드시트 ID는 이미 코드에 박혀 있음).

1. https://script.google.com/ → **새 프로젝트**
2. 좌측 `Code.gs` 내용을 전부 지우고, 본 레포의 `apps-script/Code.gs` 내용을 붙여넣기
3. 💾 저장 (`Ctrl+S`) → 프로젝트 이름은 자유 (예: `veterans-mission-2026`)
4. 우측 상단 **배포 → 새 배포** 클릭
5. 톱니바퀴 → **웹 앱** 선택
6. 설정:
   - 설명: `v1`
   - 다음 사용자로 실행: `나`
   - 액세스 권한: **모든 사용자** (인증 없이 호출 가능해야 함)
7. **배포** → 권한 승인 (구글 계정 선택 → 고급 → "안전하지 않음" 페이지로 이동 → 허용)
8. **웹 앱 URL** 복사 (`https://script.google.com/macros/s/.../exec` 형태)

### 처리되는 액션

- `GET ?action=getFrames` → `{ success: true, frames: [{ id, name, url }] }`
- `POST { action:'submitMission', schoolName, teamName, teamMembers, quizAnswer, imageData(base64), course, place, date, timestamp }` → 사진을 Drive(`제출사진/`)에 저장 + 스프레드시트(`제출목록`)에 1행 기록

## 기본 프레임 (8장)

`frames/` 폴더에 경기북부보훈지청 프로그램용 PNG 8장을 동봉. `frames/manifest.json` 에 노출됩니다. 운영용 프레임이 Drive에 등록되면 Apps Script 응답이 우선 적용됩니다.

## GitHub Pages 배포

1. 신규 레포지토리 생성 (예: `veterans-mission-camera-2026`)
2. 이 폴더 내용 그대로 push
3. Settings → Pages → Source: `main` / `/` (root) → Save
4. `https://<owner>.github.io/veterans-mission-camera-2026/` 에서 접속

`.nojekyll` 파일이 포함되어 있어 Jekyll 처리가 비활성화됩니다.

## URL 파라미터 (선택)

`?course=A-01&place=현충원&date=2026-04-15` 형태로 코스/장소/날짜를 자동 주입할 수 있습니다.
