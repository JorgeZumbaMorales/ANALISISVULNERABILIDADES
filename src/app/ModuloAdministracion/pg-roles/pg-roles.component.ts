import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ServiciosAutenticacion } from '../../ModuloServiciosWeb/ServiciosAutenticacion.component';
import { MessageService, ConfirmationService} from 'primeng/api';
import { Table } from 'primeng/table';
import { SortEvent } from 'primeng/api';
import { ValidacionesRolesService } from '../../ValidacionesFormularios/validaciones-roles.service'; 
@Component({
  selector: 'app-pg-roles',
  templateUrl: './pg-roles.component.html',
  styleUrls: ['./pg-roles.component.css'],
  providers: [MessageService]
})
export class PgRolesComponent implements OnInit {
  @ViewChild('dt') dt!: Table;
  accionesVisibles: { [rolId: number]: number } = {}; // 0 = grupo 1, 1 = grupo 2
  roles: any[] = [];
  rolesOriginal: any[] = [];
  opcionesMenu: any[] = [];
  formularioRol!: FormGroup;
  modalesVisibles: { [key: string]: boolean } = {};
  rolEnEdicion: any = null;
  ordenActivo: boolean | null = null;
  constructor(
    private fb: FormBuilder,
    private servicioAuth: ServiciosAutenticacion,
    private messageService: MessageService,
    private validacionesRolesService: ValidacionesRolesService,
    private confirmationService: ConfirmationService,
  ) {}
  ngOnInit() {
    this.obtenerRoles();
    this.obtenerSeccionesMenu();
    this.inicializarFormulario();
  }
  inicializarFormulario() {
  this.formularioRol = this.validacionesRolesService.obtenerValidacionesFormulario(this.fb);
}
  obtenerRoles() {
    this.servicioAuth.listarRoles().subscribe({
      next: (data: any[]) => {
        this.roles = data.map((rol: any) => ({
          ...rol,
          estadoTexto: rol.estado ? 'Activo' : 'Inactivo',
          seccionesTexto: rol.secciones_menu?.map((s: any) => s.nombre_seccion).join(', ') ?? ''
        }));
        this.rolesOriginal = [...this.roles]; // Guardar copia original
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo obtener la lista de roles'
        });
      }
    });
  }
  obtenerSeccionesMenu() {
    this.servicioAuth.listarTodasLasSecciones().subscribe({
      next: (res) => {
        this.opcionesMenu = res.datos
          .filter((s: any) => s.estado === true)
          .map((s: any) => ({
            etiqueta: s.nombre_seccion,
            value: s.seccion_id
          }));
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron obtener las secciones'
        });
      }
    });
  }
  filtrarRoles(event: Event) {
    const valor = (event.target as HTMLInputElement).value;
    this.dt.filterGlobal(valor, 'contains');
  }
  ordenarRolesRemovible(event: SortEvent) {
    if (this.ordenActivo === null) {
      this.ordenActivo = true;
      this.ordenarDatosRoles(event);
    } else if (this.ordenActivo === true) {
      this.ordenActivo = false;
      this.ordenarDatosRoles(event);
    } else {
      this.ordenActivo = null;
      this.roles = [...this.rolesOriginal];
      this.dt.reset();
    }
  }
  ordenarDatosRoles(event: SortEvent) {
    const field = event.field;
    const order = event.order;
    if (!field || order === undefined || order === null) return;

    this.roles.sort((a, b) => {
      const valorA = (a[field] ?? '').toString().toLowerCase();
      const valorB = (b[field] ?? '').toString().toLowerCase();

      if (valorA === '' && valorB !== '') return -1;
      if (valorA !== '' && valorB === '') return 1;

      return order * valorA.localeCompare(valorB);
    });
  }
  manejarModal(nombre: string, abrir: boolean) {
    this.modalesVisibles[nombre] = abrir;

    if (nombre === 'rolFormulario') {
  if (abrir) {
    if (this.rolEnEdicion) {
      this.formularioRol.patchValue({
        nombre_rol: this.rolEnEdicion.nombre_rol,
        descripcion: this.rolEnEdicion.descripcion,
        accesos_menu: this.opcionesMenu.filter((op: any) =>
          this.rolEnEdicion.secciones_menu?.some((s: any) => s.seccion_id === op.value)
        )
      });
    } else {
      this.formularioRol.reset({ accesos_menu: [] });
    }
  } else {
    this.rolEnEdicion = null;
    this.formularioRol.reset();
  }
}

  }
  agregarRol() {
    this.rolEnEdicion = null;
    this.manejarModal('rolFormulario', true);
  }
  editarRol(rol: any) {
    this.rolEnEdicion = rol;
    this.manejarModal('rolFormulario', true);
  }
  eliminarRol(rol: any) {
  this.confirmationService.confirm({
    message: `¿Estás seguro de que deseas eliminar el rol "${rol.nombre_rol}"?`,
    header: 'Confirmar eliminación',
    icon: 'pi pi-trash',
    acceptLabel: 'Eliminar',
    rejectLabel: 'Cancelar',
    accept: () => {
      this.servicioAuth.eliminarRol(rol.rol_id).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Eliminado',
            detail: `Rol "${rol.nombre_rol}" eliminado correctamente.`
          });
          this.obtenerRoles(); // Recarga la tabla
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'No se pudo eliminar el rol.'
          });
        }
      });
    }
  });
}

  guardarRol() {
  const resultado = this.validacionesRolesService.validarFormularioConMensajes(this.formularioRol);
  if (resultado) {
    this.messageService.add({
      severity: resultado.tipo,
      summary: resultado.resumen,
      detail: resultado.detalle
    });
    return;
  }

  const formValue = this.formularioRol.value;
  const datosRol = {
    ...formValue,
    accesos_menu: formValue.accesos_menu.map((item: any) => item.value)
  };

  // 👉 Detectar si es edición
  if (this.rolEnEdicion) {
    const rolId = this.rolEnEdicion.rol_id;
    this.servicioAuth.actualizarRol(rolId, datosRol).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Rol actualizado',
          detail: 'Se actualizó correctamente el rol'
        });
        this.obtenerRoles();
        this.manejarModal('rolFormulario', false);
      },
      error: (error) => {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message  // ← Esto usará el mensaje personalizado del backend
    });
  }

    });
  } else {
    // 🆕 Crear nuevo rol
    this.servicioAuth.crearRol(datosRol).subscribe({
  next: () => {
    this.messageService.add({
      severity: 'success',
      summary: 'Rol creado',
      detail: 'Se agregó correctamente el nuevo rol'
    });
    this.obtenerRoles();
    this.manejarModal('rolFormulario', false);
  },
  error: (error) => {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message  // ← Esto usará el mensaje personalizado del backend
    });
  }
});


  }
}



  alternarGrupoAcciones(rolId: number) {
  this.accionesVisibles[rolId] = this.accionesVisibles[rolId] === 1 ? 0 : 1;
}
confirmarCambioEstadoRol(rol: any) {
  const nuevoEstado = !rol.estado;
  const accion = nuevoEstado ? 'activar' : 'desactivar';

  this.confirmationService.confirm({
    message: `¿Estás seguro de que deseas ${accion} el rol "${rol.nombre_rol}"?`,
    header: `Confirmar ${accion}`,
    icon: nuevoEstado ? 'pi pi-eye' : 'pi pi-eye-slash',
    acceptLabel: nuevoEstado ? 'Activar' : 'Desactivar',
    rejectLabel: 'Cancelar',
    accept: () => {
      this.servicioAuth.actualizarEstadoRol(rol.rol_id, nuevoEstado).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: `Rol ${accion}ado correctamente`
          });
          this.obtenerRoles();
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || `No se pudo ${accion} el rol.`
          });
        }
      });
    }
  });
}







}
