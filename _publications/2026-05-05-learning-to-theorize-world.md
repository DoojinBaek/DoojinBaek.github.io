---
title: "Learning to Theorize the World from Observation"
layout: project-page
collection: publications
category: conferences
date: 2026-05-05
venue: "ICML 2026, Spotlight (Top 2.2% = 536/23918)"
venue_html: 'ICML 2026, <span class="spotlight">Spotlight (Top 2.2% = 536/23918)</span>'
permalink: /publications/learning-to-theorize-the-world/
authors: "Doojin Baek*, Gyubin Lee*, Junyeob Baek, Hosung Lee, Sungjin Ahn"
authors_html: '<a href="https://scholar.google.com/citations?user=11X2vTQAAAAJ">Doojin Baek</a><sup>*,1</sup>, <a href="https://lee-gyubin.github.io/">Gyubin Lee</a><sup>*,1</sup>, <a href="https://dion-jy.github.io">Junyeob Baek</a><sup>1</sup>, <a href="https://confeitohs.notion.site">Hosung Lee</a><sup>1</sup>, <a href="https://mlml.kaist.ac.kr/sungjinahn">Sungjin Ahn</a><sup>1,2</sup>'
equal_contribution: "* Equal contribution"
affiliation: "Korea Advanced Institute of Science and Technology; New York University"
affiliation_html: '<sup>1</sup>Korea Advanced Institute of Science and Technology &nbsp;&nbsp; <sup>2</sup>New York University'
paperurl: "https://arxiv.org/pdf/2605.03413"
arxivurl: "https://arxiv.org/abs/2605.03413"
link: "/publications/learning-to-theorize-the-world/"
excerpt: "Doojin Baek\\*, Gyubin Lee\\*, Junyeob Baek, Hosung Lee, Sungjin Ahn."
---

<figure class="hero-figure">
  <img src="/images/learning-to-theorize/main-overview.png" alt="Learning to Theorize framework overview">
  <figcaption>
    <strong>Learning-to-Theorize (L2T) framework.</strong> From raw before-and-after observation pairs, without access to the underlying cause of each change, L2T aims to recover reusable primitives and compose them into executable theories. This enables novel phenomena to be explained by composing learned primitives, whereas entangled composite representations fail to generalize.
  </figcaption>
</figure>

What does it mean to understand the world? Contemporary world models often operationalize understanding as accurate future prediction in latent or observation space. Developmental cognitive science, however, suggests a different view: human understanding emerges through the **construction of internal theories of how the world works**, even before mature language is acquired. Inspired by this theory-building view of cognition, we introduce **Learning-to-Theorize**, a learning paradigm for inferring explicit explanatory theories of the world from raw, non-textual observations.

## Background

Most contemporary AI systems, including recent world models, are primarily optimized for future prediction in latent or observation space, reconstruction quality, or task-specific performance. These objectives do not require models to discover explicit, reusable mechanisms that explain how observations are generated and transformed. They can often be satisfied by learning entangled composite transformations that capture correlations among observed inputs and outputs.

This gap motivates the central question of the paper: **Can an artificial system learn to construct explicit explanatory theories of the world merely by observing raw, non-textual sensory inputs?** Addressing this question requires a shift in learning objectives: from fitting input-output mappings to discovering structured, compositional mechanisms that explain how observations are generated and transformed.

## Learning to Theorize

### Problem Definition
The learner observes only independent pairs of raw observations <span class="math-inline">&#92;((x,y)&#92;)</span>. It does not receive program annotations, primitive labels, intermediate states, language descriptions, or task groups that reveal which examples share the same underlying mechanism. The only available evidence is that some hidden transformation turns <span class="math-inline">&#92;(x&#92;)</span> into <span class="math-inline">&#92;(y&#92;)</span>.

The learning problem is therefore not merely to reconstruct <span class="math-inline">&#92;(y&#92;)</span> from <span class="math-inline">&#92;(x&#92;)</span>, but to recover reusable structure from ungrouped before-and-after evidence. We define the ability to theorize the world as the capacity to (i) discover reusable abstract primitives across phenomena, (ii) learn how to compose them into structured explanations of complex observations, and (iii) explain novel phenomena by forming new compositions of the same primitives. While theories may be instantiated in many concrete forms, such as natural language, probabilistic programs, or symbolic programs, we formulate Learning-to-Theorize (L2T) as latent neural program induction from observation. In this formulation, programs act as executable representations of theories; accordingly, we use the terms **theory** and **program** interchangeably.

#### Phenomenon and Generative Process.

