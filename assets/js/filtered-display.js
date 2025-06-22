document.addEventListener("DOMContentLoaded", function () {
  const container = document.getElementById("properties-container");
  const buttons = document.querySelectorAll(".category-btn");

  const categories = [
    { key: "apartments", label: "شقق للبيع" },
    { key: "apartments-rent", label: "شقق للإيجار" },
  ];

  function loadProperties(selectedCategory) {
    container.innerHTML = "جاري تحميل البيانات...";

    const loadCategory = (category) =>
      fetch(`/samsar-talabak/data/properties/${category}/index.json`)
        .then((res) => (res.ok ? res.json() : []))
        .then((files) =>
          Promise.all(
            files.map((file) =>
              fetch(`/samsar-talabak/data/properties/${category}/${file}`).then(
                (r) => r.json()
              )
            )
          )
        )
        .catch(() => []);

    let loaders = [];

    if (selectedCategory === "all") {
      loaders = categories.map((cat) => loadCategory(cat.key));
    } else {
      loaders = [loadCategory(selectedCategory)];
    }

    Promise.all(loaders).then((results) => {
      const allProps = results.flat();
      container.innerHTML = "";

      if (allProps.length === 0) {
        container.innerHTML = "<p>لا توجد بيانات حالياً.</p>";
        return;
      }

      allProps.forEach((data) => {
        const card = document.createElement("div");
        card.className = "property-card";
        card.innerHTML = `
          <h2>${data.title}</h2>
          <p><strong>السعر:</strong> ${data.price}</p>
          <p><strong>المساحة:</strong> ${data.area}</p>
          <p><strong>الوصف:</strong> ${data.description}</p>
          <a href="${data.page_url}" style="color: #3498db;">عرض التفاصيل</a>
        `;
        container.appendChild(card);
      });
    });
  }

  // تحميل الكل عند البداية
  loadProperties("all");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const selected = btn.getAttribute("data-category");
      loadProperties(selected);
    });
  });
});
