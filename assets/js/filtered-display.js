document.addEventListener("DOMContentLoaded", async function () {
  const container = document.getElementById("properties-container");
  const filterContainer = document.getElementById("filter-buttons");
  const welcomeBox = document.getElementById("welcome-message");
  const audio = document.getElementById("welcome-audio");

  // ✅ عرض رسالة الترحيب مرة واحدة مع الصوت
  if (welcomeBox && audio && !localStorage.getItem("welcomeShown")) {
    welcomeBox.style.display = "block";
    try {
      audio.play().catch(() => {
        const btn = document.createElement("button");
        btn.textContent = "🔊 اضغط لتشغيل الترحيب";
        btn.style = "margin-top:10px; padding: 0.5rem 1rem; background: #00ff88; color: #000; border: none; border-radius: 6px; cursor: pointer;";
        btn.onclick = () => {
          audio.play();
          btn.remove();
        };
        welcomeBox.appendChild(btn);
      });
    } catch (e) {
      console.log("خطأ في تشغيل الصوت:", e);
    }

    setTimeout(() => {
      welcomeBox.style.display = "none";
      localStorage.setItem("welcomeShown", "true");
    }, 6000);
  }

  // ✅ أزرار التصنيفات
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
    container.innerHTML = "<p style='text-align:center'>جاري تحميل العروض...</p>";

    document.querySelectorAll(".filter-btn").forEach(btn => btn.classList.remove("active"));
    const activeBtn = document.querySelector(`[data-category="${category}"]`);
    if (activeBtn) activeBtn.classList.add("active");

    fetch(`/samsar-talabak/data/properties/${category}/index.json`)
      .then(response => response.json())
      .then(files => {
        container.innerHTML = '';
        if (!files.length) {
          container.innerHTML = "<p style='text-align:center'>لا توجد عروض حالياً.</p>";
          return;
        }

        files.forEach(filename => {
          fetch(`/samsar-talabak/data/properties/${category}/${filename}`)
            .then(res => res.json())
            .then(data => {
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
                transition: 0.3s;
                cursor: pointer;
              `;

              card.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 1rem;">
                  <img src="https://i.postimg.cc/Vk8Nn1xZ/me.jpg" alt="شعار" style="width: 40px; height: 40px; border-radius: 50%;">
                  <strong style="color:#00ff88;">سمسار طلبك</strong>
                </div>
                <h2 style="color:#00ff88; font-size: 1.4rem; font-weight: bold; margin-bottom: 0.5rem;">
                  ${data.title}
                </h2>
                <p><strong>💰 السعر:</strong> ${data.price}</p>
                <p><strong>📏 المساحة:</strong> ${data.area}</p>
                <p><strong>📅 تاريخ الإضافة:</strong> ${data.date || "غير متوفر"}</p>
                <p style="margin: 0.5rem 0; color:#ccc;"><strong>📝 التفاصيل:</strong> ${data.description}</p>
                <div style="margin-top: 1rem;">
                  <a href="${detailPage}" 
                    style="background:#00ff88; color:#000; padding: 0.6rem 1.2rem; border-radius: 8px; text-decoration: none; font-weight: bold;">
                    👁️ عرض التفاصيل
                  </a>
                </div>
              `;

              // ✅ تمييز البطاقة المختارة
              const highlighted = localStorage.getItem("highlightCard");
              if (highlighted === filename) {
                card.style.outline = "3px solid #00ff88";
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
        container.innerHTML = "<p style='text-align:center'>❌ حدث خطأ أثناء تحميل العروض.</p>";
      });
  }
});
