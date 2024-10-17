using CalendarioOutlook.Models;
using CalendarioOutlook.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Graph.Models;

namespace CalendarioOutlook.Controllers
{

    [ApiController]
    [Route("api/calendario")]
    public class CalendarController : ControllerBase
    {
        private readonly OutlookService outlookService;
        private readonly ILogger<CalendarController> logger;

        public CalendarController(OutlookService outlookService, ILogger<CalendarController> logger)
        {
            this.outlookService = outlookService;
            this.logger = logger;
        }

        // Método que devuelve todas las citas/eventos del calendario instructor
        [HttpGet("citas")]
        public async Task<ActionResult<List<Cita>>> obtenerCitas()
        {
            var graphClient = outlookService.graphServiceClient;

            var events = await graphClient.Me
                .Calendars[outlookService.idCalendarioInstructor]
                .Events.GetAsync();

            if (events?.Value == null || events.Value.Count == 0)
            {
                logger.LogInformation("Citas vacias");
                return Ok(new List<Cita>());
            }

            List<Cita> citas = events.Value.Select(e => new Cita
            {
                Id = e.Id,
                Subject = e.Subject,
                Body = new Body
                {
                    ContentType = e.Body?.ContentType.ToString(),
                    Content = e.Body?.Content
                },
                Start = new DateTimeDetails
                {
                    DateTime = e.Start.DateTime,
                    TimeZone = e.Start.TimeZone
                },
                End = new DateTimeDetails
                {
                    DateTime = e.End.DateTime,
                    TimeZone = e.End.TimeZone
                },
                Location = new Models.Location
                {
                    DisplayName = e.Location?.DisplayName ?? "Sin ubicación"
                },
                Attendees = e.Attendees?.Select(a => new Models.Attendee
                {
                    EmailAddress = new Models.EmailAddress
                    {
                        Address = a.EmailAddress.Address,
                        Name = a.EmailAddress.Name
                    },
                    Type = a.Type.ToString()
                }).ToList() ?? new List<Models.Attendee>()
            }).ToList();

            return Ok(citas);
        }
        
        // Método que crea una cita/evento en el calendario instructor
        [HttpPost("crearcita")]
        public async Task<IActionResult> CrearCita([FromBody] CitaCreacion nuevaCita)
        {
            if (nuevaCita == null) { return BadRequest("Cita sin datos"); }

            var graphClient = outlookService.graphServiceClient;

            var evento = new Event
            {
                Subject = nuevaCita.Subject,
                Body = new ItemBody
                {
                    ContentType = nuevaCita.Body?.ContentType == "HTML" ? BodyType.Html : BodyType.Text,
                    Content = nuevaCita.Body.Content
                },
                Start = new DateTimeTimeZone
                {
                    DateTime = nuevaCita.Start.DateTime.ToString(), // Formato ISO 8601
                    TimeZone = nuevaCita.Start.TimeZone
                },
                End = new DateTimeTimeZone
                {
                    DateTime = nuevaCita.End.DateTime.ToString(),
                    TimeZone = nuevaCita.End.TimeZone
                },
                Location = new Microsoft.Graph.Models.Location
                {
                    DisplayName = nuevaCita.Location.DisplayName
                },
                Attendees = nuevaCita.Attendees.Select(a => new Microsoft.Graph.Models.Attendee
                {
                    EmailAddress = new Microsoft.Graph.Models.EmailAddress
                    {
                        Address = a.EmailAddress.Address,
                        Name = a.EmailAddress.Name,
                    },
                    Type = a.Type == "required" ? AttendeeType.Required : AttendeeType.Optional
                }).ToList()
            };

            await graphClient.Me.Calendars[outlookService.idCalendarioInstructor]
                .Events.PostAsync(evento);

            return Ok(new { message = "Cita creada" });

        }

        // Método que va a eliminar una cita/evento mediante su ID
        [HttpDelete("eliminarevento/{id}")]
        public async Task<IActionResult> EliminarCita(string id)
        {
            var graphClient = outlookService.graphServiceClient;

            await graphClient.Me.Calendars[outlookService.idCalendarioInstructor].Events[id].DeleteAsync();

            return Ok(new { message = "Exito" });
        }

        // Método que va a editar una cita/evento mediante su ID
        [HttpPut("editarevento/{id}")]
        public async Task<IActionResult> EditarCita([FromBody] Cita cita, string id)
        {
            if (cita == null) { return BadRequest("Cita sin datos"); }

            var graphClient = outlookService.graphServiceClient;

            var eventoGuardado = await graphClient.Me.Calendars[outlookService.idCalendarioInstructor].Events[id].GetAsync();

            if (eventoGuardado == null) { return NotFound("Cita no encontrada"); }

            eventoGuardado.Subject = cita.Subject;
            eventoGuardado.Body = new ItemBody
            {
                ContentType = cita.Body?.ContentType == "HTML" ? BodyType.Html : BodyType.Text,
                Content = cita.Body.Content
            };
            eventoGuardado.Start = new DateTimeTimeZone
            {
                DateTime = cita.Start.DateTime,
                TimeZone = cita.Start.TimeZone
            };
            eventoGuardado.End = new DateTimeTimeZone
            {
                DateTime = cita.End.DateTime,
                TimeZone = cita.End.TimeZone
            };
            eventoGuardado.Location = new Microsoft.Graph.Models.Location
            {
                DisplayName = cita.Location.DisplayName
            };
            eventoGuardado.Attendees = cita.Attendees.Select(a => new Microsoft.Graph.Models.Attendee
            {
                EmailAddress = new Microsoft.Graph.Models.EmailAddress
                {
                    Address = a.EmailAddress.Address,
                    Name = a.EmailAddress.Name
                },
                Type = a.Type == "required" ? AttendeeType.Required : AttendeeType.Optional
            }).ToList();

            await graphClient.Me.Calendars[outlookService.idCalendarioInstructor].Events[id].PatchAsync(eventoGuardado);

            return Ok(new { message = "Cita modificada" });
        }
    }
}
