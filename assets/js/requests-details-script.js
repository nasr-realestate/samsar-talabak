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
    const currentURL = window.location.href;

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
          <a href="https://wa.me/201147758857?text=أرى طلبك بعنوان: ${encodeURIComponent(req.title)}"
             target="_blank"
             style="flex: 1; text-align: center; background-color:#25D366; color:white; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: bold;">
            لدي عرض كهذا – تواصل عبر واتساب
          </a>

          <button onclick="copyToClipboard('${currentURL}')"
            style="flex: 1; background-color:#00aa66; color:white; border:none; padding: 12px 20px; border-radius: 8px; font-weight: bold; cursor: pointer;">
            📤 مشاركة الطلب
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

// ✅ نسخ رابط الصفحة إلى الحافظة
function copyToClipboard(link) {
  navigator.clipboard.writeText(link).then(() => {
    const existingAlert = document.getElementById("copy-alert");
    if (existingAlert) existingAlert.remove();

    const alertBox = document.createElement("div");
    alertBox.id = "copy-alert";
    alertBox.textContent = "✅ تم نسخ رابط الصفحة";
    alertBox.style.cssText = `
      position: fixed;
      bottom: 30px;
      left: 50%;
      transform: translateX(-50%);
      background: #00aa66;
      color: #fff;
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: bold;
      z-index: 999;
      box-shadow: 0 0 8px rgba(0,0,0,0.2);
    `;
    document.body.appendChild(alertBox);
    setTimeout(() => alertBox.remove(), 2000);
  }).catch(err => {
    alert("❌ حدث خطأ أثناء نسخ الرابط");
    console.error(err);
  });
          }
