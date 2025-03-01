import { Component, OnInit } from '@angular/core';
import { ServiciosAutenticacion } from '../../ModuloServiciosWeb/ServiciosAutenticacion.component';
import { MessageService } from 'primeng/api';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-pg-usuarios',
  templateUrl: './pg-usuarios.component.html',
  styleUrls: ['./pg-usuarios.component.css'],
  providers: [MessageService]
})
export class PgUsuariosComponent implements OnInit {

  usuarios: any[] = [];
  usuarioSeleccionado: any;
  roles: any[] = [];
  modalesVisibles: { [key: string]: boolean } = {}; 
  formularioUsuario!: FormGroup;

  constructor(
    private servicioAuth: ServiciosAutenticacion,
    private fb: FormBuilder,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.obtenerUsuarios();
    this.obtenerRoles();
    this.inicializarFormulario();
  }

  /** ✅ Inicializa formulario sin validaciones visuales */
  inicializarFormulario() {
    this.formularioUsuario = this.fb.group({
      nombre_usuario: [''],
      contrasena: [''],
      confirmar_contrasena: [''],
      nombres_completos: [''],
      apellidos_completos: [''],
      email: [''],
      telefono: [''],
      rol_id: [null]
    });
  }

  /** ✅ Manejo de modales */
  manejarModal(nombreModal: string, abrir: boolean, datos?: any) {
    this.modalesVisibles[nombreModal] = abrir;

    if (abrir && nombreModal === 'agregarUsuario') {
      this.formularioUsuario.reset();
    }

    if (abrir && nombreModal === 'editarUsuario' && datos) {
      this.usuarioSeleccionado = datos;
    }
  }

  /** ✅ Obtener lista de usuarios */
  obtenerUsuarios() {
    this.servicioAuth.listarUsuarios().subscribe({
      next: (data: any) => {
        this.usuarios = data.datos;
      },
      error: () => {
        this.mostrarMensaje('error', 'Error', 'No se pudo obtener la lista de usuarios.');
      }
    });
  }

  /** ✅ Obtener lista de roles */
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

  /** ✅ Guardar usuario (sin validaciones de formulario) */
  guardarUsuario() {
    const usuario = this.formularioUsuario.value;

    this.servicioAuth.crearUsuario(usuario).subscribe({
      next: () => {
        this.mostrarMensaje('success', 'Éxito', 'Usuario agregado correctamente');
        this.obtenerUsuarios();
        this.manejarModal('agregarUsuario', false);
      },
      error: () => {
        this.mostrarMensaje('error', 'Error', 'No se pudo guardar el usuario');
      }
    });
  }

  /** ✅ Mostrar mensajes con p-toast */
  mostrarMensaje(severity: string, summary: string, detail: string) {
    this.messageService.add({ severity, summary, detail });
  }

  /** ✅ Editar usuario */
  editarUsuario(usuario: any) {
    console.log('Editar usuario:', usuario);
  }

  /** ✅ Eliminar usuario */
  eliminarUsuario(usuario: any) {
    this.usuarios = this.usuarios.filter(u => u !== usuario);
  }
}
