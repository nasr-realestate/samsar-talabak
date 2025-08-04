/**
 * نظام تحميل تفاصيل العقار (النسخة النهائية الكاملة v3.0 - مصححة ومتوافقة مع build.sh)
 */

document.addEventListener("DOMContentLoaded", async function () {
  const container = document.getElementById("property-details");
  
  if (!container) {
    console.error("خطأ فادح: حاوية #property-details غير موجودة في الصفحة.");
    return;
  }

  // --- الخطوة 1: استخراج الـ ID من رابط الصفحة الحالي ---
  let propertyId = null;
  try {
    // الطريقة الجديدة والأكثر قوة لقراءة الـ ID من روابط مثل /property/some-id
    const pathParts = window.location.pathname.split('/').filter(part => part); // تنظيف الأجزاء الفارغة
    if (pathParts[0] === 'property' || pathParts[0] === 'request') {
      propertyId = pathParts[1];
    }
  } catch (e) {
    console.error("خطأ أثناء محاولة قراءة ID العقار من الرابط:", e);
    showErrorState(container, "الرابط المستخدم غير صالح أو تالف.");
    return;
  }

  // التحقق من وجود ID
  if (!propertyId) {
    console.error("لم يتم العثور على ID في الرابط:", window.location.pathname);
    showErrorState(container, "لم يتم تحديد العقار في الرابط. يرجى التأكد من أن الرابط الذي تتبعه صحيح.");
    return;
  }
  
  console.log(`تم العثور على ID: ${propertyId}. بدء عملية جلب البيانات...`);

  // --- الخطوة 2: جلب الفهرس الرئيسي ومطابقة الـ ID ---
  try {
    // تحديد أي فهرس يجب استخدامه بناءً على الرابط
    const indexFileName = window.location.pathname.startsWith('/property') 
        ? 'properties_index.json' 
        : 'requests_index.json';

    console.log(`جاري جلب الفهرس الرئيسي: /data/${indexFileName}`);
    const indexRes = await fetch(`/data/${indexFileName}?t=${Date.now()}`); // إضافة timestamp لمنع التخزين المؤقت
    
    if (!indexRes.ok) {
      throw new Error(`فشل في جلب ملف الفهرس الرئيسي. (خطأ ${indexRes.status})`);
    }

    const masterIndex = await indexRes.json();
    console.log("تم جلب الفهرس الرئيسي بنجاح:", masterIndex);

    // ✨ إصلاح حاسم: مقارنة الـ ID كنصوص (strings) لضمان التطابق
    const propertyInfo = masterIndex.find(p => String(p.id) === String(propertyId));

    if (!propertyInfo || !propertyInfo.path) {
      console.error(`العقار بالرقم "${propertyId}" غير موجود في الفهرس الرئيسي.`);
      // عرض رسالة خطأ واضحة مع ID
      showErrorState(container, `عذرًا، لا يمكن العثور على بيانات للعقار رقم: ${propertyId}. قد يكون قد تم حذفه.`);
      return;
    }
    
    console.log(`تم العثور على معلومات العقار في الفهرس:`, propertyInfo);

    // --- الخطوة 3: جلب ملف JSON الفعلي للعقار ---
    console.log(`جاري جلب ملف بيانات العقار من المسار: ${propertyInfo.path}`);
    const res = await fetch(`${propertyInfo.path}?t=${Date.now()}`);
    
    if (!res.ok) {
      throw new Error(`فشل في جلب ملف بيانات العقار المحدد. (خطأ ${res.status})`);
    }
    
    const propertyData = await res.json();
    console.log("تم جلب بيانات العقار النهائية بنجاح:", propertyData);
    
    // --- الخطوة 4: عرض البيانات ---
    updateSeoTags(propertyData); // دالة تحديث السيو التي أرسلتها سابقًا
    renderPropertyDetails(propertyData, container); // دالة عرض التفاصيل التي أرسلتها سابقًا

  } catch (err) {
    console.error("حدث خطأ في سلسلة جلب البيانات:", err);
    showErrorState(container, err.message);
  }
});


// --- الدوال المساعدة ---

function showErrorState(container, message) {
  container.innerHTML = `
    <div class="error-state" style="text-align: center; padding: 40px;">
      <div class="error-icon" style="font-size: 3rem;">⚠️</div>
      <h3>حدث خطأ</h3>
      <p style="color: #ccc;">${message}</p>
      <a href="/" class="action-btn back-btn" style="text-decoration: none; color: white; background: #333; padding: 10px 20px; border-radius: 20px; margin-top: 20px; display: inline-block;">العودة للصفحة الرئيسية</a>
    </div>
  `;
}

// ... (هنا يجب أن تضع دالتي updateSeoTags و renderPropertyDetails اللتين أرسلتهما لي سابقًا) ...
// إذا لم تكن متوفرة، سأضع نسخة مبسطة منها للعرض

function renderPropertyDetails(prop, container) {
  const priceToRender = prop.price || "غير محدد";
  const areaToRender = prop.area || 'غير محددة';
  
  container.innerHTML = `
    <header class="details-header">
      <h1>${prop.title || "تفاصيل العرض"}</h1>
    </header>
    <div class="property-id-badge">رقم العقار: ${prop.id || 'غير معروف'}</div>
    <p class="details-price">💰 ${priceToRender}</p>
    <section class="details-grid">
      <div class="detail-item"><strong>📏 المساحة:</strong> ${areaToRender}</div>
      <div class="detail-item"><strong>🛏️ عدد الغرف:</strong> ${prop.rooms ?? 'غير محدد'}</div>
      <div class="detail-item"><strong>🛁 عدد الحمامات:</strong> ${prop.bathrooms ?? 'غير محدد'}</div>
    </section>
    <section class="details-description">
      <h2>📝 الوصف</h2>
      <p>${prop.description || 'لا يوجد وصف متاح'}</p>
    </section>
  `;
}

function updateSeoTags(prop) {
  document.title = `${prop.title || 'عرض عقاري'} - سمسار طلبك`;
  }
