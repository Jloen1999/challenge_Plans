import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { UsuarioRoles } from './usuario-roles.entity';
import { PlanEstudio } from './plan-estudio.entity';
import { Reto } from './reto.entity';
import { Apunte } from './apunte.entity';
import { Logro } from './logro.entity';
import { ParticipacionRetos } from './participacion-retos.entity';
import { TareaAsignaciones } from './tarea-asignaciones.entity';

/**
 * Entidad Usuario
 * 
 * Representa a un usuario registrado en la plataforma de aprendizaje colaborativo.
 * Los usuarios pueden crear retos, participar en retos existentes, subir apuntes
 * y recibir recompensas por sus actividades.
 * 
 * La gestión de roles se hace a través de la relación con usuario_roles,
 * permitiendo así un sistema flexible de permisos.
 */
@Entity('usuarios')
export class Usuario {
  /** Identificador único del usuario */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Correo electrónico único del usuario, utilizado para autenticación */
  @Column({ unique: true })
  email: string;

  /** Contraseña cifrada almacenada de forma segura */
  @Column()
  hash_contraseña: string;

  /** Nombre completo del usuario */
  @Column()
  nombre: string;

  /** Fecha en que el usuario se registró en la plataforma */
  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  fecha_registro: Date;

  /** Puntaje acumulado del usuario por completar retos y otras actividades */
  @Column({ default: 0 })
  puntaje: number;

  /** Fecha de creación del registro */
  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  fecha_creacion: Date;

  /** Fecha de la última modificación del registro */
  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  fecha_modificacion: Date;

  /** Nivel actual del usuario basado en su puntaje (actualizado automáticamente por trigger) */
  @Column({ type: 'int', default: 1 })
  nivel: number;

  /** 
   * Roles asignados al usuario
   * Con cascade para mantener consistencia en operaciones de inserción y actualización
   */
  @OneToMany(() => UsuarioRoles, usuarioRol => usuarioRol.usuario_id, { cascade: ['insert', 'update'] })
  roles: UsuarioRoles[];

  /**
   * Planes de estudio creados por el usuario
   * Cascade remove para eliminar automáticamente al eliminar el usuario
   */
  @OneToMany(() => PlanEstudio, plan => plan.usuario_id, { cascade: ['remove'] })
  planes: PlanEstudio[];

  /**
   * Retos creados por el usuario
   * Cascade remove para eliminar automáticamente al eliminar el usuario
   */
  @OneToMany(() => Reto, reto => reto.creador_id, { cascade: ['remove'] })
  retos: Reto[];

  /**
   * Apuntes creados por el usuario
   * Cascade remove para eliminar automáticamente al eliminar el usuario
   */
  @OneToMany(() => Apunte, apunte => apunte.usuario_id, { cascade: ['remove'] })
  apuntes: Apunte[];

  /**
   * Logros obtenidos por el usuario
   * Cascade remove para eliminar automáticamente al eliminar el usuario
   */
  @OneToMany(() => Logro, logro => logro.usuario_id, { cascade: ['remove'] })
  logros: Logro[];
}
