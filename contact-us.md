---
layout: default
title: تواصل معنا
description: تواصل مع فريق سمسار طلبك
---

<section class="contact-section">
  <h2 class="section-title">فريق العمل</h2>
  <div class="contact-grid">
    {% for person in site.data.team %}
      <div class="contact-card">
        <h3>{{ person.name }}</h3>
        <p>{{ person.role }}</p>
        <div class="contact-buttons">
          <a href="tel:{{ person.phone }}" class="phone-btn">
            <i class="fas fa-phone"></i>
          </a>
          <a href="https://wa.me/{{ person.phone | remove: '+' }}" class="whatsapp-btn">
            <i class="fab fa-whatsapp"></i>
          </a>
        </div>
      </div>
    {% endfor %}
  </div>

  <div style="text-align:center; margin-top: 2rem;">
    <a href="/samsar-talabak/properties-filtered.html" class="back-btn">
      ← العودة للعقارات
    </a>
  </div>
</section>
