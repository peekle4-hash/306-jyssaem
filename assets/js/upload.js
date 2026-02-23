function $(sel){ return document.querySelector(sel); }

const LS_GAS = "gas_webapp_url";

function setMsg(msg){
  $("#uploadStatus").textContent = msg;
}

function humanSize(bytes){
  const units=["B","KB","MB","GB"];
  let v=bytes, i=0;
  while(v>1024 && i<units.length-1){ v/=1024; i++; }
  return `${v.toFixed(i?1:0)} ${units[i]}`;
}

function clearPreviews(){
  $("#previewGrid").innerHTML = "";
}

function addPreview(file){
  const grid = $("#previewGrid");
  const card = document.createElement("div");
  card.className="preview";
  const img = document.createElement("img");
  img.alt = file.name;
  img.src = URL.createObjectURL(file);
  const meta = document.createElement("div");
  meta.className="meta";
  meta.textContent = `${file.name} · ${humanSize(file.size)}`;
  card.appendChild(img);
  card.appendChild(meta);
  grid.appendChild(card);
}

async function uploadFiles(files, gasUrl){
  // Google Apps Script WebApp expects JSON base64 to avoid multipart issues.
  // We'll send one request per file (reliable on school Wi-Fi).
  const results = [];
  for(let i=0;i<files.length;i++){
    const f = files[i];
    setMsg(`업로드 중... (${i+1}/${files.length}) ${f.name}`);
    const base64 = await new Promise((resolve,reject)=>{
      const reader = new FileReader();
      reader.onload = ()=> resolve(String(reader.result).split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(f);
    });

    const body = {
      filename: f.name,
      mimeType: f.type || "application/octet-stream",
      data: base64
    };

    const res = await fetch(gasUrl, {
      method:"POST",
      mode:"cors",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify(body)
    });

    const json = await res.json().catch(()=>null);
    if(!res.ok || !json?.ok){
      throw new Error(json?.error || `업로드 실패: ${f.name}`);
    }
    results.push(json);
  }
  return results;
}

function renderResult(items){
  const box = $("#uploadResult");
  box.innerHTML = "";
  if(!items.length) return;
  const ul = document.createElement("ul");
  ul.style.margin="0";
  ul.style.paddingLeft="18px";
  items.forEach(it=>{
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = it.fileUrl;
    a.target = "_blank";
    a.rel = "noopener";
    a.textContent = it.filename;
    li.appendChild(a);
    ul.appendChild(li);
  });
  box.appendChild(ul);
}

function init(){
  const gasInput = $("#gasUrl");
  gasInput.value = localStorage.getItem(LS_GAS) || "";
  $("#saveGas").addEventListener("click", ()=>{
    localStorage.setItem(LS_GAS, gasInput.value.trim());
    setMsg("저장 완료! 이제 사진을 선택하고 업로드하세요.");
  });

  const picker = $("#filePicker");
  picker.addEventListener("change", ()=>{
    clearPreviews();
    const files = Array.from(picker.files || []);
    $("#fileCount").textContent = files.length ? `${files.length}개 선택됨` : "선택된 파일 없음";
    files.slice(0,24).forEach(addPreview);
    if(files.length>24){
      const more = document.createElement("div");
      more.className="small";
      more.textContent = `미리보기는 최대 24장만 보여줘요. (총 ${files.length}장)`;
      $("#previewGrid").appendChild(more);
    }
  });

  $("#uploadBtn").addEventListener("click", async ()=>{
    const gasUrl = gasInput.value.trim();
    const files = Array.from(picker.files || []);
    if(!gasUrl){
      setMsg("먼저 Google Apps Script WebApp URL을 저장해 주세요.");
      return;
    }
    if(!files.length){
      setMsg("업로드할 사진을 먼저 선택해 주세요.");
      return;
    }

    $("#uploadBtn").disabled = true;
    try{
      const items = await uploadFiles(files, gasUrl);
      setMsg("업로드 완료! ✅");
      renderResult(items);
    }catch(e){
      console.error(e);
      setMsg(`에러: ${e.message}`);
    }finally{
      $("#uploadBtn").disabled = false;
    }
  });
}

document.addEventListener("DOMContentLoaded", init);
