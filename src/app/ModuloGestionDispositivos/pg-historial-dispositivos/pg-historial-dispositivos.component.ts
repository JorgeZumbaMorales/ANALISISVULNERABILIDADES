import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Table } from 'primeng/table';
import { ServiciosDispositivos } from '../../ModuloServiciosWeb/ServiciosDispositivos.component';
import { MessageService,SortEvent} from 'primeng/api';
import { NotificacionService } from '../../ValidacionesFormularios/notificacion.service';
import { ValidacionesGeneralesService } from '../../ValidacionesFormularios/validaciones-dispositivo.service';
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
}

@Component({
  selector: 'app-pg-historial-dispositivos',
  templateUrl: './pg-historial-dispositivos.component.html',
  styleUrls: ['./pg-historial-dispositivos.component.css']
})
export class PgHistorialDispositivosComponent implements OnInit, AfterViewInit {
  dispositivos: Dispositivo[] = [];
  sistemasOperativos: SistemaOperativo[] = [];
  sistemasOperativosFiltrados: SistemaOperativo[] = [];
  dispositivoEditando: Dispositivo | null = null;
  sistemaOperativoSeleccionado: SistemaOperativo | null = null;
  ordenActual: { field: string; order: number | null } = { field: '', order: null };
  dispositivosOriginales: Dispositivo[] = []; // Guarda el array original sin ordenar
  modal = { visible: false, tipo: null as 'editar' | null };
  modalCrearSOVisible: boolean = false;
nuevoSO = { nombre_so: '' };
  accionesVisibles: { [dispositivo_id: number]: number } = {};
  modalHistorialVisible: boolean = false;
historialIps: { ip_asignacion_id: number; ip: string; fecha: string }[] = [];

  @ViewChild('dt') dt!: Table;
  dispositivoSeleccionado: any = null;
puertosDispositivo: any[] = [];
dialogoVisible: boolean = false;
ipSeleccionada: { ip_asignacion_id: number, ip: string, fecha: string } | null = null;

  constructor(
    private servicioDispositivos: ServiciosDispositivos,
    private notificacion: NotificacionService,
    private validaciones: ValidacionesGeneralesService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.obtenerTodosLosDispositivos();
    this.cargarSistemasOperativos();
  }

  ngAfterViewInit() {
    if (!this.dt) console.warn('❌ dt no está inicializado aún');
  }

  obtenerTodosLosDispositivos() {
  this.servicioDispositivos.listarTodosLosDispositivosCompleto().subscribe({
    next: ({ data }) => {
      this.dispositivos = data;
      this.dispositivosOriginales = [...data]; // ✅ Copia el array original para restaurar luego
    },
    error: (err) => console.error('Error al obtener dispositivos', err)
  });
}


  cargarSistemasOperativos(): void {
    this.servicioDispositivos.listarSistemasOperativos().subscribe({
      next: (so) => {
        this.sistemasOperativos = so;
        this.sistemasOperativosFiltrados = so.slice(0, 10);
      },
      error: (err) => console.error('Error al cargar sistemas operativos', err),
    });
  }

  buscarSistemaOperativo(event: { query: string }) {
    const termino = event.query.trim();
    if (termino.length < 3) {
  this.sistemasOperativosFiltrados = [];
  return;
}


    this.servicioDispositivos.buscarSistemasOperativos(termino).subscribe({
      next: (data) => this.sistemasOperativosFiltrados = data,
      error: (err) => console.error('❌ Error al buscar SO:', err),
    });
  }

  filtrarDispositivos(event: Event) {
    const inputValue = (event.target as HTMLInputElement).value;
    this.dt?.filterGlobal(inputValue, 'contains');
  }

  abrirModal(tipo: 'editar', dispositivo?: Dispositivo): void {
    this.modal = { visible: true, tipo };
    if (tipo === 'editar' && dispositivo) {
      this.dispositivoEditando = { ...dispositivo };
      this.preseleccionarSO(dispositivo.sistema_operativo);
    }
  }

