import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SesionUsuarioService {

  constructor() {}

  // ✅ Guardar solo el token en localStorage
  guardarSesion(token: string) {
    localStorage.setItem('token', token);
  }

  // ✅ Obtener el token almacenado
  obtenerToken(): string | null {
    return localStorage.getItem('token');
  }

  // ✅ Extraer información del usuario desde el token
  obtenerUsuarioDesdeToken(): any {
    const token = this.obtenerToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1])); // Decodificar el payload del JWT
      return payload;
    } catch (error) {
      console.error("Error al decodificar el token:", error);
      return null;
    }
  }

  // ✅ Verificar si el usuario está autenticado
  estaAutenticado(): boolean {
    return this.obtenerToken() !== null;
  }

  // ✅ Cerrar sesión eliminando solo el token
  cerrarSesion() {
    localStorage.removeItem('token');
  }
}
