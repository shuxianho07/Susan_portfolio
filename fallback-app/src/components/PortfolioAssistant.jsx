import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { FaMagic, FaPaperPlane, FaRobot } from 'react-icons/fa';
import { experiences } from '../data/experience';
import { projects } from '../data/projects';
import { skillCategories } from '../data/skills';

const sampleQuestions = [
  'What projects are on the portfolio?',
  'Which skills does Susan use most?',
  'Tell me about her work experience.',
  'How can I contact Susan?'
];

function normalize(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function answerPortfolioQuestion(question) {
  const q = normalize(question);

  if (q.includes('why') && (q.includes('portfolio') || q.includes('this') || q.includes('make') || q.includes('build'))) {
    return 'Susan built this interactive portfolio to showcase her full-stack capabilities, her passion for problem-solving, and her ability to create engaging experiences.';
  }

  if (q.includes('project') || (q.includes('portfolio') && (q.includes('what') || q.includes('show') || q.includes('list')))) {
    return `Here are the main projects in the portfolio: ${projects
      .map((item) => `${item.title} — ${item.role}. ${item.summary}`)
      .join(' ')}`;
  }

  if (q.includes('skill') || q.includes('technology') || q.includes('tool') || q.includes('strength')) {
    return `Susan's strongest skill areas are: ${skillCategories
      .map((group) => `${group.title}: ${group.items.map((item) => item.name).join(', ')}`)
      .join(' | ')}.`;
  }

  if (q.includes('experience') || q.includes('work') || q.includes('job') || q.includes('career')) {
    return `Her recent experience includes: ${experiences
      .map((item) => `${item.role} at ${item.company} (${item.period}). ${item.bullets[0]}`)
      .join(' ')}.`;
  }

  if (q.includes('contact') || q.includes('email') || q.includes('linkedin') || q.includes('github')) {
    return 'You can reach Susan through the contact section on this portfolio page, and her GitHub and LinkedIn links are included in the site navigation.';
  }

  if (q.includes('who are you') || q.includes('about susan') || q.includes('who is susan') || q.includes('about')) {
    return 'Susan Ho is a data analyst and backend engineer focused on data engineering, machine learning, and backend systems. This portfolio highlights her projects, skills, experience, and contact links.';
  }

  if (q === 'yes' || q === 'y' || q === 'sure' || q === 'ok' || q === 'yeah') {
    return 'Great! What would you like to know about her portfolio? You can ask about her projects, skills, or experience.';
  }

  if (q === 'no' || q === 'n' || q === 'nope') {
    return 'No problem! Feel free to explore the site, and let me know if you have any questions.';
  }

  if (q.includes('hello') || q.includes('hi ') || q === 'hi' || q.includes('hey')) {
    return 'Hello! Ask me about Susan’s projects, skills, experience, or contact details.';
  }

  return 'I can only answer questions about Susan Ho’s portfolio — such as her projects, skills, experience, or contact details. Try asking about one of those topics.';
}

export default function PortfolioAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [size, setSize] = useState({ width: 360, height: 520 });
  const inputRef = useRef(null);
  const launcherRef = useRef(null);
  const logRef = useRef(null);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Hello! I am your portfolio chatbot. Ask me about Susan’s projects, skills, experience, or contact details.'
    }
  ]);

  const [isLoading, setIsLoading] = useState(false);

  const handleAsk = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const newMessages = [...messages, { role: 'user', text }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages.slice(-20).map(message => ({ ...message, text: message.text.slice(0, 2000) })) }),
        signal: AbortSignal.timeout(12000)
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      if (typeof data.reply !== 'string' || !data.reply.trim()) throw new Error('Empty reply');
      setMessages(prev => [...prev, { role: 'assistant', text: data.reply }]);
    } catch (error) {
      console.warn('API unavailable, falling back to local response.', error);
      // Fallback to local function if API is not running (e.g., local Vite dev server)
      setMessages(prev => [...prev, { role: 'assistant', text: answerPortfolioQuestion(text) }]);
    } finally {
      setIsLoading(false);
    }
  };

  const closeChat = () => {
    setOpen(false);
    requestAnimationFrame(() => launcherRef.current?.focus());
  };

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [messages, isLoading, open]);

  useEffect(() => {
    const clampSize = () => {
      setSize((prev) => ({
        width: Math.min(prev.width, Math.max(0, window.innerWidth - 32)),
        height: Math.min(prev.height, Math.max(0, window.innerHeight - 32))
      }));
    };

    clampSize();
    window.addEventListener('resize', clampSize);
    return () => window.removeEventListener('resize', clampSize);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!open ? (
        <motion.button
          ref={launcherRef}
          aria-expanded={open}
          aria-controls="portfolio-chat"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-full border border-hogwarts-gold/30 bg-hogwarts-castle/95 px-3 py-2 shadow-lg shadow-black/30 backdrop-blur-md"
        >
          <div className="rounded-full bg-hogwarts-gold/10 p-2 text-hogwarts-gold">
            <FaRobot className="h-4 w-4" />
          </div>
          <span className="text-xs font-['Cinzel'] font-bold uppercase tracking-[0.18em] text-hogwarts-parchment">Ask me</span>
        </motion.button>
      ) : (
        <motion.section
          id="portfolio-chat"
          role="region"
          aria-label="Portfolio chat"
          onKeyDown={event => {
            if (event.key === 'Escape') {
              event.stopPropagation();
              closeChat();
            }
          }}
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.97 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="box-border flex max-w-[calc(100vw-32px)] max-h-[calc(100dvh-32px)] flex-col overflow-hidden rounded-2xl border border-hogwarts-gold/30 bg-hogwarts-castle/95 p-3 shadow-xl shadow-black/35 backdrop-blur-md"
          style={{
            width: Math.min(size.width, Math.max(0, window.innerWidth - 32)),
            height: Math.min(size.height, Math.max(0, window.innerHeight - 32))
          }}
        >
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-hogwarts-gold/10 p-2 text-hogwarts-gold">
                <FaRobot className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-hogwarts-gold font-['Cinzel']">Portfolio AI</p>
                <h2 className="text-sm font-['Cinzel'] font-bold text-hogwarts-parchment">Portfolio chat</h2>
              </div>
            </div>
            <button
              onClick={closeChat}
              className="rounded-full border border-hogwarts-gold/20 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-hogwarts-parchment/90 hover:bg-hogwarts-gold/10"
            >
              Close
            </button>
          </div>

          <p className="text-hogwarts-parchment/70 font-['Outfit'] text-xs mb-2">
            Ask about projects, skills, experience, or contact details.
          </p>

          <div className="flex flex-col flex-1 overflow-hidden rounded-xl border border-hogwarts-gold/20 bg-black/20 p-3">
            <label htmlFor="portfolio-question" className="text-[10px] uppercase tracking-[0.2em] text-hogwarts-gold font-['Cinzel']">Your question</label>

            <div ref={logRef} role="log" aria-live="polite" aria-relevant="additions" aria-label="Conversation" className="mt-3 min-h-0 flex flex-1 flex-col gap-2 overflow-y-auto rounded-xl border border-hogwarts-gold/15 bg-hogwarts-bg/60 p-2">
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`max-w-[92%] rounded-2xl px-3 py-2 text-xs leading-relaxed shadow-sm ${
                    message.role === 'user'
                      ? 'ml-auto bg-hogwarts-gold text-hogwarts-bg'
                      : 'mr-auto border border-hogwarts-gold/20 bg-black/30 text-hogwarts-parchment'
                  }`}
                >
                  {message.text}
                </div>
              ))}
              {isLoading && (
                <div className="mr-auto border border-hogwarts-gold/20 bg-black/30 text-hogwarts-parchment/60 max-w-[92%] rounded-2xl px-3 py-2 text-xs leading-relaxed shadow-sm flex gap-1 items-center">
                  <span className="animate-bounce">.</span>
                  <span className="animate-bounce" style={{animationDelay: '0.1s'}}>.</span>
                  <span className="animate-bounce" style={{animationDelay: '0.2s'}}>.</span>
                </div>
              )}
            </div>

            <div className="mt-3 flex gap-2">
              <input
                ref={inputRef}
                id="portfolio-question"
                maxLength={2000}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.nativeEvent.isComposing && handleAsk()}
                placeholder="Try: What projects are in your portfolio?"
                className="min-w-0 flex-1 rounded-lg border border-hogwarts-gold/25 bg-hogwarts-bg/80 px-3 py-2 text-xs text-hogwarts-parchment outline-none ring-1 ring-transparent placeholder:text-hogwarts-parchment/50 focus:ring-hogwarts-gold/40"
              />
              <button
                onClick={handleAsk}
                disabled={isLoading || !input.trim()}
                className="inline-flex items-center gap-1 rounded-lg bg-hogwarts-gold px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-hogwarts-bg transition hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaPaperPlane /> Send
              </button>
            </div>

          </div>

          <div className="mt-2 rounded-xl border border-hogwarts-gold/20 bg-black/20 p-2">
            <div className="flex items-center gap-1.5 text-hogwarts-gold mb-1.5">
              <FaMagic className="h-3 w-3" />
              <span className="text-[10px] uppercase tracking-[0.2em] font-['Cinzel']">Quick prompts</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {sampleQuestions.map((item) => (
                <button
                  key={item}
                  onClick={() => { setInput(item); inputRef.current?.focus(); }}
                  className="rounded-full border border-hogwarts-gold/30 bg-hogwarts-gold/8 px-2.5 py-1.5 text-[10px] text-hogwarts-parchment/90 transition hover:border-hogwarts-gold hover:bg-hogwarts-gold/10"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </motion.section>
      )}
    </div>
  );
}
