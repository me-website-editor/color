(() => {
  const $ = (id) => document.getElementById(id);

  const canvas = $('editorCanvas');
  const fileInput = $('imageUpload');
  const emptyState = $('emptyState');
  const imageInfo = $('imageInfo');
  const downloadBtn = $('downloadBtn');
  const resetBtn = $('resetBtn');
  const generateSampleBtn = $('generateSample');
  const uploadLabel = document.querySelector('.upload-label');

  if (!canvas || !fileInput || !emptyState || !imageInfo ||
      !downloadBtn || !resetBtn || !uploadLabel) {
    console.error('تأكد من وجود عناصر المحرر المطلوبة في HTML.');
    return;
  }

  const ctx = canvas.getContext('2d');

  const controls = {
    brightness: $('brightness'),
    contrast: $('contrast'),
    saturation: $('saturation'),
    blur: $('blur'),
    sepia: $('sepia'),
    grayscale: $('grayscale'),
    hue: $('hue'),
    rotation: $('rotation'),
    zoom: $('zoom'),
    flipX: $('flipX'),
    flipY: $('flipY')
  };

  const valueLabels = {
    brightness: $('brightnessValue'),
    contrast: $('contrastValue'),
    saturation: $('saturationValue'),
    blur: $('blurValue'),
    sepia: $('sepiaValue'),
    grayscale: $('grayscaleValue'),
    hue: $('hueValue')
  };

  const DEFAULTS = {
    brightness: 100, contrast: 100, saturation: 100,
    blur: 0, sepia: 0, grayscale: 0, hue: 0,
    rotation: 0, zoom: 100, flipX: false, flipY: false
  };

  const state = {
    image: null,
    filename: 'edited-image',
    ...DEFAULTS
  };

  function updateLabels() {
    for (const key of Object.keys(valueLabels)) {
      if (!valueLabels[key]) continue;
      const suffix = key === 'blur' ? 'px' : key === 'hue' ? '°' : '%';
      valueLabels[key].textContent = `${state[key]}${suffix}`;
    }
  }

  function drawImage() {
    if (!state.image) return;

    const image = state.image;
    const ratio = Math.min(900 / image.width, 600 / image.height, 1);
    const width = Math.max(1, Math.round(image.width * ratio));
    const height = Math.max(1, Math.round(image.height * ratio));

    // تبديل أبعاد اللوحة عند التدوير 90 أو 270 درجة يمنع قص الصورة.
    const quarterTurn = Math.abs(state.rotation % 180) === 90;
    canvas.width = quarterTurn ? height : width;
    canvas.height = quarterTurn ? width : height;

    const zoom = state.zoom / 100;

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(state.rotation * Math.PI / 180);
    ctx.scale(state.flipX ? -1 : 1, state.flipY ? -1 : 1);
    ctx.filter =
      `brightness(${state.brightness}%) ` +
      `contrast(${state.contrast}%) ` +
      `saturate(${state.saturation}%) ` +
      `blur(${state.blur}px) ` +
      `sepia(${state.sepia}%) ` +
      `grayscale(${state.grayscale}%) ` +
      `hue-rotate(${state.hue}deg)`;

    ctx.drawImage(image, -(width * zoom) / 2, -(height * zoom) / 2,
      width * zoom, height * zoom);
    ctx.restore();

    emptyState.classList.add('hidden');
    imageInfo.textContent = `${canvas.width} × ${canvas.height}`;
  }

  function setControl(key, value) {
    if (!(key in DEFAULTS)) return;
    state[key] = value;

    const control = controls[key];
    if (!control) return;

    if (control.type === 'checkbox') control.checked = Boolean(value);
    else control.value = value;
  }

  function resetEditor() {
    for (const [key, value] of Object.entries(DEFAULTS)) {
      setControl(key, value);
    }
    updateLabels();

    document.querySelectorAll('.filter-btn').forEach((button) => {
      button.classList.toggle('active', button.dataset.filter === 'none');
    });

    drawImage();
  }

  function applyFilter(name) {
    const preset = window.FILTER_PRESETS?.[name];
    if (!preset) {
      console.warn(`الفِلتر "${name}" غير موجود في filters.js`);
      return;
    }

    for (const [key, value] of Object.entries(preset)) {
      setControl(key, value);
    }

    updateLabels();
    drawImage();
  }

  function syncFromControls() {
    for (const [key, control] of Object.entries(controls)) {
      if (!control) continue;
      state[key] = control.type === 'checkbox'
        ? control.checked
        : Number(control.value);
    }
    updateLabels();
    drawImage();
  }

  function loadFile(file) {
    if (!file || !file.type.startsWith('image/')) {
      alert('اختَر ملف صورة صالحًا.');
      return;
    }

    const reader = new FileReader();

    reader.onerror = () => alert('تعذّر قراءة الصورة.');
    reader.onload = () => {
      const image = new Image();

      image.onerror = () => alert('تعذّر تحميل الصورة.');
      image.onload = () => {
        state.image = image;
        state.filename = file.name.replace(/\.[^/.]+$/, '') || 'edited-image';
        drawImage();
      };
      image.src = reader.result;
    };

    reader.readAsDataURL(file);
  }

  function downloadImage() {
    if (!state.image) {
      alert('حمّل صورة أولًا.');
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
      URL.revokeObjectURL(url);
    }, 'image/png');
  }

  for (const [key, control] of Object.entries(controls)) {
    if (!control) {
      console.warn(`عنصر التحكم "${key}" غير موجود في HTML.`);
      continue;
    }
    control.addEventListener(
      control.type === 'checkbox' ? 'change' : 'input',
      syncFromControls
    );
  }

  fileInput.addEventListener('change', (event) => {
    loadFile(event.target.files?.[0]);
  });

  uploadLabel.addEventListener('dragover', (event) => {
    event.preventDefault();
    uploadLabel.classList.add('dragover');
  });

  uploadLabel.addEventListener('dragleave', () => {
    uploadLabel.classList.remove('dragover');
  });

  uploadLabel.addEventListener('drop', (event) => {
    event.preventDefault();
    uploadLabel.classList.remove('dragover');
    loadFile(event.dataTransfer.files?.[0]);
  });

  document.querySelectorAll('.filter-btn').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach((item) => {
        item.classList.remove('active');
      });
      button.classList.add('active');
      applyFilter(button.dataset.filter);
    });
  });

  downloadBtn.addEventListener('click', downloadImage);
  resetBtn.addEventListener('click', resetEditor);

  if (generateSampleBtn) {
    generateSampleBtn.addEventListener('click', () => {
      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.onload = () => {
        state.image = image;
        state.filename = 'sample-photo';
        drawImage();
      };
      image.onerror = () => alert('تعذّر تحميل الصورة التجريبية.');
      image.src =
        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80';
    });
  }

  updateLabels();
})();
