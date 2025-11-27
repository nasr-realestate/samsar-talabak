/**
 * 🏢 سمسار طلبك - تفاصيل العقار (النظام النصي الذهبي)
 * يعالج مشكلة التوجيه ويعرض البيانات من الفهرس
 */

document.addEventListener("DOMContentLoaded", async function () {
  const container = document.getElementById("details-container");
  
  if (!container) {
      console.error("خطأ: لم يتم العثور على حاوية details-container");
      return;
  }

  // 1. استخراج معرف العقار (ID) من الرابط
  const urlParams = new URLSearchParams(window.location.search);
  const propertyId = urlParams.get('id');

  if (!propertyId) {
    showErrorState(container, "رابط العقار غير صحيح (لا يوجد معرف ID).");
    return;
  }

  try {
    // -----------------------------------------------------------
    // 🔍 الخطوة 1: جلب الفهرس الرئيسي (الحل السحري للمسارات)
    // -----------------------------------------------------------
    const indexUrl = `/data/properties_index.json?t=${Date.now()}`;
    
    const indexResponse = await fetch(indexUrl);
    if (!indexResponse.ok) throw new Error("فشل في تحميل قاعدة بيانات العقارات (Index).");

    const masterIndex = await indexResponse.json();

    // -----------------------------------------------------------
    // 🔍 الخطوة 2: البحث عن العقار داخل الفهرس
    // -----------------------------------------------------------
    // نبحث عن العقار الذي يطابق الـ ID (سواء كان رقم أو نص)
    const targetPropertyInfo = masterIndex.find(item => String(item.id) === String(propertyId));

    if (!targetPropertyInfo) {
        throw new Error(`عذراً، العقار رقم #${propertyId} غير موجود أو تم حذفه.`);
    }

    // -----------------------------------------------------------
    // 🔍 الخطوة 3: جلب ملف البيانات الفعلي
    // -----------------------------------------------------------
    const dataUrl = `${targetPropertyInfo.path}?t=${Date.now()}`;
    
    const dataResponse = await fetch(dataUrl);
    if (!dataResponse.ok) throw new Error("ملف تفاصيل العقار تالف أو غير موجود.");

    const propertyData = await dataResponse.json();
    
    // 4. تحديث العنوان في المتصفح
    document.title = `${propertyData.title || 'تفاصيل عقار'} | سمسار طلبك`;
    
    // 5. رسم التفاصيل (التصميم النصي الفاخر)
    renderTextOnlyDetails(propertyData, container, propertyId);

  } catch (err) {
    console.error("Details Error:", err);
    showErrorState(container, `<strong>حدث خطأ:</strong> ${err.message}`);
  }
});

