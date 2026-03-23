import HelloDelphine from './HelloVueDelphine.vue';
import { defineVuePlugin } from '@vcl';

export const createHelloVuePlugin = defineVuePlugin(HelloDelphine);
