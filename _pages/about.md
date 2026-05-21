---
permalink: /
title:
author_profile: true
redirect_from:
  - /about/
  - /about.html
---

<style>
  .home-simple {
    max-width: 760px;
  }

  .home-simple p {
    margin: 0 0 0.75rem;
    line-height: 1.55;
  }

  .home-intro {
    margin-bottom: 2rem;
  }

  .home-section {
    margin-top: 2rem;
    padding-top: 1.15rem;
    border-top: 1px solid #e6e8eb;
  }

  .home-section-title {
    margin: 0 0 1rem;
    font-size: 1.25rem;
    line-height: 1.25;
  }

  .page__content .home-section-title {
    padding-bottom: 0;
    border-bottom: 0;
  }

  .news-list,
  .pub-list {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .news-row,
  .pub-row {
    display: grid;
    grid-template-columns: 5.1rem minmax(0, 1fr);
    gap: 1rem;
  }

  .news-row {
    margin: 0 0 0.9rem;
  }

  .pub-row {
    margin: 0 0 1.15rem;
  }

  .news-date,
  .pub-venue {
    color: #6b7280;
    font-weight: 600;
    white-space: nowrap;
  }

  .pub-year {
    margin: 1.55rem 0 0.85rem;
    padding-top: 0.9rem;
    border-top: 1px solid #edf0f2;
    color: #4b5563;
    font-size: 1rem;
    line-height: 1.2;
  }

  .pub-title {
    margin: 0 0 0.1rem !important;
    font-weight: 600;
    line-height: 1.35;
  }

  .pub-authors,
  .pub-meta,
  .pub-links,
  .pub-note {
    margin: 0.05rem 0 !important;
    line-height: 1.3;
  }

  .pub-note {
    color: #6b7280;
    font-size: 0.92em;
  }

  .pub-badge {
    color: #0077b6;
    font-weight: 700;
  }

  @media (max-width: 640px) {
    .news-row,
    .pub-row {
      grid-template-columns: 1fr;
      gap: 0.15rem;
    }
  }
</style>

<div class="home-simple">
  <div class="home-intro">
    <p>I am a master's student in the School of Computing at KAIST, advised by <a href="https://mlml.kaist.ac.kr/sungjinahn">Prof. Sungjin Ahn</a> at <a href="https://mlml.kaist.ac.kr/">MLML</a>. I received my B.S. in Computer Science from KAIST.</p>
    <p>My research interests lie in world models, theory learning, compositional generalization, and explanation-driven learning. I am especially interested in how models can form structured abstractions from raw observations and reuse them to explain new phenomena.</p>
    <p>Recently, I have been working on <strong>Learning to Theorize</strong>, a framework for inferring executable theories from observations without direct supervision of the underlying causes.</p>
  </div>

  <section class="home-section">
    <h2 class="home-section-title">News</h2>
    <ul class="news-list">
      <li class="news-row">
        <div class="news-date">May 2026</div>
        <div>Our paper <em>Learning to Theorize the World from Observation</em> was selected as an ICML 2026 <strong>Spotlight</strong>.</div>
      </li>
      <li class="news-row">
        <div class="news-date">Mar 2026</div>
        <div>Our paper <em>Extendable Planning via Multiscale Diffusion</em> was selected for an <strong>oral presentation</strong> at AAAI 2026.</div>
      </li>
      <li class="news-row">
        <div class="news-date">Jul 2025</div>
        <div>Our paper <em>Monte Carlo Tree Diffusion for System 2 Planning</em> was selected as an ICML 2025 <strong>Spotlight</strong>.</div>
      </li>
    </ul>
  </section>

  <section class="home-section">
    <h2 class="home-section-title">Selected Publications</h2>

    <h3 class="pub-year">2026</h3>
    <ul class="pub-list">
      <li class="pub-row">
        <div class="pub-venue">ICML</div>
        <div>
          <p class="pub-title">Learning to Theorize the World from Observation</p>
          <p class="pub-authors"><strong>Doojin Baek</strong>*, Gyubin Lee*, Junyeob Baek, Hosung Lee, Sungjin Ahn</p>
          <p class="pub-meta">International Conference on Machine Learning, 2026. <span class="pub-badge">Spotlight</span></p>
          <p class="pub-links"><a href="/publications/learning-to-theorize-the-world/">Project</a> / <a href="https://arxiv.org/abs/2605.03413">arXiv</a> / <a href="https://arxiv.org/pdf/2605.03413">PDF</a></p>
        </div>
      </li>
      <li class="pub-row">
        <div class="pub-venue">AAAI</div>
        <div>
          <p class="pub-title">Extendable Planning via Multiscale Diffusion</p>
          <p class="pub-authors">Chang Chen*, Hany Hamed*, <strong>Doojin Baek</strong>, Taegu Kang, Samyeul Noh, Yoshua Bengio, Sungjin Ahn</p>
          <p class="pub-meta">AAAI Conference on Artificial Intelligence, 2026. <span class="pub-badge">Oral Presentation</span></p>
          <p class="pub-links"><a href="https://arxiv.org/abs/2503.20102">arXiv</a></p>
        </div>
      </li>
    </ul>

    <h3 class="pub-year">2025</h3>
    <ul class="pub-list">
      <li class="pub-row">
        <div class="pub-venue">ICML</div>
        <div>
          <p class="pub-title">Monte Carlo Tree Diffusion for System 2 Planning</p>
          <p class="pub-authors">Jaesik Yoon, Hyeonseo Cho, <strong>Doojin Baek</strong>, Yoshua Bengio, Sungjin Ahn</p>
          <p class="pub-meta">International Conference on Machine Learning, 2025. <span class="pub-badge">Spotlight</span></p>
          <p class="pub-links"><a href="https://arxiv.org/abs/2502.07202">arXiv</a></p>
        </div>
      </li>
    </ul>

    <h3 class="pub-year">2024</h3>
    <ul class="pub-list">
      <li class="pub-row">
        <div class="pub-venue">ICML</div>
        <div>
          <p class="pub-title">Enforcing Constraints in RNA Secondary Structure Predictions: A Post-Processing Framework Based on the Assignment Problem</p>
          <p class="pub-authors">Geewon Suh, Gyeongjo Hwang, Seokjun Kang, <strong>Doojin Baek</strong>, Mingeun Kang</p>
          <p class="pub-meta">International Conference on Machine Learning, 2024</p>
          <p class="pub-links"><a href="https://proceedings.mlr.press/v235/suh24a.html">Paper</a> / <a href="https://openreview.net/forum?id=XGGcnKelda">OpenReview</a></p>
        </div>
      </li>
    </ul>
  </section>
</div>
