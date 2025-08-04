/**
 * نظام تحميل تفاصيل العقار (النسخة النهائية والموثوقة v4.0)
 */

document.addEventListener("DOMContentLoaded", async function () {
    const container = document.getElementById("property-details");
    if (!container) {
        console.error("Fatal Error: Container #property-details not found.");
        return;
    }

    // --- الخطوة 1: استخراج الـ ID من الرابط (طريقة مضمونة) ---
    let propertyId = null;
    try {
        // example: "https://.../property/shqa-ahly-fursan-1"
        const path = window.location.pathname;
        const parts = path.split('/').filter(Boolean); // -> ["property", "shqa-ahly-fursan-1"]

        // تحقق من أن الرابط بالصيغة المتوقعة
        if ((parts[0] === 'property' || parts[0] === 'request') && parts.length > 1) {
            propertyId = parts[1]; // -> "shqa-ahly-fursan-1"
        }
    } catch (e) {
        console.error("Error parsing property ID from URL:", e);
        showErrorState(container, "الرابط المستخدم غير صالح.");
        return;
    }

    if (!propertyId) {
        showErrorState(container, `لم يتم تحديد مُعرّف العقار في الرابط. المسار الحالي: ${window.location.pathname}`);
        return;
    }
    
    // --- الخطوة 2: جلب الفهرس الرئيسي ---
    try {
        const indexType = window.location.pathname.includes('/property/') ? 'properties' : 'requests';
        const indexUrl = `/data/${indexType}_index.json`;
        
        const indexRes = await fetch(`${indexUrl}?t=${Date.now()}`);
        if (!indexRes.ok) throw new Error(`فشل في تحميل فهرس البيانات (Error ${indexRes.status})`);

        const masterIndex = await indexRes.json();
        const propertyInfo = masterIndex.find(p => String(p.id) === String(propertyId));

        if (!propertyInfo) {
            throw new Error(`العقار بالرقم "${propertyId}" غير موجود في الفهرس.`);
        }

        // --- الخطوة 3: جلب بيانات العقار الفعلية ---
        const propertyRes = await fetch(`${propertyInfo.path}?t=${Date.now()}`);
        if (!propertyRes.ok) throw new Error(`فشل في تحميل بيانات العقار من المسار ${propertyInfo.path}`);
        
        const propertyData = await propertyRes.json();
        
        // --- الخطوة 4: عرض البيانات ---
        // (تأكد من وجود هذه الدوال في ملفك)
        updateSeoTags(propertyData); 
        renderPropertyDetails(propertyData, container);

    } catch (err) {
        console.error("Error in data fetching chain:", err);
        showErrorState(container, err.message);
    }
});

// --- الدوال المساعدة (ضع هنا النسخ الكاملة من الدوال الخاصة بك) ---
function showErrorState(container, message) {
    container.innerHTML = `<div class="error-state" style="padding: 40px; text-align: center;">⚠️<h3>حدث خطأ</h3><p>${message}</p><a href="/" style="color:white;">العودة للرئيسية</a></div>`;
}

function renderPropertyDetails(prop, container) {
    container.innerHTML = `<h1>${prop.title || "تفاصيل العرض"}</h1><p>${prop.description || ""}</p>`;
}

function updateSeoTags(prop) {
    document.title = prop.title || "تفاصيل العقار";
}
