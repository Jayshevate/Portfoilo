/*
 * My local time, for recruiters in other time zones. The server render
 * shows only the zone (it can't know when you'll read it); the time
 * appears once the page is running and ticks every 30 seconds.
 */
import { useEffect, useState } from 'react'

const fmt = () =>
  new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date())

export default function PuneClock() {
  const [time, setTime] = useState(null)
  useEffect(() => {
    setTime(fmt())
    const id = setInterval(() => setTime(fmt()), 30000)
    return () => clearInterval(id)
  }, [])
  return (
    <span data-clock>
      {time && <span className="font-mono text-cream">{time} </span>}
      <span className="text-dust">IST · UTC+5:30</span>
    </span>
  )
}
