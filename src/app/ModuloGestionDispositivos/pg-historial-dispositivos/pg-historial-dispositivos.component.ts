import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Table } from 'primeng/table';
import { ServiciosDispositivos } from '../../ModuloServiciosWeb/ServiciosDispositivos.component';
import { MessageService } from 'primeng/api';
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

  modal = {
    visible: false,
    tipo: null as 'editar' | null
  };

  dispositivoEditando: Dispositivo | null = null;
  sistemaOperativoSeleccionado: SistemaOperativo | null = null;

  @ViewChild('dt') dt!: Table;

  constructor(private servicioDispositivos: ServiciosDispositivos,
    private messageService: MessageService,
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
      next: ({ data }) => this.dispositivos = data,
      error: (error) => console.error('Error al obtener dispositivos', error)
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
    if (this.dt) {
      this.dt.filterGlobal(inputValue, 'contains');
    }
  }

  abrirModal(tipo: 'editar', dispositivo?: Dispositivo): void {
    this.modal = { visible: true, tipo };

    if (tipo === 'editar' && dispositivo) {
      this.dispositivoEditando = { ...dispositivo };
      const seleccionado = this.sistemasOperativos.find(
        (so) => so.nombre_so === dispositivo.sistema_operativo
      );
      if (seleccionado) {
        this.sistemaOperativoSeleccionado = seleccionado;
        const yaIncluido = this.sistemasOperativosFiltrados.some(
          (so) => so.sistema_operativo_id === seleccionado.sistema_operativo_id
        );
        if (!yaIncluido) {
          this.sistemasOperativosFiltrados = [seleccionado, ...this.sistemasOperativosFiltrados];
        }
      } else {
        this.sistemaOperativoSeleccionado = null;
      }
    }
  }

  cerrarModal(): void {
    this.modal = { visible: false, tipo: null };
    this.dispositivoEditando = null;
    this.sistemaOperativoSeleccionado = null;
  }

  guardarCambios(): void {
    if (!this.dispositivoEditando) return;
  
    // ✅ Validar campo nombre vacío
    if (this.validaciones.campoVacio(this.dispositivoEditando.nombre_dispositivo)) {
      this.notificacion.warning('Campo requerido', 'El nombre del dispositivo no puede estar vacío.');
      return;
    }
  
    // ✅ Validar que haya seleccionado un sistema operativo
    if (!this.sistemaOperativoSeleccionado) {
      this.notificacion.warning('Campo requerido', 'Debe seleccionar un sistema operativo.');
      return;
    }
  
    const payload = {
      nuevo_nombre: this.dispositivoEditando.nombre_dispositivo,
      nuevo_sistema_operativo_id: this.sistemaOperativoSeleccionado.sistema_operativo_id,
    };
  
    this.servicioDispositivos.actualizarDispositivo(
      this.dispositivoEditando.dispositivo_id,
      payload
    ).subscribe({
      next: () => {
        this.notificacion.success('Dispositivo actualizado', 'Los cambios se guardaron correctamente.');
        this.cerrarModal();
        this.obtenerTodosLosDispositivos();
      },
      error: (err) => {
        console.error('Error al actualizar dispositivo', err);
        this.notificacion.error('Error', 'No se pudo actualizar el dispositivo.');
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
    alert('🧩 Aquí se abriría el formulario para añadir nuevo sistema operativo');
  }
}
