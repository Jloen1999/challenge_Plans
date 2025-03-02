import 'reflect-metadata';
import pool from './config/db-config';
import dns from 'dns';

// Función para verificar si se puede resolver el nombre de host
function checkDns(hostname: string): Promise<string> {
  return new Promise((resolve, reject) => {
    dns.lookup(hostname, (err, address) => {
      if (err) {
        reject(`No se pudo resolver el nombre de host ${hostname}: ${err.message}`);
      } else {
        resolve(`El nombre de host ${hostname} se resolvió a ${address}`);
      }
    });
  });
}

async function testConnection() {
  console.log('🔍 Iniciando prueba de conectividad a Supabase...\n');
  
  // Verificar el DNS primero
  const host = process.env.SUPABASE_DB_HOST || 'aws-0-eu-central-1.pooler.supabase.com';
  try {
    console.log(await checkDns(host));
  } catch (error) {
    console.error(`❌ Error DNS: ${error}`);
    console.log('   Esto indica un problema de conectividad o DNS');
  }
  
  console.log('\n🔌 Intentando conectar a la base de datos...');
  
  try {
    // Establecer un timeout para la conexión
    const connectionPromise = pool.connect();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout excedido al intentar conectar')), 15000)
    );
    
    const client = await Promise.race([connectionPromise, timeoutPromise]) as any;
    console.log('✅ Conexión a la base de datos establecida correctamente');
    
    const result = await client.query('SELECT NOW() as now');
    console.log(`✅ Consulta de prueba exitosa: ${result.rows[0].now}`);
    
    client.release();
    console.log('✅ Conexión cerrada correctamente');
    
  } catch (error: any) {
    console.error('❌ Error al conectar con la base de datos:', error.message);
    
    if (error.code) {
      console.log(`\nCódigo de error: ${error.code}`);
      
      // Proporcionar información específica según el código de error
      if (error.code === 'ENOTFOUND') {
        console.log('   Este error indica que el host no se encuentra. Verifica el nombre del host.');
      } else if (error.code === 'ETIMEDOUT') {
        console.log('   Este error indica que la conexión agotó el tiempo de espera. Puede ser un problema de red o firewall.');
      } else if (error.code === '28P01') {
        console.log('   Este error indica credenciales incorrectas. Verifica tu usuario y contraseña.');
      }
    }
    
    console.log('\n🔧 Sugerencias para solucionar el problema:');
    console.log('1. Verifica que las credenciales en tu archivo .env sean correctas');
    console.log('2. Comprueba si puedes acceder al dashboard de Supabase desde tu navegador');
    console.log('3. Asegúrate de haber habilitado el acceso a la base de datos desde conexiones externas en la configuración de Supabase');
    console.log('4. Verifica que no haya restricciones de IP en tu proyecto de Supabase');
    console.log('5. Prueba con otra red (por ejemplo, desactiva el VPN si estás usando uno)');
    console.log('6. Intenta con una conexión directa usando psql o alguna otra herramienta de cliente SQL');
  } finally {
    console.log('\n🔍 Proceso de prueba de conexión completado');
    process.exit(0); // Asegurar que el script termine
  }
}

testConnection();
