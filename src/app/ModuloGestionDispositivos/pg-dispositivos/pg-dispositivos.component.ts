import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Table } from 'primeng/table';
import { MessageService, SortEvent } from 'primeng/api';
import { ServiciosDispositivos } from '../../ModuloServiciosWeb/ServiciosDispositivos.component';
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
  @ViewChild('dt') dt!: Table;

  dispositivos: Dispositivo[] = [];
  dispositivosOriginales: Dispositivo[] = [];
  sistemasOperativos: SistemaOperativo[] = [];
  sistemasOperativosFiltrados: SistemaOperativo[] = [];
modalEditarVisible: boolean = false;
modalCrearSOVisible: boolean = false;


  dispositivoEditando: Dispositivo | null = null;
  sistemaOperativoSeleccionado: SistemaOperativo | null = null;
  ordenActivo: boolean | null = null;

 

  nuevoSO = {
    nombre_so: ''
  };

  constructor(
    private serviciosDispositivos: ServiciosDispositivos,
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

  cargarDispositivos(): void {
    this.serviciosDispositivos.listarDispositivosCompleto().subscribe({
      next: ({ data }) => {
        this.dispositivos = data;
        this.dispositivosOriginales = [...data];
      },
      error: (err) => console.error('Error al obtener dispositivos', err)
    });
  }

  cargarSistemasOperativos(): void {
    this.serviciosDispositivos.listarSistemasOperativos().subscribe({
      next: (so) => {
        this.sistemasOperativos = so;
      },
      error: (err) => console.error('Error al cargar sistemas operativos', err)
    });
  }

  filtrarDispositivos(event: Event): void {
    const input = (event.target as HTMLInputElement).value;
    this.dt?.filterGlobal(input, 'contains');
  }

  buscarSistemaOperativo(event: { query: string }) {
    const termino = event.query.toLowerCase();
    if (termino.length < 3) {
      this.sistemasOperativosFiltrados = [];
      return;
    }

    this.sistemasOperativosFiltrados = this.sistemasOperativos.filter(so =>
      so.nombre_so.toLowerCase().includes(termino)
    );
  }

  abrirModal(tipo: 'editar' | 'crear_so', dispositivo?: Dispositivo): void {
  if (tipo === 'editar' && dispositivo) {
    this.dispositivoEditando = { ...dispositivo };
    const seleccionado = this.sistemasOperativos.find(so => so.nombre_so === dispositivo.sistema_operativo);
    this.sistemaOperativoSeleccionado = seleccionado || null;
    this.modalEditarVisible = true;
  }

  if (tipo === 'crear_so') {
    this.nuevoSO = { nombre_so: '' };
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
    this.nuevoSO = { nombre_so: '' };
  }
}


  guardarCambios(): void {
  if (!this.dispositivoEditando) return;

  const nombre = this.dispositivoEditando.nombre_dispositivo;

  if (!this.validaciones.validarNombreDispositivo(nombre)) return;

  if (!this.sistemaOperativoSeleccionado) {
    return this.notificacion.warning('Campo requerido', 'Debe seleccionar un sistema operativo.');
  }

  const payload = {
    nuevo_nombre: nombre,
    nuevo_sistema_operativo_id: this.sistemaOperativoSeleccionado.sistema_operativo_id
  };

  this.serviciosDispositivos.actualizarDispositivo(this.dispositivoEditando.dispositivo_id, payload).subscribe({
    next: () => {
      this.notificacion.success('Dispositivo actualizado', 'Los cambios se guardaron correctamente.');
      this.cerrarModal('editar');
      this.cargarDispositivos();
    },
    error: (err) => {
      console.error('Error al actualizar dispositivo', err);
      this.notificacion.error('Error', 'No se pudo actualizar el dispositivo.');
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
      console.error('Error al guardar SO:', err);
      this.notificacion.error('Error', 'No se pudo crear el sistema operativo.');
    }
  });
}


  iniciarEscaneoDispositivos(): void {
    console.log('🔍 Iniciando escaneo de dispositivos...');
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

  ordenarLista(event: SortEvent): void {
    const campo = event.field as string;
    const orden = event.order ?? 1;

    this.dispositivos.sort((a: any, b: any) => {
      const valor1 = a[campo];
      const valor2 = b[campo];
      let resultado: number;

      if (valor1 == null && valor2 != null) resultado = -1;
      else if (valor1 != null && valor2 == null) resultado = 1;
      else if (valor1 == null && valor2 == null) resultado = 0;
      else if (typeof valor1 === 'string' && typeof valor2 === 'string') resultado = valor1.localeCompare(valor2);
      else resultado = valor1 < valor2 ? -1 : valor1 > valor2 ? 1 : 0;

      return orden * resultado;
    });
  }

 
}
