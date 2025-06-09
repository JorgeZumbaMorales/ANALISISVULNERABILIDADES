import { Component, ViewChild, OnInit } from '@angular/core';
import { Table } from 'primeng/table';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ServiciosConfiguracion } from '../../ModuloServiciosWeb/ServiciosConfiguracion.component';
import { ValidacionesConfiguracionEscaneoService } from '../../ValidacionesFormularios/validaciones-configuracion.service';
interface ConfiguracionEscaneo {
  id: number;
  nombre: string;
  estado: boolean;
  frecuencia_minutos?: number;
  fecha_inicio: string;
  fecha_fin?: string;
  horas?: string[];
  tipo: string; // ← agrega esto
}


@Component({
  selector: 'app-pg-configuracion-escaneos',
  templateUrl: './pg-configuracion-escaneos.component.html',
  styleUrls: ['./pg-configuracion-escaneos.component.css'],
  providers: [ConfirmationService, MessageService]
})
export class PgConfiguracionEscaneosComponent implements OnInit {

  modoEdicion: boolean = false;
  escaneoAutomatico = true;
  modalVisible = false;
  tabSeleccionada = 0;
  horaTemporal: Date | null = null;
  unidadFrecuencia: 'min' | 'hr' = 'min';

originalConfiguracionesFrecuencia: ConfiguracionEscaneo[] = [];
originalConfiguracionesHoras: ConfiguracionEscaneo[] = [];

// Estado actual de orden por columna
estadoOrdenFrecuencia: { [campo: string]: boolean | null } = {};
estadoOrdenHoras: { [campo: string]: boolean | null } = {};

  vistaSeleccionada: 'frecuencia' | 'hora' = 'frecuencia';
  minDate: Date = new Date(); // hoy
maxDate: Date = new Date(2030, 11, 31); // diciembre es mes 11 en JS
  camposHabilitados: boolean = true; // por defecto, en crear es true
  configuracionAEliminar: ConfiguracionEscaneo | null = null;
  @ViewChild('cd') confirmDialog!: any; // para acceder al dialog
  opcionesVisualizacion = [
  { label: 'Historial Configuraciones Por Frecuencia', value: 'frecuencia' },
  { label: 'Historial Configuraciones Por Hora', value: 'hora' }
];
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
  

  @ViewChild('dtFrecuencia') dtFrecuencia!: Table;
  @ViewChild('dtHoras') dtHoras!: Table;

