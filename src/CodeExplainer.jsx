import { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import './App.css';

const LANGUAGE_OPTIONS = [
    'JavaScript',
    'Python',
    'Java',
    'C++',
    'C',
    'TypeScript',
    'Go',
    'Rust',
    'PHP',
    'Ruby',
    'Swift',
    'Kotlin',
    'SQL',
    'HTML/CSS',
    'Bash',
    'Other',
];

const MODE_OPTIONS = [
    { id: 'standard', label: 'Standard' },
    { id: 'beginner', label: 'Beginner Mode' },
    { id: 'lineby', label: 'Line-by-Line' },
    { id: 'improve', label: 'Improvements' },
];

const initialCode = `// Paste your code here...

for (let i = 0; i < 5; i++) {
  console.log('Value:', i);
}`;

const modeInstructions = {
    standard: `You are a highly experienced programmer and teacher. Explain the given code in a structured, easy-to-understand way.

Instructions:
- Start with a 2-3 sentence summary.
- Explain each meaningful line or block in order with a brief description.
- Use simple English.
- Highlight important logic.
- Identify any mistakes, bad practices, or inefficiencies.
- Suggest improvements or an optimized version if applicable.
- List key programming concepts used.

Output as structured JSON with this exact shape:
{
  "summary": "...",
  "lines": [{"code":"...", "explanation":"..."}],
  "concepts": ["..."],
  "improvements": "...",
  "improvedCode": "..."
}
Return ONLY the JSON. No markdown, no backticks, no extra text.`,

    beginner: `You are a patient teacher explaining code to an absolute beginner.
- Use very simple, friendly language
- Use real-world analogies where possible
- Explain every technical term briefly when first used
- Be encouraging and clear

Output as JSON:
{
  "summary": "...",
  "lines": [{"code":"...", "explanation":"..."}],
  "concepts": ["..."],
  "improvements": "...",
  "improvedCode": ""
}
Return ONLY valid JSON.`,

    lineby: `Explain each line of the following code separately and precisely.
For every line: show the exact line, then explain exactly what it does.

Output as JSON:
{
  "summary": "...",
  "lines": [{"code":"...", "explanation":"..."}],
  "concepts": ["..."],
  "improvements": "",
  "improvedCode": ""
}
Return ONLY valid JSON.`,

    improve: `Analyze the following code and focus entirely on improvements.
- Identify readability issues
- Point out performance problems
- Flag bad practices or anti-patterns
- Provide an improved, cleaner version

Output as JSON:
{
  "summary": "Brief description of what the code does.",
  "lines": [],
  "concepts": [],
  "improvements": "Detailed improvement suggestions here...",
  "improvedCode": "// improved code here"
}
Return ONLY valid JSON.`,
};

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function formatHtml(value) {
    return { __html: escapeHtml(value).replace(/\n/g, '<br/>') };
}

function buildPrompt(code, lang, mode) {
    return `${modeInstructions[mode]}\n\nCode Language: ${lang}\n\nCode:\n${code}`;
}

function CodeExplainer() {
    const [code, setCode] = useState(initialCode);
    const [language, setLanguage] = useState('JavaScript');
    const [mode, setMode] = useState('standard');
    const [output, setOutput] = useState(null);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState('');
    const { user, signOut } = useAuth();

    useEffect(() => {
        if (!toast) return undefined;
        const timer = window.setTimeout(() => setToast(''), 2600);
        return () => window.clearTimeout(timer);
    }, [toast]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('fade-in');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12 },
        );

        document.querySelectorAll('.feature-card, .team-card, .step, .about-stat').forEach((element) => {
            observer.observe(element);
        });

        return () => observer.disconnect();
    }, []);

    async function handleExplain() {
        if (!code.trim()) {
            setToast('Please paste some code first!');
            return;
        }

        setLoading(true);
        setOutput(null);

        try {
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'claude-sonnet-4-20250514',
                    max_tokens: 1000,
                    messages: [{ role: 'user', content: buildPrompt(code, language, mode) }],
                }),
            });

            const data = await response.json();
            const raw = Array.isArray(data.content)
                ? data.content.map((item) => item.text || '').join('')
                : data.completion || data.text || '';

            const clean = raw.replace(/```json|```/g, '').trim();
            const parsed = JSON.parse(clean);
            setOutput(parsed);
        } catch (error) {
            setOutput({ error: true });
        } finally {
            setLoading(false);
        }
    }

    function handleCopy() {
        const text = document.getElementById('outputBody')?.innerText || '';
        navigator.clipboard.writeText(text).then(() => setToast('Copied to clipboard!'));
    }

    const outputContent = output ? (
        output.error ? (
            <div className="error-message">
                <strong>Something went wrong.</strong>
                <span>Please check your connection and try again.</span>
            </div>
        ) : (
            <>
                {output.summary ? (
                    <div className="output-section">
                        <h3>📋 Summary</h3>
                        <p dangerouslySetInnerHTML={formatHtml(output.summary)} />
                    </div>
                ) : null}

                {output.lines && output.lines.length ? (
                    <div className="output-section">
                        <h3>🔎 Line-by-Line Explanation</h3>
                        {output.lines.map((line, index) => (
                            <div className="line-explain" key={`line-${index}`}>
                                <code>{line.code}</code>
                                <div className="desc" dangerouslySetInnerHTML={formatHtml(line.explanation)} />
                            </div>
                        ))}
                    </div>
                ) : null}

                {output.concepts && output.concepts.length ? (
                    <div className="output-section">
                        <h3>💡 Key Concepts</h3>
                        <ul>
                            {output.concepts.map((concept, index) => (
                                <li key={`concept-${index}`}>{concept}</li>
                            ))}
                        </ul>
                    </div>
                ) : null}

                {output.improvements ? (
                    <div className="output-section">
                        <h3>🛠 Improvements</h3>
                        <div className="improvement-box">
                            <p dangerouslySetInnerHTML={formatHtml(output.improvements)} />
                        </div>
                        {output.improvedCode ? (
                            <div className="improved-code">{output.improvedCode}</div>
                        ) : null}
                    </div>
                ) : null}
            </>
        )
    ) : (
        <div className="output-placeholder">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18" />
            </svg>
            <p>
                Your explanation will appear here.
                <br />Paste code and click <strong>Explain Code</strong>.
            </p>
        </div>
    );

    return (
        <div className="app-shell">
            <nav>
                <a href="#home" className="nav-logo">
                    Code<span>Lens</span>
                </a>
                <ul className="nav-links">
                    <li>
                        <a href="#home">Home</a>
                    </li>
                    <li>
                        <a href="#app">Try It</a>
                    </li>
                    <li>
                        <a href="#features">Features</a>
                    </li>
                    <li>
                        <a href="#about">About</a>
                    </li>
                    <li>
                        <a href="#team">Team</a>
                    </li>
                    <li className="user-profile-nav">
                        <span className="user-name">{user?.firstName || 'User'}</span>
                        <span className="user-plan" style={{ fontSize: '0.85rem', color: '#999' }}>
                            ({user?.accountType === 'pro' ? 'Pro' : 'Free'})
                        </span>
                        <button className="logout-btn" onClick={signOut} style={{ marginLeft: '10px', padding: '4px 12px', background: '#ff6b6b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}>
                            Logout
                        </button>
                    </li>
                </ul>
            </nav>

            <section id="home">
                <div className="hero-glow" />
                <div className="hero-tag">✦ AI-Powered Code Explanation</div>
                <h1 className="hero-title">
                    Understand Any Code.
                    <br />
                    In <em>Plain English.</em>
                </h1>
                <p className="hero-subtitle">
                    Paste your code and get an instant, beginner-friendly breakdown — line by line, concept by concept.
                </p>
                <a href="#app" className="hero-cta">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="16 18 22 12 16 6" />
                        <polyline points="8 6 2 12 8 18" />
                    </svg>
                    Start Explaining
                </a>

                <div className="hero-code-preview">
                    <div className="code-bar">
                        <div className="dot r" />
                        <div className="dot y" />
                        <div className="dot g" />
                        <span className="code-bar-label">example.js</span>
                    </div>
                    <pre className="code-preview-body">
                        <span className="t-cm">// Loop from 0 to 4</span>
                        <span className="t-kw">for</span>(<span className="t-kw">let</span> i = <span className="t-num">0</span>; i &lt; <span className="t-num">5</span>; i++) {'{'}
                        <br />  <span className="t-fn">console</span>.<span className="t-fn">log</span>(<span className="t-str">"Value:"</span>, i);
                        <br />{'}'}
                        <br />
                        <br /><span className="t-cm">// ↳ CodeLens explains every single line above ↑</span>
                    </pre>
                </div>
            </section>

            <section id="app">
                <div className="app-container">
                    <div className="section-label">// core tool</div>
                    <h2 className="section-title">Explain Your Code</h2>
                    <p className="section-sub">
                        Paste any code below, choose your language and explanation mode, then hit Explain.
                    </p>

                    <div className="app-grid">
                        <div className="panel">
                            <div className="panel-header">
                                <span className="panel-title">📝 Your Code</span>
                                <select
                                    className="lang-select"
                                    value={language}
                                    onChange={(event) => setLanguage(event.target.value)}
                                >
                                    {LANGUAGE_OPTIONS.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="mode-pills">
                                {MODE_OPTIONS.map((option) => (
                                    <button
                                        key={option.id}
                                        type="button"
                                        className={`pill ${mode === option.id ? 'active' : ''}`}
                                        onClick={() => setMode(option.id)}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>

                            <textarea
                                className="code-input"
                                value={code}
                                onChange={(event) => setCode(event.target.value)}
                                placeholder={initialCode}
                            />

                            <button
                                className="explain-btn"
                                type="button"
                                onClick={handleExplain}
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                                ) : (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" />
                                        <path d="M12 16v-4m0-4h.01" />
                                    </svg>
                                )}
                                {loading ? 'Thinking…' : 'Explain Code'}
                            </button>
                        </div>

                        <div className="panel">
                            <div className="panel-header">
                                <span className="panel-title">💡 Explanation</span>
                                <button className="copy-btn" type="button" onClick={handleCopy}>
                                    Copy
                                </button>
                            </div>
                            <div className="output-body" id="outputBody">
                                {outputContent}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="features">
                <div className="section-label">// capabilities</div>
                <h2 className="section-title">Everything You Need</h2>
                <p className="section-sub">From quick summaries to deep dives, CodeLens adapts to how you learn.</p>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">🔍</div>
                        <h3>Line-by-Line Breakdown</h3>
                        <p>
                            Every single line explained in plain language — no guessing, no confusion. Perfect for reading unfamiliar code.
                        </p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🌱</div>
                        <h3>Beginner Mode</h3>
                        <p>
                            Toggle beginner mode for extra-simple explanations with real-world analogies, free from intimidating jargon.
                        </p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🚀</div>
                        <h3>Code Improvements</h3>
                        <p>
                            Instantly identify bugs, bad practices, and inefficiencies. Get a cleaner, optimized version of your code.
                        </p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🌐</div>
                        <h3>16+ Languages</h3>
                        <p>JavaScript, Python, Java, C++, Go, Rust, Swift, Kotlin, SQL and more — all supported out of the box.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🧠</div>
                        <h3>Key Concepts</h3>
                        <p>
                            Learn the programming concepts your code uses — loops, recursion, closures, async/await — explained clearly.
                        </p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">⚡</div>
                        <h3>Instant Results</h3>
                        <p>Powered by Claude AI for fast, high-quality explanations. No sign-up, no waiting — just paste and go.</p>
                    </div>
                </div>
            </section>

            <section id="how">
                <div className="section-label">// process</div>
                <h2 className="section-title">How It Works</h2>
                <p className="section-sub">Three steps to crystal-clear code understanding.</p>
                <div className="steps-row">
                    <div className="step">
                        <div className="step-num">1</div>
                        <h3>Paste Your Code</h3>
                        <p>Copy any snippet from your editor and paste it into the input panel. Choose the language.</p>
                    </div>
                    <div className="step">
                        <div className="step-num">2</div>
                        <h3>Pick a Mode</h3>
                        <p>Standard, Beginner, Line-by-Line, or Improvement mode — choose what you need right now.</p>
                    </div>
                    <div className="step">
                        <div className="step-num">3</div>
                        <h3>Read & Learn</h3>
                        <p>Receive a structured explanation with summary, breakdown, concepts, and improvement tips.</p>
                    </div>
                </div>
            </section>

            <section id="about">
                <div className="about-grid">
                    <div className="about-text">
                        <div className="section-label">// about us</div>
                        <h2 className="section-title">Built for Learners,<br />By Developers</h2>
                        <p className="section-sub">
                            CodeLens was born out of one frustration: reading code you didn't write is hard. Whether you're a student, a self-taught developer, or a seasoned engineer reviewing a legacy codebase — understanding unfamiliar code takes time and effort.
                        </p>
                        <p>
                            We built CodeLens to be the smartest pair-programmer who never gets tired of explaining things. It uses Claude AI to analyze structure, logic, and intent — then explains everything the way a great teacher would: clearly, concisely, and without condescension.
                        </p>
                    </div>
                    <div className="about-visual">
                        <div className="about-stat">
                            <div className="stat-num">16+</div>
                            <div className="stat-label">Programming languages supported</div>
                        </div>
                        <div className="about-stat">
                            <div className="stat-num">4</div>
                            <div className="stat-label">Explanation modes to choose from</div>
                        </div>
                        <div className="about-stat">
                            <div className="stat-num">0</div>
                            <div className="stat-label">Sign-ups required to get started</div>
                        </div>
                        <div className="about-stat">
                            <div className="stat-num">∞</div>
                            <div className="stat-label">Code snippets you can explain</div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="team">
                <div className="section-label">// developer team</div>
                <h2 className="section-title">Meet the Team</h2>
                <p className="section-sub">A small, passionate team on a mission to make code readable for everyone.</p>
                <div className="team-grid">
                    <div className="team-card">
                        <div className="team-avatar" style={{ background: 'var(--accent)' }}>A</div>
                        <h3>Aryan Sharma</h3>
                        <div className="role">Lead Developer</div>
                        <p className="bio">Full-stack engineer passionate about developer tooling and AI-powered education platforms.</p>
                    </div>
                    <div className="team-card">
                        <div className="team-avatar" style={{ background: 'var(--accent3)' }}>P</div>
                        <h3>Priya Mehta</h3>
                        <div className="role">AI / Prompt Engineer</div>
                        <p className="bio">Specializes in LLM prompt design, fine-tuning, and building reliable AI pipelines for real-world use.</p>
                    </div>
                    <div className="team-card">
                        <div className="team-avatar" style={{ background: '#c792ea' }}>R</div>
                        <h3>Rohan Verma</h3>
                        <div className="role">UI / UX Designer</div>
                        <p className="bio">Designs interfaces that balance beauty and clarity. Believes great software should feel like a conversation.</p>
                    </div>
                    <div className="team-card">
                        <div className="team-avatar" style={{ background: 'var(--accent2)' }}>S</div>
                        <h3>Sanya Kapoor</h3>
                        <div className="role">Backend Engineer</div>
                        <p className="bio">Keeps the engine running — API integrations, performance optimization, and scalable infrastructure.</p>
                    </div>
                </div>
            </section>

            <footer>
                <div className="footer-top">
                    <div className="footer-brand">
                        <div className="footer-logo">Code<span>Lens</span></div>
                        <p>Making code readable for everyone. Paste. Explain. Understand. Repeat.</p>
                    </div>
                    <div className="footer-links">
                        <h4>Navigation</h4>
                        <ul>
                            <li><a href="#home">Home</a></li>
                            <li><a href="#app">Try It</a></li>
                            <li><a href="#features">Features</a></li>
                            <li><a href="#how">How It Works</a></li>
                            <li><a href="#about">About</a></li>
                            <li><a href="#team">Team</a></li>
                        </ul>
                    </div>
                    <div className="footer-links">
                        <h4>Modes</h4>
                        <ul>
                            <li><a href="#app">Standard Explain</a></li>
                            <li><a href="#app">Beginner Mode</a></li>
                            <li><a href="#app">Line-by-Line</a></li>
                            <li><a href="#app">Code Improvements</a></li>
                        </ul>
                    </div>
                    <div className="footer-links">
                        <h4>Languages</h4>
                        <ul>
                            <li><a href="#app">JavaScript / TS</a></li>
                            <li><a href="#app">Python</a></li>
                            <li><a href="#app">Java / Kotlin</a></li>
                            <li><a href="#app">C / C++ / Go</a></li>
                        </ul>
                    </div>
                </div>
                <div className="footer-bottom">
                    <span className="footer-copy">© 2025 CodeLens. Built with ♥ and Claude AI.</span>
                    <a href="https://github.com" target="_blank" className="social-link" rel="noreferrer">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
                        </svg>
                        GitHub
                    </a>
                </div>
            </footer>

            <div className={`toast ${toast ? 'show' : ''}`} id="toast">
                {toast}
            </div>
        </div>
    );
}

export default CodeExplainer;
