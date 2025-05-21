import { Component } from '@angular/core';

@Component({
  selector: 'app-pg-dashboard-visual',
  templateUrl: './pg-dashboard-visual.component.html',
  styleUrls: ['./pg-dashboard-visual.component.css']
})
export class PgDashboardVisualComponent {
  fechaInicio: Date = new Date();
  fechaFin: Date = new Date();

  // 📊 Métricas Totales
  totalDispositivos: number = 0;
  totalEscaneos: number = 0;
  totalVulnerabilidades: number = 0;
  modoSeleccion: 'single' | 'range' = 'single';
  fechaSeleccionada: Date | Date[] = new Date();
  // 🎠 Carousel bloques
  bloquesDashboard = [
    'escaneos',
    'estado_dispositivos',
    'puertos',
    'vulnerabilidades',
    'riesgo',
    'sistemas_operativos'
  ];
  ngOnInit() {
    this.cargarTotales(); // Esto se llama una sola vez al inicio
  }
  
  // 📊 Bloque 1: Escaneos por día
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

  opcionesEscaneos = {
    responsive: true,
    plugins: {
      legend: { position: 'top' }
    },
    scales: {
      x: { title: { display: true, text: 'Fecha' }},
      y: { beginAtZero: true, title: { display: true, text: 'Cantidad' }}
    }
  };

  // 🧩 Bloque 3: Estado de dispositivos
  datosEstadoDispositivos = {
    labels: ['Activos', 'Inactivos'],
    datasets: [
      {
        data: [18, 7],
        backgroundColor: ['#10b981', '#f59e0b']
      }
    ]
  };

  opcionesDona = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' }
    }
  };

  // 🌐 Bloque 4: Puertos más comunes
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

  opcionesPuertos = {
    indexAxis: 'y',
    responsive: true,
    plugins: {
      legend: { display: false }
    }
  };

  // ⚠️ Bloque 5: Top vulnerabilidades
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

  opcionesVulnerabilidades = {
    responsive: true,
    plugins: {
      legend: { display: false }
    }
  };

  // 🔐 Bloque 6: Riesgo promedio por dispositivo
  datosRiesgoPromedio = {
    labels: ['Router', 'Servidor Web', 'PC01'],
    datasets: [
      {
        label: 'Score Promedio',
        data: [8.1, 6.5, 7.2],
        backgroundColor: '#f43f5e'
      }
    ]
  };

  opcionesRiesgoPromedio = {
    responsive: true,
    plugins: {
      legend: { position: 'top' }
    }
  };

  // 🧠 Bloque 7: Sistemas operativos
  datosSistemasOperativos = {
    labels: ['Windows', 'Linux', 'Android'],
    datasets: [
      {
        data: [14, 9, 2],
        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b']
      }
    ]
  };

  opcionesSistemasOperativos = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' }
    }
  };

  // 🔄 Simula carga inicial
  actualizarDashboard() {
    console.log("📆 Actualizando gráficos con fechas:", this.fechaInicio, this.fechaFin);
    
    // Aquí luego pondrás llamadas filtradas por fecha a la base de datos
    this.actualizarGraficoEscaneos();
    this.actualizarGraficoEstadoDispositivos();
    this.actualizarGraficoPuertos();
    this.actualizarGraficoVulnerabilidades();
    this.actualizarGraficoRiesgos();
    this.actualizarGraficoSistemasOperativos();
  }

  cargarTotales() {
    // Datos estáticos o consulta directa sin filtro de fechas
    this.totalDispositivos = 25;
    this.totalEscaneos = 72;
    this.totalVulnerabilidades = 134;
  }
  
  actualizarGraficoEscaneos() {
    console.log("📊 Actualizando gráfico de escaneos...");
  }
  
  actualizarGraficoEstadoDispositivos() {
    console.log("🧩 Actualizando gráfico de estado de dispositivos...");
  }
  
  actualizarGraficoPuertos() {
    console.log("🌐 Actualizando gráfico de puertos más comunes...");
  }
  
  actualizarGraficoVulnerabilidades() {
    console.log("⚠️ Actualizando gráfico de vulnerabilidades más comunes...");
  }
  
  actualizarGraficoRiesgos() {
    console.log("🔐 Actualizando gráfico de riesgo promedio por dispositivo...");
  }
  
  actualizarGraficoSistemasOperativos() {
    console.log("🧠 Actualizando gráfico de sistemas operativos...");
  }
  
  alternarModoSeleccion() {
    this.modoSeleccion = this.modoSeleccion === 'single' ? 'range' : 'single';
    this.fechaSeleccionada = this.modoSeleccion === 'single' ? new Date() : [];
  }
  
  visualizarDatos() {
    console.log("🔍 Visualizando con:", this.modoSeleccion, this.fechaSeleccionada);
    // Aquí llamas a las funciones correspondientes según el tipo
  }
}
