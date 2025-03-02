import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ValidacionesUsuarioService {

  constructor() {}


  nombreUsuarioValido(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const regex = /^[a-zA-Z0-9_]{4,50}$/;
      return regex.test(control.value) ? null : { nombreUsuarioInvalido: true };
    };
  }


  contrasenaFuerte(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,50}$/;
      return regex.test(control.value) ? null : { contrasenaDebil: true };
    };
  }


  emailValido(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return regex.test(control.value) ? null : { emailInvalido: true };
    };
  }


  telefonoValido(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const regex = /^[0-9]{10,15}$/;
      return regex.test(control.value) ? null : { telefonoInvalido: true };
    };
  }


  nombresValidos(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const regex = /^[a-zA-ZÀ-ÿ\s]{3,50}$/;
      return regex.test(control.value) ? null : { nombresInvalidos: true };
    };
  }


  apellidosValidos(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const regex = /^[a-zA-ZÀ-ÿ\s]{3,50}$/;
      return regex.test(control.value) ? null : { apellidosInvalidos: true };
    };
  }

  rolValido(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return control.value ? null : { rolInvalido: true };
    };
  }


  static contrasenasCoinciden(control: AbstractControl): ValidationErrors | null {
    const contrasena = control.get('contrasena')?.value;
    const confirmarContrasena = control.get('confirmar_contrasena')?.value;
  
    return contrasena && confirmarContrasena && contrasena !== confirmarContrasena
      ? { contrasenasNoCoinciden: true }
      : null;
  }
}
