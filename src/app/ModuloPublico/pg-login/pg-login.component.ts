import { Component } from '@angular/core';

@Component({
  selector: 'app-pg-login',
  standalone: false,
  templateUrl: './pg-login.component.html',
  styleUrl: './pg-login.component.css'
})
export class PgLoginComponent {
  usuario: string = '';
  contrasena: string = '';
  
  iniciarSesion() {
    console.log('Usuario:', this.usuario);
    console.log('Contraseña:', this.contrasena);
  }

 
  
}
