<script>
document.addEventListener("DOMContentLoaded", async function () {
  const params = new URLSearchParams(window.location.search);
  const category = params.get("category");
  const file = params.get("file");
  const container = document.getElementById("request-details");

  if (!category || !file) {
    container.innerHTML = "<div style='text-align:center; color:#e74c3c;'>❌ لم يتم تحديد الطلب</div>";
    return;
  }

  try {
    const res = await fetch(`/samsar-talabak/data/requests/${category}/${file}`);
    const req = await res.json();
    const shareURL = window.location.href;

    const title = req.title || "طلب عقاري";
    const area = req.area || "غير محددة";
    const budget = req.budget || "غير محددة";
    const description = req.description || "لا يوجد تفاصيل إضافية";
    const date = req.date || "غير متوفر";

    container.innerHTML = `
      <div style="max-width: 800px; margin: 0 auto; padding: 24px; background: #ffffff; border-radius: 12px; 
                  box-shadow: 0 4px 16px rgba(0,0,0,0.06); font-family: 'Tajawal', sans-serif; color: #333;">
        
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 14px; margin-bottom: 1.5rem;">
          <div style="display: flex; align-items: center; gap: 14px;">
            <img src="https://i.postimg.cc/Vk8Nn1xZ/me.jpg" alt="شعار سمسار طلبك" 
                 style="width: 52px; height: 52px; border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,0.2);">
            <h1 style="font-size: 1.9rem; color: #00aa66; margin: 0;">${title}</h1>
          </div>
          <button id="share-btn"
            style="background: none; border: none; cursor: pointer; font-size: 1.6rem; padding: 4px;">📤</button>
        </div>

        <div style="line-height: 1.8;">
          <p><strong>🔍 نوع الطلب:</strong> ${category}</p>
          <p><strong>📏 المساحة المطلوبة:</strong> ${area}</p>
          <p><strong>💰 الميزانية:</strong> ${budget}</p>
          <p><strong>📝 التفاصيل:</strong> ${description}</p>
          <p style="font-size: 1rem; color: #666; margin-top: 1rem;">
            📅 <strong>تاريخ الإضافة:</strong> ${date}
          </p>
        </div>

        <div style="display: flex; flex-wrap: wrap; gap: 14px; margin-top: 2rem;">
          <a href="/samsar-talabak/requests-filtered.html"
             style="flex: 1 1 180px; text-align: center; background-color: #2c3e50; color: white;
                    padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: bold;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.2);">
            ← العودة للطلبات
          </a>

          <a href="https://wa.me/201147758857?text=أرى طلبك بعنوان: ${encodeURIComponent(title)}"
             target="_blank"
             style="flex: 1 1 180px; text-align: center; background-color: #25D366; color: white;
                    padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: bold;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
            💬 لدي عرض مشابه – تواصل
          </a>
        </div>
      </div>
    `;

    // زر المشاركة مع إشعار toast
    const shareBtn = document.getElementById("share-btn");
    if (shareBtn) {
      shareBtn.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(shareURL);

          // toast
          const toast = document.createElement("div");
          toast.textContent = "✅ تم نسخ رابط الطلب";
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
          console.error("❌ فشل في نسخ الرابط:", err);
        }
      });
    }

  } catch (err) {
    console.error("❌ فشل في جلب تفاصيل الطلب:", err);
    container.innerHTML = "<div style='text-align:center; color:#e74c3c;'>❌ حدث خطأ أثناء تحميل بيانات الطلب</div>";
  }
});
</script>
