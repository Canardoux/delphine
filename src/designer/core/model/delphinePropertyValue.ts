// designer/core/model/delphinePropertyValue.ts

export interface DelphineExpression {
        kind: 'expression';
        source: string;
}

export type DelphinePropertyValue = string | number | boolean | DelphineExpression;
