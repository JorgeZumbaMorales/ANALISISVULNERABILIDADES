import { Component, ViewChild, OnInit } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { ConfirmationService, MessageService, PrimeTemplate } from 'primeng/api';
import { ServiciosConfiguracion } from '../../ModuloServiciosWeb/ServiciosConfiguracion.component';
import { ValidacionesConfiguracionEscaneoService } from '../../ValidacionesFormularios/validaciones-configuracion.service';
import { Toast } from 'primeng/toast';
import { Button, ButtonDirective } from 'primeng/button';
import { Card } from 'primeng/card';
import { NgIf, NgFor, NgClass, DatePipe } from '@angular/common';
import { Tag } from 'primeng/tag';
import { Chip } from 'primeng/chip';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { Tooltip } from 'primeng/tooltip';
import { FormsModule } from '@angular/forms';
import { SelectButton } from 'primeng/selectbutton';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Dialog } from 'primeng/dialog';
import { TabView, TabPanel } from 'primeng/tabview';
import { IftaLabel } from 'primeng/iftalabel';
import { DatePicker } from 'primeng/datepicker';
import { DropdownModule } from 'primeng/dropdown';
import { ConfirmDialog } from 'primeng/confirmdialog';
interface ConfiguracionEscaneo {
  id: number;
  nombre: string;
  estado: boolean;
  frecuencia_minutos?: number;
  fecha_inicio: string;
  fecha_fin?: string;
  horas?: string[];
  tipo: string; // ← agrega esto
  unidad_frecuencia?: 'min' | 'hr';
  frecuencia_texto?: string;
}
@Component({
  standalone: true,
  selector: 'app-pg-configuracion-escaneos',
  templateUrl: './pg-configuracion-escaneos.component.html',
  styleUrls: ['./pg-configuracion-escaneos.component.css'],
  providers: [ConfirmationService, MessageService],
  imports: [Toast, Button, Card, NgIf, Tag, NgFor, Chip, ToggleSwitch, Tooltip, FormsModule, SelectButton, TableModule, PrimeTemplate, IconField, InputIcon, InputText, Dialog, TabView, TabPanel, IftaLabel, DatePicker, DropdownModule, ConfirmDialog, NgClass, ButtonDirective, DatePipe]
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
  estadoOrdenFrecuencia: { [campo: string]: boolean | null } = {};
  estadoOrdenHoras: { [campo: string]: boolean | null } = {};
  vistaSeleccionada: 'frecuencia' | 'hora' = 'frecuencia';
  minDate: Date = new Date(); // hoy
  maxDate: Date = new Date(2030, 11, 31);
  camposHabilitados: boolean = true;
  configuracionAEliminar: ConfiguracionEscaneo | null = null;
  @ViewChild('cd') confirmDialog!: any;
  opcionesVisualizacion = [
    { label: 'Historial Configuraciones Por Frecuencia', value: 'frecuencia' },
    { label: 'Historial Configuraciones Por Hora', value: 'hora' }
  ];
  formulario: any = {
    nombre_configuracion_escaneo: '',
    tipo_escaneo_id: 1,
    frecuencia_minutos: null,
    unidad_frecuencia: 'min',
    fecha_inicio: null,
    fecha_fin: null,
    estado: true,
    horas: []
  };

  configuracionesFrecuencia: ConfiguracionEscaneo[] = [];
  configuracionesHoras: ConfiguracionEscaneo[] = [];
  unidadesFrecuencia = [
    { label: 'Minutos', value: 'minutos' },
    { label: 'Horas', value: 'horas' }
  ];
  @ViewChild('dtFrecuencia') dtFrecuencia!: Table;
  @ViewChild('dtHoras') dtHoras!: Table;
  constructor(
    private servicioConfiguracion: ServiciosConfiguracion,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private validacionesConfiguracion: ValidacionesConfiguracionEscaneoService
  ) { }
  ngOnInit() {
    if (!this.vistaSeleccionada) {
      this.vistaSeleccionada = 'frecuencia';
    }
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
        console.log(`📦 Respuesta del backend (${tipo}):`, response.data);
        const mapped = response.data.map((config: any) => {
          const unidadTexto = config.unidad_frecuencia === 'hr' ? 'horas' : 'minutos';
          const frecuenciaTexto = config.frecuencia_minutos ? `${config.frecuencia_minutos} ${unidadTexto}` : '';

          return {
            id: config.id,
            nombre: config.nombre,
            estado: config.estado,
            frecuencia_minutos: config.frecuencia_minutos,
            fecha_inicio: config.fecha_inicio,
            fecha_fin: config.fecha_fin,
            horas: config.horas || [],
            tipo: tipo === 'frecuencia' ? 'Frecuencia' : 'Hora',
            unidad_frecuencia: config.unidad_frecuencia,
            frecuencia_texto: frecuenciaTexto
          };
        });
        if (tipo === 'frecuencia') {
          this.configuracionesFrecuencia = mapped;
          this.originalConfiguracionesFrecuencia = [...mapped];
          this.estadoOrdenFrecuencia = {};
        } else {
          this.configuracionesHoras = mapped;
          this.originalConfiguracionesHoras = [...mapped];
          this.estadoOrdenHoras = {};
        }
        this.actualizarEstadoEscaneoAutomatico();
      },
      error: (err) => console.error(`Error al obtener configuraciones (${tipo})`, err)
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
    this.minDate = new Date();
    this.minDate.setHours(0, 0, 0, 0);
  }
  cambiarTipoEscaneo(index: number): void {
    if (this.modoEdicion) return;
    this.tabSeleccionada = index;
    this.resetFormulario(index === 0 ? 'frecuencia' : 'hora');
  }
  agregarHora(): void {
    if (!this.horaTemporal) {
      this.messageService.add({ severity: 'info', summary: 'Información', detail: 'Debe seleccionar una hora antes de añadirla.' });
      return;
    }

    const horaStr = this.formatearHora(this.horaTemporal);

    // Evitar duplicados
    if (this.formulario.horas.includes(horaStr)) {
      this.messageService.add({ severity: 'warn', summary: 'Duplicado', detail: 'Esta hora ya fue añadida.' });
      return;
    }

    // Validar diferencia mínima con las ya existentes
    const [nuevaHH, nuevaMM, nuevaSS] = horaStr.split(':').map(Number);
    const nuevaMin = nuevaHH * 60 + nuevaMM + Math.floor(nuevaSS / 60);

    const existentesMin = this.formulario.horas.map((h: string): number => {
      const [hH, mM, sS] = h.split(':').map(Number);
      return hH * 60 + mM + Math.floor(sS / 60);
    });

    const conflicto = existentesMin.some((min: number): boolean => Math.abs(min - nuevaMin) < 5);


    if (conflicto) {
      this.messageService.add({ severity: 'info', summary: 'Horario muy cercano', detail: 'Las horas deben tener al menos 5 minutos de diferencia.' });
      return;
    }

    this.formulario.horas.push(horaStr);
    this.horaTemporal = null;
  }


  private formatearHora(date: Date): string {
    return date.toLocaleTimeString('en-GB', { hour12: false });
  }
  guardarConfiguracion(): void {
    const errorNombre = this.validacionesConfiguracion.validarNombre(this.formulario.nombre_configuracion_escaneo);
    if (errorNombre) {
      this.messageService.add({ severity: 'info', summary: 'Información', detail: errorNombre });
      return;
    }

    const errorFechaInicio = this.validacionesConfiguracion.validarFechaInicio(this.formulario.fecha_inicio, this.formulario.fecha_fin);
    if (errorFechaInicio) {
      this.messageService.add({ severity: 'info', summary: 'Información', detail: errorFechaInicio });
      return;
    }

    const errorFechaFin = this.validacionesConfiguracion.validarFechaFin(this.formulario.fecha_fin, this.formulario.fecha_inicio);
    if (errorFechaFin) {
      this.messageService.add({ severity: 'info', summary: 'Información', detail: errorFechaFin });
      return;
    }

    // ✅ Validación: no permitir activar si la fecha de fin ya expiró
    if (this.formulario.estado && this.formulario.fecha_fin) {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      const fechaFin = new Date(this.formulario.fecha_fin);
      fechaFin.setHours(0, 0, 0, 0);

      if (fechaFin < hoy) {
        this.messageService.add({
          severity: 'info',
          summary: 'Fecha de finalización vencida',
          detail: 'La fecha de finalización ya expiró. Actualiza la fecha para poder activar esta configuración.'
        });
        return;
      }
    }

    if (this.tabSeleccionada === 0) {
      const errorUnidad = this.validacionesConfiguracion.validarUnidadFrecuencia(this.unidadFrecuencia);
      if (errorUnidad) {
        this.messageService.add({ severity: 'info', summary: 'Información', detail: errorUnidad });
        return;
      }

      const errorFrecuencia = this.validacionesConfiguracion.validarFrecuencia(this.formulario.frecuencia_minutos, this.unidadFrecuencia);
      if (errorFrecuencia) {
        this.messageService.add({ severity: 'info', summary: 'Información', detail: errorFrecuencia });
        return;
      }

      // ✅ Validación cruzada: frecuencia vs rango de fechas
      const errorDuracion = this.validarFrecuenciaVsFechas();
      if (errorDuracion) {
        this.messageService.add({
          severity: 'info',
          summary: 'Rango de fechas incompatible',
          detail: errorDuracion
        });
        return;
      }
    } else {
      const errorHoras = this.validacionesConfiguracion.validarHoras(this.formulario.horas);
      if (errorHoras) {
        this.messageService.add({ severity: 'info', summary: 'Información', detail: errorHoras });
        return;
      }
    }

    const payload = {
      ...this.formulario,
      unidad_frecuencia: this.unidadFrecuencia
    };

    const request$ = this.modoEdicion && this.formulario.id
      ? this.servicioConfiguracion.actualizarConfiguracion(this.formulario.id, payload)
      : this.servicioConfiguracion.crearConfiguracion(payload);

    request$.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: this.modoEdicion ? 'Configuración actualizada' : 'Configuración guardada'
        });
        this.modalVisible = false;
        this.modoEdicion = false;
        this.cargarDatos();
      },
      error: (error) => {
        console.error('❌ Error al guardar/actualizar:', error);
        this.messageService.add({
          severity: 'info',
          summary: 'Información',
          detail: 'No se pudo guardar la configuración'
        });
      }
    });
  }

  private validarFrecuenciaVsFechas(): string | null {
    if (!this.formulario.fecha_inicio || !this.formulario.fecha_fin) return null;

    const inicio = new Date(this.formulario.fecha_inicio);
    const fin = new Date(this.formulario.fecha_fin);

    const diferenciaMs = fin.getTime() - inicio.getTime();
    const diferenciaMinutos = diferenciaMs / (1000 * 60);

    const frecuenciaIngresada = Number(this.formulario.frecuencia_minutos || 0);
    const unidad = this.unidadFrecuencia;

    const frecuenciaEnMinutos = unidad === 'min' ? frecuenciaIngresada : frecuenciaIngresada * 60;

    if (frecuenciaEnMinutos <= 0) return null;

    if (frecuenciaEnMinutos > diferenciaMinutos) {
      // ✅ Mostramos la frecuencia ingresada con la unidad original
      const frecuenciaTexto = `${frecuenciaIngresada} ${unidad === 'min' ? 'minutos' : 'horas'}`;

      // ✅ Mostramos la duración también redondeada en su unidad
      const duracionTexto = unidad === 'min'
        ? `${Math.floor(diferenciaMinutos)} minutos`
        : `${Math.floor(diferenciaMinutos / 60)} horas`;

      return `La frecuencia seleccionada (${frecuenciaTexto}) excede la duración total entre la fecha de inicio y finalización.`;
    }

    return null;
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
        (config.frecuencia_texto?.toLowerCase().includes(texto)) ||
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
    console.log('📝 Editar configuración:', config);
    this.formulario = {
      ...config,
      id: config.id,
      nombre_configuracion_escaneo: config.nombre,
      tipo_escaneo_id: config.tipo === 'Frecuencia' ? 1 : 2,
      frecuencia_minutos: config.frecuencia_minutos || null,
      unidad_frecuencia: config.unidad_frecuencia,
      fecha_inicio: config.fecha_inicio ? new Date(config.fecha_inicio) : null,
      fecha_fin: config.fecha_fin ? new Date(config.fecha_fin) : null,
      horas: config.horas || [],
      estado: config.estado
    };
    this.unidadFrecuencia = config.unidad_frecuencia || 'min';
    console.log('⚙️ Unidad frecuencia en edición:', this.unidadFrecuencia);
    this.tabSeleccionada = this.formulario.tipo_escaneo_id === 1 ? 0 : 1;
    this.camposHabilitados = this.formulario.estado;
    this.ajustarMinDateParaFechas(this.formulario.fecha_inicio, this.formulario.fecha_fin);
    this.modoEdicion = true;
    this.modalVisible = true;
  }
  onToggleEstado(): void {
    if (this.modoEdicion) {
      this.camposHabilitados = this.formulario.estado;
    } else {
      this.camposHabilitados = true;
    }
    if (this.camposHabilitados) {
      this.minDate = new Date();
      this.minDate.setHours(0, 0, 0, 0);
    }
  }
  get configuracionActiva(): ConfiguracionEscaneo | null {
    const activa = this.configuracionesFrecuencia.find(cfg => cfg.estado) ||
      this.configuracionesHoras.find(cfg => cfg.estado) ||
      null;
    this.escaneoAutomatico = !!activa;
    return activa;
  }
  permitirSoloNumeros(event: KeyboardEvent): void {
    const charCode = event.charCode;
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
        this.escaneoAutomatico = false;
        this.cargarDatos();
      },
      error: (error) => {
        console.error('❌ Error al desactivar el escaneo automático:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo desactivar el escaneo automático'
        });
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
    if (estadoOrden[campo] == null || estadoOrden[campo] === undefined) {
      estadoOrden[campo] = true; // ascendente
    } else if (estadoOrden[campo] === true) {
      estadoOrden[campo] = false;
    } else {
      estadoOrden[campo] = null;
    }
    if (tipo === 'frecuencia') {
      if (estadoOrden[campo] == null) {
        this.configuracionesFrecuencia = [...this.originalConfiguracionesFrecuencia];
        this.dtFrecuencia.reset();
        return;
      }
      this.aplicarOrden(evento, this.configuracionesFrecuencia, estadoOrden[campo]);
    } else {
      if (estadoOrden[campo] == null) {
        this.configuracionesHoras = [...this.originalConfiguracionesHoras];
        this.dtHoras.reset();
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
  validarSeleccionVista(): void {
    if (!this.vistaSeleccionada) {
      this.vistaSeleccionada = 'frecuencia';
    }
  }
  private formatearFechaTexto(fecha: string | undefined): string {
    if (!fecha) return '';
    const dateObj = new Date(fecha);
    if (isNaN(dateObj.getTime())) return '';
    const dia = String(dateObj.getDate()).padStart(2, '0');
    const mes = String(dateObj.getMonth() + 1).padStart(2, '0');
    const anio = dateObj.getFullYear();
    return `${dia}-${mes}-${anio}`;
  }
  validarNombreInput(event: KeyboardEvent): void {
    const char = event.key;
    const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]$/;

    if (!regex.test(char)) {
      event.preventDefault();
    }
  }
  limpiarNombre(): void {
    if (this.formulario.nombre_configuracion_escaneo) {
      this.formulario.nombre_configuracion_escaneo =
        this.formulario.nombre_configuracion_escaneo
          .trim()
          .replace(/\s+/g, ' ');
    }
  }



}
