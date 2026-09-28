export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-[var(--bg)] px-4 py-24 text-center text-[var(--fg)]">
      <p className="text-xs font-medium uppercase tracking-[0.3em] opacity-60">FashionOps</p>
      <h1 className="mt-3 max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl">
        A lookbook, sorted by aesthetic.
      </h1>
      <p className="mt-4 max-w-md text-base opacity-70">
        Coquette, grunge, goth, acubi, office siren and more — every fit broken down, with where
        each piece came from. Opening soon.
      </p>
    </main>
  );
}
