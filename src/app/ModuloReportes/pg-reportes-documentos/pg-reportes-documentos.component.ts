import { Component,ViewChild} from '@angular/core';
import { ServiciosAutenticacion } from '../../ModuloServiciosWeb/ServiciosAutenticacion.component';
import { ServiciosConfiguracion } from '../../ModuloServiciosWeb/ServiciosConfiguracion.component';
import { SesionUsuarioService } from '../../Seguridad/sesion-usuario.service'; // asegúrate del path correcto
import { ServiciosReportes } from '../../ModuloServiciosWeb/ServiciosReportes.component'; // ajusta el path si es necesario
import { NotificacionService } from '../../ValidacionesFormularios/notificacion.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';  // al inicio de tu component.ts
import { ConfirmationService } from 'primeng/api';
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
  metadatos?: any;   // 👈 aquí lo agregas como opcional
}



@Component({
  selector: 'app-pg-reportes-documentos',
  templateUrl: './pg-reportes-documentos.component.html',
  styleUrls: ['./pg-reportes-documentos.component.css']
})
export class PgReportesDocumentosComponent {
  constructor(
  private servicioAuth: ServiciosAutenticacion,
  private servicioConfiguracion: ServiciosConfiguracion,
  private sesionUsuario: SesionUsuarioService,
  private servicioReportes: ServiciosReportes,
      private notificacion: NotificacionService,
      private sanitizer: DomSanitizer,
      private confirmationService: ConfirmationService



) {}
  dialogoPDFVisible: boolean = false;
urlPDF: any = null;
Math = Math;

mostrarBotonGuardarReporte: boolean = false;

modalGuardarVisible: boolean = false;
nombreReporteGuardar: string = '';
descripcionReporteGuardar: string = '';
  @ViewChild('cdEliminar') confirmDialog!: any; // para acceder al dialog
  reportes: ReporteGenerado[] = [];
  modalCrearVisible = false;
  nuevoScore: number | null = null;
  listaDispositivos: any[] = [];
listaUsuarios: any[] = [];
listaRoles: any[] = [];
listaConfiguraciones: any[] = [];
  // Estados de filtro
  estadoFiltro: boolean | null = null;
  estadoUsuariosFiltro: boolean | null = null;
  estadoRolesFiltro: boolean | null = null;
  estadoConfiguracionesFiltro: boolean | null = null;


  tipoReporteSeleccionado: string = 'dispositivos';
  tipoConfiguracionSeleccionado: string = 'ambos';

  // Listas filtradas
  dispositivosFiltrados: any[] = [];
  usuariosFiltrados: any[] = [];
  rolesFiltrados: any[] = [];
  configuracionesFiltradas: any[] = [];

  // Opciones UI
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

  // Filtros generales
  filtros: any = {
    // Dispositivos
    dispositivos: [],
    incluirPuertos: false,
    incluirVulnerabilidades: false,
    soloConExploit: false,
    incluirHistorialIps: false,
    formato: 'pdf',
    activarFiltroScore: false,
    tipoFiltroScore: 'rango',
    rangoCVSS: [7.0, 10.0],
    scoresEspecificos: [],
    

    // Usuarios
    usuario_ids: [],
    incluirNombreUsuario: true,
    incluirNombresCompletos: true,
    incluirEmail: true,
    incluirTelefono: true,
    incluirRoles: true,
    incluirFechaCreacion: true,

    // Roles
    roles: [],
    incluirNombreRol: true,
    incluirDescripcionRol: true,
    incluirSecciones: true,

    // Configuraciones
    configuracion_ids: [],
    incluirNombreConfiguracion: true,
    incluirFrecuencia: false,
    incluirHoras: false,
    incluirFechas: false
  };

  ngOnInit() {
    this.obtenerUsuarios();  
      this.obtenerRoles();
      this.obtenerConfiguraciones();
    this.actualizarTodo();
    this.obtenerReportesGenerados();
  }
  
  obtenerUsuarios() {
  this.servicioAuth.listarUsuarios().subscribe({
    next: (data: any) => {
      this.listaUsuarios = data.datos.map((u: any) => ({
        id: u.usuario_id,
        nombre: `${u.nombres_completos} ${u.apellidos_completos}`,
        activo: u.estado
      }));

      // Actualizamos lista filtrada
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

          // Concatenar ambas listas
          this.listaConfiguraciones = [...configuracionesFrecuencia, ...configuracionesHoras];
          // Inicializar configuraciones filtradas
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
    // ✅ Usamos fetch para obtener el blob
    fetch(urlCompleta, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.sesionUsuario.obtenerToken()}`  // ⬅️ igual que en verReporte
      }
    })
    .then(response => response.blob())
    .then(blob => {
      // Creamos el ObjectURL
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      if (formato === 'pdf') {
        link.download = reporte.nombre_reporte_generado + '.pdf';
      } else {
        link.download = reporte.nombre_reporte_generado + '.xlsx';
      }
      link.click();

      // Revocar la URL luego de un pequeño delay
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
    // ✅ Usamos fetch para obtener el blob
    fetch(urlCompleta, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.sesionUsuario.obtenerToken()}`  // ⬅️ si usas token en tu API
      }
    })
    .then(response => response.blob())
    .then(blob => {
      // Creamos el ObjectURL
      const url = URL.createObjectURL(blob);
this.urlPDF = this.sanitizer.bypassSecurityTrustResourceUrl(url);  // ✅ esto elimina el error NG0904
this.mostrarBotonGuardarReporte = false;
this.dialogoPDFVisible = true;

    })
    .catch(err => {
      console.error('Error al obtener el PDF:', err);
      this.notificacion.error('Error', 'No se pudo cargar el reporte.');
    });

  } else if (formato === 'excel' || formato === 'xlsx') {
    // Excel → descarga directa
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
      this.verReporte(data!);  // 👈 aquí sí llamas la función que abre el modal
      break;
    case 'eliminar':
  console.log('🗑️ Eliminar reporte', data);
  this.eliminarReporte(data!);  // 👈 igual que verReporte
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
  // Igual aquí puedes revocar el PDF si quieres
  if (this.urlPDF) {
    URL.revokeObjectURL(this.urlPDF);
    this.urlPDF = null;
  }

  this.modalCrearVisible = false;
}

