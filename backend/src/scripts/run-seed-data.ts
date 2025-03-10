import { AppDataSource } from '../data-source';
import { SeedData1741700000000 } from '../migrations/1741700000000-SeedData';

(async () => {
  try {
    await AppDataSource.initialize();
    console.log('Conexión a DB establecida');

    const queryRunner = AppDataSource.createQueryRunner();
    const sampleDataMigration = new SeedData1741700000000();

    console.log('Ejecutando migración de inserción de datos de ejemplo...');
    await sampleDataMigration.up(queryRunner);
    console.log('Datos de ejemplo insertados correctamente');
  } catch (error) {
    console.error('Error al insertar datos de ejemplo:', error);
  } finally {
    await AppDataSource.destroy();
  }
})();