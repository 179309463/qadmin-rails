/**
 * QAdmin v1.2.0 (http://www.qadmin.com/)
 * Copyright 2015-2017 QAdmin Team
 * Licensed under the QAdmin License 1.0 (http://www.qadmin.com/about/#license)
 */
(function (docuemnt, window, $) {
    'use strict';
    
    $.parentFrame = $(window.top.document);
    
    $.leavePage = null; // 离开页面方法

    $.ctx = ''; // 项目名称

    $.configs = $.configs || {}; // 配置基本信息

    $.extend($.configs, {
        _data: {},
        get: function (name) {
            var data = this._data;

            for (var i = 0; i < arguments.length; i++) {
                name = arguments[i];

                data = data[name];
            }

            return data;
        },
        set: function (name, value) {
            this._data[name] = value;
        },
        extend: function (name, options) {
            var value = this.get(name);
            return $.extend(true, value, options);
        }
    });

    $.colors = function (name, level) { // 获取颜色配置信息
        if (!$.configs.colors && typeof $.configs.colors[name] === 'undefined') {
            return null;
        }

        if (level && typeof $.configs.colors[name][level] !== 'undefined') {
            return $.configs.colors[name][level];
        }else{
            return $.configs.colors[name];
        }
    };

    $.po = function (name, options) { // 3rd调用参数
        var defaults = $.components.getDefaults(name);
        return $.extend(true, {}, defaults, options);
    };

    $.objExtend = $.objExtend || {}; // 公用模块对象

    $.extend($.objExtend, {
        _queue: {
            prepare: [],
            run: [],
            complete: []
        },
        run: function () {
            var self = this;
            this.dequeue('prepare', function () {
                self.trigger('before.run', self);
            });

            this.dequeue('run', function () {
                self.dequeue('complete', function () {
                    self.trigger('after.run', self);
                });
            });
        },
        dequeue: function (name, done) { // 队列当前状态离队，进行下一步操作
            var self = this,
                queue = this.getQueue(name),
                fn = queue.shift(),
                next = function () {
                    self.dequeue(name, done);
                };

            if (fn) {
                fn.call(this, next);
            } else if ($.isFunction(done)) {
                done.call(this);
            }
        },
        getQueue: function (name) { // 获取队列状态信息
            if (!$.isArray(this._queue[name])) {
                this._queue[name] = [];
            }

            return this._queue[name];
        },
        extend: function (obj) { // 公用模块对象扩展方法
            $.each(this._queue, function (name, queue) {
                if ($.isFunction(obj[name])) {
                    queue.unshift(obj[name]);

                    delete obj[name];
                }
            });
            $.extend(this, obj);
            return this;
        },
        trigger: function (name, data, $el) { // 离队状态执行动作

            if (typeof name === 'undefined') {
                return;
            }
            if (typeof $el === 'undefined') {
                $el = $("#qadmin-pageContent");
            }

            $el.trigger(name + '.app', data);
        }
    });

    $.components = $.components || {}; // 实现插件的提前检测和调用

    $.extend($.components, {
        _components: {},
        register: function (name, obj) {
            this._components[name] = obj;
        },
        init: function (args, name,context) {
            var self = this, obj;
                args =  args || true;

            if (typeof name === 'undefined') {
                $.each(this._components, function (name) {
                    self.init(args, name);
                });
            } else {
                context = context || document;

                obj = this.get(name);

                if (!obj) {
                    return;
                }

                switch (obj.mode) {
                    case 'default':
                        return this._initDefault(name, context);
                    case 'init':
                        return this._initComponent(obj, context);
                    case 'api':
                        return this._initApi(obj, context,args);
                    default:
                        this._initApi(obj, context,args);
                        this._initComponent(obj, context);
                        return;
                }
            }
        },
        _initDefault: function (name, context) { // jquery 3rd的基本用法
            if (!$.fn[name]) {
                return;
            }

            var defaults = this.getDefaults(name);

            $('[data-plugin=' + name + ']', context).each(function () {
                var $this = $(this),
                    options = $.extend(true, {}, defaults, $this.data());

                $this[name](options);
            });
        },
        _initComponent: function (obj, context) { // jquery 3rd的高级用法
            if ($.isFunction(obj.init)) {
                obj.init.call(obj, context);
            }
        },
        _initApi: function (obj, context, args) { // 其他处理
            if (args && $.isFunction(obj.api)) {
                obj.api.call(obj, context);
            }
        },
        getDefaults: function (name) {
            var component = this.get(name);

            return component && typeof component.defaults !== "undefined" ? component.defaults : {};
        },
        get: function (name) {
            if (typeof this._components[name] !== "undefined") {
                return this._components[name];
            } else {
                console.error('component:' + name + ' 脚本文件没有注册任何信息！');
                return undefined;
            }
        }
    });

    $.sessionStorage = $.sessionStorage || {};
    $.extend($.sessionStorage, {
        'set': function(key, value) {
            if (!sessionStorage) {
                console.error('该浏览器不支持sessionStorage对象');
            }
            if (!key || !value) {
                return null;
            }
            if (typeof value === 'object') {
                value = JSON.stringify(value);
            }
            sessionStorage.setItem(key, value);
        },
        'get': function(key) {
            var value;
            if (!sessionStorage) {
                console.error('该浏览器不支持sessionStorage对象');
            }
            value = sessionStorage.getItem(key);
            if (!value) {
                return null;
            }
            if (typeof value === 'string') {
                value = JSON.parse(value);
            }
            return value;
        },
        'remove': function(key) {
            if (!sessionStorage) {
                console.error('该浏览器不支持sessionStorage对象');
            }
            sessionStorage.removeItem(key);
        }
    });
    /* globals Breakpoints, screenfull*/

    window.Content = $.extend({}, $.objExtend);

    $.site = $.site || {};

    $.extend($.site, {
        tab_style: '',
        run: function () {

            $.site.tab_style = ($(".page-frame").length>0 ? 'iframe' : 'pjax');

            if($.site.tab_style=="iframe"){
                var self = this,
                $content = this.$content = $('#qadmin-pageContent');
                $.content = $.content || {};
                $.extend($.content, {
                    window: function() {
                        var name = $content.find('iframe.active').attr('name');
                        return window.frames[name];
                    },
                    document: function() {
                        var name = $content.find('iframe.active').attr('name');
                        return window.frames[name].document;
                    }
                });
                this.iframeDocument = null;
            }

            $.ctx = $('#qadmin-signOut').data('ctx') || $.ctx;

            function hideNavbar(){
                var $body = $('body');

                $body.addClass('site-navbar-collapsing');
                $('#qadmin-navbarCollapse').collapse('hide');

                setTimeout(function () {
                    $body.removeClass('site-navbar-collapsing');
                }, 10);

                $body.removeClass('site-navbar-collapse-show');
            }

            if (typeof $.site.menu !== 'undefined') {
                $.site.menu.init();
            }

            if (typeof $.site.contentTabs !== 'undefined') {
                $.site.contentTabs.init();
            }

            if($('#qadmin-navMenu').length>0){
                $('#qadmin-navMenu').responsiveHorizontalTabs({ // 导航条响应式
                    tabParentSelector: '#qadmin-navTabs',
                    fnCallback: function (el) {
                        if($('#qadmin-navMenu').is(':visible')) {
                            el.removeClass('is-load');
                        }
                    }
                });
            }

            if (typeof $.site.menubar !== 'undefined') { // 导航条&菜单的响应式工作
                $('.site-menubar').on('changing.site.menubar', function () {
                    var $menubar = $('[data-toggle="menubar"]');

                    $menubar.toggleClass('hided', !$.site.menubar.opened);
                    $menubar.toggleClass('unfolded', !$.site.menubar.folded);
                });

                $.site.menubar.init();

                Breakpoints.on('change', function () {
                    $.site.menubar.change();
                });

                /*
                 *  小屏幕下导航条展开 | 收起按钮
                 *  搜索按钮（href）
                 * */
                $(document).on('click', '[data-toggle="collapse"]', function (e) {
                    var $trigger = $(e.target),
                        href, target, $target;

                    if (!$trigger.is('[data-toggle="collapse"]')) {
                        $trigger = $trigger.parents('[data-toggle="collapse"]');
                    }

                    target = $trigger.attr('data-target') || (href = $trigger.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '');
                    $target = $(target);

                    if ($target.hasClass('navbar-search-overlap')) {
                        $target.find('input').focus();

                        e.preventDefault();
                    } else if ($target.attr('id') === 'qadmin-navbarCollapse') {
                        var isOpen = !$trigger.hasClass('collapsed'),
                            $body = $(document.body);

                        $body.addClass('site-navbar-collapsing');
                        $body.toggleClass('site-navbar-collapse-show', isOpen);

                        if($('#qadmin-navMenu').length>0){
                            $('#qadmin-navMenu').responsiveHorizontalTabs({
                                tabParentSelector: '#qadmin-navTabs',
                                fnCallback: function (el) {
                                    el.removeClass('is-load');
                                }
                            });
                        }

                        setTimeout(function () {
                            $body.removeClass('site-navbar-collapsing');
                        }, 350);
                    }
                });

                $(document).on('click', '[data-toggle="menubar"]', function () { // 菜单展开|收起控制按钮
                    if (Breakpoints.is('xs') && $('body').hasClass('site-menubar-open')){
                        hideNavbar();
                    }

                    $.site.menubar.toggle();
                });

                /*
                 *  菜单收起
                 *  导航条收起
                 * */

                $('.site-page').on('click', '#qadmin-pageContent', function () {
                    if (Breakpoints.is('xs') && $('body').hasClass('site-menubar-open')){
                        $.site.menubar.hide();

                        hideNavbar();
                    }
                });

                // 图标对应菜单展开
                $('#qadmin-navMenu >.nav-tabs >li:not(.no-menu)').on('click', function (e) {
                    if ($(e.target).closest('li').is('.dropdown')) {
                        return;
                    }

                    if (Breakpoints.is('xs')) {
                        $.site.menubar.open();
                    }
                });
            }

            if (typeof screenfull !== 'undefined') { // 全屏模式操作
                $(document).on('click', '[data-toggle="fullscreen"]', function () {
                    if (screenfull.enabled) {
                        screenfull.toggle();
                    }

                    return false;
                });
                if (screenfull.enabled) {
                    document.addEventListener(screenfull.raw.fullscreenchange, function () {
                        $('[data-toggle="fullscreen"]').toggleClass('active', screenfull.isFullscreen);
                    });
                }
            }

            /* 对下拉列表的其他功能 */
            $(document).on('show.bs.dropdown', function (e) {
                var $target = $(e.target), $menu,
                $trigger = e.relatedTarget ? $(e.relatedTarget) : $target.children('[data-toggle="dropdown"]'),
                animation = $trigger.data('animation');

                if (animation) {
                    $menu = $target.children('.dropdown-menu');

                    $menu.addClass('animation-' + animation);

                    $menu.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
                        $menu.removeClass('animation-' + animation);
                    });
                }
            });

            $('[data-toggle="tooltip"]').tooltip({trigger: 'hover'});
            $('[data-toggle="popover"]').popover();

            if($.site.tab_style!="iframe"){
                $.components.init();
                window.Content.run();

                this.theme();
                this.tabsDraw();
                this.pjaxFun();
            }else{
                if (window.localStorage) {
                    this.theme();
                    this.tabsDraw();
                }
                $.components.init();
            }
        },

        theme: function () { // 主题渲染
            if (!window.localStorage) {
                return;
            }

            var $body = $('body'),
                settingsName = 'qadmin.base.skinTools',
                $link = $('#qadmin-siteStyle', $('head')),
                settings = localStorage.getItem(settingsName),
                etx = $link.prop('href').indexOf('?v=') === -1 ? '' : '.min',
                type = $link.data('type');

            if (!settings) {
                return;
            }

            settings = JSON.parse(settings);

            if (settings.themeColor && settings.themeColor !== 'primary') {
                $link.attr('href', '/static/skins/' + $("body").data("theme") + "/" + type + '/' + settings.themeColor + etx + '.css');
            }

            if (settings.sidebar && settings.sidebar === 'site-menubar-light') {
                $('nav.site-menubar').addClass('site-menubar-light');
            }

            if (settings.navbar && settings.navbar !== ''){
                $('.site-navbar').addClass(settings.navbar);
            }

            if (settings.navbarInverse === ''){
                $('.site-navbar').removeClass('navbar-inverse');
            }

            if (settings.menuDisplay && settings.menuDisplay === 'site-menubar-fold') {
                $.site.menubar.fold();

                if (settings.menuTxtIcon && settings.menuTxtIcon === 'site-menubar-keep'){
                    $body.addClass('site-menubar-keep');
                }else{
                    $body.addClass('site-menubar-fold-alt');
                }
            }

            if (settings.tabFlag === '') {
                $body.removeClass('site-contabs-open');
            }

        },

        pjaxFun: function () {
            var $body = $('body');

            $(document).pjax('a[data-pjax]', {replace: true});

            $(document).on('submit', 'form[data-pjax]', function (event) {
                var container = $(this).attr("data-pjax");
                $.pjax.submit(event, container, {replace: true});
            });

            $(document).on('pjax:beforeSend', function(event, xhr, options){
                var url = options.url;
                var parts = url.split("#");
                var part1 = parts[0];
                var part2 = (parts.length==2 ? ("#" + parts[1]) : "");
                var connecter = ""

                if(part1.indexOf("?")==-1){
                    connecter = "?"
                }else{
                    connecter = "&"
                }
                options.url = part1 + connecter + "pjax=true" + part2;
            });

            $(document).on('pjax:start', function () {
                window.onresize = null;
                //window.App = null;
                window.Content = $.extend({}, $.objExtend);

                $("#qadmin-pageContent").off();
                $(window).off('resize');
                if($('#qadmin-navMenu').length>0){
                    $('#qadmin-navMenu').responsiveHorizontalTabs({ // 导航条响应式
                        tabParentSelector: '#qadmin-navTabs',
                        fnCallback: function (el) {
                            if($('#qadmin-navMenu').is(':visible')) {
                                el.removeClass('is-load');
                            }
                        }
                    });
                }
                if (typeof $.site.contentTabs !== 'undefined') {
                    $(window).on('resize', $.site.contentTabs.resize);
                }

                $('head').find('script[pjax-script]').remove();
                $body.addClass("site-page-loading");
                $body.find('script:last').nextAll().remove();
                $body.find('nav:first').prevAll(':not(script)').remove();
                $(document).off('click.site.bootbox', '[data-plugin="bootbox"]');
                $(document).off('click.site.alertify', '[data-plugin="alertify"]');

                //清除body标签上新添加的内联样式
                $('body').removeAttr('style');
                $('html').removeAttr('style');

                if($.isFunction($.leavePage)){
                    $.leavePage();
                    $.leavePage = null;
                }

            });

            $(document).on('pjax:callback', function () {
                $.components.init();
                if (window.Content !== null) {
                    window.Content.run();
                }

                $body.removeClass("site-page-loading");

            });

            $(document).on('pjax:success', function () {
                $('[data-toggle="tooltip"]').tooltip();
                $('[data-toggle="popover"]').popover();

                // 清除控制台console信息
                //console.clear();

                // 给标签也换title
                var $labelNav = $(".con-tabs"),
                    title = $.trim($('title').text()),
                    labelTitle = $.trim($labelNav.find('li.active').text());

                if (title !== labelTitle) {
                    $labelNav.find("li.active span").text(title);
                }

            });
        },

        tabsDraw: function() {
            if (typeof $.site.contentTabs === 'undefined') {
                return
            }
            var self = this;
            var targetUrl;
            var hash = "";
            if($.site.tab_style=="iframe"){
                hash = location.hash.substring(2);
            }else{
                hash = location.pathname;
            }
            var loadIframe = function(key, checked, url) {
                var iframe = self.$content.find('iframe:first');
                if (key === checked || !hash) {
                    targetUrl = url;
                    $('.con-tabs').find('li:first').addClass('active');
                    iframe.attr('src', url);
                    self.iframeEvents(iframe);
                } else {
                    iframe.removeClass('active');
                }
            };
            var loadView = function(key, checked, url) {
                if (key === checked || !hash) {
                    targetUrl = url;
                    $('.con-tabs').find('li:first').addClass('active');
                } else {
                }
            };
            var setting = $.sessionStorage.get('qadmin.base.contentTabs');
            var checked = setting.checked;
            for (var key in setting) {
                var option = setting[key];
                if (key === 'checked' || key === 'tabId') {
                    continue;
                } else if (key === 'iframe-0') {
                    if($.site.tab_style=="iframe"){
                        loadIframe(key, checked, option.url);
                    }else{
                        loadView(key, checked, option.url);
                    }
                    continue;
                }
                var url = option.url;
                var name = option.name;
                var labelHtml = '<a data-pjax="#qadmin-pageContent" href="' + url + '" ' + 'target="' + key + '"' + '" title="' + name + '' + '" rel="contents"><span>' + name + '</span><i class="icon' + ' wb-close-mini">' + '</i></a></li>';
                var iframeHtml;
                if (key === checked && hash) {
                    targetUrl = url;
                    labelHtml = '<li class="active">' + labelHtml + '</li>';
                    iframeHtml = '<iframe src="' + url + '" frameborder="0" name="' + key + '" class="page-frame animation-fade active"></iframe>';
                } else {
                    labelHtml = '<li>' + labelHtml + '</li>';
                    iframeHtml = '<iframe src="" frameborder="0" name="' + key + '" class="page-frame animation-fade"></iframe>';
                }
                $('.con-tabs').append(labelHtml);
                if($.site.tab_style=="iframe"){
                    self.$content.append(iframeHtml);
                    if (key === checked && hash) {
                        var iframe = self.$content.find("iframe.active");
                        self.iframeEvents(iframe);
                    }
                }
                
            }
            if($.site.tab_style=="iframe"){
                if (hash !== targetUrl && hash) {
                    var title = '未知页面';
                    $('.site-menu a').each(function() {
                        var that = $(this);
                        if (that.attr('href') === hash) {
                            title = $.trim(that.attr('title') || that.text());
                            return ! [];
                        }
                    });
                    $.site.contentTabs.buildTag({
                        'name': title,
                        'url': hash
                    });
                }
            }
            $.site.contentTabs.enable($('.con-tabs').find('.active'));
            if (Object.keys(setting).length >= 0x13) {
                $.site.contentTabs.labelSize();
                $.site.contentTabs.labelEvent($('.con-tabs'), 'media');
            }
        },
        
        iframeEvents: function(iframe) {
            var self = this,
            loadStyles = function(iframeDocument) {
                //$('#qadmin-siteStyle', iframeDocument).load(function() {
                    var style = $('#qadmin-siteStyle', self.iframeDocument);
                    var href = style.prop('href');
                    if(href){
                        var min = href.indexOf('?v=') === -1 ? '': '.min';
                        var type = style.data("type");
                        if (self.themeColor && self.themeColor !== 'primary') {
                            style.attr('href', '/public/static/skins/' + $("body").data("theme") + "/" + type + '/' + self.themeColor + '/site' + min + '.css');
                        }
                    }
                //});
            },
            loadIframe = function() {
                var iframeDocument = self.iframeDocument = $.content.document();
                $(iframeDocument).on('click', function() {
                    if (Breakpoints.is('xs') && $('body').hasClass('site-menubar-open')) {
                        $.site.menubar.hide();
                        //self._hideNavbar();
                    }
                    $('.dropdown-menu.show').removeClass('show');
                });
                loadStyles(iframeDocument);
            };
            if(iframe[0].attachEvent) {
                iframe[0].attachEvent("onload", loadIframe);
            } else {
                iframe[0].onload = loadIframe;
            }
        }
    });

    $(document).ready(function () {
        $.site.run();
    });

    $.configs.set('site', {
        fontFamily: '"Helvetica Neue", Helvetica, Tahoma, Arial, "Microsoft Yahei", "Hiragino Sans GB", "WenQuanYi Micro Hei", sans-serif'
    });

    $.configs.colors = {
        "red": {
            "100": "#ffdbdc",
            "200": "#ffbfc1",
            "300": "#ffbfc1",
            "400": "#ff8589",
            "500": "#ff666b",
            "600": "#ff4c52",
            "700": "#f2353c",
            "800": "#e62020",
            "900": "#d60b0b"
        },
        "pink": {
            "100": "#ffd9e6",
            "200": "#ffbad2",
            "300": "#ff9ec0",
            "400": "#ff7daa",
            "500": "#ff5e97",
            "600": "#f74584",
            "700": "#eb2f71",
            "800": "#e6155e",
            "900": "#d10049"
        },
        "purple": {
            "100": "#eae1fc",
            "200": "#d9c7fc",
            "300": "#c8aefc",
            "400": "#b693fa",
            "500": "#a57afa",
            "600": "#9463f7",
            "700": "#8349f5",
            "800": "#7231f5",
            "900": "#6118f2"
        },
        "indigo": {
            "100": "#e1e4fc",
            "200": "#c7cffc",
            "300": "#afb9fa",
            "400": "#96a3fa",
            "500": "#7d8efa",
            "600": "#667afa",
            "700": "#4d64fa",
            "800": "#364ff5",
            "900": "#1f3aed"
        },
        "blue": {
            "100": "#d9e9ff",
            "200": "#b8d7ff",
            "300": "#99c5ff",
            "400": "#79b2fc",
            "500": "#589ffc",
            "600": "#3e8ef7",
            "700": "#247cf0",
            "800": "#0b69e3",
            "900": "#0053bf"
        },
        "cyan": {
            "100": "#c2f5ff",
            "200": "#9de6f5",
            "300": "#77d9ed",
            "400": "#54cbe3",
            "500": "#28c0de",
            "600": "#0bb2d4",
            "700": "#0099b8",
            "800": "#007d96",
            "900": "#006275"
        },
        "teal": {
            "100": "#c3f7f2",
            "200": "#92f0e6",
            "300": "#6be3d7",
            "400": "#45d6c8",
            "500": "#28c7b7",
            "600": "#17b3a3",
            "700": "#089e8f",
            "800": "#008577",
            "900": "#00665c"
        },
        "green": {
            "100": "#c2fadc",
            "200": "#99f2c2",
            "300": "#72e8ab",
            "400": "#49de94",
            "500": "#28d17c",
            "600": "#11c26d",
            "700": "#05a85c",
            "800": "#008c4d",
            "900": "#006e3c"
        },
        "light-green": {
            "100": "#dcf7b0",
            "200": "#c3e887",
            "300": "#add966",
            "400": "#94cc39",
            "500": "#7eb524",
            "600": "#6da611",
            "700": "#5a9101",
            "800": "#4a7800",
            "900": "#3a5e00"
        },
        "yellow": {
            "100": "#fff6b5",
            "200": "#fff39c",
            "300": "#ffed78",
            "400": "#ffe54f",
            "500": "#ffdc2e",
            "600": "#ffcd17",
            "700": "#fcb900",
            "800": "#faa700",
            "900": "#fa9600"
        },
        "orange": {
            "100": "#ffe1c4",
            "200": "#ffc894",
            "300": "#fab06b",
            "400": "#fa983c",
            "500": "#f57d1b",
            "600": "#eb6709",
            "700": "#de4e00",
            "800": "#b53f00",
            "900": "#962d00"
        },
        "brown": {
            "100": "#f5e2da",
            "200": "#e0cdc5",
            "300": "#cfb8b0",
            "400": "#bda299",
            "500": "#ab8c82",
            "600": "#997b71",
            "700": "#82675f",
            "800": "#6b534c",
            "900": "#57403a"
        },
        "grey": {
            "100": "#fafafa",
            "200": "#eeeeee",
            "300": "#e0e0e0",
            "400": "#bdbdbd",
            "500": "#9e9e9e",
            "600": "#757575",
            "700": "#616161",
            "800": "#424242"
        },
        "blue-grey": {
            "100": "#f3f7f9",
            "200": "#e4eaec",
            "300": "#ccd5db",
            "400": "#a3afb7",
            "500": "#76838f",
            "600": "#526069",
            "700": "#37474f",
            "800": "#263238"
        }
    };

    var isIE = (function () { // 检查IE
        if (!!window.ActiveXObject || "ActiveXObject" in window){
            return true;
        }else{
            return false;
        }
    });

    if(isIE){
        $.ajaxSetup({
            cache: false
        });
    }

    
    
    /*公用模块对象*/
    window.app = {
        handleSlidePanel: function () {
            if (typeof $.slidePanel === 'undefined') {
                return;
            }
            var $content = $("#qadmin-pageContent");
            $content.on('click', '[data-toggle=slidePanel]', function (e) {
                $.slidePanel.show({
                    url: $(this).data('url'),
                    settings: {
                        cache: false
                    }
                }, $.po('slidePanel', {
                    template: function (options) {
                        return '<div class="' + options.classes.base + ' ' + options.classes.base + '-' + options.direction + '">' +
                            '<div class="' + options.classes.base + '-scrollable"><div>' +
                            '<div class="' + options.classes.content + '"></div>' +
                            '</div></div>' +
                            '<div class="' + options.classes.base + '-handler"></div>' +
                            '</div>';
                    },
                    afterLoad: function () {
                        this.$panel.find('.' + this.options.classes.base + '-scrollable')
                            .slimScroll($.po('slimScroll'));
                    }
                }));

                e.stopPropagation();
            });
        },
        handleMultiSelect: function () {
            var $all = $('.select-all');
            var $content = $("#qadmin-pageContent");
            $content.on('change', '.multi-select', function (e, isSelectAll) {
                if (isSelectAll) {
                    return;
                }

                var $select = $('.multi-select'),
                    total = $select.length,
                    checked = $select.find('input:checked').length;
                if (total === checked) {
                    $all.find('input').prop('checked', true);
                } else {
                    $all.find('input').prop('checked', false);
                }
            });

            $all.on('change', function () {
                var checked = $(this).find('input').prop('checked');

                $('.multi-select input').each(function () {
                    $(this).prop('checked', checked).trigger('change', [true]);
                });

            });
        },
        handleListActions: function () { // 操作主体部分，左侧菜单编辑
            var $content = $("#qadmin-pageContent");
            $content.on('keydown', '.list-editable [data-bind]', function (event) {
                var keycode = (event.keyCode ? event.keyCode : event.which);

                if (keycode === 13 || keycode === 27) {
                    var $input = $(this),
                        bind = $input.data('bind'),
                        $list = $input.parents('.list-group-item'),
                        $content = $list.find('.list-content'),
                        $editable = $list.find('.list-editable'),
                        $update = bind ? $list.find(bind) : $list.find('.list-text');

                    if (keycode === 13) {
                        $update.html($input.val());
                    } else {
                        $input.val($update.text());
                    }

                    $content.show();
                    $editable.hide();
                }
            });

            $content.on('click', '[data-toggle="list-editable-close"]', function () {
                var $btn = $(this),
                    $list = $btn.parents('.list-group-item'),
                    $content = $list.find('.list-content'),
                    $editable = $list.find('.list-editable');

                $content.show();
                $editable.hide();
            });
        },
        pageAside: function () {
            var pageAside = $(".page-aside"),
                isOpen = pageAside.hasClass('open');

            pageAside.toggleClass('open', !isOpen);
        },
        run: function () {
            var $content = $("#qadmin-pageContent");
            // 小屏下侧边栏滚动
            $content.on('click', '.page-aside-switch', function (e) {
                window.app.pageAside();
                e.stopPropagation();
            });

        }
    };

    window.App = $.extend({}, $.objExtend);
    window.App.extend(window.app);
})(document, window, jQuery);