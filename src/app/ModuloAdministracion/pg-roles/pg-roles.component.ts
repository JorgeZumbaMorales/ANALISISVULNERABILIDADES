import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ServiciosAutenticacion } from '../../ModuloServiciosWeb/ServiciosAutenticacion.component';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-pg-roles',
  templateUrl: './pg-roles.component.html',
  styleUrls: ['./pg-roles.component.css'],
  providers: [MessageService]
})
export class PgRolesComponent implements OnInit {
  roles: any[] = [];
  opcionesMenu: any[] = []; // Opciones para el multiSelect
  mostrarModal: boolean = false;
  formularioRol!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private servicioAuth: ServiciosAutenticacion,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.obtenerRoles();
    this.obtenerSeccionesMenu();
    this.inicializarFormulario();
  }

  inicializarFormulario() {
    this.formularioRol = this.fb.group({
      nombre_rol: ['', Validators.required],
      descripcion: ['', Validators.required],
      accesos_menu: [[], Validators.required]
    });
  }

  obtenerRoles() {
    this.servicioAuth.listarRoles().subscribe({
      next: (data: any) => {
        this.roles = data.datos;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo obtener la lista de roles' });
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
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron obtener las secciones' });
      }
    });
  }

  agregarRol() {
    this.mostrarModal = true;
    this.formularioRol.reset({ accesos_menu: [] });
  }

  cerrarModal() {
    this.mostrarModal = false;
  }

  guardarNuevoRol() {
    if (this.formularioRol.invalid) return;

    const nuevoRol = this.formularioRol.value;

    this.servicioAuth.crearRol(nuevoRol).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Rol creado', detail: 'Se agregó correctamente el nuevo rol' });
        this.obtenerRoles();
        this.cerrarModal();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear el rol' });
      }
    });
  }

  editarRol(rol: any) {
    console.log('Editar rol:', rol);
  }

  eliminarRol(rol: any) {
    console.log('Eliminar rol:', rol);
    this.roles = this.roles.filter(r => r !== rol);
  }
}
