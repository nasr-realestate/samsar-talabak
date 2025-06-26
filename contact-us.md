---
layout: default
title: تواصل معنا
description: تواصل مع فريق سمسار طلبك في مدينة نصر.
---

<div class="contact-us-page">

  <h1 class="page-title">تواصل معنا</h1>
  
  <div class="team-grid">
    {% assign team = site.data.team %}
    {% for member in team %}
      <div class="contact-card">
        <h3>{{ member.name }}</h3>
        <p>{{ member.role }}</p>
        <div class="contact-icons">
          <a href="tel:{{ member.phone }}" class="contact-icon phone-icon" title="اتصال"><i class="fas fa-phone"></i></a>
          <a href="https://wa.me/{{ member.phone | remove: '+' }}" class="contact-icon whatsapp-icon" title="واتساب" target="_blank"><i class="fab fa-whatsapp"></i></a>
        </div>
      </div>
    {% endfor %}
  </div>

  <div class="back-to-home">
    <a href="/samsar-talabak/properties-filtered.html" class="back-btn">← العودة للعقارات</a>
  </div>

</div>
