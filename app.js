const beforeInput = document.getElementById("beforeInput");
const afterInput = document.getElementById("afterInput");
const beforeImg = document.getElementById("beforeImg");
const afterImg = document.getElementById("afterImg");
const afterWrap = document.getElementById("afterWrap");
const slider = document.getElementById("slider");
const statusEl = document.getElementById("status");

function setStatus(text) {
  statusEl.textContent = `状态: ${text}`;
}

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const blobUrls = new WeakMap();
const loadSeq = new WeakMap();
let compareStarted = false;
let compareCompleted = false;

function releaseBlob(target) {
  const url = blobUrls.get(target);
  if (!url) return;
  URL.revokeObjectURL(url);
  blobUrls.delete(target);
}

function imagesDecoded() {
  return beforeImg.complete && afterImg.complete && beforeImg.naturalWidth > 0 && afterImg.naturalWidth > 0;
}

function noteImageReady() {
  const metrics = window.pmMetrics;
  if (!metrics) return;
  try {
    if (!compareStarted) {
      compareStarted = true;
      metrics.markTaskStart("slider_compare");
    }
    if (!compareCompleted && imagesDecoded()) {
      compareCompleted = true;
      metrics.markTaskComplete("slider_compare");
    }
  } catch (_e) {}
}

function beginLoad(target) {
  const seq = (loadSeq.get(target) || 0) + 1;
  loadSeq.set(target, seq);
  target.onload = null;
  target.onerror = null;
  releaseBlob(target);
  return seq;
}

function loadImage(file, target, label) {
  if (!file) return;

  const type = file.type || "";
  const allowed = type === "" || (type.startsWith("image/") && type !== "image/svg+xml");
  if (!allowed) {
    setStatus(`错误: 请上传图片文件作为${label}`);
    return;
  }
  if (file.size > MAX_IMAGE_BYTES) {
    setStatus(`错误: ${label}超过 10MB`);
    return;
  }

  const seq = beginLoad(target);
  const url = URL.createObjectURL(file);
  blobUrls.set(target, url);
  setStatus(`正在加载${label}…`);

  target.onload = () => {
    if (loadSeq.get(target) !== seq) return;
    setStatus(`已加载${label}`);
    noteImageReady();
  };
  target.onerror = () => {
    if (loadSeq.get(target) !== seq) return;
    releaseBlob(target);
    target.removeAttribute("src");
    setStatus(`错误: ${label}无法显示，请换一张图片`);
  };
  target.src = url;
}

beforeInput.addEventListener("change", e => {
  loadImage(e.target.files?.[0], beforeImg, "灾前图");
});

afterInput.addEventListener("change", e => {
  loadImage(e.target.files?.[0], afterImg, "灾后图");
});

slider.addEventListener("input", () => {
  afterWrap.style.width = `${slider.value}%`;
});

// === Demo: generate sample before/after images ===
const demoBtn = document.getElementById("demoBtn");
if (demoBtn) {
  demoBtn.addEventListener("click", () => {
    // Create "before" image (green landscape)
    const c1 = document.createElement("canvas");
    c1.width = 800; c1.height = 500;
    const ctx1 = c1.getContext("2d");
    // Sky
    const sky1 = ctx1.createLinearGradient(0, 0, 0, 250);
    sky1.addColorStop(0, "#87CEEB"); sky1.addColorStop(1, "#E0F0FF");
    ctx1.fillStyle = sky1; ctx1.fillRect(0, 0, 800, 250);
    // Green ground
    const ground1 = ctx1.createLinearGradient(0, 250, 0, 500);
    ground1.addColorStop(0, "#4CAF50"); ground1.addColorStop(1, "#2E7D32");
    ctx1.fillStyle = ground1; ctx1.fillRect(0, 250, 800, 250);
    // Trees
    for (let i = 0; i < 6; i++) {
      const x = 80 + i * 120;
      ctx1.fillStyle = "#5D4037"; ctx1.fillRect(x - 5, 200, 10, 60);
      ctx1.fillStyle = "#388E3C"; ctx1.beginPath(); ctx1.arc(x, 180, 35, 0, Math.PI * 2); ctx1.fill();
    }
    // Houses
    ctx1.fillStyle = "#FFCC80"; ctx1.fillRect(300, 200, 80, 60);
    ctx1.fillStyle = "#D84315"; ctx1.beginPath(); ctx1.moveTo(290, 200); ctx1.lineTo(340, 160); ctx1.lineTo(390, 200); ctx1.fill();
    ctx1.fillStyle = "#fff"; ctx1.font = "bold 20px sans-serif"; ctx1.textAlign = "center";
    ctx1.fillText("灾前 (Before)", 400, 40);

    // Create "after" image (damaged)
    const c2 = document.createElement("canvas");
    c2.width = 800; c2.height = 500;
    const ctx2 = c2.getContext("2d");
    // Gray sky
    const sky2 = ctx2.createLinearGradient(0, 0, 0, 250);
    sky2.addColorStop(0, "#78909C"); sky2.addColorStop(1, "#B0BEC5");
    ctx2.fillStyle = sky2; ctx2.fillRect(0, 0, 800, 250);
    // Brown ground
    const ground2 = ctx2.createLinearGradient(0, 250, 0, 500);
    ground2.addColorStop(0, "#8D6E63"); ground2.addColorStop(1, "#5D4037");
    ctx2.fillStyle = ground2; ctx2.fillRect(0, 250, 800, 250);
    // Damaged trees (stumps)
    for (let i = 0; i < 6; i++) {
      const x = 80 + i * 120;
      ctx2.fillStyle = "#4E342E"; ctx2.fillRect(x - 5, 230, 10, 30);
    }
    // Damaged house
    ctx2.fillStyle = "#A1887F"; ctx2.fillRect(305, 210, 70, 50);
    ctx2.fillStyle = "#6D4C41"; ctx2.beginPath(); ctx2.moveTo(295, 210); ctx2.lineTo(340, 175); ctx2.lineTo(375, 210); ctx2.fill();
    // Debris
    ctx2.fillStyle = "#795548";
    for (let i = 0; i < 15; i++) {
      ctx2.fillRect(Math.random() * 700 + 50, 260 + Math.random() * 200, 20 + Math.random() * 30, 8 + Math.random() * 12);
    }
    ctx2.fillStyle = "#fff"; ctx2.font = "bold 20px sans-serif"; ctx2.textAlign = "center";
    ctx2.fillText("灾后 (After)", 400, 40);

    beginLoad(beforeImg);
    beginLoad(afterImg);
    beforeImg.src = c1.toDataURL();
    afterImg.src = c2.toDataURL();
    setStatus("✅ 已加载示例图片 — 拖动滑块对比灾前/灾后");
    noteImageReady();
    if (!compareCompleted) {
      const finish = () => noteImageReady();
      beforeImg.addEventListener("load", finish, { once: true });
      afterImg.addEventListener("load", finish, { once: true });
    }
  });
}


