import process from 'node:process'
import { neon } from '@neondatabase/serverless'
import { config } from 'dotenv'
import { drizzle } from 'drizzle-orm/neon-http'
import { relations } from './relations'
import * as schema from './schema'

config({ path: '.env' })

const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle({
  schema,
  relations,
  client: sql
})
