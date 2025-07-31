import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ValidacionesConfiguracionEscaneoService {

  constructor() { }

  validarNombre(nombre: string): string | null {
    if (!nombre || !nombre.trim()) {
      return 'El nombre de la configuración es requerido.';
    }

    const limpio = nombre.trim();

    if (limpio.length < 3) {
      return 'El nombre de la configuración debe tener al menos 3 caracteres.';
    }

    if (limpio.length > 30) {
      return 'El nombre no debe exceder los 30 caracteres.';
    }


    const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;

    if (!regex.test(limpio)) {
      return 'El nombre solo puede contener letras. No se permiten símbolos ni números.';
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

    const frecuenciaNumero = Number(frecuencia);

    if (isNaN(frecuenciaNumero)) {
      return 'La frecuencia debe ser un número.';
    }

    if (!Number.isInteger(frecuenciaNumero)) {
      return 'La frecuencia debe ser un número entero.';
    }

    if (unidad === 'min' && frecuenciaNumero < 5) {
      return 'La frecuencia mínima es 5 minutos.';
    }

    if (unidad === 'hr' && frecuenciaNumero < 1) {
      return 'La frecuencia mínima es 1 hora.';
    }

    const maxFrecuencia = unidad === 'min' ? 10080 : 168;

    if (frecuenciaNumero > maxFrecuencia) {
      const equivalente = unidad === 'min' ? '7 días' : '7 días';
      return `La frecuencia máxima permitida es ${maxFrecuencia} ${unidad === 'min' ? 'minutos' : 'horas'} (equivalente a ${equivalente}).`;
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

    const formatoHora = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
    const uniqueHoras = new Set(horas);
    if (uniqueHoras.size !== horas.length) {
      return 'No se permiten horas duplicadas.';
    }

    for (const hora of horas) {
      if (!formatoHora.test(hora)) {
        return `El formato de hora "${hora}" no es válido.`;
      }
    }

    const minutosTotales = horas.map(h => {
      const [hh, mm, ss] = h.split(':').map(Number);
      return hh * 60 + mm + Math.floor(ss / 60);
    }).sort((a, b) => a - b);

    for (let i = 1; i < minutosTotales.length; i++) {
      const diff = minutosTotales[i] - minutosTotales[i - 1];
      if (diff < 5) {
        return 'Las horas deben tener al menos 5 minutos de diferencia entre cada una.';
      }
    }

    return null;
  }




}
