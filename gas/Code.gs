/**
 * Google Apps Script WebApp (사진 업로드 → Google Drive 저장)
 * - 배포 설정: 실행=나, 액세스=모든 사용자(Anyone)
 * - CORS: fetch로 호출 가능하도록 JSON 응답
 */

// ✅ 여기에 Drive 폴더 ID를 넣으세요.
const FOLDER_ID = "PUT_YOUR_FOLDER_ID_HERE";

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, message: "Uploader is running" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const folder = DriveApp.getFolderById(FOLDER_ID);

    const body = e.postData && e.postData.contents ? e.postData.contents : "";
    const data = JSON.parse(body);

    if (!data || !data.filename || !data.data) {
      return json_({ ok: false, error: "Invalid payload" }, 400);
    }

    const bytes = Utilities.base64Decode(data.data);
    const blob = Utilities.newBlob(bytes, data.mimeType || "application/octet-stream", data.filename);

    const file = folder.createFile(blob);

    // Drive 내부에서 미리보기 가능한 링크
    const fileUrl = "https://drive.google.com/file/d/" + file.getId() + "/view";

    return json_({
      ok: true,
      filename: data.filename,
      fileId: file.getId(),
      fileUrl: fileUrl
    }, 200);

  } catch (err) {
    return json_({ ok: false, error: String(err) }, 500);
  }
}

function json_(obj, code) {
  const out = ContentService.createTextOutput(JSON.stringify(obj));
  out.setMimeType(ContentService.MimeType.JSON);
  // Apps Script ContentService doesn't support setting HTTP status directly in classic; still return JSON body.
  return out;
}