  constructor(
    private servicioConfiguracion: ServiciosConfiguracion,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private validacionesConfiguracion: ValidacionesConfiguracionEscaneoService
  ) {}

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargarTipoConfiguracion('frecuencia');
    this.cargarTipoConfiguracion('horas');
  }

  private cargarTipoConfiguracion(tipo: 'frecuencia' | 'horas'): void {
    const servicio = tipo === 'frecuencia'
      ? this.servicioConfiguracion.listarConfiguracionesFrecuencia()
      : this.servicioConfiguracion.listarConfiguracionesHoras();

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

        if (tipo === 'frecuencia') {
  this.configuracionesFrecuencia = mapped;
  this.originalConfiguracionesFrecuencia = [...mapped]; // guardar copia original
  this.estadoOrdenFrecuencia = {}; // reiniciar estado de orden
} else {
  this.configuracionesHoras = mapped;
  this.originalConfiguracionesHoras = [...mapped]; // guardar copia original
  this.estadoOrdenHoras = {}; // reiniciar estado de orden
}

        this.actualizarEstadoEscaneoAutomatico();
      },
      error: (err) => console.error(`❌ Error al obtener configuraciones (${tipo})`, err)
    });
  }

  mostrarModal(): void {
  this.formulario = {
    nombre_configuracion_escaneo: '',
    tipo_escaneo_id: 1,
    frecuencia_minutos: null,
    fecha_inicio: null,
    fecha_fin: null,
    estado: true,
    horas: []
  };
  this.tabSeleccionada = 0;
  this.modoEdicion = false;
  this.modalVisible = true;
}


  cerrarModal(): void {
  this.modalVisible = false;
  this.modoEdicion = false;

  // Restaurar minDate a hoy
  this.minDate = new Date();
  this.minDate.setHours(0, 0, 0, 0);
}


  cambiarTipoEscaneo(index: number): void {
  if (this.modoEdicion) return;
  this.tabSeleccionada = index;
  this.resetFormulario(index === 0 ? 'frecuencia' : 'hora');
}



  agregarHora(): void {
    if (this.horaTemporal) {
      const horaStr = this.formatearHora(this.horaTemporal);
      if (!this.formulario.horas.includes(horaStr)) {
        this.formulario.horas.push(horaStr);
      }
      this.horaTemporal = null;
    }
  }

  private formatearHora(date: Date): string {
    return date.toLocaleTimeString('en-GB', { hour12: false });
  }

 guardarConfiguracion(): void {
  // Validar Nombre
  const errorNombre = this.validacionesConfiguracion.validarNombre(this.formulario.nombre_configuracion_escaneo);
  if (errorNombre) {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: errorNombre });
    return;
  }

  // Validar Fecha Inicio
  const errorFechaInicio = this.validacionesConfiguracion.validarFechaInicio(this.formulario.fecha_inicio, this.formulario.fecha_fin);
  if (errorFechaInicio) {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: errorFechaInicio });
    return;
  }

  // Validar Fecha Fin
  const errorFechaFin = this.validacionesConfiguracion.validarFechaFin(this.formulario.fecha_fin, this.formulario.fecha_inicio);
  if (errorFechaFin) {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: errorFechaFin });
    return;
  }

  // Validar Frecuencia o Horas según tab seleccionado
  if (this.tabSeleccionada === 0) {
    // Frecuencia
    const errorUnidad = this.validacionesConfiguracion.validarUnidadFrecuencia(this.unidadFrecuencia);
    if (errorUnidad) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: errorUnidad });
      return;
    }

    const errorFrecuencia = this.validacionesConfiguracion.validarFrecuencia(this.formulario.frecuencia_minutos, this.unidadFrecuencia);
    if (errorFrecuencia) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: errorFrecuencia });
      return;
    }
  } else {
    // Horas
    const errorHoras = this.validacionesConfiguracion.validarHoras(this.formulario.horas);
    if (errorHoras) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: errorHoras });
      return;
    }
  }

  // Si todas las validaciones pasan → preparar payload y guardar
  const payload = { ...this.formulario };
  this.normalizarFrecuencia(payload);

  // 👉 Si estamos en edición, actualizar; si no, crear
  if (this.modoEdicion && this.formulario.id) {
    this.servicioConfiguracion.actualizarConfiguracion(this.formulario.id, payload).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Configuración actualizada' });
        this.modalVisible = false;
        this.modoEdicion = false;
        this.cargarDatos();
      },
      error: (error) => {
        console.error('❌ Error al actualizar:', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar la configuración' });
      }
    });
  } else {
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
}



  private normalizarFrecuencia(payload: any): void {
  if (this.tabSeleccionada === 0 && payload.frecuencia_minutos !== null && payload.frecuencia_minutos !== undefined) {
    // Asegurar que sea int
    payload.frecuencia_minutos = parseInt(payload.frecuencia_minutos, 10);

    if (this.unidadFrecuencia === 'hr') {
      payload.frecuencia_minutos *= 60;
    }
  }
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
  const texto = (event.target as HTMLInputElement).value.toLowerCase();

  this.configuracionesFrecuencia = this.originalConfiguracionesFrecuencia.filter(config => {
    const fechaInicioFormateada = this.formatearFechaTexto(config.fecha_inicio);
    const fechaFinFormateada = this.formatearFechaTexto(config.fecha_fin);

    return (
      config.nombre.toLowerCase().includes(texto) ||
      (config.frecuencia_minutos?.toString().includes(texto)) ||
      fechaInicioFormateada.includes(texto) ||
      fechaFinFormateada.includes(texto) ||
      (config.estado ? 'activo' : 'inactivo').includes(texto)
    );
  });
}


  filtrarHoras(event: Event): void {
  const texto = (event.target as HTMLInputElement).value.toLowerCase();

  this.configuracionesHoras = this.originalConfiguracionesHoras.filter(config => {
    const fechaInicioFormateada = this.formatearFechaTexto(config.fecha_inicio);
    const fechaFinFormateada = this.formatearFechaTexto(config.fecha_fin);
    const horasTexto = config.horas?.join(', ') || '';

    return (
      config.nombre.toLowerCase().includes(texto) ||
      horasTexto.toLowerCase().includes(texto) ||
      fechaInicioFormateada.includes(texto) ||
      fechaFinFormateada.includes(texto) ||
      (config.estado ? 'activo' : 'inactivo').includes(texto)
    );
  });
}

  obtenerHorasTexto(horas: string[] | undefined): string {
  return horas?.join(', ') || '';
}

  get estadoTexto(): string {
    return this.formulario.estado ? 'Activado' : 'Desactivado';
  }
  editarConfiguracion(config: ConfiguracionEscaneo): void {
  this.formulario = {
    ...config,
        id: config.id,   // ← esto te falta
    nombre_configuracion_escaneo: config.nombre,
    tipo_escaneo_id: config.tipo === 'Frecuencia' ? 1 : 2,
    frecuencia_minutos: config.frecuencia_minutos || null,
    fecha_inicio: config.fecha_inicio ? new Date(config.fecha_inicio) : null,
    fecha_fin: config.fecha_fin ? new Date(config.fecha_fin) : null,
    horas: config.horas || [],
    estado: config.estado
  };

  // Seteo de tab
  this.tabSeleccionada = this.formulario.tipo_escaneo_id === 1 ? 0 : 1;

  // Seteo de camposHabilitados según el estado actual
  this.camposHabilitados = this.formulario.estado;

  // Ajuste de minDate → importante hacerlo al final
  this.ajustarMinDateParaFechas(this.formulario.fecha_inicio, this.formulario.fecha_fin);

  // Mostrar el modal
  this.modoEdicion = true;
  this.modalVisible = true;
}

