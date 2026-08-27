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
    <p>How do we come to understand the world? This question drives my research on <strong>World Theory Models</strong>: AI systems that construct internal theories of how the world works from observations, inspired by how humans make sense of the world through experience. My broader research interests include compositional generalization, world modeling, and reinforcement learning.</p>
    <p>I am a Ph.D. student in AI Computing at KAIST, advised by <a href="https://mlml.kaist.ac.kr/sungjinahn">Prof. Sungjin Ahn</a> at <a href="https://mlml.kaist.ac.kr/">MLML</a>. I also completed my M.S. in the same group and earned my B.S. in Computer Science at KAIST.</p>
  </div>

  <section class="home-section">
    <h2 class="home-section-title">News</h2>
    <ul class="news-list">
      <li class="news-row">
        <div class="news-date">Jul 2026</div>
        <div>Our paper <em>Learning to Theorize the World from Observation</em> received the <a href="https://compositional-learning.github.io/"><strong>Best Paper Award</strong></a> at the ICML 2026 Workshop on Compositional Learning (CompLearn).</div>
      </li>
      <li class="news-row">
        <div class="news-date">May 2026</div>
        <div>Our paper <em>Learning to Theorize the World from Observation</em> was selected for an ICML 2026 <a href="https://icml.cc/virtual/2026/oral/71176"><strong>Oral Presentation</strong></a>.</div>
      </li>
      <li class="news-row">
        <div class="news-date">Mar 2026</div>
        <div>Our paper <em>Extendable Planning via Multiscale Diffusion</em> was selected for an <a href="https://underline.io/events/501/sessions/21477/lecture/142875-extendable-planning-via-multiscale-diffusion"><strong>oral presentation</strong></a> at AAAI 2026.</div>
      </li>
      <li class="news-row">
        <div class="news-date">Jul 2025</div>
        <div>Our paper <em>Monte Carlo Tree Diffusion for System 2 Planning</em> was selected as an ICML 2025 <a href="https://icml.cc/virtual/2025/poster/44944"><strong>Spotlight</strong></a>.</div>
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
          <p class="pub-meta">International Conference on Machine Learning, 2026. <span class="pub-badge">Oral Presentation</span></p>
          <p class="pub-meta">Award: <a class="pub-badge" href="https://compositional-learning.github.io/">CompLearn 2026 Best Paper</a></p>
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
