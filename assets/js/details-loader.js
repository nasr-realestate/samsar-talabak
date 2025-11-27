/**
 * 🏢 سمسار طلبك - مدير تفاصيل العقار (نظام البحث الذكي في الفهرس)
 * v13.0 - Smart Index Lookup
 */

document.addEventListener("DOMContentLoaded", async function () {
  const container = document.getElementById("details-container");
  
  // 1. استخراج البيانات من الرابط
  const urlParams = new URLSearchParams(window.location.search);
  const category = urlParams.get('category'); // مثال: apartments
  const propertyId = urlParams.get('id');     // مثال: flat-01

  // التحقق المبدئي
  if (!category || !propertyId) {
    showErrorState(container, "رابط الصفحة غير مكتمل (ينقص القسم أو المعرف).");
    return;
  }

  try {
    // ---------------------------------------------------------
    // 🔍 الخطوة 1: جلب الفهرس (Index) لمعرفة الاسم الصحيح للملف
    // ---------------------------------------------------------
    const indexUrl = `/data/properties/${category}/index.json`;
    console.log("جاري فحص الفهرس:", indexUrl);

    const indexResponse = await fetch(indexUrl);
    if (!indexResponse.ok) {
        throw new Error(`لم أستطع الوصول لقائمة عقارات قسم: ${category}`);
    }

    const filesList = await indexResponse.json();
    
    // ---------------------------------------------------------
    // 🔍 الخطوة 2: البحث عن الملف المطابق داخل الفهرس
    // ---------------------------------------------------------
    // نبحث عن الملف الذي يحتوي اسمه على الـ ID الموجود في الرابط
    // سواء كان الاسم مطابقاً تماماً أو بدون الامتداد .json
    const targetFilename = filesList.find(filename => {
        const cleanName = filename.replace('.json', '');
        return cleanName === propertyId;
    });

    if (!targetFilename) {
        throw new Error(`العقار رقم "${propertyId}" غير موجود في قائمة قسم ${category}.`);
    }

    // ---------------------------------------------------------
    // 🔍 الخطوة 3: جلب ملف العقار بالاسم الصحيح الذي وجدناه
    // ---------------------------------------------------------
    const finalFetchUrl = `/data/properties/${category}/${targetFilename}`;
    console.log("تم العثور على الملف، جاري التحميل:", finalFetchUrl);

    const propertyResponse = await fetch(finalFetchUrl);
    if (!propertyResponse.ok) {
        throw new Error("وجدنا الاسم في الفهرس، لكن ملف البيانات نفسه مفقود!");
    }

    const propertyData = await propertyResponse.json();
    
    // 4. تحديث العنوان والرسم
    document.title = `${propertyData.title || 'تفاصيل عقار'} | سمسار طلبك`;
    renderLuxuryDetails(propertyData, container, propertyId);

  } catch (err) {
    console.error("Details Error:", err);
    // عرض رسالة خطأ مفيدة جداً لك
    showErrorState(container, `
        <strong>حدث خطأ في تحديد مسار الملف:</strong><br>
        ${err.message}<br><br>
        <small style="color:#aaa">تأكد أن اسم المجلد في 'data/properties' يطابق الكلمة '${category}' تماماً.</small>
    `);
  }
});

