Building a full Nuxt 4 project for Vercel requires a shift from "server-owned" WebSockets to **Event-Driven Pub/Sub**.

In Nuxt 4, the recommended structure places your frontend in the app/ directory and your Nitro backend in server/. Below is the complete setup for the three major players.

## ---

**1\. The Core Infrastructure (Shared)**

All three methods follow this same logic:

1. **Frontend:** Listens to a channel.  
2. **User Action:** Calls a standard Nuxt API (/api/message).  
3. **Nuxt API (Vercel):** "Publishes" the event to the Pub/Sub provider and finishes immediately.

### **Directory Structure**

Plaintext

.  
├── app/  
│   ├── pages/  
│   │   └── chat.vue  
│   └── plugins/  
│       ├── pusher.client.ts  
│       ├── ably.client.ts  
│       └── partykit.client.ts  
├── server/  
│   └── api/  
│       └── send.post.ts  
├── nuxt.config.ts  
└── .env

## ---

**2\. Option A: Pusher (The Industry Standard)**

**Setup:** npm install pusher pusher-js

**The Plugin (app/plugins/pusher.client.ts):**

TypeScript

import Pusher from 'pusher-js'

export default defineNuxtPlugin(() \=\> {  
  const config \= useRuntimeConfig().public  
  const pusher \= new Pusher(config.pusherKey, { cluster: config.pusherCluster })  
    
  return { provide: { pusher } }  
})

**The API (server/api/send.post.ts):**

TypeScript

import Pusher from 'pusher'

export default defineEventHandler(async (event) \=\> {  
  const { text } \= await readBody(event)  
  const pusher \= new Pusher({  
    appId: process.env.PUSHER\_ID\!,  
    key: process.env.PUSHER\_KEY\!,  
    secret: process.env.PUSHER\_SECRET\!,  
    cluster: process.env.PUSHER\_CLUSTER\!,  
    useTLS: true  
  })

  await pusher.trigger('chat-room', 'message', { text, time: Date.now() })  
  return { sent: true }  
})

## ---

**3\. Option B: Ably (The High-Reliability Choice)**

**Setup:** npm install ably @ably/laravel-echo

**The Plugin (app/plugins/ably.client.ts):**

TypeScript

import Echo from '@ably/laravel-echo'  
import \* as Ably from 'ably'

export default defineNuxtPlugin(() \=\> {  
  window.Ably \= Ably  
  const echo \= new Echo({  
    broadcaster: 'ably',  
    key: useRuntimeConfig().public.ablyKey  
  })  
  return { provide: { echo } }  
})

**The API (server/api/send.post.ts):**

TypeScript

import \* as Ably from 'ably'

export default defineEventHandler(async (event) \=\> {  
  const { text } \= await readBody(event)  
  const realtime \= new Ably.Realtime(process.env.ABLY\_SECRET\!)  
  const channel \= realtime.channels.get('chat-room')  
    
  await channel.publish('message', { text })  
  return { sent: true }  
})

## ---

**4\. Option C: PartyKit (The "Serverless-Native" Choice)**

PartyKit is unique because you actually deploy a tiny "Party" server alongside your Nuxt app. It is the most "Nuxt-like" experience for developers.

**Setup:** npm install partysocket

**The Plugin (app/plugins/partykit.client.ts):**

TypeScript

import PartySocket from 'partysocket'

export default defineNuxtPlugin(() \=\> {  
  const socket \= new PartySocket({  
    host: 'your-party.your-username.partykit.dev',  
    room: 'main-room'  
  })  
  return { provide: { socket } }  
})

**The Party Server (party/main.ts \- Separate Deployment):**

TypeScript

export default {  
  onMessage(message, occupant, room) {  
    // PartyKit stays alive\! It broadcasts directly.  
    room.broadcast(message);  
  }  
}

## ---

**5\. The Unified Frontend (app/pages/chat.vue)**

This component shows how to toggle between them.

Code snippet

\<script setup\>  
const { $pusher, $echo, $socket } \= useNuxtApp()  
const messages \= ref(\[\])  
const input \= ref('')

onMounted(() \=\> {  
  // Pusher Style  
  $pusher.subscribe('chat-room').bind('message', (data) \=\> messages.value.push(data))

  // Ably Style  
  $echo.channel('chat-room').listen('message', (data) \=\> messages.value.push(data))

  // PartyKit Style  
  $socket.addEventListener('message', (e) \=\> messages.value.push(JSON.parse(e.data)))  
})

