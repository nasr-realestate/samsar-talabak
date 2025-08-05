/**
 * نظام تحميل تفاصيل الطلب (نسخة تشخيصية v8.1)
 * الهدف: التأكد من أن السكريبت يجد الحاوية الصحيحة في الصفحة.
 */

document.addEventListener("DOMContentLoaded", async function () {
  const container = document.getElementById("request-details");
  
  // --- ✨ خطوة التشخيص الحاسمة ---
  if (!container) { 
    // إذا لم يجد الحاوية، سيقوم بإنشاء رسالة خطأ واضحة جدًا في أعلى الصفحة
    const errorBanner = document.createElement('div');
    errorBanner.style.cssText = "background-color: #ff4d4d; color: white; text-align: center; padding: 20px; position: fixed; top: 0; left: 0; width: 100%; z-index: 9999;";
    errorBanner.innerHTML = "<b>خطأ فادح:</b> لم يتم العثور على الحاوية المطلوبة. <br>تأكد من أن الـ ID في ملف request-details.html هو <b>request-details</b>";
    document.body.prepend(errorBanner);
    console.error("خطأ فادح: الحاوية #request-details غير موجودة في الصفحة.");
    return; 
  }

  // إذا نجح في إيجاد الحاوية، سيكمل الكود كالمعتاد
  container.innerHTML = `<div style="text-align:center; padding: 40px; color: white;">✅ تم العثور على الحاوية. بدء جلب البيانات...</div>`;

  // ... (باقي كود جلب البيانات الذي أرسلته لك سابقًا يبدأ من هنا) ...
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
  // ... إلخ
});
// (باقي الدوال الأخرى تبقى كما هي)
