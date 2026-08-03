/**
 * High-performance Image Background Removal and Persistent Caching Utility
 * 
 * Performs edge-guided background segmentation to remove white/light backgrounds
 * surrounding product images while keeping internal white labels, printed text,
 * logos, and shadows intact.
 * 
 * Caches transparent PNG output in browser IndexedDB & memory for 0ms re-loads.
 */

const DB_NAME = 'SanjeevaniProductImageCacheDB';
const DB_VERSION = 1;
const STORE_NAME = 'transparent_images';

// In-memory cache for ultra-fast single session lookups
const memoryCache = new Map();
const pendingRequests = new Map();

/**
 * Initialize IndexedDB instance
 */
function openDB() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      resolve(null);
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
  });
}

/**
 * Get cached transparent image Data URL from IndexedDB
 */
async function getFromIndexedDB(key) {
  try {
    const db = await openDB();
    if (!db) return null;
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

/**
 * Save transparent image Data URL into IndexedDB
 */
async function saveToIndexedDB(key, value) {
  try {
    const db = await openDB();
    if (!db) return;
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.put(value, key);
  } catch (err) {
    console.warn('IndexedDB save failed:', err);
  }
}

/**
 * Load image as an HTMLImageElement with CORS crossOrigin setting
 */
function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => {
      // Retry without crossOrigin if CORS fails
      const imgFallback = new Image();
      imgFallback.onload = () => resolve(imgFallback);
      imgFallback.onerror = reject;
      imgFallback.src = url;
    };
    img.src = url;
  });
}

/**
 * Performs edge-guided seed flood fill to remove background surrounding product.
 * Preserves inner text, logos, labels, and fine details.
 */
