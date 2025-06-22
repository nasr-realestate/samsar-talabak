document.addEventListener("DOMContentLoaded", async function () {
  const container = document.getElementById("properties-container");
  const filterContainer = document.getElementById("filter-buttons");

  const categories = {
    "apartments": { label: "شقق للبيع", color: "#3498db" },
    "apartments-rent": { label: "شقق للإيجار", color: "#2ecc71" },
    "shops": { label: "محلات", color: "#e67e22" },
    "offices": { label: "مكاتب", color: "#9b59b6" },
    "admin-hq": { label: "مقرات إدارية", color: "#16a085" }
  };

  // إنشاء الأزرار
  for (const [key, info] of Object.entries(categories)) {
    const btn = document.createElement("button");
    btn.textContent = info.label;
    btn.dataset.category = key;
    btn.className = "filter-btn";
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      loadCategory(key, info.color);
    });
    filterContainer.appendChild(btn);
  }

  // تحميل التصنيف الافتراضي
  const defaultCategory = Object.keys(categories)[0];
  document.querySelector(`.filter-btn[data-category="${defaultCategory}"]`).classList.add("active");
  loadCategory(defaultCategory, categories[defaultCategory].color);

  function loadCategory(category, color) {
    container.innerHTML = "<p>جاري تحميل البيانات...</p>";
    fetch(`/samsar-talabak/data/properties/${category}/index.json`)
      .then(response => response.json())
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
              card.style.borderRight = `5px solid ${color}`;
              card.innerHTML = `
                <h2>${data.title}</h2>
                <p><strong>السعر:</strong> ${data.price}</p>
                <p><strong>المساحة:</strong> ${data.area}</p>
                <p><strong>الوصف:</strong> ${data.description}</p>
                <a href="${data.page_url}" class="details-link" target="_blank">عرض التفاصيل</a>
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
