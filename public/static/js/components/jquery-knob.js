/**
 * QAdmin v1.2.0 (http://www.qadmin.com/)
 * Copyright 2015-2017 QAdmin Team
 * Licensed under the QAdmin License 1.0 (http://www.qadmin.com/about/#license)
 */
(function(window, document, $){
    "use strict";

    $.components.register("knob", {
        mode: "default",
        defaults: {
            min: -50,
            max: 50,
            width: 120,
            height: 120,
            thickness: ".1"
        }
    });
})(window, document, jQuery);