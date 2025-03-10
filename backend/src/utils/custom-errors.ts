/**
 * Error personalizado para recursos no encontrados (404)
 */
export class NotFoundError extends Error {
  statusCode: number;

  constructor(message: string = 'Recurso no encontrado') {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

/**
 * Error personalizado para acceso no autorizado (401)
 */
export class UnauthorizedError extends Error {
  statusCode: number;

  constructor(message: string = 'No autorizado') {
    super(message);
    this.name = 'UnauthorizedError';
    this.statusCode = 401;
  }
}

/**
 * Error personalizado para acceso prohibido (403)
 */
export class ForbiddenError extends Error {
  statusCode: number;

  constructor(message: string = 'Acceso prohibido') {
    super(message);
    this.name = 'ForbiddenError';
    this.statusCode = 403;
  }
}

/**
 * Error personalizado para conflictos (409)
 */
export class ConflictError extends Error {
  statusCode: number;

  constructor(message: string = 'Conflicto con el estado actual') {
    super(message);
    this.name = 'ConflictError';
    this.statusCode = 409;
  }
}

/**
 * Error personalizado para datos inválidos (400)
 */
export class BadRequestError extends Error {
  statusCode: number;

  constructor(message: string = 'Solicitud inválida') {
    super(message);
    this.name = 'BadRequestError';
    this.statusCode = 400;
  }
}
