using CalendarioOutlook.Services;
using Microsoft.AspNetCore.Mvc;

namespace CalendarioOutlook.Controllers
{
    [ApiController]
    [Route("api/outlook")]
    public class OutlookController : ControllerBase
    {
        private readonly OutlookService outlookService;
        private readonly ILogger<OutlookController> logger;

        public OutlookController(OutlookService outlookService, ILogger<OutlookController> logger)
        {
            this.outlookService = outlookService;
            this.logger = logger;
        }

        public class TokenRequest
        {
            public string AccessToken { get; set; }
        }

        [HttpPost("token")]
        public IActionResult GetToken([FromBody] TokenRequest request)
        {
            if (string.IsNullOrEmpty(request?.AccessToken)) {
                return BadRequest("Token no recibido");
            }            

            outlookService.SetAccessToken(request.AccessToken);
            return Ok(new { message = "Token recibido" });
        }        
    }
}
