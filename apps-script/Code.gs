/**
 * 2026년 보훈사적지 탐방 프로그램 미션 — 백엔드 (Google Apps Script)
 *
 * 역할
 * 1) GET ?action=getFrames        → 프레임 폴더의 PNG 목록을 JSON으로 반환
 * 2) POST { action:'submitMission' } → 사진을 Drive에 저장 + 스프레드시트에 1행 기록
 *
 * 배포: 확장 프로그램 → Apps Script → 새 프로젝트에 본 파일 붙여넣기 →
 *       배포 → 새 배포 → 유형: 웹 앱 → 액세스: 모든 사용자 → 배포 → 웹앱 URL 복사
 */

// ============================================================
// 설정 (이미 ID는 채워져 있음)
// ============================================================
const FRAME_FOLDER_ID = '1yk8EQ68XpoOm8GYUJbguYgY2NftdVd5B';
const SHEET_ID        = '1PVFXUE3nAuAkcm49i12E7K7wl-QprR07VrfOrh0PBBs';
const PHOTOS_SUBFOLDER_NAME = '제출사진';
const SHEET_TAB_NAME = '제출목록';

// ============================================================
// 라우팅
// ============================================================
function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || '';
  if (action === 'getFrames') return getFrames_();
  return json_({ success: false, error: 'unknown action: ' + action });
}

function doPost(e) {
  let payload = {};
  try {
    payload = JSON.parse(e.postData.contents);
  } catch (err) {
    return json_({ success: false, error: 'invalid JSON: ' + err.message });
  }
  if (payload.action === 'submitMission') return submitMission_(payload);
  return json_({ success: false, error: 'unknown action: ' + (payload.action || '') });
}

// ============================================================
// 프레임 목록
// ============================================================
function getFrames_() {
  try {
    const folder = DriveApp.getFolderById(FRAME_FOLDER_ID);
    const it = folder.getFilesByType(MimeType.PNG);
    const frames = [];
    while (it.hasNext()) {
      const f = it.next();
      frames.push({
        id: f.getId(),
        name: f.getName().replace(/\.png$/i, ''),
        url: 'https://lh3.googleusercontent.com/d/' + f.getId()
      });
    }
    frames.sort(function(a, b) { return a.name.localeCompare(b.name, 'ko'); });
    return json_({ success: true, frames: frames });
  } catch (err) {
    return json_({ success: false, error: err.message });
  }
}

// ============================================================
// 미션 제출
// ============================================================
function submitMission_(payload) {
  try {
    const required = ['schoolName', 'teamName', 'teamMembers', 'quizAnswer', 'imageData'];
    for (let i = 0; i < required.length; i++) {
      if (!payload[required[i]]) {
        return json_({ success: false, error: '필수 항목 누락: ' + required[i] });
      }
    }

    // 1) 사진 저장
    const decoded = Utilities.base64Decode(payload.imageData);
    const fname = '보훈미션_' + sanitize_(payload.teamName) + '_' +
                  (payload.date || todayStr_()) + '_' + Date.now() + '.jpg';
    const blob = Utilities.newBlob(decoded, 'image/jpeg', fname);

    const photosFolder = getOrCreatePhotosFolder_();
    const file = photosFolder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    const photoUrl = 'https://drive.google.com/file/d/' + file.getId() + '/view';

    // 2) 스프레드시트에 기록
    const sheet = getOrCreateSheet_();
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        '제출시각', '날짜', '코스', '장소',
        '학교명', '팀명', '팀원',
        '퀴즈정답', '사진URL'
      ]);
      sheet.getRange(1, 1, 1, 9).setFontWeight('bold').setBackground('#0b2545').setFontColor('#ffffff');
    }
    sheet.appendRow([
      new Date(),
      payload.date || '',
      payload.course || '',
      payload.place || '',
      payload.schoolName || '',
      payload.teamName || '',
      payload.teamMembers || '',
      payload.quizAnswer || '',
      photoUrl
    ]);

    return json_({ success: true, photoUrl: photoUrl });
  } catch (err) {
    return json_({ success: false, error: err.message });
  }
}

// ============================================================
// 헬퍼
// ============================================================
function getOrCreatePhotosFolder_() {
  const root = DriveApp.getFolderById(FRAME_FOLDER_ID);
  const subs = root.getFoldersByName(PHOTOS_SUBFOLDER_NAME);
  return subs.hasNext() ? subs.next() : root.createFolder(PHOTOS_SUBFOLDER_NAME);
}

function getOrCreateSheet_() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(SHEET_TAB_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_TAB_NAME);
  return sheet;
}

function sanitize_(s) {
  return String(s || '').replace(/[\\\/:*?"<>|]/g, '_').slice(0, 30);
}

function todayStr_() {
  const d = new Date();
  return d.getFullYear() + '-' +
         String(d.getMonth() + 1).padStart(2, '0') + '-' +
         String(d.getDate()).padStart(2, '0');
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================================
// 수동 테스트용 (Apps Script 편집기에서 직접 실행 가능)
// ============================================================
function _testGetFrames() {
  Logger.log(getFrames_().getContent());
}
