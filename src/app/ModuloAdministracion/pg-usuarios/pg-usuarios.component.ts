import { Component, OnInit } from '@angular/core';
import { ServiciosAutenticacion } from '../../ModuloServiciosWeb/ServiciosAutenticacion.component';
import { MessageService } from 'primeng/api';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-pg-usuarios',
  standalone: false,
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


    
    this.formularioUsuario = this.fb.group({
      nombre_usuario: ['', Validators.required],
      contrasena: ['', Validators.required],
      nombres_completos: ['', Validators.required],
      apellidos_completos: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefono: [''],
      rol_id: [null, Validators.required]
    });
  }

  obtenerUsuarios() {
    this.servicioAuth.listarUsuarios().subscribe({
      next: (data: any) => {
        console.log('Usuarios obtenidos:', data);
        this.usuarios = data.datos; // Asigna los datos recibidos
      },
      error: (err: any) => {
        console.error('Error al obtener usuarios:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo obtener la lista de usuarios'
        });
      }
    });
  }
  obtenerRoles() {
    this.servicioAuth.listarRoles().subscribe({
      next: (data: any) => {
        this.roles = data.datos.map((rol: any) => ({ label: rol.nombre_rol, value: rol.rol_id }));
      },
      error: (err: any) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo obtener la lista de roles' });
      }
    });
  }

mostrarModal(nombreModal: string, datos?: any) {
  this.modalesVisibles[nombreModal] = true;

  if (nombreModal === 'agregarUsuario') {
    this.formularioUsuario.reset(); // Asegurarse de que el formulario esté limpio
  }

  if (nombreModal === 'editarUsuario' && datos) {
    this.usuarioSeleccionado = datos;
    //this.formularioEditarUsuario.patchValue(datos); // Cargar datos en el formulario de edición
  }
}
cerrarModal(nombreModal: string) {
  this.modalesVisibles[nombreModal] = false;
  if (nombreModal === 'agregarUsuario') this.formularioUsuario.reset();
}


guardarUsuario() {
  if (this.formularioUsuario.valid) {
    const usuario = this.formularioUsuario.value;

    this.servicioAuth.crearUsuario(usuario).subscribe({
      next: (response: any) => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario agregado correctamente' });
        this.obtenerUsuarios();
        this.cerrarModal('agregarUsuario');
      },
      error: (err: any) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar el usuario' });
      }
    });
  } else {
    this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Complete todos los campos requeridos' });
  }
}
  editarUsuario(usuario: any) {
    console.log('Editar usuario:', usuario);
    // Aquí puedes abrir un modal o navegar a otra página de edición
  }

  eliminarUsuario(usuario: any) {
    console.log('Eliminar usuario:', usuario);
    this.usuarios = this.usuarios.filter(u => u !== usuario);
  }

  
}
