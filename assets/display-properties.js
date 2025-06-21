document.addEventListener("DOMContentLoaded", function () {
  const container = document.getElementById('properties-container');
  const category = 'apartments';

  fetch(`/samsar-talabak/data/properties/${category}/index.json`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(propertyFiles => {
      container.innerHTML = ''; // إزالة "جاري التحميل..."
      if (!propertyFiles.length) {
        container.innerHTML = "<p>لا توجد بيانات حالياً.</p>";
        return;
      }

      propertyFiles.forEach(fileName => {
        fetch(`/samsar-talabak/data/properties/${category}/${fileName}`)
          .then(res => {
            if (!res.ok) {
              throw new Error(`فشل في تحميل الملف: ${fileName}`);
            }
            return res.json();
          })
          .then(property => {
            const card = document.createElement('div');
            card.className = 'property-card';
            card.style = `
              background: white;
              border-radius: 10px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.05);
              padding: 1rem;
              margin-bottom: 1rem;
              text-align: right;
              font-family: 'Tajawal', sans-serif;
            `;

            card.innerHTML = `
              <h2>${property.title}</h2>
              <p><strong>السعر:</strong> ${property.price}</p>
              <p><strong>المساحة:</strong> ${property.area}</p>
              <p><strong>الوصف:</strong> ${property.description}</p>
              <a href="${property.page_url}" style="color: #3498db; font-weight: bold;">عرض التفاصيل</a>
            `;

            container.appendChild(card);
          })
          .catch(error => {
            console.error(error);
            container.innerHTML += `<p>تعذر تحميل بيانات ${fileName}</p>`;
          });
      });
    })
    .catch(error => {
      console.error(error);
      container.innerHTML = "<p>حدث خطأ أثناء تحميل البيانات.</p>";
    });
});
