import 'dotenv/config'
import { getPayload } from 'payload'
import config from './src/payload.config'

const payload = await getPayload({ config })
const out: string[] = []
const ok = (n: string, v: boolean) => out.push(`${v ? 'OK  ' : 'FAIL'} ${n}`)

const mk = (email: string, data: any) => payload.create({ collection: 'users', data: { email, password: 'Test-1234-spike', ...data } })
const admin = await mk('admin@x.ba', { ime: 'Admin', uloga: 'ADMIN' })
const tur = await mk('tur@x.ba', { ime: 'Urednik turizam', uloga: 'UREDNIK', sektor: 'TURIZAM' })
const oko = await mk('oko@x.ba', { ime: 'Urednik okoliš', uloga: 'UREDNIK', sektor: 'OKOLIS' })
const odo = await mk('odo@x.ba', { ime: 'Odobravatelj', uloga: 'ODOBRAVATELJ', sektor: 'TURIZAM' })

const v = await payload.create({ collection: 'vijesti', user: tur, overrideAccess: false, draft: true, locale: 'bs',
  data: { naslov: 'Javni poziv za manifestacije', sazetak: 'Rok 23.11.', sektor: 'TURIZAM', _status: 'draft' } })
await payload.update({ collection: 'vijesti', id: v.id, user: tur, overrideAccess: false, locale: 'hr', draft: true, data: { naslov: 'Javni poziv za manifestacije (HR)' } })
await payload.update({ collection: 'vijesti', id: v.id, user: tur, overrideAccess: false, locale: 'en', draft: true, data: { naslov: 'Public call for events' } })

let blocked = false
try { await payload.update({ collection: 'vijesti', id: v.id, user: tur, overrideAccess: false, data: { _status: 'published' } }) } catch { blocked = true }
ok('objava bez odobrenja je blokirana', blocked)

let fieldBlocked = false
const r1 = await payload.update({ collection: 'vijesti', id: v.id, user: tur, overrideAccess: false, draft: true, data: { odobreno: true } })
fieldBlocked = !r1.odobreno
ok('urednik ne može sam postaviti "odobreno"', fieldBlocked)

await payload.update({ collection: 'vijesti', id: v.id, user: odo, overrideAccess: false, draft: true, data: { odobreno: true } })
const pub = await payload.update({ collection: 'vijesti', id: v.id, user: tur, overrideAccess: false, data: { _status: 'published' } })
ok('objava nakon odobrenja', pub._status === 'published')

const tuđa = await payload.find({ collection: 'vijesti', user: oko, overrideAccess: false })
ok('urednik okoliša ne vidi vijesti turizma', tuđa.totalDocs === 0)
const javno = await payload.find({ collection: 'vijesti', overrideAccess: false })
ok('javnost vidi samo objavljene', javno.totalDocs === 1)

const en = await payload.findByID({ collection: 'vijesti', id: v.id, locale: 'en' })
const sr = await payload.findByID({ collection: 'vijesti', id: v.id, locale: 'sr' })
ok('lokalizacija: en prevod', en.naslov === 'Public call for events')
ok('lokalizacija: sr pada na bs', sr.naslov === 'Javni poziv za manifestacije')

const vers = await payload.findVersions({ collection: 'vijesti', where: { parent: { equals: v.id } } })
ok(`verzije sačuvane (${vers.totalDocs})`, vers.totalDocs >= 4)

let locked = false
for (let i = 0; i < 6; i++) { try { await payload.login({ collection: 'users', data: { email: 'oko@x.ba', password: 'pogresna' } }) } catch (e: any) { if (/locked/i.test(e.message)) locked = true } }
ok('zaključavanje nakon 5 pogrešnih lozinki', locked)

console.log(out.join('\n'))
process.exit(0)