A **phenomenon** is a pair of observations <span class="math-inline">&#92;((x, y)&#92;)</span>, where <span class="math-inline">&#92;(x \sim p(x)&#92;)</span> is a source observation and <span class="math-inline">&#92;(y&#92;)</span> is the corresponding target observation. We assume that each phenomenon is generated by an underlying but unobserved program, or causal mechanism, <span class="math-inline">&#92;(\tau&#92;)</span>, that transforms <span class="math-inline">&#92;(x&#92;)</span> to <span class="math-inline">&#92;(y&#92;)</span>:

<div class="math-display">\[
p(y \mid x, \tau).
\]</div>

A program is a compositional object formed by combining a finite set of primitive operations. Let <span class="math-inline">&#92;(\mathcal{Z}=\lbrace z&#95;1,z&#95;2,\dots,z&#95;M\rbrace&#92;)</span> denote a set of primitive operations, where each primitive <span class="math-inline">&#92;(z&#95;i&#92;)</span> is associated with an execution function <span class="math-inline">&#92;(f&#95;{z&#95;i}:\mathcal{X}\rightarrow\mathcal{X}&#92;)</span>. A program of length <span class="math-inline">&#92;(K&#92;)</span> is defined as an ordered sequence

<div class="math-display">\[
\tau = (z_{i_1}, z_{i_2}, \dots, z_{i_K}), \qquad z_{i_k}\in\mathcal{Z}.
\]</div>

Program execution corresponds to functional composition:

<div class="math-display">\[
f_\tau = f_{z_{i_K}}\circ f_{z_{i_{K-1}}}\circ \cdots \circ f_{z_{i_1}}.
\]</div>

Given a source observation <span class="math-inline">&#92;(x&#92;)</span>, the target observation is obtained by executing the program, either deterministically as <span class="math-inline">&#92;(y=f&#95;\tau(x)&#92;)</span> or more generally through the conditional distribution <span class="math-inline">&#92;(p(y\mid x,\tau)&#92;)</span>. This formulation makes theories compositional and reusable: the same primitive functions can be shared across many phenomena, while new theories arise from new sequences of those primitives.

The space of all finite-length primitive sequences <span class="math-inline">&#92;(\mathcal{Z}^{*}&#92;)</span> grows exponentially with program length, so only a small subset of possible programs can appear during training. We therefore assume that training data are generated by a restricted set of programs:

<div class="math-display">\[
\mathcal{D}_{train}=\{(x_n,y_n)\}_{n=1}^{N}, \qquad
y_n=f_{\tau_n}(x_n), \qquad
\tau_n\in\mathcal{T}_{train}\subset\mathcal{Z}^{*}_{\le K}.
\]</div>

The programs <span class="math-inline">&#92;(\lbrace\tau&#95;n\rbrace&#92;)</span> and their associated execution functions are latent and never observed. Consequently, learning seeks to jointly infer a theory for each phenomenon and to learn a shared set of execution functions that realize these theories. This assumption is intentionally general: in a world-modeling setting, <span class="math-inline">&#92;(x&#95;n&#92;)</span> and <span class="math-inline">&#92;(y&#95;n&#92;)</span> may simply be temporally separated observations, without knowing the time lag, task identity, or mechanism that connects them.

### Transferability as Evidence of Theorization

The main evaluation criterion is **program transferability**. At test time, phenomena are generated by programs drawn from a set disjoint from training:

<div class="math-display">\[
\mathcal{T}_{test}\cap\mathcal{T}_{train}=\emptyset.
\]</div>

The test set can include both new compositions of known primitives and programs longer than those realized during training. Thus, evaluation requires not only compositional generalization but also length generalization, or productivity.

We consider two phenomena <span class="math-inline">&#92;((x^{(1)},y^{(1)})&#92;)</span> and <span class="math-inline">&#92;((x^{(2)},y^{(2)})&#92;)</span> generated by the same latent program <span class="math-inline">&#92;(\tau&#92;)</span>. The model first infers a program <span class="math-inline">&#92;(\hat{\tau}&#92;)</span> from the support pair:

<div class="math-display">\[
\hat{\tau} = \arg\max_{\tau} p(\tau \mid x^{(1)}, y^{(1)}).
\]</div>

Then the inferred program is executed on a new source <span class="math-inline">&#92;(x^{(2)}&#92;)</span>:

<div class="math-display">\[
\hat{y}^{(2)} = D_\theta(f_{\hat{\tau}}(x^{(2)})).
\]</div>

Performance is measured by the observation-space error <span class="math-inline">&#92;(d&#95;{obs}(\hat{y}^{(2)},y^{(2)})&#92;)</span>. This protocol assesses whether the learned theory captures a transferable generative mechanism, rather than merely fitting an individual input-output pair.

