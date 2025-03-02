import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Nombres de los buckets de Supabase Storage
export const APUNTES_BUCKET = 'apuntes';

// Verificar que las variables de entorno existen
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Variables de entorno SUPABASE_URL y/o SUPABASE_KEY no definidas');
  console.error('Por favor, configura estas variables en el archivo .env');
  process.exit(1);
}

// Crear y exportar el cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

// Función para inicializar buckets si no existen
export async function initializeBuckets() {
  try {
    // Verificar si el bucket de apuntes existe
    const { data: buckets } = await supabase.storage.listBuckets();
    
    // Si el bucket de apuntes no existe, crearlo
    if (!buckets?.find(bucket => bucket.name === APUNTES_BUCKET)) {
      const { data, error } = await supabase.storage.createBucket(APUNTES_BUCKET, {
        public: true,
        fileSizeLimit: 10 * 1024 * 1024, // 10MB
      });
      
      if (error) {
        throw error;
      }
      
      console.log(`Bucket ${APUNTES_BUCKET} creado exitosamente`);
      
      // Establecer política pública para el bucket (opcional, si quieres que los archivos sean accesibles públicamente)
      await supabase.storage.from(APUNTES_BUCKET).createSignedUrl('dummy-path', 0);
    } else {
      console.log(`Bucket ${APUNTES_BUCKET} ya existe`);
    }
  } catch (error) {
    console.error('Error al inicializar buckets de Supabase:', error);
  }
}

export default supabase;
