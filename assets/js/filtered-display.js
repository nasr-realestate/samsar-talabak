document.addEventListener("DOMContentLoaded", async function () {
  const container = document.getElementById("offers-container");
  const filterContainer = document.getElementById("filter-buttons");

  const categories = {
    "apartments": "شقق للبيع",
    "apartments-rent": "شقق للإيجار",
    "shops": "محلات",
    "offices": "مكاتب",
    "admin-hq": "مقرات إدارية"
  };

  for (const [key, label] of Object.entries(categories)) {
    const btn = document.createElement("button");
    btn.textContent = label;
    btn.dataset.category = key;
    btn.className = "filter-btn";
    btn.style = `
      background: #1f1f1f;
      color: #00ff88;
      border: 1px solid #00ff88;
      padding: 0.7rem 1.5rem;
      border-radius: 8px;
      font-size: 1rem;
      cursor: pointer;
    `;
    btn.addEventListener("click", () => loadCategory(key));
    filterContainer.appendChild(btn);
  }

  const defaultCategory = Object.keys(categories)[0];
  loadCategory(defaultCategory);

  function loadCategory(category) {
    container.innerHTML = "<p style='text-align:center'>⏳ جاري تحميل العروض...</p>";

    document.querySelectorAll(".filter-btn").forEach(btn => btn.classList.remove("active"));
    const activeBtn = document.querySelector(`[data-category="${category}"]`);
    if (activeBtn) activeBtn.classList.add("active");

    fetch(`/samsar-talabak/data/properties/${category}/index.json`)
      .then(response => response.json())
      .then(files => {
        container.innerHTML = '';
        if (!files.length) {
          container.innerHTML = "<p style='text-align:center'>🚫 لا توجد عروض حالياً.</p>";
          return;
        }

        files.forEach(filename => {
          fetch(`/samsar-talabak/data/properties/${category}/${filename}`)
            .then(res => res.json())
            .then(data => {
              const detailURL = `/samsar-talabak/property-details.html?category=${category}&file=${encodeURIComponent(filename)}`;
              const card = document.createElement("div");
              card.className = "property-card";
              card.dataset.filename = filename;
              card.style = `
                background: #1e1e1e;
                border: 1px solid #333;
                padding: 1.5rem;
                border-radius: 12px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                color: #f1f1f1;
              `;

              card.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 1rem;">
                  <img src="https://i.postimg.cc/Vk8Nn1xZ/me.jpg" alt="شعار" style="width: 40px; height: 40px; border-radius: 50%;">
                  <strong style="color:#00ff88;">عرض جديد</strong>
                </div>
                <h2 style="color:#00ff88; font-size: 1.4rem;">${data.title}</h2>
                <p><strong>📏 المساحة:</strong> ${data.area}</p>
                <p><strong>💰 السعر:</strong> ${data.price}</p>
                <p><strong>🛏️ الغرف:</strong> ${data.rooms || "غير محدد"} &nbsp;&nbsp; 🚽 الحمامات: ${data.bathrooms || "غير محدد"}</p>
                <p><strong>📅 التاريخ:</strong> ${data.date || "غير محدد"}</p>
                <p style="margin: 0.5rem 0;"><strong>📝 التفاصيل:</strong> ${data.description}</p>
                <a href="${detailURL}" 
                   style="display:inline-block; margin-top:0.8rem; background:#00ff88; color:#000; padding: 0.6rem 1.2rem; border-radius: 8px; font-weight:bold; text-decoration:none;">
                   👁️ عرض التفاصيل
                </a>
              `;

              const highlighted = localStorage.getItem("highlightCard");
              if (highlighted === filename) {
                card.style.outline = "3px solid #00ff88";
                card.style.backgroundColor = "#002f1f";
              }

              card.addEventListener("click", () => {
                localStorage.setItem("highlightCard", filename);
              });

              container.appendChild(card);
            });
        });
      })
      .catch(err => {
        console.error(err);
        container.innerHTML = "<p style='text-align:center'>❌ حدث خطأ أثناء تحميل العروض.</p>";
      });
  }
});
