interface DetectedBarcode { rawValue: string }
interface NativeBarcodeDetector {
  detect(source: HTMLVideoElement | HTMLImageElement | ImageBitmap): Promise<DetectedBarcode[]>;
}
interface NativeBarcodeConstructor {
  new (options?: { formats: string[] }): NativeBarcodeDetector;
  getSupportedFormats?(): Promise<string[]>;
}
type JSQRResult = { data: string } | null;
type JSQRDecoder = (data: Uint8ClampedArray, width: number, height: number, options?: { inversionAttempts?: 'attemptBoth' | 'dontInvert' }) => JSQRResult;

declare global {
  interface Window {
    BarcodeDetector?: NativeBarcodeConstructor;
    jsQR?: JSQRDecoder;
  }
}

export function canScanQr(): boolean {
  return typeof window.BarcodeDetector === 'function' || typeof window.jsQR === 'function';
}

function decodePixels(source: CanvasImageSource, width: number, height: number): string | null {
  if (!window.jsQR) return null;
  const limit = 900;
  const ratio = Math.min(1, limit / Math.max(width, height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width * ratio));
  canvas.height = Math.max(1, Math.round(height * ratio));
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('Canvas is unavailable for QR scanning.');
  context.drawImage(source, 0, 0, canvas.width, canvas.height);
  const image = context.getImageData(0, 0, canvas.width, canvas.height);
  return window.jsQR(image.data, image.width, image.height, { inversionAttempts: 'attemptBoth' })?.data ?? null;
}

type LoadedImage = {
  source: HTMLImageElement | ImageBitmap;
  width: number;
  height: number;
  release: () => void;
};
async function loadImage(file: File): Promise<LoadedImage> {
  if (!file.type.startsWith('image/')) throw new Error('Choose an image that contains a QR code.');
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file);
      return { source: bitmap, width: bitmap.width, height: bitmap.height, release: () => bitmap.close() };
    } catch { /* Older Safari: fall back to a normal image element. */ }
  }
  const objectUrl = URL.createObjectURL(file);
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({
      source: image, width: image.naturalWidth, height: image.naturalHeight,
      release: () => URL.revokeObjectURL(objectUrl),
    });
    image.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('Unable to read this QR image.')); };
    image.src = objectUrl;
  });
}

export async function decodeImage(file: File): Promise<string> {
  if (!canScanQr()) throw new Error('QR decoding is unavailable. Paste the GS1 packet in the import field.');
  const image = await loadImage(file);
  try {
    if (window.BarcodeDetector) {
      try {
        const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
        const results = await detector.detect(image.source);
        if (results.length) return results[0].rawValue;
      } catch {
        // Fall back to the bundled decoder when native detection fails.
      }
    }
    const decoded = decodePixels(image.source, image.width, image.height);
    if (!decoded) throw new Error('No readable QR code found. Try a sharper screenshot with the entire code visible.');
    return decoded;
  } finally {
    image.release();
  }
}

export class CameraScanner {
  private stream: MediaStream | null = null;
  private frame = 0;
  private busy = false;
  private running = false;

  async start(video: HTMLVideoElement, onResult: (value: string) => void, onError: (error: string) => void): Promise<void> {
    this.stop();
    if (!canScanQr()) throw new Error('QR scanning is unavailable. Paste a GS1 packet instead.');
    if (!navigator.mediaDevices?.getUserMedia) throw new Error('Camera requires HTTPS or localhost.');

    // Native detection saves battery; bundled jsQR covers Safari and Firefox.
    let nativeDetector: NativeBarcodeDetector | null = null;
    if (window.BarcodeDetector) {
      try { nativeDetector = new window.BarcodeDetector({ formats: ['qr_code'] }); }
      catch { /* Software decoder remains available. */ }
    }
    if (!nativeDetector && !window.jsQR) throw new Error('No usable QR decoder is available.');

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      video.srcObject = this.stream;
      video.setAttribute('playsinline', 'true');
      await video.play();
      this.running = true;
      let lastScan = 0;
      const scan = async (now: number) => {
        if (!this.running) return;
        this.frame = requestAnimationFrame(scan);
        if (this.busy || now - lastScan < 280 || video.readyState < 2) return;
        this.busy = true;
        lastScan = now;
        try {
          let value: string | null = null;
          if (nativeDetector) {
            try {
              const detected = await nativeDetector.detect(video);
              value = detected[0]?.rawValue ?? null;
            } catch {
              nativeDetector = null;
              if (!window.jsQR) throw new Error('Native camera QR detection failed on this browser.');
            }
          }
          if (!value && window.jsQR && video.videoWidth && video.videoHeight) {
            value = decodePixels(video, video.videoWidth, video.videoHeight);
          }
          if (value && this.running) {
            this.stop();
            onResult(value);
          }
        } catch (error) {
          if (this.running) {
            this.stop();
            onError(error instanceof Error ? error.message : 'QR scan failed.');
          }
        } finally { this.busy = false; }
      };
      this.frame = requestAnimationFrame(scan);
    } catch (error) {
      this.stop();
      if (error instanceof Error && error.name === 'NotAllowedError') {
        throw new Error('Camera access denied. Allow camera permission in browser settings.');
      }
      throw error;
    }
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.frame);
    this.stream?.getTracks().forEach(track => track.stop());
    this.stream = null;
  }
  isRunning(): boolean { return this.running; }
}
