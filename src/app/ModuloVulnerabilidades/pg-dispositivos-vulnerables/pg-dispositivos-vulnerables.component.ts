import { Component } from '@angular/core';
import { ServiciosDispositivos } from '../../ModuloServiciosWeb/ServiciosDispositivos.component';
import { ServiciosAnalisisVulnerabilidades } from '../../ModuloServiciosWeb/ServiciosAnalisisVulnerabilidades.component';
import { SesionUsuarioService } from '../../Seguridad/sesion-usuario.service';
import { ServiciosAlertas } from '../../ModuloServiciosWeb/ServiciosAlertas.component';
import { NotificacionService } from '../../ValidacionesFormularios/notificacion.service';
import { ServicioSegundoPlano } from '../../ModuloServiciosWeb/ServiciosSegundoPlano.service';
import { ConfirmationService, PrimeTemplate } from 'primeng/api';
import { ChangeDetectorRef } from '@angular/core';
import { Toast } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ButtonDirective, Button } from 'primeng/button';
import { NgIf } from '@angular/common';
import { ProgressSpinner } from 'primeng/progressspinner';
import { IftaLabel } from 'primeng/iftalabel';
import { Select } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { ProgressBar } from 'primeng/progressbar';
import { Panel } from 'primeng/panel';
import { Card } from 'primeng/card';
import { Tag } from 'primeng/tag';
import { Divider } from 'primeng/divider';
import { TableModule } from 'primeng/table';
import { Dialog } from 'primeng/dialog';
import { CanComponentDeactivate } from '../../Seguridad/confirm-deactivate.guard';
interface Puerto {
  puerto_id?: number;
  numero: number;
  servicio?: string;
  protocolo?: string;
  version?: string;
  label?: string;
}


interface Dispositivo {
  nombreDispositivo: string;
  ip: string;
  macAddress: string;
  riesgo: string;
  descripcion?: string;
  puertosAbiertos: Puerto[];
  puertosSeleccionados: Puerto[];
  cargandoRecomendaciones?: boolean;
}

@Component({
  standalone: true,
  selector: 'app-pg-dispositivos-vulnerables',
  templateUrl: './pg-dispositivos-vulnerables.component.html',
  styleUrls: ['./pg-dispositivos-vulnerables.component.css'],
  imports: [Toast, ConfirmDialog, PrimeTemplate, ButtonDirective, NgIf, Button, ProgressSpinner, IftaLabel, Select, FormsModule, ProgressBar, Panel, Card, Tag, Divider, TableModule, Dialog]
})
export class PgDispositivosVulnerablesComponent implements CanComponentDeactivate {
  dispositivoInactivo: boolean = false;
  verificandoEstado: boolean = true;
  dispositivoSeleccionado: any = null;
  riesgoEvaluado: string = '';
  justificacionEvaluada: string = '';
  puertosDetectados: Puerto[] = [];
  nombreDispositivoEvaluado: string = '';
  macEvaluada: string = '';
  ipEvaluada: string = '';
  sistemaOperativo: string = '';
  precisionSO: number = 0;
  puertosSeleccionados: any[] = [];
  cargandoRecomendaciones: boolean = false;

  listaRecomendaciones: any[] = [];
  dialogoVisible = false;
  evaluacionCompletada = false;
  dispositivos: Dispositivo[] = [];
  evaluacionEnProgreso: boolean = false;

