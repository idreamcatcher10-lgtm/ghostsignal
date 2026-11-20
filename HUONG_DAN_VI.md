# Hướng dẫn GhostSignal (Tiếng Việt)

## Đã có ứng dụng để chạy

Đây là dự án GhostSignal v0.1.0 đã xây dựng mã nguồn, giao diện và QR thật. Không cần Kiro credits để chạy bản demo này. Chưa có GitHub công khai và chưa có đường dẫn deploy thực tế.

### Cách chạy nhanh (không cần npm install)

1. Cài **Node.js 22+** từ https://nodejs.org/ (nếu chưa có).
2. Giải nén file ZIP dự án.
3. Mở Terminal tại thư mục `ghostsignal`.
4. Chạy:

```bash
node scripts/serve.mjs
```

5. Mở trình duyệt tại **http://127.0.0.1:4173**.

Bản build trong `dist/` đã có sẵn. Nếu muốn chỉnh sửa TypeScript: chạy `npm install`, `npm run dev` và `npm test`.

### Cách thử

- Bấm **Fill demo message** → **Generate signal**: tạo QR thật.
- Vào **Inbox**: xem tin đã lưu; bấm **View** → **Relay as QR** để chuyển tiếp.
- Vào **Receive / Scan**: máy có hỗ trợ `BarcodeDetector` có thể quét QR qua camera hoặc ảnh; nếu trình duyệt không hỗ trợ, bạn có thể dán chuỗi gói tin `GS1...` ở cuối màn hình.
- Bấm **Open large QR for scanning** để hiện QR lớn, thuận tiện cho máy khác quét.

### Đưa lên Internet

Upload toàn bộ **nội dung bên trong thư mục `dist/`** lên Cloudflare Pages, Vercel hoặc host tĩnh hỗ trợ HTTPS. Đường dẫn HTTPS là cần thiết để camera và PWA/service worker hoạt động đúng trên điện thoại. Khi đã deploy, thử mở trên hai điện thoại, sau đó bật chế độ máy bay và truyền tin bằng cách quét trực tiếp mã QR.

### Giới hạn cần biết

- Không tự truyền qua Bluetooth, Wi-Fi, mesh hay 4G. Người dùng phải cầm điện thoại tới gần nhau và quét QR.
- Tin nhắn **không mã hóa, không xác thực người gửi**. Không gửi mật khẩu hoặc dữ liệu nhạy cảm.
- Đây là prototype hackathon, không thay thế hệ thống liên lạc khẩn cấp thực tế.
- Tính năng quét camera tùy trình duyệt; luôn có cách nhập gói tin thủ công.

### Còn thiếu để đủ điều kiện nộp Kiroween

Cuộc thi **bắt buộc có sử dụng Kiro thật**, không phải chỉ có thư mục `.kiro`. Dự án này được tạo bên ngoài Kiro; các tài liệu `.kiro` hiện chỉ là tài liệu chuẩn bị. Khi credits về, mở project trong Kiro và dùng công cụ này để thực hiện những thay đổi thực tế, kiểm thử và lưu bằng chứng. Sau đó tạo GitHub public, deploy HTTPS, quay video YouTube, sửa lại Devpost theo chức năng đã xác minh.

Chi tiết: `docs/KIRO_HANDOFF.md`, `docs/DEVPOST_CHECKLIST.md`.
