import { createApp, reactive } from 'vue'
import HelloDelphine from './components/HelloDelphine.vue'
//import { defineVuePlugin } from '@vcl'
import type { DelphineServices, UIPluginInstance, TPluginHost } from '@vcl'
export function createHelloVuePlugin(): UIPluginInstance<{ message?: string }> {
        let app: ReturnType<typeof createApp> | null = null
        const state = reactive<{ message: string }>({ message: 'BOBO' })

        return {
                id: 'hello-vue',

                mount(container, props, _services: DelphineServices) {
                        state.message = props.message ?? ''
                        app = createApp(HelloDelphine, state)
                        app.mount(container)
                },

                update(props) {
                        state.message = props.message ?? ''
                },

                unmount() {
                        app?.unmount()
                        app = null
                },
        }
}
