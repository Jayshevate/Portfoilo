import { profile } from '../../content/profile'
import Sheet from '../Sheet'
import Stop from '../Stop'
import Txt from '../Txt'

export default function Skills() {
  return (
    <Stop id="data" className="panel-left" labelledBy="skills-title">
      <Sheet no={9} title="DATA LAYER">
        <p className="kicker">step 04 · storage</p>
        <h2 id="skills-title">What's stored down here.</h2>
        <p className="lede">The stack, in shards. Only what I've actually used goes in.</p>
        <table className="shards">
          <tbody>
            {profile.skills.map((s, i) => (
              <tr key={s.group}>
                <th scope="row"><span className="shards__no">{String(i).padStart(2, '0')}</span>{s.group}</th>
                <td><Txt v={s.items} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Sheet>
    </Stop>
  )
}
