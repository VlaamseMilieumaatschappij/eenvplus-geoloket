/**
 * Mocked indexeddb
 */

// mock saves objects here
var mockIndexedDBItems = {};

// used for waitFor()'s in tests
var mockIndexedDB_openDBSuccess = false;
var mockIndexedDB_openDBFail = false;
var mockIndexedDB_openDBAbort = false;
var mockIndexedDB_openDBBlocked = false;
var mockIndexedDB_openDBUpgradeNeeded = false;

var mockIndexedDB_openCursorSuccess = false;
var mockIndexedDB_openCursorFail = false;
var mockIndexedDB_cursorReadingDone = false;

var mockIndexedDB_saveSuccess = false;
var mockIndexedDB_saveFail = false;
var mockIndexedDB_deleteSuccess = false;
var mockIndexedDB_deleteFail = false;
var mockIndexedDB_clearSuccess = false;
var mockIndexedDB_clearFail = false;
var mockIndexedDB_createStoreSuccess = false;
var mockIndexedDB_createStoreFail = false;
var mockIndexedDB_deleteDBSuccess = false;
var mockIndexedDB_deleteDBFail = false;

// used for reading objects
var mockIndexedDB_cursorResultsIndex = 0;
var mockIndexedDB_table = undefined;

function syncWrapMethods(object) {
    _.each(object, function (value, key) {
        if (typeof value === 'function' && key.indexOf('Handler') !== -1)
            object[key] = syncWrap(value);
    });
}

function syncWrap(fn) {
    return function () {
        var deferred = false;

        if (this.onsuccess)
            _.bind(fn, this).apply(this, arguments);
        else {
            deferred = arguments;
            Object.defineProperty(this, 'onsuccess', {
                get: function () {
                    return this._onsuccess;
                },
                set: function (fn) {
                    this._onsuccess = fn;
                    if (deferred) {
                        this.callSuccessHandler.apply(this, deferred);
                        deferred = false;
                        delete this._onsuccess;
                        delete this.onsuccess;
                    }
                },
                configurable: true
            });
        }
    }
}

function _setTimeout(fn) {
    fn();
}

// test flags
mockIndexedDBTestFlags = {
    'canOpenDB': true,
    'openDBShouldBlock': false,
    'openDBShouldAbort': false,
    'upgradeNeeded': false,
    'canReadDB': true,
    'canSave': true,
    'canDelete': true,
    'canClear': true,
    'canCreateStore': true,
    'canDeleteDB': true
};

// timers are used to handle callbacks
var mockIndexedDB_openDBTimer;
var mockIndexedDB_createObjectStoreTimer;
var mockIndexedDB_cursorContinueTimer;
var mockIndexedDB_storeAddTimer;
var mockIndexedDB_storeDeleteTimer;
var mockIndexedDB_storeClearTimer;
var mockIndexedDB_storeOpenCursorTimer;
var mockIndexedDB_deleteDBTimer;

/**
 * call this in beforeEach() to reset the mock
 */
function resetIndexedDBMock() {
    mockIndexedDBItems = {};

    mockIndexedDB_openDBSuccess = false;
    mockIndexedDB_openDBFail = false;
    mockIndexedDB_openDBAbort = false;
    mockIndexedDB_openDBBlocked = false;
    mockIndexedDB_openDBUpgradeNeeded = false;

    mockIndexedDB_openCursorSuccess = false;
    mockIndexedDB_openCursorFail = false;
    mockIndexedDB_cursorReadingDone = false;

    mockIndexedDB_saveSuccess = false;
    mockIndexedDB_saveFail = false;
    mockIndexedDB_deleteSuccess = false;
    mockIndexedDB_deleteFail = false;
    mockIndexedDB_clearSuccess = false;
    mockIndexedDB_clearFail = false;
    mockIndexedDB_createStoreSuccess = false;
    mockIndexedDB_createStoreFail = false;
    mockIndexedDB_deleteDBSuccess = false;
    mockIndexedDB_deleteDBFail = false;

    mockIndexedDB_cursorResultsIndex = 0;
    mockIndexedDB_table = undefined;

    mockIndexedDBTestFlags.canOpenDB = true;
    mockIndexedDBTestFlags.openDBShouldBlock = false;
    mockIndexedDBTestFlags.openDBShouldAbort = false;
    mockIndexedDBTestFlags.canReadDB = true;
    mockIndexedDBTestFlags.canSave = true;
    mockIndexedDBTestFlags.canDelete = true;
    mockIndexedDBTestFlags.canCreateStore = true;
    mockIndexedDBTestFlags.canDeleteDB = true;

    clearTimeout(mockIndexedDB_openDBTimer);
    clearTimeout(mockIndexedDB_createObjectStoreTimer);
    clearTimeout(mockIndexedDB_cursorContinueTimer);
    clearTimeout(mockIndexedDB_storeAddTimer);
    clearTimeout(mockIndexedDB_storeDeleteTimer);
    clearTimeout(mockIndexedDB_storeClearTimer);
    clearTimeout(mockIndexedDB_storeOpenCursorTimer);
    clearTimeout(mockIndexedDB_deleteDBTimer);
}

