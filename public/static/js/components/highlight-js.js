/**
 * QAdmin v1.2.0 (http://www.qadmin.com/)
 * Copyright 2015-2017 QAdmin Team
 * Licensed under the QAdmin License 1.0 (http://www.qadmin.com/about/#license)
 */
(function(window, document, $){
    "use strict";

    $.components.register("highlight", {
        mode: "init",
        defaults: {},
        init: function (context) {
            if (typeof hljs === "undefined") {
                return;
            }

            $('[data-plugin="highlight"]', context).each(function (i, block) {
                hljs.highlightBlock(block);
            });
        }
    });
})(window, document, jQuery);