/**
 * QAdmin v1.2.0 (http://www.qadmin.com/)
 * Copyright 2015-2017 QAdmin Team
 * Licensed under the QAdmin License 1.0 (http://www.qadmin.com/about/#license)
 */
(function(window, document, $){
    "use strict";

    $.components.register("editableTable", {
        mode: "init",
        init: function (context) {
            if (!$.fn.editableTableWidget) {
                return;
            }

            var defaults = $.components.getDefaults("editableTable");

            $('[data-plugin="editableTable"]', context).each(function () {
                var options = $.extend(true, {}, defaults, $(this).data());

                $(this).editableTableWidget(options);
            });
        }
    });
})(window, document, jQuery);