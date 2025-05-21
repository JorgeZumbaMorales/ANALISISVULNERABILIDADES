import { Component } from '@angular/core';

interface ReporteGenerado {
  id: number;
  tipo: 'pdf' | 'excel';
  fechaGeneracion: string;
  usuario: string;
  archivo: string;
}

@Component({
  selector: 'app-pg-reportes-documentos',
  templateUrl: './pg-reportes-documentos.component.html',
  styleUrls: ['./pg-reportes-documentos.component.css']
})
export class PgReportesDocumentosComponent {
  reportes: ReporteGenerado[] = [];
  modalCrearVisible = false;
  estadoFiltro: boolean | null = null;
  nuevoScore: number | null = null;
  listaDispositivos = [
    { id: 1, nombre: 'Router Principal', activo: true },
    { id: 2, nombre: 'Servidor Web', activo: false },
    { id: 3, nombre: 'Cámara IP', activo: true }
  ];
  opcionesTipoScore = [
    { label: 'Rango', value: 'rango' },
    { label: 'Valores específicos', value: 'especificos' }
  ];
  
  dispositivosFiltrados: { id: number; nombre: string; activo: boolean }[] = [];

  filtros: any = {
    dispositivos: [],
    incluirPuertos: false,
    incluirVulnerabilidades: false,
    soloConExploit: false,
    incluirResumenTecnico: false,
    incluirHistorialIps: false,
    formato: 'pdf',
    activarFiltroScore: false,
  tipoFiltroScore: 'rango', // puede ser: 'rango' o 'especificos'
  rangoCVSS: [7.0, 10.0],
  scoresEspecificos: []
  };

  ngOnInit() {
    this.actualizarDispositivos();
  }

  ngOnChanges() {
    this.actualizarDispositivos();
  }

  actualizarDispositivos() {
    this.dispositivosFiltrados = this.listaDispositivos.filter(d => {
      if (this.estadoFiltro === null) return true;
      return d.activo === this.estadoFiltro;
    });
  }

  descargarPDF(reporte: ReporteGenerado) {
    const link = document.createElement('a');
    link.href = reporte.archivo;
    link.download = `reporte-${reporte.id}.${reporte.tipo}`;
    link.target = '_blank';
    link.click();
  }

  filtrar(event: Event) {
    const valor = (event.target as HTMLInputElement).value;
  }

  verReporte(reporte: ReporteGenerado) {
    console.log("Visualizar reporte:", reporte);
  }

  accionBotonGeneral(tipo: string, data?: ReporteGenerado) {
    switch (tipo) {
      case 'crear':
        this.modalCrearVisible = true;
        break;
      case 'ver':
        console.log("👁️ Ver reporte", data);
        break;
      case 'eliminar':
        console.log("🗑️ Eliminar reporte", data);
        break;
      default:
        console.warn("⚠️ Acción desconocida:", tipo);
    }
  }
  agregarScoreEspecifico() {
    const score = Number(this.nuevoScore);
    if (!isNaN(score) && score >= 0 && score <= 10 && !this.filtros.scoresEspecificos.includes(score)) {
      this.filtros.scoresEspecificos.push(Number(score.toFixed(1)));
      this.nuevoScore = null;
    }
  }
  eliminarScoreEspecifico(index: number) {
    this.filtros.scoresEspecificos.splice(index, 1);
  }
  cerrarModalCrear() {
    this.modalCrearVisible = false;
  }

  generarReporte() {
    console.log("📄 Generando reporte con filtros:", this.filtros);
    this.modalCrearVisible = false;
  }
}
