document.addEventListener("DOMContentLoaded", async function () {
  const container = document.getElementById("properties-container");
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
    btn.addEventListener("click", () => loadCategory(key));
    filterContainer.appendChild(btn);
  }

  const defaultCategory = Object.keys(categories)[0];
  loadCategory(defaultCategory);

  function loadCategory(category) {
    container.innerHTML = "<p>جاري تحميل البيانات...</p>";
    fetch(`/samsar-talabak/data/properties/${category}/index.json`)
      .then(response => {
        if (!response.ok) throw new Error("فشل في جلب الفهرس");
        return response.json();
      })
      .then(files => {
        container.innerHTML = '';
        if (!files.length) {
          container.innerHTML = "<p>لا توجد بيانات حالياً.</p>";
          return;
        }

        files.forEach(filename => {
          fetch(`/samsar-talabak/data/properties/${category}/${filename}`)
            .then(res => res.json())
            .then(data => {
              const card = document.createElement("div");
              card.className = "property-card";
              card.innerHTML = `
                <h2>${data.title}</h2>
                <p><strong>السعر:</strong> ${data.price}</p>
                <p><strong>المساحة:</strong> ${data.area}</p>
                <p><strong>الوصف:</strong> ${data.description}</p>
                <a href="${data.page_url}" class="details-link">عرض التفاصيل</a>
              `;
              container.appendChild(card);
            });
        });
      })
      .catch(err => {
        container.innerHTML = "<p>حدث خطأ أثناء تحميل البيانات.</p>";
        console.error(err);
      });
  }
});
