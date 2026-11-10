// Supplied presentation files are preserved alongside browser-readable PDF exports.
// date is the stated presentation date; asOf is a data cutoff, not a presentation date.
const STOCK_PITCHES = [
    {
        id: 'cme-group',
        exhibit: 'The machinery of markets',
        theme: 'Market structure',
        art: '/assets/gallery/cme-group.webp',
        artAlt: 'Acrylic painting of an antique pocket watch and a financial chart',
        title: 'CME Group — Stock Pitch',
        company: 'CME Group',
        ticker: 'CME',
        date: '2026-03-11',
        summary: 'Derivatives market structure, volatility-driven trading volumes, growth opportunities, valuation, and risks.',
        pdf: '/assets/stock-pitches/cme-group.pdf',
        slides: '/assets/stock-pitches/cme-group.pptx'
    },
    {
        id: 'uranium-energy',
        exhibit: 'Beneath the surface',
        theme: 'Energy & policy',
        art: '/assets/gallery/uranium-energy.webp',
        artAlt: 'Acrylic painting of a green mineral specimen',
        title: 'Uranium Energy Corp. — Stock Pitch',
        company: 'Uranium Energy Corp.',
        ticker: 'UEC',
        date: '2026-02-07',
        summary: 'Uranium supply and demand, U.S. policy support, production ramp-up, and DCF and peer valuation analysis.',
        pdf: '/assets/stock-pitches/uranium-energy.pdf',
        slides: '/assets/stock-pitches/uranium-energy.pptx'
    },
    {
        id: 'teva',
        exhibit: 'The apothecary',
        theme: 'Healthcare',
        art: '/assets/gallery/teva.webp',
        artAlt: 'Acrylic painting of an amber apothecary bottle and botanical sprig',
        title: 'Teva — Stock Pitch',
        company: 'Teva Pharmaceutical Industries',
        ticker: 'TEVA',
        asOf: '2025-11-26',
        summary: 'Generics and specialty medicines, biosimilar launches, the debt position, and DCF and comparable-company valuation.',
        pdf: '/assets/stock-pitches/teva.pdf',
        slides: '/assets/stock-pitches/teva.pptx'
    },
    {
        id: 'flywire',
        exhibit: 'Across borders',
        theme: 'Global payments',
        art: '/assets/gallery/flywire.webp',
        artAlt: 'Acrylic painting of a globe and paper airplane',
        title: 'Flywire — Stock Pitch',
        company: 'Flywire Corp.',
        ticker: 'FLYW',
        summary: 'Vertical payments and financial software, industry competition, growth drivers, and DCF and comparable-company valuation.',
        pdf: '/assets/stock-pitches/flywire.pdf',
        slides: '/assets/stock-pitches/flywire.pptx'
    }
];