// --- دالة الرسم (التصميم الذهبي الفاخر - بدون تعديل) ---
function renderLuxuryDetails(prop, container, id) {
  const price = prop.price_display || prop.price || "السعر عند الاتصال";
  const title = prop.title || "عرض مميز";
  const location = prop.location || "مدينة نصر";
  const whatsappNumber = "201147758857";

  container.innerHTML = `
    <!-- رأس الصفحة -->
    <div class="details-header" style="flex-direction: column; align-items: flex-start; border-bottom: 1px solid var(--color-border); padding-bottom: 20px; margin-bottom: 30px;">
      <div style="display:flex; justify-content:space-between; width:100%; align-items:flex-start; flex-wrap:wrap; gap:15px;">
          <div style="flex: 1;">
              <div style="color: var(--color-primary); font-size: 0.9rem; margin-bottom: 5px; text-transform: uppercase;">
                  <i class="fas fa-certificate"></i> عرض موثوق
              </div>
              <h1 style="color: #fff; font-size: 2rem; margin: 0 0 10px 0; line-height: 1.3;">${title}</h1>
              <p style="color: var(--color-text-secondary); font-size: 1.1rem;">
                  <i class="fas fa-map-marker-alt" style="color: var(--color-primary);"></i> ${location}
              </p>
          </div>
          <div class="details-price" style="background: linear-gradient(135deg, var(--color-primary), #b38f1d); color: #000; padding: 15px 30px; border-radius: 15px; text-align: center; box-shadow: 0 10px 30px rgba(212, 175, 55, 0.2);">
              <div style="font-size: 0.9rem; opacity: 0.8; font-weight: bold;">السعر المطلوب</div>
              <div style="font-size: 1.5rem; font-weight: 900;">${price}</div>
          </div>
      </div>
    </div>

    <!-- شبكة المواصفات -->
    <div class="details-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 30px;">
        ${prop.area ? `<div class="detail-item" style="background: var(--color-surface-2); padding: 15px; border-radius: 10px; border: 1px solid var(--color-border-light); color: #fff;"><i class="fas fa-ruler-combined" style="color: var(--color-primary); font-size: 1.2rem; margin-bottom: 5px; display: block;"></i><span style="color:#888; font-size:0.9rem;">المساحة</span><div style="font-size:1.2rem; font-weight:bold;">${prop.area}</div></div>` : ''}
        ${prop.rooms ? `<div class="detail-item" style="background: var(--color-surface-2); padding: 15px; border-radius: 10px; border: 1px solid var(--color-border-light); color: #fff;"><i class="fas fa-bed" style="color: var(--color-primary); font-size: 1.2rem; margin-bottom: 5px; display: block;"></i><span style="color:#888; font-size:0.9rem;">الغرف</span><div style="font-size:1.2rem; font-weight:bold;">${prop.rooms}</div></div>` : ''}
        ${prop.floor ? `<div class="detail-item" style="background: var(--color-surface-2); padding: 15px; border-radius: 10px; border: 1px solid var(--color-border-light); color: #fff;"><i class="fas fa-building" style="color: var(--color-primary); font-size: 1.2rem; margin-bottom: 5px; display: block;"></i><span style="color:#888; font-size:0.9rem;">الدور</span><div style="font-size:1.2rem; font-weight:bold;">${prop.floor}</div></div>` : ''}
        ${prop.finish_type ? `<div class="detail-item" style="background: var(--color-surface-2); padding: 15px; border-radius: 10px; border: 1px solid var(--color-border-light); color: #fff;"><i class="fas fa-paint-roller" style="color: var(--color-primary); font-size: 1.2rem; margin-bottom: 5px; display: block;"></i><span style="color:#888; font-size:0.9rem;">التشطيب</span><div style="font-size:1.2rem; font-weight:bold;">${prop.finish_type}</div></div>` : ''}
    </div>

    <!-- الوصف -->
    <div class="details-description" style="background: #000; padding: 2rem; border-radius: 15px; border: 1px solid #333; margin-bottom: 30px;">
        <h3 style="color: var(--color-primary); margin-bottom: 1rem; font-size: 1.4rem;"><i class="fas fa-align-right"></i> التفاصيل</h3>
        <p style="color: #ccc; line-height: 1.8; white-space: pre-line; font-size: 1.05rem;">${prop.description || "لا يوجد وصف."}</p>
    </div>

    <!-- أزرار التواصل -->
    <div class="details-actions" style="display: flex; gap: 20px; flex-wrap: wrap;">
        <a href="https://wa.me/${whatsappNumber}?text=استفسار بخصوص: ${title} (كود: ${id})" target="_blank" class="action-btn" style="flex: 2; background: #25D366; color: #fff; padding: 15px; text-align: center; border-radius: 50px; font-weight: bold; text-decoration: none; display: flex; justify-content: center; align-items: center; font-size: 1.2rem;">
            <i class="fab fa-whatsapp" style="margin-left: 10px; font-size: 1.4rem;"></i> تواصل واتساب
        </a>
        <a href="tel:+${whatsappNumber}" class="action-btn" style="flex: 1; border: 2px solid var(--color-primary); color: var(--color-primary); padding: 15px; text-align: center; border-radius: 50px; font-weight: bold; text-decoration: none; display: flex; justify-content: center; align-items: center; font-size: 1.2rem;">
            <i class="fas fa-phone" style="margin-left: 10px;"></i> اتصال
        </a>
    </div>

    <!-- زر عودة -->
    <div style="text-align: center; margin-top: 3rem;">
        <a href="/properties-filtered.html" style="color: #888; text-decoration: none; border-bottom: 1px solid #444; padding-bottom: 5px;">عودة للقائمة</a>
    </div>
  `;
}

function showErrorState(container, message) {
    container.innerHTML = `
        <div class="error-state" style="text-align: center; padding: 4rem; color: #fff; border: 1px solid var(--color-error); border-radius: 15px; background: rgba(255, 0, 0, 0.1);">
            <i class="fas fa-bug" style="font-size: 3rem; margin-bottom: 1rem; color: var(--color-error);"></i>
            <h3 style="color: var(--color-error);">لم نتمكن من عرض العقار</h3>
            <p style="font-size: 1rem; color: #ccc; margin-top: 10px;">${message}</p>
            <a href="/properties-filtered.html" style="margin-top: 2rem; display: inline-block; color: #fff; padding: 10px 20px; border: 1px solid #fff; border-radius: 20px; text-decoration: none;">العودة للعقارات</a>
        </div>
    `;
}
