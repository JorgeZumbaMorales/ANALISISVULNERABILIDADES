import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class ServiciosAlertas {
  private apiUrl = `${environment.apiUrl}/notificaciones`;

  constructor(private http: HttpClient) {}

  // ===================== 📩 Notificaciones =====================

  listarNotificaciones(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/listar_notificaciones`)
      .pipe(catchError(this.handleError));
  }

  crearNotificacion(notificacion: any): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/crear_notificacion`,
      notificacion,
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).pipe(catchError(this.handleError));
  }

  actualizarNotificacion(id: number, notificacion: any): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}/actualizar_notificacion/${id}`,
      notificacion,
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).pipe(catchError(this.handleError));
  }

  eliminarNotificacion(id: number): Observable<any> {
    return this.http.delete<any>(
      `${this.apiUrl}/eliminar_notificacion/${id}`
    ).pipe(catchError(this.handleError));
  }

  listarNotificacionesSistemaPorUsuario(usuarioId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/usuario/${usuarioId}/sistema`)
      .pipe(catchError(this.handleError));
  }

  marcarNotificacionesComoVistas(usuarioId: number): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}/usuario/${usuarioId}/marcar_vistas`, 
      {}, 
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).pipe(catchError(this.handleError));
  }
  obtenerHistorialNotificacionesSistema(usuarioId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/usuario/${usuarioId}/sistema/historial`)
      .pipe(catchError(this.handleError));
  }
  // ===================== ⚠️ Manejo de errores =====================
  private handleError(error: any) {
    console.error('Error en el servicio de alertas:', error);
    return throwError(() => new Error(error.message || 'Error en la petición HTTP'));
  }
}
