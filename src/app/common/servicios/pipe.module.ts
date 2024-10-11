import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormatearTiempoPipe } from './formatear-tiempo.pipe'; // Ajusta la ruta

@NgModule({
  declarations: [FormatearTiempoPipe],
  imports: [CommonModule],
  exports: [FormatearTiempoPipe] // Exporta el pipe para que pueda ser usado en otros módulos
})
export class PipesModule {}
