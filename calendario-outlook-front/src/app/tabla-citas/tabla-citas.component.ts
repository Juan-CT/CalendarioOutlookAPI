import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Cita } from '../cita';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-tabla-citas',
  templateUrl: './tabla-citas.component.html',
  styles: [
  ]
})
export class TablaCitasComponent implements OnInit {

  @Output()
  editarCitaEvent = new EventEmitter<Cita>();

  citas: Cita[] = [];
  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.obtenerCitas();
  }

  obtenerCitas() {
    this.authService.obtenerCitas().subscribe(
      (citas: Cita[]) =>  {
        this.citas = citas;
        console.log('Citas obtenidas');
      }, error => {
        console.error('Error al obtener las citas', error);
      });
  }

  eliminarCita(idCita: string) {
    if (confirm("¿Estás seguro que quieres eliminar esta cita?")) {
    this.authService.eliminarCita(idCita).subscribe(
      (response) => {
        console.log("Cita eliminada: ", response);
        this.citas = this.citas.filter(cita => cita.id !== idCita);
      }, (error) => console.error("Error al eliminar la cita: ", error));
    }
  }

  editarCita(cita: Cita) {
    this.editarCitaEvent.emit(cita);
  }

}
