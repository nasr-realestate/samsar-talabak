document.addEventListener("DOMContentLoaded", async function () {
  const params = new URLSearchParams(window.location.search);
  const category = params.get("category");
  const file = params.get("file");
  const container = document.getElementById("request-details");

  if (!category || !file) {
    container.innerHTML = "❌ لم يتم تحديد الطلب بشكل صحيح.";
    return;
  }

  try {
    const res = await fetch(`/samsar-talabak/data/requests/${category}/${file}`);
    const req = await res.json();

    container.innerHTML = `
      <h1 style="font-size: 1.8rem; color: #2c3e50;">${req.title}</h1>
      <div style="font-size: 1.4rem; color: #00aa88; margin: 1rem 0;">ميزانية: ${req.budget}</div>
      <p><strong>المساحة المطلوبة:</strong> ${req.area}</p>
      <p><strong>تفاصيل إضافية:</strong> ${req.description}</p>

      <a href="https://wa.me/${req.whatsapp || '201147758857'}?text=لدي عرض مناسب لهذا الطلب: ${encodeURIComponent(req.title)}"
         target="_blank"
         style="display:inline-block; background-color:#25D366; color:white; padding:12px 24px; border-radius:6px; text-decoration:none; font-weight:bold; font-size:1.1rem; margin-top:1.5rem;">
        📲 لدي عرض كهذا - تواصل عبر واتساب
      </a>

      <br><br>
      <a href="requests-filtered.html" style="display:inline-block; margin-top:1rem; background-color:#2c3e50; color:white; padding:10px 20px; border-radius:6px; text-decoration:none;">
        ← العودة إلى الطلبات
      </a>
    `;
  } catch (err) {
    console.error(err);
    container.innerHTML = "❌ حدث خطأ أثناء تحميل بيانات الطلب.";
  }
});
