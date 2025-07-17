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

  const state = {
    currentCategory: null,
    isLoading: false,
    lastLoadTime: 0
  };

  function showNotification(message, type = "info") {
    const notice = document.createElement("div");
    notice.textContent = message;
    notice.style.cssText = `
      background-color: ${type === "info" ? "#00ff88" : "#C62828"};
      color: #000;
      padding: 0.8rem 1.2rem;
      border-radius: 10px;
      text-align: center;
      font-weight: bold;
      max-width: 400px;
      margin: 10px auto;
    `;
    document.body.appendChild(notice);
    setTimeout(() => notice.remove(), 2500);
  }

  function handleCategoryChange(category) {
    if (state.isLoading) return;

    if (state.currentCategory === category) {
      const now = Date.now();
      if (now - state.lastLoadTime < 60000) {
        showNotification("✅ هذا التصنيف معروض بالفعل مؤخرًا");
        return;
      }
    }

    state.currentCategory = category;
    state.lastLoadTime = Date.now();

    container.innerHTML = "<p style='text-align:center'>⏳ جاري تحميل الطلبات...</p>";
    state.isLoading = true;

    document.querySelectorAll(".filter-btn").forEach(btn => btn.classList.remove("active"));
    const activeBtn = document.querySelector(`[data-category="${category}"]`);
    if (activeBtn) activeBtn.classList.add("active");

    fetch(`/samsar-talabak/data/requests/${category}/index.json`)
      .then(response => response.json())
      .then(files => {
        container.innerHTML = '';
        if (!files.length) {
          container.innerHTML = "<p style='text-align:center'>🚫 لا توجد طلبات حالياً.</p>";
          state.isLoading = false;
          return;
        }

        files.forEach(filename => {
          fetch(`/samsar-talabak/data/requests/${category}/${filename}`)
            .then(res => res.json())
            .then(data => {
              const detailURL = `/samsar-talabak/request-details.html?category=${category}&file=${encodeURIComponent(filename)}`;
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
                  <strong style="color:#00ff88;">طلب جديد</strong>
                </div>
                <h2 style="color:#00ff88; font-size: 1.4rem;">${data.title}</h2>
                <p><strong>🔍 نوع الطلب:</strong> ${categories[category]}</p>
                <p><strong>📏 المساحة المطلوبة:</strong> ${data.area}</p>
                <p><strong>💰 الميزانية:</strong> ${data.budget}</p>
                <p><strong>📅 التاريخ:</strong> ${data.date || "غير محدد"}</p>
                <p style="margin: 0.5rem 0;"><strong>📝 التفاصيل:</strong> ${data.description}</p>
                <a href="${detailURL}" 
                   style="display:inline-block; margin-top:0.8rem; background:#00ff88; color:#000; padding: 0.6rem 1.2rem; border-radius: 8px; font-weight:bold; text-decoration:none;">
                   ✅ لدي عرض مشابه
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

        state.isLoading = false;
      })
      .catch(err => {
        console.error(err);
        container.innerHTML = "<p style='text-align:center'>❌ حدث خطأ أثناء تحميل الطلبات.</p>";
        state.isLoading = false;
      });
  }

  for (const [key, label] of Object.entries(categories)) {
    const btn = document.createElement("button");
    btn.textContent = label;
    btn.dataset.category = key;
    btn.className = "filter-btn";
    btn.addEventListener("click", () => handleCategoryChange(key));
    filterContainer.appendChild(btn);
  }

  const defaultCategory = Object.keys(categories)[0];
  handleCategoryChange(defaultCategory);
});
