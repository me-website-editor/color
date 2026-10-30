document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("editorCanvas");
  const ctx = canvas?.getContext("2d");
  const uploadInput = document.getElementById("imageUpload");
  const emptyState = document.getElementById("emptyState");
  const imageInfo = document.getElementById("imageInfo");
  const clearButton = document.getElementById("clearImageBtn");
  const sampleButton = document.getElementById("generateSample");

  if (!canvas || !ctx) return;

  const controls = {
    brightness: document.getElementById("brightness"),
    contrast: document.getElementById("contrast"),
    saturation: document.getElementById("saturation"),
    blur: document.getElementById("blur"),
    sepia: document.getElementById("sepia"),
    grayscale: document.getElementById("grayscale"),
    hue: document.getElementById("hue"),
    rotation: document.getElementById("rotation"),
    zoom: document.getElementById("zoom"),
    flipX: document.getElementById("flipX"),
    flipY: document.getElementById("flipY")
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

  const filterPresets = {
    none: {},
    grayscale: { grayscale: 100 },
    sepia: { sepia: 100 },
    vintage: { sepia: 45, contrast: 90, brightness: 95, saturation: 80 },
    noir: { grayscale: 100, contrast: 140, brightness: 90 },
    warm: { sepia: 20, saturation: 125 },
    cool: { hue: 15, saturation: 90 },
    dramatic: { contrast: 145, saturation: 110 },
    faded: { contrast: 80, brightness: 110, saturation: 75 },
    vivid: { saturation: 160, contrast: 110 },
    sunset: { sepia: 30, hue: 345, saturation: 140 },
    ocean: { hue: 25, saturation: 115, contrast: 105 },
    forest: { hue: 345, saturation: 120, contrast: 105 },
    retro: { sepia: 35, contrast: 95, saturation: 85 },
    cinema: { contrast: 125, saturation: 85, brightness: 95 },
    polaroid: { sepia: 20, contrast: 90, brightness: 110, saturation: 85 },
    soft: { contrast: 85, brightness: 108, saturation: 90 },
    bright: { brightness: 120, contrast: 105 },
    matte: { contrast: 85, brightness: 105, saturation: 80 },
    pink: { hue: 340, saturation: 125 }
  };

  let image = null;
  let imageUrl = null;
  let activePreset = "none";

  function getValue(name) {
    const control = controls[name];
    return control ? Number(control.value) : defaults[name];
  }

  function getFilterValues() {
    const preset = filterPresets[activePreset] || {};
    return {
      brightness: preset.brightness ?? getValue("brightness"),
      contrast: preset.contrast ?? getValue("contrast"),
      saturation: preset.saturation ?? getValue("saturation"),
      blur: getValue("blur"),
      sepia: preset.sepia ?? getValue("sepia"),
      grayscale: preset.grayscale ?? getValue("grayscale"),
      hue: preset.hue ?? getValue("hue")
    };
  }

  function updateValueLabels() {
    const labels = {
      brightness: `${getValue("brightness")}%`,
      contrast: `${getValue("contrast")}%`,
      saturation: `${getValue("saturation")}%`,
      blur: `${getValue("blur")}px`,
      sepia: `${getValue("sepia")}%`,
      grayscale: `${getValue("grayscale")}%`,
      hue: `${getValue("hue")}°`
    };

    Object.entries(labels).forEach(([name, value]) => {
      const output = document.getElementById(`${name}Value`);
      if (output) output.textContent = value;
    });
  }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!image) {
      if (emptyState) emptyState.hidden = false;
      if (imageInfo) imageInfo.textContent = "لا توجد صورة";
      return;
    }

    if (emptyState) emptyState.hidden = true;

    const values = getFilterValues();
    const rotation = (getValue("rotation") * Math.PI) / 180;
    const zoom = getValue("zoom") / 100;

    ctx.save();
    ctx.filter = [
      `brightness(${values.brightness}%)`,
      `contrast(${values.contrast}%)`,
      `saturate(${values.saturation}%)`,
      `blur(${values.blur}px)`,
      `sepia(${values.sepia}%)`,
      `grayscale(${values.grayscale}%)`,
      `hue-rotate(${values.hue}deg)`
    ].join(" ");

    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(rotation);
    ctx.scale(
      zoom * (controls.flipX?.checked ? -1 : 1),
      zoom * (controls.flipY?.checked ? -1 : 1)
    );

    const scale = Math.min(
      canvas.width / image.width,
      canvas.height / image.height
    );
    const drawWidth = image.width * scale;
    const drawHeight = image.height * scale;

    ctx.drawImage(
      image,
      -drawWidth / 2,
      -drawHeight / 2,
      drawWidth,
      drawHeight
    );

    ctx.restore();

    if (imageInfo) {
      imageInfo.textContent = `${image.naturalWidth} × ${image.naturalHeight}`;
    }
  }

  function loadImage(src) {
    const newImage = new Image();

    newImage.onload = () => {
      image = newImage;
      activePreset = "none";
      resetControls(false);
      updateValueLabels();
      updateActiveFilterButton();
      render();
    };

    newImage.onerror = () => {
      alert("تعذّر تحميل الصورة. جرّب اختيار صورة أخرى.");
    };

    newImage.src = src;
  }

  function resetControls(shouldRender = true) {
    Object.entries(defaults).forEach(([name, value]) => {
      const control = controls[name];
      if (!control) return;

      if (control.type === "checkbox") {
        control.checked = value;
      } else {
        control.value = value;
      }
    });

    activePreset = "none";
    updateValueLabels();
    updateActiveFilterButton();

    if (shouldRender) render();
  }

  function updateActiveFilterButton() {
    document.querySelectorAll(".filter-btn").forEach((button) => {
      button.classList.toggle(
        "active",
        button.dataset.filter === activePreset
      );
    });
  }

  function revokeCurrentUrl() {
    if (imageUrl && imageUrl.startsWith("blob:")) {
      URL.revokeObjectURL(imageUrl);
    }
    imageUrl = null;
  }

  uploadInput?.addEventListener("change", (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("يرجى اختيار ملف صورة.");
      uploadInput.value = "";
      return;
    }

    revokeCurrentUrl();
    imageUrl = URL.createObjectURL(file);
    loadImage(imageUrl);
  });

  document.querySelectorAll(".filter-btn").forEach((button) => {
    button.addEventListener("click", () => {
      activePreset = button.dataset.filter || "none";
      updateActiveFilterButton();
      render();
    });
  });

  Object.entries(controls).forEach(([name, control]) => {
    control?.addEventListener("input", () => {
      if (name !== "rotation" && name !== "zoom" && name !== "flipX" && name !== "flipY") {
        activePreset = "none";
        updateActiveFilterButton();
      }

      updateValueLabels();
      render();
    });

    control?.addEventListener("change", () => {
      updateValueLabels();
      render();
    });
  });

  document.querySelectorAll(".edit-tools button").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.action;

      if (action === "rotateLeft") {
        controls.rotation.value = Number(controls.rotation.value) - 90;
      } else if (action === "rotateRight") {
        controls.rotation.value = Number(controls.rotation.value) + 90;
      } else if (action === "flipHorizontal") {
        controls.flipX.checked = !controls.flipX.checked;
      } else if (action === "flipVertical") {
        controls.flipY.checked = !controls.flipY.checked;
      } else if (action === "reset") {
        resetControls();
        return;
      }

      updateValueLabels();
      render();
    });
  });

  clearButton?.addEventListener("click", () => {
    revokeCurrentUrl();
    image = null;
    if (uploadInput) uploadInput.value = "";
    resetControls(false);
    render();
  });

  sampleButton?.addEventListener("click", () => {
    const sampleImage =
      document.getElementById("heroPreview")?.src ||
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=90";

    revokeCurrentUrl();
    loadImage(sampleImage);
  });

  updateValueLabels();
  render();
});
