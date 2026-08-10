import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

export default defineConfig({
        test: {
                projects: [
                        // Unit tests - Node environment
                        {
                                test: {
                                        name: 'unit',
                                        include: ['src/**/*.unit.test.{ts,tsx}'],
                                        environment: 'node'
                                }
                        },
                        // Component browser tests - real browser via Playwright
                        {
                                test: {
                                        name: 'browser',
                                        include: ['src/**/*.cmp.test.{ts,tsx}'],
                                        browser: {
                                                enabled: true,
                                                provider: playwright(),
                                                instances: [
                                                        {
                                                                browser: 'chromium'
                                                        }
                                                ]
                                        }
                                }
                        }
                ]
        }
});
