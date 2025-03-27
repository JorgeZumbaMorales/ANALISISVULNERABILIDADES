import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Table } from 'primeng/table';
import { ServiciosDispositivos } from '../../ModuloServiciosWeb/ServiciosDispositivos.component';

@Component({
  selector: 'app-pg-dispositivos',
  templateUrl: './pg-dispositivos.component.html',
  styleUrls: ['./pg-dispositivos.component.css']
})
export class PgDispositivosComponent implements OnInit, AfterViewInit {
  dispositivos: any[] = [];

  @ViewChild('dt') dt!: Table;

  constructor(private serviciosDispositivos: ServiciosDispositivos) {}

  ngOnInit(): void {
    this.cargarDispositivos();
  }

  ngAfterViewInit(): void {
    if (!this.dt) console.warn('❌ dt no está inicializado aún');
  }

  cargarDispositivos() {
    this.serviciosDispositivos.listarDispositivosCompleto().subscribe({
      next: (response) => {
        console.log('📦 Datos recibidos del backend:', response);
        this.dispositivos = response.data;
      },
      error: (err) => console.error('Error al obtener dispositivos', err)
    });
  }

  filtrarDispositivos(event: Event) {
    const inputValue = (event.target as HTMLInputElement).value;
    if (this.dt) {
      this.dt.filterGlobal(inputValue, 'contains');
    }
  }

  editarDispositivo(dispositivo: any) {
    console.log('✏️ Editar dispositivo:', dispositivo);
  }

  eliminarDispositivo(dispositivo: any) {
    if (confirm('¿Estás seguro de eliminar este dispositivo?')) {
      console.log('🗑️ Eliminar dispositivo:', dispositivo);
    }
  }
}
