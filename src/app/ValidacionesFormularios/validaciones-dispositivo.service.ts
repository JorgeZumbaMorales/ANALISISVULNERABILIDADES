import { Injectable } from '@angular/core';
import { NotificacionService } from './notificacion.service';

@Injectable({ providedIn: 'root' })
export class ValidacionesGeneralesService {
  constructor(private notificacion: NotificacionService) {}

  campoVacio(valor: string | null | undefined): boolean {
    return !valor || valor.trim().length === 0;
  }

  longitudValida(valor: string | null | undefined, min: number, max: number): boolean {
    if (!valor) return false;
    const length = valor.trim().length;
    return length >= min && length <= max;
  }

  contieneCaracteresInvalidos(valor: string, patron: RegExp = /[^a-zA-Z0-9_\sáéíóúÁÉÍÓÚñÑ\.\-]/): boolean {
    return patron.test(valor);
  }

  validarNombreDispositivo(nombre: string): boolean {
    if (this.campoVacio(nombre)) {
      this.notificacion.info('Campo requerido', 'El nombre del dispositivo no puede estar vacío.');
      return false;
    }

    if (!this.longitudValida(nombre, 3, 100)) {
      this.notificacion.info('Longitud inválida', 'Debe tener entre 3 y 100 caracteres.');
      return false;
    }

    if (this.contieneCaracteresInvalidos(nombre)) {
      this.notificacion.info('Caracteres inválidos', 'El nombre contiene símbolos no permitidos.');
      return false;
    }

    return true;
  }

  validarNombreSO(nombre: string): boolean {
    if (this.campoVacio(nombre)) {
      this.notificacion.info('Campo requerido', 'El nombre del sistema operativo no puede estar vacío.');
      return false;
    }

    if (!this.longitudValida(nombre, 3, 255)) {
      this.notificacion.info('Longitud inválida', 'Debe tener entre 3 y 255 caracteres.');
      return false;
    }

    if (this.contieneCaracteresInvalidos(nombre)) {
      this.notificacion.info('Caracteres inválidos', 'El nombre contiene símbolos no permitidos.');
      return false;
    }

    return true;
  }
  validarSistemaOperativoSeleccionado(seleccionado: any): boolean {
  if (!seleccionado || !seleccionado.sistema_operativo_id) {
    this.notificacion.info('Campo requerido', 'Debe seleccionar un sistema operativo válido.');
    return false;
  }
  return true;
}

}
