import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="py-20 text-center">
      <div className="mx-auto max-w-xl">
        <h1 className="text-5xl font-['Cinzel'] font-bold tracking-tight text-hogwarts-parchment">404</h1>
        <p className="mt-4 text-lg text-hogwarts-parchment/80 dark:text-hogwarts-parchment/80">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          to="/"
          className="glass-control mt-8 inline-flex items-center justify-center px-8 py-3 text-sm font-['Cinzel'] font-semibold text-hogwarts-parchment hover:bg-hogwarts-parchment/80 dark:text-hogwarts-parchment dark:hover:bg-hogwarts-parchment/20"
        >
          Back to home
        </Link>
      </div>
    </section>
  );
}
