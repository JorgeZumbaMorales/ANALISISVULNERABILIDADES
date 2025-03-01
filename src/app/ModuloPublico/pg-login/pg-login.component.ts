import { Component } from '@angular/core';
import { Router } from '@angular/router';

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

  constructor(private router: Router) {}

  iniciarSesion() {
    console.log('Usuario:', this.usuario);
    console.log('Contraseña:', this.contrasena);
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
