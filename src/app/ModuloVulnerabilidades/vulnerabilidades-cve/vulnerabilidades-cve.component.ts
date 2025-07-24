import { Component, OnInit } from '@angular/core';
import { MessageService, PrimeTemplate } from 'primeng/api';
import { SesionUsuarioService } from '../../Seguridad/sesion-usuario.service';
import { NgZone, ChangeDetectorRef } from '@angular/core';
import { ServiciosAnalisisVulnerabilidades } from '../../ModuloServiciosWeb/ServiciosAnalisisVulnerabilidades.component';
import { ServiciosDispositivos } from '../../ModuloServiciosWeb/ServiciosDispositivos.component';
import { ServicioSegundoPlano } from '../../ModuloServiciosWeb/ServiciosSegundoPlano.service';
import { NotificacionService } from '../../ValidacionesFormularios/notificacion.service';
import { ServiciosAlertas } from '../../ModuloServiciosWeb/ServiciosAlertas.component';
import { CanComponentDeactivate } from '../../Seguridad/confirm-deactivate.guard';
import { ConfirmationService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ButtonDirective, Button } from 'primeng/button';
import { IftaLabel } from 'primeng/iftalabel';
import { Select } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor, NgClass } from '@angular/common';
import { ProgressBar } from 'primeng/progressbar';
import { Chip } from 'primeng/chip';
import { Dialog } from 'primeng/dialog';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { Panel } from 'primeng/panel';
import { DividerModule } from 'primeng/divider';

