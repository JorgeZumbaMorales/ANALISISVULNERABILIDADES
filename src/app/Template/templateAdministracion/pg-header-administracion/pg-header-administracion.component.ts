import { Component } from '@angular/core';

@Component({
  selector: 'app-pg-header-administracion',
  standalone: false,
  templateUrl: './pg-header-administracion.component.html',
  styleUrl: './pg-header-administracion.component.css'
})
export class PgHeaderAdministracionComponent {
  logout(): void {
    console.log('Cerrando sesión...');
  }
}
