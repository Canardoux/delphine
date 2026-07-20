// RegisterVcl.ts

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

// import { TMetaPluginHost } from '@vcl';
import { TTypeRegistry } from '../../TypeRegistry';
//import { TMetaForm } from '../../Form';
import { TMetaPluginHost } from '../../Plugin';

import { TMetaPopupMenu } from './TPopupMenu';
import { TMetaFrame, TMetaHostFrame } from './TFrame';
import { TMetaLabel } from './TLabel';
import { TMetaButton } from './TButton';
import { TMetaCheckBox } from './TCheckBox';
import { TMetaPanel } from './TPanel';

export function register(types: TTypeRegistry) {
        types.register(TMetaButton.metaclass);
        types.register(TMetaPluginHost.metaclass);
        //types.register(TMetaForm.metaclass);
        types.register(TMetaPanel.metaclass);
        types.register(TMetaHostFrame.metaclass);
        types.register(TMetaFrame.metaclass);
        types.register(TMetaLabel.metaclass);
        types.register(TMetaCheckBox.metaclass);
        //types.register(TMetaNonVisualComponents.metaclass);
        types.register(TMetaPopupMenu.metaclass);
}

/*
                                Dependencies
                                ------------


Application
        Oops
        Form
                Base
                        IForm
                        IControl
                        Component
                                Oops
                                IForm
                                IControl

                Component
                        Oops
                        IForm
                        IControl

                Container
                        Base
                                IForm
                                IControl
                                Component
                                        Oops
                                        IForm
                                        IControl

                        Component
                                Oops
                                IForm
                                IControl

                        IForm

                ComponentRegistry
                        Oops
                        Component
                                Oops
                                IForm
                                IControl
                        Base
                                IForm
                                IControl
                                Component
                                        Oops
                                        IForm
                                        IControl

                        IForm

                IForm
                IApplication
                        Oops
                        IControl
                                Oops


        ComponentTypeRegistry
                Oops
                Component
                        Oops
                        IForm
                        IControl
                        
        RegisterVcl

                ComponentTypeRegistry
                        Oops
                        Component
                                Oops
                                IForm
                                IControl

                StrCtrls
                        Base
                                IForm
                                IControl
                                Component
                                        Oops
                                        IForm
                                        IControl

                        Container
                                Base
                                        IForm
                                        IControl
                                        Component
                                                Oops
                                                IForm
                                                IControl

                                Component
                                IForm

                        Component
                                Oops
                                IForm
                                IControl

                        IForm
                        IControl

                Form
                        ...
                Plugin
                        Form
                                ...
                        Base
                                IForm
                                IControl
                                Component
                                        Oops
                                        IForm
                                        IControl



                        Component
                        Application
                                ...
                        IPlugin

Document
        Oops

VuePlugin
        Plugin
        
*/