  ngOnInit(): void {
    this.servicioDispositivos.listarDispositivosCompleto().subscribe({
      next: ({ data }) => {
        this.dispositivos = data.map((d: any) => ({
          ...d,
          ip: d.ultima_ip,
          macAddress: d.mac_address,
          etiquetaBusqueda: `${d.nombre_dispositivo} ${d.mac_address} ${d.ultima_ip}`
        }));
        this.reanudarSiEstabaFinalizado();
        this.servicioAnalisis.obtenerEstadoEvaluacionIndividual().subscribe({
          next: ({ estado }) => {
            this.verificandoEstado = false;
            if (estado === 'en_proceso') {
              this.evaluacionEnProgreso = true;

              this.servicioSegundoPlano.iniciar('evaluacion_riesgo', {
                intervaloMs: 3000,
                obtenerEstado: () => this.servicioAnalisis.obtenerEstadoEvaluacionIndividual(),
                alFinalizar: () => {
                  this.confirmationService.close();
                  this.servicioAnalisis.obtenerResultadoEvaluacionIndividual().subscribe({
                    next: (respuesta) => this.procesarResultadoAnalisis(respuesta),
                    error: () => {
                      this.evaluacionEnProgreso = false;
                      this.notificacion.error('Error', 'No se pudo obtener el resultado.');
                    }
                  });
                },
                alError: (msg) => {
                  this.evaluacionEnProgreso = false;
                  this.notificacion.error('Error', msg || 'Error desconocido.');
                },
                alIterar: () => {
                  console.log('[Polling] Reanudando seguimiento...');
                }
              });
            }
          },
          error: () => {
            this.verificandoEstado = false;
          }
        });
      },
      error: (err) => {
        this.verificandoEstado = false;
        console.error('Error al cargar dispositivos:', err);
        this.notificacion.error('Error', 'No se pudieron cargar los dispositivos.');
      }
    });
  }

