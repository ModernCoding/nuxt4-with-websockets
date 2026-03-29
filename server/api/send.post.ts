import Pusher from 'pusher'

export default defineEventHandler(async (event) => {
  const { text } = await readBody(event)
  const pusher = new Pusher({
    appId: process.env.PUSHER_ID!,
    key: process.env.PUSHER_KEY!,
    secret: process.env.PUSHER_SECRET!,
    cluster: process.env.PUSHER_CLUSTER!,
    useTLS: true
  })

  await pusher.trigger('chat-room', 'message', { text, time: Date.now() })
  return { sent: true }
})


// import * as Ably from 'ably'

// export default defineEventHandler(async (event) => {
//   const { text } = await readBody(event)
//   const realtime = new Ably.Realtime(process.env.ABLY_SECRET!)
//   const channel = realtime.channels.get('chat-room')
  
//   await channel.publish('message', { text })
//   return { sent: true }
// })