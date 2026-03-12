export class MainForm {
        public mount(container: HTMLElement): void {
                container.innerHTML = `
            <h1>Hello from MainForm</h1>
            <p>If you see this, Vite + TypeScript works.</p>
        `;
                console.log('MainForm mounted');
        }
}