/**
 * call this in beforeEach() to "save" data before a test
 */
function commitIndexedDBMockData(table, value) {
    var item = {
        'key': value.key,
        'value': value
    };

    if (!mockIndexedDBItems[table]) mockIndexedDBItems[table] = [];
    mockIndexedDBItems[table].push(item);
}

/**
 * the cursor works like an indexeddb one, where calling continue() will provide
 * next item. items must be saved with the commitIndexedDBMockData() method in
 * order to be returned by the cursor.
 */
var mockIndexedDBCursor = {
    'identity': 'mockIndexedDBCursor',

    'continue': function () {
        mockIndexedDB_cursorResultsIndex++;
        mockIndexedDB_openCursorSuccess = false;

        mockIndexedDB_cursorContinueTimer = _setTimeout(function () {
            mockIndexedDBCursorRequest.callSuccessHandler();
            mockIndexedDB_openCursorSuccess = true;
        }, 20);

        return mockIndexedDBCursorRequest;
    }
};

/**
 * with each call to continue() to get the cursor, the object will
 * have a key and value property. these are defined by the getters.
 */
mockIndexedDBCursor.__defineGetter__("key", function () {
    if (mockIndexedDB_cursorResultsIndex < mockIndexedDBItems[mockIndexedDB_table].length) {
        var item = mockIndexedDBItems[mockIndexedDB_table][mockIndexedDB_cursorResultsIndex];
        return item.key;
    }
    else {
        return null;
    }
});

mockIndexedDBCursor.__defineGetter__("value", function () {
    if (mockIndexedDB_cursorResultsIndex < mockIndexedDBItems[mockIndexedDB_table].length) {
        var item = mockIndexedDBItems[mockIndexedDB_table][mockIndexedDB_cursorResultsIndex];
        return item.value;
    }
    else {
        return null;
    }
});

mockIndexedDBCursor.__defineGetter__("resultCount", function () {
    return mockIndexedDBItems[mockIndexedDB_table].length;
});

var mockIndexedDBCursorRequest = {
    'callSuccessHandler': function () {
        if (this.onsuccess !== null) {

            var cursorToReturn;

            if (mockIndexedDB_cursorResultsIndex < mockIndexedDBItems[mockIndexedDB_table].length) {
                cursorToReturn = mockIndexedDBCursor;
                mockIndexedDB_cursorReadingDone = false;
            }
            else {
                cursorToReturn = null;
                mockIndexedDB_cursorResultsIndex = 0;
                mockIndexedDB_cursorReadingDone = true;
            }

            var event = {
                'type': 'success',
                'bubbles': false,
                'cancelable': true,
                'target': {
                    'result': cursorToReturn
                }
            };

            this.onsuccess(event);
        }
    },

    'callErrorHandler': function () {
        if (this.onerror !== null) {

            var event = {
                'type': 'error',
                'bubbles': true,
                'cancelable': true,
                'target': {
                    'errorCode': 1 // this is a made-up code
                }
            };

            this.onerror(event);
        }
    }
};

var mockIndexedDBStoreTransaction = {
    'callSuccessHandler': function (result) {
        if (this.onsuccess !== null) {
            var event = {
                'type': 'error',
                'bubbles': false,
                'cancelable': true,
                'target': {
                    result: result
                }
            };
            this.onsuccess(event);
        }
    },

    'callErrorHandler': function () {
        if (this.onerror !== null) {
            var event = {
                'type': 'error',
                'bubbles': true,
                'cancelable': true,
                'target': {
                    'errorCode': 1 // this is a made-up code
                }
            };
            this.onerror(event);
        }
    }
};

