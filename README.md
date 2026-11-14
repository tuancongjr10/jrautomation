# Jr. Automation

Website giới thiệu dịch vụ lập trình PLC, HMI của Lê Tuấn Công. Trang tĩnh (HTML, CSS, JavaScript), không cần build, chạy miễn phí trên GitHub Pages.

- Zalo, điện thoại: 0336 341 050
- Email: tuancongjr10@gmail.com

## Cấu trúc

```
index.html            trang chủ (hero mô phỏng PLC, dịch vụ, dự án, quy trình, giới thiệu, hỏi đáp, liên hệ)
cam-on.html           trang hiện sau khi gửi form
404.html              trang báo lỗi
assets/css/style.css  giao diện
assets/js/main.js     menu điện thoại và mô phỏng mạch khởi động - dừng tự giữ
assets/fonts/         font Archivo, Be Vietnam Pro (tự host)
assets/img/           favicon, ảnh xem trước khi chia sẻ link
```

## Sửa nội dung

Mở `index.html`, tìm đoạn cần sửa (số điện thoại, địa chỉ, dự án, câu hỏi thường gặp), sửa rồi commit. GitHub Pages tự cập nhật sau khoảng 1 đến 2 phút.

## Form liên hệ

Form gửi qua FormSubmit (miễn phí) về email trong thuộc tính `action` của thẻ `<form>`. Lần gửi đầu tiên, FormSubmit gửi một email yêu cầu xác nhận về hộp thư đó. Bấm xác nhận một lần là các yêu cầu sau về thẳng hộp thư.

## Gắn tên miền riêng sau này (ví dụ jrautomation.vn)

Tên miền .vn có phí đăng ký hằng năm, không có gói miễn phí. Khi muốn dùng:

1. Mua tên miền ở nhà đăng ký bất kỳ (PA Vietnam, Mắt Bão, Nhân Hòa, Cloudflare Registrar cho tên miền quốc tế).
2. Trong repo này, tạo file `CNAME` chứa đúng một dòng: `jrautomation.vn`.
3. Ở trang quản lý DNS, trỏ bản ghi `CNAME` của `www` về `tuancongjr10.github.io`, và bản ghi `A` của tên miền gốc về 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153.
4. Vào Settings, Pages, bật Enforce HTTPS (GitHub cấp chứng chỉ SSL miễn phí).
5. Đổi địa chỉ trong `canonical`, `og:url`, `og:image`, `sitemap.xml`, `robots.txt` và đường dẫn trong `404.html` sang tên miền mới.

Có tên miền rồi, Cloudflare Email Routing cho phép tạo email dạng `lienhe@jrautomation.vn` và tự chuyển về Gmail, miễn phí.
