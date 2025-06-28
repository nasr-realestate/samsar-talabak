document.addEventListener("DOMContentLoaded", async function () {
  const container = document.getElementById("properties-container");
  const filterContainer = document.getElementById("filter-buttons");

  const categories = {
    "requests-apartments": "طلبات شقق للبيع",
    "requests-apartments-rent": "طلبات شقق للإيجار",
    "requests-shops": "طلبات محلات",
    "requests-offices": "طلبات مكاتب",
    "requests-admin-hq": "طلبات مقرات إدارية"
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
    container.innerHTML = "<p style='text-align:center'>جاري تحميل البيانات...</p>";

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

              card.innerHTML = `
                <h2 style="color:#00ff88; font-size: 1.4rem; font-weight: bold; margin-bottom: 0.5rem;">
                  ${data.title}
                </h2>
                <p><strong>📌 الميزانية:</strong> ${data.budget || 'غير محددة'}</p>
                <p style="color:#ccc;"><strong>📋 تفاصيل الطلب:</strong> ${data.description}</p>
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
