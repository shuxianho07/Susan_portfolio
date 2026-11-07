# Susan Ho Portfolio

React + Vite portfolio for Susan (Shuxian) Ho, focused on data engineering, machine learning, backend systems, and financial analytics.

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- Framer Motion
- React Router
- React Icons
- Vercel Analytics

## Run Locally

```sh
npm ci --include=dev
npm run dev
```

## Build

```sh
npm run build
```

The production output is written to `../quick-links/`, with `/quick-links/` as the base URL.

## Project Structure

- `src/App.jsx` - routes, theme state, and analytics
- `src/pages/` - route-level page wrappers
- `src/components/` - reusable portfolio sections and cards
- `src/data/` - projects, skills, awards, and experience content
- `css/styles.css` - shared global styling imported by `src/index.css`
- `public/` - static assets served by Vite, including resume and images

## Active Public Assets

- `public/resume.pdf` is used by the Resume page.
- `public/images/profile.jpg` is used in the homepage hero.
- `public/images/header.jpg` is available for future visual sections.

## Notes

- The static Hogwarts game is maintained in the repository root; serve it separately on port 8000.
- Portfolio content should be updated through the React data files under `src/data/`.
- Salary and pay-potential positioning should stay private and should not be shown publicly.
