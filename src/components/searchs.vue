<script setup
        lang="ts">
        import {
          IonAccordion,
          IonAccordionGroup,
          IonCard,
          IonCardHeader,
          IonCardTitle,
          IonIcon,
          IonItem,
          IonLabel,
          IonSpinner
        } from "@ionic/vue";
        import { PropType } from 'vue';
        import { Search } from '../interfaces/search';
        import { checkmarkCircleOutline , closeCircleOutline} from 'ionicons/icons';
        const props = defineProps({
          searchs: { type: Array as PropType<Search[]>, required: true }
        })
</script>

<template>
  <ion-card>
    <ion-card-header>
      <ion-card-title>Mes recherches</ion-card-title>
    </ion-card-header>
    <ion-accordion-group>
      <ion-accordion v-for="search of props.searchs">
        <ion-item slot="header"
                  color="light">
          <ion-label>du {{ search.from }} au {{ search.to }} </ion-label>
          <ion-icon v-if="search.state === 'done'"
                    class="ion-margin-end"
                    :icon=checkmarkCircleOutline
                    size="large"
                    slot="end"
                    color="primary"></ion-icon>
          <ion-icon v-if="search.state === 'error'"
                    class="ion-margin-end"
                    :icon=closeCircleOutline
                    size="large"
                    slot="end"
                    color="danger"></ion-icon>
          <ion-spinner v-if="search.state === 'ongoing'"
                       class="ion-margin-end"
                       slot="end"
                       name="crescent"></ion-spinner>
        </ion-item>
        <div class="ion-padding"
             slot="content">
          <p><b>Secteur :</b> {{ search.sector.name }}</p>
          <p><b>Date de départ :</b> {{ search.from }}</p>
          <p><b>Date de fin :</b> {{ search.to }}</p>
        </div>
      </ion-accordion>
    </ion-accordion-group>
  </ion-card>
</template>