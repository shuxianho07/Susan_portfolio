import { motion } from 'framer-motion';
import {
  FaBriefcase,
  FaChartLine,
  FaDatabase,
  FaEnvelope,
  FaFileAlt,
  FaGithub,
  FaProjectDiagram,
  FaRobot,
  FaTools
} from 'react-icons/fa';
import { experienceHighlights } from '../data/experience';

export default function Hero({ onNavigate }) {
  const stats = experienceHighlights;
  const experienceSpotlights = [
    'Full-stack platforms and backend APIs',
    'ETL pipelines, analytics, and financial reporting',
    '60K+ global users and dashboards for 50+ stakeholders'
  ];

  const proofCards = [
    {
      title: 'Machine Learning',
      description: 'Predictive modeling, Random Forest, ONNX, and automated model retraining.',
      icon: <FaRobot className="h-6 w-6" />
    },
    {
      title: 'Financial Analytics',
      description: 'Market data analysis, volume signals, financial reporting, and business intelligence.',
      icon: <FaChartLine className="h-6 w-6" />
    },
    {
      title: 'Backend/Data Systems',
      description: 'APIs, databases, async jobs, data pipelines, and full-stack tools around real workflows.',
      icon: <FaDatabase className="h-6 w-6" />
    }
  ];

  const navCards = [
    {
      to: '/projects',
      title: 'Projects',
      description: 'Inspect source-linked project stories.',
      icon: <FaProjectDiagram className="h-5 w-5" />
    },
    {
      to: '/skills',
      title: 'Skills',
      description: 'Scan my strongest frameworks.',
      icon: <FaTools className="h-5 w-5" />
    },
    {
      to: '/resume',
      title: 'Resume',
      description: 'Open or download the resume.',
      icon: <FaFileAlt className="h-5 w-5" />
    },
    {
      to: '/contact',
      title: 'Contact',
      description: 'Reach me by email or LinkedIn.',
      icon: <FaEnvelope className="h-5 w-5" />
    }
  ];

  return (
    <div className="relative pb-24 w-full">
      
      {/* CLEAN BACKGROUND */}
      <motion.div 
        className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-screen h-[160vh] -z-10 pointer-events-none"
        style={{
          maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)'
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--hogwarts-castle)_0%,var(--hogwarts-bg)_75%)]"></div>
      </motion.div>

      {/* 1. CINEMATIC HERO HEADER */}
      <section className="relative min-h-[65vh] flex flex-col items-center justify-center pt-12 sm:pt-20 lg:pt-28 pb-10 overflow-visible">
        
        {/* Floating Title Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center z-10 flex flex-col items-center max-w-4xl px-4"
        >
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-hogwarts-gold/40 bg-hogwarts-castle mb-8 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-hogwarts-gold"></span>
            <span className="text-sm font-['Cinzel'] font-bold uppercase tracking-[0.2em] text-hogwarts-gold">
              Data Analyst & Backend Engineer
            </span>
          </div>
          
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-['Cinzel'] font-bold tracking-tight text-hogwarts-parchment mb-8">
            Susan Ho
          </h1>
          
          <p className="text-xl sm:text-2xl text-hogwarts-parchment/90 leading-relaxed max-w-3xl mx-auto mb-10 font-['Outfit']">
            University of Waterloo Honours Math & Financial Analysis student focused on <span className="text-hogwarts-gold font-semibold">data engineering</span>, <span className="text-hogwarts-gold font-semibold">machine learning</span>, and <span className="text-hogwarts-gold font-semibold">backend infrastructure</span> to turn messy data into scalable systems.
          </p>

          <div className="flex flex-wrap justify-center gap-5 font-['Cinzel']">
            <button
              onClick={() => onNavigate('/projects')}
              className="px-8 py-4 rounded bg-hogwarts-gold text-hogwarts-bg font-bold text-sm tracking-widest shadow-lg transition-all hover:scale-105 hover:opacity-80 flex items-center gap-2 uppercase"
            >
              <FaProjectDiagram /> View Projects
            </button>
            <a
              href="https://github.com/shuxianho07"
              target="_blank"
              rel="noreferrer"
              className="px-8 py-4 rounded bg-transparent border-2 border-hogwarts-gold text-hogwarts-gold font-bold text-sm tracking-widest transition-all hover:bg-hogwarts-gold/10 hover:scale-105 flex items-center gap-2 uppercase"
            >
              <FaGithub /> GitHub
            </a>
          </div>
        </motion.div>
      </section>

      {/* 2. STATS ROW */}
      <section className="relative z-20 mt-12 mb-16 max-w-6xl mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-hogwarts-castle flex flex-col items-center justify-center p-6 rounded-lg border border-hogwarts-gold/20 shadow-md">
              <span className="text-4xl font-bold font-['Cinzel'] text-hogwarts-gold mb-2">{stat.value}</span>
              <span className="text-xs font-['Cinzel'] font-bold uppercase tracking-[0.15em] text-hogwarts-parchment/80 text-center">{stat.label}</span>
            </div>
          ))}
        </motion.div>
      </section>

      {/* 2.5 EXPERIENCE HIGHLIGHTS */}
      <section className="relative z-20 mb-24 max-w-6xl mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-4"
        >
          {experienceSpotlights.map((item, idx) => (
            <div key={idx} className="bg-hogwarts-castle p-5 flex flex-col items-center text-center gap-3 rounded-lg border border-hogwarts-gold/20 shadow-md">
              <FaBriefcase className="text-hogwarts-gold h-6 w-6 shrink-0" />
              <span className="text-sm font-medium text-hogwarts-parchment font-['Outfit']">{item}</span>
            </div>
          ))}
        </motion.div>
      </section>

      {/* 3. PROOF CARDS (Aesthetic Grid) */}
      <section className="relative z-20 mb-24 px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-['Cinzel'] font-bold text-hogwarts-gold mb-4">Engineering Focus</h2>
          <p className="text-lg text-hogwarts-parchment/80 max-w-2xl mx-auto font-['Outfit']">Core pillars of my technical experience across data pipelines, modeling, and backend architecture.</p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3 max-w-6xl mx-auto">
          {proofCards.map((card, idx) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="bg-hogwarts-castle p-8 rounded-lg border border-hogwarts-gold/30 shadow-lg flex flex-col hover:border-hogwarts-gold transition-colors"
            >
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-full bg-hogwarts-gold/10 text-hogwarts-gold">
                {card.icon}
              </div>
              <h3 className="text-xl font-['Cinzel'] font-bold text-hogwarts-parchment mb-3">{card.title}</h3>
              <p className="text-base leading-relaxed text-hogwarts-parchment/80 flex-1 font-['Outfit']">{card.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. EXPLORE NAV */}
      <section className="relative z-20 max-w-6xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-[1px] flex-1 bg-hogwarts-gold/30"></div>
          <h2 className="text-sm font-['Cinzel'] font-bold uppercase tracking-[0.2em] text-hogwarts-gold">
            Explore Portfolio
          </h2>
          <div className="h-[1px] flex-1 bg-hogwarts-gold/30"></div>
        </div>
        
        <div className="grid grid-cols-1 min-[380px]:grid-cols-2 md:grid-cols-4 gap-4">
          {navCards.map((card, idx) => (
            <motion.button
              key={card.title}
              onClick={() => onNavigate(card.to)}
              whileHover={{ y: -2 }}
              className="group bg-hogwarts-castle rounded-lg border border-hogwarts-gold/20 p-6 text-left transition-all hover:border-hogwarts-gold hover:shadow-lg flex flex-col gap-4"
            >
              <div className="text-hogwarts-gold">
                {card.icon}
              </div>
              <div>
                <h3 className="text-lg font-['Cinzel'] font-bold text-hogwarts-parchment">{card.title}</h3>
                <p className="mt-2 text-sm text-hogwarts-parchment/70 font-['Outfit']">{card.description}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </section>
    </div>
  );
}
