import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatearTiempo'
})
export class FormatearTiempoPipe implements PipeTransform {
  transform(value: number | null): string {
    if (value === null) {
      return '00:00:00'; // o cualquier otro mensaje que desees mostrar
    }

    const hours = Math.floor(value / 3600);
    const minutes = Math.floor((value % 3600) / 60);
    const seconds = value % 60;

    // Asegurarse de que siempre haya dos dígitos
    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  }
}
