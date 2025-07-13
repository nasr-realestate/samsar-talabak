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
    const data = await res.json();

    const title = data.title || "تفاصيل الطلب";
    const pageURL = window.location.href;

    container.innerHTML = `
      <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 1.5rem;">
        <img src="https://i.postimg.cc/Vk8Nn1xZ/me.jpg" alt="شعار سمسار طلبك"
             style="width: 52px; height: 52px; border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,0.2);">
        <h1 style="font-size: 1.9rem; color: #00aa66; margin: 0;">${title}</h1>
      </div>

      <div style="line-height: 1.8; font-size: 1.1rem;">
        <p><strong>📏 المساحة المطلوبة:</strong> ${data.area || 'غير محددة'}</p>
        <p><strong>💰 الميزانية:</strong> ${data.budget || 'غير محددة'}</p>
        <p><strong>🛏️ عدد الغرف:</strong> ${data.rooms ?? 'غير محدد'}</p>
        <p><strong>🛁 عدد الحمامات:</strong> ${data.bathrooms ?? 'غير محدد'}</p>
        <p><strong>🏢 الدور:</strong> ${data.floor ?? 'غير محدد'}</p>
        <p><strong>🛗 مصعد:</strong> ${data.elevator ? 'ضروري' : 'غير ضروري'}</p>
        <p><strong>🚗 جراج:</strong> ${data.garage ? 'يفضّل وجوده' : 'غير مهم'}</p>
        <p><strong>🎨 التشطيب:</strong> ${data.finish || 'غير محدد'}</p>
        <p><strong>🧭 الاتجاه:</strong> ${data.direction || 'غير محدد'}</p>
        <p><strong>📌 تفاصيل إضافية:</strong> ${data.more_details || 'لا يوجد'}</p>
        <p style="color:#666; font-size: 0.95rem; margin-top: 1rem;">
          📅 <strong>تاريخ الإضافة:</strong> ${data.date || 'غير متوفر'}
        </p>
      </div>

      <div style="display: flex; gap: 14px; margin-top: 2rem; flex-wrap: wrap;">
        <a href="https://wa.me/201147758857?text=أرى طلبك بعنوان: ${encodeURIComponent(title)}"
           target="_blank"
           style="flex: 1; text-align: center; background-color: #25D366; color: white; padding: 12px 20px;
                  border-radius: 8px; text-decoration: none; font-weight: bold;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
          لدي عرض كهذا – واتساب
        </a>

        <button onclick="copyToClipboard('${pageURL}')"
                style="flex: 0; background-color: #f1f1f1; border: none; padding: 12px; border-radius: 8px;
                       cursor: pointer; font-size: 1.2rem; box-shadow: 0 1px 4px rgba(0,0,0,0.1);"
                title="انسخ رابط الطلب">
          📤
        </button>
      </div>
    `;
  } catch (err) {
    console.error("فشل في جلب تفاصيل الطلب:", err);
    container.innerHTML = "<div style='text-align:center; color:#e74c3c;'>❌ حدث خطأ أثناء تحميل بيانات الطلب</div>";
  }
});

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    const toast = document.getElementById("copy-toast");
    toast.style.display = "block";
    setTimeout(() => { toast.style.display = "none"; }, 2000);
  });
      }
