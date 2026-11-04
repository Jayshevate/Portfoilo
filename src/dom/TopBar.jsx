import { useStore } from '../core/store'
import { scrollToStop } from '../core/scroll'
import Magnetic from './Magnetic'
import SoundToggle from './SoundToggle'

const NAV = [
  ['gate', 'certs'],
  ['lb', 'about'],
  ['carepilot', 'work'],
  ['data', 'stack'],
  ['response', 'contact'],
]

export default function TopBar() {
  const mode = useStore((s) => s.mode)
  const setMode = useStore((s) => s.setMode)
  const setTerminal = useStore((s) => s.setTerminal)
  const simple = mode === 'simple'

  return (
    <header className="bar">
      <a className="bar__mark" href="#edge" onClick={(e) => { e.preventDefault(); scrollToStop('edge', 0) }}>
        <span className="bar__dot" aria-hidden="true" /> jcs<span className="bar__dim">/req</span>
      </a>
      <nav aria-label="Sections" className="bar__nav">
        {NAV.map(([id, label]) => (
          <Magnetic key={id}>
            <a href={`#${id}`} onClick={(e) => { e.preventDefault(); scrollToStop(id) }}>{label}</a>
          </Magnetic>
        ))}
      </nav>
      <div className="bar__ctl">
        {!simple && <SoundToggle />}
        <button type="button" className="ctl" onClick={() => setTerminal(true)} aria-keyshortcuts="~">
          <kbd>~</kbd> terminal
        </button>
        <button type="button" className="ctl ctl--em" onClick={() => setMode(simple ? 'experience' : 'simple')}>
          {simple ? '3d view' : 'simple view'}
        </button>
      </div>
    </header>
  )
}
