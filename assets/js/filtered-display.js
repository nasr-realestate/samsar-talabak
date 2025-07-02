<script>
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

  let lastLoadedCategory = null;

  // بناء أزرار الفئات
  for (const [key, label] of Object.entries(categories)) {
    const btn = document.createElement("button");
    btn.textContent = label;
    btn.dataset.category = key;
    btn.className = "filter-btn";
    btn.addEventListener("click", () => loadCategory(key));
    filterContainer.appendChild(btn);
  }

  // استخدم آخر فئة محفوظة أو الافتراضية
  const defaultCategory = localStorage.getItem("lastCategory") || Object.keys(categories)[0];
  loadCategory(defaultCategory);

  async function loadCategory(category) {
    if (lastLoadedCategory === category) return; // لا تكرر نفس الفئة
    lastLoadedCategory = category;
    localStorage.setItem("lastCategory", category);

    container.innerHTML = "<p style='text-align:center'>جاري تحميل العروض...</p>";

    // أزرار الفلتر نشطة
    document.querySelectorAll(".filter-btn").forEach(btn => {
      btn.classList.remove("active");
      if (btn.dataset.category === category) {
        btn.classList.add("active");
        btn.textContent = "⏳ " + categories[category];
      } else {
        btn.textContent = categories[btn.dataset.category];
      }
    });

    try {
      const res = await fetch(`/samsar-talabak/data/properties/${category}/index.json`);
      const files = await res.json();

      container.innerHTML = '';
      if (!files.length) {
        container.innerHTML = "<p style='text-align:center'>لا توجد عروض حالياً.</p>";
        return;
      }

      // نقرأ كل البيانات دفعة واحدة (ذكي وأقل ضوضاء على الشبكة)
      const promises = files.map(filename => 
        fetch(`/samsar-talabak/data/properties/${category}/${filename}`)
          .then(r => r.json().then(data => ({ data, filename })))
      );

      const allProperties = await Promise.all(promises);

      const highlighted = localStorage.getItem("highlightCard");

      allProperties.forEach(({ data, filename }) => {
        const encodedFilename = encodeURIComponent(filename);
        const detailPage = `/samsar-talabak/details.html?category=${category}&file=${encodedFilename}`;

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
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        `;

        card.onmouseover = () => {
          card.style.transform = "translateY(-4px)";
          card.style.boxShadow = "0 4px 16px rgba(0,0,0,0.4)";
        };
        card.onmouseout = () => {
          card.style.transform = "translateY(0)";
          card.style.boxShadow = "0 2px 10px rgba(0,0,0,0.3)";
        };

        card.innerHTML = `
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 1rem;">
            <img src="https://i.postimg.cc/Vk8Nn1xZ/me.jpg" alt="شعار" 
                 style="width: 40px; height: 40px; border-radius: 50%;">
            <strong style="color:#00ff88;">سمسار طلبك</strong>
          </div>
          <h2 style="color:#00ff88; font-size: 1.4rem; font-weight: bold; margin-bottom: 0.5rem;">
            ${data.title}
          </h2>
          <p><strong>💰 السعر:</strong> ${data.price || "غير محدد"}</p>
          <p><strong>📏 المساحة:</strong> ${data.area || "غير محددة"}</p>
          <p><strong>📅 تاريخ الإضافة:</strong> ${data.date || "غير متوفر"}</p>
          <p style="margin: 0.5rem 0; color:#ccc;"><strong>📝 التفاصيل:</strong> ${data.description || "لا يوجد وصف"}</p>
          <div style="margin-top: 1rem;">
            <a href="${detailPage}"
               style="background:#00ff88; color:#000; padding: 0.6rem 1.2rem; border-radius: 8px;
                      text-decoration: none; font-weight: bold;">
              👁️ عرض التفاصيل
            </a>
          </div>
        `;

        // تمييز البطاقة المحددة مسبقًا
        if (highlighted === filename) {
          card.style.outline = "3px solid #00ff88";
          setTimeout(() => card.scrollIntoView({ behavior: "smooth", block: "center" }), 300);
        }

        card.addEventListener("click", () => {
          localStorage.setItem("highlightCard", filename);
        });

        container.appendChild(card);
      });

    } catch (err) {
      console.error("❌ فشل في تحميل العروض:", err);
      container.innerHTML = "<p style='text-align:center'>❌ حدث خطأ أثناء تحميل العروض.</p>";
    } finally {
      // إعادة تسمية الزر النشط بعد التحميل
      const activeBtn = document.querySelector(".filter-btn.active");
      if (activeBtn) activeBtn.textContent = categories[activeBtn.dataset.category];
    }
  }
});
</script>
