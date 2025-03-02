import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, JoinColumn } from "typeorm";
import { Usuario } from "./Usuario";
import { PlanEstudio } from "./PlanEstudio";
import { RetoCategoria } from "./RetoCategoria";
import { ParticipacionReto } from "./ParticipacionReto";
import { Tarea } from "./Tarea";
import { Apunte } from "./Apunte";

@Entity({ name: "retos" })
export class Reto {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "creador_id" })
  creadorId: string;

  @Column({ name: "plan_estudio_id", nullable: true })
  planEstudioId: string;

  @Column()
  titulo: string;

  @Column({ nullable: true })
  descripcion: string;

  @Column({ name: "fecha_inicio", type: "date" })
  fechaInicio: Date;

  @Column({ name: "fecha_fin", type: "date" })
  fechaFin: Date;

  @Column({ default: "activo" })
  estado: "activo" | "completado" | "cancelado";

  @Column()
  dificultad: "principiante" | "intermedio" | "avanzado";
  
  @Column({ default: "privado" })
  visibilidad: string;  // Cambiado de 'tipo' a 'visibilidad'

  @Column({ name: "creado_por", nullable: true })
  creadoPor: string;

  @Column({ name: "modificado_por", nullable: true })
  modificadoPor: string;

  @CreateDateColumn({ name: "fecha_creacion" })
  fechaCreacion: Date;

  @CreateDateColumn({ name: "fecha_modificacion" })
  fechaModificacion: Date;

  // Relaciones
  @ManyToOne(() => Usuario, usuario => usuario.retosCreados)
  @JoinColumn({ name: "creador_id" })
  creador: Usuario;

  @ManyToOne(() => PlanEstudio, planEstudio => planEstudio.retos)
  @JoinColumn({ name: "plan_estudio_id" })
  planEstudio: PlanEstudio;

  @OneToMany(() => RetoCategoria, retoCategoria => retoCategoria.reto)
  retoCategorias: RetoCategoria[];

  @OneToMany(() => ParticipacionReto, participacion => participacion.reto)
  participaciones: ParticipacionReto[];

  @OneToMany(() => Tarea, tarea => tarea.reto)
  tareas: Tarea[];

  @OneToMany(() => Apunte, apunte => apunte.reto)
  apuntes: Apunte[];
}
