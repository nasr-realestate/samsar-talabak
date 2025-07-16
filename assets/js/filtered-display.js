document.addEventListener("DOMContentLoaded", async () => {
  // --- الإعدادات والمتغيرات الأساسية ---
  const propertiesContainer = document.getElementById("properties-container");
  const filterContainer = document.getElementById("filter-buttons");
  const API_BASE_URL = "/samsar-talabak/data/properties";

  const CATEGORIES = {
    "apartments": "شقق للبيع",
    "apartments-rent": "شقق للإيجار",
    "shops": "محلات تجارية",
    "offices": "مكاتب إدارية",
    "admin-hq": "مقرات إدارية"
  };

  // --- الدوال المساعدة ---

  /**
   * يعرض رسالة في حاوية العروض (مثل: جاري التحميل، لا توجد عروض).
   * @param {string} message - الرسالة المراد عرضها.
   * @param {boolean} isError - هل الرسالة رسالة خطأ.
   */
  const showStatusMessage = (message, isError = false) => {
    propertiesContainer.style.display = 'block'; // تأكد من أن الحاوية ليست grid
    propertiesContainer.innerHTML = `<p style="text-align:center; color:${isError ? '#ff6b6b' : '#ccc'}; grid-column: 1 / -1;">${message}</p>`;
  };

  /**
   * ينشئ بطاقة عرض عقار ويضيفها إلى الصفحة.
   * @param {object} propertyData - بيانات العقار.
   * @param {string} category - تصنيف العقار.
   * @param {string} filename - اسم ملف العقار.
   */
  const createPropertyCard = (propertyData, category, filename) => {
    const detailPageUrl = `/samsar-talabak/details.html?category=${category}&file=${encodeURIComponent(filename)}`;
    
    const card = document.createElement("div");
    card.className = `property-card card-${category}`;
    card.dataset.filename = filename;
    
    // تصميم البطاقة باستخدام CSS-in-JS
    Object.assign(card.style, {
      backgroundColor: 'var(--color-surface)',
      border: '1px solid #333',
      borderRadius: '12px',
      padding: '1.5rem',
      fontFamily: "'Tajawal', sans-serif",
      color: 'var(--color-text)',
      transition: 'transform 0.3s, box-shadow 0.3s',
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column'
    });

    card.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 1rem;">
        <img src="https://i.postimg.cc/Vk8Nn1xZ/me.jpg" alt="شعار سمسار طلبك" style="width: 45px; height: 45px; border-radius: 50%; border: 2px solid var(--color-primary );">
        <strong style="color: var(--color-primary); font-size: 1.1rem;">سمسار طلبك</strong>
      </div>
      <h2 style="color: var(--color-primary); font-size: 1.5rem; margin: 0 0 1rem;">${propertyData.title}</h2>
      <div style="flex-grow: 1;">
        <p style="margin: 0.5rem 0;"><strong>💰 السعر:</strong> ${propertyData.price}</p>
        <p style="margin: 0.5rem 0;"><strong>📏 المساحة:</strong> ${propertyData.area}</p>
        <p style="margin: 0.5rem 0; color: var(--color-text-secondary);"><strong>📝 الوصف:</strong> ${propertyData.description}</p>
      </div>
      <div style="margin-top: 1.5rem; text-align: left;">
        <a href="${detailPageUrl}" style="background: var(--color-primary); color: #000; padding: 0.7rem 1.4rem; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
          عرض التفاصيل الكاملة
        </a>
      </div>
    `;

    // تأثيرات تفاعلية
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-5px)';
      card.style.boxShadow = '0 8px 25px rgba(0, 255, 136, 0.15)';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0)';
      card.style.boxShadow = 'none';
    });

    // تمييز البطاقة عند النقر عليها
    const highlightedFile = localStorage.getItem("highlightedCard");
    if (highlightedFile === filename) {
      card.style.outline = `3px solid var(--color-primary)`;
      card.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    card.addEventListener("click", (e) => {
      if (e.target.tagName !== 'A') { // تجنب التمييز عند النقر على الرابط
        localStorage.setItem("highlightedCard", filename);
        document.querySelectorAll(".property-card").forEach(c => c.style.outline = "none");
        card.style.outline = `3px solid var(--color-primary)`;
      }
    });

    return card;
  };

  /**
   * يحمّل ويعرض العقارات لتصنيف معين.
   * @param {string} category - التصنيف المراد تحميله.
   */
  const loadCategory = async (category) => {
    showStatusMessage("⏳ جاري تحميل العروض، لحظات من فضلك...");
    
    // تحديث أزرار الفلترة
    document.querySelectorAll(".filter-btn").forEach(btn => btn.classList.remove("active"));
    document.querySelector(`[data-category="${category}"]`)?.classList.add("active");

    try {
      const indexResponse = await fetch(`${API_BASE_URL}/${category}/index.json`);
      if (!indexResponse.ok) throw new Error(`فشل تحميل قائمة العروض للتصنيف: ${category}`);
      const filenames = await indexResponse.json();

      if (!filenames || filenames.length === 0) {
        showStatusMessage("ℹ️ لا توجد عروض متاحة في هذا التصنيف حالياً.");
        return;
      }

      propertiesContainer.innerHTML = ''; // إفراغ الحاوية قبل إضافة البطاقات الجديدة
      propertiesContainer.style.display = 'grid'; // إعادة الحاوية لوضع الشبكة

      const propertyPromises = filenames.map(filename => 
        fetch(`${API_BASE_URL}/${category}/${filename}`).then(res => res.json()).then(data => ({data, filename}))
      );

      const properties = await Promise.all(propertyPromises);

      properties.forEach(({ data, filename }) => {
        const card = createPropertyCard(data, category, filename);
        propertiesContainer.appendChild(card);
      });

    } catch (error) {
      console.error("حدث خطأ:", error);
      showStatusMessage("❌ عذراً، حدث خطأ أثناء جلب البيانات. يرجى المحاولة مرة أخرى.", true);
    }
  };

  // --- منطق التشغيل الرئيسي ---

  // إنشاء أزرار الفلترة
  Object.entries(CATEGORIES).forEach(([key, label]) => {
    const btn = document.createElement("button");
    btn.textContent = label;
    btn.dataset.category = key;
    btn.className = "filter-btn";
    btn.addEventListener("click", () => loadCategory(key));
    filterContainer.appendChild(btn);
  });

  // تحميل التصنيف الافتراضي عند بدء التشغيل
  const defaultCategory = Object.keys(CATEGORIES)[0];
  if (defaultCategory) {
    loadCategory(defaultCategory);
  }
});
