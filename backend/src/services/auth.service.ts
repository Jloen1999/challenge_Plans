import { AppDataSource } from '../data-source';
import { Usuario } from '../entities/usuario.entity';
import { UsuarioRoles } from '../entities/usuario-roles.entity';
import { Rol } from '../entities/rol.entity';
import { Permiso } from '../entities/permiso.entity';
import { RolPermisos } from '../entities/rol-permisos.entity';
import { hash, compare } from 'bcryptjs';
import { generateToken, generateRefreshToken } from '../utils/jwt';
import { NotFoundError, UnauthorizedError, ConflictError, BadRequestError } from '../utils/custom-errors';

export class AuthService {
  private usuarioRepository = AppDataSource.getRepository(Usuario);
  private usuarioRolesRepository = AppDataSource.getRepository(UsuarioRoles);
  private rolRepository = AppDataSource.getRepository(Rol);
  private permisoRepository = AppDataSource.getRepository(Permiso);
  private rolPermisosRepository = AppDataSource.getRepository(RolPermisos);

  /**
   * Registra un nuevo usuario en el sistema
   * @param userData Datos del usuario a registrar
   * @returns Usuario creado (sin contraseña)
   */
  async register(userData: {
    email: string;
    password: string;
    nombre: string;
  }): Promise<Omit<Usuario, 'hash_contraseña'>> {
    // Verificar formato de email antes de intentar insertar (la DB tiene una restricción CHECK)
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(userData.email)) {
      throw new BadRequestError('El formato del correo electrónico es inválido');
    }

    // Verificar si el usuario ya existe
    const existingUser = await this.usuarioRepository.findOne({
      where: { email: userData.email.toLowerCase() }
    });

    if (existingUser) {
      throw new ConflictError('El correo electrónico ya está registrado');
    }

    // Hashear contraseña
    const hashedPassword = await hash(userData.password, 10);

    const newUser = this.usuarioRepository.create({
      email: userData.email.toLowerCase(),
      hash_contraseña: hashedPassword,
      nombre: userData.nombre
    });

    const savedUser = await this.usuarioRepository.save(newUser);

    // Buscar rol de estudiante (rol por defecto)
    const estudianteRol = await this.rolRepository.findOne({
      where: { nombre: 'Estudiante' }
    });

    if (!estudianteRol) {
      throw new NotFoundError('Rol de estudiante no encontrado');
    }

    // Asignar rol por defecto
    await this.usuarioRolesRepository.save({
      usuario_id: savedUser.id,
      rol_id: estudianteRol.id
    });

