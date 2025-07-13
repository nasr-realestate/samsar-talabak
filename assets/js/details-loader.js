document.addEventListener("DOMContentLoaded", async function () {
  const params = new URLSearchParams(window.location.search);
  const category = params.get("category");
  const file = params.get("file");
  const container = document.getElementById("property-details");

  if (!category || !file) {
    container.innerHTML = "<div style='text-align:center; color:#e74c3c;'>❌ لم يتم تحديد العقار</div>";
    return;
  }

  try {
    const res = await fetch(`/samsar-talabak/data/properties/${category}/${file}`);
    const prop = await res.json();

    const title = prop.title || "عرض عقاري";
    const price = prop.price || `${prop.price_monthly || "؟"} شهريًا / ${prop.price_daily || "؟"} يوميًا`;
    const whatsapp = prop.whatsapp || "201147758857";
    const pageURL = window.location.href;

    container.innerHTML = `
      <h1 style="font-size: 2rem; color: #00aa66; margin-bottom: 0.5rem;">${title}</h1>
      <p style="font-size: 1.4rem; color: #e74c3c; font-weight: bold;">💰 ${price}</p>

      <ul style="line-height: 2; padding: 0; list-style: none;">
        ${prop.area ? `<li>📏 <strong>المساحة:</strong> ${prop.area}</li>` : ""}
        ${prop.rooms ? `<li>🛏️ <strong>عدد الغرف:</strong> ${prop.rooms}</li>` : ""}
        ${prop.bathrooms ? `<li>🚿 <strong>عدد الحمامات:</strong> ${prop.bathrooms}</li>` : ""}
        ${prop.floor ? `<li>🏢 <strong>الدور:</strong> ${prop.floor}</li>` : ""}
        ${prop.elevator !== undefined ? `<li>🛗 <strong>مصعد:</strong> ${prop.elevator ? "متوفر" : "غير متوفر"}</li>` : ""}
        ${prop.garage !== undefined ? `<li>🚗 <strong>جراج:</strong> ${prop.garage ? "متوفر" : "غير متوفر"}</li>` : ""}
        ${prop.finish ? `<li>🎨 <strong>التشطيب:</strong> ${prop.finish}</li>` : ""}
        ${prop.direction ? `<li>🧭 <strong>الاتجاه:</strong> ${prop.direction}</li>` : ""}
        ${prop.date ? `<li>📅 <strong>تاريخ الإضافة:</strong> ${prop.date}</li>` : ""}
      </ul>

      <div style="margin-top: 1rem;">
        <p><strong>📝 الوصف:</strong></p>
        <p>${prop.description || "لا يوجد وصف متاح حاليًا"}</p>
      </div>

      ${prop.more_details ? `
        <div style="margin-top: 1rem;">
          <p><strong>📌 تفاصيل إضافية:</strong></p>
          <p>${prop.more_details}</p>
        </div>
      ` : ""}

      ${prop.map_url ? `
        <div style="margin-top: 1rem;">
          <a href="${prop.map_url}" target="_blank" style="color:#2980b9;">📍 عرض الموقع على الخريطة</a>
        </div>
      ` : ""}

      ${prop.form_url ? `
        <div style="margin-top: 1rem;">
          <a href="${prop.form_url}" target="_blank" style="color:#8e44ad;">📝 نموذج الطلب</a>
        </div>
      ` : ""}

      <div style="display: flex; gap: 14px; margin-top: 2rem; flex-wrap: wrap;">
        <a href="https://wa.me/${whatsapp}?text=أريد الاستفسار عن ${encodeURIComponent(title)}"
           target="_blank"
           style="flex: 1; text-align: center; background-color: #25D366; color: white; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
          تواصل عبر واتساب
        </a>

        <button onclick="copyToClipboard('${pageURL}')" title="انسخ رابط العرض"
          style="flex: 0; background-color: #f1f1f1; border: none; padding: 12px; border-radius: 8px; cursor: pointer; font-size: 1.2rem; box-shadow: 0 1px 4px rgba(0,0,0,0.1);">
          📤
        </button>
      </div>
    `;

  } catch (err) {
    console.error("فشل في جلب تفاصيل العقار:", err);
    container.innerHTML = "<div style='text-align:center; color:#e74c3c;'>❌ حدث خطأ أثناء تحميل بيانات العقار</div>";
  }
});

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    const toast = document.getElementById("copy-toast");
    toast.style.display = "block";
    setTimeout(() => { toast.style.display = "none"; }, 2000);
  });
}
