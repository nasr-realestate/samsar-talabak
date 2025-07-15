document.addEventListener("DOMContentLoaded", async function () {
  const container = document.getElementById("offers-container");

  const categories = {
    "apartments": "شقق للبيع",
    "apartments-rent": "شقق للإيجار",
    "shops": "محلات",
    "offices": "مكاتب",
    "admin-hq": "مقرات إدارية"
  };

  for (const category of Object.keys(categories)) {
    const response = await fetch(`/samsar-talabak/data/properties/${category}/index.json`);
    const files = await response.json();

    for (const filename of files) {
      const res = await fetch(`/samsar-talabak/data/properties/${category}/${filename}`);
      const data = await res.json();

      const encodedFilename = encodeURIComponent(filename);
      const detailPage = `/samsar-talabak/offer-details.html?category=${category}&file=${encodedFilename}`;

      const card = document.createElement("div");
      card.className = `property-card card-${category}`;
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
      `;

      card.addEventListener("click", () => {
        localStorage.setItem("highlightCard", filename);
      });

      card.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 1rem;">
          <img src="https://i.postimg.cc/Vk8Nn1xZ/me.jpg" alt="شعار" style="width: 40px; height: 40px; border-radius: 50%;">
          <strong style="color:#00ff88;">عرض جديد</strong>
        </div>
        <h2 style="color:#00ff88; font-size: 1.4rem; font-weight: bold; margin-bottom: 0.5rem;">
          ${data.title}
        </h2>
        <p><strong>🏷️ السعر:</strong> ${data.price}</p>
        <p><strong>📏 المساحة:</strong> ${data.area}</p>
        <p><strong>🛏️ الغرف:</strong> ${data.rooms}</p>
        <p><strong>🛁 الحمامات:</strong> ${data.bathrooms}</p>
        <p><strong>📅 تاريخ الإضافة:</strong> ${data.date || "غير متوفر"}</p>
        <p style="margin: 0.5rem 0; color:#ccc;"><strong>📝 التفاصيل:</strong> ${data.description}</p>
        <div style="margin-top: 1rem;">
          <a href="${detailPage}" 
            style="background:#00ff88; color:#000; padding: 0.6rem 1.2rem; border-radius: 8px; text-decoration: none; font-weight: bold;">
            👀 عرض التفاصيل
          </a>
        </div>
      `;

      const highlighted = localStorage.getItem("highlightCard");
      if (highlighted === filename) {
        card.style.outline = "3px solid #00ff88";
        card.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      container.appendChild(card);
    }
  }
});