function processCanvasBackground(img) {
  const canvas = document.createElement('canvas');
  const width = img.naturalWidth || img.width;
  const height = img.naturalHeight || img.height;

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, width, height);

  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // Sample edge pixels (borders) to get the background reference color
  let bgR = 255, bgG = 255, bgB = 255;
  let sampleCount = 0;
  let sumR = 0, sumG = 0, sumB = 0;

  // Sample top, bottom, left, right border pixels
  for (let x = 0; x < width; x += 2) {
    // Top row
    let idx = (0 * width + x) * 4;
    sumR += data[idx]; sumG += data[idx + 1]; sumB += data[idx + 2];
    sampleCount++;
    // Bottom row
    idx = ((height - 1) * width + x) * 4;
    sumR += data[idx]; sumG += data[idx + 1]; sumB += data[idx + 2];
    sampleCount++;
  }
  for (let y = 0; y < height; y += 2) {
    // Left column
    let idx = (y * width + 0) * 4;
    sumR += data[idx]; sumG += data[idx + 1]; sumB += data[idx + 2];
    sampleCount++;
    // Right column
    idx = (y * width + (width - 1)) * 4;
    sumR += data[idx]; sumG += data[idx + 1]; sumB += data[idx + 2];
    sampleCount++;
  }

  if (sampleCount > 0) {
    bgR = sumR / sampleCount;
    bgG = sumG / sampleCount;
    bgB = sumB / sampleCount;
  }

  // Create background mask (Uint8Array: 1 for background, 0 for foreground)
  const isBgMask = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  let qHead = 0;
  let qTail = 0;

  // Helper to check if a pixel matches background color profile
  const isBackgroundPixel = (r, g, b) => {
    // Distance from sample edge background
    const distSq = (r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2;
    // High brightness/luminance white check (R, G, B all high)
    const isBrightWhite = r > 215 && g > 215 && b > 215 && (Math.max(r, g, b) - Math.min(r, g, b)) < 30;
    // Near match to border background
    const isNearBorderBg = distSq < 3200;

    return isBrightWhite || isNearBorderBg;
  };

  // Seed outer border pixels into queue
  const enqueueSeed = (x, y) => {
    const pIdx = y * width + x;
    if (!isBgMask[pIdx]) {
      const dIdx = pIdx * 4;
      if (isBackgroundPixel(data[dIdx], data[dIdx + 1], data[dIdx + 2])) {
        isBgMask[pIdx] = 1;
        queue[qTail++] = pIdx;
      }
    }
  };

  // Enqueue 4 edges
  for (let x = 0; x < width; x++) {
    enqueueSeed(x, 0);
    enqueueSeed(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    enqueueSeed(0, y);
    enqueueSeed(width - 1, y);
  }

  // Flood fill algorithm
  while (qHead < qTail) {
    const currIdx = queue[qHead++];
    const cx = currIdx % width;
    const cy = Math.floor(currIdx / width);

    // 4-neighborhood
    const neighbors = [
      [cx + 1, cy],
      [cx - 1, cy],
      [cx, cy + 1],
      [cx, cy - 1]
    ];

    for (let i = 0; i < 4; i++) {
      const nx = neighbors[i][0];
      const ny = neighbors[i][1];

      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const nIdx = ny * width + nx;
        if (!isBgMask[nIdx]) {
          const dIdx = nIdx * 4;
          if (isBackgroundPixel(data[dIdx], data[dIdx + 1], data[dIdx + 2])) {
            isBgMask[nIdx] = 1;
            queue[qTail++] = nIdx;
          }
        }
      }
    }
  }

  // Apply transparency & smooth antialiased edges
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pIdx = y * width + x;
      const dIdx = pIdx * 4;

      if (isBgMask[pIdx] === 1) {
        // Completely remove background pixel
        data[dIdx + 3] = 0;
      } else {
        // Check adjacent pixels for edge feathering / antialiasing
        let bgNeighbors = 0;
        if (x > 0 && isBgMask[pIdx - 1]) bgNeighbors++;
        if (x < width - 1 && isBgMask[pIdx + 1]) bgNeighbors++;
        if (y > 0 && isBgMask[pIdx - width]) bgNeighbors++;
        if (y < height - 1 && isBgMask[pIdx + width]) bgNeighbors++;

        if (bgNeighbors > 0) {
          const r = data[dIdx];
          const g = data[dIdx + 1];
          const b = data[dIdx + 2];

          // Soft transition for fringe pixels
          const brightness = (r + g + b) / 3;
          if (brightness > 220) {
            // Feather white edge fringe to blend cleanly with dark theme
            const alphaFactor = 1 - ((brightness - 220) / 35) * (bgNeighbors / 4);
            data[dIdx + 3] = Math.max(0, Math.min(255, Math.floor(255 * alphaFactor)));
          }
        }
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);

  // Return PNG Data URL
  return canvas.toDataURL('image/png');
}

/**
 * Main API: Get transparent version of product image.
 * Uses memory cache -> IndexedDB cache -> canvas background removal -> save cache.
 */
export async function getTransparentProductImage(imageUrl) {
  if (!imageUrl) return '';

  // 1. Check in-memory cache
  if (memoryCache.has(imageUrl)) {
    return memoryCache.get(imageUrl);
  }

  // Check if a request for this URL is already processing
  if (pendingRequests.has(imageUrl)) {
    return pendingRequests.get(imageUrl);
  }

  const processPromise = (async () => {
    try {
      // 2. Check IndexedDB cache
      const cached = await getFromIndexedDB(imageUrl);
      if (cached) {
        memoryCache.set(imageUrl, cached);
        return cached;
      }

      // 3. Process image background
      const img = await loadImage(imageUrl);
      const transparentDataUrl = processCanvasBackground(img);

      // 4. Cache result persistently
      memoryCache.set(imageUrl, transparentDataUrl);
      await saveToIndexedDB(imageUrl, transparentDataUrl);

      return transparentDataUrl;
    } catch (err) {
      console.warn('Background removal fallback to original image:', err);
      // On error, return original URL
      memoryCache.set(imageUrl, imageUrl);
      return imageUrl;
    } finally {
      pendingRequests.delete(imageUrl);
    }
  })();

  pendingRequests.set(imageUrl, processPromise);
  return processPromise;
}

/**
 * Synchronous memory cache getter for instant initial renders
 */
export function getCachedTransparentImage(imageUrl) {
  return memoryCache.get(imageUrl) || null;
}

export default getTransparentProductImage;
