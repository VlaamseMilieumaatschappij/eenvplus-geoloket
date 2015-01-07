module be.vmm.eenvplus.user {
    'use strict';

    export interface User {
        authenticated: boolean;
        username?:string;
        name?:string;

        hasRole(role:string):boolean;
        login(username:string, password:string):void;
        logout():void;
    }

}
