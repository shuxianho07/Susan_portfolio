#  Welcome to Hogwarts — Interactive Portfolio

> A Hogwarts-themed, browser-based 2D portfolio experience. Walk around the castle grounds, step inside the Common Room, and discover my skills, experience, and projects through interactive hotspots.

**Live Demo:** [susan-ho.vercel.app](https://susan-ho.vercel.app/)

[![Deploy Status](https://img.shields.io/badge/Vercel-Deployed-black?logo=vercel)](https://susan-ho.vercel.app/)

---

##  Features

- **2D Side-Scrolling Game Engine** — Custom-built in vanilla JavaScript with physics, gravity, and smooth camera tracking
- **Animated Character** — Pixel-style sprite with walk cycles, jump animations, and directional flipping
- **Two Scenes** — Explore the Hogwarts exterior, then enter the Common Room to find portfolio content
- **Portfolio Overlays** — Interactive hotspots reveal enhanced Skills, Work Experience, Projects, and About sections
  - **Skills** — 8 technical skills with descriptions + embedded resume PDF preview & download
  - **Experience** — Professional timeline with 3 roles (Edtech, City of Markham, Adobe) featuring impact metrics, achievement bullets, and key technologies
  - **Projects** — 3-column responsive grid showcasing Flight Predictor, Futures Analysis, and Financial Reporting systems with GitHub links
- **Day / Night Mode** — Toggle between `Luminos` (day) and `Nox` (night) themes
- **Mobile-Friendly** — Touch controls for left, right, and jump on mobile devices
- **Organic Scrapbook Aesthetic** — Hand-drawn parchment borders, Caveat cursive headings, and warm color palette throughout all portfolio sections
- **Loading Screen** — Animated spell-casting progress bar with rotating Hogwarts phrases
- **Idle Dialogue** — The character whispers mysterious quotes when left standing still

---

##  Project Structure

```
welcome-to-hogwarts/
├── index.html              # Game layout, UI overlays, portfolio content
├── package.json            # Dependencies (None required — vanilla JS)
├── README.md               # Documentation
├── css/
│   ├── base.css            # Typography, containers, skills, experience
│   ├── layout.css          # Responsive layout adjustments
│   ├── overlays.css        # Overlay and modal styling
│   ├── character.css       # Character sprite and animation
│   ├── containers.css      # About me scrapbook container
│   ├── projects.css        # 3-column project grid styling
│   ├── ui.css              # Game UI elements
│   └── styles.backup.css   # Legacy styles reference
├── js/
│   ├── main.js             # Game loop and core logic
│   ├── scene.js            # Scene management (outside/inside)
│   ├── input.js            # Keyboard, touch, overlay handlers
│   ├── setup.js            # Configuration and initialization
│   └── script.backup.js    # Legacy game code
└── assets/
    ├── icons/              # Folder icons for nav
    ├── front.png           # Idle sprite (front-facing)
    ├── back.png            # Walking-away sprite
    ├── walking.png         # Walk cycle frame 1
    ├── right_facing.png    # Walk cycle frame 2 / stop
    ├── left jump.png       # Jump sprite
    ├── morning.png         # Outside daytime background
    ├── night.jpg           # Outside night background (Nox mode)
    ├── corridor.jpg        # Inside Common Room background
    ├── door.png            # Entrance door asset
    ├── about-photo.jpg     # Profile photo for About section
    ├── resume.pdf          # Downloadable resume
    └── loading.png         # Loading screen graphics
```

---

##  Portfolio Sections

### Skills & Spells
- **Left Column:** 8 technical skills with one-line descriptions
  - Python (data processing, ML, REST APIs, ETL)
  - SQL & Databases (optimization, schema design, consolidation)
  - Machine Learning (Random Forest, ONNX, anomaly detection)
  - Data Visualization (Seaborn, Plotly, Power BI)
  - C# & .NET (REST APIs, backend services, full-stack)
  - Docker & DevOps (orchestration, microservices, infrastructure)
  - Excel & VBA (macro automation, financial reporting)
  - Frontend Development (HTML, CSS, JavaScript, responsive design)
- **Right Column:** Embedded PDF resume viewer with download button

### Work Experience
Professional timeline with 3 major roles:

1. **Founder & Full-Stack Developer** — Financial Literacy EdTech (2023–2025)
   - Scaled platform to **60K+ global users** across 8 countries
   - Generated **$500K revenue** through data licensing agreement
   - Architected full-stack platform with proprietary data pipelines

2. **Finance & Data Analyst (Intern)** — City of Markham (Dec 2024–Jul 2025)
   - **40% reduction** in financial reporting time via ETL automation
   - Achieved **100% data reconciliation** across 5+ systems
   - Built real-time Power BI dashboards for 50+ stakeholders

3. **Data Analyst (Intern)** — Adobe (Dec 2023–Mar 2024)
   - Analyzed **100M+ telemetry events** to inform product roadmap affecting **2M+ users**
   - Developed **60% time savings** in manual reporting through automation
   - Created structured SQL datasets enabling cross-functional decision-making

### My Projects
Responsive 3-column grid featuring:

1. **Flight Ticket Predictor** — ML-powered price forecasting
   - Random Forest with **85% accuracy**, ONNX optimization, .NET REST API
   - Automated weekly retraining pipeline with <100ms inference latency
   - [View on GitHub](https://github.com/shuxianho07/Flight-Ticket-Predictor)

2. **Futures Market Analysis Model** — High-frequency trading analytics
   - Processes **50K+ daily records**, detects **~200 volume spikes** with 65% price correlation
   - Seaborn dashboards reducing manual monitoring by **75%**
   - [View on GitHub](https://github.com/shuxianho07/Futures-Market-Analysis-Model)

3. **Automated Financial Reporting System** — Enterprise reporting automation
   - Handles **10K+ daily transactions**, reduced report generation from **6 hours to 30 minutes**
   - ≥99% accuracy with anomaly detection, Power BI dashboards, Docker deployment
   - [View on GitHub](https://github.com/shuxianho07/Automated-Financial-Reporting)

---

##  How to Play

| Input | Action |
|---|---|
| `A` / `←` | Move left |
| `D` / `→` | Move right |
| `W` / `↑` / `Space` | Jump |
| `E` / `Enter` | Interact with hotspot |
| Click interact prompt | Enter door / open overlay |
| **Nox** button (top right) | Toggle day / night |
| **⬅ Back Outside** button | Return to castle grounds |
| **✕** (X button) | Close portfolio overlay |

**On mobile**, use the on-screen arrow buttons.

---

##  Tech Stack

| Layer | Technology |
|---|---|
| Structure | HTML5 (semantic markup) |
| Styling | Vanilla CSS (custom design tokens, keyframe animations, responsive layout) |
| Logic | Vanilla JavaScript ES6+ (no frameworks or bundlers) |
| Fonts | Google Fonts — Cinzel (serif headings), Caveat (handwriting), Patrick Hand (cursive body), Outfit (sans-serif) |
| Rendering | DOM-based rendering (2D sprite animation via Canvas for transparency processing) |
| PDF Embedding | HTML5 `<iframe>` for resume PDF viewer |

The entire game engine is hand-rolled — no libraries, no build tools. All sprite processing (white background removal) is done at runtime via the Canvas 2D API.

---

##  Running Locally

Prerequisites: Node.js with npm, plus Python 3 for the static game server.

```bash
# Install the React portfolio dependencies using the committed lockfile.
npm --prefix fallback-app ci --include=dev

# Build the traditional portfolio into quick-links/.
npm run build

# Serve the game and the built portfolio from the repository root.
python3 -m http.server 8000
```

For React development with hot reload and direct subroute support, run this in another terminal:

```bash
npm --prefix fallback-app run dev -- --host 0.0.0.0 --port 5173 --strictPort
```

The game runs on port 8000; the React development app uses `/quick-links/` on port 5173. Python's static server does not implement the Vercel rewrite rules, so use Vite for direct React subroutes. Both services are needed when moving between the game and the React development app; the built app on port 8000 links back to the game directly.

```bash
# Validate the chat handler without credentials or external API calls.
npm test
```

First-time visitors receive a skippable interactive walkthrough: move, jump, enter the castle, open a glowing object, close its archive, and open the field guide. Steps advance only after the visitor performs each action; the game stays playable throughout. The field guide can replay it and tracks the four portfolio sections locally in the browser. The Common Room is an interactive study: its desk, library, and maps open portfolio archives.

The optional live chatbot needs a Vercel-compatible runtime, a server-side `GEMINI_API_KEY`, and access to `generativelanguage.googleapis.com`. The local frontend falls back to answers derived from repository content when the API is unavailable. Do not put API keys in frontend files.


---

##  Design System

The portfolio features an **organic scrapbook aesthetic** inspired by the Hogwarts universe:

- **Color Palette:**
  - Parchment: `#E8DCC4` (primary background)
  - Dark Brown: `#3e352b` (text / borders)
  - Red Ink: `#8c2a2a` (headings / accents)
  - Gold: `#d4a867` (highlights / links)
  
- **Typography:**
  - Caveat (handwritten style) for titles
  - Patrick Hand (cursive) for body text
  - Cinzel (serif) for game UI
  
- **Elements:**
  - Organic "wonky" borders via irregular `border-radius`
  - Dot texture via CSS `radial-gradient`
  - Hand-drawn shadow effects with offset `box-shadow`
  - Hover animations and smooth transitions

---

##  About Susan

**Susan (Shuxian) Ho** — Data Analyst & Backend Engineer

Passionate about building elegant, scalable systems that turn complex data into actionable insights. Currently studying **Honours Math & Financial Analysis** at the **University of Waterloo**.

**Core Expertise:**
- **Data Engineering** — Python, SQL, ETL pipelines, data validation
- **Machine Learning** — Model training, inference optimization, anomaly detection
- **Backend Development** — REST APIs, system architecture, microservices
- **Analytics** — Cohort analysis, dashboard design, SQL query optimization
- **Technology Leadership** — Team scaling, cross-functional collaboration, product vision

**Let's connect:**
- 📧 [Email](mailto:s39ho@uwaterloo.ca)
- 💼 [LinkedIn](https://www.linkedin.com/in/shuxian-susan-ho/)
- 🐙 [GitHub](https://github.com/shuxianho07)

---

##  Deployment

This portfolio is deployed on **Vercel** with automatic deployments on every push to main.

```bash
# Deploy to Vercel
vercel --prod
```

---

##  License

Created by Susan Ho. Feel free to fork, modify, and adapt this portfolio template for your own use!

---

<sub>Built with ❤️ and vanilla JavaScript. No frameworks, no shortcuts.</sub>

**Connect:**
[![GitHub](https://img.shields.io/badge/GitHub-shuxianho07-181717?logo=github)](https://github.com/shuxianho07)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-shuxian--susan--ho-0A66C2?logo=linkedin)](https://www.linkedin.com/in/shuxian-susan-ho/)

---

##  License

This project is open source and available under the [MIT License](LICENSE).
