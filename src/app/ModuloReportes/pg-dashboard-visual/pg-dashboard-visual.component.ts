import { Component } from '@angular/core';

@Component({
  selector: 'app-pg-dashboard-visual',
  templateUrl: './pg-dashboard-visual.component.html',
  styleUrls: ['./pg-dashboard-visual.component.css']
})
export class PgDashboardVisualComponent {

  // Métricas totales
  totalDispositivos: number = 0;
  totalEscaneos: number = 0;
  totalVulnerabilidades: number = 0;
  totalPuertosAbiertos: number = 0;

  // Estado del tab seleccionado
  indiceActivo: number = 0;

  // Definición de las pestañas
  tabs = [
  { valor: 0, titulo: 'Escaneos' },
  { valor: 1, titulo: 'Estado de Dispositivos' },
  { valor: 2, titulo: 'Puertos Abiertos' },
  { valor: 3, titulo: 'Vulnerabilidades' },
  { valor: 4, titulo: 'Dispositivos con CVE' },
  { valor: 5, titulo: 'Nivel de Riesgo' }
];

  ngOnInit() {
    this.cargarTotales();
  }

  // Carga de métricas totales
  cargarTotales() {
    this.totalDispositivos = 25;
    this.totalEscaneos = 72;
    this.totalVulnerabilidades = 134;
    this.totalPuertosAbiertos = 58;
  }

  // Opciones reutilizables para los gráficos
  obtenerOpcionesGraficoBarras(): any {
    return {
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      indexAxis: 'y'
    };
  }

  obtenerOpcionesGraficoDona(): any {
    return {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' }
      }
    };
  }

  obtenerOpcionesGraficoLineas(): any {
    return {
      responsive: true,
      plugins: {
        legend: { position: 'top' }
      },
      scales: {
        x: { title: { display: true, text: 'Fecha' }},
        y: { beginAtZero: true, title: { display: true, text: 'Cantidad' }}
      }
    };
  }

  // Datos simulados para cada gráfico

  datosEscaneos = {
    labels: ['2025-05-01', '2025-05-02', '2025-05-03', '2025-05-04'],
    datasets: [
      {
        label: 'Escaneos',
        backgroundColor: '#0ea5e9',
        data: [5, 3, 7, 2]
      }
    ]
  };

  datosEstadoDispositivos = {
    labels: ['Activos', 'Inactivos'],
    datasets: [
      {
        data: [18, 7],
        backgroundColor: ['#10b981', '#f59e0b']
      }
    ]
  };

  datosPuertos = {
    labels: ['80', '443', '22', '21'],
    datasets: [
      {
        label: 'Recuento',
        data: [12, 9, 7, 4],
        backgroundColor: '#3b82f6'
      }
    ]
  };

  datosVulnerabilidades = {
    labels: ['CVE-2023-1234', 'CVE-2022-4567', 'CVE-2021-7890'],
    datasets: [
      {
        label: 'Recuento',
        data: [15, 10, 7],
        backgroundColor: ['#ef4444', '#f97316', '#facc15']
      }
    ]
  };

  datosDispositivosConCVE = {
    labels: ['Dispositivo 1', 'Dispositivo 2', 'Dispositivo 3'],
    datasets: [
      {
        label: 'Cantidad de Vulnerabilidades',
        data: [12, 9, 6],
        backgroundColor: '#3b82f6'
      }
    ]
  };

  datosNivelRiesgo = {
    labels: ['Alto', 'Medio', 'Bajo', 'Sin Riesgo'],
    datasets: [
      {
        data: [8, 15, 20, 5],
        backgroundColor: ['#ef4444', '#f59e0b', '#10b981', '#9ca3af']
      }
    ]
  };

}
