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

    const title = prop.title || "تفاصيل العرض";
    const price = prop.price || "غير محدد";
    const whatsapp = prop.whatsapp || "201147758857";
    const pageURL = window.location.href;

    container.innerHTML = `
      <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 1.5rem;">
        <img src="https://i.postimg.cc/Vk8Nn1xZ/me.jpg" alt="شعار سمسار طلبك"
             style="width: 52px; height: 52px; border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,0.2);">
        <h1 style="font-size: 1.9rem; color: #00aa66; margin: 0;">${title}</h1>
      </div>

      <p style="font-size: 1.4rem; color: #e74c3c; font-weight: bold; margin: 0 0 1.2rem;">
        💰 ${price}
      </p>

      <div style="line-height: 1.8; font-size: 1.1rem;">
        <p><strong>📏 المساحة:</strong> ${prop.area || 'غير محددة'}</p>
        <p><strong>🛏️ عدد الغرف:</strong> ${prop.rooms ?? 'غير محدد'}</p>
        <p><strong>🛁 عدد الحمامات:</strong> ${prop.bathrooms ?? 'غير محدد'}</p>
        <p><strong>🏢 الدور:</strong> ${prop.floor ?? 'غير محدد'}</p>
        <p><strong>🛗 يوجد مصعد:</strong> ${prop.elevator ? 'نعم' : 'لا'}</p>
        <p><strong>🚗 جراج:</strong> ${prop.garage ? 'متوفر' : 'غير متوفر'}</p>
        <p><strong>🎨 التشطيب:</strong> ${prop.finish || 'غير محدد'}</p>
        <p><strong>🧭 الاتجاه:</strong> ${prop.direction || 'غير محدد'}</p>
        <p><strong>📝 الوصف:</strong> ${prop.description || 'لا يوجد وصف'}</p>
        <p><strong>📌 تفاصيل إضافية:</strong> ${prop.more_details || 'لا يوجد'}</p>
        <p style="color:#666; font-size: 0.95rem; margin-top: 1rem;">
          📅 <strong>تاريخ الإضافة:</strong> ${prop.date || 'غير متوفر'}
        </p>
      </div>

      <div style="display: flex; gap: 14px; margin-top: 2rem; flex-wrap: wrap;">
        <a href="https://wa.me/${whatsapp}?text=أريد الاستفسار عن ${encodeURIComponent(title)}"
           target="_blank"
           style="flex: 1; text-align: center; background-color: #25D366; color: white; padding: 12px 20px;
                  border-radius: 8px; text-decoration: none; font-weight: bold;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
          تواصل عبر واتساب
        </a>

        <button onclick="copyToClipboard('${pageURL}')"
                style="flex: 0; background-color: #f1f1f1; border: none; padding: 12px; border-radius: 8px;
                       cursor: pointer; font-size: 1.2rem; box-shadow: 0 1px 4px rgba(0,0,0,0.1);"
                title="انسخ رابط العرض">
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
