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
    const data = await res.json();

    container.innerHTML = `
      <div style="max-width: 800px; margin: 40px auto; padding: 24px; background: #fff; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); font-family: 'Tajawal', sans-serif; color: #2c3e50;">
        <h1 style="font-size: 1.8rem; color: #00b894; margin-bottom: 1rem;">${data.title}</h1>

        <p><strong>🔍 نوع الطلب:</strong> ${category}</p>
        <p><strong>📏 المساحة المطلوبة:</strong> ${data.area || 'غير محددة'}</p>
        <p><strong>💰 الميزانية:</strong> ${data.budget || 'غير محددة'}</p>

        ${data.floor ? `<p><strong>🏢 الدور المطلوب:</strong> ${data.floor}</p>` : ''}
        ${data.direction ? `<p><strong>🧭 الاتجاه:</strong> ${data.direction}</p>` : ''}
        ${data.date_added ? `<p><strong>📅 تاريخ الإضافة:</strong> ${data.date_added}</p>` : ''}
        ${data.contact ? `<p><strong>📞 وسيلة تواصل:</strong> ${data.contact}</p>` : ''}

        <p style="margin-top: 1rem;"><strong>📝 تفاصيل إضافية:</strong> ${data.description || 'لا يوجد'}</p>
        ${data.notes ? `<p><strong>📌 ملاحظات:</strong> ${data.notes}</p>` : ''}

        <a href="https://wa.me/201147758857?text=أرى طلبك بعنوان: ${encodeURIComponent(data.title)}"
           target="_blank"
           style="display:inline-block; background-color:#25D366; color:white; padding:12px 24px; border-radius:6px; text-decoration:none; font-weight:bold; font-size:1.1rem; margin-top:1.5rem;">
          لدي عرض كهذا – تواصل عبر واتساب
        </a>
        <br><br>
        <a href="requests-filtered.html" style="display:inline-block; margin-top:1rem; background-color:#2c3e50; color:white; padding:10px 20px; border-radius:6px; text-decoration:none;">
          ← العودة لكل الطلبات
        </a>
      </div>
    `;
  } catch (err) {
    console.error("فشل في جلب تفاصيل الطلب:", err);
    container.innerHTML = "❌ حدث خطأ أثناء تحميل تفاصيل الطلب.";
  }
});
