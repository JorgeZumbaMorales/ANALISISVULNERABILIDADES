import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ValidacionesUsuarioService {

  constructor() {}

  /**
   * Valida que el nombre de usuario tenga mínimo 4 y máximo 50 caracteres,
   * solo permitiendo letras, números y guiones bajos.
   */
  nombreUsuarioValido(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const regex = /^[a-zA-Z0-9_]{4,50}$/;
      return regex.test(control.value) ? null : { nombreUsuarioInvalido: true };
    };
  }

  /**
   * Valida la contraseña con:
   * - Mínimo 8 caracteres
   * - Al menos una letra mayúscula, una minúscula y un número
   */
  contrasenaFuerte(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,50}$/;
      return regex.test(control.value) ? null : { contrasenaDebil: true };
    };
  }

  /**
   * Valida que el email tenga un formato válido.
   */
  emailValido(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return regex.test(control.value) ? null : { emailInvalido: true };
    };
  }

  /**
   * Valida que el número de teléfono tenga entre 10 y 15 dígitos numéricos.
   */
  telefonoValido(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const regex = /^[0-9]{10,15}$/;
      return regex.test(control.value) ? null : { telefonoInvalido: true };
    };
  }

  /**
   * Valida que las contraseñas coincidan.
   */
  static contrasenasCoinciden(control: AbstractControl): ValidationErrors | null {
    const contrasena = control.get('contrasena')?.value;
    const confirmarContrasena = control.get('confirmar_contrasena')?.value;
  
    return contrasena && confirmarContrasena && contrasena !== confirmarContrasena
      ? { contrasenasNoCoinciden: true }
      : null;
  }
}
