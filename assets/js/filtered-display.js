document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById('offers');
  const buttons = document.querySelectorAll(".filters button");

  const categories = {
    "apartments-sale": "apartments-sale",
    "apartments-rent": "apartments-rent",
    "shops": "shops",
    "offices": "offices",
  };

  let currentCategory = "all";

  function fetchAndDisplay(category) {
    container.innerHTML = "جاري تحميل البيانات...";
    let paths = category === "all"
      ? Object.values(categories).map(cat => `/samsar-talabak/data/properties/${cat}/index.json`)
      : [`/samsar-talabak/data/properties/${category}/index.json`];

    Promise.all(paths.map(path => fetch(path).then(res => res.ok ? res.json() : [])))
      .then(results => results.flat())
      .then(files => {
        if (files.length === 0) {
          container.innerHTML = "<p>لا توجد عروض حالياً.</p>";
          return;
        }
        return Promise.all(
          files.map(fileName => {
            const dir = category === "all" ? findCategory(fileName) : category;
            return fetch(`/samsar-talabak/data/properties/${dir}/${fileName}`).then(r => r.json());
          })
        );
      })
      .then(properties => {
        if (!properties) return;
        container.innerHTML = "";
        properties.forEach(p => {
          const card = document.createElement("div");
          card.className = "card";
          card.innerHTML = `
            <h2>${p.title}</h2>
            <p><strong>السعر:</strong> ${p.price}</p>
            <p><strong>المساحة:</strong> ${p.area}</p>
            <p>${p.description}</p>
            <a href="${p.page_url}" target="_blank">عرض التفاصيل</a>
          `;
          container.appendChild(card);
        });
      })
      .catch(err => {
        console.error(err);
        container.innerHTML = "<p>حدث خطأ أثناء تحميل البيانات.</p>";
      });
  }

  function findCategory(fileName) {
    for (const cat of Object.values(categories)) {
      // يفترض أن الملف موجود في نفس التصنيف إذا لم يتكرر الاسم
      return cat;
    }
  }

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentCategory = btn.dataset.cat;
      fetchAndDisplay(currentCategory);
    });
  });

  fetchAndDisplay("all");
});
