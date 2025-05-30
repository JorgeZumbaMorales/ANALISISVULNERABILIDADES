import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ServiciosConfiguracion {
  private apiUrlConfiguraciones = `${environment.apiUrl}/configuracion_escaneos`;
  private apiUrlEscaneoAvanzado = `${environment.apiUrl}/escaneo_avanzado`;
  constructor(private http: HttpClient) {}

  // ===================== CONFIGURACIONES DE ESCANEO =====================

  /**
   * Listar todas las configuraciones de escaneo.
   */
  listarConfiguraciones(): Observable<any> {
    return this.http.get<any>(`${this.apiUrlConfiguraciones}/listar_configuraciones_escaneo`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Listar solo las configuraciones de escaneo con frecuencia (cada X minutos).
   */
  listarConfiguracionesFrecuencia(): Observable<any> {
    return this.http.get<any>(`${this.apiUrlConfiguraciones}/listar_configuraciones_frecuencia`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Listar solo las configuraciones de escaneo con horas específicas.
   */
  listarConfiguracionesHoras(): Observable<any> {
    return this.http.get<any>(`${this.apiUrlConfiguraciones}/listar_configuraciones_horas`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Obtener una configuración específica por su ID.
   * @param configuracionId ID de la configuración.
   */
  obtenerConfiguracion(configuracionId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrlConfiguraciones}/obtener_configuracion_escaneo/${configuracionId}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Crear una nueva configuración de escaneo.
   * @param configuracion Datos de la configuración a crear.
   */
  crearConfiguracion(configuracion: any): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrlConfiguraciones}/crear_configuracion_escaneo`, 
      configuracion, 
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).pipe(catchError(this.handleError));
  }

  /**
   * Actualizar una configuración de escaneo existente.
   * @param configuracionId ID de la configuración a actualizar.
   * @param configuracion Datos a actualizar.
   */
  actualizarConfiguracion(configuracionId: number, configuracion: any): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrlConfiguraciones}/actualizar_configuracion_escaneo/${configuracionId}`, 
      configuracion
    ).pipe(catchError(this.handleError));
  }

  /**
   * Activar una configuración de escaneo (desactiva las demás).
   * @param configuracionId ID de la configuración a activar.
   */
  activarConfiguracion(configuracionId: number): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrlConfiguraciones}/activar_configuracion/${configuracionId}`, 
      {}
    ).pipe(catchError(this.handleError));
  }

  /**
   * Eliminar una configuración de escaneo.
   * @param configuracionId ID de la configuración a eliminar.
   */
  eliminarConfiguracion(configuracionId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrlConfiguraciones}/eliminar_configuracion_escaneo/${configuracionId}`)
      .pipe(catchError(this.handleError));
  }

  
  // ===================== ESCANEOS =====================

  /**
   * Ejecutar escaneo manual desde el backend
   */
  ejecutarEscaneoManual(usuarioId: number): Observable<any> {
  return this.http.post<any>(
    `${this.apiUrlEscaneoAvanzado}/manual`, 
    { usuario_id: usuarioId }, // 🔁 enviamos el ID
    { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
  ).pipe(catchError(this.handleError));
}
    /**
   * Consultar el estado del escaneo en segundo plano.
   */
  obtenerEstadoEscaneo(): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrlEscaneoAvanzado}/estado_escaneo`
    ).pipe(catchError(this.handleError));
  }

  // ===================== MANEJO DE ERRORES =====================
  private handleError(error: any) {
    console.error('Error en la petición:', error);
    return throwError(() => new Error(error.message || 'Error en el servicio de configuraciones'));
  }
}
