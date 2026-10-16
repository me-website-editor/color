const FILTER_PRESETS = {
  none: { brightness: 100 },
  grayscale: { brightness: 100 },
  sepia: { brightness: 100 },
  vivid: { brightness: 120 },
};

function applyPreset(presetName) {
  const preset = FILTER_PRESETS[presetName];
  if (!preset) return;
  if (typeof state !== 'undefined') {
    Object.assign(state, preset);
  }
  if (typeof controls !== 'undefined') {
    Object.keys(preset).forEach(k => { if (controls[k]) controls[k].value = preset[k]; });
  }
  if (typeof updateControlLabels === 'function') updateControlLabels();
  if (typeof drawImageToCanvas === 'function') drawImageToCanvas();
}