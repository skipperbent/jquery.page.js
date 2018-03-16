/**
 * Page.js
 * @author Simon Sessingø
 * @version 1.0.1
 **/
if (typeof($p) === 'undefined') {
    var $p = {};
}

$p.page = function (options) {
    return this.init(options);
};

$p.page.prototype = {
    history: null,
    scriptsBuffer: [],
    options: {
        container: '#content',
        scripts: [],
        styles: [],
        bindings: {
            ready: [],
            preload: [],
            load: [],
            progress: [],
            error: [],
            statechange: [],
            pushstate: []
        },
        events: {
            ready: [],
            preload: [],
            load: [],
            progress: [],
            error: [],
            statechange: [],
            pushstate: []
        }
    },
    init: function (options) {

        var self = this;

        self.options = $.extend(self.options, options);

        self.history = window.History;

        History.Adapter.bind(window, 'statechange', function () {
            var states = History.savedStates;

            self.trigger('statechange', History.getState());

            // Ensure that page reload doesn't trigger events or duplicate reload
            if (states.length > 1 && states[states.length - 2] !== null && states[states.length - 2].url === location.href) {
                return;
            }

            self.load(History.getState().url);
        });

        $(document).ready(function() {
            self.bindForms();
        });

        return this;
    },
    reload: function () {
        this.load(location.href, null, {
            reload: true
        });
    },
    go: function (url, title, data) {
        if(window.location.pathname === url) {
            return this.reload();
        }
        data = (typeof data === 'undefined') ? {} : data;
        title = (typeof title === 'undefined') ? url : title;
        this.trigger('pushstate', data);
        History.pushState(data, title, url);
    },
    back: function () {
        History.back();
    },
    load: function (url, container, settings) {

        var self = this;
        container = (typeof container === 'undefined') ? this.options.container : container;
        settings = (typeof settings === 'undefined') ? {} : settings;

        settings = $.extend({
            url: url,
            success: function (r) {
                $(self.options.container).html(r);
                self.bindForms();
                self.trigger('load', {
                    reload: settings.reload,
                    response: r
                });
            },
            error: function (r) {
                $(self.options.container).html(r);
                self.bindForms();
                self.trigger('error', {
                    response: r
                });
            },
            xhr: function () {
                var xhr = new window.XMLHttpRequest();
                xhr.addEventListener('progress', function (e) {
                    var percentage = e.loaded / e.total;
                    self.trigger('progress', {
                        percentage: percentage,
                        xhr: xhr
                    });
                }, false);

                return xhr;
            },
            timeout: self.options.timeout,
            type: 'get',
            cache: true,
            reload: false
        }, settings);

        self.trigger('preload', {
            url: url,
            container: container,
            ajax: settings
        });

        return $.ajax(settings);
    },
    bindForms: function () {

        var self = this;

        $(this.options.container + ' form:not([data-ajax="false"])').off('submit.page').on('submit.page', function (e) {
            e.preventDefault();

            var form = $(this);
            var action = $(this).attr('action');
            var method = (typeof $(this).attr('method') !== 'undefined') ? $(this).attr('method').toLowerCase() : 'get';

            if (action) {
                var settings = {
                    type: method,
                    data: form.serializeArray()
                };

                var url = action;

                if (method !== 'get') {
                    if (window.FormData !== null) {

                        // Add files to ajax param
                        var formData = new FormData();

                        $.each(form.find("input[type='file']"), function (i, item) {
                            $.each($(item)[0].files, function (i, file) {
                                formData.append($(item).attr('name'), file);
                            });
                        });

                        $.each(settings.data, function (i, val) {
                            formData.append(val.name, val.value);
                        });

                        settings = $.extend(settings, {
                            processData: false,
                            contentType: false,
                            data: formData
                        });
                    }

                    self.load(action, null, settings);

                } else {

                    if (url.indexOf('?') > -1) {
                        url = url.toString().substr(0, url.indexOf('?'));
                    }

                    url += '?' + form.serialize();
                    self.go(url);
                }
            }
        });

        $(this.options.container + ' form button[type="submit"]:not([data-ajax="false"])').on('click.page.submit', function (e) {
            e.preventDefault();
            var form = $(this).parents('form:first');

            var name = $(this).attr('name');
            var value = $(this).attr('value');

            if (name !== null) {
                form.prepend($('<input type="hidden">').attr('name', name).attr('value', value));
            }

            form.trigger('submit');
        });
    },
    trigger: function (name, data) {
        if (this.options.events[name] !== null) {
            for (var i = 0; i < this.options.events[name].length; i++) {
                this.options.events[name][i](data);
            }
        }

        if (this.options.bindings[name] !== null) {
            for (i = 0; i < this.options.bindings[name].length; i++) {
                this.options.bindings[name][i](data);
                this.options.bindings[name].slice(1);
            }

            this.options.bindings[name] = null;
        }
    },
    setTitle: function (title) {
        document.title = title;
    },
    ready: function (callback) {
        return this.bind('ready', callback);
    },
    bind: function(name, callback) {
        if (this.options.bindings[name] === null) {
            this.options.bindings[name] = [callback];
        } else {
            this.options.bindings[name].push(callback);
        }
        return this;
    },
    on: function (name, callback) {
        if (this.options.events[name] === null) {
            this.options.events[name] = [callback];
        } else {
            this.options.events[name].push(callback);
        }
        return this;
    },
    loadStyles: function (urls) {
        var self = this;

        for (var i = 0; i < urls.length; i++) {
            var css = urls[i];

            if ($.inArray(urls, self.options.styles) === -1) {
                $('head').append($('<link rel="stylesheet" type="text/css" />').attr('href', css));
                self.options.styles.push(css);
            }
        }
    },
    loadScripts: function (urls) {
        var self = this;
        var loaded = 0;
        var script = null;

        if (typeof urls !== 'undefined') {
            for (var i = 0; i < urls.length; i++) {
                script = urls[i];

                if ($.inArray(script, self.options.scripts) === -1) {
                    self.scriptsBuffer.push(script);
                    self.options.scripts.push(script);
                }
            }
        }

        if (self.scriptsBuffer.length > 0) {

            script = self.scriptsBuffer[0];
            var myScript = document.createElement('script');
            myScript.src = script;
            myScript.async = true;
            myScript.onload = function () {
                loaded += 1;

                if (loaded >= self.scriptsBuffer.length) {
                    self.scriptsBuffer = [];
                    self.trigger('ready');
                } else {

                    var tmp = [];
                    for (var i = 1; i < self.scriptsBuffer.length; i++) {
                        tmp.push(self.scriptsBuffer[i]);
                    }

                    self.scriptsBuffer = tmp;

                    self.loadScripts(tmp);
                }
            };

            document.body.appendChild(myScript);

        } else {
            self.trigger('ready');
        }
    },
    setScripts: function (scripts) {
        this.options.scripts = scripts;
    },
    setStyles: function (styles) {
        this.options.styles = styles;
    },
    postback: function (el) {
        var form = $(el);

        if (form.find('#postback').length > 0) {
            form.find('#postback').val(1);
        } else {
            form.append('<input type="hidden" name="postback" value="1" id="postback" />');
        }

        form.trigger('submit');
    }
};