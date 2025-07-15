document.addEventListener("DOMContentLoaded", async function () {
  const container = document.getElementById("properties-container");

  container.innerHTML = "<p style='text-align:center'>⏳ جاري تحميل العروض...</p>";

  const category = "apartments"; // أو يمكن تغييره لاحقاً لدعم الفئات المتعددة

  fetch(`/samsar-talabak/data/properties/${category}/index.json`)
    .then(response => response.json())
    .then(files => {
      container.innerHTML = '';
      if (!files.length) {
        container.innerHTML = "<p style='text-align:center'>لا توجد عروض حالياً.</p>";
        return;
      }

      files.forEach(filename => {
        fetch(`/samsar-talabak/data/properties/${category}/${filename}`)
          .then(res => res.json())
          .then(data => {
            const encodedFilename = encodeURIComponent(filename);
            const detailPage = `/samsar-talabak/details.html?category=${category}&file=${encodedFilename}`;
            const card = document.createElement("div");

            card.className = `property-card`;
            card.dataset.filename = filename;
            card.style = `
              background-color: #1e1e1e;
              border: 1px solid #333;
              padding: 1.5rem;
              border-radius: 12px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.3);
              margin-bottom: 1.5rem;
              font-family: 'Tajawal', sans-serif;
              color: #f1f1f1;
              transition: 0.3s;
            `;

            card.innerHTML = `
              <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 1rem;">
                <img src="https://i.postimg.cc/Vk8Nn1xZ/me.jpg" alt="شعار" style="width: 40px; height: 40px; border-radius: 50%;">
                <strong style="color:#00ff88;">سمسار طلبك</strong>
              </div>
              <h2 style="color:#00ff88; font-size: 1.4rem; font-weight: bold; margin-bottom: 0.5rem;">
                ${data.title}
              </h2>
              <p><strong>💰 السعر:</strong> ${data.price}</p>
              <p><strong>📏 المساحة:</strong> ${data.area}</p>
              <p><strong>📅 تاريخ الإضافة:</strong> ${data.date || "غير متوفر"}</p>
              <p style="margin: 0.5rem 0; color:#ccc;"><strong>📝 التفاصيل:</strong> ${data.description}</p>
              <div style="margin-top: 1rem;">
                <a href="${detailPage}" 
                  style="background:#00ff88; color:#000; padding: 0.6rem 1.2rem; border-radius: 8px; text-decoration: none; font-weight: bold;">
                  👁️ عرض التفاصيل
                </a>
              </div>
            `;

            // ✅ تمييز البطاقة عند النقر
            const highlighted = localStorage.getItem("highlightCard");
            if (highlighted === filename) {
              card.style.outline = "3px solid #00ff88";
              card.style.backgroundColor = "#172a1f";
              card.scrollIntoView({ behavior: "smooth", block: "center" });
            }

            container.appendChild(card);
          });
      });
    })
    .catch(err => {
      console.error(err);
      container.innerHTML = "<p style='text-align:center'>❌ حدث خطأ أثناء تحميل العروض.</p>";
    });
});
