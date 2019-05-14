/**
 * QAdmin v1.2.0 (http://www.qadmin.com/)
 * Copyright 2015-2017 QAdmin Team
 * Licensed under the QAdmin License 1.0 (http://www.qadmin.com/about/#license)
 */
(function(window, document, $){
    "use strict";

    $.components.register("masonry", {
        mode: "init",
        defaults: {
            itemSelector: ".masonry-item"
        },
        init: function (context) {
            if (typeof $.fn.masonry === "undefined") {
                return;
            }
            var defaults = $.components.getDefaults('masonry');

            //var callback = function () {
            $('[data-plugin="masonry"]', context).each(function () {
                var $this = $(this),
                    options = $.extend(true, {}, defaults, $this.data());

                $this.masonry(options);
            });
        }
    });
})(window, document, jQuery);