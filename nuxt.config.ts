// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // // Nuxt 4 uses nitro for the server engine
  // nitro: {
  //   experimental: {
  //     websocket: true
  //   }
  // }


  // Nuxt 4 "Future" flag to opt-in to the new folder structure
  future: {
    compatibilityVersion: 4,
  },

  // This is where we define our variables
  runtimeConfig: {
    // 1. Private Keys (Only available in /server folder)
    pusherAppId: process.env.NUXT_PUSHER_API,
    pusherSecret: process.env.NUXT_PUSHER_SECRET,
    // ablySecret: process.env.NUXT_ABLY_SECRET,

    // 2. Public Keys (Available in both /app and /server)
    public: {
      pusherKey: process.env.NUXT_PUBLIC_PUSHER_KEY,
      pusherCluster: process.env.NUXT_PUBLIC_PUSHER_CLUSTER,
      // ablyKey: process.env.NUXT_PUBLIC_ABLY_KEY,
      // partykitHost: process.env.NUXT_PUBLIC_PARTYKIT_HOST,
    }
  },

  // If you are using PartyKit, you might need to allow its domain
  // if you have strict Security Headers enabled.
})
