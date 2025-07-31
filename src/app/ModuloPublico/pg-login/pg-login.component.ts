import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SesionUsuarioService } from '../../Seguridad/sesion-usuario.service';
import { ServiciosAutenticacion } from '../../ModuloServiciosWeb/ServiciosAutenticacion.component';
import { MessageService, PrimeTemplate } from 'primeng/api';
import { Observable } from 'rxjs';
import { Toast } from 'primeng/toast';
import { FormsModule } from '@angular/forms';
import { IftaLabel } from 'primeng/iftalabel';
import { InputText } from 'primeng/inputtext';
import { Password } from 'primeng/password';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { TabView, TabPanel } from 'primeng/tabview';
import { NgIf } from '@angular/common';
import { ProgressSpinner } from 'primeng/progressspinner';
import { InputOtp } from 'primeng/inputotp';
import { Divider } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';


@Component({
  standalone: true,
  selector: 'app-pg-login',
  templateUrl: './pg-login.component.html',
  styleUrl: './pg-login.component.css',
  imports: [Toast, FormsModule, IftaLabel, InputText, ButtonModule, Password, Button, Dialog, PrimeTemplate, TabView, TabPanel, NgIf, ProgressSpinner, InputOtp, Divider]
})
export class PgLoginComponent {
  usuario: string = '';
  contrasena: string = '';
  tiempoRestante: number = 600; 
  cronometroInterval: any = null;
 
  modalRecuperacion: boolean = false;
  cargandoVerificacionCorreo: boolean = false;

  modalCodigo: boolean = false;
  modalActualizarContrasena: boolean = false;
  usuarioIdRecuperacion: number = 0; 
  indiceRecuperacion: number = 0; 
  usuarioRecuperacion: string = '';
  correoRecuperacion: string = '';
  modalExplicacionVerificacionCorreo: boolean = false;
  cargandoRecuperacion: boolean = false;
  codigoRecuperacion: string = ''; 
  nuevaContrasena: string = '';
  confirmarContrasena: string = '';
  modalVerificacionCorreo: boolean = false;
  usuarioPendienteId: number = 0;
  correoPendienteVerificacion: string = '';
  codigoVerificacionCorreo: string = '';
  reintentandoVerificacion: boolean = false;
  constructor(private router: Router,
    private authService: ServiciosAutenticacion,
    private sesionService: SesionUsuarioService,
    private messageService: MessageService
  ) { }

  mostrarMensaje(severity: string, summary: string, detail: string) {
    this.messageService.add({ severity, summary, detail });
  }

  iniciarSesion() {
    if (!this.usuario.trim() || !this.contrasena.trim()) {
      this.mostrarMensaje('info', 'Campos Vacíos', 'Por favor, ingrese su usuario y contraseña');
      return;
    }

    const credenciales = { nombre_usuario: this.usuario, contrasena: this.contrasena };

    this.authService.iniciarSesion(credenciales).subscribe({
      next: (respuesta) => {
        if (respuesta.estado === 'pendiente_verificacion') {
          
          this.usuarioPendienteId = respuesta.usuario_id;
          this.correoPendienteVerificacion = respuesta.email;
          this.modalExplicacionVerificacionCorreo = true;
          return;
        }

        if (respuesta?.access_token) {
          this.sesionService.guardarSesion(respuesta.access_token);

          this.authService.obtenerMiPerfil().subscribe({
            next: (perfil) => {
              this.sesionService.guardarPerfil(perfil);
              this.router.navigate(['/admin/inicio']);
            },
            error: () => {
              this.mostrarMensaje('error', 'Error', 'No se pudo cargar el perfil del usuario.');
            }
          });
        } else {
          this.mostrarMensaje('error', 'Error', 'No se pudo iniciar sesión, intente nuevamente.');
        }
      },

      error: (error) => {
        this.mostrarMensaje('info', 'Información', error.mensaje);
      }

    });
  }


  volverInicio() {
    this.router.navigate(['/public']);
  }


  abrirModalRecuperacion() {
    this.modalRecuperacion = true;
    this.indiceRecuperacion = 0;
    this.usuarioRecuperacion = '';
    this.correoRecuperacion = '';
  }

  cerrarModal(tipo: 'recuperacion' | 'codigo' | 'actualizarContrasena' | 'modalVerificacionCorreo') {
    if (tipo === 'recuperacion') this.modalRecuperacion = false;
    if (tipo === 'codigo') this.modalCodigo = false;
    if (tipo === 'actualizarContrasena') this.modalActualizarContrasena = false;
    if (tipo === 'modalVerificacionCorreo') this.modalVerificacionCorreo = false;
    this.detenerCronometro();
  }