## Neural Theorizer

<figure class="paper-figure">
  <img src="/images/learning-to-theorize/main-architecture.png" alt="Neural Theorizer architecture">
  <figcaption>
    NEO infers a latent program by iteratively selecting a primitive and executing it through a shared transition model. Each intermediate state is decoded into a reconstruction, and the MDL criterion selects the shortest accurate explanation length.
  </figcaption>
</figure>

NEO is trained to maximize the conditional likelihood <span class="math-inline">&#92;(p&#95;\theta(y \mid x)&#92;)</span>. To explicitly model theory construction, it introduces two latent variables: a program <span class="math-inline">&#92;(\tau=(z&#95;{i&#95;1},\dots,z&#95;{i&#95;K})&#92;)</span> and its execution trace <span class="math-inline">&#92;(s=(s&#95;1,\dots,s&#95;{K+1})&#92;)</span>. Under a Markov assumption, the conditional distribution is written as

<div class="math-display">\[
p_\theta(y \mid x)=\int p_\theta(y \mid s_{K+1})\,p_\theta(\tau,s \mid x)\,d\tau\,ds.
\]</div>

The prior over programs and execution traces factorizes as

<div class="math-display">\[
p_\theta(\tau,s \mid x)
=p_\theta(s_1 \mid x)\prod_{k=1}^{K}p_\theta(z_{i_k}\mid s_k)\,p_\theta(s_{k+1}\mid s_k,z_{i_k}).
\]</div>

Here, <span class="math-inline">&#92;(p&#95;\theta(s&#95;1 \mid x)&#92;)</span> maps observations to latent states, <span class="math-inline">&#92;(p&#95;\theta(z&#95;{i&#95;k}\mid s&#95;k)&#92;)</span> defines a theory programmer that selects primitive operations, and <span class="math-inline">&#92;(p&#95;\theta(s&#95;{k+1}\mid s&#95;k,z&#95;{i&#95;k})&#92;)</span> defines a shared transition operator implementing primitive execution.

Since exact marginalization is intractable, NEO introduces a variational posterior:

<div class="math-display">\[
q_\phi(\tau,s \mid x,y)
=p_\theta(s_1\mid x)\prod_{k=1}^{K}q_\phi(z_{i_k}\mid s_k,y)\,p_\theta(s_{k+1}\mid s_k,z_{i_k}).
\]</div>

The theory programmer <span class="math-inline">&#92;(q&#95;\phi(z&#95;{i&#95;k}\mid s&#95;k,y)&#92;)</span> is a goal-conditioned policy over primitive operations. Given the current latent state <span class="math-inline">&#92;(s&#95;k&#92;)</span> and target observation <span class="math-inline">&#92;(y&#92;)</span>, it selects the next primitive to steer the execution trace toward a latent state that explains <span class="math-inline">&#92;(y&#92;)</span>, thereby inducing a compositional program without explicit program supervision.

### Minimum Description Length

Assuming a fixed program length is unrealistic: simple phenomena should not be forced into unnecessarily long explanations. NEO therefore uses the Minimum Description Length principle and favors explanations that are both accurate and short. For each intermediate step <span class="math-inline">&#92;(k&#92;)</span>, the model decodes a reconstruction <span class="math-inline">&#92;(\hat{y}&#95;k=D&#95;\theta(s&#95;k)&#92;)</span> and selects

<div class="math-display">\[
k^*=\arg\min_{k\in\{1,\dots,K+1\}}\lambda_{\text{MDL}}^k\,\ell(y,\hat{y}_k),
\]</div>

where <span class="math-inline">&#92;(\lambda&#95;{\text{MDL}}>1&#92;)</span> penalizes longer programs. The model is then updated using the prediction at the selected explanation length <span class="math-inline">&#92;(k^*&#92;)</span>. This pressure encourages the model to explain each phenomenon using the shortest accurate program.

NEO also grounds intermediate states to the observation manifold through a decode-encode consistency term:

<div class="math-display">\[
\mathcal{L}_{state}=\sum_{k=1}^{K}\left\|s_k-\mathrm{sg}[E_\theta(D_\theta(s_k))]\right\|^2.
\]</div>

This prevents intermediate states from drifting into arbitrary latent regions that may reconstruct the final target but fail to support reusable primitive execution.

## Experiments

We introduce the **Observation-to-Theory Induction Benchmark (OTIB)** to evaluate whether a model can infer reusable primitives from raw observation pairs without supervision. Its central criterion is transferable explanation: a theory induced from one transition should generalize to new inputs, rather than memorizing instance-specific mappings.

