<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script setup
        lang="ts">
        import { IonApp, IonRouterOutlet } from '@ionic/vue';
        import { Capacitor } from '@capacitor/core';
        import { initializeApp } from 'firebase/app';
        import {environment} from './env'
        const initializeFirebase = () => {
          if (Capacitor.isNativePlatform()) {
            return;
          }
          initializeApp(environment.firebase);
        }
        initializeFirebase()
</script>
