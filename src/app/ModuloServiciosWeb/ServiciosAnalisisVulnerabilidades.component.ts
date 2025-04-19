import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ServiciosAnalisisVulnerabilidades {
  private apiUrlRecomendaciones = `${environment.apiUrl}/recomendaciones`;
  private apiUrlPuertos = `${environment.apiUrl}/puertos_abiertos`;
  private apiUrlVulnerabilidades = `${environment.apiUrl}/vulnerabilidades`; // ✅ Añadido
  private apiUrlEscaneoAvanzado = `${environment.apiUrl}/escaneo_avanzado`;

  constructor(private http: HttpClient) {}

  // ===================== GENERAR RECOMENDACIONES =====================

  /**
   * 📌 Genera una recomendación para un **puerto específico**.
   * @param puertoId ID del puerto
   * @returns Observable con el resultado de la petición
   */
  generarRecomendacionPorPuerto(puertoId: number): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrlRecomendaciones}/generar_por_puerto/${puertoId}`,
      {},
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).pipe(catchError(this.handleError));
  }

  /**
   * 📌 Genera recomendaciones para **todos los puertos de un dispositivo**.
   * @param dispositivoId ID del dispositivo
   * @returns Observable con el resultado de la petición
   */
  generarRecomendacionesPorDispositivo(dispositivoId: number): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrlRecomendaciones}/generar_por_dispositivo/${dispositivoId}`,
      {},
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).pipe(catchError(this.handleError));
  }

  /**
   * 📌 Genera recomendaciones **solo para los puertos seleccionados**.
   * @param puertosIds Lista de IDs de los puertos seleccionados
   * @returns Observable con el resultado de la petición
   */
  generarRecomendacionesPorPuertosSeleccionados(puertosIds: number[]): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrlRecomendaciones}/generar_por_puertos_seleccionados`,
      { puertos_ids: puertosIds },
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).pipe(catchError(this.handleError));
  }

  // ===================== OBTENER RECOMENDACIONES =====================

  /**
   * 📌 Obtiene recomendaciones **solo para los puertos seleccionados**.
   * @param puertosIds Lista de IDs de los puertos seleccionados
   * @returns Observable con la información de las recomendaciones
   */
  obtenerRecomendacionesPorPuertos(puertosIds: number[]): Observable<any> {
    console.log("puertosIds", puertosIds);
    return this.http.post<any>(
      `${this.apiUrlPuertos}/ver_recomendaciones`,
      { puertos_ids: puertosIds }, // Enviamos un objeto con la lista de puertos
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).pipe(catchError(this.handleError));
  }
    // ===================== VULNERABILIDADES =====================

  /**
   * 📌 Obtiene el listado completo de vulnerabilidades agrupadas por dispositivo y puerto.
   * @returns Observable con los datos estructurados de vulnerabilidades
   */
  obtenerVulnerabilidadesCompletas(): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrlVulnerabilidades}/listar_vulnerabilidades_completo`,
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).pipe(catchError(this.handleError));
  }
  /**
 * 📌 Obtiene las vulnerabilidades asociadas a un dispositivo específico.
 * @param dispositivoId ID del dispositivo
 * @returns Observable con los datos de vulnerabilidades agrupados por puerto
 */
  obtenerVulnerabilidadesPorDispositivo(dispositivoId: number): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrlVulnerabilidades}/ver_vulnerabilidades_por_dispositivo/${dispositivoId}`,
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).pipe(catchError(this.handleError));
  }

        // ===================== ESCANEO + IA =====================

    /**
   * 📌 Ejecuta un escaneo avanzado (IP + Nmap + limpieza + guardar + resumen CVEs)
   * @param datos Objeto con dispositivo_id, mac_address e ip_actual
   * @returns Observable con la IP escaneada y los resúmenes generados
   */
    ejecutarEscaneoAvanzado(datos: { dispositivo_id: number, mac_address: string, ip_actual: string }): Observable<any> {
      return this.http.post<any>(
        `${this.apiUrlEscaneoAvanzado}/analisis_avanzado`,
        datos,
        { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
      ).pipe(catchError(this.handleError));
    }
  


  // ===================== MANEJO DE ERRORES =====================
  private handleError(error: any) {
    console.error('Error en la petición:', error);
    return throwError(() => new Error(error.message || 'Error en el servicio de análisis de vulnerabilidades'));
  }



}
