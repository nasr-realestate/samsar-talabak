/**
 * 🏢 سمسار طلبك - تفاصيل الطلب (النظام الأزرق)
 * الملف: assets/js/requests-details-script.js
 */

document.addEventListener("DOMContentLoaded", async function () {
  const container = document.getElementById("request-details-container");
  
  const urlParams = new URLSearchParams(window.location.search);
  const category = urlParams.get('category'); 
  const requestId = urlParams.get('id');     

  if (!category || !requestId) {
    container.innerHTML = "<p style='text-align:center; padding:3rem; color:red;'>رابط الطلب غير صحيح.</p>";
    return;
  }

  try {
    // 1. جلب فهرس الطلبات (Requests Index)
    // هام: يجب أن يكون لديك ملف requests_index.json في مجلد data
    // إذا لم يكن موجوداً، سنستخدم طريقة البحث المباشر في المجلد كاحتياط
    
    let requestData = null;

    try {
        // المحاولة الأولى: عبر الفهرس (الأفضل)
        const indexResponse = await fetch(`/data/requests_index.json?t=${Date.now()}`);
        if(indexResponse.ok) {
            const index = await indexResponse.json();
            const target = index.find(i => String(i.id) === String(requestId));
            if(target) {
                const res = await fetch(target.path);
                requestData = await res.json();
            }
        }
    } catch(e) { console.log("Index fetch failed, trying direct..."); }

    // المحاولة الثانية: المباشرة (إذا فشل الفهرس)
    if (!requestData) {
        const directUrl = `/data/requests/${category}/${requestId}.json`;
        const res = await fetch(directUrl);
        if(!res.ok) throw new Error("طلب العميل غير موجود.");
        requestData = await res.json();
    }

    renderRequestDetails(requestData, container, requestId);

  } catch (err) {
    container.innerHTML = `<div style="text-align:center; padding:4rem; color:red;"><h3>عذراً</h3><p>${err.message}</p><a href="/requests-filtered.html" style="color:#fff;">عودة</a></div>`;
  }
});

function renderRequestDetails(req, container, id) {
  const whatsappNumber = "201147758857"; 

  container.innerHTML = `
    <!-- رأس الصفحة (أزرق) -->
    <div class="details-header" style="border-bottom: 1px solid #333; padding-bottom: 20px; margin-bottom: 30px;">
      <div style="display:flex; gap:15px; align-items:center; margin-bottom:15px;">
          <span style="background: rgba(10, 132, 255, 0.1); color: #0a84ff; padding: 5px 15px; border-radius: 20px; border: 1px solid #0a84ff; font-size: 0.9rem;">
             <i class="fas fa-user-clock"></i> طلب شراء نشط
          </span>
          <span style="color: #666;">كود: #${id}</span>
      </div>
      
      <h1 style="color: #fff; font-size: 2rem; margin: 0 0 10px 0;">${req.title}</h1>
      
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:20px;">
          <p style="color: var(--color-text-secondary); font-size: 1.2rem; margin: 0;">
              <i class="fas fa-map-marker-alt" style="color: #0a84ff;"></i> ${req.location}
          </p>
          
          <div style="text-align:center; background: #111; padding: 10px 20px; border-radius: 10px; border: 1px solid #0a84ff;">
              <span style="color:#aaa; font-size:0.9rem; display:block;">الميزانية المرصودة</span>
              <span style="color: #fff; font-size: 1.4rem; font-weight: bold;">${req.budget}</span>
          </div>
      </div>
    </div>

    <!-- المواصفات -->
    <div class="details-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 30px;">
        ${req.rooms ? `
        <div class="detail-item" style="background: #0a0a0a; padding: 15px; border-radius: 10px; border: 1px solid #333; text-align: center;">
            <i class="fas fa-bed" style="color: #0a84ff; font-size: 1.5rem; margin-bottom: 10px; display:block;"></i>
            <span style="color:#888;">الغرف</span><div style="color:#fff; font-weight:bold;">${req.rooms}</div>
        </div>` : ''}
        
        ${req.area ? `
        <div class="detail-item" style="background: #0a0a0a; padding: 15px; border-radius: 10px; border: 1px solid #333; text-align: center;">
            <i class="fas fa-ruler-combined" style="color: #0a84ff; font-size: 1.5rem; margin-bottom: 10px; display:block;"></i>
            <span style="color:#888;">المساحة</span><div style="color:#fff; font-weight:bold;">${req.area}</div>
        </div>` : ''}
    </div>

    <!-- ملاحظات العميل -->
    <div class="details-description" style="background: #0a0a0a; padding: 2rem; border-radius: 15px; border: 1px solid #333; margin-bottom: 30px;">
        <h3 style="color: #0a84ff; margin-bottom: 1rem; border-bottom: 1px dashed #333; padding-bottom: 10px;">
            <i class="fas fa-comment-dots"></i> ملاحظات العميل
        </h3>
        <p style="color: #ccc; line-height: 1.8;">${req.description || "لا توجد ملاحظات."}</p>
    </div>

    <!-- الدعوة للفعل -->
    <div class="details-actions" style="background: #111; padding: 30px; border-radius: 20px; text-align: center; border: 1px solid #0a84ff;">
        <h3 style="color: #fff; margin-bottom: 10px;">هل لديك عقار يناسب هذا الطلب؟</h3>
        <p style="color: #888; margin-bottom: 20px;">تواصل معنا فوراً لنربطك بهذا المشتري</p>
        
        <a href="https://wa.me/${whatsappNumber}?text=مرحباً، لدي عقار مناسب للطلب رقم (${id}): ${req.title}" target="_blank" class="action-btn" style="background: #0a84ff; color: #fff; padding: 15px 40px; border-radius: 50px; font-weight: bold; text-decoration: none; display: inline-flex; align-items: center; gap: 10px; font-size: 1.1rem; transition: 0.3s; box-shadow: 0 5px 20px rgba(10, 132, 255, 0.3);">
            <i class="fab fa-whatsapp" style="font-size: 1.4rem;"></i> تواصل لعرض عقارك
        </a>
    </div>

    <div style="text-align: center; margin-top: 3rem;">
        <a href="/requests-filtered.html" style="color: #666; text-decoration: none;">عودة للقائمة</a>
    </div>
  `;
            }
