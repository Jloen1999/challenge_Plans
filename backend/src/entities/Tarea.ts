import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from "typeorm";
import { Reto } from "./Reto";
import { Usuario } from "./Usuario";

@Entity({ name: "tareas" })
export class Tarea {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "reto_id" })
  retoId: string;

  @Column({ name: "asignado_a", nullable: true })
  asignadoA: string;

  @Column()
  titulo: string;

  @Column({ nullable: true })
  descripcion: string;

  @Column()
  puntos: number;

  @Column({ name: "fecha_limite", type: "date", nullable: true })
  fechaLimite: Date;

  @Column()
  tipo: "lectura" | "ejercicio" | "proyecto";

  @Column({ name: "creado_por", nullable: true })
  creadoPor: string;

  @Column({ name: "modificado_por", nullable: true })
  modificadoPor: string;

  @CreateDateColumn({ name: "fecha_creacion" })
  fechaCreacion: Date;

  @CreateDateColumn({ name: "fecha_modificacion" })
  fechaModificacion: Date;

  // Relaciones
  @ManyToOne(() => Reto, reto => reto.tareas)
  @JoinColumn({ name: "reto_id" })
  reto: Reto;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: "asignado_a" })
  asignado: Usuario;
}
