/*
 * Renders a profile value. Strings render as-is; fill() placeholders render
 * as a hatched marker so missing info is impossible to miss (and impossible
 * to mistake for a real claim).
 */
import { isFill, isVerify } from '../content/profile'

export default function Txt({ v }) {
  if (isFill(v)) return <mark className="fill">[FILL: {v.fill}]</mark>
  if (isVerify(v)) return (<>{v.verify} <mark className="fill fill--verify">[VERIFY]</mark></>)
  if (Array.isArray(v)) return v.map((x, i) => (<span key={i}>{i > 0 && ', '}<Txt v={x} /></span>))
  return v ?? null
}
