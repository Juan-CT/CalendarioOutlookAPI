namespace CalendarioOutlook.Models
{
    public class Cita
    {
        public string Id { get; set; }
        public string Subject { get; set; }
        public Body Body { get; set; }
        public DateTimeDetails Start { get; set; }
        public DateTimeDetails End { get; set; }
        public Location Location { get; set; }
        public List<Attendee> Attendees { get; set; }
    }

    public class Body
    {
        public string ContentType { get; set; }
        public string Content { get; set; }
    }

    public class DateTimeDetails
    {
        public string DateTime { get; set; }
        public string TimeZone { get; set; }
    }

    public class Location
    {
        public string DisplayName { get; set; }
    }

    public class Attendee
    {
        public EmailAddress EmailAddress { get; set; }
        public string Type { get; set; }
    }

    public class EmailAddress
    {
        public string Address { get; set; }
        public string Name { get; set; }
    }

    public class CitaCreacion
    {
        public string Subject { get; set; }
        public Body Body { get; set; }
        public DateTimeDetails Start { get; set; }
        public DateTimeDetails End { get; set; }
        public Location Location { get; set; }
        public List<Attendee> Attendees { get; set; }
    }
}
