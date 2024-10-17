using CalendarioOutlook.Services;
using Microsoft.AspNetCore.Mvc;

namespace CalendarioOutlook.Controllers
{
    [ApiController]
    [Route("api/outlook")]
    public class OutlookController : ControllerBase
    {
        private readonly OutlookService outlookService;

        public OutlookController(OutlookService outlookService)
        {
            this.outlookService = outlookService;
        }

        public class TokenRequest
        {
            public string AccessToken { get; set; }
        }

        // Método que recibe el token de acceso del usuario y se lleva al outlookService
        [HttpPost("token")]
        public IActionResult GetToken([FromBody] TokenRequest request)
        {
            if (string.IsNullOrEmpty(request?.AccessToken))
            {
                return BadRequest("Token no recibido");
            }

            outlookService.SetAccessToken(request.AccessToken);
            return Ok(new { message = "Token recibido" });
        }
    }
}
