import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Table } from 'primeng/table';
import { ServiciosDispositivos } from '../../ModuloServiciosWeb/ServiciosDispositivos.component';
import { MessageService } from 'primeng/api';
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
  ultima_ip: string;
  estado: boolean;
}

@Component({
  selector: 'app-pg-dispositivos',
  templateUrl: './pg-dispositivos.component.html',
  styleUrls: ['./pg-dispositivos.component.css']
})
export class PgDispositivosComponent implements OnInit, AfterViewInit {
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

  constructor(private serviciosDispositivos: ServiciosDispositivos,
    private messageService: MessageService,
    private notificacion: NotificacionService,
  private validaciones: ValidacionesGeneralesService
  ) {}

  ngOnInit(): void {
    this.cargarDispositivos();
    this.cargarSistemasOperativos();
  }

  ngAfterViewInit(): void {
    if (!this.dt) console.warn('❌ dt no está inicializado aún');
  }

  buscarSistemaOperativo(event: { query: string }) {
    const termino = event.query.trim();
    if (termino.length < 3) {
      this.sistemasOperativosFiltrados = [];
      return;
    }

    this.serviciosDispositivos.buscarSistemasOperativos(termino).subscribe({
      next: (data) => {
        console.log('📦 Sistemas operativos recibidos:', data);
        this.sistemasOperativosFiltrados = data;
      },
      error: (err) => console.error('❌ Error al buscar SO:', err),
    });
  }

  cargarDispositivos(): void {
    this.serviciosDispositivos.listarDispositivosCompleto().subscribe({
      next: ({ data }) => (this.dispositivos = data),
      error: (err) => console.error('Error al obtener dispositivos', err),
    });
  }

  cargarSistemasOperativos(): void {
    this.serviciosDispositivos.listarSistemasOperativos().subscribe({
      next: (so) => {
        this.sistemasOperativos = so;
        this.sistemasOperativosFiltrados = so.slice(0, 10);
      },
      error: (err) => console.error('Error al cargar sistemas operativos', err),
    });
  }

  filtrarDispositivos(event: Event): void {
    const input = (event.target as HTMLInputElement).value;
    if (this.dt) this.dt.filterGlobal(input, 'contains');
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
  
    // 🟨 Validar que no esté vacío
    if (this.validaciones.campoVacio(this.dispositivoEditando.nombre_dispositivo)) {
      this.notificacion.warning('Campo requerido', 'El nombre del dispositivo no puede estar vacío.');
      return;
    }
  
    // 🔴 Validar longitud mínima y máxima (por ejemplo: entre 3 y 100 caracteres)
    if (!this.validaciones.longitudValida(this.dispositivoEditando.nombre_dispositivo, 3, 100)) {
      this.notificacion.warning('Longitud inválida', 'El nombre debe tener entre 3 y 100 caracteres.');
      return;
    }
  
    // 🔴 Validar que haya un sistema operativo seleccionado
    if (!this.sistemaOperativoSeleccionado) {
      this.notificacion.warning('Campo requerido', 'Debe seleccionar un sistema operativo.');
      return;
    }
  
    // ✅ Si pasa todas las validaciones
    const payload = {
      nuevo_nombre: this.dispositivoEditando.nombre_dispositivo,
      nuevo_sistema_operativo_id: this.sistemaOperativoSeleccionado.sistema_operativo_id,
    };
  
    this.serviciosDispositivos.actualizarDispositivo(
      this.dispositivoEditando.dispositivo_id,
      payload
    ).subscribe({
      next: () => {
        this.notificacion.success('Dispositivo actualizado', 'Los cambios se guardaron correctamente.');
        this.cerrarModal();
        this.cargarDispositivos();
      },
      error: (err) => {
        console.error('Error al actualizar dispositivo', err);
        this.notificacion.error('Error', 'No se pudo actualizar el dispositivo.');
      }
    });
  }
  
  
  

  abrirFormularioSO(): void {
    alert('🧩 Aquí se abriría el formulario para añadir nuevo sistema operativo');
  }

}
