// Document.ts
// -----------

/*
 * Copyright 2026 Canardoux.
 *
 * This file is part of the Delphine project.
 *
 * Delphine is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 (GPL3), as published by
 * the Free Software Foundation.
 *
 * Delphine is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Delphine.  If not, see <https://www.gnu.org/licenses/>.
 */

import { TMetaObject, TObject } from './Oops';

export class TDocument extends TObject {
        static document: TDocument = new TDocument(document);
        static body = document.body;
        htmlDoc: Document;
        constructor(htmlDoc: Document) {
                super();
                this.htmlDoc = htmlDoc;
        }
}

export class TMetaDocument extends TMetaObject {
        static readonly metaclass: TMetaDocument = new TMetaDocument(TMetaObject.metaclass, 'TDocument');

        protected constructor(superClass: TMetaObject, name: string) {
                super(superClass, name);
                // et vous changez juste le nom :
        }
        getMetaclass() {
                return TMetaDocument.metaclass;
        }
}
