import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ServiciosReportes {

  private apiUrl = `${environment.apiUrl}/reporte_parametros`;
  private apiUrlReportesGenerados = `${environment.apiUrl}/reportes_generados`;
  private apiUrlDashboard = `${environment.apiUrl}/dashboard`;
  constructor(private http: HttpClient) {}

  // ===================== 📄 Reportes con parámetros =====================

  generarPrevisualizacionReporte(filtros: any): Observable<any> {
    console.log('Generando previsualización del reporte con filtros:', filtros);
    return this.http.post<any>(
      `${this.apiUrl}/generar_previsualizacion`,
      filtros,
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }), responseType: 'blob' as 'json' }
    ).pipe(catchError(this.handleError));
  }

  generarYGuardarReporte(datosGuardar: any): Observable<any> {
    console.log('Generando y guardando reporte con datos:', datosGuardar);
    return this.http.post<any>(
      `${this.apiUrl}/generar_y_guardar`,
      datosGuardar,
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).pipe(catchError(this.handleError));
  }

  eliminarReporteGenerado(reporte_id: number): Observable<any> {
  console.log(`Eliminando reporte generado con ID: ${reporte_id}`);
  return this.http.delete<any>(
    `${this.apiUrlReportesGenerados}/eliminar_reporte_generado/${reporte_id}`,
    { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
  ).pipe(catchError(this.handleError));
}

  // ===================== 📋 Reportes Generados =====================

  listarReportesGenerados(): Observable<any> {
    console.log('Consultando lista de reportes generados');
    return this.http.get<any>(
      `${this.apiUrlReportesGenerados}/listar_reportes_generados`,
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).pipe(catchError(this.handleError));
  }
  // ===================== 📊 Dashboard =====================
  // ---- Métricas Totales ----
obtenerMetricasDashboard(): Observable<any> {
  console.log('Consultando métricas totales del dashboard');
  return this.http.get<any>(
    `${this.apiUrlDashboard}/metricas_totales`,
    { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
  ).pipe(catchError(this.handleError));
}

// ---- Listar todos los CVEs ----
listarVulnerabilidadesCVE(): Observable<any> {
  console.log('Consultando lista completa de vulnerabilidades CVE');
  return this.http.get<any>(
    `${this.apiUrlDashboard}/lista_cves`,
    { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
  ).pipe(catchError(this.handleError));
}

// ---- Estado de Dispositivos ----
obtenerEstadoDispositivos(): Observable<any> {
  console.log('Consultando estado de dispositivos del dashboard');
  return this.http.get<any>(
    `${this.apiUrlDashboard}/estado_dispositivos`,
    { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
  ).pipe(catchError(this.handleError));
}

// ---- Escaneos por Fecha ----
obtenerEscaneosPorFecha(filtro: string = 'ultimo_mes'): Observable<any> {
  console.log(`Consultando escaneos por fecha con filtro: ${filtro}`);
  return this.http.get<any>(
    `${this.apiUrlDashboard}/escaneos_por_fecha?filtro=${filtro}`,
    { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
  ).pipe(catchError(this.handleError));
}

// ---- Puertos más comunes ----
obtenerPuertosMasComunes(limite: number = 10, filtro: string = 'ultimo_mes'): Observable<any> {
  console.log(`Consultando puertos más comunes (limite: ${limite}, filtro: ${filtro})`);
  return this.http.get<any>(
    `${this.apiUrlDashboard}/puertos_mas_comunes?limite=${limite}&filtro=${filtro}`,
    { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
  ).pipe(catchError(this.handleError));
}

// ---- Vulnerabilidades más frecuentes ----
obtenerVulnerabilidadesMasFrecuentes(limite: number = 10, filtro: string = 'ultimo_mes', tipo: string | null = null): Observable<any> {
  console.log(`Consultando vulnerabilidades más frecuentes (limite: ${limite}, filtro: ${filtro}, tipo: ${tipo})`);
  let url = `${this.apiUrlDashboard}/vulnerabilidades_mas_frecuentes?limite=${limite}&filtro=${filtro}`;
  if (tipo) {
    url += `&tipo=${encodeURIComponent(tipo)}`;
  }
  return this.http.get<any>(
    url,
    { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
  ).pipe(catchError(this.handleError));
}

// ---- Dispositivos con más CVEs ----
obtenerDispositivosConMasCVEs(limite: number = 10, filtro: string = 'ultimo_mes'): Observable<any> {
  console.log(`Consultando dispositivos con más CVEs (limite: ${limite}, filtro: ${filtro})`);
  return this.http.get<any>(
    `${this.apiUrlDashboard}/dispositivos_con_mas_cves?limite=${limite}&filtro=${filtro}`,
    { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
  ).pipe(catchError(this.handleError));
}

// ---- Nivel de Riesgo ----
obtenerNivelRiesgo(): Observable<any> {
  console.log('Consultando nivel de riesgo del dashboard');
  return this.http.get<any>(
    `${this.apiUrlDashboard}/nivel_riesgo`,
    { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
  ).pipe(catchError(this.handleError));
}


  // ===================== ⚠️ Manejo de errores =====================

  private handleError(error: any) {
    console.error('Error en el servicio de reportes:', error);
    return throwError(() => new Error(error.message || 'Error en la petición HTTP'));
  }

}

