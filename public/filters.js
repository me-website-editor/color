(() => {
  const FILTER_PRESETS = {
    none:      { brightness: 100, contrast: 100, saturation: 100, blur: 0, sepia: 0, grayscale: 0, hue: 0 },
    grayscale:{ brightness: 100, contrast: 110, saturation: 0,   blur: 0, sepia: 0, grayscale: 100, hue: 0 },
    sepia:    { brightness: 100, contrast: 100, saturation: 80,  blur: 0, sepia: 100, grayscale: 0, hue: 0 },
    vintage:  { brightness: 110, contrast: 85,  saturation: 70,  blur: 0, sepia: 40, grayscale: 0, hue: 0 },
    noir:     { brightness: 90,  contrast: 150, saturation: 0,   blur: 0, sepia: 0, grayscale: 100, hue: 0 },
    warm:     { brightness: 105, contrast: 105, saturation: 120, blur: 0, sepia: 20, grayscale: 0, hue: 15 },
    cool:     { brightness: 100, contrast: 105, saturation: 90,  blur: 0, sepia: 0, grayscale: 0, hue: 200 },
    dramatic: { brightness: 90,  contrast: 160, saturation: 110, blur: 0, sepia: 0, grayscale: 0, hue: 0 },
    faded:    { brightness: 120, contrast: 80,  saturation: 60,  blur: 0, sepia: 15, grayscale: 0, hue: 0 },
    vivid:    { brightness: 110, contrast: 130, saturation: 160, blur: 0, sepia: 0, grayscale: 0, hue: 0 },
    sunset:   { brightness: 105, contrast: 110, saturation: 130, blur: 0, sepia: 25, grayscale: 0, hue: 340 },
    ocean:    { brightness: 100, contrast: 110, saturation: 100, blur: 0, sepia: 0, grayscale: 0, hue: 190 },
    forest:   { brightness: 95,  contrast: 110, saturation: 120, blur: 0, sepia: 10, grayscale: 0, hue: 100 },
    retro:    { brightness: 110, contrast: 90,  saturation: 80,  blur: 0, sepia: 50, grayscale: 0, hue: 0 },
    cinema:   { brightness: 95,  contrast: 140, saturation: 90,  blur: 0, sepia: 10, grayscale: 0, hue: 0 },
    polaroid: { brightness: 115, contrast: 90,  saturation: 70,  blur: 0, sepia: 30, grayscale: 0, hue: 0 },
    amber:    { brightness: 105, contrast: 105, saturation: 115, blur: 0, sepia: 35, grayscale: 0, hue: 10 },
    arctic:   { brightness: 105, contrast: 110, saturation: 85,  blur: 0, sepia: 0, grayscale: 0, hue: 210 },
    rose:     { brightness: 105, contrast: 100, saturation: 110, blur: 0, sepia: 15, grayscale: 0, hue: 330 },
    mint:     { brightness: 105, contrast: 100, saturation: 105, blur: 0, sepia: 0, grayscale: 0, hue: 150 },
    matte:    { brightness: 110, contrast: 80,  saturation: 85,  blur: 0, sepia: 5, grayscale: 0, hue: 0 },
    punch:    { brightness: 100, contrast: 145, saturation: 135, blur: 0, sepia: 0, grayscale: 0, hue: 0 },
    soft:     { brightness: 108, contrast: 90,  saturation: 90,  blur: 0.3, sepia: 5, grayscale: 0, hue: 0 },
    dusty:    { brightness: 115, contrast: 85,  saturation: 65,  blur: 0, sepia: 20, grayscale: 0, hue: 5 },
    emerald:  { brightness: 100, contrast: 115, saturation: 125, blur: 0, sepia: 0, grayscale: 0, hue: 115 }
  };

  window.FILTER_PRESETS = FILTER_PRESETS;
})();
