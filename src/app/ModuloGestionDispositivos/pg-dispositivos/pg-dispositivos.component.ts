import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
} from '@angular/core';

import { Table } from 'primeng/table';
import { MessageService, SortEvent } from 'primeng/api';
import { Router, ActivatedRoute } from '@angular/router';
import { ServiciosDispositivos } from '../../ModuloServiciosWeb/ServiciosDispositivos.component';
import { NotificacionService } from '../../ValidacionesFormularios/notificacion.service';
import { ValidacionesGeneralesService } from '../../ValidacionesFormularios/validaciones-dispositivo.service';
import { ServicioSegundoPlano } from '../../ModuloServiciosWeb/ServiciosSegundoPlano.service';
import { ServiciosAnalisisVulnerabilidades } from '../../ModuloServiciosWeb/ServiciosAnalisisVulnerabilidades.component';
import { ServiciosAlertas } from '../../ModuloServiciosWeb/ServiciosAlertas.component';
import { SesionUsuarioService } from '../../Seguridad/sesion-usuario.service';
import { ConfirmationService } from 'primeng/api';
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
  selector: 'app-pg-dispositivos',
  templateUrl: './pg-dispositivos.component.html',
  styleUrls: ['./pg-dispositivos.component.css']
})
export class PgDispositivosComponent implements OnInit, AfterViewInit {
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
  progresoActual: number = 0;
  progresoTotal: number = 0;

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
  ) {}

ngOnInit(): void {
  this.cargarDispositivos();
  this.cargarSistemasOperativos();

this.analisisVulnerabilidades.obtenerEstadoEscaneo().subscribe({
  next: ({ estado }) => {
    console.log('🔍 Estado desde backend:', estado);

    // 👉 Si no hay escaneo válido, detenemos seguimiento y salimos
    if (estado === 'no_encontrado' || !estado) {
      this.segundoPlano.detener('escaneo_dispositivos');
      localStorage.removeItem('escaneo_dispositivos');
      this.escaneando = false;
      return;
    }

    const escaneoActivo = estado === 'en_progreso' || estado?.startsWith('procesando');

    if (escaneoActivo) {
  this.escaneando = true; // 👈 primero forzamos el estado

  this.actualizarProgresoDesdeBackend(); // 🟢 actualizar visual inmediato al entrar

  this.segundoPlano.iniciar('escaneo_dispositivos', {
    intervaloMs: 2000,
    obtenerEstado: () => this.analisisVulnerabilidades.obtenerEstadoEscaneo(),
    alIterar: () => {
      this.actualizarProgresoDesdeBackend();
    },
    alFinalizar: () => {
      this.escaneando = false;
      this.notificacion.success('Escaneo finalizado', 'El escaneo ha terminado correctamente.');
      this.crearNotificacionFinalizacion();
      this.cargarDispositivos();
    },
    alError: (mensaje) => {
      this.escaneando = false;
      this.notificacion.error('Error', mensaje ?? 'Fallo al seguir el escaneo.');
    }
  });
}
 else {
      this.segundoPlano.detener('escaneo_dispositivos');
      localStorage.removeItem('escaneo_dispositivos');
      this.escaneando = false;
    }
  },
  error: () => {
    console.warn('❌ No se pudo verificar el estado del escaneo.');
  }
});

}


private iniciarSeguimiento(): void {
  this.segundoPlano.iniciar('escaneo_dispositivos', {
    intervaloMs: 2000,
    obtenerEstado: () => this.analisisVulnerabilidades.obtenerEstadoEscaneo(),
    alIterar: () => this.actualizarProgresoDesdeBackend(),
    alFinalizar: () => {
      this.escaneando = false;
      this.notificacion.success('Escaneo finalizado', 'El escaneo ha terminado correctamente.');
      this.crearNotificacionFinalizacion();
      this.cargarDispositivos();
    },
    alError: (mensaje?: string) => {
      this.escaneando = false;
      this.notificacion.error('Error', mensaje ?? 'Error en el seguimiento del escaneo.');
    }
  });
}





  ngAfterViewInit(): void {
    if (!this.dt) {
      console.warn('❌ Tabla de dispositivos (dt) no inicializada.');
    }
  }

  private cargarDispositivos(): void {
    this.serviciosDispositivos.listarDispositivosCompleto().subscribe({
      next: ({ data }) => {
        this.dispositivos = data;
        this.dispositivosOriginales = [...data];
      },
      error: (err) => console.error('❌ Error al obtener dispositivos:', err)
    });
  }

  private cargarSistemasOperativos(): void {
    this.serviciosDispositivos.listarSistemasOperativos().subscribe({
      next: (so) => {
        this.sistemasOperativos = so;
      },
      error: (err) => console.error('❌ Error al cargar sistemas operativos:', err)
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

        console.error('🧪 Error crudo recibido:', error);
      }
    });
  }

  guardarSistemaOperativo(): void {
    const nombre = this.nuevoSO.nombre_so.trim();

    if (!this.validaciones.validarNombreSO(nombre)) return;

    this.serviciosDispositivos.crearSistemaOperativo({ nombre_so: nombre }).subscribe({
      next: () => {
        this.notificacion.success('Éxito', 'Sistema operativo creado correctamente.');
        this.cargarSistemasOperativos();
        this.cerrarModal('crear_so');
      },
      error: (err) => {
        this.notificacion.error('Error', 'No se pudo crear el sistema operativo.');
        console.error('Error al guardar SO:', err);
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

  iniciarEscaneoManual(): void {
  this.escaneando = true;

  this.analisisVulnerabilidades.ejecutarEscaneoManual().subscribe({
    next: () => {
      this.notificacion.success('Escaneo', 'Escaneo iniciado correctamente.');
      this.iniciarSeguimiento();  // 👈
    },
    error: () => {
      this.escaneando = false;
      this.notificacion.error('Error', 'No se pudo iniciar el escaneo manual.');
    }
  });
}


actualizarProgresoDesdeBackend(): void {
  this.analisisVulnerabilidades.obtenerProgresoEscaneo().subscribe({
    next: (data: { total: number; procesados: number }) => {
      this.progresoTotal = data.total;
      this.progresoActual = data.procesados;
    },
    error: () => {
      this.progresoTotal = 0;
      this.progresoActual = 0;
    }
  });
}
abrirDialogoCancelarEscaneo(): void {
  this.confirmationService.confirm({
    message: '¿Estás seguro de cancelar el escaneo en curso?',
    header: 'Cancelar escaneo',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Sí, cancelar',
    rejectLabel: 'No',
    accept: () => {
      this.analisisVulnerabilidades.cancelarEscaneoManual().subscribe({
        next: () => {
          this.segundoPlano.detener('escaneo_dispositivos');
          this.escaneando = false;
          this.progresoActual = 0;
          this.progresoTotal = 0;
          this.notificacion.success('Escaneo cancelado', 'El escaneo se ha cancelado correctamente.');
        },
        error: () => {
          this.notificacion.error('Error', 'No se pudo cancelar el escaneo.');
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
    tipo_alerta_id: 1,  // o el que uses para "informativo"
    canal_alerta_id: 1, // canal por defecto (web)
    usuario_id,
    dispositivo_id: null
  };

  this.servicioAlertas.crearNotificacion(notificacion).subscribe({
    next: () => console.log('🔔 Notificación de escaneo creada.'),
    error: (err) => console.warn('⚠️ Error al crear notificación:', err)
  });
}

}
