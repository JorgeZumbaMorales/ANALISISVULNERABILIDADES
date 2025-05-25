import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ServiciosAutenticacion } from '../../ModuloServiciosWeb/ServiciosAutenticacion.component';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { SortEvent } from 'primeng/api';

@Component({
  selector: 'app-pg-roles',
  templateUrl: './pg-roles.component.html',
  styleUrls: ['./pg-roles.component.css'],
  providers: [MessageService]
})
export class PgRolesComponent implements OnInit {
  @ViewChild('dt') dt!: Table;

  roles: any[] = [];
  rolesOriginal: any[] = [];
  opcionesMenu: any[] = [];
  formularioRol!: FormGroup;

  modalesVisibles: { [key: string]: boolean } = {};
  rolEnEdicion: any = null;
  ordenActivo: boolean | null = null;

  constructor(
    private fb: FormBuilder,
    private servicioAuth: ServiciosAutenticacion,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.obtenerRoles();
    this.obtenerSeccionesMenu();
    this.inicializarFormulario();
  }

  inicializarFormulario() {
    this.formularioRol = this.fb.group({
      nombre_rol: ['', Validators.required],
      descripcion: ['', Validators.required],
      accesos_menu: [[], Validators.required]
    });
  }

  obtenerRoles() {
    this.servicioAuth.listarRoles().subscribe({
      next: (data: any[]) => {
        this.roles = data.map((rol: any) => ({
          ...rol,
          estadoTexto: rol.estado ? 'Activo' : 'Inactivo',
          seccionesTexto: rol.secciones_menu?.map((s: any) => s.nombre_seccion).join(', ') ?? ''
        }));
        this.rolesOriginal = [...this.roles]; // Guardar copia original
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo obtener la lista de roles'
        });
      }
    });
  }

  obtenerSeccionesMenu() {
    this.servicioAuth.listarTodasLasSecciones().subscribe({
      next: (res) => {
        this.opcionesMenu = res.datos
          .filter((s: any) => s.estado === true)
          .map((s: any) => ({
            etiqueta: s.nombre_seccion,
            value: s.seccion_id
          }));
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron obtener las secciones'
        });
      }
    });
  }

  filtrarRoles(event: Event) {
    const valor = (event.target as HTMLInputElement).value;
    this.dt.filterGlobal(valor, 'contains');
  }

  ordenarRolesRemovible(event: SortEvent) {
    if (this.ordenActivo === null) {
      this.ordenActivo = true;
      this.ordenarDatosRoles(event);
    } else if (this.ordenActivo === true) {
      this.ordenActivo = false;
      this.ordenarDatosRoles(event);
    } else {
      this.ordenActivo = null;
      this.roles = [...this.rolesOriginal];
      this.dt.reset();
    }
  }

  ordenarDatosRoles(event: SortEvent) {
    const field = event.field;
    const order = event.order;
    if (!field || order === undefined || order === null) return;

    this.roles.sort((a, b) => {
      const valorA = (a[field] ?? '').toString().toLowerCase();
      const valorB = (b[field] ?? '').toString().toLowerCase();

      if (valorA === '' && valorB !== '') return -1;
      if (valorA !== '' && valorB === '') return 1;

      return order * valorA.localeCompare(valorB);
    });
  }

  manejarModal(nombre: string, abrir: boolean) {
    this.modalesVisibles[nombre] = abrir;

    if (nombre === 'rolFormulario') {
      if (abrir) {
        if (this.rolEnEdicion) {
          this.formularioRol.patchValue({
            nombre_rol: this.rolEnEdicion.nombre_rol,
            descripcion: this.rolEnEdicion.descripcion,
            accesos_menu: this.rolEnEdicion.secciones_menu?.map((s: any) => s.seccion_id) || []
          });
        } else {
          this.formularioRol.reset({ accesos_menu: [] });
        }
      } else {
        this.rolEnEdicion = null;
        this.formularioRol.reset();
      }
    }
  }

  agregarRol() {
    this.rolEnEdicion = null;
    this.manejarModal('rolFormulario', true);
  }

  editarRol(rol: any) {
    this.rolEnEdicion = rol;
    this.manejarModal('rolFormulario', true);
  }

  eliminarRol(rol: any) {
    console.log('Eliminar rol:', rol);
    this.roles = this.roles.filter(r => r !== rol);
  }

  guardarNuevoRol() {
    if (this.formularioRol.invalid) return;

    const nuevoRol = this.formularioRol.value;

    this.servicioAuth.crearRol(nuevoRol).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Rol creado',
          detail: 'Se agregó correctamente el nuevo rol'
        });
        this.obtenerRoles();
        this.manejarModal('rolFormulario', false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo crear el rol'
        });
      }
    });
  }
}
