import { Component, OnInit, OnDestroy } from '@angular/core';
import { SesionUsuarioService } from '../../Seguridad/sesion-usuario.service';
import { ServiciosAutenticacion } from '../../ModuloServiciosWeb/ServiciosAutenticacion.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-pg-admin-inicio',
  templateUrl: './pg-admin-inicio.component.html',
  styleUrls: ['./pg-admin-inicio.component.css']
})
export class PgAdminInicioComponent implements OnInit, OnDestroy {
  nombreUsuario: string = '';
  rolActivo: string = '';
  secciones: any[] = [];
  private subscripcionRol!: Subscription;

  constructor(
    private sesionService: SesionUsuarioService,
    private authService: ServiciosAutenticacion
  ) {}

  ngOnInit(): void {
    const perfil = this.sesionService.obtenerPerfil();
    if (perfil) {
      this.nombreUsuario = perfil.nombres_completos;
    }

    this.subscripcionRol = this.sesionService.getRolActivo().subscribe((rol) => {
      this.rolActivo = rol;
      this.cargarSecciones(rol);
    });
  }

cargarSecciones(rol: string) {
  this.authService.obtenerMenuPorRol(rol).subscribe({
    next: (res) => {
      

      this.secciones = res
  .filter((seccion: any) => seccion.nombre_seccion?.trim().toLowerCase() !== 'inicio') // 🔥 filtrar "Inicio"
  .map((seccion: any) => {
    return {
      ...seccion,
      descripcion: this.generarDescripcion(seccion.nombre_seccion)
    };
  });

    },
    error: (error) => {
      
    }
  });
}


// 👇 Lógica que da descripciones según el nombre de la sección
generarDescripcion(nombreSeccion: string): string {
  const clave = nombreSeccion?.trim().toLowerCase();

  const descripciones: { [key: string]: string } = {
    'inicio': 'Visualiza un resumen general y accede rápidamente a las áreas principales.',
    'dispositivos': 'Administra los dispositivos conectados a tu red.',
    'vulnerabilidades': 'Analiza y gestiona las vulnerabilidades detectadas.',
    'reportes': 'Genera reportes técnicos detallados de tus análisis.',
    'administración': 'Gestiona usuarios, roles y configuraciones del sistema.',
    'configuraciones': 'Ajusta parámetros y define reglas de análisis de red.'
  };

  return descripciones[clave] || 'Accede a la sección correspondiente para más detalles.';
}




  ngOnDestroy(): void {
    this.subscripcionRol?.unsubscribe();
  }
}
