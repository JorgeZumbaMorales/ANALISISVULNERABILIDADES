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


  listarConfiguraciones(): Observable<any> {
    return this.http.get<any>(`${this.apiUrlConfiguraciones}/listar_configuraciones_escaneo`)
      .pipe(catchError(this.handleError));
  }


  listarConfiguracionesFrecuencia(): Observable<any> {
    return this.http.get<any>(`${this.apiUrlConfiguraciones}/listar_configuraciones_frecuencia`)
      .pipe(catchError(this.handleError));
  }

  
  listarConfiguracionesHoras(): Observable<any> {
    return this.http.get<any>(`${this.apiUrlConfiguraciones}/listar_configuraciones_horas`)
      .pipe(catchError(this.handleError));
  }

  obtenerConfiguracion(configuracionId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrlConfiguraciones}/obtener_configuracion_escaneo/${configuracionId}`)
      .pipe(catchError(this.handleError));
  }

  crearConfiguracion(configuracion: any): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrlConfiguraciones}/crear_configuracion_escaneo`, 
      configuracion, 
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).pipe(catchError(this.handleError));
  }

 
  actualizarConfiguracion(configuracionId: number, configuracion: any): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrlConfiguraciones}/actualizar_configuracion_escaneo/${configuracionId}`, 
      configuracion
    ).pipe(catchError(this.handleError));
  }

 
  activarConfiguracion(configuracionId: number): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrlConfiguraciones}/activar_configuracion/${configuracionId}`, 
      {}
    ).pipe(catchError(this.handleError));
  }

  eliminarConfiguracion(configuracionId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrlConfiguraciones}/eliminar_configuracion_escaneo/${configuracionId}`)
      .pipe(catchError(this.handleError));
  }

  
  cambiarEstadoConfiguracion(configuracionId: number, estado: boolean): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrlConfiguraciones}/cambiar_estado_configuracion/${configuracionId}`,
      { estado }, 
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).pipe(catchError(this.handleError));
  }


  private handleError(error: any) {
    console.error('Error en la petición:', error);
    return throwError(() => new Error(error.message || 'Error en el servicio de configuraciones'));
  }
}