  cerrarModal(): void {
    this.modal = { visible: false, tipo: null };
    this.dispositivoEditando = null;
    this.sistemaOperativoSeleccionado = null;
  }

  preseleccionarSO(nombre_so: string) {
    const soEncontrado = this.sistemasOperativos.find(so => so.nombre_so === nombre_so);
    if (soEncontrado) {
      this.sistemaOperativoSeleccionado = soEncontrado;

      if (!this.sistemasOperativosFiltrados.some(so => so.sistema_operativo_id === soEncontrado.sistema_operativo_id)) {
        this.sistemasOperativosFiltrados.unshift(soEncontrado);
      }
    } else {
      this.sistemaOperativoSeleccionado = null;
    }
  }

  guardarCambios(): void {
  if (!this.dispositivoEditando) return;

  const nombre = this.dispositivoEditando.nombre_dispositivo;

  // 🟢 Validación reutilizada
  if (!this.validaciones.validarNombreDispositivo(nombre)) return;

  if (!this.validaciones.validarSistemaOperativoSeleccionado(this.sistemaOperativoSeleccionado)) {
    return;
  }

  const payload = {
  nuevo_nombre: nombre,
  nuevo_sistema_operativo_id: this.sistemaOperativoSeleccionado!.sistema_operativo_id,
  precision_so: 100  // al actualizar manualmente, siempre 100%
};


  this.servicioDispositivos.actualizarDispositivo(this.dispositivoEditando.dispositivo_id, payload).subscribe({
    next: () => {
      this.notificacion.success('Dispositivo actualizado', 'Los cambios se guardaron correctamente.');
      this.cerrarModal();
      this.obtenerTodosLosDispositivos();
    },
    error: (error) => {
      console.error('🧪 Error crudo recibido HISTORIAL:', error);

      let mensaje = 'No se pudo actualizar el dispositivo.';

      const detalle = error?.error?.detail;
      if (typeof detalle === 'string') {
        const match = detalle.match(/(?:\d{3}: )?(.*)/);
        mensaje = match ? match[1].trim() : detalle;
      } else if (typeof error?.message === 'string') {
        mensaje = error.message;
      }

      this.notificacion.error('Error', mensaje);
    }
  });
}



