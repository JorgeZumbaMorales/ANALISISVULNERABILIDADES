import { Component,ViewChild } from '@angular/core';
import { ServiciosReportes } from '../../ModuloServiciosWeb/ServiciosReportes.component';
import { ChartModule } from 'primeng/chart';
@Component({
  selector: 'app-pg-dashboard-visual',
  templateUrl: './pg-dashboard-visual.component.html',
  styleUrls: ['./pg-dashboard-visual.component.css']
})
export class PgDashboardVisualComponent {
  constructor(private serviciosDashboard: ServiciosReportes) {}
    @ViewChild('puertosChart') puertosChartRef: any;
  // Datos originales completos (para escaneos)
labelsEscaneosOriginal: string[] = [];
dataEscaneosOriginal: number[] = [];

// Datos paginados que se muestran en el gráfico
labelsEscaneosPaginadas: string[] = [];
dataEscaneosPaginada: number[] = [];

// Variables de paginación
indicePaginaEscaneos: number = 0;
totalPaginasEscaneos: number = 0;

  // Métricas totales
  totalDispositivos: number = 0;
  totalEscaneos: number = 0;
  totalVulnerabilidades: number = 0;
  totalPuertosAbiertos: number = 0;

  // Gráficos
  opcionesGraficoLineas: any;
  opcionesGraficoDona: any;
  opcionesGraficoBarras: any;

  // Estado del tab seleccionado
  indiceActivo: number = 0;

  // Variables para los gráficos
  datosEscaneos: any = {};
  datosEstadoDispositivos: any = {};
  datosPuertos: any = {};
  datosVulnerabilidades: any = {};
  datosDispositivosConCVE: any = {};
  datosNivelRiesgo: any = {};

  // Filtros para los gráficos
  filtroEscaneos: string = 'ultimo_mes';
  filtroPuertos: string = 'ultimo_mes';
  filtroVulnerabilidades: string = 'ultimo_mes';
  filtroDispositivosCVEs: string = 'ultimo_mes';

  // Límite para los gráficos
  limitePuertos: number = 5;
  limiteVulnerabilidades: number = 5;
  limiteDispositivosCVEs: number = 5;
// Modal CVEs
modalCVEsVisible: boolean = false;
listaCves: any[] = [];
cargandoCVEs: boolean = false;
@ViewChild('tablaCVEs') tablaCVEs?: any;


opcionesGraficoBarrasPuertos: any;  
opcionesGraficoBarrasVulnerabilidades: any;

  // Opciones de filtros de tiempo
  opcionesFiltrosTiempo = [
    { etiqueta: 'Hoy', valor: 'hoy' },
    { etiqueta: 'Última semana', valor: 'ultima_semana' },
    { etiqueta: 'Últimos 15 días', valor: 'ultimos_15_dias' },
    { etiqueta: 'Último mes', valor: 'ultimo_mes' }
  ].map(op => ({ label: op.etiqueta, value: op.valor }));

  // Opciones de límite
  opcionesLimite = Array.from({ length: 10 }, (_, i) => ({ label: `${i + 1}`, value: i + 1 }));

  ngOnInit() {
    // Opciones gráficas
    this.opcionesGraficoLineas = this.obtenerOpcionesGraficoLineas();
    this.opcionesGraficoDona = this.obtenerOpcionesGraficoDona();
    this.opcionesGraficoBarras = this.obtenerOpcionesGraficoBarras();

    // Cargar datos reales
    this.cargarMetricas();
    this.cargarEstadoDispositivos();
    this.cargarEscaneosPorFecha();
    this.cargarPuertosMasComunes();
    this.cargarVulnerabilidadesMasFrecuentes();
    this.cargarDispositivosConMasCVEs();
    this.cargarNivelRiesgo();

     this.opcionesGraficoBarrasPuertos = this.obtenerOpcionesGraficoBarras(true);
     this.opcionesGraficoBarrasVulnerabilidades = this.obtenerOpcionesGraficoBarras(false, true);

  }
abrirModalCVEs() {
  this.modalCVEsVisible = true;
  this.cargarListaCVEs();
}

cargarListaCVEs() {
  this.cargandoCVEs = true;
  this.serviciosDashboard.listarVulnerabilidadesCVE().subscribe({
    next: (res) => {
      this.listaCves = res;
      this.cargandoCVEs = false;
    },
    error: (err) => {
      console.error("Error al cargar CVEs:", err);
      this.cargandoCVEs = false;
    }
  });
}
  // Carga de métricas totales
  cargarMetricas() {
    this.serviciosDashboard.obtenerMetricasDashboard().subscribe(res => {
      this.totalDispositivos = res.total_dispositivos;
      this.totalEscaneos = res.total_escaneos;
      this.totalVulnerabilidades = res.total_vulnerabilidades;
      this.totalPuertosAbiertos = res.total_puertos_abiertos;
    });
  }

  cargarEstadoDispositivos() {
    this.serviciosDashboard.obtenerEstadoDispositivos().subscribe(res => {
      this.datosEstadoDispositivos = {
        labels: ['Activos', 'Inactivos'],
        datasets: [
          {
            data: [res.activos, res.inactivos],
            backgroundColor: [ '#0A2342','#f97316']
          }
        ]
      };
    });
  }

