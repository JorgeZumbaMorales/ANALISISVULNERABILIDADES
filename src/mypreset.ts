// src/theme/mypreset.ts
import { definePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';

const MyPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#ffe6de',
      100: '#ffcdbd',
      200: '#ffb39c',
      300: '#fc977a',
      400: '#fc7b57',
      500: '#fc4b08', // Color principal
      600: '#db4107',
      700: '#bb3706',
      800: '#9b2d05',
      900: '#7b2304',
      950: '#4b1202',
    }
  }
});

export default MyPreset;
