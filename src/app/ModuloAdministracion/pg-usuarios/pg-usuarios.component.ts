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
  modalCambioContrasenaVisible: boolean = false;
  roles: any[] = [];
  modalesVisibles: { [key: string]: boolean } = {
  usuarioFormulario: false
};
  usuariosOriginales: any[] = [];
  formularioUsuario!: FormGroup;
  formularioContrasena!: FormGroup;

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
  // Formulario de creación/edición de usuario
  this.formularioUsuario = this.validacionesUsuarioService.obtenerValidacionesFormulario(this.fb);

  // Formulario de cambio de contraseña (modal aparte)
  this.formularioContrasena = this.fb.group({
  contrasena: ['', [Validators.required, this.validacionesUsuarioService.contrasenaFuerte()]],
  confirmar_contrasena: ['', Validators.required]
}, {
  validators: this.validacionesUsuarioService.contrasenasCoinciden()
});
}


  manejarModal(nombreModal: string | boolean, abrir?: boolean, datos?: any) {
  // ✔️ Si solo se pasa true/false → usamos 'usuarioFormulario' por compatibilidad
  if (typeof nombreModal === 'boolean') {
    this.modalesVisibles['usuarioFormulario'] = nombreModal;

    if (!nombreModal) {
      this.formularioUsuario.reset();
      this.modoEditar = false;
      this.usuarioSeleccionado = null;
    }

    return;
  }

  // ✔️ Caso con nombre explícito del modal (como 'usuarioFormulario' o 'cambiarContrasena')
  this.modalesVisibles[nombreModal] = abrir!;

  if (abrir) {
    if (nombreModal === 'usuarioFormulario') {
      if (datos) {
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

        this.formularioUsuario.get('contrasena')?.clearValidators();
        this.formularioUsuario.get('confirmar_contrasena')?.clearValidators();
        this.formularioUsuario.get('contrasena')?.updateValueAndValidity();
        this.formularioUsuario.get('confirmar_contrasena')?.updateValueAndValidity();
      } else {
        this.modoEditar = false;
        this.usuarioSeleccionado = null;
        this.formularioUsuario.reset();
      }
    }

    if (nombreModal === 'cambiarContrasena' && datos) {
      this.usuarioSeleccionado = datos;
      this.formularioContrasena.reset();
    }

  } else {
    if (nombreModal === 'usuarioFormulario') {
      this.formularioUsuario.reset();
      this.modoEditar = false;
      this.usuarioSeleccionado = null;
    }

    if (nombreModal === 'cambiarContrasena') {
      this.formularioContrasena.reset();
      this.usuarioSeleccionado = null;
    }
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

guardarNuevaContrasena() {
  
  const resultado = this.validacionesUsuarioService.validarFormularioContrasena(this.formularioContrasena);
  if (resultado) {
    this.mostrarMensaje(resultado.tipo, resultado.resumen, resultado.detalle);
    console.timeEnd('guardarContrasena');
    return;
  }

  const datos = {
    usuario_id: this.usuarioSeleccionado.usuario_id,
    nueva_contrasena: this.formularioContrasena.value.contrasena
  };
  console.time('guardarContrasena');
  this.servicioAuth.actualizarContrasena(datos).subscribe({
    next: (res) => {
      console.timeEnd('guardarContrasena');
      this.mostrarMensaje('success', 'Contraseña actualizada', res.mensaje);
      this.modalesVisibles['cambiarContrasena'] = false;
      this.formularioContrasena.reset();
    },
    error: (error) => {
      console.timeEnd('guardarContrasena');
      this.mostrarMensaje('error', 'Error', error.message);
    }
  });
}


}
