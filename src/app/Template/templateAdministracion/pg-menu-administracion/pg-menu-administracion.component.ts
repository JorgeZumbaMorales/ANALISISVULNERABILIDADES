
import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { CommonModule } from '@angular/common';

import { ServiciosAutenticacion } from '../../../ModuloServiciosWeb/ServiciosAutenticacion.component';
import { SesionUsuarioService } from '../../../Seguridad/sesion-usuario.service';

@Component({
  standalone: true,
  selector: 'app-pg-menu-administracion',
  templateUrl: './pg-menu-administracion.component.html',
  styleUrls: ['./pg-menu-administracion.component.css'],
  imports: [
    CommonModule,    
    RouterModule    
  ]
})
export class PgMenuAdministracionComponent implements OnInit, OnChanges {
  @Input() rolActivo = '';
  items: MenuItem[] = [];

  constructor(
    private auth: ServiciosAutenticacion,
    private session: SesionUsuarioService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    const perfil = this.session.obtenerPerfil();
    if (perfil?.roles?.length) {
      this.rolActivo = perfil.roles[0];
      this.loadItems(this.rolActivo);
    }
    this.route.parent?.params.subscribe(() => { });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['rolActivo']?.currentValue) {
      this.loadItems(this.rolActivo);
    }
  }

  private loadItems(rol: string) {
    this.auth.obtenerMenuPorRol(rol).subscribe(secciones => {
      this.items = secciones.map((s: any) => ({
        label: s.nombre_seccion,
        icon: this.iconFor(s.nombre_seccion),
        routerLink: s.ruta,
        routerLinkActiveOptions: { exact: false }
      }));
    });
  }

  private iconFor(name: string): string {
    return {
      Inicio: 'pi pi-home',
      Administración: 'pi pi-users',
      Dispositivos: 'pi pi-desktop',
      Vulnerabilidades: 'pi pi-shield',
      Reportes: 'pi pi-chart-line',
      Configuraciones: 'pi pi-cog'
    }[name] || 'pi pi-bars';
  }


  trackByLink(_idx: number, item: MenuItem) {
    return item.routerLink;
  }
}
