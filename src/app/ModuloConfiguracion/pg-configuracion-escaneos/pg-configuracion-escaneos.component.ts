import { Component, ViewChild, OnInit } from '@angular/core';
import { Table } from 'primeng/table';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ServiciosConfiguracion } from '../../ModuloServiciosWeb/ServiciosConfiguracion.component';

interface ConfiguracionEscaneo {
  id: number;
  nombre: string;
  estado: boolean;
  frecuencia_minutos?: number;
  fecha_inicio: string;
  fecha_fin?: string;
  horas?: string[];
}

@Component({
  selector: 'app-pg-configuracion-escaneos',
  templateUrl: './pg-configuracion-escaneos.component.html',
  styleUrls: ['./pg-configuracion-escaneos.component.css'],
  providers: [ConfirmationService, MessageService]
})
export class PgConfiguracionEscaneosComponent implements OnInit {

  escaneoAutomatico = true;
  modalVisible = false;
  tabSeleccionada = 0;
  horaTemporal: Date | null = null;
  unidadFrecuencia: 'min' | 'hr' = 'min';

  formulario: any = {
    nombre_configuracion_escaneo: '',
    tipo_escaneo_id: 1,
    frecuencia_minutos: null,
    fecha_inicio: null,
    fecha_fin: null,
    estado: true,
    horas: []
  };

  configuracionesFrecuencia: ConfiguracionEscaneo[] = [];
  configuracionesHoras: ConfiguracionEscaneo[] = [];
  configuracionesSeleccionadasFrecuencia: ConfiguracionEscaneo[] = [];
  configuracionesSeleccionadasHoras: ConfiguracionEscaneo[] = [];

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

  cargarDatos(): void {
    const cargar = (tipo: 'frecuencia' | 'horas') => {
      const servicio = tipo === 'frecuencia' ? this.servicioConfiguracion.listarConfiguracionesFrecuencia() : this.servicioConfiguracion.listarConfiguracionesHoras();

      servicio.subscribe({
        next: (response) => {
          const mapped = response.data.map((config: any) => ({
            id: config.id,
            nombre: config.nombre,
            estado: config.estado,
            frecuencia_minutos: config.frecuencia_minutos,
            fecha_inicio: config.fecha_inicio,
            fecha_fin: config.fecha_fin,
            horas: config.horas || [],
            tipo: tipo === 'frecuencia' ? 'Frecuencia' : 'Hora'
          }));

          tipo === 'frecuencia' ? this.configuracionesFrecuencia = mapped : this.configuracionesHoras = mapped;
        },
        error: (err) => console.error(`❌ Error al obtener configuraciones (${tipo})`, err)
      });
    };

    cargar('frecuencia');
    cargar('horas');
  }

  mostrarModal(): void {
    this.modalVisible = true;
  }

  cerrarModal(): void {
    this.modalVisible = false;
  }

  cambiarTipoEscaneo(index: number): void {
    this.tabSeleccionada = index;
    this.formulario.tipo_escaneo_id = index === 0 ? 1 : 2;
    this.formulario.frecuencia_minutos = index === 0 ? null : undefined;
    this.formulario.horas = index === 1 ? [] : undefined;
  }

  agregarHora(): void {
    if (this.horaTemporal) {
      const horaStr = this.horaTemporal.toLocaleTimeString('en-GB', { hour12: false });
      if (!this.formulario.horas.includes(horaStr)) {
        this.formulario.horas.push(horaStr);
      }
      this.horaTemporal = null;
    }
  }

  guardarConfiguracion(): void {
    const payload = { ...this.formulario };
  
    if (this.tabSeleccionada === 0 && this.unidadFrecuencia === 'hr' && payload.frecuencia_minutos) {
      payload.frecuencia_minutos = payload.frecuencia_minutos * 60;
    }
  
    this.servicioConfiguracion.crearConfiguracion(payload).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Configuración guardada' });
        this.modalVisible = false;
        this.cargarDatos();
      },
      error: (error) => {
        console.error('❌ Error al guardar:', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar la configuración' });
      }
    });
  }
  

  eliminarConfiguracion(config: ConfiguracionEscaneo): void {
    this.confirmationService.confirm({
      message: '¿Está seguro de eliminar esta configuración?',
      accept: () => {
        this.servicioConfiguracion.eliminarConfiguracion(config.id).subscribe({
          next: () => {
            this.cargarDatos();
            this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Configuración eliminada correctamente' });
          },
          error: (err) => {
            console.error('❌ Error al eliminar:', err);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar' });
          }
        });
      }
    });
  }

  filtrarFrecuencia(event: Event): void {
    this.dtFrecuencia?.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  filtrarHoras(event: Event): void {
    this.dtHoras?.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }
}
