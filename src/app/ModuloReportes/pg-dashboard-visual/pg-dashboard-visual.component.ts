import { Component, ViewChild, ElementRef } from '@angular/core';
import { ServiciosReportes } from '../../ModuloServiciosWeb/ServiciosReportes.component';
import { ChartModule, UIChart } from 'primeng/chart';
import { Panel } from 'primeng/panel';
import { Tooltip } from 'primeng/tooltip';
import { TabView, TabPanel } from 'primeng/tabview';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { Badge } from 'primeng/badge';
import { NgIf, NgFor } from '@angular/common';
import { Chip } from 'primeng/chip';
import { Dialog } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { PrimeTemplate } from 'primeng/api';
import { InputText } from 'primeng/inputtext';
import { Table } from 'primeng/table';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  standalone: true,
  selector: 'app-pg-dashboard-visual',
  templateUrl: './pg-dashboard-visual.component.html',
  styleUrls: ['./pg-dashboard-visual.component.css'],
  imports: [Panel, Tooltip, TabView, TabPanel, IconField, ProgressSpinnerModule, DropdownModule, InputIcon, FormsModule, UIChart, Badge, NgIf, Chip, NgFor, Dialog, TableModule, PrimeTemplate, InputText]
})
export class PgDashboardVisualComponent {
  constructor(private serviciosDashboard: ServiciosReportes) { }
  @ViewChild('puertosChart') puertosChartRef: any;
  @ViewChild('dtCVEs') dtCVEs!: Table;
  visibleDrawer: boolean = false;
  totalDispositivosEvaluados: number = 0;
  totalDispositivos: number = 0;
  totalVulnerabilidades: number = 0;
  totalPuertosAbiertos: number = 0;
  opcionesGraficoDona: any;
  opcionesGraficoBarras: any;
  indiceActivo: number = 0;
  listaDispositivosResumen: any[] = [];
  listaPuertosResumen: any[] = [];
  modalDispositivosVisible: boolean = false;
  modalPuertosVisible: boolean = false;
  cargandoDispositivos: boolean = false;
  cargandoPuertos: boolean = false;
  datosEstadoDispositivos: any = {};
  datosPuertos: any = {};
  datosVulnerabilidades: any = {};
  datosDispositivosConCVE: any = {};
  datosNivelRiesgo: any = {};
  filtroPuertos: string = 'ultimo_mes';
  filtroVulnerabilidades: string = 'ultimo_mes';
  filtroDispositivosCVEs: string = 'ultimo_mes';
  limitePuertos: number = 5;
  limiteVulnerabilidades: number = 5;
  limiteDispositivosCVEs: number = 5;
  modalCVEsVisible: boolean = false;
  coloresRiesgo = ['#ef4444', '#f59e0b', '#10b981', '#9ca3af']; 
  @ViewChild('inputDispositivos') inputDispositivos!: ElementRef;
  @ViewChild('inputCVEs') inputCVEs!: ElementRef;
  @ViewChild('inputPuertos') inputPuertos!: ElementRef;
  listaCves: any[] = [];
  cargandoCVEs: boolean = false;
  @ViewChild('tablaCVEs') tablaCVEs?: any;
  @ViewChild('tablaDispositivos') tablaDispositivos?: Table;
  @ViewChild('tablaPuertos') tablaPuertos?: Table;
  dispositivoMasVulnerable: any = null;
  opcionesGraficoBarrasPuertos: any;
  opcionesGraficoBarrasVulnerabilidades: any;
  opcionesFiltrosTiempo = [
    { etiqueta: 'Hoy', valor: 'hoy' },
    { etiqueta: 'Última semana', valor: 'ultima_semana' },
    { etiqueta: 'Últimos 15 días', valor: 'ultimos_15_dias' },
    { etiqueta: 'Último mes', valor: 'ultimo_mes' }
  ].map(op => ({ label: op.etiqueta, value: op.valor }));
  opcionesLimite = Array.from({ length: 10 }, (_, i) => ({ label: `${i + 1}`, value: i + 1 }));