    // Retornar usuario sin la contraseña
    const { hash_contraseña, ...userWithoutPassword } = savedUser;
    return userWithoutPassword;
  }

  /**
   * Autentica a un usuario y genera tokens de acceso
   * @param email Email del usuario
   * @param password Contraseña del usuario
   * @returns Datos del usuario y tokens
   */
  async login(email: string, password: string): Promise<{
    user: Omit<Usuario, 'hash_contraseña'>;
    accessToken: string;
    refreshToken: string;
  }> {
    // Buscar usuario con una consulta optimizada que obtenga los roles en una sola operación
    const user = await this.usuarioRepository.findOne({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      throw new UnauthorizedError('Credenciales incorrectas');
    }

    // Verificar contraseña
    const isPasswordValid = await compare(password, user.hash_contraseña);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Credenciales incorrectas');
    }

    // Optimizar obtención de roles con una sola consulta SQL
    const roleNames = await AppDataSource.query(`
      SELECT r.nombre
      FROM roles r
      JOIN usuario_roles ur ON r.id = ur.rol_id
      WHERE ur.usuario_id = $1
    `, [user.id]);

    const accessToken = generateToken({
      id: user.id,
      email: user.email,
      roles: roleNames.map((r: {nombre: string}) => r.nombre)
    });
    
    const refreshToken = generateRefreshToken({
      id: user.id
    });

    // Retornar usuario sin la contraseña
    const { hash_contraseña, ...userWithoutPassword } = user;
    
    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken
    };
  }


  /**
   * Obtiene el perfil completo de un usuario
   * @param userId ID del usuario
   * @returns Datos completos del perfil
   */
  async getUserProfile(userId: string): Promise<{
    id: string;
    email: string;
    nombre: string;
    fecha_registro: Date;
    puntaje: number;
    nivel: number;
    fecha_creacion: Date;
    fecha_modificacion: Date;
    roles: string[];
    permisos: string[];
  }> {
    // Verificar que el usuario existe
    const user = await this.usuarioRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }

    // Optimización: obtener roles y permisos con una sola consulta SQL
    const permisos = await AppDataSource.query(`
      SELECT DISTINCT r.nombre AS rol, p.nombre AS permiso
      FROM roles r
      JOIN usuario_roles ur ON r.id = ur.rol_id
      JOIN rol_permisos rp ON r.id = rp.rol_id
      JOIN permisos p ON rp.permiso_id = p.id
      WHERE ur.usuario_id = $1
    `, [userId]);
    
    // Procesar resultados para construir arrays de roles y permisos
    const rolesSet = new Set<string>();
    const permisosSet = new Set<string>();
    
    for (const item of permisos) {
      rolesSet.add(item.rol);
      permisosSet.add(item.permiso);
    }
    
    // No incluir la contraseña en la respuesta
    const { hash_contraseña, ...userWithoutPassword } = user;
    
    // Retornar perfil completo con tipo específico
    return {
      ...userWithoutPassword,
      roles: Array.from(rolesSet),
      permisos: Array.from(permisosSet)
    };
  }

  /**
   * Obtiene los permisos de un usuario
   * @param userId ID del usuario
   * @returns Lista de permisos
   */
  async getUserPermissions(userId: string): Promise<string[]> {
    // Verificar que el usuario existe
    const userExists = await this.usuarioRepository.exist({
      where: { id: userId }
    });
    
    if (!userExists) {
      throw new NotFoundError('Usuario no encontrado');
    }

    // Consultar permisos directamente desde la base de datos con una query optimizada
    const permisos = await AppDataSource.query(`
      SELECT DISTINCT p.nombre 
      FROM permisos p
      JOIN rol_permisos rp ON p.id = rp.permiso_id
      JOIN usuario_roles ur ON rp.rol_id = ur.rol_id
      WHERE ur.usuario_id = $1
    `, [userId]);
    
    return permisos.map((p: { nombre: string }) => p.nombre);
  }

  /**
   * Verifica si un usuario tiene los permisos requeridos
   * @param userId ID del usuario
   * @param requiredPermissions Permisos requeridos
   * @returns True si tiene todos los permisos, false en caso contrario
   */
  async hasPermissions(userId: string, requiredPermissions: string[]): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId);
    
    return requiredPermissions.every(permission => 
      userPermissions.includes(permission)
    );
  }

  /**
   * Restablece la contraseña de un usuario (solo para administradores)
   * @param userId ID del usuario cuya contraseña será restablecida
   * @param newPassword Nueva contraseña sin hashear
   * @returns True si la operación fue exitosa
   */
  async resetPassword(userId: string, newPassword: string): Promise<boolean> {
    // Verificar que el usuario existe
    const user = await this.usuarioRepository.findOne({
      where: { id: userId }
    });
    
    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }
    
    // Validar que la contraseña cumple con requisitos mínimos
    if (!newPassword || newPassword.length < 6) {
      throw new BadRequestError('La nueva contraseña debe tener al menos 6 caracteres');
    }
    
    // Hashear la nueva contraseña
    const hashedPassword = await hash(newPassword, 10);
    
    // Actualizar la contraseña del usuario
    user.hash_contraseña = hashedPassword;
    
    // Guardar los cambios
    await this.usuarioRepository.save(user);
    
    return true;
  }
}
