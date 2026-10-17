const FILTER_PRESETS = {
  none:       { brightness: 100, contrast: 100, saturation: 100, sepia: 0, grayscale: 0 },
  grayscale:  { brightness: 100, contrast: 100, saturation: 0,   sepia: 0, grayscale: 100 },
  sepia:      { brightness: 100, contrast: 100, saturation: 80,  sepia: 100, grayscale: 0 },
  vivid:      { brightness: 110, contrast: 120, saturation: 145, sepia: 0, grayscale: 0 },
  soft:       { brightness: 108, contrast: 90,  saturation: 90,  sepia: 8, grayscale: 0 },
  bright:     { brightness: 125, contrast: 105, saturation: 110, sepia: 0, grayscale: 0 },
  matte:      { brightness: 105, contrast: 85,  saturation: 80,  sepia: 12, grayscale: 0 },
  pink:       { brightness: 108, contrast: 105, saturation: 115, sepia: 18, grayscale: 0 },
  warm:       { brightness: 105, contrast: 105, saturation: 110, sepia: 25, grayscale: 0 },
  cool:       { brightness: 100, contrast: 105, saturation: 110, sepia: 0, grayscale: 0 },
  vintage:    { brightness: 95,  contrast: 90,  saturation: 75,  sepia: 45, grayscale: 0 },
  dramatic:   { brightness: 95,  contrast: 135, saturation: 110, sepia: 0, grayscale: 0 },
  faded:      { brightness: 112, contrast: 78,  saturation: 75,  sepia: 10, grayscale: 0 },
  golden:     { brightness: 108, contrast: 110, saturation: 120, sepia: 35, grayscale: 0 },
  rose:       { brightness: 105, contrast: 100, saturation: 105, sepia: 28, grayscale: 0 },
  moody:      { brightness: 85,  contrast: 120, saturation: 85,  sepia: 5, grayscale: 0 },
  crisp:      { brightness: 103, contrast: 125, saturation: 115, sepia: 0, grayscale: 0 },
  pastel:     { brightness: 115, contrast: 82,  saturation: 75,  sepia: 8, grayscale: 0 },
  noir:       { brightness: 90,  contrast: 135, saturation: 0,   sepia: 0, grayscale: 100 },
  arctic:     { brightness: 108, contrast: 105, saturation: 85,  sepia: 0, grayscale: 0 },
  sunset:     { brightness: 105, contrast: 110, saturation: 130, sepia: 30, grayscale: 0 },
  fadedFilm:  { brightness: 108, contrast: 82,  saturation: 68,  sepia: 22, grayscale: 0 },
  punch:      { brightness: 105, contrast: 140, saturation: 135, sepia: 0, grayscale: 0 },
  dreamy:     { brightness: 118, contrast: 85,  saturation: 95,  sepia: 12, grayscale: 0 },
  natural:    { brightness: 103, contrast: 102, saturation: 105, sepia: 0, grayscale: 0 },
};

function applyPreset(presetName) {
  const preset = FILTER_PRESETS[presetName];
  if (!preset) return;

  if (typeof state !== "undefined") {
    Object.assign(state, preset);
  }

  if (typeof controls !== "undefined") {
    Object.keys(preset).forEach((key) => {
      if (controls[key]) controls[key].value = preset[key];
    });
  }

  if (typeof updateControlLabels === "function") updateControlLabels();
  if (typeof drawImageToCanvas === "function") drawImageToCanvas();
}
