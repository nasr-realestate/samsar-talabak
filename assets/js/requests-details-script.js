/**
 * 🏢 سمسار طلبك - تفاصيل الطلب (يدعم الروابط الذكية)
 */

document.addEventListener("DOMContentLoaded", async function () {
  const container = document.getElementById("request-details-container");
  
  // 🧠 استخراج المعرف بذكاء (من الرابط المباشر أو المعلمات)
  let requestId = new URLSearchParams(window.location.search).get('id');
  
  if (!requestId) {
      const pathSegments = window.location.pathname.split('/').filter(Boolean);
      if (pathSegments.length >= 2 && pathSegments[0] === 'request') {
          requestId = pathSegments[1];
      }
  }

  if (!requestId) {
    container.innerHTML = "<p style='text-align:center; padding:3rem; color:red;'>رابط الطلب غير صحيح.</p>";
    return;
  }

  try {
    // 1. جلب فهرس الطلبات
    const indexUrl = `/data/requests_index.json?t=${Date.now()}`;
    const indexRes = await fetch(indexUrl);
    
    let target = null;
    if (indexRes.ok) {
        const index = await indexRes.json();
        target = index.find(i => String(i.id) === String(requestId));
    }

    if (!target) {
        throw new Error("طلب العميل غير موجود.");
    }

    // 2. جلب الملف
    const res = await fetch(target.path);
    if (!res.ok) throw new Error("تعذر تحميل البيانات.");
    
    const requestData = await res.json();
    
    document.title = `${requestData.title || 'طلب شراء'} | سمسار طلبك`;
    renderRequestDetails(requestData, container, requestId);

  } catch (err) {
    container.innerHTML = `<div style="text-align:center; padding:4rem; color:red;"><h3>عذراً</h3><p>${err.message}</p><a href="/requests-filtered.html" style="color:#fff;">عودة</a></div>`;
  }
});

function renderRequestDetails(req, container, id) {
  const whatsappNumber = "201147758857"; 

  container.innerHTML = `
    <div class="details-header" style="border-bottom: 1px solid #333; padding-bottom: 20px; margin-bottom: 30px;">
      <div style="display:flex; gap:15px; align-items:center; margin-bottom:15px;">
          <span style="background: rgba(10, 132, 255, 0.1); color: #0a84ff; padding: 5px 15px; border-radius: 20px; border: 1px solid #0a84ff; font-size: 0.9rem;">
             <i class="fas fa-user-clock"></i> طلب شراء
          </span>
          <span style="color: #666;">#${id}</span>
      </div>
      
      <h1 style="color: #fff; font-size: 1.8rem; margin: 0 0 10px 0;">${req.title}</h1>
      
      <div style="background: #111; padding: 15px; border-radius: 10px; border: 1px solid #0a84ff; text-align: center; margin-top: 15px;">
          <span style="color:#aaa; font-size:0.9rem; display:block;">الميزانية المرصودة</span>
          <span style="color: #fff; font-size: 1.4rem; font-weight: bold;">${req.budget}</span>
      </div>
    </div>

    <div class="details-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 15px; margin-bottom: 30px;">
        ${req.rooms ? `<div class="detail-item" style="background: #0a0a0a; padding: 15px; border-radius: 10px; border: 1px solid #333; text-align: center;"><i class="fas fa-bed" style="color: #0a84ff; font-size: 1.5rem; margin-bottom: 10px; display:block;"></i><span style="color:#888;">الغرف</span><div style="color:#fff; font-weight:bold;">${req.rooms}</div></div>` : ''}
        ${req.area ? `<div class="detail-item" style="background: #0a0a0a; padding: 15px; border-radius: 10px; border: 1px solid #333; text-align: center;"><i class="fas fa-ruler-combined" style="color: #0a84ff; font-size: 1.5rem; margin-bottom: 10px; display:block;"></i><span style="color:#888;">المساحة</span><div style="color:#fff; font-weight:bold;">${req.area}</div></div>` : ''}
    </div>

    <div class="details-description" style="background: #0a0a0a; padding: 2rem; border-radius: 15px; border: 1px solid #333; margin-bottom: 30px;">
        <h3 style="color: #0a84ff; margin-bottom: 1rem; border-bottom: 1px dashed #333; padding-bottom: 10px;">ملاحظات العميل</h3>
        <p style="color: #ccc; line-height: 1.8;">${req.description || "لا توجد ملاحظات."}</p>
    </div>

    <div class="details-actions" style="background: #111; padding: 30px; border-radius: 20px; text-align: center; border: 1px solid #0a84ff;">
        <h3 style="color: #fff; margin-bottom: 10px;">هل لديك عقار يناسبه؟</h3>
        <a href="https://wa.me/${whatsappNumber}?text=مرحباً، لدي عقار مناسب للطلب رقم (${id}): ${req.title}" target="_blank" class="action-btn" style="background: #0a84ff; color: #fff; padding: 15px 30px; border-radius: 50px; font-weight: bold; text-decoration: none; display: inline-flex; align-items: center; gap: 10px; font-size: 1.1rem;">
            <i class="fab fa-whatsapp" style="font-size: 1.4rem;"></i> تواصل لعرض عقارك
        </a>
    </div>

    <div style="text-align: center; margin-top: 3rem;">
        <a href="/requests-filtered.html" style="color: #666; text-decoration: none;">عودة للقائمة</a>
    </div>
  `;
                              }