onToggleEstado(): void {
  // Si estamos en modo edición → sí bloqueamos según el estado
  if (this.modoEdicion) {
    this.camposHabilitados = this.formulario.estado;
  } else {
    // Si estamos creando → los campos siempre habilitados, aunque el toggle esté en false
    this.camposHabilitados = true;
  }

  // Actualizar minDate si es necesario
  if (this.camposHabilitados) {
    this.minDate = new Date();
    this.minDate.setHours(0, 0, 0, 0);
  }
}






 get configuracionActiva(): ConfiguracionEscaneo | null {
  const activa = this.configuracionesFrecuencia.find(cfg => cfg.estado) ||
                 this.configuracionesHoras.find(cfg => cfg.estado) ||
                 null;

  // Sincronizar escaneoAutomatico visual
  this.escaneoAutomatico = !!activa;

  return activa;
}

permitirSoloNumeros(event: KeyboardEvent): void {
  const charCode = event.charCode;

  // Permitir solo números (códigos de 0 a 9 → códigos ASCII 48 a 57)
  if (charCode < 48 || charCode > 57) {
    event.preventDefault();
  }
}
private resetFormulario(tipo: 'frecuencia' | 'hora'): void {
  this.formulario = {
    nombre_configuracion_escaneo: '',
    tipo_escaneo_id: tipo === 'frecuencia' ? 1 : 2,
    frecuencia_minutos: tipo === 'frecuencia' ? null : undefined,
    fecha_inicio: null,
    fecha_fin: null,
    estado: true,
    horas: tipo === 'hora' ? [] : undefined
  };

  // Si quieres también limpiar la horaTemporal
  this.horaTemporal = null;
}
private ajustarMinDateParaFechas(fechaInicio: Date | null, fechaFin: Date | null): void {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  this.minDate = hoy;

  if (fechaInicio && fechaInicio < this.minDate) {
    this.minDate = new Date(fechaInicio);
    this.minDate.setHours(0, 0, 0, 0);
  }

  if (fechaFin && fechaFin < this.minDate) {
    this.minDate = new Date(fechaFin);
    this.minDate.setHours(0, 0, 0, 0);
  }
}
private actualizarEstadoEscaneoAutomatico(): void {
  // Si hay configuración activa → true, si no → false
  this.escaneoAutomatico = !!this.configuracionActiva;
}
onToggleEscaneoAutomatico(): void {
  if (!this.configuracionActiva) {
    return;
  }

  this.servicioConfiguracion.cambiarEstadoConfiguracion(this.configuracionActiva.id, false).subscribe({
    next: () => {
      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Escaneo automático desactivado'
      });

      // Forzamos el toggle a "off"
      this.escaneoAutomatico = false;

      // Recargamos las configuraciones para que ya no aparezca activa
      this.cargarDatos();
    },
    error: (error) => {
      console.error('❌ Error al desactivar el escaneo automático:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo desactivar el escaneo automático'
      });

      // Volvemos a poner el toggle en true si hubo error
      this.escaneoAutomatico = true;
    }
  });
}

