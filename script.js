// ===== ELEMENTS =====
const captureScreen = document.getElementById('capture-screen');
const detailsScreen = document.getElementById('details-screen');
const recordBtn = document.getElementById('record-btn');
const backBtn = document.getElementById('back-btn');
const createBtn = document.getElementById('create-btn');
const highContrastToggle = document.getElementById('high-contrast-toggle');
const titleInput = document.getElementById('title-input');
const descInput = document.getElementById('desc-input');
const titleCount = document.getElementById('title-count');
const descCount = document.getElementById('desc-count');
const galleryBtn = document.getElementById('gallery-btn');
const fileInput = document.getElementById('file-input');
const previewImg = document.getElementById('preview-img');
const mediaPreview = document.getElementById('media-preview');
const qualitySlider = document.getElementById('quality-slider');
const qualityValue = document.getElementById('quality-value');
const reoptimizeBtn = document.getElementById('reoptimize-btn');
const origSizeEl = document.getElementById('orig-size');
const optSizeEl = document.getElementById('opt-size');
const savedPctEl = document.getElementById('saved-pct');

// ===== STATE =====
let isRecording = false;
let originalFile = null;
let originalBlobUrl = null;
let optimizedBlob = null;
let currentQuality = 0.80;
let currentFormat = 'image/webp';
const MAX_DIMENSION = 1600;

// ===== HELPERS =====
function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Client-side image optimization:
 * 1. Resize so longest side ≤ MAX_DIMENSION
 * 2. Convert to chosen format (WebP preferred)
 * 3. Compress at selected quality
 */
async function optimizeImage(file, quality = currentQuality, format = currentFormat) {
  const img = await loadImageFromFile(file);

  let { width, height } = img;
  const scale = Math.min(1, MAX_DIMENSION / Math.max(width, height));
  width = Math.round(width * scale);
  height = Math.round(height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, width, height);

  const blob = await new Promise(resolve => {
    canvas.toBlob(resolve, format, quality);
  });

  URL.revokeObjectURL(img.src);
  return blob;
}

async function runOptimization() {
  if (!originalFile) return;

  reoptimizeBtn.textContent = 'Optimizing…';
  reoptimizeBtn.disabled = true;

  try {
    optimizedBlob = await optimizeImage(originalFile, currentQuality, currentFormat);

    if (originalBlobUrl) URL.revokeObjectURL(originalBlobUrl);
    originalBlobUrl = URL.createObjectURL(optimizedBlob);
    previewImg.src = originalBlobUrl;
    previewImg.hidden = false;
    mediaPreview.classList.add('has-image');

    const origSize = originalFile.size;
    const optSize = optimizedBlob.size;
    const saved = ((origSize - optSize) / origSize * 100).toFixed(0);

    origSizeEl.textContent = formatBytes(origSize);
    optSizeEl.textContent = formatBytes(optSize);
    savedPctEl.textContent = saved + '%';

  } catch (err) {
    console.error('Optimization failed', err);
    alert('Could not optimize image. Try another file.');
  } finally {
    reoptimizeBtn.textContent = 'Re-optimize';
    reoptimizeBtn.disabled = false;
  }
}

// ===== SCREEN SWITCHING =====
function showDetails() {
  captureScreen.classList.remove('active');
  detailsScreen.classList.add('active');
  setTimeout(() => titleInput.focus(), 100);
}

function showCapture() {
  detailsScreen.classList.remove('active');
  captureScreen.classList.add('active');
}

// ===== GALLERY / FILE PICKER =====
galleryBtn.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file || !file.type.startsWith('image/')) return;

  originalFile = file;
  await runOptimization();
  showDetails();
});

// ===== RECORD BUTTON =====
recordBtn.addEventListener('click', async () => {
  if (isRecording) return;

  isRecording = true;
  recordBtn.classList.add('recording');
  recordBtn.setAttribute('aria-label', 'Stop recording');

  setTimeout(async () => {
    isRecording = false;
    recordBtn.classList.remove('recording');
    recordBtn.setAttribute('aria-label', 'Start recording');

    try {
      const resp = await fetch('preview.jpg');
      const blob = await resp.blob();
      originalFile = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
      await runOptimization();
    } catch (err) {
      console.warn('Could not load preview for optimization', err);
    }

    showDetails();
  }, 900);
});

backBtn.addEventListener('click', showCapture);

// ===== QUALITY & FORMAT CONTROLS =====
qualitySlider.addEventListener('input', () => {
  currentQuality = qualitySlider.value / 100;
  qualityValue.textContent = qualitySlider.value;
});

document.querySelectorAll('input[name="format"]').forEach(radio => {
  radio.addEventListener('change', (e) => {
    currentFormat = e.target.value;
  });
});

reoptimizeBtn.addEventListener('click', runOptimization);

// ===== MODE TABS =====
document.querySelectorAll('.mode-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.mode-tab').forEach(t => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });
    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');
  });
});

// ===== TOOL BUTTONS =====
document.querySelectorAll('.tool-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.style.background = 'rgba(230, 0, 35, 0.3)';
    setTimeout(() => { btn.style.background = ''; }, 300);
  });
});

// ===== HIGH CONTRAST =====
highContrastToggle.addEventListener('click', () => {
  document.body.classList.toggle('high-contrast');
  const isOn = document.body.classList.contains('high-contrast');
  highContrastToggle.setAttribute('aria-label',
    isOn ? 'Disable high contrast mode' : 'Enable high contrast mode');
});

// ===== CHARACTER COUNTS =====
function updateCount(input, counter, max) {
  const len = input.value.length;
  counter.textContent = `${len}/${max}`;
  counter.style.color = len > max * 0.9 ? '#ff6b6b' : '';
}

titleInput.addEventListener('input', () => updateCount(titleInput, titleCount, 100));
descInput.addEventListener('input', () => updateCount(descInput, descCount, 800));

// ===== CREATE BUTTON =====
createBtn.addEventListener('click', () => {
  const title = titleInput.value.trim();
  const desc = descInput.value.trim();

  if (!title && !desc) {
    alert('Please add a title or description');
    titleInput.focus();
    return;
  }

  console.log('Uploading optimized image:', {
    size: optimizedBlob ? formatBytes(optimizedBlob.size) : 'none',
    type: currentFormat,
    quality: currentQuality
  });

  createBtn.textContent = 'Created \u2713';
  createBtn.style.background = 'var(--success)';

  setTimeout(() => {
    createBtn.textContent = 'Create';
    createBtn.style.background = '';
    titleInput.value = '';
    descInput.value = '';
    document.getElementById('link-input').value = '';
    document.getElementById('alt-text').value = '';
    document.getElementById('content-warnings').value = '';
    updateCount(titleInput, titleCount, 100);
    updateCount(descInput, descCount, 800);
    showCapture();
  }, 1400);
});

// ===== VOICE BUTTONS =====
document.querySelectorAll('.voice-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    alert('Voice input would start here (SpeechRecognition API)');
  });
});

// ===== KEYBOARD =====
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && detailsScreen.classList.contains('active')) {
    showCapture();
  }
});

console.log('Upload interface ready \u2013 client-side WebP/JPEG optimization enabled');
