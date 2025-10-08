export class AppError extends Error {
    public readonly statusCode: number;
    public readonly errorCode: string;
    public readonly isOperational: boolean;
  
    constructor(message: string,statusCode: number = 500,errorCode: string = 'SERVER_ERROR', isOperational: boolean = true,) {
      super(message);
      this.statusCode = statusCode;
      this.errorCode = errorCode;
      this.isOperational = isOperational;
  
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  // Erreurs spécifiques au domaine
  export class ValidationError extends AppError {
    constructor(message: string) {
      super(message, 400, 'VALIDATION_ERROR');
    }
  }
  export class TypeValidationError extends AppError {
    constructor(message: string) {
      super(message, 400, 'TYPE_VALIDATION_ERROR');
    }
  }
  
  export class AuthenticationError extends AppError {
    constructor(message: string) {
      super(message, 401, 'AUTH_ERROR');
    }
  }
  
  export class NotFoundError extends AppError {
    constructor(message: string) {
      super(message, 404, 'NOT_FOUND');
    }
  }
  
  export class ConflictError extends AppError {
    constructor(message: string) {
      super(message, 409, 'CONFLICT');
    }
  }
  
  export class AlreadyExistsError extends AppError {
    constructor(message: string = "Un utilisateur avec ces informations existe déjà") {
      super(message, 409, 'ALREADY_EXISTS');
    }
  }
  
  export class InvalidCredentialsError extends AppError {
    constructor(message: string = "Email ou mot de passe incorrect") {
      super(message, 401, 'INVALID_CREDENTIALS');
    }
  }
  