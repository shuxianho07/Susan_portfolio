import { experiences } from '../data/experience';

export default function About() {
  return (
    <section className="py-8">
      <div className="w-full max-w-4xl">
        <p className="mb-3 text-xs font-['Cinzel'] font-semibold uppercase tracking-[0.2em] text-hogwarts-gold dark:text-hogwarts-gold">
          About
        </p>
        <h1 className="text-3xl font-['Cinzel'] font-bold tracking-tight text-hogwarts-parchment">
          Hi, I'm Susan Ho.
        </h1>

        <div className="mt-8 space-y-6 text-base leading-8 text-hogwarts-parchment/80 dark:text-hogwarts-parchment/80">
          <p>
            Hi, I'm Susan (Shuxian) Ho, an Honours Math & Financial Analysis student at the University of Waterloo with a strong interest in backend engineering, data systems, machine learning, and automation.
          </p>

          <p>
            I enjoy building systems that turn messy real-world information into something structured, searchable, and useful. My work usually sits at the intersection of software engineering, data processing, and applied ML. I like projects where I can design the full pipeline: collecting data, cleaning it, storing it, building APIs around it, applying machine learning models, and finally presenting the result through an intuitive interface or automated report.
          </p>
        </div>

        <div className="mt-10">
          <p className="mb-3 text-xs font-['Cinzel'] font-semibold uppercase tracking-[0.2em] text-hogwarts-gold dark:text-hogwarts-gold">
            Experience
          </p>
          <h2 className="text-2xl font-['Cinzel'] font-bold tracking-tight text-hogwarts-parchment">
            Data, analytics, and backend engineering
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-hogwarts-parchment/80 dark:text-hogwarts-parchment/70">
            Recent work experience where I connected real business workflows with automation, data pipelines,
            analytics, and full-stack tools.
          </p>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {experiences.map((experience) => (
              <article
                key={`${experience.company}-${experience.role}`}
                className="glass-card interactive-card flex h-full flex-col p-5"
              >
                <div className="flex-1">
                  <p className="text-xs font-['Cinzel'] font-semibold uppercase tracking-[0.16em] text-hogwarts-gold dark:text-hogwarts-gold">
                    {experience.company}
                  </p>
                  <h3 className="mt-2 text-lg font-['Cinzel'] font-semibold text-hogwarts-parchment">
                    {experience.role}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-hogwarts-parchment/60">
                    {experience.period} | {experience.location}
                  </p>

                  <ul className="mt-4 space-y-2 text-sm leading-6 text-hogwarts-parchment/80 dark:text-hogwarts-parchment/80">
                    {experience.bullets.map((bullet) => (
                      <li key={bullet} className="flex gap-2">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-hogwarts-gold" aria-hidden="true" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {experience.tags.map((tag) => (
                    <span
                      key={tag}
                      className="glass-chip px-2.5 py-1 text-xs font-medium text-hogwarts-parchment/80 dark:text-hogwarts-parchment/70"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-8 space-y-6 text-base leading-8 text-hogwarts-parchment/80 dark:text-hogwarts-parchment/80">
          <p>
            My projects connect data engineering with practical applications: predicting flight prices with Random Forest and ONNX, analyzing futures-market data with Python and PostgreSQL, and automating financial reporting with SQL, VBA, and Power BI.
          </p>

          <p>
            My experience spans building a financial-literacy platform, consolidating financial data at the City of Markham, and analyzing user telemetry at Adobe. Across these roles, I focus on making data reliable and turning repeated manual work into useful tools.
          </p>

          <p>
            I care a lot about clarity, correctness, and continuous improvement. When I build something, I do not only want it to work once. I want to understand why it works, how it can fail, how to test it, and how to make it easier to extend later. That mindset is why I enjoy backend systems, data infrastructure, AI workflows, and simulation engines: they require both technical detail and system-level thinking.
          </p>

          <p>
            Outside of coursework, I spend a lot of time learning by building. I use projects as a way to connect different areas of computer science, including algorithms, databases, machine learning, APIs, frontend design, optimization, and software architecture. My goal is to become the kind of engineer who can take an unclear problem, break it into clean components, and build a reliable system around it.
          </p>

          <p>
            I am currently looking for opportunities where I can work on backend engineering, AI infrastructure, data science, quantitative research tools, or full-stack systems. I am especially excited by teams that care about practical problem-solving, technical depth, and building software that creates measurable value.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="glass-card interactive-card p-4">
            <p className="text-sm font-['Cinzel'] font-semibold text-hogwarts-parchment">Looking for</p>
            <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-hogwarts-parchment/70">
              Backend Engineering, AI Infrastructure, Data Science, Quant Research Tools, Full-Stack Systems
            </p>
          </div>
          <div className="glass-card interactive-card p-4">
            <p className="text-sm font-['Cinzel'] font-semibold text-hogwarts-parchment">Core focus</p>
            <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-hogwarts-parchment/70">
              Python, SQL, data pipelines, APIs, machine learning, financial analytics
            </p>
          </div>
          <div className="glass-card interactive-card p-4">
            <p className="text-sm font-['Cinzel'] font-semibold text-hogwarts-parchment">Working style</p>
            <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-hogwarts-parchment/70">
              Clarity, correctness, testing, extensibility, system-level thinking
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