  private reanudarSiEstabaFinalizado(): void {
    const datosGuardados = localStorage.getItem('evaluacionDispositivo');
    if (!datosGuardados) return;
    const data = JSON.parse(datosGuardados);
    this.evaluacionEnProgreso = true;
    this.servicioAnalisis.obtenerResultadoEvaluacionIndividual().subscribe({
      next: (respuesta) => {
        const resultado = respuesta?.data;
        if (
          resultado?.ip === data.ipEvaluada &&
          resultado?.mac_address === data.macEvaluada
        ) {
          this.procesarResultadoAnalisis(respuesta, true);
          const macNormalizada = (resultado.mac_address || '').toLowerCase();
          const ipEvaluada = resultado.ip;
          const dispositivoEncontrado = this.dispositivos.find((d) => {
            const macD = (d.macAddress || '').toLowerCase();
            const ipD = d.ip || '';
            const coincideMac = macD === macNormalizada;
            const coincideIp = ipD === ipEvaluada;
            return coincideMac || coincideIp;
          });

          this.dispositivoInactivo = !dispositivoEncontrado;
          this.cdr.detectChanges();
        } else {
          this.notificacion.warning(
            'Evaluación caducada',
            'El dispositivo ya no está disponible o ha cambiado.'
          );
          this.resetearEstadoLocalEvaluacion();
          localStorage.removeItem('evaluacionDispositivo');
          this.evaluacionEnProgreso = false;
        }
      },
      error: () => {
        this.evaluacionEnProgreso = false;
        this.notificacion.warning(
          'No se pudo recuperar resultados anteriores',
          'Podrías iniciar una nueva evaluación.'
        );
      }
    });
  }
  constructor(
    private servicioDispositivos: ServiciosDispositivos,
    private servicioAnalisis: ServiciosAnalisisVulnerabilidades,
    private sesionUsuario: SesionUsuarioService,
    private servicioAlertas: ServiciosAlertas,
    private notificacion: NotificacionService,
    private servicioSegundoPlano: ServicioSegundoPlano,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef

  ) { }
  private cargarDispositivos(): void {
    this.servicioDispositivos.listarDispositivosCompleto().subscribe({
      next: ({ data }) => {
        this.dispositivos = data.map((d: any) => ({
          ...d,
          etiquetaBusqueda: `${d.nombre_dispositivo} ${d.mac_address} ${d.ultima_ip}`
        }));
      },
      error: (err) => {
        console.error('Error al cargar dispositivos:', err);
        this.notificacion.error('Error', 'No se pudieron cargar los dispositivos.');
      }
    });
  }
  canDeactivate(): boolean {
    return !this.evaluacionEnProgreso;
  }
  cancelPendingOperation(): Promise<boolean> {
    return new Promise((resolve) => {
      this.servicioAnalisis.cancelarEvaluacionIndividual().subscribe({
        next: (res) => {
          this.servicioSegundoPlano.detener('evaluacion_riesgo');
          this.evaluacionEnProgreso = false;
          resolve(true);
        },
        error: (err) => {
          this.notificacion.warning('Advertencia', 'No se pudo cancelar el proceso. Intenta nuevamente.');
          resolve(false);
        }
      });
    });
  }
  evaluarDispositivoSeleccionado(): void {
    this.resetearEstadoLocalEvaluacion();

    if (!this.dispositivoSeleccionado) {
  this.notificacion.info('Dispositivo no seleccionado', 'Por favor selecciona un dispositivo antes de evaluar el riesgo.');
  return;
}


    const datos = {
      ip: this.dispositivoSeleccionado.ultima_ip,
      mac: this.dispositivoSeleccionado.mac_address
    };
    this.evaluacionEnProgreso = true;
    this.servicioAnalisis.evaluarRiesgoDispositivoIndividual(datos).subscribe({
      next: () => {
        this.servicioSegundoPlano.iniciar('evaluacion_riesgo', {
          intervaloMs: 3000,
          obtenerEstado: () => this.servicioAnalisis.obtenerEstadoEvaluacionIndividual(),
          alFinalizar: () => {
            this.confirmationService.close();
            this.servicioAnalisis.obtenerResultadoEvaluacionIndividual().subscribe({
              next: (respuesta) => {
                this.procesarResultadoAnalisis(respuesta);
              },
              error: () => {
                this.evaluacionEnProgreso = false;
                this.notificacion.error('Error', 'No se pudo obtener el resultado.');
              }
            });
          },
          alError: (msg) => {
            this.evaluacionEnProgreso = false;
            this.notificacion.error('Error', msg || 'Error desconocido.');
          },
          alIterar: () => {
            console.log('Evaluación aún en proceso...');
          }
        });
      },
      error: () => {
        this.evaluacionEnProgreso = false;
        this.notificacion.error('Error', 'No se pudo iniciar la evaluación.');
      }
    });
  }
  private procesarResultadoAnalisis(respuesta: any, desdeReanudacion: boolean = false): void {
    const data = respuesta?.data;
    this.nombreDispositivoEvaluado = data?.nombre_dispositivo || 'Desconocido';
    this.macEvaluada = data?.mac_address || 'N/A';
    this.ipEvaluada = data?.ip || 'N/A';
    if (!data?.riesgo || !Array.isArray(data?.puertos_abiertos)) {
      this.evaluacionEnProgreso = false;
      this.evaluacionCompletada = false;
      this.dispositivoInactivo = true;

      this.notificacion.error(
        'Dispositivo inactivo',
        data?.mensaje || 'No se pudo encontrar el dispositivo en la red.'
      );
      this.cargarDispositivos();
      return;
    }
    this.dispositivoInactivo = false;
    this.sistemaOperativo = data?.sistema_operativo?.nombre || 'Desconocido';
    this.precisionSO = data?.sistema_operativo?.precision || 0;
    this.riesgoEvaluado = data?.riesgo;
    this.justificacionEvaluada = data?.descripcion;
    this.puertosDetectados = (data?.puertos_abiertos || []).map((p: any) => ({
      puerto_id: p.puerto_id,
      numero: p.numero,
      servicio: p.servicio,
      protocolo: p.protocolo,
      version: p.version
    }));

    localStorage.setItem('evaluacionDispositivo', JSON.stringify({
      nombreDispositivoEvaluado: this.nombreDispositivoEvaluado,
      ipEvaluada: this.ipEvaluada,
      macEvaluada: this.macEvaluada,
      sistemaOperativo: this.sistemaOperativo,
      precisionSO: this.precisionSO,
      riesgoEvaluado: this.riesgoEvaluado,
      justificacionEvaluada: this.justificacionEvaluada,
      puertosDetectados: this.puertosDetectados

    }));

    this.evaluacionCompletada = true;
    this.evaluacionEnProgreso = false;

    this.crearNotificacionFinalizacionEvaluacion(desdeReanudacion);
  }

