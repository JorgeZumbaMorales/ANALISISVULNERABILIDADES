import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ServiciosDispositivos } from '../../ModuloServiciosWeb/ServiciosDispositivos.component';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-pg-historial-dispositivos',
  templateUrl: './pg-historial-dispositivos.component.html',
  styleUrls: ['./pg-historial-dispositivos.component.css']
})
export class PgHistorialDispositivosComponent implements OnInit, AfterViewInit {
  dispositivos: any[] = [];
  
  @ViewChild('dt') dt!: Table; // Asegurarse que Angular detecta este elemento

  constructor(private servicioDispositivos: ServiciosDispositivos) {}

  ngOnInit() {
    this.obtenerTodosLosDispositivos();
  }

  ngAfterViewInit() {
    if (!this.dt) {
        console.warn('❌ dt no está inicializado aún');
    }
  }

  obtenerTodosLosDispositivos() {
    this.servicioDispositivos.listarTodosLosDispositivosCompleto().subscribe({
      next: (response) => {
        this.dispositivos = response.data;
      },
      error: (error) => {
        console.error('Error al obtener dispositivos', error);
      }
    });
  }

  filtrarDispositivos(event: Event) {
    const inputValue = (event.target as HTMLInputElement).value;
    if (this.dt) {
      this.dt.filterGlobal(inputValue, 'contains');
    }
  }
}
