/**
 * Seed script — populates the database with demo rooms and services.
 * Run: node cms/seed.mjs
 * Requires DATABASE_URL in cms/.env
 */
import 'dotenv/config'
import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_URL)

async function seed() {
  console.log('Seeding services...')
  await sql`
    INSERT INTO services (name, price, updated_at, created_at)
    VALUES
      ('WiFi',            0,  NOW(), NOW()),
      ('Breakfast',      15,  NOW(), NOW()),
      ('Parking',        10,  NOW(), NOW()),
      ('Airport Shuttle',35,  NOW(), NOW()),
      ('Room Service',   20,  NOW(), NOW())
    ON CONFLICT (name) DO NOTHING
  `

  console.log('Seeding rooms...')
  await sql`
    INSERT INTO rooms (number, title, room_type, price, status, location, capacity, rating, description, updated_at, created_at)
    VALUES
      ('101', 'Cozy Single Room',    'Single', 89,  'Available', 'Kyiv, Ukraine', 2, 4.5, 'A bright single room with a city view.',            NOW(), NOW()),
      ('102', 'Deluxe Double Room',  'Double', 149, 'Available', 'Kyiv, Ukraine', 3, 4.7, 'Spacious double room with king-size bed.',           NOW(), NOW()),
      ('103', 'Standard Double',     'Double', 129, 'Available', 'Kyiv, Ukraine', 2, 4.3, 'Comfortable room ideal for couples.',                NOW(), NOW()),
      ('201', 'Executive Suite',     'Suite',  299, 'Available', 'Kyiv, Ukraine', 4, 4.9, 'Premium suite with panoramic view and jacuzzi.',     NOW(), NOW()),
      ('202', 'Junior Suite',        'Suite',  219, 'Available', 'Kyiv, Ukraine', 3, 4.6, 'Elegant junior suite with separate living area.',    NOW(), NOW()),
      ('301', 'Penthouse Suite',     'Suite',  499, 'Available', 'Kyiv, Ukraine', 5, 5.0, 'Top-floor penthouse with 360° city view.',           NOW(), NOW()),
      ('104', 'Economy Single',      'Single',  69, 'Available', 'Kyiv, Ukraine', 1, 4.1, 'Budget-friendly room with all essentials.',          NOW(), NOW()),
      ('105', 'Superior Single',     'Single', 109, 'Available', 'Kyiv, Ukraine', 2, 4.4, 'Superior single with work desk and fast WiFi.',      NOW(), NOW())
    ON CONFLICT (number) DO NOTHING
  `

  console.log('Done! Database seeded successfully.')
  await sql.end()
}

seed().catch(e => { console.error(e); process.exit(1) })
