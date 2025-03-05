import { Component, OnInit } from '@angular/core';
import { ServiciosDispositivos } from '../../ModuloServiciosWeb/ServiciosDispositivos.component';

@Component({
  selector: 'app-pg-dispositivos',
  templateUrl: './pg-dispositivos.component.html',
  styleUrls: ['./pg-dispositivos.component.css']
})
export class PgDispositivosComponent implements OnInit {
  dispositivos: any[] = [];

  constructor(private serviciosDispositivos: ServiciosDispositivos) {}

  ngOnInit(): void {
    this.cargarDispositivos();
  }

  // 📌 Cargar dispositivos desde el backend con JOIN
  cargarDispositivos() {
    this.serviciosDispositivos.listarDispositivosCompleto().subscribe({
      next: (response) => {
        this.dispositivos = response.data; // Recibe la lista de dispositivos con JOIN
      },
      error: (err) => console.error('Error al obtener dispositivos', err)
    });
  }
  editarDispositivo(dispositivo: any) {
    console.log("Editar dispositivo:", dispositivo);
    // Aquí puedes abrir un modal con los datos del dispositivo
  }
  eliminarDispositivo(dispositivo: any) {
    if (confirm('¿Estás seguro de eliminar este dispositivo?')) {
      console.log("Eliminar dispositivo:", dispositivo);
      // Aquí puedes llamar al servicio para eliminarlo
    }
  }
}
