import { Component, OnInit, ViewChild} from '@angular/core';
import { Validators } from '@angular/forms';
import { ServiciosAutenticacion } from '../../ModuloServiciosWeb/ServiciosAutenticacion.component';
import { Table } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SortEvent } from 'primeng/api';
import { ValidacionesUsuarioService } from '../../ValidacionesFormularios/validaciones-usuario.service'; // ajusta la ruta si es necesario
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-pg-usuarios',
  templateUrl: './pg-usuarios.component.html',
  styleUrls: ['./pg-usuarios.component.css'],
  providers: [MessageService]
})
export class PgUsuariosComponent implements OnInit {
  usuarios: any[] = [];
  @ViewChild('dt') dt!: Table;

  accionesVisibles: { [usuarioId: number]: number } = {}; // 0 = grupo 1, 1 = grupo 2
  usuarioSeleccionado: any;
  modoEditar: boolean = false;
  roles: any[] = [];
  modalesVisibles: { [key: string]: boolean } = {
  usuarioFormulario: false
};
  usuariosOriginales: any[] = [];
  formularioUsuario!: FormGroup;
  ordenActivo: boolean | null = null;
  constructor(
    private servicioAuth: ServiciosAutenticacion,
    private fb: FormBuilder,
    private messageService: MessageService,
    private validacionesUsuarioService: ValidacionesUsuarioService,
    private confirmationService: ConfirmationService,
  ) {}
  ngOnInit() {
    this.obtenerUsuarios();
    this.obtenerRoles();
    this.inicializarFormulario();
  }
  inicializarFormulario() {
  this.formularioUsuario = this.validacionesUsuarioService.obtenerValidacionesFormulario(this.fb);
}

  manejarModal(abrir: boolean, datos?: any) {
  this.modalesVisibles['usuarioFormulario'] = abrir;

  if (abrir) {
    if (datos) {
      // Modo edición
      this.modoEditar = true;
      this.usuarioSeleccionado = datos;

      const rolesSeleccionados = this.roles.filter(rol =>
        datos.roles.includes(rol.label)
      );

      this.formularioUsuario.patchValue({
        nombre_usuario: datos.nombre_usuario,
        nombres_completos: datos.nombres_completos,
        apellidos_completos: datos.apellidos_completos,
        email: datos.email,
        telefono: datos.telefono,
        rol_ids: rolesSeleccionados
      });

      // Eliminar validaciones de contraseña al editar
      this.formularioUsuario.get('contrasena')?.clearValidators();
      this.formularioUsuario.get('confirmar_contrasena')?.clearValidators();
      this.formularioUsuario.get('contrasena')?.updateValueAndValidity();
      this.formularioUsuario.get('confirmar_contrasena')?.updateValueAndValidity();
    } else {
      // Modo creación
      this.modoEditar = false;
      this.usuarioSeleccionado = null;
      this.formularioUsuario.reset();
    }
  } else {
    // Cierre del modal (limpiar todo)
    this.formularioUsuario.reset();
    this.modoEditar = false;
    this.usuarioSeleccionado = null;
  }
}

  obtenerUsuarios() {
  this.servicioAuth.listarUsuarios().subscribe({
    next: (data: any) => {
      this.usuarios = data.datos.map((u: any) => ({
        ...u,
        estadoTexto: u.estado ? 'Activo' : 'Inactivo',
        rolesTexto: u.roles?.join(' ') ?? ''  // Convierte array a string buscable
      }));
      this.usuariosOriginales = [...this.usuarios];
    },
    error: () => {
      this.mostrarMensaje('error', 'Error', 'No se pudo obtener la lista de usuarios.');
    }
  });
  }
  obtenerRoles() {
    this.servicioAuth.listarRoles().subscribe({
      next: (data: any) => {
        this.roles = data.datos.map((rol: any) => ({
          label: rol.nombre_rol,
          value: rol.rol_id
        }));
      },
      error: () => {
        this.mostrarMensaje('error', 'Error', 'No se pudo obtener la lista de roles.');
      }
    });
  }
 guardarUsuario() {
  const resultado = this.validacionesUsuarioService.validarFormularioConMensajes(this.formularioUsuario);
  if (resultado) {
    this.mostrarMensaje(resultado.tipo, resultado.resumen, resultado.detalle);
    return;
  }

  const formData = this.formularioUsuario.value;
  const usuario = {
    ...formData,
    rol_ids: formData.rol_ids?.map((rol: any) => rol.value) || []
  };

  if (this.modoEditar && this.usuarioSeleccionado?.usuario_id) {
    // MODO EDICIÓN
    this.servicioAuth.actualizarUsuario(this.usuarioSeleccionado.usuario_id, usuario).subscribe({
      next: () => {
        this.mostrarMensaje('success', 'Éxito', 'Usuario actualizado correctamente');
        this.obtenerUsuarios();
        this.manejarModal(false); // cerrar y limpiar
      },
      error: (error) => {
        this.mostrarMensaje('error', 'Error', error.message);
      }
    });
  } else {
    // MODO CREACIÓN
    this.servicioAuth.crearUsuario(usuario).subscribe({
      next: () => {
        this.mostrarMensaje('success', 'Éxito', 'Usuario agregado correctamente');
        this.obtenerUsuarios();
        this.manejarModal(false); // cerrar y limpiar
      },
      error: (error) => {
        this.mostrarMensaje('error', 'Error', error.message);
      }
    });
  }
}

  

