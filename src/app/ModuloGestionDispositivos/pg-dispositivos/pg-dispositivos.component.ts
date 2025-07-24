import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,

} from '@angular/core';
import { CanComponentDeactivate } from '../../Seguridad/confirm-deactivate.guard';
import { Table, TableModule } from 'primeng/table';
import { MessageService, SortEvent, PrimeTemplate } from 'primeng/api';
import { ServiciosDispositivos } from '../../ModuloServiciosWeb/ServiciosDispositivos.component';
import { NotificacionService } from '../../ValidacionesFormularios/notificacion.service';
import { ValidacionesGeneralesService } from '../../ValidacionesFormularios/validaciones-dispositivo.service';
import { ServicioSegundoPlano } from '../../ModuloServiciosWeb/ServiciosSegundoPlano.service';
import { ServiciosAnalisisVulnerabilidades } from '../../ModuloServiciosWeb/ServiciosAnalisisVulnerabilidades.component';
import { ServiciosAlertas } from '../../ModuloServiciosWeb/ServiciosAlertas.component';
import { SesionUsuarioService } from '../../Seguridad/sesion-usuario.service';
import { ConfirmationService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ButtonDirective, Button } from 'primeng/button';
import { NgIf, NgFor } from '@angular/common';
import { ProgressSpinner } from 'primeng/progressspinner';
import { ProgressBar } from 'primeng/progressbar';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Tag } from 'primeng/tag';
import { Tooltip } from 'primeng/tooltip';
import { Dialog } from 'primeng/dialog';
import { IftaLabel } from 'primeng/iftalabel';
import { FormsModule } from '@angular/forms';

interface SistemaOperativo {
  sistema_operativo_id: number;
  nombre_so: string;
}

interface Dispositivo {
  dispositivo_id: number;
  nombre_dispositivo: string;
  mac_address: string;
  sistema_operativo: string;
  precision_so: number;
  ultima_ip: string;
  estado: boolean;
  puertos?: any[];
}
@Component({
  standalone: true,
  selector: 'app-pg-dispositivos',
  templateUrl: './pg-dispositivos.component.html',
  styleUrls: ['./pg-dispositivos.component.css'],
  imports: [Toast, ConfirmDialog, PrimeTemplate, ButtonDirective, NgIf, Button, ProgressSpinner, ProgressBar, TableModule, IconField, InputIcon, InputText, Tag, Tooltip, Dialog, IftaLabel, FormsModule,]
})
export class PgDispositivosComponent implements OnInit, AfterViewInit, CanComponentDeactivate {
  @ViewChild('dt') dt!: Table;
  Math = Math
  dispositivos: Dispositivo[] = [];
  dispositivosOriginales: Dispositivo[] = [];
  sistemasOperativos: SistemaOperativo[] = [];
  sistemasOperativosFiltrados: SistemaOperativo[] = [];
  modalEditarVisible = false;
  modalCrearSOVisible = false;
  dialogoVisible = false;
  puertosDispositivo: any[] = [];
  dispositivoSeleccionado: any = null;
  dispositivoEditando: Dispositivo | null = null;
  sistemaOperativoSeleccionado: SistemaOperativo | null = null;
  ordenActivo: boolean | null = null;
  escaneando: boolean = false;
  cargandoDispositivos: boolean = true;
  nuevoSO = { nombre_so: '' };
  constructor(
    private serviciosDispositivos: ServiciosDispositivos,
    private notificacion: NotificacionService,
    private validaciones: ValidacionesGeneralesService,
    private messageService: MessageService,
    private segundoPlano: ServicioSegundoPlano,
    private analisisVulnerabilidades: ServiciosAnalisisVulnerabilidades,
    private confirmationService: ConfirmationService,
    private sesionUsuario: SesionUsuarioService,
    private servicioAlertas: ServiciosAlertas
  ) { }

  ngOnInit(): void {
    this.cargarDispositivos();
    this.cargarSistemasOperativos();
    this.reanudarEscaneoSiEstabaActivo();

  }

