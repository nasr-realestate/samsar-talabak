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
    container.innerHTML = "<p style='text-align:center'>جاري تحميل البيانات...</p>";

    // تحديث شكل الأزرار
    const allButtons = document.querySelectorAll(".filter-btn");
    allButtons.forEach(btn => btn.classList.remove("active"));
    const activeBtn = document.querySelector(`[data-category="${category}"]`);
    if (activeBtn) activeBtn.classList.add("active");

    fetch(`/samsar-talabak/data/properties/${category}/index.json`)
      .then(response => {
        if (!response.ok) throw new Error("فشل تحميل index.json");
        return response.json();
      })
      .then(files => {
        container.innerHTML = '';
        if (!files.length) {
          container.innerHTML = "<p style='text-align:center'>لا توجد بيانات حالياً.</p>";
          return;
        }

        files.forEach(filename => {
          fetch(`/samsar-talabak/data/properties/${category}/${filename}`)
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
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 1rem;">
                  <img src="https://i.postimg.cc/Vk8Nn1xZ/me.jpg" alt="شعار" style="width: 40px; height: 40px; border-radius: 50%;">
                  <strong>سمسار طلبك</strong>
                </div>
                <h2 style="color:#2c3e50">${data.title}</h2>
                <p><strong>السعر:</strong> ${data.price}</p>
                <p><strong>المساحة:</strong> ${data.area}</p>
                <p><strong>الوصف:</strong> ${data.description}</p>
                <div style="margin-top: 1rem;">
                  <a href="https://wa.me/201147758857?text=مرحبًا، أريد الاستفسار عن: ${encodeURIComponent(data.title)}" 
                    target="_blank" 
                    style="background:#25D366; color:white; padding: 0.5rem 1rem; border-radius: 6px; text-decoration: none;">
                    استفسر عبر واتساب
                  </a>
                </div>
              `;

              container.appendChild(card);
            });
        });
      })
      .catch(err => {
        console.error(err);
        container.innerHTML = "<p style='text-align:center'>حدث خطأ أثناء تحميل البيانات.</p>";
      });
  }
});
