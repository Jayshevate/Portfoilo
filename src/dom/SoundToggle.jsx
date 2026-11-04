import { useEffect } from 'react'
import { useStore } from '../core/store'
import { setSound, setSoundStop } from '../core/sound'
import { STOP_INDEX } from '../core/route'

export default function SoundToggle() {
  const on = useStore((s) => s.sound)
  const set = useStore((s) => s.setSound)
  const stop = useStore((s) => s.activeStop)

  useEffect(() => {
    if (on) setSoundStop(STOP_INDEX[stop] ?? 0)
  }, [on, stop])

  return (
    <button
      type="button"
      className="ctl"
      aria-pressed={on}
      onClick={() => {
        setSound(!on)
        set(!on)
      }}
    >
      <span className="ctl__wave" data-on={on} aria-hidden="true">
        <i /><i /><i /><i />
      </span>
      sound {on ? 'on' : 'off'}
    </button>
  )
}
