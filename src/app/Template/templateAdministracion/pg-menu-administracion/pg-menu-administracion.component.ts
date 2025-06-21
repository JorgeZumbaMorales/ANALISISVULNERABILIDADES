import { Component, OnInit , Input, OnChanges, SimpleChanges} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ServiciosAutenticacion } from '../../../ModuloServiciosWeb/ServiciosAutenticacion.component';
import { SesionUsuarioService } from '../../../Seguridad/sesion-usuario.service';

@Component({
  selector: 'app-pg-menu-administracion',
  templateUrl: './pg-menu-administracion.component.html',
  styleUrls: ['./pg-menu-administracion.component.css']
})
export class PgMenuAdministracionComponent implements OnInit {
  @Input() rolActivo: string = ''; // 🔹 Nuevo
  menuItems: any[] = [];
  activeMenu: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: ServiciosAutenticacion,
    private sesionService: SesionUsuarioService
  ) {}

  ngOnInit(): void {
    const perfil = this.sesionService.obtenerPerfil();
    if (perfil && perfil.roles.length > 0) {
      this.rolActivo = perfil.roles[0];
      this.cargarMenuPorRol(this.rolActivo);
    }

    this.route.url.subscribe(() => {
      this.activeMenu = this.router.url;
    });
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['rolActivo'] && changes['rolActivo'].currentValue) {
      this.cargarMenuPorRol(this.rolActivo);
    }
  }
  cargarMenuPorRol(rol: string) {
    this.authService.obtenerMenuPorRol(rol).subscribe({
      next: (secciones) => {
        this.menuItems = secciones.map((s: any) => ({
          label: s.nombre_seccion,
          routerLink: s.ruta,
          icon: this.obtenerIcono(s.nombre_seccion)
        }));
      }
    });
  }
  obtenerIcono(nombre: string): string {
    const iconos: any = {
      Inicio: 'pi pi-home',
      Administración: 'pi pi-users',
      Dispositivos: 'pi pi-desktop',
      Vulnerabilidades: 'pi pi-shield',
      Reportes: 'pi pi-chart-line',
      Configuraciones: 'pi pi-cog'
    };
    return iconos[nombre] || 'pi pi-bars';
  }

  setActiveMenu(route: string) {
    this.activeMenu = route;
  }
}
