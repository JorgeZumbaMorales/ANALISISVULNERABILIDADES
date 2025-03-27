import { Component } from '@angular/core';

@Component({
  selector: 'app-pg-dashboard-visual',
  templateUrl: './pg-dashboard-visual.component.html',
  styleUrls: ['./pg-dashboard-visual.component.css']
})
export class PgDashboardVisualComponent {
  opcionesGrafico = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'bottom'
      }
    }
  };

  riesgosPorDispositivo = {
    labels: ['PC01', 'PC02', 'Servidor01', 'Laptop10'],
    datasets: [
      {
        label: 'Riesgos Detectados',
        backgroundColor: ['#0ea5e9', '#38bdf8', '#0284c7', '#0369a1'],
        data: [5, 8, 12, 4]
      }
    ]
  };

  notificacionesPorTipo = {
    labels: ['Alerta Crítica', 'Advertencia', 'Informativa'],
    datasets: [
      {
        data: [45, 30, 53],
        backgroundColor: ['#ef4444', '#f59e0b', '#10b981']
      }
    ]
  };

  puertosPorDispositivo = {
    labels: ['PC01', 'PC02', 'Servidor01', 'Laptop10'],
    datasets: [
      {
        label: 'Puertos Abiertos',
        backgroundColor: '#6366f1',
        data: [10, 6, 14, 3]
      }
    ]
  };

  reportesPorTipo = {
    labels: ['Feb', 'Mar', 'Abr', 'May'],
    datasets: [
      {
        label: 'Vulnerabilidades',
        borderColor: '#3b82f6',
        tension: 0.4,
        fill: false,
        data: [3, 5, 6, 8]
      },
      {
        label: 'Dispositivos',
        borderColor: '#10b981',
        tension: 0.4,
        fill: false,
        data: [4, 4, 5, 6]
      }
    ]
  };
}
