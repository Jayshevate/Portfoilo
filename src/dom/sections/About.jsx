import { profile } from '../../content/profile'
import Sheet from '../Sheet'
import Stop from '../Stop'
import Txt from '../Txt'

export default function About() {
  return (
    <Stop id="lb" className="panel-left" labelledBy="about-title">
      <Sheet no={2} title="LOAD BALANCER">
        <p className="kicker">step 02 · routing</p>
        {profile.photo && (
          <figure className="polaroid">
            <img src={profile.photo} alt={`Photo of ${profile.displayName}`} loading="lazy" decoding="async" />
          </figure>
        )}
        <h2 id="about-title">Where my time gets routed right now.</h2>
        <p className="lede">
          Three servers, one hub. I'm finishing a B.Tech in CSE with a Cyber Security specialisation at
          D. Y. Patil International University, teaching there as a Teaching Associate since August 2025, and
          building the university's PhD ERP as its only developer. I qualified GATE 2026 in Data Science & AI.
        </p>
        <p>
          I want to work on {profile.targeting.slice(0, -1).join(', ')} or {profile.targeting.at(-1)} problems, and I take
          freelance work. I speak {profile.spoken.join(', ')}, and I'm learning {profile.learning.join(', ')}.
        </p>
        <ol className="timeline">
          {profile.experience.map((x) => (
            <li key={x.org}>
              <p className="timeline__when">{x.when}</p>
              <h3>{x.title} <span>· {x.org}</span></h3>
              <p><Txt v={x.detail} /></p>
            </li>
          ))}
        </ol>
      </Sheet>
    </Stop>
  )
}
