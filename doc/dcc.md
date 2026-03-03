# Delphine Custom Component (DCC)

## 🎯 Objectif

Un **DCC (Delphine Custom Component)** est un composant utilisateur intégré au moteur Delphine comme un composant natif.

Un DCC :

- Est instanciable via `data-component="TMyDcc"`
- Possède une métaclasse (`TMetaMyDcc`)
- Déclare ses propriétés via `defProps()`
- Participe normalement au cycle de vie Delphine

Un DCC n’est pas un plugin externe. C’est un composant Delphine standard écrit par l’utilisateur.

---

## 🧱 Deux types de DCC

### 1️⃣ Simple DCC

Hérite de `TComponent`

- Représente un seul élément DOM
- Ne contient pas d’enfants
- Similaire à `TButton`

```ts
export class TMyDcc extends TComponent {
        getMetaclass() {
                return TMetaMyDcc.metaclass;
        }
}
```

---

### 2️⃣ Composite DCC

Hérite de `TContainer` (ou `TCompositeDCC`)

- Peut contenir des enfants
- Se comporte comme un `TPanel` ou `TFrame`
- Les enfants sont visibles dans la Form

```ts
export class TMyCompositeDcc extends TContainer {
        getMetaclass() {
                return TMetaMyCompositeDcc.metaclass;
        }

        allowsChildren(): boolean {
                return true;
        }
}
```

---

## 🧠 Métaclasse obligatoire

Chaque DCC doit déclarer sa métaclasse :

```ts
export class TMetaMyDcc extends TMetaComponent {
        static readonly metaclass = new TMetaMyDcc(TMetaComponent.metaclass, 'TMyDcc');

        protected constructor(superClass: TMetaComponent, name: string) {
                super(superClass, name);
        }

        create(name: string, form: TForm, parent: TComponent) {
                return new TMyDcc(name, form, parent);
        }

        defProps(): PropSpec<TMyDcc>[] {
                return [
                        {
                                name: 'caption',
                                kind: 'string',
                                apply: (o, v) => (o.caption = String(v)),
                                retrieve: (o) => o.caption
                        }
                ];
        }
}
```

---

## 🔄 Cycle de vie

Un DCC :

1. Est créé via sa métaclasse
2. Reçoit ses propriétés via `apply`
3. Synchronise son DOM via ses setters
4. Peut exposer ses valeurs via `retrieve`

---

## 🧭 Intégration future

À terme :

- Les DCC seront détectés automatiquement pour GrapesJS
- Une palette DCC sera générée depuis le registre des métaclasses
- Les DCC pourront être distribués comme librairies réutilisables

Rien de cela n’est requis pour qu’un DCC fonctionne aujourd’hui.

---

## 📌 Règle d’or

Un DCC est simplement :

Un composant Delphine écrit par l’utilisateur.

Il ne doit introduire aucune mécanique spéciale dans le moteur.
