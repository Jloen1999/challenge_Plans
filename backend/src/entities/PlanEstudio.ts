import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, JoinColumn } from "typeorm";
import { Usuario } from "./Usuario";
import { Reto } from "./Reto";
import { Apunte } from "./Apunte";

@Entity({ name: "planes_estudio" })
export class PlanEstudio {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  usuario_id: string;

  @Column()
  titulo: string;

  @Column({ nullable: true })
  descripcion: string;

  @Column({ name: "fecha_inicio", type: "date", default: () => "CURRENT_DATE" })
  fechaInicio: Date;

  @Column({ name: "duracion_dias" })
  duracionDias: number;

  @Column({ name: "creado_por", nullable: true })
  creadoPor: string;

  @Column({ name: "modificado_por", nullable: true })
  modificadoPor: string;

  @Column({ default: "privado" })
  visibilidad: string;  // Cambiado de 'tipo' a 'visibilidad'

  @CreateDateColumn({ name: "fecha_creacion" })
  fechaCreacion: Date;

  @CreateDateColumn({ name: "fecha_modificacion" })
  fechaModificacion: Date;

  // Relaciones
  @ManyToOne(() => Usuario, usuario => usuario.planesEstudio)
  @JoinColumn({ name: "usuario_id" })
  usuario: Usuario;

  @OneToMany(() => Reto, reto => reto.planEstudio)
  retos: Reto[];

  @OneToMany(() => Apunte, apunte => apunte.planEstudio)
  apuntes: Apunte[];
}
