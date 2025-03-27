import { Component } from '@angular/core';

interface ReporteGenerado {
  id: number;
  nombre: string;
  tipo: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  usuario: string;
  pdf: string; // URL del PDF
}

@Component({
  selector: 'app-pg-reportes-documentos',
  templateUrl: './pg-reportes-documentos.component.html',
  styleUrls: ['./pg-reportes-documentos.component.css']
})
export class PgReportesDocumentosComponent {

  reportes: ReporteGenerado[] = [
    {
      id: 1,
      nombre: 'Reporte de Vulnerabilidades',
      tipo: 'Vulnerabilidades',
      descripcion: 'Análisis completo del sistema del 20/03/2025.',
      fechaInicio: '2025-03-20',
      fechaFin: '2025-03-21',
      usuario: 'admin',
      pdf: 'https://example.com/reporte1.pdf'
    },
    {
      id: 2,
      nombre: 'Reporte de Dispositivos',
      tipo: 'Dispositivos',
      descripcion: 'Listado de dispositivos conectados en red.',
      fechaInicio: '2025-03-18',
      fechaFin: '2025-03-19',
      usuario: 'admin',
      pdf: 'https://example.com/reporte2.pdf'
    }
  ];

  modalVisible = false;
  reporteSeleccionado?: ReporteGenerado;

  abrirModal() {
    this.modalVisible = true;
  }

  cerrarModal() {
    this.modalVisible = false;
    this.reporteSeleccionado = undefined;
  }

  verReporte(reporte: ReporteGenerado) {
    this.reporteSeleccionado = reporte;
    this.abrirModal();
  }

  descargarPDF(reporte: ReporteGenerado) {
    const link = document.createElement('a');
    link.href = reporte.pdf;
    link.download = `${reporte.nombre}.pdf`;
    link.target = '_blank';
    link.click();
  }

  filtrar(event: Event) {
    const valor = (event.target as HTMLInputElement).value;
    // Este método solo se llama por (input), PrimeNG hace el filtrado automáticamente con globalFilterFields
  }

}