var mockIndexedDBStore = {
    'identity': 'mockedStore',

    // add returns a different txn than delete does. in indexedDB, the listeners are
    // attached to the txn that returned the store.
    'add': function (data) {
        if (mockIndexedDBTestFlags.canSave === true) {
            mockIndexedDBItems[mockIndexedDB_table].push(data);
            mockIndexedDB_storeAddTimer = _setTimeout(function () {
                mockIndexedDBTransaction.callCompleteHandler();
                mockIndexedDB_saveSuccess = true;
            }, 20);
        }
        else {
            mockIndexedDB_storeAddTimer = _setTimeout(function () {
                mockIndexedDBTransaction.callErrorHandler();
                mockIndexedDB_saveFail = true;
            }, 20);
        }

        return mockIndexedDBTransaction;
    },

    get: function (key) {
        var result = _(mockIndexedDBItems[mockIndexedDB_table])
            .map('value')
            .find({key: key});

        mockIndexedDB_storeAddTimer = _setTimeout(function () {
            mockIndexedDBStoreTransaction.callSuccessHandler(result);
            mockIndexedDB_saveSuccess = true;
        }, 20);

        return mockIndexedDBStoreTransaction;
    },

    // for now, treating put just like an add.
    // TODO: do an update instead of adding
    'put': function (data) {
        if (mockIndexedDBTestFlags.canSave === true) {
            var result = _(mockIndexedDBItems[mockIndexedDB_table]).find({key: data.key}),
                index = mockIndexedDBItems[mockIndexedDB_table].indexOf(result);
            mockIndexedDBItems[mockIndexedDB_table][index] = {
                key: data.key,
                value: data
            };
            mockIndexedDB_storeAddTimer = _setTimeout(function () {
                mockIndexedDBTransaction.callSuccessHandler();
                mockIndexedDB_saveSuccess = true;
            }, 20);
        }
        else {
            mockIndexedDB_storeAddTimer = _setTimeout(function () {
                mockIndexedDBTransaction.callErrorHandler();
                mockIndexedDB_saveFail = true;
            }, 20);
        }

        return mockIndexedDBTransaction;
    },

    // for delete, the listeners are attached to a request returned from the store.
    'delete': function (key) {
        if (mockIndexedDBTestFlags.canDelete === true) {
            var result = _(mockIndexedDBItems[mockIndexedDB_table]).find({key: key}),
                index = mockIndexedDBItems[mockIndexedDB_table].indexOf(result);
            mockIndexedDBItems[mockIndexedDB_table].splice(index, 1);
            mockIndexedDB_storeDeleteTimer = _setTimeout(function () {
                mockIndexedDBStoreTransaction.callSuccessHandler();
                mockIndexedDB_deleteSuccess = true;
            }, 20);
        }
        else {
            mockIndexedDB_storeDeleteTimer = _setTimeout(function () {
                mockIndexedDBStoreTransaction.callErrorHandler();
                mockIndexedDB_deleteFail = true;
            }, 20);
        }

        return mockIndexedDBStoreTransaction;
    },

    // for clear, the listeners are attached to a request returned from the store.
    'clear': function (data_id) {
        if (mockIndexedDBTestFlags.canClear === true) {
            mockIndexedDB_storeClearTimer = _setTimeout(function () {
                mockIndexedDBItems[mockIndexedDB_table].length = 0;
                mockIndexedDBStoreTransaction.callSuccessHandler();
                mockIndexedDB_clearSuccess = true;
            }, 20);
        }
        else {
            mockIndexedDB_storeClearTimer = _setTimeout(function () {
                mockIndexedDBStoreTransaction.callErrorHandler();
                mockIndexedDB_clearFail = true;
            }, 20);
        }

        return mockIndexedDBStoreTransaction;
    },

    'createIndex': function (key, key, params) {

    },

    'callSuccessHandler': function () {
        if (this.onsuccess !== null) {
            var event = new CustomEvent("success", {bubbles: false, cancelable: true});
            this.onsuccess(event);
        }
    },

    'callErrorHandler': function () {
        if (this.onerror !== null) {
            var event = {
                'type': 'error',
                'bubbles': true,
                'cancelable': true,
                'target': {
                    'errorCode': 1 // this is a made-up code
                }
            };
            this.onerror(event);
        }
    },

    'openCursor': function () {
        if (mockIndexedDBTestFlags.canReadDB === true) {
            mockIndexedDB_storeOpenCursorTimer = _setTimeout(function () {
                mockIndexedDBCursorRequest.callSuccessHandler();
                mockIndexedDB_openCursorSuccess = true;
            }, 20);
        }
        else {
            mockIndexedDB_storeOpenCursorTimer = _setTimeout(function () {
                mockIndexedDBCursorRequest.callErrorHandler();
                mockIndexedDB_openCursorFail = true;
            }, 20);
        }

        return mockIndexedDBCursorRequest;
    }
};