OTIB separates three regimes. The in-distribution test set uses held-out examples from the training program support. The compositional OOD set holds out program compositions within the same observable length range. The length OOD set uses longer programs than those seen during training. This separation is important because a model can appear successful on in-distribution reconstruction while failing to compose primitives in a new way.

Each evaluation instance consists of a support pair <span class="math-inline">&#92;((x^{(1)},y^{(1)})&#92;)</span> and a query pair <span class="math-inline">&#92;((x^{(2)},y^{(2)})&#92;)</span> generated by the same latent program. Given the support pair, a model induces a theory <span class="math-inline">&#92;(\hat{\tau}&#92;)</span>. The induced theory is then executed on both <span class="math-inline">&#92;(x^{(1)}&#92;)</span> and <span class="math-inline">&#92;(x^{(2)}&#92;)</span>, producing <span class="math-inline">&#92;(\hat{y}^{(1)}&#92;)</span> and <span class="math-inline">&#92;(\hat{y}^{(2)}&#92;)</span>. **Self-explainability** measures whether the model explains the original support pair. **Transferability** measures whether the same inferred theory generalizes to the query input, rather than encoding instance-specific information about <span class="math-inline">&#92;(y^{(1)}&#92;)</span>.

We instantiate OTIB in three domains:

<div class="table-wrap benchmark-table-wrap">
  <table class="project-table benchmark-table">
    <thead>
      <tr>
        <th>Domain</th>
        <th>Hidden primitives</th>
        <th>Generalization</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>GridWorld</td>
        <td>Up, right, down, left moves on a 10x10 grid</td>
        <td>Comp. OOD + length OOD up to 8 steps</td>
      </tr>
      <tr>
        <td>Arithmetic Factorization</td>
        <td>Multiplication by <span class="math-inline">&#92;(2,3,5,7&#92;)</span></td>
        <td>Comp. OOD + length OOD up to 6 steps</td>
      </tr>
      <tr>
        <td>Image Editing</td>
        <td>brightness+/-, hue+/-, flip h/v, rotation, mask</td>
        <td>Comp. OOD + length OOD up to 4 steps</td>
      </tr>
    </tbody>
  </table>
</div>

The parameter <span class="math-inline">&#92;(\alpha\in\lbrace 0.33,0.66,1.00\rbrace&#92;)</span> controls the fraction of short programs included in training. Smaller <span class="math-inline">&#92;(\alpha&#92;)</span> creates a harder setting where some primitives are never observed in isolation and must be discovered by decomposing entangled multi-step transitions. By construction, the training compositions contain enough evidence in principle to recover the full primitive set; the benchmark asks whether a model can actually perform that decomposition.

### Results

The experiments ask whether NEO can (1) discover latent primitive operations that are never directly observed during training and (2) explain dynamics arising from previously unseen program compositions. The main failure mode to watch for is the gap between self-explainability and transferability. Monolithic latent baselines can often reconstruct the support target, but the same latent action does not transfer to a query input, indicating that it encodes instance-specific information rather than a reusable theory.

<div class="figure-pair table-pair">
  <figure class="paper-figure pair-figure">
    <img src="/images/learning-to-theorize/table1.png" alt="GridWorld performance table">
    <figcaption>
      Performance comparison on the GridWorld environment.
    </figcaption>
  </figure>

  <figure class="paper-figure pair-figure">
    <img src="/images/learning-to-theorize/table2.png" alt="Arithmetic Factorization performance table">
    <figcaption>
      Performance comparison on the Arithmetic Factorization Reasoning task.
    </figcaption>
  </figure>
</div>

On GridWorld, monolithic baselines transfer well in-distribution but largely collapse on compositional and length OOD splits. This suggests that a single latent vector can capture familiar transformations without inducing the primitive structure required for systematic transfer. In contrast, NEO maintains strong OOD transfer, and NEO-S further improves transferability by sampling candidate theories at test time.

Arithmetic Factorization is a stricter test because successful transfer requires exact multi-step symbolic execution. NEO still outperforms monolithic baselines on compositional OOD, showing that it can acquire reusable multiplicative primitives. Length OOD remains harder for the learned policy alone, but NEO-S substantially improves performance by searching over diverse compositions of the same learned primitive set.

<figure class="paper-figure">
  <img src="/images/learning-to-theorize/image-editing-results.png" alt="Image editing results across alpha splits and OOD settings">
  <figcaption>
    Comparison of Image Editing performance. NEO consistently outperforms baselines across all <span class="math-inline">&#92;(\alpha&#92;)</span>-controlled OOD regimes and length OOD, for both self-explainability and transferability, as measured by the <span class="math-inline">&#92;(\ell&#95;1&#92;)</span> distance (lower is better).
  </figcaption>
