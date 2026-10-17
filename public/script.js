(function () {
  "use strict";

  const canvas = document.getElementById("editorCanvas");
  const ctx = canvas ? canvas.getContext("2d") : null;
  const fileInput = document.getElementById("imageUpload");
  const emptyState = document.getElementById("emptyState");
  const imageInfo = document.getElementById("imageInfo");
  const downloadBtn = document.getElementById("downloadBtn");
  const resetBtn = document.getElementById("resetBtn");

  const brightnessInput = document.getElementById("brightness");
  const brightnessValue = document.getElementById("brightnessValue");

  const presets = {
    none:      { brightness: 100, contrast: 100, saturation: 100, sepia: 0,   grayscale: 0 },
    grayscale: { brightness: 100, contrast: 100, saturation: 0,   sepia: 0,   grayscale: 100 },
    sepia:     { brightness: 100, contrast: 100, saturation: 80,  sepia: 100, grayscale: 0 },
    vivid:     { brightness: 110, contrast: 120, saturation: 145, sepia: 0,   grayscale: 0 },
    soft:      { brightness: 108, contrast: 90,  saturation: 90,  sepia: 8,   grayscale: 0 },
    bright:    { brightness: 125, contrast: 105, saturation: 110, sepia: 0,   grayscale: 0 },
    matte:     { brightness: 105, contrast: 85,  saturation: 80,  sepia: 12,  grayscale: 0 },
    pink:      { brightness: 108, contrast: 105, saturation: 115, sepia: 18,  grayscale: 0 },
    warm:      { brightness: 105, contrast: 105, saturation: 110, sepia: 25,  grayscale: 0 },
    cool:      { brightness: 100, contrast: 105, saturation: 110, sepia: 0,   grayscale: 0 },
    vintage:   { brightness: 95,  contrast: 90,  saturation: 75,  sepia: 45,  grayscale: 0 },
    dramatic:  { brightness: 95,  contrast: 135, saturation: 110, sepia: 0,   grayscale: 0 },
    faded:     { brightness: 112, contrast: 78,  saturation: 75,  sepia: 10,  grayscale: 0 },
    golden:    { brightness: 108, contrast: 110, saturation: 120, sepia: 35,  grayscale: 0 },
    rose:      { brightness: 105, contrast: 100, saturation: 105, sepia: 28,  grayscale: 0 },
    moody:     { brightness: 85,  contrast: 120, saturation: 85,  sepia: 5,   grayscale: 0 },
    crisp:     { brightness: 103, contrast: 125, saturation: 115, sepia: 0,   grayscale: 0 },
    pastel:    { brightness: 115, contrast: 82,  saturation: 75,  sepia: 8,   grayscale: 0 },
    noir:      { brightness: 90,  contrast: 135, saturation: 0,   sepia: 0,   grayscale: 100 },
    arctic:    { brightness: 108, contrast: 105, saturation: 85,  sepia: 0,   grayscale: 0 },
    sunset:    { brightness: 105, contrast: 110, saturation: 130, sepia: 30,  grayscale: 0 },
    fadedFilm: { brightness: 108, contrast: 82,  saturation: 68,  sepia: 22,  grayscale: 0 },
    punch:     { brightness: 105, contrast: 140, saturation: 135, sepia: 0,   grayscale: 0 },
    dreamy:    { brightness: 118, contrast: 85,  saturation: 95,  sepia: 12,  grayscale: 0 },
    natural:   { brightness: 103, contrast: 102, saturation: 105, sepia: 0,   grayscale: 0 },
  };

  const state = {
    image: null,
    filename: "edited-image",
    brightness: 100,
    contrast: 100,
    saturation: 100,
    sepia: 0,
    grayscale: 0,
  };

  function updateBrightnessLabel() {
    if (brightnessValue) {
      brightnessValue.textContent = `${state.brightness}%`;
    }
  }

  function drawImage() {
    if (!canvas || !ctx || !state.image) return;

    const image = state.image;
    const maxWidth = 900;
    const maxHeight = 600;
    const scale = Math.min(maxWidth / image.width, maxHeight / image.height, 1);
    const width = Math.round(image.width * scale);
    const height = Math.round(image.height * scale);

    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);
    ctx.filter = [
      `brightness(${state.brightness}%)`,
      `contrast(${state.contrast}%)`,
      `saturate(${state.saturation}%)`,
      `sepia(${state.sepia}%)`,
      `grayscale(${state.grayscale}%)`,
    ].join(" ");

    ctx.drawImage(image, 0, 0, width, height);
    ctx.filter = "none";

    if (emptyState) emptyState.classList.add("hidden");
    if (imageInfo) imageInfo.textContent = `${width} × ${height}`;
  }

  function applyPreset(name) {
    const preset = presets[name];
    if (!preset) return;

    Object.assign(state, preset);

    if (brightnessInput) {
      brightnessInput.value = state.brightness;
    }

    updateBrightnessLabel();
    drawImage();
  }

  function setActiveFilter(name) {
    document.querySelectorAll(".filter-btn").forEach((button) => {
      button.classList.toggle("active", button.dataset.filter === name);
    });
  }

  function loadImage(file) {
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      const image = new Image();

      image.onload = () => {
        state.image = image;
        state.filename = file.name.replace(/\.[^/.]+$/, "") || "edited";
        drawImage();
      };

      image.onerror = () => {
        alert("تعذر فتح الصورة. جرّب اختيار صورة أخرى.");
      };

      image.src = event.target.result;
    };

    reader.onerror = () => {
      alert("تعذر قراءة الملف. جرّب اختيار صورة أخرى.");
    };

    reader.readAsDataURL(file);
  }

  function downloadImage() {
    if (!canvas || !state.image) {
      alert("ارفع صورة أولاً قبل تحميلها.");
      return;
    }

    canvas.toBlob((blob) => {
      if (!blob) {
        alert("تعذر تجهيز الصورة للتحميل.");
        return;
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `${state.filename}-edited.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);
    }, "image/png");
  }

  function resetEditor() {
    applyPreset("none");
    setActiveFilter("none");
  }

  document.querySelectorAll(".filter-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const filterName = button.dataset.filter;
      setActiveFilter(filterName);
      applyPreset(filterName);
    });
  });

  if (fileInput) {
    fileInput.addEventListener("change", (event) => {
      loadImage(event.target.files && event.target.files[0]);
    });
  }

  if (brightnessInput) {
    brightnessInput.addEventListener("input", () => {
      state.brightness = Number(brightnessInput.value);
      updateBrightnessLabel();
      drawImage();
    });
  }

  if (downloadBtn) {
    downloadBtn.addEventListener("click", downloadImage);
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", resetEditor);
  }

  updateBrightnessLabel();
})();
