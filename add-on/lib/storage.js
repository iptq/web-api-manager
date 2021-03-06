(function () {
    "use strict";

    const rootObject = window.browser || window.chrome;
    const webApiManagerKeySettingsKey = "webApiManager";
    const storageObject = rootObject.storage;

    const get = function (callback) {
        storageObject.sync.get(webApiManagerKeySettingsKey, function (results) {

            let loadedValues = results && results[webApiManagerKeySettingsKey];

            // If there are no currently saved domain rules, then create
            // a stubbed out one, using an empty blocking rule set.
            if (!loadedValues ||
                    !loadedValues.domainRules ||
                    Object.keys(loadedValues.domainRules).length === 0) {

                loadedValues = {
                    domainRules: {
                        "(default)": []
                    },
                    shouldLog: false
                };
            }

            callback(loadedValues);
        });
    };

    const set = function (object, callback) {
        const valueToStore = {};
        valueToStore[webApiManagerKeySettingsKey] = object;
        storageObject.sync.set(valueToStore, callback);
    };

    const onChange = (function () {

        const queue = [];

        storageObject.onChanged.addListener(function (changes) {

            if (changes[webApiManagerKeySettingsKey] === undefined) {
                return;
            }

            const {newValue, oldValue} = changes[webApiManagerKeySettingsKey];

            if (JSON.stringify(newValue) === JSON.stringify(oldValue)) {
                return;
            }

            queue.forEach(function (callback) {
                try {
                    callback(newValue);
                } catch (e) {
                    // Intentionally left blank...
                }
            });
        });

        return function (callback) {
            queue.push(callback);
        };
    }());

    window.WEB_API_MANAGER.storageLib = {
        get,
        set,
        onChange
    };
}());
