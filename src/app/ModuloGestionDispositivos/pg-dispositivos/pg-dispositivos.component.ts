import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ServiciosDispositivos } from '../../ModuloServiciosWeb/ServiciosDispositivos.component';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-pg-dispositivos',
  templateUrl: './pg-dispositivos.component.html',
  styleUrls: ['./pg-dispositivos.component.css'],
  providers: [MessageService]
})
export class PgDispositivosComponent implements OnInit {
  dispositivos: any[] = [];
  modalVisible: boolean = false;
  formularioDispositivo!: FormGroup;
  dispositivoSeleccionado: any = null;

  constructor(
    private serviciosDispositivos: ServiciosDispositivos,
    private fb: FormBuilder,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.cargarDispositivos();

    // Inicializar formulario
    this.formularioDispositivo = this.fb.group({
      mac_address: [''],
      fabricante: [''],
      ultima_ip: [''],
      estado: [true]
    });
  }

  // 📌 Cargar dispositivos desde el backend
  cargarDispositivos() {
    this.serviciosDispositivos.listarDispositivos().subscribe({
      next: (data) => this.dispositivos = data,
      error: (err) => console.error('Error al obtener dispositivos', err)
    });
  }

  // 📌 Mostrar modal para agregar un nuevo dispositivo
  mostrarModalAgregar() {
    this.formularioDispositivo.reset();
    this.dispositivoSeleccionado = null;
    this.modalVisible = true;
  }

  // 📌 Editar un dispositivo existente
  editarDispositivo(dispositivo: any) {
    this.dispositivoSeleccionado = dispositivo;
    this.formularioDispositivo.patchValue(dispositivo);
    this.modalVisible = true;
  }

  // 📌 Guardar dispositivo (Agregar o Editar)
  guardarDispositivo() {
    if (this.dispositivoSeleccionado) {
      // Actualizar dispositivo
      this.serviciosDispositivos.actualizarDispositivo(this.dispositivoSeleccionado.dispositivo_id, this.formularioDispositivo.value)
        .subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Dispositivo actualizado' });
            this.cargarDispositivos();
            this.cerrarModal();
          },
          error: (err) => console.error('Error al actualizar dispositivo', err)
        });
    } else {
      // Crear nuevo dispositivo
      this.serviciosDispositivos.crearDispositivo(this.formularioDispositivo.value)
        .subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Dispositivo agregado' });
            this.cargarDispositivos();
            this.cerrarModal();
          },
          error: (err) => console.error('Error al crear dispositivo', err)
        });
    }
  }

  // 📌 Eliminar dispositivo
  eliminarDispositivo(dispositivo: any) {
    if (confirm('¿Estás seguro de eliminar este dispositivo?')) {
      this.serviciosDispositivos.eliminarDispositivo(dispositivo.dispositivo_id)
        .subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Dispositivo eliminado' });
            this.cargarDispositivos();
          },
          error: (err) => console.error('Error al eliminar dispositivo', err)
        });
    }
  }

  // 📌 Cerrar modal
  cerrarModal() {
    this.modalVisible = false;
  }
}
