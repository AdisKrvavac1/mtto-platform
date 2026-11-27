import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import type { CollectionConfig } from 'payload'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const SEKTORI = ['TURIZAM', 'TRGOVINA', 'OKOLIS', 'INSPEKCIJA']

const Users: CollectionConfig = {
  slug: 'users',
  auth: { maxLoginAttempts: 5, lockTime: 15 * 60 * 1000 },
  fields: [
    { name: 'ime', type: 'text', required: true },
    { name: 'uloga', type: 'select', options: ['ADMIN', 'UREDNIK', 'ODOBRAVATELJ'], defaultValue: 'UREDNIK', required: true },
    { name: 'sektor', type: 'select', options: SEKTORI },
  ],
}

// Vijest: nacrt -> odobrenje -> objava, verzije, zakazana objava, 4 jezika, urednik vidi samo svoj sektor
const Vijesti: CollectionConfig = {
  slug: 'vijesti',
  labels: { singular: 'Vijest', plural: 'Vijesti' },
  admin: { useAsTitle: 'naslov', defaultColumns: ['naslov', 'sektor', '_status', 'updatedAt'] },
  versions: { drafts: { schedulePublish: true }, maxPerDoc: 50 },
  access: {
    read: ({ req }) => (req.user ? (req.user.uloga === 'ADMIN' ? true : { sektor: { equals: req.user.sektor } }) : { _status: { equals: 'published' } }),
    create: ({ req }) => !!req.user,
    update: ({ req }) => (req.user?.uloga === 'ADMIN' ? true : { sektor: { equals: req.user?.sektor } }),
    delete: ({ req }) => req.user?.uloga === 'ADMIN',
  },
  fields: [
    { name: 'naslov', type: 'text', required: true, localized: true },
    { name: 'sazetak', type: 'textarea', localized: true },
    { name: 'tekst', type: 'richText', localized: true },
    { name: 'sektor', type: 'select', options: SEKTORI, required: true },
    { name: 'odobreno', type: 'checkbox', access: { update: ({ req }) => ['ADMIN', 'ODOBRAVATELJ'].includes(req.user?.uloga) } },
  ],
  hooks: {
    beforeChange: [({ data, req, originalDoc }) => {
      if (data._status === 'published' && !(data.odobreno ?? originalDoc?.odobreno)) throw new Error('Vijest mora odobriti odobravatelj prije objave')
      return data
    }],
  },
}

export default buildConfig({
  admin: { user: Users.slug, importMap: { baseDir: path.resolve(dirname) } },
  collections: [Users, Vijesti],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || 'spike-only-secret',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: postgresAdapter({ pool: { connectionString: process.env.DATABASE_URL } }),
  localization: {
    locales: [{ code: 'bs', label: 'Bosanski' }, { code: 'hr', label: 'Hrvatski' }, { code: 'sr', label: 'Srpski' }, { code: 'en', label: 'English' }],
    defaultLocale: 'bs',
    fallback: true,
  },
})
