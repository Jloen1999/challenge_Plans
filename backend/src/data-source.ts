import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { Usuario } from './entities/usuario.entity';
import { PlanEstudio } from './entities/plan-estudio.entity';
import { Reto } from './entities/reto.entity';
import { Tarea } from './entities/tarea.entity';
import { Apunte } from './entities/apunte.entity';
import { Categoria } from './entities/categoria.entity';
import { ParticipacionRetos } from './entities/participacion-retos.entity';
import { TareasCompletadas } from './entities/tareas-completadas.entity';
import { Archivo } from './entities/archivo.entity';
import { CalificacionApunte } from './entities/calificacion-apunte.entity';
import { Recompensa } from './entities/recompensa.entity';
import { UsuarioRecompensas } from './entities/usuario-recompensas.entity';
import { Logro } from './entities/logro.entity';
import { RetoCategoria } from './entities/reto-categorias.entity';
import { Notificacion } from './entities/notificacion.entity';
import { Rol } from './entities/rol.entity';
import { Permiso } from './entities/permiso.entity';
import { UsuarioRoles } from './entities/usuario-roles.entity';
import { RolPermisos } from './entities/rol-permisos.entity';
import { HistorialProgreso } from './entities/historial-progreso.entity';
import { Comentario } from './entities/comentario.entity';
import { ArchivoGenerico } from './entities/archivo-generico.entity';
import { ReglaRecompensa } from './entities/regla-recompensa.entity';
import { Auditoria } from './entities/auditoria.entity';
import { RetoPlanEstudio } from './entities/reto-planes-estudio.entity';
import { TareaAsignaciones } from './entities/tarea-asignaciones.entity';
import { NotificacionLectura } from './entities/notificacion-lectura.entity';

// Asegurar que las variables de entorno estén cargadas
dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false // Necesario para Supabase
  },
  entities: [
    Usuario,
    PlanEstudio,
    Reto,
    Tarea,
    Apunte,
    Categoria,
    ParticipacionRetos,
    TareasCompletadas,
    Archivo,
    CalificacionApunte,
    Recompensa,
    UsuarioRecompensas,
    Logro,
    RetoCategoria,
    Notificacion,
    Rol,
    Permiso,
    UsuarioRoles,
    RolPermisos,
    HistorialProgreso,
    Comentario,
    ArchivoGenerico,
    ReglaRecompensa,
    Auditoria,
    RetoPlanEstudio,
    TareaAsignaciones,
    NotificacionLectura,
  ],
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
  synchronize: false,
  logging: false,
});