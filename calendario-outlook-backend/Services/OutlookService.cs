using Azure.Core;
using Microsoft.Graph;
using Microsoft.Graph.Models;


namespace CalendarioOutlook.Services
{
    public class OutlookService
    {


        public GraphServiceClient graphServiceClient { get; set; }
        public string idCalendarioInstructor { get; set; }

        public OutlookService() { }

        // Método que asigna el token de acceso a GraphServiceClient y la ID del calendario instructor
        public void SetAccessToken(string accessToken)
        {
            if (string.IsNullOrEmpty(accessToken))
            {
                throw new ArgumentException("El token de acceso es nulo o vacío.");
            }

            var tokenCredencial = new AccessTokenCredential(accessToken);

            graphServiceClient = new GraphServiceClient(tokenCredencial);

            InitCalendarioId().GetAwaiter().GetResult();
        }

        // Método que va a obtener la id del calendario instructor
        private async Task InitCalendarioId()
        {
            idCalendarioInstructor = await GetIdInstructorCalendario();
        }

        public async Task<string> GetIdInstructorCalendario()
        {
            // Se traen los calendarios del usuario
            var calendarios = await graphServiceClient.Me.Calendars.GetAsync();
            // Si hay calendarios y existe el calendario Instructor, se devuelve su ID
            if (calendarios != null && calendarios.Value != null)
            {
                foreach (var calendario in calendarios.Value)
                {
                    if (calendario.Name.Equals("Instructor", StringComparison.OrdinalIgnoreCase))
                    {
                        return calendario.Id;
                    }
                }
            }

            // Si no existe el calendario Instructor, se procede a crearlo
            var calendarioInstructor = new Calendar
            { Name = "Instructor" };
            // Se envía el calendario nuevo a la cuenta del usuario
            var crearCalendario = await graphServiceClient.Me.Calendars.PostAsync(calendarioInstructor);
            // Se retorna la id del calendario creado
            return crearCalendario.Id;
        }

        private class AccessTokenCredential : TokenCredential
        {
            private string token;

            public AccessTokenCredential(string accessToken)
            {
                token = accessToken;
            }

            public override AccessToken GetToken(TokenRequestContext requestContext, CancellationToken cancellationToken)
            {
                return new AccessToken(token, DateTimeOffset.UtcNow.AddHours(1));
            }

            public override ValueTask<AccessToken> GetTokenAsync(TokenRequestContext requestContext, CancellationToken cancellationToken)
            {
                return new ValueTask<AccessToken>(new AccessToken(token, DateTimeOffset.UtcNow.AddHours(1)));
            }
        }
    }
}
