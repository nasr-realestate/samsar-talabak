/**
 * نظام تحميل تفاصيل الطلب (الإصدار النهائي v8.1 - مع إصلاح مسار الفهرس)
 */
document.addEventListener("DOMContentLoaded", async function () {
  const container = document.getElementById("request-details");
  if (!container) { 
    console.error("خطأ فادح: الحاوية #request-details غير موجودة في الصفحة.");
    return; 
  }

  container.style.maxWidth = '960px';
  container.style.margin = '20px auto';
  container.style.padding = '0 15px';

  let requestId = null;
  try {
    const path = window.location.pathname;
    const parts = path.split('/').filter(Boolean);
    if (parts[0] === 'request' && parts.length > 1) {
      requestId = parts[1];
    }
  } catch (e) {
    showErrorState(container, "الرابط المستخدم غير صالح.");
    return;
  }

  if (!requestId) {
    showErrorState(container, `لم يتم تحديد مُعرّف الطلب في الرابط.`);
    return;
  }
  
  try {
    // ✨✨✨ الإصلاح الحاسم والنهائي هنا ✨✨✨
    const indexUrl = `/data/requests_index.json`;
    
    const indexRes = await fetch(`${indexUrl}?t=${Date.now()}`);
    if (!indexRes.ok) throw new Error(`فشل تحميل فهرس الطلبات (خطأ ${indexRes.status}).`);

    const masterIndex = await indexRes.json();
    const requestInfo = masterIndex.find(r => String(r.id) === String(requestId));

    if (!requestInfo) {
      throw new Error(`الطلب بالرقم "${requestId}" غير موجود في الفهرس.`);
    }

    const requestRes = await fetch(`${requestInfo.path}?t=${Date.now()}`);
    if (!requestRes.ok) throw new Error(`فشل تحميل بيانات الطلب.`);
    
    const requestData = await requestRes.json();
    
    updateSeoTags(requestData, requestId); 
    renderRequestDetails(requestData, container, requestId);

  } catch (err) {
    console.error("Error in data fetching chain:", err);
    showErrorState(container, err.message);
  }
});

// ... (باقي دوال العرض والمساعدة تبقى كما هي)
// (showErrorState, copyToClipboard, updateSeoTags, renderRequestDetails)
