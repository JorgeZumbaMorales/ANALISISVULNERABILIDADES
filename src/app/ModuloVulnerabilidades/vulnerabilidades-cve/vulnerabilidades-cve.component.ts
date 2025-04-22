import { Component, ViewChild, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { ServiciosAnalisisVulnerabilidades } from '../../ModuloServiciosWeb/ServiciosAnalisisVulnerabilidades.component';
import { ServiciosDispositivos } from '../../ModuloServiciosWeb/ServiciosDispositivos.component';

@Component({
  selector: 'app-vulnerabilidades-cve',
  templateUrl: './vulnerabilidades-cve.component.html',
  styleUrls: ['./vulnerabilidades-cve.component.css'],
  providers: [MessageService]
})
export class VulnerabilidadesCveComponent implements OnInit {
  dispositivos: any[] = [];
  dispositivoSeleccionado: any = null;
  resumenCves: any[] = [];
  vulnerabilidadesDetalle: any[] = [];
  puertoSeleccionado: any = null;
  cargando = false;
  mostrarResumen = false;
  dialogoVisible = false;
  historialVisible = false;
  cargandoHistorial = false;
  historialFechas: { fecha: Date }[] = [];
  historialFechasFiltradas: { fecha: Date }[] = [];
  filtroRangoFechas: Date[] = [];
  riesgosDisponiblesFiltrados: number[] = [];
  opcionesExploitFiltradas: boolean[] = [];
  tiposDisponiblesFiltrados: string[] = [];
  resumenDesdeHistorial = false;
  fechaSeleccionadaDesdeHistorial: string | null = null;

  @ViewChild('tablaVulnerabilidades') tablaVulnerabilidades!: Table;

  constructor(
    private vulnerabilidadServicio: ServiciosAnalisisVulnerabilidades,
    private serviciosDispositivos: ServiciosDispositivos,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.serviciosDispositivos.listarDispositivosCompleto().subscribe({
      next: ({ data }) => this.dispositivos = data || [],
      error: () => this.mostrarError('No se pudieron cargar los dispositivos')
    });
  }

  escanearDispositivo(): void {
    if (!this.dispositivoSeleccionado) return;
    this.cargando = true;
    this.mostrarResumen = false;

    const { dispositivo_id, mac_address, ultima_ip } = this.dispositivoSeleccionado;

    this.vulnerabilidadServicio.ejecutarEscaneoAvanzado({ dispositivo_id, mac_address, ip_actual: ultima_ip })
      .subscribe({
        next: ({ resumen_cves }) => {
          this.resumenCves = resumen_cves;
          this.mostrarResumen = true;
          this.consultarVulnerabilidades(() => this.dialogoVisible = true);
          this.mostrarMensaje('success', 'Escaneo exitoso', 'El resumen ha sido generado.');
        },
        error: () => this.mostrarError('Error al escanear'),
        complete: () => this.cargando = false
      });
  }

  verDetalle(): void {
    if (this.resumenDesdeHistorial && this.fechaSeleccionadaDesdeHistorial) {
      const payload = {
        dispositivo_id: this.dispositivoSeleccionado.dispositivo_id,
        fecha: this.fechaSeleccionadaDesdeHistorial
      };
  
      this.vulnerabilidadServicio.obtenerVulnerabilidadesPorFecha(payload).subscribe({
        next: (response) => {
          console.log('✅ Datos recibidos del backend:', response);
          const datosReales = this.extraerDatosArray(response);
          this.manejarVulnerabilidades(datosReales);
        },
        error: () => this.mostrarError('Error al cargar vulnerabilidades por fecha')
      });
    } else {
      if (!this.validarDatos(this.vulnerabilidadesDetalle)) {
        this.mostrarError('No hay detalles para mostrar');
        return;
      }
      this.dialogoVisible = true;
      this.actualizarFiltrosPorPuerto();
    }
  }
  
  
  consultarEscaneoPorFecha(fecha: Date): void {
    const fechaFormateada = `${fecha.getFullYear()}-${(fecha.getMonth() + 1).toString().padStart(2, '0')}-${fecha.getDate().toString().padStart(2, '0')} ${fecha.getHours().toString().padStart(2, '0')}:${fecha.getMinutes().toString().padStart(2, '0')}:${fecha.getSeconds().toString().padStart(2, '0')}`;
    const payload = { dispositivo_id: this.dispositivoSeleccionado.dispositivo_id, fecha: fechaFormateada };

    this.fechaSeleccionadaDesdeHistorial = fechaFormateada;
    this.resumenDesdeHistorial = true;

    this.vulnerabilidadServicio.obtenerResumenPorFecha(payload).subscribe({
      next: ({ resumen_cves }) => {
        this.resumenCves = resumen_cves;
        this.mostrarResumen = true;
        this.historialVisible = false;
        this.mostrarMensaje('success', 'Resumen cargado', 'Resumen generado para fecha seleccionada.');
      },
      error: () => this.mostrarError('Error al generar resumen por fecha')
    });
  }

  consultarVulnerabilidades(onSuccess?: () => void): void {
    this.vulnerabilidadServicio.obtenerVulnerabilidadesPorDispositivo(this.dispositivoSeleccionado.dispositivo_id).subscribe({
      next: (response) => {
        const datosReales = this.extraerDatosArray(response);
        this.manejarVulnerabilidades(datosReales, onSuccess);
      },
      error: () => this.mostrarError('Error al obtener detalles')
    });
  }
  

  manejarVulnerabilidades(data: any[], onSuccess?: () => void): void {
    this.vulnerabilidadesDetalle = data || [];

    if (this.validarDatos(this.vulnerabilidadesDetalle)) {
      this.puertoSeleccionado = this.vulnerabilidadesDetalle[0];
      this.actualizarFiltrosPorPuerto();
      if (onSuccess) onSuccess();
      else this.dialogoVisible = true;
    } else {
      this.mostrarError('No hay detalles para mostrar');
    }
  }

  validarDatos(data: any[]): boolean {
    return Array.isArray(data) &&
      data.length > 0 &&
      Array.isArray(data[0].vulnerabilidades) &&
      data[0].vulnerabilidades.length > 0;
  }

  verHistorialEscaneos(): void {
    if (!this.dispositivoSeleccionado) return;
    this.historialVisible = true;
    this.cargandoHistorial = true;

    this.vulnerabilidadServicio.obtenerHistorialFechasPorDispositivo(this.dispositivoSeleccionado.dispositivo_id).subscribe({
      next: ({ data }) => {
        this.historialFechas = data.map((f: string) => ({ fecha: new Date(f) }));
        this.historialFechasFiltradas = [...this.historialFechas];
      },
      error: () => this.mostrarError('Error al obtener historial'),
      complete: () => this.cargandoHistorial = false
    });
  }

  filtrarHistorialPorRango(): void {
    if (!this.filtroRangoFechas?.length) return;
    const [inicio] = this.filtroRangoFechas;
    const fin = this.filtroRangoFechas[1] || new Date(inicio);
    fin.setHours(23, 59, 59, 999);
    this.historialFechasFiltradas = this.historialFechas.filter(f => f.fecha >= inicio && f.fecha <= fin);
  }

  limpiarFiltroHistorial(): void {
    this.filtroRangoFechas = [];
    this.historialFechasFiltradas = [...this.historialFechas];
  }

  eliminarEscaneoPorFecha(fecha: string): void {
    this.mostrarMensaje('error', 'Eliminar', `Funcionalidad pendiente para eliminar escaneo de ${fecha}`);
  }

  actualizarFiltrosPorPuerto(): void {
    const vuls = this.puertoSeleccionado?.vulnerabilidades || [];
    this.riesgosDisponiblesFiltrados = [...new Set<number>(vuls.map((v: any) => v.score))].sort((a: number, b: number) => b - a);
    this.opcionesExploitFiltradas = [...new Set<boolean>(vuls.map((v: any) => v.exploit))];
    this.tiposDisponiblesFiltrados = [...new Set<string>(
      vuls.map((v: any) => v.tipo).filter((tipo: unknown): tipo is string => typeof tipo === 'string' && tipo.trim() !== '')
    )];
    
    this.tablaVulnerabilidades?.clear();
  }

  getColor(score: number): string {
    if (score >= 9.0) return 'text-red-600 font-semibold';
    if (score >= 7.0) return 'text-yellow-600 font-semibold';
    if (score >= 4.0) return 'text-orange-500 font-medium';
    return 'text-green-600 font-medium';
  }
  private extraerDatosArray(response: any): any[] {
    return response?.data?.data || [];
  }
  
  private mostrarMensaje(tipo: 'success' | 'error', titulo: string, detalle: string): void {
    this.messageService.add({ severity: tipo, summary: titulo, detail: detalle });
  }

  private mostrarError(mensaje: string): void {
    this.mostrarMensaje('error', 'Error', mensaje);
  }
}
