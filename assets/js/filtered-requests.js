document.addEventListener("DOMContentLoaded", async function () {
  const container = document.getElementById("requests-container");
  const filterContainer = document.getElementById("filter-buttons");

  const categories = {
    "request-apartments": "طلبات شقق للبيع",
    "request-apartments-rent": "طلبات شقق للإيجار",
    "request-shops": "طلبات محلات",
    "request-offices": "طلبات مكاتب",
    "request-admin-hq": "طلبات مقرات إدارية"
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
                border: 1px solid #ddd;
                padding: 1.5rem;
                border-radius: 10px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                margin-bottom: 1.5rem;
                font-family: 'Tajawal', sans-serif;
              `;

              card.innerHTML = `
                <h2 style="color:#2c3e50">${data.title}</h2>
                <p><strong>الميزانية:</strong> ${data.price}</p>
                <p><strong>المساحة المطلوبة:</strong> ${data.area}</p>
                <p><strong>تفاصيل إضافية:</strong> ${data.description}</p>
              `;

              container.appendChild(card);
            });
        });
      })
      .catch(err => {
        console.error(err);
        container.innerHTML = "<p style='text-align:center'>حدث خطأ أثناء تحميل الطلبات.</p>";
      });
  }
});
