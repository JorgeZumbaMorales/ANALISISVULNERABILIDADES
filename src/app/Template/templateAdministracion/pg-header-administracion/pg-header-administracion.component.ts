import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { SesionUsuarioService } from '../../../Seguridad/sesion-usuario.service';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-pg-header-administracion',
  templateUrl: './pg-header-administracion.component.html',
  styleUrls: ['./pg-header-administracion.component.css']
})
export class PgHeaderAdministracionComponent implements OnInit {
   @Output() cambioRol = new EventEmitter<string>(); // 🔹 Nuevo evento
  roles: { label: string, value: string }[] = [];
  selectedRole: string = '';
  nombresCompletos: string = '';
  nombreUsuario: string = '';
  correo: string = '';
  perfilMenu: MenuItem[] = [];

  constructor(
    private sesionService: SesionUsuarioService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const perfil = this.sesionService.obtenerPerfil();
    if (perfil) {
      this.roles = perfil.roles.map((rol: string) => ({ label: rol, value: rol }));
      this.selectedRole = this.roles[0]?.value || '';
      this.nombresCompletos = perfil.nombres_completos;
      this.nombreUsuario = perfil.nombre_usuario;
      this.correo = perfil.email;

      // Menú contextual del perfil
      this.perfilMenu = [
        {
          label: this.nombresCompletos,
          icon: 'pi pi-id-card',
          disabled: false
        },
        {
          label: `${this.nombreUsuario}`,
          icon: 'pi pi-user',
          disabled: false
        },
        {
          label: `${this.correo}`,
          icon: 'pi pi-envelope',
          disabled: false
        },
        { separator: true },
        {
          label: 'Cerrar Sesión',
          icon: 'pi pi-sign-out',
          command: () => this.logout()
        }
      ];
    }
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/public/login']);
  }
  onCambiarRol() {
    this.cambioRol.emit(this.selectedRole);
  }
}