// ============================================================
// 🎨 دالة الرسم (تصميم البطاقة النصية الكاملة - بدون صور)
// ============================================================
function renderTextOnlyDetails(prop, container, id) {
  // تجهيز البيانات
  const price = prop.price_display || prop.price || "السعر عند الاتصال";
  const title = prop.title || "عرض مميز";
  const location = prop.location || "مدينة نصر";
  const date = prop.date || "حديث";
  const whatsappNumber = "201147758857"; 
  const shareUrl = window.location.href;

  container.innerHTML = `
    <!-- رأس الصفحة: العنوان والموقع -->
    <div class="details-header" style="border-bottom: 1px solid var(--color-border); padding-bottom: 25px; margin-bottom: 30px;">
      
      <div style="margin-bottom: 20px;">
          <div style="color: var(--color-primary); font-size: 0.9rem; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px; display:inline-block; border:1px solid var(--color-primary); padding: 5px 15px; border-radius: 20px;">
              <i class="fas fa-hashtag"></i> كود العرض: ${id}
          </div>
          
          <h1 style="color: #fff; font-size: 2.2rem; margin: 15px 0; line-height: 1.4;">${title}</h1>
          
          <p style="color: var(--color-text-secondary); font-size: 1.2rem; margin: 0;">
              <i class="fas fa-map-marker-alt" style="color: var(--color-primary);"></i> ${location}
          </p>
      </div>

      <!-- السعر (مميز جداً) -->
      <div style="background: linear-gradient(135deg, var(--color-surface-2), #000); border: 1px solid var(--color-primary); padding: 20px; border-radius: 15px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
          <span style="color: #aaa; font-size: 1rem;">السعر المطلوب:</span>
          <span style="color: var(--color-primary); font-size: 1.8rem; font-weight: 900;">${price}</span>
      </div>

    </div>

    <!-- شبكة المواصفات (بدون صور - أيقونات فقط) -->
    <div class="details-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 15px; margin-bottom: 40px;">
        
        ${prop.area ? `
        <div class="detail-item" style="background: var(--color-surface-2); padding: 20px; border-radius: 12px; border: 1px solid var(--color-border-light); text-align: center;">
            <i class="fas fa-ruler-combined" style="color: var(--color-primary); font-size: 1.8rem; margin-bottom: 10px; display: block;"></i>
            <div style="color:#aaa; font-size:0.9rem;">المساحة</div>
            <div style="color:#fff; font-size:1.2rem; font-weight:bold;">${prop.area}</div>
        </div>` : ''}

        ${prop.rooms ? `
        <div class="detail-item" style="background: var(--color-surface-2); padding: 20px; border-radius: 12px; border: 1px solid var(--color-border-light); text-align: center;">
            <i class="fas fa-bed" style="color: var(--color-primary); font-size: 1.8rem; margin-bottom: 10px; display: block;"></i>
            <div style="color:#aaa; font-size:0.9rem;">الغرف</div>
            <div style="color:#fff; font-size:1.2rem; font-weight:bold;">${prop.rooms}</div>
        </div>` : ''}

        ${prop.floor ? `
        <div class="detail-item" style="background: var(--color-surface-2); padding: 20px; border-radius: 12px; border: 1px solid var(--color-border-light); text-align: center;">
            <i class="fas fa-building" style="color: var(--color-primary); font-size: 1.8rem; margin-bottom: 10px; display: block;"></i>
            <div style="color:#aaa; font-size:0.9rem;">الدور</div>
            <div style="color:#fff; font-size:1.2rem; font-weight:bold;">${prop.floor}</div>
        </div>` : ''}

        ${prop.finish_type ? `
        <div class="detail-item" style="background: var(--color-surface-2); padding: 20px; border-radius: 12px; border: 1px solid var(--color-border-light); text-align: center;">
            <i class="fas fa-paint-roller" style="color: var(--color-primary); font-size: 1.8rem; margin-bottom: 10px; display: block;"></i>
            <div style="color:#aaa; font-size:0.9rem;">التشطيب</div>
            <div style="color:#fff; font-size:1.2rem; font-weight:bold;">${prop.finish_type}</div>
        </div>` : ''}

    </div>

    <!-- الوصف النصي الكامل -->
    <div class="details-description" style="background: #0a0a0a; padding: 2.5rem; border-radius: 15px; border: 1px solid #333; margin-bottom: 30px;">
        <h3 style="color: var(--color-primary); margin-bottom: 1.5rem; font-size: 1.5rem; border-bottom: 1px dashed #333; padding-bottom: 15px;">
            <i class="fas fa-align-right"></i> التفاصيل والمميزات
        </h3>
        <p style="color: #ccc; line-height: 2; white-space: pre-line; font-size: 1.1rem;">
            ${prop.description || "لا يوجد وصف إضافي."}
        </p>
        
        <!-- تفاصيل إضافية -->
        ${prop.extra_details ? `
        <div style="margin-top: 25px; padding-top: 20px; border-top: 1px dashed #333;">
            <strong style="color: #fff;">ملاحظات إضافية:</strong> <br>
            <span style="color: #aaa;">${prop.extra_details}</span>
        </div>` : ''}
        
        <div style="margin-top: 30px; font-size: 0.9rem; color: #666; text-align: left;">
            تاريخ الإضافة: ${date}
        </div>
    </div>

    <!-- أزرار الإجراءات (كبيرة وواضحة) -->
    <div class="details-actions" style="display: flex; gap: 15px; flex-wrap: wrap;">
        
        <a href="https://wa.me/${whatsappNumber}?text=السلام عليكم، أستفسر عن العقار: ${title} (كود: ${id})" target="_blank" class="action-btn" style="flex: 2; background: #25D366; color: #fff; padding: 18px; text-align: center; border-radius: 50px; font-weight: bold; text-decoration: none; display: flex; justify-content: center; align-items: center; font-size: 1.2rem; box-shadow: 0 5px 20px rgba(37, 211, 102, 0.2); border: none; transition: 0.3s;">
            <i class="fab fa-whatsapp" style="margin-left: 10px; font-size: 1.5rem;"></i> تواصل واتساب
        </a>

        <a href="tel:+${whatsappNumber}" class="action-btn" style="flex: 1; background: transparent; border: 2px solid var(--color-primary); color: var(--color-primary); padding: 18px; text-align: center; border-radius: 50px; font-weight: bold; text-decoration: none; display: flex; justify-content: center; align-items: center; font-size: 1.2rem; transition: 0.3s;">
            <i class="fas fa-phone" style="margin-left: 10px;"></i> اتصال
        </a>

        <button onclick="navigator.clipboard.writeText('${shareUrl}').then(() => alert('تم نسخ رابط العقار!'))" class="action-btn" style="flex: 0 0 70px; background: #222; color: #fff; border: 1px solid #444; border-radius: 50px; cursor: pointer; font-size: 1.3rem; transition: 0.3s;">
            <i class="fas fa-share-alt"></i>
        </button>

    </div>

    <!-- زر العودة -->
    <div style="text-align: center; margin-top: 4rem;">
        <a href="/properties-filtered.html" class="back-btn" style="color: #888; text-decoration: none; border-bottom: 1px solid #444; padding-bottom: 5px; transition: 0.3s; font-size: 0.95rem;">
            <i class="fas fa-arrow-right"></i> العودة لقائمة العقارات
        </a>
    </div>
  `;
}

// دالة عرض الخطأ
function showErrorState(container, message) {
    container.innerHTML = `
        <div class="error-state" style="text-align: center; padding: 4rem 1rem; color: #fff; border: 1px solid var(--color-error); border-radius: 15px; background: rgba(255, 0, 0, 0.1); margin-top: 2rem;">
            <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem; color: var(--color-error);"></i>
            <h3 style="color: var(--color-error);">عذراً</h3>
            <p style="font-size: 1.1rem; color: #ccc; margin-top: 10px;">${message}</p>
            <a href="/properties-filtered.html" style="margin-top: 2rem; display: inline-block; color: #fff; padding: 12px 30px; border: 1px solid #fff; border-radius: 50px; text-decoration: none;">العودة للقائمة</a>
        </div>
    `;
                                                                           }