  enviarCodigoRecuperacion() {
    this.limpiarEntradasRecuperacion(); 

    
    this.cargandoRecuperacion = true;

    
    if (this.indiceRecuperacion === 0) {
      if (!this.usuarioRecuperacion) {
        this.mostrarMensaje('info', 'Campo Vacío', 'Ingrese su nombre de usuario.');
        this.cargandoRecuperacion = false;
        return;
      }
      if (/\s/.test(this.usuarioRecuperacion)) {
        this.mostrarMensaje('info', 'Formato Incorrecto', 'El nombre de usuario no debe contener espacios.');
        this.cargandoRecuperacion = false;
        return;
      }
    } else {
      if (!this.correoRecuperacion) {
        this.mostrarMensaje('info', 'Campo Vacío', 'Ingrese su correo electrónico.');
        this.cargandoRecuperacion = false;
        return;
      }
      if (/\s/.test(this.correoRecuperacion)) {
        this.mostrarMensaje('info', 'Formato Incorrecto', 'El correo no debe contener espacios.');
        this.cargandoRecuperacion = false;
        return;
      }
      if (!this.esCorreoValido(this.correoRecuperacion)) {
        this.mostrarMensaje('info', 'Correo Inválido', 'Ingrese un correo electrónico válido.');
        this.cargandoRecuperacion = false;
        return;
      }
    }

  
    let consultaUsuario$: Observable<any>;
    if (this.indiceRecuperacion === 0) {
      consultaUsuario$ = this.authService.buscarUsuarioPorNombre(this.usuarioRecuperacion);
    } else {
      consultaUsuario$ = this.authService.buscarUsuarioPorCorreo(this.correoRecuperacion);
    }

    consultaUsuario$.subscribe({
      next: (respuesta) => {
        if (!respuesta || !respuesta.datos || !respuesta.datos.usuario_id) {
          const mensajeError = this.indiceRecuperacion === 0
            ? "No se encontró el usuario ingresado."
            : "No se encontró el correo electrónico ingresado.";
          this.mostrarMensaje('error', 'Error de Recuperación', mensajeError);
          this.cargandoRecuperacion = false;
          return;
        }

        this.usuarioIdRecuperacion = respuesta.datos.usuario_id;
        this.usuarioRecuperacion = respuesta.datos.nombre_usuario;
        this.correoRecuperacion = respuesta.datos.email;

        const data = {
          usuario_id: this.usuarioIdRecuperacion,
          usuario: this.usuarioRecuperacion,
          correo: this.correoRecuperacion
        };

        this.authService.solicitarRecuperacion(data).subscribe({
          next: () => {
            this.modalRecuperacion = false;
            this.modalCodigo = true;
            this.iniciarCronometro();
            this.mostrarMensaje('success', 'Código Enviado', 'Se envió un código de verificación al correo registrado.');
          },
          error: (error) => {
            console.error("❌ Error al enviar código:", error);
            this.mostrarMensaje('error', 'Error', 'No se pudo enviar el código, intente nuevamente.');
          },
          complete: () => this.cargandoRecuperacion = false
        });
      },
      error: () => {
        const mensajeError = this.indiceRecuperacion === 0
          ? "No se encontró el usuario ingresado."
          : "No se encontró el correo electrónico ingresado.";
        this.mostrarMensaje('error', 'Error de Recuperación', mensajeError);
        this.cargandoRecuperacion = false;
      }
    });
  }



  verificarCodigo() {
    if (this.codigoRecuperacion.length !== 6) {
      this.mostrarMensaje('info', 'Código Incorrecto', 'Ingrese el código de 6 dígitos correctamente.');
      return;
    }

    this.authService.verificarCodigo(this.codigoRecuperacion, this.usuarioRecuperacion).subscribe({
      next: () => {
        
        this.detenerCronometro();
     
        this.modalCodigo = false;
        this.modalActualizarContrasena = true;

       
        this.codigoRecuperacion = '';
      },
      error: () => {
        this.mostrarMensaje('error', 'Código Incorrecto', 'Verifique su código e intente nuevamente.');
      }
    });
  }


  actualizarContrasena() {
    const contrasena = this.nuevaContrasena;

    
    if (contrasena.length < 8) {
      this.mostrarMensaje('info', 'Contraseña Muy Corta', 'La contraseña debe tener al menos 8 caracteres.');
      return;
    }

 
    if (/\s/.test(contrasena)) {
      this.mostrarMensaje('info', 'Contraseña Inválida', 'La contraseña no debe contener espacios.');
      return;
    }


    if (!/[a-z]/.test(contrasena)) {
      this.mostrarMensaje('info', 'Contraseña Débil', 'Debe incluir al menos una letra minúscula.');
      return;
    }


    if (!/[A-Z]/.test(contrasena)) {
      this.mostrarMensaje('info', 'Contraseña Débil', 'Debe incluir al menos una letra mayúscula.');
      return;
    }

   
    if (!/[0-9]/.test(contrasena)) {
      this.mostrarMensaje('info', 'Contraseña Débil', 'Debe incluir al menos un número.');
      return;
    }


    if (contrasena !== this.confirmarContrasena) {
      this.mostrarMensaje('error', 'Contraseñas No Coinciden', 'Las contraseñas ingresadas no coinciden.');
      return;
    }

    
    this.authService.actualizarContrasena({
      usuario_id: this.usuarioIdRecuperacion,
      nueva_contrasena: contrasena
    }).subscribe({
      next: () => {
        this.detenerCronometro();
        this.modalActualizarContrasena = false;
        this.mostrarMensaje('success', 'Contraseña Actualizada', 'Ahora puede iniciar sesión con su nueva contraseña.');
      },
      error: () => {
        this.mostrarMensaje('error', 'Error', 'No se pudo actualizar la contraseña.');
      }
    });
  }

