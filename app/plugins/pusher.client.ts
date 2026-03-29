import Pusher from 'pusher-js'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig().public
  const pusher = new Pusher(config.pusherKey, { cluster: config.pusherCluster })
  
  return { provide: { pusher } }
})