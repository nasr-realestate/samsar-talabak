const categories = ['apartments', 'shops', 'offices', 'units']; // أضف المزيد حسب الحاجة
const container = document.getElementById("properties-container");
const filterButtons = document.getElementById("filter-buttons");

let allCards = [];

// 🔄 تحميل جميع البطاقات من كل تصنيف
async function loadAllProperties() {
  container.innerHTML = "⏳ جاري تحميل العروض...";
  allCards = [];

  for (const category of categories) {
    try {
      const indexUrl = `/samsar-talabak/data/properties/${category}/index.json`;
      const indexRes = await fetch(indexUrl);
      const fileNames = await indexRes.json();

      for (const fileName of fileNames) {
        const url = `/samsar-talabak/data/properties/${category}/${fileName}`;
        const res = await fetch(url);
        const data = await res.json();

        const card = createPropertyCard(data, category);
        allCards.push({ element: card, category, text: card.innerText.toLowerCase() });
      }
    } catch (error) {
      console.warn(`لم يتم تحميل بيانات تصنيف: ${category}`);
    }
  }

  displayCards(allCards);
  buildFilterButtons();
}

function createPropertyCard(data, category) {
  const card = document.createElement("div");
  card.className = "property-card";
  card.style = `
    background: #1e1e1e;
    border: 1px solid #00ff88;
    border-radius: 12px;
    padding: 1rem;
    box-shadow: 0 0 10px #00ff8860;
  `;

  card.innerHTML = `
    <h3 style="color:#00ff88; margin-bottom: 0.5rem;">${data.title}</h3>
    <p><strong>📏 المساحة:</strong> ${data.area || 'غير محددة'}</p>
    <p><strong>💰 السعر:</strong> ${data.price || '—'}</p>
    <p><strong>🛏️ الغرف:</strong> ${data.rooms ?? '-'} | 🚽 الحمامات: ${data.bathrooms ?? '-'}</p>
    <p><strong>🏢 الدور:</strong> ${data.floor ?? '-'} | 🛗 أسانسير: ${data.elevator ? 'نعم' : 'لا'}</p>
    <p><strong>📅 التاريخ:</strong> ${data.date || 'غير محدد'}</p>
    <p style="margin-top:0.5rem;">${data.description?.slice(0, 100) || ''}...</p>
    <a href="/samsar-talabak/details.html?category=${category}&file=${encodeURIComponent(fileNameFromPath(data.title))}"
       style="display:inline-block;margin-top:1rem;color:#00ff88;text-decoration:underline;">
      👁️ تفاصيل كاملة
    </a>
  `;
  return card;
}

// 📁 استخراج اسم الملف من العنوان (أو استخدم عنوان ملف لو محفوظ في JSON لاحقًا)
function fileNameFromPath(title) {
  return title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]/g, '') + '.json';
}

// 🟢 عرض البطاقات
function displayCards(cards) {
  container.innerHTML = "";
  if (cards.length === 0) {
    container.innerHTML = "<p style='text-align:center;'>❌ لا توجد عروض مطابقة حالياً</p>";
    return;
  }
  cards.forEach(obj => container.appendChild(obj.element));
}

// 🔘 إنشاء أزرار التصنيفات
function buildFilterButtons() {
  filterButtons.innerHTML = "";

  const allBtn = document.createElement("button");
  allBtn.className = "filter-btn active";
  allBtn.innerText = "الكل";
  allBtn.onclick = () => filterByCategory(null, allBtn);
  filterButtons.appendChild(allBtn);

  categories.forEach(cat => {
    const btn = document.createElement("button");
    btn.className = "filter-btn";
    btn.innerText = getCategoryLabel(cat);
    btn.onclick = () => filterByCategory(cat, btn);
    filterButtons.appendChild(btn);
  });
}

function filterByCategory(category, clickedBtn) {
  document.querySelectorAll(".filter-btn").forEach(btn => btn.classList.remove("active"));
  clickedBtn.classList.add("active");

  const searchText = document.getElementById("search-input").value.toLowerCase().trim();
  const filtered = allCards.filter(card =>
    (!category || card.category === category) &&
    card.text.includes(searchText)
  );

  displayCards(filtered);
}

// 📦 ترجمة التصنيف للعربية
function getCategoryLabel(cat) {
  switch (cat) {
    case 'apartments': return 'شقق';
    case 'shops': return 'محلات';
    case 'offices': return 'مكاتب';
    case 'units': return 'وحدات';
    default: return cat;
  }
}

// 🔍 فلترة أثناء البحث
document.getElementById("search-input").addEventListener("input", () => {
  const keyword = document.getElementById("search-input").value.toLowerCase().trim();
  const activeCategory = document.querySelector(".filter-btn.active")?.innerText;
  const currentCat = activeCategory === "الكل" ? null : categories.find(c => getCategoryLabel(c) === activeCategory);

  const filtered = allCards.filter(card =>
    (!currentCat || card.category === currentCat) &&
    card.text.includes(keyword)
  );
  displayCards(filtered);
});

loadAllProperties();
