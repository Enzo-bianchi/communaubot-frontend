<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <ion-grid>
        <ion-row class="ion-justify-content-center ion-padding">
          <ion-col size="3">
            <ion-img src="icon.png"
                     alt="logo communaubot"></ion-img>
          </ion-col>
        </ion-row>
        <ion-row v-if="!tokenFCM || tokenFCM === ''">
          <ion-col size="12">
            <ion-card>
              <ion-card-header>
                <ion-card-title>Un instant</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <p>
                  Pour fonctionner correctement, j'ai besoin que tu autorises
                  les notifications afin de te prevenir lorsque je trouve une
                  voiture.
                </p>
              </ion-card-content>
              <ion-button v-if="!loading"
                          expand="block"
                          fill="outline"
                          class="ion-margin"
                          @click="requestPermissions()">Autoriser la permission</ion-button>
              <ion-item v-else="loading">
                <ion-spinner expand="block"
                             name="crescent"
                             style="margin: auto"></ion-spinner>
              </ion-item>
            </ion-card>
          </ion-col>
        </ion-row>
        <ion-row>
          <ion-col size="12">
            <ion-card>
              <ion-card-header>
                <ion-card-title>Nouvelle recherche</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <ion-item color="none"
                          lines="none">
                  <ion-label>Départ :</ion-label>
                  <ion-datetime-button datetime="datetime"></ion-datetime-button>
                </ion-item>
                <ion-item color="none"
                          lines="none">
                  <ion-label>Arrivée :</ion-label>
                  <ion-datetime-button datetime="datetime2"></ion-datetime-button>
                </ion-item>
                <ion-item color="none"
                          lines="none">
                  <ion-select label="Secteur :"
                              aria-label="secteur"
                              placeholder="Secteur"
                              v-model="selectedSectorIndex">
                    <ion-select-option v-for="(sector, index) of sectors"
                                       :key="index"
                                       :value="index">{{ sector.name }}</ion-select-option>
                  </ion-select>
                </ion-item>
              </ion-card-content>
              <ion-button expand="block"
                          fill="outline"
                          class="ion-margin"
                          @click="addSearch()">Lancer la recherche</ion-button>
            </ion-card>
          </ion-col>
        </ion-row>
        <ion-row>
          <ion-col size="12">
            <Searchs :searchs="searchs" />
          </ion-col>
        </ion-row>

      </ion-grid>
      <template>
        <ion-modal :keep-contents-mounted="true">
          <ion-datetime id="datetime"
                        @ionChange="updateDateFrom($event)"></ion-datetime>
        </ion-modal>
      </template>
      <template>
        <ion-modal :keep-contents-mounted="true">
          <ion-datetime id="datetime2"
                        @ionChange="updateDateTo($event)"></ion-datetime>
        </ion-modal>
      </template>
    </ion-content>
  </ion-page>
</template>

<script setup
        lang="ts">
        import Searchs from '@/components/searchs.vue';
        import {
          IonButton,
          IonCard,
          IonCardContent,
          IonCardHeader,
          IonCardTitle,
          IonCol,
          IonContent,
          IonDatetime,
          IonDatetimeButton,
          IonGrid,
          IonImg,
          IonItem,
          IonLabel,
          IonModal,
          IonPage,
          IonRow,
          IonSelect,
          IonSelectOption,
          IonSpinner,
          toastController
        } from "@ionic/vue";
        import { onMounted, ref } from "vue";
        import { Search } from '../interfaces/search';
        import { Sector } from '../interfaces/sector';
        import { Capacitor } from '@capacitor/core';
        import { Device } from '@capacitor/device';
        import { Storage } from '@ionic/storage';
        import {environment} from '../env'
        import {
          FirebaseMessaging,
          GetTokenOptions,
        } from '@capacitor-firebase/messaging';
        import moment from 'moment';

        const loading = ref(false);
        const searchs = ref([] as Search[])
        const sectors = ref([] as Sector[])
        const selectedSectorIndex = defineModel()
        const store = new Storage();

        let tokenFCM = ref('');
        let dateFrom: string
        let dateTo: string
        let userId: string

        store.create();

        FirebaseMessaging.addListener('notificationReceived', (event) => {
          console.log('notification recu', { event });
        });
        FirebaseMessaging.addListener('notificationActionPerformed', (event) => {
          console.log('notification action', { event });
        });

        if (Capacitor.getPlatform() === 'web') {
          navigator.serviceWorker.addEventListener('message', (event: any) => {
            console.log('serviceWorker message: ', { event });
            const notification = new Notification(event.data.notification.title, {
              body: event.data.notification.body,
            });
            notification.onclick = (event) => {
              console.log('notification click', { event });
            };
          });
        }

        const requestPermissions = async () => {
          loading.value = true
          await FirebaseMessaging.requestPermissions();
          await getToken();
        }

        const getToken = async () => {
          try {
            const options: GetTokenOptions = {
              vapidKey: environment.firebase.vapidKey,
            };
            if (Capacitor.getPlatform() === 'web') {
              options.serviceWorkerRegistration =
                await navigator.serviceWorker.register('firebase-messaging-sw.js');
            }
            const { token } = await FirebaseMessaging.getToken(options);
            tokenFCM.value = token;
            await store.set('tokenfcm', token);
            const toast = await toastController.create({
              message: "Les notifications sont activées.",
              duration: 3000,
              position: 'bottom',
            });
            await toast.present();
          } catch (e) {
            const toast = await toastController.create({
              message: "Une erreur est survenue lors de la demande de permission.",
              duration: 3000,
              position: 'bottom',
            });
            await toast.present();
            console.error(e);
          } finally {
            loading.value = false
          }
        }

        const updateDateFrom = (e: any) => {
          dateFrom = moment(e.detail.value).format('MM/DD/YYYY HH:mm:ss');
        }

        const updateDateTo = (e: any) => {
          dateTo = moment(e.detail.value).format('MM/DD/YYYY HH:mm:ss');
        }

        const addSearch = async () => {
          if (!dateTo || !dateFrom) {
            const toast = await toastController.create({
              message: 'Veuillez selectionner vos dates.',
              duration: 1500,
              position: 'bottom',
            });
            return await toast.present();
          }
          if (!selectedSectorIndex.value) {
            const toast = await toastController.create({
              message: 'Veuillez selectionner un secteur.',
              duration: 1500,
              position: 'bottom',
            });
            await toast.present();
          } else {
            const search: Search = {
              userId: userId,
              from: dateFrom,
              to: dateTo,
              tokenFCM:tokenFCM.value,
              sector: sectors.value[+selectedSectorIndex.value],
            }

            const requestOptions = {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(search)
            }
            fetch(environment.backend_url + '/search', requestOptions)
              .then(resp => resp.json())
              .then(s => searchs.value.push(s))
              .catch(e => console.error('error addSearch', e))
          }
        }

        const logDeviceInfo = async () => {
          let deviceId = await Device.getId();
          userId = deviceId.identifier
        }

        const getSearchs = () => {
          fetch(environment.backend_url + '/searchs?' + new URLSearchParams({ userId }))
            .then(resp => resp.json())
            .then(s => searchs.value = s)
            .catch(e => console.log('error getSearchs', e))
        }

        onMounted(() => {
          fetch(environment.backend_url + '/sectors')
            .then((response) => response.json()
              .then(s => sectors.value = s))
            .catch(e => console.error(e))

          logDeviceInfo().then(() => getSearchs())
          store.get('tokenfcm').then(t => {
            if (t) {
              tokenFCM.value = t
            }
          });
        })
</script>

<style scoped>
ion-img {
  height: 9rem;
}
</style>
