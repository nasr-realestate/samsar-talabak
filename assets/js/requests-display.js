document.addEventListener("DOMContentLoaded", async function () {
  const container = document.getElementById("requests-container"); // ✅ تم التعديل هنا
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
    container.innerHTML = "<p style='text-align:center'>جاري تحميل الطلبات...</p>";

    const allButtons = document.querySelectorAll(".filter-btn");
    allButtons.forEach(btn => btn.classList.remove("active"));
    const activeBtn = document.querySelector(`[data-category="${category}"]`);
    if (activeBtn) activeBtn.classList.add("active");

    fetch(`/samsar-talabak/data/requests/${category}/index.json`)
      .then(response => response.json())
      .then(files => {
        container.innerHTML = '';
        if (!files.length) {
          container.innerHTML = "<p style='text-align:center'>لا توجد طلبات حالياً.</p>";
          return;
        }

        files.forEach(filename => {
          fetch(`/samsar-talabak/data/requests/${category}/${filename}`)
            .then(res => res.json())
            .then(data => {
              const card = document.createElement("div");
              card.className = `property-card card-${category}`;
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

              const whatsappMessage = encodeURIComponent(`مرحبًا، لدي عرض مناسب لهذا الطلب: ${data.title}`);

              card.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 1rem;">
                  <img src="https://i.postimg.cc/Vk8Nn1xZ/me.jpg" alt="شعار" style="width: 40px; height: 40px; border-radius: 50%;">
                  <strong style="color:#00ff88;">طلب جديد</strong>
                </div>
                <h2 style="color:#00ff88; font-size: 1.4rem; font-weight: bold; margin-bottom: 0.5rem;">
                  ${data.title}
                </h2>
                <p style="margin: 0.2rem 0;"><strong>🔍 نوع الطلب:</strong> ${categories[category]}</p>
                <p style="margin: 0.2rem 0;"><strong>📏 المساحة المطلوبة:</strong> ${data.area}</p>
                <p style="margin: 0.2rem 0;"><strong>💰 الميزانية:</strong> ${data.budget}</p>
                <p style="margin: 0.5rem 0; color:#ccc;"><strong>📝 التفاصيل:</strong> ${data.description}</p>

                <div style="margin-top: 1rem;">
                  <a href="https://wa.me/201147758857?text=${whatsappMessage}"
                    target="_blank"
                    style="background:#00ff88; color:#000; padding: 0.6rem 1.2rem; border-radius: 8px; text-decoration: none; font-weight: bold;">
                    📩 لدي عرض يناسب هذا الطلب
                  </a>
                </div>
              `;

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
