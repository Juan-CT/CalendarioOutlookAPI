export interface CitaCreacion {
  subject: string,
  body: {
    contentType: string,
    content: string
  },
  start: {
    dateTime: string,
    timeZone: string
  },
  end: {
    dateTime: string,
    timeZone: string
  },
  location: {
    displayName: string
  },
  attendees: Array<
    {
      emailAddress: {
        address: string,
        name: string
      },
      type: 'required' | 'optional'
    }>
}

export interface Cita {
  id: string,
  subject: string,
  body: {
    contentType: string,
    content: string
  },
  start: {
    dateTime: string,
    timeZone: string
  },
  end: {
    dateTime: string,
    timeZone: string
  },
  location: {
    displayName: string
  },
  attendees: Array<
    {
      emailAddress: {
        address: string,
        name: string
      },
      type: 'required' | 'optional'
    }>
}
