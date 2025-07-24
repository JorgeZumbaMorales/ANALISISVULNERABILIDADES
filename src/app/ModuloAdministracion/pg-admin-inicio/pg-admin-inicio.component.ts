import { Component, OnInit, OnDestroy } from '@angular/core';
import { SesionUsuarioService } from '../../Seguridad/sesion-usuario.service';
import { ServiciosAutenticacion } from '../../ModuloServiciosWeb/ServiciosAutenticacion.component';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { Carousel } from 'primeng/carousel';
import { PrimeTemplate } from 'primeng/api';
import { Button } from 'primeng/button';
@Component({
  standalone: true,
  selector: 'app-pg-admin-inicio',
  templateUrl: './pg-admin-inicio.component.html',
  styleUrls: ['./pg-admin-inicio.component.css'],
  imports: [Carousel, PrimeTemplate, Button]
})
export class PgAdminInicioComponent implements OnInit, OnDestroy {
  nombreUsuario: string = '';
  rolActivo: string = '';
  seccionesTarjetas: any[] = [];
  responsiveOptions = [
    { breakpoint: '1024px', numVisible: 2, numScroll: 1 },
    { breakpoint: '768px', numVisible: 1, numScroll: 1 }
  ];
  private subscripcionRol!: Subscription;
  constructor(
    private sesionService: SesionUsuarioService,
    private authService: ServiciosAutenticacion,
    private router: Router
  ) { }
  ngOnInit(): void {
    const perfil = this.sesionService.obtenerPerfil();
    if (perfil) {
      this.nombreUsuario = perfil.nombres_completos;
    }
    this.nombreUsuario = perfil?.nombres_completos || '';
    this.subscripcionRol = this.sesionService.getRolActivo().subscribe(rol => {
      this.rolActivo = rol;
      this.authService.obtenerMenuPorRol(rol).subscribe({
        next: res => {
          const todas = res.filter((s: any) => s.nombre_seccion?.toLowerCase() !== 'inicio');
          this.seccionesTarjetas = todas.map((s: any) => {
            // Genera aquí la descripción extendida según el nombre
            let descripcionExtendida = '';
            const clave = s.nombre_seccion?.trim().toLowerCase();
            switch (clave) {
              case 'vulnerabilidades':
                descripcionExtendida =
                  '• Escaneo de Vulnerabilidades: inicia, supervisa y cancela análisis.\n' +
                  '• Detalle de CVEs: filtra, consulta y genera recomendaciones.';
                break;
              case 'dispositivos':
                descripcionExtendida =
                  'Gestiona los dispositivos de tu red: listarlos, editarlos, eliminarlos y ver detalles de puertos y IPs.';
                break;
              case 'reportes':
                descripcionExtendida =
                  'Crea, visualiza y descarga reportes PDF personalizados según filtros y agrupaciones.';
                break;
              case 'administración':
                descripcionExtendida =
                  'Administra usuarios, roles y permisos del sistema.Administra usuarios, roles y permisos del sistema.Administra usuarios, roles y permisos del sistema.Administra usuarios, roles y permisos del sistema.Administra usuarios, roles y permisos del sistema.Administra usuarios, roles y permisos del sistema.Administra usuarios, roles y permisos del sistema.Administra usuarios, roles y permisos del sistema.Administra usuarios, roles y permisos del sistema.Administra usuarios, roles y permisos del sistema.Administra usuarios, roles y permisos del sistema.Administra usuarios, roles y permisos del sistema.Administra usuarios, roles y permisos del sistema.';
                break;
              case 'configuraciones':
                descripcionExtendida =
                  'Define y valida tus parámetros de escaneo: frecuencia, horarios y filtros.';
                break;
              default:
                descripcionExtendida = s.descripcion || '';
            }

            return {
              ...s,
              icono: this.obtenerIcono(s.nombre_seccion),
              ruta: s.ruta,
              descripcionExtendida 
            };
          });
        },
        error: err => console.error('Error al obtener secciones:', err)
      });
    });
  }
  obtenerIcono(nombre: string): string {
    const clave = nombre?.trim().toLowerCase();
    const iconos: { [key: string]: string } = {
      'dispositivos': 'pi pi-desktop',
      'vulnerabilidades': 'pi pi-shield',
      'reportes': 'pi pi-file',
      'administración': 'pi pi-users',
      'configuraciones': 'pi pi-cog'
    };
    return iconos[clave] || 'pi pi-box';
  }
  navegarASeccion(seccion: any): void {
    if (seccion?.ruta) {
      this.router.navigate([seccion.ruta]);
    }
  }
  ngOnDestroy(): void {
    this.subscripcionRol?.unsubscribe();
  }
}
