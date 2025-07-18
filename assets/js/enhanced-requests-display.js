/**
 * 🤝 سمسار طلبك - نظام عرض طلبات العملاء المحسن (النسخة النهائية v3 - استقرار وتشخيص)
 * Enhanced Customer Requests Display System (Final Version v3 - Stability & Diagnostics)
 *
 * تحسينات هذه النسخة:
 * - آلية بدء تشغيل معززة لضمان التنفيذ بعد تحميل الصفحة (DOMContentLoaded).
 * - إضافة رسائل تشخيصية (console.log) لتتبع خطوات تنفيذ الكود وتحديد مكان أي خطأ محتمل.
 * - تحسين منطق جلب البيانات وتخزينها مؤقتاً لزيادة الموثوقية.
 * - التأكد من أن جميع العناصر موجودة قبل محاولة استخدامها لمنع الأخطاء.
 */

console.log("SCRIPT: enhanced-requests-display.js has been loaded.");

class EnhancedRequestDisplay {
  constructor() {
    console.log("LOG: Initializing EnhancedRequestDisplay class...");

    // --- 1. تحديد العناصر الأساسية ---
    this.container = document.getElementById("requests-container");
    this.filterContainer = document.getElementById("filter-buttons");
    this.welcomeBox = document.getElementById("welcome-message");

    // --- فحص حاسم لوجود العناصر ---
    if (!this.container || !this.filterContainer) {
      console.error("FATAL ERROR: Could not find essential elements (#requests-container or #filter-buttons). The script will not run.");
      // عرض رسالة خطأ واضحة للمستخدم في الصفحة نفسها
      if (document.body) {
        document.body.innerHTML = '<h1 style="color:red; text-align:center; margin-top: 50px;">خطأ فادح: لم يتم العثور على مكونات الصفحة الأساسية. يرجى مراجعة ملف HTML.</h1>';
      }
      return; // إيقاف التنفيذ بالكامل
    }
    
    console.log("LOG: Essential elements found successfully.");

    // --- 2. إعدادات الكلاس ---
    this.currentFilter = 'all';
    this.currentSort = 'latest';
    this.requestsCache = new Map();
    this.isLoading = false;

    this.filters = {
      "all": { label: "🔍 كل الطلبات", icon: "🔍" },
      "apartments": { label: "🏠 شقق", icon: "🏠" },
      "shops": { label: "🏪 محلات", icon: "🏪" },
      "offices": { label: "🏢 مكاتب", icon: "🏢" },
    };

    // --- 3. بدء العمليات ---
    this.init();
  }

  init() {
    console.log("LOG: Starting init() process...");
    this.injectStyles();
    this.createFilterButtons();
    this.createSortDropdown();
    this.setupEventListeners();
    this.handleWelcomeMessage();
    // استدعاء الوظيفة الرئيسية لجلب وعرض البيانات
    this.fetchAndRenderRequests();
    console.log("LOG: init() process completed.");
  }

  setupEventListeners() {
    window.addEventListener('pageshow', () => this.highlightLastViewedCard());
    console.log("LOG: Event listeners set up.");
  }

  handleWelcomeMessage() {
    if (!this.welcomeBox) {
        console.warn("WARN: Welcome message box not found.");
        return;
    }
    // ... (الكود الخاص بالرسالة الترحيبية يبقى كما هو)
  }

  async fetchAndRenderRequests() {
    if (this.isLoading) {
      console.warn("WARN: A request is already in progress. Aborting new fetch.");
      return;
    }
    
    console.log(`LOG: Fetching data for filter='${this.currentFilter}' and sort='${this.currentSort}'`);
    this.isLoading = true;
    this.showLoadingState();

    try {
      // البيانات الخام يتم جلبها مرة واحدة فقط وتخزينها
      let allRequests = this.requestsCache.get('raw_data');
      if (!allRequests) {
        console.log("LOG: No raw data in cache. Fetching from server...");
        const response = await fetch('/samsar-talabak/data/requests/index.json');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const requestFiles = await response.json();
        console.log(`LOG: Found ${requestFiles.length} files in index.json.`);

        const requestsDataPromises = requestFiles.map(file =>
          fetch(`/samsar-talabak/data/requests/${file}`)
            .then(res => res.ok ? res.json() : Promise.reject(`Failed to load ${file}`))
            .then(data => ({ ...data, id: file.split('.')[0] }))
            .catch(err => {
              console.error("ERROR: Failed to process a file:", err);
              return null; // إرجاع null عند الفشل
            })
        );
        
        allRequests = (await Promise.all(requestsDataPromises)).filter(Boolean); // تصفية أي قيم null
        this.requestsCache.
