// Error type used by every route. The central error handler turns it into JSON.
export class HttpError extends Error {
  constructor(status, code, data = {}) {
    super(code);
    this.status = status;
    this.code = code;
    this.data = data;
  }
}