  ngAfterViewInit(): void {
    if (!this.dt) {
      console.warn('Tabla de dispositivos (dt) no inicializada.');
    }
  }
  cancelPendingOperation(): Promise<boolean> {
    return new Promise(resolve => {
      this.analisisVulnerabilidades.cancelarEscaneoRapido().subscribe({
        next: () => {
          this.escaneando = false;

          resolve(true);
        },
        error: () => {
          this.escaneando = false;
          resolve(true);
        }
      });
    });
  }

  canDeactivate(): boolean {
    return !this.escaneando;
  }
  private cargarDispositivos(): void {
    this.cargandoDispositivos = true;
    this.serviciosDispositivos.listarDispositivosCompleto().subscribe({
      next: ({ data }) => {
        this.dispositivos = data;
        this.dispositivosOriginales = [...data];
      },
      error: (err) => console.error(' Error al obtener dispositivos:', err)
    });
  }

  private cargarSistemasOperativos(): void {
    this.serviciosDispositivos.listarSistemasOperativos().subscribe({
      next: (so) => {
        this.sistemasOperativos = so;
      },
      error: (err) => console.error('Error al cargar sistemas operativos:', err)
    });
  }

  filtrarDispositivos(event: Event): void {
    const valor = (event.target as HTMLInputElement).value;
    this.dt?.filterGlobal(valor, 'contains');
  }

  buscarSistemaOperativo(event: { query: string }): void {
    const termino = event.query.trim().toLowerCase();

    this.sistemasOperativosFiltrados = termino.length >= 3
      ? this.sistemasOperativos.filter(so =>
        so.nombre_so.toLowerCase().includes(termino)
      )
      : [];
  }

  abrirModal(tipo: 'editar' | 'crear_so', dispositivo?: Dispositivo): void {
    if (tipo === 'editar' && dispositivo) {
      this.dispositivoEditando = { ...dispositivo };
      this.sistemaOperativoSeleccionado = this.sistemasOperativos.find(
        so => so.nombre_so === dispositivo.sistema_operativo
      ) || null;

      this.modalEditarVisible = true;
    }

    if (tipo === 'crear_so') {
      this.nuevoSO.nombre_so = '';
      this.modalCrearSOVisible = true;
    }
  }

  cerrarModal(tipo: 'editar' | 'crear_so'): void {
    if (tipo === 'editar') {
      this.modalEditarVisible = false;
      this.dispositivoEditando = null;
      this.sistemaOperativoSeleccionado = null;
    }

    if (tipo === 'crear_so') {
      this.modalCrearSOVisible = false;
      this.nuevoSO.nombre_so = '';
    }
  }

