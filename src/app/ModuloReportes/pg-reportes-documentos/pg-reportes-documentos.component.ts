import { Component, ViewChild } from '@angular/core';
import { ServiciosAutenticacion } from '../../ModuloServiciosWeb/ServiciosAutenticacion.component';
import { ServiciosConfiguracion } from '../../ModuloServiciosWeb/ServiciosConfiguracion.component';
import { SesionUsuarioService } from '../../Seguridad/sesion-usuario.service';
import { ServiciosReportes } from '../../ModuloServiciosWeb/ServiciosReportes.component';
import { NotificacionService } from '../../ValidacionesFormularios/notificacion.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';
import { ConfirmationService, PrimeTemplate } from 'primeng/api';
import { ServiciosDispositivos } from '../../ModuloServiciosWeb/ServiciosDispositivos.component';
import { Toast } from 'primeng/toast';
import { Button, ButtonDirective } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Tooltip } from 'primeng/tooltip';
import { Dialog } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { SelectButton } from 'primeng/selectbutton';
import { NgIf, NgClass, DatePipe } from '@angular/common';
import { RadioButton } from 'primeng/radiobutton';
import { MultiSelect } from 'primeng/multiselect';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { IftaLabel } from 'primeng/iftalabel';
import { ProgressSpinner } from 'primeng/progressspinner';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { AbstractControl } from '@angular/forms';
import { ValidacionesReportesService } from '../../ValidacionesFormularios/validaciones-reportes.service';
interface ReporteGenerado {
  reporte_generado_id: number;
  tipo_reporte_id: number;
  nombre_reporte_generado: string;
  descripcion: string;
  usuario_id: number;
  usuario_nombre: string;
  archivo_url: string;
  fecha_creacion: string;
  estado: boolean;
  metadatos?: any;
}

@Component({
  standalone: true,
  selector: 'app-pg-reportes-documentos',
  templateUrl: './pg-reportes-documentos.component.html',
  styleUrls: ['./pg-reportes-documentos.component.css'],
  imports: [Toast, Button, TableModule, PrimeTemplate, IconField, FloatLabelModule, InputIcon, InputText, Tooltip, Dialog, FormsModule, SelectButton, NgIf, RadioButton, MultiSelect, ToggleSwitch, IftaLabel, ProgressSpinner, ConfirmDialog, NgClass, ButtonDirective, DatePipe]
})
export class PgReportesDocumentosComponent {
  constructor(
    private servicioAuth: ServiciosAutenticacion,
    private servicioConfiguracion: ServiciosConfiguracion,
    private sesionUsuario: SesionUsuarioService,
    private servicioReportes: ServiciosReportes,
    private notificacion: NotificacionService,
    private sanitizer: DomSanitizer,
    private confirmationService: ConfirmationService,
    private servicioDispositivos: ServiciosDispositivos,
    private validacionesReportes: ValidacionesReportesService
  ) { }
  dialogoPDFVisible: boolean = false;
  urlPDF: any = null;
  Math = Math;
  generandoPDF: boolean = false;
  mostrarBotonGuardarReporte: boolean = false;
  modalGuardarVisible: boolean = false;
  nombreReporteGuardar: string = '';
  descripcionReporteGuardar: string = '';
  @ViewChild('cdEliminar') confirmDialog!: any;
  reportes: ReporteGenerado[] = [];
  modalCrearVisible = false;
  nuevoScore: number | null = null;
  listaDispositivos: any[] = [];
  listaUsuarios: any[] = [];
  listaRoles: any[] = [];
  guardandoReporte: boolean = false;
  listaConfiguraciones: any[] = [];
  estadoFiltro: boolean | null = null;
  estadoUsuariosFiltro: boolean | null = null;
  estadoRolesFiltro: boolean | null = null;
  estadoConfiguracionesFiltro: boolean | null = null;
  tipoReporteSeleccionado: string = 'dispositivos';
  tipoConfiguracionSeleccionado: string = 'ambos';
  dispositivos: any[] = [];
  dispositivosFiltrados: any[] = [];
  usuariosFiltrados: any[] = [];
  rolesFiltrados: any[] = [];
  configuracionesFiltradas: any[] = [];
  payloadPrevisualizacion: any = null;
  opcionesTipoReporte = [
    { label: 'Dispositivos', value: 'dispositivos', icon: 'pi pi-desktop' },
    { label: 'Usuarios', value: 'usuarios', icon: 'pi pi-user' },
    { label: 'Roles', value: 'roles', icon: 'pi pi-users' },
    { label: 'Configuraciones', value: 'configuraciones', icon: 'pi pi-cog' }
  ];
  opcionesTipoScore = [
    { label: 'Rango', value: 'rango' },
    { label: 'Valores específicos', value: 'especificos' }
  ];
  opcionesTipoConfiguracion = [
    { label: 'Frecuencia', value: 'frecuencia', icon: 'pi pi-clock' },
    { label: 'Hora', value: 'hora', icon: 'pi pi-calendar-clock' },
    { label: 'Ambos', value: 'ambos', icon: 'pi pi-sliders-h' }
  ];

