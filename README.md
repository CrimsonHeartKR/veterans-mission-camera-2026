# 2026년 보훈사적지 탐방 프로그램 미션 — 카메라 웹앱

학생 팀이 보훈사적지에서 프레임을 골라 사진을 찍고, 학교/팀명/팀원/퀴즈 정답을 함께 제출하는 모바일 웹앱입니다.

## 화면 구성

| 탭 | 설명 |
|----|------|
| 🎨 테마선택 | Drive 또는 로컬에 등록된 PNG 프레임을 갤러리에서 선택 |
| 📷 촬영 | 카메라 + 프레임 오버레이 → 셔터 → 결과 이미지 크게 표시 → `다시 찍기` / `정보 입력하기` |
| 📝 정보입력 | 학교명·팀명·팀원 이름·퀴즈 정답 4개 필드 + `제출하기` 단일 버튼 |

## 운영 전 교체 필수

`index.html` 상단 `appState` 의 두 값을 운영 환경 값으로 교체:

```js
appsScriptUrl: '',   // ← Apps Script 웹앱 URL (사진 업로드 + 프레임 목록 제공)
frameFolderId: '',   // ← Drive 프레임 폴더 ID
```

`appsScriptUrl` 이 비어 있으면 `frames/manifest.json` 의 로컬 PNG로 자동 fallback 되고, 제출 시에는 사진을 로컬 다운로드하고 입력 정보를 클립보드에 복사합니다.

### Apps Script 측에서 처리할 액션

- `GET ?action=getFrames` → `{ success: true, frames: [{ id, name, url }] }`
- `POST { action: 'submitMission', schoolName, teamName, teamMembers, quizAnswer, imageData (base64), course, place, date, timestamp }`

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
