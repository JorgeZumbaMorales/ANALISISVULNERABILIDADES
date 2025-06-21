import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';

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
  vulnerabilidadesDetalle: any[] = [];
  puertoSeleccionado: any = null;
  resumenTecnico: any[] = [];
  cvesSeleccionados: any[] = [];
  dialogoCvesVisible = false;
  busquedaCve: string = '';
  puertoSeleccionadoChip: any = null;
  cargando = false;
  analisisEnProgreso = false;
  analisisFinalizado = false;
  resultadoPersistente = false;
  mensajeErrorAnalisis: string | null = null;

  riesgosDisponiblesFiltrados: number[] = [];
  opcionesExploitFiltradas: boolean[] = [];
  tiposDisponiblesFiltrados: string[] = [];

  constructor(
    private vulnerabilidadServicio: ServiciosAnalisisVulnerabilidades,
    private serviciosDispositivos: ServiciosDispositivos,
    private procesoSegundoPlano: ServiciosSegundoPlano,
    private notificacion: NotificacionService,
    private servicioAlertas: ServiciosAlertas,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.notificacion.success('Bienvenido', 'Sistema iniciado correctamente');
    this.cargarDispositivos();
    this.recuperarDatosLocales();
    this.verificarProcesoEnSegundoPlano();
  }

  private cargarDispositivos(): void {
    this.serviciosDispositivos.listarDispositivosCompleto().subscribe({
      next: ({ data }) => {
        this.dispositivos = data || [];
        const guardado = localStorage.getItem('dispositivoSeleccionado');
        if (guardado) {
          const temp = JSON.parse(guardado);
          this.dispositivoSeleccionado = this.dispositivos.find(d => d.dispositivo_id === temp.dispositivo_id);
        }
      },
      error: () => this.notificacion.error('No se pudieron cargar los dispositivos')
    });
  }

  private recuperarDatosLocales(): void {
    const datos = localStorage.getItem('vulnerabilidadesDetalle');
    const resumen = localStorage.getItem('resumenesPorPuerto');

    if (datos) {
      this.vulnerabilidadesDetalle = JSON.parse(datos);
      this.resultadoPersistente = true;
      this.analisisFinalizado = true;
    }

    if (resumen) this.resumenTecnico = JSON.parse(resumen);

    if (this.vulnerabilidadesDetalle.length > 0) {
      this.puertoSeleccionado = this.vulnerabilidadesDetalle[0];
      this.actualizarFiltrosPorPuerto();
    }
  }

  private verificarProcesoEnSegundoPlano(): void {
    this.procesoSegundoPlano.reanudarSiEsNecesario(
      'analisisEnProgreso',
      3000,
      () => this.vulnerabilidadServicio.obtenerEstadoAnalisisAvanzado(),
      () => this.vulnerabilidadServicio.obtenerResultadoUltimoAnalisis().subscribe({
        next: resultado => this.procesarResultadoAnalisis(resultado),
        error: () => this.terminarConError('Error al recuperar vulnerabilidades')
      }),
      mensajeError => this.terminarConError(mensajeError ?? 'Error desconocido')

    );
  }

  escanearDispositivo(): void {
    if (!this.dispositivoSeleccionado) {
      this.notificacion.error('Selecciona un dispositivo antes de escanear');
      return;
    }

    this.limpiarResultado();
    this.analisisEnProgreso = true;
    this.cargando = true;

    const datos = {
      dispositivo_id: this.dispositivoSeleccionado.dispositivo_id,
      mac_address: this.dispositivoSeleccionado.mac_address,
      ip_actual: this.dispositivoSeleccionado.ultima_ip
    };

    this.vulnerabilidadServicio.ejecutarEscaneoAvanzado(datos).subscribe({
      next: ({ mensaje }) => {
        this.notificacion.success(mensaje || 'Análisis iniciado correctamente');
        localStorage.setItem('dispositivoSeleccionado', JSON.stringify(this.dispositivoSeleccionado));

        this.procesoSegundoPlano.iniciarProcesoConPolling(
          'analisisEnProgreso',
          3000,
          () => this.vulnerabilidadServicio.obtenerEstadoAnalisisAvanzado(),
          () => this.vulnerabilidadServicio.obtenerResultadoUltimoAnalisis().subscribe({
            next: resultado => this.procesarResultadoAnalisis(resultado),
            error: () => this.terminarConError('Error al obtener resultado del análisis')
          }),
          mensajeError => this.terminarConError(mensajeError ?? 'Error durante el análisis')

        );
      },
      error: () => this.terminarConError('No se pudo iniciar el análisis')
    });
  }

  private terminarConError(mensaje: string): void {
    this.notificacion.error(mensaje);
    this.analisisEnProgreso = false;
    this.cargando = false;
    localStorage.removeItem('analisisEnProgreso');
  }

  private procesarResultadoAnalisis(resultado: any): void {
    this.vulnerabilidadesDetalle = resultado.vulnerabilidades || [];
    this.resumenTecnico = resultado.resumenes_por_puerto || [];

    if (!resultado.dispositivo_activo) {
      this.mensajeErrorAnalisis = resultado.mensaje || 'El dispositivo ya no está activo en la red.';
      this.notificacion.warning('Advertencia', this.mensajeErrorAnalisis ?? 'Mensaje no disponible');

    }

    this.resultadoPersistente = true;
    this.analisisFinalizado = true;
    this.analisisEnProgreso = false;
    this.cargando = false;

    localStorage.setItem('vulnerabilidadesDetalle', JSON.stringify(this.vulnerabilidadesDetalle));
    localStorage.removeItem('analisisEnProgreso');
  }

  limpiarResultado(): void {
    this.vulnerabilidadesDetalle = [];
    this.resumenTecnico = [];
    this.puertoSeleccionado = null;
    this.mensajeErrorAnalisis = null;
    this.resultadoPersistente = false;
    this.analisisFinalizado = false;
    this.analisisEnProgreso = false;

    localStorage.removeItem('vulnerabilidadesDetalle');
    localStorage.removeItem('resumenesPorPuerto');
    localStorage.removeItem('analisisEnProgreso');
  }

  generarResumenTecnico(): void {
  if (!this.dispositivoSeleccionado) {
    this.notificacion.error('Selecciona un dispositivo antes de generar el resumen');
    return;
  }

  const id = this.dispositivoSeleccionado.dispositivo_id;
  this.notificacion.info('Generando resumen técnico...', 'Procesando');

  this.vulnerabilidadServicio.generarResumenPorDispositivo(id).subscribe({
    next: ({ data }) => {
      this.resumenTecnico = data || [];

      // Limpieza previa de selecciones
      this.puertoSeleccionado = null;
      this.puertoSeleccionadoChip = null;

      // Seleccionamos automáticamente el primer resumen (si hay)
      if (this.resumenTecnico.length > 0) {
        this.puertoSeleccionado = this.resumenTecnico[0];
        this.puertoSeleccionadoChip = this.resumenTecnico[0];
      } else {
        this.notificacion.warning('No se generaron resúmenes. Verifica si hay vulnerabilidades.');
      }
    },
    error: () => this.notificacion.error('Ocurrió un error al generar el resumen técnico')
  });
}


  consultarResultadoAnterior(): void {
    if (!this.dispositivoSeleccionado) {
      this.notificacion.error('Selecciona un dispositivo para consultar vulnerabilidades.');
      return;
    }

    const id = this.dispositivoSeleccionado.dispositivo_id;
    this.vulnerabilidadServicio.obtenerVulnerabilidadesPorDispositivo(id).subscribe({
      next: resultado => {
        localStorage.setItem('dispositivoSeleccionado', JSON.stringify(this.dispositivoSeleccionado));
        this.procesarResultadoAnalisis(resultado);
      },
      error: () => this.notificacion.error('Error al consultar vulnerabilidades anteriores')
    });
  }

  actualizarFiltrosPorPuerto(): void {
  const vuls: any[] = this.puertoSeleccionado?.vulnerabilidades ?? [];

  this.riesgosDisponiblesFiltrados = Array.from(
    new Set<number>(vuls.map((v: any) => Number(v.score)))
  ).sort((a, b) => b - a);

  this.opcionesExploitFiltradas = Array.from(
    new Set<boolean>(vuls.map((v: any) => Boolean(v.exploit)))
  );

  this.tiposDisponiblesFiltrados = Array.from(
    new Set<string>(
      vuls
        .map((v: any) => (typeof v.tipo === 'string' ? v.tipo.trim() : undefined))
        .filter((t): t is string => typeof t === 'string' && t.length > 0)
    )
  );
}




  onChangeDispositivo(): void {
    if (this.dispositivoSeleccionado) {
      localStorage.setItem('dispositivoSeleccionado', JSON.stringify(this.dispositivoSeleccionado));
    }
  }

  abrirModalCves(resumen: any): void {
    if (resumen.vulnerabilidades?.length > 0) {
      this.cvesSeleccionados = resumen.vulnerabilidades;
      this.dialogoCvesVisible = true;
    } else {
      this.notificacion.info('Este puerto no tiene CVEs relacionados.');
    }
  }

  getColor(score: number): string {
    if (score >= 9.0) return 'text-red-600 font-semibold';
    if (score >= 7.0) return 'text-yellow-600 font-semibold';
    if (score >= 4.0) return 'text-orange-500 font-medium';
    return 'text-green-600 font-medium';
  }
  actualizarPuertoSeleccionado(puerto: any): void {
  this.puertoSeleccionado = puerto;
  this.actualizarFiltrosPorPuerto();
}


}
