<script>
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
    const pageUrl = window.location.href;

    // تهيئة القيم الافتراضية
    const title = prop.title || "عرض عقاري";
    const price = prop.price || 
                  `${prop.price_monthly || "؟"} جنيه شهريًا / ${prop.price_daily || "؟"} جنيه يوميًا`;
    const area = prop.area || "غير محددة";
    const description = prop.description || "لا يوجد وصف متاح حاليًا";
    const whatsapp = prop.whatsapp || "201147758857";

    container.innerHTML = `
      <div style="max-width: 800px; margin: 0 auto; padding: 24px; background: #ffffff; border-radius: 12px;
                  box-shadow: 0 4px 16px rgba(0,0,0,0.06); font-family: 'Tajawal', sans-serif; color: #333;">
        <h1 style="font-size: 1.9rem; color: #00aa66; margin-bottom: 1rem;">${title}</h1>
        <div style="font-size: 1.4rem; color: #e74c3c; font-weight: bold; margin-bottom: 1.2rem;">
          ${price}
        </div>

        <p style="margin-bottom: 0.6rem;"><strong>📏 المساحة:</strong> ${area}</p>
        <p style="margin-bottom: 1.5rem;"><strong>📝 الوصف:</strong> ${description}</p>

        <div style="display: flex; gap: 14px; flex-wrap: wrap;">
          <a href="https://wa.me/${whatsapp}?text=أريد الاستفسار عن ${encodeURIComponent(title)}"
             target="_blank"
             style="flex: 1; text-align: center; background-color: #25D366; color: white; 
                    padding: 12px 20px; border-radius: 8px; text-decoration: none; 
                    font-weight: bold; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
            تواصل عبر واتساب
          </a>

          <button id="share-button"
            style="flex: 0 0 60px; background-color: #00aa66; color: white; 
                   padding: 12px 0; border: none; border-radius: 8px; cursor: pointer; 
                   font-size: 1.4rem; box-shadow: 0 1px 4px rgba(0,0,0,0.1);">
            📤
          </button>
        </div>
      </div>

      <div style="text-align:center; margin-top: 2.5rem;">
        <a href="properties-filtered.html"
           style="display: inline-block; background-color: #2c3e50; color: white; 
                  padding: 12px 24px; border-radius: 8px; text-decoration: none; 
                  font-weight: bold; box-shadow: 0 2px 8px rgba(0,0,0,0.2);">
          ← العودة لكل العقارات
        </a>
      </div>
    `;

    // التعامل مع زر المشاركة
    const shareBtn = document.getElementById("share-button");
    if (shareBtn) {
      shareBtn.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(pageUrl);

          // انشاء عنصر إشعار مؤقت
          const toast = document.createElement("div");
          toast.textContent = "✅ تم نسخ رابط العقار";
          toast.style.position = "fixed";
          toast.style.bottom = "30px";
          toast.style.right = "30px";
          toast.style.background = "#00aa66";
          toast.style.color = "white";
          toast.style.padding = "10px 16px";
          toast.style.borderRadius = "8px";
          toast.style.fontWeight = "bold";
          toast.style.zIndex = "999";

          document.body.appendChild(toast);

          setTimeout(() => {
            document.body.removeChild(toast);
          }, 2000);

        } catch (err) {
          console.error("فشل في نسخ الرابط:", err);
          shareBtn.textContent = "❌";
          shareBtn.style.backgroundColor = "#aa0000";

          setTimeout(() => {
            shareBtn.textContent = "📤";
            shareBtn.style.backgroundColor = "#00aa66";
          }, 3000);
        }
      });
    }

  } catch (err) {
    console.error("❌ فشل في تحميل بيانات العقار:", err);
    container.innerHTML = "<div style='text-align:center; color:#e74c3c;'>❌ حدث خطأ أثناء تحميل بيانات العقار</div>";
  }
});
</script>