  iniciarCronometro() {
    this.tiempoRestante = 600;
    if (this.cronometroInterval) clearInterval(this.cronometroInterval);

    this.cronometroInterval = setInterval(() => {
      if (this.tiempoRestante > 0) {
        this.tiempoRestante--;
      } else {
        clearInterval(this.cronometroInterval);
        this.mostrarMensaje('error', 'Código Expirado', 'El código de verificación ha expirado. Solicite uno nuevo.');
        this.modalCodigo = false;
        this.modalVerificacionCorreo = false;
      }
    }, 1000);
  }


  enmascararCorreo(email: string): string {
    const [usuario, dominio] = email.split("@");
    return usuario.substring(0, 2) + "****@" + dominio;
  }

  esCorreoValido(correo: string): boolean {
    const correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return correoRegex.test(correo);
  }


  limpiarEntradasRecuperacion() {
    this.usuarioRecuperacion = this.usuarioRecuperacion.trim();
    this.correoRecuperacion = this.correoRecuperacion.trim();
  }
  bloquearEspacios(event: KeyboardEvent) {
    if (event.key === ' ') {
      event.preventDefault();
    }
  }
  alCambiarTab(event: any) {
    const nuevoIndice = event.index;

    if (nuevoIndice === 0) {
      
      this.correoRecuperacion = '';
    } else if (nuevoIndice === 1) {
      
      this.usuarioRecuperacion = '';
    }
  }
  formatearTiempoRestante(): string {
    const minutos = Math.floor(this.tiempoRestante / 60);
    const segundos = this.tiempoRestante % 60;
    return `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
  }
  verificarCodigoCorreo() {
    if (this.codigoVerificacionCorreo.length !== 6) {
      this.mostrarMensaje('info', 'Código Incorrecto', 'Ingrese el código de 6 dígitos.');
      return;
    }

    this.authService.verificarCodigo(this.codigoVerificacionCorreo, String(this.usuarioPendienteId)).subscribe({

      next: () => {
        this.detenerCronometro();
        this.modalVerificacionCorreo = false;
        this.mostrarMensaje('success', 'Correo Verificado', 'Ahora puedes iniciar sesión.');
        setTimeout(() => {
          this.reintentandoVerificacion = true;
          this.iniciarSesion();
        }, 4000); 

        this.reintentandoVerificacion = true;
        this.iniciarSesion();  
      },
      error: () => {
        this.mostrarMensaje('error', 'Código Incorrecto', 'Verifica tu código e intenta de nuevo.');
      }
    });
  }
  enviarCodigoVerificacionCorreo() {
    if (!this.usuarioPendienteId || !this.correoPendienteVerificacion) {
      this.mostrarMensaje('error', 'Faltan datos', 'No se puede enviar el código sin datos del usuario.');
      return;
    }

    const datos = {
      usuario_id: this.usuarioPendienteId,
      email: this.correoPendienteVerificacion,
      nombre_usuario: this.usuario
    };

    this.cargandoVerificacionCorreo = true;

    this.authService.enviarCodigoVerificacion(datos).subscribe({
      next: () => {
        this.modalExplicacionVerificacionCorreo = false;
        this.modalVerificacionCorreo = true;
        this.iniciarCronometro();
        this.mostrarMensaje('success', 'Código Enviado', 'Revisa tu correo para ingresar el código.');
      },
      error: () => {
        this.mostrarMensaje('error', 'Error', 'No se pudo enviar el código, intenta nuevamente.');
      },
      complete: () => {
        this.cargandoVerificacionCorreo = false;
      }
    });
  }


  verificarCodigoNuevoCorreo() {
    if (this.codigoVerificacionCorreo.length !== 6) {
      this.mostrarMensaje('info', 'Código Incorrecto', 'Ingrese el código de 6 dígitos.');
      return;
    }

    const datos = {
      email: this.correoPendienteVerificacion,
      codigo: this.codigoVerificacionCorreo
    };

    this.authService.validarCodigoVerificacion(datos).subscribe({
      next: () => {
        this.detenerCronometro();
        this.modalVerificacionCorreo = false;
        this.mostrarMensaje('success', 'Correo Verificado', 'Ahora puedes iniciar sesión.');
        this.reintentandoVerificacion = true;
        this.iniciarSesion(); 
      },
      error: () => {
        this.mostrarMensaje('error', 'Código Incorrecto', 'Verifica tu código e intenta de nuevo.');
      }
    });
  }
  detenerCronometro() {
    if (this.cronometroInterval) {
      clearInterval(this.cronometroInterval);
      this.cronometroInterval = null;
    }
  }

}
