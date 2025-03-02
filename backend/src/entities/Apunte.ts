import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm";
import { Usuario } from "./Usuario";
import { Reto } from "./Reto";
import { PlanEstudio } from "./PlanEstudio";

@Entity({ name: "apuntes" })
export class Apunte {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "usuario_id" })
  usuarioId: string;

  @Column({ default: "privado" })
  visibilidad: string; 

  @Column({ name: "reto_id", nullable: true })
  retoId: string;

  @Column({ name: "plan_estudio_id", nullable: true })
  planEstudioId: string;

  @Column()
  titulo: string;

  @Column({ nullable: true })
  contenido: string;

  @Column()
  formato: string;

  @Column({ name: "fecha_subida", default: () => "CURRENT_TIMESTAMP" })
  fechaSubida: Date;

  @Column({ name: "calificacion_promedio", default: 0 })
  calificacionPromedio: number;

  // Nuevos campos para manejo de documentos
  @Column({ name: "documento_url", nullable: true })
  documentoUrl: string;

  @Column({ name: "creado_por", nullable: true })
  creadoPor: string;

  @Column({ name: "modificado_por", nullable: true })
  modificadoPor: string;

  @CreateDateColumn({ name: "fecha_creacion" })
  fechaCreacion: Date;

  @CreateDateColumn({ name: "fecha_modificacion" })
  fechaModificacion: Date;

  // Relaciones
  @ManyToOne(() => Usuario, usuario => usuario.apuntes)
  @JoinColumn({ name: "usuario_id" })
  usuario: Usuario;

  @ManyToOne(() => Reto, reto => reto.apuntes)
  @JoinColumn({ name: "reto_id" })
  reto: Reto;

  @ManyToOne(() => PlanEstudio, planEstudio => planEstudio.apuntes)
  @JoinColumn({ name: "plan_estudio_id" })
  planEstudio: PlanEstudio;
}
