/*
 * One card in a row. It's a real <button>, so it works with Tab/Enter and
 * screen readers; the hover lift is decoration on top.
 */
import Art from './Art'

const KIND = { project: 'Project', credential: 'Credential', experience: 'Experience', skill: 'Stack' }

export default function TitleCard({ title, onOpen, saved }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(title.id)}
      className="group relative block w-full overflow-hidden rounded-md bg-soot text-left outline-none ring-marigold transition duration-300 focus-visible:ring-2 motion-safe:hover:-translate-y-1 motion-safe:hover:scale-[1.03]"
      data-title={title.id}
    >
      <Art title={title} className="block aspect-video w-full" />
      <span className="absolute inset-x-0 bottom-0 p-3">
        <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-dust">
          {KIND[title.kind]}
          {saved && <span className="ml-2 text-marigold">· on my list</span>}
        </span>
        <span className="block font-display text-xl font-extrabold uppercase leading-none tracking-wide text-cream sm:text-2xl">
          {title.name}
        </span>
      </span>
      <span className="pointer-events-none absolute inset-0 rounded-md ring-1 ring-inset ring-line group-hover:ring-marigold/60" />
    </button>
  )
}
