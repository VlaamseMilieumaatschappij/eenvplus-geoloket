///ts:ref=Module
/// <reference path="../../Module.ts"/> ///ts:ref:generated
///ts:ref=Mask
/// <reference path="./Mask.ts"/> ///ts:ref:generated

module be.vmm.eenvplus.editor.area.areaZoom {
    'use strict';

    AreaZoomController.$inject = ['epMap', 'epAreaStore'];

    function AreaZoomController(map:ol.Map, store:AreaStore):void {

        /* -------------------- */
        /* --- construction --- */
        /* -------------------- */

        var view = map.getView(),
            center = _.compose(view.setCenter.bind(view), getCenter),
            zoom = _.compose(view.setResolution.bind(view), getResolution);

        store.selected.add(centerAndZoom);


        /* ----------------- */
        /* --- behaviour --- */
        /* ----------------- */

        function centerAndZoom(extent:ol.Extent):void {
            if (!extent) return;

            center(extent);
            zoom(extent);
        }

        function getCenter(extent:ol.Extent):ol.Coordinate {
            return <ol.Coordinate>[
                avg(extent[0], extent[2]),
                avg(extent[1], extent[3])
            ];
        }

        function getResolution(extent:ol.Extent):number {
            var size = map.getSize(),
                xResolution = (extent[2] - extent[0]) / size[0],
                yResolution = (extent[3] - extent[1]) / size[1],
                resolution = Math.max(xResolution, yResolution);
            return view.constrainResolution(resolution, 0, 1);
        }

        function avg(a:number, b:number):number {
            return (a + b) / 2;
        }

    }

    angular
        .module(MODULE)
        .run(AreaZoomController);

}
