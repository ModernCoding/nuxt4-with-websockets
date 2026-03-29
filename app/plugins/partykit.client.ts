import PartySocket from 'partysocket'

export default defineNuxtPlugin(() => {
  const socket = new PartySocket({
    host: 'your-party.your-username.partykit.dev',
    room: 'main-room'
  })
  return { provide: { socket } }
})