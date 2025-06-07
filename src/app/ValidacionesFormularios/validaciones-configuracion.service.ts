import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ValidacionesConfiguracionEscaneoService {

  constructor() {}

  validarNombre(nombre: string): string | null {
    if (!nombre || !nombre.trim()) {
      return 'El nombre es requerido.';
    }
    if (nombre.trim().length < 3) {
      return 'El nombre debe tener al menos 3 caracteres.';
    }
    if (nombre.trim().length > 100) {
      return 'El nombre no debe exceder los 100 caracteres.';
    }
    return null;
  }

  validarFechaInicio(fechaInicio: Date | null, fechaFin?: Date | null): string | null {
    if (!fechaInicio) {
      return 'La fecha de inicio es requerida.';
    }
    if (fechaFin && fechaInicio > fechaFin) {
      return 'La fecha de inicio no puede ser posterior a la fecha fin.';
    }
    return null;
  }

  validarFechaFin(fechaFin: Date | null, fechaInicio?: Date | null): string | null {
    if (!fechaFin) {
      return 'La fecha fin es requerida.';
    }
    if (fechaInicio && fechaFin < fechaInicio) {
      return 'La fecha fin no puede ser anterior a la fecha de inicio.';
    }
    return null;
  }

  validarFrecuencia(frecuencia: number | string | null, unidad: 'min' | 'hr'): string | null {
  if (frecuencia === null || frecuencia === undefined || frecuencia === '') {
    return 'La frecuencia es requerida.';
  }

  // Convertir a número primero
  const frecuenciaNumero = Number(frecuencia);

  if (isNaN(frecuenciaNumero)) {
    return 'La frecuencia debe ser un número.';
  }

  if (!Number.isInteger(frecuenciaNumero)) {
    return 'La frecuencia debe ser un número entero.';
  }

  if (frecuenciaNumero < 1) {
    return 'La frecuencia mínima es 1.';
  }

  const maxFrecuencia = unidad === 'min' ? 10080 : 168;

  if (frecuenciaNumero > maxFrecuencia) {
    return `La frecuencia máxima en ${unidad === 'min' ? 'minutos' : 'horas'} es ${maxFrecuencia}.`;
  }

  return null;
}


  validarUnidadFrecuencia(unidad: string): string | null {
    if (!unidad || (unidad !== 'min' && unidad !== 'hr')) {
      return 'Debe seleccionar una unidad válida (Minutos u Horas).';
    }
    return null;
  }

  validarHoras(horas: string[] | undefined): string | null {
    if (!horas || horas.length === 0) {
      return 'Debe seleccionar al menos una hora.';
    }
    const uniqueHoras = new Set(horas);
    if (uniqueHoras.size !== horas.length) {
      return 'No se permiten horas duplicadas.';
    }
    // Validar formato HH:mm:ss (aunque tu agregarHora ya lo hace bien)
    const formatoHora = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
    for (const hora of horas) {
      if (!formatoHora.test(hora)) {
        return `El formato de hora "${hora}" no es válido.`;
      }
    }
    return null;
  }
}
