/**
 * QAdmin v1.2.0 (http://www.qadmin.com/)
 * Copyright 2015-2017 QAdmin Team
 * Licensed under the QAdmin License 1.0 (http://www.qadmin.com/about/#license)
 */
(function(window, document, $){
    "use strict";

    $.components.register("treegrid", {
        mode: "default",
        defaults: {
            expanderExpandedClass: 'icon wb-triangle-down',
            expanderCollapsedClass: 'icon wb-triangle-right'
        }
    });
})(window, document, jQuery);