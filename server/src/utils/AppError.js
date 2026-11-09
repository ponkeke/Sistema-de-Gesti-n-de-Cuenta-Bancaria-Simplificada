export class AppError extends Error {
  constructor(status, message, codigo) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.codigo = codigo;
  }
}
