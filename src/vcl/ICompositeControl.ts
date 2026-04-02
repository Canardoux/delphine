import type { IControl, IMetaControl } from './IControl';

export interface ICompositeControl extends IControl {
        isAForm(): boolean;
        isACompositeControl(): boolean;
        //getClass(type: string): IControl | undefined;
        getName(): string;
        registerInstance(name: string, c: IControl): void;
        registerFrame(name: string, comp: ICompositeControl): void;
}

export interface IMetaCompositeControl extends IMetaControl {
        //create(name: string, form: any, parent: any): any;
        isAForm(): boolean;
        isACompositeControl(): boolean;
}
