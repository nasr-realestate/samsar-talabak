<script>
document.addEventListener("DOMContentLoaded", async function () {
  const params = new URLSearchParams(window.location.search);
  const category = params.get("category");
  const file = params.get("file");
  const container = document.getElementById("property-details");

  if (!category || !file) {
    container.innerHTML = "❌ لم يتم تحديد الطلب.";
    return;
  }

  try {
    const res = await fetch(`/samsar-talabak/data/requests/${category}/${file}`);
    const req = await res.json();

    const message = `مرحبًا، لدي عرض مناسب لهذا الطلب: ${req.title}`;

    container.innerHTML = `
      <div style="max-width: 800px; margin: 40px auto; padding: 20px; background: #fff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); font-family: 'Tajawal', sans-serif; text-align: right;">
        <h1 style="font-size: 1.8rem; color: #2c3e50;">${req.title}</h1>
        <div style="font-size: 1.4rem; color: #16a085; margin: 1rem 0;">ميزانية العميل: ${req.budget || 'غير محددة'}</div>
        <p><strong>نوع الطلب:</strong> ${category}</p>
        <p><strong>المساحة المطلوبة:</strong> ${req.area || 'غير محددة'}</p>
        <p><strong>تفاصيل إضافية:</strong> ${req.description}</p>

        <a href="https://wa.me/201147758857?text=${encodeURIComponent(message)}"
           target="_blank"
           style="display:inline-block; background-color:#25D366; color:white; padding:12px 24px; border-radius:6px; text-decoration:none; font-weight:bold; font-size:1.1rem; margin-top:1.5rem;">
          📩 لدي عرض يناسب هذا الطلب
        </a>
        <br><br>
        <a href="requests-filtered.html"
           style="display:inline-block; margin-top:1rem; background-color:#2c3e50; color:white; padding:10px 20px; border-radius:6px; text-decoration:none;">
          ← العودة لكل الطلبات
        </a>
      </div>
    `;
  } catch (err) {
    console.error(err);
    container.innerHTML = "❌ حدث خطأ أثناء تحميل بيانات الطلب.";
  }
});
</script>
