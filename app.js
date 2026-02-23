/* ===================================================
   슬기로운 301 생활 – app.js
   =================================================== */

// ─── TAB NAVIGATION ───────────────────────────────
document.querySelectorAll('.tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(s => s.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
    if (btn.dataset.tab === 'meal') initMeal();
    if (btn.dataset.tab === 'photos') renderGallery();
  });
});

// ─── MEAL (급식표) ────────────────────────────────
const NEIS_API_KEY = 'sample';   // 교육부 NEIS 오픈API 키 (demo용 – sample key 사용)
// 잠실여자중학교: ATPT_OFCDC_SC_CODE = 'B10', SD_SCHUL_CODE = '7130093'
const SCHOOL_CODE  = '7130093';
const OFFICE_CODE  = 'B10';

let currentMonday = getMonday(new Date());

function getMonday(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0,0,0,0);
  return date;
}

function formatDate(d, sep='') {
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,'0');
  const day = String(d.getDate()).padStart(2,'0');
  return sep ? `${y}${sep}${m}${sep}${day}` : `${y}${m}${day}`;
}

function getWeekDates(monday) {
  return Array.from({length:5}, (_,i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

async function fetchMeal(fromDate, toDate) {
  // NEIS 오픈API 급식식단정보
  const url = `https://open.neis.go.kr/hub/mealServiceDietInfo`
    + `?KEY=${NEIS_API_KEY}&Type=json&pIndex=1&pSize=100`
    + `&ATPT_OFCDC_SC_CODE=${OFFICE_CODE}`
    + `&SD_SCHUL_CODE=${SCHOOL_CODE}`
    + `&MLSV_FROM_YMD=${fromDate}&MLSV_TO_YMD=${toDate}`;
  try {
    const res = await fetch(url);
    const json = await res.json();
    if (json.mealServiceDietInfo) {
      return json.mealServiceDietInfo[1].row;
    }
  } catch(e) {
    // network or CORS – fallback handled below
  }
  return null;
}

const DAY_CLASSES = ['mon','tue','wed','thu','fri'];
const DAY_KOR = ['월요일','화요일','수요일','목요일','금요일'];

async function initMeal() {
  const grid = document.getElementById('mealGrid');
  const label = document.getElementById('weekLabel');
  const week = getWeekDates(currentMonday);
  const fromDate = formatDate(week[0]);
  const toDate   = formatDate(week[4]);

  const mon = week[0], fri = week[4];
  label.textContent = `${formatDate(mon,'.')} ~ ${formatDate(fri,'.')}`;

  grid.innerHTML = '<div class="meal-loading">🍽️ 급식 정보를 불러오는 중...</div>';

  const rows = await fetchMeal(fromDate, toDate);

  // map date → items
  const mealMap = {};
  if (rows) {
    rows.forEach(r => {
      const date = r.MLSV_YMD;
      const menu = r.DDISH_NM.replace(/<br\/>/g,'\n').split('\n').map(s => s.replace(/\([^)]*\)/g,'').trim()).filter(Boolean);
      mealMap[date] = { menu, kcal: r.CAL_INFO };
    });
  }

  grid.innerHTML = '';
  week.forEach((d, i) => {
    const dateKey = formatDate(d);
    const info = mealMap[dateKey];
    const card = document.createElement('div');
    card.className = 'meal-day-card';

    const header = document.createElement('div');
    header.className = `meal-day-header ${DAY_CLASSES[i]}`;
    header.innerHTML = `${DAY_KOR[i]}<br><span class="meal-date">${formatDate(d,'.')}</span>`;

    const body = document.createElement('div');
    body.className = 'meal-items';

    if (info && info.menu.length) {
      info.menu.forEach(item => {
        const el = document.createElement('div');
        el.className = 'meal-item';
        el.textContent = item;
        body.appendChild(el);
      });
      if (info.kcal) {
        const kcal = document.createElement('div');
        kcal.className = 'meal-kcal';
        kcal.textContent = info.kcal;
        body.appendChild(kcal);
      }
    } else {
      const no = document.createElement('div');
      no.className = 'no-meal';
      no.textContent = rows ? '급식 없음' : 'API 로딩 실패\n직접 확인 필요';
      no.style.whiteSpace = 'pre-line';
      body.appendChild(no);
    }

    card.appendChild(header);
    card.appendChild(body);
    grid.appendChild(card);
  });
}

document.getElementById('prevWeek').addEventListener('click', () => {
  currentMonday.setDate(currentMonday.getDate() - 7);
  initMeal();
});
document.getElementById('nextWeek').addEventListener('click', () => {
  currentMonday.setDate(currentMonday.getDate() + 7);
  initMeal();
});

// ─── PHOTO UPLOAD ─────────────────────────────────
let selectedFiles = [];
let storedPhotos  = JSON.parse(localStorage.getItem('class301_photos') || '[]');

const uploadArea     = document.getElementById('uploadArea');
const fileInput      = document.getElementById('fileInput');
const uploaderName   = document.getElementById('uploaderName');
const uploadBtn      = document.getElementById('uploadBtn');
const previewArea    = document.getElementById('previewArea');
const previewGrid    = document.getElementById('previewGrid');
const downloadAllBtn = document.getElementById('downloadAllBtn');

// Click & drag-drop
uploadArea.addEventListener('click', () => fileInput.click());
uploadArea.addEventListener('dragover', e => { e.preventDefault(); uploadArea.classList.add('drag-over'); });
uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('drag-over'));
uploadArea.addEventListener('drop', e => {
  e.preventDefault();
  uploadArea.classList.remove('drag-over');
  handleFiles([...e.dataTransfer.files].filter(f => f.type.startsWith('image/')));
});
fileInput.addEventListener('change', () => handleFiles([...fileInput.files]));

uploaderName.addEventListener('input', updateUploadBtn);

function updateUploadBtn() {
  uploadBtn.disabled = selectedFiles.length === 0 || uploaderName.value.trim() === '';
}

function handleFiles(files) {
  if (!files.length) return;
  selectedFiles = [...selectedFiles, ...files];
  renderPreviews();
  updateUploadBtn();
}

function renderPreviews() {
  if (selectedFiles.length === 0) {
    previewArea.classList.add('hidden');
    return;
  }
  previewArea.classList.remove('hidden');
  previewGrid.innerHTML = '';
  selectedFiles.forEach((file, idx) => {
    const reader = new FileReader();
    reader.onload = e => {
      const wrapper = document.createElement('div');
      wrapper.className = 'preview-item';
      wrapper.innerHTML = `
        <img src="${e.target.result}" alt="미리보기" />
        <button class="preview-remove" data-idx="${idx}">✕</button>
      `;
      previewGrid.appendChild(wrapper);
    };
    reader.readAsDataURL(file);
  });
}

previewGrid.addEventListener('click', e => {
  if (e.target.classList.contains('preview-remove')) {
    const idx = parseInt(e.target.dataset.idx);
    selectedFiles.splice(idx, 1);
    renderPreviews();
    updateUploadBtn();
  }
});

uploadBtn.addEventListener('click', () => {
  const name = uploaderName.value.trim();
  if (!name || selectedFiles.length === 0) return;

  let processed = 0;
  selectedFiles.forEach(file => {
    const reader = new FileReader();
    reader.onload = e => {
      storedPhotos.push({
        name,
        filename: file.name,
        dataURL: e.target.result,
        time: new Date().toLocaleString('ko-KR')
      });
      processed++;
      if (processed === selectedFiles.length) {
        localStorage.setItem('class301_photos', JSON.stringify(storedPhotos));
        selectedFiles = [];
        fileInput.value = '';
        uploaderName.value = '';
        renderPreviews();
        updateUploadBtn();
        renderGallery();
        alert(`✅ ${processed}장의 사진이 업로드되었습니다!`);
      }
    };
    reader.readAsDataURL(file);
  });
});

function renderGallery() {
  const area = document.getElementById('galleryArea');
  if (storedPhotos.length === 0) {
    area.innerHTML = '<div class="gallery-empty">아직 업로드된 사진이 없어요 🌱<br>첫 번째 사진을 올려주세요!</div>';
    return;
  }
  const grid = document.createElement('div');
  grid.className = 'gallery-grid';
  storedPhotos.forEach(p => {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    item.innerHTML = `
      <img src="${p.dataURL}" alt="${p.filename}" />
      <div class="gallery-item-info">
        <div class="gallery-uploader">📸 ${p.name}</div>
        <div class="gallery-time">${p.time}</div>
      </div>
    `;
    grid.appendChild(item);
  });
  area.innerHTML = '';
  area.appendChild(grid);
}

// ─── ZIP DOWNLOAD (선생님용) ────────────────────────
downloadAllBtn.addEventListener('click', async () => {
  if (storedPhotos.length === 0) {
    alert('업로드된 사진이 없습니다.');
    return;
  }
  if (typeof JSZip === 'undefined') {
    alert('JSZip 라이브러리 로딩 중입니다. 잠시 후 다시 시도하세요.');
    return;
  }
  const zip = new JSZip();
  const folder = zip.folder('3-1_추억사진');

  storedPhotos.forEach((p, i) => {
    // dataURL → base64
    const base64 = p.dataURL.split(',')[1];
    const ext = p.dataURL.split(';')[0].split('/')[1] || 'jpg';
    const safeFilename = `${String(i+1).padStart(3,'0')}_${p.name}_${p.filename.replace(/[^a-zA-Z0-9가-힣._-]/g,'_')}`;
    folder.file(safeFilename.endsWith('.'+ext) ? safeFilename : safeFilename+'.'+ext, base64, {base64:true});
  });

  const blob = await zip.generateAsync({type:'blob'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = '3-1_추억사진_모음.zip';
  a.click();
});