var mockIndexedDBTransaction = {
    'objectStore': function (name) {
        mockIndexedDB_table = mockIndexedDBStore.name = name;
        return mockIndexedDBStore;
    },

    'callSuccessHandler': function () {
        if (this.onsuccess !== null) {
            var event = {
                'type': 'error',
                'bubbles': false,
                'cancelable': true,
                'target': {}
            };
            this.onsuccess(event);
        }
    },

    'callErrorHandler': function () {
        if (this.onerror !== null) {
            var event = {
                'type': 'error',
                'bubbles': true,
                'cancelable': true,
                'target': {
                    'errorCode': 1 // this is a made-up code
                }
            };
            this.onerror(event);
        }
    }
};

var mockIndexedDBDatabase = {
    'transaction': function (stores, access) {
        return mockIndexedDBTransaction;
    },

    'close': function () {
    },

    'objectStoreNames': {
        'contains': function (name) {
            return false;
        }
    },

    'createObjectStore': function (name, params) {
        if (mockIndexedDBTestFlags.canCreateStore === true) {
            mockIndexedDB_createObjectStoreTimer = _setTimeout(function () {
                mockIndexedDBStore.callSuccessHandler();
                mockIndexedDB_createStoreSuccess = true;
            }, 20);
        }
        else {
            mockIndexedDB_createObjectStoreTimer = _setTimeout(function () {
                mockIndexedDBStore.callErrorHandler();
                mockIndexedDB_createStoreFail = true;
            }, 20);
        }

        return mockIndexedDBStore;
    }
};

var mockIndexedDBOpenDBRequest = {
    'callSuccessHandler': function () {
        var event = {
            type: 'success',
            bubbles: false,
            cancelable: true,
            target: {
                result: mockIndexedDBDatabase
            }
        };
        this.onsuccess(event);
    },

    'callErrorHandler': function () {
        if (this.onerror !== null) {
            var event = {
                'type': 'error',
                'bubbles': true,
                'cancelable': true,
                'target': {
                    'errorCode': 1, // this is a made-up code
                    'error': {
                        'message': 'fail' // this is a made-up message
                    }
                }
            };
            this.onerror(event);
        }
    },

    'callAbortHandler': function () {
        if (this.onblocked !== null) {
            var event = {
                'type': 'error',
                'bubbles': true,
                'cancelable': true,
                'target': {
                    'errorCode': 1, // this is a made-up code
                    'error': {
                        'message': 'fail' // this is a made-up message
                    }
                }
            };
            this.onblocked(event);
        }
    },

    'callBlockedHandler': function () {
        if (this.onabort !== null) {
            var event = {
                'type': 'error',
                'bubbles': true,
                'cancelable': true,
                'target': {
                    'errorCode': 1, // this is a made-up code
                    'error': {
                        'message': 'fail' // this is a made-up message
                    }
                }
            };
            this.onabort(event);
        }
    },

    'callUpgradeNeeded': function () {
        if (this.onupgradeneeded !== null) {
            var event = {
                'type': 'upgradeneeded',
                'bubbles': false,
                'cancelable': true,
                'target': {
                    'result': mockIndexedDBDatabase,
                    'transaction': {
                        'abort': function () {
                            mockIndexedDBTestFlags.openDBShouldAbort = true;
                        }
                    }
                }
            };
            this.onupgradeneeded(event);
        }
    },

    'result': mockIndexedDBDatabase
};

