///ts:ref=Module
/// <reference path="../Module.ts"/> ///ts:ref:generated

module be.vmm.eenvplus.editor {
    'use strict';


    Cursor.$inject = ['epMap', 'epStateStore', 'epAreaStore', 'epPainterStore', 'epGeometryEditorStore'];

    function Cursor(map:ol.Map,
                    stateStore:state.StateStore,
                    areaStore:area.AreaStore,
                    painterStore:paint.PainterStore,
                    editorStore:geometry.EditorStore):void {

        /* ------------------ */
        /* --- properties --- */
        /* ------------------ */

        var el = $(map.getViewport()),
            modifier = false;


        /* -------------------- */
        /* --- construction --- */
        /* -------------------- */

        stateStore.modeChanged.add(<any>invalidateState);
        areaStore.selected.add(handleAreaSelection);
        painterStore.selected.add(<any>invalidateState);


        /* ---------------------- */
        /* --- event handlers --- */
        /* ---------------------- */

        function handleAreaSelection(extent:ol.Extent):void {
            extent ?
                el.on('mousemove', handleMouseMove) :
                el.off('mousemove', handleMouseMove);
            invalidateState();
        }

        function handleMouseMove(event:any):void {
            modifier = event.ctrlKey;
            invalidateState(map.getEventCoordinate(event));
        }


        /* ----------------- */
        /* --- behaviour --- */
        /* ----------------- */

        /**
         * Crosshair is shown:
         * - only in 'edit' mode, never in 'view' mode
         * - when no area has been selected yet
         * - when the user is painting and the mouse is inside the selected area
         *
         * @param mouseCoordinate
         */
        function invalidateState(mouseCoordinate?:ol.Coordinate):void {
            var isDrawing = stateStore.currentMode === state.State.EDIT &&
                (!areaStore.current || painterStore.current !== undefined && inArea(mouseCoordinate));
            var isModifying = editorStore.current !== undefined && inArea(mouseCoordinate);

            if (isModifying) {
                var type = 'modify';
                if (modifier) type = 'remove';
                el.css('cursor', 'url("img/cursor/' + type + '.png"), default');
            }
            else el.css('cursor', isDrawing ? 'crosshair' : 'default');
        }

        function inArea(mouseCoordinate:ol.Coordinate):boolean {
            return ol.extent.containsCoordinate(areaStore.current, mouseCoordinate);
        }

    }

    angular
        .module(MODULE)
        .run(Cursor);

}