  generarReporte() {
  const payload = this.construirPayloadReporte();
  console.log('📄 Generando previsualización con payload:', payload);

  this.servicioReportes.generarPrevisualizacionReporte(payload).subscribe({
    next: (blob: Blob) => {
      console.log('✅ Recibido blob del reporte:', blob);

      // Prueba: no actualices si ya hay un URL asignado
      if (this.urlPDF) {
        console.warn('⚠️ Ya había un URL, no actualizo de nuevo');
        return;
      }

      const url = URL.createObjectURL(blob);

      // ✅ APLICAMOS SANITIZER para evitar NG0904
      this.urlPDF = this.sanitizer.bypassSecurityTrustResourceUrl(url);
      this.mostrarBotonGuardarReporte = true; 
      this.dialogoPDFVisible = true;
      this.modalCrearVisible = false;
    },
    error: (err) => {
      console.error('Error al generar previsualización:', err);
      this.notificacion.error('Error', 'No se pudo generar la previsualización del reporte.');
    }
  });
}








  cambiarFiltroUsuarios(estado: boolean | null) {
  this.estadoUsuariosFiltro = estado;
  this.actualizarLista('usuarios');

  // ✅ Limpiar selección del MultiSelect
  this.filtros.usuario_ids = [];
}

cambiarFiltroRoles() {
  this.filtros.roles = []; // ✅ Limpiar el MultiSelect
  this.actualizarLista('roles'); // ✅ Actualizar la lista filtrada
}

guardarReporte() {
  const usuario_id = this.sesionUsuario.obtenerUsuarioDesdeToken()?.usuario_id;

  if (!usuario_id) {
    this.notificacion.error('Error', 'No se pudo identificar al usuario.');
    return;
  }

  const datosGuardar = {
    usuario_id,
    nombre_reporte_generado: this.nombreReporteGuardar,
    descripcion: this.descripcionReporteGuardar,
    filtros: this.construirPayloadReporte()  // ✅ usar el mismo método que en generarReporte
  };

  this.servicioReportes.generarYGuardarReporte(datosGuardar).subscribe({
    next: (res) => {
      console.log('✅ Reporte guardado:', res);
      this.notificacion.success('Éxito', 'Reporte guardado correctamente.');
      this.modalGuardarVisible = false;
      // Aquí si quieres podrías refrescar la lista de reportes también
      this.obtenerReportesGenerados();  // Actualizar la lista de reportes generados
    },
    error: (err) => {
      console.error('Error al guardar reporte:', err);
      this.notificacion.error('Error', 'No se pudo guardar el reporte.');
    }
  });
}


abrirModalGuardar() {
  // Cierra el iframe y libera URL
  if (this.urlPDF) {
    URL.revokeObjectURL(this.urlPDF);
    this.urlPDF = null;
  }

  this.dialogoPDFVisible = false;  // ✅ esta sí va

  this.modalGuardarVisible = true;
  this.nombreReporteGuardar = '';
  this.descripcionReporteGuardar = '';
}


private construirPayloadReporte(): any {
  const payload: any = { formato: this.filtros.formato };

  switch (this.tipoReporteSeleccionado) {
    case 'dispositivos':
      payload.agrupar_por = 'dispositivo';
      payload.dispositivos = this.filtros.dispositivos;
      payload.incluirHistorialIps = this.filtros.incluirHistorialIps;
      payload.incluirPuertos = this.filtros.incluirPuertos;
      payload.incluirVulnerabilidades = this.filtros.incluirVulnerabilidades;
      payload.soloConExploit = this.filtros.soloConExploit;
      payload.activarFiltroScore = this.filtros.activarFiltroScore;
      payload.tipoFiltroScore = this.filtros.tipoFiltroScore;
      payload.rangoCVSS = this.filtros.rangoCVSS;
      payload.scoresEspecificos = this.filtros.scoresEspecificos;
      break;

    case 'usuarios':
      payload.agrupar_por = 'usuario';
      payload.usuario_ids = this.filtros.usuario_ids;
      payload.incluirNombreUsuario = this.filtros.incluirNombreUsuario;
      payload.incluirNombresCompletos = this.filtros.incluirNombresCompletos;
      payload.incluirEmail = this.filtros.incluirEmail;
      payload.incluirTelefono = this.filtros.incluirTelefono;
      payload.incluirRoles = this.filtros.incluirRoles;
      payload.incluirFechaCreacion = this.filtros.incluirFechaCreacion;
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

cerrarModalPrevisualizacion() {
  const oldUrl = this.urlPDF;
  this.urlPDF = null;  // Primero se oculta el iframe

  this.dialogoPDFVisible = false;

  // Ahora, tras pequeño delay, se revoca la URL
  if (oldUrl) {
    setTimeout(() => {
      URL.revokeObjectURL(oldUrl);
    }, 100);  // 100ms es suficiente
  }
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

  // Ajustamos excel → xlsx como pediste
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





}
