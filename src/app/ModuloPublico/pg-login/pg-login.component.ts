import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SesionUsuarioService } from '../../Seguridad/sesion-usuario.service';
import { ServiciosAutenticacion } from '../../ModuloServiciosWeb/ServiciosAutenticacion.component';
import { MessageService } from 'primeng/api';
@Component({
  selector: 'app-pg-login',
  standalone: false,
  templateUrl: './pg-login.component.html',
  styleUrl: './pg-login.component.css'
})
export class PgLoginComponent {
  usuario: string = '';
  contrasena: string = '';

  // Estado del modal de recuperación
  modalRecuperacion: boolean = false;
  indiceRecuperacion: number = 0; // 0 = Usuario, 1 = Correo
  usuarioRecuperacion: string = '';
  correoRecuperacion: string = '';

  constructor(private router: Router,
    private authService: ServiciosAutenticacion, 
    private sesionService: SesionUsuarioService, 
    private messageService: MessageService
  ) {}

  iniciarSesion() {
    const credenciales = { nombre_usuario: this.usuario, contrasena: this.contrasena };
  
    this.authService.iniciarSesion(credenciales).subscribe({
      next: (respuesta) => {
        this.sesionService.guardarSesion(respuesta.access_token, respuesta.usuario);
        this.router.navigate(['/admin/inicio']);
      },
      error: (error) => {
        console.error('Error al iniciar sesión:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Usuario o contraseña incorrectos',
        });
      }
    });
  }
  

  volverInicio() {
    this.router.navigate(['/public']);
  }

  // Abrir modal de recuperación
  abrirModalRecuperacion() {
    this.modalRecuperacion = true;
    this.indiceRecuperacion = 0;
    this.usuarioRecuperacion = '';
    this.correoRecuperacion = '';
  }

  // Cerrar modal
  cerrarModalRecuperacion() {
    this.modalRecuperacion = false;
  }
}
