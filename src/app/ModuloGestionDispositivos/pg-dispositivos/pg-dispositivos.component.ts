import { Component, OnInit,OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { Table } from 'primeng/table';
import { MessageService, SortEvent } from 'primeng/api';
import { ServiciosDispositivos } from '../../ModuloServiciosWeb/ServiciosDispositivos.component';
import { NotificacionService } from '../../ValidacionesFormularios/notificacion.service';
import { ValidacionesGeneralesService } from '../../ValidacionesFormularios/validaciones-dispositivo.service';
import { ServiciosConfiguracion } from '../../ModuloServiciosWeb/ServiciosConfiguracion.component'; // ✅ Importar
import { SesionUsuarioService } from '../../Seguridad/sesion-usuario.service'; // asegúrate del path correcto

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
export class PgDispositivosComponent implements OnInit, AfterViewInit,OnDestroy {
  @ViewChild('dt') dt!: Table;

  dispositivos: Dispositivo[] = [];
  dispositivosOriginales: Dispositivo[] = [];
  sistemasOperativos: SistemaOperativo[] = [];
  sistemasOperativosFiltrados: SistemaOperativo[] = [];
  modalEditarVisible: boolean = false;
  modalCrearSOVisible: boolean = false;
  escaneoEnProgreso: boolean = false;
  estadoEscaneoIntervalo: any = null;
  dialogoVisible: boolean = false;
puertosDispositivo: any[] = [];
dispositivoSeleccionado: any = null;

  dispositivoEditando: Dispositivo | null = null;
  sistemaOperativoSeleccionado: SistemaOperativo | null = null;
  ordenActivo: boolean | null = null;

 

  nuevoSO = {
    nombre_so: ''
  };

  constructor(
    private serviciosDispositivos: ServiciosDispositivos,
    private serviciosConfiguracion: ServiciosConfiguracion,
    private messageService: MessageService,
    private notificacion: NotificacionService,
    private validaciones: ValidacionesGeneralesService,
    private sesionUsuario: SesionUsuarioService
  ) {}

  ngOnInit(): void {
  this.cargarDispositivos();
  this.cargarSistemasOperativos();

  const enProgreso = localStorage.getItem('escaneoEnProgreso');
  if (enProgreso === 'true') {
    this.escaneoEnProgreso = true;
    this.verificarEstadoEscaneo(); // 👈 reanudar polling
  }
}
ngOnDestroy(): void {
  if (this.estadoEscaneoIntervalo) {
    clearInterval(this.estadoEscaneoIntervalo);
    this.estadoEscaneoIntervalo = null;
  }
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

  if (!this.validaciones.validarSistemaOperativoSeleccionado(this.sistemaOperativoSeleccionado)) {
  return;
}


  const payload = {
  nuevo_nombre: nombre,
  nuevo_sistema_operativo_id: this.sistemaOperativoSeleccionado!.sistema_operativo_id
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
  console.error('🧪 Error crudo recibido AQUIIIIIIIII:', error);

  let mensaje = 'No se pudo actualizar el dispositivo.';

  const detalle = error?.error?.detail;

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
  const usuario = this.sesionUsuario.obtenerUsuarioDesdeToken(); // ✅ obtener desde el token
  if (!usuario?.usuario_id) {
    this.notificacion.error('Error', 'No se pudo identificar al usuario.');
    return;
  }

  this.escaneoEnProgreso = true;
  localStorage.setItem('escaneoEnProgreso', 'true');

  this.serviciosConfiguracion.ejecutarEscaneoManual(usuario.usuario_id).subscribe({
    next: (res) => {
      this.notificacion.success('Éxito', res.mensaje || 'Escaneo iniciado.');
      this.verificarEstadoEscaneo();
    },
    error: (err) => {
      console.error('Error al iniciar escaneo:', err);
      this.notificacion.error('Error', 'No se pudo iniciar el escaneo.');
      this.escaneoEnProgreso = false;
      localStorage.removeItem('escaneoEnProgreso');
    }
  });
}


verificarEstadoEscaneo(): void {
  if (this.estadoEscaneoIntervalo) {
    clearInterval(this.estadoEscaneoIntervalo);
  }

  this.estadoEscaneoIntervalo = setInterval(() => {
    this.serviciosConfiguracion.obtenerEstadoEscaneo().subscribe({
      next: ({ estado }) => {
        if (estado === 'completado') {
          clearInterval(this.estadoEscaneoIntervalo);
          this.estadoEscaneoIntervalo = null;
          this.escaneoEnProgreso = false;
          localStorage.removeItem('escaneoEnProgreso'); // ✅ eliminar variable
          this.notificacion.success('Listo', 'El escaneo ha finalizado.');
          this.cargarDispositivos();
        } else if (estado.startsWith('error')) {
          clearInterval(this.estadoEscaneoIntervalo);
          this.estadoEscaneoIntervalo = null;
          this.escaneoEnProgreso = false;
          localStorage.removeItem('escaneoEnProgreso'); // ✅ también en caso de error
          this.notificacion.error('Error en escaneo', estado);
        }
      },
      error: (err) => {
        clearInterval(this.estadoEscaneoIntervalo);
        this.estadoEscaneoIntervalo = null;
        this.escaneoEnProgreso = false;
        localStorage.removeItem('escaneoEnProgreso'); // ✅ limpieza en error de red
      }
    });
  }, 3000);
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
  verPuertosDispositivo(dispositivo: any): void {
  this.dispositivoSeleccionado = dispositivo;
  this.puertosDispositivo = dispositivo.puertos || [];
  this.dialogoVisible = true;
}

 
}
