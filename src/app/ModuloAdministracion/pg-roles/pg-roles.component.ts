import { Component, OnInit } from '@angular/core';
import { ServiciosAutenticacion } from '../../ModuloServiciosWeb/ServiciosAutenticacion.component';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-pg-roles',
  standalone: false,
  templateUrl: './pg-roles.component.html',
  styleUrls: ['./pg-roles.component.css'],
  providers: [MessageService] // Para manejar mensajes de error
})
export class PgRolesComponent implements OnInit {
  roles: any[] = []; // Lista donde se almacenan los roles

  constructor(
    private servicioAuth: ServiciosAutenticacion,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.obtenerRoles(); // Cargar los roles al iniciar el componente
  }

  obtenerRoles() {
    this.servicioAuth.listarRoles().subscribe({
      next: (data: any) => {
        console.log('Roles obtenidos:', data);
        this.roles = data.datos; // Asigna los datos recibidos
      },
      error: (err: any) => {
        console.error('Error al obtener roles:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo obtener la lista de roles'
        });
      }
    });
  }

  selectedRol: any;

  editarRol(rol: any) {
    console.log('Editar rol:', rol);
    // Aquí podrías abrir un modal o navegar a otra página de edición
  }

  eliminarRol(rol: any) {
    console.log('Eliminar rol:', rol);
    this.roles = this.roles.filter(r => r !== rol);
  }

  agregarRol() {
    console.log('Agregar nuevo rol');
    // Aquí podrías abrir un formulario modal
  }
}
