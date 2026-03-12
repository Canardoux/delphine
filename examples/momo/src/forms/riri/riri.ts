export class riri {
        public mount(container: HTMLElement): void {
                container.innerHTML = `
            <h1>Hello from riri</h1>
            <p>Dynamic loading works.</p>
        `;
                console.log('riri mounted');
        }
}
