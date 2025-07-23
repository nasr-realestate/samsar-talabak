// ====== بيانات وهمية كمثال (سيتم استبدالها ببيانات حقيقية من الخادم لاحقًا) ======
const requestsData = [
  {
    id: 1,
    title: "مطلوب شقة 150م للإيجار في عباس العقاد",
    description: "عميل جاد يبحث عن شقة مفروشة بالكامل لمدة سنة، يفضل الطابق الثاني أو الثالث.",
    location: "عباس العقاد",
    budget: "10,000 جنيه",
    status: "open"
  },
  {
    id: 2,
    title: "شراء شقة في شارع مصطفى النحاس",
    description: "ميزانية 2 مليون جنيه، يريد عميل الدفع كاش خلال أسبوع.",
    location: "مصطفى النحاس",
    budget: "2,000,000 جنيه",
    status: "closed"
  }
];

// ====== توليد بطاقة الطلب بصريًا ======
function createRequestCard(request) {
  const card = document.createElement("div");
  card.className = "request-card card";

  // حالة الطلب
  const statusBadge = document.createElement("div");
  statusBadge.className = `status-badge ${request.status}`;
  statusBadge.innerText = request.status === "open" ? "متاح الآن" : "مغلق";

  // محتوى البطاقه
  const content = `
    <div class="request-content">
      <h3 class="request-title">${request.title}</h3>
      <p class="request-description">${request.description}</p>
    </div>
    <div class="request-highlight">
      <p><strong>📍 الموقع:</strong> ${request.location}</p>
      <p><strong>💰 الميزانية:</strong> ${request.budget}</p>
    </div>
  `;

  // تجميع البطاقة
  card.appendChild(statusBadge);
  card.innerHTML += content;

  return card;
}

// ====== عرض كل الطلبات ======
function displayRequests(data) {
  const container = document.getElementById("requests-container");
  container.innerHTML = ""; // تفريغ المحتوى السابق

  data.forEach(request => {
    const card = createRequestCard(request);
    container.appendChild(card);
  });
}

// ====== الفلاتر (كمثال) ======
function setupFilters() {
  const buttonsContainer = document.getElementById("filter-buttons");

  const filters = [
    { label: "الكل", value: "all" },
    { label: "المتاح فقط", value: "open" },
    { label: "المغلق فقط", value: "closed" }
  ];

  filters.forEach(filter => {
    const btn = document.createElement("button");
    btn.className = "filter-btn";
    btn.innerText = filter.label;

    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      if (filter.value === "all") {
        displayRequests(requestsData);
      } else {
        const filtered = requestsData.filter(r => r.status === filter.value);
        displayRequests(filtered);
      }
    });

    buttonsContainer.appendChild(btn);
  });
}

// ====== عند تحميل الصفحة ======
document.addEventListener("DOMContentLoaded", () => {
  displayRequests(requestsData);
  setupFilters();
});