  ngOnInit() {
    this.opcionesGraficoDona = this.obtenerOpcionesGraficoDona();
    this.opcionesGraficoBarras = this.obtenerOpcionesGraficoBarras();
    this.cargarMetricas();
    this.cargarEstadoDispositivos();
    this.cargarPuertosMasComunes();
    this.cargarVulnerabilidadesMasFrecuentes();
    this.cargarDispositivosConMasCVEs();
    this.cargarNivelRiesgo();
    this.opcionesGraficoBarrasPuertos = this.obtenerOpcionesGraficoBarras(true);
    this.opcionesGraficoBarrasVulnerabilidades = this.obtenerOpcionesGraficoBarras(false, true);
  }
  abrirModalCVEs() {
    this.modalCVEsVisible = true;
    this.cargandoCVEs = true;
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
  abrirModalDispositivos() {
    this.modalDispositivosVisible = true;
    this.cargandoDispositivos = true;
    this.serviciosDashboard.obtenerDispositivosResumen().subscribe({
      next: (res) => {
        this.listaDispositivosResumen = res;
        this.cargandoDispositivos = false;
      },
      error: (err) => {
        console.error("Error al cargar dispositivos resumen:", err);
        this.cargandoDispositivos = false;
      }
    });
  }

  abrirModalPuertos() {
    this.modalPuertosVisible = true;
    this.cargandoPuertos = true;
    this.serviciosDashboard.obtenerPuertosAbiertosResumen().subscribe({
      next: (res) => {
        this.listaPuertosResumen = res;
        this.cargandoPuertos = false;
      },
      error: (err) => {
        console.error("Error al cargar puertos resumen:", err);
        this.cargandoPuertos = false;
      }
    });
  }

  cargarMetricas() {
    this.serviciosDashboard.obtenerMetricasDashboard().subscribe(res => {
      this.totalDispositivos = res.total_dispositivos;

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
            backgroundColor: ['#0A2342', '#f97316']
          }
        ]
      };
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
      setTimeout(() => {
        if (this.puertosChartRef) {
          this.puertosChartRef.refresh();
        }
      }, 0);
    });
  }
  cargarVulnerabilidadesMasFrecuentes(tipo: string | null = null) {
    this.serviciosDashboard.obtenerVulnerabilidadesMasFrecuentes(this.limiteVulnerabilidades, this.filtroVulnerabilidades, tipo).subscribe(res => {
      const etiquetasCortas = res.labels.map((_: string, index: number) => `Vulnerabilidad ${index + 1}`);

      this.datosVulnerabilidades = {
        labels: etiquetasCortas,
        datasets: [
          {
            label: 'Recuento',
            data: res.data,
            backgroundColor: ['#f97316', '#f97316', '#facc15', '#38bdf8', '#a78bfa']
          }
        ],
        urls: res.urls,
        originales: res.labels
      };
    });

  }
  cargarDispositivosConMasCVEs() {
    this.serviciosDashboard
      .obtenerDispositivosConMasCVEs(this.limiteDispositivosCVEs, this.filtroDispositivosCVEs)
      .subscribe((res) => {

        const labels = res.dispositivos.map((d: any, i: number) => `Dispositivo ${i + 1} - ${d.ultima_ip}`);


        const data = res.dispositivos.map((d: any) => d.cantidad_cves);

        this.datosDispositivosConCVE = {
          labels,
          datasets: [
            {
              label: 'Cantidad de Vulnerabilidades',
              data,
              backgroundColor: '#f97316'
            }
          ],
          originales: res.dispositivos
        };


      });
  }
  filtrarTablaDispositivos(event: Event) {
    const input = event.target as HTMLInputElement;
    const valor = input?.value || '';
    this.tablaDispositivos?.filterGlobal(valor, 'contains');
  }


  filtrarTablaPuertos(event: Event) {
    const input = event.target as HTMLInputElement;
    const valor = input?.value || '';
    this.tablaPuertos?.filterGlobal(valor, 'contains');
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
      this.totalDispositivosEvaluados = res.data.reduce((acc: number, val: number) => acc + val, 0);
    });
  }
  filtrarTablaCVEs(event: Event) {
    const input = event.target as HTMLInputElement;
    const valor = input?.value || '';
    this.dtCVEs?.filterGlobal(valor, 'contains');
  }

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
        legend: {
          position: 'bottom',
          labels: {
            color: '#374151', 
            font: {
              size: 13,
              weight: '500'
            },
            padding: 16
          }
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const label = context.label ?? 'Sin etiqueta';
              const value = context.parsed ?? 0;

              const dataset = context.dataset?.data ?? [];
              const total = dataset.reduce((acc: number, val: number) => acc + val, 0);
              const porcentaje = total > 0 ? ((value / total) * 100).toFixed(1) : '0';

              return `${label}: ${value} (${porcentaje}%)`;
            }
          }
        }
      },
      animation: {
        animateRotate: true,
        animateScale: true
      },
      cutout: '60%' 
    };
  }

  obtenerOpcionesGraficoLineas(): any {
    return {
      plugins: {
        legend: { position: 'top' }
      },
      scales: {
        x: { title: { display: true, text: 'Fecha' } },
        y: { beginAtZero: true, title: { display: true, text: 'Cantidad' } }
      }
    };
  }
  calcularAlturaGrafico(numeroEtiquetas: number | undefined): number {
    if (!numeroEtiquetas) return 400;
    const alturaBase = 100;
    const alturaPorEtiqueta = 40;
    const alturaMaxima = 600;
    return Math.min(alturaBase + numeroEtiquetas * alturaPorEtiqueta, alturaMaxima);
  }
  limpiarBusquedaDispositivos() {
    if (this.inputDispositivos) {
      this.inputDispositivos.nativeElement.value = '';
    }
    this.tablaDispositivos?.clear(); 
  }

  limpiarBusquedaCVEs() {
    this.inputCVEs.nativeElement.value = '';
    this.dtCVEs?.clear();
  }

  limpiarBusquedaPuertos() {
    this.inputPuertos.nativeElement.value = '';
    this.tablaPuertos?.clear();
  }



}
