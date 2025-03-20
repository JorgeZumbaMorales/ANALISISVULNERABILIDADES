import { Component, ViewChild, OnInit } from '@angular/core';
import { Table } from 'primeng/table';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ServiciosConfiguracion } from '../../ModuloServiciosWeb/ServiciosConfiguracion.component';

// ✅ Interfaz del objeto de configuración
interface ConfiguracionEscaneo {
  id: number; // ✅ Coincide con el backend
  nombre: string; // ✅ Coincide con el backend
  estado: boolean;
  frecuencia_minutos?: number; // ✅ Coincide con el backend
  fecha_inicio: string; // ✅ Coincide con el backend
  fecha_fin?: string; // ✅ Coincide con el backend
  horas?: string[]; // ✅ Coincide con el backend
}


@Component({
  selector: 'app-pg-configuracion-escaneos',
  templateUrl: './pg-configuracion-escaneos.component.html',
  styleUrls: ['./pg-configuracion-escaneos.component.css'],
  providers: [ConfirmationService, MessageService]
})
export class PgConfiguracionEscaneosComponent implements OnInit {

  escaneoAutomatico: boolean = true;
  modalVisible: boolean = false;
  
  configuracionesSeleccionadasFrecuencia: ConfiguracionEscaneo[] = [];
  configuracionesSeleccionadasHoras: ConfiguracionEscaneo[] = [];
  configuracionesFrecuencia: ConfiguracionEscaneo[] = [];
  configuracionesHoras: ConfiguracionEscaneo[] = [];

  @ViewChild('tablaFrecuencia') tablaFrecuencia!: Table;
  @ViewChild('tablaHoras') tablaHoras!: Table;

  @ViewChild('dtFrecuencia') dtFrecuencia!: Table;
  @ViewChild('dtHoras') dtHoras!: Table;
  constructor(
    private servicioConfiguracion: ServiciosConfiguracion,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.cargarDatos();
  }
  cargarDatos() {
    // 📌 Cargar configuraciones con frecuencia
    this.servicioConfiguracion.listarConfiguracionesFrecuencia().subscribe({
      next: (response) => {
        this.configuracionesFrecuencia = response.data.map((config: any) => ({
          id: config.id,
          nombre: config.nombre,
          estado: config.estado,
          frecuencia_minutos: config.frecuencia_minutos,
          fecha_inicio: config.fecha_inicio,
          fecha_fin: config.fecha_fin,
          tipo: 'Frecuencia' // ✅ Agregar el tipo
        }));
      },
      error: (error) => console.error('❌ Error al obtener configuraciones de frecuencia', error)
    });
  
    // 📌 Cargar configuraciones con horas
    this.servicioConfiguracion.listarConfiguracionesHoras().subscribe({
      next: (response) => {
        this.configuracionesHoras = response.data.map((config: any) => ({
          id: config.id,
          nombre: config.nombre,
          estado: config.estado,
          fecha_inicio: config.fecha_inicio,
          fecha_fin: config.fecha_fin,
          horas: config.horas || [],
          tipo: 'Hora' // ✅ Agregar el tipo
        }));
      },
      error: (error) => console.error('❌ Error al obtener configuraciones de horas', error)
    });
  }
  

  filtrarConfiguraciones(event: Event) {
    const valorBusqueda = (event.target as HTMLInputElement).value;
    this.tablaFrecuencia?.filterGlobal(valorBusqueda, 'contains');
    this.tablaHoras?.filterGlobal(valorBusqueda, 'contains');
  }
  mostrarModal() {
    this.modalVisible = true;
  }
  cerrarModal() {
    this.modalVisible = false;
  }
  editarConfiguracion(configuracion: ConfiguracionEscaneo) {
    console.log('Editar:', configuracion);
    this.messageService.add({ severity: 'info', summary: 'Edición', detail: 'Abrir modal para editar' });
  }
  eliminarConfiguracion(configuracion: ConfiguracionEscaneo) {
    this.confirmationService.confirm({
      message: '¿Está seguro de eliminar esta configuración?',
      accept: () => {
        this.servicioConfiguracion.eliminarConfiguracion(configuracion.id).subscribe({
          next: () => {
            this.cargarDatos();  // ✅ Recargar datos después de eliminar
            this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Configuración eliminada correctamente' });
          },
          error: (error) => {
            console.error('❌ Error al eliminar la configuración', error);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar la configuración' });
          }
        });
      }
    });
  }
  filtrarFrecuencia(event: Event) {
    this.dtFrecuencia?.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  filtrarHoras(event: Event) {
    this.dtHoras?.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }
}
