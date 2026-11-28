/* Jr. Automation — Trợ lý tự động chăm sóc khách hàng.
   Chạy hoàn toàn trên trình duyệt: không cần server, không cần API key, không tốn phí.
   Muốn sửa câu trả lời: sửa mảng KB bên dưới (k = từ khoá, viết không dấu cũng được;
   a = câu trả lời; act = nút bấm; chips = gợi ý câu hỏi tiếp theo). */
(function () {
  "use strict";

  var script = document.currentScript;
  var BASE = script ? script.src.replace(/assets\/js\/chatbot\.js.*$/, "") : "";
  var STORE_KEY = "jrbot.v1";

  /* ---------- Thông tin liên hệ ---------- */
  var C = {
    phone: "0336 341 050",
    tel: "tel:+84336341050",
    zalo: "https://zalo.me/0336341050",
    fb: "https://web.facebook.com/cong.idol.773?locale=vi_VN",
    yt: "https://www.youtube.com/channel/UCqWKhlzt7eQtGVNYoNAj-9w",
    mail: "tuancongjr10@gmail.com",
    addr: "16i, đường Hiệp Thành 13, phường Tân Thới Hiệp, TP Hồ Chí Minh",
    maps: "https://www.google.com/maps/search/?api=1&query=16i%20%C4%90%C6%B0%E1%BB%9Dng%20Hi%E1%BB%87p%20Th%C3%A0nh%2013%2C%20T%C3%A2n%20Th%E1%BB%9Bi%20Hi%E1%BB%87p%2C%20H%E1%BB%93%20Ch%C3%AD%20Minh"
  };

  /* ---------- Nút bấm dùng lại nhiều lần ---------- */
  var ACT = {
    zalo: { t: "Nhắn Zalo " + C.phone, h: C.zalo, ext: 1, main: 1 },
    call: { t: "Gọi " + C.phone, h: C.tel },
    fb: { t: "Facebook Tuan Cong", h: C.fb, ext: 1 },
    mail: { t: "Gửi email", h: "mailto:" + C.mail },
    form: { t: "Gửi yêu cầu qua form", h: "lien-he.html#form", in: 1 },
    maps: { t: "Xem trên Google Maps", h: C.maps, ext: 1 },
    store: { t: "Xem Cửa hàng Vector", h: "vector-store.html", in: 1 },
    buy: { t: "Mở form đặt mua", h: "vector-store.html#dat-mua", in: 1 },
    upForm: { t: "Mở form nâng cấp", h: "vector-store.html#dat-mua", in: 1 },
    repair: { t: "Xem Sửa chữa & máy chủ", h: "vector-server.html", in: 1 },
    repairForm: { t: "Gửi tình trạng robot", h: "vector-server.html#gui-yeu-cau", in: 1 },
    serverWhat: { t: "Server riêng là gì?", h: "vector-server.html#server-la-gi", in: 1 },
    ai: { t: "Xem Lập trình AI", h: "lap-trinh-ai.html", in: 1 },
    aiForm: { t: "Gửi yêu cầu lập trình", h: "lap-trinh-ai.html#gui-yeu-cau", in: 1 },
    aiEx: { t: "Xem ví dụ triển khai", h: "lap-trinh-ai.html#vi-du", in: 1 },
    aiPlat: { t: "Xem nền tảng AI", h: "lap-trinh-ai.html#nen-tang-ai", in: 1 },
    xz: { t: "Xem cách tích hợp Xiaozhi", h: "lap-trinh-ai.html#xiaozhi", in: 1 },
    yt: { t: "Kênh YouTube", h: C.yt, ext: 1 },
    learn: { t: "Đọc trang Kiến thức", h: "kien-thuc.html", in: 1 },
    policy: { t: "Xem chính sách bảo hành, đổi trả", h: "chinh-sach.html", in: 1 }
  };

  /* ---------- Gợi ý câu hỏi (bấm là hỏi) ---------- */
  var CHIP = {
    services: "Shop làm những gì?",
    buy: "Mua robot Vector",
    upgrade: "Nâng cấp Vector đang có",
    repair: "Vector bị hỏng",
    server: "Vector không nghe lệnh",
    ai: "Lập trình AI cho robot",
    dog: "Chó robot",
    car: "Xe tự hành",
    loona: "Loona, EMO",
    price: "Giá bao nhiêu?",
    prepare: "Cần chuẩn bị gì?",
    models: "Nên chọn model AI nào?",
    xiaozhi: "Xiaozhi là gì?",
    aicost: "Dùng AI có tốn phí không?",
    offline: "AI chạy offline được không?",
    version: "Vector 1.0 hay 2.0?",
    process: "Quy trình làm việc",
    warranty: "Bảo hành bao lâu?",
    shipping: "Có ship tỉnh không?",
    address: "Địa chỉ ở đâu?",
    contact: "Liên hệ trực tiếp",
    about: "Jr. Automation là ai?"
  };
  var MAIN_CHIPS = ["buy", "repair", "ai", "price", "contact"];

  /* ---------- Bộ câu trả lời ---------- */
  function priceText(ctx) {
    var t = "Dạ, giá bên em báo riêng theo từng yêu cầu, rõ ràng trước khi làm. Trên web anh/chị không phải thanh toán gì.";
    var topic = ctx.hit.store || ctx.hit.buy || ctx.hit.upgrade ? "store"
      : ctx.hit.repair || ctx.hit.server ? "repair"
      : ctx.hit.ai || ctx.hit.dog || ctx.hit.car || ctx.hit.loona ? "ai" : ctx.last;
    if (topic === "store") t += "<br><br>Với robot Vector, giá tùy anh/chị mua robot cài sẵn hay nâng cấp robot đang có, model AI anh/chị chọn và số lượng.";
    else if (topic === "repair") t += "<br><br>Với sửa chữa và cài server, giá báo theo tình trạng robot sau khi em chẩn đoán lỗi.";
    else if (topic === "ai") t += "<br><br>Với lập trình AI, giá theo phạm vi dự án: loại robot, tính năng cần làm và model AI.";
    else t += "<ul><li>Robot Vector: tùy mua mới hay nâng cấp, model AI, số lượng.</li><li>Sửa chữa, cài server: báo theo tình trạng robot.</li><li>Lập trình AI: theo phạm vi dự án.</li></ul>";
    return t + (topic ? "<br><br>" : "") + "Anh/chị nhắn Zalo " + C.phone + " kèm mô tả ngắn, em báo giá nhanh nhất ạ.";
  }

  var KB = [
    { id: "human", k: ["gap nguoi", "nguoi that", "nhan vien", "tu van vien", "noi chuyen truc tiep", "chu shop", "chu cua hang", "goi lai cho toi", "goi lai cho minh", "goi lai cho em", "goi lai giup"],
      a: "Dạ, anh/chị muốn trao đổi trực tiếp với anh Tuan Cong Jr thì nhắn Zalo hoặc gọi " + C.phone + " ạ. Hoặc anh/chị để lại số điện thoại qua form, bên em sẽ gọi lại ngay.",
      act: ["zalo", "call", "form"] },
    { id: "greet", k: ["xin chao", "chao", "hello", "hi", "helo", "alo", "hey", "shop oi", "ad oi", "admin oi", "co ai khong", "ban oi", "anh oi", "chi oi", "em oi"], w: 0.6,
      a: "Dạ em chào anh/chị! Em là trợ lý tự động của Jr. Automation. Anh/chị cần em hỗ trợ việc gì ạ?",
      chips: MAIN_CHIPS },
    { id: "chot", k: ["chot", "chot don", "len don", "dat luon", "lay luon", "mua luon"], w: 2.5,
      a: "Dạ em xin cảm ơn anh/chị nhiều ạ. Anh/chị nhắn Zalo " + C.phone + " hoặc để lại số điện thoại qua form để em liên hệ chốt đơn và báo giá ạ.",
      act: ["zalo", "call", "form"], chips: [] },
    { id: "ack", k: [],
      a: "Dạ em xin cảm ơn anh/chị nhiều ạ.",
      act: ["zalo"], chips: [] },
    { id: "thanks", k: ["cam on", "thank", "thanks", "tks", "thank you", "ok cam on"],
      a: "Dạ không có gì ạ. Anh/chị cần thêm gì cứ hỏi em, hoặc nhắn Zalo " + C.phone + " để trao đổi trực tiếp với anh Tuan Cong Jr ạ.",
      act: ["zalo"] },
    { id: "bye", k: ["tam biet", "bye", "hen gap lai", "goodbye"],
      a: "Dạ em cảm ơn anh/chị đã ghé Jr. Automation. Khi cần, anh/chị nhắn Zalo " + C.phone + " cho em nhé ạ.",
      act: ["zalo"] },
    { id: "about", k: ["ban la ai", "gioi thieu", "jr automation", "jrautomation", "la ai", "cua ai", "tuan cong", "ai lam", "ai so huu", "thuong hieu"],
      a: "Dạ, Jr. Automation là thương hiệu của anh Tuan Cong Jr tại TP Hồ Chí Minh, chuyên robot Vector nói tiếng Việt, server riêng và phần mềm AI cho robot. Kênh YouTube Jr. Automation chia sẻ kiến thức về robot và AI.<br><br>Em là trợ lý tự động trên web. Cần trao đổi trực tiếp, anh/chị nhắn Zalo " + C.phone + " ạ.",
      act: ["zalo", "yt"], chips: ["services", "contact"] },
    { id: "services", k: ["dich vu", "lam gi", "nhan lam", "cung cap", "co nhung gi", "ban nhung gi", "nhung gi", "lam duoc gi", "ho tro gi"],
      a: "Dạ, bên em có ba dịch vụ chính:<ul><li><b>Cửa hàng Vector</b>: mua robot Vector cài sẵn tiếng Việt và AI, hoặc nâng cấp robot anh/chị đang có.</li><li><b>Sửa chữa & máy chủ Vector</b>: sửa phần cứng, cài server riêng, Việt hóa giọng nói, kết nối AI.</li><li><b>Lập trình AI cho robot</b>: chó robot, xe tự hành, robot thú cưng, robot tự chế; tích hợp Xiaozhi, ChatGPT, Gemini, DeepSeek.</li></ul>Anh/chị quan tâm mục nào ạ?",
      chips: ["buy", "upgrade", "repair", "ai"] },
    { id: "vectorwhat", topic: "store", k: ["vector la gi", "vector la robot gi", "robot vector la gi", "anki", "vector goc", "vector ai la gi", "vector ai khac gi", "khac gi"],
      a: "Dạ, Vector là robot để bàn nhỏ do Anki thiết kế: có camera, micro, cảm biến, màn hình mặt biểu cảm, tự di chuyển bằng bánh xích và nhận ra khuôn mặt.<br><br>Vector gốc không có sẵn tiếng Việt và cần máy chủ để nghe lệnh. Bản Vector AI bên em thêm giọng nói tiếng Việt, cho robot trò chuyện với model AI và chạy qua server riêng nên không phụ thuộc hãng ạ.",
      act: ["store"], chips: ["buy", "upgrade", "price"] },
    { id: "buy", topic: "store", k: ["mua", "dat mua", "dat hang", "ban robot", "mua robot", "vector ai", "order", "con hang", "co hang", "co ban", "ban vector", "mua vector", "muon mua", "robot vector"],
      a: "Dạ, robot Vector bên em sau khi cài sẽ:<ul><li>Nghe và nói tiếng Việt, kèm hướng dẫn sử dụng tiếng Việt.</li><li>Trò chuyện với AI: ChatGPT, DeepSeek, Xiaozhi hoặc model khác.</li><li>Luyện tiếng Anh cùng robot.</li><li>Điều khiển di chuyển từ xa bằng điện thoại.</li></ul>Gói mua robot cài sẵn gồm robot Vector, server riêng đã cấu hình, model AI anh/chị chọn và hướng dẫn sử dụng. Robot bảo hành 6 tháng, phần mềm bảo hành 3 tháng. Bên em ship toàn quốc, giá báo riêng theo yêu cầu ạ.",
      act: ["buy", "zalo"], chips: ["price", "warranty", "upgrade"] },
    { id: "upgrade", topic: "store", k: ["nang cap", "da co vector", "co san vector", "minh co vector", "toi co vector", "em co vector", "co vector roi"],
      a: "Dạ, anh/chị đã có Vector thì em nâng cấp ngay trên robot đó: cài và cấu hình server riêng, Việt hóa giọng nói, kết nối model AI anh/chị chọn, kèm hướng dẫn sử dụng tiếng Việt. Phần mềm bảo hành 3 tháng.<br><br>Trong form đặt mua, anh/chị chọn \"Nâng cấp robot của mình\" và nhắn thêm bản Vector, tình trạng robot để em xác nhận trước khi báo giá ạ.",
      act: ["upForm", "zalo"], chips: ["price", "prepare", "version"] },
    { id: "repair", topic: "repair", k: ["sua", "sua chua", "hong", "hu", "bi hu", "hu hong", "bi hong", "loi", "bi loi", "pin", "chai pin", "sac", "khong sac", "sac khong vao", "banh xich", "man hinh", "khong chay", "khong di chuyen", "khong len nguon", "khong mo", "liet", "dung im"],
      a: "Dạ, Vector bị lỗi pin, sạc không vào, bánh xích không chạy hay màn hình lỗi, bên em chẩn đoán đúng lỗi rồi báo giá trước khi sửa, sửa xong bảo hành 6 tháng ạ.<ol><li>Anh/chị gửi tình trạng robot qua form, ảnh và video nhắn thêm qua Zalo.</li><li>Em chẩn đoán, nói rõ phạm vi việc và chi phí.</li><li>Sửa theo phạm vi đã chốt.</li><li>Chạy thử cùng anh/chị rồi mới bàn giao.</li></ol>",
      act: ["repairForm", "zalo"], chips: ["server", "price", "address"] },
    { id: "server", topic: "repair", k: ["server", "sever", "may chu", "wire pod", "wirepod", "hey vector", "khong nghe", "khong nghe lenh", "khong phan hoi", "khong tra loi", "mat ket noi", "khong ket noi", "wifi", "wi fi", "escape pod", "ddl", "digital dream labs", "thue bao", "het han"],
      a: "Dạ, gọi \"Hey Vector\" mà robot không phản hồi thường là do robot không còn kết nối được máy chủ để hiểu giọng nói.<br><br>Bên em cài server riêng bằng Wire-Pod (phần mềm mã nguồn mở, miễn phí) chạy trên máy tính cũ hoặc Raspberry Pi cùng mạng Wi-Fi với robot. Vector nghe lệnh trở lại, không phụ thuộc máy chủ của hãng và nối được với model AI ạ.",
      act: ["repairForm", "serverWhat", "zalo"], chips: ["prepare", "version", "price"] },
    { id: "version", topic: "repair", k: ["1 0", "2 0", "ban nao", "phien ban", "vector 1", "vector 2", "doi nao", "ban cu", "ban moi"],
      a: "Dạ, Wire-Pod hoạt động với cả Vector 1.0 và 2.0. Anh/chị nhắn em bản Vector và tình trạng robot để em xác nhận trước khi báo giá ạ.",
      act: ["zalo"], chips: ["upgrade", "server", "price"] },
    { id: "vietnamese", topic: "store", k: ["tieng viet", "viet hoa", "noi tieng viet", "giong noi", "giong viet", "hieu tieng viet"],
      a: "Dạ, sau khi Việt hóa, Vector nghe và nói tiếng Việt: chào hỏi, hỏi đáp và ra lệnh bằng tiếng Việt, kèm hướng dẫn sử dụng tiếng Việt. Bên em làm được cho robot mua mới lẫn robot anh/chị đang có ạ.",
      act: ["store", "zalo"], chips: ["buy", "upgrade", "price"] },
    { id: "english", topic: "store", k: ["tieng anh", "luyen tieng anh", "hoc tieng anh", "english"],
      a: "Dạ, Vector chuyển sang tiếng Anh được để anh/chị luyện nghe và nói cùng robot. Tính năng này có trong gói Vector AI, cả khi mua mới lẫn nâng cấp robot đang có ạ.",
      chips: ["buy", "upgrade"] },
    { id: "remote", topic: "store", k: ["dieu khien", "tu xa", "bang dien thoai", "dieu khien tu xa", "app dieu khien"],
      a: "Dạ, sau khi cài, anh/chị dùng điện thoại điều khiển Vector di chuyển từ xa, không cần đứng cạnh robot ạ.",
      chips: ["buy", "upgrade"] },
    { id: "xiaozhi", k: ["xiaozhi", "xiao zhi", "tieu tri"], w: 1.5,
      a: "Dạ, Xiaozhi là nền tảng trợ lý giọng nói AI mã nguồn mở. Robot thu giọng nói, Xiaozhi chuyển thành chữ, nhờ model AI trả lời rồi đọc thành tiếng.<br><br>Bên em tích hợp Xiaozhi cho robot Vector và cho robot tự chế dùng bo ESP32-S3 ạ.",
      act: ["xz"], chips: ["models", "aicost", "ai"] },
    { id: "offline", k: ["offline", "khong can internet", "khong can mang", "khong co mang", "ollama", "chay o nha", "chay offline"], w: 1.5,
      a: "Dạ được ạ, khi model chạy trên máy tính trong nhà qua Ollama và robot kết nối với máy đó qua Wi-Fi. Cách này không tốn phí theo lượt và dữ liệu không rời khỏi nhà, nhưng máy cần đủ RAM.<br><br>Robot nhỏ dùng ESP32 không tự chạy được model lớn, nên vẫn cần máy tính đi kèm ạ.",
      chips: ["models", "aicost", "ai"] },
    { id: "aicost", k: ["ton phi", "mat phi", "phi ai", "phi hang thang", "mien phi", "free", "tra phi", "phi su dung", "phi duy tri", "ton tien"], w: 1.2,
      a: "Dạ, Xiaozhi là phần mềm mã nguồn mở. ChatGPT, Gemini và các model gọi qua API thường tính phí theo lượng dùng của nhà cung cấp. Model chạy offline qua Ollama không tốn phí theo lượt nhưng cần máy tính đủ mạnh.<br><br>Em nói rõ chi phí từng phương án khi báo giá để anh/chị chọn theo ngân sách ạ.",
      chips: ["models", "offline", "price"] },
    { id: "models", k: ["chatgpt", "chat gpt", "gpt", "openai", "deepseek", "gemini", "model", "mo hinh", "ai nao", "claude", "qwen", "llama", "tri tue nhan tao", "chon ai"],
      a: "Dạ, bên em kết nối được ChatGPT, DeepSeek, Gemini, Xiaozhi, Qwen hoặc model chạy offline qua Ollama. Mỗi model khác nhau về chi phí, tốc độ và chất lượng tiếng Việt. Em tư vấn theo ngân sách và việc anh/chị muốn robot làm ạ.",
      act: ["aiPlat"], chips: ["xiaozhi", "aicost", "offline"] },
    { id: "loona", topic: "ai", k: ["loona", "emo", "robot emo", "living ai", "keyi"], w: 3,
      a: "Dạ, <b>Loona</b> có chế độ lập trình kéo thả Google Blockly trong app, nên bên em viết được chuỗi động tác, trò chơi, kịch bản theo ý anh/chị và hướng dẫn bé học lập trình cùng Loona.<br><br><b>EMO</b> hiện chưa có SDK chính thức để lập trình. Em tư vấn khai thác tính năng có sẵn, hoặc làm robot để bàn kiểu EMO với AI và tiếng Việt theo ý anh/chị ạ.",
      act: ["aiForm", "zalo"], chips: ["ai", "price"] },
    { id: "dog", topic: "ai", kr: ["chó", "cún"], k: ["robot cho", "cho may", "cyberdog", "unitree", "go2", "bittle", "petoi", "4 chan", "bon chan", "servo"], w: 1.3,
      a: "Dạ, anh/chị có khung chó robot (ví dụ khung in 3D 12 servo) thì bên em viết phần mềm cho bo ESP32-S3 kết nối Xiaozhi AI:<ul><li>Dáng đi, tự đi, tránh vật cản, chống rơi mép bàn.</li><li>Động tác ngồi, bắt tay, chào khi nghe lệnh.</li><li>Sơ đồ đấu nối servo, cảm biến và nguồn.</li><li>Test và cân chỉnh online qua video call.</li></ul>Anh/chị tự chuẩn bị servo và linh kiện. Với CyberDog, Unitree Go2 bản EDU, Petoi Bittle, bên em lập trình qua SDK hoặc mã nguồn mở của hãng ạ.",
      act: ["aiEx", "aiForm", "zalo"], chips: ["price", "process"] },
    { id: "car", topic: "ai", k: ["xe tu hanh", "xe robot", "xe tu chay", "lidar", "do line", "tranh vat can", "ban do", "agv"], w: 1.3,
      a: "Dạ, bên em lập trình xe robot tự chạy:<ul><li>Tránh vật cản bằng cảm biến siêu âm, ToF hoặc LiDAR.</li><li>Đi theo người, dò line, quay về vị trí ban đầu.</li><li>Vẽ bản đồ phòng và tự đi tới điểm đã đặt với ROS 2.</li><li>Nhận lệnh nói qua Xiaozhi hoặc ChatGPT, ví dụ \"ra phòng khách\".</li></ul>Bản đồ và tự tìm đường cần LiDAR cùng máy tính nhúng như Raspberry Pi. Xe dùng ESP32 làm được tránh vật cản và lệnh thoại ạ.",
      act: ["aiEx", "aiForm", "zalo"], chips: ["price", "process"] },
    { id: "smarthome", topic: "ai", k: ["bat den", "tat den", "bat tat", "nha thong minh", "dieu khien den", "thiet bi trong nha", "smart home"], w: 1.2,
      a: "Dạ, robot ra lệnh bật tắt đèn và thiết bị trong nhà được, tùy loại robot và thiết bị anh/chị đang dùng. Anh/chị mô tả robot và thiết bị để em xem cách làm phù hợp ạ.",
      act: ["aiForm", "zalo"], chips: ["ai", "price"] },
    { id: "ai", topic: "ai", k: ["lap trinh", "phan mem", "phan mem ai", "robot tu che", "tu che", "esp32", "esp32 s3", "raspberry", "jetson", "ros", "ros 2", "robot thu cung", "viet code", "code", "firmware", "camera", "nhan dien", "robot khac", "robot cua hang", "sdk", "do an"],
      a: "Dạ, bên em nhận lập trình phần mềm AI theo yêu cầu cho chó robot, xe tự hành, robot thú cưng như Loona, EMO và robot tự chế:<ul><li>Giọng nói tiếng Việt, trò chuyện với AI.</li><li>Lệnh thoại riêng, camera nhận diện người và đồ vật.</li><li>Dáng đi, chuyển động, tránh vật cản.</li><li>Ra lệnh bật tắt thiết bị trong nhà.</li></ul>Để em báo giá nhanh, anh/chị cho em biết robot loại gì, robot cần làm gì và model AI mong muốn ạ.",
      act: ["aiForm", "aiEx", "zalo"], chips: ["dog", "car", "loona"] },
    { id: "price", k: ["gia", "bao nhieu", "chi phi", "bao gia", "nhieu tien", "bn tien", "gia ca", "bang gia", "gia re", "mac qua", "dat qua", "phi", "tien cong", "gia sao"], w: 1.1,
      a: priceText, act: ["zalo", "form"], chips: ["process", "contact"] },
    { id: "prepare", k: ["chuan bi", "can gi", "can nhung gi", "can co gi", "raspberry pi", "may tinh cu", "yeu cau gi", "can mua them"],
      a: function (ctx) {
        if (ctx.last === "ai") return "Dạ, để em báo giá nhanh, anh/chị cho em biết:<ul><li>Robot của anh/chị: chó robot, xe tự hành, Loona, EMO, robot hãng có SDK hay robot tự chế.</li><li>Robot cần làm gì: trò chuyện, nhận lệnh, di chuyển, nhận diện bằng camera, điều khiển thiết bị.</li><li>Model AI mong muốn, hoặc để em tư vấn.</li><li>Số lượng robot.</li></ul>";
        return "Dạ, với robot Vector, anh/chị cần một mạng Wi-Fi ở nhà. Server chạy trên một thiết bị cùng mạng với robot, như máy tính cũ hoặc Raspberry Pi. Em tư vấn phương án gọn và tiết kiệm điện nhất khi báo giá ạ.";
      },
      chips: ["price", "process", "contact"] },
    { id: "process", k: ["quy trinh", "cac buoc", "lam sao de", "cach dat", "dat nhu the nao", "bat dau the nao", "lam viec the nao", "cach thuc", "cach lam viec"],
      a: "Dạ, cách làm việc bên em:<ol><li>Anh/chị chọn dịch vụ và gửi yêu cầu qua form hoặc nhắn Zalo.</li><li>Em liên hệ lại, đề xuất phương án và báo giá rõ ràng.</li><li>Hai bên chốt rồi bên em thực hiện.</li><li>Chạy thử cùng anh/chị, bàn giao kèm hướng dẫn tiếng Việt.</li></ol>Anh/chị không cần tạo tài khoản hay thanh toán trước trên web ạ.",
      act: ["form", "zalo"], chips: ["price", "contact"] },
    { id: "time", k: ["bao lau", "mat bao lau", "may ngay", "bao nhieu ngay", "khi nao xong", "thoi gian lam", "tien do", "lam nhanh", "lay gap", "can gap"],
      a: "Dạ, thời gian tùy việc: sửa chữa phụ thuộc lỗi của robot, lập trình phụ thuộc phạm vi dự án. Em báo tiến độ cụ thể khi báo giá và bàn giao đúng tiến độ đã chốt. Cần gấp, anh/chị gọi hoặc nhắn Zalo " + C.phone + " ạ.",
      act: ["zalo", "call"] },
    { id: "payment", k: ["thanh toan", "chuyen khoan", "dat coc", "coc", "tra truoc", "tien mat", "tra gop", "hoa don"],
      a: "Dạ, trên web anh/chị không cần tạo tài khoản hay thanh toán trước. Sau khi em báo giá và hai bên chốt, cách thanh toán em trao đổi cụ thể với anh/chị qua Zalo ạ.",
      act: ["zalo", "policy"] },
    { id: "shipping", k: ["giao hang", "ship", "van chuyen", "tinh khac", "ngoai tinh", "gui hang", "nhan hang", "toan quoc", "ship toan quoc", "cod", "ship cod", "ha noi", "da nang", "o xa", "lam online", "ho tro online", "online"],
      a: "Dạ, bên em <b>ship toàn quốc</b>. Anh/chị ở tỉnh nào cũng đặt mua và trao đổi qua Zalo được. Với lập trình AI, em test và cân chỉnh online qua video call. Phí và thời gian giao hàng, em báo cụ thể khi chốt đơn ạ.",
      act: ["zalo", "policy"] },
    { id: "warranty", k: ["bao hanh", "bao hanh bao lau", "doi tra", "doi hang", "tra hang", "doi moi", "hoan tien", "dam bao", "chinh sach", "giao bi hu", "nhan bi hu", "bi vo"], w: 2,
      a: "Dạ, chính sách bảo hành bên em:<ul><li><b>Robot Vector</b>: bảo hành 6 tháng.</li><li><b>Sửa chữa</b>: bảo hành 6 tháng.</li><li><b>Phần mềm cho Vector và phần mềm AI</b>: bảo hành 3 tháng.</li></ul><b>Đổi trả trong 24 giờ</b> nếu robot có hư hỏng khi nhận hàng: anh/chị quay video hoặc chụp ảnh chỗ hư hỏng rồi nhắn Zalo cho em trong 24 giờ kể từ khi nhận ạ.",
      act: ["zalo", "policy"], chips: ["buy", "shipping", "contact"] },
    { id: "address", k: ["dia chi", "o dau", "cho nao", "chi duong", "ghe", "den xem", "toi xem", "cua hang o", "tan thoi hiep", "hiep thanh", "quan 12", "vi tri", "map", "maps"],
      a: "Dạ, địa chỉ bên em: " + C.addr + ".<br><br>Anh/chị nhắn Zalo trước khi ghé để em sắp xếp thời gian ạ.",
      act: ["maps", "zalo"] },
    { id: "hours", k: ["gio lam", "may gio", "mo cua", "dong cua", "gio mo", "luc nao", "chu nhat", "cuoi tuan", "buoi toi", "ban dem", "nua dem", "24 24", "24 7", "nhan khach", "gio nhan khach"],
      a: "Dạ, bên em nhận khách <b>24/24</b>. Anh/chị nhắn Zalo, gọi " + C.phone + " hoặc gửi form bất cứ lúc nào ạ.",
      act: ["zalo", "call"] },
    { id: "form", k: ["form", "gui yeu cau", "dien thong tin", "de lai so", "de lai thong tin", "dang ky"],
      a: "Dạ, mỗi trang dịch vụ có form ngắn, hoặc anh/chị dùng form ở trang Liên hệ. Em liên hệ lại qua số điện thoại hoặc Zalo anh/chị để lại ạ.",
      act: ["form", "buy", "repairForm", "aiForm"] },
    { id: "youtube", k: ["youtube", "video", "kenh", "kien thuc", "tai lieu", "huong dan su dung"],
      a: "Dạ, kênh YouTube Jr. Automation chia sẻ về robot và phần mềm AI. Trang Kiến thức có giải thích ngắn về Vector, server riêng, Xiaozhi và cách chọn model AI ạ.",
      act: ["yt", "learn"] },
    { id: "contact", k: ["lien he", "zalo", "so dien thoai", "sdt", "dien thoai", "goi", "facebook", "fb", "email", "mail", "gmail", "nhan tin", "inbox", "hotline", "lien lac"],
      a: "Dạ, anh/chị liên hệ anh Tuan Cong Jr qua:<ul><li>Zalo và điện thoại: <b>" + C.phone + "</b></li><li>Email: " + C.mail + "</li><li>Facebook: Tuan Cong</li><li>Địa chỉ: " + C.addr + "</li></ul>Nhắn Zalo thường nhanh nhất ạ.",
      act: ["zalo", "call", "fb", "mail"] }
  ];

  var BY_ID = {};
  KB.forEach(function (it) { BY_ID[it.id] = it; });

  /* ---------- Chuẩn hoá tiếng Việt: bỏ dấu, viết tắt ---------- */
  var ABBR = { ko: "khong", k: "khong", kh: "khong", hok: "khong", khum: "khong", hem: "khong", dc: "duoc", dk: "duoc", bn: "bao nhieu", sdt: "so dien thoai", j: "gi", ntn: "nhu the nao", vs: "voi", z: "vay", v: "vay", mk: "minh", mik: "minh", t: "toi", ib: "inbox", sp: "san pham", ae: "anh em", vt: "vector" };
  function norm(s) {
    s = String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d");
    s = s.replace(/[^a-z0-9]+/g, " ").trim();
    return s.split(" ").map(function (w) { return ABBR.hasOwnProperty(w) ? ABBR[w] : w; }).join(" ");
  }
  KB.forEach(function (it) { it.kn = it.k.map(norm); });

  /* Tin nhắn chỉ gồm các từ xác nhận ("ok", "oke nhé", "dạ được rồi"...) */
  var ACK = " ok oke okay okie oki okee okela okla oce vang da u uk um uhm roi duoc nhe nha nhen a shop ad admin ban em anh chi oi vay the thoi luon dong y nhieu ";
  function isAck(n) {
    var w = n.split(" ");
    return w.length <= 6 && w.some(function (x) { return /^(ok|oke|okay|okie|oki|okee|okela|okla|oce|vang|uk|u|um|uhm|duoc|roi|da)$/.test(x); }) &&
      w.every(function (x) { return ACK.indexOf(" " + x + " ") >= 0; });
  }

  function match(text) {
    var t = " " + norm(text) + " ", hit = {}, best = null, bestScore = 0;
    if (t.trim() && isAck(t.trim())) return { it: BY_ID.ack, hit: {} };
    var raw = " " + String(text || "").toLowerCase().normalize("NFC").replace(/[^\p{L}\p{N}]+/gu, " ") + " ";
    if (t.trim() === "") return null;
    KB.forEach(function (it) {
      var sc = 0;
      it.kn.forEach(function (kw) {
        if (kw && t.indexOf(" " + kw + " ") >= 0) sc += kw.split(" ").length;
      });
      (it.kr || []).forEach(function (kw) {
        if (raw.indexOf(" " + kw + " ") >= 0) sc += 2;
      });
      if (sc > 0) {
        sc *= it.w || 1;
        hit[it.id] = sc;
        if (sc > bestScore) { bestScore = sc; best = it; }
      }
    });
    /* "Xin chào, cho hỏi giá..." -> trả lời phần câu hỏi, không chỉ chào */
    if (best && best.id === "greet") {
      var other = null, os = 0;
      Object.keys(hit).forEach(function (id) { if (id !== "greet" && hit[id] > os) { os = hit[id]; other = BY_ID[id]; } });
      if (other) best = other;
    }
    /* Hỏi giá kèm tên dịch vụ -> ưu tiên trả lời giá */
    if (hit.price && best && best.id !== "price" && /^(buy|upgrade|repair|server|ai|dog|car|loona|vectorwhat)$/.test(best.id)) best = BY_ID.price;
    return best ? { it: best, hit: hit } : null;
  }

  /* ---------- Lưu hội thoại trong phiên (chuyển trang vẫn còn) ---------- */
  var state = { log: [], last: "", greeted: false, teased: false };
  try { var saved = JSON.parse(sessionStorage.getItem(STORE_KEY) || "null"); if (saved && saved.log) state = saved; } catch (e) {}
  function save() {
    try { state.log = state.log.slice(-40); sessionStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) {}
  }

  /* ---------- Giao diện ---------- */
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var coarse = window.matchMedia && matchMedia("(pointer: coarse)").matches;

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  var FACE = '<span class="jrbot__face" aria-hidden="true"><span class="jrbot__eye"></span><span class="jrbot__eye"></span></span>';
  var ICON_SEND = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M3.4 20.4 21 12 3.4 3.6 3.4 10.2 15 12 3.4 13.8z" fill="currentColor"/></svg>';
  var ICON_X = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>';
  var ICON_RE = '<svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4.5h4.5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  var root = el("div", "jrbot");
  root.innerHTML =
    '<div class="jrbot__teaser" hidden>' +
      '<button type="button" class="jrbot__teaser-text">Dạ em chào anh/chị! Anh/chị cần tư vấn robot Vector hay lập trình AI cho robot ạ?</button>' +
      '<button type="button" class="jrbot__teaser-x" aria-label="Ẩn lời chào">' + ICON_X + '</button>' +
    '</div>' +
    '<button type="button" class="jrbot__launcher" aria-expanded="false" aria-controls="jrbot-panel">' + FACE +
      '<span class="jrbot__launch-label">Hỏi trợ lý</span></button>' +
    '<section class="jrbot__panel" id="jrbot-panel" role="dialog" aria-labelledby="jrbot-title" hidden>' +
      '<header class="jrbot__head">' + FACE +
        '<div class="jrbot__who"><p class="jrbot__name" id="jrbot-title">Trợ lý Jr. Automation</p>' +
        '<p class="jrbot__sub">Trả lời tự động. Cần gấp, anh/chị nhắn Zalo ' + C.phone + '.</p></div>' +
        '<button type="button" class="jrbot__icon jrbot__restart" aria-label="Bắt đầu lại cuộc trò chuyện" title="Bắt đầu lại">' + ICON_RE + '</button>' +
        '<button type="button" class="jrbot__icon jrbot__close" aria-label="Đóng trợ lý" title="Đóng">' + ICON_X + '</button>' +
      '</header>' +
      '<div class="jrbot__log" role="log" aria-live="polite" aria-relevant="additions"></div>' +
      '<form class="jrbot__form" autocomplete="off">' +
        '<label class="jrbot__sr" for="jrbot-in">Nhập câu hỏi</label>' +
        '<input id="jrbot-in" class="jrbot__in" type="text" maxlength="300" placeholder="Anh/chị nhập câu hỏi tại đây" enterkeyhint="send">' +
        '<button type="submit" class="jrbot__send" aria-label="Gửi câu hỏi">' + ICON_SEND + '</button>' +
      '</form>' +
    '</section>';

  var launcher = root.querySelector(".jrbot__launcher");
  var panel = root.querySelector(".jrbot__panel");
  var log = root.querySelector(".jrbot__log");
  var form = root.querySelector(".jrbot__form");
  var input = root.querySelector(".jrbot__in");
  var teaser = root.querySelector(".jrbot__teaser");
  launcher.setAttribute("aria-label", "Mở trợ lý tư vấn");

  function href(a) { return a.in ? BASE + a.h : a.h; }

  function renderMsg(m) {
    var row = el("div", "jrbot__row jrbot__row--" + m.who);
    var bubble = el("div", "jrbot__msg jrbot__msg--" + m.who);
    if (m.who === "me") bubble.textContent = m.text; else bubble.innerHTML = m.html;
    row.appendChild(bubble);
    if (m.acts && m.acts.length) {
      var acts = el("div", "jrbot__acts");
      m.acts.forEach(function (key) {
        var a = typeof key === "string" ? ACT[key] : key;
        if (!a) return;
        var link = el("a", "jrbot__act" + (a.main ? " jrbot__act--main" : ""));
        link.textContent = a.t;
        link.href = href(a);
        if (a.ext) { link.target = "_blank"; link.rel = "noopener"; }
        if (a.copy) link.setAttribute("data-copy", a.copy);
        acts.appendChild(link);
      });
      row.appendChild(acts);
    }
    log.appendChild(row);
    return row;
  }

  function renderChips(ids) {
    var old = log.querySelector(".jrbot__chips");
    if (old) old.parentNode.removeChild(old);
    if (!ids || !ids.length) return;
    var wrap = el("div", "jrbot__chips");
    wrap.setAttribute("role", "group");
    wrap.setAttribute("aria-label", "Câu hỏi gợi ý");
    ids.forEach(function (id) {
      if (!CHIP[id]) return;
      var b = el("button", "jrbot__chip");
      b.type = "button";
      b.textContent = CHIP[id];
      b.setAttribute("data-intent", id);
      wrap.appendChild(b);
    });
    log.appendChild(wrap);
  }

  function scrollEnd() { log.scrollTop = log.scrollHeight; }

  function push(m, chips) {
    state.log.push(m);
    if (chips !== undefined) state.chips = chips;
    save();
    var row = renderMsg(m);
    renderChips(state.chips);
    /* Câu trả lời dài: cuộn tới đầu câu để khách đọc từ trên xuống */
    if (m.who === "bot" && log.scrollHeight - row.offsetTop > log.clientHeight) log.scrollTop = row.offsetTop - 12;
    else scrollEnd();
  }

  var busy = false;
  function botSay(m, chips) {
    busy = true;
    var old = log.querySelector(".jrbot__chips");
    if (old) old.parentNode.removeChild(old);
    var typing = el("div", "jrbot__row jrbot__row--bot jrbot__typing-row",
      '<div class="jrbot__msg jrbot__msg--bot jrbot__typing" aria-label="Đang trả lời"><i></i><i></i><i></i></div>');
    log.appendChild(typing);
    scrollEnd();
    var len = (m.html || "").replace(/<[^>]+>/g, "").length;
    setTimeout(function () {
      if (typing.parentNode) typing.parentNode.removeChild(typing);
      push(m, chips || []);
      busy = false;
    }, reduce ? 150 : Math.min(400 + len * 2, 1100));
  }

  function answer(it, ctx) {
    var html = typeof it.a === "function" ? it.a(ctx) : it.a;
    if (it.topic) state.last = it.topic;
    botSay({ who: "bot", html: html, acts: it.act || [], id: it.id }, it.chips || (it.id === "greet" ? MAIN_CHIPS : ["contact", "services"]));
  }

  function fallback(q) {
    var msg = q.slice(0, 500);
    botSay({
      who: "bot",
      html: "Dạ, câu này em chưa trả lời chắc chắn được ạ. Anh/chị gửi câu hỏi cho anh Tuan Cong Jr qua Zalo hoặc form để được trả lời chính xác. Anh/chị bấm nút Zalo, câu hỏi sẽ được chép sẵn, chỉ cần dán vào khung chat là xong ạ.",
      acts: [
        { t: "Nhắn Zalo " + C.phone, h: C.zalo, ext: 1, main: 1, copy: msg },
        { t: "Gửi câu hỏi qua form", h: "lien-he.html?msg=" + encodeURIComponent(msg) + "#form", in: 1 },
        "call"
      ],
      id: "fallback"
    }, MAIN_CHIPS);
  }

  function ask(text) {
    text = String(text || "").trim();
    if (!text || busy) return;
    push({ who: "me", text: text }, []);
    var r = match(text);
    if (!r) return fallback(text);
    answer(r.it, { hit: r.hit, last: state.last });
  }

  function greet() {
    state.greeted = true;
    botSay({
      who: "bot",
      html: "Dạ em chào anh/chị! Em là trợ lý tự động của <b>Jr. Automation</b>.<br><br>Bên em bán và nâng cấp robot Vector nói tiếng Việt, sửa chữa và cài server cho Vector, và lập trình phần mềm AI cho robot. Anh/chị cần em hỗ trợ việc gì ạ? Anh/chị chọn gợi ý bên dưới hoặc gõ câu hỏi nhé.",
      id: "hello"
    }, MAIN_CHIPS);
  }

  function restore() {
    log.innerHTML = "";
    state.log.forEach(renderMsg);
    renderChips(state.chips);
    scrollEnd();
  }

  /* ---------- Mở, đóng ---------- */
  function open() {
    hideTeaser(true);
    panel.hidden = false;
    root.classList.add("is-open");
    document.documentElement.classList.add("jrbot-open");
    launcher.setAttribute("aria-expanded", "true");
    if (!state.greeted) greet(); else scrollEnd();
    if (!coarse) setTimeout(function () { input.focus(); }, 30);
    else root.querySelector(".jrbot__close").focus();
  }
  function close() {
    panel.hidden = true;
    root.classList.remove("is-open");
    document.documentElement.classList.remove("jrbot-open");
    launcher.setAttribute("aria-expanded", "false");
    launcher.focus();
  }

  var teaseTimer, hideTimer;
  function hideTeaser(forever) {
    teaser.hidden = true;
    clearTimeout(teaseTimer); clearTimeout(hideTimer);
    if (forever) { state.teased = true; save(); }
  }

  launcher.addEventListener("click", function () { panel.hidden ? open() : close(); });
  root.querySelector(".jrbot__close").addEventListener("click", close);
  root.querySelector(".jrbot__restart").addEventListener("click", function () {
    if (busy) return;
    state.log = []; state.chips = []; state.last = ""; state.greeted = false;
    save(); log.innerHTML = ""; greet();
  });
  teaser.querySelector(".jrbot__teaser-text").addEventListener("click", open);
  teaser.querySelector(".jrbot__teaser-x").addEventListener("click", function () { hideTeaser(true); });
  panel.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var v = input.value;
    if (!v.trim() || busy) return;
    input.value = "";
    ask(v);
  });
  log.addEventListener("click", function (e) {
    var chip = e.target.closest(".jrbot__chip");
    if (chip) {
      if (busy) return;
      var id = chip.getAttribute("data-intent");
      push({ who: "me", text: chip.textContent }, []);
      var it = BY_ID[id];
      if (it) answer(it, { hit: {}, last: state.last });
      return;
    }
    var link = e.target.closest("a[data-copy]");
    if (link) {
      var text = link.getAttribute("data-copy");
      try {
        if (navigator.clipboard) navigator.clipboard.writeText(text).then(function () {
          if (!link.parentNode.querySelector(".jrbot__note")) {
            link.parentNode.appendChild(el("p", "jrbot__note", "Dạ em đã chép câu hỏi, anh/chị mở Zalo rồi dán vào khung chat là xong ạ."));
            scrollEnd();
          }
        }, function () {});
      } catch (err) {}
    }
  });

  /* ---------- Trang Liên hệ: điền sẵn câu hỏi khách gửi từ trợ lý ---------- */
  try {
    var q = new URLSearchParams(location.search).get("msg");
    var box = document.getElementById("c-nd");
    if (q && box && !box.value) box.value = "Câu hỏi gửi từ trợ lý trên web: " + q.slice(0, 500);
  } catch (e) {}

  function mount() {
    document.body.appendChild(root);
    restore();
    /* Lời chào nhỏ cạnh nút, hiện một lần mỗi phiên */
    if (!state.teased && !state.greeted) {
      teaseTimer = setTimeout(function () {
        if (!panel.hidden) return;
        teaser.hidden = false;
        hideTimer = setTimeout(function () { teaser.hidden = true; }, 15000);
        state.teased = true; save();
      }, 6000);
    }
  }
  if (document.body) mount(); else document.addEventListener("DOMContentLoaded", mount);

  /* Dùng khi kiểm thử: JRBot.match("giá sửa vector") */
  window.JRBot = { match: function (t) { var r = match(t); return r ? r.it.id : null; }, open: open, close: close };
})();
