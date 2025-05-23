import { Component, OnInit, ViewChild} from '@angular/core';
import { Validators } from '@angular/forms';
import { ServiciosAutenticacion } from '../../ModuloServiciosWeb/ServiciosAutenticacion.component';
import { Table } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SortEvent } from 'primeng/api';
import { ValidacionesUsuarioService } from '../../ValidacionesFormularios/validaciones-usuario.service'; // ajusta la ruta si es necesario

@Component({
  selector: 'app-pg-usuarios',
  templateUrl: './pg-usuarios.component.html',
  styleUrls: ['./pg-usuarios.component.css'],
  providers: [MessageService]
})
export class PgUsuariosComponent implements OnInit {
  usuarios: any[] = [];
  @ViewChild('dt') dt!: Table;
  usuarioSeleccionado: any;
  roles: any[] = [];
  modalesVisibles: { [key: string]: boolean } = {}; 
  usuariosOriginales: any[] = [];
  formularioUsuario!: FormGroup;
  ordenActivo: boolean | null = null;
  constructor(
    private servicioAuth: ServiciosAutenticacion,
    private fb: FormBuilder,
    private messageService: MessageService,
    private validacionesUsuarioService: ValidacionesUsuarioService
  ) {}
  ngOnInit() {
    this.obtenerUsuarios();
    this.obtenerRoles();
    this.inicializarFormulario();
  }
  inicializarFormulario() {
  this.formularioUsuario = this.validacionesUsuarioService.obtenerValidacionesFormulario(this.fb);
}

  manejarModal(nombreModal: string, abrir: boolean, datos?: any) {
    this.modalesVisibles[nombreModal] = abrir;
    if (abrir && nombreModal === 'agregarUsuario') {
      this.formularioUsuario.reset();
    }
    if (abrir && nombreModal === 'editarUsuario' && datos) {
      this.usuarioSeleccionado = datos;
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

  this.servicioAuth.crearUsuario(usuario).subscribe({
    next: () => {
      this.mostrarMensaje('success', 'Éxito', 'Usuario agregado correctamente');
      this.obtenerUsuarios();
      this.manejarModal('agregarUsuario', false);
    },
    error: (error) => {
      this.mostrarMensaje('error', 'Error', error.message);
    }
  });
}


  mostrarMensaje(severity: string, summary: string, detail: string) {
    this.messageService.add({ severity, summary, detail });
  }
  editarUsuario(usuario: any) {
    console.log('Editar usuario:', usuario);
  }
  eliminarUsuario(usuario: any) {
    this.usuarios = this.usuarios.filter(u => u !== usuario);
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

}
