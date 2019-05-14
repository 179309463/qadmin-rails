/**
 * QAdmin v1.2.0 (http://www.qadmin.com/)
 * Copyright 2015-2017 QAdmin Team
 * Licensed under the QAdmin License 1.0 (http://www.qadmin.com/about/#license)
 */
(function(window, document, $){
    "use strict";

    $.components.register("card", {
        mode: "init",
        defaults: {},
        init: function (context) {
            if (!$.fn.card) {
                return;
            }
            var defaults = $.components.getDefaults("card");

            $('[data-plugin="card"]', context).each(function () {
                var options = $.extend({}, defaults, $(this).data());

                if (options.target) {
                    options.container = $(options.target);
                }
                $(this).card(options);
            });
        }
    });
})(window, document, jQuery);