document.addEventListener("DOMContentLoaded", function () {
  const container = document.getElementById("properties-container");
  const categoryButtons = document.querySelectorAll(".category-btn");

  // التصنيفات المتاحة حالياً
  const categories = {
    "all": ["apartments", "apartments-rent"],
    "apartments": ["apartments"],
    "apartments-rent": ["apartments-rent"]
  };

  function loadProperties(selectedCategories) {
    container.innerHTML = "جارٍ التحميل...";

    const allCards = [];

    Promise.all(
      selectedCategories.map(category =>
        fetch(`/samsar-talabak/data/properties/${category}/index.json`)
          .then(response => {
            if (!response.ok) throw new Error(`فشل تحميل index.json لـ ${category}`);
            return response.json();
          })
          .then(files =>
            Promise.all(
              files.map(file =>
                fetch(`/samsar-talabak/data/properties/${category}/${file}`)
                  .then(res => {
                    if (!res.ok) throw new Error(`فشل تحميل ${file}`);
                    return res.json();
                  })
                  .then(data => {
                    data._category = category;
                    return data;
                  })
              )
            )
          )
          .then(results => allCards.push(...results))
      )
    )
      .then(() => {
        container.innerHTML = "";
        if (allCards.length === 0) {
          container.innerHTML = "<p>لا توجد نتائج.</p>";
          return;
        }

        allCards.forEach(property => {
          const card = document.createElement("div");
          card.className = "property-card";

          const color = property._category === "apartments" ? "#3498db" : "#27ae60"; // أزرق للبيع، أخضر للإيجار

          card.innerHTML = `
            <h2>${property.title}</h2>
            <p><strong>السعر:</strong> ${property.price}</p>
            <p><strong>المساحة:</strong> ${property.area}</p>
            <p>${property.description}</p>
            <a href="${property.page_url}" style="background:${color}; color:white; padding:10px 15px; display:inline-block; border-radius:5px; text-decoration:none; margin-top:10px;">عرض التفاصيل</a>
          `;

          container.appendChild(card);
        });
      })
      .catch(error => {
        console.error(error);
        container.innerHTML = "<p>حدث خطأ أثناء تحميل البيانات.</p>";
      });
  }

  // تحميل الكل افتراضياً
  loadProperties(categories["all"]);

  // عند الضغط على زر تصنيف
  categoryButtons.forEach(button => {
    button.addEventListener("click", () => {
      const selected = button.dataset.category;
      categoryButtons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");

      loadProperties(categories[selected]);
    });
  });
});
