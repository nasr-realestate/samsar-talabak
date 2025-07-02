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
    const req = await res.json();

    const pageUrl = window.location.href;

    container.innerHTML = `
      <div>
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 1.2rem;">
          <img src="https://i.postimg.cc/Vk8Nn1xZ/me.jpg" alt="شعار سمسار طلبك" style="width: 48px; height: 48px; border-radius: 50%;">
          <h1 style="font-size: 1.8rem; color: #00aa66; margin: 0;">${req.title}</h1>
        </div>

        <p style="font-size: 1.1rem;"><strong>🔍 نوع الطلب:</strong> ${category || 'غير محدد'}</p>
        <p style="font-size: 1.1rem;"><strong>📏 المساحة المطلوبة:</strong> ${req.area || 'غير محددة'}</p>
        <p style="font-size: 1.1rem;"><strong>💰 الميزانية:</strong> ${req.budget || 'غير محددة'}</p>
        <p style="font-size: 1.1rem;"><strong>📝 التفاصيل:</strong> ${req.description}</p>
        <p style="font-size: 1rem; color: #666; margin-top: 1rem;">📅 <strong>تاريخ الإضافة:</strong> ${req.date || 'غير متوفر'}</p>

        <div style="display: flex; gap: 12px; margin-top: 2rem; flex-wrap: wrap;">
          <button onclick="shareRequest('${pageUrl}')" 
            style="flex: 1; background-color: #00ff88; color: #000; padding: 12px 20px; border-radius: 8px; font-weight: bold; border: none; cursor: pointer;">
            🔗 مشاركة الطلب
          </button>

          <a href="/samsar-talabak/requests-filtered.html"
             style="flex: 1; text-align: center; background-color: #444; color: white; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: bold;">
            ← العودة للطلبات
          </a>
        </div>
      </div>
    `;
  } catch (err) {
    console.error("فشل في جلب تفاصيل الطلب:", err);
    container.innerHTML = "❌ حدث خطأ أثناء تحميل بيانات الطلب.";
  }
});

// ✅ دالة المشاركة
function shareRequest(link) {
  if (navigator.share) {
    navigator.share({
      title: "طلب عقاري في مدينة نصر",
      text: "اطّلع على هذا الطلب العقاري من سمسار طلبك 👇",
      url: link
    }).then(() => {
      console.log("✅ تمت المشاركة بنجاح");
    }).catch((error) => {
      console.error("❌ فشل المشاركة:", error);
    });
  } else {
    prompt("انسخ الرابط وشاركه يدويًا:", link);
  }
}
