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

function loadImage(file, target) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    target.src = reader.result;
  };
  reader.readAsDataURL(file);
}

beforeInput.addEventListener("change", e => {
  loadImage(e.target.files?.[0], beforeImg);
  setStatus("已加载灾前图");
});

afterInput.addEventListener("change", e => {
  loadImage(e.target.files?.[0], afterImg);
  setStatus("已加载灾后图");
});

slider.addEventListener("input", () => {
  afterWrap.style.width = `${slider.value}%`;
});

// === PM Metrics Integration ===
(function() {
  try {
    if (!window.pmMetrics) return;
    // Auto mark task start on first meaningful interaction
    let taskStarted = false;
    document.addEventListener('click', function(e) {
      if (taskStarted) return;
      const btn = e.target.closest('button');
      if (btn) {
        taskStarted = true;
        window.pmMetrics.markTaskStart('slider_load_task');
      }
    }, { once: false });
  } catch (_e) {}
})();