  cargarEscaneosPorFecha() {
  this.serviciosDashboard.obtenerEscaneosPorFecha(this.filtroEscaneos).subscribe(res => {
    // Guardamos los datos completos
    this.labelsEscaneosOriginal = res.labels;
    this.dataEscaneosOriginal = res.data;

    // Calcular número de páginas
    this.totalPaginasEscaneos = Math.ceil(this.labelsEscaneosOriginal.length / 7);
    this.indicePaginaEscaneos = 0; // empezamos en la primera página

    // Actualizamos el gráfico
    this.actualizarPaginaEscaneos();
  });
}

cargarPuertosMasComunes() {
    this.serviciosDashboard.obtenerPuertosMasComunes(this.limitePuertos, this.filtroPuertos).subscribe(res => {
      this.datosPuertos = {
        labels: res.labels,
        datasets: [
          {
            label: 'Recuento',
            data: res.data,
            backgroundColor: '#f97316'
          }
        ],
        servicios: res.servicios
      };

      this.opcionesGraficoBarrasPuertos = this.obtenerOpcionesGraficoBarras(true);

      // 🚀 Forzar refresh del chart
      setTimeout(() => {
        if (this.puertosChartRef) {
          this.puertosChartRef.refresh();
        }
      }, 0);
    });
  }


  cargarVulnerabilidadesMasFrecuentes(tipo: string | null = null) {
    this.serviciosDashboard.obtenerVulnerabilidadesMasFrecuentes(this.limiteVulnerabilidades, this.filtroVulnerabilidades, tipo).subscribe(res => {
      this.datosVulnerabilidades = {
  labels: res.labels,
  datasets: [
    {
      label: 'Recuento',
      data: res.data,
      backgroundColor: ['#f97316', '#f97316', '#facc15', '#38bdf8', '#a78bfa']
    }
  ],
  urls: res.urls   // guardar aquí
};

    });
  }

  cargarDispositivosConMasCVEs() {
    this.serviciosDashboard.obtenerDispositivosConMasCVEs(this.limiteDispositivosCVEs, this.filtroDispositivosCVEs).subscribe(res => {
      this.datosDispositivosConCVE = {
        labels: res.labels,
        datasets: [
          {
            label: 'Cantidad de Vulnerabilidades',
            data: res.data,
            backgroundColor: '#f97316'
          }
        ]
      };
    });
  }

  cargarNivelRiesgo() {
    this.serviciosDashboard.obtenerNivelRiesgo().subscribe(res => {
      this.datosNivelRiesgo = {
        labels: res.labels,
        datasets: [
          {
            data: res.data,
            backgroundColor: ['#ef4444', '#f59e0b', '#10b981', '#9ca3af']
          }
        ]
      };
    });
  }
filtrarTablaCVEs(event: Event) {
  const input = event.target as HTMLInputElement;
  const valor = input?.value || '';
  this.tablaCVEs?.filterGlobal(valor, 'contains');
}

  // Opciones reutilizables para los gráficos
obtenerOpcionesGraficoBarras(esPuertos: boolean = false, esVulnerabilidades: boolean = false): any {
  return {
    
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          maxTicksLimit: 6
        }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: esPuertos
        ? {
            callbacks: {
              label: (context: any) => {
                const index = context.dataIndex;
                const servicio = this.datosPuertos.servicios ? this.datosPuertos.servicios[index] : 'Desconocido';
                const cantidad = context.dataset.data[index];
                return `Servicio: ${servicio} `;
              }
            }
          }
        : esVulnerabilidades
        ? {
            callbacks: {
              label: (context: any) => {
                const index = context.dataIndex;
                const url = this.datosVulnerabilidades.urls ? this.datosVulnerabilidades.urls[index] : 'No disponible';
                const cantidad = context.dataset.data[index];
                return `URL: ${url} `;
              }
            }
          }
        : {}
    },
    onClick: esVulnerabilidades
      ? (event: any, elements: any[]) => {
          if (elements.length > 0) {
            const index = elements[0].index;
            const url = this.datosVulnerabilidades.urls ? this.datosVulnerabilidades.urls[index] : null;
            if (url) {
              window.open(url, '_blank');
            }
          }
        }
      : undefined
  };
}









  obtenerOpcionesGraficoDona(): any {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' }
      }
    };
  }

  obtenerOpcionesGraficoLineas(): any {
    return {


      plugins: {
        legend: { position: 'top' }
      },
      scales: {
        x: { title: { display: true, text: 'Fecha' }},
        y: { beginAtZero: true, title: { display: true, text: 'Cantidad' }}
      }
    };
  }

  calcularAlturaGrafico(numeroEtiquetas: number | undefined): number {
    if (!numeroEtiquetas) return 400;  // altura por defecto

    const alturaBase = 100;
    const alturaPorEtiqueta = 40;
    const alturaMaxima = 600;

    return Math.min(alturaBase + numeroEtiquetas * alturaPorEtiqueta, alturaMaxima);
  }

  

  
  

actualizarPaginaEscaneos() {
  const inicio = this.indicePaginaEscaneos * 7;
  const fin = inicio + 7;

  this.labelsEscaneosPaginadas = this.labelsEscaneosOriginal.slice(inicio, fin);
  this.dataEscaneosPaginada = this.dataEscaneosOriginal.slice(inicio, fin);

  this.datosEscaneos = {
  labels: this.labelsEscaneosPaginadas,
  datasets: [
    {
      label: 'Escaneos',
      backgroundColor: '#f97316',   // puntos actuales AZUL
      borderColor: '#f97316',       // línea actual AZUL
      fill: false,
      data: this.dataEscaneosPaginada
    }
  ]
};

}

paginaAnteriorEscaneos() {
  if (this.indicePaginaEscaneos > 0) {
    this.indicePaginaEscaneos--;
    this.actualizarPaginaEscaneos();
  }
}

paginaSiguienteEscaneos() {
  if (this.indicePaginaEscaneos < this.totalPaginasEscaneos - 1) {
    this.indicePaginaEscaneos++;
    this.actualizarPaginaEscaneos();
  }
}



}