var mockIndexedDBDeleteDBRequest = {
    'callSuccessHandler': function () {
        if (this.onsuccess !== null) {
            var event = new CustomEvent("success", {bubbles: false, cancelable: true});
            this.onsuccess(event);
        }
    },

    'callErrorHandler': function () {
        if (this.onerror !== null) {
            var event = {
                'type': 'error',
                'bubbles': true,
                'cancelable': true,
                'target': {
                    'errorCode': 1, // this is a made-up code
                    'error': {
                        'message': 'fail' // this is a made-up message
                    }
                }
            };
            this.onerror(event);
        }
    },

    'callAbortHandler': function () {
        if (this.onblocked !== null) {
            var event = {
                'type': 'error',
                'bubbles': true,
                'cancelable': true,
                'target': {
                    'errorCode': 1, // this is a made-up code
                    'error': {
                        'message': 'fail' // this is a made-up message
                    }
                }
            };
            this.onblocked(event);
        }
    },

    'callBlockedHandler': function () {
        if (this.onabort !== null) {
            var event = {
                'type': 'error',
                'bubbles': true,
                'cancelable': true,
                'target': {
                    'errorCode': 1, // this is a made-up code
                    'error': {
                        'message': 'fail' // this is a made-up message
                    }
                }
            };
            this.onabort(event);
        }
    },

    'result': {}
};

/**
 * this mocks the window.indexedDB object. assuming a method that returns that object, this mock
 * object can be substituted like this:
 *
 * spyOn(service, 'getIndexedDBReference').andReturn(mockIndexedDB);
 */
var mockIndexedDB = {
    'identity': 'mockedIndexDB',

    // note: the mock does not simulate separate stores, so dbname is ignored
    'open': function (dbname, version) {
        if (mockIndexedDBTestFlags.openDBShouldBlock === true) {
            mockIndexedDB_openDBTimer = _setTimeout(function () {
                mockIndexedDBOpenDBRequest.callBlockedHandler();
                mockIndexedDB_openDBBlocked = true;
            }, 20);
        }
        else if (mockIndexedDBTestFlags.openDBShouldAbort === true) {
            mockIndexedDB_openDBTimer = _setTimeout(function () {
                mockIndexedDBOpenDBRequest.callAbortHandler();
                mockIndexedDB_openDBAbort = true;
            }, 20);
        }
        else if (mockIndexedDBTestFlags.upgradeNeeded === true) {
            mockIndexedDB_openDBTimer = _setTimeout(function () {
                mockIndexedDBOpenDBRequest.callUpgradeNeeded();
                mockIndexedDB_openDBUpgradeNeeded = true;
            }, 20);
        }
        // these are order dependent, so we don't have to set so many
        // flags in the test. can leave 'canOpenDB' in its default
        // true state, so long as the other fail vars are checked first.
        else if (mockIndexedDBTestFlags.canOpenDB === true) {
            mockIndexedDB_openDBTimer = _setTimeout(function () {
                mockIndexedDBOpenDBRequest.callSuccessHandler();
                mockIndexedDB_openDBSuccess = true;
            }, 20);
        }
        else {
            mockIndexedDB_openDBTimer = _setTimeout(function () {
                mockIndexedDBOpenDBRequest.callErrorHandler();
                mockIndexedDB_openDBFail = true;
            }, 20);
        }

        return mockIndexedDBOpenDBRequest;
    },

    'deleteDatabase': function (dbname) {
        if (mockIndexedDBTestFlags.canDeleteDB === true) {
            mockIndexedDB_deleteDBTimer = _setTimeout(function () {
                mockIndexedDBDeleteDBRequest.callSuccessHandler();
                mockIndexedDB_deleteDBSuccess = true;
            }, 20);
        }
        else {
            mockIndexedDB_deleteDBTimer = _setTimeout(function () {
                mockIndexedDBDeleteDBRequest.callErrorHandler();
                mockIndexedDB_deleteDBFail = true;
            }, 20);
        }

        return mockIndexedDBDeleteDBRequest;
    }

};

[
    mockIndexedDBCursorRequest,
    mockIndexedDBDeleteDBRequest,
    mockIndexedDBOpenDBRequest,
    mockIndexedDBStoreTransaction,
    mockIndexedDBTransaction
].forEach(syncWrapMethods);
