import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ValidacionesGeneralesService {
  campoVacio(valor: string | null | undefined): boolean {
    return !valor || valor.trim().length === 0;
  }

  longitudValida(valor: string | null | undefined, min: number, max: number): boolean {
    if (!valor) return false;
    const length = valor.trim().length;
    return length >= min && length <= max;
  }
  
}

