import { Component } from '@angular/core';

@Component({
  selector: 'app-pg-admin-inicio',
  standalone: false,
  templateUrl: './pg-admin-inicio.component.html',
  styleUrl: './pg-admin-inicio.component.css'
})
export class PgAdminInicioComponent {
  nombreUsuario: string = 'Administrador';
}
