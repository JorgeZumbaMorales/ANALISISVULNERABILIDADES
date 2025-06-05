import { Component, OnInit, OnDestroy,Output, EventEmitter, ViewChild } from '@angular/core';
import { SesionUsuarioService } from '../../../Seguridad/sesion-usuario.service';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { OverlayPanel } from 'primeng/overlaypanel';
import { ServiciosAlertas } from '../../../ModuloServiciosWeb/ServiciosAlertas.component';
import { NotificacionService } from '../../../ValidacionesFormularios/notificacion.service';

@Component({
  selector: 'app-pg-header-administracion',
  templateUrl: './pg-header-administracion.component.html',
  styleUrls: ['./pg-header-administracion.component.css']
})
export class PgHeaderAdministracionComponent implements OnInit,OnDestroy {
   @Output() cambioRol = new EventEmitter<string>(); // 🔹 Nuevo evento
   idUsuario: number = 0;
  roles: { label: string, value: string }[] = [];
  selectedRole: string = '';
  nombresCompletos: string = '';
  nombreUsuario: string = '';
  correo: string = '';
  perfilMenu: MenuItem[] = [];
  notificaciones: any[] = [];
  cantidadNotificaciones = this.notificaciones.length;
  notificacionesIntervalo: any = null;
  historialNotificaciones: any[] = [];
  
  @ViewChild('opNotificaciones') opNotificaciones!: OverlayPanel;
  constructor(
    private sesionService: SesionUsuarioService,
    private router: Router,
    private alertasService: ServiciosAlertas,
    private notificacion: NotificacionService,
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
  
    const usuario = this.sesionService.obtenerUsuarioDesdeToken();
if (!usuario?.usuario_id) {
  this.notificacion.error('Error', 'No se pudo identificar al usuario.');
  return;
}
this.idUsuario = usuario.usuario_id;
    // 🟢 Iniciar polling automático de notificaciones cada 10s
this.notificacionesIntervalo = setInterval(() => {
  this.consultarNotificacionesSistema(this.idUsuario, false); // 👈 false = no marcar como vistas automáticamente
}, 1000); // cada 3 segundos

  }


  ngOnDestroy(): void {
  if (this.notificacionesIntervalo) {
    clearInterval(this.notificacionesIntervalo);
    this.notificacionesIntervalo = null;
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

  if (this.idUsuario) {
    this.consultarNotificacionesSistema(this.idUsuario, true); // activa = estado=True
    this.consultarHistorialNotificacionesSistema(this.idUsuario); // historial = últimas 5
  }
}

private consultarHistorialNotificacionesSistema(usuarioId: number): void {
  this.alertasService.obtenerHistorialNotificacionesSistema(usuarioId).subscribe({
    next: (res) => {
      this.historialNotificaciones = res.datos || [];
    },
    error: (err) => {
      console.error('Error al consultar historial de notificaciones:', err);
    }
  });
}


private consultarNotificacionesSistema(usuarioId: number, marcarComoVistas: boolean = false): void {
  this.alertasService.listarNotificacionesSistemaPorUsuario(usuarioId).subscribe({
    next: (res) => {
      this.notificaciones = res.datos || [];
      this.cantidadNotificaciones = this.notificaciones.length;

      // 🟠 Solo marcar como vistas si se solicitó explícitamente (ej: al abrir la campana)
      if (marcarComoVistas && this.notificaciones.length > 0) {
        this.alertasService.marcarNotificacionesComoVistas(usuarioId).subscribe();
      }
    },
    error: (err) => {
      console.error('Error al consultar notificaciones:', err);
    }
  });
}


}
