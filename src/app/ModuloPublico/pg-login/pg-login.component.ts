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

  mostrarMensaje(severity: string, summary: string, detail: string) {
    this.messageService.add({ severity, summary, detail });
  }

  iniciarSesion() {
    // ✅ Verificar si los campos están vacíos antes de enviar la solicitud
    if (!this.usuario.trim() || !this.contrasena.trim()) {
      this.mostrarMensaje('warn', 'Campos Vacíos', 'Por favor, ingrese su usuario y contraseña');
      return;
    }

    const credenciales = { nombre_usuario: this.usuario, contrasena: this.contrasena };

    this.authService.iniciarSesion(credenciales).subscribe({
      next: (respuesta) => {
        console.log("Datos recibidos:", respuesta);

        // ✅ Si hay token, guardar en sesión y redirigir
        if (respuesta?.access_token) {
          this.sesionService.guardarSesion(respuesta.access_token);
          this.router.navigate(['/admin/inicio']);
        } else {
          this.mostrarMensaje('error', 'Error', 'No se pudo iniciar sesión, intente nuevamente.');
        }
      },
      error: () => {
        this.mostrarMensaje('error', 'Error', 'Usuario o contraseña incorrectos');
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
