/**
 * QAdmin v1.2.0 (http://www.qadmin.com/)
 * Copyright 2015-2017 QAdmin Team
 * Licensed under the QAdmin License 1.0 (http://www.qadmin.com/about/#license)
 */
(function(window, document, $){
    "use strict";

    $.components.register("TouchSpin", {
        mode: "default",
        defaults: {
            verticalupclass: "wb-plus",
            verticaldownclass: "wb-minus",
            buttondown_class: "btn btn-outline btn-default",
            buttonup_class: "btn btn-outline btn-default"
        }
    });
})(window, document, jQuery);