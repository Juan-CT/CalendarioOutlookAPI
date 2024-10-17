import { Component, EventEmitter, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Cita, CitaCreacion } from '../cita';


@Component({
  selector: 'app-form-cita',
  templateUrl: './form-cita.component.html',
  styles: [
  ]
})

export class FormCitaComponent {

  @Output()
  refrescarListaCitas = new EventEmitter<void>();

  citaForm: FormGroup;
  editar: boolean = false;
  idCitaEditar: string= '';

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.citaForm = this.fb.group({
      subject: [''],
      body: this.fb.group({
        contentType: ['HTML'],
        content: [''],
      }),
      start: this.fb.group({
        dateTime: ['', Validators.required],
        timeZone: ['UTC'],
      }),
      end: this.fb.group({
        dateTime: ['', Validators.required],
        timeZone: ['UTC'],
      }),
      location: this.fb.group({
        displayName: [''],
      }),
      attendees: this.fb.array([]),
    });
  }

  getAttendees(): FormArray {
    return this.citaForm.get('attendees') as FormArray;
  }

  addAttendee() {
    const attendeeFormGroup = this.fb.group({
      emailAddress: this.fb.group({
        name: [''],
        address: ['', [Validators.required, Validators.email]],
      }),
      type: ['required'],
    });
    this.getAttendees().push(attendeeFormGroup);
  }

  onSubmit() {
    if (this.citaForm.valid) {
      const nuevaCita: CitaCreacion = this.citaForm.value;

      if (this.editar && this.idCitaEditar) {
        this.editarCita(nuevaCita);
        this.editar = false;
        this.idCitaEditar = '';
      } else {
        this.crearCita(nuevaCita);
      }
    }
  }

  cargarCita(cita: Cita) {
    this.editar = true;
    this.idCitaEditar = cita.id;

    this.citaForm.patchValue({
      subject: cita.subject,
      body: {
        contentType: cita.body?.contentType,
        content: cita.body.content,
      },
      start: {
        dateTime: cita.start.dateTime ? new Date(cita.start.dateTime).toISOString().slice(0, 16) : '',
        timeZone: cita.start.timeZone,
      },
      end: {
        dateTime: cita.end.dateTime ? new Date(cita.end.dateTime).toISOString().slice(0, 16) : '',
        timeZone: cita.end.timeZone,
      },
      location: {
        displayName: cita.location.displayName,
      },
    });

    this.getAttendees().clear();
    cita.attendees.forEach(att => {
      this.getAttendees().push(this.fb.group({
        emailAddress: this.fb.group({
          name: [att.emailAddress.name],
          address: [att.emailAddress.address, [Validators.required, Validators.email]],
        }),
        type: [att.type],
      }));
    });
  }

  crearCita(nuevaCita: CitaCreacion) {
    this.authService.crearCita(nuevaCita).subscribe(response => {
      console.log('Cita creada exitosamente', response);
      this.citaForm.reset();
      this.getAttendees().clear();
      this.refrescarListaCitas.emit();
    },
      (error) => {
        console.error('Error al crear la cita', error);
      }
    );
  }

  editarCita(citaEditada: CitaCreacion) {
    const citaConId: Cita = {
      id: this.idCitaEditar,
      ...citaEditada
    };

    this.authService.editarCita(this.idCitaEditar, citaConId).subscribe(response => {
      this.citaForm.reset();
      this.getAttendees().clear();
      this.refrescarListaCitas.emit();
    },
    (error) => {
      console.error('Error al editar la cita', error);
    });
  }

}
