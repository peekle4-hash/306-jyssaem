const NEIS_BASE = "https://open.neis.go.kr/hub";
const LS_KEY = "neis_api_key";

function $(sel){ return document.querySelector(sel); }

function setStatus(msg){
  const el = $("#mealStatus");
  if(el) el.textContent = msg;
}

function formatDate(d){
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,"0");
  const da = String(d.getDate()).padStart(2,"0");
  return `${y}${m}${da}`;
}

function stripHtml(str){
  return (str||"").replace(/<br\\s*\\/?\\s*>/gi, "\\n").replace(/&amp;/g,"&");
}

async function neisFetch(endpoint, params){
  const url = new URL(`${NEIS_BASE}/${endpoint}`);
  Object.entries(params).forEach(([k,v])=>url.searchParams.set(k,v));
  const res = await fetch(url.toString());
  const text = await res.text();
  // Some responses are XML even when Type=json is requested in errors.
  try { return JSON.parse(text); } catch { return { raw:text }; }
}

async function getSchoolCodes(apiKey, schoolName){
  const data = await neisFetch("schoolInfo", {
    KEY: apiKey,
    Type: "json",
    pIndex: 1,
    pSize: 5,
    SCHUL_NM: schoolName
  });
  const row = data?.schoolInfo?.[1]?.row?.[0];
  if(!row) return null;
  return { ATPT_OFCDC_SC_CODE: row.ATPT_OFCDC_SC_CODE, SD_SCHUL_CODE: row.SD_SCHUL_CODE, SCHUL_NM: row.SCHUL_NM };
}

async function getMeals(apiKey, codes, ymd){
  const data = await neisFetch("mealServiceDietInfo", {
    KEY: apiKey,
    Type: "json",
    pIndex: 1,
    pSize: 20,
    ATPT_OFCDC_SC_CODE: codes.ATPT_OFCDC_SC_CODE,
    SD_SCHUL_CODE: codes.SD_SCHUL_CODE,
    MLSV_YMD: ymd
  });
  const rows = data?.mealServiceDietInfo?.[1]?.row || [];
  return rows;
}

function renderMeals(rows){
  const tbody = $("#mealBody");
  tbody.innerHTML = "";
  if(!rows.length){
    tbody.innerHTML = `<tr><td colspan="3" class="muted">해당 날짜에 급식 정보가 없어요.</td></tr>`;
    return;
  }
  // Sort by meal code
  rows.sort((a,b)=>String(a.MMEAL_SC_CODE).localeCompare(String(b.MMEAL_SC_CODE)));
  rows.forEach(r=>{
    const mealName = r.MMEAL_SC_NM || "중식";
    const menu = stripHtml(r.DDISH_NM || "").replace(/\\([^\\)]*\\)/g,""); // remove allergy numbers in ()
    const kcal = r.CAL_INFO || "";
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><b>${mealName}</b><div class="muted">${r.MLSV_YMD}</div></td>
      <td style="white-space:pre-line">${menu.trim() || "-"}</td>
      <td>${kcal}</td>
    `;
    tbody.appendChild(tr);
  });
}

async function load(){
  const keyInput = $("#neisKey");
  const schoolInput = $("#schoolName");
  const dateInput = $("#mealDate");

  // defaults
  const savedKey = localStorage.getItem(LS_KEY) || "";
  keyInput.value = savedKey;
  schoolInput.value = localStorage.getItem("school_name") || "잠실여자중학교";
  const today = new Date();
  dateInput.value = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;

  $("#saveKey").addEventListener("click", ()=>{
    localStorage.setItem(LS_KEY, keyInput.value.trim());
    localStorage.setItem("school_name", schoolInput.value.trim());
    setStatus("저장 완료! 아래 '급식 불러오기'를 눌러주세요.");
  });

  $("#loadMeals").addEventListener("click", async ()=>{
    const apiKey = keyInput.value.trim();
    const schoolName = schoolInput.value.trim();
    const date = new Date(dateInput.value);
    const ymd = formatDate(date);

    if(!apiKey){
      setStatus("NEIS 인증키가 필요해요. (상단에 인증키를 입력 후 저장)");
      return;
    }

    setStatus("학교 코드 찾는 중...");
    const codes = await getSchoolCodes(apiKey, schoolName);
    if(!codes){
      setStatus("학교를 찾지 못했어요. 학교명을 다시 확인해 주세요.");
      renderMeals([]);
      return;
    }

    setStatus("급식 불러오는 중...");
    const rows = await getMeals(apiKey, codes, ymd);
    renderMeals(rows);
    setStatus(`완료! (${codes.SCHUL_NM})`);
  });
}

document.addEventListener("DOMContentLoaded", load);
