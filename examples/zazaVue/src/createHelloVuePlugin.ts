import HelloDelphine from './components/HelloDelphine.vue'
import { defineVuePlugin } from '@vcl'

export const createHelloVuePlugin = defineVuePlugin(HelloDelphine)
