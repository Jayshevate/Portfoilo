import { profile, realUrl } from '../../content/profile'
import { useStore } from '../../core/store'
import Sheet from '../Sheet'
import Stop from '../Stop'
import Txt from '../Txt'

/*
 * Each gated cert shows a state that follows the 3D scan:
 * pending → verified as the packet clears each gate. In simple view (and
 * for screen readers) they're simply listed; the "scan" is decoration.
 */
export default function Certs() {
  const stage = useStore((s) => s.gateStage)
  const simple = useStore((s) => s.mode === 'simple')
  let gateNo = 0
  return (
    <Stop id="gate" className="panel-left" labelledBy="certs-title">
      <Sheet no={1} title="SECURITY GATE">
        <p className="kicker">step 01 · auth</p>
        <h2 id="certs-title">Nothing gets in without credentials.</h2>
        <p className="lede">These are mine. The first two are the gates you just went through.</p>
        <ul className="certs">
          {profile.certifications.map((c) => {
            const n = c.gate ? ++gateNo : 0
            const ok = simple || !c.gate || stage >= n
            const url = realUrl(c.verifyUrl)
            return (
              <li key={c.id} className={`cert ${ok ? 'is-ok' : ''}`}>
                <span className={`cert__state ${ok && c.gate ? 'stamp' : ''}`} aria-hidden="true">{c.gate ? (ok ? 'verified' : 'scanning…') : 'on file'}</span>
                <h3 className="cert__name">{c.name}</h3>
                <p className="cert__score"><mark className="hl">{c.score}</mark></p>
                <p className="cert__meta">
                  {c.date}
                  {c.valid && ` · ${c.valid}`}
                  {c.verifyUrl !== undefined && (
                    <> · {url ? <a href={url} target="_blank" rel="noreferrer">verify ↗</a> : <Txt v={c.verifyUrl} />}</>
                  )}
                </p>
              </li>
            )
          })}
          {profile.education.exams.map((x) => (
            <li key={x.name} className="cert is-ok">
              <span className="cert__state" aria-hidden="true">on file</span>
              <h3 className="cert__name">{x.name}</h3>
              <p className="cert__score">{x.result}</p>
            </li>
          ))}
        </ul>
      </Sheet>
    </Stop>
  )
}
