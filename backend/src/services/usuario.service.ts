import { Repository } from 'typeorm';
import { AppDataSource } from '../data-source';
import { Usuario } from '../entities/usuario.entity';
import { Rol } from '../entities/rol.entity';
import { UsuarioRoles } from '../entities/usuario-roles.entity';
import { UsuarioRecompensas } from '../entities/usuario-recompensas.entity';
import { hash, compare } from 'bcrypt';
import { NotFoundError, ConflictError, BadRequestError } from '../utils/custom-errors';

export class UsuarioService {
  private usuarioRepository: Repository<Usuario>;
  private rolRepository: Repository<Rol>;
  private usuarioRolesRepository: Repository<UsuarioRoles>;
  private usuarioRecompensasRepository: Repository<UsuarioRecompensas>;

  constructor() {
    this.usuarioRepository = AppDataSource.getRepository(Usuario);
    this.rolRepository = AppDataSource.getRepository(Rol);
    this.usuarioRolesRepository = AppDataSource.getRepository(UsuarioRoles);
    this.usuarioRecompensasRepository = AppDataSource.getRepository(UsuarioRecompensas);
  }

  /**
   * Encuentra a todos los usuarios
   */
  async findAll(): Promise<Usuario[]> {
    return this.usuarioRepository.find({
      select: ['id', 'email', 'nombre', 'puntaje', 'nivel', 'fecha_registro']
    });
  }

  /**
   * Encuentra un usuario por su ID
   */
  async findById(id: string): Promise<Usuario | null> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id },
      select: ['id', 'email', 'nombre', 'puntaje', 'nivel', 'fecha_registro']
    });

    if (!usuario) {
      throw new NotFoundError('Usuario no encontrado');
    }

    return usuario;
  }

  /**
   * Encuentra un usuario por su email (incluye contraseña)
   * Usado para autenticación
   */
  async findByEmail(email: string): Promise<Usuario | null> {
    return this.usuarioRepository.findOne({
      where: { email }
    });
  }

  /**
   * Crea un nuevo usuario
   */
  async create(userData: {
    email: string;
    nombre: string;
    password: string;
    rol?: string;
  }): Promise<Usuario> {
    // Verificar si el email ya está registrado
    const existingUser = await this.usuarioRepository.findOne({
      where: { email: userData.email }
    });

    if (existingUser) {
      throw new ConflictError('El email ya está registrado');
    }

    // Crear el hash de la contraseña
    const hashedPassword = await hash(userData.password, 10);

    // Crear el usuario
    const usuario = this.usuarioRepository.create({
      email: userData.email,
      nombre: userData.nombre,
      hash_contraseña: hashedPassword
    });

    const savedUser = await this.usuarioRepository.save(usuario);

    // Asignar rol de usuario por defecto
    const rolUsuario = await this.rolRepository.findOne({
      where: { nombre: userData.rol || 'usuario' }
    });

    if (rolUsuario) {
      await this.usuarioRolesRepository.save({
        usuario_id: savedUser.id,
        rol_id: rolUsuario.id
      });
    }

    // No devolver el hash de la contraseña
    const { hash_contraseña, ...userWithoutPassword } = savedUser;
    return userWithoutPassword as Usuario;
  }

  /**
   * Actualiza un usuario existente
   */
  async update(id: string, userData: Partial<Usuario>): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({ where: { id } });

    if (!usuario) {
      throw new NotFoundError('Usuario no encontrado');
    }

    // Si se intenta actualizar la contraseña, hashearla
    if (userData.hash_contraseña) {
      userData.hash_contraseña = await hash(userData.hash_contraseña, 10);
    }

    // Si se intenta actualizar el email, verificar que no exista
    if (userData.email && userData.email !== usuario.email) {
      const existingUser = await this.usuarioRepository.findOne({
        where: { email: userData.email }
      });
      
      if (existingUser) {
        throw new ConflictError('El email ya está registrado por otro usuario');
      }
    }

    // Actualizar campos permitidos
    await this.usuarioRepository.update(id, {
      email: userData.email,
      nombre: userData.nombre,
      hash_contraseña: userData.hash_contraseña
      // No permitimos actualizar puntaje o nivel directamente, eso lo manejan los triggers
    });

    return this.findById(id) as Promise<Usuario>;
  }

  /**
   * Elimina un usuario
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.usuarioRepository.delete(id);
    return result.affected !== 0;
  }

  /**
   * Verifica la contraseña de un usuario
   */
  async validatePassword(email: string, password: string): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({
      where: { email }
    });

    if (!usuario) {
      throw new NotFoundError('Usuario no encontrado');
    }

    const isValid = await compare(password, usuario.hash_contraseña);

    if (!isValid) {
      throw new BadRequestError('Credenciales inválidas');
    }

    // No devolver el hash de la contraseña
    const { hash_contraseña, ...userWithoutPassword } = usuario;
    return userWithoutPassword as Usuario;
  }

  /**
   * Obtiene los roles de un usuario
   */
  async getRoles(userId: string): Promise<string[]> {
    const roles = await AppDataSource.query(`
      SELECT r.nombre
      FROM usuario_roles ur
      JOIN roles r ON ur.rol_id = r.id
      WHERE ur.usuario_id = $1
    `, [userId]);

    return roles.map((rol: any) => rol.nombre);
  }

  /**
   * Obtiene los permisos de un usuario
   */
  async getPermisos(userId: string): Promise<string[]> {
    const permisos = await AppDataSource.query(`
      SELECT DISTINCT p.nombre
      FROM permisos p
      JOIN rol_permisos rp ON p.id = rp.permiso_id
      JOIN usuario_roles ur ON rp.rol_id = ur.rol_id
      WHERE ur.usuario_id = $1
    `, [userId]);

    return permisos.map((permiso: any) => permiso.nombre);
  }

  /**
   * Agrega un rol a un usuario
   */
  async addRol(userId: string, rolName: string): Promise<boolean> {
    // Buscar el rol por nombre
    const rol = await this.rolRepository.findOne({
      where: { nombre: rolName }
    });

    if (!rol) {
      throw new NotFoundError('Rol no encontrado');
    }

    try {
      await this.usuarioRolesRepository.save({
        usuario_id: userId,
        rol_id: rol.id
      });
      return true;
    } catch (error) {
      // Si ya tiene el rol (error de clave duplicada)
      return false;
    }
  }

  /**
   * Elimina un rol de un usuario
   */
  async removeRol(userId: string, rolName: string): Promise<boolean> {
    // Buscar el rol por nombre
    const rol = await this.rolRepository.findOne({
      where: { nombre: rolName }
    });

    if (!rol) {
      throw new NotFoundError('Rol no encontrado');
    }

    const result = await this.usuarioRolesRepository.delete({
      usuario_id: userId,
      rol_id: rol.id
    });

    return result.affected !== 0;
  }

  /**
   * Obtiene las recompensas de un usuario
   */
  async getRecompensas(userId: string): Promise<any[]> {
    return AppDataSource.query(`
      SELECT r.nombre, r.tipo, r.valor, ur.fecha_obtencion
      FROM usuario_recompensas ur
      JOIN recompensas r ON ur.recompensa_id = r.id
      WHERE ur.usuario_id = $1
      ORDER BY ur.fecha_obtencion DESC
    `, [userId]);
  }
}