</figure>

The same pattern appears in the high-dimensional visual setting. Image Editing requires the model to infer transformations such as brightness adjustment, hue shift, flip, rotation, and masking from pixels. NEO achieves lower reconstruction error across compositional and length OOD regimes, supporting the interpretation that it explains target images through executable primitive edits rather than a single monolithic program vector.

<div class="figure-pair">
  <figure class="paper-figure pair-figure">
    <img src="/images/learning-to-theorize/imged_adapthalt.png" alt="Adaptive program length selection in image editing">
    <figcaption>
      NEO selects the number of steps to match the hidden rule, using short explanations for simple changes and longer ones when needed.
    </figcaption>
  </figure>

  <figure class="paper-figure pair-figure">
    <img src="/images/learning-to-theorize/imged_visualization.png" alt="Qualitative image editing explanations">
    <figcaption>
      For compositional OOD cases, NEO builds the target from learned primitive actions, yielding an explicit and transferable explanation.
    </figcaption>
  </figure>
</div>

### Analysis

A central piece of evidence for L2T is whether the learned codes recover primitive structure rather than memorizing observed composite transformations. In low-<span class="math-inline">&#92;(\alpha&#92;)</span> settings, some primitives are never observed in isolation. A model that simply memorizes observed transformations can only learn entangled composite actions. NEO instead recovers primitive-level codes and composes them into multi-step programs, suggesting that it learns reusable operations rather than training-set-specific shortcuts.

The primitiveness analysis measures whether learned codes cover the ground-truth primitive set. The GT bar reflects only the primitives directly observable in training, so matching that bar is not enough: a model that memorizes visible transformations can appear competent without discovering hidden primitives. NEO exceeds this directly observable set and often approaches full primitive coverage, indicating that it decomposes multi-step transitions into reusable actions.

<figure class="paper-figure half-figure">
  <img src="/images/learning-to-theorize/primitiveness.png" alt="Primitiveness of learned codebook">
  <figcaption>
    Primitiveness of the learned codebooks. NEO could recover the full primitive set even when only a subset is directly observable.
  </figcaption>
</figure>

<figure class="paper-figure">
  <img src="/images/learning-to-theorize/sampling-combined.png" alt="Test-time scaling by sampling programs">
  <figcaption>
    Test-time scaling samples multiple candidate theories from the probabilistic theory programmer.
  </figcaption>
</figure>

Sampling-based test-time scaling provides another view of the same structure. Because NEO represents explanations as explicit programs, inference can explore multiple candidate compositions without changing the learned executor. Increasing the sampling budget improves the chance of finding a correct execution path, especially in domains where the primitive set is learned but long-horizon program selection remains difficult.

<!-- <figure class="paper-figure">
  <img src="/images/learning-to-theorize/long-trajectories.png" alt="Length OOD visualizations in GridWorld">
  <figcaption>
    Length OOD visualizations show that the same primitive executor can be applied beyond the training horizon by continuing the composition process.
  </figcaption>
</figure> -->

## Takeaway

Taken together, the results support the central claim of Learning-to-Theorize: structured, executable theories can be learned from raw observation pairs without program supervision. NEO's advantage does not come merely from better reconstruction. It comes from representing explanations as compositional programs, learning primitives that can be reused across phenomena, and regulating explanation length through the MDL principle.

This proof of concept points toward world models that move beyond prediction-centric learning. Instead of only forecasting observations, such models can infer compact mechanisms that explain what changed and can execute those mechanisms in new contexts.

## Limitations

This work should be viewed as an initial proof of concept for Learning-to-Theorize. The current formulation assumes a relatively small, discrete set of primitives and short program lengths, which limits scalability to domains with long-horizon, continuous, or highly structured dynamics. Primitive semantics are induced through reconstruction and are therefore not guaranteed to align with human-interpretable concepts or truly causal factors. The inference procedure also relies on deterministic execution and reconstruction-based stopping criteria, which may be brittle under noise, ambiguity, or partial observability. The experiments are also restricted to controlled synthetic benchmarks. Extending L2T to richer real-world environments with complex perceptual inputs, stochastic dynamics, and open-ended theory spaces remains an important direction for future work.

## BibTeX

```bibtex
@inproceedings{baek2026learning,
  title     = {Learning to Theorize the World from Observation},
  author    = {Baek, Doojin and Lee, Gyubin and Baek, Junyeob and Lee, Hosung and Ahn, Sungjin},
  booktitle = {Proceedings of the 43rd International Conference on Machine Learning},
  year      = {2026}
}
```
