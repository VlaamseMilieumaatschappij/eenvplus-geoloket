///ts:ref=Module
/// <reference path="../Module.ts"/> ///ts:ref:generated

module be.vmm.eenvplus.state.applicationState {
    'use strict';

    export var NAME:string = PREFIX + 'ApplicationState';

    var stateCls = [
        'view',
        'edit',
        'feature-selected',
        'invalid',
        'overview',
        'detail',
        'geometry-painting',
        'geometry-modifying'
    ];

    /**
     * Can't isolate the scope because we need a way to hook into the body without touching the original code.
     *
     * @returns The State directive configuration.
     */
    function configure():ng.IDirective {
        ApplicationStateController.$inject = ['epStateStore'];

        return {
            restrict: 'A',
            controllerAs: 'ctrl',
            controller: ApplicationStateController
        };
    }

    class ApplicationStateController {

        /* ------------------ */
        /* --- properties --- */
        /* ------------------ */

        public isEditing:boolean;

        private state:StateStore;


        /* -------------------- */
        /* --- construction --- */
        /* -------------------- */

        constructor(state:StateStore) {
            this.state = state;
            state.modeChanged.add(this.updateState.bind(this));
        }


        /* ----------------- */
        /* --- behaviour --- */
        /* ----------------- */

        private updateState(mode:State):void {
            this.isEditing = mode === State.EDIT;

            // FIXME hard reference
            if (!this.isEditing) $('#drawTools').collapse('hide');
        }

        public getState():string {
            if (!this.state) return '';

            return _.map(this.state.current, (state:State):string => {
                return stateCls[state];
            }).join(' ');
        }

    }

    angular
        .module(MODULE)
        .directive(NAME, configure);

}
