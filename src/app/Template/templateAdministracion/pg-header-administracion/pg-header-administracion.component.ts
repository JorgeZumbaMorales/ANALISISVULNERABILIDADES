import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { SesionUsuarioService } from '../../../Seguridad/sesion-usuario.service';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { OverlayPanel } from 'primeng/overlaypanel';
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
  notificaciones = [
    { mensaje: 'Nuevo escaneo completado' },
    { mensaje: 'Se detectaron vulnerabilidades críticas' }
  ];
  cantidadNotificaciones = this.notificaciones.length;
  @ViewChild('opNotificaciones') opNotificaciones!: OverlayPanel;
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
    label: 'Nombres Apellidos',
    items: [
      {
        label: this.nombresCompletos,
        icon: 'pi pi-id-card',
        disabled: true,
        style: { opacity: 1, 'font-weight': 'bold', 'pointer-events': 'none' }
      }
    ]
  },
  {
    label: 'Usuario',
    items: [
      {
        label: this.nombreUsuario,
        icon: 'pi pi-user',
        disabled: true,
        style: { opacity: 1, 'pointer-events': 'none' }
      }
    ]
  },
  {
    label: 'Correo',
    items: [
      {
        label: this.correo,
        icon: 'pi pi-envelope',
        disabled: true,
        style: { opacity: 1, 'pointer-events': 'none' }
      }
    ]
  },
  {
    separator: true
  },
  {
  label: 'Salir de la cuenta',
  items: [
    {
      label: 'Cerrar Sesión',
      icon: 'pi pi-sign-out',
      command: () => this.logout()
    }
  ]
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
   mostrarNotificaciones(event: Event) {
    this.opNotificaciones.toggle(event);
  }
}
