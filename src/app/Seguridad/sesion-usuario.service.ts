import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SesionUsuarioService {
  private claveToken = 'token';
  private claveUsuario = 'usuario';

  constructor() {}

  // 📌 Guardar token y datos del usuario en localStorage
  guardarSesion(token: string, usuario: any) {
    localStorage.setItem(this.claveToken, token);
    localStorage.setItem(this.claveUsuario, JSON.stringify(usuario));
  }

  // 📌 Obtener el token
  obtenerToken(): string | null {
    return localStorage.getItem(this.claveToken);
  }

  // 📌 Obtener datos del usuario
  obtenerUsuario(): any {
    const usuario = localStorage.getItem(this.claveUsuario);
    return usuario ? JSON.parse(usuario) : null;
  }

  // 📌 Verificar si hay sesión activa
  estaAutenticado(): boolean {
    return this.obtenerToken() !== null;
  }

  // 📌 Cerrar sesión
  cerrarSesion() {
    localStorage.removeItem(this.claveToken);
    localStorage.removeItem(this.claveUsuario);
  }
}
