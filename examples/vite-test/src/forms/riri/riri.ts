import htmlSource from './riri.html?raw';
import { TForm } from '@vcl/StdCtrls';

export default class riri extends TForm {
        protected override getHtml(): string {
                return htmlSource;
        }

        protected override afterMount(): void {
                console.log('riri mounted');
        }
}
