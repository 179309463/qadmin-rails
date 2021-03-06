/**
 * QAdmin v1.2.0 (http://www.qadmin.com/)
 * Copyright 2015-2017 QAdmin Team
 * Licensed under the QAdmin License 1.0 (http://www.qadmin.com/about/#license)
 */
(function(window, document, $){
    "use strict";

    $.components.register("input-group-file", {
        api: function () {
            $(document).on("change", ".input-group-file [type=file]", function () {
                var $this = $(this);
                var $text = $(this).parents('.input-group-file').find('.form-control');
                var value = "";

                $.each($this[0].files, function (i, file) {
                    value += file.name + ", ";
                });
                value = value.substring(0, value.length - 2);

                $text.val(value);
            });
        }
    });
})(window, document, jQuery);