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
  // ✅ Guardar el perfil completo del usuario
  guardarPerfil(perfil: any) {
    // Eliminar el usuario_id antes de guardar
    const { usuario_id, ...perfilSinId } = perfil;

    // Codificar en Base64 para evitar exposición directa
    const codificado = btoa(JSON.stringify(perfilSinId));

    // Guardar en localStorage
    localStorage.setItem('perfil', codificado);
  }

  obtenerPerfil(): any {
    const datos = localStorage.getItem('perfil');

    if (!datos) return null;

    try {
      // Decodificar desde Base64 y convertir a objeto
      return JSON.parse(atob(datos));
    } catch (error) {
      console.error('Error al decodificar el perfil del usuario:', error);
      return null;
    }
  }


}
