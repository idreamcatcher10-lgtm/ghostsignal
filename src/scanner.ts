interface DetectedBarcode { rawValue: string }
interface NativeBarcodeDetector { detect(source: HTMLVideoElement | HTMLImageElement | ImageBitmap): Promise<DetectedBarcode[]> }
interface NativeBarcodeConstructor { new (options?: { formats: string[] }): NativeBarcodeDetector; getSupportedFormats?(): Promise<string[]> }

declare global { interface Window { BarcodeDetector?: NativeBarcodeConstructor } }

export function canScanNatively(): boolean { return typeof window.BarcodeDetector === 'function'; }
export async function decodeImage(file: File): Promise<string> {
  if (!window.BarcodeDetector) throw new Error('This browser cannot scan image files. Use the packet import field below.');
  const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
  const bitmap = await createImageBitmap(file);
  try {
    const result = await detector.detect(bitmap);
    if (!result.length) throw new Error('No QR code found in the image. Try a sharper screenshot.');
    return result[0].rawValue;
  } finally { bitmap.close(); }
}

export class CameraScanner {
  private stream: MediaStream | null = null;
  private frame = 0;
  private busy = false;
  private running = false;
  async start(video: HTMLVideoElement, onResult: (value: string) => void, onError: (error: string) => void): Promise<void> {
    this.stop();
    if (!window.BarcodeDetector) throw new Error('Native QR camera scanning is not available in this browser. Use the packet import fallback.');
    if (!navigator.mediaDevices?.getUserMedia) throw new Error('Camera requires HTTPS or localhost.');
    const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } } });
      video.srcObject = this.stream;
      await video.play();
      this.running = true;
      let lastScan = 0;
      const scan = async (now: number) => {
        if (!this.running) return;
        this.frame = requestAnimationFrame(scan);
        if (this.busy || now - lastScan < 220 || video.readyState < 2) return;
        this.busy = true;
        lastScan = now;
        try {
          const values = await detector.detect(video);
          if (values.length) { this.stop(); onResult(values[0].rawValue); }
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Scan failed.';
          if (this.running) { this.stop(); onError(message); }
        } finally { this.busy = false; }
      };
      this.frame = requestAnimationFrame(scan);
    } catch (e) {
      this.stop();
      if (e instanceof Error && e.name === 'NotAllowedError') throw new Error('Camera access was denied. Allow camera access in browser settings.');
      throw e;
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