confirmarEliminarConfiguracion(config: ConfiguracionEscaneo): void {
  this.configuracionAEliminar = config;

  this.confirmationService.confirm({
    header: 'Eliminar configuración',
    message: `¿Estás seguro de que deseas eliminar "${config.nombre}"?`,
    icon: 'pi pi-trash',
    acceptLabel: 'Eliminar',
    rejectLabel: 'Cancelar',
    accept: () => {
      this.eliminarConfiguracionConfirmada();
    },
    reject: () => {
      // si quieres, puedes hacer algo al cancelar
      this.configuracionAEliminar = null;
    }
  });
}

eliminarConfiguracionConfirmada(): void {
  if (!this.configuracionAEliminar) return;

  this.servicioConfiguracion.eliminarConfiguracion(this.configuracionAEliminar.id).subscribe({
    next: () => {
      this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Configuración eliminada correctamente' });
      this.cargarDatos();
      this.configuracionAEliminar = null;
    },
    error: (err) => {
      console.error('❌ Error al eliminar:', err);
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar la configuración' });
      this.configuracionAEliminar = null;
    }
  });
}
ordenPersonalizado(evento: any, tipo: 'frecuencia' | 'hora'): void {
  const campo = evento.field;
  const estadoOrden = tipo === 'frecuencia' ? this.estadoOrdenFrecuencia : this.estadoOrdenHoras;

  // Avanzar en el ciclo de orden: null → ascendente → descendente → null
  if (estadoOrden[campo] == null || estadoOrden[campo] === undefined) {
    estadoOrden[campo] = true; // ascendente
  } else if (estadoOrden[campo] === true) {
    estadoOrden[campo] = false; // descendente
  } else {
    estadoOrden[campo] = null; // quitar orden → volver a original
  }

  // Aplicar el orden o restaurar el original
  if (tipo === 'frecuencia') {
    if (estadoOrden[campo] == null) {
      this.configuracionesFrecuencia = [...this.originalConfiguracionesFrecuencia];
      this.dtFrecuencia.reset(); // para que se quite la flecha
      return;
    }
    this.aplicarOrden(evento, this.configuracionesFrecuencia, estadoOrden[campo]);
  } else {
    if (estadoOrden[campo] == null) {
      this.configuracionesHoras = [...this.originalConfiguracionesHoras];
      this.dtHoras.reset(); // para que se quite la flecha
      return;
    }
    this.aplicarOrden(evento, this.configuracionesHoras, estadoOrden[campo]);
  }
}
aplicarOrden(evento: any, datos: ConfiguracionEscaneo[], ascendente: boolean): void {
  const campo = evento.field as keyof ConfiguracionEscaneo;

  datos.sort((dato1, dato2) => {
    let valor1 = dato1[campo];
    let valor2 = dato2[campo];
    let resultado = 0;

    if (valor1 == null && valor2 != null) resultado = -1;
    else if (valor1 != null && valor2 == null) resultado = 1;
    else if (valor1 == null && valor2 == null) resultado = 0;
    else if (typeof valor1 === 'string' && typeof valor2 === 'string') {
      resultado = (valor1 ?? '').localeCompare(valor2 ?? '');
    } else {

      resultado = (valor1 ?? 0) < (valor2 ?? 0) ? -1 : (valor1 ?? 0) > (valor2 ?? 0) ? 1 : 0;
    }

    return (ascendente ? 1 : -1) * resultado;
  });
}


private formatearFechaTexto(fecha: string | undefined): string {
  if (!fecha) return '';

  const dateObj = new Date(fecha);
  if (isNaN(dateObj.getTime())) return '';

  // Devuelve 'dd-MM-yyyy' como lo ve el usuario en la tabla
  const dia = String(dateObj.getDate()).padStart(2, '0');
  const mes = String(dateObj.getMonth() + 1).padStart(2, '0');
  const anio = dateObj.getFullYear();

  return `${dia}-${mes}-${anio}`;
}


}
