<script setup>
// const { $pusher, $echo, $socket } = useNuxtApp()
const { $pusher } = useNuxtApp()
const messages = ref([])
const input = ref('')

onMounted(() => {
  // Pusher Style
  $pusher.subscribe('chat-room').bind('message', (data) => messages.value.push(data))

  // Ably Style
  // $echo.channel('chat-room').listen('message', (data) => messages.value.push(data))

  // // PartyKit Style
  // $socket.addEventListener('message', (e) => messages.value.push(JSON.parse(e.data)))
})

async function sendMessage() {
  await $fetch('/api/send', { 
    method: 'POST', 
    body: { text: input.value } 
  })
  input.value = ''
}
</script>

<template>
  <div class="p-10">
    <div v-for="m in messages" class="border-b">{{ m.text }}</div>
    <input v-model="input" @keyup.enter="sendMessage" placeholder="Type here..." class="border p-2 w-full" />
  </div>
</template>