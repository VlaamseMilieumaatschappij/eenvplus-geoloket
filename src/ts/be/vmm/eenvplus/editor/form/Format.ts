///ts:ref=Module
/// <reference path="../../Module.ts"/> ///ts:ref:generated

module be.vmm.eenvplus.editor.form {
    'use strict';

    export interface Format {
        toFeatureLabel(json:feature.model.FeatureJSON):string;
        toUserName(id:number):string;
    }

    export module Format {
        export var NAME:string = PREFIX + 'Format';

        var api = {
            toFeatureLabel: toFeatureLabel,
            toUserName: toUserName
        };

        export function toFeatureLabel(json:feature.model.FeatureJSON):string {
            // TODO get these from .properties
            var typeLabels = ['Sewer', 'Appurtenance', 'Node'],
                type = feature.toType(json);

            if (json.id)
                return typeLabels[type] + ' ' + (json.properties.alternatieveId || 'VMM:' + json.id);
            return 'New ' + typeLabels[type];
        }

        export function toUserName(id:number):string {
            return id ? (id).toString() : 'VMM';
        }

        angular
            .module(MODULE)
            .factory(NAME, factory(api));

    }

}
