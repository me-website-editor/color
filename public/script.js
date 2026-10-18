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
    const clearImageBtn = document.getElementById('clearImageBtn');

  if (!canvas || !ctx || !fileInput || !emptyState || !imageInfo) {
    console.error('بعض عناصر محرر الصور غير موجودة في HTML.');
    return;
  }

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

  const defaults = {
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    sepia: 0,
    grayscale: 0,
    hue: 0,
    rotation: 0,
    zoom: 100,
    flipX: false,
    flipY: false
  };

  const state = {
    ...defaults,
    image: null,
    filename: 'edited-image'
  };

  function updateLabels() {
    const labels = {
      brightness: '%',
      contrast: '%',
      saturation: '%',
      blur: 'px',
      sepia: '%',
      grayscale: '%',
      hue: '°'
    };

    for (const [key, suffix] of Object.entries(labels)) {
      const label = $(`${key}Value`);
      if (label) label.textContent = `${state[key]}${suffix}`;
    }
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

    ctx.drawImage(
      image,
      -(width * zoom) / 2,
      -(height * zoom) / 2,
      width * zoom,
      height * zoom
    );

    ctx.restore();
    emptyState.classList.add('hidden');
    imageInfo.textContent = `${canvas.width} × ${canvas.height}`;
  }

  function setControl(key, value) {
    state[key] = value;
    const control = controls[key];
    if (!control) return;

    if (control.type === 'checkbox') {
      control.checked = Boolean(value);
    } else {
      control.value = value;
    }
  }

  function setDefaults() {
    for (const [key, value] of Object.entries(defaults)) {
      setControl(key, value);
    }

    updateLabels();

    document.querySelectorAll('.filter-btn').forEach((button) => {
      button.classList.toggle('active', button.dataset.filter === 'none');
    });

    drawImageToCanvas();
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
    drawImageToCanvas();
  }

  function readControls() {
    for (const [key, control] of Object.entries(controls)) {
      if (!control) continue;

      state[key] = control.type === 'checkbox'
        ? control.checked
        : Number(control.value);
    }

    updateLabels();
    drawImageToCanvas();
  }

  function loadImage(file) {
    if (!file || !file.type.startsWith('image/')) {
      alert('من فضلك اختَر ملف صورة صالحًا.');
      return;
    }

    const reader = new FileReader();

    reader.onerror = () => alert('تعذّرت قراءة الصورة.');

    reader.onload = () => {
      const image = new Image();

      image.onerror = () => alert('تعذّر تحميل الصورة.');

      image.onload = () => {
        state.image = image;
        state.filename = file.name.replace(/\.[^/.]+$/, '') || 'edited-image';
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

  Object.entries(controls).forEach(([key, control]) => {
    if (!control) return;

    control.addEventListener(
      control.type === 'checkbox' ? 'change' : 'input',
      readControls
    );
  });

  fileInput.addEventListener('change', (event) => {
    loadImage(event.target.files?.[0]);
  });

  if (uploadLabel) {
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
      loadImage(event.dataTransfer.files?.[0]);
    });
  }

  document.querySelectorAll('.filter-btn').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach((item) => {
        item.classList.remove('active');
      });

      button.classList.add('active');
      applyFilter(button.dataset.filter);
    });
  });

  document.querySelectorAll('.edit-tools [data-action]').forEach((button) => {
    button.addEventListener('click', () => {
      switch (button.dataset.action) {
        case 'rotateLeft':
          state.rotation = Math.max(-180, state.rotation - 90);
          break;
        case 'rotateRight':
          state.rotation = Math.min(180, state.rotation + 90);
          break;
        case 'flipHorizontal':
          state.flipX = !state.flipX;
          break;
        case 'flipVertical':
          state.flipY = !state.flipY;
          break;
        case 'reset':
          setDefaults();
          return;
      }

      if (controls.rotation) controls.rotation.value = state.rotation;
      if (controls.flipX) controls.flipX.checked = state.flipX;
      if (controls.flipY) controls.flipY.checked = state.flipY;

      drawImageToCanvas();
    });
  });

  downloadBtn?.addEventListener('click', downloadImage);
  resetBtn?.addEventListener('click', setDefaults);

  updateLabels();
})();
