/* Jr. Automation — Trợ lý tự động chăm sóc khách hàng (bản 2).
   Chạy hoàn toàn trên trình duyệt: không cần server, không cần API key, không giới hạn tin nhắn.

   Cách chatbot "học": mỗi chủ đề trong KB có danh sách câu hỏi mẫu (ex). Khi khách gõ câu hỏi,
   chatbot so độ giống (theo từ, cặp từ và mẩu chữ) với tất cả câu mẫu, cộng thêm điểm từ khoá (k),
   rồi chọn chủ đề giống nhất. Không chắc thì đưa vài chủ đề gần nhất để khách chọn.

   Muốn dạy thêm: thêm câu hỏi mẫu vào "ex" của chủ đề tương ứng (viết tự nhiên như khách gõ).
   Muốn sửa câu trả lời: sửa "a". Nút bấm: "act". Câu hỏi gợi ý tiếp theo: "chips". */
(function (G) {
  "use strict";

  /* ================= THÔNG TIN LIÊN HỆ ================= */
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
  var Z = "Zalo " + C.phone;

  /* Câu trả lời cho việc cần chủ shop báo trực tiếp (chưa có trên web) */
  function owner(lead) {
    return lead + " Anh/chị nhắn " + Z + " để anh Tuan Cong Jr báo chính xác cho mình ạ.";
  }

  function priceText(ctx) {
    var t = "Dạ, giá bên em báo riêng theo từng yêu cầu, rõ ràng trước khi làm. Trên web anh/chị không phải thanh toán gì.";
    var h = ctx.hit || {};
    var topic = h.buy || h.upgrade || h.features || h.gift || h.kids ? "store"
      : h.repair || h.server || h.battery || h.wifi || h.charging || h.screen || h.wheels || h.recovery ? "repair"
      : h.ai || h.dog || h.car || h.loona || h.esp32 ? "ai" : ctx.last;
    if (topic === "store") t += "<br><br>Với robot Vector, giá tùy anh/chị mua robot cài sẵn hay nâng cấp robot đang có, model AI anh/chị chọn và số lượng.";
    else if (topic === "repair") t += "<br><br>Với sửa chữa và cài server, giá báo theo tình trạng robot sau khi em chẩn đoán lỗi.";
    else if (topic === "ai") t += "<br><br>Với lập trình AI, giá theo phạm vi dự án: loại robot, tính năng cần làm và model AI.";
    else t += "<ul><li>Robot Vector: tùy mua mới hay nâng cấp, model AI, số lượng.</li><li>Sửa chữa, cài server: báo theo tình trạng robot.</li><li>Lập trình AI: theo phạm vi dự án.</li></ul>";
    return t + (topic ? "<br><br>" : "") + "Anh/chị nhắn " + Z + " kèm mô tả ngắn, em báo giá nhanh nhất ạ.";
  }

  /* ================= BỘ KIẾN THỨC =================
     id: mã chủ đề · q: nhãn gợi ý · topic: nhóm dịch vụ (store/repair/ai) để hiểu câu hỏi nối tiếp
     k: từ khoá (viết không dấu) · kr: từ khoá có dấu · w: hệ số từ khoá · ex: câu hỏi mẫu */
  var KB = [
    /* ---------- Xã giao ---------- */
    { id: "greet", q: "Xin chào", w: 1,
      k: ["xin chao", "chao", "hello", "hi", "helo", "he lo", "helu", "alo", "hey", "shop oi", "robot oi", "ad oi", "admin oi", "co ai khong", "ban oi", "anh oi", "chi oi", "em oi"],
      ex: ["xin chào", "chào shop", "alo shop ơi", "hello ad", "có ai ở đó không", "chào em", "hi", "shop ơi cho hỏi", "helo shop", "chào bạn", "cho mình hỏi chút", "hế lô shop", "robot ơi"],
      a: "Dạ em chào anh/chị! Em là trợ lý tự động của Jr. Automation. Anh/chị cần em hỗ trợ việc gì ạ?" },
    { id: "chot", q: "Chốt đơn", w: 2.5,
      k: ["chot", "chot don", "len don", "dat luon", "lay luon", "mua luon", "lay 1 con", "lay mot con"],
      ex: ["chốt đơn", "ok chốt luôn", "lên đơn cho mình", "lấy luôn 1 con", "mình chốt nhé", "đặt luôn em ơi"],
      a: "Dạ em xin cảm ơn anh/chị nhiều ạ. Anh/chị nhắn " + Z + " hoặc để lại số điện thoại qua form để em liên hệ chốt đơn và báo giá ạ.",
      act: ["zalo", "call", "form"], chips: [] },
    { id: "ack", q: "Ok", k: [], ex: [], a: "Dạ em xin cảm ơn anh/chị nhiều ạ.", act: ["zalo"], chips: [] },
    { id: "thanks", q: "Cảm ơn",
      k: ["cam on", "thank", "thanks", "tks", "thank you", "ok cam on", "cam on nhieu"],
      ex: ["cảm ơn em", "cám ơn shop nhiều", "thanks bạn", "ok cảm ơn nhé", "tks ad"],
      a: "Dạ không có gì ạ. Anh/chị cần thêm gì cứ hỏi em, hoặc nhắn " + Z + " để trao đổi trực tiếp với anh Tuan Cong Jr ạ.",
      act: ["zalo"] },
    { id: "bye", q: "Tạm biệt",
      k: ["tam biet", "bye", "hen gap lai", "goodbye", "pp"],
      ex: ["tạm biệt", "bye shop", "hẹn gặp lại nhé", "thôi mình đi đây"],
      a: "Dạ em cảm ơn anh/chị đã ghé Jr. Automation. Khi cần, anh/chị nhắn " + Z + " cho em nhé ạ.",
      act: ["zalo"] },
    { id: "botme", q: "Em là người hay máy?",
      k: ["la bot", "la may", "voi may", "noi chuyen voi may", "nguoi that khong", "nguoi that dang", "dang chat", "chatbot", "tra loi tu dong", "ai dang tra loi"],
      ex: ["bạn là người thật hay bot vậy", "đây là chatbot à", "ai đang trả lời mình vậy", "em là máy hả", "có phải trả lời tự động không", "có phải người thật đang chat không", "mình đang chat với máy à"],
      a: "Dạ, em là trợ lý tự động trên web, trả lời các câu hỏi thường gặp. Câu nào cần tư vấn kỹ, anh Tuan Cong Jr sẽ trả lời trực tiếp qua " + Z + " ạ.",
      act: ["zalo"] },
    { id: "human", q: "Gặp người tư vấn",
      k: ["gap nguoi", "voi nguoi that", "nhan vien", "tu van vien", "can tu van", "muon tu van", "noi chuyen truc tiep", "gap chu shop", "gap chu cua hang", "goi lai cho toi", "goi lai cho minh", "goi lai cho em", "goi lai giup", "tu van truc tiep"],
      ex: ["cho mình gặp nhân viên tư vấn", "muốn nói chuyện với người thật", "gọi lại cho mình được không", "cho xin gặp chủ shop", "cần tư vấn trực tiếp"],
      a: "Dạ, anh/chị muốn trao đổi trực tiếp với anh Tuan Cong Jr thì nhắn Zalo hoặc gọi " + C.phone + " ạ. Hoặc anh/chị để lại số điện thoại qua form, bên em sẽ gọi lại.",
      act: ["zalo", "call", "form"] },
    { id: "complain", q: "Góp ý", w: 1.5,
      k: ["khong hieu", "tra loi sai", "sai roi", "vo dung", "te qua", "chan qua", "bot ngu", "khong dung y", "ky vay", "ky qua", "tra loi gi ky", "shop khong tra loi", "ad khong tra loi", "sao khong tra loi", "tra loi cham", "cham tra loi", "lau tra loi"],
      ex: ["bạn trả lời sai rồi", "không hiểu gì hết", "trả lời không đúng ý mình", "chatbot dở quá", "hỏi mãi không được", "trả lời gì kỳ vậy", "sao shop không rep tin nhắn"],
      a: "Dạ em xin lỗi vì chưa phản hồi đúng ý anh/chị ạ. Anh/chị nhắn " + Z + " để anh Tuan Cong Jr hỗ trợ trực tiếp nhé. Do tin nhắn nhiều, bên em phản hồi nhanh nhất trong khoảng 19h đến 23h, mong anh/chị thông cảm ạ.",
      act: ["zalo", "call"] },
    { id: "compliment", q: "Khen", w: 2,
      k: ["de thuong qua", "hay qua", "xin qua", "tuyet voi", "dep qua", "cute"],
      ex: ["robot dễ thương quá", "web đẹp quá", "hay quá shop ơi", "xịn ghê", "con robot cute ghê"],
      a: "Dạ em cảm ơn anh/chị nhiều ạ! Anh/chị muốn xem robot Vector nói tiếng Việt hay lập trình AI cho robot của mình ạ?",
      chips: ["buy", "ai", "features"] },

    /* ---------- Giới thiệu, liên hệ ---------- */
    { id: "about", q: "Jr. Automation là ai?",
      k: ["gioi thieu", "jr automation", "jrautomation", "cua ai", "tuan cong", "ai so huu", "thuong hieu", "la chu shop", "chu shop la ai", "ai la chu"],
      ex: ["Jr. Automation là gì", "giới thiệu về shop đi", "shop của ai vậy", "Tuan Cong Jr là ai", "bên bạn là công ty gì", "ai là chủ shop này"],
      a: "Dạ, Jr. Automation là thương hiệu của anh Tuan Cong Jr tại TP Hồ Chí Minh, chuyên robot Vector nói tiếng Việt, server riêng và phần mềm AI cho robot. Kênh YouTube Jr. Automation chia sẻ kiến thức về robot và AI.<br><br>Em là trợ lý tự động trên web. Cần trao đổi trực tiếp, anh/chị nhắn " + Z + " ạ.",
      act: ["zalo", "yt"], chips: ["services", "trust", "contact"] },
    { id: "services", q: "Shop làm những gì?",
      k: ["dich vu", "nhan lam", "cung cap", "co nhung gi", "ban nhung gi", "ho tro gi", "kinh doanh gi", "chuyen ve", "chuyen gi", "shop lam gi", "ben ban lam gi", "nhung viec gi", "nhan viec gi", "nhan nhung"],
      ex: ["bên bạn làm dịch vụ gì", "shop bán gì vậy", "có những dịch vụ nào", "nhận làm những gì", "bên em hỗ trợ được gì", "shop chuyên về mảng gì", "bên bạn nhận những việc gì"],
      a: "Dạ, bên em có ba dịch vụ chính:<ul><li><b>Cửa hàng Vector</b>: mua robot Vector cài sẵn tiếng Việt và AI, hoặc nâng cấp robot anh/chị đang có.</li><li><b>Sửa chữa & máy chủ Vector</b>: sửa phần cứng, cài server riêng, Việt hóa giọng nói, kết nối AI.</li><li><b>Lập trình AI cho robot</b>: chó robot, xe tự hành, robot thú cưng, robot tự chế; tích hợp Xiaozhi, ChatGPT, Gemini, DeepSeek.</li></ul>Anh/chị quan tâm mục nào ạ?",
      chips: ["buy", "upgrade", "repair", "ai"] },
    { id: "trust", q: "Mua có an toàn không?",
      k: ["uy tin", "lua dao", "dam bao khong", "tin duoc khong", "an toan khong", "chinh hang", "that khong", "hang dom", "hang gia", "so mat tien", "co that khong"],
      ex: ["shop có uy tín không", "mua ở đây có bị lừa không", "làm sao tin được shop", "có đảm bảo không vậy", "hàng chính hãng không", "sợ mất tiền"],
      a: "Dạ, anh/chị yên tâm ạ:<ul><li>Bên em báo giá rõ ràng trước khi làm, không thanh toán trên web.</li><li>Chạy thử cùng anh/chị rồi mới bàn giao.</li><li>Robot bảo hành 6 tháng, sửa chữa 6 tháng, phần mềm 3 tháng.</li><li>Đổi trả trong 24 giờ nếu có hư hỏng khi nhận hàng.</li></ul>Anh/chị xem thêm video thực tế trên kênh YouTube Jr. Automation ạ.",
      act: ["policy", "yt", "zalo"], chips: ["warranty", "process", "contact"] },
    { id: "contact", q: "Liên hệ trực tiếp",
      k: ["lien he", "lien he o dau", "lien he qua", "lien he shop", "zalo", "so dien thoai", "facebook", "email", "gmail", "nhan tin", "inbox", "hotline", "lien lac", "so zalo", "zalo la", "zalo bao nhieu", "so dien thoai bao nhieu", "xin so", "thong tin shop", "xin thong tin", "ket ban", "nhan tin cho shop"],
      ex: ["cho xin số điện thoại", "zalo shop là gì", "liên hệ bằng cách nào", "có facebook không", "email của shop", "sdt bn", "inbox ở đâu", "số zalo là bao nhiêu", "ib shop được không", "xin thông tin liên hệ shop", "liên hệ shop ở đâu", "liên hệ qua đâu"],
      a: "Dạ, anh/chị liên hệ anh Tuan Cong Jr qua:<ul><li>Zalo và điện thoại: <b>" + C.phone + "</b></li><li>Email: " + C.mail + "</li><li>Facebook: Tuan Cong</li><li>Địa chỉ: " + C.addr + "</li></ul>Nhắn Zalo thường nhanh nhất ạ.",
      act: ["zalo", "call", "fb", "mail"] },
    { id: "address", q: "Địa chỉ ở đâu?",
      k: ["dia chi", "cho nao", "chi duong", "ghe", "den xem", "toi xem", "cua hang o", "tan thoi hiep", "hiep thanh", "quan 12", "vi tri", "maps", "xem truc tiep", "tan noi", "qua xem", "ghe xem", "cua hang nam o"],
      ex: ["địa chỉ cửa hàng ở đâu", "shop ở quận mấy", "mình ghé xem trực tiếp được không", "chỉ đường giúp mình", "có cửa hàng không", "muốn qua xem robot tận nơi", "shop ở đâu"],
      a: "Dạ, địa chỉ bên em: " + C.addr + ".<br><br>Anh/chị nhắn Zalo trước khi ghé để em sắp xếp thời gian ạ.",
      act: ["maps", "zalo"] },
    { id: "hours", q: "Giờ làm việc?", w: 1.5,
      k: ["gio lam", "may gio", "mo cua", "dong cua", "gio mo", "chu nhat", "cuoi tuan", "ban dem", "nua dem", "24 24", "24 7", "nhan khach", "gio nhan khach",
          "gio sang", "h sang", "luc nao cung", "khuya", "toi khuya", "dem khuya", "lich lam viec", "thoi gian lam viec", "gio lam viec", "lam viec gio nao",
          "lam viec may gio", "lam cuoi tuan", "khi nao tra loi", "luc nao tra loi", "tra loi luc nao", "may gio tra loi", "thu 7", "thu bay", "ngay le"],
      ex: ["mấy giờ mở cửa", "tối nhắn có được không", "chủ nhật có làm không", "giờ làm việc thế nào", "khuya nhắn có ai trả lời không",
           "2 giờ sáng nhắn được không", "nhắn tin lúc nào cũng được hả", "lịch làm việc của shop", "thời gian làm việc", "shop có làm cuối tuần không",
           "khi nào shop trả lời tin nhắn", "làm việc từ mấy giờ đến mấy giờ"],
      a: "Dạ, bên em làm việc từ <b>8h sáng đến 17h30 chiều, tất cả các ngày từ thứ 2 đến chủ nhật</b>.<br><br>Do khối lượng tin nhắn và công việc nhiều, bên em sẽ phản hồi anh/chị nhanh nhất trong khoảng <b>19h đến 23h</b>. Mong anh/chị thông cảm ạ :3",
      act: ["zalo", "call"] },
    { id: "form", q: "Gửi yêu cầu qua form",
      k: ["form", "gui yeu cau", "dien thong tin", "de lai so", "de lai thong tin", "dang ky"],
      ex: ["gửi yêu cầu ở đâu", "điền form như thế nào", "để lại số điện thoại ở đâu", "đăng ký tư vấn"],
      a: "Dạ, mỗi trang dịch vụ có form ngắn, hoặc anh/chị dùng form ở trang Liên hệ. Em liên hệ lại qua số điện thoại hoặc Zalo anh/chị để lại ạ.",
      act: ["form", "buy", "repairForm", "aiForm"] },
    { id: "youtube", q: "Kênh YouTube",
      k: ["youtube", "video", "kenh", "kien thuc", "tai lieu", "xem demo", "clip", "xem video", "video o dau", "clip robot", "video robot"],
      ex: ["có video demo không", "kênh youtube của shop", "xem robot hoạt động ở đâu", "có tài liệu hướng dẫn không", "có clip robot chạy thử không", "xem video ở đâu"],
      a: "Dạ, kênh YouTube Jr. Automation chia sẻ về robot và phần mềm AI. Trang Kiến thức có giải thích ngắn về Vector, server riêng, Xiaozhi và cách chọn model AI ạ.",
      act: ["yt", "learn"] },

    /* ---------- Cửa hàng Vector ---------- */
    { id: "vectorwhat", q: "Vector là robot gì?", topic: "store",
      k: ["vector la gi", "vector la robot gi", "robot vector la gi", "anki", "vector goc", "vector ai la gi", "vector ai khac gi"],
      ex: ["Vector là gì", "robot Vector là robot gì vậy", "Anki Vector là gì", "Vector AI khác gì Vector thường", "con robot này của hãng nào"],
      a: "Dạ, Vector là robot để bàn nhỏ do Anki thiết kế: có camera, micro, cảm biến, màn hình mặt biểu cảm, tự di chuyển bằng bánh xích và nhận ra khuôn mặt.<br><br>Vector gốc không có sẵn tiếng Việt và cần máy chủ để nghe lệnh. Bản Vector AI bên em thêm giọng nói tiếng Việt, cho robot trò chuyện với model AI và chạy qua server riêng nên không phụ thuộc hãng ạ.",
      act: ["store"], chips: ["features", "buy", "price"] },
    { id: "features", q: "Vector làm được những gì?", topic: "store",
      k: ["tinh nang", "lam duoc nhung gi", "chuc nang", "co gi hay", "biet lam gi", "vector lam duoc", "ve lam duoc gi", "mua ve lam gi", "ve lam gi"],
      ex: ["Vector làm được những gì", "robot này có tính năng gì", "mua về chơi được gì", "Vector có thông minh không", "có nhận ra mặt người không", "robot biết làm gì", "mua vector về làm được gì"],
      a: "Dạ, Vector bên em sau khi cài:<ul><li>Nghe và nói tiếng Việt, kèm hướng dẫn sử dụng tiếng Việt.</li><li>Trò chuyện với AI (ChatGPT, DeepSeek, Xiaozhi...), hỏi gì cũng đáp, không chỉ vài lệnh có sẵn.</li><li>Luyện tiếng Anh cùng robot.</li><li>Điều khiển di chuyển từ xa bằng điện thoại.</li></ul>Vector vốn có camera nhận ra khuôn mặt, màn hình mặt biểu cảm, tự di chuyển trên bàn và tự tìm về đế sạc ạ.",
      act: ["store", "zalo"], chips: ["buy", "price", "kids"] },
    { id: "buy", q: "Mua robot Vector", topic: "store", w: 0.9,
      k: ["mua", "dat mua", "dat hang", "ban robot", "mua robot", "vector ai", "order", "ban vector", "mua vector", "muon mua", "robot vector", "mua o dau"],
      ex: ["mình muốn mua một con Vector", "đặt mua robot như thế nào", "shop có bán Vector không", "mua robot vector tiếng việt", "order 1 con vector", "cho mình đặt hàng", "mua vector ở đâu"],
      a: "Dạ, gói <b>mua robot cài sẵn</b> gồm robot Vector, server riêng đã cấu hình, model AI anh/chị chọn và hướng dẫn sử dụng tiếng Việt. Robot nghe nói tiếng Việt, trò chuyện với AI, luyện tiếng Anh và điều khiển từ xa bằng điện thoại.<br><br>Robot bảo hành 6 tháng, phần mềm 3 tháng, ship toàn quốc, giá báo riêng theo yêu cầu ạ.",
      act: ["buy", "zalo"], chips: ["price", "stock", "warranty"] },
    { id: "upgrade", q: "Nâng cấp Vector đang có", topic: "store",
      k: ["nang cap", "da co vector", "co san vector", "minh co vector", "toi co vector", "em co vector", "co vector roi", "vector cu cua minh", "da co san", "co san robot", "nha co vector", "vector cu o nha", "vector o nha"],
      ex: ["mình có sẵn Vector rồi nâng cấp được không", "nâng cấp tiếng Việt cho vector của mình", "đã có robot muốn cài thêm AI", "vector nhà mình cài tiếng việt được không", "con vector cũ ở nhà cài AI được không", "nâng cấp AI cho vector 2.0 của mình"],
      a: "Dạ, anh/chị đã có Vector thì em nâng cấp ngay trên robot đó: cài và cấu hình server riêng, Việt hóa giọng nói, kết nối model AI anh/chị chọn, kèm hướng dẫn sử dụng tiếng Việt. Phần mềm bảo hành 3 tháng.<br><br>Trong form đặt mua, anh/chị chọn \"Nâng cấp robot của mình\" và nhắn thêm bản Vector, tình trạng robot để em xác nhận trước khi báo giá ạ.",
      act: ["upForm", "zalo"], chips: ["price", "prepare", "version"] },
    { id: "stock", q: "Còn hàng không?", topic: "store", w: 2.5,
      k: ["con hang", "co hang", "co san khong", "het hang", "hang cu", "like new", "second hand", "2hand", "con vector khong", "con ban", "con robot khong", "co robot khong", "robot co khong", "ban vector cu", "co vector cu", "da qua su dung", "hang san", "nguyen seal", "seal", "moi nguyen", "full box", "fullbox", "hang moi khong"],
      ex: ["còn hàng không shop", "có sẵn robot không", "hàng mới hay đã qua sử dụng", "có bán vector cũ không", "vector like new giá bao nhiêu", "có vector mới nguyên hộp không", "hiện còn bán không", "shop có robot không"],
      a: owner("Dạ, tình trạng hàng (robot có sẵn, bản 1.0 hay 2.0, mới hay đã qua sử dụng) thay đổi theo từng thời điểm."),
      act: ["zalo"], chips: ["price", "version"] },
    { id: "version", q: "Vector 1.0 hay 2.0?", topic: "store",
      k: ["ban nao", "phien ban", "doi nao", "khac nhau", "1 0 hay 2 0", "1 0 va 2 0", "2 0 khac", "hon ban", "ban 1 hay ban 2"],
      ex: ["Vector 1.0 và 2.0 khác gì nhau", "vector 2.0 cài được không", "bản nào tốt hơn", "vector đời 1 dùng được không"],
      a: "Dạ, Vector 2.0 là bản Digital Dream Labs làm sau này, được giới thiệu với pin và camera cải tiến. Cả Vector 1.0 và 2.0 đều chạy được server riêng Wire-Pod, cài tiếng Việt và AI. Anh/chị nhắn em bản Vector và tình trạng robot để em xác nhận trước khi báo giá ạ.",
      act: ["zalo"], chips: ["stock", "upgrade", "price"] },
    { id: "vietnamese", q: "Vector nói tiếng Việt được không?", topic: "store",
      k: ["tieng viet", "viet hoa", "noi tieng viet", "giong viet", "hieu tieng viet"],
      ex: ["Vector có nói tiếng Việt không", "robot hiểu tiếng Việt chứ", "Việt hóa giọng nói được không", "ra lệnh bằng tiếng việt được không"],
      a: "Dạ được ạ. Sau khi Việt hóa, Vector nghe và nói tiếng Việt: chào hỏi, hỏi đáp và ra lệnh bằng tiếng Việt, kèm hướng dẫn sử dụng tiếng Việt. Bên em làm được cho robot mua mới lẫn robot anh/chị đang có.",
      act: ["store", "zalo"], chips: ["voice", "buy", "upgrade"] },
    { id: "voice", q: "Giọng robot thế nào?",
      k: ["giong nam", "giong nu", "giong doc", "giong mien", "mien nam", "mien bac", "doi giong"],
      ex: ["robot nói giọng nam hay nữ", "giọng đọc có tự nhiên không", "nó nghe được giọng miền Nam không", "đổi giọng nói được không"],
      a: "Dạ, giọng đọc tiếng Việt chọn được tùy dịch vụ giọng nói, thường có giọng nam và giọng nữ. Khả năng nghe giọng vùng miền tùy dịch vụ nhận dạng giọng nói; nói rõ và ở gần robot sẽ nhận dạng chính xác hơn. Em tư vấn giọng hợp với robot khi báo giá ạ.",
      act: ["zalo"], chips: ["vietnamese", "models"] },
    { id: "english", q: "Luyện tiếng Anh", topic: "store",
      k: ["tieng anh", "luyen tieng anh", "hoc tieng anh", "english"],
      ex: ["học tiếng Anh với robot được không", "cho con luyện tiếng anh", "vector nói tiếng anh không"],
      a: "Dạ, Vector chuyển sang tiếng Anh được để anh/chị và bé luyện nghe, nói cùng robot. Tính năng này có trong gói Vector AI, cả khi mua mới lẫn nâng cấp robot đang có ạ.",
      chips: ["kids", "buy", "upgrade"] },
    { id: "remote", q: "Điều khiển từ xa", topic: "store",
      k: ["dieu khien", "tu xa", "bang dien thoai", "dieu khien tu xa", "app dieu khien"],
      ex: ["điều khiển robot bằng điện thoại được không", "có app điều khiển không", "điều khiển từ xa thế nào"],
      a: "Dạ, sau khi cài, anh/chị dùng điện thoại điều khiển Vector di chuyển từ xa, không cần đứng cạnh robot ạ.",
      chips: ["features", "buy"] },
    { id: "kids", q: "Cho bé dùng được không?", topic: "store",
      k: ["tre em", "cho be", "cho con", "may tuoi", "do tuoi", "hoc sinh"],
      ex: ["bé 6 tuổi chơi được không", "mua cho con học có tốt không", "trẻ em dùng có an toàn không", "robot hợp với độ tuổi nào"],
      a: "Dạ, Vector hợp làm bạn học cho bé: trò chuyện, hỏi đáp tiếng Việt, luyện tiếng Anh. Hãng ghi độ tuổi khuyến nghị từ 8 tuổi trở lên. Robot nhỏ, chạy bằng bánh xích, nên đặt trên bàn có người lớn để ý để tránh rơi khỏi mép bàn ạ.",
      act: ["store", "zalo"], chips: ["english", "buy", "price"] },
    { id: "gift", q: "Mua làm quà", topic: "store",
      k: ["lam qua", "tang qua", "qua tang", "sinh nhat", "tang nguoi yeu", "noel", "qua tet"],
      ex: ["mua làm quà sinh nhật được không", "tặng người yêu có hợp không", "quà tặng cho bé", "có gói quà không"],
      a: "Dạ, Vector hợp làm quà cho người thích công nghệ, bé đang học tiếng Anh hay bàn làm việc cần một người bạn nhỏ. Em giao robot đã cài sẵn tiếng Việt và AI, ship toàn quốc. Gói quà hay lời chúc kèm theo, anh/chị nhắn " + Z + " để em sắp xếp ạ.",
      act: ["buy", "zalo"], chips: ["price", "shipping"] },

    /* ---------- Sửa chữa, server ---------- */
    { id: "repair", q: "Vector bị hỏng", topic: "repair", w: 0.9,
      k: ["sua", "sua chua", "hong", "hu", "bi hu", "hu hong", "bi hong", "loi", "bi loi", "khong len nguon", "khong mo", "liet", "dung im", "roi vo", "bi roi"],
      ex: ["vector của mình bị hỏng", "sửa robot vector ở đâu", "robot bị lỗi rồi", "vector không lên nguồn", "làm rơi robot giờ không chạy", "nhận sửa vector không"],
      a: "Dạ, Vector bị lỗi pin, sạc không vào, bánh xích không chạy hay màn hình lỗi, bên em chẩn đoán đúng lỗi rồi báo giá trước khi sửa, sửa xong bảo hành 6 tháng ạ.<ol><li>Anh/chị gửi tình trạng robot qua form, ảnh và video nhắn thêm qua Zalo.</li><li>Em chẩn đoán, nói rõ phạm vi việc và chi phí.</li><li>Sửa theo phạm vi đã chốt.</li><li>Chạy thử cùng anh/chị rồi mới bàn giao.</li></ol>",
      act: ["repairForm", "zalo"], chips: ["price", "time", "shipping"] },
    { id: "battery", q: "Pin Vector dùng bao lâu?", topic: "repair",
      k: ["pin", "chai pin", "het pin", "pin yeu", "thay pin", "pin bao lau", "tut pin"],
      ex: ["pin dùng được bao lâu", "pin vector bị chai", "robot hết pin nhanh quá", "thay pin vector được không", "sạc đầy chơi được mấy tiếng"],
      a: "Dạ, theo các bài đánh giá, Vector hoạt động liên tục được khoảng một giờ thì tự tìm về đế sạc. Pin chai, robot tụt pin nhanh hoặc tắt đột ngột, bên em kiểm tra và thay pin, sửa xong bảo hành 6 tháng ạ.",
      act: ["repairForm", "zalo"], chips: ["charging", "price"] },
    { id: "charging", q: "Vector không sạc được", topic: "repair",
      k: ["sac", "khong sac", "sac khong vao", "de sac", "cuc sac", "khong ve de", "khong ve sac", "sac dien thoai", "cu sac", "sac nao", "adapter", "nam im tren de", "nam tren de", "khong roi de"],
      ex: ["vector không vào sạc", "robot không tự về đế sạc", "đặt lên đế mà không sạc", "dùng cục sạc nào", "sạc bao lâu thì đầy", "dùng sạc điện thoại cho robot được không", "robot nằm im trên đế không dậy"],
      a: "Dạ, Vector không tự về đế sạc thường do đế đặt chỗ tối hoặc bị che, camera không nhìn thấy đế. Anh/chị đặt đế ở chỗ đủ sáng, phía trước thoáng. Đế sạc cần cục sạc USB tối thiểu 5V–1A. Đặt lên đế mà vẫn không sạc thì có thể do pin hoặc chân sạc; anh/chị gửi video qua Zalo để em kiểm tra ạ.",
      act: ["repairForm", "zalo"], chips: ["battery", "repair"] },
    { id: "wheels", q: "Bánh xích không chạy", topic: "repair",
      k: ["banh xich", "khong di chuyen", "khong chay", "dong co", "motor", "di lech", "xoay vong", "ket banh", "banh khong quay", "khong quay", "mot banh", "banh xe"],
      ex: ["bánh xích không chạy", "robot không di chuyển được", "vector cứ quay vòng tròn", "một bên bánh bị kẹt", "động cơ kêu to"],
      a: "Dạ, bánh xích không chạy, đi lệch hay quay vòng thường do kẹt bụi tóc trong bánh hoặc động cơ có vấn đề. Anh/chị quay video gửi Zalo, em chẩn đoán và báo giá trước khi sửa, sửa xong bảo hành 6 tháng ạ.",
      act: ["repairForm", "zalo"], chips: ["price", "time"] },
    { id: "screen", q: "Màn hình lỗi", topic: "repair",
      k: ["man hinh", "mat den", "soc man hinh", "khong hien mat", "mat bi soc", "man hinh toi", "mat khong sang", "mat vector", "mat robot"],
      ex: ["màn hình vector bị đen", "mặt robot không hiện", "màn hình bị sọc", "mắt vector bị mờ", "mắt robot không sáng"],
      a: "Dạ, màn hình đen, sọc hay không hiện mắt có thể do lỗi phần mềm hoặc màn hình. Nếu mặt hiện dòng chữ lạ thì thường là robot đang ở chế độ khôi phục. Anh/chị chụp ảnh mặt robot gửi Zalo để em xem và báo cách xử lý ạ.",
      act: ["repairForm", "zalo"], chips: ["recovery", "price"] },
    { id: "recovery", q: "Mặt Vector hiện chữ lạ", topic: "repair",
      k: ["ddl io", "anki com", "hien chu", "chu v", "recovery", "khoi phuc", "ket man hinh", "ma loi", "error", "loi 915", "error code", "bao loi", "so loi", "dong chu", "chu nho", "hien dong"],
      ex: ["mặt vector hiện chữ anki.com/v", "màn hình hiện ddl.io/v", "robot bị kẹt ở chữ V", "vector báo mã lỗi", "hiện số lỗi trên mặt", "robot báo error", "mặt robot hiện dòng chữ nhỏ"],
      a: "Dạ, mặt Vector hiện dòng chữ như anki.com/v hoặc ddl.io/v nghĩa là robot đang ở chế độ khôi phục, chờ được cài đặt và kết nối lại. Thường do robot mất kết nối máy chủ hoặc vừa bị reset. Bên em cài lại và kết nối server riêng để robot chạy bình thường. Anh/chị chụp ảnh mặt robot (hoặc mã lỗi) gửi Zalo để em xem ạ.",
      act: ["repairForm", "zalo"], chips: ["server", "price"] },
    { id: "server", q: "Vector không nghe lệnh", topic: "repair",
      k: ["server", "sever", "may chu", "hey vector", "khong nghe", "khong nghe lenh", "khong phan hoi", "khong tra loi", "khong hieu lenh"],
      ex: ["gọi hey vector không phản hồi", "robot không nghe lệnh nữa", "vector không trả lời", "cài server cho vector", "nói gì robot cũng không hiểu", "server riêng là gì"],
      a: "Dạ, gọi \"Hey Vector\" mà robot không phản hồi thường là do robot không còn kết nối được máy chủ để hiểu giọng nói.<br><br>Bên em cài server riêng bằng Wire-Pod (mã nguồn mở, miễn phí) chạy trên máy tính cũ hoặc Raspberry Pi cùng mạng Wi-Fi với robot. Vector nghe lệnh trở lại, không phụ thuộc máy chủ của hãng và nối được với model AI ạ.",
      act: ["repairForm", "serverWhat", "zalo"], chips: ["serveron", "subscription", "price"] },
    { id: "wirepod", q: "Wire-Pod là gì?", topic: "repair",
      k: ["wire pod", "wirepod", "escape pod", "escapepod"],
      ex: ["wire-pod là gì", "wirepod có miễn phí không", "escape pod khác gì wire pod", "tự cài wirepod được không"],
      a: "Dạ, Wire-Pod là phần mềm server miễn phí, mã nguồn mở của cộng đồng, thay cho máy chủ của hãng. Wire-Pod chạy được trên Windows, macOS, Linux và Android, dùng được cho cả Vector 1.0 lẫn 2.0. Máy chạy Wire-Pod phải bật thì Vector mới nghe lệnh. Bên em cài và cấu hình trọn gói, kèm kết nối AI ạ.",
      act: ["serverWhat", "zalo"], chips: ["serveron", "server", "price"] },
    { id: "serveron", q: "Server có phải bật liên tục?", topic: "repair",
      k: ["bat lien tuc", "tat may tinh", "bat suot", "chay lien tuc", "ton dien", "raspberry pi", "may tinh cu", "tat laptop", "tat may", "laptop", "server phai mo", "mo 24 24", "phai bat", "mo lien tuc"],
      ex: ["server có cần bật liên tục không", "tắt máy tính thì robot còn chạy không", "chạy server có tốn điện không", "dùng raspberry pi được không", "tắt laptop thì robot còn nghe lệnh không", "server phải mở cả ngày hả"],
      a: "Dạ có ạ. Máy chạy server phải bật và cùng mạng Wi-Fi với robot thì Vector mới nghe lệnh. Một máy tính cũ hoặc Raspberry Pi là đủ; em tư vấn phương án gọn và tiết kiệm điện nhất khi báo giá ạ.",
      act: ["zalo"], chips: ["prepare", "price"] },
    { id: "subscription", q: "Có phải trả phí thuê bao hãng?", topic: "repair",
      k: ["thue bao", "subscription", "ddl", "digital dream labs", "phi hang thang cua hang", "het han", "tai khoan hang", "app vector", "tien cho hang", "phi cua hang", "dong tien cho hang", "tra cho hang"],
      ex: ["vector có phải trả phí thuê bao không", "máy chủ hãng còn hoạt động không", "app vector không đăng nhập được", "hết hạn subscription thì sao", "Digital Dream Labs còn hỗ trợ không", "có phải trả tiền cho hãng hằng năm không"],
      a: "Dạ, máy chủ chính hãng của Vector (Digital Dream Labs) từng yêu cầu trả phí thuê bao để dùng lệnh giọng nói và có lúc gián đoạn. Dùng server riêng bằng Wire-Pod thì anh/chị không cần thuê bao hãng nữa. Chi phí chỉ phát sinh nếu chọn model AI tính phí theo lượng dùng ạ.",
      act: ["serverWhat", "zalo"], chips: ["server", "aicost"] },
    { id: "wifi", q: "Vector không vào được Wi-Fi", topic: "repair",
      k: ["wifi", "wi fi", "mang", "5ghz", "5g", "2 4ghz", "2 4", "mat ket noi", "khong ket noi", "rot mang", "router", "modem", "cuc phat"],
      ex: ["vector không kết nối được wifi", "robot không thấy mạng nhà mình", "wifi 5G dùng được không", "robot hay bị mất kết nối", "đổi wifi cho robot thế nào", "cần router loại nào"],
      a: "Dạ, Vector chỉ kết nối được Wi-Fi <b>2.4 GHz</b>, không dùng được mạng 5 GHz. Mạng phải đăng nhập qua trang web (khách sạn, trường học, quán cà phê) cũng không dùng được. Router hai băng tần thì nên tách riêng tên mạng 2.4 GHz. Vẫn không vào được hoặc hay rớt mạng, anh/chị nhắn Zalo để em hỗ trợ kết nối lại ạ.",
      act: ["zalo", "repairForm"], chips: ["server", "repair"] },
    { id: "cube", q: "Khối Cube", topic: "repair",
      k: ["cube", "khoi vuong", "khoi lap phuong", "hop vuong"],
      ex: ["cục cube không sáng", "mất khối cube có sao không", "robot không tìm thấy cube", "pin cube"],
      a: "Dạ, khối Cube đi kèm Vector có pin riêng và kết nối với robot qua Bluetooth. Cube không sáng hay robot không tìm thấy Cube thường do Cube hết pin. Không có Cube thì các trò chơi dùng Cube sẽ không chạy; anh/chị nhắn Zalo nếu cần em kiểm tra ạ.",
      act: ["zalo"], chips: ["repair"] },
    { id: "reset", q: "Reset Vector", topic: "repair", w: 2,
      k: ["reset", "khoi phuc cai dat", "xoa du lieu", "xoa het", "xoa sach", "cai lai", "factory", "lam moi", "xuat xuong", "nhu moi", "ve ban dau"],
      ex: ["reset vector thế nào", "xóa dữ liệu robot", "cài lại từ đầu được không", "khôi phục cài đặt gốc", "làm sao để reset", "đưa robot về như lúc mới mua"],
      a: "Dạ, Vector có chế độ khôi phục để xóa dữ liệu và cài lại. Sau khi reset, robot phải kết nối lại server thì mới nghe lệnh. Anh/chị chưa chắc cách làm thì nhắn Zalo, em hướng dẫn hoặc làm giúp để không mất cấu hình ạ.",
      act: ["zalo"], chips: ["recovery", "server"] },
    { id: "manual", q: "Có hướng dẫn sử dụng không?", topic: "store", w: 2,
      k: ["huong dan su dung", "chi cach dung", "khong biet dung", "cach su dung", "cach dung", "huong dan dung"],
      ex: ["mua xong có được hướng dẫn sử dụng không", "mình không rành công nghệ có dùng được không", "có chỉ cách dùng không", "người lớn tuổi có dùng được không"],
      a: "Dạ có ạ. Robot bàn giao kèm <b>hướng dẫn sử dụng bằng tiếng Việt</b>, ra lệnh bằng giọng nói nên không cần biết lập trình. Bên em chạy thử cùng anh/chị trước khi bàn giao; sau đó có gì chưa rõ, anh/chị nhắn " + Z + " để em hướng dẫn thêm ạ.",
      act: ["store", "zalo"], chips: ["features", "buy"] },
    { id: "update", q: "Cập nhật phần mềm", topic: "repair",
      k: ["cap nhat", "update", "firmware", "ota", "phien ban moi", "nang cap phan mem", "phan mem moi", "ban cap nhat"],
      ex: ["có cập nhật phần mềm không", "update firmware cho robot", "sau này có bản mới không", "tự cập nhật được không", "sau này có nâng cấp phần mềm không"],
      a: "Dạ, bên em cài sẵn phần mềm và cấu hình khi bàn giao. Về sau có bản cập nhật, em hướng dẫn anh/chị cập nhật hoặc hỗ trợ từ xa. Phần mềm được bảo hành 3 tháng ạ.",
      act: ["zalo"], chips: ["warranty", "remotehelp"] },

    /* ---------- AI ---------- */
    { id: "models", q: "Nên chọn model AI nào?",
      k: ["chatgpt", "chat gpt", "gpt", "openai", "deepseek", "gemini", "model", "mo hinh", "ai nao", "claude", "qwen", "llama", "tri tue nhan tao", "chon ai"],
      ex: ["nên dùng ChatGPT hay DeepSeek", "có kết nối Gemini được không", "model AI nào tốt", "dùng AI gì cho robot", "chatgpt có nói tiếng việt không", "có hỗ trợ deepseek không"],
      a: "Dạ, bên em kết nối được ChatGPT, DeepSeek, Gemini, Xiaozhi, Qwen hoặc model chạy offline qua Ollama. Mỗi model khác nhau về chi phí, tốc độ và chất lượng tiếng Việt. Em tư vấn theo ngân sách và việc anh/chị muốn robot làm ạ.",
      act: ["aiPlat"], chips: ["xiaozhi", "aicost", "offline"] },
    { id: "smart", q: "Robot thông minh cỡ nào?",
      k: ["thong minh", "hoi gi cung", "tra loi duoc gi", "noi chuyen duoc khong", "tro chuyen"],
      ex: ["robot có thông minh không", "hỏi gì cũng trả lời được hả", "nói chuyện với robot được không", "nó có hiểu mình nói gì không", "trò chuyện có tự nhiên không"],
      a: "Dạ, khi nối với model AI, robot trả lời được hầu hết câu hỏi thường ngày như một trợ lý trò chuyện, không chỉ vài lệnh có sẵn. Mức thông minh và tốc độ trả lời phụ thuộc model anh/chị chọn ạ.",
      chips: ["models", "aicost"] },
    { id: "xiaozhi", q: "Xiaozhi là gì?", w: 1.5,
      k: ["xiaozhi", "xiao zhi", "tieu tri"],
      ex: ["Xiaozhi là gì", "xiaozhi có dùng được cho vector không", "robot dùng xiaozhi được không", "tích hợp xiaozhi thế nào", "xiaozhi có tiếng việt không"],
      a: "Dạ, Xiaozhi là nền tảng trợ lý giọng nói AI mã nguồn mở. Robot thu giọng nói, Xiaozhi chuyển thành chữ, nhờ model AI trả lời rồi đọc thành tiếng.<br><br>Bên em tích hợp Xiaozhi cho robot Vector và cho robot tự chế dùng bo ESP32-S3 ạ.",
      act: ["xz"], chips: ["xiaozhifree", "models", "ai"] },
    { id: "xiaozhifree", q: "Xiaozhi có miễn phí không?", w: 1.5,
      k: ["xiaozhi mien phi", "xiaozhi free", "xiaozhi me", "xiaozhi ton phi"],
      ex: ["xiaozhi có miễn phí không", "dùng xiaozhi có mất tiền không", "xiaozhi.me là gì", "xiaozhi free không"],
      a: "Dạ, phần mềm Xiaozhi là mã nguồn mở, miễn phí. Firmware mặc định kết nối máy chủ xiaozhi.me, tài khoản cá nhân dùng miễn phí model Qwen thời gian thực. Muốn dùng model khác hoặc server riêng thì có thể phát sinh phí theo nhà cung cấp; em nói rõ khi báo giá ạ.",
      act: ["xz"], chips: ["xiaozhi", "aicost"] },
    { id: "aicost", q: "Dùng AI có tốn phí không?", w: 1.2,
      k: ["ton phi", "mat phi", "phi ai", "phi hang thang", "mien phi", "free", "tra phi", "phi su dung", "phi duy tri", "ton tien", "mat tien hang thang", "thang phai tra", "moi thang", "hang thang", "tien cho ai", "tien ai"],
      ex: ["dùng AI có tốn phí hàng tháng không", "chatgpt có mất tiền không", "có phí duy trì không", "dùng miễn phí được không", "mỗi tháng trả bao nhiêu tiền cho AI"],
      a: "Dạ, Xiaozhi là phần mềm mã nguồn mở. ChatGPT, Gemini và các model gọi qua API thường tính phí theo lượng dùng của nhà cung cấp. Model chạy offline qua Ollama không tốn phí theo lượt nhưng cần máy tính đủ mạnh.<br><br>Em nói rõ chi phí từng phương án khi báo giá để anh/chị chọn theo ngân sách ạ.",
      chips: ["models", "offline", "price"] },
    { id: "offline", q: "AI chạy offline được không?", w: 1.5,
      k: ["offline", "khong can internet", "khong can mang", "khong co mang", "ollama", "chay o nha", "chay offline", "mat mang", "khong co wifi", "khong wifi", "mat wifi", "cup mang", "khi mat mang"],
      ex: ["chạy AI offline được không", "không có internet robot có chạy không", "mất mạng thì sao", "dùng ollama được không", "không có wifi dùng AI được không", "cúp mạng robot còn chạy không"],
      a: "Dạ được ạ, khi model chạy trên máy tính trong nhà qua Ollama và robot kết nối với máy đó qua Wi-Fi. Cách này không tốn phí theo lượt và dữ liệu không rời khỏi nhà, nhưng máy cần đủ RAM. Robot nhỏ dùng ESP32 không tự chạy được model lớn, nên vẫn cần máy tính đi kèm ạ.",
      chips: ["models", "aicost", "privacy"] },
    { id: "privacy", q: "Có an toàn dữ liệu không?",
      k: ["rieng tu", "bao mat", "nghe len", "quay len", "camera theo doi", "du lieu", "lo thong tin", "lo hinh", "lo hinh anh", "hinh anh trong nha", "luu hinh"],
      ex: ["robot có nghe lén không", "camera có quay lén không", "dữ liệu có bị gửi đi đâu không", "có an toàn riêng tư không", "có lộ hình ảnh trong nhà không"],
      a: "Dạ, với server riêng, giọng nói được xử lý trên máy chủ đặt tại nhà anh/chị, không qua máy chủ của hãng. Câu hỏi gửi cho model AI sẽ đi qua nhà cung cấp anh/chị chọn (ChatGPT, Gemini...). Muốn dữ liệu không ra khỏi nhà, em cài model chạy offline qua Ollama ạ.",
      chips: ["offline", "models"] },

    /* ---------- Lập trình AI cho robot ---------- */
    { id: "ai", q: "Lập trình AI cho robot", topic: "ai",
      k: ["lap trinh", "phan mem ai", "phan mem cho robot", "viet phan mem", "lam robot", "le tan", "lenh thoai", "lenh rieng", "day robot", "them lenh", "cau moi", "robot tu che", "tu che", "raspberry", "jetson", "ros", "robot thu cung", "viet code", "firmware ai", "camera nhan dien", "nhan dien", "robot khac", "sdk"],
      ex: ["nhận lập trình AI cho robot không", "mình có robot tự chế cần viết phần mềm", "lập trình cho robot của hãng được không", "làm robot nhận diện khuôn mặt", "viết code cho robot thú cưng", "nhận viết phần mềm cho robot không", "làm robot lễ tân biết nói", "muốn làm một con robot riêng", "dạy robot nói câu mới được không", "thêm lệnh thoại riêng cho robot"],
      a: "Dạ, bên em nhận lập trình phần mềm AI theo yêu cầu cho chó robot, xe tự hành, robot thú cưng như Loona, EMO và robot tự chế:<ul><li>Giọng nói tiếng Việt, trò chuyện với AI.</li><li>Lệnh thoại riêng, camera nhận diện người và đồ vật.</li><li>Dáng đi, chuyển động, tránh vật cản.</li><li>Ra lệnh bật tắt thiết bị trong nhà.</li></ul>Để em báo giá nhanh, anh/chị cho em biết robot loại gì, robot cần làm gì và model AI mong muốn ạ.",
      act: ["aiForm", "aiEx", "zalo"], chips: ["dog", "car", "loona"] },
    { id: "dog", q: "Chó robot", topic: "ai", w: 1.3,
      kr: ["cún"], k: ["chos", "robot chos", "chos robot", "cho may", "robot biet di", "biet di", "dang di", "cyberdog", "unitree", "go2", "bittle", "petoi", "4 chan", "bon chan", "servo"],
      ex: ["làm phần mềm cho chó robot", "mình có khung chó robot in 3D", "lập trình unitree go2 được không", "chó robot 4 chân dùng esp32", "petoi bittle lập trình được không", "lam cho robot biet di"],
      a: "Dạ, anh/chị có khung chó robot (ví dụ khung in 3D 12 servo) thì bên em viết phần mềm cho bo ESP32-S3 kết nối Xiaozhi AI:<ul><li>Dáng đi, tự đi, tránh vật cản, chống rơi mép bàn.</li><li>Động tác ngồi, bắt tay, chào khi nghe lệnh.</li><li>Sơ đồ đấu nối servo, cảm biến và nguồn.</li><li>Test và cân chỉnh online qua video call.</li></ul>Anh/chị tự chuẩn bị servo và linh kiện. Với CyberDog, Unitree Go2 bản EDU, Petoi Bittle, bên em lập trình qua SDK hoặc mã nguồn mở của hãng ạ.",
      act: ["aiEx", "aiForm", "zalo"], chips: ["price", "process", "parts"] },
    { id: "car", q: "Xe tự hành", topic: "ai", w: 1.3,
      k: ["xe tu hanh", "xe robot", "xe tu chay", "lidar", "do line", "tranh vat can", "ban do", "agv", "xe dieu khien"],
      ex: ["lập trình xe tự hành", "xe robot tránh vật cản", "xe dò line", "làm xe tự đi theo người", "xe vẽ bản đồ phòng bằng lidar"],
      a: "Dạ, bên em lập trình xe robot tự chạy:<ul><li>Tránh vật cản bằng cảm biến siêu âm, ToF hoặc LiDAR.</li><li>Đi theo người, dò line, quay về vị trí ban đầu.</li><li>Vẽ bản đồ phòng và tự đi tới điểm đã đặt với ROS 2.</li><li>Nhận lệnh nói qua Xiaozhi hoặc ChatGPT, ví dụ \"ra phòng khách\".</li></ul>Bản đồ và tự tìm đường cần LiDAR cùng máy tính nhúng như Raspberry Pi. Xe dùng ESP32 làm được tránh vật cản và lệnh thoại ạ.",
      act: ["aiEx", "aiForm", "zalo"], chips: ["price", "process", "parts"] },
    { id: "loona", q: "Loona, EMO", topic: "ai", w: 5,
      k: ["loona", "emo", "robot emo", "living ai", "keyi"],
      ex: ["lập trình cho Loona được không", "robot EMO cài tiếng việt được không", "loona có chatgpt không", "emo lập trình được không"],
      a: "Dạ, <b>Loona</b> có chế độ lập trình kéo thả Google Blockly trong app, nên bên em viết được chuỗi động tác, trò chơi, kịch bản theo ý anh/chị và hướng dẫn bé học lập trình cùng Loona.<br><br><b>EMO</b> hiện chưa có SDK chính thức để lập trình. Em tư vấn khai thác tính năng có sẵn, hoặc làm robot để bàn kiểu EMO với AI và tiếng Việt theo ý anh/chị ạ.<br><br>Ngôn ngữ Loona, EMO hiểu được tùy phiên bản phần mềm của hãng; anh/chị nhắn Zalo để em kiểm tra trên máy của mình ạ.",
      act: ["aiForm", "zalo"], chips: ["ai", "price"] },
    { id: "esp32", q: "Dùng bo mạch nào?", topic: "ai",
      k: ["esp32", "esp32 s3", "bo mach", "vi dieu khien", "arduino", "mach nao", "n16r8"],
      ex: ["nên dùng bo mạch gì", "esp32 s3 làm được không", "arduino có làm được không", "dùng raspberry hay esp32"],
      a: "Dạ, ESP32-S3 hợp với robot nhỏ chạy Xiaozhi. Raspberry Pi hoặc Jetson hợp khi cần camera nhận diện, bản đồ LiDAR hay ROS 2. Anh/chị gửi mô tả hoặc ảnh robot, em xem rồi đề xuất ạ.",
      act: ["aiForm", "zalo"], chips: ["parts", "ai"] },
    { id: "smarthome", q: "Điều khiển thiết bị trong nhà", topic: "ai", w: 1.2,
      k: ["bat den", "tat den", "bat tat", "bat quat", "tat quat", "nha thong minh", "dieu khien den", "thiet bi trong nha", "smart home", "do dien", "tivi", "tv", "may lanh", "dieu hoa", "rem cua", "mo tivi"],
      ex: ["robot bật tắt đèn được không", "điều khiển quạt bằng giọng nói", "kết nối nhà thông minh", "robot mở tivi được không"],
      a: "Dạ, robot ra lệnh bật tắt đèn và thiết bị trong nhà được, tùy loại robot và thiết bị anh/chị đang dùng. Anh/chị mô tả robot và thiết bị để em xem cách làm phù hợp ạ.",
      act: ["aiForm", "zalo"], chips: ["ai", "price"] },
    { id: "parts", q: "Có bán linh kiện không?", topic: "ai",
      k: ["linh kien", "ban kit", "bo kit", "ban servo", "ban mach", "mua linh kien", "phu kien", "ban khung", "co ban khung", "ban linh kien"],
      ex: ["shop có bán linh kiện không", "có bán kit esp32 không", "mua servo ở đâu", "có bán phụ kiện vector không", "có bán khung robot in 3d không"],
      a: owner("Dạ, linh kiện và phụ kiện em tư vấn theo từng dự án; có cung cấp sẵn hay không tùy từng loại."),
      act: ["zalo"], chips: ["esp32", "ai"] },
    { id: "study", q: "Đồ án, học lập trình", topic: "ai",
      k: ["do an", "luan van", "sinh vien", "day hoc", "khoa hoc", "hoc lap trinh", "day lap trinh", "huong dan lam"],
      ex: ["nhận làm đồ án robot không", "có dạy lập trình robot không", "sinh viên có giảm giá không", "có khóa học không"],
      a: owner("Dạ, dự án học tập, đồ án hay nhu cầu học lập trình robot, anh/chị gửi mô tả để xem bên em hỗ trợ được tới đâu."),
      act: ["zalo", "aiForm"], chips: ["ai", "price"] },

    /* ---------- Mua bán, chính sách ---------- */
    { id: "price", q: "Giá bao nhiêu?", w: 1.1,
      k: ["gia", "bao nhieu", "chi phi", "bao gia", "nhieu tien", "gia ca", "bang gia", "gia re", "mac qua", "dat qua", "tien cong", "gia sao", "het bao nhieu", "gia bao nhieu", "ban gia", "gia 1 con", "gia mot con", "bao nhieu tien"],
      ex: ["giá bao nhiêu vậy", "bao nhiêu tiền một con", "cho xin bảng giá", "chi phí sửa hết bao nhiêu", "báo giá giúp mình", "giá lập trình thế nào", "vector bên em bán giá nhiêu", "giá nhiêu vậy shop"],
      a: priceText, act: ["zalo", "form"], chips: ["process", "discount", "contact"] },
    { id: "discount", q: "Có giảm giá không?",
      k: ["giam gia", "khuyen mai", "bot chut", "bot gia", "uu dai", "sale", "voucher", "giam chut"],
      ex: ["có giảm giá không", "bớt chút được không", "đang có khuyến mãi gì không", "mua 2 con có ưu đãi không"],
      a: owner("Dạ, ưu đãi (nếu có) anh Tuan Cong Jr báo trực tiếp khi báo giá theo từng đơn."),
      act: ["zalo"], chips: ["price"] },
    { id: "payment", q: "Thanh toán thế nào?",
      k: ["thanh toan", "chuyen khoan", "dat coc", "coc", "coc truoc", "tra truoc", "tien mat", "tra gop", "cod", "ship cod", "tra tien", "so tai khoan", "tai khoan ngan hang", "chuyen khoan truoc"],
      ex: ["thanh toán thế nào", "có cần đặt cọc không", "có trả góp không", "nhận hàng rồi trả tiền được không", "chuyển khoản được không", "có cod không", "cọc trước bao nhiêu", "chuyển khoản trước hay nhận hàng mới trả", "xin số tài khoản để chuyển khoản"],
      a: "Dạ, trên web anh/chị không cần tạo tài khoản hay thanh toán trước. Sau khi em báo giá và hai bên chốt, cách thanh toán (chuyển khoản, đặt cọc, COD hay trả góp nếu có) em trao đổi cụ thể với anh/chị qua Zalo ạ.",
      act: ["zalo", "policy"], chips: ["shipping", "warranty"] },
    { id: "inspect", q: "Được kiểm tra hàng không?", w: 2,
      k: ["kiem tra hang", "dong kiem", "xem hang truoc", "kiem hang", "mo hop kiem tra", "check hang"],
      ex: ["có được kiểm tra hàng trước khi nhận không", "cho đồng kiểm không", "nhận hàng được mở hộp xem không", "mua có được kiểm tra hàng không, sợ hàng dỏm"],
      a: "Dạ, robot có hư hỏng khi nhận thì anh/chị được <b>đổi trả trong 24 giờ</b>: anh/chị quay video lúc mở hộp và nhắn Zalo cho em. Việc kiểm tra hàng trước khi thanh toán (đồng kiểm) em xác nhận theo từng đơn; anh/chị nhắn " + Z + " để anh Tuan Cong Jr báo chính xác ạ.",
      act: ["zalo", "policy"], chips: ["warranty", "payment", "trust"] },
    { id: "invoice", q: "Có xuất hóa đơn không?",
      k: ["hoa don", "vat", "xuat hoa don", "phieu bao hanh", "bien nhan"],
      ex: ["có xuất hóa đơn VAT không", "có phiếu bảo hành không", "lấy hóa đơn công ty được không"],
      a: owner("Dạ, hóa đơn và giấy tờ kèm theo em xác nhận theo từng đơn."),
      act: ["zalo"], chips: ["warranty", "payment"] },
    { id: "shipping", q: "Có ship tỉnh không?",
      k: ["giao hang", "ship", "van chuyen", "tinh khac", "ngoai tinh", "gui hang", "toan quoc", "ship toan quoc", "ha noi", "da nang", "o xa", "xe khach", "gui xe", "chanh xe", "giao nhanh", "grab", "ship ve", "mien phi ship", "free ship", "phi ship"],
      ex: ["có ship ra Hà Nội không", "giao hàng toàn quốc không", "mình ở tỉnh khác mua được không", "phí ship bao nhiêu", "bao lâu thì nhận được hàng"],
      a: "Dạ, bên em <b>ship toàn quốc</b>. Anh/chị ở tỉnh nào cũng đặt mua và trao đổi qua Zalo được. Phí và thời gian giao hàng em báo cụ thể khi chốt đơn ạ.",
      act: ["zalo", "policy"], chips: ["payment", "remotehelp"] },
    { id: "remotehelp", q: "Hỗ trợ từ xa được không?",
      k: ["online", "tu xa", "video call", "ultraview", "teamviewer", "ho tro online", "lam online", "cai tu xa"],
      ex: ["hỗ trợ cài đặt từ xa được không", "ở xa thì sửa phần mềm thế nào", "làm online qua video call được không", "cài qua ultraview được không"],
      a: "Dạ, lập trình AI em test và cân chỉnh online qua video call. Lỗi phần mềm thường xử lý từ xa được, không cần gửi robot. Việc cần làm trên phần cứng thì em hướng dẫn gửi robot, ship toàn quốc ạ.",
      act: ["zalo"], chips: ["shipping", "repair"] },
    { id: "warranty", q: "Bảo hành bao lâu?", w: 2,
      k: ["bao hanh", "bao hanh bao lau", "doi tra", "doi hang", "tra hang", "doi moi", "hoan tien", "chinh sach", "giao bi hu", "nhan bi hu", "bi vo"],
      ex: ["bảo hành bao lâu", "có đổi trả không", "nhận hàng bị hư thì sao", "sửa xong có bảo hành không", "chính sách bảo hành thế nào", "hoàn tiền được không"],
      a: "Dạ, chính sách bảo hành bên em:<ul><li><b>Robot Vector</b>: bảo hành 6 tháng.</li><li><b>Sửa chữa</b>: bảo hành 6 tháng.</li><li><b>Phần mềm cho Vector và phần mềm AI</b>: bảo hành 3 tháng.</li></ul><b>Đổi trả trong 24 giờ</b> nếu robot có hư hỏng khi nhận hàng: anh/chị quay video hoặc chụp ảnh chỗ hư hỏng rồi nhắn Zalo cho em trong 24 giờ kể từ khi nhận ạ.",
      act: ["zalo", "policy"], chips: ["buy", "shipping", "contact"] },
    { id: "process", q: "Quy trình làm việc",
      k: ["quy trinh", "cac buoc", "buoc dat hang", "lam sao de", "cach dat", "dat nhu the nao", "bat dau the nao", "lam viec the nao", "cach thuc", "cach lam viec", "thu tuc"],
      ex: ["quy trình làm việc thế nào", "đặt hàng gồm những bước nào", "muốn làm thì bắt đầu từ đâu", "thủ tục ra sao", "các bước đặt hàng"],
      a: "Dạ, cách làm việc bên em:<ol><li>Anh/chị chọn dịch vụ và gửi yêu cầu qua form hoặc nhắn Zalo.</li><li>Em liên hệ lại, đề xuất phương án và báo giá rõ ràng.</li><li>Hai bên chốt rồi bên em thực hiện.</li><li>Chạy thử cùng anh/chị, bàn giao kèm hướng dẫn tiếng Việt.</li></ol>Anh/chị không cần tạo tài khoản hay thanh toán trước trên web ạ.",
      act: ["form", "zalo"], chips: ["price", "time", "contact"] },
    { id: "time", q: "Bao lâu thì xong?",
      k: ["bao lau", "mat bao lau", "may ngay", "bao nhieu ngay", "khi nao xong", "thoi gian lam", "tien do", "lam nhanh", "lay gap", "can gap", "bao gio xong", "may hom", "bao nhieu hom", "sua xong", "xong chua"],
      ex: ["bao lâu thì xong", "sửa mất mấy ngày", "khi nào nhận được robot", "làm gấp được không", "mấy hôm thì sửa xong"],
      a: "Dạ, thời gian tùy việc: sửa chữa phụ thuộc lỗi của robot, lập trình phụ thuộc phạm vi dự án. Em báo tiến độ cụ thể khi báo giá và bàn giao đúng tiến độ đã chốt. Cần gấp, anh/chị gọi hoặc nhắn " + Z + " ạ.",
      act: ["zalo", "call"] },
    { id: "prepare", q: "Cần chuẩn bị gì?",
      k: ["chuan bi", "can gi", "can nhung gi", "can co gi", "yeu cau gi", "can mua them", "can them gi"],
      ex: ["cần chuẩn bị những gì", "mua về cần thêm gì không", "nhà cần có gì để dùng robot", "cần mua thêm thiết bị gì"],
      a: function (ctx) {
        if (ctx.last === "ai") return "Dạ, để em báo giá nhanh, anh/chị cho em biết:<ul><li>Robot của anh/chị: chó robot, xe tự hành, Loona, EMO, robot hãng có SDK hay robot tự chế.</li><li>Robot cần làm gì: trò chuyện, nhận lệnh, di chuyển, nhận diện bằng camera, điều khiển thiết bị.</li><li>Model AI mong muốn, hoặc để em tư vấn.</li><li>Số lượng robot.</li></ul>";
        return "Dạ, với robot Vector, anh/chị cần một mạng Wi-Fi 2.4 GHz ở nhà. Server chạy trên một thiết bị cùng mạng với robot, như máy tính cũ hoặc Raspberry Pi. Em tư vấn phương án gọn và tiết kiệm điện nhất khi báo giá ạ.";
      },
      chips: ["price", "process", "wifi"] }
  ];

  var BY_ID = {};
  KB.forEach(function (it) { BY_ID[it.id] = it; });
  var MAIN_CHIPS = ["buy", "repair", "ai", "price", "contact"];

  /* ================= XỬ LÝ TIẾNG VIỆT ================= */
  /* Viết tắt, từ đồng nghĩa, lỗi gõ hay gặp → chuẩn hoá */
  var ABBR = {
    /* không */ ko: "khong", k: "khong", kh: "khong", hok: "khong", hk: "khong", khum: "khong", hem: "khong", kg: "khong", khg: "khong", k0: "khong", ko0: "khong",
    /* được, gì, sao, vậy */ dc: "duoc", dk: "duoc", j: "gi", s: "sao", z: "vay", zay: "vay", zey: "vay", v: "vay", dzay: "vay",
    /* nhắn tin, trả lời */ ib: "nhan tin", inb: "nhan tin", nt: "nhan tin", mess: "nhan tin", rep: "tra loi",
    /* thời gian */ h: "gio", ms: "moi", bh: "bay gio", bjo: "bay gio", trc: "truoc", lun: "luon",
    /* hay gặp */ cx: "cung", cug: "cung", bth: "binh thuong", kq: "ket qua", in4: "thong tin", info: "thong tin", kb: "ket ban",
    bik: "biet", bit: "biet", mun: "muon", wa: "qua", qa: "qua", nhiu: "nhieu", roi: "roi", rui: "roi", thui: "thoi", thoy: "thoi",
    lm: "lam", ns: "noi", ntn: "nhu the nao", vs: "voi", r: "roi", ak: "a", uk: "u", dag: "dang", ng: "nguoi", ngta: "nguoi ta",
    mn: "moi nguoi", mng: "moi nguoi", cty: "cong ty", iu: "yeu", dth: "de thuong",
    /* người */ mk: "minh", mik: "minh", mjk: "minh", m: "minh", t: "toi", tui: "toi", ae: "anh em",
    /* mua bán */ sp: "san pham", tv: "tu van", ck: "chuyen khoan", stk: "so tai khoan", sip: "ship", freeship: "mien phi ship", fs: "mien phi ship",
    free: "mien phi", bn: "bao nhieu", bnh: "bao nhieu", bnhieu: "bao nhieu", bnhiu: "bao nhieu", baonhieu: "bao nhieu", bhanh: "bao hanh", xai: "dung",
    /* liên hệ, shop, địa chỉ */ lh: "lien he", lhe: "lien he", sop: "shop", shp: "shop", sh0p: "shop", dchi: "dia chi", dcchi: "dia chi",
    sdt: "so dien thoai", dt: "dien thoai", dthoai: "dien thoai", zl: "zalo", fb: "facebook", face: "facebook",
    /* robot */ vecto: "vector", vectorr: "vector", victor: "vector", vecter: "vector", vt: "vector", rb: "robot", rbt: "robot", robo: "robot",
    wf: "wifi", wiffi: "wifi", wifii: "wifi", gpt4: "gpt", sever: "server", sevrer: "server",
    /* cảm ơn */ tks: "cam on", thks: "cam on", thx: "cam on", camon: "cam on"
  };
  var STOP = {};
  ("a ah ak o oi nhe nha nhen vay the thi la cua va voi cho minh em anh chi ban shop ad admin toi " +
   "can hoi xin giup duoc khong co gi nao nhu nay do de se da dang rat roi nua di ma thoi luon cai con " +
   "mot nhung cac ve tu tren o trong ra len xuong bi hay hoac neu thi nhieu it qua lam ha hả").split(" ").forEach(function (w) { STOP[w] = 1; });

  function deaccent(s) {
    /* "chó" (con chó) và "cho" (cho mình) giống nhau khi bỏ dấu → đánh dấu riêng chữ "chó" */
    return String(s || "").toLowerCase().normalize("NFC").replace(/chó/g, " chos ").replace(/(^|\s)h(ông|ổng|ôg|ôk)(?=\s|$|[?.!,])/g, "$1khong").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d");
  }
  function norm(s) {
    s = deaccent(s).replace(/[^a-z0-9]+/g, " ").trim();
    if (!s) return "";
    s = s.split(" ").map(function (w) {
      if (ABBR.hasOwnProperty(w)) return ABBR[w];
      var m = w.match(/^(\d+)(h|k|tr)$/);
      if (m) return m[1] + " " + { h: "gio", k: "nghin", tr: "trieu" }[m[2]];
      return w;
    }).join(" ");
    /* Gõ không dấu: "có hông", "được hông" ở cuối câu là "có không" (không phải "hỏng") */
    s = s.replace(/(^| )(co|duoc|phai|chua|dung|ok|ban) hong(?=( shop| ad| a| vay| ban| em| anh| chi| nha| nhe)?$)/, "$1$2 khong");
    /* "giá nhiêu", "nhiêu tiền" = giá bao nhiêu */
    s = s.replace(/(^| )(gia|het|mat) nhieu( |$)/g, "$1$2 bao nhieu$3").replace(/(^| )nhieu tien( |$)/g, "$1bao nhieu tien$2");
    return s;
  }
  function rawText(s) {
    return " " + String(s || "").toLowerCase().normalize("NFC").replace(/[^\p{L}\p{N}]+/gu, " ") + " ";
  }

  /* Đặc trưng: từ đơn (bỏ từ vô nghĩa), cặp từ liền nhau, mẩu 4 chữ cái (chịu được gõ sai) */
  function feats(text) {
    var toks = norm(text).split(" ").filter(Boolean), f = {};
    function add(k, v) { f[k] = (f[k] || 0) + v; }
    toks.forEach(function (w, i) {
      if (!STOP[w]) add("w:" + w, 1);
      if (i > 0 && !(STOP[w] && STOP[toks[i - 1]])) add("b:" + toks[i - 1] + "_" + w, 1);
      if (w.length >= 5 && !STOP[w]) for (var j = 0; j + 4 <= w.length; j++) add("c:" + w.substr(j, 4), 0.3);
    });
    return f;
  }

  var INDEX = null;
  function build() {
    var docs = [], df = {}, N = 0;
    KB.forEach(function (it) {
      it.kn = (it.k || []).map(norm);
      (it.ex || []).concat([it.q || ""]).forEach(function (e) {
        if (!e) return;
        var f = feats(e); N++;
        Object.keys(f).forEach(function (k) { df[k] = (df[k] || 0) + 1; });
        docs.push({ id: it.id, f: f });
      });
    });
    var idf = {};
    Object.keys(df).forEach(function (k) { idf[k] = Math.log(1 + N / df[k]); });
    docs.forEach(function (d) { d.v = vec(d.f, idf); });
    INDEX = { docs: docs, idf: idf, N: N, unk: Math.log(1 + N) };
  }
  /* unk: với câu khách hỏi, từ chưa gặp bao giờ vẫn tính vào độ dài → câu lạc đề sẽ ít giống */
  function vec(f, idf, unk) {
    var v = {}, n = 0;
    Object.keys(f).forEach(function (k) {
      var w = idf[k] || (unk && k[0] === "w" ? unk : 0); if (!w) return;
      var x = f[k] * w * (k[0] === "b" ? 1.4 : 1); v[k] = x; n += x * x;
    });
    n = Math.sqrt(n) || 1;
    Object.keys(v).forEach(function (k) { v[k] /= n; });
    return v;
  }
  function cos(a, b) {
    var s = 0;
    for (var k in a) if (b[k]) s += a[k] * b[k];
    return s;
  }

  /* Tin nhắn chỉ gồm từ xác nhận: "ok", "oke nhé", "dạ được rồi"... */
  var ACKW = " ok oke okay okie oki okee okela okla oce vang da u um uhm roi duoc nhe nha nhen a shop ad admin ban em anh chi oi vay the thoi luon dong y nhieu ";
  function isAck(n) {
    var w = n.split(" ");
    return w.length <= 6 && w.some(function (x) { return /^(ok|oke|okay|okie|oki|okee|okela|okla|oce|vang|u|um|uhm|duoc|roi|da)$/.test(x); }) &&
      w.every(function (x) { return ACKW.indexOf(" " + x + " ") >= 0; });
  }

  /* Ngưỡng: trên HIGH trả lời luôn; giữa MID và HIGH hỏi lại bằng gợi ý; dưới MID chuyển Zalo */
  var CFG = { kw: 0.15, high: 0.42, mid: 0.24 };

  function analyze(text) {
    if (!INDEX) build();
    var n = norm(text);
    if (!n) return { ranked: [], hit: {} };
    if (isAck(n)) return { ranked: [{ id: "ack", s: 1 }], hit: {}, ack: true };
    var t = " " + n + " ", raw = rawText(text), qf = feats(text), q = vec(qf, INDEX.idf, INDEX.unk);
    var content = Object.keys(qf).filter(function (k) { return k[0] === "w"; });
    var known = content.filter(function (k) { return INDEX.idf[k]; }).length;
    var sim = {}, hit = {};
    INDEX.docs.forEach(function (d) {
      var c = cos(q, d.v);
      if (!sim[d.id] || c > sim[d.id]) sim[d.id] = c;
    });
    var ranked = KB.map(function (it) {
      var kw = 0;
      (it.kn || []).forEach(function (k) { if (k && t.indexOf(" " + k + " ") >= 0) kw += k.split(" ").length; });
      (it.kr || []).forEach(function (k) { if (raw.indexOf(" " + k + " ") >= 0) kw += 2; });
      kw *= it.w || 1;
      if (kw > 0) hit[it.id] = kw;
      return { id: it.id, s: (sim[it.id] || 0) + CFG.kw * Math.min(kw, 6), kw: kw, sim: sim[it.id] || 0 };
    }).filter(function (r) { return r.id !== "ack"; }).sort(function (a, b) { return b.s - a.s; });
    /* Nhắc tên robot hãng khác (Loona, EMO) → trả lời theo robot đó */
    if (hit.loona && ranked[0].id !== "loona" && !hit.price) { var lo = ranked.filter(function (r) { return r.id === "loona"; })[0]; ranked.splice(ranked.indexOf(lo), 1); ranked.unshift(lo); }
    /* Phí AI hằng tháng: "tháng trả bao nhiêu tiền cho AI" → chi phí AI, không phải bảng giá */
    function lift(id) { var x = ranked.filter(function (r) { return r.id === id; })[0]; if (x) { ranked.splice(ranked.indexOf(x), 1); x.s = Math.max(x.s, CFG.high); ranked.unshift(x); } }
    if (hit.aicost && hit.price && !hit.xiaozhi) lift("aicost");
    /* Hỏi thời gian giao hàng → giao hàng */
    if (hit.shipping && hit.time) lift("shipping");
    /* Tên chó robot của hãng (CyberDog, Unitree, Petoi...) → chó robot */
    if (/(^| )(cyberdog|unitree|go2|bittle|petoi)( |$)/.test(n) && !hit.price) lift("dog");
    /* Hỏi phí của Xiaozhi → chủ đề riêng */
    if (hit.xiaozhi && (hit.aicost || hit.price)) { var xf = ranked.filter(function (r) { return r.id === "xiaozhifree"; })[0]; ranked.splice(ranked.indexOf(xf), 1); xf.s = Math.max(xf.s, CFG.high); ranked.unshift(xf); }
    /* "Xin chào, cho hỏi giá..." → trả lời phần câu hỏi */
    if (ranked[0] && ranked[0].id === "greet" && ranked[1] && ranked[1].s >= CFG.mid) ranked.shift();
    /* Hỏi giá kèm tên dịch vụ ("sửa vector giá bao nhiêu") → ưu tiên trả lời giá */
    var pricey = /(^| )(gia|tien|chi phi|bao gia)( |$)/.test(n);
    var generic = { services: 1, about: 1, greet: 1, compliment: 1 };
    if (hit.price && ranked[0] && ranked[0].id !== "price" && ranked[0].id !== "stock" &&
        (BY_ID[ranked[0].id].topic || (pricey && generic[ranked[0].id]))) {
      var p = ranked.filter(function (r) { return r.id === "price"; })[0];
      if (p && p.s >= CFG.mid) { ranked.splice(ranked.indexOf(p), 1); ranked.unshift(p); }
    }
    return { ranked: ranked, hit: hit, cover: content.length ? known / content.length : 1, words: content.length };
  }

  function match(text) {
    var r = analyze(text), top = r.ranked[0];
    if (!top) return { kind: "none", hit: r.hit };
    if (r.ack) return { kind: "answer", it: BY_ID.ack, hit: {} };
    /* Câu có nhiều từ lạ mà điểm chưa thật cao → hỏi lại cho chắc, không đoán bừa */
    var sure = top.s >= CFG.high && !(r.cover < 0.6 && top.s < 0.9) &&
      /* Câu quá chung chung ("dùng được không shop") mà không có từ khoá → hỏi lại */
      !(r.words <= 1 && !top.kw && top.s < 0.8);
    if (sure) return { kind: "answer", it: BY_ID[top.id], hit: r.hit, score: top.s };
    if (top.s >= CFG.mid) {
      var opts = r.ranked.filter(function (x) { return x.s >= CFG.mid * 0.75 && x.id !== "greet"; }).slice(0, 3).map(function (x) { return x.id; });
      if (opts.length === 1 || (r.ranked[1] && top.s - r.ranked[1].s > 0.12)) return { kind: "answer", it: BY_ID[top.id], hit: r.hit, score: top.s };
      return { kind: "clarify", opts: opts, hit: r.hit, score: top.s };
    }
    return { kind: "none", hit: r.hit, score: top.s };
  }

  /* Tách tin nhắn có nhiều câu hỏi: "giá bao nhiêu? bảo hành mấy tháng?" */
  function splitQ(text) {
    return String(text).split(/[?\n;]+|\s+(?:với lại|còn nữa|ngoài ra)\s+/i).map(function (s) { return s.trim(); })
      .filter(function (s) { return norm(s).split(" ").length >= 2; });
  }
  function matchMany(text) {
    var parts = splitQ(text);
    if (parts.length < 2) return [match(text)];
    var out = [], seen = {};
    parts.forEach(function (p) {
      var m = match(p);
      if (m.kind === "answer" && !seen[m.it.id] && out.length < 3) { seen[m.it.id] = 1; out.push(m); }
    });
    return out.length >= 2 ? out : [match(text)];
  }

  var ENGINE = { match: match, matchMany: matchMany, analyze: analyze, norm: norm, KB: KB, CFG: CFG };
  if (typeof document === "undefined") { if (typeof module !== "undefined") module.exports = ENGINE; return; }

  /* ================= GIAO DIỆN ================= */
  var script = document.currentScript;
  var BASE = script ? script.src.replace(/assets\/js\/chatbot\.js.*$/, "") : "";
  var STORE_KEY = "jrbot.v2";

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

  var state = { log: [], last: "", greeted: false, teased: false };
  try { var saved = JSON.parse(sessionStorage.getItem(STORE_KEY) || "null"); if (saved && saved.log) state = saved; } catch (e) {}
  function save() {
    try { state.log = state.log.slice(-40); sessionStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) {}
  }

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
      var it = BY_ID[id];
      if (!it || !it.q) return;
      var b = el("button", "jrbot__chip");
      b.type = "button";
      b.textContent = it.q;
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

  var busy = false, queue = [];
  function botSay(m, chips) {
    queue.push([m, chips]);
    if (!busy) next();
  }
  function next() {
    var job = queue.shift();
    if (!job) { busy = false; return; }
    busy = true;
    var m = job[0], chips = job[1];
    var old = log.querySelector(".jrbot__chips");
    if (old) old.parentNode.removeChild(old);
    var typing = el("div", "jrbot__row jrbot__row--bot jrbot__typing-row",
      '<div class="jrbot__msg jrbot__msg--bot jrbot__typing" aria-label="Đang trả lời"><i></i><i></i><i></i></div>');
    log.appendChild(typing);
    scrollEnd();
    var len = (m.html || "").replace(/<[^>]+>/g, "").length;
    setTimeout(function () {
      if (typing.parentNode) typing.parentNode.removeChild(typing);
      push(m, queue.length ? [] : (chips || []));
      next();
    }, reduce ? 150 : Math.min(400 + len * 2, 1100));
  }

  function answer(it, ctx) {
    var html = typeof it.a === "function" ? it.a(ctx) : it.a;
    if (it.topic) state.last = it.topic;
    botSay({ who: "bot", html: html, acts: it.act || [], id: it.id }, it.chips || (it.id === "greet" ? MAIN_CHIPS : ["contact", "services"]));
  }

  function clarify(opts) {
    botSay({ who: "bot", html: "Dạ, em chưa chắc anh/chị đang hỏi ý nào. Anh/chị chọn giúp em một mục bên dưới, hoặc gõ lại rõ hơn một chút ạ.", id: "clarify" }, opts.concat(["contact"]));
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
    var res = matchMany(text);
    if (res.length > 1) { res.forEach(function (r) { answer(r.it, { hit: r.hit, last: state.last }); }); return; }
    var r = res[0];
    if (r.kind === "answer") answer(r.it, { hit: r.hit, last: state.last });
    else if (r.kind === "clarify") clarify(r.opts);
    else fallback(text);
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

  /* Trang Liên hệ: điền sẵn câu hỏi khách gửi từ trợ lý */
  try {
    var qs = new URLSearchParams(location.search).get("msg");
    var box = document.getElementById("c-nd");
    if (qs && box && !box.value) box.value = "Câu hỏi gửi từ trợ lý trên web: " + qs.slice(0, 500);
  } catch (e) {}

  function mount() {
    document.body.appendChild(root);
    restore();
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
  G.JRBot = {
    match: function (t) { var r = match(t); return r.kind === "answer" ? r.it.id : r.kind === "clarify" ? "?" + r.opts.join(",") : null; },
    analyze: analyze, open: open, close: close
  };
})(typeof window !== "undefined" ? window : globalThis);
