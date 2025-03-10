import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false
  }
});

async function verifyDatabase() {
  try {
    const client = await pool.connect();
    console.log('🔍 Verificando objetos de la base de datos...');
    
    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, 'sql', 'verify-database-objects.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Dividir en consultas individuales
    const queries = sqlContent.split(';').filter(q => q.trim().length > 0);
    
    // Ejecutar cada consulta
    for (const query of queries) {
      const result = await client.query(query);
      if (result.rows.length > 0) {
        console.log('\n📊 Resultados:');
        console.table(result.rows);
      } else {
        console.log('⚠️ No se encontraron resultados para la consulta:', query.substring(0, 50) + '...');
      }
    }
    
    client.release();
    console.log('✅ Verificación completada');
    
  } catch (err) {
    console.error('❌ Error al verificar la base de datos:', err);
  } finally {
    await pool.end();
  }
}

// Ejecutar la verificación
verifyDatabase();
