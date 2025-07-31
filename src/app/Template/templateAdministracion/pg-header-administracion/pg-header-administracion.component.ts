import { Component, OnInit, OnDestroy, Output, EventEmitter, ViewChild } from '@angular/core';
import { ServiciosAutenticacion } from '../../../ModuloServiciosWeb/ServiciosAutenticacion.component';
import { SesionUsuarioService } from '../../../Seguridad/sesion-usuario.service';
import { Router } from '@angular/router';
import { MenuItem, PrimeTemplate } from 'primeng/api';
import { OverlayPanel, OverlayPanelModule } from 'primeng/overlaypanel';
import { ServiciosAlertas } from '../../../ModuloServiciosWeb/ServiciosAlertas.component';
import { NotificacionService } from '../../../ValidacionesFormularios/notificacion.service';
import { NgIf, NgFor, NgClass } from '@angular/common';
import { BadgeDirective } from 'primeng/badge';
import { Tooltip } from 'primeng/tooltip';
import { IftaLabel } from 'primeng/iftalabel';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { Menu } from 'primeng/menu';
import { ButtonDirective } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { PasswordModule } from 'primeng/password';

@Component({
  standalone: true,
  selector: 'app-pg-header-administracion',
  templateUrl: './pg-header-administracion.component.html',
  styleUrls: ['./pg-header-administracion.component.css'],
  imports: [NgIf, BadgeDirective, Tooltip, OverlayPanelModule, NgFor,
    IftaLabel, DropdownModule, FormsModule, PrimeTemplate, NgClass,
    ButtonModule, PasswordModule,
    DialogModule, AvatarModule, DividerModule,
    Menu, ButtonDirective]
})
export class PgHeaderAdministracionComponent implements OnInit, OnDestroy {
  @Output() cambioRol = new EventEmitter<string>(); 
  idUsuario: number = 0;
  roles: { label: string, value: string }[] = [];
  selectedRole: string = '';
  dialogoPerfilVisible = false;
  audioNotificacion: HTMLAudioElement | null = null;
  nombresCompletos: string = '';
  dialogoContrasenaVisible: boolean = false;
  nombreUsuario: string = '';
  correo: string = '';
  perfilMenu: MenuItem[] = [];
  notificaciones: any[] = [];
  cantidadNotificaciones = this.notificaciones.length;
  notificacionesIntervalo: any = null;
  historialNotificaciones: any[] = [];
  formContrasena = {
    actual: '',
    nueva: '',
    repetir: ''
  };

  @ViewChild('opNotificaciones') opNotificaciones!: OverlayPanel;
  constructor(
    private sesionService: SesionUsuarioService,
    private router: Router,
    private alertasService: ServiciosAlertas,
    private notificacion: NotificacionService,
    private servicioAuth: ServiciosAutenticacion,
  ) { }

  ngOnInit(): void {
    const perfil = this.sesionService.obtenerPerfil();
    if (perfil) {
      this.roles = perfil.roles.map((rol: string) => ({ label: rol, value: rol }));
      this.selectedRole = this.roles[0]?.value || '';
      this.nombresCompletos = perfil.nombres_completos;
      this.nombreUsuario = perfil.nombre_usuario;
      this.correo = perfil.email;


      this.perfilMenu = [
        {
          label: 'Mi Cuenta',
          items: [
            {
              label: 'Ver mi perfil',
              icon: 'pi pi-user',
              command: () => this.dialogoPerfilVisible = true
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
  
    this.notificacionesIntervalo = setInterval(() => {
      this.consultarNotificacionesSistema(this.idUsuario, false); 
    }, 1000);
    this.sesionService.escucharRefrescarRoles().subscribe(() => {
      this.refrescarRolesActivos();
    });
    this.audioNotificacion = new Audio('sonido_notificacion.mp3');
    this.audioNotificacion.load();
  }

  refrescarRolesActivos() {
    const perfil = this.sesionService.obtenerPerfil();
    if (perfil) {
      this.roles = perfil.roles.map((rol: string) => ({ label: rol, value: rol }));

      
      if (!this.roles.find(r => r.value === this.selectedRole)) {
        this.selectedRole = this.roles[0]?.value || '';
        this.onCambiarRol(); 
      }
    }
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
      this.consultarNotificacionesSistema(this.idUsuario, true); 
      this.consultarHistorialNotificacionesSistema(this.idUsuario); 
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
        const nuevas = res.datos || [];
        const nuevasCantidad = nuevas.length;

        if (nuevasCantidad > this.cantidadNotificaciones && this.audioNotificacion) {
          this.audioNotificacion.play().catch(err => {
            console.warn('No se pudo reproducir el sonido:', err);
          });
        }

        this.notificaciones = nuevas;
        this.cantidadNotificaciones = nuevasCantidad;

        if (marcarComoVistas && nuevasCantidad > 0) {
          this.alertasService.marcarNotificacionesComoVistas(usuarioId).subscribe();
        }
      },
      error: (err) => {
        console.error('Error al consultar notificaciones:', err);
      }
    });
  }

  abrirDialogoContrasena() {
    this.formContrasena = {
      actual: '',
      nueva: '',
      repetir: ''
    };
    this.dialogoContrasenaVisible = true;
  }
  guardarNuevaContrasena() {
    const { actual, nueva, repetir } = this.formContrasena;

    if (!actual || !nueva || !repetir) {
      this.notificacion.info('Campos incompletos', 'Por favor complete todos los campos.');
      return;
    }

    if (nueva !== repetir) {
      this.notificacion.info('Información', 'Las nuevas contraseñas no coinciden.');
      return;
    }

    if (!this.validarFortalezaContrasena(nueva)) {
      this.notificacion.info('Contraseña débil', 'Debe contener al menos una minúscula, una mayúscula, un número y 8 caracteres como mínimo.');
      return;
    }

    const credenciales = {
      nombre_usuario: this.nombreUsuario,
      contrasena: actual
    };


    this.servicioAuth.iniciarSesion(credenciales).subscribe({
      next: () => {
        const datosActualizacion = {
          usuario_id: this.idUsuario,
          nueva_contrasena: nueva
        };

        this.servicioAuth.actualizarContrasena(datosActualizacion).subscribe({
          next: () => {
            this.notificacion.success('Éxito', 'Contraseña actualizada correctamente.');
            this.dialogoContrasenaVisible = false;
          },
          error: () => {
            this.notificacion.info('Información', 'No se pudo actualizar la contraseña.');
          }
        });
      },
      error: () => {
        this.notificacion.info('Información', 'La contraseña actual es incorrecta.');
      }
    });
  }


  bloquearEspacios(event: KeyboardEvent): void {
    if (event.key === ' ' || event.key === 'Tab') {
      event.preventDefault();
    }
  }
  private validarFortalezaContrasena(contrasena: string): boolean {
    const tieneMinuscula = /[a-z]/.test(contrasena);
    const tieneMayuscula = /[A-Z]/.test(contrasena);
    const tieneNumero = /\d/.test(contrasena);
    const tieneLongitud = contrasena.length >= 8;
    return tieneMinuscula && tieneMayuscula && tieneNumero && tieneLongitud;
  }

}
