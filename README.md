# TikTok Downloader

Một ứng dụng web miễn phí tải xuống nội dung TikTok không có logo. Dán link TikTok và lưu video ở chế độ HD, trích xuất âm thanh hoặc tải xuống hình ảnh - tất cả từ trình duyệt.

## Features

- **Video download** - Lưu video TikTok không có logo ở chất lượng tiêu chuẩn hoặc HD.
- **Audio extraction** - Tải nhạc nền của video xuống dưới dạng tệp MP3.
- **Photo carousels** - Tải xuống từng ảnh hoặc toàn bộ album từ bài đăng ảnh TikTok.
- **Instant preview** - Xem số liệu thống kê về tác giả, chú thích và mức độ tương tác của bài đăng trước khi tải xuống.

## Supported URLs

- Video - `https://www.tiktok.com/@user/video/<id>`
- Hình ảnh - `https://www.tiktok.com/@user/photo/<id>`
- Link rút gọn - `https://vm.tiktok.com/...`, `https://vt.tiktok.com/...`
- Link mobile - `https://m.tiktok.com/v/<id>`

## How to use

1. Mở ứng dụng hoặc trang web TikTok và sao chép link chia sẻ của bài đăng video hoặc ảnh.
2. Dán link vào thanh tìm kiếm trên trang Home.
3. Bấm vào nút **Download**, xem trước bài đăng, sau đó tải xuống với chất lượng bạn muốn hoặc tải xuống tất cả các bức ảnh.

## Tech stack

- [Vue 3](https://vuejs.org/) + [TypeScript](https://www.typescriptlang.org/)
- [Pinia](https://pinia.vuejs.org/) để quản lí state
- [Vite](https://vite.dev/) để xây dựng web
- [TikWM API](https://www.tikwm.com/) với tư cách là nhà cung cấp dữ liệu TikTok

## Project setup

Clone repo:

```sh
git clone https://github.com/nstcrystal/tiktok_download.git
cd tiktok_download
```

Cài đặt các dependencies:

```sh
npm install
```

Chạy môi trường phát triển:

```sh
npm run dev
```

Kiểm tra, biên dịch để sản xuất

```sh
npm run build
```

Xem trước bản dựng sản xuất

```sh
npm run preview
```
