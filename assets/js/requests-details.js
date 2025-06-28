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
      <h1 style="font-size: 1.8rem; color: #2c3e50;">${data.title}</h1>
      <p style="font-size: 1.2rem;"><strong>📏 المساحة المطلوبة:</strong> ${data.area}</p>
      <p style="font-size: 1.2rem;"><strong>💰 الميزانية:</strong> ${data.budget}</p>
      <p style="font-size: 1.2rem;"><strong>📝 التفاصيل:</strong> ${data.description}</p>

      <a href="https://wa.me/201147758857?text=مرحبًا، لدي عرض يناسب هذا الطلب بعنوان: ${encodeURIComponent(data.title)}"
         target="_blank"
         style="display:inline-block; background-color:#25D366; color:white; padding:12px 24px; border-radius:6px; text-decoration:none; font-weight:bold; font-size:1.1rem; margin-top:1.5rem;">
        ✅ لدي عرض كهذا
      </a>

      <br><br>

      <a href="requests-filtered.html"
         style="display:inline-block; background-color:#2c3e50; color:white; padding:10px 20px; border-radius:6px; text-decoration:none;">
        ← العودة إلى جميع الطلبات
      </a>
    `;
  } catch (err) {
    console.error(err);
    container.innerHTML = "❌ حدث خطأ أثناء تحميل بيانات الطلب.";
  }
});
