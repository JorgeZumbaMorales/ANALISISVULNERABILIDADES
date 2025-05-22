import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SesionUsuarioService {
  private rolActivoSubject = new BehaviorSubject<string>(''); // Nuevo campo reactivo

  constructor() {}

  // ===================== 🔐 Token =====================

  guardarSesion(token: string) {
    localStorage.setItem('token', token);
  }

  obtenerToken(): string | null {
    return localStorage.getItem('token');
  }

  obtenerUsuarioDesdeToken(): any {
    const token = this.obtenerToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch (error) {
      console.error("Error al decodificar el token:", error);
      return null;
    }
  }

  estaAutenticado(): boolean {
    return this.obtenerToken() !== null;
  }

  cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('perfil');
    this.rolActivoSubject.next(''); // limpiar también el rol activo
  }

  // ===================== 👤 Perfil =====================

  guardarPerfil(perfil: any) {
    const { usuario_id, ...perfilSinId } = perfil;
    const codificado = btoa(JSON.stringify(perfilSinId));
    localStorage.setItem('perfil', codificado);
  }

  obtenerPerfil(): any {
    const datos = localStorage.getItem('perfil');
    if (!datos) return null;

    try {
      return JSON.parse(atob(datos));
    } catch (error) {
      console.error('Error al decodificar el perfil del usuario:', error);
      return null;
    }
  }

  // ===================== 🧠 Rol Activo Dinámico =====================

  setRolActivo(rol: string) {
    this.rolActivoSubject.next(rol);
  }

  getRolActivo(): Observable<string> {
    return this.rolActivoSubject.asObservable();
  }
}
