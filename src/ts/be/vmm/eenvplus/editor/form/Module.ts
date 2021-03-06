///ts:ref=Prefix
/// <reference path="../../Prefix.ts"/> ///ts:ref:generated

module be.vmm.eenvplus.editor.form {
    'use strict';

    export var MODULE:string = PREFIX + '_form';

    export function injectValidator(scope:any,
                                    el:ng.IAugmentedJQuery,
                                    attr:ng.IAttributes,
                                    form:ng.IFormController):void {
        scope.ctrl.validate = Validator(form);
    }

    goog.provide(MODULE);

    angular.module(MODULE, [
        'ui.bootstrap.tpls',
        'ui.bootstrap.datepicker'
    ]);

}