@Component({
  standalone: true,
  selector: 'app-vulnerabilidades-cve',
  templateUrl: './vulnerabilidades-cve.component.html',
  styleUrls: ['./vulnerabilidades-cve.component.css'],
  providers: [MessageService],
  imports: [Toast, ConfirmDialog, PrimeTemplate, DividerModule, ButtonDirective, Panel, IftaLabel, Select, FormsModule, Button, NgIf, ProgressBar, NgFor, Chip, NgClass, Dialog, IconField, InputIcon, InputText, TableModule]
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
  nombreDispositivoAnalizado: string = '';
  ipOriginalAnalizada: string = '';
  macAnalizada: string = '';
  resumenAgrupadoDisponible = false;
  riesgosDisponiblesFiltrados: number[] = [];
  opcionesExploitFiltradas: boolean[] = [];
  tiposDisponiblesFiltrados: string[] = [];
  bloquesResumen: { titulo: string; clave: 'estado' | 'analisis' | 'riesgos' }[] = [
    { titulo: 'Estado del Servicio', clave: 'estado' },
    { titulo: 'Análisis Técnico del Escaneo', clave: 'analisis' },
    { titulo: 'Riesgos Identificados', clave: 'riesgos' }
  ];
  constructor(
    private vulnerabilidadServicio: ServiciosAnalisisVulnerabilidades,
    private serviciosDispositivos: ServiciosDispositivos,
    private procesoSegundoPlano: ServicioSegundoPlano,
    private notificacion: NotificacionService,
    private servicioAlertas: ServiciosAlertas,
    private messageService: MessageService,
    private sesionUsuario: SesionUsuarioService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private confirmService: ConfirmationService,

  ) { }
  ngOnInit(): void {
    this.cargarDispositivos();
    this.recuperarDatosLocales();
    const enProgreso = localStorage.getItem('analisisEnProgreso') === 'true';
    this.analisisEnProgreso = enProgreso;
    if (localStorage.getItem('analisisEnProgreso') === 'activo') {
      this.cargando = true;
      this.analisisEnProgreso = true;
      this.procesoSegundoPlano.iniciar('analisisEnProgreso', {
        intervaloMs: 3000,
        obtenerEstado: () => this.vulnerabilidadServicio.obtenerEstadoAnalisisAvanzado(),
        alIterar: () => this.cdr.detectChanges(),
        alFinalizar: () => {
          this.vulnerabilidadServicio.obtenerResultadoUltimoAnalisis().subscribe({
            next: resultado => {
              this.ngZone.run(() => {
                this.procesarResultadoAnalisis(resultado);
                this.cdr.detectChanges();
              });
            },
            error: () => {
              this.ngZone.run(() => {
                this.terminarConError('Error al recuperar resultado del análisis');
                this.cdr.detectChanges();
              });
            }
          });
        },
        alError: (mensaje) => {
          this.ngZone.run(() => {
            this.terminarConError(mensaje ?? 'Error durante el análisis');
            this.cdr.detectChanges();
          });
        }
      });
    } else {
      this.reanudarSiEstabaFinalizado();
    }

  }
  canDeactivate(): boolean {
    return !this.analisisEnProgreso;
  }

  cancelPendingOperation(): Promise<boolean> {
    return new Promise((resolve) => {
      this.vulnerabilidadServicio.cancelarAnalisisAvanzado().subscribe({
        next: () => {
          this.procesoSegundoPlano.detener('analisisEnProgreso');
          this.analisisEnProgreso = false;
          this.cargando = false;
          localStorage.removeItem('analisisEnProgreso');
          resolve(true);
        },
        error: () => {
          this.notificacion.info('Advertencia', 'No se pudo cancelar el análisis.');
          resolve(false);
        }
      });
    });
  }


  private cargarDispositivos(): void {
    this.serviciosDispositivos.listarDispositivosCompleto().subscribe({
      next: ({ data }) => {
        this.dispositivos = (data || []).map((d: any) => ({
          ...d,
          etiquetaBusqueda: `${d.nombre_dispositivo} — ${d.mac_address} — ${d.ultima_ip}`
        }));
      },
      error: () => this.notificacion.error('No se pudieron cargar los dispositivos')
    });
  }
  private recuperarDatosLocales(): void {
    const datos = localStorage.getItem('vulnerabilidadesDetalle');
    const resumen = localStorage.getItem('resumenesPorPuerto');
    const ipGuardada = localStorage.getItem('ipOriginalAnalizada');
    const macGuardada = localStorage.getItem('macAnalizada');

    if (datos) {
      this.vulnerabilidadesDetalle = JSON.parse(datos);
      this.resultadoPersistente = true;
      this.analisisFinalizado = true;
    }

    if (resumen) {
      this.resumenTecnico = JSON.parse(resumen);
    }

    if (ipGuardada) this.ipOriginalAnalizada = ipGuardada;
    if (macGuardada) this.macAnalizada = macGuardada;
    if (!this.puertoSeleccionado && this.resumenTecnico.length > 0) {
      this.puertoSeleccionado = this.resumenTecnico[0];
      this.puertoSeleccionadoChip = this.resumenTecnico[0];
      this.actualizarFiltrosPorPuerto();
    }
  }
  escanearDispositivo(): void {
    if (!this.dispositivoSeleccionado) {
      this.notificacion.info('No has seleccionado un dispositivo', 'Selecciona un dispositivo antes de escanear');
      return;
    }
    this.limpiarSoloResultado();
    this.analisisEnProgreso = true;
    this.cargando = true;
    localStorage.setItem('analisisEnProgreso', 'true');
    const datos = {
      dispositivo_id: this.dispositivoSeleccionado.dispositivo_id,
      mac_address: this.dispositivoSeleccionado.mac_address,
      ip_actual: this.dispositivoSeleccionado.ultima_ip
    };
    this.vulnerabilidadServicio.ejecutarEscaneoAvanzado(datos).subscribe({
      next: ({ mensaje }) => {
        this.notificacion.success(mensaje || 'Éxito', 'Análisis iniciado correctamente');
        localStorage.setItem('dispositivoSeleccionado', JSON.stringify(this.dispositivoSeleccionado));
        this.procesoSegundoPlano.iniciar('analisisEnProgreso', {
          intervaloMs: 3000,
          obtenerEstado: () => this.vulnerabilidadServicio.obtenerEstadoAnalisisAvanzado(),
          alIterar: () => this.cdr.detectChanges(),
          alFinalizar: () => {
            this.vulnerabilidadServicio.obtenerResultadoUltimoAnalisis().subscribe({
              next: resultado => {
                this.ngZone.run(() => {
                  this.procesarResultadoAnalisis(resultado);

                  this.cdr.detectChanges();
                });
              },
              error: () => {
                this.ngZone.run(() => {
                  this.terminarConError('Error al obtener resultado del análisis');
                  this.cdr.detectChanges();
                });
              }
            });
          },
          alError: (mensaje) => {
            this.ngZone.run(() => {
              this.terminarConError(mensaje ?? 'Error durante el análisis');
              this.cdr.detectChanges();
            });
          }
        });

      },
      error: () => this.terminarConError('No se pudo iniciar el análisis')
    });
  }
  private terminarConError(mensaje: string): void {
    this.ngZone.run(() => {
      this.notificacion.error(mensaje);
      this.analisisEnProgreso = false;
      this.cargando = false;
      localStorage.removeItem('analisisEnProgreso');
    });
  }
  private procesarResultadoAnalisis(resultado: any, esConsultaAnterior: boolean = false): void {

    const dispositivoActivo = resultado?.dispositivo_activo === true;
    const resumenes = resultado?.resumenes_por_puerto || [];
    const vulnerabilidades = resultado?.vulnerabilidades || [];
    const resumenAgrupado = resultado?.resumen_tecnico || '';
    const mensajeError = resultado?.mensaje ?? null;
    const hayResultados = Array.isArray(resumenes) && resumenes.length > 0;
    const esExito = dispositivoActivo && hayResultados;

    if (esExito) {
      this.vulnerabilidadesDetalle = vulnerabilidades;
      this.resumenTecnico = resumenes;
      this.resultadoPersistente = true;
      this.analisisFinalizado = true;
      this.analisisEnProgreso = false;
      this.cargando = false;
      this.mensajeErrorAnalisis = null;
      this.resumenAgrupadoDisponible = false;
      this.ipOriginalAnalizada = resultado?.ip_escaneada || '';
      this.macAnalizada = resultado?.mac_analizada || '';
      localStorage.setItem('vulnerabilidadesDetalle', JSON.stringify(vulnerabilidades));
      localStorage.setItem('resumenesPorPuerto', JSON.stringify(resumenes));
      localStorage.setItem('ipOriginalAnalizada', this.ipOriginalAnalizada);
      localStorage.setItem('macAnalizada', this.macAnalizada);
      localStorage.removeItem('analisisEnProgreso');
      localStorage.removeItem('resumen_tecnico_agrupado');
      if (!this.puertoSeleccionado && resumenes.length > 0) {
        this.puertoSeleccionado = resumenes[0];
        this.puertoSeleccionadoChip = resumenes[0];
      }
      this.actualizarFiltrosPorPuerto();

      if (!esConsultaAnterior) {
        this.messageService.add({
          severity: 'success',
          summary: 'Análisis Finalizado',
          detail: 'El análisis de vulnerabilidades se completó con éxito.',
          life: 6000
        });
        this.crearNotificacionFinalizacion();
      } else {
        this.messageService.add({
          severity: 'info',
          summary: 'Consulta anterior',
          detail: 'Se han cargado los resultados de un análisis anterior.',
          life: 6000
        });
      }

      this.cdr.detectChanges();
      return;
    }

    if (!esExito && resumenAgrupado) {
      this.vulnerabilidadesDetalle = [];
      this.resumenTecnico = [];
      this.resultadoPersistente = true;
      this.analisisFinalizado = true;
      this.analisisEnProgreso = false;
      this.cargando = false;
      this.mensajeErrorAnalisis = null;
      this.resumenAgrupadoDisponible = true;
      this.ipOriginalAnalizada = resultado?.ip_escaneada || '';
      this.macAnalizada = resultado?.mac_analizada || '';
      localStorage.setItem('resumen_tecnico_agrupado', resumenAgrupado);
      localStorage.setItem('ipOriginalAnalizada', this.ipOriginalAnalizada);
      localStorage.setItem('macAnalizada', this.macAnalizada);
      localStorage.removeItem('analisisEnProgreso');
      localStorage.removeItem('vulnerabilidadesDetalle');
      localStorage.removeItem('resumenesPorPuerto');
      this.messageService.add({
        severity: 'info',
        summary: 'Análisis sin puertos abiertos',
        detail: 'No se encontraron puertos abiertos, pero se generó un resumen técnico.',
        life: 6000
      });
      this.crearNotificacionFinalizacion();
      this.cdr.detectChanges();
      return;
    }

    this.vulnerabilidadesDetalle = [];
    this.resumenTecnico = [];
    this.resultadoPersistente = false;
    this.analisisFinalizado = true;
    this.analisisEnProgreso = false;
    this.cargando = false;
    this.resumenAgrupadoDisponible = false;
    const fueCancelado = mensajeError?.toLowerCase().includes('cancelado');
    if (fueCancelado) {
      this.messageService.add({
        severity: 'info',
        summary: 'Análisis cancelado',
        detail: mensajeError,
        life: 6000
      });
      this.mensajeErrorAnalisis = null;
    } else {
      this.messageService.add({
        severity: 'info',
        summary: 'Información',
        detail: mensajeError || 'Ocurrió un error durante el análisis',
        life: 6000
      });
      this.cargarDispositivos()
      this.mensajeErrorAnalisis = mensajeError;
    }
    this.dispositivoSeleccionado = null;
    localStorage.removeItem('dispositivoSeleccionado');
    localStorage.removeItem('vulnerabilidadesDetalle');
    localStorage.removeItem('resumenesPorPuerto');
    localStorage.removeItem('analisisEnProgreso');
    localStorage.removeItem('ipOriginalAnalizada');
    localStorage.removeItem('macAnalizada');
    localStorage.removeItem('resumen_tecnico_agrupado');
    this.cdr.detectChanges();
  }

  obtenerBloquesResumenAgrupado() {
    const resumen = this.getResumenAgrupado();
    const bloques = resumen.split(/\n(?=\d+\.\s)/);
    const estructura = [
      { clave: 'estado', titulo: '1. Estado general del puerto y su servicio:' },
      { clave: 'analisis', titulo: '2. Análisis técnico del resultado del escaneo:' },
      { clave: 'riesgos', titulo: '3. Riesgos identificados o potenciales:' },
      { clave: 'recomendaciones', titulo: '4. Recomendaciones específicas:' }
    ];
    return estructura.map((bloque, i) => ({
      ...bloque,
      contenido: bloques[i]?.replace(`${i + 1}.`, '').trim() || 'No disponible'
    }));
  }

  limpiarResultado(): void {
    this.vulnerabilidadesDetalle = [];
    this.resumenTecnico = [];
    this.puertoSeleccionado = null;
    this.dispositivoSeleccionado = null;
    this.mensajeErrorAnalisis = null;
    this.resultadoPersistente = false;
    this.analisisFinalizado = false;
    this.analisisEnProgreso = false;
    localStorage.removeItem('resumen_tecnico_agrupado');
    localStorage.removeItem('vulnerabilidadesDetalle');
    localStorage.removeItem('resumenesPorPuerto');
    localStorage.removeItem('analisisEnProgreso');
    localStorage.removeItem('dispositivoSeleccionado');
  }
  private limpiarSoloResultado(): void {
    this.vulnerabilidadesDetalle = [];
    this.resumenTecnico = [];
    this.puertoSeleccionado = null;
    this.mensajeErrorAnalisis = null;
    this.resultadoPersistente = false;
    this.analisisFinalizado = false;
    localStorage.removeItem('resumen_tecnico_agrupado');
    localStorage.removeItem('vulnerabilidadesDetalle');
    localStorage.removeItem('resumenesPorPuerto');
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
        this.puertoSeleccionado = null;
        this.puertoSeleccionadoChip = null;
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
      this.notificacion.info('Información', 'Selecciona un dispositivo para consultar vulnerabilidades.');
      return;
    }
    const id = this.dispositivoSeleccionado.dispositivo_id;
    this.cargando = true;
    this.vulnerabilidadServicio.consultarResumenesYCvesPorDispositivo(id).subscribe({
      next: ({ data }) => {
        if (!data || data.length === 0) {
          this.notificacion.info('Información', 'No se encontraron resultados de un análisis anterior.');
          this.cargando = false;
          return;
        }
        const resultado = {
          dispositivo_activo: true,
          vulnerabilidades: data,
          resumenes_por_puerto: data.map((puerto: any) => ({
            puerto: puerto.puerto,
            servicio: puerto.servicio,
            resumen: puerto.resumen,
            vulnerabilidades: puerto.vulnerabilidades || []
          }))
        };
        this.ngZone.run(() => {
          this.procesarResultadoAnalisis(resultado, true);
          this.nombreDispositivoAnalizado = this.dispositivoSeleccionado?.nombre || '';
          this.ipOriginalAnalizada = this.dispositivoSeleccionado?.ip || this.dispositivoSeleccionado?.ultima_ip || '';
          this.macAnalizada = this.dispositivoSeleccionado?.mac || this.dispositivoSeleccionado?.mac_address || '';
          localStorage.setItem('dispositivoSeleccionado', JSON.stringify(this.dispositivoSeleccionado));
          localStorage.setItem('ipOriginalAnalizada', this.ipOriginalAnalizada);
          localStorage.setItem('macAnalizada', this.macAnalizada);
          localStorage.setItem('nombreDispositivoAnalizado', this.nombreDispositivoAnalizado);
          this.cdr.detectChanges();
        });
      },
      error: () => {
        this.cargando = false;
        this.notificacion.error('Ocurrió un error al consultar el escaneo anterior desde base de datos.');
      }
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

  private crearNotificacionFinalizacion(): void {
    const usuario_id = this.sesionUsuario?.obtenerUsuarioDesdeToken?.()?.usuario_id;
    if (!usuario_id) return;

    const notificacion = {
      mensaje_notificacion: 'Análisis de vulnerabilidades completado correctamente.',
      tipo_alerta_id: 1,
      canal_alerta_id: 1,
      usuario_id,
      dispositivo_id: this.dispositivoSeleccionado?.dispositivo_id || null
    };

    this.servicioAlertas.crearNotificacion(notificacion).subscribe({
      next: () => {

      },
      error: (err) => console.warn('Error al crear notificación:', err)
    });
  }
  private reanudarSiEstabaFinalizado(): void {
    const datos = localStorage.getItem('vulnerabilidadesDetalle');
    const resumen = localStorage.getItem('resumenesPorPuerto');
    const resumenAgrupado = localStorage.getItem('resumen_tecnico_agrupado');
    const ipGuardada = localStorage.getItem('ipOriginalAnalizada');
    const macGuardada = localStorage.getItem('macAnalizada');
    this.ngZone.run(() => {
      if (datos) {
        this.vulnerabilidadesDetalle = JSON.parse(datos);
      }

      if (resumen) {
        this.resumenTecnico = JSON.parse(resumen);
      }

      if (ipGuardada) this.ipOriginalAnalizada = ipGuardada;
      if (macGuardada) this.macAnalizada = macGuardada;

      const hayResumenes = this.resumenTecnico.length > 0;
      const hayAgrupado = !!resumenAgrupado;

      this.resumenAgrupadoDisponible = hayAgrupado;

      if (hayResumenes || hayAgrupado) {
        this.resultadoPersistente = true;
        this.analisisFinalizado = true;
        this.analisisEnProgreso = false;
        this.cargando = false;

        if (!this.puertoSeleccionado && this.resumenTecnico.length > 0) {
          this.puertoSeleccionado = this.resumenTecnico[0];
          this.puertoSeleccionadoChip = this.resumenTecnico[0];
          this.actualizarFiltrosPorPuerto();
        }

        this.cdr.detectChanges();
      }
    });
  }
  getResumenAgrupado(): string {
    return localStorage.getItem('resumen_tecnico_agrupado') || '';
  }
  obtenerBloque(tipo: 'estado' | 'analisis' | 'riesgos'): string {
    const resumen = this.puertoSeleccionado?.resumen || '';
    const claves = {
      estado: '1. Estado general del puerto y su servicio:',
      analisis: '2. Análisis técnico del resultado del escaneo:',
      riesgos: '3. Riesgos identificados o potenciales:',
      recomendaciones: '4. Recomendaciones específicas:'
    };

    const actual = claves[tipo];
    const inicio = resumen.indexOf(actual);
    if (inicio === -1) return '';

    const posicionesSiguientes = Object.values(claves)
      .filter((clave) => clave !== actual)
      .map((clave) => resumen.indexOf(clave))
      .filter((pos) => pos > inicio);

    const fin = posicionesSiguientes.length > 0 ? Math.min(...posicionesSiguientes) : resumen.length;
    return resumen.slice(inicio + actual.length, fin).trim();
  }

  obtenerRecomendaciones(resumen: string): string[] {
    const marcador = '4. Recomendaciones específicas:';
    const inicio = resumen.indexOf(marcador);
    if (inicio === -1) return [];

    const bloque = resumen.slice(inicio + marcador.length).trim();

    const numeradas = bloque.split(/\n?\d+\.\s+/).slice(1).map(r => r.trim()).filter(Boolean);
    if (numeradas.length > 0) return numeradas;

    const viñetas = bloque.split(/•\s+/).map(r => r.trim()).filter(Boolean);
    if (viñetas.length > 1) return viñetas;

    return bloque ? [bloque] : [];
  }

  formatearBloqueMultilinea(texto: string): string {
    return texto
      .replace(/^#+/, '') // hashes
      .replace(/•\s*/g, '• ')
      .replace(/\s*-\s+/g, '\n- ')
      .replace(/\n{2,}/g, '\n')
      .trim();
  }
  cancelarAnalisisAvanzado(): void {
    this.notificacion.info('Cancelando análisis...');
    this.vulnerabilidadServicio.cancelarAnalisisAvanzado().subscribe({
      next: ({ mensaje }) => {
        this.notificacion.success(mensaje || 'Análisis cancelado correctamente');
        this.analisisEnProgreso = false;
        this.cargando = false;
        localStorage.removeItem('analisisEnProgreso');
      },
      error: () => {
        this.notificacion.error('Ocurrió un error al intentar cancelar el análisis');
      }
    });
  }
  confirmarCancelacionAnalisis(): void {
    this.confirmService.confirm({
      message: '¿Estás seguro de cancelar el análisis avanzado?',
      header: 'Cancelar análisis',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, cancelar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.cancelarAnalisisAvanzado();
      }
    });
  }
}