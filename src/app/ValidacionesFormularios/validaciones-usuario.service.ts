import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn, Validators, FormBuilder, FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ValidacionesUsuarioService {

  constructor() { }
  nombreUsuarioValido(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const regex = /^[a-zA-Z0-9_]{4,20}$/;
      return regex.test(control.value) ? null : { nombreUsuarioInvalido: true };
    };
  }
  contrasenaFuerte(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[^\s]{8,50}$/;
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
      const regex = /^[0-9]{10}$/;
      return regex.test(control.value) ? null : { telefonoInvalido: true };
    };
  }
  nombresValidos(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (typeof control.value !== 'string') return { nombresInvalidos: true };

      const limpio = control.value.trim().replace(/\s+/g, ' ');
      const regex = /^([a-zA-ZÀ-ÿ]+)(\s[a-zA-ZÀ-ÿ]+)*$/;

      return regex.test(limpio) ? null : { nombresInvalidos: true };
    };
  }
  apellidosValidos(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (typeof control.value !== 'string') return { apellidosInvalidos: true };

      const limpio = control.value.trim().replace(/\s+/g, ' ');
      const regex = /^([a-zA-ZÀ-ÿ]+)(\s[a-zA-ZÀ-ÿ]+)*$/;

      return regex.test(limpio) ? null : { apellidosInvalidos: true };
    };
  }
  rolValido(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return control.value && control.value.length > 0 ? null : { rolInvalido: true };
    };
  }
  contrasenasCoinciden(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const contrasena = group.get('contrasena')?.value;
      const confirmar = group.get('confirmar_contrasena')?.value;
      return contrasena && confirmar && contrasena !== confirmar
        ? { contrasenasNoCoinciden: true }
        : null;
    };
  }
  obtenerValidacionesFormulario(fb: FormBuilder): FormGroup {
    return fb.group({
      nombre_usuario: ['', [Validators.required, this.nombreUsuarioValido()]],
      contrasena: ['', [Validators.required, this.contrasenaFuerte()]],
      confirmar_contrasena: ['', Validators.required],
      nombres_completos: ['', [Validators.required, this.nombresValidos()]],
      apellidos_completos: ['', [Validators.required, this.apellidosValidos()]],
      email: ['', [Validators.required, this.emailValido()]],
      telefono: ['', [Validators.required, this.telefonoValido()]],
      rol_ids: [[], [Validators.required, this.rolValido()]],
    }, {
      validators: this.contrasenasCoinciden()
    });
  }
  validarFormularioConMensajes(formulario: FormGroup): { tipo: string, resumen: string, detalle: string } | null {
    if (!formulario) return null;

    for (const campo in formulario.controls) {
      const ordenValidacion = [
        'nombres_completos',
        'apellidos_completos',
        'nombre_usuario',
        'rol_ids',
        'email',
        'telefono',
        'contrasena',
        'confirmar_contrasena'
      ];

      for (const campo of ordenValidacion) {
        const control = formulario.get(campo);
        if (!control) continue;

        if (control.errors) {
          if (control.errors['required']) {
            return { tipo: 'info', resumen: 'Campo requerido', detalle: `Debe completar el campo: ${this.nombreAmigable(campo)}.` };
          }
          if (control.errors['nombreUsuarioInvalido']) {
            return { tipo: 'info', resumen: 'Usuario inválido', detalle: 'Debe tener entre 4 y 20 caracteres, letras, números o guiones bajos.' };
          }
          if (control.errors['contrasenaDebil']) {
            return { tipo: 'info', resumen: 'Contraseña débil', detalle: 'Debe tener al menos una mayúscula, una minúscula, un número y mínimo 8 caracteres.' };
          }
          if (control.errors['emailInvalido']) {
            return { tipo: 'info', resumen: 'Correo inválido', detalle: 'Debe ingresar un correo electrónico válido.' };
          }
          if (control.errors['telefonoInvalido']) {
            return { tipo: 'info', resumen: 'Teléfono inválido', detalle: 'Debe tener  10 dígitos numéricos.' };
          }
          if (control.errors['nombresInvalidos']) {
            return { tipo: 'info', resumen: 'Nombres inválidos', detalle: 'Debe contener solo letras y entre 3 y 20 caracteres.' };
          }
          if (control.errors['apellidosInvalidos']) {
            return { tipo: 'info', resumen: 'Apellidos inválidos', detalle: 'Debe contener solo letras y entre 3 y 20 caracteres.' };
          }
          if (control.errors['rolInvalido']) {
            return { tipo: 'info', resumen: 'Rol inválido', detalle: 'Debe seleccionar al menos un rol.' };
          }
        }
      }
      if (formulario.errors?.['contrasenasNoCoinciden']) {
        return { tipo: 'info', resumen: 'Error de contraseña', detalle: 'Las contraseñas no coinciden.' };
      }

    }
    if (formulario.errors?.['contrasenasNoCoinciden']) {
      return { tipo: 'info', resumen: 'Error de contraseña', detalle: 'Las contraseñas no coinciden.' };
    }
    return null;
  }
  private nombreAmigable(campo: string): string {
    const nombres: { [key: string]: string } = {
      nombre_usuario: 'Nombre de usuario',
      contrasena: 'Contraseña',
      confirmar_contrasena: 'Confirmar contraseña',
      nombres_completos: 'Nombres completos',
      apellidos_completos: 'Apellidos completos',
      email: 'Correo electrónico',
      telefono: 'Teléfono',
      rol_ids: 'Roles'
    };
    return nombres[campo] || campo;
  }
  validarFormularioContrasena(formulario: FormGroup): { tipo: string, resumen: string, detalle: string } | null {
    const contrasena = formulario.get('contrasena');
    const confirmar = formulario.get('confirmar_contrasena');
    if (contrasena?.hasError('required') || confirmar?.hasError('required')) {
      return { tipo: 'info', resumen: 'Formulario incompleto', detalle: 'Debe ingresar y confirmar la nueva contraseña.' };
    }
    if (contrasena?.hasError('contrasenaDebil')) {
      return { tipo: 'info', resumen: 'Contraseña débil', detalle: 'Debe tener al menos una mayúscula, una minúscula, un número y mínimo 8 caracteres.' };
    }
    if (formulario.errors?.['contrasenasNoCoinciden']) {
      return { tipo: 'info', resumen: 'Error de contraseña', detalle: 'Las contraseñas no coinciden.' };
    }
    return null;
  }

}
