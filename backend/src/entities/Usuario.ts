import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from "typeorm";
import { PlanEstudio } from "./PlanEstudio";
import { Reto } from "./Reto";
import { ParticipacionReto } from "./ParticipacionReto";
import { UsuarioRecompensa } from "./UsuarioRecompensa";
import { Logro } from "./Logro";
import { Apunte } from "./Apunte";

@Entity({ name: "usuarios" })
export class Usuario {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: "hash_contraseña" })
  hashContraseña: string;

  @Column()
  nombre: string;

  @CreateDateColumn({ name: "fecha_registro" })
  fechaRegistro: Date;

  @Column({ default: 0 })
  puntaje: number;

  // Relaciones
  @OneToMany(() => PlanEstudio, planEstudio => planEstudio.usuario)
  planesEstudio: PlanEstudio[];

  @OneToMany(() => Reto, reto => reto.creador)
  retosCreados: Reto[];

  @OneToMany(() => ParticipacionReto, participacion => participacion.usuario)
  participaciones: ParticipacionReto[];

  @OneToMany(() => UsuarioRecompensa, usuarioRecompensa => usuarioRecompensa.usuario)
  recompensas: UsuarioRecompensa[];

  @OneToMany(() => Logro, logro => logro.usuario)
  logros: Logro[];

  @OneToMany(() => Apunte, apunte => apunte.usuario)
  apuntes: Apunte[];


}
