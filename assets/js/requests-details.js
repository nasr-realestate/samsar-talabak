document.addEventListener("DOMContentLoaded", async function () {
  const params = new URLSearchParams(window.location.search);
  const category = params.get("category");
  const file = params.get("file");
  const container = document.getElementById("request-details");

  if (!category || !file) {
    container.innerHTML = "❌ لم يتم تحديد الطلب.";
    return;
  }

  try {
    const res = await fetch(`/samsar-talabak/data/requests/${category}/${file}`);
    const prop = await res.json();

    container.innerHTML = `
      <div style="max-width: 800px; margin: 40px auto; padding: 20px; background: #fff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); font-family: 'Tajawal', sans-serif;">
        <h1 style="font-size: 1.8rem; color: #2c3e50;">${prop.title}</h1>
        <p><strong>📏 المساحة المطلوبة:</strong> ${prop.area || 'غير محددة'}</p>
        <p><strong>💰 الميزانية:</strong> ${prop.budget || 'غير محددة'}</p>
        <p><strong>📝 التفاصيل:</strong> ${prop.description || 'لا توجد تفاصيل إضافية'}</p>

        <a href="https://wa.me/201147758857?text=📢 لدي عرض مناسب لهذا الطلب: ${encodeURIComponent(prop.title)}"
           target="_blank"
           style="display:inline-block; background-color:#25D366; color:white; padding:12px 24px; border-radius:6px; text-decoration:none; font-weight:bold; font-size:1.1rem; margin-top:1.5rem;">
          ✅ لدي عرض كهذا
        </a>

        <br><br>
        <a href="/samsar-talabak/requests-filtered.html" style="display:inline-block; margin-top:1rem; background-color:#2c3e50; color:white; padding:10px 20px; border-radius:6px; text-decoration:none;">
          ← العودة لكل الطلبات
        </a>
      </div>
    `;
  } catch (err) {
    console.error(err);
    container.innerHTML = "❌ حدث خطأ أثناء تحميل بيانات الطلب.";
  }
});
