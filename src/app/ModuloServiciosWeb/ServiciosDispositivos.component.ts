import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ServiciosDispositivos {
  private apiUrlDispositivos = `${environment.apiUrl}/dispositivos`;

  constructor(private http: HttpClient) {}

  // ===================== DISPOSITIVOS =====================

  listarDispositivos(): Observable<any> {
    return this.http.get<any>(`${this.apiUrlDispositivos}/listar_dispositivos`)
      .pipe(catchError(this.handleError));
  }
  listarDispositivosCompleto(): Observable<any> {
    return this.http.get<any>(`${this.apiUrlDispositivos}/listar_dispositivos_completo`)
      .pipe(catchError(this.handleError));
  }
  listarTodosLosDispositivosCompleto(): Observable<any> {
    return this.http.get<any>(`${this.apiUrlDispositivos}/listar_todos_los_dispositivos_completo`)
      .pipe(catchError(this.handleError));
  }
  crearDispositivo(dispositivo: any): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrlDispositivos}/crear_dispositivo`, 
      dispositivo, 
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).pipe(catchError(this.handleError));
  }

  actualizarDispositivo(dispositivoId: number, dispositivo: any): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrlDispositivos}/actualizar_dispositivo/${dispositivoId}`, 
      dispositivo
    ).pipe(catchError(this.handleError));
  }

  actualizarEstadoDispositivo(dispositivoId: number, estado: boolean): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrlDispositivos}/actualizar_estado_dispositivo/${dispositivoId}`, 
      { estado }
    ).pipe(catchError(this.handleError));
  }

  eliminarDispositivo(dispositivoId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrlDispositivos}/eliminar_dispositivo/${dispositivoId}`)
      .pipe(catchError(this.handleError));
  }

  // ===================== IP ASIGNACIONES =====================

  /**
   * Asignar una nueva IP a un dispositivo
   * @param ipAsignacion Objeto con dispositivo_id e ip_address
   */
  asignarIp(ipAsignacion: { dispositivo_id: number, ip_address: string }): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrlDispositivos}/asignar_ip`, 
      ipAsignacion, 
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).pipe(catchError(this.handleError));
  }

  /**
   * Obtener historial de IPs de un dispositivo
   * @param dispositivoId ID del dispositivo
   */
  obtenerHistorialIps(dispositivoId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrlDispositivos}/historial_ips/${dispositivoId}`)
      .pipe(catchError(this.handleError));
  }

  // ===================== MANEJO DE ERRORES =====================
  private handleError(error: any) {
    console.error('Error en la petición:', error);
    return throwError(() => new Error(error.message || 'Error en el servicio de dispositivos'));
  }
}