  guardarCambios(): void {
    if (!this.dispositivoEditando) return;

    const nombre = this.dispositivoEditando.nombre_dispositivo.trim();

    if (!this.validaciones.validarNombreDispositivo(nombre)) return;
    if (!this.validaciones.validarSistemaOperativoSeleccionado(this.sistemaOperativoSeleccionado)) return;

    const payload = {
      nuevo_nombre: nombre,
      nuevo_sistema_operativo_id: this.sistemaOperativoSeleccionado!.sistema_operativo_id,
      nueva_precision_so: 100.0
    };

    this.serviciosDispositivos.actualizarDispositivo(this.dispositivoEditando.dispositivo_id, payload).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Dispositivo actualizado',
          detail: 'Los cambios se guardaron correctamente.'
        });
        this.cerrarModal('editar');
        this.cargarDispositivos();
      },
      error: (error) => {
        const detalle = error?.error?.detail;
        let mensaje = 'No se pudo actualizar el dispositivo.';

        if (typeof detalle === 'string') {
          const match = detalle.match(/(?:\d{3}: )?(.*)/);
          mensaje = match ? match[1].trim() : detalle;
        } else if (typeof error?.message === 'string') {
          mensaje = error.message;
        }

        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: mensaje
        });


      }
    });
  }
  verPuertosDispositivo(dispositivo: Dispositivo): void {
    this.dispositivoSeleccionado = dispositivo;
    this.puertosDispositivo = dispositivo.puertos || [];
    this.dialogoVisible = true;
  }

  ordenarDispositivosRemovible(event: SortEvent): void {
    if (this.ordenActivo === null) {
      this.ordenActivo = true;
      this.ordenarLista(event);
    } else if (this.ordenActivo === true) {
      this.ordenActivo = false;
      event.order = -1;
      this.ordenarLista(event);
    } else {
      this.ordenActivo = null;
      this.dispositivos = [...this.dispositivosOriginales];
      this.dt.reset();
    }
  }

  private ordenarLista(event: SortEvent): void {
    const campo = event.field!;
    const orden = event.order ?? 1;

    this.dispositivos.sort((a: any, b: any) => {
      const valA = a[campo];
      const valB = b[campo];

      if (valA == null && valB != null) return -1 * orden;
      if (valA != null && valB == null) return 1 * orden;
      if (valA == null && valB == null) return 0;

      if (typeof valA === 'string' && typeof valB === 'string') {
        return valA.localeCompare(valB) * orden;
      }

      return (valA < valB ? -1 : valA > valB ? 1 : 0) * orden;
    });
  }

  abrirDialogoCancelarEscaneo(): void {
    this.confirmationService.confirm({
      message: '¿Estás seguro de cancelar el escaneo?',
      header: 'Cancelar escaneo',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, cancelar',
      rejectLabel: 'Regresar',
      accept: () => {
        this.analisisVulnerabilidades.cancelarEscaneoRapido().subscribe({
          next: () => {

            this.escaneando = false;

          },
          error: (err) => {
            console.error(' Error al cancelar escaneo:', err);
          }
        });
      }
    });
  }

  private crearNotificacionFinalizacion(): void {
    const usuario_id = this.sesionUsuario.obtenerUsuarioDesdeToken()?.usuario_id;
    if (!usuario_id) return;

    const notificacion = {
      mensaje_notificacion: "Escaneo de red finalizado correctamente.",
      tipo_alerta_id: 1,
      canal_alerta_id: 1,
      usuario_id,
      dispositivo_id: null
    };

    this.servicioAlertas.crearNotificacion(notificacion).subscribe({
      next: () => console.log('Notificación de escaneo creada.'),
      error: (err) => console.warn('Error al crear notificación:', err)
    });
  }

  private reanudarEscaneoSiEstabaActivo(): void {
    this.analisisVulnerabilidades.obtenerEstadoEscaneoRapido().subscribe({
      next: ({ estado }) => {
        if (estado === 'en_progreso') {
          this.escaneando = true;
          this.iniciarSeguimientoEscaneo();
        } else {
          this.escaneando = false;
        }
      },
      error: () => {
        this.escaneando = false;
      }
    });
  }


  ejecutarEscaneoRapido(): void {
    this.escaneando = true;

    this.analisisVulnerabilidades.ejecutarEscaneoRapido().subscribe({
      next: () => {
        this.iniciarSeguimientoEscaneo();
      },
      error: (err) => {
        this.notificacion.error('Error', 'No se pudo iniciar el escaneo rápido.');
        this.escaneando = false;
      }
    });
  }
  private iniciarSeguimientoEscaneo(): void {
    this.segundoPlano.iniciar('escaneo_rapido', {
      intervaloMs: 3000,
      obtenerEstado: () => this.analisisVulnerabilidades.obtenerEstadoEscaneoRapido(),
      alFinalizar: () => {
        this.confirmationService.close();
        this.analisisVulnerabilidades.obtenerEstadoEscaneoRapido().subscribe({
          next: ({ estado }) => {
            this.escaneando = false;
            this.cargarDispositivos();
            if (estado === 'completado') {
              this.crearNotificacionFinalizacion();
              this.messageService.add({
                severity: 'success',
                summary: 'Escaneo finalizado',
                detail: 'El escaneo ha terminado exitosamente.'
              });
            } else {
              this.messageService.add({
                severity: 'info',
                summary: 'Escaneo cancelado',
                detail: 'El escaneo fue cancelado.'
              });
            }
          },
          error: () => {
            this.escaneando = false;
            this.notificacion.error('Error', 'Error al verificar estado final del escaneo.');
          }
        });
      },
      alError: () => {
        this.confirmationService.close();
        this.escaneando = false;
        this.notificacion.error('Error', 'Error al obtener estado de escaneo rápido.');
      },
      alIterar: () => {
        this.escaneando = true;
      }
    });
  }


}
