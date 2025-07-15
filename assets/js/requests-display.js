document.addEventListener("DOMContentLoaded", async function () {
  const container = document.getElementById("requests-container");
  const filterContainer = document.getElementById("filter-buttons");

  const categories = {
    "apartments": "طلبات شقق للشراء",
    "apartments-rent": "طلبات شقق للإيجار",
    "shops": "طلبات محلات",
    "offices": "طلبات مكاتب",
    "admin-hq": "طلبات مقرات إدارية"
  };

  for (const [key, label] of Object.entries(categories)) {
    const btn = document.createElement("button");
    btn.textContent = label;
    btn.dataset.category = key;
    btn.className = "filter-btn";
    btn.addEventListener("click", () => loadCategory(key));
    filterContainer.appendChild(btn);
  }

  const defaultCategory = Object.keys(categories)[0];
  loadCategory(defaultCategory);

  function loadCategory(category) {
    container.innerHTML = "<p style='text-align:center'>⏳ جاري تحميل الطلبات...</p>";

    document.querySelectorAll(".filter-btn").forEach(btn => btn.classList.remove("active"));
    const activeBtn = document.querySelector(`[data-category="${category}"]`);
    if (activeBtn) activeBtn.classList.add("active");

    fetch(`/samsar-talabak/data/requests/${category}/index.json`)
      .then(response => response.json())
      .then(files => {
        container.innerHTML = '';
        if (!files.length) {
          container.innerHTML = "<p style='text-align:center'>🚫 لا توجد طلبات حالياً.</p>";
          return;
        }

        files.forEach(filename => {
          fetch(`/samsar-talabak/data/requests/${category}/${filename}`)
            .then(res => res.json())
            .then(data => {
              const detailURL = `/samsar-talabak/request-details.html?category=${category}&file=${encodeURIComponent(filename)}`;
              const card = document.createElement("div");
              card.className = "property-card card-" + category;
              card.dataset.filename = filename;

              card.style = `
                background: var(--color-surface-2);
                border: 1px solid var(--color-border);
                padding: 1.5rem;
                border-radius: 12px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                color: var(--color-text-primary);
                transition: 0.3s ease;
              `;

              card.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 1rem;">
                  <img src="https://i.postimg.cc/Vk8Nn1xZ/me.jpg" alt="شعار" style="width: 40px; height: 40px; border-radius: 50%;">
                  <strong style="color:var(--color-primary);">طلب جديد</strong>
                </div>
                <h2 style="color:var(--color-primary); font-size: 1.4rem;">${data.title}</h2>
                <p><strong>🔍 نوع الطلب:</strong> ${categories[category]}</p>
                <p><strong>📏 المساحة المطلوبة:</strong> ${data.area}</p>
                <p><strong>💰 الميزانية:</strong> ${data.budget}</p>
                <p><strong>📅 التاريخ:</strong> ${data.date || "غير محدد"}</p>
                <p style="margin: 0.5rem 0;"><strong>📝 التفاصيل:</strong> ${data.description}</p>
                <a href="${detailURL}" 
                   style="display:inline-block; margin-top:0.8rem; background:var(--color-primary); color:#000; padding: 0.6rem 1.2rem; border-radius: 8px; font-weight:bold; text-decoration:none;">
                   ✅ لدي عرض مشابه
                </a>
              `;

              const highlighted = localStorage.getItem("highlightCard");
              if (highlighted === filename) {
                card.style.outline = "3px solid var(--color-primary)";
                card.scrollIntoView({ behavior: "smooth", block: "center" });
              }

              card.addEventListener("click", () => {
                localStorage.setItem("highlightCard", filename);
                document.querySelectorAll(".property-card").forEach(c => c.classList.remove("highlighted"));
                card.classList.add("highlighted");
              });

              container.appendChild(card);
            });
        });
      })
      .catch(err => {
        console.error(err);
        container.innerHTML = "<p style='text-align:center'>❌ حدث خطأ أثناء تحميل الطلبات.</p>";
      });
  }
});
