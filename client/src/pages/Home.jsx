export default function Home() {
  return (
    <main className="home">
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <span className="hero-badge">✨ Your AI prompt library</span>
          <h1>
            Discover, save &amp; improve <span className="grad-text">AI prompts</span>
          </h1>
          <p className="hero-sub">
            PromptVault is a community vault of battle-tested prompts for ChatGPT, Claude,
            Gemini and every other LLM you use.
          </p>
          <div className="hero-actions">
            <a href="#prompts" className="btn btn-primary">
              Explore prompts
            </a>
            <a href="#about" className="btn btn-ghost">
              How it works
            </a>
          </div>
          <div className="hero-stats">
            <div>
              <strong>12+</strong>
              <span>prompts</span>
            </div>
            <div>
              <strong>8</strong>
              <span>categories</span>
            </div>
            <div>
              <strong>3</strong>
              <span>AI tools</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Everything you need for better prompts</h2>
          <div className="features">
            <div className="feature-card">
              <div className="feature-icon">🔍</div>
              <h3>Discover</h3>
              <p>Browse the vault by category or search by topic, tag and wording.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">❤️</div>
              <h3>Save</h3>
              <p>Create an account and keep your favorite prompts one click away.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🪄</div>
              <h3>Improve</h3>
              <p>AI tools to polish weak prompts, generate new ones and score quality.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Placeholder until Day 5 */}
      <section id="prompts" className="section section-alt">
        <div className="container">
          <h2 className="section-title">Explore the vault</h2>
          <p className="muted">The prompt library arrives tomorrow (Day 5). 🏗️</p>
        </div>
      </section>

      <section id="categories" className="section">
        <div className="container">
          <h2 className="section-title">Categories</h2>
          <p className="muted">Coming on Day 6. 🏗️</p>
        </div>
      </section>

      {/* How it works */}
      <section id="about" className="section section-alt">
        <div className="container">
          <h2 className="section-title">How it works</h2>
          <div className="steps">
            <div className="step">
              <div className="step-num">1</div>
              <h3>Browse</h3>
              <p>Explore prompts by category or search for exactly what you need.</p>
            </div>
            <div className="step">
              <div className="step-num">2</div>
              <h3>Copy</h3>
              <p>Open a prompt, read it, and copy it to your clipboard with one click.</p>
            </div>
            <div className="step">
              <div className="step-num">3</div>
              <h3>Improve</h3>
              <p>Use the AI tools to polish, generate or score any prompt.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
