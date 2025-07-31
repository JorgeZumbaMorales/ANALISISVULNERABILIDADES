import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ServiciosAnalisisVulnerabilidades {
  private apiUrlRecomendaciones = `${environment.apiUrl}/recomendaciones`;
  private apiUrlPuertos = `${environment.apiUrl}/puertos_abiertos`;
  private apiUrlVulnerabilidades = `${environment.apiUrl}/vulnerabilidades`;
  private apiUrlEscaneoAvanzado = `${environment.apiUrl}/escaneo_avanzado`;
  private apiUrlResumenCVEs = `${environment.apiUrl}/resumen_cves`;
  private apiUrlPuertoVulnerabilidad = `${environment.apiUrl}/puerto_vulnerabilidad`;
  private apiUrlEvaluacionRiesgo = `${environment.apiUrl}/evaluacion_riesgo`;

  constructor(private http: HttpClient) { }




  generarRecomendacionPorPuerto(puertoId: number): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrlRecomendaciones}/generar_por_puerto/${puertoId}`,
      {},
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).pipe(catchError(this.handleError));
  }

 
  generarRecomendacionesPorDispositivo(dispositivoId: number): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrlRecomendaciones}/generar_por_dispositivo/${dispositivoId}`,
      {},
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).pipe(catchError(this.handleError));
  }

 
  generarRecomendacionesPorPuertosSeleccionados(puertosIds: number[]): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrlRecomendaciones}/generar_por_puertos_seleccionados`,
      { puertos_ids: puertosIds },
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).pipe(catchError(this.handleError));
  }




  obtenerRecomendacionesPorPuertos(puertosIds: number[]): Observable<any> {

    return this.http.post<any>(
      `${this.apiUrlPuertos}/ver_recomendaciones`,
      { puertos_ids: puertosIds },
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).pipe(catchError(this.handleError));
  }


  evaluarRiesgoTodosDispositivos(): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrlEvaluacionRiesgo}/evaluar_todos`,
      null,
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).pipe(catchError(this.handleError));
  }

  obtenerResultadoUltimoRiesgo(): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrlEvaluacionRiesgo}/resultado_ultimo_riesgo`,
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).pipe(catchError(this.handleError));
  }

  obtenerEstadoEvaluacionRiesgo(): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrlEvaluacionRiesgo}/estado_evaluacion_riesgo`,
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).pipe(catchError(this.handleError));
  }

  cancelarEvaluacionRiesgo(): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrlEvaluacionRiesgo}/cancelar_evaluacion`,
      {},
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).pipe(catchError(this.handleError));
  }

  limpiarResultadoEvaluacionRiesgo(): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrlEvaluacionRiesgo}/limpiar_resultado_ultimo_riesgo`,
      {},
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).pipe(catchError(this.handleError));
  }
  
  ejecutarEscaneoRapido(): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrlEscaneoAvanzado}/escaneo_rapido`,
      {},
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).pipe(catchError(this.handleError));
  }

  cancelarEscaneoRapido(): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrlEscaneoAvanzado}/cancelar_escaneo_rapido`,
      {},
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).pipe(catchError(this.handleError));
  }

  obtenerEstadoEscaneoRapido(): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrlEscaneoAvanzado}/estado_escaneo_rapido`,
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).pipe(catchError(this.handleError));
  }


  obtenerVulnerabilidadesCompletas(): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrlVulnerabilidades}/listar_vulnerabilidades_completo`,
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).pipe(catchError(this.handleError));
  }

  obtenerVulnerabilidadesPorDispositivo(dispositivoId: number): Observable<any> {

    return this.http.get<any>(
      `${this.apiUrlVulnerabilidades}/ver_vulnerabilidades_por_dispositivo/${dispositivoId}`,
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).pipe(catchError(this.handleError));
  }




  ejecutarEscaneoAvanzado(datos: { dispositivo_id: number, mac_address: string, ip_actual: string }): Observable<any> {

    return this.http.post<any>(
      `${this.apiUrlEscaneoAvanzado}/analisis_avanzado`,
      datos,
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).pipe(catchError(this.handleError));
  }

  obtenerEstadoAnalisisAvanzado(): Observable<any> {
    return this.http.get<any>(`${this.apiUrlEscaneoAvanzado}/estado_analisis_avanzado`)
      .pipe(catchError(this.handleError));
  }

  obtenerResultadoUltimoAnalisis(): Observable<any> {
    return this.http.get<any>(`${this.apiUrlEscaneoAvanzado}/resultado_ultimo_analisis`)
      .pipe(catchError(this.handleError));
  }

  ejecutarEscaneoManual(): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrlEscaneoAvanzado}/manual`,
      {},
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).pipe(catchError(this.handleError));
  }


  obtenerProgresoEscaneo(): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrlEscaneoAvanzado}/progreso_escaneo`,
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).pipe(catchError(this.handleError));
  }


  obtenerEstadoEscaneo(): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrlEscaneoAvanzado}/estado_escaneo`,
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).pipe(catchError(this.handleError));
  }
 
  cancelarEscaneoManual(): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrlEscaneoAvanzado}/cancelar_escaneo`,
      {},
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).pipe(catchError(this.handleError));
  }

  obtenerResumenPorFecha(data: { dispositivo_id: number, fecha: string }): Observable<any> {


    return this.http.post<any>(
      `${this.apiUrlResumenCVEs}/resumen_por_dispositivo_y_fecha`,
      data,
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).pipe(

      tap((res) => console.log('✅ Respuesta recibida del resumen_por_dispositivo_y_fecha:', res)),
      catchError(this.handleError)
    );
  }


  obtenerVulnerabilidadesPorFecha(data: { dispositivo_id: number, fecha: string }): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrlPuertoVulnerabilidad}/listar_por_dispositivo_y_fecha`,
      data,
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).pipe(catchError(this.handleError));
  }


  obtenerHistorialFechasPorDispositivo(dispositivoId: number): Observable<any> {
    const url = `${environment.apiUrl}/puerto_vulnerabilidad/historial_fechas/${dispositivoId}`;
    return this.http.get<any>(
      url,
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).pipe(catchError(this.handleError));
  }

  generarResumenPorDispositivo(dispositivoId: number): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrlResumenCVEs}/generar_resumen_dispositivo/${dispositivoId}`,
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).pipe(catchError(this.handleError));
  }

  consultarResumenesYCvesPorDispositivo(dispositivoId: number): Observable<any> {
    const url = `${this.apiUrlVulnerabilidades}/consultar_resumenes_y_cves/${dispositivoId}`;
    return this.http.get<any>(
      url,
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).pipe(catchError(this.handleError));
  }

  cancelarAnalisisAvanzado(): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrlEscaneoAvanzado}/cancelar_analisis_avanzado`,
      {},
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).pipe(catchError(this.handleError));
  }





  evaluarRiesgoDispositivoIndividual(datos: { ip: string, mac: string }): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrlEvaluacionRiesgo}/evaluar_dispositivo`,
      datos,
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).pipe(catchError(this.handleError));
  }


  obtenerEstadoEvaluacionIndividual(): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrlEvaluacionRiesgo}/estado_individual`,
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).pipe(catchError(this.handleError));
  }

  obtenerResultadoEvaluacionIndividual(): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrlEvaluacionRiesgo}/resultado_individual`,
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).pipe(catchError(this.handleError));
  }


  cancelarEvaluacionIndividual(): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrlEvaluacionRiesgo}/cancelar_individual`,
      {},
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).pipe(catchError(this.handleError));
  }


  limpiarResultadoEvaluacionIndividual(): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrlEvaluacionRiesgo}/limpiar_individual`,
      {},
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).pipe(catchError(this.handleError));
  }


  private handleError(error: any) {
    console.error('Error en la petición:', error);
    return throwError(() => new Error(error.message || 'Error en el servicio de análisis de vulnerabilidades'));
  }



}