  limpiarEvaluacion(): void {
    this.servicioAnalisis.limpiarResultadoEvaluacionIndividual().subscribe({
      next: () => {
        this.resetearEstadoLocalEvaluacion();
        localStorage.removeItem('evaluacionDispositivo');
        this.listaRecomendaciones = [];
        this.evaluacionCompletada = false;
        this.dialogoVisible = false;
        this.notificacion.success('Evaluación limpiada', 'Puedes realizar una nueva evaluación.');
      },
      error: () => {
        this.notificacion.error('Error', 'No se pudo limpiar la evaluación.');
      }
    });
  }

  private resetearEstadoLocalEvaluacion(): void {
    localStorage.removeItem('evaluacionDispositivo');
    this.listaRecomendaciones = [];
    this.evaluacionCompletada = false;
    this.dialogoVisible = false;
    this.nombreDispositivoEvaluado = '';
    this.ipEvaluada = '';
    this.macEvaluada = '';
    this.sistemaOperativo = '';
    this.precisionSO = 0;
    this.riesgoEvaluado = '';
    this.justificacionEvaluada = '';
    this.puertosDetectados = [];
    this.puertosSeleccionados = [];
    this.dispositivoInactivo = false;
  }








  private crearNotificacionFinalizacionEvaluacion(desdeReanudacion: boolean = false): void {
    if (desdeReanudacion) return;
    const usuario_id = this.sesionUsuario.obtenerUsuarioDesdeToken()?.usuario_id;
    if (!usuario_id) return;
    const notificacion = {
      mensaje_notificacion: `Evaluación de riesgo finalizada para el dispositivo ${this.nombreDispositivoEvaluado} (${this.ipEvaluada}). Nivel de riesgo: ${this.riesgoEvaluado}.`,
      tipo_alerta_id: 1,
      canal_alerta_id: 1,
      usuario_id,
      dispositivo_id: null
    };
    this.servicioAlertas.crearNotificacion(notificacion).subscribe({
      next: () => console.log('Notificación de evaluación creada.'),
      error: (err) => console.warn('Error al crear notificación:', err)
    });
  }
  generarRecomendaciones(): void {
    const ids = this.puertosSeleccionados
      .map(p => p.puerto_id)
      .filter((id): id is number => id !== undefined);
    if (!ids.length) {
      this.notificacion.warning('Advertencia', 'Selecciona al menos un puerto válido.');
      return;
    }
    this.cargandoRecomendaciones = true;
    this.servicioAnalisis.generarRecomendacionesPorPuertosSeleccionados(ids).subscribe({
      next: () => {
        this.servicioAnalisis.obtenerRecomendacionesPorPuertos(ids).subscribe({
          next: ({ data }) => {
            this.listaRecomendaciones = data.puertos;
            this.dialogoVisible = true;
            this.puertosSeleccionados = [];
          },
          complete: () => this.cargandoRecomendaciones = false,
          error: () => {
            this.cargandoRecomendaciones = false;
            this.notificacion.error('Error', 'No se pudieron obtener las recomendaciones.');
          }
        });
      },
      error: () => {
        this.cargandoRecomendaciones = false;
        this.notificacion.error('Error', 'No se pudieron generar las recomendaciones.');
      }
    });
  }
  abrirDialogoCancelarEvaluacion(): void {

    this.confirmationService.confirm({
      message: '¿Estás seguro de cancelar la evaluación de riesgo?',
      header: 'Cancelar evaluación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, cancelar',
      rejectLabel: 'No',
      accept: () => {

        this.servicioAnalisis.cancelarEvaluacionIndividual().subscribe({
          next: () => {
            this.servicioSegundoPlano.detener('evaluacion_riesgo');
            this.evaluacionEnProgreso = false;
            this.evaluacionCompletada = false;
            this.notificacion.success('Evaluación cancelada', 'La evaluación de riesgo fue cancelada.');
          },
          error: () => {
            this.notificacion.error('Error', 'No se pudo cancelar la evaluación.');
          }
        });
      }
    });
  }


}
