import Echo from '@ably/laravel-echo'
import * as Ably from 'ably'

export default defineNuxtPlugin(() => {
  window.Ably = Ably
  const echo = new Echo({
    broadcaster: 'ably',
    key: useRuntimeConfig().public.ablyKey
  })
  return { provide: { echo } }
})