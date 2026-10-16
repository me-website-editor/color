(function () {
  const canvas = document.getElementById('editorCanvas');
  const ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;
  const fileInput = document.getElementById('imageUpload');
  const emptyState = document.getElementById('emptyState');
  const imageInfo = document.getElementById('imageInfo');
  const downloadBtn = document.getElementById('downloadBtn');
  const resetBtn = document.getElementById('resetBtn');

  const controls = {
    brightness: document.getElementById('brightness'),
  };

  const valueLabels = {
    brightness: document.getElementById('brightnessValue'),
  };

  const state = {
    image: null,
    filename: 'edited-image',
    brightness: 100,
  };

  function updateLabels() {
    if (valueLabels.brightness) valueLabels.brightness.textContent = `${state.brightness}%`;
  }

  function draw() {
    if (!ctx || !canvas || !state.image) return;
    const img = state.image;
    const maxW = 900, maxH = 600;
    const ratio = Math.min(maxW / img.width, maxH / img.height, 1);
    const w = img.width * ratio, h = img.height * ratio;
    canvas.width = w; canvas.height = h;
    ctx.clearRect(0, 0, w, h);
    ctx.filter = `brightness(${state.brightness}%)`;
    ctx.drawImage(img, 0, 0, w, h);
    if (emptyState) emptyState.classList.add('hidden');
    if (imageInfo) imageInfo.textContent = `${Math.round(w)} × ${Math.round(h)}`;
  }

  function applyPreset(preset) {
    if (preset === 'grayscale') { /* small demo: reduce saturation via filter chain */ state.brightness = 100; }
    if (preset === 'sepia') { state.brightness = 100; }
    if (preset === 'vivid') { state.brightness = 120; }
    if (preset === 'none') state.brightness = 100;
    if (controls.brightness) controls.brightness.value = state.brightness;
    updateLabels(); draw();
  }

  function setupFilterButtons() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        applyPreset(btn.dataset.filter);
      });
    });
  }

  function onControls() {
    if (!controls.brightness) return;
    state.brightness = Number(controls.brightness.value);
    updateLabels();
    draw();
  }

  function applyImage(file) {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        state.image = img;
        state.filename = file.name.replace(/\.[^/.]+$/, '') || 'edited';
        draw();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function downloadImage() {
    if (!canvas) return;
    canvas.toBlob(blob => {
      if (!blob) return;
      const a = document.createElement('a');
      const url = URL.createObjectURL(blob);
      a.href = url;
      a.download = `${state.filename}-edited.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }, 'image/png');
  }

  if (fileInput) fileInput.addEventListener('change', e => applyImage(e.target.files[0]));
  if (controls.brightness) controls.brightness.addEventListener('input', onControls);
  if (downloadBtn) downloadBtn.addEventListener('click', downloadImage);
  if (resetBtn) resetBtn.addEventListener('click', () => { state.brightness = 100; if (controls.brightness) controls.brightness.value = 100; updateLabels(); draw(); });
  setupFilterButtons();
  updateLabels();
})();