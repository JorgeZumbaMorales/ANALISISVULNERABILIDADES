import { Component, ViewChild, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { ServiciosAnalisisVulnerabilidades } from '../../ModuloServiciosWeb/ServiciosAnalisisVulnerabilidades.component';
import { ServiciosDispositivos } from '../../ModuloServiciosWeb/ServiciosDispositivos.component';
import { ServiciosSegundoPlano } from '../../ModuloServiciosWeb/ServiciosSegundoPlano.service';
import { NotificacionService } from '../../ValidacionesFormularios/notificacion.service';
import { ServiciosAlertas } from '../../ModuloServiciosWeb/ServiciosAlertas.component'; 

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

  analisisEnProgreso = false;

  riesgosDisponiblesFiltrados: number[] = [];
  opcionesExploitFiltradas: boolean[] = [];
  tiposDisponiblesFiltrados: string[] = [];

  @ViewChild('tablaVulnerabilidades') tablaVulnerabilidades!: Table;

  constructor(
    private vulnerabilidadServicio: ServiciosAnalisisVulnerabilidades,
    private serviciosDispositivos: ServiciosDispositivos,
    private messageService: MessageService,
    private procesoSegundoPlano: ServiciosSegundoPlano,
    private notificacion: NotificacionService,
    private servicioAlertas: ServiciosAlertas,
  ) {}

  ngOnInit(): void {
    this.serviciosDispositivos.listarDispositivosCompleto().subscribe({
      next: ({ data }) => this.dispositivos = data || [],
      error: () => this.notificacion.error('No se pudieron cargar los dispositivos')
    });

    this.procesoSegundoPlano.reanudarSiEsNecesario(
      'analisisEnProgreso',
      3000,
      () => this.vulnerabilidadServicio.obtenerEstadoAnalisisAvanzado(),
      () => {
        this.vulnerabilidadServicio.obtenerResultadoUltimoAnalisis().subscribe({
          next: ({ resumen_cves }) => {
            this.resumenCves = resumen_cves;
            this.consultarVulnerabilidades();
            this.analisisEnProgreso = false;
            this.cargando = false;
          },
          error: () => {
           this.notificacion.error('Error al reanudar resumen del análisis');
            this.analisisEnProgreso = false;
            this.cargando = false;
          }
        });
      },
      (mensajeError) => {
       this.notificacion.error(mensajeError || 'Ocurrió un error al reanudar análisis');
        this.analisisEnProgreso = false;
        this.cargando = false;
      }
    );
  }

  escanearDispositivo(): void {
  const dispositivo = this.dispositivoSeleccionado;
  if (!dispositivo) {
    this.notificacion.error('Selecciona un dispositivo antes de escanear');
    return;
  }

  this.analisisEnProgreso = true;
  this.cargando = true;

  const datos = {
    dispositivo_id: dispositivo.dispositivo_id,
    mac_address: dispositivo.mac_address,
    ip_actual: dispositivo.ultima_ip,
  };

  this.vulnerabilidadServicio.ejecutarEscaneoAvanzado(datos).subscribe({
    next: ({ mensaje }) => {
      this.notificacion.success(mensaje || 'Análisis iniciado correctamente');

      this.procesoSegundoPlano.iniciarProcesoConPolling(
        'analisisEnProgreso',
        3000,
        () => this.vulnerabilidadServicio.obtenerEstadoAnalisisAvanzado(),
        () => {
          this.vulnerabilidadServicio.obtenerResultadoUltimoAnalisis().subscribe({
            next: ({ resumen_cves }) => {
              this.resumenCves = resumen_cves;
              this.consultarVulnerabilidades();
              this.analisisEnProgreso = false;
              this.cargando = false;
            },
            error: () => {
              this.notificacion.error('Error al obtener resumen generado');
              this.analisisEnProgreso = false;
              this.cargando = false;
            }
          });
        },
        (mensajeError) => {
          this.notificacion.error(mensajeError || 'Error durante el análisis');
          this.analisisEnProgreso = false;
          this.cargando = false;
          this.crearNotificacionFinalizacion();
        }
      );
    },
    error: () => {
      this.notificacion.error('No se pudo iniciar el análisis');
      this.analisisEnProgreso = false;
      this.cargando = false;
    }
  });
}

  consultarVulnerabilidades(onSuccess?: () => void): void {
    const id = this.dispositivoSeleccionado?.dispositivo_id;
    if (!id) return;

    this.vulnerabilidadServicio.obtenerVulnerabilidadesPorDispositivo(id).subscribe({
      next: ({ data }) => this.manejarVulnerabilidades(data?.data || [], onSuccess),
      error: () => this.notificacion.error('Error al obtener detalles')
    });
  }

  manejarVulnerabilidades(data: any[], onSuccess?: () => void): void {
    this.vulnerabilidadesDetalle = data || [];
    if (this.hayVulnerabilidades(this.vulnerabilidadesDetalle)) {
      this.puertoSeleccionado = this.vulnerabilidadesDetalle[0];
      this.actualizarFiltrosPorPuerto();
      onSuccess?.();

    } else {
      this.notificacion.error('No hay detalles para mostrar');
    }
  }

  actualizarFiltrosPorPuerto(): void {
  type Vulnerabilidad = { score: number; exploit: boolean; tipo?: string };

  const vuls: Vulnerabilidad[] = this.puertoSeleccionado?.vulnerabilidades || [];

  this.riesgosDisponiblesFiltrados = [...new Set(vuls.map((v: Vulnerabilidad) => Number(v.score)))]
    .sort((a: number, b: number) => b - a);

  this.opcionesExploitFiltradas = [...new Set(vuls.map((v: Vulnerabilidad) => Boolean(v.exploit)))];

  this.tiposDisponiblesFiltrados = [
    ...new Set(
      vuls
        .map((v: Vulnerabilidad) => (typeof v.tipo === 'string' ? v.tipo.trim() : ''))
        .filter((t: string): t is string => !!t)
    )
  ];

  this.tablaVulnerabilidades?.clear();
}


  hayVulnerabilidades(data: any[]): boolean {
    return Array.isArray(data) &&
           data.length > 0 &&
           Array.isArray(data[0].vulnerabilidades) &&
           data[0].vulnerabilidades.length > 0;
  }

  getColor(score: number): string {
    if (score >= 9.0) return 'text-red-600 font-semibold';
    if (score >= 7.0) return 'text-yellow-600 font-semibold';
    if (score >= 4.0) return 'text-orange-500 font-medium';
    return 'text-green-600 font-medium';
  }

 private crearNotificacionFinalizacion(): void {
  const usuario_id = JSON.parse(localStorage.getItem('usuario') || '{}')?.usuario_id;
  if (!usuario_id) return;

  const notificacion = {
    mensaje_notificacion: "Análisis de vulnerabilidades completado correctamente.",
    tipo_alerta_id: 1, // Informativo
    canal_alerta_id: 1, // Sistema
    usuario_id,
    dispositivo_id: this.dispositivoSeleccionado?.dispositivo_id || null
  };

  this.servicioAlertas.crearNotificacion(notificacion).subscribe({
    next: () => console.log('🔔 Notificación enviada.'),
    error: (err) => console.warn('⚠️ Error al crear notificación:', err)
  });
}
generarResumenTecnico(): void {
  if (!this.dispositivoSeleccionado) {
    this.notificacion.error('Selecciona un dispositivo antes de generar el resumen');
    return;
  }

  console.log('🧠 Generar resumen técnico para:', this.dispositivoSeleccionado.dispositivo_id);
}

}