  filtros: any = {

    dispositivos: [],
    incluirPuertos: true,
    incluirVulnerabilidades: true,
    incluirResumenesTecnicos: true,
    incluirExploit: true,
    incluirUrl: true,
    incluirRiesgo: true,
    incluirHistorialIps: true,


    // Usuarios
    usuario_ids: [],
    incluirNombreUsuario: true,
    incluirNombresCompletos: true,
    incluirEmail: true,
    incluirTelefono: true,
    incluirRoles: true,


    // Roles
    roles: [],
    incluirNombreRol: true,
    incluirDescripcionRol: true,
    incluirSeccionesMenu: true,

    // Configuraciones
    configuracion_ids: [],
    incluirNombreConfiguracion: true,
    incluirFrecuencia: true,
    incluirHoras: true,
    incluirFechas: true,
    formato: 'pdf',
  };

  ngOnInit() {
    this.filtros.incluirRiesgo = false;
    this.filtros.formato = 'pdf';
    this.obtenerUsuarios();
    this.obtenerRoles();
    this.obtenerConfiguraciones();
    this.actualizarTodo();
    this.obtenerTodosLosDispositivos();
    this.obtenerReportesGenerados();
  }
  obtenerTodosLosDispositivos() {
    this.servicioDispositivos.listarTodosLosDispositivosCompleto().subscribe({
      next: ({ data }) => {
        this.listaDispositivos = data.map((d: any) => ({
          id: d.dispositivo_id,
          nombre: d.nombre_dispositivo,
          activo: d.estado
        }));
        this.actualizarLista('dispositivos');
      },
      error: (err) => {
        console.error('Error al obtener dispositivos', err);
        this.notificacion.error('Error', 'No se pudo cargar la lista de dispositivos.');
      }
    });
  }
  obtenerUsuarios() {
    this.servicioAuth.listarUsuarios().subscribe({
      next: (data: any) => {
        this.listaUsuarios = data.datos.map((u: any) => ({
          id: u.usuario_id,
          nombre: `${u.nombres_completos} ${u.apellidos_completos}`,
          activo: u.estado
        }));
        this.actualizarLista('usuarios');
      },
      error: () => {
        console.error('Error al obtener usuarios');
      }
    });
  }
  obtenerRoles() {
    this.servicioAuth.listarRoles().subscribe({
      next: (roles: any[]) => {
        this.listaRoles = roles.map((rol: any) => ({
          rol_id: rol.rol_id,
          nombre_rol: rol.nombre_rol,
          activo: rol.estado
        }));

        this.actualizarLista('roles');
      },
      error: (error) => {
        console.error('Error al obtener roles:', error);
      }
    });
  }
  obtenerConfiguraciones() {
    this.servicioConfiguracion.listarConfiguracionesFrecuencia().subscribe({
      next: (resFrecuencia: any) => {
        const configuracionesFrecuencia = resFrecuencia.data.map((config: any) => ({
          id: config.id,
          nombre: config.nombre,
          estado: config.estado,
          tipo: 'frecuencia'
        }));

        this.servicioConfiguracion.listarConfiguracionesHoras().subscribe({
          next: (resHoras: any) => {
            const configuracionesHoras = resHoras.data.map((config: any) => ({
              id: config.id,
              nombre: config.nombre,
              estado: config.estado,
              tipo: 'hora'
            }));
            this.listaConfiguraciones = [...configuracionesFrecuencia, ...configuracionesHoras];
            this.actualizarLista('configuraciones');
          },
          error: (err) => {
            console.error('❌ Error al obtener configuraciones por horas:', err);
          }
        });
      },
      error: (err) => {
        console.error('❌ Error al obtener configuraciones por frecuencia:', err);
      }
    });
  }

