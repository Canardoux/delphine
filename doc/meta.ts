class TButton {
        caption = 'Button';
}

const klass = TButton;

const b = new klass();

// ==================================================

type Constructor<T> = new (...args: any[]) => T;

function create<T>(klass: Constructor<T>): T {
        return new klass();
}

const button = create(TButton);

// ==================================================

class TypeRegistry {
        private types = new Map<string, Constructor<any>>();

        register<T>(name: string, klass: Constructor<T>) {
                this.types.set(name, klass);
        }

        create(name: string) {
                const klass = this.types.get(name);
                if (!klass) throw new Error(`Unknown type ${name}`);
                return new klass();
        }
}


// ======================================================

class TButton {
        static delphine = {
                name: 'TButton',
                palette: 'Standard',
                iconSvg: '...',
                props: [...]
        };
}

registry.register(TButton);
const toto = TButton.delphine.props
