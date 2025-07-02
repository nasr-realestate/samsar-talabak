document.addEventListener("DOMContentLoaded", async function () {
  const params = new URLSearchParams(window.location.search);
  const category = params.get("category");
  const file = params.get("file");
  const container = document.getElementById("property-details");

  if (!category || !file) {
    container.innerHTML = "❌ لم يتم تحديد العقار.";
    return;
  }

  try {
    const res = await fetch(`/samsar-talabak/data/properties/${category}/${file}`);
    const prop = await res.json();

    const pageUrl = window.location.href;

    container.innerHTML = `
      <div style="max-width: 800px; margin: 40px auto; padding: 20px; background: #fff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); font-family: 'Tajawal', sans-serif;">
        <h1 style="font-size: 1.8rem; color: #2c3e50;">${prop.title}</h1>
        <div style="font-size: 1.4rem; color: #e74c3c; margin: 1rem 0;">${prop.price || prop.price_monthly + " جنيه شهريًا / " + prop.price_daily + " جنيه يوميًا"}</div>
        <p><strong>المساحة:</strong> ${prop.area || 'غير محددة'}</p>
        <p><strong>الوصف:</strong> ${prop.description}</p>

        <div style="display: flex; gap: 12px; flex-wrap: wrap; margin-top: 2rem;">
          <a href="https://wa.me/${prop.whatsapp}?text=أريد الاستفسار عن ${encodeURIComponent(prop.title)}"
            target="_blank"
            style="flex: 1; text-align: center; background-color: #25D366; color: white; padding: 12px 20px; border-radius: 6px; text-decoration: none; font-weight: bold;">
            تواصل عبر واتساب
          </a>

          <button id="share-button"
            style="flex: 1; text-align: center; background-color: #00aa66; color: white; padding: 12px 20px; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">
            🔗 مشاركة العقار
          </button>
        </div>
      </div>

      <div style="text-align:center; margin-top: 2rem;">
        <a href="properties-filtered.html"
           style="display:inline-block; background-color:#2c3e50; color:white; padding:10px 20px; border-radius:6px; text-decoration:none;">
           ← العودة لكل العقارات
        </a>
      </div>
    `;

    // ✅ عند الضغط على زر المشاركة
    const shareBtn = document.getElementById("share-button");
    if (shareBtn) {
      shareBtn.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(pageUrl);
          shareBtn.textContent = "✅ تم نسخ الرابط";
          shareBtn.style.backgroundColor = "#00804b";

          setTimeout(() => {
            shareBtn.textContent = "🔗 مشاركة العقار";
            shareBtn.style.backgroundColor = "#00aa66";
          }, 3000);
        } catch (err) {
          console.error("فشل في نسخ الرابط:", err);
          shareBtn.textContent = "❌ لم يتم النسخ";
          shareBtn.style.backgroundColor = "#aa0000";
        }
      });
    }

  } catch (err) {
    console.error("❌ فشل في تحميل بيانات العقار:", err);
    container.innerHTML = "❌ حدث خطأ أثناء تحميل بيانات العقار.";
  }
});
