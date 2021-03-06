module be.vmm.eenvplus.feature {
    'use strict';

    export enum FeatureType {
        SEWER,
        APPURTENANCE,
        NODE
    }

    var editableModelPackage = 'be.vmm.eenvplus.sdi.model',
        bodIdPrefix = 'all:';

    export var typeModelMap = [
        'RioolLink',
        'RioolAppurtenance',
        'KoppelPunt'
    ].map(path);

    export var typeDrawModeMap = [
        ol.interaction.DrawMode.LINE_STRING,
        ol.interaction.DrawMode.POINT,
        ol.interaction.DrawMode.POINT
    ];

    export function isEditable(model:string):boolean {
        return _.contains(model, editableModelPackage);
    }

    export function isType(type:FeatureType, layerBodId:string):boolean;
    export function isType(type:FeatureType, json:model.FeatureJSON):boolean;
    export function isType(type:FeatureType, model:any):boolean {
        return toType(model) === type;
    }

    export function toType(layerBodId:string):FeatureType;
    export function toType(json:model.FeatureJSON):FeatureType;
    export function toType(model:any):FeatureType {
        if (typeof model !== 'string') model = model.layerBodId;
        return typeModelMap.indexOf(model.replace(bodIdPrefix, ''));
    }

    export function toLayerBodId(type:FeatureType):string {
        return bodIdPrefix + typeModelMap[type];
    }

    export function getLayer(map:ol.Map, type:FeatureType):ol.layer.Vector {
        var layers = map.getLayers().getArray();
        return _.where(layers, {values_: {featureType: type}})[0];
    }

    function path(name:string):string {
        return editableModelPackage + '.' + name;
    }

    angular
        .module(MODULE)
        .constant('FeatureType', FeatureType)
        .constant('typeModelMap', typeModelMap)
        .constant('typeDrawTypeMap', typeDrawModeMap)
        .filter(PREFIX + 'IsFeatureType', factory(shiftData(isType)));

}
