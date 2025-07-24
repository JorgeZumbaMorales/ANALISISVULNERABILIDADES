import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ValidacionesRolesService {

  constructor() { }

  nombreRolValido(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const valor = (control.value || '').trim();
      if (valor.length < 3 || valor.length > 20) {
        return { nombreRolInvalido: true };
      }
      const regex = /^([A-Za-zÁÉÍÓÚáéíóúÑñ]+)(\s[A-Za-zÁÉÍÓÚáéíóúÑñ]+)*$/;

      return regex.test(valor) ? null : { nombreRolInvalido: true };
    };
  }

  descripcionValida(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return control.value && control.value.length <= 50
        ? null
        : { descripcionInvalida: true };
    };
  }

  accesosValidos(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return control.value && control.value.length > 0 ? null : { accesosInvalidos: true };
    };
  }

  obtenerValidacionesFormulario(fb: FormBuilder): FormGroup {
    return fb.group({
      nombre_rol: ['', [Validators.required, this.nombreRolValido()]],
      descripcion: ['', [Validators.required, this.descripcionValida()]],
      accesos_menu: [[], [Validators.required, this.accesosValidos()]]
    });
  }

  validarFormularioConMensajes(formulario: FormGroup): { tipo: string, resumen: string, detalle: string } | null {
    if (!formulario) return null;

    const camposOrden = ['nombre_rol', 'descripcion', 'accesos_menu'];

    for (const campo of camposOrden) {
      const control = formulario.get(campo);
      if (!control) continue;

      if (control.errors) {
        if (control.errors['required']) {
          return {
            tipo: 'info',
            resumen: 'Campo requerido',
            detalle: `Debe completar el campo: ${this.nombreAmigable(campo)}.`
          };
        }
        if (control.errors['nombreRolInvalido']) {
          return {
            tipo: 'info',
            resumen: 'Nombre de rol inválido',
            detalle: 'Debe contener solo letras y tener entre 3 y 20 caracteres.'
          };
        }
        if (control.errors['descripcionInvalida']) {
          return {
            tipo: 'info',
            resumen: 'Descripción inválida',
            detalle: 'La descripción no debe exceder los 50 caracteres.'
          };
        }
        if (control.errors['accesosInvalidos']) {
          return {
            tipo: 'info',
            resumen: 'Acceso inválido',
            detalle: 'Debe seleccionar al menos una sección del menú.'
          };
        }
      }
    }
    return null;
  }

  private nombreAmigable(campo: string): string {
    const nombres: { [key: string]: string } = {
      nombre_rol: 'Nombre del Rol',
      descripcion: 'Descripción',
      accesos_menu: 'Accesos al Menú'
    };
    return nombres[campo] || campo;
  }
}
