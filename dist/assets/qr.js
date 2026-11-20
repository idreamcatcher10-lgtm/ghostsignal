import { encodePacket } from './codec.js';
export function qrCanvas(packet, pixels = 720) {
    if (!window.GhostQR)
        throw new Error('QR encoder is not loaded.');
    const qr = new window.GhostQR.QRCode(-1, window.GhostQR.correction.M);
    qr.addData(encodePacket(packet));
    qr.make();
    const count = qr.getModuleCount();
    const quiet = 4;
    const canvas = document.createElement('canvas');
    canvas.width = pixels;
    canvas.height = pixels;
    const ctx = canvas.getContext('2d');
    if (!ctx)
        throw new Error('Unable to render a QR image.');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, pixels, pixels);
    const cell = pixels / (count + quiet * 2);
    ctx.fillStyle = '#101b17';
    for (let row = 0; row < count; row++) {
        for (let col = 0; col < count; col++) {
            if (qr.isDark(row, col)) {
                const x1 = Math.round((col + quiet) * cell);
                const y1 = Math.round((row + quiet) * cell);
                const x2 = Math.round((col + quiet + 1) * cell);
                const y2 = Math.round((row + quiet + 1) * cell);
                ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
            }
        }
    }
    return canvas;
}
