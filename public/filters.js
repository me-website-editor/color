document.addEventListener("DOMContentLoaded", () => {
  const filterButtons = document.querySelectorAll(".filter-btn");
  const canvas = document.getElementById("editorCanvas");

  if (!canvas || filterButtons.length === 0) return;

  const ctx = canvas.getContext("2d");

  const filters = {
    none: "",
    grayscale: "grayscale(100%)",
    sepia: "sepia(100%)",
    vintage: "sepia(45%) contrast(90%) brightness(95%) saturate(80%)",
    noir: "grayscale(100%) contrast(140%) brightness(90%)",
    warm: "sepia(20%) saturate(125%)",
    cool: "hue-rotate(15deg) saturate(90%)",
    dramatic: "contrast(145%) saturate(110%)",
    faded: "contrast(80%) brightness(110%) saturate(75%)",
    vivid: "saturate(160%) contrast(110%)",
    sunset: "sepia(30%) hue-rotate(-15deg) saturate(140%)",
    ocean: "hue-rotate(25deg) saturate(115%) contrast(105%)",
    forest: "hue-rotate(-15deg) saturate(120%) contrast(105%)",
    retro: "sepia(35%) contrast(95%) saturate(85%)",
    cinema: "contrast(125%) saturate(85%) brightness(95%)",
    polaroid: "sepia(20%) contrast(90%) brightness(110%) saturate(85%)",
    soft: "contrast(85%) brightness(108%) saturate(90%)",
    bright: "brightness(120%) contrast(105%)",
    matte: "contrast(85%) brightness(105%) saturate(80%)",
    pink: "hue-rotate(-20deg) saturate(125%)"
  };

  let image = null;
  let selectedFilter = "none";

  function renderCanvas() {
    if (!image) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.filter = filters[selectedFilter] || "none";

    const scale = Math.min(width / image.width, height / image.height);
    const drawWidth = image.width * scale;
    const drawHeight = image.height * scale;
    const x = (width - drawWidth) / 2;
    const y = (height - drawHeight) / 2;

    ctx.drawImage(image, x, y, drawWidth, drawHeight);
    ctx.restore();
  }

  function loadCanvasImage() {
    try {
      image = new Image();
      image.onload = renderCanvas;
      image.src = canvas.toDataURL("image/png");
    } catch (error) {
      image = null;
    }
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      selectedFilter = button.dataset.filter || "none";

      filterButtons.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");

      renderCanvas();
    });
  });

  loadCanvasImage();

  const observer = new MutationObserver(() => {
    if (!image && canvas.width > 0 && canvas.height > 0) {
      loadCanvasImage();
    }
  });

  observer.observe(canvas, {
    attributes: true,
    attributeFilter: ["width", "height"]
  });
});
