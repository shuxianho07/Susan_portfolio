const resumeUrl = `${import.meta.env.BASE_URL}resume.pdf?v=5f0db435`;

export default function Resume() {
  return (
    <section className="space-y-12 max-w-4xl mx-auto pt-10">
      <div className="text-center flex flex-col items-center">
        <div className="flex items-center gap-4 mb-4 w-full justify-center">
          <div className="h-[1px] w-12 bg-hogwarts-gold/50"></div>
          <p className="text-sm font-['Cinzel'] font-bold uppercase tracking-[0.3em] text-hogwarts-gold">
            The Scrolls
          </p>
          <div className="h-[1px] w-12 bg-hogwarts-gold/50"></div>
        </div>
        <h2 className="text-5xl md:text-6xl font-['Cinzel'] font-bold tracking-tight text-hogwarts-parchment drop-shadow-md">
          Resume
        </h2>
      </div>

      <div className="space-y-8">
        <div className="bg-hogwarts-castle border border-hogwarts-gold/30 rounded-sm p-8 shadow-[0_0_20px_rgba(var(--hogwarts-gold-rgb),0.05)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
            <p className="text-hogwarts-parchment/80 font-['Outfit'] italic">
              Inspect the embedded dossier below, or extract a copy for offline archives.
            </p>
            <a
              href={resumeUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-['Cinzel'] font-bold uppercase tracking-widest text-hogwarts-bg bg-hogwarts-gold hover:opacity-80 shadow-[0_0_10px_rgba(var(--hogwarts-gold-rgb),0.3)] hover:shadow-[0_0_20px_rgba(var(--hogwarts-gold-rgb),0.6)] transition-all rounded-sm hover:-translate-y-0.5"
            >
              Expand Scroll
            </a>
          </div>

          <div className="mt-6 border border-hogwarts-gold/40 rounded-sm overflow-hidden shadow-[0_0_15px_rgba(var(--hogwarts-gold-rgb),0.1)] relative">
            <iframe
              title="Resume"
              src={resumeUrl}
              className="w-full min-h-[72vh] max-h-[90vh] bg-hogwarts-parchment"
            />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="bg-hogwarts-castle border border-hogwarts-gold/20 p-6 rounded-sm text-center">
            <p className="mb-4 text-hogwarts-parchment/80 font-['Outfit']">Acquire a physical copy:</p>
            <a
              href={resumeUrl}
              download
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-['Cinzel'] font-bold uppercase tracking-widest text-hogwarts-gold border border-hogwarts-gold bg-transparent hover:bg-hogwarts-gold/10 transition-all rounded-sm hover:-translate-y-0.5"
            >
              Download PDF
            </a>
          </div>

          <div className="bg-hogwarts-castle border border-hogwarts-gold/20 p-6 rounded-sm flex items-center justify-center text-center">
            <p className="text-hogwarts-parchment/70 font-['Outfit'] text-sm">
              Tip: Mobile devices may struggle to render ancient scrolls natively. Use the download button if the embed fails to load.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
