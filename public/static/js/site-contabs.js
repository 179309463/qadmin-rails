/**
 * QAdmin v1.2.0 (http://www.qadmin.com/)
 * Copyright 2015-2017 QAdmin Team
 * Licensed under the QAdmin License 1.0 (http://www.qadmin.com/about/#license)
 */
(function (window, document, $) {
    'use strict';

    $.site.contentTabs = $.site.contentTabs || {
        $instance: $('.site-menu'),
        relative: 0,

        storageKey: 'qadmin.base.contentTabs',
        tabId: 0,
        tabTimeout: 30,

        init: function () {
            this.bind();
            this.getPath();

        },
        containerSize: function(){
        	this.labelWidth = this.$label.width();
            this.view = this.$view.width();
        },
        bind: function () {
            var self = this,
                $navContabs = $(".site-contabs"),
                $navContent = $navContabs.find("ul.con-tabs"),
                $label = this.$label = $navContent.find("li"),
                $view = this.$view = $navContabs.find(".contabs-scroll");

            this.containerSize($label, $view);

            $(document).on('click', 'a[data-pjax]', function (e) {
                var $item = $(this), result,
                    title = $item.text(),
                    href = $item.attr('href');

                title = $.trim(title === '' ? $item.attr('title') : title);
                result = new RegExp(/^([a-zA-z]+:|#|javascript|www\.)/); // 不执行pjax的地址

                if (result.test(href)) {
                    e.preventDefault();
                    return;
                }

                if($.site.tab_style!="iframe"){
                    if ($item.is('[target="_blank"]')) {
                        self.buildTag({name: title, url: $item.attr('href')}, e);
                    }
                }else{
                    var iframe = $item.data('pjax') || '#qadmin-pageContent';
                    if ($item.is('[target="_blank"]') && iframe === '#qadmin-pageContent') {
                        window.history.replaceState && window.history.replaceState(null, '', '#!' + href);
                        self.tabType = true;
                        self.buildTag({
                            name: title,
                            url: href
                        });
                        if (!self.$instance.find($item).length) {
                            self.enable($item.parent());
                        }
                    } else if (!$item.is('[target="_blank"]')) {
                        $(iframe).find('iframe.active').attr('src', href);
                    }
                    e.preventDefault();
                }


            });

            // 标签页的移动  &&  关闭单个标签页
            $navContabs.on('click.site.contabs', 'button.float-left', function () {
                self.labelPosition($navContent, self.labelWidth, "right");
            }).on('click.site.contabs', '.float-right>.btn-icon', function () {
                var content = $navContent.width();

                self.labelPosition($navContent, self.labelWidth, "left", self.view, content);
            }).on('click.site.contabs', 'ul.con-tabs>li', function (e) {
                if($.site.tab_style!="iframe"){
                    var $target = $(e.target),
                        $item = $(this);
                    if ($target.is("i.wb-close-mini") && $item.is(".active")) {
                        self.closeTab($item);

                        return false;
                    } else if ($target.is("i.wb-close-mini")) {
                        self.updateSetting($item.find('a').attr('target'));
                        $item.remove();

                        self.labelSize();
                        self.labelEvent($navContent, 'media');

                        return false;
                    } else if ($item.is(".active")) {
                        return false;
                    } else {
                        $item.siblings("li").removeClass("active");
                        $item.addClass("active");
                        self.checkoutTab($item.find('a'));
                        self.enable($item);
                        return true;
                    }
                }else{
                    var $target = $(e.target),
                        $item = $(this);

                    if ($target.is('i.wb-close-mini')) {
                        self.closeTab($item);
                    } else if (!$item.is('.active')) {
                        $item.siblings('li').removeClass('active');
                        $item.addClass('active');
                        self.checkoutTab($item.find('a'));
                        self.enable($item);
                    }
                    return false;
                }
               
            });

            // 刷新当前 && 关闭其他 && 所有标签页
            $navContabs.on('click.site.contabs', '.float-right a.reload-page', function () {
                var URL = $navContabs.find('ul.con-tabs>li.active>a').attr('href');

                if($.site.tab_style!="iframe"){
                    $.pjax({
                        url: URL,
                        container: '#qadmin-pageContent',
                        replace: true
                    });
                }else{
                    $('#qadmin-pageContent').children('[src="' + URL + '"]').attr('src', URL);
                }                    
            }).on('click.site.contabs', '.float-right a.close-other', function () {
                // if($.site.tab_style!="iframe"){
                //     $navContabs.find('ul.con-tabs>li').filter(function () {
                //         return !$(this).is('.active') && $(this).index() !== 0;
                //     }).remove();
                // }else{
                    $navContabs.find('ul.con-tabs>li').each(function() {
                        var $item = $(this);
                        
                        if (!$item.is('.active') && $item.index() !== 0) {
                            var target = $item.find('a').attr('target');
                            $item.remove();
                            if($.site.tab_style=="iframe"){
                                $('#qadmin-pageContent').children('[name="' + target + '"]').remove();
                            }
                            self.updateSetting(target);
                        }
                    });
                //}

                $navContent.animate({left: 0}, 100);

                self.btnView('hide');
            }).on('click.site.contabs', '.float-right a.close-all', function () {
                var $labels = $navContabs.find('ul.con-tabs>li'),
                    labelsURL = $labels.eq(0).find('a').attr('href');

                // if($.site.tab_style!="iframe"){
                //     $labels.filter(function () {
                //         return $(this).index() !== 0;
                //     }).remove();
                // }else{
                    $labels.each(function() {
                        var $item = $(this);
                       
                        if ($item.index() !== 0) {
                            var target = $item.find('a').attr('target');
                            $item.remove();
                            self.updateSetting(target);
                        }
                    });
                //}

                $navContent.animate({left: 0}, 100);

                self.btnView('hide');

                if($.site.tab_style!="iframe"){
                    $.pjax({
                        url: labelsURL,
                        container: '#qadmin-pageContent',
                        replace: true
                    });
                }

                $labels.eq(0).addClass('active');

                if($.site.tab_style=="iframe"){
                    self.enable($labels.eq(0));
                    self.checkoutTab($labels.eq(0).find('a'));
                    $('#qadmin-pageContent').children(':not(:first)').remove();
                    self.labelSize();
                }
            });

            if($.site.tab_style=="iframe"){
                $(document).on('click', '#qadmin-signOut', function() {
                    $.sessionStorage.remove(self.storageKey);
                });
            }

            // 浏览器窗口大小改变,标签页的对应状态
            $(window).on('resize', this.resize);

        },
        checkoutTab: function(tab) {
            var target = tab.attr('target');
            var title = $.trim(tab.attr('title'));
            var href = tab.attr('href');
            $('title').text(title);
            if($.site.tab_style=="iframe"){
                var content = $('#qadmin-pageContent');
                var iframe = content.children('iframe[name="' + target + '"]');
                if (!this.tabType) {
                    window.history.replaceState && window.history.replaceState(null, '', '#!' + href);
                }
                if (!iframe.attr('src')) {
                    iframe.attr('src', href);
                }
                content.children('.active').removeClass('active');
                iframe.addClass('active');
                $.site.iframeEvents(iframe);
                this.tabType = false;
            }
            this.updateSetting('checked', target);
            
        },
        resize: function(){
            var $navContabs = $(".site-contabs"),
                $navContent = $navContabs.find("ul.con-tabs");

            $.site.contentTabs.throttle(function () {
                $.site.contentTabs.view = $navContabs.find(".contabs-scroll").width();
                $.site.contentTabs.labelEvent($navContent, 'media');
            }, 200)();
        },
        enable: function ($el) {
            //if($.site.tab_style!="iframe"){
                var href = $.trim($el.find('a').attr('href')), tabID,
                    self = this;

                var isOpen = function () {
                    var $navTabs = $('.nav-tabs'), $activeLi;

                    if (self.$instance.parents('div.tab-pane.active').attr('id') !== tabID) {
                        $activeLi = $navTabs.find('a[href="#' + tabID + '"]').parent('li');

                        $('a[href="#' + tabID + '"]').tab('show');
                        $navTabs.find('li').removeClass('active');
                        $activeLi.find('a').addClass('active');
                        if($activeLi.parent('ul').hasClass('dropdown-menu')){
                            $activeLi.closest('.dropdown').addClass('active');
                        }
                    }

                    self.$instance.find('li.has-sub').removeClass('open');
                    self.$instance.find('a').parent('li').removeClass('active');

                    if (self.$instance.find('a[href="' + href + '"]').parents('li').hasClass('has-sub')) {
                        self.$instance.find('a[href="' + href + '"]').parents('li.has-sub').addClass('open');
                    }
                };
                self.$instance.find('a').each(function () {
                    var $item = $(this);
                    if ($item.attr('href') === href) {
                        tabID = $item.parents('.tab-pane').attr('id');
                        isOpen();
                        //$item.parent('li').find('a').addClass('active');
                        return false;
                    }
                });
            // }else{
            //     var href = $.trim($el.find('a').attr('href')),
            //     index = href.indexOf('#'),
            //     hrefWithoutHash = index > 0 ? href.substring(0, index) : href,
            //     link = this.$instance.find('a[href="' + hrefWithoutHash + '"]'),
            //     parents,
            //     linkClosestLiOpenSiblings,
            //     linkClosestSubLiOpenSiblings,
            //     instanceOpenLies,
            //     tabPaneActiveId,
            //     tabPaneId;
            //     if (link.length === 0) {
            //         $.site.menu.refresh();
            //         return;
            //     }
            //     tabPaneActiveId = $.trim(this.$instance.closest('div.tab-pane.active').attr('id'));
            //     tabPaneId = $.trim(link.closest('div.tab-pane').attr('id'));
            //     if (tabPaneActiveId !== tabPaneId) {
            //         $('a[href="#' + tabPaneId + '"]').tab('show');
            //     }
            //     linkClosestLiOpenSiblings = link.closest('li').siblings('li.open');
            //     parents = link.parents('li.has-sub');
            //     linkClosestSubLiOpenSiblings = link.closest('li.has-sub').siblings('li.open');
            //     instanceOpenLies = this.$instance.find('li.open');
            //     this.$instance.find('li.active').trigger('deactive.site.menu');
            //     link.closest('li').trigger('active.site.menu');
            //     if (linkClosestLiOpenSiblings.length) {
            //         linkClosestLiOpenSiblings.trigger('close.site.menu');
            //     }
            //     if (!link.closest('li.has-sub').hasClass('open')) {
            //         if (linkClosestSubLiOpenSiblings.length) {
            //             linkClosestSubLiOpenSiblings.trigger('close.site.menu');
            //         }
            //         if (instanceOpenLies.length) {
            //             instanceOpenLies.not(parents).trigger('close.site.menu');
            //         }
            //         parents.trigger('open.site.menu');
            //     }
            // }
        },
        getPath: function () {
            // if($.site.tab_style!="iframe"){
            //     var pathname = location.pathname,
            //         title = $.trim($('#qadmin-pageContent').find('title').text());

            //     if (pathname !== $.ctx + '/') {
            //         this.buildTag({name: title, url: pathname});
            //     }

            //     $('#qadmin-pageContent').find('title').remove();
            // }else{
                var li = $('#qadmin-siteConTabs').find('li:first > a');
                var setting = this.settings = $.sessionStorage.get(this.storageKey);
                if (setting === null) {
                    setting = $.extend(true, {}, {
                        'iframe-0': {
                            url: li.attr('href'),
                            name: li.text()
                        },
                        checked: li.attr('target'),
                        tabId: this.tabId
                    });
                    this.updateSetting(setting);
                } else {
                    this.tabId = setting.tabId;
                }
            //}
        },
        updateSetting: function(key, value) {
            var setting = $.sessionStorage.get(this.storageKey);
            setting = setting ? setting: {};
            if (typeof key === 'object') {
                $.extend(true, setting, key);
            } else if (!value) {
                delete setting[key];
            } else {
                setting[key] = value;
            }
            $.sessionStorage.set(this.storageKey, setting, this.tabTimeout);
        },
        buildTag: function (opt, event) { // 新建标签页
            if($.site.tab_style!="iframe"){
                var $labelNav = $(".con-tabs");

                if (event && this.checkTags(opt.url)) {
                    event.preventDefault();
                    return;
                }

                opt.name = opt.name === '' ? '无标题' : opt.name;

                $('title').text($.trim(opt.name)); //修改页面标题

                if ($labelNav.find("a[href='" + opt.url + "']").length > 0) {
                    return;
                }

                $labelNav.find("li.active").removeClass("active");

                $labelNav.append('<li class="active"><a data-pjax="#qadmin-pageContent" href="' + opt.url + '" title="' + opt.name + '' +
                    '" rel="contents"><span>' + opt.name + '</span><i class="icon wb-close-mini"></i></a></li>');

                $labelNav.find("li.active").removeClass("active").click().addClass("active");

                this.labelSize();
                this.labelEvent($labelNav, 'media', 'add');

                var tabId = ++this.tabId;
                var target = 'iframe-' + tabId;

                var setting = {};
                setting[target] = {
                    url: opt.url,
                    name: opt.name
                };
                $.extend(setting, {
                    checked: target,
                    tabId: tabId
                });
                this.updateSetting(setting);
            }else{
                var $labelNav = $('.con-tabs');
                var url = opt.url;
                var index = url.indexOf('#');
                var href = index > 0 ? url.substring(0, index) : url;

                if (this.checkTags(href)) {
                    return;
                }

                var tabId = ++this.tabId;
                var target = 'iframe-' + tabId;
                $labelNav.find('li.active').removeClass('active');
                $labelNav.append('<li  class="active"><a href="' + href + '" target="' + target + '" title="' + opt.name + '' + '" rel="contents"><span>' + opt.name + '</span><i class="icon' + ' wb-close-mini">' + '</i></a></li>');
                
                var setting = {};
                setting[target] = {
                    url: href,
                    name: opt.name
                };
                $.extend(setting, {
                    checked: target,
                    tabId: tabId
                });
                this.updateSetting(setting);

                opt.name = opt.name === '' ? '无标题' : opt.name;

                $('title').text($.trim(opt.name));

                var content = $('#qadmin-pageContent');
                var name = 'iframe-' + this.tabId;
                content.children('.active').removeClass('active');
                content.append('<iframe src="' + url + '" frameborder="0" name="' + name + '" class="page-frame animation-fade active"></iframe>');
                var iframe = content.find('iframe[name="' + name + '"]');
                $.site.iframeEvents(iframe);

                this.labelSize();
                this.labelEvent($labelNav, 'media');

                this.tabType = false;
            }
        },
        checkTags: function (url) { // 标签查重
            if($.site.tab_style!="iframe"){
                var $labelNav = $(".con-tabs"),
                    $currentLabel = $labelNav.find("a[href='" + url + "']");

                var content = $(".con-tabs").width();

                if ($currentLabel.length > 0) {
                    if ($currentLabel.closest('li').hasClass('active')) {
                        this.app($labelNav, $currentLabel.closest('li'), this.labelWidth, this.view, content);
                        return true;
                    } else {
                        $labelNav.find("li.active").removeClass("active");
                        $labelNav.find("a[href='" + url + "']").closest("li").addClass("active");
                        this.app($labelNav, $currentLabel.closest('li'), this.labelWidth, this.view, content);
                        return false;
                    }
                } else {
                    return false;
                }
            }else{
                var $labelNav = $('.con-tabs'),
                    $currentLabel = $labelNav.find("a[href='" + url + "']");

                if ($currentLabel.closest('li').hasClass('active')) {
                    return true;
                }
                if ($currentLabel.closest('li').length <= 0) {
                    return false;
                }
                $labelNav.find('li.active').removeClass('active');
                $currentLabel.closest('li').addClass('active');
                this.checkoutTab($currentLabel.closest('li').find('a'));

                this.app($labelNav, $currentLabel.closest('li'), this.labelWidth, this.view, content);
                return true;
            }
        },
        labelSize: function () { // 修改标签页盒子尺寸
            var labelNum, content, $labelNav = $(".con-tabs");

            labelNum = $labelNav.find("li").length;
            content = this.labelWidth * labelNum;
            $labelNav.css("width", content);
        },
        labelEvent: function (doc, media) { // 增删标签页的对应状态
            var content = $(".con-tabs").width();

            if (content > this.view) {
                this.labelPosition(doc, this.labelWidth, "left", this.view, content, media);
                this.btnView('visible');
            } else {
                this.btnView('hide');
            }

            if (this.currentView < this.view || this.currentContent > content) {
                this.labelPosition(doc, this.labelWidth, "right", this.view, content, media);
            }
            this.currentView = this.view;
            this.currentContent = content;
        },
        app: function (doc, $this, width, view, content) {
            var x = doc.position().left,
                prevAll = $this.prevAll('li').length * width,
                nextAll = $this.nextAll('li').length * width;

            if (-prevAll < x) {
                if(prevAll + x < view){
                    return false;
                }

                x =  -(prevAll - view + width);
            }else{
                if (-x < content - nextAll) {
                    return false;
                }

                x = -(content - nextAll - width);
            }

            doc.animate({
                left: x
            }, 100);
        },
        labelPosition: function (doc, width, dir, view, content, media) { // 标签页的位移
            var self = this,
                x = doc.position().left,
                callback = function (x) {
                    var flag = x + width;

                    if (flag > 0) {
                        self.relative = x;
                        return 0;
                    } else {
                        return x;
                    }
                };

            if (dir === "left") {
                if (x <= view - content) {
                    return false;
                }
                if (typeof media !== 'undefined') {
                    x = view - content;
                } else {
                    x = this.relative !== 0 ? x - width + this.relative : x - width;
                    this.relative = 0;
                }
            } else if (dir === "right") {
                if (x === 0) {
                    return false;
                }

                if (typeof media !== 'undefined') {
                    x = content <= view ? 0 : view - content;
                } else {
                    x = callback(x + width);
                }
            }

            doc.animate({
                left: x
            }, 100);
        },
        throttle: function (fn, interval) { // 函数节流操作
            var _fn = fn,
                timer,
                firstTime = true;
            return function () {
                var args = arguments,
                    self = this;

                if (firstTime) {
                    _fn.apply(self, args);
                    firstTime = false;
                }

                if (timer) {
                    return false;
                }

                timer = setTimeout(function () {
                    clearTimeout(timer);
                    timer = null;
                    _fn.apply(self, args);
                }, interval || 500);
            };
        },
        closeTab: function (tab) {
            var target = tab.children('a').attr('target');
            this.updateSetting(target);

            if($.site.tab_style!="iframe"){
                var $navContent = $(".site-contabs ul.con-tabs"),
                    $item = $navContent.find('li.active'), labelsURL;

                this.$instance.find('.active').removeClass('active');

                if ($item.next("li").length > 0) {
                    labelsURL = $item.next("li").find("a").attr("href");

                    $item.next("li").addClass("active");
                } else {
                    labelsURL = $item.prev("li").find("a").attr("href");

                    $item.prev("li").addClass("active");
                }

                $item.remove();
                
                this.labelSize();
                this.labelEvent($navContent, 'media');

                $.pjax({
                    url: labelsURL,
                    container: '#qadmin-pageContent',
                    replace: true
                });

                this.$instance.find("a[href='" + labelsURL + "']").parent('li').addClass('active');
            }else{                 
                if (tab.is('.active')) {
                    var which = '';
                    var nextLi = tab.next('li');
                    if (nextLi.length > 0) {
                        which = nextLi;
                    } else {
                        which = tab.prev('li');
                    }
                    which.addClass('active');
                    this.enable(which);
                    this.checkoutTab(which.find('a'));
                }
                tab.remove();
                $('#qadmin-pageContent').children('[name="' + target + '"]').remove();
                this.labelSize();
                this.labelEvent($('.con-tabs'), 'media');
            }
        },
        btnView: function (status) { // 标签页左右移动按钮状态
            var $siteContabs = $('.site-contabs'),
                $contabsLeftBtn = $siteContabs.children('button.float-left'),
                $contabsRightBtn = $siteContabs.find('.float-right > button.btn-icon');

            if (status === 'visible') {
                $contabsLeftBtn.removeClass('hide');
                $contabsRightBtn.removeClass('hide');
            } else if (status === 'hide') {
                $contabsLeftBtn.addClass('hide');
                $contabsRightBtn.addClass('hide');
            }
        }
    };
})(window, document, jQuery);