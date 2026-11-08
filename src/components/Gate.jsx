/*
 * "Who's here?" — the first screen. Picking a viewer only changes the order
 * of the rows (see VIEWERS in catalog.js). "Skip" goes straight in.
 * Returning visitors never see it: an inline script in index.html hides it
 * before paint if a choice is stored or the URL is a shared link (html.skip-gate).
 */
import { VIEWERS, DEFAULT_VIEWER } from '../content/catalog'

const FACE = {
  // Each viewer gets a simple drawn mark instead of a stock avatar.
  recruiter: <path d="M14 34h36M14 26h36M14 18h22" strokeWidth="4" />,
  engineer: <path d="M22 18l-10 14 10 14M42 18l10 14-10 14M36 14l-8 36" strokeWidth="4" />,
  curious: <circle cx="32" cy="32" r="13" strokeWidth="4" />,
}

export default function Gate({ open, onPick }) {
  return (
    <div
      data-gate
      role="dialog"
      aria-modal="true"
      aria-labelledby="gate-title"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-night px-6 ${open ? '' : 'hidden'}`}
    >
      <h1 id="gate-title" className="font-display text-5xl font-extrabold uppercase tracking-wide text-cream sm:text-7xl">
        Who's here?
      </h1>
      <p className="mt-3 max-w-md text-center text-dust">
        Everything is open to everyone. This only decides what you see first.
      </p>

      <ul className="mt-10 grid grid-cols-3 gap-4 sm:gap-8">
        {Object.entries(VIEWERS).map(([key, v]) => (
          <li key={key}>
            <button
              type="button"
              onClick={() => onPick(key)}
              className="group flex w-24 flex-col items-center text-center outline-none sm:w-36"
            >
              <span className="grid aspect-square w-full place-items-center rounded-md bg-soot ring-1 ring-line transition group-hover:ring-2 group-hover:ring-marigold group-focus-visible:ring-2 group-focus-visible:ring-marigold">
                <svg viewBox="0 0 64 64" className="w-1/2 fill-none stroke-marigold" aria-hidden="true">
                  {FACE[key]}
                </svg>
              </span>
              <span className="mt-3 font-display text-xl font-bold uppercase tracking-wide text-cream sm:text-2xl">{v.label}</span>
              <span className="mt-1 hidden text-xs text-dust sm:block">{v.hint}</span>
            </button>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => onPick(DEFAULT_VIEWER)}
        className="mt-12 font-mono text-xs uppercase tracking-[0.2em] text-dust underline-offset-4 hover:text-cream hover:underline"
      >
        Skip — show me everything
      </button>
    </div>
  )
}
