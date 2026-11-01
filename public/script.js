(() => {
  const $ = (id) => document.getElementById(id);

  const canvas = $('editorCanvas');
  const ctx = canvas?.getContext('2d');
  const fileInput = $('imageUpload');
  const emptyState = $('emptyState');
  const imageInfo = $('imageInfo');
  const downloadBtn = $('downloadBtn');
  const resetBtn = $('resetBtn');
  const uploadLabel = document.querySelector('.upload-label');
  const clearImageBtn = $('clearImageBtn');

  if (!canvas || !ctx || !fileInput || !emptyState || !imageInfo) {
    console.error('بعض عناصر محرر الصور غير موجودة في HTML.');
    return;
  }

  const startCropBtn = $('startCropBtn');
  const applyCropBtn = $('applyCropBtn');

  const controls = {
    brightness: $('brightness'),
    contrast: $('contrast'),
    saturation: $('saturation'),
    blur: $('blur'),
    sepia: $('sepia'),
    grayscale: $('grayscale'),
    hue: $('hue')
  };

  const defaults = {
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    sepia: 0,
    grayscale: 0,
    hue: 0,
    rotation: 0,
    flipX: false,
    flipY: false
  };

  const state = {
    ...defaults,
    image: null,
    filename: 'edited-image'
  };

  const crop = {
    active: false,
    dragging: false,
    startX: 0,
    startY: 0,
    x: 0,
    y: 0,
    width: 0,
    height: 0
  };

  function updateLabels() {
    const suffixes = {
      brightness: '%',
      contrast: '%',
      saturation: '%',
      blur: 'px',
      sepia: '%',
      grayscale: '%',
      hue: '°'
    };

    for (const [key, suffix] of Object.entries(suffixes)) {
      const label = $(`${key}Value`);
      if (label) label.textContent = `${state[key]}${suffix}`;
    }
  }

  function getCanvasPoint(event) {
    const rect = canvas.getBoundingClientRect();

    return {
      x: (event.clientX - rect.left) * (canvas.width / rect.width),
      y: (event.clientY - rect.top) * (canvas.height / rect.height)
    };
  }

  function drawCropOverlay() {
    if (!crop.active) return;

    ctx.save();

    // تعتيم المنطقة خارج مستطيل القص.
    ctx.fillStyle = 'rgba(0, 0, 0, 0.48)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (crop.width > 0 && crop.height > 0) {
      ctx.clearRect(crop.x, crop.y, crop.width, crop.height);

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = Math.max(1, canvas.width / 600);
      ctx.setLineDash([8, 5]);
      ctx.strokeRect(crop.x, crop.y, crop.width, crop.height);
      ctx.setLineDash([]);

      // خطوط إرشادية داخل حدود القص.
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(crop.x + crop.width / 3, crop.y);
      ctx.lineTo(crop.x + crop.width / 3, crop.y + crop.height);
      ctx.moveTo(crop.x + (crop.width * 2) / 3, crop.y);
      ctx.lineTo(crop.x + (crop.width * 2) / 3, crop.y + crop.height);
      ctx.moveTo(crop.x, crop.y + crop.height / 3);
      ctx.lineTo(crop.x + crop.width, crop.y + crop.height / 3);
      ctx.moveTo(crop.x, crop.y + (crop.height * 2) / 3);
      ctx.lineTo(crop.x + crop.width, crop.y + (crop.height * 2) / 3);
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawImageToCanvas() {
    if (!state.image) return;

    const image = state.image;
    const scale = Math.min(900 / image.width, 600 / image.height, 1);
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));

    const angle = ((state.rotation % 360) + 360) % 360;
    const quarterTurn = angle === 90 || angle === 270;

    canvas.width = quarterTurn ? height : width;
    canvas.height = quarterTurn ? width : height;

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((state.rotation * Math.PI) / 180);
    ctx.scale(state.flipX ? -1 : 1, state.flipY ? -1 : 1);

    ctx.filter = [
      `brightness(${state.brightness}%)`,
      `contrast(${state.contrast}%)`,
      `saturate(${state.saturation}%)`,
      `blur(${state.blur}px)`,
      `sepia(${state.sepia}%)`,
      `grayscale(${state.grayscale}%)`,
      `hue-rotate(${state.hue}deg)`
    ].join(' ');

    ctx.drawImage(image, -width / 2, -height / 2, width, height);
    ctx.restore();

    emptyState.classList.add('hidden');
    imageInfo.textContent = `${canvas.width} × ${canvas.height}`;

    drawCropOverlay();
  }

  function setDefaults() {
    Object.assign(state, defaults);

    for (const [key, control] of Object.entries(controls)) {
      if (control) control.value = defaults[key];
    }

    updateLabels();

    document.querySelectorAll('.filter-btn').forEach((button) => {
      button.classList.toggle('active', button.dataset.filter === 'none');
    });

    if (state.image) {
      drawImageToCanvas();
    }
  }

  function applyFilter(name) {
    const preset = window.FILTER_PRESETS?.[name];

    if (!preset) {
      if (name === 'none') setDefaults();
      return;
    }

    for (const [key, value] of Object.entries(preset)) {
      if (
        key in defaults &&
        key !== 'rotation' &&
        key !== 'flipX' &&
        key !== 'flipY'
      ) {
        state[key] = value;
        if (controls[key]) controls[key].value = value;
      }
    }

    updateLabels();
    drawImageToCanvas();
  }

  function loadImage(file) {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('من فضلك اختر ملف صورة صالحًا.');
      return;
    }

    const reader = new FileReader();

    reader.onerror = () => {
      alert('تعذّرت قراءة الصورة.');
    };

    reader.onload = () => {
      const image = new Image();

      image.onerror = () => {
        alert('تعذّر تحميل الصورة.');
      };

      image.onload = () => {
        state.image = image;
        state.filename = file.name.replace(/\.[^/.]+$/, '') || 'edited-image';
        cancelCrop();
        setDefaults();
        drawImageToCanvas();
      };

      image.src = reader.result;
    };

    reader.readAsDataURL(file);
  }

  function downloadImage() {
    if (!state.image) {
      alert('ارفع صورة أولًا.');
      return;
    }

    canvas.toBlob((blob) => {
      if (!blob) {
        alert('تعذّر تجهيز الصورة للتنزيل.');
        return;
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = `${state.filename}-edited.png`;
      link.click();

      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, 'image/png');
  }

  function clearImage() {
    cancelCrop();

    state.image = null;
    state.filename = 'edited-image';

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = 900;
    canvas.height = 600;

    emptyState.classList.remove('hidden');
    imageInfo.textContent = 'لا توجد صورة';
    fileInput.value = '';

    setDefaults();
  }

  function startCrop() {
    if (!state.image) {
      alert('ارفع صورة أولًا قبل القص.');
      return;
    }

    if (crop.active) {
      cancelCrop();
      return;
    }

    crop.active = true;
    crop.dragging = false;
    crop.x = 0;
    crop.y = 0;
    crop.width = 0;
    crop.height = 0;

    canvas.classList.add('cropping');
    canvas.style.cursor = 'crosshair';

    if (startCropBtn) startCropBtn.textContent = 'إلغاء القص';

    drawImageToCanvas();
  }

  function cancelCrop() {
    crop.active = false;
    crop.dragging = false;
    crop.x = 0;
    crop.y = 0;
    crop.width = 0;
    crop.height = 0;

    canvas.classList.remove('cropping');
    canvas.style.cursor = '';

    if (startCropBtn) {
      startCropBtn.textContent =
        startCropBtn.dataset.originalText || 'بدء القص';
    }

    if (state.image) drawImageToCanvas();
  }

  function applyCrop() {
    if (!state.image) {
      alert('ارفع صورة أولًا قبل القص.');
      return;
    }

    if (!crop.active || crop.width < 2 || crop.height < 2) {
      alert('اضغط واسحب على الصورة لتحديد منطقة القص أولًا.');
      return;
    }

    const x = Math.max(0, Math.round(crop.x));
    const y = Math.max(0, Math.round(crop.y));
    const width = Math.min(canvas.width - x, Math.round(crop.width));
    const height = Math.min(canvas.height - y, Math.round(crop.height));

    if (width < 1 || height < 1) {
      alert('منطقة القص غير صالحة. حاول تحديد منطقة أكبر.');
      return;
    }

    const croppedCanvas = document.createElement('canvas');
    croppedCanvas.width = width;
    croppedCanvas.height = height;

    const croppedCtx = croppedCanvas.getContext('2d');
    croppedCtx.drawImage(canvas, x, y, width, height, 0, 0, width, height);

    const croppedImage = new Image();

    croppedImage.onload = () => {
      state.image = croppedImage;
      state.rotation = 0;
      state.flipX = false;
      state.flipY = false;

      cancelCrop();
      drawImageToCanvas();
    };

    croppedImage.src = cropped
