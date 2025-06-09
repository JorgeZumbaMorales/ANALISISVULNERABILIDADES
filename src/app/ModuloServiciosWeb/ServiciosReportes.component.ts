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

  // ===================== ⚠️ Manejo de errores =====================

  private handleError(error: any) {
    console.error('Error en el servicio de reportes:', error);
    return throwError(() => new Error(error.message || 'Error en la petición HTTP'));
  }

}

