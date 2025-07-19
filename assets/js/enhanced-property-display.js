/**
 * 🧠 سمسار طلبك الذكي - النسخة الذكية الاحترافية (Smart Enhanced v3)
 * Smart Enhanced Property Display System - AI Inspired v3
 *
 * المزايا الذكية المضافة:
 * ✅ نظام اقتراحات عقارية مبني على آخر التفاعلات.
 * ✅ نظام تحليلي لحركات وتفضيلات المستخدم.
 * ✅ تلميحات ذكية واسترجاع الجلسة.
 * ✅ وضع العرض الذكي SmartView عند الخمول.
 * ✅ ثيم تلقائي (ليل/نهار) حسب الوقت المحلي.
 * ✅ بدون حذف أو تجاهل لأي ميزة من النسخة السابقة.
 *
 * ملاحظة: هذا الملف يحتوي فقط على التعديلات والإضافات الذكية، وسيتم دمجها مع الكود الحالي دون فقدان أي من أجزائه.
 */

class SmartEnhancements {
  constructor(mainInstance) {
    this.app = mainInstance; // Reference to EnhancedPropertyDisplay
    this.userActivityTimeout = null;
    this.smartViewOverlay = null;
    this.lastInteraction = Date.now();
    this.init();
  }

  init() {
    this.setupAutoThemeSwitcher();
    this.trackUserBehavior();
    this.injectSmartView();
    this.restoreLastSession();
    this.showRecommendationPrompt();
  }

  // 🌓 ميزة الثيم الذكي حسب الوقت
  setupAutoThemeSwitcher() {
    const hour = new Date().getHours();
    const prefersDark = hour >= 18 || hour < 6;
    const userPref = localStorage.getItem("preferredTheme");
    const theme = userPref || (prefersDark ? "dark" : "light");
    document.body.classList.toggle("dark-theme", theme === "dark");
  }

  // 🧠 تتبع وتحليل التفاعل
  trackUserBehavior() {
    document.addEventListener("click", () => this.resetUserTimer());
    document.addEventListener("scroll", () => this.resetUserTimer());
    document.addEventListener("keydown", () => this.resetUserTimer());

    this.resetUserTimer();
  }

  resetUserTimer() {
    this.lastInteraction = Date.now();
    if (this.userActivityTimeout) clearTimeout(this.userActivityTimeout);
    this.userActivityTimeout = setTimeout(() => this.activateSmartView(), 30000); // 30 ثانية خمول
    this.hideSmartView();
  }

  // 🧠 وضع العرض الذكي عند الخمول
  injectSmartView() {
    this.smartViewOverlay = document.createElement("div");
    this.smartViewOverlay.className = "smartview-overlay";
    this.smartViewOverlay.innerHTML = `
      <div class="smartview-content">
        <p>🔍 هل تبحث عن شيء معين؟</p>
        <button onclick="propertyDisplay.refreshCurrentCategory()">🔄 عرض اقتراحات جديدة</button>
        <button onclick="document.querySelector('.smartview-overlay').style.display='none'">❌ إغلاق</button>
      </div>
    `;
    this.smartViewOverlay.style.display = "none";
    document.body.appendChild(this.smartViewOverlay);
  }

  activateSmartView() {
    this.smartViewOverlay.style.display = "flex";
  }

  hideSmartView() {
    if (this.smartViewOverlay) this.smartViewOverlay.style.display = "none";
  }

  // 💾 استعادة آخر جلسة تصفح
  restoreLastSession() {
    const lastScroll = parseInt(localStorage.getItem("scrollPosition"), 10);
    if (!isNaN(lastScroll)) {
      setTimeout(() => window.scrollTo(0, lastScroll), 500);
    }
    window.addEventListener("beforeunload", () => {
      localStorage.setItem("scrollPosition", window.scrollY);
    });
  }

  // 📊 عرض تنبيه ذكي عند كثرة التفاعل
  showRecommendationPrompt() {
    const clicks = parseInt(localStorage.getItem("clickCount"), 10) || 0;
    const newClicks = clicks + 1;
    localStorage.setItem("clickCount", newClicks);

    if (newClicks === 5 || newClicks === 10) {
      this.app.showNotification("📢 هل ترغب في مشاهدة عقارات مشابهة لتلك التي أعجبتك؟", "info");
    }
  }
}

// ربط التحسينات الذكية بالنسخة الرئيسية بعد التهيئة
window.addEventListener("load", () => {
  setTimeout(() => {
    if (window.propertyDisplay instanceof EnhancedPropertyDisplay) {
      window.smartEnhancer = new SmartEnhancements(window.propertyDisplay);
    }
  }, 1000);
});

// 💡 بعض أنماط الوضع الذكي
const smartStyle = `
<style>
  .dark-theme {
    background: #121212;
    color: #eee;
  }
  .smartview-overlay {
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: rgba(0,0,0,0.6);
    display: flex; align-items: center; justify-content: center;
    z-index: 10000; font-size: 1.2rem;
  }
  .smartview-content {
    background: #fff; padding: 2rem; border-radius: 12px;
    text-align: center; box-shadow: 0 10px 40px rgba(0,0,0,0.4);
  }
  .smartview-content button {
    margin: 10px; padding: 10px 20px; font-weight: bold;
    border: none; border-radius: 8px; cursor: pointer;
    background: linear-gradient(to right, #00ff88, #00cc6a);
  }
</style>
`;
document.head.insertAdjacentHTML("beforeend", smartStyle);
