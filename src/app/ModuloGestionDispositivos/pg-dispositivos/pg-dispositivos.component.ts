import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
} from '@angular/core';

import { Table } from 'primeng/table';
import { MessageService, ConfirmationService, SortEvent } from 'primeng/api';
import { ConfirmDialog } from 'primeng/confirmdialog';

import { ServiciosDispositivos } from '../../ModuloServiciosWeb/ServiciosDispositivos.component';
import { ServiciosAnalisisVulnerabilidades } from '../../ModuloServiciosWeb/ServiciosAnalisisVulnerabilidades.component';
import { ServiciosSegundoPlano } from '../../ModuloServiciosWeb/ServiciosSegundoPlano.service';
import { ServiciosAlertas } from '../../ModuloServiciosWeb/ServiciosAlertas.component';

import { SesionUsuarioService } from '../../Seguridad/sesion-usuario.service';
import { NotificacionService } from '../../ValidacionesFormularios/notificacion.service';
import { ValidacionesGeneralesService } from '../../ValidacionesFormularios/validaciones-dispositivo.service';

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
export class PgDispositivosComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('cdCancelarEscaneo') cdCancelarEscaneo!: ConfirmDialog;
  @ViewChild('dt') dt!: Table;

  dispositivos: Dispositivo[] = [];
  dispositivosOriginales: Dispositivo[] = [];

  sistemasOperativos: SistemaOperativo[] = [];
  sistemasOperativosFiltrados: SistemaOperativo[] = [];

  modalEditarVisible = false;
  modalCrearSOVisible = false;

  escaneoEnProgreso = false;
  escaneoCompletado = false;
  notificacionEnviada = false;

  progresoTotal = 0;
  progresoActual = 0;
  estadoEscaneoFinal = '';

  dialogoVisible = false;
  puertosDispositivo: any[] = [];
  dispositivoSeleccionado: any = null;
  dispositivoEditando: Dispositivo | null = null;
  sistemaOperativoSeleccionado: SistemaOperativo | null = null;
  ordenActivo: boolean | null = null;

  usuarioIdActual: number | null = null;

  nuevoSO = { nombre_so: '' };

  constructor(
    private serviciosDispositivos: ServiciosDispositivos,
    private serviciosAnalisisVulnerabilidades: ServiciosAnalisisVulnerabilidades,
    private servicioSegundoPlano: ServiciosSegundoPlano,
    private servicioAlertas: ServiciosAlertas,
    private sesionUsuario: SesionUsuarioService,
    private notificacion: NotificacionService,
    private validaciones: ValidacionesGeneralesService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

 ngOnInit(): void {
  this.cargarDispositivos();
  this.cargarSistemasOperativos();

  this.escaneoEnProgreso = localStorage.getItem('escaneoEnProgreso') === 'true';

  // Actualizar el progreso antes de validar el estado final
  this.servicioSegundoPlano.reanudarSiEsNecesario(
    'escaneoEnProgreso',
    1000,  // Intervalo de 1 segundo
    () => this.serviciosAnalisisVulnerabilidades.obtenerEstadoEscaneo(),
    () => this.validarEstadoFinalDeEscaneo(),
    (mensaje) => this.finalizarConError(mensaje),
    () => this.actualizarProgresoDesdeBackend()  // Este es el punto donde se actualiza el progreso.
  );
}


ngAfterViewInit(): void {
  if (!this.dt) {
    console.warn('❌ Tabla de dispositivos (dt) no inicializada.');
  }
}

ngOnDestroy(): void {
  if (localStorage.getItem('escaneoEnProgreso') !== 'true') {
    this.servicioSegundoPlano.detenerProceso('escaneoEnProgreso');
    this.servicioSegundoPlano.detenerProceso('progreso_escaneo');
  }
}
/** 
 * ✅ Valida el estado final del escaneo y actúa en consecuencia.
 */
private validarEstadoFinalDeEscaneo(): void {
  this.serviciosAnalisisVulnerabilidades.obtenerEstadoEscaneo().subscribe({
    next: (estadoRes: any) => {
      const estado = estadoRes.estado;

      setTimeout(() => {
        this.escaneoEnProgreso = false;
        localStorage.removeItem('escaneoEnProgreso');

        if (estado === 'completado') {
          this.escaneoCompletado = true;
          this.notificacion.success('Listo', 'El escaneo ha finalizado.');
          this.crearNotificacionFinalizacion();
          this.cargarDispositivos();
        } else if (estado === 'cancelado') {
          this.notificacion.info('Escaneo cancelado', 'El escaneo fue cancelado correctamente.');
        }

        // Ya no necesitamos 'this.ngZone.run()' ni 'this.cdr.detectChanges()'
        this.escaneoEnProgreso = false;  // Actualizamos directamente la variable
      }, 300); // ⏳ Breve retardo visual para mostrar 100%
    },
    error: () => {
      this.finalizarConError('No se pudo obtener el estado final del escaneo.');
    }
  });
}




/**
 * ❌ Finaliza el proceso si ocurre un error crítico.
 */
private finalizarConError(mensaje?: string): void {
  this.escaneoEnProgreso = false;
  localStorage.removeItem('escaneoEnProgreso');
  this.notificacion.error('Error en escaneo', mensaje || 'Ocurrió un error inesperado.');
  // Ya no necesitamos 'this.ngZone.run()' ni 'this.cdr.detectChanges()'
}



/**
 * 🔄 Obtiene el progreso actual del backend (usado por polling).
 */
private actualizarProgresoDesdeBackend(): void {
  this.serviciosAnalisisVulnerabilidades.obtenerProgresoEscaneo().subscribe({
    next: (res: any) => {
      // Actualizamos las variables directamente sin 'ngZone.run()'
      if (res.total > 0) {
        this.progresoTotal = res.total;
      }
      if (res.procesados > 0) {
        this.progresoActual = res.procesados;
      }
    },
    error: () => {
      this.progresoTotal = 0;
      this.progresoActual = 0;
    }
  });
}


/**
 * 📥 Carga la lista completa de dispositivos detectados.
 */
private cargarDispositivos(): void {
  this.serviciosDispositivos.listarDispositivosCompleto().subscribe({
    next: ({ data }) => {
      this.dispositivos = data;
      this.dispositivosOriginales = [...data];
    },
    error: (err) => console.error('❌ Error al obtener dispositivos:', err)
  });
}

/**
 * 🧠 Carga los sistemas operativos disponibles desde el backend.
 */
private cargarSistemasOperativos(): void {
  this.serviciosDispositivos.listarSistemasOperativos().subscribe({
    next: (so) => {
      this.sistemasOperativos = so;
    },
    error: (err) => console.error('❌ Error al cargar sistemas operativos:', err)
  });
}

/**
 * 🔍 Filtra los dispositivos globalmente desde el input de búsqueda.
 */
filtrarDispositivos(event: Event): void {
  const valor = (event.target as HTMLInputElement).value;
  this.dt?.filterGlobal(valor, 'contains');
}

/**
 * 🔎 Busca coincidencias entre sistemas operativos a partir del input del autocomplete.
 */
buscarSistemaOperativo(event: { query: string }): void {
  const termino = event.query.trim().toLowerCase();

  this.sistemasOperativosFiltrados = termino.length >= 3
    ? this.sistemasOperativos.filter(so =>
        so.nombre_so.toLowerCase().includes(termino)
      )
    : [];
}
/**
 * 🪟 Abre modal de edición o creación de sistema operativo.
 */
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

/**
 * ❌ Cierra el modal correspondiente y resetea datos.
 */
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

/**
 * 💾 Guarda los cambios en un dispositivo editado.
 */
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

/**
 * 🆕 Guarda un nuevo sistema operativo.
 */
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
/**
 * ⚡ Inicia un escaneo manual de dispositivos.
 */
iniciarEscaneoDispositivos(): void {
  if (this.escaneoEnProgreso) {
    this.notificacion.error('En progreso', 'Ya hay un escaneo en curso.');
    return;
  }

  const usuario = this.sesionUsuario.obtenerUsuarioDesdeToken();
  if (!usuario?.usuario_id) {
    this.notificacion.error('Error', 'No se pudo identificar al usuario.');
    return;
  }

  this.usuarioIdActual = usuario.usuario_id;
  this.escaneoEnProgreso = true;
  localStorage.setItem('escaneoEnProgreso', 'true');

  this.serviciosAnalisisVulnerabilidades.ejecutarEscaneoManual().subscribe({
    next: (res) => {
      this.notificacion.success('Éxito', res.mensaje || 'Escaneo iniciado.');

      this.servicioSegundoPlano.iniciarProcesoConPolling(
        'escaneoEnProgreso',
        3000,
        () => this.serviciosAnalisisVulnerabilidades.obtenerEstadoEscaneo(),
        () => this.validarEstadoFinalDeEscaneo(),
        (mensaje) => this.finalizarConError(mensaje),
        () => this.actualizarProgresoDesdeBackend()
      );
    },
    error: (err) => {
      console.error('❌ Error al iniciar escaneo:', err);
      this.finalizarConError('No se pudo iniciar el escaneo.');
    }
  });
}
/**
 * ❔ Muestra el cuadro de confirmación para cancelar el escaneo actual.
 */
mostrarConfirmacionCancelarEscaneo(): void {
  this.confirmationService.confirm({
    header: 'Cancelar escaneo en curso',
    message: 'Esta acción detendrá el escaneo actual de dispositivos. ¿Desea continuar?',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Sí, cancelar',
    rejectLabel: 'No',
    accept: () => this.cancelarEscaneo(),
    reject: () => {
      this.notificacion.info('Acción cancelada', 'El escaneo continuará normalmente.');
    }
  });
}

/**
 * ⛔ Cancela el escaneo manual en curso.
 */
private cancelarEscaneo(): void {
  this.serviciosAnalisisVulnerabilidades.cancelarEscaneoManual().subscribe({
    next: () => {
      this.notificacion.success('Escaneo cancelado', 'El escaneo fue cancelado correctamente.');

      // Actualizamos directamente el estado
      this.escaneoEnProgreso = false;
      this.progresoActual = 0;
      this.progresoTotal = 0;

      localStorage.removeItem('escaneoEnProgreso');
      this.servicioSegundoPlano.detenerProceso('escaneoEnProgreso');

      this.notificacionEnviada = true; // Evita notificación final por cancelación
    },
    error: (err) => {
      console.error('❌ Error al cancelar escaneo:', err);
      this.notificacion.error('Error', 'No se pudo cancelar el escaneo.');
    }
  });
}

/**
 * 🔔 Envía una notificación al backend cuando el escaneo ha finalizado exitosamente.
 */
private crearNotificacionFinalizacion(): void {
  if (this.notificacionEnviada) return;

  const usuario_id = this.sesionUsuario.obtenerUsuarioDesdeToken()?.usuario_id;
  if (!usuario_id) return;

  this.notificacionEnviada = true;

  const notificacion = {
    mensaje_notificacion: 'Escaneo manual completado correctamente.',
    tipo_alerta_id: 1,
    canal_alerta_id: 1,
    usuario_id,
    dispositivo_id: null
  };

  this.servicioAlertas.crearNotificacion(notificacion).subscribe({
    next: () => console.log('🔔 Notificación enviada.'),
    error: (err) => console.warn('⚠️ Error al crear notificación:', err)
  });
}

/**
 * 🧯 Abre el diálogo de puertos abiertos de un dispositivo específico.
 */
verPuertosDispositivo(dispositivo: Dispositivo): void {
  this.dispositivoSeleccionado = dispositivo;
  this.puertosDispositivo = dispositivo.puertos || [];
  this.dialogoVisible = true;
}

/**
 * ↕️ Alterna el orden de la tabla con clics sucesivos.
 */
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

/**
 * 🧠 Aplica ordenamiento personalizado sobre el arreglo de dispositivos.
 */
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

}
