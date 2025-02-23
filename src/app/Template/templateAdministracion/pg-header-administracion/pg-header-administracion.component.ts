import { Component } from '@angular/core';

@Component({
  selector: 'app-pg-header-administracion',
  standalone: false,
  templateUrl: './pg-header-administracion.component.html',
  styleUrls: ['./pg-header-administracion.component.css']
})
export class PgHeaderAdministracionComponent {
  roles = [
    { label: 'Administrador', value: 'Administrador' },
    { label: 'Analista', value: 'Analista' },
    { label: 'Usuario', value: 'Usuario' }
  ];
  
  selectedRole = 'Administrador';

  logout() {
    console.log('Cerrando sesión...');
    // Aquí puedes agregar la lógica para cerrar sesión
  }
}
