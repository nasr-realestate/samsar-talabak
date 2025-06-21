document.addEventListener("DOMContentLoaded", function () {
  const container = document.getElementById('properties-container');
  const category = 'apartments';

  fetch(`/samsar-talabak/data/properties/${category}/index.json`)
    .then(response => response.json())
    .then(propertyFiles => {
      container.innerHTML = '';
      propertyFiles.forEach(fileName => {
        fetch(`/samsar-talabak/data/properties/${category}/${fileName}`)
          .then(res => res.json())
          .then(data => {
            const card = document.createElement('div');
            card.className = 'property-card';
            card.innerHTML = `
              <h2>${data.title}</h2>
              <p><strong>السعر:</strong> ${data.price}</p>
              <p><strong>المساحة:</strong> ${data.area}</p>
              <a href="${data.page_url}">عرض التفاصيل</a>
            `;
            container.appendChild(card);
          });
      });
    })
    .catch(error => {
      console.error('Error fetching properties:', error);
      container.innerHTML = '<p>حدث خطأ أثناء تحميل البيانات.</p>';
    });
});