  eliminarDispositivo(dispositivo: Dispositivo): void {
    this.confirmationService.confirm({
      message: `¿Estás seguro de eliminar el dispositivo "${dispositivo.nombre_dispositivo}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.servicioDispositivos.eliminarDispositivo(dispositivo.dispositivo_id).subscribe({
          next: (res) => {
            this.notificacion.success('Dispositivo eliminado', res.message || 'El dispositivo fue eliminado correctamente.');
            this.obtenerTodosLosDispositivos();
          },
          error: (err) => {
            console.error('Error al eliminar dispositivo:', err);
            this.notificacion.error('Error', 'No se pudo eliminar el dispositivo.');
          }
        });
      }
    });
  }

  abrirFormularioSO(): void {
  this.nuevoSO = { nombre_so: '' };
  this.modalCrearSOVisible = true;
}

  ordenarDispositivosRemovible(event: SortEvent): void {
  const field = event.field ?? '';
  const order = event.order ?? null;

  if (!field || order === null) return;

  // Si se hace clic una tercera vez en el mismo campo, se resetea el orden
  if (this.ordenActual.field === field && this.ordenActual.order === -1) {
    this.ordenActual = { field: '', order: null };
    this.dispositivos = [...this.dispositivosOriginales];
    this.dt.reset();
    return;
  }

  this.ordenActual = { field, order };

  this.dispositivos.sort((a: any, b: any) => {
    const valor1 = a[field as keyof Dispositivo];
    const valor2 = b[field as keyof Dispositivo];

    let resultado = 0;

    if (valor1 == null && valor2 != null) resultado = -1;
    else if (valor1 != null && valor2 == null) resultado = 1;
    else if (valor1 == null && valor2 == null) resultado = 0;
    else if (typeof valor1 === 'string' && typeof valor2 === 'string') resultado = valor1.localeCompare(valor2);
    else resultado = valor1 < valor2 ? -1 : valor1 > valor2 ? 1 : 0;

    return order * resultado;
  });
}
guardarSistemaOperativo(): void {
  const nombre = this.nuevoSO.nombre_so.trim();

  if (!this.validaciones.validarNombreSO(nombre)) return;

  this.servicioDispositivos.crearSistemaOperativo({ nombre_so: nombre }).subscribe({
    next: () => {
      this.notificacion.success('Éxito', 'Sistema operativo creado correctamente.');
      this.cargarSistemasOperativos();
      this.cerrarModalCrearSO();
    },
    error: (err) => {
      console.error('Error al guardar SO:', err);
      this.notificacion.error('Error', 'No se pudo crear el sistema operativo.');
    }
  });
}
cerrarModalCrearSO(): void {
  this.modalCrearSOVisible = false;
  this.nuevoSO = { nombre_so: '' };
}
alternarGrupoAcciones(dispositivo_id: number): void {
  this.accionesVisibles[dispositivo_id] =
    this.accionesVisibles[dispositivo_id] === 1 ? 0 : 1;
}

verPuertosDispositivo(dispositivo: any): void {
  this.dispositivoSeleccionado = dispositivo;
  this.puertosDispositivo = dispositivo.puertos || [];
  this.dialogoVisible = true;
}

verHistorialIPs(dispositivo: any): void {
  this.servicioDispositivos.obtenerHistorialIps(dispositivo.dispositivo_id).subscribe({
    next: ({ data }) => {
      this.historialIps = data;
      this.modalHistorialVisible = true;
    },
    error: (err) => {
      console.error('Error al obtener historial de IPs:', err);
      this.notificacion.error('Error', 'No se pudo obtener el historial de IPs.');
    }
  });
}

confirmarEliminarIp(ip: any): void {
  this.confirmationService.confirm({
    message: `¿Deseas eliminar la IP ${ip.ip}?`,
    header: 'Eliminar IP',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      this.servicioDispositivos.eliminarIp(ip.ip_asignacion_id).subscribe({
        next: (res) => {
          this.notificacion.success('Eliminado', res.message || 'IP eliminada correctamente.');
          this.historialIps = this.historialIps.filter(item => item.ip_asignacion_id !== ip.ip_asignacion_id);
          this.ipSeleccionada = null;
        },
        error: () => {
          this.notificacion.error('Error', 'No se pudo eliminar la IP.');
        }
      });
    }
  });
}


eliminarIpAsignada(): void {
  if (!this.ipSeleccionada) return;

  this.confirmationService.confirm({
    header: 'Confirmar eliminación',
    message: `¿Estás seguro de eliminar la IP ${this.ipSeleccionada.ip}?`,
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Eliminar',
    rejectLabel: 'Cancelar',

    accept: () => {
      const ipId = this.ipSeleccionada!.ip_asignacion_id;

      this.servicioDispositivos.eliminarIp(ipId).subscribe({
        next: () => {
          this.notificacion.success('IP eliminada', `La IP ${this.ipSeleccionada!.ip} fue eliminada correctamente.`);
          this.historialIps = this.historialIps.filter(ip => ip.ip_asignacion_id !== ipId);
          this.ipSeleccionada = null;
        },
        error: () => {
          this.notificacion.error('Error', 'No se pudo eliminar la IP.');
        }
      });
    }
  });
}

seleccionarIP(ip: any): void {
  this.ipSeleccionada = this.ipSeleccionada?.ip_asignacion_id === ip.ip_asignacion_id ? null : ip;
}

}