  mostrarMensaje(severity: string, summary: string, detail: string) {
    this.messageService.add({ severity, summary, detail });
  }
  editarUsuario(usuario: any) {
  this.modoEditar = true;
  this.usuarioSeleccionado = usuario;

  // Transformar roles actuales del usuario al formato que espera el p-multiSelect
  const rolesSeleccionados = this.roles.filter(rol =>
    usuario.roles.includes(rol.label) // asumiendo que `usuario.roles` son nombres como ['Admin', 'Analista']
  );

  this.formularioUsuario.patchValue({
    nombre_usuario: usuario.nombre_usuario,
    nombres_completos: usuario.nombres_completos,
    apellidos_completos: usuario.apellidos_completos,
    email: usuario.email,
    telefono: usuario.telefono,
    rol_ids: rolesSeleccionados
  });

  // Eliminar validaciones de contraseña si estás editando
  this.formularioUsuario.get('contrasena')?.clearValidators();
  this.formularioUsuario.get('confirmar_contrasena')?.clearValidators();
  this.formularioUsuario.get('contrasena')?.updateValueAndValidity();
  this.formularioUsuario.get('confirmar_contrasena')?.updateValueAndValidity();

  this.modalesVisibles['usuarioFormulario'] = true;
}

 eliminarUsuario(usuario: any) {
  this.servicioAuth.eliminarUsuario(usuario.usuario_id).subscribe({
    next: () => {
      this.mostrarMensaje('success', 'Éxito', 'Usuario eliminado correctamente');
      this.obtenerUsuarios();
    },
    error: (error) => {
      this.mostrarMensaje('error', 'Error', error.message);
    }
  });
}

  filtrarUsuarios(event: Event) {
  const inputValue = (event.target as HTMLInputElement).value;
  if (this.dt) {
    this.dt.filterGlobal(inputValue, 'contains');
  }
}
ordenarUsuariosRemovible(event: SortEvent) {
  if (this.ordenActivo == null) {
    this.ordenActivo = true;
    this.ordenarDatos(event);
  } else if (this.ordenActivo === true) {
    this.ordenActivo = false;
    this.ordenarDatos(event);
  } else {
    this.ordenActivo = null;
    this.usuarios = [...this.usuariosOriginales]; // Restaurar original
    this.dt.reset(); // 💡 resetea sort iconos también
  }
}
ordenarDatos(event: SortEvent) {
  const field = event.field;
  const order = event.order;
  if (!field || order === undefined || order === null) return;
  this.usuarios.sort((a, b) => {
    let resultado = 0;
    if (field === 'estado') {
      const valorA = a[field] === true ? 1 : 0;
      const valorB = b[field] === true ? 1 : 0;
      resultado = valorA - valorB;
    } else {
      const valorA = (a[field] ?? '').toString().toLowerCase();
      const valorB = (b[field] ?? '').toString().toLowerCase();
      if (valorA === '' && valorB !== '') resultado = -1;
      else if (valorA !== '' && valorB === '') resultado = 1;
      else resultado = valorA.localeCompare(valorB);
    }
    return order * resultado;
  });
}



abrirModalCambioContrasena(usuario: any) {
  console.log('Abrir modal para cambiar contraseña de:', usuario);
  // Aquí luego abres un modal específico para editar contraseña
}
alternarGrupoAcciones(usuarioId: number) {
  this.accionesVisibles[usuarioId] = this.accionesVisibles[usuarioId] === 1 ? 0 : 1;
}
confirmarAccion(
  mensaje: string,
  titulo: string,
  accionAceptar: () => void,
  estiloBoton: 'success' | 'danger' = 'success'
) {
  this.confirmationService.confirm({
    message: mensaje,
    header: titulo,
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Sí',
    rejectLabel: 'No',
    acceptButtonStyleClass: estiloBoton === 'danger' ? 'p-button-danger' : 'p-button-success',
    accept: accionAceptar
  });
}


confirmarEliminarUsuario(usuario: any) {
  this.confirmationService.confirm({
    header: 'Confirmar eliminación',
    message: `¿Estás seguro de que deseas eliminar al usuario "${usuario.nombre_usuario}"?`,
    icon: 'pi pi-trash',
    accept: () => {
      this.eliminarUsuario(usuario);
    },
    acceptLabel: 'Eliminar',
    rejectLabel: 'Cancelar',
    acceptButtonStyleClass: 'p-button-danger w-28',
    rejectButtonStyleClass: 'p-button-outlined w-28'
  });
}


confirmarCambioEstadoUsuario(usuario: any) {
  const nuevoEstado = !usuario.estado;
  const accion = nuevoEstado ? 'activar' : 'desactivar';

  this.confirmationService.confirm({
  message: `¿Estás seguro de que deseas ${accion} al usuario "${usuario.nombre_usuario}"?`,
  header: `Confirmar ${accion}`,
  icon: nuevoEstado ? 'pi pi-user-plus' : 'pi pi-user-minus',
  accept: () => {
    this.servicioAuth.actualizarEstadoUsuario(usuario.usuario_id, nuevoEstado).subscribe({
      next: (res) => {
        this.mostrarMensaje('success', 'Éxito', res.mensaje);
        this.obtenerUsuarios();
      },
      error: () => {
        this.mostrarMensaje('error', 'Error', 'No se pudo actualizar el estado.');
      }
    });
  },
  acceptLabel: nuevoEstado ? 'Activar' : 'Desactivar',
  acceptButtonStyleClass: nuevoEstado ? 'p-button-success w-28' : 'p-button-danger w-28',
  rejectLabel: 'Cancelar',
  rejectButtonStyleClass: 'p-button-outlined w-28'
});

}
}
