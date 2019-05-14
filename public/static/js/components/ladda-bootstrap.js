/**
 * QAdmin v1.2.0 (http://www.qadmin.com/)
 * Copyright 2015-2017 QAdmin Team
 * Licensed under the QAdmin License 1.0 (http://www.qadmin.com/about/#license)
 */
(function(window, document, $){
    "use strict";

    /*global Ladda*/

    $.components.register("ladda", {
        mode: "init",
        defaults: {
            timeout: 2000
        },
        init: function () {
            if (typeof Ladda === "undefined") {
                return;
            }

            var defaults = $.components.getDefaults("ladda");
            Ladda.bind('[data-plugin="ladda"]', defaults);
        }
    });

    $.components.register("laddaProgress", {
        mode: "init",
        defaults: {},
        init: function () {
            if (typeof Ladda === 'undefined') {
                return;
            }

            var defaults = $.components.getDefaults("laddaProgress"),
                options = $.extend({}, defaults, {
                    callback: function (instance) {
                        var progress = 0;
                        var interval = setInterval(function () {
                            progress = Math.min(progress + Math.random() * 0.1, 1);
                            instance.setProgress(progress);

                            if (progress === 1) {
                                instance.stop();
                                clearInterval(interval);
                            }
                        }, 300);
                    }
                });
            Ladda.bind('[data-plugin="laddaProgress"]', options);
        }
    });
})(window, document, jQuery);