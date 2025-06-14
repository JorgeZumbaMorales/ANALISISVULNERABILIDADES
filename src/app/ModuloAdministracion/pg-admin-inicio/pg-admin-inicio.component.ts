import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { SesionUsuarioService } from '../../Seguridad/sesion-usuario.service';
import { ServiciosAutenticacion } from '../../ModuloServiciosWeb/ServiciosAutenticacion.component';
import { Subscription } from 'rxjs';
import { DataSet, Network } from 'vis-network/standalone/esm/vis-network';

@Component({
  selector: 'app-pg-admin-inicio',
  templateUrl: './pg-admin-inicio.component.html',
  styleUrls: ['./pg-admin-inicio.component.css']
})
export class PgAdminInicioComponent implements OnInit, OnDestroy, AfterViewInit {
  nombreUsuario: string = '';
  rolActivo: string = '';
  secciones: any[] = [];
  private subscripcionRol!: Subscription;
  private network!: Network;

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

  ngAfterViewInit(): void {
    // Inicializamos el mapa de red vacío
    this.inicializarMapaRed([]);
  }

  cargarSecciones(rol: string) {
    this.authService.obtenerMenuPorRol(rol).subscribe({
      next: (res) => {
        this.secciones = res
          .filter((seccion: any) => seccion.nombre_seccion?.trim().toLowerCase() !== 'inicio') // Filtramos "Inicio"
          .map((seccion: any) => {
            return {
              ...seccion,
              descripcion: this.generarDescripcion(seccion.nombre_seccion)
            };
          });

        // Generamos el mapa de red
        this.inicializarMapaRed(this.secciones);
      },
      error: (error) => {
        console.error('Error al obtener secciones:', error);
      }
    });
  }

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

  inicializarMapaRed(secciones: any[]) {
    const contenedor = document.getElementById('network');
    if (!contenedor) return;

    const nodos = new DataSet<any>([
      { id: 1, label: 'Inicio', shape: 'circle', color: '#fc4b08', font: { color: '#fff' } },
      ...secciones.map((seccion, indice) => ({
        id: indice + 2,
        label: seccion.nombre_seccion,
        shape: 'box',
        title: seccion.descripcion
      }))
    ]);

    const conexiones = new DataSet<any>(
      secciones.map((seccion, indice) => ({
        from: 1,
        to: indice + 2
      }))
    );

    const datos = { nodes: nodos, edges: conexiones };

    const opciones = {
      nodes: {
        borderWidth: 2,
        size: 30,
        color: {
          border: '#222222',
          background: '#97C2FC'
        },
        font: { size: 14, color: '#000' },
        shadow: true
      },
      edges: {
        width: 2,
        color: { color: '#fc4b08' },
        smooth: {
          enabled: true,
          type: 'continuous',
          roundness: 0.5
        },
        shadow: true
      },
      interaction: {
        hover: true,
        navigationButtons: true,
        keyboard: true
      },
      physics: {
        enabled: true,
        barnesHut: {
          gravitationalConstant: -2000,
          springLength: 150
        }
      }
    };

    // Si ya existe el mapa de red, lo destruimos para evitar duplicados
    if (this.network) {
      this.network.destroy();
    }

    this.network = new Network(contenedor, datos, opciones);

    // Manejamos el clic en los nodos
    this.network.on('click', (parametros) => {
      if (parametros.nodes.length) {
        const idNodo = parametros.nodes[0];
        if (idNodo === 1) return; // "Inicio" no navega

        const seccion = secciones[idNodo - 2];
        if (seccion) {
          this.navegarASeccion(seccion);
        }
      }
    });
  }

  navegarASeccion(seccion: any) {
    console.log('Navegar a:', seccion.nombre_seccion);
    // Aquí puedes implementar navegación real con el Router
    // Ejemplo: this.router.navigate(['/ruta-relacionada']);
  }

  ngOnDestroy(): void {
    this.subscripcionRol?.unsubscribe();
    if (this.network) {
      this.network.destroy();
    }
  }
}
