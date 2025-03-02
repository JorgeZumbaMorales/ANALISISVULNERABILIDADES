import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment'; 

@Injectable({
  providedIn: 'root'
})
export class ServiciosAutenticacion {
  private apiUrlUsuarios = `${environment.apiUrl}/usuarios`; 
  private apiUrlRoles = `${environment.apiUrl}/roles`;

  constructor(private http: HttpClient) {}

  // ===================== USUARIOS =====================

  listarUsuarios(): Observable<any> {
    return this.http.get<any>(`${this.apiUrlUsuarios}/listar_usuarios`)
      .pipe(catchError(this.handleError));
  }

  
  crearUsuario(usuario: any, rolId: number): Observable<any> {
    console.log("SERVICIO USUARIO",usuario);
    console.log("SERVICIO ROL ID", rolId);
    const params = new HttpParams().set('rol_id', rolId.toString());

    return this.http.post<any>(
      `${this.apiUrlUsuarios}/crear_usuario`, 
      usuario, 
      {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
        params: params 
      }
    ).pipe(catchError(this.handleError));
  }

  actualizarUsuario(usuarioId: number, usuario: any): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrlUsuarios}/actualizar_usuario/${usuarioId}`, 
      usuario
    ).pipe(catchError(this.handleError));
  }

  actualizarEstadoUsuario(usuarioId: number, estado: boolean): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrlUsuarios}/actualizar_estado_usuario/${usuarioId}`, 
      { estado }
    ).pipe(catchError(this.handleError));
  }

  eliminarUsuario(usuarioId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrlUsuarios}/eliminar_usuario/${usuarioId}`)
      .pipe(catchError(this.handleError));
  }

  // ===================== ROLES =====================

  listarRoles(): Observable<any> {
    return this.http.get<any>(`${this.apiUrlRoles}/listar_roles`)
      .pipe(catchError(this.handleError));
  }

  crearRol(rol: any): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrlRoles}/crear_rol`, 
      rol, 
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).pipe(catchError(this.handleError));
  }

  actualizarRol(rolId: number, rol: any): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrlRoles}/actualizar_rol/${rolId}`, 
      rol
    ).pipe(catchError(this.handleError));
  }

  actualizarEstadoRol(rolId: number, estado: boolean): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrlRoles}/actualizar_estado_rol/${rolId}`, 
      { estado }
    ).pipe(catchError(this.handleError));
  }

  eliminarRol(rolId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrlRoles}/eliminar_rol/${rolId}`)
      .pipe(catchError(this.handleError));
  }

  // ===================== MANEJO DE ERRORES =====================
  private handleError(error: any) {
    console.error('Error en la petición:', error);
    return throwError(() => new Error(error.message || 'Error en el servicio de autenticación'));
  }
}
