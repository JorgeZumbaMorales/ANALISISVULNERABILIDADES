import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SesionUsuarioService {
  private rolActivoSubject = new BehaviorSubject<string>('');
  private refrescarRolesSubject = new Subject<void>();
  constructor() { }



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
  dispararRefrescarRoles() {
    this.refrescarRolesSubject.next();
  }

  escucharRefrescarRoles(): Observable<void> {
    return this.refrescarRolesSubject.asObservable();
  }
  estaAutenticado(): boolean {
    return this.obtenerToken() !== null;
  }

  cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('perfil');
    this.rolActivoSubject.next('');
  }



  guardarPerfil(perfil: any) {
    const codificado = btoa(JSON.stringify(perfil));
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



  setRolActivo(rol: string) {
    this.rolActivoSubject.next(rol);
  }

  getRolActivo(): Observable<string> {
    return this.rolActivoSubject.asObservable();
  }
}
