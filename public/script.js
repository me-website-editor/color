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

  // هذه العناصر موجودة في HTML المرسل.
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
    // يعتمد على FILTER_PRESETS المعرّف في filters.js إن كان موجودًا.
    const preset = window.FILTER_PRESETS?.[name];

    if (!preset) {
      // الفلتر الأصلي يعيد التعديلات إلى القيم الافتراضية.
      if (name === 'none') setDefaults();
      return;
    }

    for (const [key, value] of Object.entries(preset)) {
      if (key in defaults && key !== 'rotation' && key !== 'flipX' && key !== 'flipY') {
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

  // تحديث الصورة عند تغيير أدوات التعديل اليدوي.
  Object.entries(controls).forEach(([key, control]) => {
    if (!control) return;

    control.addEventListener('input', () => {
      state[key] = Number(control.value);
      updateLabels();
      drawImageToCanvas();
    });
  });

  fileInput.addEventListener('change', (event) => {
    loadImage(event.target.files?.[0]);
  });

  // دعم السحب والإفلات.
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

  // أزرار الفلاتر.
  document.querySelectorAll('.filter-btn').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach((item) => {
        item.classList.remove('active');
      });

      button.classList.add('active');
      applyFilter(button.dataset.filter);
    });
  });

  // التدوير والقلب وإعادة الضبط.
  document.querySelectorAll('.edit-tools [data-action]').forEach((button) => {
    button.addEventListener('click', () => {
      switch (button.dataset.action) {
        case 'rotateLeft':
          state.rotation -= 90;
          break;
        case 'rotateRight':
          state.rotation += 90;
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

      drawImageToCanvas();
    });
  });

  // التبويبات: موجودة أيضًا في HTML؛ هذا المعالج يضمن عملها هنا.
  document.querySelectorAll('.tool-tab-btn').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.tool-tab-btn').forEach((item) => {
        item.classList.remove('active');
      });

      document.querySelectorAll('.tool-section-content').forEach((section) => {
        section.classList.remove('active');
      });

      button.classList.add('active');

      const target = $(button.dataset.target);
      target?.classList.add('active');
    });
  });

  $('startCropBtn')?.addEventListener('click', () => {
    alert('أداة القص غير مفعّلة بعد.');
  });

  $('applyCropBtn')?.addEventListener('click', () => {
    alert('أداة القص غير مفعّلة بعد.');
  });

  downloadBtn?.addEventListener('click', downloadImage);
  resetBtn?.addEventListener('click', setDefaults);
  clearImageBtn?.addEventListener('click', clearImage);

  updateLabels();
})();
