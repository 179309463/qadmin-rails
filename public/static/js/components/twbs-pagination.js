/**
 * QAdmin v1.2.0 (http://www.qadmin.com/)
 * Copyright 2015-2017 QAdmin Team
 * Licensed under the QAdmin License 1.0 (http://www.qadmin.com/about/#license)
 */
(function(window, document, $){
    "use strict";

    $.components.register("twbsPagination", {
        mode: "default",
        defaults: {
            first: '<span class="icon fa fa-angle-double-left" title="第一页"></span>',
            prev: '<span class="icon fa fa-angle-left" title="上一页"></span>',
            next: '<span class="icon fa fa-angle-right" title="下一页"></span>',
            last: '<span class="icon fa fa-angle-double-right" title="最后一页"></span>'
        }
    });
})(window, document, jQuery);