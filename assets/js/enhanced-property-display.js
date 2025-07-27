/**
 * 🏢 سمسار طلبك - نظام عرض العقارات المحسن (النسخة المحسّنة v4)
 * تحسينات: أداء + SEO + تجربة مستخدم
 */

class EnhancedPropertyDisplay {
  constructor() {
    // ... البقية كما هي مع تعديلات طفيفة ...

    this.config = {
      // تقليل زمن التحميل لتحسين UX
      loadingDelay: 500,
      // ... البقية كما هي ...
    };
  }

  // ... البقية كما هي ...

  async fetchCategoryData(category) {
    // إضافة تحسينات جلب البيانات لتحسين SEO
    try {
      const indexPath = `/samsar-talabak/data/properties/${category}/index.json`;
      
      // جلب البيانات مع إضافة cache-control
      const cacheBuster = `?v=${new Date().getTime()}`;
      const indexResponse = await fetch(indexPath + cacheBuster, {
        cache: 'reload'
      });
      
      // ... البقية كما هي ...
    } catch (error) {
      console.error('خطأ في جلب البيانات:', error);
      return [];
    }
  }

  createPropertyCard(property, category, index) {
    // إضافة بيانات Schema Markup في الكارد
    const schemaData = {
      "@context": "https://schema.org",
      "@type": "RealEstateListing",
      "name": property.title,
      "description": property.summary || property.description,
      "url": window.location.href,
      "offeredBy": {
        "@type": "RealEstateAgent",
        "name": "سمسار طلبك"
      }
    };

    const card = document.createElement("div");
    card.innerHTML = `
      <!-- إضافة بيانات ميكرو داتا لتحسين SEO -->
      <div itemscope itemtype="https://schema.org/RealEstateListing">
        <meta itemprop="name" content="${this.escapeHtml(property.title)}">
        <meta itemprop="description" content="${this.escapeHtml(property.summary || property.description)}">
        
        <!-- البقية كما كانت -->
        <div class="property-header">
          <!-- ... -->
        </div>
        
        <h2 class="property-title" itemprop="name">${this.escapeHtml(property.title)}</h2>
        
        <div class="property-details" itemprop="offers" itemscope itemtype="https://schema.org/Offer">
          <meta itemprop="price" content="${this.extractPrice(property.price)}">
          <meta itemprop="priceCurrency" content="EGP">
          <!-- ... -->
        </div>
      </div>
    `;
    
    // ... البقية كما هي ...
  }

  // دالة مساعدة لاستخراج السعر لـ Schema.org
  extractPrice(priceText) {
    if (!priceText) return '';
    const match = priceText.match(/(\d[\d,\.]+)/);
    return match ? match[0].replace(/[^\d]/g, '') : '';
  }

  // ... البقية كما هي ...

  injectStyles() {
    // تحسينات أداء للأنيميشن
    const additionalStyles = `
      <style>
        /* تبسيط تأثيرات التحليق للأداء */
        .property-card {
          transform: translateZ(0);
          will-change: transform;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .property-card:hover {
          transform: translateY(-5px) scale(1.01);
          box-shadow: 0 15px 30px rgba(0, 255, 136, 0.15);
        }
        
        /* تحسين تحميل الصور */
        .property-logo {
          loading: lazy;
          fetchpriority: low;
        }
        
        /* تقليل حجم الظلال */
        .page-header {
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        }
        
        /* تحسينات الجوال للأداء */
        @media (max-width: 768px) {
          .property-card {
            padding: 1.2rem;
            transform: none !important;
          }
          
          .property-card:hover {
            transform: none !important;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
          }
        }
      </style>
    `;
    
    // ... البقية كما هي ...
  }

  // ... البقية كما هي ...
}

// بدء تشغيل النظام
const propertyDisplay = new EnhancedPropertyDisplay();