async function sendMessage() {  
  await $fetch('/api/send', {   
    method: 'POST',   
    body: { text: input.value }   
  })  
  input.value \= ''  
}  
\</script\>

\<template\>  
  \<div class="p-10"\>  
    \<div v-for="m in messages" class="border-b"\>{{ m.text }}\</div\>  
    \<input v-model="input" @keyup.enter="sendMessage" placeholder="Type here..." class="border p-2 w-full" /\>  
  \</div\>  
\</template\>

### ---

**Which one should you actually use?**

* **Use Pusher** if you want the easiest setup with the most tutorials.  
* **Use Ably** if your app is mission-critical (finance, healthcare, or high-scale) and you need "exactly-once" message delivery.  
* **Use PartyKit** if you want to write "Server" logic that behaves like a real WebSocket server but scales like Vercel.

Would you like me to help you set up the **Environment Variables** in Vercel for the one you like best?

For **Nuxt 4**, the configuration file follows a specific pattern to ensure that your private API secrets (like Ably or Pusher secrets) stay on the server while your public keys are shared with the browser.

In Nuxt 4, the **app/** directory is now the default home for your frontend, but the nuxt.config.ts stays in the **root**.

### **1\. The Environment File (.env)**

First, create this file in your root directory. **Do not** commit this to GitHub; you will manually add these values to the Vercel Dashboard later.

Bash

\# PUSHER  
NUXT\_PUBLIC\_PUSHER\_KEY=your\_key  
NUXT\_PUSHER\_SECRET=your\_secret  
NUXT\_PUBLIC\_PUSHER\_CLUSTER=mt1

\# ABLY  
NUXT\_PUBLIC\_ABLY\_KEY=your\_public\_key  
NUXT\_ABLY\_SECRET=your\_private\_secret

\# PARTYKIT  
NUXT\_PUBLIC\_PARTYKIT\_HOST=your-project.username.partykit.dev

### ---

**2\. The Nuxt Config (nuxt.config.ts)**

This is where you map those environment variables. Nuxt 4 uses runtimeConfig to handle the split between client and server.

TypeScript

export default defineNuxtConfig({  
  // Nuxt 4 "Future" flag to opt-in to the new folder structure  
  future: {  
    compatibilityVersion: 4,  
  },

  // This is where we define our variables  
  runtimeConfig: {  
    // 1\. Private Keys (Only available in /server folder)  
    pusherSecret: process.env.NUXT\_PUSHER\_SECRET,  
    ablySecret: process.env.NUXT\_ABLY\_SECRET,

    // 2\. Public Keys (Available in both /app and /server)  
    public: {  
      pusherKey: process.env.NUXT\_PUBLIC\_PUSHER\_KEY,  
      pusherCluster: process.env.NUXT\_PUBLIC\_PUSHER\_CLUSTER,  
      ablyKey: process.env.NUXT\_PUBLIC\_ABLY\_KEY,  
      partykitHost: process.env.NUXT\_PUBLIC\_PARTYKIT\_HOST,  
    }  
  },

  // If you are using PartyKit, you might need to allow its domain  
  // if you have strict Security Headers enabled.  
})

### ---

**3\. How to access them in your code**

Because we set them up in the config, you access them differently depending on where the code is running:

**In a Vue Component (app/pages/chat.vue):**

TypeScript

const config \= useRuntimeConfig()  
console.log(config.public.ablyKey) // Works\!  
console.log(config.ablySecret)    // Undefined (Safety feature\!)

**In a Nitro API Route (server/api/send.ts):**

TypeScript

export default defineEventHandler(async (event) \=\> {  
  const config \= useRuntimeConfig(event)  
  console.log(config.ablySecret) // Works on the server\!  
})

### ---

**4\. Vercel Deployment Tip**

When you push to Vercel, you don't need to change your nuxt.config.ts. You just go to **Project Settings \> Environment Variables** and add the keys exactly as they appear in your .env file.

**A Quick Note on naming:** If you name your environment variable NUXT\_PUBLIC\_ABLY\_KEY, Nuxt will automatically map it to runtimeConfig.public.ablyKey. This is a built-in "auto-mapping" feature that saves you from writing process.env everywhere.

Would you like me to show you how to set up the **Ably Authentication** route? This is necessary if you want to use "Private Channels" so random people can't listen to your data.

