# Jr. Automation

Website Jr. Automation của Tuan Cong: robot Vector tiếng Việt tích hợp AI, sửa chữa và cài server Vector, phần mềm NACHI, lập trình PLC và HMI. Trang tĩnh (HTML, CSS, JavaScript), không cần build, chạy miễn phí trên GitHub Pages.

- Zalo, điện thoại: 0336 341 050
- Email: tuancongjr10@gmail.com

## Cấu trúc

```
index.html            trang chủ: hero, ô chọn dịch vụ, cách đặt hàng
vector-store.html     Vector Robot Store: đặt mua robot Vector tiếng Việt tích hợp AI
vector-server.html    Vector Repair & Server: sửa chữa, cài server, kết nối AI, Việt hóa giọng nói
nachi.html            NACHI Robotics: hai gói phần mềm (100.000đ và 50.000đ)
plc-hmi.html          PLC & HMI Services: dịch vụ, dự án, quy trình, giới thiệu, hỏi đáp
kien-thuc.html        Kiến thức và kênh YouTube
lien-he.html          liên hệ và form chung (chọn sẵn dịch vụ bằng ?dv=vector|server|nachi|plc|doan|bangtai|khac)
cam-on.html           trang hiện sau khi gửi form
404.html              trang báo lỗi
assets/css/style.css  giao diện
assets/js/main.js     menu điện thoại, chọn sẵn gói trong form, mô phỏng mạch tự giữ ở trang PLC
assets/fonts/         font Archivo, Be Vietnam Pro (tự host)
assets/img/           logo, favicon, ảnh xem trước khi chia sẻ link
assets/img/vector/    ảnh robot Vector và áp phích Vector AI
```

## Sửa nội dung

Mở file trang tương ứng (ví dụ `nachi.html` để đổi giá, `vector-store.html` để đổi nội dung đặt mua), tìm đoạn cần sửa, sửa rồi commit. Menu và chân trang nằm trong từng file, khi đổi menu cần sửa ở cả 7 trang. GitHub Pages tự cập nhật sau khoảng 1 đến 2 phút.

## Form liên hệ

Các form (đặt mua Vector, sửa chữa và server, phần mềm NACHI, liên hệ chung) gửi qua FormSubmit (miễn phí) về email trong thuộc tính `action` của thẻ `<form>`. Lần gửi đầu tiên, FormSubmit gửi một email yêu cầu xác nhận về hộp thư đó. Bấm xác nhận một lần là các yêu cầu sau về thẳng hộp thư.

## Gắn tên miền riêng sau này (ví dụ jrautomation.vn)

Tên miền .vn có phí đăng ký hằng năm, không có gói miễn phí. Khi muốn dùng:

1. Mua tên miền ở nhà đăng ký bất kỳ (PA Vietnam, Mắt Bão, Nhân Hòa, Cloudflare Registrar cho tên miền quốc tế).
2. Trong repo này, tạo file `CNAME` chứa đúng một dòng: `jrautomation.vn`.
3. Ở trang quản lý DNS, trỏ bản ghi `CNAME` của `www` về `tuancongjr10.github.io`, và bản ghi `A` của tên miền gốc về 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153.
4. Vào Settings, Pages, bật Enforce HTTPS (GitHub cấp chứng chỉ SSL miễn phí).
5. Đổi địa chỉ trong `canonical`, `og:url`, `og:image`, `sitemap.xml`, `robots.txt` và đường dẫn trong `404.html` sang tên miền mới.

Có tên miền rồi, Cloudflare Email Routing cho phép tạo email dạng `lienhe@jrautomation.vn` và tự chuyển về Gmail, miễn phí.
