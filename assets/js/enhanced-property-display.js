/**
 * 🏢 سمسار طلبك - (نسخة الاختبار v5.0 - الحقن القسري)
 * 🛑 هذا الكود لغرض اختبار واحد فقط: هل ملف الجافا سكريبت يعمل؟
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // طباعة رسالة في الكونسول للتأكيد
    console.log("TEST SCRIPT v5.0 IS RUNNING!");

    // إنشاء عنصر H1 جديد كرسالة اختبار واضحة
    const testElement = document.createElement('h1');
    
    // تصميم العنصر ليكون واضحًا جدًا ومستحيل تجاهله
    testElement.style.backgroundColor = "red";
    testElement.style.color = "white";
    testElement.style.textAlign = "center";
    testElement.style.padding = "20px";
    testElement.style.position = "fixed";
    testElement.style.top = "50px"; // أسفل الهيدر قليلاً
    testElement.style.left = "0";
    testElement.style.width = "100%";
    testElement.style.zIndex = "9999";
    
    // محتوى الرسالة
    testElement.textContent = "الاختبار يعمل - The Test is Working";
    
    // حقن الرسالة قسرًا في بداية جسم الصفحة
    document.body.prepend(testElement);
});
