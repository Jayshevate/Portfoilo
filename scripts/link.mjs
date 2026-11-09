/*
 * npm run link -- "Company" [cloud|backend|security|devops]
 * Prints a tailored link for one application. Set SITE_URL to the address
 * the site is hosted at (defaults to the local dev server).
 */
const [company, role] = process.argv.slice(2)
if (!company) {
  console.log('usage: npm run link -- "Company name" [cloud|backend|security|devops]')
  process.exit(1)
}
const url = new URL(process.env.SITE_URL || 'http://localhost:5173/')
url.searchParams.set('for', company)
if (role) url.searchParams.set('role', role)
console.log(url.toString())