  actualizarTodo() {
    this.actualizarLista('dispositivos');
    this.actualizarLista('usuarios');
    this.actualizarLista('roles');
    this.actualizarLista('configuraciones');
  }

  actualizarLista(tipo: 'dispositivos' | 'usuarios' | 'roles' | 'configuraciones', limpiarSeleccion: boolean = false) {
    let listaOriginal: any[] = [];
    let estadoFiltro: boolean | null = null;

    switch (tipo) {
      case 'dispositivos':
        listaOriginal = this.listaDispositivos;
        estadoFiltro = this.estadoFiltro;
        this.dispositivosFiltrados = listaOriginal.filter(item =>
          estadoFiltro === null ? true : item.activo === estadoFiltro
        );
        if (limpiarSeleccion) this.filtros.dispositivos = [];
        break;

      case 'usuarios':
        listaOriginal = this.listaUsuarios;
        estadoFiltro = this.estadoUsuariosFiltro;
        this.usuariosFiltrados = listaOriginal.filter(item =>
          estadoFiltro === null ? true : item.activo === estadoFiltro
        );
        if (limpiarSeleccion) this.filtros.usuario_ids = [];
        break;

      case 'roles':
        listaOriginal = this.listaRoles;
        estadoFiltro = this.estadoRolesFiltro;
        this.rolesFiltrados = listaOriginal.filter(item =>
          estadoFiltro === null ? true : item.activo === estadoFiltro
        );
        if (limpiarSeleccion) this.filtros.roles = [];
        break;

      case 'configuraciones':
        listaOriginal = this.listaConfiguraciones;
        estadoFiltro = this.estadoConfiguracionesFiltro;
        this.configuracionesFiltradas = listaOriginal
          .filter(config =>
            this.tipoConfiguracionSeleccionado === 'ambos' ? true : config.tipo === this.tipoConfiguracionSeleccionado
          )
          .filter(config =>
            estadoFiltro === null ? true : config.estado === estadoFiltro
          );
        if (limpiarSeleccion) this.filtros.configuracion_ids = [];
        break;
    }
  }
  descargarPDF(reporte: ReporteGenerado) {
    if (!reporte.archivo_url) {
      this.notificacion.error('Error', 'El reporte no tiene archivo disponible para descargar.');
      return;
    }

    const formato = (reporte.metadatos?.formato || '').toLowerCase();
    const urlCompleta = `${environment.apiUrl}${reporte.archivo_url}`;

    if (formato === 'pdf' || formato === 'excel' || formato === 'xlsx') {
      fetch(urlCompleta, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.sesionUsuario.obtenerToken()}`
        }
      })
        .then(response => response.blob())
        .then(blob => {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          if (formato === 'pdf') {
            link.download = reporte.nombre_reporte_generado + '.pdf';
          } else {
            link.download = reporte.nombre_reporte_generado + '.xlsx';
          }
          link.click();
          setTimeout(() => {
            URL.revokeObjectURL(url);
          }, 100);
        })
        .catch(err => {
          console.error('Error al descargar el reporte:', err);
          this.notificacion.error('Error', 'No se pudo descargar el reporte.');
        });
    } else {
      this.notificacion.error('Error', 'Formato de archivo no soportado para descarga.');
    }
  }
  filtrar(event: Event) {
    const valor = (event.target as HTMLInputElement).value;
  }
  verReporte(reporte: ReporteGenerado) {
    if (!reporte.archivo_url) {
      this.notificacion.error('Error', 'El reporte no tiene archivo disponible.');
      return;
    }

    const formato = (reporte.metadatos?.formato || '').toLowerCase();
    const urlCompleta = `${environment.apiUrl}${reporte.archivo_url}`;

    if (formato === 'pdf') {
      fetch(urlCompleta, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.sesionUsuario.obtenerToken()}`
        }
      })
        .then(response => response.blob())
        .then(blob => {
          const url = URL.createObjectURL(blob);
          this.urlPDF = this.sanitizer.bypassSecurityTrustResourceUrl(url);
          this.mostrarBotonGuardarReporte = false;
          this.dialogoPDFVisible = true;

        })
        .catch(err => {
          console.error('Error al obtener el PDF:', err);
          this.notificacion.error('Error', 'No se pudo cargar el reporte.');
        });

    } else if (formato === 'excel' || formato === 'xlsx') {

      const link = document.createElement('a');
      link.href = urlCompleta;
      link.download = reporte.nombre_reporte_generado + '.xlsx';
      link.target = '_blank';
      link.click();
    } else {
      this.notificacion.error('Error', 'Formato de archivo no soportado para visualización.');
    }
  }

  accionBotonGeneral(tipo: string, data?: ReporteGenerado) {
    switch (tipo) {
      case 'crear':
        this.modalCrearVisible = true;
        break;
      case 'ver':
        console.log('👁️ Ver reporte', data);
        this.verReporte(data!);
        break;
      case 'eliminar':
        console.log('🗑️ Eliminar reporte', data);
        this.eliminarReporte(data!);
        break;
      default:
        console.warn('⚠️ Acción desconocida:', tipo);
    }
  }
  agregarScoreEspecifico() {
    const score = Number(this.nuevoScore);
    if (!isNaN(score) && score >= 0 && score <= 10 && !this.filtros.scoresEspecificos.includes(score)) {
      this.filtros.scoresEspecificos.push(Number(score.toFixed(1)));
      this.nuevoScore = null;
    }
  }
  eliminarScoreEspecifico(index: number) {
    this.filtros.scoresEspecificos.splice(index, 1);
  }
  cerrarModalCrear() {
    if (this.urlPDF) {
      URL.revokeObjectURL(this.urlPDF);
      this.urlPDF = null;
    }
    this.modalCrearVisible = false;
    this.resetearFiltros();
  }
  generarReporte() {
    const error = this.validacionesReportes.validarFiltrosGenerales(this.tipoReporteSeleccionado, this.filtros);
    if (error) {
      this.notificacion.info(error.resumen, error.detalle);
      return;
    }

    this.generandoPDF = true;
    const payload = this.construirPayloadReporte();
    this.payloadPrevisualizacion = payload; // 🔴 GUARDAR AQUÍ

    this.servicioReportes.generarPrevisualizacionReporte(payload).subscribe({
      next: (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        this.urlPDF = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        this.dialogoPDFVisible = true;
        this.mostrarBotonGuardarReporte = true;
        this.modalCrearVisible = false;
      },
      error: (err) => {
        this.notificacion.error('Error', 'No se pudo generar la previsualización del reporte.');
      },
      complete: () => {
        this.generandoPDF = false;
      }
    });
  }

  cambiarFiltroUsuarios(estado: boolean | null) {
    this.estadoUsuariosFiltro = estado;
    this.actualizarLista('usuarios');
    this.filtros.usuario_ids = [];
  }

  cambiarFiltroRoles() {
    this.filtros.roles = [];
    this.actualizarLista('roles');
  }

  guardarReporte() {
    this.guardandoReporte = true;

    const usuario_id = this.sesionUsuario.obtenerUsuarioDesdeToken()?.usuario_id;
    if (!usuario_id) {
      this.notificacion.error('Error', 'No se pudo identificar al usuario.');
      this.guardandoReporte = false;
      return;
    }

    if (!this.payloadPrevisualizacion) {
      this.notificacion.error('Error', 'No hay información para guardar. Genere primero la previsualización.');
      this.guardandoReporte = false;
      return;
    }

    // ✅ Validar nombre y descripción del reporte
    const error = this.validacionesReportes.validarDatosGuardado(this.nombreReporteGuardar, this.descripcionReporteGuardar, this.reportes);

    if (error) {
      if (error.tipo === 'info') {
        this.notificacion.info(error.resumen, error.detalle);
      } else if (error.tipo === 'warn' || error.tipo === 'warning') {
        this.notificacion.warning(error.resumen, error.detalle);
      } else {
        this.notificacion.error(error.resumen, error.detalle);
      }
      this.guardandoReporte = false;
      return;
    }


    const datosGuardar = {
      usuario_id,
      nombre_reporte_generado: this.nombreReporteGuardar,
      descripcion: this.descripcionReporteGuardar,
      filtros: this.payloadPrevisualizacion
    };

    this.servicioReportes.generarYGuardarReporte(datosGuardar).subscribe({
      next: (res) => {
        this.notificacion.success('Éxito', 'Reporte guardado correctamente.');
        this.modalGuardarVisible = false;
        this.cerrarModalPrevisualizacion(false);
        this.obtenerReportesGenerados();
        this.resetearFiltros();
      },
      error: (err) => {
        this.notificacion.error('Error', 'No se pudo guardar el reporte.');
      },
      complete: () => {
        this.guardandoReporte = false;
      }
    });
  }



  validarSeleccionTipoReporte() {
    if (!this.tipoReporteSeleccionado) {
      this.tipoReporteSeleccionado = 'dispositivos';
    }
  }
  abrirModalGuardar() {
    if (this.urlPDF) {
      URL.revokeObjectURL(this.urlPDF);
      this.urlPDF = null;
    }
    this.dialogoPDFVisible = false;
    this.modalGuardarVisible = true;
    this.nombreReporteGuardar = '';
    this.descripcionReporteGuardar = '';
  }
  private construirPayloadReporte(): any {
    const payload: any = { formato: this.filtros.formato };
    switch (this.tipoReporteSeleccionado) {
      case 'dispositivos':
        payload.agrupar_por = 'dispositivo';
        payload.dispositivo_ids = this.filtros.dispositivos;

        payload.incluirPuertos = this.filtros.incluirPuertos;
        payload.incluirVulnerabilidades = this.filtros.incluirVulnerabilidades;
        payload.incluirExploit = this.filtros.incluirExploit;
        payload.incluirUrl = this.filtros.incluirUrl;
        payload.incluirRiesgo = this.filtros.incluirRiesgo;
        payload.incluirHistorialIps = this.filtros.incluirHistorialIps;
        payload.incluirResumenesTecnicos = this.filtros.incluirResumenesTecnicos;
        break;


      case 'usuarios':
        payload.agrupar_por = 'usuario';
        payload.usuario_ids = this.filtros.usuario_ids;
        payload.incluirNombreUsuario = this.filtros.incluirNombreUsuario;
        payload.incluirNombresCompletos = this.filtros.incluirNombresCompletos;
        payload.incluirEmail = this.filtros.incluirEmail;
        payload.incluirTelefono = this.filtros.incluirTelefono;
        payload.incluirRoles = this.filtros.incluirRoles;

        break;

      case 'roles':
        payload.agrupar_por = 'rol';
        payload.roles = this.filtros.roles;
        payload.incluirNombreRol = this.filtros.incluirNombreRol;
        payload.incluirDescripcionRol = this.filtros.incluirDescripcionRol;
        payload.incluirSeccionesMenu = this.filtros.incluirSeccionesMenu;
        break;

      case 'configuraciones':
        payload.agrupar_por = 'configuracion';
        payload.configuracion_ids = this.filtros.configuracion_ids;
        payload.tipoConfiguracion = this.tipoConfiguracionSeleccionado;
        payload.incluirNombreConfiguracion = this.filtros.incluirNombreConfiguracion;
        payload.incluirFrecuencia = this.filtros.incluirFrecuencia;
        payload.incluirHoras = this.filtros.incluirHoras;
        payload.incluirFechas = this.filtros.incluirFechas;
        break;
    }

    return payload;
  }
  cerrarModalPrevisualizacion(limpiar: boolean = true) {
    const oldUrl = this.urlPDF;
    this.urlPDF = null;
    this.dialogoPDFVisible = false;

    if (oldUrl) {
      setTimeout(() => {
        URL.revokeObjectURL(oldUrl);
      }, 100);
    }

    if (limpiar) {
      this.resetearFiltros();
    }
    this.mostrarBotonGuardarReporte = false;
  }
  obtenerReportesGenerados() {
    this.servicioReportes.listarReportesGenerados().subscribe({
      next: (res) => {
        console.log('✅ Reportes generados recibidos:', res);
        this.reportes = res.datos;
      },
      error: (err) => {
        console.error('❌ Error al listar reportes generados:', err);
        this.notificacion.error('Error', 'No se pudo obtener la lista de reportes generados.');
      }
    });
  }

  getIconoYTooltipArchivo(reporte: any): { icono: string, tooltip: string } {
    let formato = '';

    if (reporte.metadatos?.formato) {
      formato = reporte.metadatos.formato.toLowerCase();
    } else if (reporte.archivo_url) {
      formato = reporte.archivo_url.split('.').pop()?.toLowerCase() || '';
    }
    if (formato === 'excel') {
      formato = 'xlsx';
    }
    const icono = (formato === 'pdf')
      ? 'pi pi-file-pdf text-red-600'
      : (formato === 'xlsx')
        ? 'pi pi-file-excel text-green-600'
        : 'pi pi-file';

    const tooltip = formato.toUpperCase() || 'DESCONOCIDO';
    return { icono, tooltip };
  }
  eliminarReporte(reporte: ReporteGenerado) {
    if (!reporte) {
      return;
    }

    this.confirmationService.confirm({
      header: 'Eliminar Reporte',
      message: `¿Estás seguro de que deseas eliminar el reporte "${reporte.nombre_reporte_generado}"?`,
      icon: 'pi pi-trash',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.servicioReportes.eliminarReporteGenerado(reporte.reporte_generado_id).subscribe({
          next: (res) => {
            console.log('✅ Reporte eliminado:', res);
            this.notificacion.success('Éxito', 'Reporte eliminado correctamente.');
            this.obtenerReportesGenerados();  // Actualizar la lista
          },
          error: (err) => {
            console.error('Error al eliminar reporte:', err);
            this.notificacion.error('Error', 'No se pudo eliminar el reporte.');
          }
        });
      },
      reject: () => {
        console.log('❌ Eliminación cancelada');
      }
    });

  }


  resetearFiltros() {
    this.filtros = {
      usuario_ids: [],
      incluirNombreUsuario: true,
      incluirNombresCompletos: true,
      incluirEmail: true,
      incluirTelefono: true,
      incluirRoles: true,
      roles: [],
      incluirNombreRol: true,
      incluirDescripcionRol: true,
      incluirSeccionesMenu: true,
      incluirFechaCreacionRol: false,
      configuracion_ids: [],
      incluirNombreConfiguracion: true,
      incluirFrecuencia: false,
      incluirHoras: false,
      incluirFechas: false,
      incluirFechaCreacionConfiguracion: false,
      dispositivos: [],
      incluirHistorialIps: false,
      incluirPuertos: false,
      incluirVulnerabilidades: false,
      incluirResumenesTecnicos: false,
      incluirExploit: false,
      incluirUrl: false,
      formato: 'pdf'
    };
    this.estadoFiltro = null;
    this.estadoUsuariosFiltro = null;
    this.estadoRolesFiltro = null;
    this.estadoConfiguracionesFiltro = null;
    this.tipoReporteSeleccionado = 'dispositivos';
    this.tipoConfiguracionSeleccionado = 'ambos';
    this.actualizarTodo();
  }
  limpiarEspaciosTexto(campo: 'nombre' | 'descripcion'): void {
    if (campo === 'nombre' && typeof this.nombreReporteGuardar === 'string') {
      this.nombreReporteGuardar = this.nombreReporteGuardar.trim().replace(/\s+/g, ' ');
    }
    if (campo === 'descripcion' && typeof this.descripcionReporteGuardar === 'string') {
      this.descripcionReporteGuardar = this.descripcionReporteGuardar.trim().replace(/\s+/g, ' ');
    }
  }


}
