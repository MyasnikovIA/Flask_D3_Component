(function(){

Form = {};
if (!Number.prototype.toLocaleString) {
    Number.prototype.toLocaleString = function () {
        return String(this);
    };
}

if (typeof Number.isFinite !== 'function') {
    Number.isFinite = function isFinite(value) {
        // 1. If Type(number) is not Number, return false.
        if (typeof value !== 'number') {
            return false;
        }
        // 2. If number is NaN, +?, or ??, return false.
        if (value !== value || value === Infinity || value === -Infinity) {
            return false;
        }
        // 3. Otherwise, return true.
        return true;
    };
}
(function () {
    if(typeof window.Promise != 'function'){
        /**
         * @description Core Внутренние работы обещаний.
         * @param {function}
         **/
        function Promise(resolver){
            var fulFilleds = [];
            var reJecteds = [];
            this.result = null;
            this.reason = null;
            if(typeof resolver == 'function'){
                resolver(function(_value){
                    this.result = _value;
                    for(var i = 0, len = fulFilleds.length ; i < len ; i++){
                        try{
                            var res = fulFilleds[i]['FulFilled'](_value);
                            fulFilleds[i]['deferred'].resolve(res);
                        }catch (e) {
                            fulFilleds[i]['deferred'].reject(e);
                        }
                    }
                },function(_reason){
                    if (typeof _reason != 'undefined') {
                        this.reason = _reason;
                        for(var i = 0, len = reJecteds.length ; i < len ; i++){
                            try{
                                var res = reJecteds[i]['Rejected'](_reason);
                                reJecteds[i]['deferred'].resolve(res);
                            }catch (e) {
                                reJecteds[i]['deferred'].reject(e);
                            }
                        }
                    }
                });
            }
            this.then = function(onFulfilled,onRejected){
                var deferred = new Deferred();
                var promise = deferred.promise();
                if(typeof onFulfilled == 'function'){
                    fulFilleds.push({
                        'FulFilled' : onFulfilled,
                        'deferred' : deferred
                    })
                }
                if(typeof onRejected == 'function'){
                    reJecteds.push({
                        'Rejected' : onRejected,
                        'deferred' : deferred
                    });
                }
                if(this.result && onFulfilled){
                    try{
                        var result = onFulfilled(this.result);
                        deferred.resolve(result);
                    }catch (e) {
                        deferred.reject(e);
                    }
                }
                if(this.reason && onRejected){
                    try{
                        var result = onRejected(this.reason);
                        deferred.resolve(result);
                    }catch (e) {
                        deferred.reject(e);
                    }
                }
                return promise;
            }
            this.otherwise = function(onRejected){
                return this.then(null,onRejected);
            }
        }
        /**
         * @description Core внутренние работы отложенной функции.
         *
         **/
        function Deferred (){
            var promise = null;
            var resolveCallback = null;
            var rejectCallback = null;
            this.promise = function(){
                if(!promise){
                    promise = new Promise(function(_resolve, _reject){
                        resolveCallback = _resolve;
                        rejectCallback = _reject;
                    });
                }
                return promise;
            }
            this.resolve = function(_value){
                resolveCallback.call(promise,_value);
            }
            this.reject = function(_value){
                rejectCallback.call(promise,_value);
            }
        };

        /**
         * @description Объект для отложенных и асинхронных вычислений.
         * https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Promise
         * @param {function} Функция выполнения
         * @return {Object} объет промис
         **/
        window.Promise = function(executor){
            var deferred = new Deferred();
            var promise = deferred.promise();
            if(typeof executor == 'function'){
                executor(deferred.resolve,deferred.reject);
            }
            return promise;
        };
        /**
         * @description Возвращает обещание, которое выполнится тогда, когда будут выполнены все обещания, переданные в виде перечисляемого аргумента, или отклонено любое из переданных обещаний.
         * https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Promise/all
         * @return {Object} объет промис
         **/
        window.Promise.all = function(){
            var args = arguments;
            var fulFilleds = [];
            var reJecteds = [];
            var promise = new this(function(resolve,reject){
                for(var i = 0,len = args.length ; i < len ; i++){
                    if(args[i] instanceof Promise){
                        args[i].then(function(_value){
                            fulFilleds.push(_value);
                        },function(_reason){
                            reJecteds.push(_reason);
                        });
                    }else{
                        fulFilleds.push(args[i]);
                    }
                }
                if(reJecteds.length > 0){
                    reject(reJecteds);
                }else{
                    resolve(fulFilleds);
                }
            });

            return promise;
        };
        /**
         * @description возвращает Promise выполненый с переданным значением.
         * https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Promise/resolve
         * @return {Object} объет промис
         **/
        window.Promise.resolve = function (_value) {
            return new this(function(resolve,reject){
                resolve(_value);
            });
        };
        /**
         * @description возвращает Promise, который был отклонен по указанной причине.
         * https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Promise/reject
         * @return {Object} объет промис
         **/
        window.Promise.reject = function(_reason){
            return new this(function(resolve,reject){
                reject(_reason);
            });
        };
        /**
         * @description Возвращает обещание, которое было выполнено после того, как все обещания были выполнены или отклонены, и содержит массив объектов с описанием результата каждого обещания.
         * https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled
         * @return {Object} объет промис
         **/
        window.Promise.allSettled = function(iterable){
            var res = [];
            return new this(function(resolve){
                if(iterable instanceof Array){
                    for(var i = 0,len = resolve.length ; i < len ; i++){
                        if(resolve[i] instanceof Promise){
                            resolve[i].then(function(_val){
                                res.push({
                                    'status' : 'fulfilled',
                                    'value' : _val
                                });
                            },function(_reason){
                                res.push({
                                    'status' : 'rejected',
                                    'value' : _reason
                                });
                            })
                        }else{
                            res.push({
                                'status' : 'fulfilled',
                                'value' : resolve[i]
                            });
                        }
                    }
                    resolve(res);
                }
            });
        };
    }

    if (typeof window.CustomEvent === 'function') {
        return false;
    }

    function CustomEvent(name, params) {
        params = params || { bubbles: false, cancelable: false, detail: undefined };

        var event = document.createEvent('CustomEvent');
        event.initCustomEvent(name, params.bubbles, params.cancelable, params.detail);
        return event;
    }

    CustomEvent.prototype = window.Event.prototype;

    window.CustomEvent = CustomEvent;
})();/*!
 * clipboard.js v1.7.1
 * https://zenorocha.github.io/clipboard.js
 *
 * Licensed MIT © Zeno Rocha
 */
!function(t){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=t();else if("function"==typeof define&&define.amd)define([],t);else{var e;e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this,e.Clipboard=t()}}(function(){var t,e,n;return function t(e,n,o){function i(a,c){if(!n[a]){if(!e[a]){var l="function"==typeof require&&require;if(!c&&l)return l(a,!0);if(r)return r(a,!0);var s=new Error("Cannot find module '"+a+"'");throw s.code="MODULE_NOT_FOUND",s}var u=n[a]={exports:{}};e[a][0].call(u.exports,function(t){var n=e[a][1][t];return i(n||t)},u,u.exports,t,e,n,o)}return n[a].exports}for(var r="function"==typeof require&&require,a=0;a<o.length;a++)i(o[a]);return i}({1:[function(t,e,n){function o(t,e){for(;t&&t.nodeType!==i;){if("function"==typeof t.matches&&t.matches(e))return t;t=t.parentNode}}var i=9;if("undefined"!=typeof Element&&!Element.prototype.matches){var r=Element.prototype;r.matches=r.matchesSelector||r.mozMatchesSelector||r.msMatchesSelector||r.oMatchesSelector||r.webkitMatchesSelector}e.exports=o},{}],2:[function(t,e,n){function o(t,e,n,o,r){var a=i.apply(this,arguments);return t.addEventListener(n,a,r),{destroy:function(){t.removeEventListener(n,a,r)}}}function i(t,e,n,o){return function(n){n.delegateTarget=r(n.target,e),n.delegateTarget&&o.call(t,n)}}var r=t("./closest");e.exports=o},{"./closest":1}],3:[function(t,e,n){n.node=function(t){return void 0!==t&&t instanceof HTMLElement&&1===t.nodeType},n.nodeList=function(t){var e=Object.prototype.toString.call(t);return void 0!==t&&("[object NodeList]"===e||"[object HTMLCollection]"===e)&&"length"in t&&(0===t.length||n.node(t[0]))},n.string=function(t){return"string"==typeof t||t instanceof String},n.fn=function(t){return"[object Function]"===Object.prototype.toString.call(t)}},{}],4:[function(t,e,n){function o(t,e,n){if(!t&&!e&&!n)throw new Error("Missing required arguments");if(!c.string(e))throw new TypeError("Second argument must be a String");if(!c.fn(n))throw new TypeError("Third argument must be a Function");if(c.node(t))return i(t,e,n);if(c.nodeList(t))return r(t,e,n);if(c.string(t))return a(t,e,n);throw new TypeError("First argument must be a String, HTMLElement, HTMLCollection, or NodeList")}function i(t,e,n){return t.addEventListener(e,n),{destroy:function(){t.removeEventListener(e,n)}}}function r(t,e,n){return Array.prototype.forEach.call(t,function(t){t.addEventListener(e,n)}),{destroy:function(){Array.prototype.forEach.call(t,function(t){t.removeEventListener(e,n)})}}}function a(t,e,n){return l(document.body,t,e,n)}var c=t("./is"),l=t("delegate");e.exports=o},{"./is":3,delegate:2}],5:[function(t,e,n){function o(t){var e;if("SELECT"===t.nodeName)t.focus(),e=t.value;else if("INPUT"===t.nodeName||"TEXTAREA"===t.nodeName){var n=t.hasAttribute("readonly");n||t.setAttribute("readonly",""),t.select(),t.setSelectionRange(0,t.value.length),n||t.removeAttribute("readonly"),e=t.value}else{t.hasAttribute("contenteditable")&&t.focus();var o=window.getSelection(),i=document.createRange();i.selectNodeContents(t),o.removeAllRanges(),o.addRange(i),e=o.toString()}return e}e.exports=o},{}],6:[function(t,e,n){function o(){}o.prototype={on:function(t,e,n){var o=this.e||(this.e={});return(o[t]||(o[t]=[])).push({fn:e,ctx:n}),this},once:function(t,e,n){function o(){i.off(t,o),e.apply(n,arguments)}var i=this;return o._=e,this.on(t,o,n)},emit:function(t){var e=[].slice.call(arguments,1),n=((this.e||(this.e={}))[t]||[]).slice(),o=0,i=n.length;for(o;o<i;o++)n[o].fn.apply(n[o].ctx,e);return this},off:function(t,e){var n=this.e||(this.e={}),o=n[t],i=[];if(o&&e)for(var r=0,a=o.length;r<a;r++)o[r].fn!==e&&o[r].fn._!==e&&i.push(o[r]);return i.length?n[t]=i:delete n[t],this}},e.exports=o},{}],7:[function(e,n,o){!function(i,r){if("function"==typeof t&&t.amd)t(["module","select"],r);else if(void 0!==o)r(n,e("select"));else{var a={exports:{}};r(a,i.select),i.clipboardAction=a.exports}}(this,function(t,e){"use strict";function n(t){return t&&t.__esModule?t:{default:t}}function o(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}var i=n(e),r="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},a=function(){function t(t,e){for(var n=0;n<e.length;n++){var o=e[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(t,o.key,o)}}return function(e,n,o){return n&&t(e.prototype,n),o&&t(e,o),e}}(),c=function(){function t(e){o(this,t),this.resolveOptions(e),this.initSelection()}return a(t,[{key:"resolveOptions",value:function t(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};this.action=e.action,this.container=e.container,this.emitter=e.emitter,this.target=e.target,this.text=e.text,this.trigger=e.trigger,this.selectedText=""}},{key:"initSelection",value:function t(){this.text?this.selectFake():this.target&&this.selectTarget()}},{key:"selectFake",value:function t(){var e=this,n="rtl"==document.documentElement.getAttribute("dir");this.removeFake(),this.fakeHandlerCallback=function(){return e.removeFake()},this.fakeHandler=this.container.addEventListener("click",this.fakeHandlerCallback)||!0,this.fakeElem=document.createElement("textarea"),this.fakeElem.style.fontSize="12pt",this.fakeElem.style.border="0",this.fakeElem.style.padding="0",this.fakeElem.style.margin="0",this.fakeElem.style.position="absolute",this.fakeElem.style[n?"right":"left"]="-9999px";var o=window.pageYOffset||document.documentElement.scrollTop;this.fakeElem.style.top=o+"px",this.fakeElem.setAttribute("readonly",""),this.fakeElem.value=this.text,this.container.appendChild(this.fakeElem),this.selectedText=(0,i.default)(this.fakeElem),this.copyText()}},{key:"removeFake",value:function t(){this.fakeHandler&&(this.container.removeEventListener("click",this.fakeHandlerCallback),this.fakeHandler=null,this.fakeHandlerCallback=null),this.fakeElem&&(this.container.removeChild(this.fakeElem),this.fakeElem=null)}},{key:"selectTarget",value:function t(){this.selectedText=(0,i.default)(this.target),this.copyText()}},{key:"copyText",value:function t(){var e=void 0;try{e=document.execCommand(this.action)}catch(t){e=!1}this.handleResult(e)}},{key:"handleResult",value:function t(e){this.emitter.emit(e?"success":"error",{action:this.action,text:this.selectedText,trigger:this.trigger,clearSelection:this.clearSelection.bind(this)})}},{key:"clearSelection",value:function t(){this.trigger&&this.trigger.focus(),window.getSelection().removeAllRanges()}},{key:"destroy",value:function t(){this.removeFake()}},{key:"action",set:function t(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"copy";if(this._action=e,"copy"!==this._action&&"cut"!==this._action)throw new Error('Invalid "action" value, use either "copy" or "cut"')},get:function t(){return this._action}},{key:"target",set:function t(e){if(void 0!==e){if(!e||"object"!==(void 0===e?"undefined":r(e))||1!==e.nodeType)throw new Error('Invalid "target" value, use a valid Element');if("copy"===this.action&&e.hasAttribute("disabled"))throw new Error('Invalid "target" attribute. Please use "readonly" instead of "disabled" attribute');if("cut"===this.action&&(e.hasAttribute("readonly")||e.hasAttribute("disabled")))throw new Error('Invalid "target" attribute. You can\'t cut text from elements with "readonly" or "disabled" attributes');this._target=e}},get:function t(){return this._target}}]),t}();t.exports=c})},{select:5}],8:[function(e,n,o){!function(i,r){if("function"==typeof t&&t.amd)t(["module","./clipboard-action","tiny-emitter","good-listener"],r);else if(void 0!==o)r(n,e("./clipboard-action"),e("tiny-emitter"),e("good-listener"));else{var a={exports:{}};r(a,i.clipboardAction,i.tinyEmitter,i.goodListener),i.clipboard=a.exports}}(this,function(t,e,n,o){"use strict";function i(t){return t&&t.__esModule?t:{default:t}}function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function a(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!e||"object"!=typeof e&&"function"!=typeof e?t:e}function c(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e)}function l(t,e){var n="data-clipboard-"+t;if(e.hasAttribute(n))return e.getAttribute(n)}var s=i(e),u=i(n),f=i(o),d="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},h=function(){function t(t,e){for(var n=0;n<e.length;n++){var o=e[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(t,o.key,o)}}return function(e,n,o){return n&&t(e.prototype,n),o&&t(e,o),e}}(),p=function(t){function e(t,n){r(this,e);var o=a(this,(e.__proto__||Object.getPrototypeOf(e)).call(this));return o.resolveOptions(n),o.listenClick(t),o}return c(e,t),h(e,[{key:"resolveOptions",value:function t(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};this.action="function"==typeof e.action?e.action:this.defaultAction,this.target="function"==typeof e.target?e.target:this.defaultTarget,this.text="function"==typeof e.text?e.text:this.defaultText,this.container="object"===d(e.container)?e.container:document.body}},{key:"listenClick",value:function t(e){var n=this;this.listener=(0,f.default)(e,"click",function(t){return n.onClick(t)})}},{key:"onClick",value:function t(e){var n=e.delegateTarget||e.currentTarget;this.clipboardAction&&(this.clipboardAction=null),this.clipboardAction=new s.default({action:this.action(n),target:this.target(n),text:this.text(n),container:this.container,trigger:n,emitter:this})}},{key:"defaultAction",value:function t(e){return l("action",e)}},{key:"defaultTarget",value:function t(e){var n=l("target",e);if(n)return document.querySelector(n)}},{key:"defaultText",value:function t(e){return l("text",e)}},{key:"destroy",value:function t(){this.listener.destroy(),this.clipboardAction&&(this.clipboardAction.destroy(),this.clipboardAction=null)}}],[{key:"isSupported",value:function t(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:["copy","cut"],n="string"==typeof e?[e]:e,o=!!document.queryCommandSupported;return n.forEach(function(t){o=o&&!!document.queryCommandSupported(t)}),o}}]),e}(u.default);t.exports=p})},{"./clipboard-action":7,"good-listener":4,"tiny-emitter":6}]},{},[8])(8)});D3BROWSERAPI = function () {
    var agt = navigator.userAgent.toLowerCase();
    this.name = '';
    this.suported = true;
    this.msie = (agt.indexOf("msie") != -1 && agt.indexOf("opera") == -1 && (this.name = 'msie')) ? true : false;
    this.opera = (agt.indexOf("opera") != -1 && (this.name = 'opera')) ? true : false;
    this.firefox = (agt.indexOf('firefox') != -1 && (this.name = 'firefox')) ? true : false;
    this.chrome = (agt.indexOf('chrome') != -1 && (this.name = 'chrome')) ? true : false;
    this.safari = (agt.indexOf('safari') != -1 && agt.indexOf('chrome') == -1 && (this.name = 'safari')) ? true : false;

    var ver = agt.match(this.name + '[\/ ](([0-9]+)[0-9\.]*)');
    var ver2 = agt.match('version\/(([0-9]+)[0-9\.]*)');

    if (ver && ver2)
        ver = (+ver[2] > +ver2[2]) ? ver : ver2;
    else
        ver = ver || ver2;

    this.versionMajor = ver ? +ver[2] : null;
    this.version = ver ? ver[1] : null;
}
D3BROWSER = new D3BROWSERAPI();
switch (true) {
    case D3BROWSER.msie && D3BROWSER.versionMajor < 8:
    case D3BROWSER.firefox && D3BROWSER.versionMajor < 13:
    case D3BROWSER.chrome && D3BROWSER.versionMajor < 15:
    case D3BROWSER.safari && D3BROWSER.versionMajor < 5:
    case D3BROWSER.opera && D3BROWSER.versionMajor < 11:
        D3BROWSER = false;
        break;
    default:
        break;
}

D3Api = new function () {
    var GLOBAL_VARS = {};
    var CONFIG = {};
    this.openFormByUnitModifiers = []; // массив функций модификаторов для метода openFormByUnit
    this.BROWSER = D3BROWSER;
    this.forms = {};
    this.threads = {};
    this.controlsApi = {};
    this.current_theme = '';
    this.GLOBAL_CONTEXT_FORM = null;
    var uniq = 0;
    var SYSREQUEST = ''; // Не обновляет активность пользователя при обращении к серверу
    this.init = function () {
        D3Api.MainDom = document.body;
        D3Api.D3MainContainer = D3Api.MainDom;
        D3Api.mixin(CONFIG, D3Api.SYS_CONFIG || {});
        D3Api.SYS_CONFIG = undefined;
        delete D3Api.SYS_CONFIG;
        D3Api.init = undefined;
        delete D3Api.init;
    }
    this.JSONstringify = function (obj, unCyclic, except) {
        //debugger;
        if (D3Api.isUndefined(obj))
            return obj;
        var cyclObj = [];
        return JSON.stringify(obj, function (k, v) {
            if (except && String(k).match(except))
                return undefined;
            if (unCyclic && typeof(v) == 'object') {
                if (cyclObj.indexOf(v) > -1)
                    return undefined;
                cyclObj.push(v);
            }
            return (v === '') ? '' : v;
        });
        cyclObj = null;
    }
    this.JSONparse = function (json) {
        if (!json)
            return json;
        return JSON.parse(json);
    }
    this.getUniqId = function (prefix) {
        if (uniq > 9999999) //fix
            uniq = 0;
        prefix = prefix || '';
        return prefix + (uniq++) + (new Date()).getTime();
    }
    function calcFormHash(data) {
        return data.Form + '.' + MD5.hex_md5(D3Api.JSONstringify(data));
    }

    this.setVar = function (name, value) {
        GLOBAL_VARS[name] = value;
    }
    this.getVar = function (name, defValue) {
        return GLOBAL_VARS[name] || defValue;
    }
    /**
     * Получение значения в свойстве объекта
     * @param name string - имя свойства
     * @param obj obj - объект
     * @param defValue - значение по умолчанию
     * @returns
     */
    this.getValueInObj = function (name, obj, defValue) {
        var value = defValue;
        if (name.indexOf('.') > -1) { // для объекта
            var arr = name.split('.');
            if (obj && obj[arr[0]] && obj[arr[0]][arr[1]])
                value = obj[arr[0]][arr[1]];
        }
        else {
            if (obj && obj[name])
                value = obj[name];
        }
        return value;
    }
    this.getOption = function (name, defaultValue) {
        if (CONFIG[name] === undefined)
            return defaultValue;
        return CONFIG[name];
    }
    function calcThreadHash(data) {
        return data.Form + '.' + MD5.hex_md5(D3Api.JSONstringify(data));
    }

    function getNewThread(name) {
        //Новая нить
        if (D3Api.threads[name])
            name = name + D3Api.getUniqId('.thread:');

        D3Api.threads[name] = new D3Api.D3ThreadForms(name);
        D3Api.threads[name].name = name;//нужно для вкладок
        return name;
    }

    // Находит компонент по всему документу
    this.getControlInAllForms = function (name) {
        if (!name) {return;}
        var ctrl = D3Api.getDomBy(document,'div [name="'+name+'"]');
        if (ctrl && ctrl.getAttribute('cmptype')) {
            return ctrl;
        } else {
            D3Api.debug_msg('Компонент не найден: ' + name);
            return false;
        }
    };

    // Копирование в буфер обмена.
    // data - что скопировать.
    // notify_caption и notify_text - Заголовок и текст сообщения пи успешном копировании. Можно не передавать.
    this.buferCopy = function (data,notify_caption,notify_text) {
        if (data) {
            var clipboard = new Clipboard('body', {
                text: function () {
                    return String(data)
                }
            });
            clipboard.on('success', function(e) {
                e.clearSelection();
                clipboard.destroy();
            });

            clipboard.on('error', function(e) {
                clipboard.destroy();
            });
            if (notify_caption && notify_text) {
                D3Api.notify(notify_caption,notify_text,{'expires': 2000});
            }
        } else {
            D3Api.notify('Ошибка','Нет данных для копирования', {'expires': 2000});
        }
    };
    this.close_modal_form = function () {
        D3Api.confirm('Вы действительно хотите закрыть текущее окно?', function(){
            var open_modal_cont = D3Api.getDomBy(D3Api.D3MainContainer, 'div[id="open_modal"]');
            if(open_modal_cont && D3Api.showedDom(open_modal_cont) && open_modal_cont.childNodes.length > 1){
                if(open_modal_cont.childNodes[0].D3Form){
                    open_modal_cont.childNodes[0].D3Form.close();
                };
            }
        });
    };
    /*
     * name - имя формы
     * data - json объект, параметр request: информация отправляется на сервер {request: {unit: 'COMPOSITION', name: 'DEFAULT'}}
     */
    this.showForm = function (name, dom, data, contextForm) {
        var open_modal_cont = D3Api.getDomBy(D3Api.D3MainContainer, 'div[id="open_modal"]');
        /*если окно открывается в модальном режиме*/
        if((data && String(data.modal_form)=='true')){
            /*и контейнера для модалки нет, то создаем его*/
            if(!open_modal_cont){
                var open_modal       = document.createElement("div"),
                    close_open_modal = document.createElement("div");
                open_modal.id               = 'open_modal';
                open_modal.style.cssText    = 'position: fixed; width: 100%; height: 100%; top: 0px; left: 0px; display: none;background: #f9f9f9aa;z-index: 3;';
                close_open_modal.className  = 'close_open_modal fa-times fas';
                open_modal.appendChild(close_open_modal);
                open_modal_cont = D3Api.MainDom.appendChild(open_modal);
                close_open_modal.onclick = function() {
                    D3Api.close_modal_form();
                };
                D3Api.showDomBlock(open_modal_cont);
            }else if(!D3Api.showedDom(open_modal_cont)){
                /*если есть контейнер для модалки, то просто показываем его*/
                D3Api.showDomBlock(open_modal_cont);
            }
        }
        /*если показано модальное окно - открываем окна только в модальном режиме*/
        if(open_modal_cont && D3Api.showedDom(open_modal_cont)){
            dom = (dom == D3Api.MainDom?(open_modal_cont):(dom || open_modal_cont));
        }else{
            dom = dom || D3Api.MainDom;
        }
        data = data || {};
        if (data.request)
            data.request.Form = name;
        else
            data.request = {Form: name};

        if(data.modal_form){
            data.request['modal'] = '1'
        }
        var hname = calcFormHash(data.request);

        data._contextForm_ = contextForm;
        data._currentContext_ = contextForm ? contextForm.currentContext : null;

        D3Api.Base.callEvent('onShowForm', name, dom, data, hname);

        if (!data.notthread) {
            //Новая нить принудительно
            if (data.newthread) {
                data.newthread = getNewThread(calcThreadHash(data.request));
            } else if (data.thread) //Форма начала потока
            {
                var tname = calcThreadHash(data.request);
                //Ищем среди нитей
                if (D3Api.threads[tname]) {
                    //Открываем нить
                    D3Api.threads[tname].activate();
                    return;
                } else
                    data.newthread = getNewThread(tname);
            }
        }
        var fobj = D3Api.forms[hname];
        if (fobj) {
            if (fobj.status == 'ready' && D3Api.getOption('formCache', true)) {
                var form = fobj.form;
                if (form instanceof D3Api.D3Form) {
                    if (fobj.form.isShowed)
                        form = new D3Api.D3Form(form.name, fobj.content);
                    form.show(data, dom);
                    return form;
                }
            } else
            {
                if(fobj.status != 'load')
                    fobj.status = null;
                D3Api.forms[hname].onReadyObj.push({formData: data, showDom: dom});
            }
        }else{
            D3Api.forms[hname] = {onReadyObj: [
                {formData: data, showDom: dom}
            ]};
        }
        D3Api.loadForm(data);
        return hname;
    }
    this.loadFormByName = function (name) {
        this.loadForm({request: {Form: name}});
    }
    this.loadForm = function openForm(data) {
        if (!data.request.Form) {
            D3Api.debug_msg('Не указано имя формы.');
            return;
        }
        var hname = calcFormHash(data.request);
        D3Api.forms[hname] = D3Api.forms[hname] || {onReadyObj: []};
        if (D3Api.forms[hname].status)
            return hname;
        else
            D3Api.forms[hname].status = 'load';

        D3Api.requestServer({
            url: 'getform.php',
            method: 'POST',
            urlData: data.request,
            onSuccess: parseForm,
            onError: function () {},
            contextObj: {name: data.request.Form, hash: hname, thread: data.newthread},
            responseXml: false
        });
        return hname;
    };
    //Функция парса формы можно вызвать локально D3Api.parseForm.call(dataForm,xml), где dataForm данные формы (name и тд.); xml - строка дом модели с одним корневым узлом.
    function parseForm(xml,_peq) {
        var formCache = _peq.getResponseHeader('FormCache');
        var fobj = D3Api.forms[this.hash];
        fobj.content = xml;
        fobj.status = 'ready';
        fobj.form = new D3Api.D3Form(this.name, xml);
        fobj.form.callEvent('onload');
        var form = fobj.form;
        for (var i = 0, c = fobj.onReadyObj.length; i < c; i++) {
            if (i > 0){
                form = new D3Api.D3Form(this.name, xml);
            }
            form.show(fobj.onReadyObj[i].formData, fobj.onReadyObj[i].showDom);
            form.formCache = formCache;
        }
        fobj.onReadyObj = [];
    };

    /**
     * Открытие формы по разделу
     * @param dom - DOM формы
     * @param unit string - раздел
     * @param primary int - ID записи раздела
     * @param params {} - параметры
     */
    this.openFormByUnit = function(dom, unit, primary, params){
        params = params || {};
        var form;
        var data  = {
            isView: params.isView ? params.isView : undefined
        };
        var vars = {
            IS_VIEW : params.isView ? params.isView : undefined
        };
        var request = {
            unit: unit,
            method: params.method || 'default'
        };

        if (params.composition){
            form = 'System/composition';
            request.composition = params.composition;
            request.show_buttons = params.isView ? false : true;
            data.id  = primary;
            vars.PRIMARY = primary;
            vars.LOCATE = primary ? primary : undefined;
        }
        else{
            form = 'UniversalEditForm/UniversalEditForm';
            data.id  = primary;
            data.isCopy = params.isCopy ? params.isCopy : undefined;
            vars.PRIMARY = primary;
            vars.SHOW_BUTTON_OK = params.isView ? 0 : 1;
        }
        vars.data = data;

        // прокидываем доп. переменные из params
        if (params.vars){
            for (var key in params.vars){
                if(!params.vars.hasOwnProperty(key)){
                    continue;
                }
                if (typeof(params.vars[key]) == "object"){
                    vars[key] = vars[key] || {};
                    for (var k in params.vars[key]){
                        if(params.vars[key].hasOwnProperty(k)){
                            vars[key][k] = params.vars[key][k];
                        }
                    }
                }
                else vars[key] = params.vars[key];
            }
        }
        if (params.request){
            for (var key in params.request){
                if(params.request.hasOwnProperty(key)){
                    request[key] = params.request[key];
                }
            }
        }

        // функции-модификаторы параметров. Расширяются через модули в файле MODULE/System/js/common.js
        if (D3Api.openFormByUnitModifiers.length > 0){
            D3Api.openFormByUnitModifiers.forEach(function (item){
                if (item instanceof Function) item.call(this, { unit:unit, primary:primary, params:params, vars:vars, request:request });
            })
        }

        dom.openForm(form, {
            request: request,
            vars: vars,
            thread:params.thread,
            newthread:params.newthread,
            oncreate:params.oncreate,
            onclose:params.onclose
        }, params.container)
    };

    //Отчеты
    this.showReport = function (name, data) {
        data = data || {};
        data.vars = data.vars || {};
        data.vars._reportName = name;
        this.showForm('report', undefined, data);
    }
    this.setSysRequest = function () {
        SYSREQUEST = '&SYSREQUEST=1';
    }
    this.requestServer = function (params) {
        var default_ctype = "application/x-www-form-urlencoded; charset=UTF-8";
        var reqObj = getRequestObject();
        var requestData = '';
        var postData = '';
        var _param = ''

        if('cache_enabled' in D3Api){
            _param += 'cache_enabled='+D3Api.cache_enabled;
        }
        if('session_cache' in D3Api){
            if(_param != ''){
                _param += "&";
            }
            _param += 'session_cache='+D3Api.session_cache;
        }
        if(_param != ''){
            _param += "&";
        }
        if (params.async == undefined){
            params.async = true;
        }
        if(params.content_type == undefined)
            params.content_type = default_ctype;
        if (params.method == 'POST') {
            postData += parseDataToUrl(params.data);
            reqObj.open('POST', D3Api.getOption('path', '') + params.url + '?' + _param + parseDataToUrl(params.urlData) + 'cache=' + D3Api.SYS_CACHE_UID + SYSREQUEST, params.async);
            reqObj.setRequestHeader("Method", "POST " + D3Api.getOption('path', '') + params.url + " HTTP/1.1");
            reqObj.setRequestHeader("Content-Type", params.content_type);
            if(params.content_type == default_ctype){
                postData += parseDataToUrl(params.data);
            }
            else{
                postData = '' + params.data;
            }
        } else {
            requestData += parseDataToUrl(params.data);
            postData = null;
            reqObj.open('GET', D3Api.getOption('path', '') + params.url + '?' + _param + parseDataToUrl(params.urlData) + requestData + 'cache=' + D3Api.SYS_CACHE_UID + SYSREQUEST, params.async);
        }
        var isSysRequest = SYSREQUEST != '';
        SYSREQUEST = '';
        if (params.requestHeaders) {
            for (var rh in params.requestHeaders) {
                if(params.requestHeaders.hasOwnProperty(rh)){
                    reqObj.setRequestHeader(rh, params.requestHeaders[rh]);
                }
            }
        }
        if('headers' in params){
            for(var key in params.headers){
                if(params.headers.hasOwnProperty(key)){
                    reqObj.setRequestHeader(key, params.headers[key]);
                }
            }
        }
        var systemUserToken = D3Api.globalClientData.get('systemUserToken');
        if (systemUserToken) {
            reqObj.setRequestHeader('X-User-Token', systemUserToken);
        }

        var reqUid = D3Api.getUniqId('req');
        var func = function () {
            if (reqObj.readyState != 4) return;
            try {
                if (reqObj.status == 200) {
                    if (checkErrorRequest(reqObj, params) && params.onSuccess instanceof Function)
                        params.onSuccess.call(params.contextObj, ((params.responseXml) ? reqObj.responseXML : reqObj.responseText),reqObj);
                } else if (params.onError instanceof Function) {
                    checkErrorRequest(reqObj, params);
                    params.onError.call(params.contextObj, (params.responseXml) ? reqObj.responseXML : reqObj.responseText, reqObj);
                }
            } catch (e) {
                D3Api.debug_msg(e);
            }
            D3Api.Base.callEvent('onRequestServerEnd', reqObj, reqUid, isSysRequest);
            delete reqObj;
        }
        if (params.async)
            reqObj.onreadystatechange = func;
        D3Api.Base.callEvent('onRequestServerBegin', reqObj, reqUid, isSysRequest);
        reqObj.send(postData);

        if (!params.async) func();
        return reqObj;
    };

    this.AuthError = function() {
        D3Api.showForm.apply(this, Array.prototype.slice.call(arguments))
    }

    function checkErrorRequest(req, params) {
        var error = req.getResponseHeader('D3RequestError');
        if (!error)
            return true;

        if (params.contextObj && params.contextObj.hash) {
            D3Api.forms[params.contextObj.hash] = null;
            delete D3Api.forms[params.contextObj.hash];
            if (params.contextObj.thread)
                D3Api.threads[params.contextObj.thread].close();
        }
        var code, ind = error.indexOf(':');
        if (ind > -1) {
            code = error.substr(0, ind);
            error = error.substr(ind + 1);
        }

        switch (code) {
            case 'AuthErrorLogin':
            case 'AuthErrorLpu':
            case 'AuthErrorPass':
                var f = error.split('|');
                if (f[1]) {
                    D3Api.debug_msg(f[1]);
                } else {
                    D3Api.AuthError(f[0], D3Api.D3MainContainer, {vars: {onlyLPU: code == 'AuthErrorLpu', onlyPass: code == 'AuthErrorPass'}});
                }
                break;
            case 'DBConnectError':
                alert('Ошибка при подключении к БД: ' + error);
                break;
            default:
                D3Api.alert_msg('Неизвестная ошибка ответа: ' + error);
                break;
        }
        return false;
    };
    function isObject(_object) {
        return (_object instanceof Object) || (window['Node'] && _object instanceof window['Node']);
    };
    function parseDataToUrl(_Data, _PropName) {
        if (_PropName == undefined) _PropName = null;
        if (_Data == undefined) return '';

        var urlData = '';

        for (var _propertyName in _Data) {
            if(!_Data.hasOwnProperty(_propertyName)){
                continue;
            }
            if (isObject(_Data[_propertyName])) {
                var l_PropName = _PropName != null ? _PropName + '[' + _propertyName + ']' : _propertyName;
                urlData += parseDataToUrl(_Data[_propertyName], l_PropName);
            }
            else {
                if (_PropName != null) urlData += _PropName + '[' + _propertyName + ']=' + encodeURIComponent(_Data[_propertyName]) + '&';
                else urlData += _propertyName + '=' + encodeURIComponent(_Data[_propertyName]) + '&';
            }
        }
        return urlData;
    };
    function getRequestObject() {
        if (window.XMLHttpRequest) {
            try {
                return new XMLHttpRequest();
            } catch (e) {
            }
        } else if (window.ActiveXObject) {
            try {
                return new ActiveXObject('MSXML2.XMLHTTP.3.0');
            } catch (e) {
            }
            try {
                return new ActiveXObject('Msxml2.XMLHTTP');
            } catch (e) {
            }
            try {
                return new ActiveXObject('Microsoft.XMLHTTP');
            } catch (e) {
            }
        }
        return null;
    };
    this.parseXML = function parseXML(text) {
        try {
            if (window.DOMParser) {
                var parser = new DOMParser();
                return parser.parseFromString(text, "text/xml").childNodes[0];
            } else if (window.ActiveXObject) {
                var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
                xmlDoc.async = "false";
                xmlDoc.loadXML(text);
                return xmlDoc.childNodes[0];
            }
        } catch (e) {
        }
        return null;
    };
    this.including_js = {};
    this.include_js = function (filename, callback) {
        var path = filename.split('?');
        filename = path[0];
        if (this.including_js[filename] == true) {
            if (callback instanceof Function)
                callback.call(this, filename);
            return true;
        }
        this.including_js[filename] = false;
        var objHead = document.getElementsByTagName('head')[0];
        var objScript = document.createElement('script');
        objScript.type = 'text/javascript';
        objScript.src = filename.replace('.js', '') + ((this.current_theme != '') ? '_' : '') + this.current_theme + '.js' + ((path[1]) ? '?' + path[1] : '');
        objScript.onload = function () {
            D3Api.including_js[filename] = true;
            if (callback instanceof Function)
                callback.call(this, filename);
            this.onload = undefined;
            this.onreadystatechange = undefined;
        }
        objScript.onreadystatechange = function () {
            if (this.readyState == 'loaded' || this.readyState == 'complete') {
                D3Api.including_js[fileName] = true;
                if (callback instanceof Function)
                    callback.call(this, filename);
                this.onload = undefined;
                this.onreadystatechange = undefined;
            }
        }
        objHead.appendChild(objScript);
        return true;
    }
    this.including_css = {};
    this.include_css = function (filename) {
        var path = filename.split('?');
        filename = path[0];
        if (this.including_css[filename] == true)
            return true;
        this.including_css[filename] = true;
        var objHead = document.getElementsByTagName('head')[0];
        var objStyle = document.createElement('link');
        objStyle.rel = 'stylesheet';
        objStyle.type = 'text/css';
        objStyle.href = filename.replace('.css', '') + ((this.current_theme != '') ? '_' : '') + this.current_theme + '.css' + ((path[1]) ? '?' + path[1] : '');

        objHead.appendChild(objStyle);
        return true;
    }
    var lastWidth = 0;
    var lastHeight = 0;
    this.resize = function (force) {
        force = force === undefined ? true : force;
        if (force || document.body.offsetWidth != lastWidth || document.body.offsetHeight != lastHeight) {
            lastWidth = document.body.offsetWidth;
            lastHeight = document.body.offsetHeight;
            this.Base.callEvent('onResize');
        }
    }
    document.onkeydown = function(e){

        var e = e || D3Api.getEvent();
        var focus_control = D3Api.getControlByDom(document.activeElement);
        if(!focus_control || !focus_control.D3Form)
            return;

        if (e.keyCode == 9 )
            D3Api.setVar('KeyDown_shiftKey', e.shiftKey);
        else
            focus_control.D3Form.callControlMethod(focus_control, 'CtrlKeyDown', e);
    }
}();
D3Api.D3Base = function (thisObj) {
    this.events = {};
    this.currentEventName = '';
    this.removedEvents = [];
    this.addEvent = function (eventName, listener) {
        if (!(listener instanceof Function))
            return null;
        if (!this.events[eventName])
            this.events[eventName] = {};
        var uniqid = D3Api.getUniqId('event_');
        this.events[eventName][uniqid] = {func: listener, once: false};
        return uniqid;
    }
    this.addEventOnce = function (eventName, listener) {
        var uniqid = this.addEvent(eventName, listener);
        if (!uniqid)
            return null;
        this.events[eventName][uniqid].once = true;
        return uniqid;
    }
    this.callEvent = function (eventName) {
        if (!this.events[eventName])
            return;
        this.currentEventName = eventName;
        var args = Array.prototype.slice.call(arguments, 1);
        var onces = new Array();
        var res = true;
        for (var e in this.events[eventName]) {
            if(!this.events[eventName].hasOwnProperty(e)){
                continue;
            }
            if (this.events[eventName][e].func.apply(thisObj || this, args) === false)
                res = false;
            if (this.events && this.events[eventName][e].once)
                onces.push(e);
        }
        this.currentEventName = '';
        onces = onces.concat(this.removedEvents);
        for (var i = 0, c = onces.length; i < c; i++) {
            this.removeEvent(eventName, onces[i]);
        }
        this.removedEvents = [];
        onces = null;
        return res;
    }
    this.clearEvents = function (eventName) {
        this.events[eventName] = {};
    }
    this.removeEvent = function (eventName, uniqid) {
        if (!this.events[eventName] || !this.events[eventName][uniqid])
            return false;
        if (eventName == this.currentEventName) {
            this.removedEvents.push(uniqid);
            return true;
        }
        this.events[eventName][uniqid] = null;
        delete this.events[eventName][uniqid];
        return true;
    }
    this.removeEvents = function (eventName) {
        if (!this.events[eventName])
            return false;

        if (eventName == this.currentEventName) {
            for (var uid in this.events[eventName]){
                if(this.events[eventName].hasOwnProperty(uid)){
                    this.removedEvents.push(uid);
                }

            }
            return true;
        }
        this.events[eventName] = null;
        delete this.events[eventName];
        return true;
    }
    this.removeAllEvents = function () {
        this.events = [];
        return true;
    }
    this.destructorBase = function () {
        this.destroyed = true;
        this.events = null;
        delete this.events;
    }
}
D3Api.Base = {};
D3Api.D3Base.call(D3Api.Base);

D3Api.D3Form = function (name, xml) {
    D3Api.D3Base.call(this);
    this.isActive = false;
    this.isShowed = false;
    this.isCreated = false; // метка отработки пользовательского события onCreate
    this.leftForm = null;
    this.rightForm = null;
    this.formUid = D3Api.getUniqId('f');
    this.name = name;
    this.nameWinContent = null;
    this.formData = {};
    this.formEditMode = false;
    this.formCheckPrivs = null; // нужно ли проверять на форме права
    this.formCheckCreated = null; // нужно ли дожитаться завершения работы onCreate
    this.formSkipRefresh = null; // пропуск системной проверки D3Api.D3Form.onRefreshForm при открытии формы
    this.formUnit = null; // привязанный к форме раздел системы
    this.formPrimary = null; // имя PRIMARY переменной на форме
    this.currentContext = null;
    this.vars = {};
    this.container = null;
    var dataSets = {};
    this.dataSets = dataSets;
    var repeaters = {};
    this.repeaters = repeaters;
    var activateDataSets = new Array();
    var modules = {};
    var actions = {};
    this.actions = actions;
    var sysinfo = {};
    this.sysinfo = sysinfo;
    var MainForm = this;
    var resizeEventUid = D3Api.Base.addEvent('onResize', resizeForm);
    var resizeTimer = null;
    this.scrollDoms = [];
    function resizeForm(DOM, resize) {
        if(!MainForm){
            return
        }
        if (!D3Api.showedDom(MainForm.DOM))
            return;
        DOM = DOM || MainForm.DOM;
        D3Api.runCalcSize(DOM, DOM);
        MainForm.callEvent('onResize');
        if (_modalBorders_.top) {
            D3Api.MainDom.D3FormCloseCtrl && D3Api.setControlPropertyByDom(D3Api.MainDom.D3FormCloseCtrl, 'visible', false);
            D3Api.MainDom.D3FormHelp && D3Api.setControlPropertyByDom(D3Api.MainDom.D3FormHelp, 'visible', false);
            D3Api.hideDom(_modalBorders_.top);
            D3Api.hideDom(_modalBorders_.right);
            D3Api.hideDom(_modalBorders_.bottom);
            D3Api.hideDom(_modalBorders_.left);
            var md = D3Api.getAbsoluteClientRect(D3Api.MainDom);
            var fs = D3Api.getAbsoluteClientRect(MainForm.DOM);
            _modalBorders_.top.style.top = md.y + 'px';
            _modalBorders_.top.style.left = fs.x + 'px';
            _modalBorders_.top.style.width = fs.width + 'px';
            _modalBorders_.top.style.height = (fs.y - md.y) + 'px';

            _modalBorders_.right.style.top = md.y + 'px';
            _modalBorders_.right.style.left = (fs.x + fs.width) + 'px';
            _modalBorders_.right.style.width = (md.x + md.width - fs.x - fs.width) + 'px';
            _modalBorders_.right.style.height = md.height + 'px';

            _modalBorders_.bottom.style.top = (fs.y + fs.height) + 'px';
            _modalBorders_.bottom.style.left = fs.x + 'px';
            _modalBorders_.bottom.style.width = fs.width + 'px';
            _modalBorders_.bottom.style.height = (md.y + md.height - fs.y - fs.height) + 'px';

            _modalBorders_.left.style.top = md.y + 'px';
            _modalBorders_.left.style.left = md.x + 'px';
            _modalBorders_.left.style.width = (fs.x - md.x) + 'px';
            _modalBorders_.left.style.height = md.height + 'px';

            D3Api.setDomDisplayDefault(_modalBorders_.top);
            D3Api.setDomDisplayDefault(_modalBorders_.right);
            D3Api.setDomDisplayDefault(_modalBorders_.bottom);
            D3Api.setDomDisplayDefault(_modalBorders_.left);

        }
    }

    function resizeOnlyForm() {
        if (!MainForm) {
            return;
        }
        D3Api.runCalcSize(MainForm.DOM, MainForm.DOM);
    }

    this.resize = function () {
        if (resizeTimer) {
            clearTimeout(resizeTimer);
            resizeTimer = null;
        }
        resizeTimer = setTimeout(resizeOnlyForm, 100);
    }
    var _modalBorders_ = {top: null, right: null, bottom: null, left: null};
    var fDOM = document.createElement('DIV');
    fDOM.innerHTML = xml;

    this.DOM = fDOM.children[0];
    var div_first = document.createElement("div");
    div_first.innerHTML = '<div cmptype="Base" tabindex="0" name="firstControl" oncreate="D3Api.BaseCtrl.init_focus(this);"/>';
    this.DOM.insertBefore(div_first, this.DOM.children[0]);
    var div_last = document.createElement("div");
    div_last.innerHTML = '<div cmptype="Base" tabindex="0" name="lastControl" oncreate="D3Api.BaseCtrl.init_focus(this);"/>';
    this.DOM.appendChild(div_last);

    if (!this.DOM.getAttribute) {
        D3Api.notify('Информация', 'Ошибка синтаксиса при создании формы "' + name + '"', {modal: true});
        this.DOM = document.createElement('DIV');
    }
    this.DOM.D3Form = this;

    //Пространство скрипта формы
    var Form = {
        _DOM_: MainForm.DOM,
        _pushHistory_: function (container) {
            return container.DOM == D3Api.MainDom;
        },
        //Объект для проброса в onclose
        _onCloseResult_: undefined
        //_withParams_: false
    };

    this.formParams = null;
    this.formParamsHash = [];
    this.formParamsSettings = {};
    var formParamsHash = this.formParams;
    var getParamsAction = createAction('get_form_params');
    getParamsAction.requestParams['form'] = 'System/FormParams/get_form_params';
    getParamsAction.addSysInfoParam({get: 'ps_form', srctype: 'var', src: 'ps_form'});
    getParamsAction.addSysInfoParam({put: 'ps_params', srctype: 'var', src: 'ps_params'});

    var setParamsAction = createAction('set_form_params');
    setParamsAction.requestParams['form'] = 'System/FormParams/set_form_params';
    setParamsAction.addSysInfoParam({get: 'ps_form', srctype: 'var', src: 'ps_form'});
    setParamsAction.addSysInfoParam({get: 'ps_params', srctype: 'var', src: 'ps_params'});


    var CacheSessDelete = createModule('CacheSessDelete');
    CacheSessDelete.requestParams['form'] = 'System/CacheSessDelete/CacheSessDelete';
    CacheSessDelete.addSysInfoParam({get: 'formCache', srctype: 'var', src: 'formCache'});

    //События, которые оборачиваются внутренним обработчиком
    /*this.execDomEvents = new Array(
     'onclick',
     'ondblclick',
     //'onchange',
     'onfocus',
     'onblur',
     'onmousemove',
     'onmousedown',
     'onmouseup',
     'onkeydown',
     'onkeyup',
     'onkeypress',
     'onmouseover',
     'onmouseout',
     'onselect',
     'onsubmit',
     'onreset');*/
    this.execDomEvents = {
        'onclick': true,
        'ondblclick': true,
        //'onchange'     : true,
        'onfocus': true,
        'onblur': true,
        'onmousemove': true,
        'onmousedown': true,
        'onmouseup': true,
        'onkeydown': true,
        'onkeyup': true,
        'onkeypress': true,
        'onmouseover': true,
        'onmouseout': true,
        'onselect': true,
        'onsubmit': true,
        'onreset': true,
        'onmouseleave':true,
        'onmouseenter':true,
        'oncontextmenu':true
    };
    if (D3Api.BROWSER.msie) {
        this.execDomEventsIE = {};
        for (var en in this.execDomEvents) {
            if(this.execDomEvents.hasOwnProperty(en)){
                this.execDomEventsIE['_' + en + '_'] = en;
            }
        }
    }
    var notCheckEnabledEvents = {
        'dummy': true,
        'onload': true,
        'onshow': true,
        'onprepare': true,
        'oncreate': true,
        'oninit': true,
        'onformactivate': true,
        'onclose': true,
        'onrefresh': true,
        'onbefore_refresh': true,
        'onafter_refresh': true
    };
    ////////////////////////////////////////////////////////
    //Функция для замыкания
    function execEventFunc(funcBody, argumentsObj) {
        var res = null;
        var args = Array.prototype.slice.call(argumentsObj);
        var argsNames = '';
        if ((args[0] instanceof Object) && (args[0] instanceof Event))
            argsNames = 'event';
        if (funcBody instanceof Object) {
            argsNames = funcBody['args'] || argsNames;
            funcBody = funcBody['func'];
        }
        eval('try{ res = (function(' + argsNames + '){' + funcBody + '}).apply(this,args); }catch(e){D3Api.debug_msg(e);}');
        return res;
    };
    this.callFunction = function (funcName) {
        var args = Array.prototype.slice.call(arguments, 1);
        res = null;
        try {
            var res = Form[funcName].apply(this, args);
        } catch (e) {
            D3Api.debug_msg(e);
        }
        ;
        return res;
    }
    this.existsFunction = function (funcName) {
        return Form[funcName] instanceof Function;
    }
    this.execScript = execEventFunc;

    //Для дом событий, замыкает функцию в пространство формы
    this.execDomEventFunc = function (dom, funcBody, eventName, context) {
        eventName = eventName || 'dummy';
        context = context || MainForm.currentContext;
        return function () {
            var ev = D3Api.getEvent(arguments[0]);
            D3Api.setEvent(arguments[0]);
            var cC = MainForm.currentContext;
            MainForm.currentContext = context || MainForm.currentContext;

            var notCheckEnabledEventsControl = []; // события компонента, на которые не должно влиять enabled
            if (D3Api.getProperty(dom, 'not_check_enabled_events'))
                notCheckEnabledEventsControl = D3Api.getProperty(dom, 'not_check_enabled_events','').split(";");
            if (!notCheckEnabledEvents[eventName] && notCheckEnabledEventsControl.indexOf(eventName) == -1) {
                if (getControlProperty(dom, 'enabled') === false) {
                    D3Api.setEvent(ev);
                    return;
                }
            }
            var res = execEventFunc.call(dom, funcBody, arguments);
            //Форму могли закрыть
            if (MainForm)
                MainForm.currentContext = cC;

            D3Api.setEvent(ev);
            return res;
        };
    }
    ///////////////////////////////////////////////////////
    this.parse = function (dom, dataset, repeatersStack, currentUid) {
        var rStack = repeatersStack && repeatersStack.length > 0;
        if (D3Api.hasProperty(dom, 'noparse'))
            return;
        repeatersStack = repeatersStack || new Array();
        var dsName = D3Api.getProperty(dom, 'dataset');
        var rep = D3Api.getProperty(dom, 'repeat');
        if (dsName || rep) {
            if (rStack) {
                D3Api.setProperty(dom, 'isrepeat', repeatersStack[repeatersStack.length - 1].uniqId);
            }
            if (dsName) {
                if (!dataSets[dsName])
                    dataSets[dsName] = new D3Api.D3DataSet(this, dsName);
                dataset = dataSets[dsName];
                if (!rStack) {
                    var prop = null;
                    if (prop = D3Api.getProperty(dom, 'onbefore_refresh'))dataset.addEvent('onbefore_refresh', this.execDomEventFunc(dom, prop));
                    if (prop = D3Api.getProperty(dom, 'onrefresh'))dataset.addEvent('onrefresh', this.execDomEventFunc(dom, prop));
                    if (prop = D3Api.getProperty(dom, 'onafter_refresh'))dataset.addEvent('onafter_refresh', this.execDomEventFunc(dom, prop));
                }
            }
            //Это повторитель

            if (rep) {
                var parent = null;
                if (repeatersStack.length > 0)
                    parent = repeatersStack[repeatersStack.length - 1];

                var repeater = new D3Api.D3Repeater(this, dom, parent, dataset);
                if (repeater.name)
                    repeaters[repeater.name] = repeater;
            }
        }
        var cmptype = D3Api.getProperty(dom, 'cmptype');
        var p = '';
        if (cmptype) {
            if (rStack) {
                D3Api.setProperty(dom, 'isrepeat', repeatersStack[repeatersStack.length - 1].uniqId);
            }
            switch (cmptype.toLowerCase()) {
                case 'sysinfo':
                    sysinfo_parse(dom);
                    break;
                case 'script':
                    script_parse.call(this, dom);
                    break;
                default:
                    currentUid = MainForm.default_parse(dom, true, undefined, currentUid);
                    var find = false;
                    if (dsName) {
                        if(rep){
                            repeater.addControl(dom);
                            find = true;
                        }else {
                            for (var c = repeatersStack.length - 1; c >= 0; c--) {
                                if (repeatersStack[c].dataSet && repeatersStack[c].dataSet.name == dsName) {
                                    repeatersStack[c].addControl(dom);
                                    find = true;
                                    break;
                                }
                            }
                        }
                    }
                    if (!find)
                        if (repeatersStack.length > 0 && !dsName)
                            repeatersStack[repeatersStack.length - 1].addControl(dom);
                        else if (dataset)
                            dataset.addControl(dom);
                    break;
            }
        } else if (p = D3Api.getProperty(dom, 'cmpparse', false)) {
            if (rStack) {
                D3Api.setProperty(dom, 'isrepeat', repeatersStack[repeatersStack.length - 1].uniqId);
            }
            MainForm.default_parse(dom, true, undefined, currentUid);
        }
        if (repeater) repeatersStack.push(repeater);
        if (dom.children) {
            for (var i = 0, c = dom.children.length; i < c; i++) {
                this.parse(dom.children[i], dataset, repeatersStack, currentUid);
            }
        }

        if (repeater) repeatersStack.pop();
    }
    var scriptsLoad = 0;
    var sysinfo_types =
    {
        'dataset': function (dom) {
            var dsName = D3Api.getProperty(dom, 'name');
            if (!dsName) {
                D3Api.debug_msg('Не указано имя DataSet');
                return;
            }
            if (!dataSets[dsName])
                dataSets[dsName] = new D3Api.D3DataSet(MainForm, dsName, dom);
            else {
                dataSets[dsName].init(dom);
            }
            sysinfo_load(sysinfo, dom, {type: 'dataset', name: '', activateoncreate: 'true', showerror: 'true'}, new Array('get', 'srctype', 'src', 'parent', 'property', 'global'), dataSets[dsName]);
            if (sysinfo[dsName].properties.activateoncreate == 'true')
                activateDataSets.push(dsName);
        },
        'action': function (dom) {
            var actName = D3Api.getProperty(dom, 'name');
            if (!actName) {
                D3Api.debug_msg('Не указано имя Action');
                return;
            }
            if (!actions[actName])
                actions[actName] = new D3Api.D3Action(MainForm, actName, dom);
            else {
                actions[actName].init(dom);
            }
            sysinfo_load(sysinfo, dom, {type: 'action', name: '', activateoncreate: 'true', showerror: 'true', mode: 'get'}, new Array('get', 'put', 'srctype', 'src', 'property', 'global'), actions[actName]);
        },
        'module':function(dom){
            var actName = D3Api.getProperty(dom, 'name');
            if (!actName) {
                D3Api.debug_msg('Не указано имя Module');
                return;
            }
            if (!modules[actName]){
                modules[actName] = new D3Api.D3Module(MainForm, actName, dom);
            }else{
                modules[actName].init(dom);
            }
            sysinfo_load(sysinfo, dom, {type: 'module', name: '', activateoncreate: 'true', showerror: 'true', mode: 'get'}, new Array('get', 'put', 'srctype', 'src', 'property', 'global'), modules[actName]);
        },
        'subaction': function (dom, params, postObject) {
            var subActName = D3Api.getProperty(dom, 'name');
            if (!subActName) {
                D3Api.debug_msg('Не указано имя SubAction');
                return;
            }
            var subActPO = sysinfo_load(postObject.childs, dom, {type: 'subaction', name: '', repeatername: '', showerror: 'true', mode: 'get', execon: 'upd'}, new Array('get', 'put', 'srctype', 'src', 'property', 'global'));

            if (subActPO.properties.repeatername != '') {
                var rep = MainForm.getRepeater(subActPO.properties.repeatername);
                if (rep) {
                    rep.actionData = true;
                } else {
                    D3Api.debug_msg('SubAction "' + subActName + '" ссылается на несуществующий Repeater ("' + subActPO.properties.repeatername + '").');
                    return;
                }
            }
            //Переопределяем функцию получения данных для запроса
            subActPO.getChildData = function () {
                var rep = MainForm.getRepeater(this.properties.repeatername);
                var cC = MainForm.currentContext;
                params = [];
                if (rep && this.properties.execon) {
                    var chData = rep.getChangedData(this.properties.execon);
                    for (var chD in chData) {
                        if(!chData.hasOwnProperty(chD)){
                            continue;
                        }
                        MainForm.currentContext = chData[chD];
                        MainForm.setVar('_clonedata_', chData[chD].clone.data);
                        params.push(this.getParams());
                    }
                    MainForm.setVar('_clonedata_', undefined);
                } else
                    params.push(this.getParams());

                MainForm.currentContext = cC;
                return params;
            }
            subActPO.setParams = function (data) {
                for (var i = 0, ip = this.params.length; i < ip; i++) {
                    if (this.params[i].put != undefined) {
                        switch (this.params[i].srctype) {
                            case 'var':
                                var DESTOBJ = MainForm;
                                if (this.params[i].global === 'true')
                                    DESTOBJ = D3Api;
                                if (this.params[i].property) {
                                    var obj = DESTOBJ.getVar(this.params[i].src) || {};
                                    obj[this.params[i].property] = data[this.params[i].put];
                                    DESTOBJ.setVar(this.params[i].src, obj);
                                } else
                                    DESTOBJ.setVar(this.params[i].src, data[this.params[i].put]);
                                break;
                            case 'ctrl':
                                D3Api.BaseCtrl.callMethod(MainForm.getControl(this.params[i].src), 'stopWait');
                                MainForm.setControlProperty(this.params[i].src, this.params[i].prop, data[this.params[i].put]);
                                break;
                        }
                    }
                }
            }
        },
        'var': function (dom, params, postObject) {
            var pObj = {ignorenull: false};

            for (var i = 0, c = params.length; i < c; i++) {
                var attr = D3Api.getProperty(dom, params[i]);
                if (attr != null)
                    pObj[params[i]] = attr;
            }
            if (postObject.properties.type == 'action') {
                actions[postObject.properties.name].addSysInfoParam(pObj);
            } else if (postObject.properties.type == 'dataset') {
                dataSets[postObject.properties.name].addSysInfoParam(pObj);
            } else if(postObject.properties.type == 'module'){
                modules[postObject.properties.name].addSysInfoParam(pObj);
            } else
                postObject.params.push(pObj);
        },
        'scriptfile': function (dom) {
            scriptsLoad++;
            if (!D3Api.include_js(dom.textContent || dom.text, function () {
                scriptsLoad--;
            }))
                scriptsLoad--;
        },
        'cssfile': function (dom) {
            D3Api.include_css(dom.textContent || dom.text);
        },
        'formgetparam': function (dom) {
            MainForm.formParamsHash.push(D3Api.getTextContent(dom));
        },
        'formparam': function (dom) {
            var t = D3Api.getTextContent(dom);
            t = t.split(':');
            MainForm.formParamsSettings[t[0]] = t[1] || true;
        }
    }

    function postObject(defProperties) {
        this.properties = defProperties || {};
        this.params = new Array();
        this.childs = {};

        this.getParams = function () {
            var params = {};
            for (var i = 0, c = this.params.length; i < c; i++) {
                var par = this.params[i];
                if (par['get'] && par['srctype'] && par['src']) {
                    var value = '';
                    switch (par['srctype']) {
                        case 'ctrl':
                            var pf = par['src'].split(':');
                            if(par['property'])
                            {
                                value = MainForm.getControlProperty(pf[0], par['property']);
                            }else if (pf.length > 1)
                            {
                                value = MainForm.getControlProperty(pf[0], pf[1]);
                            }else{
                                value = MainForm.getControlProperty(pf[0], 'value');
                            }
                            break;
                        case 'var':
                            var SRCOBJ = MainForm;
                            if (par['global'] === 'true')
                                SRCOBJ = D3Api;
                            if (par['property'])
                                value = SRCOBJ.getVar(par['src'])[par['property']];
                            else
                                value = SRCOBJ.getVar(par['src']);
                            break;
                    }
                    params[par['get']] = value;
                }
            }
            for (var ch in this.childs) {
                if(!this.childs.hasOwnProperty(ch)){
                    continue;
                }
                params['_childs_'] = params['_childs_'] || {};
                params['_childs_'][ch] = this.childs[ch].getChildData();
            }
            return params;
        }
        this.setParams = function () {
        };
        this.getChildData = function () {
            //Переопределить
            return this.getParams();
        }
    }
    this.postObject = function(defProperties){
        postObject.call(this,defProperties);
    }
    function sysinfo_load(sys_array, dom, defProperties, params, obj) {
        var name = D3Api.getProperty(dom, 'name');
        if (!name) {
            D3Api.debug_msg('Загрузка sysinfo. Имя объекта не указано.');
            return;
        }
        sys_array[name] = new postObject(D3Api.mixin(defProperties));
        if (obj)
            obj.sysinfo = sys_array[name];

        for (var i = 0, c = dom.attributes.length; i < c; i++) {
            sys_array[name].properties[dom.attributes[i].name] = dom.attributes[i].value;
        }
        for (var i = 0, c = dom.childNodes.length; i < c; i++) {
            var ch = dom.childNodes[i];
            var nodeName = ch.nodeName.toLowerCase();
            if (nodeName === '#text') continue;
            if (sysinfo_types[nodeName] instanceof Function) {
                sysinfo_types[nodeName](ch, params, sys_array[name]);
            }
        }
        return sys_array[name];
    }

    function sysinfo_parse(dom) {
        var xml = D3Api.parseXML('<sysinfo>' + dom.innerHTML + '</sysinfo>');
        for (var i = 0, c = xml.childNodes.length; i < c; i++) {
            var ch = xml.childNodes[i];
            var nodeName = ch.nodeName.toLowerCase();
            if (nodeName === '#text') continue;
            if (sysinfo_types[nodeName] instanceof Function) {
                sysinfo_types[nodeName](ch);
            }
        }
    }

    function script_parse(dom) {
        try {
            eval(dom.value);
        } catch (e) {
            D3Api.debug_msg(e);
            D3Api.debug_msg(dom.value);
        }
    }

    this.default_parse = function (dom, systemEvents, context, currentUid) {
        var p = '';
        var thisDom = dom;
        if (p = D3Api.getProperty(dom, 'cmptype', false)) {
            if (!dom.id)
                dom.id = D3Api.getUniqId('d3ctrl');

            dom.D3Base = new D3Api.D3Base(dom);
            p = 'cmptype';
        } else if (p = D3Api.getProperty(dom, 'cmpparse', false)) {
            if (p != 'true') {
                thisDom = D3Api.getControlByDom(dom, p);
            }
            thisDom = thisDom || dom;
            dom.D3NotCmp = true;
        } else
            return;

        dom.D3Form = MainForm;
        dom.D3Store = {_setEvents_: {}};
        var attrs = null;
        if (systemEvents) {
            var attrsNeed = {onload: true, onshow: true, oncreate: true, onprepare: true, onclose: true, onformactivate: true};
            for (var i = 0, c = dom.attributes.length; i < c; i++) {
                if (this.execDomEvents[dom.attributes[i].name] === true) {
                    attrs = attrs || {};
                    attrs[dom.attributes[i].name] = dom.attributes[i].value;
                }
                if (!dom.attributes[i] || attrsNeed[dom.attributes[i].name] !== true) continue;
                MainForm.addEvent(dom.attributes[i].name, MainForm.execDomEventFunc(thisDom, dom.attributes[i].value, dom.attributes[i].name));
            }
        }
        if (!attrs) {
            attrs = {};
            for (var i = 0, c = dom.attributes.length; i < c; i++) {
                if (this.execDomEvents[dom.attributes[i].name] === true)
                    attrs[dom.attributes[i].name] = dom.attributes[i].value;
            }
        }
        for (var name in attrs) {
            if(!attrs.hasOwnProperty(name)){
                continue;
            }
            dom.D3Store._setEvents_[name] = true;
            dom[name] = MainForm.execDomEventFunc(thisDom, 'if(callControlEvent(D3Api.getControlByDom(this),\'' + name + '\',event)===false)return;' + attrs[name], name, context);
            if (D3Api.BROWSER.msie) {
                D3Api.setProperty(dom, '_' + name + '_', attrs[name]);
            }
        }
        if (D3Api.BROWSER.msie) {
            attrs = {};
            for (var i = 0, c = dom.attributes.length; i < c; i++) {
                if (this.execDomEventsIE[dom.attributes[i].name] !== undefined)
                    attrs[this.execDomEventsIE[dom.attributes[i].name]] = dom.attributes[i].value;
            }
            for (var name in attrs) {
                if(attrs.hasOwnProperty(name)){
                    dom[name] = MainForm.execDomEventFunc(thisDom, attrs[name], name, context);
                }
            }
        }
        if (p == 'cmptype' && !D3Api.hasProperty(dom, 'isrepeat', false)) {
            MainForm.addEvent('oninit', function () {
                D3Api.BaseCtrl.callMethod(dom, 'init')
            });
            if (D3Api.hasProperty(dom, 'cmpext'))
                MainForm.addEvent('oninit', function () {
                    var ct = D3Api.getProperty(dom,'cmptype');
                    D3Api.setProperty(dom,'cmptype',D3Api.getProperty(dom,'cmpext'));
                    D3Api.BaseCtrl.callMethod(dom, 'init');
                    D3Api.setProperty(dom,'cmptype',ct);
                });
            dom.D3Store._uid_ = D3Api.getUniqId('uid');
        }
        if (D3Api.hasProperty(dom, 'events')) {
            D3Api.setProperty(dom, 'events' + currentUid, D3Api.getProperty(dom, 'events'));
        }
        return dom.D3Store._uid_;
    }

    this.getVar = function (name) {
        var objProp = false;
        if(name.indexOf('.') != -1)
        {
            name = name.split('.');
            objProp = name[1];
            name = name[0];
        }
        if (!this.vars.hasOwnProperty(name))
            D3Api.debug_msg('Переменная "' + name + '" на форме не определенна.');
        return objProp?this.vars[name][objProp]:this.vars[name];
    }
    this.setVar = function (name, value) {
        this.vars[name] = value;
        if (value === undefined)
            delete this.vars[name];
    }
    this.getControlProperty = function (control, nameProperty) {
        if (typeof(control) == 'string') {
            var control = getControl(control);
            if (!control) return;
        }
        return D3Api.getControlPropertyByDom(control, nameProperty);
    }
    this.setControlProperty = function (control, nameProperty, value) {
        if (!Array.isArray(control)) {
            control = [control];
        }

        // Возвращаем 0ой элемент чтобы случайно не сломать интерфейс, по старой логике!
        return control.map(function (control) {
            if (typeof control === 'string') {
                control = getControl(control);

                if (!control) {
                    return;
                }
            }

            return D3Api.setControlPropertyByDom(control, nameProperty, value);
        })[0];
    }
    this.addControlEvent = function (control, eventName, listener) {
        if (typeof(control) == 'string') {
            var control = getControl(control);
            if (!control) return;
        }
        D3Api.addControlEventByDom(control, eventName, listener);
    }
    this.callControlEvent = function (control, eventName) {
        if (typeof(control) == 'string') {
            var control = getControl(control);
            if (!control) return;
        }
        arguments[0] = control;
        return D3Api.callControlEventByDom.apply(this, arguments);
    }
    this.removeControlEvent = function (control, eventName, uniqid) {
        if (typeof(control) == 'string') {
            var control = getControl(control);
            if (!control) return;
        }
        D3Api.removeControlEventByDom(control, eventName, uniqid);
    }
    this.removeControlEvents = function (control, eventName) {
        if (typeof(control) == 'string') {
            var control = getControl(control);
            if (!control) return;
        }
        D3Api.removeControlEventsByDom(control, eventName);
    }
    this.getValue = function (control) {
        return this.getControlProperty(control, 'value');
    }
    this.setValue = function (control, value) {
        return this.setControlProperty(control, 'value', value);
    }
    this.getCaption = function (control) {
        return this.getControlProperty(control, 'caption');
    }
    this.setCaption = function (control, value) {
        return this.setControlProperty(control, 'caption', value);
    }
    this.getEnabled = function (control) {
        return this.getControlProperty(control, 'enabled');
    }
    this.setEnabled = function (control, value) {
        return this.setControlProperty(control, 'enabled', value);
    }
    this.getVisible = function (control) {
        return this.getControlProperty(control, 'visible');
    }
    this.setVisible = function () {
        var ctrls = Array.prototype.concat.apply([], arguments);
        var value = ctrls.pop();

        return this.setControlProperty(ctrls, 'visible', value);
    };
    this.getControl = function (name) {
        var ctrl = this.controlExist(name);
        if (!ctrl)
            D3Api.debug_msg('Компонент не найден: ' + name);

        return ctrl;
    }
    this.removeControl = function (name) {
        var ctrl = this.getControl(name);
        if (ctrl)
            D3Api.removeDom(ctrl);
    }
    this.controlExist = function (name) {
        var ctrl = false;
        var sel = '[cmptype][name="' + name + '"]';

        if (this.currentContext) {
            ctrl = D3Api.getDomBy(this.currentContext, sel);
            if (!ctrl && D3Api.hasProperty(this.currentContext, 'cmptype') && D3Api.getProperty(this.currentContext, 'name') == name) {
                ctrl = this.currentContext;
            }
        }
        if (!ctrl) {
            var ctrls = D3Api.getAllDomBy(this.DOM, sel);

            for (var i = 0; i < ctrls.length; i++) {
                if (ctrls[i].D3Form == this) {
                    return ctrls[i];
                }
            }
            return false;
        }
        if (ctrl && ctrl.D3Form && ctrl.D3Form != this)
            ctrl = false;
        return ctrl;
    };
    this.callControlMethod = function (control, method) {
        if (typeof(control) == 'string') {
            var control = getControl(control);
            if (!control) return;
        }
        return D3Api.BaseCtrl.callMethod.apply(D3Api.BaseCtrl, arguments);
    }
    this.controlAPI = function (control) {
        if (typeof(control) == 'string') {
            var control = getControl(control);
            if (!control) return;
        }
        return D3Api.getControlAPIByDom(control);
    }
    this.setFormCaption = function (caption) {
        if (caption === undefined)
            caption = D3Api.getProperty(this.DOM, 'caption', '');
        else
            D3Api.setProperty(this.DOM, 'caption', caption);

        this.callEvent('onformcaption',caption);
        if (!this.container.DOM.D3FormCaption)
            return;

        this.container.DOM.D3FormCaption._setCaption(caption);
        this.container.DOM.D3FormCaption._setIcon(D3Api.getProperty(this.DOM, 'icon', ''));
        this.container.DOM.D3FormCaption.onclick = showFormMenu;
        if (caption)
            this.container.DOM.D3FormCaption._show();
        else
            this.container.DOM.D3FormCaption._hide();
    }
    this.setFormHint = function (hint) {
        if (!this.container.DOM.D3FormCaption)
            return;
        this.container.DOM.D3FormCaption._setHint(hint);
    }
    this.getFormCaption = function () {
        return D3Api.getProperty(this.DOM, 'caption', '');
    }
    this.getFormIcon = function () {
        return D3Api.getProperty(this.DOM, 'icon', '');
    }
    this.closure = function (func) {
        var clC = this.currentContext;
        var self = this;
        var args = Array.prototype.slice.call(arguments, 1);
        return function () {
            if (self == null)return;
            var curC = self.currentContext;
            self.currentContext = clC;
            func.apply(this, Array.prototype.slice.call(arguments).concat(args));
            if (self == null)return;
            self.currentContext = curC;
        }
    }
    var deepContext = [];
    this.closureContext = function (contextDom) {
        deepContext.push(this.currentContext);
        this.currentContext = contextDom;
    }
    this.unClosureContext = function () {
        this.currentContext = deepContext.pop();
    }
    this.reload = function (closeBefore) {
        var name = this.name;
        var data = this.formData;
        var dom = this.container.DOM;
        if (closeBefore) {
            this.close();
            D3Api.showForm(name, dom, data);
        } else {
            D3Api.showForm(name, dom, data);
            this.close();
        }
    }
    this.showUserReport = function(code,primary,unit,vars,request)
    {
        var vars = vars || {};
        if(primary && controlExist(primary))
        {
            vars.PRIMARY = getValue(primary);
            if(controlExist(primary+'_SelectList'))
                vars.PRIMARY_SelectList = getValue(primary+'_SelectList');
        }else if(primary)
            vars.PRIMARY = primary;
        if(unit)
            vars.UNIT = unit;
        vars.vars = this.vars;

        request = request || {};
        request.report = code;

        openForm('UniversalReportParamForm/UniversalReportParamForm', {request:request, vars:vars});
    }
    function showFormMenu(event) {
        var menu = D3Api.getProperty(MainForm.DOM, 'menu', false);
        if (!menu)
            return;

        var menu = MainForm.getControl(menu);
        if (menu) {
            var cap = MainForm.container.DOM.D3FormCaption;
            var coords = {left: cap.offsetLeft, top: cap.offsetTop + cap.offsetHeight};
            D3Api.PopupMenuCtrl.show(menu, coords);
        }
    }

    this.hideFormCaption = function () {
        if (!this.container.DOM.D3FormCaption)
            return;
        this.container.DOM.D3FormCaption.onclick = null;
        this.container.DOM.D3FormCaption._hide();
    }
    var dataRequests = [];
    this.beginRequest = function () {
        dataRequests[dataRequests.length] = {};
    }
    this.endRequest = function (immediately, sync, onsuccess, onerror) {
        var num = dataRequests.length -1;
        if(!immediately && dataRequests.length > 1){
            //добавляем вызов к предыдущему вызову
            var requests = dataRequests.splice(num, 1);//вытаскиваю стэк из общего вызова
            if(requests && requests.length > 0){
                requests = requests[0];
            }
            if(requests instanceof Object){
                dataRequests[dataRequests.length - 1] = Object.assign(dataRequests[dataRequests.length - 1],requests);
            }else{
                D3Api.debug_msg("Ошибка типа в переменной requests");
                return;
            }
            if (onsuccess instanceof Function){
                onsuccess.call(this);
            }
            return;
        }
        if(dataRequests.length  == 0){
            return;
        }
        var async = !sync;
        var requests = dataRequests.splice(num, 1);//вытаскиваю стэк из общего вызова
        if(requests && requests.length > 0){
            requests = requests[0];
        }
        if(requests instanceof Object){
            if(Object.keys(requests).length == 0){
                if (onsuccess instanceof Function){
                    onsuccess.call(this);
                }
                return;
            }
        }else{
            D3Api.debug_msg("Ошибка типа в переменной requests");
            return;
        }
        //Собираем все события
        onsuccess = {
            _: onsuccess
        };
        onerror = {
            _: onerror
        };
        for (var n in requests) {
            if(!requests.hasOwnProperty(n)){
                continue;
            }
            if (requests[n]._.onsuccess instanceof Function)
                onsuccess[n + '_' + requests[n].type] = requests[n]._.onsuccess;
            if (requests[n]._.onerror instanceof Function)
                onerror[n + '_' + requests[n].type] = requests[n]._.onerror;
            requests[n]._ = null;
            delete requests[n]._;
        }
        var res = [];
        var error = null;
        var errObj = null;
        var that = this;

        var promise = new Promise(function(resolve,reject){
            var infoThread = D3Api.MULTI_REQUEST;//информация об отправляемых запросах(потоках)
            if(!infoThread){
                infoThread = {"MAX_THREAD":"","MAX_REQUEST":""};
            }
            var currThread = 0;
            var nResult = 0;
            requests = D3Api.DataChunk(requests,+infoThread['MAX_REQUEST']);
            var cnt = requests.length;
            if(!infoThread['MAX_THREAD']){
                infoThread['MAX_THREAD'] = cnt;
            }
            function requestServerThread() {
                if(!error){
                    if(currThread >= +infoThread['MAX_THREAD']){
                        return;
                    }
                    var remove;
                    if(requests){
                        remove = requests.splice(0, 1);
                    }
                    if(remove && remove.length > 0){
                        ++currThread;
                        if(Array.isArray(remove)){
                            remove = remove[0];
                        }
                        var headers = {};
                        if('formCache' in that && this.formCache){
                            that.formData.request['FormCache'] = that.formCache;
                        }
                        D3Api.requestServer({
                            url: 'request.php',
                            async: async,
                            method: 'POST',
                            urlData: that.formData.request,
                            data: {request: D3Api.JSONstringify(remove)},
                            onSuccess: function(r){
                                --currThread;
                                ++nResult;
                                res.push(r);
                                requestServerThread();
                            },
                            onError: function(r, rObj){
                                error = r;
                                errObj = rObj;
                                --currThread;
                                ++nResult;
                                requestServerThread();
                            },
                            contextObj: that,
                            headers: headers
                        });
                        requestServerThread();
                    }else{
                        if(nResult >= cnt){
                            resolve(res);
                        }
                    }
                }else{
                    reject({
                        'error': error,
                        'errObj':errObj
                    });
                }
            }
            requestServerThread();
        });
        promise.then(function(_result){
                that.closure(function () {
                    var _arr = [];
                    for(var i = 0, len = _result.length ; i < len ; i++){
                        _arr[i] = JSON.parse(_result[i]);
                    }
                    _result = D3Api.mixin.apply(that,_arr);
                    _result = JSON.stringify(_result);
                    that.acceptRequest(_result, onsuccess, onerror);
                })();
            },
            function(_obj){
                that.closure(function(){
                    that.errorRequest(_obj['error'], _obj['errObj'], onerror);
                })();
            }
        );
    }
    this.sendRequest = function (name, data, sync, onsuccess, onerror) {
        var async = !sync;
        if (async && dataRequests.length > 0) {
            dataRequests[dataRequests.length - 1][name] = data || {};
            dataRequests[dataRequests.length - 1][name]._ = {
                onsuccess: onsuccess,
                onerror: onerror
            };
        } else {
            var reqObj = {};
            reqObj[name] = data;
            var headers = {};
            if('formCache' in this && this.formCache){
                this.formData.request['FormCache'] = this.formCache;
            }

            D3Api.requestServer({
                // url: 'request.php',
                url: 'request.php',
                async: async,
                method: 'POST',
                urlData: this.formData.request,
                data: {request: D3Api.JSONstringify(reqObj)},
                onSuccess: this.closure(function (r) {
                    this.acceptRequest(r, onsuccess, onerror);
                }),
                onError: this.closure(function (r, rObj) {
                    this.errorRequest(r, rObj, onerror);
                }),
                contextObj: this,
                headers: headers
            });
        }
    }
    this.acceptRequest = function (res, onsuccess, onerror) {
       //Долго данные шли, форму уже прикрыли
        if (MainForm == null)
            return;
        var onerrorFunc = null;
        var onsuccessFunc = null;
        try {
            var resObj = JSON.parse(res);
        } catch (e) {
            onerrorFunc = (onerror) ? (onerror._ || onerror) : null;
            if (onerrorFunc instanceof Function)
                onerrorFunc.call(this, res, e);
            D3Api.debug_msg('В ответе сервера: ' + e.message);
            return;
        }
        for (var name in resObj) {
            if(!resObj.hasOwnProperty(name)){
                continue;
            }
            switch (resObj[name].type) {
                case 'DataSet':
                    var ds = dataSets[name];
                    if (!ds) {
                        resObj[name].breakStep = true;
                        break;
                    }
                    if (!ds.allResponse && ds.requestUid != resObj[name].uid && ds.sendRequest == true) {
                        resObj[name].breakStep = true;
                        break;
                    }

                    ds.dataHash = resObj[name].hash;
                    if (typeof resObj[name].locals !== "undefined"){
                        ds.locals = resObj[name].locals;
                    }
                    break;
                case 'Action':
                    var act = actions[name];
                    if (!act) {
                        resObj[name].breakStep = true;
                        break;
                    }
                    break;
                case 'Module':
                    var mod = modules[name];
                    if(!mod){
                        resObj[name].breakStep = true;
                        break;
                    }
            }
        }
        var isError = [];
        for (var name in resObj) {
            if(!resObj.hasOwnProperty(name)){
                continue;
            }
            if (resObj[name].breakStep || D3Api.isUndefined(resObj[name].type))
                continue;
            switch (resObj[name].type) {
                case 'DataSet':
                    if (!D3Api.empty(resObj[name].error)) {
                        var shnot = true;
                        onerrorFunc = (onerror) ? (onerror[name + '_' + resObj[name].type] || onerror) : null;
                        if (onerrorFunc instanceof Function)
                            shnot = onerrorFunc.call(this, res, resObj[name].error);
                        if (shnot !== false)
                        {
                            isError.push(name);
                            D3Api.alert_msg(resObj[name].error);
                        }
                        D3Api.debug_msg(resObj[name].error);
                        break;
                    }

                    var ds = dataSets[name];
                    ds.setResponse(resObj[name]);
                    onsuccessFunc = (onsuccess) ? (onsuccess[name + '_' + resObj[name].type] || onsuccess) : null;
                    if (onsuccessFunc instanceof Function)
                        onsuccessFunc.call(this, res, resObj);
                    break;
                case 'Action':
                    var errorCall = false;
                    if (!D3Api.empty(resObj[name].error)) {
                        errorCall = true;
                        var shnot = true;
                        onerrorFunc = (onerror) ? (onerror[name + '_' + resObj[name].type] || onerror) : null;
                        if (onerrorFunc instanceof Function)
                            shnot = onerrorFunc.call(this, res, resObj[name].error);
                        if (shnot !== false)
                        {
                            isError.push(name);
                            D3Api.alert_msg(resObj[name].error);
                        }
                        D3Api.debug_msg(resObj[name].error);
                        break;
                    }
                    var pCh = function (postObj, childs, errorOnly) {
                        for (var c in childs) {
                            if(!childs.hasOwnProperty(c)){
                                continue;
                            }
                            for (var i = 0, ic = childs[c].length; i < ic; i++) {
                                if (childs[c][i].error !== undefined && (!errorCall || errorOnly)) {
                                    errorCall = true;
                                    var shnot = true;
                                    onerrorFunc = (onerror) ? (onerror[name + '_' + resObj[name].type] || onerror) : null;
                                    if (onerrorFunc instanceof Function)
                                        shnot = onerrorFunc.call(this, res, resObj[name].error);
                                    if (shnot !== false)
                                    {
                                        isError.push(name);
                                        D3Api.alert_msg(childs[c][i].error);
                                    }
                                    D3Api.debug_msg(childs[c][i].error);
                                    return false;
                                } else if (!errorOnly) {
                                    postObj.childs[c].setParams(childs[c][i].data);
                                    if (!pCh(postObj.childs[c], childs[c][i]._childs_))
                                        return false;
                                }
                            }
                        }
                        return true;
                    }
                    if (!pCh(sysinfo[name], resObj[name]._childs_, true))
                        break;
                    var act = actions[name];
                    act.setData(resObj[name].data);
                    if (!pCh(sysinfo[name], resObj[name]._childs_))
                        break;
                    onsuccessFunc = (onsuccess) ? (onsuccess[name + '_' + resObj[name].type] || onsuccess) : null;
                    if (onsuccessFunc instanceof Function)
                        onsuccessFunc.call(this, res, resObj);
                    break;
                case 'Module':
                    var errorCall = false;
                    if (!D3Api.empty(resObj[name].error)) {
                        var shnot = true;
                        errorCall = true;
                        onerrorFunc = (onerror) ? (onerror[name + '_' + resObj[name].type] || onerror) : null;
                        if (onerrorFunc instanceof Function)
                            shnot = onerrorFunc.call(this, res, resObj[name].error);
                        if (shnot !== false)
                        {
                            isError.push(name);
                            D3Api.alert_msg(resObj[name].error);
                        }
                        D3Api.debug_msg(resObj[name].error);
                        break;
                    }
                    var act = modules[name];
                    act.setData(resObj[name].data);
                    onsuccessFunc = (onsuccess) ? (onsuccess[name + '_' + resObj[name].type] || onsuccess) : null;
                    if (onsuccessFunc instanceof Function)
                        onsuccessFunc.call(this, res, resObj);
                    break;
                    break;
                default:
                    if (!D3Api.empty(resObj[name].error)) {
                        var shnot = true;
                        onerrorFunc = (onerror) ? (onerror[name + '_' + resObj[name].type] || onerror) : null;
                        if (onerrorFunc instanceof Function)
                            shnot = onerrorFunc.call(this, res, resObj[name].error);
                        if (shnot !== false)
                        {
                            isError.push(name);
                            D3Api.alert_msg(resObj[name].error);
                        }
                        D3Api.debug_msg(resObj[name].error);
                        break;
                    }
                    onsuccessFunc = (onsuccess) ? (onsuccess[name + '_' + resObj[name].type] || onsuccess) : null;
                    if (onsuccessFunc instanceof Function)
                        onsuccessFunc.call(this, res, resObj);
                    break;
            }
        }
        onerrorFunc = (onerror) ? (onerror._) : null;
        if(isError.length > 0 && onerrorFunc instanceof Function)
        {
            onerrorFunc.call(this, res, resObj, isError);
            return;
        }
        onsuccessFunc = (onsuccess) ? (onsuccess._) : null;
        if (isError.length == 0 && onsuccessFunc instanceof Function)
            onsuccessFunc.call(this, res, resObj);
    }
    this.errorRequest = function (res, resObj, onerror) {
        if (onerror instanceof Function)
            onerror.call(this, res, resObj);
        else if(onerror)
        {
            for (var n in onerror) {
                if(!onerror.hasOwnProperty(n)){
                    continue;
                }
                if (n != '_' && onerror[n] instanceof Function)
                    onerror[n].call(this, res, resObj);
            }
            if(onerror._ instanceof Function)
            {
                onerror._.call(this, res, resObj);
            }
        }
    }

    /**JSONRPC вызов**/
    this.rpcCall = function(httpmethod, unit, method, data, onsuccess, onerror) {
        var search = decodeURIComponent(window.location.search);
        var arrSearch = search.split(/[?&]/);
        var urlData = {};

        if (!data || typeof data !== 'object') {
            data = {};
        }

        for (var i = 0; i < arrSearch.length; i++) {
            var arrItem = arrSearch[i].split('=');

            if (!arrItem[0] || httpmethod === 'GET' && arrItem[0] in data) {
                continue;
            }
            urlData[arrItem[0]] = arrItem[1] || '';
        }

        D3Api.requestServer({
            url: 'rpc/' + unit + '/' + method,
            async: true,
            method: httpmethod,
            content_type: 'application/text+json',
            urlData: urlData,
            data: (httpmethod === 'POST') ? D3Api.JSONstringify(data) : data,
            onSuccess: this.closure(function (response) {
                try {
                    response = D3Api.JSONparse(response);
                    if (response.status === 'error') {
                        throw new Error(response.message);
                    }
                    if (typeof onsuccess === 'function') {
                        onsuccess.call(this, response.response);
                    }
                } catch(e) {
                    if (typeof onerror === 'function') {
                        onerror.call(this, e.message);
                    } else {
                        D3Api.alert_msg('ОШИБКА: ' + e.message);
                    }
                }
            }),
            onError: this.closure(function (response, reqObj) {
                if (typeof onerror === 'function') {
                    onerror.call(this, 'Сервер временно недоступен!');
                } else {
                    D3Api.alert_msg('ОШИБКА: Сервер временно недоступен!');
                }
            }),
            contextObj: this
        });
    };
    this.rpcGet = function (unit, method, data, onsuccess, onerror) {
        this.rpcCall('GET', unit, method, data, onsuccess, onerror);
    };
    this.rpcPost = function (unit, method, data, onsuccess, onerror) {
        this.rpcCall('POST', unit, method, data, onsuccess, onerror);
    };
    /**JSONRPC вызов**/

    this.refreshDataSet = function (name, onsuccess, onerror, sync, force, details) {
        var ds = dataSets[name];
        if (!ds) {
            D3Api.debug_msg('DataSet с именем "' + name + '" не найден на форме "' + this.name + '"');
            return;
        }
        ds.refresh(onsuccess, onerror, sync, force, details);
    }
    this.refreshDataSetByMode = function (name, mode, data, onsuccess, onerror, sync) {
        var ds = dataSets[name];
        if (!ds) {
            D3Api.debug_msg('DataSet с именем "' + name + '" не найден на форме "' + this.name + '"');
            return;
        }
        ds.refreshByMode(mode, data, onsuccess, onerror, sync);
    }
    this.getDataSet = function (name) {
        return dataSets[name];
    }
    this.getRepeater = function (name) {
        return repeaters[name];
    }
    this.getClone = function (dom, repeaterName) {
        while (dom && dom.nodeName.toUpperCase() != 'HTML') {
            if (dom.clone && (!repeaterName || D3Api.getProperty(dom, 'repeatername') == repeaterName))
                return dom;
            dom = dom.parentNode;
        }
        return null;
    }
    this.executeModule = function(name,onsuccess,onerror,sync,force){
        var mod = modules[name];
        if(!mod){
            D3Api.debug_msg('Module с именем "' + name + '" не найден на форме "' + this.name + '"');
            return;
        }
        mod.execute(onsuccess,onerror,sync,force)
    }
    this.executeAction = function (name, onsuccess, onerror, sync, force) {
        var act = actions[name];
        if (!act) {
            D3Api.debug_msg('Action с именем "' + name + '" не найден на форме "' + this.name + '"');
            return;
        }
        act.execute(onsuccess, onerror, sync, force);
    }
    this.getAction = function (name) {
        return actions[name];
    }
    this.openForm = function (name, data, container) {
        container = container || this.container.DOM;
        var open_modal_cont = D3Api.getDomBy(D3Api.D3MainContainer, 'div[id="open_modal"]');
        /*если окно открывается в модальном режиме*/
        if((data && String(data.modal_form)=='true')){
            /*и контейнера для модалки нет, то создаем его*/
            if(!open_modal_cont){
                var open_modal       = document.createElement("div"),
                    close_open_modal = document.createElement("div");
                open_modal.id               = 'open_modal';
                open_modal.style.cssText    = 'position: fixed; width: 100%; height: 100%; top: 0px; left: 0px; display: none;background: #f9f9f9aa;z-index: 3;';
                close_open_modal.className  = 'close_open_modal fa-times fas';
                open_modal.appendChild(close_open_modal);
                open_modal_cont = D3Api.MainDom.appendChild(open_modal);
                close_open_modal.onclick = function() {
                    D3Api.close_modal_form();
                };
                D3Api.showDomBlock(open_modal_cont);
            }else if(!D3Api.showedDom(open_modal_cont)){
                /*если есть контейнер для модалки, то просто показываем его*/
                D3Api.showDomBlock(open_modal_cont);
            }
            container = open_modal_cont;
        }

        return D3Api.showForm(name, container, data, _GCF());
    }
    function _GCF() {
        return D3Api.GLOBAL_CONTEXT_FORM || MainForm;
    }

    /* Глобальные функции для использования внутри пространства скрипта формы */
    function getVar(name) {
        return _GCF().getVar(name);
    }

    function setVar(name, value) {
        return _GCF().setVar(name, value);
    }

    function getControlProperty(controlName, nameProperty) {
        return _GCF().getControlProperty(controlName, nameProperty);
    }

    function setControlProperty(controlName, nameProperty, value) {
        return _GCF().setControlProperty(controlName, nameProperty, value);
    }

    function addControlEvent(control, eventName, listener) {
        return _GCF().addControlEvent(control, eventName, listener)
    }

    function callControlEvent(control, eventName) {
        return _GCF().callControlEvent.apply(_GCF(), arguments);
    }

    function removeControlEvent(control, eventName, uniqid) {
        return _GCF().removeControlEvent(control, eventName, uniqid);
    }

    function removeControlEvents(control, eventName) {
        return _GCF().removeControlEvents(control, eventName);
    }

    function getValue(control) {
        return _GCF().getValue(control);
    }

    function setValue(control, value) {
        return _GCF().setValue(control, value);
    }

    function getCaption(control) {
        return _GCF().getCaption(control);
    }

    function setCaption(control, value) {
        return _GCF().setCaption(control, value);
    }

    function getEnabled(control) {
        return _GCF().getEnabled(control);
    }

    function setEnabled(control, value) {
        return _GCF().setEnabled(control, value);
    }

    function getVisible(control) {
        return _GCF().getVisible(control);
    }

    function setVisible() {
        var ctx = _GCF();

        return ctx.setVisible.apply(ctx, arguments);
    }

    function getControl(name) {
        return _GCF().getControl(name);
    }

    function controlExist(name) {
        return _GCF().controlExist(name);
    }

    function getDataSet(name) {
        return _GCF().getDataSet(name);
    }

    function getRepeater(name) {
        return _GCF().getRepeater(name);
    }

    function getClone(dom, repeaterName) {
        return _GCF().getClone(dom, repeaterName);
    }

    function getAction(name) {
        return _GCF().getAction(name);
    }

    function beginRequest() {
        return _GCF().beginRequest();
    }

    function endRequest(immediately, sync, onsuccess, onerror) {
        return _GCF().endRequest(immediately, sync, onsuccess, onerror);
    }

    function refreshDataSet(name, onsuccess, onerror, sync, force, details) {
        return _GCF().refreshDataSet(name, onsuccess, onerror, sync, force, details);
    }

    function refreshDataSetByMode(name, mode, data, onsuccess, onerror, sync) {
        return _GCF().refreshDataSetByMode(name, mode, data, onsuccess, onerror, sync);
    }

    function executeModule(name,onsuccess,onerror,sync,force){
        return _GCF().executeModule(name,onsuccess,onerror,sync,force)
    }
    function executeAction(name, onsuccess, onerror, sync, force) {
        return _GCF().executeAction(name, onsuccess, onerror, sync, force);
    }

    function rpcPost(unit,method,data,onsuccess,onerror) {
        return _GCF().rpcPost(unit,method,data,onsuccess,onerror);
    }

    function rpcGet(unit,method,data,onsuccess,onerror) {
        return _GCF().rpcGet(unit,method,data,onsuccess,onerror);
    }

    function openForm(name, data, container) {
        return _GCF().openForm(name, data, container);
    }

    function close() {
        if (typeof $(this).get(0).dom !== "undefined"){
            var name = $(this).get(0).dom.offsetParent.id;
            $("table.window-d3#"+name+" ").empty().remove();
            $("#backGround"+name+" ").empty().remove();
        }
        return _GCF().close.apply(_GCF(), arguments);
    }

    function reload(closeBefore) {
        return _GCF().reload(closeBefore);
    }

    function closure(func) {
        return _GCF().closure.apply(_GCF(), arguments);
    }

    function closureContext(contextDom) {
        return _GCF().closureContext(contextDom);
    }

    function unClosureContext() {
        return _GCF().unClosureContext();
    }

    function empty(v) {
        return D3Api.empty(v);
    }

    function setFormCaption(caption) {
        return _GCF().setFormCaption(caption);
    }

    function setFormHint(hint) {
        return _GCF().setFormHint(hint);
    }

    function getFormCaption() {
        return _GCF().getFormCaption();
    }

    function callControlMethod(control, method) {
        return _GCF().callControlMethod.apply(_GCF(), arguments);
    }

    function controlAPI(control) {
        return _GCF().controlAPI(control);
    }

    function cancelActivateDataSet(ds) {
        var dts = ds.split(';');
        var ind = -1;
        for (var i = 0, c = dts.length; i < c; i++) {
            ind = activateDataSets.indexOf(dts[i]);
            if (ind >= 0)
                activateDataSets.splice(ind, 1);
        }
    }

    function notify(text, title, modal) {
        title = title || 'Сообщение';
        modal = (modal === undefined) ? false : modal;

        D3Api.notify(title, text, {modal: modal});
    }
    function showUserReport(code,primary,unit,vars,request)
    {
        return _GCF().showUserReport(code,primary,unit,vars,request);
    }
    /**********************************************************************/
    this.showAfterCheck = function (data, dom) {
        if (data.newthread) {
            D3Api.threads[data.newthread].addForm(this);
            data.newthread = undefined;
            delete data.newthread;
        } else if (!data.notthread && dom == D3Api.MainDom && D3Api.MainDom.D3Container && D3Api.MainDom.D3Container.currentForm && D3Api.MainDom.D3Container.currentForm.D3Thread) {
            //Проверим если открывается в основном контейнере и если это нить, то добавляем форму в стек нити
            D3Api.MainDom.D3Container.currentForm.D3Thread.addForm(this);
        } else {
            //Надо сделать ссылку на нить, для замыкания событий
            var cCD = dom;
            while (cCD && cCD != D3Api.MainDom) {
                if (cCD.D3Container && cCD.D3Container.currentForm && cCD.D3Container.currentForm.D3Thread) {
                    this.D3Thread = cCD.D3Container.currentForm.D3Thread;
                    break;
                }
                if (cCD.D3Form && cCD.D3Form.D3Thread) {
                    this.D3Thread = cCD.D3Form.D3Thread;
                    break;
                }
                cCD = cCD.parentNode;
            }
        }
        if (data.oncreate) {
            if (data.oncreate instanceof Function) {
                var dataOnCreate = data.oncreate;
                this.addEvent('oncreate', function () {
                    var GCF = D3Api.GLOBAL_CONTEXT_FORM;
                    D3Api.GLOBAL_CONTEXT_FORM = MainForm;
                    try {
                        var res = dataOnCreate.apply(this, arguments);
                    } catch (e) {
                        D3Api.debug_msg(e);
                    }
                    D3Api.GLOBAL_CONTEXT_FORM = GCF;
                    return res;
                });
            }
            else if (data.oncreate instanceof Array) {
                for (var i = 0, ic = data.oncreate.length; i < ic; i++) {
                    if (data.oncreate[i] instanceof Function)
                        this.addEvent('oncreate', function (dataOnCreate) {
                            return function () {
                                var GCF = D3Api.GLOBAL_CONTEXT_FORM;
                                D3Api.GLOBAL_CONTEXT_FORM = MainForm;
                                try {
                                    var res = dataOnCreate.apply(this, arguments);
                                } catch (e) {
                                    D3Api.debug_msg(e);
                                }
                                D3Api.GLOBAL_CONTEXT_FORM = GCF;
                                return res;
                            }
                        }(data.oncreate[i]));
                }
            }
            delete data['oncreate'];
        }
        if (data.onprepare) {
            if (data.onprepare instanceof Function) {
                var dataOnPrepare = data.onprepare;
                this.addEvent('onprepare', function () {
                    var GCF = D3Api.GLOBAL_CONTEXT_FORM;
                    D3Api.GLOBAL_CONTEXT_FORM = MainForm;
                    try {
                        var res = dataOnPrepare.apply(this, arguments);
                    } catch (e) {
                        D3Api.debug_msg(e);
                    }
                    D3Api.GLOBAL_CONTEXT_FORM = GCF;
                    return res;
                });
            }
            else if (data.onprepare instanceof Array) {
                for (var i = 0, ic = data.onprepare.length; i < ic; i++) {
                    if (data.onprepare[i] instanceof Function)
                        this.addEvent('onprepare', function (dataOnPrepare) {
                            return function () {
                                var GCF = D3Api.GLOBAL_CONTEXT_FORM;
                                D3Api.GLOBAL_CONTEXT_FORM = MainForm;
                                try {
                                    var res = dataOnPrepare.apply(this, arguments);
                                } catch (e) {
                                    D3Api.debug_msg(e);
                                }
                                D3Api.GLOBAL_CONTEXT_FORM = GCF;
                                return res;
                            }
                        }(data.onprepare[i]));
                }
            }
            delete data['onprepare'];
        }
        if (data.onshow) {
            if (data.onshow instanceof Function) {
                var dataOnShow = data.onshow;
                this.addEvent('onshow', function () {
                    var GCF = D3Api.GLOBAL_CONTEXT_FORM;
                    D3Api.GLOBAL_CONTEXT_FORM = MainForm;
                    try {
                        var res = dataOnShow.apply(this, arguments);
                    } catch (e) {
                        D3Api.debug_msg(e);
                    }
                    D3Api.GLOBAL_CONTEXT_FORM = GCF;
                    return res;
                });
            }
            else if (data.onshow instanceof Array) {
                for (var i = 0, ic = data.onshow.length; i < ic; i++) {
                    if (data.onshow[i] instanceof Function)
                        this.addEvent('onshow', function (dataOnShow) {
                            return function () {
                                var GCF = D3Api.GLOBAL_CONTEXT_FORM;
                                D3Api.GLOBAL_CONTEXT_FORM = MainForm;
                                try {
                                    var res = dataOnShow.apply(this, arguments);
                                } catch (e) {
                                    D3Api.debug_msg(e);
                                }
                                D3Api.GLOBAL_CONTEXT_FORM = GCF;
                                return res;
                            }
                        }(data.onshow[i]));
                }
            }
            delete data['onshow'];
        }
        if (data.onclose) {
            if (data.onclose instanceof Function) {
                var dataOnClose = data.onclose;
                var dataCC = data._currentContext_;
                var dataCF = data._contextForm_;
                this.addEvent('onclose', function () {
                    var GCF = D3Api.GLOBAL_CONTEXT_FORM;
                    D3Api.GLOBAL_CONTEXT_FORM = dataCF;
                    closureContext(dataCC);
                    try {
                        var res = dataOnClose.apply(this, arguments);
                    } catch (e) {
                        D3Api.debug_msg(e);
                    }
                    unClosureContext();
                    D3Api.GLOBAL_CONTEXT_FORM = GCF;
                    return res;
                });
            }
            else if (data.onclose instanceof Array) {
                for (var i = 0, ic = data.onclose.length; i < ic; i++) {
                    if (data.onclose[i] instanceof Function)
                        this.addEvent('onclose', data.onclose[i]);
                }
            }
            delete data['onclose'];
        }
        if (data.onformactivate) {
            if (data.onformactivate instanceof Function) {
                var dataOnFormActivate = data.onformactivate;
                this.addEvent('onformactivate', function () {
                    var GCF = D3Api.GLOBAL_CONTEXT_FORM;
                    D3Api.GLOBAL_CONTEXT_FORM = MainForm;
                    try {
                        var res = dataOnFormActivate.apply(this, arguments);
                    } catch (e) {
                        D3Api.debug_msg(e);
                    }
                    D3Api.GLOBAL_CONTEXT_FORM = GCF;
                    return res;
                });
            }
            else if (data.onformactivate instanceof Array) {
                for (var i = 0, ic = data.onformactivate.length; i < ic; i++) {
                    if (data.onformactivate[i] instanceof Function)
                        this.addEvent('onformactivate', function (dataOnFormActivate) {
                            return function () {
                                var GCF = D3Api.GLOBAL_CONTEXT_FORM;
                                D3Api.GLOBAL_CONTEXT_FORM = MainForm;
                                try {
                                    var res = dataOnFormActivate.apply(this, arguments);
                                } catch (e) {
                                    D3Api.debug_msg(e);
                                }
                                D3Api.GLOBAL_CONTEXT_FORM = GCF;
                                return res;
                            }
                        }(data.onformactivate[i]));
                }
            }
            delete data['onformactivate'];
        }
        if (data.vars) {
            for (var v in data.vars) {
                if(!data.vars.hasOwnProperty(v)){
                    continue;
                }
                this.vars[v] = data.vars[v];
            }
        }
        if (data.icon) {
            D3Api.setProperty(this.DOM, 'icon', data.icon);
        }
        if (data.caption) {
            D3Api.setProperty(this.DOM, 'caption', data.caption);
        }
        if (data.modal) {
            _modalBorders_.top = document.createElement('DIV');
            _modalBorders_.right = document.createElement('DIV');
            _modalBorders_.bottom = document.createElement('DIV');
            _modalBorders_.left = document.createElement('DIV');

            D3Api.addClass(_modalBorders_.top, 'formModalBorder');
            D3Api.addClass(_modalBorders_.right, 'formModalBorder');
            D3Api.addClass(_modalBorders_.bottom, 'formModalBorder');
            D3Api.addClass(_modalBorders_.left, 'formModalBorder');

            D3Api.addDom(document.body, _modalBorders_.top);
            D3Api.addDom(document.body, _modalBorders_.right);
            D3Api.addDom(document.body, _modalBorders_.bottom);
            D3Api.addDom(document.body, _modalBorders_.left);
        }
        this.formData = data;

        this.formStyles = D3Api.getAllDomBy(this.DOM, 'style');

        //Нет форм
        if (!dom.D3Container) {
            dom.D3Container = new D3Api.D3Container(dom);
            dom.D3Container.lastForm = this;
        }
        if (dom.D3Container.currentForm) {
            if (dom.D3Container.currentForm.rightForm) {
                var rF = dom.D3Container.currentForm.rightForm;
                var tmp = null;
                while (rF && dom.D3Container.currentForm.D3Thread == rF.D3Thread) {
                    tmp = rF;
                    if (rF.rightForm)
                        rF = rF.rightForm;
                    else
                        rF = null;
                    if (!tmp.destroyed)
                        tmp.destructor();
                }
            }
            this.leftForm = dom.D3Container.currentForm;
            dom.D3Container.currentForm.rightForm = this;
            dom.D3Container.countForm++;
            dom.D3Container.lastActiveForm = dom.D3Container.currentForm;
            RemoveFormFromCont.call(dom.D3Container.currentForm, dom, dom.D3Container.currentForm.DOM);
        }
        this.container = dom.D3Container;
        this.addHistory();

        dom.D3Container.setCurrentForm(this);
        InsertFormToCont.call(this, dom);

        this.isShowed = true;

        this.loadParams(this.onCreateForm);
    };
    this.show = function (data, dom) {
        if (this.isShowed) {
            D3Api.debug_msg('Форма уже показана');
            return;
        }

        this.formCheckPrivs = D3Api.getProperty(this.DOM, 'check_privs') == 'true' ? true : false;
        this.formCheckCreated = D3Api.getProperty(this.DOM, 'check_created') == 'true' ? true : false;
        this.formSkipRefresh = D3Api.getProperty(this.DOM, 'skip_refresh') == 'true' ? true : false;

        this.formUnit = D3Api.getProperty(this.DOM, 'unit');
        this.formPrimary = D3Api.getProperty(this.DOM, 'primary', 'PRIMARY');
        var subunits = D3Api.getProperty(this.DOM, 'subunits'); // в формате unit:pid:id, где pid - имя поля с FK основного раздела, id - имя PRIMARY поля в дочернем разделе

        /* находим ID основного раздела по записи detail раздела */
        if (this.formUnit && subunits && data.request && data.request.unit && data.request.unit != this.formUnit){
            var subunit = null; // подраздел
            subunits = subunits.split(';');
            // ищем в атрибуте правило для соответствующего подраздела
            subunits.forEach(function (item) {
                if (item.split(':')[0] == data.request.unit) subunit = item;
            });

            var req = {
                getMainUnit: {type: 'Form', params: {
                    id: D3Api.getValueInObj(this.formPrimary, data.vars),
                    subunit: subunit
                }}
            };

            D3Api.requestServer({
                url: 'request.php',
                method: 'POST',
                urlData:{action: 'main_unit'},
                data: {request: D3Api.JSONstringify(req)},
                contextObj:this,
                onSuccess: function(r) {
                    var result = JSON.parse(r);
                    if (!data.vars) data.vars = {};
                    if (result.unit_PRIMARY) data.vars['UNIT_PRIMARY'] = result.unit_PRIMARY;
                    if (result.subunit_PRIMARY) data.vars[data.request.unit+'_PRIMARY'] = result.subunit_PRIMARY;

                    this.showAfterCheck(data, dom);
                }
            });
        }
        else{
            this.showAfterCheck(data, dom);
        }
    };
    this.onCreateForm = function () {
        if (scriptsLoad > 0) {
            setTimeout(function () {
                MainForm.onCreateForm();
            }, 100);
            return;
        }

        this.callEvent('oninit');
        this.callEvent('onprepare', this);
        this.callEvent('oncreate', this);
        this.beginRequest();
        for (var i = 0, c = activateDataSets.length; i < c; i++) {
            this.refreshDataSet(activateDataSets[i],null,null,false,null,false);
        }
        //Загрузить параметры формы
        //executeAction();
        activateDataSets = null;
        this.endRequest(true, false, this.onShowForm, this.onShowForm);
        //проверяем наличии блока вкладок, запускаем отрисовку только если он есть
        if(this.container.DOM.D3ThreadsTabs && D3Api.MainDom.D3Container && D3Api.MainDom.D3Container.currentForm == this){
            this.container.DOM.D3ThreadsTabs._refresh(this);
        }
    };

    this.onShowForm = function () {
        /* дожидаемся завершения работы пользовательского onCreate (опционально) */
        if (this.formCheckCreated && !this.isCreated){
            setTimeout(function () {
                if (MainForm) MainForm.onShowForm();
            }, 100);
            return;
        }

        resizeForm(this.DOM);
        //поставить фокус на первый контрол
        var focussableElements = 'input:not([disabled])';
        var focussable = this.DOM.querySelectorAll(focussableElements);
        if(focussable && focussable.length > 0)
        {
            var inp = focussable[0];
            inp.focus();
        }

        var dom = this;
        /* D3Api.D3Form.onRefreshForm - кастомная для каждого проекта функция,
        * выполняющая обязательные действия для всех форм (например, проверку прав)
        * Объявляется в Extensions/[МОДУЛЬ]/System/js/common.js */
        if (!this.formSkipRefresh && D3Api.D3Form.onRefreshForm)
            D3Api.D3Form.onRefreshForm(dom, function(){
                dom.callEvent('onshow', dom);
            });
        else
            dom.callEvent('onshow', dom);
    };

    function InsertFormToCont(contDOM, FormDOM) {
        FormDOM = FormDOM || this.DOM;
        if (FormDOM.parentNode != contDOM) {
            if (contDOM.firstChild)
                D3Api.insertBeforeDom(contDOM.firstChild, FormDOM);
            else
                D3Api.addDom(contDOM, FormDOM);
        } else
            D3Api.showDomBlock(FormDOM);

        D3Api.MainDom.D3FormCloseCtrl && D3Api.setControlPropertyByDom(D3Api.MainDom.D3FormCloseCtrl, 'visible', true);
        D3Api.MainDom.D3FormHelp && D3Api.MainDom.D3FormHelp._show(this);
        if (_modalBorders_.top) {
            D3Api.setDomDisplayDefault(_modalBorders_.top);
            D3Api.setDomDisplayDefault(_modalBorders_.right);
            D3Api.setDomDisplayDefault(_modalBorders_.bottom);
            D3Api.setDomDisplayDefault(_modalBorders_.left);
        }

        this.isActive = true;

        for (var i = 0, c = this.formStyles.length; i < c; i++) {
            D3Api.addDom(FormDOM, this.formStyles[i]);
        }
        //if(this.isShowed)
        resizeForm(FormDOM);

        var chforms = D3Api.getAllDomBy(FormDOM, '[formname]');
        for (var i = 0, c = chforms.length; i < c; i++) {
            if (chforms[i].D3Form && chforms[i].D3Form.formUid != this.formUid && chforms[i].D3Form.isActive) {
                chforms[i].D3Form.parentFormShow();
            }
        }

        for (var i = 0, c = this.scrollDoms.length; i < c; i++) {
            if (this.scrollDoms[i].top > 0) {
                this.scrollDoms[i].dom.scrollTop = this.scrollDoms[i].top;
            }
            if (this.scrollDoms[i].left > 0) {
                this.scrollDoms[i].dom.scrollLeft = this.scrollDoms[i].left;
            }
        }
        this.scrollDoms = [];
        /*if (D3Api.getProperty(FormDOM, 'effects', false))
         {
         $(FormDOM).hide();
         setTimeout(function(){$(FormDOM).show('slide',{duration: 200, direction: 'left'});},200);
         }*/
        this.setFormCaption();

        this.callEvent('onform_dominsert', FormDOM);
    }
    function clearSelection()
    {
        if (window.getSelection) {
            var selection = window.getSelection();

            if (selection.rangeCount > 0 && selection.getRangeAt(0).getClientRects().length > 0) {
                selection.removeAllRanges();
            }
        } else { // старый IE
            document.selection.empty();
        }
    }

    function RemoveFormFromCont(contDOM, FormDOM) {
        clearSelection();
        this.saveParams(true);
        var chforms = D3Api.getAllDomBy(this.DOM, '[formname]');
        for (var i = 0, c = chforms.length; i < c; i++) {
            if (chforms[i].D3Form && chforms[i].D3Form.formUid != this.formUid && chforms[i].D3Form.isActive) {
                chforms[i].D3Form.saveParams(true);
                chforms[i].D3Form.parentFormHide();
            }
        }
        this.hideFormCaption();
        FormDOM = FormDOM || this.DOM;
        contDOM = contDOM || FormDOM.parentNode;

        var scR = D3Api.getAllDomBy(FormDOM, '[scrollable]');
        this.scrollDoms = [];
        for (var i = 0, c = scR.length; i < c; i++) {
            if (scR[i].scrollTop > 0 || scR[i].scrollLeft > 0) {
                this.scrollDoms.push({
                    dom: scR[i],
                    top: scR[i].scrollTop,
                    left: scR[i].scrollLeft
                });
            }
        }
        if (FormDOM.scrollTop > 0 || FormDOM.scrollLeft > 0) {
            this.scrollDoms.push({
                dom: FormDOM,
                top: FormDOM.scrollTop,
                left: FormDOM.scrollLeft
            });
        }
        /*if (D3Api.getProperty(FormDOM, 'effects', false))
         {
         $(FormDOM).hide('slide',{duration: 200, direction: 'right'},function(){contDOM.removeChild(FormDOM)});
         }else*/
        if (_modalBorders_.top) {
            D3Api.hideDom(_modalBorders_.top);
            D3Api.hideDom(_modalBorders_.right);
            D3Api.hideDom(_modalBorders_.bottom);
            D3Api.hideDom(_modalBorders_.left);
        }
        if (D3Api.BROWSER.msie && D3Api.BROWSER.versionMajor < 9) {
            D3Api.removeDom(FormDOM);
        } else
            D3Api.hideDom(FormDOM);
        this.isActive = false;
        for (var i = 0, c = this.formStyles.length; i < c; i++) {
            D3Api.removeDom(this.formStyles[i]);
        }
        //contDOM.removeChild(FormDOM);
        this.callEvent('onform_domremove', FormDOM);
    }

    this.parentFormShow = function () {
        if (_modalBorders_.top) {
            D3Api.MainDom.D3FormCloseCtrl && D3Api.setControlPropertyByDom(D3Api.MainDom.D3FormCloseCtrl, 'visible', false);
            D3Api.MainDom.D3FormHelp && D3Api.setControlPropertyByDom(D3Api.MainDom.D3FormHelp, 'visible', false);
            D3Api.setDomDisplayDefault(_modalBorders_.top);
            D3Api.setDomDisplayDefault(_modalBorders_.right);
            D3Api.setDomDisplayDefault(_modalBorders_.bottom);
            D3Api.setDomDisplayDefault(_modalBorders_.left);
        }
        resizeForm(this.DOM);
    }
    this.parentFormHide = function () {
        if (_modalBorders_.top) {
            D3Api.hideDom(_modalBorders_.top);
            D3Api.hideDom(_modalBorders_.right);
            D3Api.hideDom(_modalBorders_.bottom);
            D3Api.hideDom(_modalBorders_.left);
        }
    }
    this.addHistory = function () {
        var addHist = true;
        if (Form._pushHistory_ instanceof Function) {
            addHist = Form._pushHistory_(this.container);
        }
        if (addHist && this.formData.history !== false) {
            D3Api.globalClientData.set('history_state', D3Api.JSONstringify({form: this.name, data: this.formData}, true, /^_.+_$/));
            //window.history.pushState(D3Api.JSONstringify({form: this.name, data: this.formData},true),'');
        }
    }
    this.activate = function () {
        if (this.destroyed)
        {
            D3Api.debug_msg('Попытка активировать не существующую форму.');
            return;
        }
        if (this.container.currentForm == this)
            return;
        if (this.container.currentForm) {
            this.container.lastActiveForm = this.container.currentForm;
            RemoveFormFromCont.call(this.container.currentForm, this.container.DOM, this.container.currentForm.DOM);
        }
        this.container.setCurrentForm(this);
        this.addHistory();
        InsertFormToCont.call(this, this.container.DOM);
        this.callEvent('onformactivate', this);
        var chforms = D3Api.getAllDomBy(this.DOM, '[formname]');
        for (var i = 0, c = chforms.length; i < c; i++) {
            if (chforms[i].D3Form && chforms[i].D3Form.formUid != this.formUid && !chforms[i].D3Form.destroyed)
                chforms[i].D3Form.callEvent('onformactivate', chforms[i].D3Form);
        }
    }
    this.destructor = function (destroyOnly) {
        if (this.isActive) {
            this.saveParams(true);
            //TODO: Закрыть все соединения с сервером
            //requests.abort();

            if (!destroyOnly) {
                if (this.container.currentForm == this) {
                    this.setFormCaption('');
                    this.container.setCurrentForm(null);
                    var lF = this.leftForm;
                    while (lF && lF.destroyed) {
                        lF = lF.leftForm;
                    }
                    if (lF) {
                        lF.activate();
                        lF.rightForm = null;
                    }
                } else if (this.container.lastForm == this) {
                    this.rightForm.leftForm = null;
                    this.container.lastForm = this.rightForm;
                } else if (this.leftForm && this.rightForm) // В середине очереди
                    this.leftForm.rightForm = this.rightForm;

                if (this.container.lastActiveForm == this) {
                    this.container.lastActiveForm = null;
                }

                this.container.countForm--;
                if (this.container.countForm <= 0) {
                    this.container.setCurrentForm(null);
                    this.container.lastForm = null;
                    if (this.container.DOM != D3Api.MainDom) {
                        this.container.DOM.D3Container = null;
                        delete this.container.DOM.D3Container;
                    }
                }
            }
        }
        D3Api.Base.removeEvent('onResize', resizeEventUid);
        D3Api.MainDom.D3FormCloseCtrl && D3Api.setControlPropertyByDom(D3Api.MainDom.D3FormCloseCtrl, 'visible', true);
        D3Api.MainDom.D3FormHelp && D3Api.MainDom.D3FormHelp._show(this);
        if (_modalBorders_.top) {
            D3Api.removeDom(_modalBorders_.top);
            D3Api.removeDom(_modalBorders_.right);
            D3Api.removeDom(_modalBorders_.bottom);
            D3Api.removeDom(_modalBorders_.left);
            _modalBorders_.top = null;
            _modalBorders_.right = null;
            _modalBorders_.bottom = null;
            _modalBorders_.left = null;
            _modalBorders_ = null;
        }
        if (this.D3Thread) {
            this.D3Thread.removeForm(this);
        }
        Form = null;
        MainForm = null;
        for (var rep in repeaters) {
            if(!repeaters.hasOwnProperty(rep)){
                continue;
            }
            repeaters[rep].destructor();
        }
        repeaters = null;
        for (var ds in dataSets) {
            if(!dataSets.hasOwnProperty(ds)){
                continue;
            }
            dataSets[ds].destructor();
        }
        dataSets = null;
        for (var act in actions) {
            if(!actions.hasOwnProperty(act)){
                continue;
            }
            actions[act].destructor();
        }
        for (var mod in modules){
            if(!modules.hasOwnProperty(mod)){
                continue;
            }
            modules[mod].destructor();
        }
        modules = null;
        this.isActive = false;
        this.formParams = null;
        this.formParamsHash = null;
        this.formParamsSettings = null;
        formParamsHash = null;
        actions = null;
        sysinfo = null;
        D3Api.removeDom(this.DOM);
        if (!destroyOnly) {
            var chforms = D3Api.getAllDomBy(this.DOM, '[formname]');
            for (var i = 0, c = chforms.length; i < c; i++) {
                if (chforms[i].D3Form && chforms[i].D3Form.formUid != this.formUid && !chforms[i].D3Form.destroyed)
                    chforms[i].D3Form.destructor(true);
            }
        }
        this.callEvent('onform_destroy', this.DOM);
        this.DOM.D3Form = null;
        this.DOM = null;
        this.D3Thread = null;

        delete this.D3Thread;
        delete this.container;
        delete this.DOM;
        //delete this.leftForm;
        delete this.rightForm;
        delete this.currentContext;

        delete this.formData;
        delete this.events;
        delete this.vars;
        this.destructorBase();
    };
    this.close = function (result,_func) {
        this.destroyed = true;
        if(this.callEvent('onbeforeclose', (arguments.length)?result:Form._onCloseResult_) === false)
        {
            this.destroyed = false;
            return;
        }
        //В событии могут закрыть родительскую форму, чтобы небыло цикла destroyed = true
        if(this.callEvent('onclose', (arguments.length)?result:Form._onCloseResult_) === false)
        {
            this.destroyed = false;
            return;
        }
        /* удаление сессионого кэша */
        setVar('formCache', this.formCache);
        CacheSessDelete.execute(function(){
            if(typeof _func == "function"){
                _func();
            }
        });
        clearSelection();
        /*если показано модальное окно - работаем только с ним и его содержимым*/
        var open_modal_cont = D3Api.getDomBy(D3Api.D3MainContainer, 'div[id="open_modal"]');
        if(open_modal_cont && D3Api.showedDom(open_modal_cont) && open_modal_cont.childNodes.length >1 && open_modal_cont.childNodes[0].D3Form){
            if(this.container && this.container.DOM){
                if(!this.container.DOM.D3Form || this.container.DOM.D3Form != open_modal_cont.childNodes[0].D3Form){
                    if(this.container.DOM && this.container.DOM == open_modal_cont){
                        this.destructor();
                    }else{
                        open_modal_cont.childNodes[0].D3Form.destructor();
                        if(Array.from(open_modal_cont.childNodes).indexOf(this)==-1){
                            this.destroyed = false;
                        }
                    }
                }else{
                    this.destructor();
                }
            }
        }else{
            this.destructor();
        }
        /*если есть такой контейнер и он на данный момент не скрыт и модально открыто не больше 1 формы*/
        if(open_modal_cont && D3Api.showedDom(open_modal_cont) && open_modal_cont.childNodes.length <=1 ){
            /*то прячем этот контейнер*/
            D3Api.hideDom(open_modal_cont);
        }
    };
    this.addInControls = function (controls, dom) {
        var d = D3Api.getProperty(dom, 'data');
        if (!d)
            return;
        var dfields = {};
        var p = d.split(';');
        for (var i = 0, c = p.length; i < c; i++) {
            var f = p[i].split(':');
            if (f.length > 1)
                dfields[f[0]] = f[1];
        }
        if (i > 0)
            controls.push({control: dom, datafields: dfields});
    };
    this.setControlsData = function (controls, data, DOM, resultData) {
        var resData = {}, ctrls, firstProp;
        DOM = DOM || this.DOM;
        for (var i = 0, c = controls.length; i < c; i++) {
            var ctrl = controls[i];
            firstProp = true;
            for (var prop  in ctrl.datafields) {
                if(!ctrl.datafields.hasOwnProperty(prop)){
                    continue;
                }
                var v = data[ctrl.datafields[prop]];
                /* if (v !== undefined || resultData) { */
                if (firstProp) {
                    if (DOM.id == ctrl.control.id && D3Api.getProperty(DOM,'isrepeat',false) === false)
                        ctrls = [DOM];
                    else
                        ctrls = DOM.querySelectorAll('#' + ctrl.control.id+':not([isrepeat])');
                }
                for (var ci = 0, cc = ctrls.length; ci < cc; ci++) {
                    /* if (v !== undefined) */
                    this.setControlProperty(ctrls[ci], prop, v);
                    if (resultData) {
                        var name = this.getControlProperty(ctrls[ci], 'name');
                        resData[name + '_' + prop] = this.getControlProperty(ctrls[ci], prop);
                    }
                }
                firstProp = false;
                /* } */
            }
        }
        return resData;
    };
    this.getControlsData = function (controls, DOM) {
        var data = {}, ctrls, firstProp;
        DOM = DOM || this.DOM;
        for (var i = 0, c = controls.length; i < c; i++) {
            var ctrl = controls[i];
            firstProp = true;
            for (var prop  in ctrl.datafields) {
                if(!ctrl.datafields.hasOwnProperty(prop)){
                    continue;
                }
                if (firstProp) {
                    if (DOM.id == ctrl.control.id || DOM.id == ctrl.control.id + 'clone')
                        ctrls = [DOM];
                    else
                        ctrls = DOM.querySelectorAll('#' + ctrl.control.id);
                }
                for (var ci = 0, cc = ctrls.length; ci < cc; ci++) {
                    var name = this.getControlProperty(ctrls[ci], 'name');
                    data[name + '_' + prop] = this.getControlProperty(ctrls[ci], prop);
                }
                firstProp = false;
            }
        }
        return data;
    };
    this.startWaitControls = function (controls, DOM) {
        var ctrls;
        DOM = DOM || this.DOM;
        for (var i = 0, c = controls.length; i < c; i++) {
            var ctrl = controls[i];

            if (DOM.id == ctrl.control.id)
                ctrls = [DOM];
            else
                ctrls = DOM.querySelectorAll('#' + ctrl.control.id);
            for (var ci = 0, cc = ctrls.length; ci < cc; ci++) {
                D3Api.BaseCtrl.callMethod(ctrls[ci], 'startWait');
            }
        }
    };
    //Вынес отдельно так как лишние итерации при клонировании
    this.stopWaitControls = function (controls, DOM) {
        var ctrls;
        DOM = DOM || this.DOM;
        for (var i = 0, c = controls.length; i < c; i++) {
            var ctrl = controls[i];

            if (DOM.id == ctrl.control.id)
                ctrls = [DOM];
            else
                ctrls = DOM.querySelectorAll('#' + ctrl.control.id);
            for (var ci = 0, cc = ctrls.length; ci < cc; ci++) {
                D3Api.BaseCtrl.callMethod(ctrls[ci], 'stopWait');
            }
        }
    };
    function createAction(name) {
        if (!actions[name]) {
            actions[name] = new D3Api.D3Action(_GCF(), name);
            actions[name].sysinfo = new postObject();
        }
        return actions[name];
    }

    function createModule(name) {
        if(!modules[name]){
            modules[name] = new D3Api.D3Module(_GCF(), name);
            modules[name].sysinfo = new postObject();
        }
        return modules[name];
    }

    this.getParamsByName = function (cmptype, name) {
        if (!this.withParams())
            return undefined;
        this.formParams = this.formParams || {};
        if (!this.formParams[cmptype] || !this.formParams[cmptype][name]) {
            if (!this.formParams[cmptype] || Array.isArray(this.formParams[cmptype])) {
                this.formParams[cmptype] = {};
            }
            if (D3Api.controlsApi[cmptype] && D3Api.controlsApi[cmptype]._API_ && D3Api.controlsApi[cmptype]._API_._getDefaultParams) {
                this.formParams[cmptype][name] = D3Api.controlsApi[cmptype]._API_._getDefaultParams() || {};
            } else {
                this.formParams[cmptype][name] = {};
            }
        }
        return this.formParams[cmptype][name];
    };
    this.setParamsByName = function (cmptype, name, params) {
        if (!this.withParams())
            return;
        this.formParams = this.formParams || {};
        this.formParams[cmptype] = this.formParams[cmptype] || {};
        this.formParams[cmptype][name] = params;
    };
    this.getGlobalParamsByName = function (name) {
        if (!this.withParams())
            return undefined;
        this.formParams = this.formParams || {};
        return this.formParams[name];
    };
    this.setGlobalParamsByName = function (name, params) {
        if (!this.withParams())
            return;
        this.formParams = this.formParams || {};
        this.formParams[name] = params;
    };
    this.loadParams = function (onload) {
        if (this.withParams()) {
            setVar('ps_form', this.getFormParamsHash());
            getParamsAction.execute(function () {
                setVar('ps_form');
                formParamsHash = getVar('ps_params');
                this.formParams = D3Api.JSONparse(formParamsHash);
                setVar('ps_params');
                if (onload instanceof Function)
                    onload.call(MainForm);
            });
        }
        else
            onload.call(this);

    };
    this.withParams = function () {
        return (Form._withParams_ !== undefined && Form._withParams_) || (Form._withParams_ === undefined && this.formParamsSettings['withparams']);
    };
    var _sPTimer = null;
    this.saveParams = function (force) {
        if (this.withParams()) {
            if (_sPTimer) {
                clearTimeout(_sPTimer);
                _sPTimer = null;
            }
            if (!force) {
                _sPTimer = setTimeout(function () {
                    MainForm.saveParams(true)
                }, 1000);
                return true;
            }
            var nFP = D3Api.JSONstringify(this.formParams)
            if (this.formParams && formParamsHash != nFP) {
                setVar('ps_form', this.getFormParamsHash());
                setVar('ps_params', nFP);
                formParamsHash = nFP;
                setParamsAction.execute();
            }
        }
    };
    this.getFormParamsHash = function () {
        var form_hash = this.name;
        for (var i = 0, c = this.formParamsHash.length; i < c; i++) {
            form_hash += ':' + this.formData.request[this.formParamsHash[i]];
        }
        return form_hash;
    };
    this.parse(fDOM);
    fDOM = null;
};
D3Api.D3ThreadForms = function (name) {
    D3Api.D3Base.call(this);
    var threadForms = [];
    this.getName = function () {
        return name;
    }
    this.rename = function (newName) {
        name = newName;
        D3Api.Base.callEvent('onThreadFormsRename', this, name, newName);
    }
    this.addForm = function (form) {
        threadForms.push(form);
        form.D3Thread = this;
    }
    this.getRootForm = function () {
        return threadForms[0];
    }
    this.getStepForm = function () {
        return threadForms[threadForms.length - 1];
    }
    this.getThreadCaption = function () {
        var rf = this.getRootForm();
        if (!rf)
            return false;
        if (rf.existsFunction('threadCaption')) {
            return rf.callFunction('threadCaption');
        }
        if (D3Api.hasProperty(rf.DOM, 'thread_caption'))
            return D3Api.getProperty(rf.DOM, 'thread_caption');

        return rf.getFormCaption();
    }
    this.getThreadStepCaption = function () {
        var sf = this.getStepForm();
        if (!sf)
            return false;
        if (sf.existsFunction('threadStepCaption')) {
            return rf.callFunction('threadStepCaption');
        }
        if (D3Api.hasProperty(sf.DOM, 'thread_step_caption'))
            return D3Api.getProperty(sf.DOM, 'thread_step_caption');

        return sf.getFormCaption();
    }
    this.removeForm = function (form) {
        var ind = threadForms.indexOf(form);
        if (ind >= 0)
            threadForms.splice(ind, 1);
        if (threadForms.length <= 0) {
            this.close();
        }
    }
    this.activate = function () {
        var c = threadForms.length;
        if (c > 0)
            threadForms[c - 1].activate();
        else {
            this.close();
            return;
        }
        D3Api.Base.callEvent('onThreadFormsActivate', this, name);
    }
    this.close = function () {
        for (var i = threadForms.length - 1; i > -1; i--)
            threadForms[i].destructor();

        //Нить закрыть
        this.destructorBase();
        D3Api.threads[name] = undefined;
        delete D3Api.threads[name];

        var it = name.indexOf('.thread:');
        if (it > 0) {
            name = name.substr(0, it);
        }
        if (D3Api.threads[name])
            return;
        //Проверим есть ли еще нити с таким именем
        if(!D3Api.MainDom.D3ThreadsTabs){
            for (var nt in D3Api.threads) {
                if(!D3Api.threads.hasOwnProperty(nt)){
                    continue;
                }
                if(nt.indexOf(name + '.thread:') === 0){
                    D3Api.threads[name] = D3Api.threads[nt];
                    D3Api.threads[name].rename(name);
                    delete D3Api.threads[nt];
                    break;
                }
            }
        }
        D3Api.Base.callEvent('onThreadFormsClose', this, name);
    }
    D3Api.Base.callEvent('onThreadFormsCreate', this, name);
};
D3Api.D3Container = function (dom) {
    D3Api.D3Base.call(this);
    this.countForm = 1;
    this.currentForm = null;
    this.lastActiveForm = null;
    this.lastForm = null;
    this.DOM = dom;

    this.setCurrentForm = function (form) {
        this.callEvent('onChangeCurrentForm', this.currentForm, form);
        this.currentForm = form;
        if(this.countForm == 1)
        {
            this.lastForm = form;
        }
    }
    this.destructor = function () {
        this.destructorBase();
    }
};
D3Api.RefreshDataSets = function (form, dataSets, value) {
    form.beginRequest();
    var ds = dataSets.split(';');
    for (var i = 0, c = ds.length; i < c; i++) {
        if (value != undefined)
            form.setVar(ds[i] + '_parent', value);
        form.refreshDataSet(ds[i]);
    }
    form.endRequest();
};
/**
 * @description Cоответствие двух элементов.
 * @param {Array|Object|Number|String|Boolean} - 1-ый элемент
 * @param {Array|Object|Number|String|Boolean} - 2-ой элемент
 * @return {Boolean} результат соответствие
 **/
D3Api.Equals = function(_obj1, _obj2){
    function equals_obj(obj1, obj2){
        if(Object.keys(obj1).length != Object.keys(obj2).length){
            return false;
        }
        for(var l in obj1){
            if(obj1.hasOwnProperty(l)){
                if(obj2[l] instanceof Array && obj1[l] instanceof Array){
                    return equals_arr(obj1[l],obj2[l]);
                } else if(obj2[l] instanceof Object && obj1[l] instanceof Object){
                    return equals_obj(obj1[l],obj2[l]);
                }else{
                    return obj1[l] == obj2[l];
                }
            }
        }
        return true;
    }
    function equals_arr(obj1, obj2){
        if(obj1.length != obj2.length){
            return false;
        }
        for(var i = 0,len = obj2.length ; i < len ; i++){
            if (obj1[i] instanceof Array && obj2[i] instanceof Array) {
                return equals_arr(obj1[i],obj2[i]);
            }else if (obj1[i] instanceof Object && obj2[i] instanceof Object){
                return equals_obj(obj1[i],obj2[i]);
            }else{
                return obj1[i] == obj2[i];
            }
        }
    }
    if(Array.isArray(_obj1) && Array.isArray(_obj2)){
        return equals_arr(_obj1,_obj2);
    }else if(_obj1 instanceof Object && _obj2 instanceof Object){
        return equals_obj(_obj1,_obj2);
    }else{
        return _obj1 == _obj2;
    }
};
/**
 * @description разбивает объект или массив на несколько подмассивов
 * @param {Array|Object}
 * @param {number}
 * @return {Array|Object}
 **/
D3Api.DataChunk = function(_data,_size){
    if(Array.isArray(_data)){
        if(!_size){
            _size = _data.length;
        }
        var res = _data.reduce(function(p, c){
            if(p[p.length-1].length == _size){
                p.push([]);
            }

            p[p.length-1].push(c);
            return p
        },[[]]);
        return res;
    }else if(_data instanceof Object){
        var arr = [{}];
        var indx = 0;
        for(var i in _data){
            if(_data.hasOwnProperty(i)){
                if(_size && indx >= _size){
                    indx = 0;
                    arr.push({});
                }
                arr[arr.length - 1][i] = _data[i];
                ++indx;
            }
        }
        return arr;
    }else{
        D3Api.debug_msg('DataChunk принимает только массив или объект');
    }
};
D3Api.Office = {
    Spreadsheet:{}
};
D3Api.D3DataSet = function(form,name,dom)
{
    D3Api.D3Base.call(this);
    this.name = name;
    this.data = new Array();
    this.locals =  {};
    //Хэш параметров запроса если данные пришли без запроса то заполняется и при последующем запросе сверяется, если совпадает то запрос на сервер не происходит
    this.dataHash = '';
    this.uidData = null;
    //Флаг того что нужно обрабатывать все ответы, а не только тот который запросили последним
    this.allResponse = false;
    //Флаг того что был сделан запрос на сервер
    this.sendRequest = 0;
    //Количество принятых данных / запросов
    this.acceptedData = 0;
    //Контролы могут быть без имени
    this.controls = new Array();
    this.form = form;
    this.filters = {};
    this.sorts = {};
    this.group = null; //[];//группировка поле=порядок
    this.groupsumm = null; //{};//Сумма при группировке поле=тип(summ,count,avg,min,max)
    this.filteronce = null; //{};//Фильтр одного запроса поле=значение
    this.sortonce = null; //{};//Сортировка одного запроса поле=значение
    this.filterpermanent = null; //{};//Фильтр постоянный для запроса поле=значение
    this.sortpermanent = null; //{};//Сортировка постоянная для запроса поле=значение
    this.wf = null; //{};//Оконные функции для запроса
    this.details = new Array();
    //Указывается на форме
    this.sysinfo = null;
    this.isUnique = true;
    this.requestParams = {};
    this.addSysInfoParam = function(paramObj)
    {
        if(paramObj['parent'])
        {
            var ds = this.form.getDataSet(paramObj['parent']);
            if(ds)
                ds.addDetail(this.name);
        }
        this.sysinfo.params.push(paramObj);
    }
    //Действительное количество всей выборки без учета лимита
    var rowCount = 0;
    var rangePage = 0;
    var dataPosition = 0;
    this.needRotateData = false;
    this.init = function(dom)
    {
        this.rotateData = {
            primary_field: D3Api.getProperty(dom, 'primary_field', false),
            columns_field: D3Api.getProperty(dom, 'columns_field', false),
            values_field: D3Api.getProperty(dom, 'values_field', false)
        }
        this.needRotateData = this.rotateData.columns_field;
    }
    if(dom)
        this.init(dom);
    this.hasDetails = function()
    {
        return this.details.length > 0;
    }
    this.addDetail = function(name)
    {
        if (this.details.indexOf(name) == -1)
            this.details.push(name);
    }
    this.removeDetail = function(name)
    {
        var ind = this.details.indexOf(name);
        if (ind != -1)
            this.details.splice(ind,1);
    }
    this.destructor = function()
    {
        this.data = null;
        this.locals = null
        this.controls = null;
        this.form = null;
        this.filters = null;
        this.details = null;
        this.sorts = null;
        this.sysinfo = null;
        this.requestParams = null;

        delete this.name;
        delete this.data;
        delete this.locals
        delete this.controls;
        delete this.form;
        delete this.allResponse;
        delete this.dataHash;
        delete this.sendRequest;
        delete this.filters;
        delete this.sorts;
        delete this.details;

        this.destructorBase();
    }
    this.setUnique = function(state)
    {
        this.isUnique = state;
    }
    this.refresh = function(onsuccess,onerror,sync,force,details)
    {
        if (this.callEvent('onbefore_refresh') === false) {
            return;
        }
        var _ext_ = this.getRequestData();
        this.callEvent('onprepare_ext',_ext_);
        var newReqUid= (this.isUnique)?D3Api.getUniqId('DS'):'notuinique';
        var params = this.sysinfo.getParams(this.name);
        var hashValues = '';
        for(var p in params)
        {
            if(params.hasOwnProperty(p)){
                hashValues += p+'='+((params[p] === undefined)?'':params[p])+'|';
            }

        }
        params._ext_ = _ext_;
        params._uid_ = newReqUid;
        var reqData = D3Api.mixin({
            type: 'DataSet',
            params: params
        },this.requestParams);
        if (this.dataHash && this.dataHash == MD5.hex_md5(hashValues) && !force)
        {
            this.dataHash = null;
            if (this.dataSilent)
            {
                this.dataSilent = false;
                this.reSetData();
            } else {
                this.callEvent('onafter_refresh');
            }
            //this.sendRequest = 0;
            return;
        }else if(this.dataHash && this.dataHash != MD5.hex_md5(hashValues))
        {
            //Данные с сервера пришли неконсистентные перезапрашиваем

        }/*else
        if(this.sendRequest>0 && this.allResponse != true)
            return;*/
        this.requestUid = newReqUid;
        this.dataHash = null;
        this.dataSilent = false;
        this.sendRequest++;
        if (details == undefined) details = true;
        this.form.startWaitControls(this.controls);

        if (this.hasDetails() && details)
        {
            this.form.beginRequest();
            this.form.sendRequest(this.name,reqData,sync,onsuccess,onerror);
            this.refreshDetails();
            this.form.endRequest();
        }else
            this.form.sendRequest(this.name,reqData,sync,onsuccess,onerror);
    }
    this.refreshByMode = function(mode,data,onsuccess,onerror,sync)
    {
        this.callEvent('onbefore_refresh','mode',mode,data);
        var _ext_ = this.getRequestData();
        this.callEvent('onprepare_ext',_ext_);
        var params = this.sysinfo.getParams(this.name);
        params._ext_ = _ext_;
        params._uid_ = D3Api.getUniqId('dsm');
        params._mode_ = mode;
        params._mode_data_ = data;
        var reqData = D3Api.mixin({
            type: 'DataSet',
            params: params
        },this.requestParams);

        var reqObj = {};
        reqObj[this.name] = reqData;
        var name = this.name;
        var self = this;
        D3Api.requestServer({
            url: 'request.php',
            async: !sync,
            method: 'POST',
            urlData: this.form.formData.request,
            data: {request: D3Api.JSONstringify(reqObj)},
            onSuccess: function(res){
                self.clearParams();
                try
                {
                    var resObj = JSON.parse(res);
                }catch(e)
                {
                    if (onerror instanceof Function)
                        onerror.call(this,res,e);
                    D3Api.debug_msg('В ответе сервера: '+e.message);
                    return;
                }
                if(!D3Api.empty(resObj[name].error)){
                    if(onerror instanceof Function){
                        onerror.call(this,resObj[name],resObj[name].error);
                    }else if(D3Api.getOption('debug', 0) > 0){
                        D3Api.alert_msg(resObj[name].error);
                    }
                }
                else if (onsuccess instanceof Function)
                    onsuccess.call(this,resObj[name],resObj[name].data);
            },
            onError: function(e){
                self.clearParams();
                D3Api.debug_msg('В ответе сервера: '+e);
                if (onerror instanceof Function)
                    onerror.call(this,e);
            },
            contextObj: this.form
        });
    }
    this.refreshDetails = function()
    {
        for(var i = 0, c = this.details.length; i < c; i++)
        {
            this.form.refreshDataSet(this.details[i]);
        }
    }
    //Атрибут data содержит пары "свойство контрола":"поле данных" через ";",  например data="value:col1;caption:col2"
    this.addControl = function(dom)
    {
        this.form.addInControls(this.controls,dom);
    }
    this.addFilterItem = function(cmpName,property,field,upper,condition,like,fkind)
    {
        this.filters[cmpName] = {p: property, f: field, u: upper, c: condition, l: like, fk: fkind, val: ''};
    }
    this.addSortItem = function(cmpName,field)
    {
        this.sorts[cmpName] = {f: field, val: ''};
    }
    this.setRange = function(page, amount, refresh, keyfield, count)
    {
        if(page === undefined && amount === undefined)
        {
            this.range = null;
        }
        page = page || 0;
        amount = amount || 10;

        this.range = {page: (page<0)?0:page, amount: (amount<0)?0:amount, keyfield: (keyfield === undefined)?1:keyfield, count: (count === undefined)?true:count};
        if(refresh){
            this.refresh();
        }
    }
    this.getRangePage = function()
    {
        return rangePage;
    }
    this.setLocate = function(field, value, refresh)
    {
        if(field === undefined)
        {
            this.locate = null;
            return;
        }
        this.locate = {field: field, value: value};

        if(refresh)
            this.refresh();
    }
    this.addGroup = function(field,order)
    {
        if(field === undefined)
        {
            this.group = null;
            return;
        }
        this.group = this.group || [];

        this.group.push(field);
    }
    this.addGroupSumm = function(field,type,fixed)
    {
        if(field === undefined)
        {
            this.groupsumm = null;
            return;
        }
        this.groupsumm = this.groupsumm || {};

        fixed = fixed || 0;
        type = type || 'sum';
        type += '|'+fixed;
        this.groupsumm[field]=(this.groupsumm[field])?this.groupsumm[field]+';'+type:type;
    }
    this.addFilter = function(field,value)
    {
        if(field === undefined)
        {
            this.filteronce = null;
            return;
        }
        this.filteronce = this.filteronce || {};
        this.filteronce[field] = value;
    }
    this.addFilterPermanent = function(field,value)
    {
        if(field === undefined)
        {
            this.filterpermanent = null;
            return;
        }

        this.filterpermanent = this.filterpermanent || {};
        if(value === undefined && !D3Api.isUndefined(this.filterpermanent[field]))
        {
            this.filterpermanent[field] = null;
            delete this.filterpermanent[field];
        }
        this.filterpermanent[field] = value;
    }
    this.addSort = function(field,value)
    {
        if(field === undefined)
        {
            this.sortonce = null;
            return;
        }
        this.sortonce = this.sortonce || {};
        this.sortonce[field] = value;
    }
    this.addSortPermanent = function(field,value)
    {
        if(field === undefined)
        {
            this.sortpermanent = null;
            return;
        }

        this.sortpermanent = this.sortpermanent || {};
        this.sortpermanent[field] = value;
    }
    this.addWindowFunction = function(field, name) {
        if (!field || typeof name !== 'string' || !name) {
            return;
        }
        if (!this.wf) {
            this.wf = {};
        }
        if (!this.wf[field]) {
            this.wf[field] = [];
        }
        if (this.wf[field].indexOf(name) == -1) {
            this.wf[field].push(name);
        }
    };
    this.getRequestData = function()
    {
        var res = {};

        if(this.range)
            res.range = this.range;
        if(this.locate)
            res.locate = this.locate;
        if(this.group)
            res.group = this.group;
        if(this.groupsumm)
            res.groupsumm = this.groupsumm;
        if (this.wf) {
            res.wf = this.wf;
        }
        if(this.filterpermanent || this.filteronce)
        {
            res.filters = {};
            D3Api.mixin(res.filters,this.filterpermanent,this.filteronce);
        }
        if(this.sortpermanent || this.sortonce)
        {
            res.sorts = {};
            D3Api.mixin(res.sorts,this.sortpermanent,this.sortonce);
        }
        if(this.afilter)
        {
            res.afilter = {};
            var afilterctrl = this.afilter['afilterctrl'];
            if(this.form.controlExist(afilterctrl))
            {
                var val = this.form.getControlProperty(afilterctrl,'value');
                this.afilter['afilterval'] = val;
            }else{
                this.afilter['afilterval'] = '';
            }
            if(this.form.controlExist(afilterctrl+'_afilter_reg_use'))
            {
                var afilterreguse = this.form.getControlProperty(afilterctrl+'_afilter_reg_use','value');
                this.afilter['afilterreguse'] = afilterreguse;
            }
            res.afilter = this.afilter;
        }
        for(var f in this.filters)
        {
            if(!this.filters.hasOwnProperty(f)){
                continue;
            }
            var fltr = this.filters[f];
            if(this.form.controlExist(f))
            {
                var val = this.form.getControlProperty(f,fltr.p);
                fltr.val = val;
            }else
                val = fltr.val;

            var extInf = '';
            if (val)
            {
                if (val == '()' || val == '!()') {
                    res.filters = res.filters || {};
                    res.filters[this.filters[f].f + extInf] = val;
                    continue;
                }
                switch (fltr.fk)
                {
                    case 'activedate':
                        var fields = fltr.f.split(';');

                        res.filters = res.filters || {};
                        res.filters[fields[0] + ';D'] = ']' + val;
                        res.filters[fields[1] + ';D'] = '/[' + val;
                        break;
                    case 'perioddate':
                    case 'periodnumb':
                        if(f.search(/_BEGIN$/)>0)
                            extInf +=';B';
                        else if(f.search(/_END$/)>0)
                            extInf +=';E';
                        res.filters = res.filters || {};
                        res.filters[this.filters[f].f+extInf] = val;
                        break;
                    case 'unitmulti':
                        extInf +=';M';
                        res.filters = res.filters || {};
                        res.filters[this.filters[f].f+extInf] = val;
                        break;
                    case 'multi_hier':
                        break;
                    case 'text_af': /*cmpAdditionalFilter*/
                        res.filters = res.filters || {};
                        res.filters[this.filters[f].f+extInf] = '##'+((fltr.u==true)?'^':'')+val.trim();
                        break;
                    case 'text_ext':/*filterkind="text_ext"*/
                        /**
                         * в компоненте AdditionalFilter, а также при указанном filterkind="text_ext" в фильтре колонки проверяется значение фильтра:
                         * если первый символ = "$", то фильтр работает по стандартому выражению LIKE %<значение>%
                         * если первый символ = "&", то используется т.н. сжатый фильтр (regexp_replace(upper(<field>), '[[:punct:]]|[[:space:]]|[[:cntrl:]]|[[:blank:]]|№', '', 'g')=regexp_replace(upper(<значение фильтра>), '[[:punct:]]|[[:space:]]|[[:cntrl:]]|[[:blank:]]|№', '', 'g'))
                         * если присутствуют символы "?" или "*", то они заменяются на "_" и "%" соответсвенно и работают по стандартому выражению LIKE
                         */
                        val=val.trim();
                        if(val.indexOf("$") == 0) {
                            val = val.slice(1);
                            val= '^'+val.replace(new RegExp('', 'g'), '%'+'');
                            res.filters = res.filters || {};
                            res.filters[this.filters[f].f+extInf] = val;
                            break;
                        }else if(val.indexOf("&") == 0) {
                            res.filters = res.filters || {};
                            res.filters[this.filters[f].f+extInf] = '#'+val.slice(1);
                            break;
                        }
                        else if(val.indexOf("=") == 0) {
                            res.filters = res.filters || {};
                            res.filters[this.filters[f].f+extInf] = '^'+val;
                            break;
                        }else if ((val.indexOf("*") != (-1)) || (val.indexOf("?") != (-1))) {
                            if (val.indexOf("?") != (-1)) {
                                val = val.replace(new RegExp("[?]", 'g'), "_");
                            }
                            if (val.indexOf("*") != (-1)) {
                                val = val.replace(new RegExp("[*]", 'g'), "%");
                            }
                            res.filters = res.filters || {};
                            res.filters[this.filters[f].f+extInf] = '^'+val;
                            break;
                        }else{
                            fltr.l = 'both';
                        }
                    default:
                        fltr.fk = fltr.fk || 'text';
                        var addVal = '%';
                        if (fltr.l != 'none' && (fltr.fk=='text' || fltr.fk=='text_ext')){
                            switch (fltr.l){
                                case 'left' :val= '%'+val;
                                    break;
                                case 'right' :val= val+'%';
                                    break;
                                case 'both' :val= '%'+val+'%';
                                    break;
                            }
                            addVal = '';
                        }
                        if (fltr.c != 'none'){
                            switch (fltr.c){
                                case 'like':
                                    if(fltr.fk=='text')
                                        val=val+addVal;
                                    else
                                        val='='+val;
                                    break;
                                case 'mlike':
                                    if(fltr.fk=='text')
                                        val='+'+val;
                                    else
                                        val='='+val;
                                    break;
                                case 'gt':val='>'+val;
                                    break;
                                case 'lt':val='<'+val;
                                    break;
                                case 'gteq':val='['+val;
                                    break;
                                case 'lteq':val=']'+val;
                                    break;
                                case 'eq':val='='+val;
                                    break;
                                case 'neq':val='!'+val;
                                    break;
                            }
                            addVal = '';
                        }else if(fltr.fk && fltr.fk!='text'&& fltr.fk!='text_ext')
                        {
                            val='='+val;
                        }
                        if (fltr.u=='true' && (fltr.fk=='text' || fltr.fk=='text_ext')){
                            val='^'+val+addVal;
                        }

                        res.filters = res.filters || {};
                        if (res.filters[this.filters[f].f + extInf]) {
                            res.filters["add_fltr_" + this.filters[f].f + extInf] = val;
                        } else {
                            res.filters[this.filters[f].f + extInf] = val;
                        }
                }
            }
        }
        for(var s in this.sorts)
        {
            if(!this.sorts.hasOwnProperty(s)){
                continue;
            }
            if(res.sorts && res.sorts[this.sorts[s]] !== undefined)
            {
                continue;
            }
            if(this.form.controlExist(s))
            {
                var val = this.form.getControlProperty(s,'value');
                this.sorts[s].val = val;
            }else
                val = this.sorts[s].val;
            if (val)
            {
                res.sorts = res.sorts || {};
                res.sorts[this.sorts[s].f] = val;
            }
        }

        return res;
    }
    this.setResponse = function(res)
    {
        function setResInfo(res) {
            if (this.needRotateData)
                rotateData(res.data, this.rotateData.primary_field, this.rotateData.columns_field, this.rotateData.values_field);

            if(res.rowcount_error && D3Api.getOption('debug', 0) > 0){
                D3Api.alert_msg(res.rowcount_error+'rowcount_error');
            }
            if(res.page_error && D3Api.getOption('debug', 0) > 0){
                D3Api.alert_msg(res.page_error+'page_error');
            }
            if(res.locate_error && D3Api.getOption('debug', 0) > 0){
                D3Api.alert_msg(res.locate_error+'locate_error');
            }
            rowCount = res.rowcount || res.data.length;
            rangePage = res.page;
            dataPosition = (res.position === undefined) ? dataPosition : res.position;

            this.clearParams();
        }
        if (this.sendRequest > 0)
        {
            this.sendRequest--;
            this.dataSilent = false;
            //if(this.sendRequest === 0 || this.allResponse) {
                setResInfo.call(this,res);
                this.setData(res.data);
            //}
        }else if(this.sendRequest === 0)//Данных не ждали и не запрашивали
        {
            this.dataSilent = true;
            setResInfo.call(this,res);
            this.setDataSilent(res.data);
        }
    }
    this.clearParams = function()
    {
        //Обнуляем переменные
        this.locate = null;
        this.filteronce = null;
        this.sortonce = null;
        this.group = null;
        this.groupsumm = null;
    }
    this.reSetData = function()
    {
        this.setData(this.data);
    }
    this.setDataSilent = function(data)
    {
        this.data = data;
    }

    this.setDataLocals = function(data)
    {
        this.locals = data;
    }


    //data - массив объектов, где имена параметров колонки, например [{col1: 1, col2: 2},{col1: 3, col2: 4}]
    this.setData = function(data,position)
    {
        if (position == undefined) position = dataPosition;
        this.data = data;
        this.acceptedData++;
        this.callEvent('onrefresh',data);

        this.setDataPosition(position);
        this.uidData = D3Api.getUniqId();

        this.callEvent('ondata_ready',data);

        this.form.stopWaitControls(this.controls);

        this.callEvent('onafter_refresh');
        //this.form.resize();
    }
    this.setDataPosition = function(pos)
    {
        this.form.setControlsData(this.controls,this.data[pos]||{});
        this.callEvent('ondatapos_change',pos);
    }
    this.getCount = function()
    {
        return this.data.length;
    }
    this.getAllCount = function()
    {
        return rowCount;
    }
    this.getPosition = function()
    {
        return dataPosition;
    }
    this.getData = function(position)
    {
        position = (position === undefined)?dataPosition:position;

        return this.data[position];
    }
    function rotateData(data,primaryField,columnsField,valuesField)
    {
        //Переворот данных
        if (columnsField && valuesField)
        {
            var index = 0;
            if (primaryField)
            {
                var ndata = {};
                for(var i = 0; i < data.length; i++)
                {
                    var key = data[i][primaryField];
                    var field = data[i][columnsField];
                    var value = data[i][valuesField];
                    if (!ndata[key])
                    {
                        ndata[key] = {data: data[index]};
                        ndata[key].data[primaryField] = key;
                        index++;
                    }
                    ndata[key].data[field] = value;
                }
                data.splice(index);
            }else
            {   //Одна строка
                for(var i = 0; i < data.length; i++)
                {
                    var tmp = data[i];
                    data[i] = {};
                    data[0][tmp[columnsField]] = tmp[valuesField]
                }
                data.splice(1);
            }
        }else if (columnsField) //Поворот всех данных строки -> столбцы
        {
            var dataNew = new Array();
            var ParName ="";
            var j;
            for (var i=0; i<data.length;i++)
            {
                j=0;
                for (var z in data[i])
                {
                    if(!data[i].hasOwnProperty(z) || z == columnsField){
                        continue;
                    }
                    ParName = data[i][columnsField];
                    if(dataNew[j] == null) dataNew[j] = {};
                    dataNew[j][ParName] = data[i][z];
                    j++;
                }
            }
            data.splice(0);
            for(var d in data){
                if(data.hasOwnProperty(d)){
                    dataNew[d] = data[d];
                }
            }
            data = dataNew;
        }
    }
}
D3Api.D3Action = function(form,name,dom)
{
    D3Api.D3Base.call(this);
    this.name = name;
    this.form = form;
    this.data = {};
    this.dataHash = '';
    this.checkPointHash = null;
    //Флаг того что был сделан запрос на сервер
    this.sendRequest = false;
    this.datadest = new Array();

    this.sysinfo = null;
    this.requestParams = {};
    this.addSysInfoParam = function(paramObj)
    {
        if(paramObj['put'])
        {
            switch (paramObj['srctype'])
            {
                case 'ctrl':
                        var pf = paramObj['src'].split(':');
                        if (pf.length > 1 || paramObj['property'])
                            this.addControl(pf[0],paramObj['property'] || pf[1],paramObj['put']);
                        else
                            this.addControl(pf[0],'value',paramObj['put']);
                    break;
                case 'var':
                        this.addVar(paramObj['src'],paramObj['put'],paramObj['property'],paramObj['global']);
                    break;
            }
        }else
            this.sysinfo.params.push(paramObj);
    }
    this.removeSysInfoParam = function(paramObj)
    {
        var params =this.sysinfo.params;
        for(var i=0;i<params.length;i++)
        {
            if ((params[i].get==paramObj['get'])&&(params[i].src==paramObj['src'])&&(params[i].srctype==paramObj['srctype'])) this.sysinfo.params.splice(i,1);
        }
    }
    this.init = function(dom)
    {
    }
    if(dom)
        this.init(dom);
    this.destructor = function()
    {
        this.data = null;
        this.datadest = null;
        this.form = null;
        this.sysinfo = null;
        this.requestParams = null;

        delete this.name;
        delete this.data;
        delete this.datadest;
        delete this.form;
        delete this.dataHash;
        delete this.sendRequest;

        this.destructorBase();
    }
    this.execute = function(onsuccess,onerror,sync,force)
    {
        this.callEvent('onprepare_params');
        var params = this.sysinfo.getParams();
        var reqData = D3Api.mixin({
            type: 'Action',
            params: params
        },this.requestParams);
        this.callEvent('onbefore_execute');
        for(var i = 0, c = this.datadest.length; i < c; i++)
        {
            var dest = this.datadest[i];
            if (dest.type == 'ctrl')
            {
                D3Api.BaseCtrl.callMethod(this.form.getControl(dest.name),'startWait');
            }
        }
        this.form.sendRequest(this.name,reqData,sync,onsuccess,onerror);
    }
    this.checkPoint = function(save)
    {
        save = (save === undefined)?true:save;
        var hash = D3Api.JSONstringify(this.sysinfo.getParams(this.name),true);
        if(save)
            this.checkPointHash = hash;
        return hash;
    }
    this.check = function()
    {
        return this.checkPointHash != this.checkPoint(false);
    }
    this.addControl = function(name,property,field)
    {
        this.datadest.push({type: 'ctrl', name: name, prop: property, field:field});
    }
    this.addVar = function(name,field,property,global)
    {
        this.datadest.push({type: 'var', name: name, field:field, property: property, global: global});
    }
    this.reSetData = function()
    {
        this.setData(this.data);
    }
    this.setDataSilent = function(data)
    {
        this.data = data;
    }
    //data - Объект {field1: 1,field2: 2}
    this.setData = function(data)
    {
        this.data = data;
        this.callEvent('onexecute');

        for(var i = 0, c = this.datadest.length; i < c; i++)
        {
            var dest = this.datadest[i];
            var v = this.data[dest.field];
            if (v === undefined)
                continue;

            switch (dest.type)
            {
                case 'var':
                        var DESTOBJ = this.form;
                        if(dest.global === 'true')
                            DESTOBJ = D3Api;
                        if(dest.property)
                        {
                            var obj = DESTOBJ.getVar(dest.name) || {};
                            obj[dest.property] = v;
                            DESTOBJ.setVar(dest.name,obj);
                        }else
                            DESTOBJ.setVar(dest.name,v);
                    break;
               case 'ctrl':
                        D3Api.BaseCtrl.callMethod(this.form.getControl(dest.name),'stopWait');
                        if(Array.isArray(v)){
                            var ctrl = this.form.getControl(dest.name);
                            if(ctrl.D3Repeater){
                                ctrl.D3Repeater.setData(v);
                                continue;
                            }
                        }
                        this.form.setControlProperty(dest.name,dest.prop,v);
                    break;
            }
        }

        this.callEvent('onafter_execute');
        //this.form.resize();
    }
    this.getData = function()
    {
        return this.data;
    }
}
D3Api.D3Module = function(form,name,dom){
    D3Api.D3Base.call(this);
    this.name = name;
    this.form = form;
    this.requestParams = {};
    this.sysinfo = null;
    this.data = {};
    this.locals = {};
    this.datadest = [];

    this.init = function(dom){

    }
    if(dom){
        this.init(dom);
    }

    this.destructor = function(){
        this.data = null;
        this.locals = {};
        this.name = null;
        this.form = null;
        this.requestParams = null;
        this.sysinfo = null;
        this.datadest = null;

        delete this.name;
        delete this.form;
        delete this.requestParams;
        delete this.sysinfo;
        delete this.datadest;
        delete this.data;

        this.destructorBase();
    }
    this.execute = function(onsuccess,onerror,sync,force){
        var params = this.sysinfo.getParams();
        var reqData = D3Api.mixin({
            type: 'Module',
            params: params
        },this.requestParams);
        this.form.sendRequest(this.name,reqData,sync,onsuccess,onerror);
    }
    this.addSysInfoParam = function(paramObj){
        if(paramObj['put'])
        {
            switch (paramObj['srctype'])
            {
                case 'ctrl':
                    var pf = paramObj['src'].split(':');
                    if (pf.length > 1 || paramObj['property'])
                        this.addControl(pf[0],paramObj['property'] || pf[1],paramObj['put']);
                    else
                        this.addControl(pf[0],'value',paramObj['put']);
                    break;
                case 'var':
                    this.addVar(paramObj['src'],paramObj['put'],paramObj['property'],paramObj['global']);
                    break;
            }
        }else{
            this.sysinfo.params.push(paramObj);
        }

    }
    this.removeSysInfoParam = function(paramObj)
    {
        var params =this.sysinfo.params;
        for(var i=0;i<params.length;i++)
        {
            if ((params[i].get==paramObj['get'])&&(params[i].src==paramObj['src'])&&(params[i].srctype==paramObj['srctype'])) this.sysinfo.params.splice(i,1);
        }
    }
    this.addControl = function(name,property,field)
    {
        this.datadest.push({type: 'ctrl', name: name, prop: property, field:field});
    }
    this.addVar = function(name,field,property,global)
    {
        this.datadest.push({type: 'var', name: name, field:field, property: property, global: global});
    }
    this.setData = function(data)
    {
        this.data = data;
        for(var i = 0, c = this.datadest.length; i < c; i++)
        {
            var dest = this.datadest[i];
            var v = this.data[dest.field];
            if (v === undefined)
                continue;

            switch (dest.type)
            {
                case 'var':
                    var DESTOBJ = this.form;
                    if(dest.global === 'true')
                        DESTOBJ = D3Api;
                    if(dest.property)
                    {
                        var obj = DESTOBJ.getVar(dest.name) || {};
                        obj[dest.property] = v;
                        DESTOBJ.setVar(dest.name,obj);
                    }else
                        DESTOBJ.setVar(dest.name,v);
                    break;
                case 'ctrl':
                    D3Api.BaseCtrl.callMethod(this.form.getControl(dest.name),'stopWait');
                    this.form.setControlProperty(dest.name,dest.prop,v);
                    break;
            }
        }
    }
    this.getData = function()
    {
        return this.data;
    }
};
D3Api.D3Repeater = function(form,dom,parent,dataset)
{
    var nofragment = false;//вставлять в дом сразу после создание клона
    if(!D3Api.empty(parent) || (D3Api.hasProperty(dom,'nofragment') && D3Api.getProperty(dom,'nofragment') == 'true')){
        nofragment = true;
    }
    var fragmentElements = [];
    D3Api.D3Base.call(this);
    //Ссылка на родителя
    this.name = D3Api.getProperty(dom,'repeatername');
    D3Api.addClass(dom,'repeatername_'+this.name);
    this.actionData = false;
    this.rootParent = null;
    this.parent = parent;
    this.childs = new Array();
    if (parent)
    {
        parent.addChild(this);
    }
    this.DOM = dom;
    this.DOM.D3Repeater = this;
    D3Api.setProperty(dom,'isD3Repeater',true);
    this.targetDOM = null;
    this.form = form;
    this.uniqId = D3Api.getUniqId('d3repeater');
    this.DOM.id = this.uniqId;
    this.controls = new Array();
    this.keyField = D3Api.getProperty(dom,'keyfield');
    this.noRepeat = D3Api.getBoolean(D3Api.getProperty(dom,'norepeat',false));
    this.standalone = D3Api.getBoolean(D3Api.getProperty(dom,'standalone',null));
    this.emptydata = D3Api.getProperty(dom,'emptydata',false);
    var simpleClones = [];
    this.emptydataparent = false;
    if(this.emptydata)
    {
        try
        {
            var json = this.emptydata.replace(/'/g,'"');
            this.emptydata = D3Api.JSONparse(json);
            for(var f in this.emptydata)
            {
                if(!this.emptydata.hasOwnProperty(f)){
                    continue;
                }
                var v = this.emptydata[f];
                if(typeof(v) == 'string' && v.indexOf('@parent.') > -1)
                {
                    this.emptydataparent = this.emptydataparent || {};
                    this.emptydataparent[f] = v.split('.')[1];
                }
            }
        }catch(e)
        {
            D3Api.debug_msg('Ошибка при парсе emptydata репитера '+this.name+': '+this.emptydata);
            this.emptydata = false;
        }
    }
    this.detail = D3Api.getProperty(dom,'detail',null);
    this.detail = this.detail !== null?D3Api.getBoolean(this.detail):null;
    this.async = +D3Api.getProperty(dom,'async',0);
    this.parentFields = new Array();
    this.conditions = null;
    this.parentKeyFields = {};
    this.changedData = {
        add : {},
        upd : {},
        del : {}
    }
    this.isSimple = (D3Api.hasProperty(dom,'simple') && !parent);
    this.simpleType = D3Api.getProperty(dom,'simple');
    this.repeatCount = D3Api.getProperty(dom,'repeat');
    var pf = D3Api.getProperty(dom,'parent');
    if (pf)
    {
        pf = pf.split(';');
        for(var i = 0, c = pf.length; i < c; i++)
        {
            var nf = pf[i].split(':');
            if (nf.length > 1)
            {
                var fields = [];
                var rep = form.getRepeater(nf[0]);
                for(var fi = 1, fc = nf.length; fi < fc; fi++)
                {
                    var pcf = nf[fi].split('=');
                    if(pcf.length > 1)
                    {
                        var isfunc = pcf[1][0] == '@';
                        fields.push({parent: pcf[0], parentKey: rep.keyField, child: (isfunc)?pcf[1].substr(1):pcf[1], isfunc: isfunc});
                        rep.setParentKeyField(pcf[0]);
                    }else
                        fields.push({parent: null, parentKey: rep.keyField, child: pcf[0]});
                }
                this.parentFields.push({rep:nf[0],fields: fields});
            }
        }
    }
    pf = null;
    var cnd = D3Api.getProperty(dom,'condition');
    if (cnd)
    {
        this.conditions = {};
        cnd = cnd.split(';');
        for(var i = 0, c = cnd.length; i < c; i++)
        {
            var cndf = cnd[i].split('=');
            this.conditions[cndf[0]] = {
                value: (cndf[1]===undefined)?null:(cndf[1][0]=='@'?cndf[1].substr(1):cndf[1]),
                isfunc: cndf[1] && cndf[1][0]=='@'
            }

        }
    }
    cnd = null;

    this.distinct = D3Api.getProperty(dom,'distinct',null);

    if(!D3Api.getBoolean(D3Api.getProperty(dom,'repeatershow','false')))
        D3Api.showDom(this.DOM,false);

    var prop = null;
    if (prop = D3Api.getProperty(dom, 'onbefore_repeat')){
        this.addEvent('onbefore_repeat', form.execDomEventFunc(dom, {func: prop, args: 'container'}));
    }
    if (prop = D3Api.getProperty(dom, 'onafter_repeat')){
        this.addEvent('onafter_repeat', form.execDomEventFunc(dom, {func: prop, args: 'container'}));
    }
    if (prop = D3Api.getProperty(dom, 'onbefore_clone')){
        this.addEvent('onbefore_clone', form.execDomEventFunc(dom, {func: prop, args: 'data'}));
    }
    if (prop = D3Api.getProperty(dom, 'onafter_clone')){
        this.addEvent('onafter_clone', form.execDomEventFunc(dom, {func: prop, args: 'data,clone'}));
    }
    if (prop = D3Api.getProperty(dom, 'onclone_remove')){
        this.addEvent('onclone_remove', form.execDomEventFunc(dom, {func: prop, args: 'clone'}));
    }


    this.destructor = function()
    {
        if(eventDataReadyUid)
        {
            this.dataSet.removeEvent('ondata_ready',eventDataReadyUid);
        }
        this.parent = null;
        this.childs = null;
        this.dataSet = null;
        this.dataSetUid = null;
        this.DOM = null;
        this.targetDOM = null;
        this.form = null;
        this.controls = null;
        this.parentFields = null;
        this.conditions = null;
        this.changedData = null;
        this.distinct = null;
        this.dataChild = null;
        this.childKeys = null;
        this.currentData = null;
        this.rootParent = null;
        this.emptydata = null;

        delete this.parent;
        delete this.childs;
        delete this.dataSet;
        delete this.dataSetUid;
        delete this.DOM;
        delete this.targetDOM;
        delete this.form;
        delete this.controls;
        delete this.parentFields;
        delete this.conditions;
        delete this.changedData;
        delete this.distinct;

        for(var i = 0,len = simpleClones.length ; i < len ; i++){
            clearTimeout(simpleClones[i]);
        }
        this.destructorBase();
    }
    this.setAsync = function (async) {
        this.async = +async || 0;
    };
    this.setParentKeyField = function(field,remove)
    {
        remove = remove || false;
        if(remove)
        {
            this.parentKeyFields[field] = undefined;
            delete this.parentKeyFields[field];
        }else
            this.parentKeyFields[field] = true;
    }
    this.addControl = function(dom)
    {
        this.form.addInControls(this.controls,dom);
    }
    this.addChild = function(repeater)
    {
        repeater.rootParent = this.rootParent || this;
        if(repeater.detail === null)
            repeater.detail = true;
        this.childs.push(repeater)
    }
    this.setTargetDom = function(dom)
    {
        if(!dom && this.form.currentContext)
        {
            var dom = D3Api.getDomBy(this.form.currentContext, '#'+this.uniqId+'[repeatername="'+this.name+'"]');

            //fix safari selector # -> []
            if (!dom) {
                dom = D3Api.getDomBy(this.form.currentContext, '[id="'+this.uniqId+'"][repeatername="'+this.name+'"]');
            }

            if(!dom)
                return;
        }
        this.targetDOM = dom || this.DOM;
    }
    this.setData = function(data)
    {
        if(!this.dataSet || !(this.dataSet instanceof D3Api.D3DataSet))
            this.dataSet = {data: data, uidData: D3Api.getUniqId()};

        if(this.isSimple || this.rootParent && this.rootParent.isSimple)
        {
            this.prepareData();

            var rP = this.rootParent || this;

            rP.checkPrepareData() &&  rP.simpleRepeat();
        }else
            this.repeat();
    }

    this.dataSet = null;
    this.dataSetUid = null;
    if(!D3Api.hasProperty(dom, 'nodataset'))
        this.dataSet = dataset;
    var eventDataReadyUid = null;
    if (!D3Api.hasProperty(dom, 'onlycreate') && this.dataSet)
    {
        if(this.standalone)
            this.dataSet.allResponse = true;
        eventDataReadyUid = this.dataSet.addEvent('ondata_ready',D3Api.bindThis(this.setData,this));
    }

    var distinctData = {};
    this.repeat = function(forceRepeat,containerDOM,innerStart,clCount)
    {
        fragmentElements = [];
        if(this.detail === false && containerDOM && !innerStart)
            return;

        if(this.standalone && !this.form.currentContext)
        {
            return;
        }

        var topLevel = (!this.detail && !containerDOM) || innerStart;

        if(!innerStart)
        {
            if(!forceRepeat && !containerDOM && this.dataSet)
            {
                if(this.dataSetUid == this.dataSet.uidData)
                    return;
            }
            if(this.noRepeat && !forceRepeat)
                return;
            //if (this.parent && (this.parent.clones().length == 1) && ((parent && this.parent != parent) || (!parent && this.parent)))
            //    return;

            //Удаляем всех своих клонов
            this.targetDOM = null;
            this.removeAllClones(containerDOM);
            //Если больше одного уровня вложенности можем потерять изменения при замкнутом контексте на клон
            var tmpCntxt = this.form.currentContext;
            this.form.currentContext = null;
            if(this.clonesCount() == 0)
            {
                this.changedData = {
                    add : {},
                    upd : {},
                    del : {}
                }
            }
            this.form.currentContext = tmpCntxt;
            var oldFilter;
            var clCount = clCount || 0;
            containerDOM = containerDOM || this.form.DOM;
            if(this.standalone)
            {
                containerDOM = this.form.currentContext;
            }
            distinctData = {};
            if(!this.dataSet)
                return;
            if (this.parent && this.parentFields.length <= 0 && containerDOM.querySelectorAll('#'+this.DOM.id+':not([isrepeat])').length <=0 )
            {
                return;
            }
            this.dataSetUid = this.dataSet.uidData;
            if (this.callEvent('onbefore_repeat',containerDOM) === false)
                return;
        }
        var self = this;
        for(var i = innerStart || 0, c = this.dataSet.data.length; i < c; i++)
        {
            if(this.distinct)
            {
                if(distinctData[this.dataSet.data[i][this.distinct]])
                    continue;
                distinctData[this.dataSet.data[i][this.distinct]] = true;
            }
            if (this.conditions)
            {
                var next = false;
                for(var cnd in this.conditions)
                {
                    if(!this.conditions.hasOwnProperty(cnd)){
                        continue;
                    }
                    if(this.conditions[cnd].isfunc)
                    {
                        if(!this.form.callFunction(this.conditions[cnd].value,cnd,this.dataSet.data[i]))
                        {
                            next = true;
                            break;
                        }
                        continue;
                    }
                    if (this.dataSet.data[i][cnd] != this.conditions[cnd].value)
                    {
                        next = true;
                        break;
                    }
                }
                if (next)
                {
                    if(this.distinct)
                    {
                        distinctData[this.dataSet.data[i][this.distinct]] = false;
                    }
                    continue;
                }
            }
            var filter = '';
            if (this.parentFields.length > 0)
            {
                filter = [];
                for(var pi = 0, pc = this.parentFields.length; pi < pc; pi++)
                {
                    var selector = '.repeatername_'+this.parentFields[pi].rep;
                    for(var fi = 0, fc = this.parentFields[pi].fields.length; fi < fc; fi++)
                    {
                        if(this.parentFields[pi].fields[fi].parent)
                        {
                            var value;
                            if(this.parentFields[pi].fields[fi].isfunc)
                            {
                                value = this.form.callFunction(this.parentFields[pi].fields[fi].child,this.parentFields[pi].fields[fi].parent,this.dataSet.data[i]);
                            }else
                                value = this.dataSet.data[i][this.parentFields[pi].fields[fi].child];
                            selector += '.'+(this.parentFields[pi].fields[fi].parent+'_keyvalue'+value).replace(/\./g,'_');
                        }else
                            selector += '.repkeyvalue'+(''+this.dataSet.data[i][this.parentFields[pi].fields[fi].child]).replace(/\./g,'_');
                    }
                    filter.push(selector);
                }
                filter = filter.join(' ')+' ';
            }

            if (oldFilter != filter){
                var rptrs = containerDOM.querySelectorAll(filter+'#'+this.DOM.id+':not([isrepeat])');// TODO переделать onafter_refresh, на onafter_repeat например комбик
            }

            if (rptrs.length > 0)
                clCount++;
            else
            {
                if(this.distinct)
                {
                    distinctData[this.dataSet.data[i][this.distinct]] = false;
                }
            }

            for(var ri = 0, rc = rptrs.length; ri < rc; ri++)
            {
                this.targetDOM = rptrs[ri];

                addClone.call(this,this.dataSet.data[i],undefined,false, !nofragment );
            }
            oldFilter = filter;
            if(this.repeatCount > 0 && clCount >= this.repeatCount)
                break;

            if(this.async && topLevel && i > 0 && (innerStart === undefined || +innerStart>=1)  && i % this.async == 0)
            {
                insertFragmentElements();
                setTimeout(function(){
                    self.repeat(forceRepeat,containerDOM,++i,clCount)
                },0);
                return;
            }

        }
        insertFragmentElements();
        //Empty Data

        if(this.emptydata && clCount == 0)
        {
            var filter = '';
            if (this.parentFields.length > 0)
            {
                filter = [];
                for(var pi = 0, pc = this.parentFields.length; pi < pc; pi++)
                {
                    var selector = '.repeatername_'+this.parentFields[pi].rep;
                    filter.push(selector);
                }
                filter = filter.join(' ')+' ';
            }
            var rptrs = containerDOM.querySelectorAll(filter+'#'+this.DOM.id+':not([isrepeat])');
            for(var ri = 0, rc = rptrs.length; ri < rc; ri++)
            {
                this.targetDOM = rptrs[ri];
                if(this.emptydataparent)
                {
                    for(var f in this.emptydataparent)
                    {
                        if(!this.emptydataparent.hasOwnProperty(f)){
                            continue;
                        }
                        var parentclonedom = this.form.getClone(this.targetDOM);
                        if(parentclonedom && parentclonedom.clone)
                            this.emptydata[f] = parentclonedom.clone.data[this.emptydataparent[f]];
                    }
                }
                addClone.call(this,this.emptydata,undefined,false);
            }
        }
        this.callEvent('onafter_repeat',containerDOM);
    }
    function insertFragmentElements(){
        for(var remFragment = fragmentElements.splice(0, 1);remFragment && remFragment.length > 0; remFragment = fragmentElements.splice(0, 1)){
            remFragment[0].TargetElement.parentNode.insertBefore(remFragment[0].TargetFragment,remFragment[0].TargetElement)
        }
    }
    this.addClone = function(data,selfDOM)
    {
        data = data || {};
        this.setTargetDom();
        return addClone.call(this,data,selfDOM,true);
    }
    function addClone(data,selfDOM,byUser,noInsertClone /** недобавлять клон в основной документ. **/)
    {
        var targetDOM = (selfDOM)?this.DOM:((this.targetDOM)?this.targetDOM:this.DOM);
        this.hasClones = true;
        if (this.callEvent('onbefore_clone',data) === false){
            return;
        }

        var cl_dom = this.DOM.cloneNode(true);
        D3Api.removeProperty(cl_dom,'isD3Repeater');
        D3Api.removeProperty(cl_dom, 'dataset');
        this.form.clearEvents('oninit');
        var cl_uid = D3Api.getUniqId('cl');
        cl_dom.clone = {data: data, uid: cl_uid};
        this.parseClone(cl_dom,undefined,cl_uid);
        if(!noInsertClone){
            targetDOM && targetDOM.parentNode.insertBefore(cl_dom,targetDOM);
        }else{

            /** Корневой репитер. все дочерние клоны будут во фрагменте. **/
            var isAddTempFragment = true;
            var currfragment = false;
            for(var indxFrm = 0 ; indxFrm < fragmentElements.length ; indxFrm++){
                if(fragmentElements[indxFrm].TargetElement === targetDOM){
                    currfragment = fragmentElements[indxFrm];
                    isAddTempFragment = false;
                    break;
                }
            }

            if(!currfragment){
                var len = fragmentElements.push({
                    TargetElement:this.targetDOM,
                    TargetFragment:document.createDocumentFragment()
                })
                currfragment = fragmentElements[len - 1];
            }
            if(currfragment){
                if(this.parent){
                    if(isAddTempFragment){
                        currfragment.TargetFragment.appendChild(cl_dom);
                    }else{
                        //добавляем перед шаблоном
                        var templ = currfragment.TargetFragment.childNodes.length - 1;
                        currfragment.TargetFragment.insertBefore(cl_dom,currfragment.TargetFragment.childNodes[templ]);
                    }
                }else{
                    currfragment.TargetFragment.appendChild(cl_dom);
                }
            }
        }
        this.form.closureContext(cl_dom);
        this.form.callEvent('oninit');
        this.form.unClosureContext();
        var _data_ = this.form.setControlsData(this.controls,data,cl_dom,this.actionData);

        if (this.actionData)
            cl_dom.clone._data_ = D3Api.JSONstringify(_data_);//MD5.hex_md5

        cl_dom.id += 'clone';
        if (this.keyField)
        {
            cl_dom.setAttribute('repkeyvalue',data[this.keyField]);
            D3Api.addClass(cl_dom, ('repkeyvalue'+data[this.keyField]).replace(/\./g,'_'));
        }
        if(this.parentKeyFields)
        {
            for(var key in this.parentKeyFields)
            {
                if(!this.parentKeyFields.hasOwnProperty(key)){
                    continue;
                }
                cl_dom.setAttribute(key+'_keyvalue',data[key]);
                D3Api.addClass(cl_dom, (key+'_keyvalue'+data[key]).replace(/\./g,'_'));
            }
        }

        for(var i = 0, ic = this.childs.length; i < ic; i++)
        {
            this.childs[i].repeat(this,cl_dom,false,undefined,byUser);
        }

        D3Api.showDom(cl_dom,true);
        this.form.closureContext(cl_dom);
        this.callEvent('onafter_clone',cl_dom.clone.data,cl_dom);
        this.form.unClosureContext();
        if (this.name && D3Api.empty(data[this.keyField]))
        {
            this.changedData['add'][cl_dom.clone.uid] = cl_dom;
        }
        return cl_dom;
    }
    this.parseClone = function(dom,domContext,cloneUid)
    {
        var cmps = D3Api.getAllDomBy(dom,'[cmptype][isrepeat="'+this.uniqId+'"],[cmpparse][isrepeat="'+this.uniqId+'"],[isd3repeater][isrepeat="'+this.uniqId+'"]');
        var i = 0, cmp = dom;
        var context = domContext||dom;
        do
        {

            D3Api.removeProperty(cmp, 'isrepeat');
            D3Api.setProperty(cmp, 'isclone', "1");
            D3Api.setProperty(cmp, 'clone_uid', cloneUid);
            this.form.default_parse(cmp,false,context);
            cmp = cmps[i++];
        }while(cmp);
        var cmps = D3Api.getAllDomBy(dom,'[dataset][onbefore_refresh][isrepeat="'+this.uniqId+'"],[dataset][onrefresh][isrepeat="'+this.uniqId+'"],[dataset][onafter_refresh][isrepeat="'+this.uniqId+'"]');
        var i = 0, cmp = dom;
        while(i < cmps.length)
        {
            var cmp = cmps[i++];
            var dataset = this.form.getDataSet(D3Api.getProperty(cmp,'dataset'));
            var prop = null;
            if(prop = D3Api.getProperty(cmp,'onbefore_refresh'))dataset.addEvent('onbefore_refresh',this.form.execDomEventFunc(cmp,prop));
            if(prop = D3Api.getProperty(cmp,'onrefresh'))dataset.addEvent('onrefresh',this.form.execDomEventFunc(cmp,prop));
            if(prop = D3Api.getProperty(cmp,'onafter_refresh'))dataset.addEvent('onafter_refresh',this.form.execDomEventFunc(cmp,prop));
        }
    }
    this.removeAllClones = function(containerDOM)
    {
        var clones = this.clones(containerDOM);
        for(var i = 0, c = clones.length; i < c; i++)
        {
            this.removeClone(clones[i]);
        }
    }
    this.removeClone = function(clone)
    {
        if(clone.clone)
        {
            if (this.changedData['add'][clone.clone.uid])
                delete this.changedData['add'][clone.clone.uid];
            else
            {
                if(this.parent)
                {
                    var parentClone = this.form.getClone(clone,this.parent.name);
                    if(parentClone)
                        clone.clone.parentUid = parentClone.clone.uid;
                }
                this.changedData['del'][clone.clone.uid] = clone;
            }
        }
        D3Api.removeDom(clone);
        this.callEvent('onclone_remove',clone);
    }
    this.clones = function(containerDOM)
    {
        if(!containerDOM)
        {
            if(this.form.currentContext && D3Api.getProperty(this.form.currentContext,'repeatername','') != this.name && D3Api.getDomBy(this.form.currentContext,'#'+this.uniqId+'[repeatername="'+this.name+'"]'))
            {
                containerDOM = this.form.currentContext;
            }else
            {
                containerDOM = this.targetDOM || this.form.DOM;
                if(fragmentElements.length > 0 && (!nofragment || !D3Api.empty(this.parent))){
                    for(var i = 0 ; i < fragmentElements.length ; i++){
                        if(fragmentElements[i].TargetElement === containerDOM){
                            containerDOM = fragmentElements[i].TargetFragment
                            break;
                        }
                    }
                }else{
                    if (containerDOM && containerDOM.parentNode){
                        containerDOM = containerDOM.parentNode;
                    }
                }

            }
        }
        if (containerDOM)
            return containerDOM.querySelectorAll('#'+this.uniqId+'clone');
    }
    this.clonesCount = function()
    {
        var cl = this.clones();
        if(cl && cl.length !== undefined)
            return cl.length;
        return;
    }
    this.getChangedData = function(type)
    {
        var cls = this.clones();
        var chData = {};
        var findChange = function fnFindChange(repeater,clone)
        {
            if(!repeater.name || !repeater.keyField)
                return false;
            var cls = repeater.clones(clone);
            for(var i = 0, ic = cls.length; i < ic; i++)
            {
                if (repeater.changedData['add'][cls[i].clone.uid])
                    return true;
                var _data_ = D3Api.JSONstringify(repeater.form.getControlsData(repeater.controls,cls[i]));
                if (_data_ != cls[i].clone._data_)
                    return true;
                else
                {
                    for(var c = 0, cc = repeater.childs.length; c < cc; c++)
                    {
                        if(fnFindChange(repeater.childs[c],cls[i]))
                            return true;
                    }
                }
            }
            for(var cl in repeater.changedData['del'])
            {
                if(!repeater.changedData['del'].hasOwnProperty(cl)){
                    continue;
                }
                if(repeater.changedData['del'][cl].clone.parentUid == clone.clone.uid)
                    return true;
            }
            return false;
        }
        if(type == 'each')
        {
            for(var i = 0, ic = cls.length; i < ic; i++)
            {
                chData[cls[i].clone.uid] = cls[i];
            }
        }else if (type == 'del')
        {
            for(var cl in this.changedData['del'])
            {
                if(!this.changedData['del'].hasOwnProperty(cl)){
                    continue;
                }
                if(this.parent && this.form.currentContext && this.form.currentContext.clone.uid == this.changedData['del'][cl].clone.parentUid)
                {
                    chData[cl] = this.changedData['del'][cl];
                }else if(!this.parent)
                    chData[cl] = this.changedData['del'][cl];
            }
        }else
        {
            for(var i = 0, ic = cls.length; i < ic; i++)
            {
                if (this.changedData['add'][cls[i].clone.uid] && type == 'add')
                {
                    chData[cls[i].clone.uid] = this.changedData['add'][cls[i].clone.uid];
                }
                if(this.changedData['add'][cls[i].clone.uid] || type == 'add')
                {
                    continue;
                }
                var _data_ = D3Api.JSONstringify(this.form.getControlsData(this.controls,cls[i]));
                if (_data_ != cls[i].clone._data_)
                {
                    this.changedData['upd'][cls[i].clone.uid] = cls[i];
                    chData[cls[i].clone.uid] = this.changedData['upd'][cls[i].clone.uid];
                }else
                {
                    for(var c = 0, cc = this.childs.length; c < cc; c++)
                    {
                        if(findChange(this.childs[c],cls[i]))
                        {
                            this.changedData['upd'][cls[i].clone.uid] = cls[i];
                            chData[cls[i].clone.uid] = this.changedData['upd'][cls[i].clone.uid];
                            break;
                        }
                    }
                }
            }
        }
        return chData;
    }

    /**************************************/
    //Идентификаторы дынных сгруппированных по связи с родителями
    this.dataChild = {};

    //Ключи для текущей строки для детей у которых текущий репитер указан в связях с родителем
    this.childKeys = {};
    this.currentData = [];
    this.isDataPrepared = false;
    this.prepareData = function()
    {
        if(this.isDataPrepared)
        {
            return;
        }
        this.isDataPrepared = true;
        if(this.parentFields.length <= 0)
        {
            this.dataChild = null;
            return;
        }
        this.dataChild = {};
        var firstRow = true;
        for(var i = 0, c = this.dataSet.data.length; i < c; i++)
        {
            var pKey = [];

            for(var ri = 0, rc = this.parentFields.length; ri < rc; ri++)
            {
                if(firstRow)
                {
                    var rep = form.getRepeater(this.parentFields[ri].rep);
                    rep.addChildKey(this.name,this.parentFields[ri].fields);
                }
                var pVal = [];
                for(var fi = 0, fc = this.parentFields[ri].fields.length; fi < fc; fi++)
                {
                    var pF = this.parentFields[ri].fields[fi].parent || this.parentFields[ri].fields[fi].parentKey;
                    pVal.push(pF+'='+this.dataSet.data[i][this.parentFields[ri].fields[fi].child]);
                }
                pKey.push(this.parentFields[ri].rep+':'+pVal.join(':'));
            }
            this.dataChild[pKey.join(';')] = this.dataChild[pKey.join(';')] || [];
            this.dataChild[pKey.join(';')].push(i);
            firstRow = false;
        }
    }
    this.checkPrepareData = function(reset)
    {
        if(!reset && !this.isDataPrepared)
            return false;

        reset && (this.isDataPrepared = false);

        for(var i = 0, c = this.childs.length; i < c; i++)
        {
            if(!this.childs[i].checkPrepareData(reset) && !reset)
                return false;
        }
        return true;
    }
    this.addChildKey = function(name,info)
    {
        this.childKeys[name] = info;
    }
    this.getKey = function(childName)
    {
        if(!this.childKeys[childName])
            return false;
        var pVal = [];
        for(var i = 0, c = this.childKeys[childName].length; i < c; i++)
        {
            var pF = this.childKeys[childName][i].parent || this.childKeys[childName][i].parentKey;
            pVal.push(pF+'='+this.currentData[pF]);
        }
        return this.name+':'+pVal.join(':');
    }
    this.isCurrentRepeat = null;
    this.clonesFragment = null;
    this.simpleRepeat = function(forceRepeat,containerDOM,dataIndex,startIndex,clCount)
    {
        containerDOM = containerDOM || this.DOM;
        var topLevel = !this.parent;
        if(!dataIndex)
        {
            if(topLevel && !forceRepeat && (this.noRepeat || this.dataSet && this.dataSetUid == this.dataSet.uidData))
            {
                return;
            }
            if(this.dataSet)
                this.dataSetUid = this.dataSet.uidData;
            if (this.callEvent('onbefore_repeat',containerDOM) === false)
                return;
            dataIndex = [];
            if(this.parent && this.parentFields.length > 0)
            {
                var key = [];
                var p = this.parent;
                while(p)
                {
                    var pk = p.getKey(this.name);
                    pk && key.push(pk);
                    p = p.parent;
                }
                key.reverse();
                key = key.join(';');
                dataIndex = this.dataChild[key] || [];
            }else
            {
                dataIndex = Object.keys(this.dataSet.data);
            }
            if(topLevel)
            {
                if(this.isCurrentRepeat)
                {
                    clearTimeout(this.isCurrentRepeat);
                    this.isCurrentRepeat = null;
                }
                this.removeAllClones();
                this.changedData = {
                    add : {},
                    upd : {},
                    del : {}
                };
                this.clonesFragment = null;
                this.clonesFragment = document.createDocumentFragment();
            }
            distinctData = {};
        }
        clCount = clCount || 0;
        for(var i = startIndex || 0, c = dataIndex.length; i < c; i++)
        {
            this.currentData = this.dataSet.data[dataIndex[i]];
            if(this.distinct)
            {
                if(distinctData[this.currentData[this.distinct]])
                    continue;
                distinctData[this.currentData[this.distinct]] = true;
            }
            if (this.conditions)
            {
                var next = false;
                for(var cnd in this.conditions)
                {
                    if(!this.conditions.hasOwnProperty(cnd)){
                        continue;
                    }
                    if(this.conditions[cnd].isfunc)
                    {
                        if(!this.form.callFunction(this.conditions[cnd].value,cnd,this.currentData))
                        {
                            next = true;
                            break;
                        }
                        continue;
                    }
                    if (this.currentData[cnd] != this.conditions[cnd].value)
                    {
                        next = true;
                        break;
                    }
                }
                if (next)
                {
                    if(this.distinct)
                    {
                        distinctData[this.currentData[this.distinct]] = false;
                    }
                    continue;
                }
            }
            this.simpleClone(containerDOM);
            clCount++;
            if(this.repeatCount > 0 && clCount >= this.repeatCount)
                break;
            if(this.async && topLevel && i > 0 && (startIndex === undefined || +startIndex>=1)  && (i % this.async) === 0)
            {
                this.isCurrentRepeat = setTimeout(D3Api.bindThis(function(){this.simpleRepeat(true,containerDOM,dataIndex,++i,clCount)},this),100);
                return;
            }
        }

        if(!this.parent)
        {
            this.checkPrepareData(true);
            containerDOM.parentNode.insertBefore(this.clonesFragment,containerDOM);
            this.clonesFragment = null;
            this.callEvent('onafter_repeat',containerDOM);
        }
    }
    this.simpleClone = function(containerDOM)
    {
        for(var i = 0, c = this.controls.length; i < c; i++)
        {
            for (var prop  in this.controls[i].datafields)
            {
                if(!this.controls[i].datafields.hasOwnProperty(prop)){
                    continue;
                }
                var v = this.currentData[this.controls[i].datafields[prop]];
                this.form.setControlProperty(this.controls[i].control, prop, v);
            }
        }
        var clone = this.DOM.cloneNode(true);
        D3Api.removeProperty(clone,'isD3Repeater');
        clone.clone = {data: this.currentData, uid: D3Api.getUniqId('cl'),timeout:null};
        for(var ci = 0, cc = this.childs.length; ci < cc; ci++)
        {
            this.childs[ci].simpleRepeat(true,clone.querySelector('#'+this.childs[ci].uniqId));
        }
        if(this.parent)
            containerDOM.parentNode.insertBefore(clone,containerDOM);
        else
            this.clonesFragment.appendChild(clone);
        D3Api.showDom(clone,true);
        clone.id += 'clone';
        this.simpleParseClone(clone,undefined,clone.clone.uid);
        this.form.closureContext(clone);
        var smpl = this.simpleType||(this.rootParent && this.rootParent.simpleType);
        if(smpl === 'base')
        {
            var self = this;
            var timerId = setTimeout(function(){
                /**выполняется из очереди вызова за это время форма успела уже закрыться**/
                if(self.form){
                    self.callEvent('onafter_clone',clone.clone.data,clone);
                    if(clone.clone.timeout){
                        var indx = simpleClones.indexOf(clone.clone.timeout);
                        if(indx > -1){
                            simpleClones.splice(indx,1);
                        }
                        indx = null;
                        clone.clone.timeout = null;
                        delete indx;
                    }
                }
            },0);
            clone.clone.timeout = timerId;
            simpleClones.push(clone.clone.timeout);
        }else
            this.callEvent('onafter_clone',clone.clone.data,clone);
        this.form.unClosureContext();
        return clone;
    }
    this.simpleParseClone = function(dom,domContext,cloneUid)
    {
        var smpl = this.simpleType||(this.rootParent && this.rootParent.simpleType);
        var cmps = (smpl !== 'base')?D3Api.getAllDomBy(dom,'[isrepeat="'+this.uniqId+'"]'):[];
        var i = 0, cmp = dom;
        var context = domContext||dom;
        do
        {
            if(smpl === 'closure')
            {
                var onclk = cmp.getAttribute('onclick');
                if(onclk !== '')
                {
                    cmp.D3Store = {_setEvents_:{onclick: true}};
                    cmp.onclick = this.form.execDomEventFunc(cmp, 'if(callControlEvent(D3Api.getControlByDom(this),\'onclick\',event)===false)return;' + onclk, 'onclick', context);
                    if (D3Api.BROWSER.msie) {
                        D3Api.setProperty(dom, '_onclick_', onclk);
                    }
                }
            }else
                cmp.D3Store = {};
            cmp = cmps[i++];
        }while(cmp);
    }
    /**************************************/

    this.addControl(this.DOM);
}
//Глобальные вспомогательные функции
if(window.history && !window.history.pushState)
{
    window.history.constructor.prototype.pushState = function(){};
}
D3Api.globalClientData = new function()
{
    var prefix = 'D3:' + location.pathname + ':';
    this.storage = {};
    var checkStorage = function(_storageName){
        try {
            if (window[_storageName]){
                window[_storageName].getItem(prefix+':Exception');
                return true;
            }
        }catch (e){}
        return false;
    };
    if(checkStorage('localStorage')){
        this.storage = window.localStorage;
    }else if(checkStorage('globalStorage')){
        this.storage = window.globalStorage[document.domain];
    }

    this.get = function(name,defaultValue){
        if(this.storage[prefix+name] === undefined)
            return defaultValue;
        return String(this.storage[prefix+name]);
    };
    this.set = function(name,value){
        if(value === undefined)
        {
            this.storage[prefix+name] = undefined;
            delete this.storage[prefix+name];
            return;
        }
        this.storage[prefix+name] = value;
    }
};

if (!("console" in window) || !("log" in console))
{
    var names = ["log", "debug", "info", "warn", "error", "assert", "dir", "dirxml",
    "group", "groupEnd", "time", "timeEnd", "count", "trace", "profile", "profileEnd"];

    window.console = {};
    for (var i = 0; i < names.length; ++i)
        window.console[names[i]] = function() {};
}else
{
    var names = ["log", "debug", "info", "warn", "error", "assert", "dir", "dirxml",
    "group", "groupEnd", "time", "timeEnd", "count", "trace", "profile", "profileEnd"];

    for (var i = 0; i < names.length; ++i)
        if (!(names[i] in console))
            window.console[names[i]] = function() {};
}
if(!Array.prototype.indexOf){
    Array.prototype.indexOf=function(value,offset){
        for(var i=(offset||0),j=this.length;i<j;i++){
            if(this[i]==value){return i;}
        }
        return -1;
    }
}

D3Api.getPageWindowSize = function(parent)
{
	parent = parent || document.body;
    var windowWidth, windowHeight;
    var pageHeight, pageWidth;
    if (parent != document.body) {
      windowWidth = parent.getWidth();
      windowHeight = parent.getHeight();
      pageWidth = parent.scrollWidth;
      pageHeight = parent.scrollHeight;
    }
    else {
      var xScroll, yScroll;

      if (window.innerHeight && window.scrollMaxY) {
        xScroll = document.body.scrollWidth;
        yScroll = window.innerHeight + window.scrollMaxY;
      } else if (document.body.scrollHeight > document.body.offsetHeight){ // all but Explorer Mac
        xScroll = document.body.scrollWidth;
        yScroll = document.body.scrollHeight;
      } else { // Explorer Mac...would also work in Explorer 6 Strict, Mozilla and Safari
        xScroll = document.body.offsetWidth;
        yScroll = document.body.offsetHeight;
      }


      if (self.innerHeight) {  // all except Explorer
        windowWidth = self.innerWidth;
        windowHeight = self.innerHeight;
      } else if (document.documentElement && document.documentElement.clientHeight) { // Explorer 6 Strict Mode
        windowWidth = document.documentElement.clientWidth;
        windowHeight = document.documentElement.clientHeight;
      } else if (document.body) { // other Explorers
        windowWidth = document.body.clientWidth;
        windowHeight = document.body.clientHeight;
      }

      // for small pages with total height less then height of the viewport
      if(yScroll < windowHeight){
        pageHeight = windowHeight;
      } else {
        pageHeight = yScroll;
      }

      // for small pages with total width less then width of the viewport
      if(xScroll < windowWidth){
        pageWidth = windowWidth;
      } else {
        pageWidth = xScroll;
      }
    }
    return {pageWidth: pageWidth ,pageHeight: pageHeight , windowWidth: windowWidth, windowHeight: windowHeight};
}

D3Api.getAbsoluteSize = function(element){
    if(!element) return;
    var display = element.style.display;
    if (display != 'none' && display != null) // Safari bug
    return {width: element.offsetWidth, height: element.offsetHeight};

    // All *Width and *Height properties give 0 on elements with display none,
    // so enable the element temporarily
    var els = element.style;
    var originalVisibility = els.visibility;
    var originalPosition = els.position;
    var originalDisplay = els.display;
    els.visibility = 'hidden';
    els.position = 'absolute';
    els.display = 'block';
    var originalWidth = element.clientWidth;
    var originalHeight = element.clientHeight;
    els.display = originalDisplay;
    els.position = originalPosition;
    els.visibility = originalVisibility;
    return {width: originalWidth, height: originalHeight};
}
D3Api.getAbsoluteRect = function(element,scrollNeed){
        if(!element) return;
        var pos=D3Api.getAbsolutePos(element);
        var size=D3Api.getAbsoluteSize(element);
        if (scrollNeed)
        {
        	pos.x -= D3Api.getBodyScrollLeft();
        	pos.y -= D3Api.getBodyScrollTop();
        }
        return {x:pos.x, y:pos.y, width:size.width, height:size.height};
}
D3Api.getAbsoluteClientRect = function(elem,xScroll,yScroll) {
    var rect = elem.getBoundingClientRect();

    var scrollTop = D3Api.getBodyScrollTop();
    var scrollLeft = D3Api.getBodyScrollLeft()

    var coordy  = rect.top + ((yScroll === false)?0:scrollTop);
    var coordx = rect.left + ((xScroll === false)?0:scrollLeft);

    return {y: Math.round(coordy), x: Math.round(coordx), width: rect.width || (rect.right-rect.left),height: rect.height || (rect.bottom-rect.top)};
}
D3Api.getBodyScrollTop = function()
{
  return self.pageYOffset || (document.documentElement && document.documentElement.scrollTop) || (document.body && document.body.scrollTop);
}

D3Api.getBodyScrollLeft = function()
{
  return self.pageXOffset || (document.documentElement && document.documentElement.scrollLeft) || (document.body && document.body.scrollLeft);
}
D3Api.getPageEventCoords = function(evt)
{
	var coords = {left:0, top:0};
	if(evt.pageX)
	{
		coords.left = evt.pageX;
		coords.top = evt.pageY;
	}
	else if(evt.clientX)
	{
		coords.left = evt.clientX + document.body.scrollLeft - document.body.clientLeft;
		coords.top  = evt.clientY + document.body.scrollTop - document.body.clientTop;

		if (document.body.parentElement && document.body.parentElement.clientLeft)
		{
		var bodParent = document.body.parentElement;
			coords.left += bodParent.scrollLeft - bodParent.clientLeft;
			coords.top  += bodParent.scrollTop - bodParent.clientTop;
		}
	}
	return coords;
}
D3Api.returnGET = function(notlower)
{
    var keyVal = (window.location.search.substr(1)).split('&');
    var resGet = {};
    var p= -1;
    var key= '';
    for(var i=0; i < keyVal.length; i++)
    {
      p = keyVal[i].search('=');
      key = keyVal[i].substr(0,p);
      resGet[notlower?key:key.toLowerCase()] = decodeURIComponent(keyVal[i].substr(p+1));
    }
    return resGet;
}
D3Api.getControlPropertyByDom = function(controlDom,nameProperty,noGetEvent)
{
    var ct = D3Api.getProperty(controlDom,'cmptype');
    if (!ct)
    {
        //D3Api.debug_msg('У объекта нет API');
        return;
    }
    var objProp = false;
    if(nameProperty.indexOf('.') != -1)
    {
        nameProperty = nameProperty.split('.');
        objProp = nameProperty[1];
        nameProperty = nameProperty[0];
    }
    if (!D3Api.controlsApi[ct] || !D3Api.controlsApi[ct][nameProperty] || !D3Api.controlsApi[ct][nameProperty].get)
    {
        D3Api.debug_msg('Нет метода получения свойства "'+nameProperty+'" для компонента с типом: '+ct);
        return;
    }

    var ref = {value: D3Api.controlsApi[ct][nameProperty].get.call(this, controlDom)};
    if(objProp && ref.value)
        ref.value = ref.value[objProp];
    if(noGetEvent !== true && controlDom.D3Base)
    {
        controlDom.D3Base.callEvent('onget_property',nameProperty,ref);
    }
    return ref.value;
}
D3Api.setControlPropertyByDom = function(controlDom,nameProperty,value,noChangeEvent,isUserEvent)
{
    var ct = D3Api.getProperty(controlDom,'cmptype');
    if (!ct)
    {
        D3Api.debug_msg('У объекта нет API');
        return;
    }
    if (!D3Api.controlsApi[ct] || !D3Api.controlsApi[ct][nameProperty] || !D3Api.controlsApi[ct][nameProperty].set)
    {
        D3Api.debug_msg('Нет метода установки свойства "'+nameProperty+'" для компонента с типом: '+ct);
        return;
    }

    var usEv = D3Api.__isUserEvent__;
    D3Api.__isUserEvent__ = isUserEvent;
    var resValue = {value: value, forceOnChange: false};
    var res = D3Api.controlsApi[ct][nameProperty].set.call(this, controlDom, value, resValue);

    controlDom.D3Store._properties_ = controlDom.D3Store._properties_ || {};
    if(resValue.forceOnChange || (noChangeEvent !== true && controlDom.D3Base && (res === undefined || res === true) && ((controlDom.D3Store._properties_[nameProperty] === undefined && resValue.value !== undefined) || (controlDom.D3Store._properties_[nameProperty] !== undefined && controlDom.D3Store._properties_[nameProperty] !== resValue.value))))
    //if(noChangeEvent !== true && controlDom.D3Base && (res === undefined || res === true) && controlDom.D3Store._properties_[nameProperty] !== value)
    {
        var oldVal = controlDom.D3Store._properties_[nameProperty];
        controlDom.D3Store._properties_[nameProperty] = resValue.value;
        controlDom.D3Base.callEvent('onchange_property',nameProperty,resValue.value,oldVal);
    }
    D3Api.__isUserEvent__ = usEv;
    return res;
}
D3Api.getControlAPIByDom = function(controlDom)
{
    var ct = D3Api.getProperty(controlDom,'cmptype');
    if (!ct)
    {
        D3Api.debug_msg('У объекта нет API');
        return;
    }
    return D3Api.controlsApi[ct]._API_;
}
D3Api.addControlEventByDom = function(controlDom, eventName, listener)
{
    if(!controlDom.D3Base)
        return;

    if(controlDom.D3Form && controlDom.D3Form.execDomEvents[eventName] && !controlDom.D3Store._setEvents_[eventName])
    {
        //Найти точку монтирования события
        var uid = controlDom.D3Store._uid_;
        var doms = D3Api.getAllDomBy(controlDom, '[events'+uid+'*="'+eventName+'"]');
        doms.length==0 && (doms = [controlDom]);
        var attrEventName = eventName;
        if(D3Api.BROWSER.msie)
        {
            attrEventName = '_'+eventName+'_';
        }
        for(var i = 0, c = doms.length; i < c; i++)
        {
            if(doms[i].D3Store._setEvents_[eventName])
                continue;
            doms[i].D3Store._setEvents_[eventName] = true;
            doms[i][eventName]=doms[i].D3Form.execDomEventFunc(doms[i],'if(callControlEvent(D3Api.getControlByDom(this),\''+eventName+'\',event)===false)return;'+D3Api.getProperty(doms[i],attrEventName,''),eventName);
        }

    }
    return controlDom.D3Base.addEvent(eventName, listener);
}
D3Api.callControlEventByDom = function(controlDom, eventName)
{
    if(!controlDom.D3Base)
        return;
    var args = Array.prototype.slice.call(arguments,1);
    return controlDom.D3Base.callEvent.apply(controlDom.D3Base,args);
}
D3Api.removeControlEventByDom = function(controlDom, eventName, uniqid)
{
    if(!controlDom.D3Base)
        return;

    return controlDom.D3Base.removeEvent(eventName, uniqid);
}
D3Api.getControlByDom = function(dom,cmptype,deep)
{
    deep = deep || 100;
    while(dom && dom.getAttribute && dom.nodeName.toUpperCase() != 'HTML' && (deep == undefined || deep-- > 0))
    {
        if(dom.getAttribute('cmptype') && (!cmptype || dom.getAttribute('cmptype') == cmptype))
            return dom;
        dom = dom._parentDOM_ || dom.parentNode;
    }
    return null;
}
D3Api.getDomByDomAttr = function(dom,attr,value,deep)
{
    while(dom && dom.getAttribute && dom.nodeName.toUpperCase() != 'HTML' && (deep == undefined || deep-- > 0))
    {
        if(dom.getAttribute(attr) && (!value || dom.getAttribute(attr) == value))
            return dom;
        dom = dom._parentDOM_ || dom.parentNode;
    }
    return null;
}
D3Api.scrollTo = function(dom)
{
    if(dom.scrollIntoView)
        dom.scrollIntoView();
}
D3Api.setStyle = function(dom,property,value)
{
    dom.style[property] = value;
}
D3Api.showDom = function(dom,state)
{
    dom.style.display = (state)?'':'none';
}
D3Api.showDomBlock = function(dom)
{
    dom.style.display = 'block';
}
D3Api.setDomDisplayDefault = function(dom)
{
    dom.style.display = '';
}
D3Api.hideDom = function(dom)
{
    dom.style.display = 'none';
}
D3Api.showedDom = function(dom)
{
    return dom.style.display != 'none';
}
D3Api.isChildOf = function(child,container)
{
    var c = child.parentNode;
    while (c != undefined && c != document.body && c != container)
    {
        c = c.parentNode;
    }
    return (c == container);
}
D3Api.debug_msg = function()
{
    if(D3Api.getOption('debug', 0) > 0)
        console.log.apply(console, arguments);
}
D3Api.alert_msg = function(msg,force)
{
    var res = msg.match(/(?:MESSAGE_TEXT:)([\s\S]+?)(?:PG_EXCEPTION_DETAIL:|$)/);
    if(!res)
        res = msg.match(/(?:ERROR:|ОШИБКА:|ORA\-20103:)([\s\S]+?)(?:CONTEXT:|КОНТЕКСТ:|\[!\]|$)/);
    if(res)
    {
        res = res[1].replace(/\n/g, '<br/>');
        D3Api.notify('Сообщение сервера',res,{modal: true});
        //alert(res[1]);
    }else if(force)
        alert(msg);
    //console.trace();
}
D3Api.clearDom = function(dom)
{
    while(dom.childNodes.length > 0)
        dom.removeChild(dom.childNodes[0]);
}
D3Api.createDom = function(text)
{
    var dom = document.createElement('div');
    try
    {
        dom.innerHTML = text;
        var res = dom.removeChild(dom.firstChild);
        dom = null;
        return res;
    }catch(e)
    {
        return null;
    }
}
D3Api.addDom = function(dom,newDom)
{
    return dom.appendChild(newDom);
}
D3Api.insertBeforeDom = function(dom,newDom)
{
    return dom.parentNode.insertBefore(newDom,dom);
}
D3Api.insertAfterDom = function(dom, newDom)
{
    return dom.parentNode.insertBefore(newDom, dom.nextSibling);
}
D3Api.removeDom = function(dom)
{
    if (dom && dom.parentNode)
        dom.parentNode.removeChild(dom);
}
D3Api.mixin = function (dst)
{
    for(var i = 1, c = arguments.length; i < c; i++)
    {
        if(!arguments[i]) continue;
        var obj = arguments[i];
        for(var key in obj)
        {
            if(obj.hasOwnProperty(key)){
                dst[key] = obj[key];
            }
        }
    }
    return dst;
}
D3Api.clone = function(o,deep,cdr)
{
    if (!cdr)
        cdr = 0;
    cdr++;
 	if(typeof o !== 'object')
 	{
   		return o;
 	}
    var c = {};
    if (o instanceof Array)
        c = [];
 	var v;
    if (cdr > deep)
        return c;
 	for(var p in o)
 	{
        if(o.hasOwnProperty(p))
        {
            v = o[p];
            if(v && typeof v === 'object' && !v.appendChild)
            {
                c[p] = D3Api.clone(v,deep,cdr);
            }else
            {
                c[p] = v;
            }
        }
	}
 	return c;
}
D3Api.getProperty = function getProperty(dom,name,def)
{
    var p = dom.getAttribute(name);
    if(p || dom.attributes[name])
        return (p)?p:dom.attributes[name].value;
    else
        return def;
}
D3Api.setProperty = function setProperty(dom,name,value)
{
    if (value == null)
        value = '';
    return dom.setAttribute(name,value);
}
D3Api.hasProperty = function(dom,name)
{
    return (dom.attributes && dom.attributes[name] && dom.getAttribute(name)!=undefined);
}
D3Api.removeProperty = function(dom,name)
{
    return dom.removeAttribute(name);
}
D3Api.getTextContent = function(dom)
{
    function textContent(dom)
    {
        var _result = "";
        if (dom == null) {
            return _result;
        }
        var childrens = dom.childNodes;
        var i = 0;
        while (i < childrens.length) {
            var child = childrens.item(i);
            switch (child.nodeType) {
                case 1: // ELEMENT_NODE
                case 5: // ENTITY_REFERENCE_NODE
                    _result += textContent(child);
                    break;
                case 3: // TEXT_NODE
                case 2: // ATTRIBUTE_NODE
                case 4: // CDATA_SECTION_NODE
                    _result += child.nodeValue;
                    break;
                case 6: // ENTITY_NODE
                case 7: // PROCESSING_INSTRUCTION_NODE
                case 8: // COMMENT_NODE
                case 9: // DOCUMENT_NODE
                case 10: // DOCUMENT_TYPE_NODE
                case 11: // DOCUMENT_FRAGMENT_NODE
                case 12: // NOTATION_NODE
                // skip
                break;
            }
            i++;
        }
        return _result;
    }
    return dom.text || dom.textContent || textContent(dom);
}
D3Api.getChildTag = function(dom,tagName,index)
{
    if(dom.nodeName.toUpperCase() == tagName.toUpperCase())
        return dom;
    return dom.getElementsByTagName(tagName)[index];
}
D3Api.getDomBy = function(dom,selector)
{
    return dom.querySelector(selector);
}
D3Api.getAllDomBy = function(dom,selector)
{
    return dom.querySelectorAll(selector);
}
D3Api.getDomByAttr = function(dom,attr,value)
{
    if (dom.getAttribute(attr) == value)
        return dom;
    return D3Api.getDomBy(dom,'['+attr+'="'+value+'"]');
}
D3Api.getDomByName = function(dom,name)
{
    if (dom.getAttribute('name') == name)
        return dom;
    return D3Api.getDomBy(dom,'[name="'+name+'"]');
}
D3Api.bindThis = function (func, thisObj)
{
    return function(){return func.apply(thisObj,arguments)};
}
D3Api.onContextMenuBody = function(event)
{
    var target = D3Api.getEventTarget(event);

    return (target.value != undefined);
}
D3Api.addEvent = function(dom,eventName,func,capture)
{
    if(dom.addEventListener)
    {
        dom.addEventListener(eventName,func,(capture == undefined)?false:capture);
    }else
    {
        dom.attachEvent('on'+eventName,func);
    }
    return func;
}
D3Api.removeEvent = function(dom,eventName,func,capture)
{
    if(dom.removeEventListener)
    {
        dom.removeEventListener(eventName,func,(capture == undefined)?false:capture);
    }else
    {
        dom.detachEvent('on'+eventName,func);
    }
}
D3Api.__isUserEvent__ = false;
D3Api.execDomEvent = function(dom,eventName)
{
    if (dom[eventName] instanceof Function)
    {
        var args = Array.prototype.slice.call(arguments,2);
        return dom[eventName].apply(null,args);
    }
}
D3Api.isUserEvent = function()
{
    return D3Api.__isUserEvent__;
}
D3Api.isEvent = function(e)
{
    return (e instanceof Object) && (e instanceof Event || e.target || e.currentTarget || e.srcElement);
}
D3Api.getEvent = function(e)
{
    return D3Api.isEvent(e) ? e : window.event || D3Api._event_;
}
D3Api.setEvent = function(event)
{
    D3Api._event_ = event || window.event;
    if (!D3Api.isEvent(D3Api._event_))
        D3Api._event_ = null;
}
D3Api.getEventTarget = function(e)
{
    var ev = D3Api.getEvent(e);
    if (!ev)
        return null;
    return ev.target || ev.srcElement;
}
D3Api.getEventCurrentTarget = function(e)
{
    var ev = D3Api.getEvent(e);
    if (!ev)
        return null;
    return ev.currentTarget || ev.srcElement;
}
D3Api.stopEvent = function(e,preventDefault)
{
    var ev = D3Api.getEvent(e);
    if(!ev)
        return;
    if (ev.stopPropagation) {
        ev.stopPropagation();
    } else {
        ev.cancelBubble = true;
        ev.returnValue = false;
    }
    if(ev.preventDefault && preventDefault !== false)
    {
        ev.preventDefault();
    }
    return false;
}
D3Api.charCodeEvent = function(e)
{
    if (e.charCode)
    {
            return e.charCode;
    }
    else if (e.keyCode)
    {
            return e.keyCode;
    }
    else if (e.which)
    {
            return e.which;
    }
    else
    {
            return 0;
    }
}
D3Api.getBoolean = function(v)
{
    if(typeof v === 'string') {
        v = v.trim();
    }
    return v !== 'false' && v !== '0' && !!v;
}
D3Api.empty = function(v,object)
{
    if(object && v instanceof Object)
    {
        var res = true;
        for(var p in v)
        {
            if(v.hasOwnProperty(p)){
                res = res && D3Api.empty(v[p],object);
            }
        }
        return res;
    }
    return v == undefined || v == null || v == '';
}
D3Api.isUndefined = function(v)
{
    return v === undefined || v === null;
}
D3Api.stringTrim = function(str,charlist)
{
    charlist = !charlist ? ' \\s\xA0' : charlist.replace(/([\[\]\(\)\.\?\/\*\{\}\+\$\^\:])/g, '\$1');
    var re = new RegExp('^[' + charlist + ']+|[' + charlist + ']+$', 'g');
    return str.replace(re, '');
}
//dom Class attribute
D3Api.addClass = function(c,className)
{
    var re = new RegExp("(^|\\s)" + className + "(\\s|$)", "g");
    if (c.className == undefined)
    {
        c.className = className;
        return;
    }
    if (re.test(c.className)) return;
    c.className = (c.className + " " + className).replace(/\s+/g, " ").replace(/(^ | $)/g, "");
}
D3Api.removeClass = function(c,className)
{
    var re = new RegExp("(^|\\s)" + className + "(\\s|$)", "g");
    if (c.className == undefined)
        return;
    c.className = c.className.replace(re, "$1").replace(/\s+/g, " ").replace(/(^ | $)/g, "");
}
D3Api.toggleClass = function(c,className1,className2,firstOnly)
{
    if(D3Api.hasClass(c,className1))
    {
        D3Api.removeClass(c,className1);
        D3Api.addClass(c,className2);
    }else if (!firstOnly)
    {
        D3Api.removeClass(c,className2);
        D3Api.addClass(c,className1);
    }
}
D3Api.hasClass = function(c,className)
{
    if (!className)
        return c.className != '' && c.className != undefined;
    return (c.className.search('\\b' + className + '\\b') != -1);
}
D3Api.addTextNode = function(dom,string,clear)
{
    if(clear)
        dom.innerHTML = '';
    dom.appendChild(document.createTextNode(string));
}
D3Api.htmlSpecialChars = function(string)
{
    var t = document.createElement('span');
    t.appendChild(document.createTextNode(string));

    string = t.innerHTML;
    t = null;
    return string;
}
D3Api.htmlSpecialCharsDecode = function(string, quote_style)
{
    string = string.toString();

    // Always encode
    string = string.replace('/&/g', '&');
    string = string.replace('/</g', '<');
    string = string.replace(/>/g, '>');

    if (quote_style == 'ENT_QUOTES') {
        string = string.replace('/"/g', '"');
        string = string.replace('/\'/g', '\'');
    } else if (quote_style != 'ENT_NOQUOTES') {
        string = string.replace('/"/g', '"');
    }

    return string;
}
D3Api.getStyle = function(oElm,strCssRule)
{
    var strValue = "";
    if(document.defaultView && document.defaultView.getComputedStyle){
        strValue = document.defaultView.getComputedStyle(oElm, "").getPropertyValue(strCssRule);
    }
    else if(oElm.currentStyle){
        strCssRule = strCssRule.replace(/\-(\w)/g, function (strMatch, p1){
            return p1.toUpperCase();
        });
        strValue = oElm.currentStyle[strCssRule];
    }
    return strValue;
}
D3Api.runCalcSize = function(calc_dom,size_dom)
{
    calc_dom = calc_dom || document;
    size_dom = size_dom || document;

    if (!calc_dom.querySelector || !calc_dom.querySelectorAll)
        return;

    var cH = D3Api.getAllDomBy(calc_dom,'[calc_height]');
    var cW = D3Api.getAllDomBy(calc_dom,'[calc_width]');

    var scR = D3Api.getAllDomBy(calc_dom,'[scrollable]'),
        scrollsArr = [];
    for (var scRi = 0, scR_len = scR.length; scRi < scR_len; scRi++) {
        if (scR[scRi].scrollTop > 0 || scR[scRi].scrollLeft > 0)
        {
            scrollsArr.push({
                dom: scR[scRi],
                top: scR[scRi].scrollTop,
                left: scR[scRi].scrollLeft
            });
        }
    }

    if (!cH.length && !cW.length)
        return;

    var cacheSelect = {};
    function stateBlocks(cacheBlocks,block,selfCheck)
    {
        if (!block)
        {
            for(var i = 0, c = cacheBlocks.length; i < c; i++)
                cacheBlocks[i].style.display = 'none';
            cacheBlocks = [];
            return;
        }
        if (!selfCheck)
            block = block.parentNode;
        while (block)
        {
            if (block.style && block.style.display == 'none')
            {
                block.style.display = 'block';
                cacheBlocks.push(block);
            }
            block = block.parentNode;
        }
    }
    function getS(cssSel,wh)
    {
        var blks = new Array();
        cacheSelect[cssSel] = (cacheSelect[cssSel])?cacheSelect[cssSel]:D3Api.getDomBy(size_dom,cssSel);
        stateBlocks(blks,cacheSelect[cssSel],true);
        var r = (!cacheSelect[cssSel])?0:((wh=='w')?cacheSelect[cssSel].offsetWidth:cacheSelect[cssSel].offsetHeight);
        stateBlocks(blks);
        return r;
    }

    for(var i = 0; i < cH.length; i++)
    {
        cH[i]._style_display_h_ = cH[i].style.display;
        cH[i].style.display = 'none';
    }
    var div = document.createElement('div');
    var blocks = new Array();
    for(var i = 0; i < cH.length; i++)
    {
        stateBlocks(blocks,cH[i]);
        var h = cH[i].getAttribute('calc_height');
        var parent = cH[i].parentNode.offsetHeight;
        parent = parent - (parseInt(D3Api.getStyle(cH[i].parentNode,'padding-top')) || 0)
                        - (parseInt(D3Api.getStyle(cH[i].parentNode,'padding-bottom')) || 0)
                        - (parseInt(D3Api.getStyle(cH[i].parentNode,'border-top')) || 0)
                        - (parseInt(D3Api.getStyle(cH[i].parentNode,'border-bottom')) || 0);
        if (h!='')
            cH[i].style.height = Math.abs(eval(h.replace(/#(.+?)#/gi,'getS("$1","h")')))+'px';
        stateBlocks(blocks);
    }

    for(var i = 0; i < cW.length; i++)
    {
        cW[i]._style_display_w_ = cW[i].style.display;
        cW[i].style.display = 'none';
        stateBlocks(blocks,cW[i]);
        var w = cW[i].getAttribute('calc_width');
        cW[i].parentNode.insertBefore(div,cW[i].parentNode.firstChild);
        var parent = div.offsetWidth;
        if (w!='')
            cW[i].style.width = Math.abs(eval(w.replace(/#(.+?)#/gi,'getS("$1","w")')))+'px';
        stateBlocks(blocks);
    }

    for(var i = 0; i < cW.length; i++)
        cW[i].style.display = cW[i]._style_display_w_?cW[i]._style_display_w_:'';
    for(var i = 0; i < cH.length; i++)
        cH[i].style.display = cH[i]._style_display_h_?cH[i]._style_display_h_:'';

    for (var scRi = 0, scR_len = scrollsArr.length; scRi < scR_len; scRi++)
    {
        if (scrollsArr[scRi].top > 0) {
            scrollsArr[scRi].dom.scrollTop = scrollsArr[scRi].top;
        }
        if (scrollsArr[scRi].left > 0) {
            scrollsArr[scRi].dom.scrollLeft = scrollsArr[scRi].left;
        }
    }
    scrollsArr = null;
    if (div.parentNode)
        div.parentNode.removeChild(div);

}

/**
 * Дополняем строку до нужной длины слева
 * @param nr - исходная строка
 * @param n - итоговая длина
 * @param str - чем дополнять (по умолчанию '0')
 * @returns {string}
 */
D3Api.padLeft = function (nr, n, str){
    if ((nr = nr + "").length < n )
        return new Array(++n - nr.length).join(str||'0') + nr;
    else
        return nr;
}

/**
 * Преобразует количество часов в строку со временем в формате ЧЧ:ММ
 * @param interval float - количество часов, например 1.5 = 1ч. 30 мин
 * @param withSeconds boolean - нужно ли отображать секунды
 * @returns {string}
 */
D3Api.hours2time = function (interval, withSeconds) {
    var hours = Math.floor(interval);
    var minuts =  withSeconds ? Math.floor((interval % 1)* 60+0.0001) : Math.round((interval % 1)*60);
    var seconds = withSeconds ? Math.round(((interval % 1) - minuts/60) * 3600) : null;
    var time = (hours ? (D3Api.padLeft(hours,2)) : '00') + (minuts ? (':' +D3Api.padLeft(minuts,2) ) : ':00');

    if (withSeconds){
        time += (seconds ? (':' +D3Api.padLeft(seconds,2) ) : ':00');
    }
    return time;
}

D3Api.parseDate = function ( format, timestamp )
{
	var a, jsdate = (timestamp === undefined)?(new Date()):(new Date(timestamp * 1000));
	var txt_weekdays = ["Sunday","Monday","Tuesday","Wednesday",
		"Thursday","Friday","Saturday"];
	var txt_ordin = {1:"st",2:"nd",3:"rd",21:"st",22:"nd",23:"rd",31:"st"};
	var txt_months =  ["", "January", "February", "March", "April",
		"May", "June", "July", "August", "September", "October", "November",
		"December"];

	var f = {
		// Day
			d: function(){
				return D3Api.padLeft(f.j(), 2);
			},
			D: function(){
				var t = f.l(); return t.substr(0,3);
			},
			j: function(){
				return jsdate.getDate();
			},
			l: function(){
				return txt_weekdays[f.w()];
			},
			N: function(){
				return f.w() + 1;
			},
			S: function(){
				return txt_ordin[f.j()] ? txt_ordin[f.j()] : 'th';
			},
			w: function(){
				return jsdate.getDay();
			},
			z: function(){
				return (jsdate - new Date(jsdate.getFullYear() + "/1/1")) / 864e5 >> 0;
			},

		// Week
			W: function(){
				var a = f.z(), b = 364 + f.L() - a;
				var nd2, nd = (new Date(jsdate.getFullYear() + "/1/1").getDay() || 7) - 1;

				if(b <= 2 && ((jsdate.getDay() || 7) - 1) <= 2 - b){
					return 1;
				} else{

					if(a <= 2 && nd >= 4 && a >= (6 - nd)){
						nd2 = new Date(jsdate.getFullYear() - 1 + "/12/31");
						return date("W", Math.round(nd2.getTime()/1000));
					} else{
						return (1 + (nd <= 3 ? ((a + nd) / 7) : (a - (7 - nd)) / 7) >> 0);
					}
				}
			},

		// Month
			F: function(){
				return txt_months[f.n()];
			},
			m: function(){
				return D3Api.padLeft(f.n(), 2);
			},
			M: function(){
				var t = f.F(); return t.substr(0,3);
			},
			n: function(){
				return jsdate.getMonth() + 1;
			},
			t: function(){
				var n;
				if( (n = jsdate.getMonth() + 1) == 2 ){
					return 28 + f.L();
				} else{
					if( n & 1 && n < 8 || !(n & 1) && n > 7 ){
						return 31;
					} else{
						return 30;
					}
				}
			},

		// Year
			L: function(){
				var y = f.Y();
				return (!(y & 3) && (y % 1e2 || !(y % 4e2))) ? 1 : 0;
			},
			//o not supported yet
			Y: function(){
				return jsdate.getFullYear();
			},
			y: function(){
				return (jsdate.getFullYear() + "").slice(2);
			},

		// Time
			a: function(){
				return jsdate.getHours() > 11 ? "pm" : "am";
			},
			A: function(){
				return f.a().toUpperCase();
			},
			B: function(){
				// peter paul koch:
				var off = (jsdate.getTimezoneOffset() + 60)*60;
				var theSeconds = (jsdate.getHours() * 3600) +
								 (jsdate.getMinutes() * 60) +
								  jsdate.getSeconds() + off;
				var beat = Math.floor(theSeconds/86.4);
				if (beat > 1000) beat -= 1000;
				if (beat < 0) beat += 1000;
				if ((String(beat)).length == 1) beat = "00"+beat;
				if ((String(beat)).length == 2) beat = "0"+beat;
				return beat;
			},
			g: function(){
				return jsdate.getHours() % 12 || 12;
			},
			G: function(){
				return jsdate.getHours();
			},
			h: function(){
				return D3Api.padLeft(f.g(), 2);
			},
			H: function(){
				return D3Api.padLeft(jsdate.getHours(), 2);
			},
			i: function(){
				return D3Api.padLeft(jsdate.getMinutes(), 2);
			},
			s: function(){
				return D3Api.padLeft(jsdate.getSeconds(), 2);
			},
			//u not supported yet

		// Timezone
			//e not supported yet
			//I not supported yet
			O: function(){
			   var t = D3Api.padLeft(Math.abs(jsdate.getTimezoneOffset()/60*100), 4);
			   if (jsdate.getTimezoneOffset() > 0) t = "-" + t; else t = "+" + t;
			   return t;
			},
			P: function(){
				var O = f.O();
				return (O.substr(0, 3) + ":" + O.substr(3, 2));
			},
			//T not supported yet
			//Z not supported yet

		// Full Date/Time
			c: function(){
				return f.Y() + "-" + f.m() + "-" + f.d() + "T" + f.h() + ":" + f.i() + ":" + f.s() + f.P();
			},
			//r not supported yet
			U: function(){
				return Math.round(jsdate.getTime()/1000);
			}
	};

	return format.replace(/[\\]?([a-zA-Z])/g, function(t, s){
                var ret;
		if( t!=s ){
			// escaped
			ret = s;
		} else if( f[s] ){
			// a date function exists
			ret = f[s]();
		} else{
			// nothing special
			ret = s;
		}

		return ret;
	});
}
D3Api.dateToNum = function(_timestamp/*дата dd.mm.yyyy hh24:mi:ss можно без времени или только без секунд */, _format/*количество дней: d - с точностью до дня, h - до часа, m - до минуты, s - до секунды, ms - до миллисекунды*/){
    if(_timestamp === 'systemdate'){
         var _d = new Date();
        switch (_format){
            case 'd': _d.setHours(0,0,0,0);
                break;
            case 'h': _d.setMinutes(0,0,0);
                break;
            case 'm': _d.setSeconds(0,0);
                break;
            case 's': _d.setMilliseconds(0);
                break;
        }
    }else if(_timestamp){
       var _a = _timestamp.match(/^(\d{2})\.(\d{2})\.(\d{4})(?:\s(\d{2})(?::(\d{2})(?::(\d{2})(?::(\d{3}))?)?)?)?/);
        var _h = ['h','m','s','ms'],
            _m = ['m','s','ms'],
            _s = ['s','ms'];
        var _d = new Date(_a[3], _a[2] - 1, _a[1], (_h.indexOf(_format)+1)?_a[4]:0, (_m.indexOf(_format) + 1)?_a[5]:0, (_s.indexOf(_format) + 1)?_a[6]:0, (_format == 'ms')?_a[7]:0);
    } else{
        return 0;
    }

    return _d.getTime()/(1000*24*60*60);
}
D3Api.downloadFile = function(id,filename,deleteFile,fileType,fileView,returnPath)
{
    var file = D3Api.getOption('path','')+'request.php?type=file&file='+id+'&filename='+filename+((deleteFile)?'&delete=1':'')+((fileType)?'&filetype='+fileType:'')+((fileView)?'&fileview=1':'');
    if(returnPath)
        return file;
    window.open(file);
}

D3Api.setCookie = function(name, value, expires, path, domain, secure) {
	if (!name) return false;
	var str = name + '=' + encodeURIComponent(value);

	if (expires) str += '; expires=' + expires.toGMTString();
	if (path)    str += '; path=' + path;
	if (domain)  str += '; domain=' + domain;
	if (secure)  str += '; secure';

	document.cookie = str;
	return true;
}

D3Api.getCookie = function getCookie(name) {
	var pattern = "(?:; )?" + name + "=([^;]*);?";
	var regexp  = new RegExp(pattern);

	if (regexp.test(document.cookie))
	return decodeURIComponent(RegExp["$1"]);

	return false;
}

D3Api.deleteCookie = function deleteCookie(name, path, domain) {
	D3Api.setCookie(name, null, new Date(0), path, domain);
	return true;
}
D3Api.reloadLocation = function()
{
    document.location.reload();
}
D3Api.xPathEvaluate = function(xpathExpression, contextNode, ResultType, isReturnArray)
{
    contextNode = contextNode || document.body;
    ResultType = ResultType || 'node';
    isReturnArray = (isReturnArray === undefined)?true:isReturnArray;
    switch(ResultType)
    {
        case 'attribute':
        case 'node':
                ResultType = XPathResult.ORDERED_NODE_SNAPSHOT_TYPE;
            break;
        case 'number':
                isReturnArray = false;
                ResultType = XPathResult.NUMBER_TYPE;
            break;
        case 'string':
                isReturnArray = false;
                ResultType = XPathResult.STRING_TYPE;
            break;
        case 'boolean':
                isReturnArray = false;
                ResultType = XPathResult.BOOLEAN_TYPE;
            break;
    }

    var iterator = document.evaluate(xpathExpression, contextNode, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    if(!isReturnArray)
        return iterator;
    var res = [];
    for (var i = 0, c = iterator.snapshotLength; i < c; i++)
    {
        var item = iterator.snapshotItem(i);
        res.push(item);
    }
    return res;
}
D3Api.includeStaticJs = function(path,callback,cache)
{
    var theme = this.current_theme;
    cache = !this.isUndefined(cache)?cache:this.getOption('cache',false);
    path += '?ctype=text/javascript';
    if(!cache)
    {
        path += '&nocache='+(new Date()).getTime();
    }
    this.include_js('~Static/'+path,callback);
    this.current_theme = theme;
}
D3Api.includeStaticCss = function(path,cache)
{
    var theme = this.current_theme;
    cache = !this.isUndefined(cache)?cache:this.getOption('cache',false);
    path += '?ctype=text/css';
    if(!cache)
    {
        path += '&nocache='+(new Date()).getTime();
    }
    this.include_css('~Static/'+path);
    this.current_theme = theme;
}
D3Api.confirm = function(text,okCallback,cancelCallback,thisObject)
{
    if(confirm(text))
    {
        okCallback && okCallback.call(thisObject);
    }else
        cancelCallback && cancelCallback.call(thisObject);
}
D3Api.extends = function(obj,funcName,funcPrefix,funcPostfix)
{

    if(!(obj[funcName] instanceof Function))
        return;
    var funcBase = obj[funcName];
    obj[funcName] = function()
    {
        var args = Array.prototype.slice.call(arguments);
        args.push(arguments);
        funcPrefix && funcPrefix.apply(this,args);
        funcBase.apply(this,arguments);
        funcPostfix && funcPostfix.apply(this,arguments);
    }
}

/**
 * Разыменование записи раздела функцией core.f_unitlist8show_info
 * @param dom
 * @param unit - раздел системы
 * @param primary - ID либо 'ID;ID;ID'
 * @param onSuccess
 */
D3Api.unitShowInfo = function(dom, unit, primary, onSuccess)
{
    D3Api.requestServer({
        url: 'request.php',
        method: 'POST',
        urlData:{ type: 'module', code: 'UnitData/showinfo', unitcode:unit, id: primary },
        contextObj:dom,
        onSuccess: function(resp) {
            r = JSON.parse(resp);
            if (typeof onSuccess === 'function') onSuccess.call(dom, r);
        }
    });
}
MD5 = new function(){
    /*
    * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
    * Digest Algorithm, as defined in RFC 1321.
    * Version 2.2 Copyright (C) Paul Johnston 1999 - 2009
    * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
    * Distributed under the BSD License
    * See http://pajhome.org.uk/crypt/md5 for more info.
    */

    /*
    * Configurable variables. You may need to tweak these to be compatible with
    * the server-side, but the defaults work in most cases.
    */
    var hexcase = 0;   /* hex output format. 0 - lowercase; 1 - uppercase        */
    var b64pad  = "";  /* base-64 pad character. "=" for strict RFC compliance   */

    /*
    * These are the functions you'll usually want to call
    * They take string arguments and return either hex or base-64 encoded strings
    */
    this.hex_md5 = function(s)    { return rstr2hex(rstr_md5(str2rstr_utf8(s))); }
    this.b64_md5 = function(s)    { return rstr2b64(rstr_md5(str2rstr_utf8(s))); }
    this.any_md5 = function(s, e) { return rstr2any(rstr_md5(str2rstr_utf8(s)), e); }
    this.hex_hmac_md5 = function(k, d)
    { return rstr2hex(rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d))); }
    this.b64_hmac_md5 = function(k, d)
    { return rstr2b64(rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d))); }
    this.any_hmac_md5 = function(k, d, e)
    { return rstr2any(rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d)), e); }

    /*
    * Perform a simple self-test to see if the VM is working
    */
    this.md5_vm_test = function()
    {
    return this.hex_md5("abc").toLowerCase() == "900150983cd24fb0d6963f7d28e17f72";
    }

    /*
    * Calculate the MD5 of a raw string
    */
    function rstr_md5(s)
    {
    return binl2rstr(binl_md5(rstr2binl(s), s.length * 8));
    }

    /*
    * Calculate the HMAC-MD5, of a key and some data (raw strings)
    */
    function rstr_hmac_md5(key, data)
    {
    var bkey = rstr2binl(key);
    if(bkey.length > 16) bkey = binl_md5(bkey, key.length * 8);

    var ipad = Array(16), opad = Array(16);
    for(var i = 0; i < 16; i++)
    {
        ipad[i] = bkey[i] ^ 0x36363636;
        opad[i] = bkey[i] ^ 0x5C5C5C5C;
    }

    var hash = binl_md5(ipad.concat(rstr2binl(data)), 512 + data.length * 8);
    return binl2rstr(binl_md5(opad.concat(hash), 512 + 128));
    }

    /*
    * Convert a raw string to a hex string
    */
    function rstr2hex(input)
    {
    try { hexcase } catch(e) { hexcase=0; }
    var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
    var output = "";
    var x;
    for(var i = 0; i < input.length; i++)
    {
        x = input.charCodeAt(i);
        output += hex_tab.charAt((x >>> 4) & 0x0F)
            +  hex_tab.charAt( x        & 0x0F);
    }
    return output;
    }

    /*
    * Convert a raw string to a base-64 string
    */
    function rstr2b64(input)
    {
    try { b64pad } catch(e) { b64pad=''; }
    var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var output = "";
    var len = input.length;
    for(var i = 0; i < len; i += 3)
    {
        var triplet = (input.charCodeAt(i) << 16)
                    | (i + 1 < len ? input.charCodeAt(i+1) << 8 : 0)
                    | (i + 2 < len ? input.charCodeAt(i+2)      : 0);
        for(var j = 0; j < 4; j++)
        {
        if(i * 8 + j * 6 > input.length * 8) output += b64pad;
        else output += tab.charAt((triplet >>> 6*(3-j)) & 0x3F);
        }
    }
    return output;
    }

    /*
    * Convert a raw string to an arbitrary string encoding
    */
    function rstr2any(input, encoding)
    {
    var divisor = encoding.length;
    var i, j, q, x, quotient;

    /* Convert to an array of 16-bit big-endian values, forming the dividend */
    var dividend = Array(Math.ceil(input.length / 2));
    for(i = 0; i < dividend.length; i++)
    {
        dividend[i] = (input.charCodeAt(i * 2) << 8) | input.charCodeAt(i * 2 + 1);
    }

    /*
    * Repeatedly perform a long division. The binary array forms the dividend,
    * the length of the encoding is the divisor. Once computed, the quotient
    * forms the dividend for the next step. All remainders are stored for later
    * use.
    */
    var full_length = Math.ceil(input.length * 8 /
                                        (Math.log(encoding.length) / Math.log(2)));
    var remainders = Array(full_length);
    for(j = 0; j < full_length; j++)
    {
        quotient = Array();
        x = 0;
        for(i = 0; i < dividend.length; i++)
        {
        x = (x << 16) + dividend[i];
        q = Math.floor(x / divisor);
        x -= q * divisor;
        if(quotient.length > 0 || q > 0)
            quotient[quotient.length] = q;
        }
        remainders[j] = x;
        dividend = quotient;
    }

    /* Convert the remainders to the output string */
    var output = "";
    for(i = remainders.length - 1; i >= 0; i--)
        output += encoding.charAt(remainders[i]);

    return output;
    }

    /*
    * Encode a string as utf-8.
    * For efficiency, this assumes the input is valid utf-16.
    */
    function str2rstr_utf8(input)
    {
    var output = "";
    var i = -1;
    var x, y;

    while(++i < input.length)
    {
        /* Decode utf-16 surrogate pairs */
        x = input.charCodeAt(i);
        y = i + 1 < input.length ? input.charCodeAt(i + 1) : 0;
        if(0xD800 <= x && x <= 0xDBFF && 0xDC00 <= y && y <= 0xDFFF)
        {
        x = 0x10000 + ((x & 0x03FF) << 10) + (y & 0x03FF);
        i++;
        }

        /* Encode output as utf-8 */
        if(x <= 0x7F)
        output += String.fromCharCode(x);
        else if(x <= 0x7FF)
        output += String.fromCharCode(0xC0 | ((x >>> 6 ) & 0x1F),
                                        0x80 | ( x         & 0x3F));
        else if(x <= 0xFFFF)
        output += String.fromCharCode(0xE0 | ((x >>> 12) & 0x0F),
                                        0x80 | ((x >>> 6 ) & 0x3F),
                                        0x80 | ( x         & 0x3F));
        else if(x <= 0x1FFFFF)
        output += String.fromCharCode(0xF0 | ((x >>> 18) & 0x07),
                                        0x80 | ((x >>> 12) & 0x3F),
                                        0x80 | ((x >>> 6 ) & 0x3F),
                                        0x80 | ( x         & 0x3F));
    }
    return output;
    }

    /*
    * Encode a string as utf-16
    */
    function str2rstr_utf16le(input)
    {
    var output = "";
    for(var i = 0; i < input.length; i++)
        output += String.fromCharCode( input.charCodeAt(i)        & 0xFF,
                                    (input.charCodeAt(i) >>> 8) & 0xFF);
    return output;
    }

    function str2rstr_utf16be(input)
    {
    var output = "";
    for(var i = 0; i < input.length; i++)
        output += String.fromCharCode((input.charCodeAt(i) >>> 8) & 0xFF,
                                    input.charCodeAt(i)        & 0xFF);
    return output;
    }

    /*
    * Convert a raw string to an array of little-endian words
    * Characters >255 have their high-byte silently ignored.
    */
    function rstr2binl(input)
    {
    var output = Array(input.length >> 2);
    for(var i = 0; i < output.length; i++)
        output[i] = 0;
    for(var i = 0; i < input.length * 8; i += 8)
        output[i>>5] |= (input.charCodeAt(i / 8) & 0xFF) << (i%32);
    return output;
    }

    /*
    * Convert an array of little-endian words to a string
    */
    function binl2rstr(input)
    {
    var output = "";
    for(var i = 0; i < input.length * 32; i += 8)
        output += String.fromCharCode((input[i>>5] >>> (i % 32)) & 0xFF);
    return output;
    }

    /*
    * Calculate the MD5 of an array of little-endian words, and a bit length.
    */
    function binl_md5(x, len)
    {
    /* append padding */
    x[len >> 5] |= 0x80 << ((len) % 32);
    x[(((len + 64) >>> 9) << 4) + 14] = len;

    var a =  1732584193;
    var b = -271733879;
    var c = -1732584194;
    var d =  271733878;

    for(var i = 0; i < x.length; i += 16)
    {
        var olda = a;
        var oldb = b;
        var oldc = c;
        var oldd = d;

        a = md5_ff(a, b, c, d, x[i+ 0], 7 , -680876936);
        d = md5_ff(d, a, b, c, x[i+ 1], 12, -389564586);
        c = md5_ff(c, d, a, b, x[i+ 2], 17,  606105819);
        b = md5_ff(b, c, d, a, x[i+ 3], 22, -1044525330);
        a = md5_ff(a, b, c, d, x[i+ 4], 7 , -176418897);
        d = md5_ff(d, a, b, c, x[i+ 5], 12,  1200080426);
        c = md5_ff(c, d, a, b, x[i+ 6], 17, -1473231341);
        b = md5_ff(b, c, d, a, x[i+ 7], 22, -45705983);
        a = md5_ff(a, b, c, d, x[i+ 8], 7 ,  1770035416);
        d = md5_ff(d, a, b, c, x[i+ 9], 12, -1958414417);
        c = md5_ff(c, d, a, b, x[i+10], 17, -42063);
        b = md5_ff(b, c, d, a, x[i+11], 22, -1990404162);
        a = md5_ff(a, b, c, d, x[i+12], 7 ,  1804603682);
        d = md5_ff(d, a, b, c, x[i+13], 12, -40341101);
        c = md5_ff(c, d, a, b, x[i+14], 17, -1502002290);
        b = md5_ff(b, c, d, a, x[i+15], 22,  1236535329);

        a = md5_gg(a, b, c, d, x[i+ 1], 5 , -165796510);
        d = md5_gg(d, a, b, c, x[i+ 6], 9 , -1069501632);
        c = md5_gg(c, d, a, b, x[i+11], 14,  643717713);
        b = md5_gg(b, c, d, a, x[i+ 0], 20, -373897302);
        a = md5_gg(a, b, c, d, x[i+ 5], 5 , -701558691);
        d = md5_gg(d, a, b, c, x[i+10], 9 ,  38016083);
        c = md5_gg(c, d, a, b, x[i+15], 14, -660478335);
        b = md5_gg(b, c, d, a, x[i+ 4], 20, -405537848);
        a = md5_gg(a, b, c, d, x[i+ 9], 5 ,  568446438);
        d = md5_gg(d, a, b, c, x[i+14], 9 , -1019803690);
        c = md5_gg(c, d, a, b, x[i+ 3], 14, -187363961);
        b = md5_gg(b, c, d, a, x[i+ 8], 20,  1163531501);
        a = md5_gg(a, b, c, d, x[i+13], 5 , -1444681467);
        d = md5_gg(d, a, b, c, x[i+ 2], 9 , -51403784);
        c = md5_gg(c, d, a, b, x[i+ 7], 14,  1735328473);
        b = md5_gg(b, c, d, a, x[i+12], 20, -1926607734);

        a = md5_hh(a, b, c, d, x[i+ 5], 4 , -378558);
        d = md5_hh(d, a, b, c, x[i+ 8], 11, -2022574463);
        c = md5_hh(c, d, a, b, x[i+11], 16,  1839030562);
        b = md5_hh(b, c, d, a, x[i+14], 23, -35309556);
        a = md5_hh(a, b, c, d, x[i+ 1], 4 , -1530992060);
        d = md5_hh(d, a, b, c, x[i+ 4], 11,  1272893353);
        c = md5_hh(c, d, a, b, x[i+ 7], 16, -155497632);
        b = md5_hh(b, c, d, a, x[i+10], 23, -1094730640);
        a = md5_hh(a, b, c, d, x[i+13], 4 ,  681279174);
        d = md5_hh(d, a, b, c, x[i+ 0], 11, -358537222);
        c = md5_hh(c, d, a, b, x[i+ 3], 16, -722521979);
        b = md5_hh(b, c, d, a, x[i+ 6], 23,  76029189);
        a = md5_hh(a, b, c, d, x[i+ 9], 4 , -640364487);
        d = md5_hh(d, a, b, c, x[i+12], 11, -421815835);
        c = md5_hh(c, d, a, b, x[i+15], 16,  530742520);
        b = md5_hh(b, c, d, a, x[i+ 2], 23, -995338651);

        a = md5_ii(a, b, c, d, x[i+ 0], 6 , -198630844);
        d = md5_ii(d, a, b, c, x[i+ 7], 10,  1126891415);
        c = md5_ii(c, d, a, b, x[i+14], 15, -1416354905);
        b = md5_ii(b, c, d, a, x[i+ 5], 21, -57434055);
        a = md5_ii(a, b, c, d, x[i+12], 6 ,  1700485571);
        d = md5_ii(d, a, b, c, x[i+ 3], 10, -1894986606);
        c = md5_ii(c, d, a, b, x[i+10], 15, -1051523);
        b = md5_ii(b, c, d, a, x[i+ 1], 21, -2054922799);
        a = md5_ii(a, b, c, d, x[i+ 8], 6 ,  1873313359);
        d = md5_ii(d, a, b, c, x[i+15], 10, -30611744);
        c = md5_ii(c, d, a, b, x[i+ 6], 15, -1560198380);
        b = md5_ii(b, c, d, a, x[i+13], 21,  1309151649);
        a = md5_ii(a, b, c, d, x[i+ 4], 6 , -145523070);
        d = md5_ii(d, a, b, c, x[i+11], 10, -1120210379);
        c = md5_ii(c, d, a, b, x[i+ 2], 15,  718787259);
        b = md5_ii(b, c, d, a, x[i+ 9], 21, -343485551);

        a = safe_add(a, olda);
        b = safe_add(b, oldb);
        c = safe_add(c, oldc);
        d = safe_add(d, oldd);
    }
    return Array(a, b, c, d);
    }

    /*
    * These functions implement the four basic operations the algorithm uses.
    */
    function md5_cmn(q, a, b, x, s, t)
    {
    return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s),b);
    }
    function md5_ff(a, b, c, d, x, s, t)
    {
    return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
    }
    function md5_gg(a, b, c, d, x, s, t)
    {
    return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
    }
    function md5_hh(a, b, c, d, x, s, t)
    {
    return md5_cmn(b ^ c ^ d, a, b, x, s, t);
    }
    function md5_ii(a, b, c, d, x, s, t)
    {
    return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
    }

    /*
    * Add integers, wrapping at 2^32. This uses 16-bit operations internally
    * to work around bugs in some JS interpreters.
    */
    function safe_add(x, y)
    {
    var lsw = (x & 0xFFFF) + (y & 0xFFFF);
    var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xFFFF);
    }

    /*
    * Bitwise rotate a 32-bit number to the left.
    */
    function bit_rol(num, cnt)
    {
    return (num << cnt) | (num >>> (32 - cnt));
    }
}();
D3Api.notify = function D3Api_showNotify(title,text,options)
{
    if(!D3Api._notifyDom_)
    {
        var c = document.createElement('DIV');
        c.id = 'notify_modal_container';
        c.style.display='none';
        c.style.position = 'fixed';
        c.style.width = '100%';
        c.style.height = '100%';
        c.style.top = '0';
        c.style.left = '0';
        try
        {
            c.style.backgroundColor = 'rgba(0,0,0,0.1)';
        }catch(e)
        {
            c.style.backgroundColor = 'transparent';
        }
        c.onclick = function(){
            var n = this.notify.pop();
            if(!n)
                return;
            if(!n.options.template || n.options.template != 'modal')
                n.close();
        };
        document.body.appendChild(c);
        D3Api._notifyDom_ = c;

        c = document.createElement('DIV');
        c.id = 'notify_container';
        c.style.display='none';
        $(c).append('<div id="default"><h1>#{title}</h1><p>#{text}</p></div>');
        $(c).append('<div id="sticky"><a class="ui-notify-close ui-notify-cross" href="#">X</a><a class="ui-notify-code ui-notify-cross" href="#" onclick="D3Api.notify.prototype.notifyObj._func_showCode(this)">#</a><h1>#{title}</h1><textarea class="ui-notify-codearea" readonly="readonly" style="display: none;">#{text}</textarea><p oncontextmenu="D3Api.stopEvent(event,false); return true;">#{brtext}</p>#{footer}</div>');
        $(c).append('<div id="modal"><h1>#{title}</h1><p oncontextmenu="D3Api.stopEvent(event,false); return true;">#{brtext}</p>#{footer}</div>');
        document.body.appendChild(c);
        D3Api.notify.prototype.notifyObj = $('#notify_container').notify();
        D3Api.notify.prototype.notifyObj._func_showCode = function(btn)
        {
            var notify = btn.parentNode;
            var ta = $('textarea',notify).get(0);
            var p = $('p',notify).get(0);
            if(!notify._width_)
            {
                notify._width_ = D3Api.getStyle(notify,'width');
                notify.style.width = 'auto';
                var rect = D3Api.getAbsoluteClientRect(p);
                var w = D3Api.getPageWindowSize();
                ta.style.width = rect.width+'px';
                if(rect.y+rect.height+30 > w.windowHeight)
                {
                    ta.style.height = (w.windowHeight - 30 - rect.y)+'px';
                }else
                {
                    ta.style.height = (rect.height+30)+'px';
                }
                if(rect.width > w.windowWidth)
                {
                    ta.style.width = (w.windowWidth - 40)+'px';
                }
                $(p).hide();
                $(ta).show();
            }else
            {
                notify.style.width = notify._width_;
                notify._width_ = undefined;
                $(ta).hide();
                $(p).show();
            }
        }
        D3Api.notify.prototype.notifyObj._close_all_notify_ = function(){
            $("#notify_container").empty();//удаляем все что внутри
            $('#notify_modal_container').hide(); //скрываем контейнер
            D3Api.notify.prototype.openedSticky = 0;
        }
    }

    options = options || {};
    var template = 'default';
    if(options.modal == true)
    {
        options.expires = false;
        template = (options.template && options.template == 'modal')?'modal':'sticky';
        options.beforeopen = function(ev,notify)
        {
            D3Api.notify.prototype.openedSticky++;
            $('#notify_modal_container').show();
        }
        options.close = function()
        {
            if($("a").is("#notify_btn_msg_all") && $('.ui-notify-message:visible').length<3 ){
                $("#notify_btn_msg_all").closest("div").remove();
            }
            D3Api.notify.prototype.openedSticky--;
            if(D3Api.notify.prototype.openedSticky <= 0)
            {
                D3Api.notify.prototype.openedSticky = 0;
                $('#notify_modal_container').hide();
            }
        }
        options.click = function(e,notify)
        {
            if(options.onclick instanceof Function)
                options.onclick();
            //else
                //notify.close();
        }
    }else if(options.expires === false)
    {
        options.click = function(e,notify)
        {
            notify.close();
        }
    }else if(D3Api.isUndefined(options.expires))
    {
        options.expires = 2000;
    }
    var brtext = text.replace(/\n/g, '<br/>');
    text = text.replace(/<br\/>/g, '\n');
    var res = D3Api.notify.prototype.notifyObj.notify('create',template,{title: title, text: text, brtext: brtext, footer: options.footer||''},options);
    this.notify_modal_container = this.notify_modal_container || $('#notify_modal_container').get(0);
    this.notify_modal_container.notify = this.notify_modal_container.notify || [];
    this.notify_modal_container.notify.push(res);
    if($('.ui-notify-click').length > 1 && !$("a").is("#notify_btn_msg_all")){
        var d = document.createElement('DIV');
        d.className = 'ui-notify-message ui-notify-message-style ui-notify-click';
        $(d).append('   <h1>' +
                    '       <a href="#" cont="btn_msg_mark_all" id="notify_btn_msg_all" class="notify_btn_msg_all" onclick="D3Api.notify.prototype.notifyObj._close_all_notify_()">Закрыть все уведомления</a>' +
                    '   </h1>' +
                    '   <p oncontextmenu="D3Api.stopEvent(event,false); return true;"/>');
        $('.ui-notify-message:first-child').before(d);
    }
    return res;
}
D3Api.notify.prototype.notifyObj = {};
D3Api.notify.prototype.notify_modal_container = null;
D3Api.notify.prototype.openedSticky = 0;
/**
 * @description Функция для вычислении контрольной суммы crc32.
 **/
D3Api.crc32 = function(_data){
    var data = _data;
    var n = [
        0,          1996959894, 3993919788, 2567524794, 124634137,  1886057615, 3915621685, 2657392035,
        249268274,  2044508324, 3772115230, 2547177864, 162941995,  2125561021, 3887607047, 2428444049,
        498536548,  1789927666, 4089016648, 2227061214, 450548861,  1843258603, 4107580753, 2211677639,
        325883990,  1684777152, 4251122042, 2321926636, 335633487,  1661365465, 4195302755, 2366115317,
        997073096,  1281953886, 3579855332, 2724688242, 1006888145, 1258607687, 3524101629, 2768942443,
        901097722,  1119000684, 3686517206, 2898065728, 853044451,  1172266101, 3705015759, 2882616665,
        651767980,  1373503546, 3369554304, 3218104598, 565507253,  1454621731, 3485111705, 3099436303,
        671266974,  1594198024, 3322730930, 2970347812, 795835527,  1483230225, 3244367275, 3060149565,
        1994146192, 31158534,   2563907772, 4023717930, 1907459465, 112637215,  2680153253, 3904427059,
        2013776290, 251722036,  2517215374, 3775830040, 2137656763, 141376813,  2439277719, 3865271297,
        1802195444, 476864866,  2238001368, 4066508878, 1812370925, 453092731,  2181625025, 4111451223,
        1706088902, 314042704,  2344532202, 4240017532, 1658658271, 366619977,  2362670323, 4224994405,
        1303535960, 984961486,  2747007092, 3569037538, 1256170817, 1037604311, 2765210733, 3554079995,
        1131014506, 879679996,  2909243462, 3663771856, 1141124467, 855842277,  2852801631, 3708648649,
        1342533948, 654459306,  3188396048, 3373015174, 1466479909, 544179635,  3110523913, 3462522015,
        1591671054, 702138776,  2966460450, 3352799412, 1504918807, 783551873,  3082640443, 3233442989,
        3988292384, 2596254646, 62317068,   1957810842, 3939845945, 2647816111, 81470997,   1943803523,
        3814918930, 2489596804, 225274430,  2053790376, 3826175755, 2466906013, 167816743,  2097651377,
        4027552580, 2265490386, 503444072,  1762050814, 4150417245, 2154129355, 426522225,  1852507879,
        4275313526, 2312317920, 282753626,  1742555852, 4189708143, 2394877945, 397917763,  1622183637,
        3604390888, 2714866558, 953729732,  1340076626, 3518719985, 2797360999, 1068828381, 1219638859,
        3624741850, 2936675148, 906185462,  1090812512, 3747672003, 2825379669, 829329135,  1181335161,
        3412177804, 3160834842, 628085408,  1382605366, 3423369109, 3138078467, 570562233,  1426400815,
        3317316542, 2998733608, 733239954,  1555261956, 3268935591, 3050360625, 752459403,  1541320221,
        2607071920, 3965973030, 1969922972, 40735498,   2617837225, 3943577151, 1913087877, 83908371,
        2512341634, 3803740692, 2075208622, 213261112,  2463272603, 3855990285, 2094854071, 198958881,
        2262029012, 4057260610, 1759359992, 534414190,  2176718541, 4139329115, 1873836001, 414664567,
        2282248934, 4279200368, 1711684554, 285281116,  2405801727, 4167216745, 1634467795, 376229701,
        2685067896, 3608007406, 1308918612, 956543938,  2808555105, 3495958263, 1231636301, 1047427035,
        2932959818, 3654703836, 1088359270, 936918e3,   2847714899, 3736837829, 1202900863, 817233897,
        3183342108, 3401237130, 1404277552, 615818150,  3134207493, 3453421203, 1423857449, 601450431,
        3009837614, 3294710456, 1567103746, 711928724,  3020668471, 3272380065, 1510334235, 755167117
    ];
    var r = -1;
    for (var o = 0, l = data.length; o < l; o++) {
        var f = false ? data[o] : data.charCodeAt(o);
        var s = (r ^ f) & 255;
        var i = n[s];
        var r = r >>> 8 ^ i
    }
    return r ^ -1
};
D3Api.Office.Spreadsheet = new function () {
    this.getCell = function (e) {
        if (e < 0)
            throw new Error("Не правильная колонка " + e);
        var r = "";
        for (++e; e; e = Math.floor((e - 1) / 26)){
            r = String.fromCharCode((e - 1) % 26 + 65) + r;
        }
        return r
    }

    this.getRow = function (e) {
        return "" + (+e + 1);
    }
    this.intoCoord = function (_coord) {
        var r = {
            start:{
                cell: 0,
                row: 0
            },
            end:{
                cell: 0,
                row: 0
            }
        };
        var t = 0
            , a = 0
            , n = 0;
        var i = _coord.length;
        for (t = 0; a < i; ++a) {
            if ((n = _coord.charCodeAt(a) - 64) < 1 || n > 26)
                break;
            t = 26 * t + n
        }
        r.start.cell = --t;
        for (t = 0; a < i; ++a) {
            if ((n = _coord.charCodeAt(a) - 48) < 0 || n > 9)
                break;
            t = 10 * t + n
        }
        r.start.row = --t;
        if (a === i || _coord.charCodeAt(++a) === 58) {
            return r.start
        }
        for (t = 0; a != i; ++a) {
            if ((n = _coord.charCodeAt(a) - 64) < 1 || n > 26)
                break;
            t = 26 * t + n
        }
        r.end.cell = --t;
        for (t = 0; a != i; ++a) {
            if ((n = _coord.charCodeAt(a) - 48) < 0 || n > 9)
                break;
            t = 10 * t + n
        }
        r.end.row = --t;
        return r
    }
    this.normalizeString = function(_str){
        var Ue = /[&<>'"]/g;
        var ze = /[\u0000-\u0008\u000b-\u001f]/g;
        var Le = {
            '"': "&quot;",
            '&': "&amp;",
            "'": "&apos;",
            '<': "&lt;",
            '>': "&gt;"
        }
        return _str.replace(Ue, function(e) {
            return Le[e]
        }).replace(ze, function(e) {
            return "_x" + ("000" + e.charCodeAt(0).toString(16)).slice(-4) + "_"
        })
    }
    this.generateByteCode = function(e){
        var r = new ArrayBuffer(e.length);
        var t = new Uint8Array(r);
        for (var a = 0; a != e.length; ++a){
            t[a] = e.charCodeAt(a) & 255;
        }
        return r
    }
    this.generateBinaryDate = function(_date){
        var date = _date || new Date();
        var v = date.getHours() << 6;
        v = v | date.getMinutes();
        v = v << 5;
        v = v | date.getSeconds() / 2;

        var g = date.getFullYear() - 1980;
        g = g << 4;
        g = g | date.getMonth() + 1;
        g = g << 5;
        g = g | date.getDate();
        return {
            v: v,
            g: g
        }
    }
    this.transformTo = function(_int8Arr){
        var r = 65536;
        var a = []
            , n = _int8Arr.length
            , f = 0
            , o = true;
        try {
            String.fromCharCode.apply(null, new Uint8Array(0));
            while (f < n && r > 1) {
                try {
                    a.push(String.fromCharCode.apply(null, _int8Arr.subarray(f, Math.min(f + r, n))))

                    f += r
                } catch (l) {
                    r = Math.floor(r / 2)
                }
            }
            return a.join("")
        } catch (l) {
        }
    }
    this.utf8encode = function(_data){
        var o = 0;
        var data = _data;
        for(var i = 0, len = data.length ; i < len ; i++ ){
            var charCode = data.charCodeAt(i);
            if ((charCode & 64512) === 55296 && i + 1 < len) {
                var charCodeNext = data.charCodeAt(i + 1);
                if ((charCodeNext & 64512) === 56320) {
                    charCode = 65536 + (charCode - 55296 << 10) + (charCodeNext - 56320);
                    i++
                }
            }
            o += charCode < 128 ? 1 : charCode < 2048 ? 2 : charCode < 65536 ? 3 : 4;
        }
        var int8Arr = new Uint8Array(o);
        for(var s = 0, i = 0; s < o; i++){
            var charCode = data.charCodeAt(i);
            if ((charCode & 64512) === 55296 && i + 1 < f) {
                var charCodeNext = data.charCodeAt(i + 1);
                if ((charCodeNext & 64512) === 56320) {
                    charCode = 65536 + (charCode - 55296 << 10) + (a - 56320);
                    i++
                }
            }
            if (charCode < 128) {
                int8Arr[s++] = charCode
            } else if (charCode < 2048) {
                int8Arr[s++] = 192 | charCode >>> 6;
                int8Arr[s++] = 128 | charCode & 63
            } else if (charCode < 65536) {
                int8Arr[s++] = 224 | charCode >>> 12;
                int8Arr[s++] = 128 | charCode >>> 6 & 63;
                int8Arr[s++] = 128 | charCode & 63
            } else {
                int8Arr[s++] = 240 | charCode >>> 18;
                int8Arr[s++] = 128 | charCode >>> 12 & 63;
                int8Arr[s++] = 128 | charCode >>> 6 & 63;
                int8Arr[s++] = 128 | charCode & 63
            }
        }
        return int8Arr;
    }
    this.verify = function (encode, len) {
        var t = "";
        for (var a = 0; a < len; a++) {
            t += String.fromCharCode(encode & 255);
            encode = encode >>> 8
        }
        return t
    }
    this.encodeBase64 = function(s){
        return window.btoa(unescape(encodeURIComponent(s)))
    }
    this.reFormat = function(s, c){
        return s.replace(/{(\w+)}/g, function (m, p) {
            return c[p];
        })
    }
}
D3Api.Office.Spreadsheet.html = {};
D3Api.Office.Spreadsheet.xlsx = {};
D3Api.Office.Spreadsheet.xml = {};
D3Api.Office.Spreadsheet.export = function(_type){
    var excel = null;
    switch (_type) {
        case 'html':
            excel = new D3Api.Office.Spreadsheet.html.export();
            break;
        case 'xlsx':
            excel = new D3Api.Office.Spreadsheet.xlsx.export();
            break;
        case 'xml':
            excel = new D3Api.Office.Spreadsheet.xml.export();
            break;
    }

    this.setContent = function(_param){
        if(!excel){
            D3Api.debug_msg('Не создан объект Excel.');
            return false;
        }
        if(!('dom' in _param)){
            D3Api.debug_msg('метод setContent, не указан дом объект.')
            return false;
        }
        return excel.setContent(_param);
    }

    this.save = function(_fileName){
        if(!excel){
            D3Api.debug_msg('Не создан объект Excel.');
            return false;
        }
        excel.save(_fileName);
    }
    this.addSheet = function (_nameSheet) {
        return excel.addSheet(_nameSheet);
    }
};
D3Api.Office.Spreadsheet.Cell = function(){
    var value = '';
    var cell = '';
    var type = 'str';
    var styleParams = {};
    this.getValue = function(){
        return value;
    }
    this.setValue = function(_val){
        value = _val;
        return this;
    }
    this.setCell = function(_coord){
        cell = _coord;
        return this;
    }
    this.getCell = function(){
        return cell;
    }
    this.setType = function(_type){
        type = _type;
        return this;
    }
    this.getType = function () {
        return type;
    }
    /**
     * param = {
     *     border:{
     *          top:{
     *              borderWidth:1,
     *              borderStyle:'thin'
     *          },
     *          right:{
     *              borderWidth:1,
     *              borderStyle:'thin'
     *          },
     *          bottom:{
     *              borderWidth:1,
     *              borderStyle:'thin'
     *          },
     *          left:{
     *              borderWidth:1,
     *              borderStyle:'thin'
     *          },
     *          all:{
     *              borderWidth:1,
     *              borderStyle:'thin'
     *          }
     *     }
     * }
     */
    this.setStyleArray = function(_params){
        if('border' in _params){
            styleParams['border'] = {};
            if('all' in _params.border){
                styleParams['border']['top'] = Object.assign({}, _params['border']['all']);
                styleParams['border']['right'] = Object.assign({}, _params['border']['all']);
                styleParams['border']['bottom'] = Object.assign({}, _params['border']['all']);
                styleParams['border']['left'] = Object.assign({}, _params['border']['all']);
            }else{
                styleParams['border'] = Object.assign({}, _params['border']);
            }
        }


        return this;
    }
    this.getStyleArray = function(_param){
        if(_param){
            if(_param in styleParams){
                return styleParams[_param];
            }
        }else{
            return styleParams;
        }

    }
};
D3Api.Office.Spreadsheet.Sheet = function(_nameSheet){
    var sheetname = _nameSheet;
    var cells = {};
    var mergeCells = {};
    var mincell;
    var maxcell;
    var coordFilter = '';
    var cellSise = {};
    var rowSize = {};
    this.setAutoFilter = function(_coord){
        var cd = D3Api.Office.Spreadsheet.intoCoord(_coord);
        if(cd.start.row != cd.end.row){
            D3Api.debug_msg('Не правильно указаны координаты для фильтра.');
            return false;
        }
        coordFilter = _coord;
        return this;
    }
    this.getAutoFilter = function () {
        return coordFilter;
    }

    this.setCellSize = function (_cell,_size) {
        cellSise[_cell] = _size;
    }
    this.getCellSize = function (_cell) {
        if(_cell){
            if(_cell in cellSise){
                return cellSise[_cell];
            }
        }else{
            return cellSise;
        }
    }
    this.setRowSize = function (_row,_size) {
        rowSize[_row] = _size;
    }
    this.getRowSize = function (_row) {
        if(_row){
            if(_row in rowSize){
                return rowSize[_row];
            }
        }else{
            return rowSize;
        }
    }
    this.setCellValue = function (_coord,_value) {
        var c;
        if(_coord in cells){
            c = cells[_coord];
            var _val = c.getValue();
            _val += _value;
            c.setValue(_val);
        }else{
            var c = new D3Api.Office.Spreadsheet.Cell();
            cells[_coord] = c
            c.setCell(_coord);
            c.setValue(_value);
        }
        return c;
    }
    this.getCellValue = function(_coord){
        if(_coord in cells){
            return cells[_coord].getValue();
        }
        return null;
    }
    this.getSheetName = function(){
        return sheetname;
    }
    this.getCells = function(){
        return cells;
    }
    this.setMergeCells = function (_coords) {
        var cd = D3Api.Office.Spreadsheet.intoCoord(_coords);
        if(('start' in cd) && ('end' in cd)){
            var cellStart = cd.start.cell;
            var rowStart = cd.start.row;
            var cellEnd = cd.end.cell;
            var rowEnd = cd.end.row;
            var stCell = D3Api.Office.Spreadsheet.getCell(cellStart);
            var stRow = D3Api.Office.Spreadsheet.getRow(rowStart);
            var stCoord = stCell+stRow;
            var enCell = D3Api.Office.Spreadsheet.getCell(cellEnd);
            var enRow = D3Api.Office.Spreadsheet.getRow(rowEnd);
            var enCoord = enCell+enRow;

            var style = {}
            if(stCoord in cells){
                style = Object.assign({}, cells[stCoord].getStyleArray());
            }
            for(;cellStart <= cellEnd;cellStart++){
                rowStart = cd.start.row;
                for(;rowStart <= rowEnd;rowStart++){
                    var cell = D3Api.Office.Spreadsheet.getCell(cellStart);
                    var row = D3Api.Office.Spreadsheet.getRow(rowStart);
                    var coord = cell+row;
                    if(coord != stCoord){
                        if((coord in cells)){
                            var _val = this.getCellValue(coord);
                            this.setCellValue(stCoord, _val);
                            delete cells[coord];
                        }
                        this.setCellValue(coord,'');
                    }
                    //управление стилем
                    var objStyle = {
                        'border':{}
                    };
                    if('border' in style){
                        if(('left' in style['border'])){
                            if(cell == stCell){
                                objStyle['border']['left'] = {
                                    borderWidth:1,
                                    borderStyle:'thin'
                                }
                            }
                        }
                        if(('top' in style['border'])){
                            if(row == stRow){
                                objStyle['border']['top'] = {
                                    borderWidth:1,
                                    borderStyle:'thin'
                                }
                            }
                        }
                        if(('right' in style['border'])){
                            if(cell == enCell){
                                objStyle['border']['right'] = {
                                    borderWidth:1,
                                    borderStyle:'thin'
                                }
                            }
                        }
                        if(('bottom' in style['border'])){
                            if(row == enRow){
                                objStyle['border']['bottom'] = {
                                    borderWidth:1,
                                    borderStyle:'thin'
                                }
                            }
                        }
                    }

                    cells[coord].setStyleArray(objStyle);
                }
            }
        }
        if(!(_coords in mergeCells)){
            mergeCells[_coords] = true;
        }
        return this;
    }
    this.getMergeCells = function () {
        return mergeCells;
    }
};

D3Api.Office.Spreadsheet.initDom = function (_dm) {
    var _dataDom = {};
    function initD(_dom) {
        if(_dom.nodeType == 9){
            _dom = _dom.body;
        }
        if(_dom.hasAttribute('isd3repeater')){
            return
        }
        if(_dom.nodeType == 1){
            if(D3Api.hasProperty(_dom,'cmptype')){
                var cmptype = D3Api.getProperty(_dom,'cmptype')+'Ctrl';
                if(cmptype !== 'BaseCtrl' && cmptype in D3Api ){
                    if('getCaption' in D3Api[cmptype]){
                        var caption = D3Api.getControlPropertyByDom(_dom, 'caption');
                        var _arr = Object.keys(_dataDom);
                        var maxrow = 0;
                        for(var a = 0 ; a < _arr.length ; a++){
                            var crd = D3Api.Office.Spreadsheet.intoCoord(_arr[a]);
                            if(maxrow < crd.row + 1){
                                maxrow = crd.row + 1;
                            }
                        }
                        var row = D3Api.Office.Spreadsheet.getRow(maxrow);
                        var cell = D3Api.Office.Spreadsheet.getCell(0);
                        var coord = cell+row;
                        _dataDom[coord] = {
                            caption: caption
                        }
                        return;
                    }
                }
            }
            var tagName = _dom.tagName.toLocaleLowerCase();
            switch (tagName) {
                case 'table':
                    //debugger
                    var rows = _dom.rows;
                    var border = 0;
                    if('border' in _dom){
                        border = _dom.border
                    }
                    var _arr = Object.keys(_dataDom);
                    var maxrow = 0;
                    for(var a = 0 ; a < _arr.length ; a++){
                        var crd = D3Api.Office.Spreadsheet.intoCoord(_arr[a]);
                        if(maxrow < crd.row + 1){
                            maxrow = crd.row + 1;
                        }
                    }
                    for(var i = 0; i < rows.length ; i++){
                        if(rows[i].hasAttribute('isd3repeater')){
                            continue
                        }
                        var cells = rows[i].cells;
                        for(var j = 0,k = 0; j < cells.length ; j++,k++){
                            var cell = cells[j];

                            if(cell.hasAttribute('merged')){
                                continue
                            }
                            if(cell.hasAttribute('isd3repeater')){
                                continue
                            }
                            var row = maxrow + i;
                            var rw = D3Api.Office.Spreadsheet.getRow(row);
                            var cl = D3Api.Office.Spreadsheet.getCell(k);
                            var coord = cl+rw;

                            var rowspan = cell.rowSpan - 1;
                            var colspan = cell.colSpan - 1;
                            var colmerge = D3Api.Office.Spreadsheet.getCell(k + colspan);
                            var rowmerge = D3Api.Office.Spreadsheet.getRow(row + rowspan);
                            var mergeCoord = colmerge+rowmerge

                            _dataDom[coord] = {
                                caption: cell.innerText.trim()
                            };
                            if(coord != mergeCoord){
                                _dataDom[coord].merge = coord+':'+mergeCoord;
                            }
                            if(border > 0){
                                _dataDom[coord].style = {
                                    border:{
                                        all:{
                                            borderWidth:1,
                                            borderStyle:'thin'
                                        }
                                    }
                                }
                            }
                            for(var l = 1 ; l <= rowspan ; l++){
                                var nextCols = rows[i + l].cells;
                                var td = document.createElement('td');
                                td.setAttribute('merged','true');
                                td.colSpan = colspan + 1;
                                if(nextCols[k]){
                                    rows[i + l].insertBefore(td,nextCols[k]);
                                }else{
                                    rows[i + l].appendChild(td);
                                }
                            }
                            cell.rowSpan = 1;
                            k += colspan;
                        }
                    }
                    break;
                default:
                    var childs = _dom.childNodes;
                    for(var i = 0 ; i < childs.length ; i++){
                        if(childs[i].nodeType == 3){

                            var _arr = Object.keys(_dataDom);
                            var maxrow = 0;
                            for(var a = 0 ; a < _arr.length ; a++){
                                var crd = D3Api.Office.Spreadsheet.intoCoord(_arr[a]);
                                if(maxrow < crd.row + 1){
                                    maxrow = crd.row + 1;
                                }
                            }

                            var row = D3Api.Office.Spreadsheet.getRow(maxrow);
                            var cell = D3Api.Office.Spreadsheet.getCell(0);
                            var coord = cell+row;
                            var _val = childs[i].data.trim()
                            if(_val != ''){
                                _dataDom[coord] = {
                                    caption: _val
                                }
                            }

                        }else if(childs[i].nodeType == 1){
                            initD(childs[i]);
                        }
                    }
            }
        }
    }
    initD(_dm);
    return _dataDom;
};
D3Api.Office.Spreadsheet.html.export = function(_fileName){
    var Sheets = [];
    var context_WorkBook = {
        ExcelWorksheets:'',
        HTMLWorksheets: '',
        ListWorksheets: ''
    };

    this.setContent = function(_param){
        if('sheetname' in _param){
            SheetName = _param['sheetname'];
        }else{
            SheetName = 'Лист ' + (Sheets.length + 1)
        }
        if(!('dom' in _param)){
            return false;
        }
        var clone = null;
        if(typeof _param.dom == 'string'){
            var div = document.createElement('div');
            div.innerHTML = _param.dom;
            clone = div.cloneNode(true);
        }else{
            clone = _param.dom.cloneNode(true);
        }
        if(!clone){
            D3Api.debug_msg('Не определен контент экспорта.')
            return false;
        }
        Sheets.push({
            sheetname: SheetName,
            content: clone
        })
        if('style' in _param){
            Sheets[Sheets.length - 1].SheetStyle = _param.style
        }
    }
    this.save = function(_fileName){
        var uri = 'data:application/vnd.ms-excel;base64,';
        var tempNextPart = '_NextPart_dummy';

        var context_WorkBook = {
            ExcelWorksheets:'',
            HTMLWorksheets: '',
            ListWorksheets: ''
        };

        var link = document.createElement("A");

        if(Sheets.length > 1){
            var htmlStart =
                '<html xmlns:v="urn:schemas-microsoft-com:vml" ' +
                      'xmlns:o="urn:schemas-microsoft-com:office:office" ' +
                      'xmlns:x="urn:schemas-microsoft-com:office:excel" ' +
                      'xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" '+
                      'xmlns="http://www.w3.org/TR/REC-html40">' +
                    '{Content}' +
                '</html>';

            var tempExcelWorksheet =
                '<x:ExcelWorksheet>' +
                    '<x:Name>{SheetName}</x:Name>' +
                    '<x:WorksheetSource HRef="sheet{SheetIndex}.htm"/>' +
                '</x:ExcelWorksheet>'
            var tempListWorkSheet = '<o:File HRef="sheet{SheetIndex}.htm"/>';

            var tempHTMLWorksheet =
                "------=_NextPart_dummy\n" +
                'Content-Location: sheet{SheetIndex}.htm\n'+
                'Content-Type: text/html; charset=utf-8\n\n'+
                D3Api.Office.Spreadsheet.reFormat(htmlStart,{
                    Content:
                        '<head>' +
                            '<meta http-equiv="Content-Type" content="text/html; charset=utf-8">' +
                            '<link id="Main-File" rel="Main-File" href="../WorkBook.htm">' +
                            '<link rel="File-List" href="filelist.xml">' +
                            '<style>{SheetStyle}</style>'+
                        '</head>' +
                        '<body>' +
                            '{SheetContent}' +
                        '</body>'
                });
            var tempWorkBook =
                'MIME-Version: 1.0\n' +
                'X-Document-Type: Workbook\n' +
                'Content-Type: multipart/related; boundary="----=_NextPart_dummy"\n\n' +
                '------=_NextPart_dummy\n' +
                'Content-Location: WorkBook.htm\n' +
                'Content-Type: text/html; charset=utf-8\n\n' +
                D3Api.Office.Spreadsheet.reFormat(htmlStart+'\n\n',{
                    Content:
                        '<head>' +
                            '<meta name="Excel Workbook Frameset">' +
                            '<meta http-equiv="Content-Type" content="text/html; charset=utf-8">' +
                            '<link rel="File-List" href="filelist.xml">' +
                            '<!--[if gte mso 9]>' +
                                '<xml>' +
                                    '<x:ExcelWorkbook>' +
                                        '<x:ExcelWorksheets>{ExcelWorksheets}</x:ExcelWorksheets>' +
                                        '<x:ActiveSheet>0</x:ActiveSheet>' +
                                    '</x:ExcelWorkbook>' +
                                '</xml>' +
                            '<![endif]-->' +
                        '</head>' +
                        '<frameset>' +
                            '<frame src="sheet0.htm" name="frSheet">' +
                            '<noframes>' +
                                '<body>' +
                                    '<p>This page uses frames, but your browser does not support them.</p>' +
                                '</body>' +
                            '</noframes>' +
                        '</frameset>'
                })+
                '{HTMLWorksheets}\n' +
                'Content-Location: filelist.xml\n' +
                'Content-Type: text/xml; charset="utf-8"\n\n' +
                '<xml xmlns:o="urn:schemas-microsoft-com:office:office">' +
                    '<o:MainFile HRef="../WorkBook.htm"/>' +
                    '{ListWorksheets}' +
                    '<o:File HRef="filelist.xml"/>' +
                '</xml>\n' +
                '------=_NextPart_dummy--';

            for(var i = 0; i < Sheets.length; i++){
                context_WorkBook.ExcelWorksheets += D3Api.Office.Spreadsheet.reFormat(tempExcelWorksheet, {
                    SheetIndex: i,
                    SheetName: Sheets[i].sheetname,
                    SheetStyle:Sheets[0].SheetStyle
                });
                if(context_WorkBook.HTMLWorksheets != ''){
                    context_WorkBook.HTMLWorksheets += '\n'
                }
                context_WorkBook.HTMLWorksheets += D3Api.Office.Spreadsheet.reFormat(tempHTMLWorksheet, {
                    SheetIndex: i,
                    SheetContent: Sheets[i].content.outerHTML
                });
                context_WorkBook.ListWorksheets += D3Api.Office.Spreadsheet.reFormat(tempListWorkSheet, {
                    SheetIndex: i
                });
            }
            link.href = uri + D3Api.Office.Spreadsheet.encodeBase64(D3Api.Office.Spreadsheet.reFormat(tempWorkBook, context_WorkBook));
        }else if(Sheets.length > 0){
            var htmlStart  =
                "<html xmlns:o=\"urn:schemas-microsoft-com:office:office\" " +
                      "xmlns:x=\"urn:schemas-microsoft-com:office:excel\" " +
                      "xmlns=\"http://www.w3.org/TR/REC-html40\">" +
                    "<head>" +
                        "<!--[if gte mso 9]>" +
                            "<xml>" +
                                "<x:ExcelWorkbook>" +
                                    "<x:ExcelWorksheets>" +
                                        "<x:ExcelWorksheet>" +
                                            "<x:Name>{SheetName}</x:Name>" +
                                            "<x:WorksheetOptions>" +
                                                "<x:DisplayGridlines/>" +
                                            "</x:WorksheetOptions>" +
                                        "</x:ExcelWorksheet>" +
                                    "</x:ExcelWorksheets>" +
                                "</x:ExcelWorkbook>" +
                            "</xml>" +
                        "<![endif]-->" +
                        "<meta http-equiv=\"content-type\" content=\"text/plain; charset=UTF-8\"/>" +
                        '<style>{SheetStyle}</style>'+
                    "</head>" +
                    "<body>" +
                        "{SheetContent}" +
                    "</body>" +
                "</html>"

            link.href = uri + D3Api.Office.Spreadsheet.encodeBase64(D3Api.Office.Spreadsheet.reFormat(htmlStart, {
                SheetContent:Sheets[0].content.outerHTML,
                SheetName:Sheets[0].sheetname,
                SheetStyle:Sheets[0].SheetStyle
            }));
        }else{
            return false;
        }
        link.download =  (_fileName||'Workbook')+'.xls';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};
D3Api.Office.Spreadsheet.xlsx.export = function(){
    /** струкрутра Архива zip **/
    var constantUnicodeFile = {
        LOCAL_FILE_HEADER : "PK",
        CENTRAL_FILE_HEADER : "PK",
        CENTRAL_DIRECTORY_END : "PK"
    }
    var Sheets = [];
    var commentFile = 'AO Bars GROUP';

    /** Структура Open Office XML(SpreadsheetML) **/
    var structureXlsxXmlFile = {
            'docProps/core.xml':{
                data:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\r\n'+
                     '<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" '+
                                        'xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" '+
                                        'xmlns:dcmitype="http://purl.org/dc/dcmitype/" '+
                                        'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>',
                comment:''
            },
            'docProps/app.xml':{
                data:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\r\n'+
                     '<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" '+
                                 'xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">'+
                        '<Application>{AppName}</Application>'+
                        '<HeadingPairs>'+
                            '<vt:vector size="2" baseType="variant">'+
                                '<vt:variant>'+
                                    '<vt:lpstr>Worksheets</vt:lpstr>'+
                                '</vt:variant>'+
                                '<vt:variant>'+
                                    '<vt:i4>{cntSheets}</vt:i4>'+
                                '</vt:variant>'+
                            '</vt:vector>'+
                        '</HeadingPairs>'+
                        '<TitlesOfParts>'+
                            '<vt:vector size="{cntSheetsSize}" baseType="lpstr">'+
                                '{lpstr}'+
                            '</vt:vector>'+
                        '</TitlesOfParts>'+
                     '</Properties>',
                comment:''
            },
            'xl/worksheets/sheet.xml':{
                        data:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\r\n'+
                             '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" '+
                                        'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'+
                                '<dimension ref="{StartEndCoord}"/>'+
                                '<sheetViews>'+
                                    '<sheetView workbookViewId="0"/>'+
                                '</sheetViews>'+
                                '{cellSize}'+
                                '<sheetData>'+
                                    '{tableRow}'+
                                '</sheetData>'+
                                '{autoFilter}'+
                                '{merges}'+
                                '<ignoredErrors>'+
                                    '<ignoredError numberStoredAsText="1" sqref="{StartEndCoord1}"/>'+
                                '</ignoredErrors>'+
                             '</worksheet>',
                        comment:''
                    },
            'xl/workbook.xml':{
                data:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\r\n'+
                     '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" '+
                               'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'+
                        '<workbookPr codeName="ThisWorkbook"/>'+
                        '<sheets>'+
                            '{shts}' +
                        '</sheets>' +
                        '{filterSheets}'+
                     '</workbook>',
                comment:''
            },
            'xl/theme/theme1.xml':{
                data:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\r\n'+
                 '<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Office Theme">'+
                    '<a:themeElements>' +
                        '<a:clrScheme name="Office">' +
                            '<a:dk1>' +
                                '<a:sysClr val="windowText" lastClr="000000"/>' +
                            '</a:dk1>' +
                            '<a:lt1>' +
                                '<a:sysClr val="window" lastClr="FFFFFF"/>' +
                            '</a:lt1>' +
                            '<a:dk2>' +
                                '<a:srgbClr val="1F497D"/>' +
                            '</a:dk2>' +
                            '<a:lt2>' +
                                '<a:srgbClr val="EEECE1"/>' +
                            '</a:lt2>' +
                            '<a:accent1>' +
                                '<a:srgbClr val="4F81BD"/>' +
                            '</a:accent1>' +
                            '<a:accent2>' +
                                '<a:srgbClr val="C0504D"/>' +
                            '</a:accent2>' +
                            '<a:accent3>' +
                                '<a:srgbClr val="9BBB59"/>' +
                            '</a:accent3>' +
                            '<a:accent4>' +
                                '<a:srgbClr val="8064A2"/>' +
                            '</a:accent4>' +
                            '<a:accent5>' +
                                '<a:srgbClr val="4BACC6"/>' +
                            '</a:accent5>' +
                            '<a:accent6>' +
                                '<a:srgbClr val="F79646"/>' +
                            '</a:accent6>' +
                            '<a:hlink>' +
                                '<a:srgbClr val="0000FF"/>' +
                            '</a:hlink>' +
                            '<a:folHlink>' +
                                '<a:srgbClr val="800080"/>' +
                            '</a:folHlink>' +
                        '</a:clrScheme>' +
                        '<a:fontScheme name="Office">' +
                            '<a:majorFont>' +
                                '<a:latin typeface="Cambria"/>' +
                                '<a:ea typeface=""/>' +
                                '<a:cs typeface=""/>' +
                                '<a:font script="Jpan" typeface="ＭＳ Ｐゴシック"/>' +
                                '<a:font script="Hang" typeface="맑은 고딕"/>' +
                                '<a:font script="Hans" typeface="宋体"/>' +
                                '<a:font script="Hant" typeface="新細明體"/>' +
                                '<a:font script="Arab" typeface="Times New Roman"/>' +
                                '<a:font script="Hebr" typeface="Times New Roman"/>' +
                                '<a:font script="Thai" typeface="Tahoma"/>' +
                                '<a:font script="Ethi" typeface="Nyala"/>' +
                                '<a:font script="Beng" typeface="Vrinda"/>' +
                                '<a:font script="Gujr" typeface="Shruti"/>' +
                                '<a:font script="Khmr" typeface="MoolBoran"/>' +
                                '<a:font script="Knda" typeface="Tunga"/>' +
                                '<a:font script="Guru" typeface="Raavi"/>' +
                                '<a:font script="Cans" typeface="Euphemia"/>' +
                                '<a:font script="Cher" typeface="Plantagenet Cherokee"/>' +
                                '<a:font script="Yiii" typeface="Microsoft Yi Baiti"/>' +
                                '<a:font script="Tibt" typeface="Microsoft Himalaya"/>' +
                                '<a:font script="Thaa" typeface="MV Boli"/>' +
                                '<a:font script="Deva" typeface="Mangal"/>' +
                                '<a:font script="Telu" typeface="Gautami"/>' +
                                '<a:font script="Taml" typeface="Latha"/>' +
                                '<a:font script="Syrc" typeface="Estrangelo Edessa"/>' +
                                '<a:font script="Orya" typeface="Kalinga"/>' +
                                '<a:font script="Mlym" typeface="Kartika"/>' +
                                '<a:font script="Laoo" typeface="DokChampa"/>' +
                                '<a:font script="Sinh" typeface="Iskoola Pota"/>' +
                                '<a:font script="Mong" typeface="Mongolian Baiti"/>' +
                                '<a:font script="Viet" typeface="Times New Roman"/>' +
                                '<a:font script="Uigh" typeface="Microsoft Uighur"/>' +
                                '<a:font script="Geor" typeface="Sylfaen"/>' +
                            '</a:majorFont>' +
                            '<a:minorFont>' +
                                '<a:latin typeface="Calibri"/>' +
                                '<a:ea typeface=""/>' +
                                '<a:cs typeface=""/>' +
                                '<a:font script="Jpan" typeface="ＭＳ Ｐゴシック"/>' +
                                '<a:font script="Hang" typeface="맑은 고딕"/>' +
                                '<a:font script="Hans" typeface="宋体"/>' +
                                '<a:font script="Hant" typeface="新細明體"/>' +
                                '<a:font script="Arab" typeface="Arial"/>' +
                                '<a:font script="Hebr" typeface="Arial"/>' +
                                '<a:font script="Thai" typeface="Tahoma"/>' +
                                '<a:font script="Ethi" typeface="Nyala"/>' +
                                '<a:font script="Beng" typeface="Vrinda"/>' +
                                '<a:font script="Gujr" typeface="Shruti"/>' +
                                '<a:font script="Khmr" typeface="DaunPenh"/>' +
                                '<a:font script="Knda" typeface="Tunga"/>' +
                                '<a:font script="Guru" typeface="Raavi"/>' +
                                '<a:font script="Cans" typeface="Euphemia"/>' +
                                '<a:font script="Cher" typeface="Plantagenet Cherokee"/>' +
                                '<a:font script="Yiii" typeface="Microsoft Yi Baiti"/>' +
                                '<a:font script="Tibt" typeface="Microsoft Himalaya"/>' +
                                '<a:font script="Thaa" typeface="MV Boli"/>' +
                                '<a:font script="Deva" typeface="Mangal"/>' +
                                '<a:font script="Telu" typeface="Gautami"/>' +
                                '<a:font script="Taml" typeface="Latha"/>' +
                                '<a:font script="Syrc" typeface="Estrangelo Edessa"/>' +
                                '<a:font script="Orya" typeface="Kalinga"/>' +
                                '<a:font script="Mlym" typeface="Kartika"/>' +
                                '<a:font script="Laoo" typeface="DokChampa"/>' +
                                '<a:font script="Sinh" typeface="Iskoola Pota"/>' +
                                '<a:font script="Mong" typeface="Mongolian Baiti"/>' +
                                '<a:font script="Viet" typeface="Arial"/>' +
                                '<a:font script="Uigh" typeface="Microsoft Uighur"/>' +
                                '<a:font script="Geor" typeface="Sylfaen"/>' +
                            '</a:minorFont>' +
                        '</a:fontScheme>' +
                        '<a:fmtScheme name="Office">' +
                            '<a:fillStyleLst>' +
                                '<a:solidFill>' +
                                    '<a:schemeClr val="phClr"/>' +
                                '</a:solidFill>' +
                                '<a:gradFill rotWithShape="1">' +
                                    '<a:gsLst>' +
                                        '<a:gs pos="0">' +
                                            '<a:schemeClr val="phClr">' +
                                                '<a:tint val="50000"/>' +
                                                '<a:satMod val="300000"/>' +
                                            '</a:schemeClr>' +
                                        '</a:gs>' +
                                        '<a:gs pos="35000">' +
                                            '<a:schemeClr val="phClr">' +
                                                '<a:tint val="37000"/>' +
                                                '<a:satMod val="300000"/>' +
                                            '</a:schemeClr>' +
                                        '</a:gs>' +
                                        '<a:gs pos="100000">' +
                                            '<a:schemeClr val="phClr">' +
                                                '<a:tint val="15000"/>' +
                                                '<a:satMod val="350000"/>' +
                                            '</a:schemeClr>' +
                                        '</a:gs>' +
                                    '</a:gsLst>' +
                                    '<a:lin ang="16200000" scaled="1"/>' +
                                '</a:gradFill>' +
                                '<a:gradFill rotWithShape="1">' +
                                    '<a:gsLst>' +
                                        '<a:gs pos="0">' +
                                            '<a:schemeClr val="phClr">' +
                                                '<a:tint val="100000"/>' +
                                                '<a:shade val="100000"/>' +
                                                '<a:satMod val="130000"/>' +
                                            '</a:schemeClr>' +
                                        '</a:gs>' +
                                        '<a:gs pos="100000">' +
                                            '<a:schemeClr val="phClr">' +
                                                '<a:tint val="50000"/>' +
                                                '<a:shade val="100000"/>' +
                                                '<a:satMod val="350000"/>' +
                                            '</a:schemeClr>' +
                                        '</a:gs>' +
                                    '</a:gsLst>' +
                                    '<a:lin ang="16200000" scaled="0"/>' +
                                '</a:gradFill>' +
                            '</a:fillStyleLst>' +
                            '<a:lnStyleLst>' +
                                '<a:ln w="9525" cap="flat" cmpd="sng" algn="ctr">' +
                                    '<a:solidFill>' +
                                        '<a:schemeClr val="phClr">' +
                                            '<a:shade val="95000"/>' +
                                            '<a:satMod val="105000"/>' +
                                        '</a:schemeClr>' +
                                    '</a:solidFill>' +
                                    '<a:prstDash val="solid"/>' +
                                '</a:ln>' +
                                '<a:ln w="25400" cap="flat" cmpd="sng" algn="ctr">' +
                                    '<a:solidFill>' +
                                        '<a:schemeClr val="phClr"/>' +
                                    '</a:solidFill>' +
                                    '<a:prstDash val="solid"/>' +
                                '</a:ln>' +
                                '<a:ln w="38100" cap="flat" cmpd="sng" algn="ctr">' +
                                    '<a:solidFill>' +
                                        '<a:schemeClr val="phClr"/>' +
                                    '</a:solidFill>' +
                                    '<a:prstDash val="solid"/>' +
                                '</a:ln>' +
                            '</a:lnStyleLst>' +
                            '<a:effectStyleLst>' +
                                '<a:effectStyle>' +
                                    '<a:effectLst>' +
                                        '<a:outerShdw blurRad="40000" dist="20000" dir="5400000" rotWithShape="0">' +
                                            '<a:srgbClr val="000000">' +
                                                '<a:alpha val="38000"/>' +
                                            '</a:srgbClr>' +
                                        '</a:outerShdw>' +
                                    '</a:effectLst>' +
                                '</a:effectStyle>' +
                                '<a:effectStyle>' +
                                    '<a:effectLst>' +
                                        '<a:outerShdw blurRad="40000" dist="23000" dir="5400000" rotWithShape="0">' +
                                            '<a:srgbClr val="000000">' +
                                                '<a:alpha val="35000"/>' +
                                            '</a:srgbClr>' +
                                        '</a:outerShdw>' +
                                    '</a:effectLst>' +
                                '</a:effectStyle>' +
                                '<a:effectStyle>' +
                                    '<a:effectLst>' +
                                        '<a:outerShdw blurRad="40000" dist="23000" dir="5400000" rotWithShape="0">' +
                                            '<a:srgbClr val="000000">' +
                                                '<a:alpha val="35000"/>' +
                                            '</a:srgbClr>' +
                                        '</a:outerShdw>' +
                                    '</a:effectLst>' +
                                    '<a:scene3d>' +
                                        '<a:camera prst="orthographicFront">' +
                                            '<a:rot lat="0" lon="0" rev="0"/>' +
                                        '</a:camera>' +
                                        '<a:lightRig rig="threePt" dir="t">' +
                                            '<a:rot lat="0" lon="0" rev="1200000"/>' +
                                        '</a:lightRig>' +
                                    '</a:scene3d>' +
                                    '<a:sp3d>' +
                                        '<a:bevelT w="63500" h="25400"/>' +
                                    '</a:sp3d>' +
                                '</a:effectStyle>' +
                            '</a:effectStyleLst>' +
                            '<a:bgFillStyleLst>' +
                                '<a:solidFill>' +
                                    '<a:schemeClr val="phClr"/>' +
                                '</a:solidFill>' +
                                '<a:gradFill rotWithShape="1">' +
                                    '<a:gsLst>' +
                                        '<a:gs pos="0">' +
                                            '<a:schemeClr val="phClr">' +
                                                '<a:tint val="40000"/>' +
                                                '<a:satMod val="350000"/>' +
                                            '</a:schemeClr>' +
                                        '</a:gs>' +
                                        '<a:gs pos="40000">' +
                                            '<a:schemeClr val="phClr">' +
                                                '<a:tint val="45000"/>' +
                                                '<a:shade val="99000"/>' +
                                                '<a:satMod val="350000"/>' +
                                            '</a:schemeClr>' +
                                        '</a:gs>' +
                                        '<a:gs pos="100000">' +
                                            '<a:schemeClr val="phClr">' +
                                                '<a:shade val="20000"/>' +
                                                '<a:satMod val="255000"/>' +
                                            '</a:schemeClr>' +
                                        '</a:gs>' +
                                    '</a:gsLst>' +
                                    '<a:path path="circle">' +
                                        '<a:fillToRect l="50000" t="-80000" r="50000" b="180000"/>' +
                                    '</a:path>' +
                                '</a:gradFill>' +
                                '<a:gradFill rotWithShape="1">' +
                                    '<a:gsLst>' +
                                        '<a:gs pos="0">' +
                                            '<a:schemeClr val="phClr">' +
                                                '<a:tint val="80000"/>' +
                                                '<a:satMod val="300000"/>' +
                                            '</a:schemeClr>' +
                                        '</a:gs>' +
                                        '<a:gs pos="100000">' +
                                            '<a:schemeClr val="phClr">' +
                                                '<a:shade val="30000"/>' +
                                                '<a:satMod val="200000"/>' +
                                            '</a:schemeClr>' +
                                        '</a:gs>' +
                                    '</a:gsLst>' +
                                    '<a:path path="circle">' +
                                        '<a:fillToRect l="50000" t="50000" r="50000" b="50000"/>' +
                                    '</a:path>' +
                                '</a:gradFill>' +
                            '</a:bgFillStyleLst>' +
                        '</a:fmtScheme>' +
                    '</a:themeElements>' +
                    '<a:objectDefaults>' +
                        '<a:spDef>' +
                            '<a:spPr/>' +
                            '<a:bodyPr/>' +
                            '<a:lstStyle/>' +
                            '<a:style>' +
                                '<a:lnRef idx="1">' +
                                    '<a:schemeClr val="accent1"/>' +
                                '</a:lnRef>' +
                                '<a:fillRef idx="3">' +
                                    '<a:schemeClr val="accent1"/>' +
                                '</a:fillRef>' +
                                '<a:effectRef idx="2">' +
                                    '<a:schemeClr val="accent1"/>' +
                                '</a:effectRef>' +
                                '<a:fontRef idx="minor">' +
                                    '<a:schemeClr val="lt1"/>' +
                                '</a:fontRef>' +
                            '</a:style>' +
                        '</a:spDef>' +
                        '<a:lnDef>' +
                            '<a:spPr/>' +
                            '<a:bodyPr/>' +
                            '<a:lstStyle/>' +
                            '<a:style>' +
                                '<a:lnRef idx="2">' +
                                    '<a:schemeClr val="accent1"/>' +
                                '</a:lnRef>' +
                                '<a:fillRef idx="0">' +
                                    '<a:schemeClr val="accent1"/>' +
                                '</a:fillRef>' +
                                '<a:effectRef idx="1">' +
                                    '<a:schemeClr val="accent1"/>' +
                                '</a:effectRef>' +
                                '<a:fontRef idx="minor">' +
                                    '<a:schemeClr val="tx1"/>' +
                                '</a:fontRef>' +
                            '</a:style>' +
                        '</a:lnDef>' +
                    '</a:objectDefaults>' +
                    '<a:extraClrSchemeLst/>' +
                '</a:theme>',
                comment:''
            },
            'xl/styles.xml':{
                data:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\r\n'+
                 '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" '+
                             'xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">' +
                    '<numFmts count="1">' +//не понятно
                        '<numFmt numFmtId="56" formatCode="&quot;上午/下午 &quot;hh&quot;時&quot;mm&quot;分&quot;ss&quot;秒 &quot;"/>' +
                    '</numFmts>' +
                    '<fonts count="1">' +
                        '<font>' +
                            '<sz val="12"/>' +
                            '<color theme="1"/>' +
                            '<name val="Calibri"/>' +
                            '<family val="2"/>' +
                            '<scheme val="minor"/>' +
                        '</font>' +
                    '</fonts>' +
                    '<fills count="2">' +//заливка ячеек
                        '<fill>' +
                            '<patternFill patternType="none"/>' +
                        '</fill>' +
                        '<fill>' +
                            '<patternFill patternType="gray125"/>' +
                        '</fill>' +
                    '</fills>' +
                    '<borders count="{cntBrdrs}">' +//рамки ячеек
                        '<border>' +
                            '<left/>' +
                            '<right/>' +
                            '<top/>' +
                            '<bottom/>' +
                            '<diagonal/>' +
                        '</border>' +
                        '{borders}' +
                    '</borders>' +
                    '<cellStyleXfs count="1">' +
                        '<xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>' +
                    '</cellStyleXfs>' +
                    '<cellXfs count="{cntxfs}">' +//установление рамок
                        '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>' +
                        '{xfs}'+
                    '</cellXfs>' +
                    '<cellStyles count="1">' +
                        '<cellStyle name="Normal" xfId="0" builtinId="0"/>' +
                    '</cellStyles>' +
                    '<dxfs count="0"/>' +
                    '<tableStyles count="0" defaultTableStyle="TableStyleMedium9" defaultPivotStyle="PivotStyleMedium4"/>' +
                '</styleSheet>',
                comment:''
            },
            '[Content_Types].xml':{
                data:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\r\n'+
                     '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types" '+
                            'xmlns:xsd="http://www.w3.org/2001/XMLSchema" '+
                            'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' +
                        '<Default Extension="xml" ContentType="application/xml"/>' +
                        '<Default Extension="bin" ContentType="application/vnd.ms-excel.sheet.binary.macroEnabled.main"/>' +
                        '<Default Extension="vml" ContentType="application/vnd.openxmlformats-officedocument.vmlDrawing"/>' +
                        '<Default Extension="data" ContentType="application/vnd.openxmlformats-officedocument.model+data"/>' +
                        '<Default Extension="bmp" ContentType="image/bmp"/>' +
                        '<Default Extension="png" ContentType="image/png"/>' +
                        '<Default Extension="gif" ContentType="image/gif"/>' +
                        '<Default Extension="emf" ContentType="image/x-emf"/>' +
                        '<Default Extension="wmf" ContentType="image/x-wmf"/>' +
                        '<Default Extension="jpg" ContentType="image/jpeg"/>' +
                        '<Default Extension="jpeg" ContentType="image/jpeg"/>' +
                        '<Default Extension="tif" ContentType="image/tiff"/>' +
                        '<Default Extension="tiff" ContentType="image/tiff"/>' +
                        '<Default Extension="pdf" ContentType="application/pdf"/>' +
                        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
                        '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
                        '{OverContTypes}' +
                        '<Override PartName="/xl/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>' +
                        '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' +
                        '<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>' +
                        '<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>' +
                    '</Types>',
                comment:''
            },
            '_rels/.rels':{
                data:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\r\n'+
                 '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
                    '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" '+
                                            'Target="docProps/core.xml"/>' +
                    '<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" '+
                                            'Target="docProps/app.xml"/>' +
                    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" '+
                                            'Target="xl/workbook.xml"/>' +
                '</Relationships>',
                comment:''
            },
            'xl/_rels/workbook.xml.rels':{
                data:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\r\n'+
                 '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
                    '{relationship}' +
                    '<Relationship Id="rId{rshipid1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" ' +
                                            'Target="theme/theme1.xml"/>' +
                    '<Relationship Id="rId{rshipid2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" ' +
                                            'Target="styles.xml"/>' +
                '</Relationships>',
                comment:''
            }
    };

    function dataFile(){
        this.data = [];
        this.append = function(e){
            this.data.push(e);
        }
        this.finalize = function () {
            return this.data.join("");
        }
    }
    this.setContent = function(_param){
        if(!('sheetname' in _param)){
            _param['sheetname'] = 'Лист ' + (Sheets.length + 1);
        }
        if(!('dom' in _param)){
            return false;
        }
        var clone = _param.dom.cloneNode(true);
        var sheet = this.addSheet(_param['sheetname']);
        var res = D3Api.Office.Spreadsheet.initDom(clone);
        for(var i in res){
            if(res.hasOwnProperty(i)){
                var cell = sheet.setCellValue(i,res[i].caption);
                if('style' in res[i]){
                    cell.setStyleArray(res[i].style);
                }
                if('merge' in res[i]){
                    sheet.setMergeCells(res[i].merge);
                }
            }
        }

        return sheet;
    }
    this.addSheet = function(_nameSheet){
        var sheet = new D3Api.Office.Spreadsheet.Sheet(_nameSheet);
        Sheets.push(sheet);
        return sheet;
    }
    this.save = function(_fileName){
        var appName = 'BarsGroupSheet';
        var cntSheets = Sheets.length;
        var lpstr = '';
        var OverContTypes = '';
        var shts = '';
        var relationship = '';
        var borderId = 0;
        var StyleBorders = [];

        var currStructure = {};
        var FilterSheets = '';

        for(var i = 0, len = Sheets.length; i < len ; i++){
            var sheetname = D3Api.Office.Spreadsheet.normalizeString(Sheets[i].getSheetName());
            var minmax = '';
            var merges = '';
            var autoFilter = '';
            var cells = Sheets[i].getCells();
            var mergeCoords = Object.keys(Sheets[i].getMergeCells());
            for(var j = 0; j < mergeCoords.length ; j++){
                merges += '<mergeCell ref="'+mergeCoords[j]+'"/>';
            }
            if(merges != ''){
                merges = "<mergeCells count=\""+mergeCoords.length+"\">"+merges+"</mergeCells>";
            }
            var sheetFile = 'xl/worksheets/sheet'+(i + 1)+'.xml';
            shts += '<sheet name="'+sheetname+'" sheetId="'+(i + 1)+'" r:id="rId'+(i + 1)+'"/>'
            lpstr += "<vt:lpstr>"+sheetname+"</vt:lpstr>";
            OverContTypes += '<Override PartName="/'+sheetFile+'" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>';
            relationship += '<Relationship Id="rId'+(i + 1)+'" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet'+(i + 1)+'.xml"/>';
            var min = '';
            var max = '';
            var rows = {};
            var filter = Sheets[i].getAutoFilter();
            if(filter){
                var filterCoord = D3Api.Office.Spreadsheet.intoCoord(filter);
                var startFilterCell = D3Api.Office.Spreadsheet.getCell(filterCoord.start.cell);
                var startFilterRow = D3Api.Office.Spreadsheet.getRow(filterCoord.start.row);
                var endFilterCell = D3Api.Office.Spreadsheet.getCell(filterCoord.end.cell);
                var endFilterRow = D3Api.Office.Spreadsheet.getRow(filterCoord.end.row);
                FilterSheets += "<definedName name=\"_xlnm._FilterDatabase\" localSheetId=\""+i+"\" hidden=\"1\">'"+sheetname+"'!$"+startFilterCell+"$"+startFilterRow+":$"+endFilterCell+"$"+endFilterRow+"</definedName>";
                autoFilter += "<autoFilter ref=\""+filter+"\"/>";
            }
            for(var j in cells){
                if(cells.hasOwnProperty(j)){
                    ++borderId;
                    var BorderStyle = cells[j].getStyleArray('border');
                    var border = '<border>';
                    if(BorderStyle){

                        if('left' in BorderStyle){
                            border += "<left style=\""+BorderStyle['left'].borderStyle+"\"><color indexed=\"64\"/></left>";
                        }else{
                            border += "<left/>";
                        }
                        if('right' in BorderStyle){
                            border += "<right style=\""+BorderStyle['right'].borderStyle+"\"><color indexed=\"64\"/></right>";
                        }else{
                            border += "<right/>";
                        }
                        if('top' in BorderStyle){
                            border += "<top style=\""+BorderStyle['top'].borderStyle+"\"><color indexed=\"64\"/></top>";
                        }else{
                            border += "<top/>";
                        }
                        if('bottom' in BorderStyle){
                            border += "<bottom style=\""+BorderStyle['bottom'].borderStyle+"\"><color indexed=\"64\"/></bottom>";
                        }else{
                            border += "<bottom/>";
                        }
                    }else{
                        border += "<left/><right/><top/><bottom/>";
                    }
                    border += '</border>';
                    StyleBorders.push({
                        border:border,
                        xf:"<xf numFmtId=\"0\" fontId=\"0\" fillId=\"0\" borderId=\""+borderId+"\" xfId=\"0\" applyBorder=\"1\" applyAlignment=\"1\"/>"
                    })
                    var obj = D3Api.Office.Spreadsheet.intoCoord(j);
                    var row = obj.row + 1;
                    var cell = obj.cell + 1;
                    if(!(row in rows)){
                        rows[row] = {};
                    }
                    if(!(cell in rows[row])){
                        rows[row][cell] = '';
                    }
                    if(min == ''){
                        min = j;
                    }
                    max = j;
                    var val = cells[j].getValue();
                    if(val){
                        rows[row][cell] += '<c s="'+borderId+'" r="'+cells[j].getCell()+'" t="'+D3Api.Office.Spreadsheet.normalizeString(cells[j].getType())+'"><v>'+D3Api.Office.Spreadsheet.normalizeString(val)+'</v></c>';
                    }else{
                        rows[row][cell] += '<c s="'+borderId+'" r="'+cells[j].getCell()+'" />';
                    }
                }
            }
            var table = '';
            for(var row in rows){
                if(rows.hasOwnProperty(row)){
                    var rowSzie = Sheets[i].getRowSize(row);
                    table += "<row r=\""+row+"\"";
                    if(rowSzie){
                        table += " ht=\""+rowSzie+"\" customHeight=\"1\" ";
                    }
                    table += ">";
                    for(var cell in rows[row]){
                        if(rows[row].hasOwnProperty(cell)){
                            table += rows[row][cell];
                        }
                    }
                    table += "</row>";
                }
            }
            minmax = min+':'+max;
            currStructure[sheetFile] = Object.assign({}, structureXlsxXmlFile['xl/worksheets/sheet.xml']);

            var widthCell = '';
            var sizeCells = Sheets[i].getCellSize();
            for(var _cl in sizeCells){
                if(sizeCells.hasOwnProperty(_cl)){
                    var coord = D3Api.Office.Spreadsheet.intoCoord(_cl);
                    var cell = coord.cell + 1;
                    widthCell += "<col min=\""+cell+"\" max=\""+cell+"\" width=\""+sizeCells[_cl]+"\" customWidth=\"1\"/>";
                }
            }
            if(widthCell){
                widthCell = "<cols>"+widthCell+"</cols>"
            }
            currStructure[sheetFile].data = D3Api.Office.Spreadsheet.reFormat(currStructure[sheetFile].data,{
                StartEndCoord:minmax,
                StartEndCoord1:minmax,
                tableRow:table,
                merges:merges,
                autoFilter:autoFilter,
                cellSize:widthCell
            })
        }
        var cntBrdrs = StyleBorders.length + 1;
        var borders = '';
        var cntxfs = StyleBorders.length + 1;
        var xfs = '';
        for(var i = 0 ; i < StyleBorders.length ; i++){
            borders += StyleBorders[i].border;
            xfs += StyleBorders[i].xf
        }
        currStructure['docProps/core.xml'] = Object.assign({}, structureXlsxXmlFile['docProps/core.xml']);
        currStructure['xl/theme/theme1.xml'] = Object.assign({}, structureXlsxXmlFile['xl/theme/theme1.xml']);
        currStructure['_rels/.rels'] = Object.assign({}, structureXlsxXmlFile['_rels/.rels']);
        currStructure['xl/_rels/workbook.xml.rels'] = Object.assign({}, structureXlsxXmlFile['xl/_rels/workbook.xml.rels']);

        currStructure['xl/styles.xml'] = Object.assign({}, structureXlsxXmlFile['xl/styles.xml']);
        currStructure['xl/styles.xml'].data = D3Api.Office.Spreadsheet.reFormat(currStructure['xl/styles.xml'].data, {
            'cntBrdrs':cntBrdrs,
            'borders':borders,
            'cntxfs':cntxfs,
            'xfs':xfs
        });
        currStructure['docProps/app.xml'] = Object.assign({}, structureXlsxXmlFile['docProps/app.xml']);
        currStructure['docProps/app.xml'].data = D3Api.Office.Spreadsheet.reFormat(currStructure['docProps/app.xml'].data,{
            AppName: appName,
            cntSheets: cntSheets,
            lpstr: lpstr,
            cntSheetsSize: cntSheets
        });

        currStructure['[Content_Types].xml'] = Object.assign({}, structureXlsxXmlFile['[Content_Types].xml']);
        currStructure['[Content_Types].xml'].data = D3Api.Office.Spreadsheet.reFormat(currStructure['[Content_Types].xml'].data,{
            OverContTypes:OverContTypes
        })

        if(FilterSheets){
            FilterSheets = "<definedNames>"+FilterSheets+"</definedNames>";
        }

        currStructure['xl/workbook.xml'] = Object.assign({}, structureXlsxXmlFile['xl/workbook.xml']);
        currStructure['xl/workbook.xml'].data = D3Api.Office.Spreadsheet.reFormat(currStructure['xl/workbook.xml'].data,{
            shts:shts,
            filterSheets:FilterSheets
        });



        currStructure['xl/_rels/workbook.xml.rels'] = Object.assign({}, structureXlsxXmlFile['xl/_rels/workbook.xml.rels']);
        currStructure['xl/_rels/workbook.xml.rels'].data = D3Api.Office.Spreadsheet.reFormat(currStructure['xl/_rels/workbook.xml.rels'].data,{
            relationship: relationship,
            rshipid1:Sheets.length+1,
            rshipid2:Sheets.length+2
        });

        var r = [];
        var t = 0;
        var a = 0;
        for(var fileName in currStructure){
            if(currStructure.hasOwnProperty(fileName)){
                var compressionMethod = "\0\0";
                var ObjBinaryDate = D3Api.Office.Spreadsheet.generateBinaryDate();
                var int8Arr_data = D3Api.Office.Spreadsheet.utf8encode(currStructure[fileName].data);
                currStructure[fileName].data = D3Api.Office.Spreadsheet.transformTo(int8Arr_data)
                var uncompressedSize = currStructure[fileName].data.length;
                var compressedSize = uncompressedSize;
                var crc32_data = D3Api.crc32(currStructure[fileName].data);
                var int8Arr_filename = D3Api.Office.Spreadsheet.utf8encode(fileName);
                var int8Arr_comment = D3Api.Office.Spreadsheet.utf8encode(currStructure[fileName].comment);
                var b = '';//тут не определено

                var S = "";
                S += "\n\0";
                S += "\0\0";
                S += compressionMethod;
                S += D3Api.Office.Spreadsheet.verify(ObjBinaryDate.v, 2);
                S += D3Api.Office.Spreadsheet.verify(ObjBinaryDate.g, 2);
                S += D3Api.Office.Spreadsheet.verify(crc32_data, 4);
                S += D3Api.Office.Spreadsheet.verify(compressedSize, 4);
                S += D3Api.Office.Spreadsheet.verify(uncompressedSize, 4);
                S += D3Api.Office.Spreadsheet.verify(fileName.length, 2);
                S += D3Api.Office.Spreadsheet.verify(b.length, 2);
                var A = constantUnicodeFile.LOCAL_FILE_HEADER + S + fileName + b;

                var _ = constantUnicodeFile.CENTRAL_FILE_HEADER + "\0" + S + D3Api.Office.Spreadsheet.verify(currStructure[fileName].comment.length, 2)
                    + "\0\0" + "\0\0" + "\0\0\0\0"/** видимо так задманно **/ + D3Api.Office.Spreadsheet.verify(t, 4) + fileName + b + currStructure[fileName].comment;
                var obj = {
                    fileRecord: A,
                    dirRecord: _,
                    enc_data: int8Arr_data,
                    enc_filename: int8Arr_filename,
                    enc_comment: int8Arr_comment,
                    data: D3Api.Office.Spreadsheet.transformTo(int8Arr_data)
                }
                t += obj.fileRecord.length + compressedSize;
                a += obj.dirRecord.length;
                r.push(obj)
            }
        }

        var C = constantUnicodeFile.CENTRAL_DIRECTORY_END + "\0\0" + "\0\0"
            + D3Api.Office.Spreadsheet.verify(r.length, 2)
            + D3Api.Office.Spreadsheet.verify(r.length, 2)
            + D3Api.Office.Spreadsheet.verify(a, 4)
            + D3Api.Office.Spreadsheet.verify(t, 4)
            + D3Api.Office.Spreadsheet.verify(commentFile.length, 2) + commentFile;
        var i = new dataFile();
        for (var f = 0; f < r.length; f++) {
            i.append(r[f].fileRecord);
            i.append(r[f].data);
        }

        for (var f = 0; f < r.length; f++) {
            i.append(r[f].dirRecord)
        }
        i.append(C);
        C = i.finalize();


        var blob = new Blob([D3Api.Office.Spreadsheet.generateByteCode(C)],{
            type: "application/octet-stream; charset=utf-8"
        })

        var object_url = window.URL.createObjectURL(blob);
        setTimeout(function(){
            var save_link = document.createElement('a');
            save_link.href = object_url;
            save_link.download = (_fileName||'filename')+'.xlsx'
            var event = new MouseEvent('click');
            save_link.dispatchEvent(event);

        });
    }
};
D3Api.Office.Spreadsheet.xml.export = function(){
    var uri = 'data:application/vnd.ms-excel;base64,';
    var Sheets = [];
    var tmplWorkbookXML =
        '<?xml version="1.0"?>' +
        '<?mso-application progid="Excel.Sheet"?>' +
        '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" ' +
                  'xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">'+
            '<DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">' +
                '<Author>Axel Richter</Author>' +
                '<Created>{created}</Created>' +
            '</DocumentProperties>'+
            '<Styles>'+
                '<Style ss:ID="Currency"><NumberFormat ss:Format="Currency"></NumberFormat></Style>'+
                '<Style ss:ID="Date"><NumberFormat ss:Format="Medium Date"></NumberFormat></Style>'+
            '</Styles>'+
            '{worksheets}' +
        '</Workbook>'
    var tmplWorksheetXML =
        '<Worksheet ss:Name="{nameWS}">' +
            '<Table>{rows}</Table>' +
        '</Worksheet>';
    var tmplCellXML =
        '<Cell{attributeStyleID}{attributeFormula}>' +
            '<Data ss:Type="{nameType}">' +
                '{data}' +
            '</Data>' +
        '</Cell>';

    this.setContent = function(_param){
        if(!('sheetname' in _param)){
            _param['sheetname'] = 'Лист ' + (Sheets.length + 1);
        }
        if(!('dom' in _param)){
            return false;
        }

        var clone = _param.dom.cloneNode(true);
        var sheet = this.addSheet(_param['sheetname']);
        var res = D3Api.Office.Spreadsheet.initDom(clone);
        for(var i in res){
            if(res.hasOwnProperty(i)){
                var cell = sheet.setCellValue(i,res[i].caption);
                if('style' in res[i]){
                    cell.setStyleArray(res[i].style);
                }
                if('merge' in res[i]){
                    sheet.setMergeCells(res[i].merge);
                }
            }
        }
        return sheet;
    }

    this.addSheet = function(_nameSheet){
        var sheet = new D3Api.Office.Spreadsheet.Sheet(_nameSheet);
        Sheets.push(sheet);
        return sheet;
    }

    this.save = function(_fileName){
        var workbookXML = "";
        var worksheetsXML = "";
        var rowsXML = "";

        for(var i = 0, len = Sheets.length; i < len ; i++){
            var cells = Sheets[i].getCells();
            var sheetName = D3Api.Office.Spreadsheet.normalizeString(Sheets[i].getSheetName());
            var rows = {};
            for(var j in cells){
                if(cells.hasOwnProperty(j)){
                    var obj = D3Api.Office.Spreadsheet.intoCoord(j);
                    if(!(obj.row in rows)){
                        rows[obj.row] = {};
                    }
                    if(!(obj.cell in rows[obj.row])){
                        rows[obj.row][obj.cell] = '';
                    }
                    var val = cells[j].getValue();
                    rows[obj.row][obj.cell] += D3Api.Office.Spreadsheet.reFormat(tmplCellXML,{
                        attributeStyleID:'',
                        nameType:'String',
                        data: val,
                        attributeFormula:''
                    });
                }
            }
            var table = '';
            for(var row in rows){
                if(rows.hasOwnProperty(row)){
                    table += '<Row>';
                    for(var cell in rows[row]){
                        if(rows[row].hasOwnProperty(cell)){
                            table += rows[row][cell];
                        }
                    }
                    table += '</Row>';
                }
            }
            var ctx = {
                rows: table,
                nameWS: sheetName
            };
            worksheetsXML += D3Api.Office.Spreadsheet.reFormat(tmplWorksheetXML,ctx);
        }
        var ctx = {
            created: (new Date()).getTime(),
            worksheets: worksheetsXML
        };
        workbookXML = D3Api.Office.Spreadsheet.reFormat(tmplWorkbookXML, ctx);

        var link = document.createElement("A");
        link.href = uri + D3Api.Office.Spreadsheet.encodeBase64(workbookXML);
        link.download = (_fileName||'Workbook')+'.xls';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};
/**
 * Сoздание NodeList списка.
 * @return Object
 */
D3Api.singleNode = function(){
    return new function (){
        var nodeArray = [];
        var nodelist = document.createDocumentFragment().childNodes;
        this.add = function(_node){
            nodeArray.push(_node);
        }
        this.get = function(){
            debugger
            var obj = {};
            for(var i = 0 ;i < nodeArray.length ; i++){
                obj[i] = {
                    'value': nodeArray[i],
                    'enumerable': true
                }
            }
            obj['length'] = {value: nodeArray.length}
            obj['item'] = {
                'value': function (i) {
                    return this[+i || 0];
                },
                'enumerable': true
            }
            return Object.create(nodelist,obj);
        }
    }
};
;D3Api.BaseCtrl = new function()
{
    var baseMethods = {};
    var self = this;
    //Переопределить в каждом контроле, вызывается при парсе компонента
    this.init = function(_dom)
    {
        this.init_focus(_dom);
        return true;
    }
    this.init_focus = function(_dom)
    {
        D3Api.addEvent(_dom,'focus',this.ctrl_focus, true);
        D3Api.addEvent(_dom,'blur',this.ctrl_blur, true);
    }
    this.ctrl_focus = function(e)
    {
        var inp=D3Api.getEventTarget(e);
        var focus_control = D3Api.getControlByDom(inp);

        if(focus_control )
        {
            if(D3Api.getProperty(focus_control,'name') == "lastControl" && !D3Api.getVar('KeyDown_shiftKey')) {
                D3Api.stopEvent(e);
                D3Api.BaseCtrl.focusNextElement(focus_control, 2);
                D3Api.setVar('KeyDown_shiftKey', null);
                return;
            }
            else if(D3Api.getProperty(focus_control,'name') == "firstControl")
            {
                D3Api.stopEvent(e);
                if(D3Api.getVar('KeyDown_shiftKey') === true)
                    D3Api.BaseCtrl.focusNextElement(focus_control, -2);
                else
                    D3Api.BaseCtrl.focusNextElement(focus_control, 1);
                D3Api.setVar('KeyDown_shiftKey', null);
                return;
            }

            D3Api.setVar('focus_control', focus_control);
            D3Api.addClass(focus_control, 'focus');
        }
    }
    this.ctrl_blur = function(e)
    {
        var focus_control = D3Api.getVar('focus_control');
        if(!focus_control)
            return;

        D3Api.removeClass(focus_control, 'focus');
        D3Api.setVar('focus_control', null);
    }

    this.focusNextElement = function(dom, delta){
        var focussableElements = 'input:not([disabled]), [tabindex]:not([disabled]):not([tabindex="-1"])';
        if (!dom)
            return;

        var focussable = Array.prototype.filter.call(dom.D3Form.DOM.querySelectorAll(focussableElements),
            function(element){
                return element.offsetWidth > 0 || element.offsetHeight > 0
            });

        var index = focussable.indexOf(dom);

        if((index+delta) < 0)
            var inp = focussable[focussable.length + delta];
        else if((index+delta)> (focussable.length -1))
            var inp = focussable[index + delta - focussable.length];
        else
            var inp = focussable[index + delta];

        var focus_control = D3Api.getControlByDom(inp);

        if(inp == focus_control)
            focus_control.focus();
        else
            D3Api.setControlPropertyByDom(focus_control, 'focus', true);
    }
    //Переопределить в каждом контроле, вызывается при запросе данных и получении ответа
    this.startWait = function(_dom)
    {
        return true;
    }
    this.stopWait = function(_dom)
    {
        return true;
    }
    this.callMethod = function(_dom,method)
    {
        var ct = D3Api.getProperty(_dom,'cmptype');
        if (!ct)
        {
            //D3Api.debug_msg('У объекта нет API');
            return;
        }
        var baseMethod = false;
        if (!D3Api.controlsApi[ct] || !D3Api.controlsApi[ct]._API_ || !D3Api.controlsApi[ct]._API_[method])
        {
            if(!baseMethods[method] || !D3Api.BaseCtrl[method])
            {
                //D3Api.debug_msg('Нет метода "'+method+'" для компонента с типом: '+ct);
                return;
            }
            baseMethod = true;
        }
        var args = Array.prototype.slice.call(arguments);
        args.splice(1,1);
        return (baseMethod)?D3Api.BaseCtrl[method].apply(this,args):D3Api.controlsApi[ct]._API_[method].apply(this, args);
    }
    this.initEvent = function Base_InitEvent(domSrc,eventName,argsName,defaultEventFunc,domDest)
    {
        domDest = domDest || domSrc;
        var ev = D3Api.getProperty(domSrc, eventName, defaultEventFunc);
        if(ev)
            domDest.D3Base.addEvent(eventName,domDest.D3Form.execDomEventFunc(domDest, (argsName)?{func: ev, args: argsName}:ev,undefined,domDest.D3Form.currentContext));
    }
    this.getName = function Base_getName(_dom)
    {
        return D3Api.getProperty(_dom,'name',null);
    }
    this.setName = function Base_setName(_dom,_value)
    {
        D3Api.setProperty(_dom,'name',_value);
    }
    this.getWidth = function Base_getWidth(_dom)
    {
        return _dom.style.width;
    }
    this.setWidth = function Base_setWidth(_dom,_value)
    {
        var v = +_value;
        if (isNaN(v))
            _dom.style.width = _value;
        else
            _dom.style.width = _value+'px';
    }
    this.getHeight = function Base_getHeight(_dom)
    {
        return _dom.style.height;
    }
    this.setHeight = function Base_setHeight(_dom,_value)
    {
        var v = +_value;
        if (isNaN(v))
            _dom.style.height = _value;
        else
            _dom.style.height = _value+'px';
    }
    this.getRealWidth = function Base_getRealWidth(_dom)
    {
        return _dom.offsetWidth;
    }
    this.getRealHeight = function Base_getRealHeight(_dom)
    {
        return _dom.offsetHeight;
    }
    this.getEnabled = function Base_getEnabled(_dom)
    {
        return !D3Api.hasClass(_dom,'ctrl_disable');
    }
    this.setEnabled = function Base_setEnabled(_dom,_value)
    {
        if (D3Api.getBoolean(_value))
            D3Api.removeClass(_dom,'ctrl_disable');
        else
            D3Api.addClass(_dom,'ctrl_disable');
    }
    this.getVisible = function Base_getVisible(_dom)
    {
        return !D3Api.hasClass(_dom,'ctrl_hidden');
    }
    this.setVisible = function Base_setVisible(_dom,_value)
    {
        if (D3Api.getBoolean(_value))
            D3Api.removeClass(_dom,'ctrl_hidden');
        else
            D3Api.addClass(_dom,'ctrl_hidden');

        var form = _dom.D3Form;
        if(!_dom.D3Form)
        {
            form = D3Api.getControlByDom(_dom).D3Form;
        }
        form.resize();
    }
    this.getHint = function Base_getHint(_dom)
    {
        return _dom.title;
    }
    this.setHint = function Base_setHint(_dom,_value)
    {
        return _dom.title = _value;
    }
    this.setFocus = function Base_setFocus(_dom,_value)
    {
        var inpEl = D3Api.getChildTag(_dom, 'input', 0);
        if (!inpEl)
            inpEl = D3Api.getChildTag(_dom, 'textarea', 0);
        if (!inpEl)
        {
            _dom.focus();
            return;
        }

        if (D3Api.getBoolean(_value))
            setTimeout(function(){inpEl.focus();},10);
        else
            setTimeout(function(){inpEl.blur();},10);
    }
    this.getWarning = function(_dom,_value)
    {
        return D3Api.hasClass(_dom,'ctrl_warning');
    }
    this.setWarning = function(_dom,_value)
    {
        if (D3Api.getBoolean(_value))
            D3Api.addClass(_dom,'ctrl_warning');
        else
            D3Api.removeClass(_dom,'ctrl_warning');
    }
    this.getError = function(_dom,_value)
    {
        return D3Api.hasClass(_dom,'ctrl_error');
    }
    this.setError = function(_dom,_value)
    {
        if (D3Api.getBoolean(_value))
            D3Api.addClass(_dom,'ctrl_error');
        else
            D3Api.removeClass(_dom,'ctrl_error');
    }
    this.getValue = function(dom)
    {
        if(D3Api.getProperty(dom,'cmptype') != 'Base') return;
        var inp = D3Api.getChildTag(dom,'input',0)||D3Api.getChildTag(dom,'textarea',0);
        if(inp)
            return (inp.value == null)?'':inp.value;
        else
            return D3Api.getProperty(dom,'keyvalue','');
    }
    this.setValue = function(dom,value)
    {
        if(D3Api.getProperty(dom,'cmptype') != 'Base') return;
        var inp = D3Api.getChildTag(dom,'input',0)||D3Api.getChildTag(dom,'textarea',0);
        if(inp)
            inp.value = value;
        else
            D3Api.setProperty(dom,'keyvalue',value);
    }
    this.getInput = function(dom)
    {
        if(D3Api.getProperty(dom,'cmptype') != 'Base') return;
        var inp = D3Api.getChildTag(dom,'input',0)||D3Api.getChildTag(dom,'textarea',0);
        return inp;
    }
    this.getCaption = function(dom)
    {
        if(D3Api.getProperty(dom,'cmptype') != 'Base') return;
        var inp = D3Api.getChildTag(dom,'input',0)||D3Api.getChildTag(dom,'textarea',0);
        if(inp)
            return (inp.value == null)?'':inp.value;
        else
            return D3Api.getTextContent(dom);
    }
    this.setCaption = function(dom,value)
    {
        if(D3Api.getProperty(dom,'cmptype') != 'Base') return;
        var inp = D3Api.getChildTag(dom,'input',0)||D3Api.getChildTag(dom,'textarea',0);
        if(inp)
            inp.value = value;
        else
            dom.innerHTML = D3Api.htmlSpecialChars(value);
    }
    this.getHtml = function(dom)
    {
        return dom.innerHTML;
    }
    this.setHtml = function(dom,value)
    {
        dom.innerHTML = value;
    }
}

/**
 * Свойство
 * get - функция получения значения свойства, если null то берется атрибут
 * set - функция установки значения свойства, если null то устанавливается атрибут
 * type - тип свойства: property, event
 * value_type - тип значения свойства: string(поумолчанию),number,boolean,list
 * value_list - массив значений, если value_type: list
 * value_default - значение по умолчанию
 */
D3Api.ControlBaseProperties = function(controlAPI)
{
    this._API_ = controlAPI || D3Api.BaseCtrl;
    this.name = {get: D3Api.BaseCtrl.getName, set: D3Api.BaseCtrl.setName, type: 'string'};
    this.value = {get: D3Api.BaseCtrl.getValue, set: D3Api.BaseCtrl.setValue, type: 'string'};
    this.caption = {get: D3Api.BaseCtrl.getCaption, set: D3Api.BaseCtrl.setCaption, type: 'string'};
    this.width = {get: D3Api.BaseCtrl.getWidth, set: D3Api.BaseCtrl.setWidth, type: 'string'};
    this.height = {get: D3Api.BaseCtrl.getHeight, set: D3Api.BaseCtrl.setHeight, type: 'string'};
    this.real_width = {get: D3Api.BaseCtrl.getRealWidth, type: 'number'};
    this.real_height = {get: D3Api.BaseCtrl.getRealHeight, type: 'number'};
    this.enabled = {get: D3Api.BaseCtrl.getEnabled, set: D3Api.BaseCtrl.setEnabled, type: 'boolean'};
    this.visible = {get: D3Api.BaseCtrl.getVisible, set: D3Api.BaseCtrl.setVisible, type: 'boolean'};
    this.hint = {get: D3Api.BaseCtrl.getHint, set: D3Api.BaseCtrl.setHint, type: 'string'};
    this.focus = {set: D3Api.BaseCtrl.setFocus, type: 'boolean'};
    this.warning = {set: D3Api.BaseCtrl.setWarning, get: D3Api.BaseCtrl.getWarning, type: 'boolean'};
    this.error = {set: D3Api.BaseCtrl.setError, get: D3Api.BaseCtrl.getError, type: 'boolean'};
    this.html = {get: D3Api.BaseCtrl.getHtml, set: D3Api.BaseCtrl.setHtml, type: 'string'};
    this.input = {get: D3Api.BaseCtrl.getInput, type: 'dom'};
}


D3Api.controlsApi['Base'] = new D3Api.ControlBaseProperties();
D3Api.ButtonCtrl = new function()
{
    this.init = function(dom)
    {
        this.init_focus(dom);
    }
    this.setCaption = function Button_setCaption(_dom,_value)
    {
        var c = _dom.querySelector('.btn_caption');

        if (c)
        {
            c.innerHTML = _value;
            return true;
        }
        return false;
    }

    this.getCaption = function Button_getCaption(_dom)
    {
        var c = _dom.querySelector('.btn_caption');
        if (c)
            return c.innerHTML;
        return '';
    }
    this.CtrlKeyDown = function(dom, e)
    {
        switch (e.keyCode)
        {
            case 32: //Пробел
            case 13: //Enter
                dom.click();
                D3Api.stopEvent(e);
                break;
        }
    }
    /* Функция прорисовки popupmenu, координаты контрола берутся
     * из dom с помощью функции getBoundingClientRect  */
    this.showPopupMenu = function(anyDom,menuName)
    {
        var ctrl = D3Api.getControlByDom(anyDom);
        var menu = ctrl.D3Form.getControl(menuName);
        if (menu)
        {
            var coords = {
                left: ctrl.getBoundingClientRect().left +6,
                top:  ctrl.getBoundingClientRect().bottom + 6
            };
            menu.D3Store.popupObject = ctrl || menu.D3Store.popupObject;
            D3Api.PopupMenuCtrl.show(menu,coords);
        }
    }
}

D3Api.controlsApi['Button'] = new D3Api.ControlBaseProperties(D3Api.ButtonCtrl);
D3Api.controlsApi['Button']['caption']={get:D3Api.ButtonCtrl.getCaption,set:D3Api.ButtonCtrl.setCaption};
D3Api.controlsApi['Button']['height'] = undefined;
D3Api.CheckBoxCtrl = new function CheckBoxCtrl()
{
    this.init = function(_dom)
    {
        var inp = D3Api.CheckBoxCtrl.getInput(_dom);
        D3Api.addEvent(inp, 'change', function(event){
            D3Api.setControlPropertyByDom(_dom,'value',D3Api.CheckBoxCtrl.getValue(_dom),undefined,true);
            D3Api.stopEvent(event);
        }, true);
        this.init_focus(inp);
        D3Api.BaseCtrl.initEvent(_dom,'onchange','value');
        _dom.D3Base.addEvent('onchange_property',function(property,value){
           if(property == 'value')
               _dom.D3Base.callEvent('onchange',value);
               //D3Api.execDomEvent(_dom,'onchange');
        });
    }
    this.getInput = function CheckBox_getInput(_dom)
    {
        return D3Api.getChildTag(_dom,'input',0);
    }
    this.setEnabled = function CheckBox_setEnabled(_dom, _value)
    {
        var input = D3Api.CheckBoxCtrl.getInput(_dom);
        //делаем активным
        if (D3Api.getBoolean(_value))
        {
            input.removeAttribute('disabled');
        }//делаем неактивным
        else
        {
            input.setAttribute('disabled','disabled');
        }
        D3Api.BaseCtrl.setEnabled(_dom, _value);
    }
    this.getValue = function CheckBox_getValue(_dom, _value)
    {
        var input = D3Api.CheckBoxCtrl.getInput(_dom);

        var val = (input.checked)?D3Api.getProperty(_dom,'valuechecked',true):D3Api.getProperty(_dom,'valueunchecked',false);
        //Такая строка при проверке всегда дает true
        if(val === '0')
            val = 0;
        else if(val === 'false')
            val = false;

        return val;
    }
    this.setValue = function CheckBox_setValue(_dom, _value)
    {
        var input = D3Api.CheckBoxCtrl.getInput(_dom);

        if (_value == D3Api.getProperty(_dom,'valuechecked',true))
        {
                input.checked = true;
        }
        if (_value == D3Api.getProperty(_dom,'valueunchecked',false))
        {
                input.checked = false;
        }
    }
    this.getValueChecked = function CheckBox_getValueChecked(_dom)
    {
        return D3Api.getProperty(_dom,'valuechecked',true);
    }
    this.setValueChecked = function CheckBox_setValueChecked(_dom,_value)
    {
        D3Api.setProperty(_dom,'valuechecked',_value);
    }
    this.getValueUnChecked = function CheckBox_getValueUnChecked(_dom)
    {
        return D3Api.getProperty(_dom,'valueunchecked',true);
    }
    this.setValueUnChecked = function CheckBox_setValueUnChecked(_dom,_value)
    {
        D3Api.setProperty(_dom,'valueunchecked',_value);
    }
    this.getCaption = function CheckBox_getCaption(_dom)
    {
        var cc = D3Api.getChildTag(_dom,'span',0);
        return cc.innerHTML;
    }
    this.setCaption = function CheckBox_setCaption(_dom, _value)
    {
        var cc = D3Api.getChildTag(_dom,'span',0);
        cc.innerHTML = _value;
    }
    this.getChecked = function CheckBox_getChecked(_dom)
    {
        var input = D3Api.getChildTag(_dom,'input',0);
        return input.checked;
    }
    this.setChecked = function CheckBox_setChecked(_dom, _value)
    {
        var input = D3Api.getChildTag(_dom,'input',0);
        input.checked = _value;
    }
}
D3Api.controlsApi['CheckBox'] = new D3Api.ControlBaseProperties(D3Api.CheckBoxCtrl);
D3Api.controlsApi['CheckBox']['value']={get:D3Api.CheckBoxCtrl.getValue,set: D3Api.CheckBoxCtrl.setValue};
D3Api.controlsApi['CheckBox']['valuechecked']={get:D3Api.CheckBoxCtrl.getValueChecked,set: D3Api.CheckBoxCtrl.setValueChecked};
D3Api.controlsApi['CheckBox']['valueunchecked']={get:D3Api.CheckBoxCtrl.getValueUnChecked,set: D3Api.CheckBoxCtrl.setValueUnChecked};
D3Api.controlsApi['CheckBox']['caption']={get:D3Api.CheckBoxCtrl.getCaption,set:D3Api.CheckBoxCtrl.setCaption}
D3Api.controlsApi['CheckBox']['enabled'].set = D3Api.CheckBoxCtrl.setEnabled;
D3Api.controlsApi['CheckBox']['input']={get: D3Api.CheckBoxCtrl.getInput, type: 'dom'};
D3Api.controlsApi['CheckBox']['checked']={set:D3Api.CheckBoxCtrl.setChecked,get: D3Api.CheckBoxCtrl.getChecked};
D3Api.ComboBoxCtrl = new function ()
{
    this.init = function(_dom)
    {
        var inp = D3Api.ComboBoxCtrl.getInput(_dom);
        this.init_focus(inp);
        D3Api.addEvent(inp, 'change', function(event){
            D3Api.stopEvent(event);
        }, true);
        _dom.D3Base.addEvent('onchange_property',function(property,value,oldValue){
           if(property == 'value' || (_dom.D3Store.anychange && D3Api.getProperty(_dom,'anyvalue','false') != 'false' && property == 'caption'))
               //D3Api.execDomEvent(_dom,'onchange');
               _dom.D3Base.callEvent('onchange',value,oldValue);
        });
        _dom.D3Store.anychange = D3Api.getProperty(_dom,'anychange','false') == 'true';
        _dom.D3Store.multiselect = D3Api.getProperty(_dom,'multiselect','false') == 'true';
        _dom.D3Store.notRootNode = [];//несвязанные элементы у которых нет родителского элемента(для иерархического отображение.)
        D3Api.BaseCtrl.initEvent(_dom,'onchange','value,oldValue');
        D3Api.BaseCtrl.initEvent(_dom,'onshowlist','list');
        D3Api.ComboBoxCtrl.create(_dom);
        var dl = D3Api.getDomByAttr(_dom, 'cont', 'cmbbdroplist');
        dl._parentDOM_ = dl.parentNode;
        var itemsR = D3Api.getProperty(_dom, 'items_repeatername');
        if(itemsR)
        {
            _dom.D3Form.getRepeater(itemsR).addEvent('onbefore_repeat',function(container){
                if(D3Api.isChildOf(_dom, container))
                    D3Api.ComboItemCtrl.onRefresh(_dom);
            });
            _dom.D3Form.getRepeater(itemsR).addEvent('onafter_repeat',function(container){
                if(D3Api.isChildOf(_dom, container))
                    D3Api.ComboItemCtrl.afterRefresh(_dom);
            });
        }
        D3Api.ComboBoxCtrl.prepareInputMode(_dom);
    }
    this.getInput = function ComboBoxCtrl_getInput(_dom)
    {
        return D3Api.getChildTag(_dom,'input',0);
    }
    this.create = function ComboBoxCtrl_create(_dom)
    {
        _dom.options = null;
        _dom._droplistDom = null;
        _dom.dynItems = D3Api.hasProperty(_dom, 'dynitems');
        D3Api.ComboBoxCtrl.setOptions(_dom);
        D3Api.ComboBoxCtrl.refreshEmptyItem(_dom);
        var input = D3Api.ComboBoxCtrl.getInput(_dom);
        input._combo_box = _dom;

        var item = D3Api.ComboBoxCtrl.getItemDataset(_dom);

	if (item != null)
            return;

	item = D3Api.ComboBoxCtrl.getItemStaticSelected(_dom);

	if (item == null)
            return;

	D3Api.ComboBoxCtrl.setItemSelected(_dom,item.option);
    }
    this.postClone = function ComboBoxCtrl_postClone(_dom)
    {
        D3Api.ComboBoxCtrl.setOptions();

        var item = D3Api.ComboBoxCtrl.getItemByValue(_dom, D3Api.ComboBoxCtrl.getValue(_dom));

        if (item == null)
                return;

        D3Api.ComboBoxCtrl.refreshEmptyItem(_dom);

        D3Api.ComboBoxCtrl.setItemSelected(_dom,item.option);
    }
    this.setOptions = function ComboBoxCtrl_setOptions(_dom)
    {
        if (!_dom.options || _dom.options.length == 0)
        {
            var drop_list = D3Api.ComboBoxCtrl.getDropList(_dom);
            var child = drop_list.children;
            for (var i=0, child; item_container = child[i]; i++) {
                if(item_container.nodeType === 1){
                    _dom.optionsCont = item_container;
                    _dom.options = item_container.rows;
                    break;
                }
            }

        }
    }
    this.getDropList = function ComboBoxCtrl_getDropList(_dom)
    {
        if (_dom._droplistDom)
        {
            return _dom._droplistDom;
        }
        var dl = D3Api.getDomByAttr(_dom, 'cont', 'cmbbdroplist');

        _dom._droplistDom = dl;//D3Api.getChildTag(dl, 'div', 0);
        _dom._dropListCont = _dom._droplistDom.parentNode;
        _dom._droplistDom._ComboBoxDom = _dom;
        return _dom._droplistDom;
    }
    this.getItemStaticSelected = function ComboBoxCtrl_getItemStaticSelected(_dom)
    {
        var first_item = null;
        for (var i = 0, co = _dom.options.length; i < co; i++)
        {
            var item = _dom.options[i];

            if (i == 0 && !D3Api.hasProperty(item,'clone') && D3Api.getProperty(_dom,'anyvalue','false'))
                    first_item = returnItem(item);

            if (D3Api.hasProperty(item,'selected'))
                    return returnItem(item);
        }
        return _dom.D3Store.multiselect?null:first_item;
    }
    this.getItemSelected = function ComboBoxCtrl_getItemStaticSelected(_dom)
    {
        if(_dom.selected_item)
            return _dom.selected_item.parentNode?returnItem(_dom.selected_item):D3Api.ComboBoxCtrl.getItemByIndex(_dom,0);
        else
            return null;
    }
    this.getItemDataset = function ComboBoxCtrl_getItemDataset(_dom)
    {
        for (var i = 0, co = _dom.options.length; i < co; i++)
        {
            var item = _dom.options[i];
            if (D3Api.hasProperty(item,'onafterrefresh'))
                    return returnItem(item);
        }
        return null;
    }
    this.getItemByIndex = function ComboBoxCtrl_getItemByIndex(_dom, index)
    {
        var item = _dom.options[index];
        if (item == null || D3Api.hasProperty(item,'isD3Repeater'))
            return null;

        return returnItem(item);
    }
    this.getItemIndex = function ComboBoxCrtl_getItemIndex(_dom, option)
    {
        if (option)
        {
            return option.rowIndex;
        }
        return null;
    }
    this.getItemByValue = function ComboBoxCtrl_getItemByValue(_dom, _value)
    {
        for (var i = 0, co = _dom.options.length; i < co; i++)
        {
            var item = _dom.options[i];
            if (!D3Api.hasProperty(item,'isD3Repeater') && ''+D3Api.ComboItemCtrl.getValue(item) == ''+_value)
                    return returnItem(item);
        }
        return null;
    }
    this.getItemByCaption = function ComboBoxCtrl_getItemByCaption(_dom, _caption)
    {
        for (var i = 0, co = _dom.options.length; i < co; i++)
        {
            var item = _dom.options[i];
            if (!D3Api.hasProperty(item,'isD3Repeater') && ''+D3Api.ComboItemCtrl.getCaption(item) == ''+_caption)
                return returnItem(item);
        }
        return null;
    }
    var returnItem = function(item)
    {
        return {option: item, value: D3Api.ComboItemCtrl.getValue(item), caption: D3Api.ComboItemCtrl.getCaption(item)};
    }
    this.refreshEmptyItem = function ComboBoxCtrl_refreshEmptyItem(_dom)
    {
        for (var i = 0, co = _dom.options.length; i < co; i++)
        {
            var item = _dom.options[i];
            item.isEmptyItem = false;
            var cnt = D3Api.getChildTag(item,'span',1);
            if (cnt.innerHTML == "")
            {
                cnt.innerHTML = "&nbsp;";
                item.isEmptyItem = true;
            }
        }
    }
    this.setItemSelected = function ComboBoxCtrl_setItemSelected(_dom,option)
    {
            if (option && D3Api.hasProperty(option,'isD3Repeater'))
            {
                option = undefined;
            }
            var old_caption = D3Api.ComboItemCtrl.getCaption(_dom["selected_item"]);
            _dom.setAttribute('keyvalue', (option)?D3Api.ComboItemCtrl.getValue(option):'');

            if(!_dom.D3Store.multiselect){
                if (_dom["selected_item"])
                    D3Api.removeClass(_dom.selected_item, "combo-item-selected");

                if (option)
                    D3Api.addClass(option, "combo-item-selected");
            }
            _dom.selected_item = option;

            _dom.selectedIndex = (option)?option.rowIndex:-1;

            var new_caption = D3Api.ComboBoxCtrl.getCaption(_dom);
            new_caption = (option)?D3Api.ComboItemCtrl.getCaption(option):((old_caption == new_caption)?'':new_caption);
            var _input = D3Api.ComboBoxCtrl.getInput(_dom);
            _input.value = new_caption;
            _dom.D3Base.callEvent('onchange_property','caption',new_caption,old_caption);
    }
    this.onChangeCall = function ComboBoxCtrl_onChangeCall(_dom)
    {
        //_dom.D3Base.callEvent('onchange_property','value',D3Api.ComboBoxCtrl.getValue(_dom));
        //D3Api.execDomEvent(_dom,'onchange');
    }
    this._addNewItem = function(_dom,value,caption)
    {
        if(D3Api.getProperty(_dom,'additem','false') == 'false')
            return false;

        _dom.addItemValue = value || _dom.addItemValue;
        _dom.addItemCaption = caption || _dom.addItemCaption;
        if(!D3Api.isUndefined(_dom.addItemValue) && !D3Api.isUndefined(_dom.addItemCaption))
        {
            D3Api.ComboBoxCtrl.addItem(_dom,_dom.addItemCaption,_dom.addItemValue,true);
            D3Api.ComboBoxCtrl.setValue(_dom,_dom.addItemValue);
            D3Api.ComboBoxCtrl.setCaption(_dom,_dom.addItemCaption);
            _dom.addItemValue = undefined;
            _dom.addItemCaption = undefined;
            return true;
        }
        return false;
    }
    this.getValue = function ComboBoxCtrl_getValue(_dom)
    {
        var _value = null;

        if (_dom.storedValue != undefined)
            return _dom.storedValue;
        _value = D3Api.getProperty(_dom, 'keyvalue', '');

        return D3Api.isUndefined(_value)?'':_value;
    }
    this.setValue = function ComboBoxCtrl_setValue(_dom,_value,res)
    {
        if(_dom.D3Store.multiselect)
        {
            return D3Api.ComboBoxCtrl.setMultiValue(_dom,_value,res);
        }

        if (_value == undefined)
        {
            if (D3Api.getProperty(_dom,'anyvalue','false')=='false')
                return false;

            D3Api.ComboBoxCtrl.setItemSelected(_dom, undefined);
            return true;
        }

        var item = D3Api.ComboBoxCtrl.getItemByValue(_dom,_value);

        if (item == null)
        {
            if(!_dom.dynItems)
            {
                if(D3Api.ComboBoxCtrl._addNewItem(_dom,_value))
                    return true;
            }
            _dom.storedValue = (_dom.dynItems)?_value:undefined;

            item = D3Api.ComboBoxCtrl.getItemByIndex(_dom,0);
            if (item == null)
            {
                if(D3Api.getProperty(_dom,'anyvalue','false') == 'false')
                    return false;
                else
                    item = {option: undefined};
            }
            D3Api.ComboBoxCtrl.setItemSelected(_dom,item.option);

            res.value = (_dom.dynItems)?_value:D3Api.getProperty(_dom,'keyvalue');
            return true;
        }

        D3Api.ComboBoxCtrl.setItemSelected(_dom, item.option);
        return true;
    }
    this.setMultiValue = function ComboBoxCtrl_setMultiValue(_dom,_value,res)
    {
        //Очищаем если это система
        if(!D3Api.isUserEvent())
        {
            for(var i = 0; i < _dom.options.length; i++)
            {
                if(D3Api.hasProperty(_dom.options[i],'isd3repeater'))
                    continue;
                D3Api.ComboItemCtrl.stateItem(_dom.options[i],false);
            }
        }
        if (_value == undefined)
        {
            return true;
        }
        _value = ''+_value;
        if(_dom.dynItems)
        {
            _dom.storedValue = _value;
            return true;
        }
        var tmpval = _value.split(';');
        var exval = [];
        var tmpcp = [];
        var all = true;
        for(var i = 0; i < _dom.options.length; i++)
        {
            if(D3Api.hasProperty(_dom.options[i],'isD3Repeater'))
                continue;
            var vl = D3Api.ComboItemCtrl.getValue(_dom.options[i]);
            if(tmpval.indexOf(vl) != -1)
            {
                var cp = D3Api.ComboItemCtrl.getCaption(_dom.options[i]);
                D3Api.ComboItemCtrl.stateItem(_dom.options[i],true);
                tmpcp.push(cp);
                exval.push(vl);
            }else
                all = false;
        }

        setAllChecked(_dom,all);
        res.value = exval.join(';');
        _dom.setAttribute('keyvalue', res.value);

        var _input = D3Api.ComboBoxCtrl.getInput(_dom);
        _input.value = tmpcp.join(';');
    }
    function setAllChecked(_dom, state)
    {
        var inp = D3Api.getChildTag(_dom.options[0],'input',0);
        inp.checked = state;
    }
    this.setStateAll = function(_dom,state)
    {
        if(state)
        {
            var vals = [];
            for(var i = 0; i < _dom.options.length; i++)
            {
                if(D3Api.hasProperty(_dom.options[i],'isD3Repeater'))
                    continue;
                vals.push(D3Api.ComboItemCtrl.getValue(_dom.options[i]));
            }
            D3Api.setControlPropertyByDom(_dom,'value',vals.join(';'));
        }else
        {
            D3Api.setControlPropertyByDom(_dom,'value','');
        }
    }
    this.getCaption = function ComboBoxCtrl_getCaption(_dom)
    {
        var inp = D3Api.ComboBoxCtrl.getInput(_dom);
        return D3Api.isUndefined(inp.value)?'':inp.value;
    }
    this.setCaption = function ComboBoxCtrl_setCaption(_dom,_value)
    {
            //Проверить есть ли такое значение
            var c = _dom.options.length;
            var haveOpt = null;
            for(var o = 0; o < c; o++)
            {
                if (D3Api.ComboItemCtrl.getCaption(_dom.options[o]) == _value)
                {
                    haveOpt = _dom.options[o];
                    break;
                }
            }
            if (!haveOpt)
            {
                if(D3Api.ComboBoxCtrl._addNewItem(_dom,undefined,_value))
                    return true;

                D3Api.setControlPropertyByDom(_dom,'value',undefined);

                var _input = D3Api.ComboBoxCtrl.getInput(_dom);
                _input.value = D3Api.isUndefined(_value)?'':_value;
            }else
                D3Api.setControlPropertyByDom(_dom,'value',D3Api.ComboItemCtrl.getValue(haveOpt));
            return true;
    }
    this.setEnabled = function ComboBoxCtrl_setEnabled(_dom, _value)
    {
        var input = D3Api.ComboBoxCtrl.getInput(_dom);
        //делаем активным
        if (_value)
        {
            input.removeAttribute('disabled');
        }//делаем неактивным
        else
        {
            input.setAttribute('disabled','disabled');
        }
        D3Api.BaseCtrl.setEnabled(_dom,_value);
    }
    this.getReadonly = function ComboBoxCtrl_getReadonly(_dom)
    {
        return D3Api.hasProperty(D3Api.ComboBoxCtrl.getInput(_dom),'readonly');
    }
    this.setReadonly = function ComboBoxCtrl_setReadonly(_dom,_value)
    {
        if (_value)
        {
            D3Api.ComboBoxCtrl.getInput(_dom).setAttribute('readonly','readonly');
        }else
        {
            D3Api.ComboBoxCtrl.getInput(_dom).removeAttribute('readonly','readonly');
        }
    }
    this.getSelectedItem = function(dom)
    {
        return dom.selected_item;
    }
    this.getDataSelectedItem = function(dom)
    {
        if(!dom.selected_item || !dom.selected_item.clone)
            return {};

        return dom.selected_item.clone.data;
    };
    this.removeItemByItValue = function(_dom,_value){
        var val = D3Api.getControlPropertyByDom(_dom,'value');
        var rows = _dom.optionsCont.rows;
        for(var i = rows.length - 1 ; 0 < i ; i--){
            var value = D3Api.getControlPropertyByDom(rows[i],'value');
            if(value == _value){
                _dom.optionsCont.deleteRow(i);
            }
        }
        if(val == _value){
            var item = D3Api.ComboBoxCtrl.getItemByIndex(_dom,0);
            if(item){
                D3Api.ComboBoxCtrl.setItemSelected(_dom,item.option);
                D3Api.ComboBoxCtrl.setOptions(_dom);
            }
        }
    }
    this.addItem = function ComboBoxCtrl_addItem(_dom,caption,value,begin)
    {
        var r = _dom.optionsCont.insertRow(begin?0:-1);
        var name = D3Api.getProperty(_dom,'name');
        D3Api.setProperty(r, 'cmptype', 'ComboItem');
        var c = r.insertCell(0);
        D3Api.addDom(c,D3Api.createDom('<div><span class="btnOC" comboboxname="'+name+'"></span><span cont="itemcaption"></span></div>'));
        D3Api.ComboItemCtrl.setCaption(r,caption);
        D3Api.ComboItemCtrl.setValue(r,(value != undefined)?value:caption);

        D3Api.ComboBoxCtrl.setOptions(_dom);
    }
    this.clearItems = function ComboBoxCtrl_clearItems(_dom)
    {
        while(_dom.options.length)
            _dom.optionsCont.deleteRow(0);

        D3Api.ComboBoxCtrl.setCaption(_dom,'',true);
        _dom.setAttribute('keyvalue','');
        _dom.selected_item = null;
    }
    this.markedItemSelected = function ComboBoxCtrl_markedItemSelected(_dom,option)
    {
        if (_dom["selected_item"])
            D3Api.removeClass(_dom.selected_item, "combo-item-selected");

        D3Api.addClass(option, "combo-item-selected");
        _dom.selected_item = option;
    }
    this.keyUpInput = function ComboBoxCtrl_KeyUpInput(combo_box)
    {
            var event = D3Api.getEvent();

            if (!combo_box.options || D3Api.ComboBoxCtrl.getReadonly(combo_box))
            {
                    return;
            }

            //37 left
            //38 top
            //39 right
            //40 down
            //115 F4
            //13 enter
            //9 tab
            // 17 control
            switch (event.keyCode)
            {
                    case 37:
                    case 38:
                    case 39:
                    case 40:
                    case 115:
                    case 13:
                    case 9:
                    case 27:
                    case 17:
                        break;
                    default:
                            D3Api.ComboBoxCtrl.refreshInputModeValue(combo_box,D3Api.ComboBoxCtrl.getInput(combo_box));
                        break;
            }
    }
    this.keyDownInput = function ComboBoxCtrl_keyDownInput(combo_box)
    {
        var delta = 0;
        var event = D3Api.getEvent();

        if (!combo_box.options || D3Api.ComboBoxCtrl.getReadonly(combo_box))
        {
            return;
        }
        var drop_list = D3Api.ComboBoxCtrl.getDropList(combo_box);
        //38 up
        //40 down
        //115 F4
        //13 enter
        //9 tab
        switch (event.keyCode)
        {
                case 38:
                                delta = -1;
                        break;
                case 40:
                                delta = 1;
                        break;
                case 115:
                                if (drop_list.style.display != 'block')
                                {
                                    var _input = D3Api.ComboBoxCtrl.getInput(combo_box);
                                    D3Api.ComboBoxCtrl.downClick(combo_box);
                                }else{
                                    D3Api.ComboBoxCtrl.hideDropList(drop_list);
                                    D3Api.removeEvent(document, 'click', drop_list.functionHook, true);
                                    D3Api.removeEvent(document, 'scroll', drop_list.functionHook, true);
                                    D3Api.stopEvent(event);
                                }
                                return;
                        break;
                case 13:
                                var selectRow = function() {
                                    var option = combo_box.options[combo_box["selected_item"].rowIndex];

                                    if (option) {
                                        var _input = D3Api.ComboBoxCtrl.getInput(combo_box);
                                        _input.value = D3Api.ComboItemCtrl.getCaption(option);
                                    } else {
                                        D3Api.setControlPropertyByDom(combo_box,'value',undefined);
                                    }
                                }
                                if(!(D3Api.getProperty(combo_box,'multiselect') == 'true')){
                                    D3Api.setControlPropertyByDom(combo_box, 'value', D3Api.ComboItemCtrl.getValue(combo_box["selected_item"]),undefined,true);
                                }else {
                                    if (combo_box["selected_item"] && combo_box.selectedIndex != combo_box["selected_item"].rowIndex)
                                    {

                                        if(D3Api.hasProperty(combo_box["selected_item"],'isD3Repeater'))
                                        {
                                            var ch = D3Api.getChildTag(combo_box["selected_item"],'input',0);
                                            if(!ch.checked || ch.checked == 0){
                                                ch.checked = 1
                                            }else{
                                                ch.checked = 0
                                            }
                                            D3Api.ComboBoxCtrl.setStateAll(D3Api.getControlByDom(ch,'ComboBox'),ch.checked);
                                        } else {
                                            var domch = D3Api.getDomByAttr(combo_box["selected_item"],'cont','multicheck');
                                            D3Api.CheckBoxCtrl.setValue(domch,!D3Api.CheckBoxCtrl.getValue(domch));
                                            D3Api.ComboItemCtrl.checkItem(combo_box["selected_item"]);
                                        }
                                        if(event.ctrlKey)
                                            return false;
                                    }
                                }
                                if (drop_list.style.display == 'block')
                                {
                                    selectRow();
                                    D3Api.ComboBoxCtrl.hideDropList(drop_list);
                                    D3Api.removeEvent(document, 'click', drop_list.functionHook, true);
                                    D3Api.removeEvent(document, 'scroll', drop_list.functionHook, true);
                                    D3Api.stopEvent(event);
                                } else if (combo_box.getAttribute('droplist') == 'onenter') {
                                    // Счетчик количества элементов выпадающего списка,
                                    // подходящих под введенное в ComboBox значение
                                    var result = 0;
                                    // Первый элемент выпадающего списка
                                    var first_option = false;

                                    for (var i = 0; i < combo_box.options.length; i++) {
                                        if (combo_box.options[i].style.display != 'none') {
                                            first_option = first_option || combo_box.options[i];
                                            result++;
                                            // Если в выпадающем списке больше одного элемента, прерываем цикл
                                            if (result == 2) break;
                                        }
                                    }
                                    // Если в выпадающем списке один элемент,
                                    // проставляем value без открытия списка
                                    if (result == 1) {
                                        selectRow();
                                        D3Api.ComboBoxCtrl.setItemSelected(combo_box, first_option);
                                    } else {
                                        D3Api.ComboBoxCtrl.markedItemSelected(combo_box, first_option);
                                        D3Api.ComboBoxCtrl.dropListSetSizePos(D3Api.ComboBoxCtrl.getDropList(combo_box));
                                    }
                                }
                                return;
                        break;
                case 27:
                case 9:
                                if (drop_list.style.display == 'block')
                                {
                                        D3Api.ComboBoxCtrl.hideDropList(drop_list);
                                        D3Api.removeEvent(document, 'click', drop_list.functionHook, true);
                                        D3Api.removeEvent(document, 'scroll', drop_list.functionHook, true);
                                } else if (combo_box.getAttribute('droplist') == 'onenter') {
                                    D3Api.ComboBoxCtrl.setValue(combo_box, D3Api.ComboBoxCtrl.getValue(combo_box));
                                    return;
                                }
                        break;
                default:
                        return;
        }
        var new_index = -1;
        if(combo_box["selected_item"]){
            new_index = combo_box["selected_item"].rowIndex;
        }
        new_index += delta;
        while(new_index >= 0 && combo_box.options[new_index] && combo_box.options[new_index].style.display == 'none')
            new_index = new_index + delta;

        if (new_index < 0 || new_index > combo_box.options.length-1)
                return;

        var option = combo_box.options[new_index];
        if (!option || (D3Api.hasProperty(option,'isD3Repeater') && D3Api.getProperty(option,'cmptype') != 'ComboItem'))
                return;

        if (drop_list.style.display == 'none')
        {
            var _input = D3Api.ComboBoxCtrl.getInput(combo_box);
            _input.value = D3Api.ComboItemCtrl.getCaption(option);
            if (combo_box["selected_item"] && combo_box.selectedIndex != combo_box["selected_item"].rowIndex)
            {
                    D3Api.setControlPropertyByDom(combo_box, 'value', D3Api.ComboItemCtrl.getValue(combo_box["selected_item"]),undefined,true);
            }
        }

        D3Api.ComboBoxCtrl.markedItemSelected(combo_box,option);
        drop_list.scrollTop = Math.ceil( option.offsetTop - drop_list.offsetHeight/2 );
    }
    this.refreshInputModeValue = function ComboBoxCtrl_refreshInputModeValue(_dom,input)
    {
        if(!input)
            input = D3Api.ComboBoxCtrl.getInput(_dom);

        if (_dom.modeValues['old_value'] != input.value || input.value=='')
        {
            switch(_dom.mode)
            {
                //Скрываем записи, которые не подходят по фильтру
                case 'filter':
                    try {
                        var s = input.value;
                        //Если сначала палка то это регулярное выражение не надо экранировать
                        if (s[0] != '|')
                        {
                            //Заменяем

                            s = s.replace(/([\\\*\+\?\.\$\{\}\[\]\(\)])/g, '\\$1');
                            s = s.replace(/%/g,'.*?');
                            s = s.replace(/_/g,'.');
                            //s= '^'+s;
                        }else
                            s = s.substr(1);
                        var re = new RegExp(s,(_dom.modeValues['case'] == 'false')?'i':'');
                    }catch(e)
                    {
                        var re = new String(input.value);
                    }
                    var first_option = false;
                    for (var i = 0; i < _dom.options.length; i++) {
                        if(D3Api.ComboItemCtrl.getCaption(_dom.options[i]).search(re) != -1 && !D3Api.hasProperty(_dom.options[i],'isD3Repeater')) {
                            for(var current_item = _dom.options[i],j = 0;current_item;current_item = current_item.D3Store.ComboItemParent,j++){
                                if(current_item.classList.contains('hide')){
                                    current_item.classList.remove('hide');
                                }
                                if(current_item.classList.contains('closed')){
                                    if(j > 0){
                                        current_item.classList.remove('closed');
                                        current_item.classList.add('opened');
                                    }
                                }
                                current_item.style.display = '';
                                if(!('ComboItemParent' in current_item.D3Store) || !current_item.D3Store.ComboItemParent){
                                    break;
                                }
                            }
                            if (!first_option) {
                                first_option = _dom.options[i];
                            }
                        } else {
                            _dom.options[i].style.display = 'none';
                        }

                    }
                    var onenter = _dom.getAttribute('droplist') == 'onenter';
                    var droplist = D3Api.ComboBoxCtrl.getDropList(_dom);
                    if (!onenter || droplist.style.display == 'block') {
                        D3Api.ComboBoxCtrl.markedItemSelected(_dom,first_option);
                        D3Api.ComboBoxCtrl.dropListSetSizePos(droplist);
                    }
                    break;
            }
            _dom.modeValues['old_value'] = input.value;
        }
    }
    this.dropListSetSizePos = function ComboBoxCtrl_dropListSetSizePos(drop_list)
    {
        D3Api.ComboBoxCtrl.hideDropList(drop_list,true);
        D3Api.removeEvent(document, 'click', drop_list.functionHook, true);
        D3Api.removeEvent(document, 'scroll', drop_list.functionHook, true);
        function setSizePosDropList(_drop_list){
            var sX = D3Api.getBodyScrollLeft();
            var sY = D3Api.getBodyScrollTop();

            var page = D3Api.getPageWindowSize();

            var cbWidth = (_drop_list._ComboBoxDom.offsetWidth-2) + "px";
            _drop_list.style["minWidth"] = cbWidth;
            _drop_list.style["width"] = D3Api.getBoolean(D3Api.getProperty(_drop_list._ComboBoxDom,'fixwidth','false'))?cbWidth:'auto';

            var cb_rect = D3Api.getAbsoluteClientRect(_drop_list._ComboBoxDom);

            drop_list.style.height = "";

            D3Api.ComboBoxCtrl.showDropList(_drop_list,true);
            _drop_list._ComboBoxDom.D3Base.callEvent('onshowlist',_drop_list);

            var drop_rect = D3Api.getAbsoluteClientRect(_drop_list);
            drop_rect.x = cb_rect.x;
            drop_rect.y = cb_rect.y+cb_rect.height;

            var h = page.windowHeight+sY;
            var w = page.windowWidth+sX;

            //Растояние внизу окна
            var dH = h - drop_rect.y;
            //Растояние вверху окна
            var uH = cb_rect.y - sY;

            var mcY = drop_rect.y+drop_rect.height;
            var mcX = drop_rect.x+drop_rect.width;

            if (mcY-h > 0)
            {
                //Если выходит за нижний край
                if(dH > uH)
                    drop_rect.height = dH;
                else
                {
                    if(drop_rect.height > uH)
                        drop_rect.height = uH;
                    drop_rect.y -=drop_rect.height+cb_rect.height;
                }

            }

            if (mcX-w > 0)
                drop_rect.x -=mcX-w;

            _drop_list.style.height = drop_rect.height +'px';
            _drop_list.style.width = drop_rect.width+'px';

            _drop_list.style.left = drop_rect.x +'px';
            _drop_list.style.top = drop_rect.y+'px';
        }
        setSizePosDropList(drop_list);
        /**
         * расскрытие/скрытие элементов
         * @param _item - dom элемент
         * @param _bool - true - расскрыть, false - скрыть
         **/
        function toggleItems(_item,_bool){
            if(!D3Api.hasClass(_item,'nochilds')){
                var child_items = _item.D3Store.ComboItemChilds;
                if(_bool){
                    _item.classList.remove('closed');
                    _item.classList.add('opened');
                }else{
                    _item.classList.remove('opened');
                    _item.classList.add('closed');
                }
                for(var i = 0 ; i < child_items.length ; i++){
                    if(_bool){
                        //раскрыть дочерние
                        child_items[i].classList.remove('hide');
                    }else {
                        child_items[i].classList.add('hide');
                        toggleItems(child_items[i],_bool);
                        //скрыть все дочерние
                    }
                }
            }
        }

        drop_list.functionHook = function(event) {
            if(event.type == 'scroll' && event.target === drop_list){
                return;
            }
            if(D3Api.hasClass(event.target,'btnOC')){
                //было нажато на кнопку раскрытие дочерних форм
                var combo_item = event.target.parentNode.parentNode.parentNode;
                var isClosed = D3Api.hasClass(combo_item,'closed');
                toggleItems(combo_item,isClosed);
                setSizePosDropList(drop_list);
            }else if(!D3Api.ComboBoxCtrl.dropListClick(event)) {
                D3Api.ComboBoxCtrl.hideDropList(drop_list);
                D3Api.removeEvent(document, 'click', drop_list.functionHook, true);
                D3Api.removeEvent(document, 'scroll', drop_list.functionHook, true);
                D3Api.stopEvent(event);
            }
        };
        D3Api.addEvent(document, 'click', drop_list.functionHook, true);
        D3Api.addEvent(document, 'scroll', drop_list.functionHook, true);
    }
    this.hideDropList = function ComboBoxCtrl_hideDropList(drop_list,only)
    {
        drop_list.style.display = 'none';
        drop_list._ComboBoxDom._dropListCont.appendChild(drop_list);
        if (!only)
            D3Api.ComboBoxCtrl.setInputModeValue(drop_list._ComboBoxDom);
    }
    this.showDropList = function ComboBoxCtrl_showDropList(drop_list,only)
    {
        document.body.appendChild(drop_list);
        drop_list.style.display = 'block';
        if (!only)
            D3Api.ComboBoxCtrl.prepareInputMode(drop_list._ComboBoxDom);
    }
    this.prepareInputMode = function ComboBoxCtrl_prepareInputMode(_dom,input)
    {
        if(!input)
            input = D3Api.ComboBoxCtrl.getInput(_dom);

        var mode = (_dom.mode)?_dom.mode:D3Api.getProperty(_dom,'mode','filter');
        _dom.mode = mode;
        _dom.modeValues = {};
        _dom.modeValues['old_value'] = input.value;
        _dom.modeValues['old_readonly'] = D3Api.getProperty(input,'readonly','false');
        _dom.modeValues['old_selectedValue'] = D3Api.ComboBoxCtrl.getValue(_dom);

        switch(mode)
        {
            //Скрываем записи, которые не подходят по фильтру
            case 'filter':
                    input.removeAttribute('readonly');
                    _dom.modeValues['case'] = D3Api.getProperty(_dom,'case','false');
                break;
            default:
                break;
        }
    }
    this.setInputModeValue = function ComboBoxCtrl_setInputModeValue(_dom,input)
    {
        for(var i = 0, co = _dom.options.length; i < co; i++)
        {
            if (!D3Api.hasProperty(_dom.options[i],'isD3Repeater'))
                _dom.options[i].style.display = '';
        }
        if(!input)
            input = D3Api.ComboBoxCtrl.getInput(_dom);
        if (_dom.modeValues['old_readonly'] != 'false')
            input.setAttribute('readonly','readonly');

        var new_value = D3Api.ComboBoxCtrl.getValue(_dom);
        var any_value = D3Api.getProperty(_dom,'anyvalue','false')!='false';
        switch(_dom.mode)
        {
            //Скрываем записи, которые не подходят по фильтру
            case 'filter':
                    //Принудительно устанавливаем значение, чтобы затереть изменения в инпуте
                    D3Api.setControlPropertyByDom(_dom,'value',(any_value && !_dom.selected_item)?undefined:((new_value == _dom.modeValues['old_selectedValue'])?_dom.modeValues['old_selectedValue']:new_value));
                break;
        }
    }
    this.downClick = function ComboBoxCtrl_downClick(_dom)
    {
        var combo_box = _dom;
        var val = D3Api.getControlPropertyByDom(combo_box,'value')
        if (!D3Api.BaseCtrl.getEnabled(combo_box) || !combo_box.options || D3Api.ComboBoxCtrl.getReadonly(combo_box))
        {
            return;
        }

        var drop_list = D3Api.ComboBoxCtrl.getDropList(combo_box);

        if (drop_list.style.display != 'block')
        {
            //отображаем только родители
            var options = combo_box.options;
            var option = null;
            for(var i = 0 ; i < options.length; i++){
                if(options[i].hasAttribute('levelhierh')){
                    var lvlhierh = +options[i].getAttribute('levelhierh');
                    if(lvlhierh > 1){
                        options[i].classList.add('hide')
                    }else{
                        options[i].classList.remove('hide')
                    }
                    if(options[i].D3Store.ComboItemChilds.length > 0){
                        options[i].classList.remove('nochilds');
                        options[i].classList.remove('opened');
                        options[i].classList.add('closed');
                    }else{
                        options[i].classList.remove('opened');
                        options[i].classList.remove('closed');
                        options[i].classList.add('nochilds');
                    }
                    if(D3Api.empty(option)){
                        var value = D3Api.getControlPropertyByDom(options[i],'value');
                        if(value == val){
                            option = options[i];
                        }
                    }
                }
            }
            //расскрываем иерархически все родителей текущего элемента.
            if(!D3Api.empty(option)){
                for(var parent = option.D3Store.ComboItemParent;parent != null;parent = parent.D3Store.ComboItemParent){
                    parent.classList.remove('hide');
                    if(parent.D3Store.ComboItemChilds.length > 0){
                        parent.classList.remove('nochilds');
                        parent.classList.remove('closed');
                        parent.classList.add('opened');
                        for(var i = 0; i < parent.D3Store.ComboItemChilds.length ; i++){
                            parent.D3Store.ComboItemChilds[i].classList.remove('hide');
                        }
                    }else{
                        parent.classList.remove('opened');
                        parent.classList.remove('closed');
                        parent.classList.add('nochilds');
                    }
                }
            }
            D3Api.ComboBoxCtrl.dropListSetSizePos(drop_list);

            D3Api.ComboBoxCtrl.showDropList(drop_list);

            var target = D3Api.getEventTarget();

            var input = D3Api.ComboBoxCtrl.getInput(combo_box);
            if (target == input && input.focus)
                input.focus();
            else if(target != input && input.blur)
                input.blur();
            D3Api.stopEvent();
        }else
        {
            D3Api.ComboBoxCtrl.hideDropList(drop_list);
        }
    }
    this.dropListClick = function ComboBoxCtrl_DropListClick(event)
    {
        event = D3Api.getEvent(event);

        var option = D3Api.getEventTarget(event);

        option = D3Api.getControlByDom(option,'ComboItem');

        //Не нашли элемент списка значит кликнули вне списка
        if (!option)
                return false;

        var drop_list = D3Api.getControlByDom(option, 'ComboBoxDL');
        var combo_box = drop_list._ComboBoxDom;

        var input = D3Api.ComboBoxCtrl.getInput(combo_box);
        if (input.focus)
                input.focus();
        if (input.blur)
                input.blur();

        if(!combo_box.D3Store.multiselect)
        {
            if (!combo_box["selected_item"] || combo_box.selectedIndex != option.rowIndex)
            {
                D3Api.setControlPropertyByDom(combo_box, 'value', D3Api.ComboItemCtrl.getValue(option),undefined,true);
            }

            D3Api.ComboBoxCtrl.hideDropList(drop_list);
        }
        input.focus();

        return combo_box.D3Store.multiselect;
    }
    this.setFocus = function(dom,value)
    {
        var drop_list = D3Api.ComboBoxCtrl.getDropList(dom);
        if(value == false && drop_list.functionHook)
        {
            drop_list.functionHook();
        }
        D3Api.BaseCtrl.setFocus(dom,value);
    }
}

D3Api.controlsApi['ComboBox'] = new D3Api.ControlBaseProperties(D3Api.ComboBoxCtrl);
D3Api.controlsApi['ComboBox']['height'] = undefined;
D3Api.controlsApi['ComboBox']['focus'].set = D3Api.ComboBoxCtrl.setFocus;
D3Api.controlsApi['ComboBox']['value']={set:D3Api.ComboBoxCtrl.setValue,get:D3Api.ComboBoxCtrl.getValue};
D3Api.controlsApi['ComboBox']['caption']={get:D3Api.ComboBoxCtrl.getCaption,set:D3Api.ComboBoxCtrl.setCaption};
D3Api.controlsApi['ComboBox']['enabled'].set = D3Api.ComboBoxCtrl.setEnabled;
D3Api.controlsApi['ComboBox']['readonly']={set:D3Api.ComboBoxCtrl.setReadonly,get:D3Api.ComboBoxCtrl.getReadonly};
D3Api.controlsApi['ComboBox']['input']={get:D3Api.ComboBoxCtrl.getInput, type: 'dom'};
D3Api.controlsApi['ComboBox']['item']={get:D3Api.ComboBoxCtrl.getSelectedItem, type: 'dom'};
D3Api.controlsApi['ComboBox']['data']={get:D3Api.ComboBoxCtrl.getDataSelectedItem, type: 'object'};

D3Api.ComboItemCtrl = new function()
{
    this.init = function(_dom){
        _dom.D3Store.ComboItemChilds = [];
        _dom.D3Store.ComboItemParent = null;
        _dom.D3Store.notRootNode = [];
        if(!D3Api.hasProperty(_dom,'isd3repeater') && D3Api.hasProperty(_dom,'isclone')
            && D3Api.hasProperty(_dom,'comboboxname') && D3Api.hasProperty(_dom,'parentfield')
            && D3Api.hasProperty(_dom,'keyfield')){
            //Иерархический комбобокс
            var drop_list = D3Api.getControlByDom(_dom, 'ComboBoxDL');
            var combo_box = drop_list._ComboBoxDom;
            var options = combo_box.options;
            var data = _dom.clone.data;
            var parentField = D3Api.getProperty(_dom,'parentfield','');
            var keyField = D3Api.getProperty(_dom,'keyfield','');
            var notRoot = true;
            var width = 10;
            _dom.classList.add('nochilds');
            if(parentField in data && !D3Api.empty(data[parentField])){
                _dom.classList.add('hide');//скрывать все не родительские элементы
                notRoot = false;
                for(var i = 0 ,len = options.length ; i < len ; i++){
                    if('clone' in options[i] && options[i] !== _dom){
                        var cdata = options[i].clone.data;
                        if(keyField in cdata && cdata[keyField] == data[parentField]){
                            if(i + 1 < len - 1){
                                options[i].parentNode.insertBefore(_dom,options[i + 1]);
                                options[i].D3Store.ComboItemChilds.push(_dom);
                                _dom.D3Store.ComboItemParent = options[i];
                                options[i].classList.add('closed');
                                options[i].classList.remove('nochilds');
                                if(D3Api.hasProperty(options[i],'levelHierh')){
                                    var level = (+D3Api.getProperty(options[i],'levelHierh')) + 1;
                                    D3Api.setProperty(_dom,'levelHierh',level);
                                    var sp = _dom.querySelector('.item_block');
                                    sp.style.marginLeft = (width*level)+'px';
                                }
                            }
                            notRoot = true;
                            break;
                        }
                    }
                }
                if(!notRoot){
                    /**
                     * родительский элемент не найдет,
                     * делаем запись не видимым и добавляем его в список для поиска его родителя, до тех пока пока не придет его родитель
                     */
                    var addNotRoot = true;
                    if(combo_box.D3Store.notRootNode.length > 0){
                        //в случае если есть в списке дочерние элементы;
                        for(var i = combo_box.D3Store.notRootNode.length - 1 ; 0 <= i ; i--){
                            if('clone' in combo_box.D3Store.notRootNode[i]){
                                if(combo_box.D3Store.notRootNode[i].clone.data[parentField] == data[keyField]){
                                    _dom.D3Store.notRootNode.push(combo_box.D3Store.notRootNode[i]);
                                    _dom.D3Store.ComboItemChilds.push(combo_box.D3Store.notRootNode[i]);
                                    combo_box.D3Store.notRootNode[i].D3Store.ComboItemParent = _dom;
                                    combo_box.D3Store.notRootNode.splice(i,1);
                                    _dom.classList.add('closed');
                                    _dom.classList.remove('nochilds');
                                    addNotRoot = false;
                                    if(D3Api.hasProperty(_dom,'levelHierh')){
                                        var level = (+D3Api.getProperty(_dom,'levelHierh')) + 1;
                                        D3Api.setProperty(combo_box.D3Store.notRootNode[i],'levelHierh',level);
                                        var sp = combo_box.D3Store.notRootNode[i].querySelector('.item_block');
                                        sp.style.marginLeft = (width*level)+'px';
                                    }
                                }
                            }
                        }
                    }
                    if(addNotRoot){
                        combo_box.D3Store.notRootNode.push(_dom);
                    }
                }
            }else{
                //сюда попадают корневые элементы
                D3Api.setProperty(_dom,'levelHierh',1);
            }
            if(notRoot && combo_box.D3Store.notRootNode.length > 0){
                //ищем дочерние элементы которые пришли раньше.
                for(var i = 0 , len = combo_box.D3Store.notRootNode.length ; i < len ; i++){
                    if('clone' in combo_box.D3Store.notRootNode[i]){
                        if (combo_box.D3Store.notRootNode[i].clone.data[parentField] == data[keyField]){
                            var lastRow = _dom.parentNode.rows[_dom.parentNode.rows.length - 1];
                            _dom.parentNode.insertBefore(combo_box.D3Store.notRootNode[i],lastRow);
                            _dom.D3Store.ComboItemChilds.push(combo_box.D3Store.notRootNode[i]);
                            combo_box.D3Store.notRootNode[i].D3Store.ComboItemParent = _dom;
                            _dom.classList.add('closed');
                            _dom.classList.remove('nochilds');
                            if(D3Api.hasProperty(_dom,'levelHierh')){
                                var level = (+D3Api.getProperty(_dom,'levelHierh')) + 1;
                                D3Api.setProperty(combo_box.D3Store.notRootNode[i],'levelHierh',level);
                                var sp = combo_box.D3Store.notRootNode[i].querySelector('.item_block');
                                sp.style.marginLeft = (width*level)+'px';
                            }
                        }
                    }
                }
            }
        }
    }
    this.onRefresh = function ComboItemCtrl_onRefresh(combo_box)
    {
        var drop_list = D3Api.ComboBoxCtrl.getDropList(combo_box);

        if (drop_list.style.display == 'block')
        {
            D3Api.ComboBoxCtrl.hideDropList(drop_list);
            D3Api.removeEvent(document, 'click', drop_list.functionHook, true);
            D3Api.removeEvent(document, 'scroll', drop_list.functionHook, true);
        }
    }
    this.afterRefresh = function ComboItemCtrl_afterRefresh(combo_box)
    {
        var items_ds = combo_box.D3Form.getDataSet(D3Api.getProperty(combo_box,'items_dataset'));
        if(items_ds.acceptedData <= 0)
        {
            return;
        }
        D3Api.ComboBoxCtrl.setOptions(combo_box);
        D3Api.ComboBoxCtrl.refreshEmptyItem(combo_box);
        var storedCaption;
        if(D3Api.getProperty(combo_box,'anyvalue','false') !== 'false' && !D3Api.hasProperty(combo_box,'initIndex'))
        {
            storedCaption = D3Api.ComboBoxCtrl.getCaption(combo_box);
        }
        var val = D3Api.getControlPropertyByDom(combo_box,'value');
        var item = val?D3Api.ComboBoxCtrl.getItemByValue(combo_box,val):D3Api.ComboBoxCtrl.getItemStaticSelected(combo_box);
        var di = D3Api.getProperty(combo_box,'defaultindex',false);
        if (combo_box.storedValue != undefined)
        {
            combo_box.dynItems = false;
            var addItemValue = combo_box.storedValue;
            D3Api.setControlPropertyByDom(combo_box,'value',combo_box.storedValue);
            combo_box.storedValue = undefined;
            if(D3Api.ComboBoxCtrl.getValue(combo_box) != addItemValue)
            {
                D3Api.ComboBoxCtrl._addNewItem(combo_box,addItemValue);
            }
            di = false;
        }else if(item && val && !D3Api.hasProperty(item.option,'selected'))
        {
            D3Api.setControlPropertyByDom(combo_box,'value',item.value);
        }else if ((item == null || (!D3Api.hasProperty(item.option,'selected') && di === false)) && combo_box.options.length > 1)
        {
            var ii = D3Api.getProperty(combo_box,'initIndex',combo_box.D3Store.multiselect?null:0);
            if(ii !== null)
            {
                item = D3Api.ComboBoxCtrl.getItemByIndex(combo_box,ii);
                D3Api.setControlPropertyByDom(combo_box,'value',item.value);
            }
            //di = false;
        }else
        {
            item = D3Api.ComboBoxCtrl.getItemSelected(combo_box);
            if(item)
            {
                D3Api.setControlPropertyByDom(combo_box,'value',item.value);
            }
        }
        combo_box.dynItems = false;
        D3Api.removeProperty(combo_box, 'dynitems');
        if(di!==false && items_ds.getCount() == 1)
        {
            item = D3Api.ComboBoxCtrl.getItemByIndex(combo_box,+di);
            if(item)
                D3Api.setControlPropertyByDom(combo_box,'value',item.value);
        }

        if(!D3Api.isUndefined(storedCaption))
        {
            D3Api.ComboBoxCtrl.setCaption(combo_box, storedCaption);
        }
    }
    this.getValue = function ComboItemCtrl_getValue(_dom)
    {
            if (!_dom)
                return '';
            return D3Api.getProperty(_dom, 'value', '');
    }
    this.setValue = function ComboItemCtrl_setValue(_dom, _value)
    {
        D3Api.setProperty(_dom,'value', _value);
    }
    this.getCaption = function ComboItemCtrl_getCaption(_dom)
    {
            if (!_dom)
                return '';
            if (_dom.isEmptyItem)
                return '';
            var cnt = D3Api.getChildTag(_dom,'span',1);
            var c = cnt.innerHTML;
            return (c == '&nbsp;')?'':D3Api.getTextContent(cnt);
    }
    this.setCaption = function ComboItemCtrl_setCaption(_dom, _value)
    {
        _value = D3Api.isUndefined(_value)?'':_value;
        if(_value !== undefined)
        {
            var cnt = D3Api.getChildTag(_dom,'span',1);
            cnt.innerHTML = (_value == '')?'&nbsp;':_value;
        }
    }
    this.stateItem = function(item,state)
    {
        var domch = D3Api.getDomByAttr(item,'cont','multicheck');
        domch.checked = state;
    }
    this.checkItem = function(item)
    {
        var chValue = this.getValue(item);
        var domch = D3Api.getDomByAttr(item,'cont','multicheck');
        var cb = D3Api.getControlByDom(item,'ComboBox');

        var tmpval = D3Api.getControlPropertyByDom(cb,'value',true);

        tmpval = tmpval.split(';');
        var ind = tmpval.indexOf(chValue);
        if(domch.checked && ind == -1)
        {
            tmpval.push(chValue);
        }else if(!domch.checked && ind != -1)
        {
            tmpval.splice(ind,1);
        }
        D3Api.setControlPropertyByDom(cb,'value',tmpval.join(';'),undefined,true);
    }
    this.getInput = function(_dom)
    {
        return D3Api.getChildTag(_dom,'input',1);
    }
    this.setActive = function(_dom, _value)
    {
        if(D3Api.getBoolean(_value))
        {
            var cb = D3Api.getControlByDom(_dom, 'ComboBox');
            D3Api.setControlPropertyByDom(cb, 'value', D3Api.getProperty(_dom, 'value', null), undefined, true);
        }
    }
}
D3Api.controlsApi['ComboItem'] = new D3Api.ControlBaseProperties(D3Api.ComboItemCtrl);
D3Api.controlsApi['ComboItem']['value']={get:D3Api.ComboItemCtrl.getValue, set:D3Api.ComboItemCtrl.setValue};
D3Api.controlsApi['ComboItem']['caption']={get:D3Api.ComboItemCtrl.getCaption, set:D3Api.ComboItemCtrl.setCaption};
D3Api.controlsApi['ComboItem']['input']={get:D3Api.ComboItemCtrl.getInput, type: 'dom'};
D3Api.controlsApi['ComboItem']['active']={set:D3Api.ComboItemCtrl.setActive};
/*  Copyright Mihai Bazon, 2002-2005  |  www.bazon.net/mishoo
 * -----------------------------------------------------------
 *
 * The DHTML Calendar, version 1.0 "It is happening again"
 *
 * Details and latest version at:
 * www.dynarch.com/projects/calendar
 *
 * This script is developed by Dynarch.com.  Visit us at www.dynarch.com.
 *
 * This script is distributed under the GNU Lesser General Public License.
 * Read the entire license text here: http://www.gnu.org/licenses/lgpl.html
 */

// $Id: calendar.js,v 1.51 2005/03/07 16:44:31 mishoo Exp $

/** The Calendar object constructor. */
TCalendar = function (firstDayOfWeek, dateStr, onSelected, onClose) {
	// member variables
	this.activeDiv = null;
	this.currentDateEl = null;
	this.getDateStatus = null;
	this.getDateToolTip = null;
	this.getDateText = null;
	this.timeout = null;
	this.onSelected = onSelected || null;
	this.onClose = onClose || null;
	this.dragging = false;
	this.hidden = false;
	this.minYear = 1000;
	this.maxYear = 2999;
	this.dateFormat = TCalendar._TT["DEF_DATE_FORMAT"];
	this.ttDateFormat = TCalendar._TT["TT_DATE_FORMAT"];
	this.isPopup = true;
	this.weekNumbers = false;
	this.firstDayOfWeek = typeof firstDayOfWeek == "number" ? firstDayOfWeek : TCalendar._FD; // 0 for Sunday, 1 for Monday, etc.
	this.showsOtherMonths = true;
	this.dateStr = dateStr;
	this.ar_days = null;
	this.showsTime = false;
	this.time24 = true;
	this.yearStep = 1;
	this.hiliteToday = true;
	this.multiple = null;
	// HTML elements
	this.table = null;
	this.element = null;
	this.tbody = null;
	this.firstdayname = null;
	// Combo boxes
	this.monthsCombo = null;
	this.yearsCombo = null;
	this.hilitedMonth = null;
	this.activeMonth = null;
	this.hilitedYear = null;
	this.activeYear = null;
	// Information
	this.dateClicked = false;
	this.timeClicked = false;

	// one-time initializations
	if (typeof TCalendar._SDN == "undefined") {
		// table of short day names
		if (typeof TCalendar._SDN_len == "undefined")
			TCalendar._SDN_len = 3;
		var ar = new Array();
		for (var i = 8; i > 0;) {
			ar[--i] = TCalendar._DN[i].substr(0, TCalendar._SDN_len);
		}
		TCalendar._SDN = ar;
		// table of short month names
		if (typeof TCalendar._SMN_len == "undefined")
			TCalendar._SMN_len = 3;
		ar = new Array();
		for (var i = 12; i > 0;) {
			ar[--i] = TCalendar._MN[i].substr(0, TCalendar._SMN_len);
		}
		TCalendar._SMN = ar;
	}
};

// ** constants

/// "static", needed for event handlers.
TCalendar._C = null;

/// detect a special case of "web browser"
TCalendar.is_ie = ( /msie/i.test(navigator.userAgent) &&
		   !/opera/i.test(navigator.userAgent) );

TCalendar.is_ie5 = ( TCalendar.is_ie && /msie 5\.0/i.test(navigator.userAgent) );

/// detect Opera browser
TCalendar.is_opera = /opera/i.test(navigator.userAgent);

/// detect KHTML-based browsers
TCalendar.is_khtml = /Konqueror|Safari|KHTML/i.test(navigator.userAgent);

// BEGIN: UTILITY FUNCTIONS; beware that these might be moved into a separate
//        library, at some point.

TCalendar.getAbsolutePos = function(el) {
	var SL = 0, ST = 0;
	var is_div = /^div$/i.test(el.tagName);
	if (is_div && el.scrollLeft)
		SL = el.scrollLeft;
	if (is_div && el.scrollTop)
		ST = el.scrollTop;
	var r = {x: el.offsetLeft - SL, y: el.offsetTop - ST};
	if (el.offsetParent) {
		var tmp = this.getAbsolutePos(el.offsetParent);
		r.x += tmp.x;
		r.y += tmp.y;
	}
	return r;
};

TCalendar.isRelated = function (el, evt) {
	var related = evt.relatedTarget;
	if (!related) {
		var type = evt.type;
		if (type == "mouseover") {
			related = evt.fromElement;
		} else if (type == "mouseout") {
			related = evt.toElement;
		}
	}
	while (related) {
		if (related == el) {
			return true;
		}
		related = related.parentNode;
	}
	return false;
};

TCalendar.removeClass = function(el, className) {
	if (!(el && el.className)) {
		return;
	}
	var cls = el.className.split(" ");
	var ar = new Array();
	for (var i = cls.length; i > 0;) {
		if (cls[--i] != className) {
			ar[ar.length] = cls[i];
		}
	}
	el.className = ar.join(" ");
};

TCalendar.addClass = function(el, className) {
	TCalendar.removeClass(el, className);
	el.className += " " + className;
};

// FIXME: the following 2 functions totally suck, are useless and should be replaced immediately.
TCalendar.getElement = function(ev) {
	var f = TCalendar.is_ie ? window.event.srcElement : ev.currentTarget;
	while (f.nodeType != 1 || /^div$/i.test(f.tagName))
		f = f.parentNode;
	return f;
};

TCalendar.getTargetElement = function(ev) {
	var f = TCalendar.is_ie ? window.event.srcElement : ev.target;
	while (f.nodeType != 1)
		f = f.parentNode;
	return f;
};

TCalendar.stopEvent = function(ev) {
	return D3Api.stopEvent(ev);
};

TCalendar.addEvent = function(el, evname, func) {
	if (el.attachEvent) { // IE
		el.attachEvent("on" + evname, func);
	} else if (el.addEventListener) { // Gecko / W3C
		el.addEventListener(evname, func, true);
	} else {
		el["on" + evname] = func;
	}
};

TCalendar.removeEvent = function(el, evname, func) {
	if (el.detachEvent) { // IE
		el.detachEvent("on" + evname, func);
	} else if (el.removeEventListener) { // Gecko / W3C
		el.removeEventListener(evname, func, true);
	} else {
		el["on" + evname] = null;
	}
};

TCalendar.createElement = function(type, parent) {
	var el = null;
	if (document.createElementNS) {
		// use the XHTML namespace; IE won't normally get here unless
		// _they_ "fix" the DOM2 implementation.
		el = document.createElementNS("http://www.w3.org/1999/xhtml", type);
	} else {
		el = document.createElement(type);
	}
	if (typeof parent != "undefined") {
		parent.appendChild(el);
	}
	return el;
};

// END: UTILITY FUNCTIONS

// BEGIN: CALENDAR STATIC FUNCTIONS

/** Internal -- adds a set of events to make some element behave like a button. */
TCalendar._add_evs = function(el) {
	with (TCalendar) {
		addEvent(el, "mouseover", dayMouseOver);
		addEvent(el, "mousedown", dayMouseDown);
		addEvent(el, "mouseout", dayMouseOut);
		if (is_ie) {
			addEvent(el, "dblclick", dayMouseDblClick);
			el.setAttribute("unselectable", true);
		}
	}
};

TCalendar.findMonth = function(el) {
	if (typeof el.month != "undefined") {
		return el;
	} else if (typeof el.parentNode.month != "undefined") {
		return el.parentNode;
	}
	return null;
};

TCalendar.findYear = function(el) {
	if (typeof el.year != "undefined") {
		return el;
	} else if (typeof el.parentNode.year != "undefined") {
		return el.parentNode;
	}
	return null;
};

TCalendar.showMonthsCombo = function () {
	var cal = TCalendar._C;
	if (!cal) {
		return false;
	}
	var cal = cal;
	var cd = cal.activeDiv;
	var mc = cal.monthsCombo;
	if (cal.hilitedMonth) {
		TCalendar.removeClass(cal.hilitedMonth, "hilite");
	}
	if (cal.activeMonth) {
		TCalendar.removeClass(cal.activeMonth, "active");
	}
	var mon = cal.monthsCombo.getElementsByTagName("div")[cal.date.getMonth()];
	TCalendar.addClass(mon, "active");
	cal.activeMonth = mon;
	var s = mc.style;
	s.display = "block";
	if (cd.navtype < 0)
		s.left = cd.offsetLeft + "px";
	else {
		var mcw = mc.offsetWidth;
		if (typeof mcw == "undefined")
			// Konqueror brain-dead techniques
			mcw = 50;
		s.left = (cd.offsetLeft + cd.offsetWidth - mcw) + "px";
	}
	s.top = (cd.offsetTop + cd.offsetHeight) + "px";
};

TCalendar.showYearsCombo = function (fwd) {
	var cal = TCalendar._C;
	if (!cal) {
		return false;
	}
	var cal = cal;
	var cd = cal.activeDiv;
	var yc = cal.yearsCombo;
	if (cal.hilitedYear) {
		TCalendar.removeClass(cal.hilitedYear, "hilite");
	}
	if (cal.activeYear) {
		TCalendar.removeClass(cal.activeYear, "active");
	}
	cal.activeYear = null;
	var Y = cal.date.getFullYear() + (fwd ? 1 : -1);
	var yr = yc.firstChild;
	var show = false;
	for (var i = 12; i > 0; --i) {
		if (Y >= cal.minYear && Y <= cal.maxYear) {
			yr.innerHTML = Y;
			yr.year = Y;
			yr.style.display = "block";
			show = true;
		} else {
			yr.style.display = "none";
		}
		yr = yr.nextSibling;
		Y += fwd ? cal.yearStep : -cal.yearStep;
	}
	if (show) {
		var s = yc.style;
		s.display = "block";
		if (cd.navtype < 0)
			s.left = cd.offsetLeft + "px";
		else {
			var ycw = yc.offsetWidth;
			if (typeof ycw == "undefined")
				// Konqueror brain-dead techniques
				ycw = 50;
			s.left = (cd.offsetLeft + cd.offsetWidth - ycw) + "px";
		}
		s.top = (cd.offsetTop + cd.offsetHeight) + "px";
	}
};

// event handlers

TCalendar.tableMouseUp = function(ev) {
	var cal = TCalendar._C;
	if (!cal) {
		return false;
	}
	if (cal.timeout) {
		clearTimeout(cal.timeout);
	}
	var el = cal.activeDiv;
	if (!el) {
		return false;
	}
	var target = TCalendar.getTargetElement(ev);
        target = (target.className == 'daycont')?target.parentNode:target;
	ev || (ev = window.event);
	TCalendar.removeClass(el, "active");
	if (target == el || target.parentNode == el) {
		TCalendar.cellClick(el, ev);
	}
	var mon = TCalendar.findMonth(target);
	var date = null;
	if (mon) {
		date = new Date(cal.date);
		if (mon.month != date.getMonth()) {
			date.setMonth(mon.month);
			cal.setDate(date);
			cal.dateClicked = false;
			cal.callHandler();
		}
	} else {
		var year = TCalendar.findYear(target);
		if (year) {
			date = new Date(cal.date);
			if (year.year != date.getFullYear()) {
				date.setFullYear(year.year);
				cal.setDate(date);
				cal.dateClicked = false;
				cal.callHandler();
			}
		}
	}
	with (TCalendar) {
		removeEvent(document, "mouseup", tableMouseUp);
		removeEvent(document, "mouseover", tableMouseOver);
		removeEvent(document, "mousemove", tableMouseOver);
		cal._hideCombos();
		_C = null;
		return stopEvent(ev);
	}
};

TCalendar.tableMouseOver = function (ev) {
    return true;
	var cal = TCalendar._C;
	if (!cal) {
		return;
	}
	var el = cal.activeDiv;
	var target = TCalendar.getTargetElement(ev);
	if (target == el || target.parentNode == el) {
		TCalendar.addClass(el, "hilite active");
		TCalendar.addClass(el.parentNode, "rowhilite");
	} else {
		if (typeof el.navtype == "undefined" || (el.navtype != 50 && (el.navtype == 0 || Math.abs(el.navtype) > 2)))
			TCalendar.removeClass(el, "active");
		TCalendar.removeClass(el, "hilite");
		TCalendar.removeClass(el.parentNode, "rowhilite");
	}
	ev || (ev = window.event);
	if (el.navtype == 50 && target != el) {
		var pos = TCalendar.getAbsolutePos(el);
		var w = el.offsetWidth;
		var x = ev.clientX;
		var dx;
		var decrease = true;
		if (x > pos.x + w) {
			dx = x - pos.x - w;
			decrease = false;
		} else
			dx = pos.x - x;

		if (dx < 0) dx = 0;
		var range = el._range;
		var current = el._current;
		var count = Math.floor(dx / 10) % range.length;
		for (var i = range.length; --i >= 0;)
			if (range[i] == current)
				break;
		while (count-- > 0)
			if (decrease) {
				if (--i < 0)
					i = range.length - 1;
			} else if ( ++i >= range.length )
				i = 0;
		var newval = range[i];
		el.innerHTML = newval;

		cal.onUpdateTime();
	}
	var mon = TCalendar.findMonth(target);
	if (mon) {
		if (mon.month != cal.date.getMonth()) {
			if (cal.hilitedMonth) {
				TCalendar.removeClass(cal.hilitedMonth, "hilite");
			}
			TCalendar.addClass(mon, "hilite");
			cal.hilitedMonth = mon;
		} else if (cal.hilitedMonth) {
			TCalendar.removeClass(cal.hilitedMonth, "hilite");
		}
	} else {
		if (cal.hilitedMonth) {
			TCalendar.removeClass(cal.hilitedMonth, "hilite");
		}
		var year = TCalendar.findYear(target);
		if (year) {
			if (year.year != cal.date.getFullYear()) {
				if (cal.hilitedYear) {
					TCalendar.removeClass(cal.hilitedYear, "hilite");
				}
				TCalendar.addClass(year, "hilite");
				cal.hilitedYear = year;
			} else if (cal.hilitedYear) {
				TCalendar.removeClass(cal.hilitedYear, "hilite");
			}
		} else if (cal.hilitedYear) {
			TCalendar.removeClass(cal.hilitedYear, "hilite");
		}
	}
	return TCalendar.stopEvent(ev);
};

TCalendar.tableMouseDown = function (ev) {
	if (TCalendar.getTargetElement(ev) == TCalendar.getElement(ev)) {
		return TCalendar.stopEvent(ev);
	}
};

TCalendar.calDragIt = function (ev) {
	var cal = TCalendar._C;
	if (!(cal && cal.dragging)) {
		return false;
	}
	var posX;
	var posY;
	if (TCalendar.is_ie) {
		posY = window.event.clientY + document.body.scrollTop;
		posX = window.event.clientX + document.body.scrollLeft;
	} else {
		posX = ev.pageX;
		posY = ev.pageY;
	}
	cal.hideShowCovered();
	var st = cal.element.style;
	st.left = (posX - cal.xOffs) + "px";
	st.top = (posY - cal.yOffs) + "px";
	return TCalendar.stopEvent(ev);
};

TCalendar.calDragEnd = function (ev) {
	var cal = TCalendar._C;
	if (!cal) {
		return false;
	}
	cal.dragging = false;
	with (TCalendar) {
		removeEvent(document, "mousemove", calDragIt);
		removeEvent(document, "mouseup", calDragEnd);
		tableMouseUp(ev);
	}
	cal.hideShowCovered();
};

TCalendar.dayMouseDown = function(ev) {
	var el = TCalendar.getElement(ev);
	if (el.disabled) {
		return false;
	}
	var cal = el.calendar;
	cal.activeDiv = el;
	TCalendar._C = cal;
	if (el.navtype != 300) with (TCalendar) {
		if (el.navtype == 50) {
			el._current = el.innerHTML;
			addEvent(document, "mousemove", tableMouseOver);
		} else
			addEvent(document, TCalendar.is_ie5 ? "mousemove" : "mouseover", tableMouseOver);
		addClass(el, "hilite active");
		addEvent(document, "mouseup", tableMouseUp);
	} else if (cal.isPopup) {
		cal._dragStart(ev);
	}
	if (el.navtype == -1 || el.navtype == 1) {
		if (cal.timeout) clearTimeout(cal.timeout);
		cal.timeout = setTimeout("TCalendar.showMonthsCombo()", 250);
	} else if (el.navtype == -2 || el.navtype == 2) {
		if (cal.timeout) clearTimeout(cal.timeout);
		cal.timeout = setTimeout((el.navtype > 0) ? "TCalendar.showYearsCombo(true)" : "TCalendar.showYearsCombo(false)", 250);
	} else {
		cal.timeout = null;
	}
	return TCalendar.stopEvent(ev);
};

TCalendar.dayMouseDblClick = function(ev) {
	TCalendar.cellClick(TCalendar.getElement(ev), ev || window.event);
	if (TCalendar.is_ie) {
		document.selection.empty();
	}
};

TCalendar.dayMouseOver = function(ev) {
	var el = TCalendar.getElement(ev);
	if (TCalendar.isRelated(el, ev) || TCalendar._C || el.disabled) {
		return false;
	}
	if (el.ttip) {
		if (el.ttip.substr(0, 1) == "_") {
			el.ttip = el.caldate.print(el.calendar.ttDateFormat) + el.ttip.substr(1);
		}
		el.calendar.tooltips.innerHTML = el.ttip;
	}
	/*if (el.navtype != 300) {
		TCalendar.addClass(el, "hilite");
		if (el.caldate) {
			TCalendar.addClass(el.parentNode, "rowhilite");
		}
	}*/
	return TCalendar.stopEvent(ev);
};

TCalendar.dayMouseOut = function(ev) {
	with (TCalendar) {
		var el = getElement(ev);
		if (isRelated(el, ev) || _C || el.disabled)
			return false;
		removeClass(el, "hilite");
		if (el.caldate)
			removeClass(el.parentNode, "rowhilite");
		if (el.calendar)
			el.calendar.tooltips.innerHTML = _TT["SEL_DATE"];
		return stopEvent(ev);
	}
};

/**
 *  A generic "click" handler :) handles all types of buttons defined in this
 *  calendar.
 */
TCalendar.cellClick = function(el, ev) {
	var cal = el.calendar;
	var closing = false;
	var newdate = false;
	var date = null;
	if (typeof el.navtype == "undefined") {
		if (cal.currentDateEl) {
			TCalendar.removeClass(cal.currentDateEl, "selected");
			TCalendar.addClass(el, "selected");
			closing = (cal.currentDateEl == el);
			if (!closing) {
				cal.currentDateEl = el;
			}
		}
		cal.date.setDateOnly(el.caldate);
		date = cal.date;
		var other_month = !(cal.dateClicked = !el.otherMonth);
		if (!other_month && !cal.currentDateEl)
			cal._toggleMultipleDate(new Date(date));
		else
			newdate = !el.disabled;
		// a date was clicked
		if (other_month)
			cal._init(cal.firstDayOfWeek, date);
	} else {
		if (el.navtype == 200) {
			TCalendar.removeClass(el, "hilite");
			cal.callCloseHandler();
			return;
		}
		date = new Date(cal.date);
		if (el.navtype == 0)
			date.setDateOnly(new Date()); // TODAY
		// unless "today" was clicked, we assume no date was clicked so
		// the selected handler will know not to close the calenar when
		// in single-click mode.
		// cal.dateClicked = (el.navtype == 0);
		cal.dateClicked = false;
		var year = date.getFullYear();
		var mon = date.getMonth();
		function setMonth(m) {
			var day = date.getDate();
			var max = date.getMonthDays(m);
			if (day > max) {
				date.setDate(max);
			}
			date.setMonth(m);
		};
		switch (el.navtype) {
		    case 400:
			TCalendar.removeClass(el, "hilite");
			var text = TCalendar._TT["ABOUT"];
			if (typeof text != "undefined") {
				text += cal.showsTime ? TCalendar._TT["ABOUT_TIME"] : "";
			} else {
				// FIXME: this should be removed as soon as lang files get updated!
				text = "Help and about box text is not translated into this language.\n" +
					"If you know this language and you feel generous please update\n" +
					"the corresponding file in \"lang\" subdir to match calendar-en.js\n" +
					"and send it back to <mihai_bazon@yahoo.com> to get it into the distribution  ;-)\n\n" +
					"Thank you!\n" +
					"http://dynarch.com/mishoo/calendar.epl\n";
			}
			alert(text);
			return;
		    case -2:
			if (year > cal.minYear) {
				date.setFullYear(year - 1);
			}
			break;
		    case -1:
			if (mon > 0) {
				setMonth(mon - 1);
			} else if (year-- > cal.minYear) {
				date.setFullYear(year);
				setMonth(11);
			}
			break;
		    case 1:
			if (mon < 11) {
				setMonth(mon + 1);
			} else if (year < cal.maxYear) {
				date.setFullYear(year + 1);
				setMonth(0);
			}
			break;
		    case 2:
			if (year < cal.maxYear) {
				date.setFullYear(year + 1);
			}
			break;
		    case 100:
			cal.setFirstDayOfWeek(el.fdow);
			return;
		    case 50:
			var range = el._range;
			var current = el.innerHTML;
			for (var i = range.length; --i >= 0;)
				if (range[i] == current)
					break;
			if (ev && ev.shiftKey) {
				if (--i < 0)
					i = range.length - 1;
			} else if ( ++i >= range.length )
				i = 0;
			var newval = range[i];
			el.innerHTML = newval;
			cal.onUpdateTime();
			return;
		    case 0:
			// TODAY will bring us here
			if ((typeof cal.getDateStatus == "function") &&
			    cal.getDateStatus(date, date.getFullYear(), date.getMonth(), date.getDate())) {
				return false;
			}
			break;
		}
		if (!date.equalsTo(cal.date)) {
			cal.setDate(date);
			newdate = true;
		} else if (el.navtype == 0)
			newdate = closing = true;
	}
	if (newdate) {
		ev && cal.callHandler();
	}
	if (closing) {
		TCalendar.removeClass(el, "hilite");
		ev && cal.callCloseHandler();
	}
};

// END: CALENDAR STATIC FUNCTIONS

// BEGIN: CALENDAR OBJECT FUNCTIONS

/**
 *  This function creates the calendar inside the given parent.  If _par is
 *  null than it creates a popup calendar inside the BODY element.  If _par is
 *  an element, be it BODY, then it creates a non-popup calendar (still
 *  hidden).  Some properties need to be set before calling this function.
 */
TCalendar.prototype.create = function (_par) {
	var parent = _par;
	this.isPopup = true;
	this.date = this.dateStr ? new Date(this.dateStr) : new Date();
	this.rootElement = _par;
	var table = TCalendar.createElement("table");
	this.table = table;
	table.cellSpacing = 0;
	table.cellPadding = 0;
	table.calendar = this;
	TCalendar.addEvent(table, "mousedown", TCalendar.tableMouseDown);

	var div = TCalendar.createElement("div");
	this.element = div;
	div.className = "calendar";
	if (this.isPopup) {
		div.style.position = "fixed";
		div.style.display = "none";
	}
	div.appendChild(table);

	var thead = TCalendar.createElement("thead", table);
	var cell = null;
	var row = null;

	var cal = this;
	var hh = function (text, cs, navtype) {
		cell = TCalendar.createElement("td", row);
		cell.colSpan = cs;
		cell.className = "button";
		if (navtype != 0 && Math.abs(navtype) <= 2)
			cell.className += " nav";
                if(text == "close"){
                    cell.className += " closeCalendar";
                    text = "";
                }
		TCalendar._add_evs(cell);
		cell.calendar = cal;
		cell.navtype = navtype;
		cell.innerHTML = "<div unselectable='on'>"+text+"</div>";
		return cell;
	};

	row = TCalendar.createElement("tr", thead);
	var title_length = 6;
	(this.isPopup) && --title_length;
	(this.weekNumbers) && ++title_length;

	hh("", 1, 400).ttip = TCalendar._TT["INFO"];
	this.title = hh("", title_length, 300);
	this.title.className = "title";
	if (this.isPopup) {
		this.title.ttip = TCalendar._TT["DRAG_TO_MOVE"];
		this.title.style.cursor = "move";
		hh("close", 1, 200).ttip = TCalendar._TT["CLOSE"];
	}

	row = TCalendar.createElement("tr", thead);
	row.className = "headrow";

	this._nav_py = hh("", 1, -2);
	this._nav_py.ttip = TCalendar._TT["PREV_YEAR"];

	this._nav_pm = hh("", 1, -1);
	this._nav_pm.ttip = TCalendar._TT["PREV_MONTH"];

	this._nav_now = hh(TCalendar._TT["TODAY"], this.weekNumbers ? 4 : 3, 0);
	this._nav_now.ttip = TCalendar._TT["GO_TODAY"];

	this._nav_nm = hh("", 1, 1);
	this._nav_nm.ttip = TCalendar._TT["NEXT_MONTH"];

	this._nav_ny = hh("", 1, 2);
	this._nav_ny.ttip = TCalendar._TT["NEXT_YEAR"];

	// day names
	row = TCalendar.createElement("tr", thead);
	row.className = "daynames";
	if (this.weekNumbers) {
		cell = TCalendar.createElement("td", row);
		cell.className = "name wn";
		cell.innerHTML = TCalendar._TT["WK"];
	}
	for (var i = 7; i > 0; --i) {
		cell = TCalendar.createElement("td", row);
		if (!i) {
			cell.navtype = 100;
			cell.calendar = this;
			TCalendar._add_evs(cell);
		}
	}
	this.firstdayname = (this.weekNumbers) ? row.firstChild.nextSibling : row.firstChild;
	this._displayWeekdays();

	var tbody = TCalendar.createElement("tbody", table);
	this.tbody = tbody;

	for (i = 6; i > 0; --i) {
		row = TCalendar.createElement("tr", tbody);
		if (this.weekNumbers) {
			cell = TCalendar.createElement("td", row);
		}
		for (var j = 7; j > 0; --j) {
			cell = TCalendar.createElement("td", row);
			cell.calendar = this;
			TCalendar._add_evs(cell);
		}
	}

	if (this.showsTime) {
		row = TCalendar.createElement("tr", tbody);
		row.className = "time";

		cell = TCalendar.createElement("td", row);
		cell.className = "time";
		cell.colSpan = 2;
		cell.innerHTML = TCalendar._TT["TIME"] || "&nbsp;";

		cell = TCalendar.createElement("td", row);
		cell.className = "time";
		cell.colSpan = this.weekNumbers ? 4 : 3;

		(function(){
			function makeTimePart(className, init, range_start, range_end) {
				var part = TCalendar.createElement("span", cell);
				part.className = className;
				part.innerHTML = init;
				part.calendar = cal;
				part.ttip = TCalendar._TT["TIME_PART"];
				part.navtype = 50;
				part._range = [];
				if (typeof range_start != "number")
					part._range = range_start;
				else {
					for (var i = range_start; i <= range_end; ++i) {
						var txt;
						if (i < 10 && range_end >= 10) txt = '0' + i;
						else txt = '' + i;
						part._range[part._range.length] = txt;
					}
				}
				TCalendar._add_evs(part);
				return part;
			};
			var hrs = cal.date.getHours();
			var mins = cal.date.getMinutes();
			var t12 = !cal.time24;
			var pm = (hrs > 12);
			if (t12 && pm) hrs -= 12;
			var H = makeTimePart("hour", hrs, t12 ? 1 : 0, t12 ? 12 : 23);
			var span = TCalendar.createElement("span", cell);
			span.innerHTML = ":";
			span.className = "colon";
			var M = makeTimePart("minute", mins, 0, 59);
			var AP = null;
			cell = TCalendar.createElement("td", row);
			cell.className = "time";
			cell.colSpan = 2;
			if (t12)
				AP = makeTimePart("ampm", pm ? "pm" : "am", ["am", "pm"]);
			else
				cell.innerHTML = "&nbsp;";

			cal.onSetTime = function() {
				var pm, hrs = this.date.getHours(),
					mins = this.date.getMinutes();
				if (t12) {
					pm = (hrs >= 12);
					if (pm) hrs -= 12;
					if (hrs == 0) hrs = 12;
					AP.innerHTML = pm ? "pm" : "am";
				}
				H.innerHTML = (hrs < 10) ? ("0" + hrs) : hrs;
				M.innerHTML = (mins < 10) ? ("0" + mins) : mins;
			};

			cal.onUpdateTime = function() {
				var date = this.date;
				var h = parseInt(H.innerHTML, 10);
				if (t12) {
					if (/pm/i.test(AP.innerHTML) && h < 12)
						h += 12;
					else if (/am/i.test(AP.innerHTML) && h == 12)
						h = 0;
				}
				var d = date.getDate();
				var m = date.getMonth();
				var y = date.getFullYear();
				date.setHours(h);
				date.setMinutes(parseInt(M.innerHTML, 10));
				date.setFullYear(y);
				date.setMonth(m);
				date.setDate(d);
				this.dateClicked = false;
				this.timeClicked = true;
				this.callHandler();
			};
		})();
	} else {
		this.onSetTime = this.onUpdateTime = function() {};
	}

	var tfoot = TCalendar.createElement("tfoot", table);

	row = TCalendar.createElement("tr", tfoot);
	row.className = "footrow";

	cell = hh(TCalendar._TT["SEL_DATE"], this.weekNumbers ? 8 : 7, 300);
	cell.className = "ttip";
	if (this.isPopup) {
		cell.ttip = TCalendar._TT["DRAG_TO_MOVE"];
		cell.style.cursor = "move";
	}
	this.tooltips = cell;

	div = TCalendar.createElement("div", this.element);
	this.monthsCombo = div;
	div.className = "combo";
	for (i = 0; i < TCalendar._MN.length; ++i) {
		var mn = TCalendar.createElement("div");
		mn.className = TCalendar.is_ie ? "label-IEfix" : "label";
		mn.month = i;
		mn.innerHTML = TCalendar._SMN[i];
		div.appendChild(mn);
	}

	div = TCalendar.createElement("div", this.element);
	this.yearsCombo = div;
	div.className = "combo";
	for (i = 12; i > 0; --i) {
		var yr = TCalendar.createElement("div");
		yr.className = TCalendar.is_ie ? "label-IEfix" : "label";
		div.appendChild(yr);
	}

	this._init(this.firstDayOfWeek, this.date);
	parent.appendChild(this.element);
};

/** keyboard navigation, only for popup calendars */
TCalendar._keyEvent = function(ev) {
	var cal = window._dynarch_popupCalendar;
	if (!cal || cal.multiple)
		return false;
	(TCalendar.is_ie) && (ev = window.event);
	var act = (TCalendar.is_ie || ev.type == "keypress"),
		K = ev.keyCode;
	if (ev.ctrlKey) {
		switch (K) {
		    case 37: // KEY left
			act && TCalendar.cellClick(cal._nav_pm);
			break;
		    case 38: // KEY up
			act && TCalendar.cellClick(cal._nav_py);
			break;
		    case 39: // KEY right
			act && TCalendar.cellClick(cal._nav_nm);
			break;
		    case 40: // KEY down
			act && TCalendar.cellClick(cal._nav_ny);
			break;
		    default:
			return false;
		}
	} else switch (K) {
	    case 32: // KEY space (now)
		TCalendar.cellClick(cal._nav_now);
		break;
	    case 27: // KEY esc
		act && cal.callCloseHandler();
		break;
	    case 37: // KEY left
	    case 38: // KEY up
	    case 39: // KEY right
	    case 40: // KEY down
		if (act) {
			var prev, x, y, ne, el, step;
			prev = K == 37 || K == 38;
			step = (K == 37 || K == 39) ? 1 : 7;
			function setVars() {
				el = cal.currentDateEl;
				var p = el.pos;
				x = p & 15;
				y = p >> 4;
				ne = cal.ar_days[y][x];
			};setVars();
			function prevMonth() {
				var date = new Date(cal.date);
				date.setDate(date.getDate() - step);
				cal.setDate(date);
			};
			function nextMonth() {
				var date = new Date(cal.date);
				date.setDate(date.getDate() + step);
				cal.setDate(date);
			};
			while (1) {
				switch (K) {
				    case 37: // KEY left
					if (--x >= 0)
						ne = cal.ar_days[y][x];
					else {
						x = 6;
						K = 38;
						continue;
					}
					break;
				    case 38: // KEY up
					if (--y >= 0)
						ne = cal.ar_days[y][x];
					else {
						prevMonth();
						setVars();
					}
					break;
				    case 39: // KEY right
					if (++x < 7)
						ne = cal.ar_days[y][x];
					else {
						x = 0;
						K = 40;
						continue;
					}
					break;
				    case 40: // KEY down
					if (++y < cal.ar_days.length)
						ne = cal.ar_days[y][x];
					else {
						nextMonth();
						setVars();
					}
					break;
				}
				break;
			}
			if (ne) {
				if (!ne.disabled)
					TCalendar.cellClick(ne);
				else if (prev)
					prevMonth();
				else
					nextMonth();
			}
		}
		break;
	    case 13: // KEY enter
		if (act)
			TCalendar.cellClick(cal.currentDateEl, ev);
		break;
	    default:
		return false;
	}
	return TCalendar.stopEvent(ev);
};

/**
 *  (RE)Initializes the calendar to the given date and firstDayOfWeek
 */
TCalendar.prototype._init = function (firstDayOfWeek, date) {
	var today = new Date(),
		TY = today.getFullYear(),
		TM = today.getMonth(),
		TD = today.getDate();
	this.table.style.visibility = "hidden";
	var year = date.getFullYear();
	if (year < this.minYear) {
		year = this.minYear;
		date.setFullYear(year);
	} else if (year > this.maxYear) {
		year = this.maxYear;
		date.setFullYear(year);
	}
	this.firstDayOfWeek = firstDayOfWeek;
	this.date = new Date(date);
	var month = date.getMonth();
	var mday = date.getDate();
	var no_days = date.getMonthDays();

	// calendar voodoo for computing the first day that would actually be
	// displayed in the calendar, even if it's from the previous month.
	// WARNING: this is magic. ;-)
	date.setDate(1);
	var day1 = (date.getDay() - this.firstDayOfWeek) % 7;
	if (day1 < 0)
		day1 += 7;
	date.setDate(-day1);
	date.setDate(date.getDate() + 1);

	var row = this.tbody.firstChild;
	var MN = TCalendar._SMN[month];
	var ar_days = this.ar_days = new Array();
	var weekend = TCalendar._TT["WEEKEND"];
	var dates = this.multiple ? (this.datesCells = {}) : null;
	for (var i = 0; i < 6; ++i, row = row.nextSibling) {
		var cell = row.firstChild;
		if (this.weekNumbers) {
			cell.className = "day wn";
			cell.innerHTML = '<div class="daycont">'+date.getWeekNumber()+'</div>';
			cell = cell.nextSibling;
		}
		row.className = "daysrow";
		var hasdays = false, iday, dpos = ar_days[i] = [];
		for (var j = 0; j < 7; ++j, cell = cell.nextSibling, date.setTime(date.getTime() + 1.5*24*60*60*1000)) {
                        iday = date.getDate();
                        date.setHours(0,0);
			var wday = date.getDay();
			cell.className = "day";
			cell.pos = i << 4 | j;
			dpos[j] = cell;
			var current_month = (date.getMonth() == month);
			if (!current_month) {
				if (this.showsOtherMonths) {
					cell.className += " othermonth";
					cell.otherMonth = true;
				} else {
					cell.className = "emptycell";
					cell.innerHTML = "&nbsp;";
					cell.disabled = true;
					continue;
				}
			} else {
				cell.otherMonth = false;
				hasdays = true;
			}
			cell.disabled = false;
			cell.innerHTML = '<div class="daycont">'+(this.getDateText ? this.getDateText(date, iday) : iday)+'</div>';
			if (dates)
				dates[date.print("%Y%m%d")] = cell;
			if (this.getDateStatus) {
				var status = this.getDateStatus(date, year, month, iday);
				if (this.getDateToolTip) {
					var toolTip = this.getDateToolTip(date, year, month, iday);
					if (toolTip)
						cell.title = toolTip;
				}
				if (status === true) {
					cell.className += " disabled";
					cell.disabled = true;
				} else {
					if (/disabled/i.test(status))
						cell.disabled = true;
					cell.className += " " + status;
				}
			}
			if (!cell.disabled) {
				cell.caldate = new Date(date);
				cell.ttip = "_";
				if (!this.multiple && current_month
				    && iday == mday && this.hiliteToday) {
					cell.className += " selected";
					this.currentDateEl = cell;
				}
				if (date.getFullYear() == TY &&
				    date.getMonth() == TM &&
				    iday == TD) {
					cell.className += " today";
					cell.ttip += TCalendar._TT["PART_TODAY"];
				}
				if (weekend.indexOf(wday.toString()) != -1)
					cell.className += cell.otherMonth ? " oweekend" : " weekend";
			}
		}
		if (!(hasdays || this.showsOtherMonths))
			row.className = "emptyrow";
	}
	this.title.innerHTML = TCalendar._MN[month] + ", " + year;
	this.onSetTime();
	this.table.style.visibility = "visible";
	this._initMultipleDates();
	// PROFILE
	// this.tooltips.innerHTML = "Generated in " + ((new Date()) - today) + " ms";
};

TCalendar.prototype._initMultipleDates = function() {
	if (this.multiple) {
		for (var i in this.multiple) {
			if(!this.multiple.hasOwnProperty(i)){
				continue;
			}
			var cell = this.datesCells[i];
			var d = this.multiple[i];
			if (!d)
				continue;
			if (cell)
				cell.className += " selected";
		}
	}
};

TCalendar.prototype._toggleMultipleDate = function(date) {
	if (this.multiple) {
		var ds = date.print("%Y%m%d");
		var cell = this.datesCells[ds];
		if (cell) {
			var d = this.multiple[ds];
			if (!d) {
				TCalendar.addClass(cell, "selected");
				this.multiple[ds] = date;
			} else {
				TCalendar.removeClass(cell, "selected");
				delete this.multiple[ds];
			}
		}
	}
};

TCalendar.prototype.setDateToolTipHandler = function (unaryFunction) {
	this.getDateToolTip = unaryFunction;
};

/**
 *  Calls _init function above for going to a certain date (but only if the
 *  date is different than the currently selected one).
 */
TCalendar.prototype.setDate = function (date) {
	if (!date.equalsTo(this.date)) {
		this._init(this.firstDayOfWeek, date);
	}
};

/**
 *  Refreshes the calendar.  Useful if the "disabledHandler" function is
 *  dynamic, meaning that the list of disabled date can change at runtime.
 *  Just * call this function if you think that the list of disabled dates
 *  should * change.
 */
TCalendar.prototype.refresh = function () {
	this._init(this.firstDayOfWeek, this.date);
};

/** Modifies the "firstDayOfWeek" parameter (pass 0 for Synday, 1 for Monday, etc.). */
TCalendar.prototype.setFirstDayOfWeek = function (firstDayOfWeek) {
	this._init(firstDayOfWeek, this.date);
	this._displayWeekdays();
};

/**
 *  Allows customization of what dates are enabled.  The "unaryFunction"
 *  parameter must be a function object that receives the date (as a JS Date
 *  object) and returns a boolean value.  If the returned value is true then
 *  the passed date will be marked as disabled.
 */
TCalendar.prototype.setDateStatusHandler = TCalendar.prototype.setDisabledHandler = function (unaryFunction) {
	this.getDateStatus = unaryFunction;
};

/** Customization of allowed year range for the calendar. */
TCalendar.prototype.setRange = function (a, z) {
	this.minYear = a;
	this.maxYear = z;
};

/** Calls the first user handler (selectedHandler). */
TCalendar.prototype.callHandler = function () {
	if (this.onSelected) {
		this.onSelected(this, this.date.print(this.dateFormat));
	}
};

/** Calls the second user handler (closeHandler). */
TCalendar.prototype.callCloseHandler = function () {
	if (this.onClose) {
		this.onClose(this);
	}
	this.hideShowCovered();
};

/** Removes the calendar object from the DOM tree and destroys it. */
TCalendar.prototype.destroy = function () {
	var el = this.element.parentNode;
	el.removeChild(this.element);
	TCalendar._C = null;
	window._dynarch_popupCalendar = null;
};

/**
 *  Moves the calendar element to a different section in the DOM tree (changes
 *  its parent).
 */
TCalendar.prototype.reparent = function (new_parent) {
	var el = this.element;
	el.parentNode.removeChild(el);
	new_parent.appendChild(el);
};

// This gets called when the user presses a mouse button anywhere in the
// document, if the calendar is shown.  If the click was outside the open
// TCalendar this function closes it.
TCalendar._checkCalendar = function(ev) {
	var calendar = window._dynarch_popupCalendar;
	if (!calendar) {
		return false;
	}
	var el = TCalendar.is_ie ? TCalendar.getElement(ev) : TCalendar.getTargetElement(ev);
	for (; el != null && el != calendar.element; el = el.parentNode);
	if (el == null) {
		// calls closeHandler which should hide the calendar.
		window._dynarch_popupCalendar.callCloseHandler();
		return TCalendar.stopEvent(ev);
	}
};

/** Shows the calendar. */
TCalendar.prototype.show = function () {
	var rows = this.table.getElementsByTagName("tr");
	for (var i = rows.length; i > 0;) {
		var row = rows[--i];
		TCalendar.removeClass(row, "rowhilite");
		var cells = row.getElementsByTagName("td");
		for (var j = cells.length; j > 0;) {
			var cell = cells[--j];
			TCalendar.removeClass(cell, "hilite");
			TCalendar.removeClass(cell, "active");
		}
	}
	this.element.style.display = "block";
	this.hidden = false;
	if (this.isPopup) {
		window._dynarch_popupCalendar = this;
		TCalendar.addEvent(document, "keydown", TCalendar._keyEvent);
		TCalendar.addEvent(document, "keypress", TCalendar._keyEvent);
		TCalendar.addEvent(document, "mousedown", TCalendar._checkCalendar);
	}
	this.hideShowCovered();
};

/**
 *  Hides the calendar.  Also removes any "hilite" from the class of any TD
 *  element.
 */
TCalendar.prototype.hide = function () {
	if (this.isPopup) {
		TCalendar.removeEvent(document, "keydown", TCalendar._keyEvent);
		TCalendar.removeEvent(document, "keypress", TCalendar._keyEvent);
		TCalendar.removeEvent(document, "mousedown", TCalendar._checkCalendar);
	}
	D3Api.removeDom(this.rootElement);
	this.hidden = true;
	this.hideShowCovered();
};

/**
 *  Shows the calendar at a given absolute position (beware that, depending on
 *  the calendar element style -- position property -- this might be relative
 *  to the parent's containing rectangle).
 */
TCalendar.prototype.showAt = function (x, y) {
	var s = this.element.style;
	s.left = x + "px";
	s.top = y + "px";
	this.show();
};

/** Shows the calendar near a given element. */
TCalendar.prototype.showAtElement = function (el, opts) {
	var self = this;
	var p = TCalendar.getAbsolutePos(el);
	//alert(p.x + ' ' + p.y);
	if (!opts || typeof opts != "string") {
		this.showAt(p.x, p.y + el.offsetHeight);
		return true;
	}
	function fixPosition(box) {
		if (box.x < 0)
			box.x = 0;
		if (box.y < 0)
			box.y = 0;
		var cp = document.createElement("div");
		var s = cp.style;
		s.position = "fixed";
		s.right = s.bottom = s.width = s.height = "0px";
		document.body.appendChild(cp);
		var br = TCalendar.getAbsolutePos(cp);
		//alert(br.x + ' ' + br.y);
		document.body.removeChild(cp);
		if (TCalendar.is_ie) {
			br.y += document.body.scrollTop;
			br.x += document.body.scrollLeft;
		} else {
			br.y += window.scrollY;
			br.x += window.scrollX;
		}
		var tmp = box.x + box.width - br.x;
		if (tmp > 0) box.x -= tmp;
		tmp = box.y + box.height - br.y;
		if (tmp > 0) box.y -= tmp;
	};
	this.element.style.display = "block";
	TCalendar.continuation_for_the_fucking_khtml_browser = function() {
		var w = self.element.offsetWidth;
		var h = self.element.offsetHeight;
		self.element.style.display = "none";
		var valign = opts.substr(0, 1);
		var halign = "l";
		if (opts.length > 1) {
			halign = opts.substr(1, 1);
		}
		// vertical alignment
		switch (valign) {
		    case "T":p.y -= h;break;
		    case "B":p.y += el.offsetHeight;break; //
		    case "C":p.y += (el.offsetHeight - h) / 2;break;
		    case "t":p.y += el.offsetHeight - h;break;
		    case "b":break; // already there
		}
		// horizontal alignment
		switch (halign) {
		    case "L":p.x -= w;break;
		    case "R":p.x += el.offsetWidth;break;
		    case "C":p.x += (el.offsetWidth - w) / 2;break;
		    case "l":p.x += el.offsetWidth - w;break;
		    case "r":break; // already there
		}
		p.width = w;
		p.height = h + 40;

		p.x -= getBodyScrollLeft();
		p.y -= getBodyScrollTop();
		self.monthsCombo.style.display = "none";
		fixPosition(p);
		self.showAt(p.x, p.y);
	};
	if (TCalendar.is_khtml)
		setTimeout("TCalendar.continuation_for_the_fucking_khtml_browser()", 10);
	else
		TCalendar.continuation_for_the_fucking_khtml_browser();
};

/** Customizes the date format. */
TCalendar.prototype.setDateFormat = function (str) {
	this.dateFormat = str;
};

/** Customizes the tooltip date format. */
TCalendar.prototype.setTtDateFormat = function (str) {
	this.ttDateFormat = str;
};

/**
 *  Tries to identify the date represented in a string.  If successful it also
 *  calls this.setDate which moves the calendar to the given date.
 */
TCalendar.prototype.parseDate = function(str, fmt) {
	if (!fmt)
		fmt = this.dateFormat;
	this.setDate(Date.parseDate(str, fmt));
};

TCalendar.prototype.hideShowCovered = function () {
	if (!TCalendar.is_ie && !TCalendar.is_opera)
		return;
	function getVisib(obj){
		var value = obj.style.visibility;
		if (!value) {
			if (document.defaultView && typeof (document.defaultView.getComputedStyle) == "function") { // Gecko, W3C
				if (!TCalendar.is_khtml)
					value = document.defaultView.
						getComputedStyle(obj, "").getPropertyValue("visibility");
				else
					value = '';
			} else if (obj.currentStyle) { // IE
				value = obj.currentStyle.visibility;
			} else
				value = '';
		}
		return value;
	};

	var tags = new Array("applet", "iframe", "select");
	var el = this.element;

	var p = TCalendar.getAbsolutePos(el);
	var EX1 = p.x;
	var EX2 = el.offsetWidth + EX1;
	var EY1 = p.y;
	var EY2 = el.offsetHeight + EY1;

	for (var k = tags.length; k > 0; ) {
		var ar = document.getElementsByTagName(tags[--k]);
		var cc = null;

		for (var i = ar.length; i > 0;) {
			cc = ar[--i];

			p = TCalendar.getAbsolutePos(cc);
			var CX1 = p.x;
			var CX2 = cc.offsetWidth + CX1;
			var CY1 = p.y;
			var CY2 = cc.offsetHeight + CY1;

			if (this.hidden || (CX1 > EX2) || (CX2 < EX1) || (CY1 > EY2) || (CY2 < EY1)) {
				if (!cc.__msh_save_visibility) {
					cc.__msh_save_visibility = getVisib(cc);
				}
				cc.style.visibility = cc.__msh_save_visibility;
			} else {
				if (!cc.__msh_save_visibility) {
					cc.__msh_save_visibility = getVisib(cc);
				}
				cc.style.visibility = "hidden";
			}
		}
	}
};

/** Internal function; it displays the bar with the names of the weekday. */
TCalendar.prototype._displayWeekdays = function () {
	var fdow = this.firstDayOfWeek;
	var cell = this.firstdayname;
	var weekend = TCalendar._TT["WEEKEND"];
	for (var i = 0; i < 7; ++i) {
		cell.className = "day name";
		var realday = (i + fdow) % 7;
		if (i) {
			cell.ttip = TCalendar._TT["DAY_FIRST"].replace("%s", TCalendar._DN[realday]);
			cell.navtype = 100;
			cell.calendar = this;
			cell.fdow = realday;
			TCalendar._add_evs(cell);
		}
		if (weekend.indexOf(realday.toString()) != -1) {
			TCalendar.addClass(cell, "weekend");
		}
		cell.innerHTML = TCalendar._SDN[(i + fdow) % 7];
		cell = cell.nextSibling;
	}
};

/** Internal function.  Hides all combo boxes that might be displayed. */
TCalendar.prototype._hideCombos = function () {
	this.monthsCombo.style.display = "none";
	this.yearsCombo.style.display = "none";
};

/** Internal function.  Starts dragging the element. */
TCalendar.prototype._dragStart = function (ev) {
	if (this.dragging) {
		return;
	}
	this.dragging = true;
	var posX;
	var posY;
	if (TCalendar.is_ie) {
		posY = window.event.clientY + document.body.scrollTop;
		posX = window.event.clientX + document.body.scrollLeft;
	} else {
		posY = ev.clientY + window.scrollY;
		posX = ev.clientX + window.scrollX;
	}
	var st = this.element.style;
	this.xOffs = posX - parseInt(st.left);
	this.yOffs = posY - parseInt(st.top);
	with (TCalendar) {
		addEvent(document, "mousemove", calDragIt);
		addEvent(document, "mouseup", calDragEnd);
	}
};
// full day names
var wsCalendar=TCalendar;
wsCalendar._DN = new Array
("Воскресенье",
 "Понедельник",
 "Вторник",
 "Среда",
 "Четверг",
 "Пятница",
 "Суббота",
 "Воскресенье");

// short day names
wsCalendar._SDN = new Array(
"Вс",
 "Пн",
 "Вт",
 "Ср",
 "Чт",
 "Пт",
 "Сб",
 "Вс");
var index;
var len=wsCalendar._DN.length;
/*for(index=0;index<len;index++){
	wsCalendar._SDN[index]=wsCalendar._DN[index].substring(0,3);
}*/

//Calendar._SDN = new Array("Sun","Mon","Tue","Wed","Thu","Fri","Sat","Sun");
// First day of the week. "0" means display Sunday first, "1" means display
// Monday first, etc.
wsCalendar._FD = 0;
// full month names
wsCalendar._MN = new Array
("Январь",
 "Февраль",
 "Март",
 "Апрель",
 "Май",
 "Июнь",
 "Июль",
 "Август",
 "Сентябрь",
 "Октябрь",
 "Ноябрь",
 "Декабрь");

// short month names
wsCalendar._SMN = new Array
("Янв",
 "Фев",
 "Мар",
 "Апр",
 "Май",
 "Июн",
 "Июл",
 "Авг",
 "Сен",
 "Окт",
 "Ноя",
 "Дек");

// tooltips
wsCalendar._TT = {};
wsCalendar._TT["INFO"] = "Календарь - предназначен для ввыбора даты и времени";
wsCalendar._TT["ABOUT"] =
"Выбор даты:\n" +
"- Используйте кнопки \xab и \xbb для выбора года\n" +
"- Удерживайте кнопку нажатой для выбора из списка.";
wsCalendar._TT["ABOUT_TIME"] = "\n\n" +
"Выбор времени:\n" +
"- Нажмите на любой элемент для его увеличения\n" +
"- или нажмите удерживая Shift для его уменьшения\n" +
"- или нажмите и тяните для быстрого выбора.";

wsCalendar._TT["PREV_YEAR"] = "Предыдущий год (удерживайте для меню)";
wsCalendar._TT["PREV_MONTH"] = "Предыдущий месяц (удерживайте для меню)";
wsCalendar._TT["GO_TODAY"] = "Перейти на текущий день";
wsCalendar._TT["NEXT_MONTH"] = "Следующий месяц (удерживайте для меню)";
wsCalendar._TT["NEXT_YEAR"] = "Следующий год (удерживайте для меню)";
wsCalendar._TT["SEL_DATE"] = "Выбор даты";
wsCalendar._TT["DRAG_TO_MOVE"] = "Тяните для перемещения";
wsCalendar._TT["PART_TODAY"] = " (today)";

// the following is to inform that "%s" is to be the first day of week
// %s will be replaced with the day name.
wsCalendar._TT["DAY_FIRST"] = "Отобразить %s первым";

// This may be locale-dependent.  It specifies the week-end days, as an array
// of comma-separated numbers.  The numbers are from 0 to 6: 0 means Sunday, 1
// means Monday, etc.
wsCalendar._TT["WEEKEND"] = "0,6";

wsCalendar._TT["CLOSE"] = "Закрыть";
wsCalendar._TT["TODAY"] = "Сегодня";
wsCalendar._TT["TIME_PART"] = "(Shift-)Click или тяните для изменения времени";

// date formats
wsCalendar._TT["DEF_DATE_FORMAT"] = "%Y-%m-%d";
wsCalendar._TT["TT_DATE_FORMAT"] = "%a, %b %e";

wsCalendar._TT["WK"] = "";
wsCalendar._TT["TIME"] = "Время:";
// BEGIN: DATE OBJECT PATCHES

/** Adds the number of days array to the Date object. */
Date._MD = new Array(31,28,31,30,31,30,31,31,30,31,30,31);

/** Constants used for time computations */
Date.SECOND = 1000 /* milliseconds */;
Date.MINUTE = 60 * Date.SECOND;
Date.HOUR   = 60 * Date.MINUTE;
Date.DAY    = 24 * Date.HOUR;
Date.WEEK   =  7 * Date.DAY;

Date.parseDate = function(str, fmt) {
	var today = new Date();
	var y = 0;
	var m = -1;
	var d = 0;
	var a = str.split(/\W+/);
	var b = fmt.match(/%./g);
	var i = 0, j = 0;
	var hr = 0;
	var min = 0;
	for (i = 0; i < a.length; ++i) {
		if (!a[i])
			continue;
		switch (b[i]) {
		    case "%d":
		    case "%e":
			d = parseInt(a[i], 10);
			break;

		    case "%m":
			m = parseInt(a[i], 10) - 1;
			break;

		    case "%Y":
		    case "%y":
			y = parseInt(a[i], 10);
			(y < 100) && (y += (y > 29) ? 1900 : 2000);
			break;

		    case "%b":
		    case "%B":
			for (j = 0; j < 12; ++j) {
				if (TCalendar._MN[j].substr(0, a[i].length).toLowerCase() == a[i].toLowerCase()) {m = j;break;}
			}
			break;

		    case "%H":
		    case "%I":
		    case "%k":
		    case "%l":
			hr = parseInt(a[i], 10);
			break;

		    case "%P":
		    case "%p":
			if (/pm/i.test(a[i]) && hr < 12)
				hr += 12;
			else if (/am/i.test(a[i]) && hr >= 12)
				hr -= 12;
			break;

		    case "%M":
			min = parseInt(a[i], 10);
			break;
		}
	}
	if (isNaN(y)) y = today.getFullYear();
	if (isNaN(m)) m = today.getMonth();
	if (isNaN(d)) d = today.getDate();
	if (isNaN(hr)) hr = today.getHours();
	if (isNaN(min)) min = today.getMinutes();
	if (y != 0 && m != -1 && d != 0)
		return new Date(y, m, d, hr, min, 0);
	y = 0;m = -1;d = 0;
	for (i = 0; i < a.length; ++i) {
		if (a[i].search(/[a-zA-Z]+/) != -1) {
			var t = -1;
			for (j = 0; j < 12; ++j) {
				if (TCalendar._MN[j].substr(0, a[i].length).toLowerCase() == a[i].toLowerCase()) {t = j;break;}
			}
			if (t != -1) {
				if (m != -1) {
					d = m+1;
				}
				m = t;
			}
		} else if (parseInt(a[i], 10) <= 12 && m == -1) {
			m = a[i]-1;
		} else if (parseInt(a[i], 10) > 31 && y == 0) {
			y = parseInt(a[i], 10);
			(y < 100) && (y += (y > 29) ? 1900 : 2000);
		} else if (d == 0) {
			d = a[i];
		}
	}
	if (y == 0)
		y = today.getFullYear();
	if (m != -1 && d != 0)
		return new Date(y, m, d, hr, min, 0);
	return today;
};

/** Returns the number of days in the current month */
Date.prototype.getMonthDays = function(month) {
	var year = this.getFullYear();
	if (typeof month == "undefined") {
		month = this.getMonth();
	}
	if (((0 == (year%4)) && ( (0 != (year%100)) || (0 == (year%400)))) && month == 1) {
		return 29;
	} else {
		return Date._MD[month];
	}
};

/** Returns the number of day in the year. */
Date.prototype.getDayOfYear = function() {
	var now = new Date(this.getFullYear(), this.getMonth(), this.getDate(), 0, 0, 0);
	var then = new Date(this.getFullYear(), 0, 0, 0, 0, 0);
	var time = now - then;
	return Math.floor(time / Date.DAY);
};

/** Returns the number of the week in year, as defined in ISO 8601. */
Date.prototype.getWeekNumber = function() {
	var d = new Date(this.getFullYear(), this.getMonth(), this.getDate(), 0, 0, 0);
	var DoW = d.getDay();
	d.setDate(d.getDate() - (DoW + 6) % 7 + 3); // Nearest Thu
	var ms = d.valueOf(); // GMT
	d.setMonth(0);
	d.setDate(4); // Thu in Week 1
	return Math.round((ms - d.valueOf()) / (7 * 864e5)) + 1;
};

/** Checks date and time equality */
Date.prototype.equalsTo = function(date) {
	return ((this.getFullYear() == date.getFullYear()) &&
		(this.getMonth() == date.getMonth()) &&
		(this.getDate() == date.getDate()) &&
		(this.getHours() == date.getHours()) &&
		(this.getMinutes() == date.getMinutes()));
};

/** Set only the year, month, date parts (keep existing time) */
Date.prototype.setDateOnly = function(date) {
	var tmp = new Date(date);
	this.setDate(1);
	this.setFullYear(tmp.getFullYear());
	this.setMonth(tmp.getMonth());
	this.setDate(tmp.getDate());
};
Date.prototype.clearTime = function() {
	this.setHours(0, 0, 0, 0);
};

/** Prints the date in a string according to the given format. */
Date.prototype.print = function (str) {
	var m = this.getMonth();
	var d = this.getDate();
	var y = this.getFullYear();
	var wn = this.getWeekNumber();
	var w = this.getDay();
	var s = {};
	var hr = this.getHours();
	var pm = (hr >= 12);
	var ir = (pm) ? (hr - 12) : hr;
	var dy = this.getDayOfYear();
	if (ir == 0)
		ir = 12;
	var min = this.getMinutes();
	var sec = this.getSeconds();
	s["%a"] = TCalendar._SDN[w]; // abbreviated weekday name [FIXME: I18N]
	s["%A"] = TCalendar._DN[w]; // full weekday name
	s["%b"] = TCalendar._SMN[m]; // abbreviated month name [FIXME: I18N]
	s["%B"] = TCalendar._MN[m]; // full month name
	// FIXME: %c : preferred date and time representation for the current locale
	s["%C"] = 1 + Math.floor(y / 100); // the century number
	s["%d"] = (d < 10) ? ("0" + d) : d; // the day of the month (range 01 to 31)
	s["%e"] = d; // the day of the month (range 1 to 31)
	// FIXME: %D : american date style: %m/%d/%y
	// FIXME: %E, %F, %G, %g, %h (man strftime)
	s["%H"] = (hr < 10) ? ("0" + hr) : hr; // hour, range 00 to 23 (24h format)
	s["%I"] = (ir < 10) ? ("0" + ir) : ir; // hour, range 01 to 12 (12h format)
	s["%j"] = (dy < 100) ? ((dy < 10) ? ("00" + dy) : ("0" + dy)) : dy; // day of the year (range 001 to 366)
	s["%k"] = hr;		// hour, range 0 to 23 (24h format)
	s["%l"] = ir;		// hour, range 1 to 12 (12h format)
	s["%m"] = (m < 9) ? ("0" + (1+m)) : (1+m); // month, range 01 to 12
	s["%M"] = (min < 10) ? ("0" + min) : min; // minute, range 00 to 59
	s["%n"] = "\n";		// a newline character
	s["%p"] = pm ? "PM" : "AM";
	s["%P"] = pm ? "pm" : "am";
	// FIXME: %r : the time in am/pm notation %I:%M:%S %p
	// FIXME: %R : the time in 24-hour notation %H:%M
	s["%s"] = Math.floor(this.getTime() / 1000);
	s["%S"] = (sec < 10) ? ("0" + sec) : sec; // seconds, range 00 to 59
	s["%t"] = "\t";		// a tab character
	// FIXME: %T : the time in 24-hour notation (%H:%M:%S)
	s["%U"] = s["%W"] = s["%V"] = (wn < 10) ? ("0" + wn) : wn;
	s["%u"] = w + 1;	// the day of the week (range 1 to 7, 1 = MON)
	s["%w"] = w;		// the day of the week (range 0 to 6, 0 = SUN)
	// FIXME: %x : preferred date representation for the current locale without the time
	// FIXME: %X : preferred time representation for the current locale without the date
	s["%y"] = ('' + y).substr(2, 2); // year without the century (range 00 to 99)
	s["%Y"] = y;		// year with the century
	s["%%"] = "%";		// a literal '%' character

	var re = /%./g;
	if (!TCalendar.is_ie5 && !TCalendar.is_khtml)
		return str.replace(re, function (par) {return s[par] || par;});

	var a = str.match(re);
	for (var i = 0; i < a.length; i++) {
		var tmp = s[a[i]];
		if (tmp) {
			re = new RegExp(a[i], 'g');
			str = str.replace(re, tmp);
		}
	}

	return str;
};
//TODO: перекрывалось с МИС и уходил в рекурсию. Сделать другой календарь!
if(Date.prototype.__msh_oldSetFullYear)
{
    Date.prototype.__msh_oldSetFullYear = Date.prototype.setFullYear;
    Date.prototype.setFullYear = function(y) {
            var d = new Date(this);
            d.__msh_oldSetFullYear(y);
            if (d.getMonth() != this.getMonth())
                    this.setDate(28);
            this.__msh_oldSetFullYear(y);
    };
}
// END: DATE OBJECT PATCHES
// global object that remembers the calendar
window._dynarch_popupCalendar = null;

function selectedCalendar(cal, date){
        var newdate = new Date(cal.date);
        newdate.clearTime();
	if (cal.timeClicked || cal.dateClicked || (cal.activeDiv.navtype == 0 && cal._oldDate && newdate.equalsTo(cal._oldDate)))
        {
            D3Api.setControlPropertyByDom(cal.ctrl,'value',date,undefined,true);
			if (!(cal.dateClicked && cal.showsTime || cal.timeClicked))
				cal.callCloseHandler();
        }
        cal._oldDate = new Date(newdate);
        newdate = null;
}

function closeCalendar(cal)
{
	if(D3Api.empty(cal.element)) return;
	cal.hide();
	if(D3Api.empty(cal.element.parentNode)) return;
	cal.element.parentNode.removeChild(cal.element);
	_dynarch_popupCalendar = null;
}
D3Api.DateEditCtrl = new function DateEditCtrl()
{
    this.init = function(_dom)
    {
        var inp = D3Api.DateEditCtrl.getInput(_dom);
        D3Api.addEvent(inp, 'change', function(event){D3Api.setControlPropertyByDom(_dom,'value',D3Api.DateEditCtrl.getValue(_dom),undefined,true);D3Api.stopEvent(event);}, true);
		this.init_focus(inp);
        D3Api.BaseCtrl.initEvent(_dom,'onchange');
        _dom.D3Base.addEvent('onchange_property',function(property,value){
            if(property == 'value')
            {
                _dom.D3Base.callEvent('onchange');
                //D3Api.execDomEvent(_dom,'onchange');
            }
        });
		_dom.showsTime = D3Api.getProperty(_dom, 'shows_time', '') == 'shows_time';
		_dom.dateFormat = _dom.showsTime ? '%d.%m.%Y %H:%M' : '%d.%m.%Y';
        if(D3Api.getProperty(_dom,'today',false) == 'true')
        {
            D3Api.setControlPropertyByDom(_dom,'value',(new Date()).print(_dom.dateFormat));
        }
    }
    this.getInput = function DateEdit_getInput(_dom)
    {
        return D3Api.getChildTag(_dom,'input',0);
    }
    this.setEnabled = function DateEdit_setEnabled(_dom, _value)
    {
        var input = D3Api.DateEditCtrl.getInput(_dom);
        //делаем активным
        if (D3Api.getBoolean(_value))
        {
            input.removeAttribute('disabled');
        }//делаем неактивным
        else
        {
            input.setAttribute('disabled','disabled');
        }
        D3Api.BaseCtrl.setEnabled(_dom,_value);
    }
    this.getValue = function DateEdit_getValue(_dom)
    {
    	var v = D3Api.DateEditCtrl.getInput(_dom).value;
    	if (v == '') return null;
    	return v;
    }
    this.setValue = function DateEdit_setValue(_dom,_value)
    {
        if(_value == null || _value == '')
        {
            D3Api.DateEditCtrl.getInput(_dom).value = '';
        }else
        {
            var _date = Date.parseDate(_value, _dom.dateFormat);
            D3Api.DateEditCtrl.getInput(_dom).value=_date.print(_dom.dateFormat);
        }
    }
    this.getDate = function(_dom)
    {
        return Date.parseDate(D3Api.DateEditCtrl.getInput(_dom).value, _dom.dateFormat);
    }
    this.getCaption = function DateEdit_getCaption(_dom)
    {
        return D3Api.DateEditCtrl.getInput(_dom).value;
    }
    this.setCaption = function DateEdit_setCaption(_dom,_value)
    {
        D3Api.DateEditCtrl.getInput(_dom).value=(_value == null)?'':_value;
    }
    this.getReadonly = function DateEdit_getReadonly(_dom)
    {
        return D3Api.hasProperty(DateEditCtrl.getInput(_dom),'readonly');
    }
    this.setReadonly = function DateEdit_setReadonly(_dom,_value)
    {
        if (D3Api.getBoolean(_value))
        {
            D3Api.DateEditCtrl.getInput(_dom).setAttribute('readonly','readonly');
        }else
        {
            D3Api.DateEditCtrl.getInput(_dom).removeAttribute('readonly','readonly');
        }
    }
    this.showCalendar = function(_dom)
    {
		/**
		 * размещаем элемент в конец дом объекта формы.
		 **/
		var div = document.createElement('div');
		_dom.D3Form.DOM.appendChild(div);

        var input=D3Api.DateEditCtrl.getInput(_dom);

        if (_dynarch_popupCalendar != null) {
                _dynarch_popupCalendar.hide();
        } else {
			var cal = new TCalendar(1, null, selectedCalendar, closeCalendar);
			cal.showsTime = _dom.showsTime;
			_dynarch_popupCalendar = cal;

			_dynarch_popupCalendar.setDateFormat(_dom.dateFormat);

			cal.setRange(1000, 2999);
			cal.create(div);
			cal._oldDate = new Date(cal.date);
			cal._oldDate.clearTime();
        }
        _dynarch_popupCalendar.parseDate(input.value);
        _dynarch_popupCalendar.ctrl = _dom;
        _dynarch_popupCalendar.element._parentDOM_ = _dom;
        var pos = D3Api.getAbsoluteClientRect(input,true,false);
            _dynarch_popupCalendar.showAt(pos.x, pos.y);

        var cal_rect = D3Api.getAbsoluteClientRect(_dynarch_popupCalendar.element);
        var cal_dom = _dynarch_popupCalendar.element;

            var sX = D3Api.getBodyScrollLeft();
        var sY = D3Api.getBodyScrollTop();

        var page = D3Api.getPageWindowSize();

        cal_rect.x = pos.x+pos.width-cal_rect.width;
        cal_rect.y = pos.y+pos.height;

        var h = page.windowHeight+sY;
        var w = page.windowWidth+sX;

        //Растояние внизу окна
        var dH = h - cal_rect.y;
        //Растояние вверху окна
        var uH = pos.y - sY;

        var mcY = cal_rect.y+cal_rect.height;
        var mcX = cal_rect.x+cal_rect.width;

        if (mcY-h > 0)
        {
          //Если выходит за нижний край
          if(dH > uH)
              cal_rect.height = dH;
          else
          {
              if(cal_rect.height > uH)
                  cal_rect.height = uH;
              cal_rect.y -=cal_rect.height+pos.height;
          }

        }

        // Если выходит за левый край
        if(cal_rect.x < 0) {
        cal_rect.x -= cal_rect.x;
        }

        if (mcX-w > 0)
          cal_rect.x -=mcX-w;

        cal_dom.style.left = cal_rect.x +'px';
        cal_dom.style.top = cal_rect.y+'px';

        return false;
    }
    this.clear = function(dom)
    {
        D3Api.setControlPropertyByDom(dom,'caption','',undefined,true);
        D3Api.setControlPropertyByDom(dom,'value','',undefined,true);
    }
}

D3Api.controlsApi['DateEdit'] = new D3Api.ControlBaseProperties(D3Api.DateEditCtrl);
D3Api.controlsApi['DateEdit']['height'] = undefined;
D3Api.controlsApi['DateEdit']['value']={get:D3Api.DateEditCtrl.getValue,set: D3Api.DateEditCtrl.setValue};
D3Api.controlsApi['DateEdit']['caption']={get:D3Api.DateEditCtrl.getCaption,set:D3Api.DateEditCtrl.setCaption}
D3Api.controlsApi['DateEdit']['enabled'].set = D3Api.DateEditCtrl.setEnabled;
D3Api.controlsApi['DateEdit']['input']={get: D3Api.DateEditCtrl.getInput, type: 'dom'};
D3Api.controlsApi['DateEdit']['readonly']={get:D3Api.DateEditCtrl.getReadonly,set: D3Api.DateEditCtrl.setReadonly};
D3Api.controlsApi['DateEdit']['date']={get: D3Api.DateEditCtrl.getDate};
D3Api.EditCtrl = new function ()
{
    this.decimalSeparator = (1.1).toLocaleString().substring(1, 2);
    this.thousandSeparator = (1000).toLocaleString().substring(1, 2);

    this.init = function(_dom)
    {
        var inp = D3Api.EditCtrl.getInput(_dom);
        this.init_focus(inp);

        D3Api.addEvent(inp, 'change', function(event){
            D3Api.stopEvent(event);

        }, true);

        D3Api.BaseCtrl.initEvent(_dom,'onchange');
        D3Api.BaseCtrl.initEvent(_dom,'onformat');

        _dom.D3Base.addEvent('onchange_property',function(property,value){
            if (property == 'caption')
            {
                _dom.D3Base.callEvent('onchange');
                //D3Api.execDomEvent(_dom,'onchange');
            }
        });

        _dom.D3Store.trim = D3Api.getProperty(_dom,'trim',false) == 'true';

        D3Api.addEvent(inp, 'focus', function()
        {
            /* если есть форматирование, то отображаем с учетом этого форматирования */
            if (_dom.D3Base.events['onformat']) {
                if (_dom.D3Store._properties_ && _dom.D3Store._properties_.value) {
                    _dom.D3Base.callEvent('onformat', _dom.D3Store._properties_.value);
                    if (_dom._internalFormatted !== undefined) {
                        inp.value = _dom._internalFormatted;
                    }
                }
            }
        }, true);

        D3Api.addEvent(inp, 'blur', function(event)
        {
            /* если есть форматирование */
            if (_dom.D3Base.events['onformat']){

                /* Если есть маска, то проверяем ее на валидность. Если невалидна - обнуляем значение */
                if (_dom.D3Store.D3MaskParams) {
                    if (!_dom.D3Store.D3MaskParams.valid()) {
                        _dom.D3Store._properties_.value = null;
                        return;
                    }
                }

                /* Обновляем внутреннее значение */
                _dom.D3Base.callEvent('onformat', inp.value);
                _dom.D3Store._properties_ = _dom.D3Store._properties_ || {};
                if (_dom._internalValue !== undefined) {
                    _dom.D3Store._properties_.value = _dom._internalValue;
                }
            }

            /* Если есть маска, то событие отрабатывает там */
            if (_dom.D3Store.D3MaskParams) return;

            D3Api.setControlPropertyByDom(_dom,'caption', _dom._internalValue || inp.value,undefined,true);
            D3Api.stopEvent(event);

        }, true);

        D3Api.EditCtrl.setPlaceHolder(_dom);
    }

    /**
     * Преобразует число к строке, используя локаль
     * @param dom
     * @param settings
     *  settings.toType - number | date | hours
     *  settings.hideZero - скрывать ли нулевые значения (по умолчанию показываются)
     *  settings.showNull - показывать ли значения null (если true, то приводятся к числу. По умолчанию скрываются)
     *  settings.mask - (для даты) - маска, например, 'd.m.Y'
     *  settings.options - описание тут: https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Number/toLocaleString
     * @param value
     *
     * Пример использования в <cmpEdit>: <cmpEdit onformat="D3Api.EditCtrl.format(this, {toType : 'number',  showNull:true, options : {minimumFractionDigits:2}}, arguments[0]);"/>
     *
     */
    this.format = function (dom, settings, value){
        dom._formatted = true; // для случаев когда не успевает сработать onblur
        var ev  = D3Api.getEvent();
        var eventType = ev && ev.type ? ev.type : 'other';

        if (settings.toType === 'number'){
            if (value){
                /* преобразуем строку к числу с плавающей точкой */
                value = String(value).replace(/\s*/g,''); // убираем пробелы
                value = String(value).replace(new RegExp('\\'+this.thousandSeparator,'g'),''); // убираем разделители групп разрядов
                value = String(value).replace(new RegExp('\\'+this.decimalSeparator,'g'),'.'); // заменяем разделитель дробной части на православный

                if (settings.hideZero && Number(value) == 0){
                    dom._internalValue = 0;
                    dom._formattedValue = '';
                    dom._internalFormatted = String(Number(value)).replace(new RegExp('\\.', 'g'), this.decimalSeparator);
                }
                else{
                    dom._internalValue = Number.isFinite(Number(value)) ? value : null;
                    dom._formattedValue =  Number.isFinite(Number(value)) ? Number(value).toLocaleString(settings.locales, settings.options) : undefined;
                    dom._internalFormatted =  Number.isFinite(Number(value)) ? value.replace(new RegExp('\\.', 'g'), this.decimalSeparator) : undefined;
                }
            }
            else{ // null or 0
                dom._internalValue = Number.isFinite(value) ? value : null;
                if (!Number.isFinite(value) && settings.showNull || Number.isFinite(value) && !settings.hideZero){ // нужно преобразовать к нулю
                    dom._formattedValue = Number(0).toLocaleString(settings.locales, settings.options);
                }
                else{
                    dom._formattedValue = '';
                }
                dom._internalFormatted =  Number.isFinite(value) ? String(Number(value)).replace(new RegExp('\\.', 'g'), this.decimalSeparator) : undefined;
            }
        }else if (settings.toType === 'date'){
            if (value){
                value = String(value).trim();
                var regex = /^(\d{2})\.(\d{2})\.(\d{4})(?:\s(\d{2})(?::(\d{2})(?::(\d{2})(?:\.(\d{6}))?)?)?)?$/;
                var valueDate, dateMatch;

                try{
                    if (!regex.test(value)) throw 'Неверный формат даты/времени: '+value;
                    dateMatch = value.match(/^(\d{2})\.(\d{2})\.(\d{4})(?=\s(\d{2}):(\d{2}):(\d{2})|)/);
                    valueDate = new Date(dateMatch[3], dateMatch[2] - 1, dateMatch[1], dateMatch[4] || 0, dateMatch[5] || 0, dateMatch[6] || 0);
                    if (!dateMatch[4] && !settings.mask && !settings.options) settings.options = {year:'numeric', month:'numeric', day:'numeric'}; // не показываем время для обычной даты
                }
                catch(e){
                    D3Api.debug_msg(e);
                    value = dom._internalValue; // оставляем значение как было

                    if (value){
                        dateMatch = value.match(/^(\d{2})\.(\d{2})\.(\d{4})(?=\s(\d{2}):(\d{2}):(\d{2})|)/);
                        valueDate = new Date(dateMatch[3], dateMatch[2] - 1, dateMatch[1], dateMatch[4] || 0, dateMatch[5] || 0, dateMatch[6] || 0);
                        if (!dateMatch[4] && !settings.mask && !settings.options) settings.options = {year:'numeric', month:'numeric', day:'numeric'}; // не показываем время для обычной даты
                    }
                    else{
                        dom._internalValue = undefined;
                        dom._formattedValue = '';
                        dom._internalFormatted = '';
                        return;
                    }
                }

                if (value && settings.mask){
                    dom._internalValue = value;
                    dom._formattedValue = D3Api.parseDate(settings.mask, valueDate/1000);
                    dom._internalFormatted = value;
                }
                else{
                    if (value && value.toLocaleString) {
                        dom._internalValue = value;
                        dom._formattedValue = valueDate.toLocaleString(settings.locales, settings.options);
                        dom._internalFormatted = value;
                    }
                }
            }
            else{
                dom._internalValue = undefined;
                dom._formattedValue = '';
                dom._internalFormatted = '';
            }
        }
        else if (settings.toType === 'hours'){
            if (value){
                if (eventType == 'focus'){
                    dom._internalFormatted = D3Api.hours2time(dom._internalValue, settings.withSeconds);
                    return;
                }
                else if (eventType == 'blur'){
                    value = String(value).trim();
                    var regex = /^(\d{1,})(?::(\d{1,})(?::(\d{1,}))?)?$/;

                    try{
                        if (!regex.test(value)) throw 'Неверный формат временного интервала: '+value;
                        match = value.match(/^(\d{1,})(?::(\d{1,})(?::(\d{1,}))?)?/);

                        dom._internalValue =  +(match[1] | 0) + (match[2] | 0) / 60 + (match[3] | 0) / 3600;
                        dom._formattedValue = D3Api.hours2time(dom._internalValue, settings.withSeconds);
                        dom._internalFormatted =  dom._formattedValue;
                    }
                    catch(e){
                        D3Api.debug_msg(e);

                        // оставляем значение как было
                        if (dom._internalValue){
                            dom._formattedValue = D3Api.hours2time(dom._internalValue, settings.withSeconds);
                            dom._internalFormatted = dom._formattedValue;
                        }
                        else{
                            dom._internalValue = undefined;
                            dom._formattedValue = '';
                            dom._internalFormatted = '';
                        }
                    }
                }
                else { // setValue/setCaption - не иначе...
                    dom._internalValue = value;
                    dom._formattedValue = D3Api.hours2time(value, settings.withSeconds);
                    dom._internalFormatted = dom._formattedValue;
                }
            }
            else{
                dom._internalValue = undefined;
                dom._formattedValue = '';
                dom._internalFormatted = '';
            }
        }
    };

    this.setPlaceHolder = function(dom,value)
    {
        var inp = D3Api.EditCtrl.getInput(dom);
        if(value !== undefined)
        {
            D3Api.setProperty(dom, 'placeholder', value);
            D3Api.setProperty(inp, 'placeholder', value);
        }
        if(inp.initPH)
        {
            setPh(inp);
            return;
        }
        inp._ph_ = false;
        if(D3Api.hasProperty(dom, 'placeholder') && !("placeholder" in document.createElement( "input" )))
        {
            inp.initPH = true;
            inp._ph_ = D3Api.getProperty(dom, 'placeholder');
            inp._pswd_ = D3Api.getProperty(inp,'type') == 'password';
            if (D3Api.BROWSER.msie && inp._pswd_ && inp.outerHTML) {
                inp._fp_ = D3Api.createDom(inp.outerHTML.replace(/type=(['"])?password\1/gi, 'type=$1text$1'));
                D3Api.hideDom(inp._fp_);
                D3Api.addDom(inp.parentNode,inp._fp_);
                inp._fp_.value = inp._ph_;
                D3Api.addEvent(inp._fp_, 'focus', function(){D3Api.hideDom(inp._fp_);D3Api.setDomDisplayDefault(inp);inp.focus();}, true);
            }
            setPh(inp);
            D3Api.addEvent(inp, 'blur', phBlur, true);
            D3Api.addEvent(inp, 'focus', phFocus, true);
            if(inp.form)
                D3Api.addEvent(inp.form, 'submit', phFormSubmit, true);
        }
    }
    function phBlur(e)
    {
        var inp = D3Api.getEventTarget(e);
        setPh(inp);
    }
    function setPh(inp)
    {
        if(inp._ph_ === false)
            return;
        if(inp.value == '')
        {
            if(inp._pswd_)
            {
                try
                {
                    D3Api.setProperty(inp,'type','text');
                }catch(e)
                {
                    D3Api.hideDom(inp);
                    D3Api.setDomDisplayDefault(inp._fp_);
                    return;
                }
            }
            inp.value = inp._ph_;
        }
    }
    function phFocus(e)
    {
        var inp = D3Api.getEventTarget(e);
        unSetPh(inp);
    }
    function unSetPh(inp)
    {
        if(inp._ph_ === false)
            return;
        if(inp.value == inp._ph_)
        {
            if(inp._pswd_)
            {
                try
                {
                    D3Api.setProperty(inp,'type','password');
                }catch(e)
                {

                }
            }
            inp.value = '';
        }
    }
    function phFormSubmit(e)
    {

    }
    this.getInput = function Edit_getInput(_dom)
    {
        return D3Api.getChildTag(_dom,'input',0);
    }
    this.setEnabled = function Edit_setEnabled(_dom, _value)
    {
        var input = D3Api.EditCtrl.getInput(_dom);
        //делаем активным
        if (D3Api.getBoolean(_value))
        {
            input.removeAttribute('disabled');
        }//делаем неактивным
        else
        {
            input.setAttribute('disabled','disabled');
        }
        D3Api.BaseCtrl.setEnabled(_dom,_value);
    }

    this.getMaskProperty = function()
    {
        return 'caption';
    }

    this.getDependencesProperty = function()
    {
        return 'caption';
    }

    this.getValue = function Edit_getValue(_dom)
    {
        var inp = D3Api.EditCtrl.getInput(_dom);
        var res = inp.value;

        /* если есть форматирование, то берем значение из свойства */
        if (_dom.D3Base.events['onformat']){
            if (_dom.D3Store._properties_)
                res = _dom.D3Store._properties_.value;
        }

        if (_dom.D3Store.trim) {
            res = D3Api.stringTrim(res);
        }

        return res;
    }

    this.setValue = function Edit_setValue(_dom,_value)
    {
        if (_value === undefined) _value = null;

        _dom.D3Store._properties_ = _dom.D3Store._properties_ || {};
        _dom.D3Store._properties_.value == _value;

        /* необходимо, чтобы срабатывало событие onchange_property */
        D3Api.setControlPropertyByDom(_dom,'caption',_value);

        if (D3Api.hasClass(_dom, 'focus')){
            var inp = D3Api.EditCtrl.getInput(_dom);

            if (_dom._internalFormatted !== undefined) {
                inp.value = _dom._internalFormatted;
            }
        }
    }

    /* Берем значение поля ввода с учетом того, что там может быть PlaceHolder */
    this.getCaption = function Edit_getCaption(_dom)
    {
        var inp = D3Api.EditCtrl.getInput(_dom);
        var res = (inp._ph_ && inp.value == inp._ph_)?'':((inp.value == null)?'':inp.value);

        return res;
    }
    this.setCaption = function Edit_setCaption(_dom,_value)
    {
        var inp = D3Api.EditCtrl.getInput(_dom);
        unSetPh(inp);

        /* если есть форматирование - обновляем внутреннее значение и отображение */
        if (_dom.D3Base.events['onformat']) {

            _dom.D3Base.callEvent('onformat', _value);

            _dom.D3Store._properties_ = _dom.D3Store._properties_ || {};
            if (_dom._internalValue !== undefined) {
                _dom.D3Store._properties_.value = _dom._internalValue;
            }
            else {
                _dom.D3Store._properties_.value = _value;
            }

            if (_dom._formattedValue !== undefined) {
                _value = _dom._formattedValue;
            }
        }

        inp.value=_value;
        setPh(inp);
    }
    this.getReadonly = function Edit_getReadonly(_dom)
    {
        return D3Api.hasProperty(D3Api.EditCtrl.getInput(_dom),'readonly');
    }
    this.setReadonly = function Edit_setReadonly(_dom,_value)
    {
        if (_value)
        {
            D3Api.EditCtrl.getInput(_dom).setAttribute('readonly','readonly');
        }else
        {
            D3Api.EditCtrl.getInput(_dom).removeAttribute('readonly','readonly');
        }
    }
}

D3Api.controlsApi['Edit'] = new D3Api.ControlBaseProperties(D3Api.EditCtrl);
D3Api.controlsApi['Edit']['height'] = undefined;
D3Api.controlsApi['Edit']['value']={get:D3Api.EditCtrl.getValue,set: D3Api.EditCtrl.setValue};
D3Api.controlsApi['Edit']['caption']={get:D3Api.EditCtrl.getCaption,set:D3Api.EditCtrl.setCaption}
D3Api.controlsApi['Edit']['enabled'].set = D3Api.EditCtrl.setEnabled;
D3Api.controlsApi['Edit']['input']={get: D3Api.EditCtrl.getInput, type: 'dom'};
D3Api.controlsApi['Edit']['readonly']={get:D3Api.EditCtrl.getReadonly,set: D3Api.EditCtrl.setReadonly};
D3Api.controlsApi['Edit']['placeholder']={set: D3Api.EditCtrl.setPlaceHolder};
D3Api.GridCtrl = new function (){
    this.init = function (dom){
        this.init_focus(dom);
        var row = D3Api.getDomByAttr(dom, 'cont', 'gridrow');
        dom.D3Store.rowTpl = row.D3Repeater;
        D3Api.showDom(dom.D3Store.rowTpl.DOM, false);
        dom.D3Store.dataSetName = D3Api.getProperty(dom, 'dataset', '');
        dom.D3Store.waitDom = D3Api.getDomByAttr(dom, 'cont', 'grid_wait');
        dom.D3Store.profile = D3Api.getBoolean(D3Api.getProperty(dom, 'profile', 'true'));
        dom.D3Store.excel = D3Api.getBoolean(D3Api.getProperty(dom, 'excel', 'false'));
        dom.D3Store.export_template = D3Api.getProperty(dom, 'export_template', 'Modules/ExportByDataset/template.ods'); // шаблон для выгрузки в LibreOffice
        dom.D3Store.export_header = D3Api.getProperty(dom, 'export_header', '{}'); // дополнительные переменные для передачи в шаблон
        dom.D3Store.columns_to_sum = D3Api.getProperty(dom, 'columns_to_sum', []);// колонки для суммирования
        dom.D3Store.repeaterName = D3Api.BaseCtrl.getName(dom) + '_repeater';
        dom.D3Store.popupMenu = D3Api.getProperty(dom, 'popupmenu') || D3Api.getProperty(dom, 'popupmenu_actions');
        dom.D3Store.popup_log_unit = D3Api.getProperty(dom, 'popup_log_unit', null);
        dom.D3Store._conts_ = {};
        dom.D3Store._conts_.data = D3Api.getDomByAttr(dom, 'cont', 'griddata');
        dom.D3Store._conts_.datacont = D3Api.getDomByAttr(dom, 'cont', 'griddatacont');
        dom.D3Store._conts_.columns = D3Api.getDomByAttr(dom, 'cont', 'gridcolumns');
        dom.D3Store._conts_.columnscont = D3Api.getDomByAttr(dom, 'cont', 'gridcolumnscont');
        dom.D3Store._conts_.filters = D3Api.getDomByAttr(dom, 'cont', 'gridfilter');
        dom.D3Store._conts_.windowfunction = D3Api.getDomByAttr(dom, 'cont', 'gridwindowfunction');
        dom.D3Store._conts_.filterpanel = D3Api.getDomByAttr(dom, 'cont', 'gridfilterpanel');
        dom.D3Store.cols = [];

        var dataSet = dom.D3Form.getDataSet(dom.D3Store.dataSetName);
        var repeater = dom.D3Form.getRepeater(dom.D3Store.repeaterName);
        var range = D3Api.getDomByAttr(dom, 'cmptype', 'Range');
        var griddatainfo = D3Api.getDomByAttr(dom, 'cont', 'griddatainfo');
        var showfilter = D3Api.getProperty(dom, 'showfilter', 'false') != 'false';

        D3Api.BaseCtrl.initEvent(dom, 'onprofile_change');
        if(range){
            range.D3Base.addEvent('onamount', function (amount){
                repeater.setAsync(amount);
            });

            dom.D3Store.range = range;
        }else if(dataSet){
            dataSet.addEvent('ondatapos_change', function (position){
                repeater.setAsync(Math.max(position, 50));
            });
        }

        if(griddatainfo && dataSet){
            if(dom.D3Store._conts_.filters && showfilter){
                D3Api.addTextNode(griddatainfo, 'Необходимо установить фильтр', true);
                D3Api.showDomBlock(griddatainfo);
            }

            dataSet.addEvent('onbefore_refresh', function (){
                if(repeater.clones().length > 0){
                    return;
                }
                D3Api.addTextNode(griddatainfo, 'В ожидании...', true);
                D3Api.showDomBlock(griddatainfo);
            });
            dataSet.addEvent('onafter_refresh', function (){
                if(repeater.clones().length > 0){
                    D3Api.setDomDisplayDefault(griddatainfo);
                }else{
                    D3Api.addTextNode(griddatainfo, 'Нет данных', true);
                    D3Api.showDomBlock(griddatainfo);
                }
            });
            repeater.addEvent('onafter_clone', function (){
                D3Api.setDomDisplayDefault(griddatainfo);
            });
        }

        var cols = D3Api.getAllDomBy(dom.D3Store._conts_.columns, 'td[column_name]');
        for (var i = 0, c = cols.length; i < c; i++) {
            var f = D3Api.getProperty(cols[i], 'cont');
            var SelList = D3Api.getDomBy(cols[i], 'div[cmptype="SelectList"]');
            var colInfo = {
                name: D3Api.getProperty(cols[i], 'column_name'),
                field: f,
                caption: D3Api.getTextContent(cols[i]),
                align: undefined,
                doms: [],
                defaultShow: true,
                _show: true,
                _sl: SelList != null//является колонкой селектлиста
            };
            if(SelList){
                if(!('range' in dom.D3Store) || !dom.D3Store.range){
                    //если у грида нет постраничной навигации то метод checkAll не запрашивать у бд все айдишки
                    D3Api.setProperty(SelList,'usedom','true');
                }
            }
            var cls = D3Api.getAllDomBy(dom, '[column_name="' + colInfo.name + '"][index]');
            for (var ii = 0, cc = cls.length; ii < cc; ii++) {
                if(cls[ii].nodeName == 'COL'){
                    colInfo.width = cls[ii].width;
                    colInfo.defaultShow = D3Api.getProperty(cls[ii], 'profile_hidden', '') != 'true';
                }
                else if(cls[ii].nodeName == 'TD' && D3Api.hasClass(cls[ii], 'column_data'))
                    colInfo.align = cls[ii].style.textAlign;
                colInfo.doms.push({parentNode: cls[ii].parentNode, col: cls[ii]});
            }
            dom.D3Store.cols.push(colInfo);
        }
        var pM, pMAPI;
        if(dom.D3Store.profile && D3Api.getProperty(dom, 'name')){
            pM = pM || dom.D3Form.getControl(dom.D3Store.popupMenu);
            pMAPI = pMAPI || D3Api.getControlAPIByDom(pM);
            var items = pMAPI.getItems(pM, true);
            dom.D3Store.profilePMItem = pMAPI.addItem(pM, {
                name: dom.D3Store.profilePM,
                caption: 'Профиль',
                icon: '~CmpGrid/profile'
            }, null, 'system');
            var item = pMAPI.addItem(pM, {
                caption: 'Настройка',
                icon: '~CmpGrid/profile_settings',
                onclick: 'D3Api.GridCtrl.openProfile(getControl(\'' + dom.D3Store.popupMenu + '\').D3Store.popupObject);'
            }, dom.D3Store.profilePMItem);
            dom.D3Store.profilePMItem = item.D3Store.parentItem;
            var params = dom.D3Form.getParamsByName('Grid', D3Api.getProperty(dom, 'name'));
            if(params)
                D3Api.GridCtrl.setProfile(dom, undefined, false);
        }
        if(dom.D3Store.popup_log_unit && D3Api.getProperty(dom, 'name')){
            pM = pM || dom.D3Form.getControl(dom.D3Store.popupMenu);
            pMAPI = pMAPI || D3Api.getControlAPIByDom(pM);
            pMAPI.addItem(pM, {
                caption: 'Журнал изменений записи',
                onclick: 'D3Api.showForm(\'System/Logs/logs\', null, {vars: {unit_view_id: getControlProperty(\'' + D3Api.getProperty(dom, 'name') + '\', \'value\'), unit: \'' + dom.D3Store.popup_log_unit + '\'}});',
                icon: '~CmpPopupMenu/Icons/logs'
            }, null, 'system', true);
        }
        if(dom.D3Store.excel){
            pM = pM || dom.D3Form.getControl(dom.D3Store.popupMenu);
            pMAPI = pMAPI || D3Api.getControlAPIByDom(pM);
            var items = pMAPI.getItems(pM, true);
            pMAPI.addItem(pM, {
                caption: 'Выгрузить таблицу',
                onclick: 'D3Api.GridCtrl.exportTBS(getControl(\'' + dom.D3Store.popupMenu + '\').D3Store.popupObject);',
                icon: '~CmpGrid/download'
            }, null, 'system');
        }

        pM = pM || dom.D3Form.getControl(dom.D3Store.popupMenu);
        if(pM){
            pMAPI = pMAPI || D3Api.getControlAPIByDom(pM);
            var items = pMAPI.getItems(pM, true);
            if(items.length == 0){
                var componentname = D3Api.getProperty(dom, 'name', false);
                var refAction = '';
                if(componentname)
                    refAction += 'setControlProperty(\'' + componentname + '\', \'locate\', getValue(\'' + componentname + '\'));';
                refAction += 'refreshDataSet(\'' + dom.D3Store.dataSetName + '\');';
                pMAPI.addItem(pM, {name: dom.D3Store.profilePM, onclick: refAction, caption: 'Обновить'});
            }
        }

        if(dom.D3Store._conts_.filters){
            if(showfilter){
                D3Api.GridCtrl.toggleFilter(dom);
            }
            D3Api.GridCtrl.activateFilter(dom);
        }

        //Вынести из init
        D3Api.BaseCtrl.initEvent(dom, 'onchange');
        /*if(!D3Api.hasProperty(dom,'data'))
         {
         D3Api.setProperty(dom, 'data', '_p_:_f_');
         dom.D3Form.getDataSet(dom.D3Store.dataSetName).addControl(dom);
         }*/
        var notrow = D3Api.getProperty(dom, 'notrow', '');
        var selectlist = D3Api.getProperty(dom, 'selectlist', '');

        if(dataSet && notrow && selectlist){
            dataSet.addEvent('onbefore_refresh', function (type, mode, data){
                if(type == 'mode' && mode == 'fields' && data.fields == selectlist){
                    this.addFilter(notrow, '>0');
                }
            });
        }

        initWindowFunction(dom);
    };
    this.CtrlKeyDown = function (dom, e){
        switch (e.keyCode) {
            case 40: //стрелка вниз - движение по Grid
                var next_row = D3Api.GridCtrl.getNextRow(dom);
                if(next_row){
                    D3Api.GridCtrl.setActiveRow(dom, next_row);
                    next_row.click();
                    var cont = D3Api.getDomByAttr(dom, 'cont', 'griddatacont');
                    cont.scrollTop = next_row.offsetTop - cont.offsetHeight / 2;
                }
                D3Api.stopEvent(e);
                break;
            case 38: //стрелка вверх - движение по Grid
                var next_row = D3Api.GridCtrl.getPreviousRow(dom);
                if(next_row){
                    D3Api.GridCtrl.setActiveRow(dom, next_row);
                    var cont = D3Api.getDomByAttr(dom, 'cont', 'griddatacont');
                    cont.scrollTop = next_row.offsetTop - cont.offsetHeight / 2;
                    next_row.click();
                }
                D3Api.stopEvent(e)
                break;
            case 34: //PageDown - движение по Range
                var range = dom.D3Store.range;
                range && D3Api.RangeCtrl.go(range, 1);
                D3Api.stopEvent(e);
                break;
            case 33: //PageUp - движение по Range
                var range = dom.D3Store.range;
                range && D3Api.RangeCtrl.go(range, -1);
                D3Api.stopEvent(e);
                break;
            case 32: // Space - вызов меню
                var active_row = D3Api.GridCtrl.getActiveRow(dom);
                var top = 0;
                var left = 0;
                var elem = active_row;
                while (elem) {
                    top = top + parseFloat(elem.offsetTop);
                    left = left + parseFloat(elem.offsetLeft);
                    elem = elem.offsetParent;
                }
                var pM = active_row.D3Form.getControl(dom.D3Store.popupMenu);
                var coords = {left: left + 100, top: top};
                pM.D3Form.lastFocusControl = dom;
                D3Api.PopupMenuCtrl.show(pM, coords);
                D3Api.setControlPropertyByDom(pM, 'focus', true);
                D3Api.PopupMenuCtrl.setNextItem(pM, 1);
                D3Api.stopEvent(e);
                break;
            case 13: //Enter - имитация двойного щелчка мыши
                var active_row = D3Api.GridCtrl.getActiveRow(dom);
                if(active_row && typeof(active_row.ondblclick) == 'function'){
                    active_row.ondblclick();
                }
                break;
        }

    }

    function initWindowFunction(dom){
        var elWindowFunction = dom.D3Store._conts_.windowfunction,
            dataSet = dom.D3Form.getDataSet(dom.D3Store.dataSetName);

        if(!elWindowFunction || !dataSet){
            return;
        }
        var cltWF = D3Api.getAllDomBy(elWindowFunction, 'span[wf][wf_field]');

        for (var l = cltWF.length, i = 0; i < l; i++) {
            var wf = D3Api.getProperty(cltWF[i], 'wf'),
                wf_field = D3Api.getProperty(cltWF[i], 'wf_field');

            if(!wf || !wf_field){
                continue;
            }
            dataSet.addWindowFunction(wf_field, wf);
        }
    }

    this.startWait = function (dom){
        //D3Api.showDomBlock(dom.D3Store.waitDom);
    };
    this.stopWait = function (dom){
        //D3Api.hideDom(dom.D3Store.waitDom);
    };
    this.onShow = function GridCtrl_OnShow(dom, name){
        var dna = [];
        var pn = dom;
        while (pn && pn.nodeName != '#document') {
            if(pn.style.display == 'none'){
                pn.style.display = '';
                dna.push(pn);
            }
            pn = pn.parentNode;
        }

        D3Api.GridCtrl.resize(dom);
        D3Api.addEvent(dom.D3Store._conts_.datacont, 'scroll', function (){D3Api.GridCtrl.resize(dom)}, true);
        dom.D3Form.addEvent('onResize', function (){D3Api.GridCtrl.resize(dom)});

        for (var i = 0; i < dna.length; i++) {
            dna[i].style.display = 'none';
        }
        dna = null;
    };
    this.resize = function (dom){
        var sizeScroll = dom.D3Store._conts_.datacont.offsetWidth - dom.D3Store._conts_.datacont.clientWidth - 2; // border: 2px
        dom.D3Store._conts_.columnscont.scrollLeft = dom.D3Store._conts_.datacont.scrollLeft;
        dom.D3Store._conts_.columnscont.style.borderRightWidth = (sizeScroll > 0) ? sizeScroll + 1 + 'px' : ''; // border-right: 1px

        var filters = dom.D3Store._conts_.filters;
        if(filters){
            filters.style.top = dom.D3Store._conts_.datacont.scrollTop + 'px';
            var shiftX = dom.D3Store._conts_.data.offsetWidth - dom.D3Store._conts_.datacont.scrollWidth;
            dom.D3Store._conts_.filterpanel.style.left = dom.D3Store._conts_.datacont.scrollLeft + shiftX + 'px';
        }

        var windowfunction = dom.D3Store._conts_.windowfunction;
        if(windowfunction){
            dom.D3Store._conts_.data.style.marginBottom = windowfunction.offsetHeight + 'px';
            windowfunction.style.bottom = -dom.D3Store._conts_.datacont.scrollTop + 'px';
        }
        D3Api.getDomByAttr(dom, 'cont', 'griddatacont').parentNode.style.paddingTop = D3Api.getDomByAttr(dom, 'cont', 'gridcaption').offsetHeight + dom.D3Store._conts_.columnscont.offsetHeight + "px";
    };
    this.getRowByKey = function (dom, keyvalue){
        var data = D3Api.getDomByAttr(dom, 'cont', 'griddata');
        var rows = D3Api.getAllDomBy(data, 'tr[keyvalue="' + keyvalue + '"]');
        if(rows && rows[0]) return rows[0];
        else return undefined;
    };
    this.getActiveRow = function (dom){
        return dom.D3Store.activeRow;
    };
    this.getNextRow = function (dom){
        var n = dom.D3Store.activeRow.nextSibling;
        if(!n || D3Api.getProperty(n, 'isd3repeater', false))
            return undefined;
        return n;
    };
    this.getPreviousRow = function (dom){
        var n = dom.D3Store.activeRow.previousSibling;
        if(!n || D3Api.getProperty(n, 'isd3repeater', false))
            return undefined;
        return n;
    };
    this.getNearRow = function (dom){
        return D3Api.GridCtrl.getNextRow(dom) || D3Api.GridCtrl.getPreviousRow(dom);
    };
    this.getRows = function (dom){
        return D3Api.getDomByAttr(dom, 'cont', 'griddata').rows;
    };
    this.setActiveRow = function GridCtrl_SetActiveRow(dom, row){
        rowActivate(row);
        var cont = D3Api.getDomByAttr(dom, 'cont', 'griddatacont');
        cont.scrollTop = row.offsetTop - cont.offsetHeight / 2;
    };
    this.activateRow = function GridCtrl_ActivateRow(dom, onchange){
        var _con = D3Api.getControlByDom(dom, 'Grid');

        if(_con.D3Store.activeRow == dom && !onchange){
            return;
        }

        rowActivate(dom);
    };

    function rowActivate(dom){
        /*if (!D3Api.hasProperty(dom, 'keyvalue'))
         return;*/
        var _con = D3Api.getControlByDom(dom, 'Grid');
        if(_con.D3Store.activeRow){
            D3Api.removeClass(_con.D3Store.activeRow, 'active');
        }
        D3Api.addClass(dom, 'active');

        if(dom.clone){
            D3Api.GridCtrl.setData(_con, dom.clone.data);
        }else{
            D3Api.GridCtrl.setData(_con, null);
        }

        _con.D3Store.activeRow = dom;

        D3Api.GridCtrl.setValue(_con, D3Api.getProperty(dom, 'keyvalue'));
        //D3Api.execDomEvent(_con,'onchange');
        _con.D3Base.callEvent('onchange');
    }

    this.setCurrentActiveRow = function GridCtrl_SetActiveRow(dom){
        this.resize(dom);
        var data = D3Api.getDomByAttr(dom, 'cont', 'griddata');
        if(data.rows.length < 2){
            if(dom.D3Store.activeRow){
                D3Api.GridCtrl.setValue(dom, null);
                D3Api.removeClass(dom.D3Store.activeRow, 'active');
                dom.D3Store.activeRow = null;
                D3Api.GridCtrl.setData(dom, null);
                //D3Api.execDomEvent(dom,'onchange');
                dom.D3Base.callEvent('onchange');
            }
            return;
        }
        var actRow = data.rows[0];
        var kv = D3Api.GridCtrl.getValue(dom);
        var lv = D3Api.GridCtrl.getLocate(dom);
        //Попробуем найти у датасета
        if(!lv){
            var ds = dom.D3Form.getDataSet(dom.D3Store.dataSetName);
            if(ds.getPosition() >= 0){
                var d = ds.getData();
                if(d){
                    lv = d[D3Api.getProperty(dom, 'keyfield', '')];
                }
            }
        }
        if(!kv && !lv){
            actRow = data.rows[0];
        }else{
            actRow = D3Api.getDomByAttr(data, 'keyvalue', lv) || D3Api.getDomByAttr(data, 'keyvalue', kv) || data.rows[0];
        }
        if(D3Api.getProperty(actRow, 'isd3repeater', false))
            actRow = data.rows[0];

        rowActivate(actRow);
        var cont = D3Api.getDomByAttr(dom, 'cont', 'griddatacont');
        cont.scrollTop = actRow.offsetTop - cont.offsetHeight / 2;
        D3Api.GridCtrl.setLocate(dom, '');
    };
    this.getValue = function GridCtrl_GetValue(dom){
        return D3Api.getProperty(dom, 'keyvalue', '');
    };
    this.setValue = function GridCtrl_SetValue(dom, value){
        D3Api.setProperty(dom, 'keyvalue', value);
        dom.D3Base.callEvent('onchange_property', 'value', value);
        return true;
    };
    this.getLocate = function GridCtrl_GetLocate(dom){
        return D3Api.getProperty(dom, 'locatevalue', '');
    };
    this.setLocate = function GridCtrl_SetLocate(dom, value){
        D3Api.setProperty(dom, 'locatevalue', value);
        if(!D3Api.empty(value))
            dom.D3Form.getDataSet(dom.D3Store.dataSetName).addEventOnce('onbefore_refresh', function (){
                var lv = D3Api.getProperty(dom, 'locatevalue');
                if(!D3Api.empty(lv))
                    this.setLocate(D3Api.getProperty(dom, 'keyfield', ''), lv);
            });
    };
    this.getData = function GridCtrl_GetData(dom){
        if(dom.D3Store.data)
            return dom.D3Store.data;
        return null;
    };
    this.setData = function GridCtrl_SetData(dom, value){
        return dom.D3Store.data = value;
    };
    this.getCaption = function GridCtrl_GetCaption(dom){
        if(dom.D3Store.activeRow)
            return D3Api.GridRowCtrl.getReturnValue(dom.D3Store.activeRow);
        else
            return '';
    };
    this.setCaption = function GridCtrl_SetCaption(dom, value){

    };
    this.getTitle = function GridCtrl_GetTitle(dom){
        var cont = D3Api.getDomByAttr(dom, 'cont', 'gridcaptioncontent');
        return D3Api.getTextContent(cont);
    };
    this.setTitle = function GridCtrl_SetTitle(dom, value){
        var cont = D3Api.getDomByAttr(dom, 'cont', 'gridcaptioncontent');
        D3Api.addTextNode(cont, D3Api.empty(value) ? '' : value, true);
    };
    this.columnSize = function mousedown(event){
        if(event.which != 1){
            return;
        }

        var startClientX = event.clientX;

        var elCurrentTd = event.currentTarget;
        while (elCurrentTd && !D3Api.hasClass(elCurrentTd, 'column_caption')) {
            elCurrentTd = elCurrentTd.parentElement;
        }

        var elGrid = D3Api.getControlByDom(elCurrentTd, 'Grid');
        var cells = elCurrentTd.parentElement.cells;
        var elLastTd = cells[cells.length - 1];

        var current = {
            el: elCurrentTd,
            width: elCurrentTd.offsetWidth,
            cols: D3Api.getAllDomBy(elGrid, 'col[index="' + D3Api.getProperty(elCurrentTd, 'index') + '"]')
        };
        var last = null;
        if(elCurrentTd !== elLastTd){
            last = {
                el: elLastTd,
                width: elLastTd.offsetWidth,
                cols: D3Api.getAllDomBy(elGrid, 'col[index="' + D3Api.getProperty(elLastTd, 'index') + '"]')
            };
        }
        elCurrentTd = null;
        elLastTd = null;

        var cell, size = 0;
        for (var i = 0; i < cells.length; i++) {
            cell = {
                width: cells[i].offsetWidth,
                cols: D3Api.getAllDomBy(elGrid, 'col[index="' + D3Api.getProperty(cells[i], 'index') + '"]')
            };
            size += cell.width;
            for (var j = 0; j < cell.cols.length; j++) {
                cell.cols[j].width = cell.width;
            }
        }
        cell = null;

        // Притормозим выполнение mousemove
        var brake = {
            status: false
        };

        function dragstart(event){
            event.preventDefault();
        }

        function mousemove(event){
            if(brake.status){
                brake.event = event;
                return;
            }


            var i, shiftX = event.clientX - startClientX;
            var clientWidthColumns = elGrid.D3Store._conts_.columnscont.clientWidth;

            if(shiftX < -current.width + 11){
                shiftX = -current.width + 11;
            }

            if(!last && size + shiftX < clientWidthColumns){
                shiftX = clientWidthColumns - size;
            }

            for (i = 0; i < current.cols.length; i++) {
                current.cols[i].width = current.width + shiftX;
            }
            if(last && shiftX < 0){
                for (i = 0; i < last.cols.length; i++) {
                    last.cols[i].width = last.width - shiftX;
                }
            }

            D3Api.GridCtrl.resize(elGrid);


            brake.status = true;
            setTimeout(function (){
                brake.status = false;
                if(brake.event){
                    mousemove(brake.event);
                    delete brake.event;
                }
            }, 35);
        }

        function mouseup(event){
            D3Api.removeEvent(document, 'dragstart', dragstart);
            D3Api.removeEvent(document, 'mousemove', mousemove);
            D3Api.removeEvent(document, 'mouseup', mouseup);
            elGrid.D3Store._conts_.columns.style.cursor = '';
            D3Api.GridCtrl.onHeaderEndSizeEC(elGrid);
        }

        D3Api.addEvent(document, 'dragstart', dragstart);
        D3Api.addEvent(document, 'mousemove', mousemove);
        D3Api.addEvent(document, 'mouseup', mouseup);
        elGrid.D3Store._conts_.columns.style.cursor = 'e-resize';
        D3Api.getDomByAttr(elGrid, 'cont', 'griddatacont').parentNode.style.paddingTop = D3Api.getDomByAttr(elGrid, 'cont', 'gridcaption').offsetHeight + elGrid.D3Store._conts_.columnscont.offsetHeight + "px";
        event.preventDefault();
    };
    this.onHeaderEndSizeEC = function (dom){
        var params = dom.D3Form.getParamsByName('Grid', D3Api.getProperty(dom, 'name'));
        if(params.profiles instanceof Array){
            params.profiles = {};
        }

        var profile = (params) ? params.profiles[params.profile] : null;
        if(!profile){
            params.profile = 'Пользовательский';
            params.profiles[params.profile] = createDefaultProfile(dom);
            profile = params.profiles[params.profile];
            generateMenuProfiles(dom);
        }
        if(profile){
            var cols = D3Api.getChildTag(dom.D3Store._conts_.columns, 'colgroup', 0).children;

            for (var i = 0; i < cols.length; i++) {
                var col = profile.cols[D3Api.getProperty(cols[i], 'column_name')];

                if(col){
                    col.width = cols[i].width;
                }
            }
        }
    };
    this.titleClick = function (event, name){
        var target = event.srcElement || event.target;

        D3Api.getControlByDom(target, 'Grid');
    };
    this.toggleFilter = function (dom){
        var grid = D3Api.getControlByDom(dom, 'Grid');

        var filter = D3Api.getDomByAttr(grid, 'cont', 'gridfilter');

        D3Api.toggleClass(filter, 'filter-block', 'filter-none');

        if(D3Api.hasProperty(dom, 'fhead_uid')){
            var ctrl = D3Api.getDomByAttr(filter, 'fdata_uid', D3Api.getProperty(dom, 'fhead_uid'));
            D3Api.setControlPropertyByDom(ctrl, 'focus', true);
        }

        D3Api.GridCtrl.resize(grid);
    };
    this.hideFilter = function (dom){
        var grid = D3Api.getControlByDom(dom, 'Grid');
        var filter = D3Api.getDomByAttr(grid, 'cont', 'gridfilter');
        D3Api.toggleClass(filter, 'filter-block', 'filter-none', true);
    };
    this.searchFilter = function (dom, hide){
        var grid = D3Api.getControlByDom(dom, 'Grid');
        D3Api.GridCtrl.activateFilter(dom);
        grid.D3Form.refreshDataSet(grid.D3Store.dataSetName);
        grid.D3Base.callEvent('onfilter');
        if(hide)
            D3Api.GridCtrl.hideFilter(grid);
    };
    this.activateFilter = function (dom){
        var grid = D3Api.getControlByDom(dom, 'Grid');
        var fItems = D3Api.getAllDomBy(grid, '[fdata_uid]');
        var fPrevUid = '';
        var fUid;
        for (var i = 0, ic = fItems.length; i < ic; i++) {
            fPrevUid = fUid;
            fUid = D3Api.getProperty(fItems[i], 'fdata_uid');
            var ctrl = D3Api.getDomByAttr(grid, 'fhead_uid', fUid);
            if(!D3Api.empty(D3Api.getControlPropertyByDom(fItems[i], 'value')))
                D3Api.addClass(ctrl, 'active');
            else if(fPrevUid != fUid)
                D3Api.removeClass(ctrl, 'active');
        }
    };
    this.clearFilter = function (dom, refresh, hide){
        var grid = D3Api.getControlByDom(dom, 'Grid');
        var fi = D3Api.getAllDomBy(grid, "[filteritem]");
        for (var i = 0, c = fi.length; i < c; i++) {
            if(D3Api.getProperty(fi[i], "cmptype") == "ButtonEdit"){
                grid.D3Form.setCaption(fi[i], '');
            }
            grid.D3Form.setValue(fi[i], '');
        }
        if(refresh)
            grid.D3Form.refreshDataSet(grid.D3Store.dataSetName);
        if(hide)
            D3Api.GridCtrl.hideFilter(grid);
    };
    this.filterKeyPress = function (filterItem){
        var e = D3Api.getEvent();
        if(e.keyCode != 13)
            return;

        D3Api.GridCtrl.searchFilter(filterItem, true);
    };
    this.onAfterCloneNotRow = function (clone, nameGrid, notrow){
        if(clone.clone.data[notrow] === undefined || !(+clone.clone.data[notrow])){
            clone.D3Form.removeControl(nameGrid + '_SelectList_Item');
        }
    };
    this.exportTBS = function (dom){
        var grid = D3Api.getControlByDom(dom, 'Grid');
        var gridSL = D3Api.getDomByAttr(grid, 'cmptype', 'SelectList');

        //колонки в массив
        var cols = grid.D3Store.cols;
        var grid_columns = {};

        cols.forEach(function (item, index){
            item._index = index;
            if(item._order == null){
                item._order = -1;
            }
        });

        cols.sort(function (x1, x2){
            return (x1._order == x2._order) ? x1._index - x2._index : x1._order - x2._order;
        });

        for (var i = 0; i < cols.length; i++) {
            if(cols[i]._show && cols[i].field){
                grid_columns[cols[i].field] = cols[i].caption;
            }
        }

        //заголовок
        var grid_caption = (D3Api.getTextContent(D3Api.getDomByAttr(grid, 'cont', 'gridcaptioncontent')) || '');
        //датасет
        var dataset = grid.D3Store.dataSetName;
        var ds_obj = dom.D3Form.getDataSet(dataset);
        var params = ds_obj.sysinfo.getParams(dataset);
        var t_ext = ds_obj.getRequestData();
        var _ext_ = {};

        if('filters' in t_ext){
            _ext_.filters = t_ext.filters;
        }
        if(gridSL){
            var kf = D3Api.getProperty(grid, 'keyfield');
            var sl = grid.D3Form.getValue(gridSL);
            if(kf && sl){
                _ext_.filters = _ext_.filters || {};
                _ext_.filters[kf] = '*' + sl;
            }
        }
        if('sorts' in t_ext){
            _ext_.sorts = t_ext.sorts;
        }
        params._ext_ = _ext_;
        params._uid_ = D3Api.getUniqId('DS');

        params.action = 'export_tbs';
        params.__caption = grid_caption;
        params.__columns = grid_columns;
        params.__template = grid.D3Store.export_template;
        params.__header = grid.D3Store.export_header;
        params.__columns_to_sum = grid.D3Store.columns_to_sum;

        grid.D3Form.sendRequest(dataset, {
            type: 'Grid',
            params: params
        }, false, function (){
            var result = arguments[1];

            if(!result || !result[dataset]){
                return;
            }

            D3Api.downloadFile(result[dataset].nameFile, (grid_caption || 'Выгрузка') + '.ods', true, 'application/vnd.oasis.opendocument.spreadsheet');
        });
    };
    this.saveDefaultProfile = function (formHash, gridName, data, callback, onlyDefault, usercategory){
        var req = {
            grid: {
                type: 'Grid', params: {
                    hash: formHash,
                    usercategory: usercategory,
                    name: gridName,
                    only: onlyDefault,
                    profile: data
                }
            }
        };
        D3Api.requestServer({
                                url: 'request.php',
                                async: true,
                                method: 'POST',
                                urlData: {action: 'savedefault'},
                                data: {request: D3Api.JSONstringify(req)},
                                onSuccess: function (res){
                                    var result = JSON.parse(res);
                                    callback && callback(D3Api.empty(result.grid.error));
                                },
                                onError: function (res){
                                    callback(false);
                                }
                            });
    };
    this.openProfile = function (dom){
        var grid = D3Api.getControlByDom(dom, 'Grid');
        var pcont = D3Api.getDomByAttr(grid, 'cont', 'grid_params_cont');
        if(pcont.D3Container && pcont.D3Container.currentForm)
            return;
        //Получим параметры
        var gridname = D3Api.getProperty(grid, 'name');
        var params = grid.D3Form.getParamsByName('Grid', gridname);
        var range;
        if(grid.D3Store.range){
            range = grid.D3Store.range.D3Range.amount;
        }
        // параметры для CustomFilter-а по-умолчанию
        var params_cf = grid.D3Form.getParamsByName('CustomFilter', 'cf_' + gridname);
        params_cf.dataset = grid.D3Store.dataSetName;
        if(params.profiles instanceof Array){
            params.profiles = {};
        }
        D3Api.showDomBlock(pcont);

        D3Api.showForm('Components/GridTree/params', null, {
            modal_form: true,
            vars: {
                formhash: grid.D3Form.getFormParamsHash(),
                componentname: gridname,
                data: params,
                range: range,
                data_cf: params_cf,
                cols: grid.D3Store.cols,
                element: grid,
                typeComponent: 'Grid'
            },
            onclose: function (res){
                grid.D3Form.setValue('cf_' + gridname, params_cf);
                D3Api.setDomDisplayDefault(pcont);
                if(!res) return;
                D3Api.GridCtrl.setProfile(grid);
            }
        });
    };
    this.setProfile = function (dom, profile, refresh, genmenu){
        genmenu = genmenu === undefined || genmenu;
        var gName = D3Api.getProperty(dom, 'name');
        var params = dom.D3Form.getParamsByName('Grid', gName);
        if(params.profiles instanceof Array)
            params.profiles = {};
        profile = profile || params.profile || 'По умолчанию';
        params.profile = profile.replace(/&quot;/g, '"');
        if(genmenu){
            generateMenuProfiles(dom, profile);
        }else{
            var item = D3Api.getDomBy(dom.D3Store.profilePMItem, '[class*="grid_profile_active_item"]');
            if(item){
                D3Api.removeClass(item, 'grid_profile_active_item');
                D3Api.setControlPropertyByDom(item, 'icon', '');
            }
        }
        dom.D3Store.currentProfile = profile;
        profile = params.profiles[profile];
        if(!profile){
            hideAllColDoms(dom.D3Store.cols);
            showAllColDoms(dom.D3Store.cols);
            dom.D3Store.currentProfile = '';
        }else{
            var order = [];
            var orderTmp = [];

            if(profile.cols){
                for (var prop in profile.cols) {
                    if(profile.cols.hasOwnProperty(prop)){
                        orderTmp[profile.cols[prop].order] = {name: prop, show: profile.cols[prop].show, colsAfter: []};
                    }
                }

                var fieldBefore = '';
                for (var i = 0, c = dom.D3Store.cols.length; i < c; i++) {
                    var cl = dom.D3Store.cols[i];
                    var found = false;
                    /* ищем есть ли она в профиле */
                    for (var i1 = 0, c1 = orderTmp.length; i1 < c1; i1++) {
                        if(orderTmp[i1] && orderTmp[i1].name == cl.name){
                            orderTmp[i1].index = i;
                            found = true;
                        }
                    }
                    if(found){
                        fieldBefore = cl.name;
                    }
                    else{
                        if(fieldBefore == ''){ /* если разработчик поставил ее в самое начало */
                            orderTmp[-1] = {name: cl.name, show: 1, index: i, colsAfter: []}
                        }
                        else{
                            /* ищем предыдущую колонку */
                            for (var i1 = -1, c1 = orderTmp.length; i1 <= c1; i1++) {
                                if(orderTmp[i1] && orderTmp[i1].name == fieldBefore){
                                    orderTmp[i1].colsAfter.push(i);
                                }
                            }
                        }
                    }
                    hideColDoms(cl)
                }

                /* формируем правильный порядок */
                for (var i = -1, c = orderTmp.length; i <= c; i++) {
                    if(orderTmp[i] === undefined) continue;
                    if(orderTmp[i] && orderTmp[i].show == 1 && orderTmp[i].index >= 0) order.push(orderTmp[i].index);
                    if(orderTmp[i].colsAfter && orderTmp[i].colsAfter.length > 0){
                        for (var i1 = 0, c1 = orderTmp[i].colsAfter.length; i1 < c1; i1++) {
                            order.push(orderTmp[i].colsAfter[i1]);
                        }
                    }
                }
            }

            for (var i = 0, c = order.length; i < c; i++) {
                if(order[i] === undefined){
                    continue;
                }

                dom.D3Store.cols[order[i]]._order = i;
                showColDoms(dom.D3Store.cols[order[i]], (profile && profile.cols) ? profile.cols[dom.D3Store.cols[order[i]].name] : undefined);
            }
            var cols = D3Api.getAllDomBy(dom.D3Store._conts_.columns, 'col[fcol]');
            var colWidth = 0;
            var emptyCols = [];
            for (var i = 0, c = cols.length; i < c; i++) {
                colWidth += +cols[i].width;
                if(+cols[i].width <= 0)
                    emptyCols.push(D3Api.getProperty(cols[i], 'fcol'));
            }
            if(dom.D3Store._conts_.datacont.clientWidth < colWidth && emptyCols.length > 0){
                for (var i = 0, c = emptyCols.length; i < c; i++) {
                    var ecols = D3Api.getAllDomBy(dom, 'col[fcol="' + emptyCols[i] + '"]');
                    for (var j = 0, l = ecols.length; j < l; j++) {
                        ecols[j].width = 100;
                    }
                }
            }
        }
        if(profile && profile.amount){
            if(dom.D3Store.range && dom.D3Store.range.D3Range){
                if(dom.D3Store.range.D3Range.amount != profile.amount){
                    dom.D3Form.callControlMethod(dom.D3Store.range, 'amount', profile.amount);
                    refresh = false;
                }
            }else if(dom.D3Store.range){
                D3Api.setProperty(dom.D3Store.range, 'default_amount', profile.amount);
                refresh = false;
            }
        }
        if(refresh === undefined || refresh){
            dom.D3Form.getRepeater(dom.D3Store.repeaterName).repeat(true, dom);
        }
        dom.D3Form.saveParams();
        dom.D3Base.callEvent('onprofile_change', params.profile)
    };

    function generateMenuProfiles(dom, profile){
        var gName = D3Api.getProperty(dom, 'name');
        var params = dom.D3Form.getParamsByName('Grid', gName);
        if(params.profiles instanceof Array){
            params.profiles = {};
        }
        profile = profile || params.profile;
        var pM = dom.D3Form.getControl(dom.D3Store.popupMenu);
        var pMAPI = D3Api.getControlAPIByDom(pM);
        var items = pMAPI.getItems(dom.D3Store.profilePMItem);
        for (var i = 0, c = items.length - 1; i < c; i++) {
            pMAPI.deleteItem(pM, items[i]);
        }
        var sortP = [];
        for (var p in params.profiles) {
            if(params.profiles.hasOwnProperty(p)){
                sortP.push(p);
            }
        }
        sortP.sort();
        var sp = false;
        for (var i = 0, c = sortP.length; i < c; i++) {
            var p = sortP[i];
            sp = true;
            var pj = p;
            pj = pj.split('"').join('&quot;').split("'").join("\\'");
            var item = pMAPI.addItem(pM, {
                onclick: 'D3Api.GridCtrl.setProfile(getControl(\'' + gName + '\'),\'' + pj + '\',true,false);D3Api.addClass(this, \'grid_profile_active_item\');D3Api.setControlPropertyByDom(this,\'icon\',\'~CmpGrid/arrow_right\');',
                caption: p
            }, dom.D3Store.profilePMItem);
            if(p == profile){
                D3Api.addClass(item, 'grid_profile_active_item');
                D3Api.setControlPropertyByDom(item, 'icon', '~CmpGrid/arrow_right');
            }
        }
        if(sp){
            pMAPI.addItem(pM, {caption: '-'}, dom.D3Store.profilePMItem);
        }
        pMAPI.addItemDom(pM, items[items.length - 1], dom.D3Store.profilePMItem);
    }

    function showColDoms(col, params){
        for (var i = 0, c = col.doms.length; i < c; i++) {
            if(!params && !col.defaultShow)
                continue;

            var beforeDom = null;
            if(col.doms[i].col.nodeName === 'TD'){
                var beforeDom = D3Api.getDomByAttr(col.doms[i].parentNode, 'hidden', 'true');
            }

            if(beforeDom)
                D3Api.insertBeforeDom(beforeDom, col.doms[i].col);
            else
                D3Api.addDom(col.doms[i].parentNode, col.doms[i].col);

            if(D3Api.getProperty(col.doms[i].col, 'keep')){
                D3Api.setDomDisplayDefault(col.doms[i].col);
                D3Api.removeProperty(col.doms[i].col, 'hidden');
            }
            if(col.doms[i].col.nodeName === 'COL')
                col.doms[i].col.width = (!params || params.width === undefined) ? col.width : params.width;
            else if(D3Api.hasClass(col.doms[i].col, 'column_data') || D3Api.hasClass(col.doms[i].col, 'grid__wf-column'))
                col.doms[i].col.style.textAlign = (!params || params.align === undefined) ? col.align : params.align;
        }
        col._show = true;
    }

    function hideColDoms(col){
        for (var i = 0, c = col.doms.length; i < c; i++) {
            if(col.doms[i].col.nodeName === 'TD' && D3Api.getProperty(col.doms[i].col, 'keep')){
                D3Api.addDom(col.doms[i].parentNode, col.doms[i].col);
                D3Api.hideDom(col.doms[i].col);
                D3Api.setProperty(col.doms[i].col, 'hidden', 'true');
            }else
                D3Api.removeDom(col.doms[i].col);
        }
        col._show = false;
    }

    function hideAllColDoms(cols){
        for (var i = 0, c = cols.length; i < c; i++) {
            hideColDoms(cols[i])
        }
    }

    function showAllColDoms(cols){
        for (var i = 0, c = cols.length; i < c; i++) {
            showColDoms(cols[i])
        }
    }

    function createDefaultProfile(dom){
        var range;
        if(dom.D3Store.range)
            range = dom.D3Store.range.D3Range.amount;
        var profile = {cols: {}, amount: range};
        for (var i = 0, c = dom.D3Store.cols.length; i < c; i++) {
            profile.cols[dom.D3Store.cols[i].name] = {
                order: i,
                show: true,
                width: dom.D3Store.cols[i].width,
                align: dom.D3Store.cols[i].align
            };
        }
        return profile;
    }

    this._getDefaultParams = function (){
        return {
            profiles: {
                /*
                 * profile: {
                 *      cols : {
                 *          name: {
                 *              order: 0,
                 *              show: true,
                 *              width: 100,
                 *              align: 'left'
                 *          }
                 *      }
                 * }
                 */
            },   //Профили
            profile: ''     //Выбранный профиль
        };
    };
    this.stopPopup = function (e){
        var evt = D3Api.getEvent(e);

        if((evt.button && evt.button == 2) || (evt.which && evt.which == 3)){
            D3Api.stopEvent(e);
        }
    };
    this.setVisible = function (dom, value){
        D3Api.BaseCtrl.setVisible(dom, value);
        if(D3Api.getBoolean(value))
            D3Api.GridCtrl.resize(dom);
    };
    this.setVisibleColumn = function (dom, field, value, noRefresh){
        var cols = dom.D3Store.cols;

        for (var i = 0; i < cols.length; i++) {
            if(cols[i].field === field){
                (D3Api.getBoolean(value) ? showColDoms : hideColDoms)(cols[i]);
                !noRefresh && dom.D3Form.getRepeater(dom.D3Store.repeaterName).repeat(true, dom);
                return;
            }
        }
    };
    this.setVisibleSelectList = function (dom, value, noRefresh){
        var cols = dom.D3Store.cols;
        var sl = D3Api.getDomByAttr(dom, 'cmptype', 'SelectList');
        if(!sl){
            return;
        }

        for (var i = 0; i < cols.length; i++) {
            if(cols[i]._sl === true){
                (D3Api.getBoolean(value) ? showColDoms : hideColDoms)(cols[i]);
                !noRefresh && dom.D3Form.getRepeater(dom.D3Store.repeaterName).repeat(true, dom);
                return;
            }
        }
    };
    /**
     * Установка заголовка колонки
     * @param dom
     * @param field - поле
     * @param value - значение
     */
    this.setCaptionColumn = function (dom, field, value){

        var columns = D3Api.getAllDomBy(dom.D3Store._conts_.columns, '.column_caption[cont="' + field + '"] .column_caption_label');
        columns = Array.prototype.slice.call(columns);
        columns.forEach(function (item, i, arr){
            item.innerHTML = value;
        });

        var cols = dom.D3Store.cols;
        cols.forEach(function (item, i, arr){
            if(item.field == field) item.caption = value;
        });
    };

    /**
     * Возвращает текущий заголовок колонки
     * @param dom
     * @param field - поле
     * @returns {string}
     */
    this.getCaptionColumn = function (dom, field){

        var columnCaption = '';
        var cols = dom.D3Store.cols;

        cols.forEach(function (item, i, arr){
            if(item.field == field) columnCaption = item.caption;
        });

        return columnCaption;
    };

    /**
     * Делает активной строчку с нужным значением
     * @param dom
     * @param value
     */
    this.setActiveRowByValue = function GridCtrl_setActiveRowByValue(dom, value){
        var row = D3Api.GridCtrl.getRowByKey(dom, value);
        if(row){
            D3Api.GridCtrl.setActiveRow(dom, row);
            return true;
        }
        else return false;
    };

};

D3Api.controlsApi['Grid'] = new D3Api.ControlBaseProperties(D3Api.GridCtrl);
D3Api.controlsApi['Grid']['data'] = {get: D3Api.GridCtrl.getData};
D3Api.controlsApi['Grid']['value'] = {get: D3Api.GridCtrl.getValue, set: D3Api.GridCtrl.setValue};
D3Api.controlsApi['Grid']['locate'] = {get: D3Api.GridCtrl.getLocate, set: D3Api.GridCtrl.setLocate};
D3Api.controlsApi['Grid']['caption'] = {get: D3Api.GridCtrl.getCaption, set: D3Api.GridCtrl.setCaption};
D3Api.controlsApi['Grid']['title'] = {get: D3Api.GridCtrl.getTitle, set: D3Api.GridCtrl.setTitle};
D3Api.controlsApi['Grid']['activeRow'] = {
    get: D3Api.GridCtrl.getActiveRow,
    set: D3Api.GridCtrl.setActiveRow,
    type: 'dom'
};
D3Api.controlsApi['Grid']['nextRow'] = {get: D3Api.GridCtrl.getNextRow, type: 'dom'};
D3Api.controlsApi['Grid']['previousRow'] = {get: D3Api.GridCtrl.getPreviousRow, type: 'dom'};
D3Api.controlsApi['Grid']['nearRow'] = {get: D3Api.GridCtrl.getNearRow, type: 'dom'};
D3Api.controlsApi['Grid']['rows'] = {get: D3Api.GridCtrl.getRows, type: 'dom'};
D3Api.controlsApi['Grid']['visible'].set = D3Api.GridCtrl.setVisible;

D3Api.GridRowCtrl = new function (){
    this.getValue = function GridRowCtrl_GetValue(dom){
        return D3Api.getProperty(dom, 'keyvalue', '');
    };
    this.setValue = function GridRowCtrl_SetValue(dom, value){
        return D3Api.setProperty(dom, 'keyvalue', value);
    };
    this.getReturnValue = function GridRowCtrl_GetReturnValue(dom){
        return D3Api.getProperty(dom, 'returnvalue', '');
    };
    this.setReturnValue = function GridRowCtrl_SetReturnValue(dom, value){
        return D3Api.setProperty(dom, 'returnvalue', value);
    };
};

D3Api.controlsApi['GridRow'] = new D3Api.ControlBaseProperties(D3Api.GridRowCtrl);
D3Api.controlsApi['GridRow']['value'] = {get: D3Api.GridRowCtrl.getValue, set: D3Api.GridRowCtrl.setValue};
D3Api.controlsApi['GridRow']['returnValue'] = {
    get: D3Api.GridRowCtrl.getReturnValue,
    set: D3Api.GridRowCtrl.setReturnValue
};
D3Api.LabelCtrl = new function () {
    this.init = function (dom) {
        D3Api.BaseCtrl.initEvent(dom, 'onformat');
    };
    /**
     *
     * @param dom
     * @param settings
     *  settings.toType - 'number' | 'date' | 'hours'
     *  settings.hideZero - скрывать ли нулевые значения (по умолчанию показываются)
     *  settings.showNull - показывать ли значения null (если true, то приводятся к числу. По умолчанию скрываются)
     *  settings.mask - (для даты) - маска, например, 'd.m.Y'
     *  settings.options - описание тут: https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Number/toLocaleString
     * @param value
     */
    this.format = function (dom, settings, value) {

        if (settings.toType === 'number'){
            if (value){
                value = settings.hideZero && Number(value) == 0 ? '' : Number(value);
            }
            else{ // null or 0
                value = !Number.isFinite(value) && settings.showNull || Number.isFinite(value) && !settings.hideZero ? Number(value) : '';
            }

        } else if (settings.toType === 'date' && value) {
            var dateMatch = value.match(/^(\d{2})\.(\d{2})\.(\d{4})(?=\s(\d{2}):(\d{2}):(\d{2})|)/);
            value = new Date(dateMatch[3], dateMatch[2] - 1, dateMatch[1], dateMatch[4] || 0, dateMatch[5] || 0, dateMatch[6] || 0);
            if (!dateMatch[4] && !settings.mask && !settings.options) settings.options = {year:'numeric', month:'numeric', day:'numeric'}; // не показываем время для обычной даты

            if (settings.mask){
                dom._formattedValue = D3Api.parseDate(settings.mask, value/1000);
                return;
            }
        }
        else if (settings.toType === 'hours' && value) {
            dom._formattedValue = D3Api.hours2time(value, settings.withSeconds);
            return;
        }

        if (value != null && value.toLocaleString) {
            dom._formattedValue = value.toLocaleString(settings.locales, settings.options);
        }
    };
    this.setCaption = function (_dom, _value) {
        _dom.D3Base.callEvent('onformat', _value);

        if (_dom._formattedValue !== undefined) {
            _value = _dom._formattedValue;
        }

        if (_value && D3Api.getProperty(_dom,'specialchars','true') == 'true')
        {
            var t = document.createElement('span');
            if(D3Api.hasProperty(_dom,'cmpparse') && !D3Api.hasProperty(_dom,'repeatername')){
                t.innerHTML = _value;
            }else{
                t.appendChild(document.createTextNode(_value));
            }
            _value = t.innerHTML;
            t = null;
        }
        //Кешируем
        _dom['label_before_caption'] = (_dom['label_before_caption'] != null)?_dom['label_before_caption']:D3Api.getProperty(_dom,'before_caption','');
        _dom['label_after_caption'] = (_dom['label_after_caption'] != null)?_dom['label_after_caption']:D3Api.getProperty(_dom,'after_caption','');
        if (!_dom['label_note'] && D3Api.hasProperty(_dom,'note'))
        {
            _dom['label_note'] = D3Api.getChildTag(_dom, 'span', 0);
        }
        var new_value = _value;
        if (!isNaN(_value))
            new_value = (_value === null) ? '' : String(_value);
        else
            if (typeof(_value) != 'string') new_value = '';

        var set_val = new_value;
        if (D3Api.getProperty(_dom,'formated',false) && new_value)
        {
            set_val = new_value.replace(/\r\n|\r|\n/g,'<br/>');
            if (!D3Api.hasProperty(_dom,'nonbsp'))
            {
                var m = set_val.match(/[ ]{2,}/g);
                if (m && m.length > 0)
                {
                    var mnbsp = m;

                    mnbsp = mnbsp.join(':').replace(/[ ]/g,"&nbsp;").split(":");
                    for (var p = 0; p < m.length; p++)
                    {
                        set_val = set_val.replace(m[p],mnbsp[p]);
                    }
                }
            }
        }
        set_val = _dom['label_before_caption']+set_val+_dom['label_after_caption'];
	    _dom.innerHTML=(new_value)?set_val:new_value='';
        if (_dom['label_note'])
        {
           if (set_val == '')
               _dom.innerHTML='&nbsp;';
           _dom.appendChild(_dom['label_note']);
        }
        if (D3Api.hasProperty(_dom,'hide_empty'))
        {
            D3Api.showDom(_dom,new_value!='');
        }
        _dom['label_caption'] = new_value;
        if(D3Api.hasProperty(_dom,'cmpparse') && !D3Api.hasProperty(_dom,'repeatername')){
            var uni = D3Api.getUniqId();
            var childs = _dom.childNodes;
            for(var i = 0 ; i < childs.length ; i++){
                if(childs[i].nodeType == 1){
                    _dom.D3Form.default_parse(childs[i],true, undefined,uni);
                }
            }
        }
    };
    this.getCaption = function(_dom)
    {
        if (_dom['label_caption'])
        {
            return _dom['label_caption'];
        }
        return _dom.innerHTML;
    }
}

D3Api.controlsApi['Label'] = new D3Api.ControlBaseProperties(D3Api.LabelCtrl);
D3Api.controlsApi['Label']['caption']={get:D3Api.LabelCtrl.getCaption,set:D3Api.LabelCtrl.setCaption};
D3Api.controlsApi['Label']['height'] = undefined;
/*SYS_ControlActions['SortItem']=new Array();
SYS_ControlActions['SortItem']['value']={set:SortItem_SetValue,get:SortItem_GetValue};
SYS_ControlActions['SortItem']['constant']={get:SortItem_GetConstant};

SYS_ControlActions['Sort']=new Array();
SYS_ControlActions['Sort']['value']={set:Sort_SetValue,get:Sort_GetValue};

function SortItem_GetValue(_domObject)
{
	return getProperty(_domObject, 'sortorder', '');
}
function SortItem_SetValue(_domObject, _value)
{
	_domObject.setAttribute('sortorder', _value);
}
function SortItem_GetConstant(_domObject)
{
    return Boolean(getProperty(_domObject, 'constant', false));
}
function Sort_GetValue(_domObject)
{
	return _domObject.innerHTML;
}

function Sort_SetValue(_domObject, _value)
{
	_domObject.innerHTML = _value;
}
function setSort(_dom)
{
	var _ds =  getProperty(_dom, 'refreshdataset', '');
	var _name = getProperty(_dom, 'name', '');
	var _con_name = _ds+'_Sort';
	var _sortorder = SortItem_GetValue(_dom);
	if (_sortorder == 1 || _sortorder == -1)
	{
		if (_sortorder == -1)
		{
			SortItem_SetValue(_dom, null);
			//_dom.className = 'ordernone';
			Colibrate(_dom, 1);
		}
		else if (_sortorder == 1)
		{
			SortItem_SetValue(_dom, -1);
			//_dom.className = 'orderdesc';
		}
	}
	else
	{
		SortItem_SetValue(_dom, 1);
		//_dom.className = 'orderasc';
		Colibrate(_dom, 2);
	}

	SI_register(_dom);
	SI_setclass(_name);
	refreshDataSet(_ds);

}

//function arrCompare(_a,_b){return Math.abs(_a) - Math.abs(_b)}

function Colibrate(_dom, _new_ind)
{
		//проверить, вдруг есть сортировка другово поля
	var _ds =  getProperty(_dom, 'refreshdataset', '');
	var _name = getProperty(_dom, 'name', '');
	var _con_name = _ds+'_Sort';
		var _reg_items = getValue(_con_name).split(';');
		var _items = new Array();
		var _ind = 0;
		var _substr_name='';
		for(var i = 0; i < _reg_items.length; i++)
		{
                    if (!_reg_items[i])
                        continue;
                    var _value = getValue(_reg_items[i]);
                    var constant = getControlProperty(_reg_items[i],'constant');
                    if (_value && _reg_items[i] != _name && !constant)_items[_reg_items[i]] = _value;
		}


		var _items_sort = new Array();
		for (var _ind in _items)
		{
			_items_sort[Math.abs(_items[_ind])] = _ind;
		}

		var _class = null;
		for (var _i = 1; _i<=10; _i++)
		{
			_ind = _items_sort[_i];
			if (_ind)
			{
				_value = _items[_ind];
				var _znak;
				if (_value<0) _znak = -1; else _znak = 1;
				var _newvalue;
				if (_new_ind >3)
				{
					_newvalue = null;
				}
				else
				{
					_newvalue =_new_ind;


				}
				if (_newvalue)_newvalue=_newvalue*_znak
				setValue(_ind, _newvalue);
				SI_setclass(_ind);
				_new_ind+=1;
			}
		}

}

function SI_setclass(_objname)
{
	var _value = getValue(_objname);
	var _class='';
	if (_value)
	{
		if (_value == 1) _class = 'sort-orderasc';
		else if (_value == -1) _class = 'sort-orderdesc';
		else if (_value == -2) _class = 'sort-mediumsort-desc';
		else if (_value == 2) _class = 'sort-mediumsort-asc';
		else if (_value == -3) _class = 'sort-lowsort-desc';
		else if (_value == 3) _class = 'sort-lowsort-asc';
			 else _class = 'sort-nextsort';
	}
	else _class = 'sort-ordernone';

	getControlByName(_objname).className = _class;
}

function SI_create(_dom)
{
	var _ds =  getProperty(_dom, 'refreshdataset', '');
	var _name = getProperty(_dom, 'name', '');
	var _fieldname = '_srt['+getProperty(_dom, 'field', '')+']';
    var _data = {get:_fieldname,srctype:'ctrl',src:_name,ignorenull:false};
    addSystemInfo(_ds,_data);
    if (getValue(_name))
    {
    	SI_register(_dom); SI_setclass(_name);
    }
}

function SI_register(_dom)
{

	var _ds =  getProperty(_dom, 'refreshdataset', '');
	var _name = getProperty(_dom, 'name', '');
	var _con_name = _ds+'_Sort';

	var _reg_items = getValue(_con_name);
	if (_reg_items.indexOf(_name)== -1)
	setValue(_con_name, _reg_items+_name+';');
}
*/
D3Api.SortCtrl = new function()
{
    this.getValue = function SortCtrl_GetValue(dom)
    {
        return D3Api.getProperty(dom, 'sortvalue', '');
    }
    this.setValue = function SortCtrl_SetValue(dom,value)
    {
        return D3Api.setProperty(dom, 'sortvalue', value);
    }
    this.getItems = function SortCtrl_GetItems(dom)
    {
        return D3Api.getProperty(dom, 'sortitems', '');
    }
    this.setItems = function SortCtrl_SetItems(dom,value)
    {
        return D3Api.setProperty(dom, 'sortitems', value);
    }
}

D3Api.controlsApi['Sort'] = new D3Api.ControlBaseProperties(D3Api.SortCtrl);
D3Api.controlsApi['Sort']['value']={get:D3Api.SortCtrl.getValue,set: D3Api.SortCtrl.setValue};
D3Api.controlsApi['Sort']['items']={get:D3Api.SortCtrl.getItems,set: D3Api.SortCtrl.setItems};

D3Api.SortItemCtrl = new function()
{
    this.getValue = function SortItemCtrl_GetValue(dom)
    {
        return D3Api.getProperty(dom, 'sortorder', '');
    }
    this.setValue = function SortItemCtrl_SetValue(dom,value)
    {
        return D3Api.setProperty(dom, 'sortorder', value);
    }
    this.getConstant = function SortItemCtrl_GetConstant(dom)
    {
        return Boolean(D3Api.getProperty(dom, 'constant', false));
    }
    this.init = function(dom)
    {
        var dsn = D3Api.getProperty(dom, 'refreshdataset', '');
        if (!dsn)
            return;

        var ds = dom.D3Form.getDataSet(dsn);

        ds.addSortItem(
                        D3Api.getProperty(dom, 'name'),
                        D3Api.getProperty(dom, 'field')
                    );
        if (D3Api.SortItemCtrl.getValue(dom))
        {
            register(dom);
            setClass(dom);
        }
    }
    this.setSort = function SortItemCtrl_SetSort(dom)
    {
        var _ds = D3Api.getProperty(dom, 'refreshdataset', '');
	var _sortorder = D3Api.SortItemCtrl.getValue(dom);
	if (_sortorder == 1 || _sortorder == -1)
	{

		if (_sortorder == -1)
		{
			D3Api.SortItemCtrl.setValue(dom, null);
            D3Api.BaseCtrl.setHint(dom, "Отсортировать по возрастанию");
			colibrate(dom, 1);
		}
		else if (_sortorder == 1)
		{
			D3Api.SortItemCtrl.setValue(dom, -1);
            D3Api.BaseCtrl.setHint(dom, "Убрать сортировку");
		}
	}
	else
	{
		D3Api.SortItemCtrl.setValue(dom, 1);
        D3Api.BaseCtrl.setHint(dom, "Отсортировать по убыванию");
		colibrate(dom, 2);
	}

	register(dom);
	setClass(dom);
	dom.D3Form.refreshDataSet(_ds);
    }
    function register(dom)
    {
        var _ds = D3Api.getProperty(dom, 'refreshdataset', '');
        var _name = D3Api.getProperty(dom, 'name', '');
        var _con_name = _ds+'_Sort';

        var _reg_items = dom.D3Form.getControlProperty(_con_name,'items');
        if (_reg_items.indexOf(_name) == -1)
            dom.D3Form.setControlProperty(_con_name, 'items', _reg_items+_name+';');

        //changeItem(dom);
    }
    function changeItem(dom)
    {
        var _ds = D3Api.getProperty(dom, 'refreshdataset', '');
        var _field = D3Api.getProperty(dom, 'field', '');
        var ord = D3Api.SortItemCtrl.getValue(dom);
        var _con_name = _ds+'_Sort';
        var orders = dom.D3Form.getValue(_con_name);
        if (orders.indexOf('|'+_field+':') == -1)
        {
            if (ord != '')
                dom.D3Form.setValue(_con_name, orders+'|'+_field+':'+ord);
        }else
        {
            var r = new RegExp('\\|'+_field+':-?[12]','g');
            dom.D3Form.setValue(_con_name, orders.replace(r,((ord != '')?'|'+_field+':'+ord:'')));
        }
    }
    function setClass(dom)
    {
        var _value = D3Api.SortItemCtrl.getValue(dom);
        var _class='sort_item ';
        if (_value)
        {
                if (_value == 1) _class += 'sort-orderasc';
                else if (_value == -1) _class += 'sort-orderdesc';
                else if (_value == -2) _class += 'sort-mediumsort-desc';
                else if (_value == 2) _class += 'sort-mediumsort-asc';
                else if (_value == -3) _class += 'sort-lowsort-desc';
                else if (_value == 3) _class += 'sort-lowsort-asc';
                else _class += 'sort-nextsort';
        }else _class += 'sort-ordernone';

        dom.className = _class;
    }
    function colibrate(dom, new_ind)
    {
        //проверить, вдруг есть сортировка другово поля
        var _ds = D3Api.getProperty(dom, 'refreshdataset', '');
        var _name = D3Api.getProperty(dom, 'name', '');
        var _con_name = _ds+'_Sort';
        var _reg_items = dom.D3Form.getControlProperty(_con_name,'items').split(';');
        var _items = new Array();
        var _ind = 0;
        for(var i = 0; i < _reg_items.length; i++)
        {
            if (!_reg_items[i])
                continue;
            var _value = dom.D3Form.getValue(_reg_items[i]);
            var constant = dom.D3Form.getControlProperty(_reg_items[i],'constant');
            if (_value && _reg_items[i] != _name && !constant)_items[_reg_items[i]] = _value;
        }


        var _items_sort = new Array();
        for (var _ind in _items)
        {
            if(_items.hasOwnProperty(_ind)){
                _items_sort[Math.abs(_items[_ind])] = _ind;
            }
        }

        for (var _i = 1; _i<=10; _i++)
        {
                _ind = _items_sort[_i];
                if (_ind)
                {
                        _value = _items[_ind];
                        var _znak;
                        if (_value<0) _znak = -1; else _znak = 1;
                        var _newvalue;
                        if (new_ind >3)
                        {
                                _newvalue = null;
                        }
                        else
                        {
                                _newvalue =new_ind;


                        }
                        if (_newvalue)_newvalue=_newvalue*_znak
                        dom.D3Form.setValue(_ind, _newvalue);
                        var itm = dom.D3Form.getControl(_ind);
                        //changeItem(itm);
                        setClass(itm);
                        new_ind+=1;
                }
        }
    }
}

D3Api.controlsApi['SortItem'] = new D3Api.ControlBaseProperties(D3Api.SortItemCtrl);
D3Api.controlsApi['SortItem']['value']={get:D3Api.SortItemCtrl.getValue,set: D3Api.SortItemCtrl.setValue};
D3Api.controlsApi['SortItem']['constant']={get:D3Api.SortItemCtrl.getConstant};
D3Api.FilterCtrl = new function()
{
    this.search = function(dom)
    {
        var filter = D3Api.getControlByDom(dom, 'Filter');
        filter.D3Form.refreshDataSet(D3Api.getProperty(filter,'dataset'));
    };
    this.clear = function(dom)
    {
        var filter = D3Api.getControlByDom(dom, 'Filter');
        var fi = D3Api.getAllDomBy(filter, "[filteritem]");
        for(var i = 0, c = fi.length; i < c; i++)
        {
            if (D3Api.getProperty(fi[i], "cmptype") == "ButtonEdit") {
                filter.D3Form.setCaption(fi[i], '');
            }
            filter.D3Form.setValue(fi[i], '');
        }
        filter.D3Form.refreshDataSet(D3Api.getProperty(filter,'dataset'));
    }
};
D3Api.controlsApi['Filter'] = new D3Api.ControlBaseProperties(D3Api.FilterCtrl);

D3Api.FilterItemCtrl = new function()
{
    this.init = function(dom)
    {
        var name = D3Api.getProperty(dom, 'name');
        if (!name)
        {
            D3Api.debug_msg('У фильтра необходимо указать имя.');
            return;
        }
        var _fieldname = D3Api.getProperty(dom, 'field', D3Api.getProperty(dom, 'fields', ''));
        var _fkind = D3Api.getProperty(dom,'filterkind','');
        if(_fkind == 'perioddate' || _fkind== 'date') _fieldname += ';D';
        else if(_fkind == 'periodtime' || _fkind=='time')_fieldname += ';T';
        else if(_fkind == 'periodnumb' || _fkind== 'numb') _fieldname += ';N';
        else if(_fkind == 'multi_hier') _fieldname += ';H'+';'+D3Api.getProperty(dom,'unit')+';'+D3Api.getProperty(dom,'composition');
        else if(_fkind == 'unitmulti') _fieldname += (D3Api.getProperty(dom,'insubquery',false))?';I':';M';

        var dsn = D3Api.getProperty(dom, 'refreshdataset', '');
        if (!dsn)
            return;

        dsn = dsn.split(';');
        var upper = D3Api.getProperty(dom, 'upper');
        var cond  = D3Api.getProperty(dom, 'condition');
        var like  = D3Api.getProperty(dom, 'like');
        var fkind  = D3Api.getProperty(dom, 'filterkind','text');
        for (var i = 0; i < dsn.length; i++) {
            var ds = dom.D3Form.getDataSet(dsn[i]);

            ds.addFilterItem(name, 'value', _fieldname, upper, cond, like, fkind);
        }
    };
    this.prepareValue = function(dom,value)
    {
        return {v: value};
    };
    this.filterKeyPress = function(dom)
    {
        var e = D3Api.getEvent();
        if(e.keyCode != 13)
            return;

        D3Api.FilterCtrl.search(dom);
    };
};

D3Api.controlsApi['FilterItem'] = new D3Api.ControlBaseProperties(D3Api.FilterItemCtrl);
D3Api.TreeCtrl = new function () {
    this.init = function TreeCtrl_OnCreate(dom) {
        var row = D3Api.getDomByAttr(dom, 'cont', 'treerow');
        this.init_focus(dom);
        dom.D3Tree = {listUse:0, listDom: null, openNodes: {}};
        dom.D3Store.rowTpl = row.D3Repeater;
        dom.D3Store.rowTpl.setTargetDom();
        dom.D3Store.rootDom = dom.D3Store.rowTpl.targetDOM.parentNode;

        dom.D3Store.root = D3Api.getProperty(dom, 'root', '');
        D3Api.TreeCtrl.setParentValue(dom,dom.D3Store.root);
        dom.D3Store.keyField = D3Api.getProperty(dom,'keyfield');
        dom.D3Store.parentField = D3Api.getProperty(dom,'parentfield');
        dom.D3Store.parentVar = D3Api.getProperty(dom,'parentvar');
        dom.D3Store.childsField = D3Api.getProperty(dom,'childsfield');
        dom.D3Store.isSimple = D3Api.getBoolean(D3Api.getProperty(dom, 'simple', 'false'));
        dom.D3Store.isFullData = D3Api.getBoolean(D3Api.getProperty(dom, 'fulldata', 'false'));
        dom.D3Store.isDefaultOpened = D3Api.getBoolean(D3Api.getProperty(dom, 'opened', 'false'));
        dom.D3Store.maxLevels = parseInt(D3Api.getProperty(dom,'maxlevels',(dom.D3Store.isFullData)?100:0));
        dom.D3Store.dataSetName = D3Api.getProperty(dom, 'dataset', '');
        dom.D3Store.list = D3Api.getBoolean(D3Api.getProperty(dom, 'list', 'false'));
        dom.D3Store.excel = D3Api.getBoolean(D3Api.getProperty(dom, 'excel', 'false'));
        dom.D3Store.popupMenu = D3Api.getProperty(dom, 'popupmenu') || D3Api.getProperty(dom, 'popupmenu_actions');
        dom.D3Store.popup_log_unit = D3Api.getProperty(dom, 'popup_log_unit', null);
        dom.D3Store.profile = D3Api.getBoolean(D3Api.getProperty(dom, 'profile', 'true'));
        dom.D3Store.columns_to_sum = D3Api.getProperty(dom, 'columns_to_sum', []);// колонки для суммирования
        dom.D3Store.repeaterName = D3Api.BaseCtrl.getName(dom) + '_repeater';
        dom.D3Store.filterData = false;

        dom.D3Store._conts_ = {};
        dom.D3Store._conts_.data = D3Api.getDomByAttr(dom, 'cont', 'treedata');
        dom.D3Store._conts_.datacont = D3Api.getDomByAttr(dom, 'cont', 'treedatacont');
        dom.D3Store._conts_.columns = D3Api.getDomByAttr(dom, 'cont', 'treecolumns');
        dom.D3Store._conts_.columnscont = D3Api.getDomByAttr(dom, 'cont', 'treecolumnscont');
        dom.D3Store._conts_.filters = D3Api.getDomByAttr(dom, 'cont', 'treefilter');
        dom.D3Store._conts_.filterpanel = D3Api.getDomByAttr(dom, 'cont', 'treefilterpanel');

        var treedatainfo = D3Api.getDomByAttr(dom, 'cont', 'treedatainfo');
        var dataSet = dom.D3Form.getDataSet(dom.D3Store.dataSetName);
        var showfilter = D3Api.getProperty(dom, 'showfilter', 'false') != 'false';

        if (treedatainfo && dataSet) {
            var repeater = dom.D3Form.getRepeater(dom.D3Store.repeaterName);

            if (dom.D3Store._conts_.filters && showfilter) {
                D3Api.addTextNode(treedatainfo, 'Необходимо установить фильтр', true);
                D3Api.showDomBlock(treedatainfo);
            }

            dataSet.addEvent('onbefore_refresh', function () {
                if (repeater.clones().length > 0) {
                    return;
                }
                D3Api.addTextNode(treedatainfo, 'В ожидании...', true);
                D3Api.showDomBlock(treedatainfo);
            });
            dataSet.addEvent('onafter_refresh', function () {
                if (repeater.clones().length > 0) {
                    D3Api.setDomDisplayDefault(treedatainfo);
                } else {
                    D3Api.addTextNode(treedatainfo, 'Нет данных', true);
                    D3Api.showDomBlock(treedatainfo);
                }
            });
            repeater.addEvent('onafter_clone', function () {
                D3Api.setDomDisplayDefault(treedatainfo);
            });
        }

        var cols = D3Api.getAllDomBy(dom.D3Store._conts_.columns, 'td[column_name]');

        dom.D3Store.cols = [];
        dom.D3Store.colSpans = {};
        for (var i = 0, iL = cols.length; i < iL; i++) {
            var colInfo = {
                name: D3Api.getProperty(cols[i], 'column_name'),
                field: D3Api.getProperty(cols[i], 'cont'),
                colspanField: D3Api.getProperty(cols[i], 'colspanfield'),
                caption: D3Api.getTextContent(cols[i]),
                align: undefined,
                doms: [],
                defaultShow: true,
                _show: true
            };
            var cls = D3Api.getAllDomBy(dom, '[column_name="' + colInfo.name + '"][index]');

            for (var j = 0, jL = cls.length; j < jL; j++) {
                if (cls[j].nodeName == 'COL') {
                    colInfo.width = cls[j].width;
                    colInfo.defaultShow = D3Api.getProperty(cls[j],'profile_hidden','') != 'true';
                }
                else if (cls[j].nodeName == 'TD' && D3Api.hasClass(cls[j], 'column_data')) {
                    colInfo.align = cls[j].style.textAlign;
                }
                colInfo.doms.push({
                    parentNode: cls[j].parentNode,
                    col: cls[j]
                });
            }
            dom.D3Store.cols.push(colInfo);
            if (colInfo.colspanField) dom.D3Store.colSpans[colInfo.name] = colInfo.colspanField;
        }

        var componentname = D3Api.getProperty(dom, 'name', '');
        var elPopupMenu = dom.D3Form.getControl(dom.D3Store.popupMenu);

        if (elPopupMenu) {
            var popupMenuAPI = D3Api.getControlAPIByDom(elPopupMenu);
            var itemsPopupMenu = popupMenuAPI.getItems(elPopupMenu, true);

            if (itemsPopupMenu.length == 0) {
                popupMenuAPI.addItem(elPopupMenu, {
                    caption: 'Обновить',
                    onclick: ((componentname) ? "setControlProperty('" + componentname + "', 'locate', getValue('" + componentname + "'));" : '') +
                             "refreshDataSet('" + dom.D3Store.dataSetName + "');"
                }, null, 'additionalMainMenu', true);
            }
            if (dom.D3Store.list) {
                dom.D3Tree.listDom = popupMenuAPI.addItem(elPopupMenu, {
                    caption: 'Список',
                    onclick: "D3Api.TreeCtrl.toggleList(getControl('" + dom.D3Store.popupMenu + "').D3Store.popupObject);"
                }, null, 'system');
            }
            if (dom.D3Store.excel) {
                popupMenuAPI.addItem(elPopupMenu, {
                    caption: 'Выгрузить таблицу',
                    onclick: 'D3Api.TreeCtrl.exportTBS(getControl(\''+dom.D3Store.popupMenu+'\').D3Store.popupObject);'
                }, null, 'system');
            }
            if (dom.D3Store.profile && componentname) {
                dom.D3Store.profilePMItem = popupMenuAPI.addItem(elPopupMenu, {
                    caption: 'Профиль',
                    icon: '~CmpTree/profile'
                }, null, 'system');
                var item = popupMenuAPI.addItem(elPopupMenu, {
                    caption: 'Настройка',
                    icon: '~CmpTree/profile_settings',
                    onclick: "D3Api.TreeCtrl.openProfile(getControl('" + dom.D3Store.popupMenu + "').D3Store.popupObject);"
                }, dom.D3Store.profilePMItem);
                dom.D3Store.profilePMItem = item.D3Store.parentItem;

                var params = dom.D3Form.getParamsByName('Tree', componentname);
                if (params) {
                    D3Api.TreeCtrl.setProfile(dom, undefined, false);
                }
            }
            if(dom.D3Store.popup_log_unit && componentname){
                popupMenuAPI.addItem(elPopupMenu, {
                    caption: 'Журнал изменений записи',
                    onclick: 'D3Api.showForm(\'System/Logs/logs\', null, {vars: {unit_view_id: getControlProperty(\'' + componentname + '\', \'value\'), unit: \'' + dom.D3Store.popup_log_unit + '\'}});',
                    icon: '~CmpPopupMenu/Icons/logs'
                }, null, 'system', true);
            }
        }

        if (dom.D3Store._conts_.filters)
        {
            if (showfilter) {
                D3Api.TreeCtrl.toggleFilter(dom);
            }
            D3Api.TreeCtrl.activateFilter(dom);
        }

        D3Api.BaseCtrl.initEvent(dom,'onchange');
        dom.D3Base.addEvent('onchange_property',function(property,value){
           if(property == 'list')
           {
               dom.D3Base.callEvent('onchange');
               //D3Api.execDomEvent(dom,'onchange');
           }
        });
        if (dataSet) {
            dataSet.addEvent('onprepare_ext', function (params) {
                if (!params.filters) {
                    dom.D3Store.filterData = false;
                    if (dom.D3Store.isFullDataStore !== undefined)
                        dom.D3Store.isFullData = dom.D3Store.isFullDataStore;
                    dom.D3Store.isFullDataStore = undefined;
                    dom.D3Store.isFilterData = false;
                    return;
                }
                dom.D3Store.filterData = true;
                if (dom.D3Store.isFullDataStore === undefined)
                    dom.D3Store.isFullDataStore = dom.D3Store.isFullData;
                dom.D3Store.isFullData = true;
                dom.D3Store.isFilterData = true;
            });
        }
    };
    this.onShow = function TreeCtrl_OnShow(dom)
    {
        var dna = [];
        var pn = dom;
        while(pn && pn.nodeName != '#document')
        {
            if (pn.style.display == 'none')
            {
                pn.style.display = '';
                dna.push(pn);
            }
            pn = pn.parentNode;
        }

        D3Api.TreeCtrl.resize(dom);
        D3Api.addEvent(dom.D3Store._conts_.datacont,'scroll',function(){D3Api.TreeCtrl.resize(dom)},true);
        dom.D3Form.addEvent('onResize',function(){D3Api.TreeCtrl.resize(dom)});

        for(var i=0; i<dna.length; i++)
        {
            dna[i].style.display = 'none';
        }
        dna = null;
    };
    this.resize = function(dom)
    {
        dom.D3Store._conts_.columns.style.width = (dom.D3Store._conts_.data.offsetWidth+18)+'px';
        dom.D3Store._conts_.columns.style.tableLayout = 'fixed';
        dom.D3Store._conts_.columnscont.scrollLeft = dom.D3Store._conts_.datacont.scrollLeft;
        if(dom.D3Store._conts_.filters)
        {
            dom.D3Store._conts_.filters.style.width = dom.D3Store._conts_.data.offsetWidth+'px';
            dom.D3Store._conts_.filters.style.top = dom.D3Store._conts_.datacont.scrollTop+'px';
            dom.D3Store._conts_.filterpanel.style.left = dom.D3Store._conts_.datacont.scrollLeft+'px';
            dom.D3Store._conts_.filterpanel.style.width = dom.D3Store._conts_.datacont.clientWidth+'px';
        }
		var parent_node = D3Api.getDomByAttr(dom, 'cont', 'treedatacont').parentNode;
		if((!!parent_node) && (!parent_node.parentNode.getAttribute('onResizeNoPadding'))){
			parent_node.style.paddingTop = D3Api.getDomByAttr(dom, 'cont', 'treecaption').offsetHeight + dom.D3Store._conts_.columnscont.offsetHeight + "px";
		}
	};
    this.getActiveRow = function(dom)
    {
        return dom.D3Store.activeRow;
    };
    this.getNextRow = function(dom)
    {
        var n = dom.D3Store.activeRow.nextSibling;
        while(n && D3Api.getProperty(n, 'isd3repeater', false))
        {
            n = n.nextSibling;
        }
        return n;
    };
    this.getPreviousRow = function(dom)
    {
        var n = dom.D3Store.activeRow.previousSibling;
        while(n && D3Api.getProperty(n, 'isd3repeater', false))
        {
            n = n.previousSibling;
        }
        return n;
    };
    this.getNearRow = function (dom) {
        var nextRow = D3Api.TreeCtrl.getNextRow(dom);
        var activeRow = dom.D3Store.activeRow;

        if (nextRow && D3Api.getProperty(nextRow, 'parentvalue') == D3Api.getProperty(activeRow, 'parentvalue')) {
            return nextRow;
        }
        return D3Api.TreeCtrl.getPreviousRow(dom);
    };
    this.setActiveRow = function TreeCtrl_SetActiveRow(dom)
    {
	var _con = D3Api.getControlByDom(dom, 'Tree');

	if (_con.D3Store.activeRow == dom)
        {
            return;
        }

	rowActivate(dom);
    };
    function rowActivate(dom,onchange)
    {
        if (!D3Api.hasProperty(dom, 'keyvalue'))
            return;
        var _con = D3Api.getControlByDom(dom, 'Tree');
        if (_con.D3Store.activeRow)
            D3Api.removeClass(_con.D3Store.activeRow, 'active');
	D3Api.addClass(dom, 'active');
        if(dom.clone)
            D3Api.TreeCtrl.setData(_con,dom.clone.data);
	else
            D3Api.TreeCtrl.setData(_con,{});

        _con.D3Store.activeRow = dom;
        D3Api.setProperty(_con, 'keyvalue', D3Api.getProperty(dom, 'keyvalue'));

        if(onchange!==false)
        {
            _con.D3Form.closureContext(_con.D3Store.activeRow);
            _con.D3Base.callEvent('onchange');
            _con.D3Form.unClosureContext();
            //D3Api.execDomEvent(_con,'onchange');
        }
    }
    this.setActiveFirstRow = function(dom)
    {
        var data = D3Api.getDomByAttr(dom, 'cont', 'treedata');
        if (data.rows.length < 2)
        {
            return;
        }
        rowActivate(data.rows[0],false);
    };
    this.setCurrentActiveRow = function TreeCtrl_SetActiveRow(dom)
    {
        var data = D3Api.getDomByAttr(dom, 'cont', 'treedata');
        if (data.rows.length < 2)
        {
            if (dom.D3Store.activeRow)
            {
                D3Api.TreeCtrl.setValue(dom,null);
                D3Api.TreeCtrl.setParentValue(dom,'');
                D3Api.removeClass(dom.D3Store.activeRow,'active');
                dom.D3Store.activeRow = null;
                D3Api.TreeCtrl.setData(dom,{});
                dom.D3Base.callEvent('onchange');
                //D3Api.execDomEvent(dom,'onchange');
            }
            return;
        }
        var actRow = data.rows[0];
        var kv = D3Api.TreeCtrl.getValue(dom);
        var lv = D3Api.TreeCtrl.getLocate(dom);
        //Попробуем найти у датасета
        if (!lv)
        {
            var ds = dom.D3Form.getDataSet(dom.D3Store.dataSetName);
            if(dom.D3Store.filterData || ds.getPosition() != 0)
            {
                var d = ds.getData();
                if (d && !dom.D3Store.toggleNodeFlag)
                {
                    lv = d[D3Api.getProperty(dom,'keyfield','')];
                }
            }
        }
        if (!kv && !lv)
        {
            actRow = data.rows[0];
        }else
        {
            actRow = D3Api.getDomByAttr(data, 'keyvalue', lv) || D3Api.getDomByAttr(data, 'keyvalue', kv) || data.rows[0];
        }
        if(D3Api.getProperty(actRow,'isd3repeater',false))
            actRow = data.rows[0];

        rowActivate(actRow);

        if(!dom.D3Store.toggleNodeFlag)
        {
            var node = actRow;
            while(node)
            {
                var parentValue = D3Api.TreeCtrl.getParentValue(node);
                if (!parentValue && (D3Api.getAllDomBy(data, 'tr.node[parentvalue=""]').length == 1))
                    showNode(dom, node, true);
                node = D3Api.getDomBy(data, 'tr[keyvalue="'+parentValue+'"]');
                if (node)
                    showNode(dom, node, true);
            }
            var cont = D3Api.getDomByAttr(dom, 'cont', 'treedatacont');
            cont.scrollTop = actRow.offsetTop - cont.offsetHeight / 2;
            D3Api.TreeCtrl.setLocate(dom,'');
        }
        dom.D3Store.toggleNodeFlag = false;
    };
    this.getRowByKey = function(dom,keyvalue)
    {
        var data = D3Api.getDomByAttr(dom, 'cont', 'treedata');
        return D3Api.getDomByAttr(data, 'keyvalue', keyvalue);
    };
    this.getValue = function TreeCtrl_GetValue(dom)
    {
        return D3Api.getProperty(dom, 'keyvalue', '');
    };
    this.setValue = function TreeCtrl_SetValue(dom,value)
    {
        var data = D3Api.getDomByAttr(dom, 'cont', 'treedata');
        var actRow = D3Api.getDomByAttr(data, 'keyvalue', value);
        if(actRow)
            rowActivate(data.rows[0],false);
        return D3Api.setProperty(dom, 'keyvalue', value);
    };
    this.getLocate = function TreeCtrl_GetLocate(dom)
    {
        return D3Api.getProperty(dom, 'locatevalue', '');
    };
    this.setLocate = function TreeCtrl_SetLocate(dom,value)
    {
        D3Api.setProperty(dom, 'locatevalue', value);
        if (!D3Api.empty(value))
            dom.D3Form.getDataSet(dom.D3Store.dataSetName).addEventOnce('onbefore_refresh', function(){
                var lv = D3Api.getProperty(dom, 'locatevalue');
                if(!D3Api.empty(lv))
                    this.setLocate(D3Api.getProperty(dom,'keyfield',''),lv);
            });
    };
    this.getData = function TreeCtrl_GetData(dom)
    {
        if (dom.D3Store.data)
            return dom.D3Store.data;
        return [];
    };
    this.setData = function TreeCtrl_SetData(dom,value)
    {
        return dom.D3Store.data = value;
    };
    this.getCaption = function TreeCtrl_GetCaption(dom)
    {
        return D3Api.TreeCtrl.getReturnValue(dom.D3Store.activeRow);
    };
    this.setCaption = function TreeCtrl_SetCaption(dom,value)
    {

    };
    this.getTitle = function TreeCtrl_GetTitle(dom)
    {
        var cont = D3Api.getDomByAttr(dom, 'cont', 'treecaptioncontent');
        return D3Api.getTextContent(cont);
    };
    this.setTitle = function TreeCtrl_SetTitle(dom, value)
    {
        var cont = D3Api.getDomByAttr(dom, 'cont', 'treecaptioncontent');
        D3Api.addTextNode(cont, D3Api.empty(value) ? '' : value, true);
    };
    this.headerSizerInit = function TreeCtrl_HeaderSizerInit(tr)
    {
        tr._header = true;
        D3Api.addEvent(tr,'mousemove',D3Api.TreeCtrl.onHeaderMove,true);
        D3Api.addEvent(tr,'mousedown',D3Api.TreeCtrl.onHeaderBeginSizeEC,true);
    };
    this._oldData = null;
    this.onHeaderBeginSizeEC = function(event)
    {
        D3Api.TreeCtrl.onHeaderMove(event);
        var target = event.srcElement || event.target;

        if (!target.parentNode._header || !target._canSize)
            return;

        var c = D3Api.TreeCtrl.getCol(target);
        c.width = target.offsetWidth;
        c.nextSibling.width = target.nextSibling.offsetWidth;
        D3Api.TreeCtrl._oldData = {width: target.offsetWidth, pos: event.pageX, col: c, rcol: c.nextSibling, rwidth: target.nextSibling.offsetWidth, W: target.offsetWidth+target.nextSibling.offsetWidth};

        window.captureEvents(Event.MOUSEMOVE | Event.MOUSEUP);

        window.onmousemove = D3Api.TreeCtrl.onHeaderSizeEC;
        window.onmouseup = D3Api.TreeCtrl.onHeaderEndSizeEC;
    };
    this.onHeaderSizeEC = function TreeCtrl_OnHeaderSize(event)
    {
        var W = D3Api.TreeCtrl._oldData.W;

        var nW = D3Api.TreeCtrl._oldData.width + event.pageX - D3Api.TreeCtrl._oldData.pos;
        var rNW = D3Api.TreeCtrl._oldData.rwidth - event.pageX + D3Api.TreeCtrl._oldData.pos;
        D3Api.TreeCtrl._oldData.col.width = nW;
        D3Api.TreeCtrl._oldData.rcol.width = rNW;
        if (D3Api.TreeCtrl._oldData.col.width < 10)
        {
            D3Api.TreeCtrl._oldData.col.width = 10;
            D3Api.TreeCtrl._oldData.rcol.width = W-10;
        }
        if (D3Api.TreeCtrl._oldData.rcol.width < 10)
        {
            D3Api.TreeCtrl._oldData.rcol.width = 10;
            D3Api.TreeCtrl._oldData.col.width = W-10;
        }
    };
    this.onHeaderEndSizeEC = function TreeCtrl_OnHeaderEndSize(dom)
    {
        var params = dom.D3Form.getParamsByName('Tree', D3Api.getProperty(dom, 'name'));
        if (params.profiles instanceof Array) {
            params.profiles = {};
        }
        var profile = (params) ? params.profiles[params.profile] : null;
        if (!profile) {
            params.profile = 'Пользовательский';
            params.profiles[params.profile] = createDefaultProfile(dom);
            profile = params.profiles[params.profile];
            generateMenuProfiles(dom);
        }
        if (profile) {
            var cols = D3Api.getChildTag(dom.D3Store._conts_.columns, 'colgroup', 0).children;

            for (var i = 0; i < cols.length; i++) {
                var col = profile.cols[D3Api.getProperty(cols[i], 'column_name')];

                if (col) {
                    col.width = cols[i].width;
                }
            }
        }
    };
    function createDefaultProfile(dom)
    {
        var range;
        if (dom.D3Store.range){
            range = dom.D3Store.range.D3Range.amount;
        }
        var profile = {cols: {}, amount:range};
        for(var i = 0, c = dom.D3Store.cols.length; i < c; i++)
        {
            profile.cols[dom.D3Store.cols[i].name] = {
                order: i,
                show: true,
                width: dom.D3Store.cols[i].width,
                align: dom.D3Store.cols[i].align
            };
        }
        return profile;
    }
    this.columnSize = function mousedown(event) {
        if(event.which != 1){
            return;
        }

        var startClientX = event.clientX;

        var elCurrentTd = event.currentTarget;
        while (elCurrentTd && !D3Api.hasClass(elCurrentTd, 'column_caption')) {
            elCurrentTd = elCurrentTd.parentElement;
        }

        var elTree = D3Api.getControlByDom(elCurrentTd, 'Tree');
        var cells = elCurrentTd.parentElement.cells;
        var elLastTd = cells[cells.length - 1];

        var current = {
            el: elCurrentTd,
            width: elCurrentTd.offsetWidth,
            cols: D3Api.getAllDomBy(elTree, 'col[index="' + D3Api.getProperty(elCurrentTd, 'index') + '"]')
        };
        var last = null;
        if(elCurrentTd !== elLastTd){
            last = {
                el: elLastTd,
                width: elLastTd.offsetWidth,
                cols: D3Api.getAllDomBy(elTree, 'col[index="' + D3Api.getProperty(elLastTd, 'index') + '"]')
            };
        }
        elCurrentTd = null;
        elLastTd = null;

        var cell, size = 0;
        for (var i = 0; i < cells.length; i++) {
            cell = {
                width: cells[i].offsetWidth,
                cols: D3Api.getAllDomBy(elTree, 'col[index="' + D3Api.getProperty(cells[i], 'index') + '"]')
            };
            size += cell.width;
            for (var j = 0; j < cell.cols.length; j++) {
                cell.cols[j].width = cell.width;
            }
        }
        cell = null;

        // Притормозим выполнение mousemove
        var brake = {
            status: false
        };

        function dragstart(event){
            event.preventDefault();
        }

        function mousemove(event){
            if(brake.status){
                brake.event = event;
                return;
            }

            var i, shiftX = event.clientX - startClientX;
            var clientWidthColumns = elTree.D3Store._conts_.columnscont.clientWidth;

            if(shiftX < -current.width + 11){
                shiftX = -current.width + 11;
            }

            if(!last && size + shiftX < clientWidthColumns){
                shiftX = clientWidthColumns - size;
            }

            for (i = 0; i < current.cols.length; i++) {
                current.cols[i].width = current.width + shiftX;
            }
            if(last && shiftX < 0){
                for (i = 0; i < last.cols.length; i++) {
                    last.cols[i].width = last.width - shiftX;
                }
            }

            D3Api.TreeCtrl.resize(elTree);

            brake.status = true;
            setTimeout(function (){
                brake.status = false;
                if(brake.event){
                    mousemove(brake.event);
                    delete brake.event;
                }
            }, 35);
        }

        function mouseup(event){
            D3Api.removeEvent(document, 'dragstart', dragstart);
            D3Api.removeEvent(document, 'mousemove', mousemove);
            D3Api.removeEvent(document, 'mouseup', mouseup);
            elTree.D3Store._conts_.columns.style.cursor = '';
            D3Api.TreeCtrl.onHeaderEndSizeEC(elTree);
        }

        D3Api.addEvent(document, 'dragstart', dragstart);
        D3Api.addEvent(document, 'mousemove', mousemove);
        D3Api.addEvent(document, 'mouseup', mouseup);
        elTree.D3Store._conts_.columns.style.cursor = 'e-resize';
        D3Api.getDomByAttr(elTree, 'cont', 'treedatacont').parentNode.style.paddingTop = D3Api.getDomByAttr(elTree, 'cont', 'treecaption').offsetHeight + elTree.D3Store._conts_.columnscont.offsetHeight + "px";
        event.preventDefault();
    };
    this.getCol = function TreeCtrl_getCol(th)
    {
        var t = th.parentNode;
        while (t.nodeName != 'TABLE')
            t = t.parentNode;

        var cg = D3Api.getChildTag(t, 'colgroup', 0);

        return cg.childNodes[th.cellIndex];
    };
    this.onHeaderMove = function TreeCtrl_OnHeaderMove(event)
    {
        var target = event.srcElement || event.target;

        if (!target.parentNode._header)
            return;
        if (target.parentNode.cells.length-1 == target.cellIndex || target._sizeChange)
            return;

        var s = D3Api.getAbsoluteClientRect(target,true,true);

        if ((s.width+s.x - event.pageX)<=5)
        {
            target.style.cursor = 'e-resize';
            target._canSize = true;
        }else
        {
            target.style.cursor = '';
            target._canSize = false;
        }
    };
    this.onHeaderBeginSize = function TreeCtrl_OnHeaderBeginSize(event)
    {
        D3Api.TreeCtrl.onHeaderMove(event);
        var target = event.srcElement || event.target;

        if (!target.parentNode._header || !target._canSize)
            return;

        var c = D3Api.TreeCtrl.getCol(target);
        target._oldData = {width: c.offsetWidth, pos: event.pageX, col: c, rcol: c.nextSibling, rwidth: c.nextSibling.offsetWidth};
        target.setCapture(true);
        D3Api.addEvent(target,'mousemove',D3Api.TreeCtrl.onHeaderSize,true);
        D3Api.addEvent(target,'mouseup',D3Api.TreeCtrl.onHeaderEndSize,true);
        target.style.cursor = 'e-resize';
        target._sizeChange = true;
    };
    this.onHeaderSize = function TreeCtrl_OnHeaderSize(event)
    {
        var target = event.srcElement || event.target;

        var W = target._oldData.col.offsetWidth+target._oldData.rcol.offsetWidth;

        var nW = target._oldData.width + event.pageX - target._oldData.pos;
        var rNW = target._oldData.rwidth - event.pageX + target._oldData.pos;
        target._oldData.col.width = nW;
        target._oldData.rcol.width = rNW;
        if (target._oldData.col.offsetWidth < 10)
        {
            target._oldData.col.width = 10;
            target._oldData.rcol.width = W-10;
        }
        if (target._oldData.rcol.offsetWidth < 10)
        {
            target._oldData.rcol.width = 10;
            target._oldData.col.width = W-10;
        }
    };
    this.onHeaderEndSize = function TreeCtrl_OnHeaderEndSize(event)
    {
        var target = event.srcElement || event.target;

        target.style.cursor = '';
        target._sizeChange = false;
        D3Api.removeEvent(target,'mousemove',D3Api.TreeCtrl.onHeaderSize,true);
        D3Api.removeEvent(target,'mouseup',D3Api.TreeCtrl.onHeaderEndSize,true);
    };
    this.titleClick = function(event,name)
    {
        var target = event.srcElement || event.target;

        D3Api.getControlByDom(target, 'Tree');
    };
    this.toggleFilter = function(dom)
    {
        var tree = D3Api.getControlByDom(dom, 'Tree');

        var filter = D3Api.getDomByAttr(tree, 'cont', 'treefilter');

        D3Api.toggleClass(filter, 'filter-block', 'filter-none');

        if(D3Api.hasProperty(dom,'fhead_uid'))
        {
            var ctrl = D3Api.getDomByAttr(filter,'fdata_uid',D3Api.getProperty(dom,'fhead_uid'));
            D3Api.setControlPropertyByDom(ctrl, 'focus', true);
        }

        D3Api.TreeCtrl.resize(tree);
    };
    this.hideFilter = function(dom)
    {
        var tree = D3Api.getControlByDom(dom, 'Tree');
        var filter = D3Api.getDomByAttr(tree, 'cont', 'treefilter');
        D3Api.toggleClass(filter, 'filter-block', 'filter-none', true);
    };
    this.searchFilter = function(dom,hide)
    {
        var tree = D3Api.getControlByDom(dom, 'Tree');
        D3Api.TreeCtrl.activateFilter(dom);
        tree.D3Form.refreshDataSet(tree.D3Store.dataSetName);
        if(hide)
            D3Api.TreeCtrl.hideFilter(tree);
    };
    this.activateFilter = function(dom)
    {
        var tree = D3Api.getControlByDom(dom, 'Tree');
        var fItems = D3Api.getAllDomBy(tree,'[fdata_uid]');
        var fPrevUid = '';
        var fUid;
        for(var i = 0, ic = fItems.length; i < ic; i++)
        {
            fPrevUid = fUid;
            fUid = D3Api.getProperty(fItems[i], 'fdata_uid');
            var ctrl = D3Api.getDomByAttr(tree, 'fhead_uid', fUid);
            if (!D3Api.empty(D3Api.getControlPropertyByDom(fItems[i], 'value')))
                D3Api.addClass(ctrl, 'active');
            else if(fPrevUid != fUid)
                D3Api.removeClass(ctrl, 'active');
        }
    };
    this.clearFilter = function(dom,refresh,hide)
    {
        var tree = D3Api.getControlByDom(dom, 'Tree');
        var fi = D3Api.getAllDomBy(tree, "[filteritem]");
        for(var i = 0, c = fi.length; i < c; i++)
        {
            if (D3Api.getProperty(fi[i], "cmptype") == "ButtonEdit") {
                tree.D3Form.setCaption(fi[i], '');
            }
            tree.D3Form.setValue(fi[i], '');
        }
        if(refresh)
            tree.D3Form.refreshDataSet(tree.D3Store.dataSetName);
        if(hide)
            D3Api.TreeCtrl.hideFilter(tree);
    };
    this.getReturnValue = function TreeCtrl_GetReturnValue(dom)
    {
        return D3Api.getProperty(dom, 'returnvalue', '');
    };
    this.setReturnValue = function TreeCtrl_SetReturnValue(dom,value)
    {
        return D3Api.setProperty(dom, 'returnvalue', value);
    };
    this.toggleList = function (dom)
    {
        dom = D3Api.getControlByDom(dom, 'Tree');
        D3Api.setControlPropertyByDom(dom,'list',!D3Api.getControlPropertyByDom(dom,'list'));
    };
    this.getList = function TreeCtrl_GetReturnValue(dom)
    {
        return dom.D3Tree.listUse;
    };
    this.setList = function TreeCtrl_SetReturnValue(dom,value)
    {
        dom.D3Tree.listUse = (value)?1:0;
        if(dom.D3Tree.listDom)
        {
            if(dom.D3Tree.listUse == 1)
            {
                D3Api.setControlPropertyByDom(dom.D3Tree.listDom,'icon','~CmpTree/list');
            }else
            {
                D3Api.setControlPropertyByDom(dom.D3Tree.listDom,'icon','');
            }
        }
        return true;
    };
    this.getParentValue = function TreeCtrl_GetParentValue(dom)
    {
        return D3Api.getProperty(dom, 'parentvalue', '');
    };
    this.setParentValue = function TreeCtrl_SetParentValue(dom,value)
    {
        return D3Api.setProperty(dom, 'parentvalue', value);
    };
    this.setTreeData = function TreeCtrl_SetTreeData(dom,data,innerCall)
    {
        /*if (!innerCall && dom.D3Store.isFullData)
        {
            dom.D3Store.fullData = {};
            var rootData = [];
            for(var fi = 0, fc = data.length; fi < fc; fi++)
            {
                if (data[fi][dom.D3Store.parentField] == dom.D3Store.root || (D3Api.empty(dom.D3Store.root) && D3Api.empty(data[fi][dom.D3Store.parentField])))
                {
                    rootData.push(data[fi]);
                    continue;
                }
                if (!dom.D3Store.fullData[data[fi][dom.D3Store.parentField]])
                    dom.D3Store.fullData[data[fi][dom.D3Store.parentField]] = [data[fi]];
                else
                    dom.D3Store.fullData[data[fi][dom.D3Store.parentField]].push(data[fi]);
            }
            D3Api.TreeCtrl.setTreeData(dom,rootData,true);
            return;
        }    */
        if (!dom.D3Store.toggleNodeFlag)
        {
            //Все данные, тогда удаляем все строки
            dom.D3Store.rowTpl.removeAllClones();
        }
        if(data.length == 0)
        {
            return;
        }
        var _datadom = D3Api.getDomBy(dom,'[cont="treedatacont"]');
        var queueData = [];
        var reqParent = {};
        var parent = null;
        var parents = {};
        var curParent = false;
        var cLvl = 0;
        var lastC = 0;
        while (data.length > 0)
        {
            if(lastC == data.length)
            {
                for(var i = 0, c = data.length; i < c; i++)
                {
                    var h = false;
                    for(var ii = 0, cc = data.length; ii < cc; ii++)
                    {
                        if(data[i][dom.D3Store.parentField] == data[ii][dom.D3Store.keyField])
                        {
                            h = true;
                            break;
                        }
                    }
                    if(h == false)
                        data[i][dom.D3Store.parentField] = null;
                }
            }
            lastC = data.length;
            for(var i = 0, c = data.length; i < c; i++) {
                if (dom.D3Store.maxLevels > 0 && dom.D3Store.maxLevels < cLvl) {
                    //Бесконечный цикл
                    data[i][dom.D3Store.parentField] = null;
                }
                var pV = data[i][dom.D3Store.parentField];

                if (pV !== curParent) {
                    if (pV === null || pV == undefined || pV == dom.D3Store.root) {
                        dom.D3Store.rootDom.appendChild(dom.D3Store.rowTpl.targetDOM);
                        if (!parents[pV]) {
                            parents[pV] = {dom: null, lastChild: null};
                            //Все данные, тогда удаляем все строки
                            dom.D3Store.rowTpl.removeAllClones();
                        }
                        parent = null;
                    } else {
                        dom.D3Store.rootDom.appendChild(dom.D3Store.rowTpl.targetDOM);
                        if (!parents[pV]) {
                            //удалить только потомков этого узла
                            this.removeNode(dom, pV);
                            parent = D3Api.getDomByAttr(_datadom, 'keyvalue', pV);
                            if (!parent || D3Api.hasProperty(parent, 'isd3repeater') || reqParent[pV]) {
                                reqParent[pV] = true;
                                curParent = false;
                                queueData.push(data[i]);
                                continue;
                            }
                            parents[pV] = {dom: parent, lastChild: parent, lastChildpV: pV};
                            parent.D3Store.loaded = true;
                            parent.D3Store.node = true;
                        } else {
                            var lpV = pV;
                            while (parents[parents[lpV].lastChildpV] && lpV != parents[lpV].lastChildpV) {
                                lpV = parents[lpV].lastChildpV;
                                parents[pV].lastChild = parents[lpV].lastChild;
                                parents[pV].lastChildpV = parents[lpV].lastChildpV;
                            }
                        }

                        parents[pV].lastChild.parentNode.insertBefore(dom.D3Store.rowTpl.targetDOM, parents[pV].lastChild.nextSibling);
                    }
                    curParent = pV;
                }
                if (dom.D3Store.isSimple) {
                    dom.D3Store.rowTpl.parent = true;
                    dom.D3Store.rowTpl.currentData = data[i];
                    var clone = dom.D3Store.rowTpl.simpleClone(dom.D3Store.rowTpl.targetDOM);
                }else{
                    var clone = dom.D3Store.rowTpl.addClone(data[i]);
                }
                if(!clone) continue;
                parents[pV].lastChild = clone;
                parents[pV].lastChildpV = data[i][dom.D3Store.keyField];
                if (dom.D3Store.childsField && data[i][dom.D3Store.childsField] == 0 && !dom.D3Store.isFullData)
                {
                    D3Api.addClass(clone,'nochilds');
                }else if(dom.D3Store.isFullData)
                {
                    D3Api.addClass(clone,'nochilds');
                    if(pV && parents[pV].dom)
                        D3Api.removeClass(parents[pV].dom,'nochilds');
                }
                D3Api.TreeCtrl.setParentValue(clone, pV);
                if (pV && pV != dom.D3Store.root)
                {
                    setNodePadding(clone,parents[pV].dom);
                    D3Api.showDom(clone, false);
                }else
                    clone.D3Store.level=1;
            }
            data = queueData;
            queueData = [];
            reqParent = {};
            cLvl++;
        }

        //Раскрываем узлы при поиске
        if(dom.D3Store.isFilterData || (dom.D3Store.isFullData && dom.D3Store.isDefaultOpened))
        {
            openAllNodes(dom);
        }
        if (parent)
        {
            if(dom.D3Store.toggleNodeFlag)
                showNode(dom,parent);
        }
        dom.D3Store.rootDom.appendChild(dom.D3Store.rowTpl.targetDOM);
        if (dom.D3Store.isFullData && !dom.D3Store.toggleNodeFlag)
        {
            var oRow;
            var openNodes = D3Api.clone(dom.D3Tree.openNodes,1);
            dom.D3Tree.openNodes = {};
            for(var nV in openNodes)
            {
                if(!openNodes.hasOwnProperty(nV)){
                    continue;
                }
                oRow = D3Api.getDomByAttr(_datadom, 'keyvalue', nV);

                if(!oRow || D3Api.getProperty(oRow,'isd3repeater',false))
                    continue;
                showNode(dom,oRow,true);
            }
        }
        D3Api.TreeCtrl.resize(dom);
    };
    function setNodePadding(row,parent)
    {
        if (parent)
        {
            row.D3Store.level = parent.D3Store.level+1;
            row.cells[0].style.paddingLeft = row.D3Store.level*18+'px';
        }
    }
    this.removeNode = function TreeCtrl_RemoveNode(dom,keyValue)
    {
        var childs = D3Api.getAllDomBy(dom, '[parentvalue="'+keyValue+'"]');

        for(var ci = 0, cc = childs.length; ci < cc; ci++)
        {
            D3Api.TreeCtrl.removeNode(dom,D3Api.TreeCtrl.getValue(childs[ci]));
            dom.D3Store.rowTpl.removeClone(childs[ci]);
        }
    };
    this.toggleNode = function TreeCtrl_toggleNode(domNode)
    {
        var row = D3Api.getControlByDom(domNode, 'TreeRow');

        if(D3Api.hasClass(row, 'nochilds'))
            return;

        var tree = D3Api.getControlByDom(domNode, 'Tree');
        D3Api.toggleClass(row, 'closed', 'opened');
        var flagOpened = D3Api.hasClass(row, 'opened');

        if(flagOpened) {
            tree.D3Base.callEvent('onopen_node', tree, row);
            D3Api.BaseCtrl.setHint(domNode, "Свернуть");
        }
        else {
            tree.D3Base.callEvent('onclose_node', tree, row);
            D3Api.BaseCtrl.setHint(domNode, "Развернуть");
        }

        if (!row.D3Store.loaded && !tree.D3Store.isFullData)
        {
            tree.D3Store.toggleNodeFlag = true;
            var pV = D3Api.TreeCtrl.getValue(row);
            D3Api.TreeCtrl.setParentValue(tree,pV);
            if (tree.D3Store.parentVar){
                tree.D3Form.setVar(tree.D3Store.parentVar,pV);
            }
            tree.D3Form.refreshDataSet(D3Api.getProperty(tree,'dataset'),undefined,undefined,undefined,undefined,false);

            D3Api.TreeCtrl.setParentValue(tree,'');
            if (tree.D3Store.parentVar){
                tree.D3Form.setVar(tree.D3Store.parentVar,'');
            }
        }else
        {
            showNode(tree,row);
            D3Api.TreeCtrl.resize(tree);
        }

        if(flagOpened){
            tree.D3Base.callEvent('onopen_node_after',tree,row);
        }
        else{
            tree.D3Base.callEvent('onclose_node_after',tree,row);
        }

        D3Api.stopEvent();
    };
    function setOpenNode(tree,rowKey,state)
    {
        if(tree.D3Store.isFilterData)
            return;
        if(state)
            tree.D3Tree.openNodes[rowKey] = true;
        else
        {
            tree.D3Tree.openNodes[rowKey] = undefined;
            delete tree.D3Tree.openNodes[rowKey];
        }
    }

    function openCloseNode(tree, row, show, hasChild)
    {
        var rowKey = D3Api.TreeCtrl.getValue(row);
        if (show && !hasChild && row.D3Store.loaded)
        {
            D3Api.addClass(row, 'nochilds');
            return;
        }
        if(show && D3Api.hasClass(row, 'closed') && hasChild)
        {
            D3Api.removeClass(row, 'closed');
            D3Api.addClass(row, 'opened');
            setOpenNode(tree,rowKey,true);
        }else if(!show && D3Api.hasClass(row, 'opened'))
        {
            D3Api.removeClass(row, 'opened');
            D3Api.addClass(row, 'closed');
            setOpenNode(tree,rowKey,false);
        }else if(D3Api.hasClass(row, 'closed'))
        {
            setOpenNode(tree,rowKey,false);
        }else
            setOpenNode(tree,rowKey,true);
    }

    function showNode(tree, row, show)
    {
        var rowKey = D3Api.TreeCtrl.getValue(row);
        //Показать всех потомков
        var chn = D3Api.getAllDomBy(tree, '[parentvalue="' + rowKey + '"]');

        if(show === undefined)
            show = !D3Api.showedDom(row) ? false : (
                D3Api.hasClass(row, 'opened') ? true : (D3Api.hasClass(row, 'closed') ? false : null)
            );

        if (show == null)
            return;

        var hasChild = !(chn.length == 0);
        openCloseNode(tree, row, show, hasChild);

        for(var i = 0, c = chn.length; i < c; i++)
        {
            D3Api.showDom(chn[i], show);
            showNode(tree,chn[i]);
        }
    }
    this.showNode = showNode;

    function openAllNodes(tree)
    {
        var roots = D3Api.getAllDomBy(tree.D3Store._conts_.datacont, 'tr.node[parentvalue=""]');
        for (var i=0; i < roots.length; i++) {
            var row = roots[i];
            var rowkeys = [D3Api.TreeCtrl.getValue(row)];
            if(!row.nextSibling)continue;
            openCloseNode(tree, row, true, true);
            row = row.nextSibling;
            rowkeys.push(D3Api.TreeCtrl.getValue(row));
            while (row) {
                if (D3Api.getProperty(row, 'isd3repeater', false)) {
                    row = row.nextSibling;
                    rowkeys.push(row && D3Api.TreeCtrl.getValue(row));
                    continue;
                }
                var nextRow = row.nextSibling;
                var parentValue = nextRow && D3Api.TreeCtrl.getParentValue(nextRow);
                var hasChild = rowkeys.indexOf(parentValue) !== -1;
                openCloseNode(tree, row, true, hasChild);
                D3Api.showDom(row, true);
                row = nextRow;
                rowkeys.push( nextRow && D3Api.TreeCtrl.getValue(row));
            }
        }
    }

    this.filterKeyPress = function(filterItem)
    {
        var e = D3Api.getEvent();
        if(e.keyCode != 13)
            return;

        D3Api.TreeCtrl.searchFilter(filterItem,true);
    };

    this.onAfterCloneNotNode = function(clone,nameTree,childsField,notnode)
    {
        if((+clone.clone.data[childsField] || clone.clone.data[notnode] !== undefined) && (clone.clone.data[notnode] === undefined || !(+clone.clone.data[notnode])))
        {
            clone.D3Form.removeControl(nameTree+'_SelectList_Item');
        }
    };

    this.onAfterCloneColSpan = function(clone)
    {
        var colSpans = clone.parentElement.parentElement.parentElement.parentElement.parentElement.D3Store.colSpans; // cписок колонок с colspan
        var td = D3Api.getAllDomBy(clone, 'td');
        td = Array.prototype.slice.call(td);

        var itemsToRemove = 0; // сколько нужно удалить ячеек после ячейки с colspan

        // объединяем и удаляем ячейки таблицы
        td.forEach(function (item) {
            if (itemsToRemove > 0){
                D3Api.removeDom(item);
                itemsToRemove--;
                return;
            }

            var colName = D3Api.getProperty(item,'column_name');

            if (colSpans[colName] && clone.clone.data[colSpans[colName]] && +clone.clone.data[colSpans[colName]] > 1){
                D3Api.setProperty(item,'colspan',+clone.clone.data[colSpans[colName]]);
                itemsToRemove = +clone.clone.data[colSpans[colName]] - 1;
                return;
            }
        })
    };

    this.exportTBS = function (dom) {
        var tree = D3Api.getControlByDom(dom, 'Tree');
        var SL = D3Api.getDomByAttr(tree,'cmptype','SelectList');
        //колонки в массив
        var cols = tree.D3Store.cols;
        var tree_columns = {};

        cols.sort(function (x1, x2) {
            if (x1._order == null) {
                x1._order = -1;
            }
            if (x2._order == null) {
                x2._order = -1;
            }
            return x1._order - x2._order;
        });

        for (var i = 0; i < cols.length; i++) {
            if (cols[i]._show && cols[i].field) {
                tree_columns[cols[i].field] = cols[i].caption;
            }
        }

        //заголовок
        var tree_caption = (D3Api.getTextContent(D3Api.getDomByAttr(tree, 'cont', 'treecaptioncontent')) || '');
        //датасет
        var dataset = tree.D3Store.dataSetName;
        var ds_obj = dom.D3Form.getDataSet(dataset);
        var params = ds_obj.sysinfo.getParams(dataset);
        var t_ext = ds_obj.getRequestData();
        var _ext_ = {};

        if ('filters' in t_ext) {
            _ext_.filters = t_ext.filters;
        }
        if (SL)
        {
            var kf = D3Api.getProperty(tree,'keyfield');
            var sl = tree.D3Form.getValue(SL);
            if(kf && sl)
            {
                _ext_.filters = _ext_.filters || {};
                _ext_.filters[kf] = '*'+sl;
            }
        }

        if ('sorts' in t_ext) {
            _ext_.sorts = t_ext.sorts;
        }
        params._ext_ = _ext_;
        params._uid_ = D3Api.getUniqId('DS');

        params.action = 'export_tbs';
        params.__caption = tree_caption;
        params.__columns = tree_columns;
        params.__columns_to_sum = tree.D3Store.columns_to_sum;

        tree.D3Form.sendRequest(dataset, {
            type: 'Tree',
            params: params
        }, false, function() {
            var result = arguments[1];

            if (!result || !result[dataset]) {
                return;
            }

            D3Api.downloadFile(result[dataset].nameFile, (tree_caption || 'Выгрузка') + '.ods', true, 'application/vnd.oasis.opendocument.spreadsheet');
        });
    };
    this.saveDefaultProfile = function (formHash, treeName, data, callback, onlyDefault) {
        var req = {
            tree: {
                type: 'Tree',
                params: {
                    hash: formHash,
                    name: treeName,
                    only: onlyDefault,
                    profile: data
                }
            }
        };
        D3Api.requestServer({
            url: 'request.php',
            async: true,
            method: 'POST',
            urlData: {action: 'savedefault'},
            data: {request: D3Api.JSONstringify(req)},
            onSuccess: function (res) {
                var result = JSON.parse(res);

                callback && callback(D3Api.empty(result.tree.error));
            },
            onError: function (res) {
                callback(false);
            }
        });
    };
    this.setVisible = function(dom,value)
    {
        D3Api.BaseCtrl.setVisible(dom,value);
        if(D3Api.getBoolean(value))
            D3Api.TreeCtrl.resize(dom);
    };
    this.openProfile = function (dom) {
        var elTree = D3Api.getControlByDom(dom, 'Tree');
        var elParamsCont = D3Api.getDomByAttr(elTree, 'cont', 'tree_params_cont');

        if (elParamsCont.D3Container && elParamsCont.D3Container.currentForm) {
            return;
        }
        //Получим параметры
        var treename = D3Api.getProperty(elTree, 'name', '');
        var params = elTree.D3Form.getParamsByName('Tree', treename);
        // параметры для CustomFilter-а по-умолчанию
        var params_cf = elTree.D3Form.getParamsByName('CustomFilter', 'cf_' + treename);

        params_cf.dataset = elTree.D3Store.dataSetName;
        if (params.profiles instanceof Array) {
            params.profiles = {};
        }
        D3Api.showDomBlock(elParamsCont);
        D3Api.showForm('Components/GridTree/params',null,{
            modal_form: true,
            vars: {
                formhash: elTree.D3Form.getFormParamsHash(),
                componentname: treename,
                data: params,
                data_cf: params_cf,
                cols: elTree.D3Store.cols,
                element: elTree,
                typeComponent: 'Tree'
            },
            onclose: function(res){
                elTree.D3Form.setValue('cf_'+ treename,params_cf);
                D3Api.setDomDisplayDefault(elParamsCont);
                if(!res) return;
                D3Api.TreeCtrl.setProfile(elTree);
            }
        });
    };
    this.setProfile = function (dom, profile, refresh, genmenu) {
        genmenu = (genmenu === undefined) || genmenu;
        var gName = D3Api.getProperty(dom, 'name');
        var params = dom.D3Form.getParamsByName('Tree', gName);

        if (params.profiles instanceof Array) {
            params.profiles = {};
        }
        profile = profile || params.profile || 'По умолчанию';
        params.profile = profile.replace(/&quot;/g,'"');

        if (genmenu) {
            generateMenuProfiles(dom, profile);
        } else {
            var item = D3Api.getDomBy(dom.D3Store.profilePMItem, '[class*="tree_profile_active_item"]');
            if (item) {
                D3Api.removeClass(item, 'tree_profile_active_item');
                D3Api.setControlPropertyByDom(item, 'icon', '');
            }
        }
        dom.D3Store.currentProfile = profile;
        profile = params.profiles[profile];
        if (!profile) {
            hideAllColDoms(dom.D3Store.cols);
            showAllColDoms(dom.D3Store.cols);
            dom.D3Store.currentProfile = '';
        } else {
            var order = [];
            var orderTmp = [];

            if (profile.cols){
                for (var prop in profile.cols){
                    if(profile.cols.hasOwnProperty(prop)){
                        orderTmp[profile.cols[prop].order] = {name:prop, show:profile.cols[prop].show, colsAfter:[]};
                    }
                }

                var fieldBefore = '';
                for(var i = 0, c = dom.D3Store.cols.length; i < c; i++)
                {
                    var cl = dom.D3Store.cols[i];
                    var found = false;
                    /* ищем есть ли она в профиле */
                    for(var i1 = 0, c1 = orderTmp.length; i1 < c1; i1++)
                    {
                        if (orderTmp[i1] && orderTmp[i1].name == cl.name){
                            orderTmp[i1].index = i;
                            found = true;
                        }
                    }
                    if (found){
                        fieldBefore = cl.name;
                    }
                    else{
                        if (fieldBefore == ''){ /* если разработчик поставил ее в самое начало */
                            orderTmp[-1] = {name:cl.name, show:1, index:i, colsAfter:[]}
                        }
                        else{
                            /* ищем предыдущую колонку */
                            for(var i1 = -1, c1 = orderTmp.length; i1 <= c1; i1++)
                            {
                                if (orderTmp[i1] && orderTmp[i1].name == fieldBefore){
                                    orderTmp[i1].colsAfter.push(i);
                                }
                            }
                        }
                    }
                    hideColDoms(cl)
                }

                /* формируем правильный порядок */
                for(var i = -1, c = orderTmp.length; i <= c; i++)
                {
                    if (orderTmp[i] === undefined) continue;
                    if (orderTmp[i] && orderTmp[i].show == 1 && orderTmp[i].index>=0) order.push(orderTmp[i].index);
                    if (orderTmp[i].colsAfter && orderTmp[i].colsAfter.length > 0){
                        for(var i1 = 0, c1 = orderTmp[i].colsAfter.length; i1 < c1; i1++)
                        {
                            order.push(orderTmp[i].colsAfter[i1]);
                        }
                    }
                }
            }

            for (var i = 0, c = order.length; i < c; i++) {
                if (order[i] === undefined) continue;
                showColDoms(dom.D3Store.cols[order[i]], (profile && profile.cols) ? profile.cols[dom.D3Store.cols[order[i]].name] : undefined);
            }
            var cols = D3Api.getAllDomBy(dom.D3Store._conts_.columns, 'col[fcol]');
            var colWidth = 0;
            var emptyCols = [];

            for (var i = 0, c = cols.length; i < c; i++) {
                colWidth += +cols[i].width;
                if (+cols[i].width <= 0) {
                    emptyCols.push(D3Api.getProperty(cols[i], 'fcol'));
                }
            }
            if (dom.D3Store._conts_.datacont.clientWidth < colWidth && emptyCols.length > 0) {
                for (var i = 0, c = emptyCols.length; i < c; i++) {
                    var ecols = D3Api.getAllDomBy(dom, 'col[fcol="' + emptyCols[i] + '"]');
                    for (var j = 0, l = ecols.length; j < l; j++) {
                        ecols[j].width = 100;
                    }
                }
            }
        }
        if (refresh === undefined || refresh) {
            D3Api.TreeCtrl.setTreeData(dom,dom.D3Form.getRepeater(dom.D3Store.repeaterName).dataSet.data);
        }
        dom.D3Form.saveParams();
    };
    function generateMenuProfiles(dom, profile) {
        var gName = D3Api.getProperty(dom, 'name');
        var params = dom.D3Form.getParamsByName('Tree', gName);

        if (params.profiles instanceof Array) {
            params.profiles = {};
        }
        profile = profile || params.profile;

        var pM = dom.D3Form.getControl(dom.D3Store.popupMenu);
        var pMAPI = D3Api.getControlAPIByDom(pM);
        var items = pMAPI.getItems(dom.D3Store.profilePMItem);

        for (var i = 0, c = items.length-1; i < c; i++) {
            pMAPI.deleteItem(pM, items[i]);
        }

        var sortP = [];

        for (var p in params.profiles) {
            if(params.profiles.hasOwnProperty(p)){
                sortP.push(p);
            }
        }
        sortP.sort();

        var sp = false;
        for (var i = 0, c = sortP.length; i < c; i++) {
            var p = sortP[i];
            sp = true;
            var pj = p;
            pj = pj.split('"').join('&quot;').split("'").join("\\'");
            var item = pMAPI.addItem(pM, {
                onclick: 'D3Api.TreeCtrl.setProfile(getControl(\''+gName+'\'),\''+pj+'\',true,false);D3Api.addClass(this, \'tree_profile_active_item\');D3Api.setControlPropertyByDom(this,\'icon\',\'~CmpTree/arrow_right\');',
                caption: p
            }, dom.D3Store.profilePMItem);
            if (p == profile) {
                D3Api.addClass(item, 'tree_profile_active_item');
                D3Api.setControlPropertyByDom(item, 'icon', '~CmpTree/arrow_right');
            }
        }
        if (sp) {
            pMAPI.addItem(pM, {caption: '-'}, dom.D3Store.profilePMItem);
        }
        pMAPI.addItemDom(pM, items[items.length-1], dom.D3Store.profilePMItem);
    }
    function hideAllColDoms(cols) {
        for (var i = 0, c = cols.length; i < c; i++) {
            hideColDoms(cols[i]);
        }
    }
    function hideColDoms(col) {
        for (var i = 0, c = col.doms.length; i < c; i++) {
            if (col.doms[i].col.nodeName === 'TD' && D3Api.getProperty(col.doms[i].col, 'keep')) {
                D3Api.addDom(col.doms[i].parentNode, col.doms[i].col);
                D3Api.hideDom(col.doms[i].col);
                D3Api.setProperty(col.doms[i].col, 'hidden', 'true');
            } else {
                D3Api.removeDom(col.doms[i].col);
            }
        }
        col._show = false;
    }
    function showAllColDoms(cols) {
        for (var i = 0, c = cols.length; i < c; i++) {
            showColDoms(cols[i]);
        }
    }
    function showColDoms(col, params) {
        for (var i = 0, c = col.doms.length; i < c; i++) {

            if(!params && !col.defaultShow)
                continue;

            var beforeDom = null;

            if (col.doms[i].col.nodeName === 'TD') {
                beforeDom = D3Api.getDomByAttr(col.doms[i].parentNode, 'hidden', 'true');
            }

            if (beforeDom) {
                D3Api.insertBeforeDom(beforeDom, col.doms[i].col);
            }
            else {
                D3Api.addDom(col.doms[i].parentNode, col.doms[i].col);
            }

            if (D3Api.getProperty(col.doms[i].col, 'keep')) {
                D3Api.setDomDisplayDefault(col.doms[i].col);
                D3Api.removeProperty(col.doms[i].col, 'hidden');
            }
            if (col.doms[i].col.nodeName === 'COL') {
                col.doms[i].col.width = (!params || params.width === undefined) ? col.width : params.width;
            }
            else if (D3Api.hasClass(col.doms[i].col, 'column_data') || D3Api.hasClass(col.doms[i].col, 'tree__wf-column')) {
                col.doms[i].col.style.textAlign = (!params || params.align === undefined) ? col.align : params.align;
            }
        }
        col._show = true;
    }
    this._getDefaultParams = function () {
        return {
            profiles: {
                /*
                 * profile: {
                 *      cols : {
                 *          name: {
                 *              order: 0,
                 *              show: true,
                 *              width: 100,
                 *              align: 'left'
                 *          }
                 *      }
                 * }
                 */
            },   //Профили
            profile: ''     //Выбранный профиль
        };
    };
    this.stopPopup = function (event) {
        event = D3Api.getEvent(event);

        if ((event.button && event.button == 2) || (event.which && event.which == 3)) {
            D3Api.stopEvent(event);
        }
    };

    this.CtrlKeyDown = function (dom, e) {
        switch (e.keyCode) {
            case 40: //стрелка вниз
                var flag = false;
                while(!flag)
                {
                    var next_row = D3Api.TreeCtrl.getNextRow(dom);
                    if (next_row) {
                        D3Api.TreeCtrl.setActiveRow(next_row);

                        if(D3Api.showedDom(next_row))
                            flag = true;
                    }
                    else
                        break;
                }
                if(next_row)
                {
                    next_row.click();
                    var cont = D3Api.getDomByAttr(dom, 'cont', 'treedatacont');
                    cont.scrollTop = next_row.offsetTop - cont.offsetHeight / 2;
                }

                D3Api.stopEvent(e)
                break;
            case 38: //стрелка вверх
                var flag = false;
                while(!flag)
                {
                    var next_row = D3Api.TreeCtrl.getPreviousRow(dom);
                    if (next_row) {
                        D3Api.TreeCtrl.setActiveRow(next_row);

                        if(D3Api.showedDom(next_row))
                            flag = true;
                    }
                    else
                        break;
                }

                if(next_row)
                {
                    next_row.click();
                    var cont = D3Api.getDomByAttr(dom, 'cont', 'treedatacont');
                    cont.scrollTop = next_row.offsetTop - cont.offsetHeight / 2;
                }

                D3Api.stopEvent(e)
                break;
            case 39: //стрелка вправо
                var domNode = D3Api.TreeCtrl.getActiveRow(dom);
                var button = D3Api.getDomByAttr(domNode, 'class', 'btnOC');
                var flagOpened = D3Api.hasClass(domNode, 'opened');

                if(!flagOpened)
                    D3Api.TreeCtrl.toggleNode(button);
                D3Api.stopEvent(e)
                break;
            case 37: //стрелка влево
                var domNode = D3Api.TreeCtrl.getActiveRow(dom);
                var button = D3Api.getDomByAttr(domNode, 'class', 'btnOC');
                var flagOpened = D3Api.hasClass(domNode, 'opened');

                if(flagOpened)
                    D3Api.TreeCtrl.toggleNode(button);
                D3Api.stopEvent(e)
                break;
            case 32: // Space
                var active_row = D3Api.TreeCtrl.getActiveRow(dom);
                var top = 0;
                var left = 0;
                var elem = active_row;
                while (elem) {
                    top = top + parseFloat(elem.offsetTop);
                    left = left + parseFloat(elem.offsetLeft);
                    elem = elem.offsetParent;
                }
                var pM = active_row.D3Form.getControl(dom.D3Store.popupMenu);
                var coords = {left: left + 100, top: top};
                pM.D3Form.lastFocusControl = dom;
                D3Api.PopupMenuCtrl.show(pM, coords);
                D3Api.setControlPropertyByDom(pM, 'focus', true);
                D3Api.PopupMenuCtrl.setNextItem(pM, 1);
                D3Api.stopEvent(e)
                break;
            case 13: //Enter
                var active_row = D3Api.TreeCtrl.getActiveRow(dom);
                if (active_row && typeof(active_row.ondblclick) == 'function') {
                    active_row.ondblclick();
                }
                break;
        }
    }

    /* обновляем указанный через значение keyvalue узел */
    this.refreshNode = function TreeCtrl_RefreshNode(dom, keyvalue, locateValue)
    {
        var data = D3Api.getDomByAttr(dom, 'cont', 'treedata');
        var row = D3Api.getDomByAttr(data, 'keyvalue', keyvalue);

        /* говорим, что даннные  еще не загружены и узел свернут */
        row.D3Store.loaded = false;
        if (D3Api.hasClass(row, 'opened'))
            D3Api.toggleClass(row, 'opened', 'closed');
        D3Api.removeClass(row, 'nochilds');

        D3Api.TreeCtrl.setLocate(dom,locateValue);

        /* принудительно переоткрываем узел */
        D3Api.TreeCtrl.toggleNode(row);
    };
};

D3Api.controlsApi['Tree'] = new D3Api.ControlBaseProperties(D3Api.TreeCtrl);
D3Api.controlsApi['Tree']['value']={get:D3Api.TreeCtrl.getValue,set: D3Api.TreeCtrl.setValue};
D3Api.controlsApi['Tree']['list']={get:D3Api.TreeCtrl.getList,set: D3Api.TreeCtrl.setList};
D3Api.controlsApi['Tree']['data']={get:D3Api.TreeCtrl.getData};
D3Api.controlsApi['Tree']['locate']={get:D3Api.TreeCtrl.getLocate,set: D3Api.TreeCtrl.setLocate};
D3Api.controlsApi['Tree']['caption']={get:D3Api.TreeCtrl.getCaption,set:D3Api.TreeCtrl.setCaption};
D3Api.controlsApi['Tree']['title']={get:D3Api.TreeCtrl.getTitle,set:D3Api.TreeCtrl.setTitle};
D3Api.controlsApi['Tree']['parentValue']={get:D3Api.TreeCtrl.getParentValue,set: D3Api.TreeCtrl.setParentValue};
D3Api.controlsApi['Tree']['returnValue']={get:D3Api.TreeCtrl.getReturnValue,set: D3Api.TreeCtrl.setReturnValue};
D3Api.controlsApi['Tree']['activeRow']={get:D3Api.TreeCtrl.getActiveRow, type: 'dom'};
D3Api.controlsApi['Tree']['nextRow']={get:D3Api.TreeCtrl.getNextRow, type: 'dom'};
D3Api.controlsApi['Tree']['previousRow']={get:D3Api.TreeCtrl.getPreviousRow, type: 'dom'};
D3Api.controlsApi['Tree']['nearRow']={get:D3Api.TreeCtrl.getNearRow, type: 'dom'};
D3Api.controlsApi['Tree']['visible'].set = D3Api.TreeCtrl.setVisible;

D3Api.TreeRowCtrl = new function () {
    this.getRowData = function(dom)
    {
        if(dom.clone)
            return dom.clone.data;
        else
            return {};
    };
    this.setValue = function TreeRowCtrl_SetValue(dom,value)
    {
        return D3Api.setProperty(dom, 'keyvalue', value);
    };
};

D3Api.controlsApi['TreeRow'] = new D3Api.ControlBaseProperties(D3Api.TreeRowCtrl);
D3Api.controlsApi['TreeRow']['value']={get:D3Api.TreeCtrl.getValue,set: D3Api.TreeRowCtrl.setValue};
D3Api.controlsApi['TreeRow']['data']={get:D3Api.TreeRowCtrl.getRowData};
D3Api.controlsApi['TreeRow']['returnValue']={get:D3Api.TreeCtrl.getReturnValue,set: D3Api.TreeCtrl.setReturnValue};
D3Api.controlsApi['TreeRow']['parentValue']={get:D3Api.TreeCtrl.getParentValue,set: D3Api.TreeCtrl.setParentValue};
D3Api.SelectListCtrl = new function()
{
    this.updateState = true;
    this.init = function(dom) {
        D3Api.BaseCtrl.initEvent(dom,'onchange');
        D3Api.BaseCtrl.initEvent(dom,'onupdate');
        D3Api.BaseCtrl.initEvent(dom,'onselect');
        D3Api.BaseCtrl.initEvent(dom,'onunselect');
        dom.D3SelectList = {
            allc: 0,
            data: {},
            pdata: {},
            values_count: 0,
            state: 0,
            name: D3Api.getProperty(dom,'name',''),
            fields: D3Api.getProperty(dom,'fields','id,caption').split(',')
        };
        D3Api.addClass(dom, 'state0');
        var ds = dom.D3Form.getDataSet(D3Api.getProperty(dom, 'dataset', ''));
        if (!ds) return;
        ds.addEvent('onafter_refresh', function(){setCheckedValues(dom)});
        dom.D3SelectList.dataset = ds;
        dom.D3SelectList.usedom = D3Api.getProperty(dom, 'usedom', false);
        dom.D3SelectList.type = D3Api.getProperty(dom, 'type', false);
        dom.D3SelectList.selectChilds = (D3Api.getProperty(dom, 'select_childs', false) === 'true');
    }
    this.onMouseClick = function(dom)
    {
        if (dom.D3SelectList.state === 0)
        {
            D3Api.SelectListCtrl.checkAll(dom);
        }else
            D3Api.SelectListCtrl.unCheckAll(dom);
    }
    function setCheckedValues(dom)
    {
        D3Api.SelectListCtrl.setValue(dom,D3Api.SelectListCtrl.getValue(dom,true));
        D3Api.SelectListCtrl.setPermanentValue(dom,D3Api.SelectListCtrl.getPermanentValue(dom),true);
    }
    function updateState(dom)
    {
        if(!D3Api.SelectListCtrl.updateState)
            return;
        if(dom.D3SelectList.allc == 0)
        {
            if(dom.D3SelectList.usedom)
                dom.D3SelectList.allc = D3Api.getAllDomBy(dom.D3Form.DOM,'[name="'+dom.D3SelectList.name+'_Item"][isclone]').length;
            else
                dom.D3SelectList.allc = dom.D3SelectList.dataset.getAllCount();
        }

        var state = (dom.D3SelectList.values_count >= dom.D3SelectList.allc)?2:((dom.D3SelectList.values_count == 0)?0:1);

        if(dom.D3SelectList.state != state)
        {
            D3Api.removeClass(dom, 'state'+dom.D3SelectList.state);
            D3Api.addClass(dom, 'state'+state);
            D3Api.setControlPropertyByDom(dom, 'state', state);
            dom.D3Base.callEvent('onchange');
        }
        dom.D3Base.callEvent('onupdate');
    }
    this.checkAll = function(dom)
    {
        dom.D3SelectList.allc = 0;
        if(dom.D3SelectList.usedom){
            setAllDataUseDom(dom);
        }
        else{
            dom.D3SelectList.dataset.refreshByMode(
                'fields',
                {fields: dom.D3SelectList.fields.join(',')},
                function(r){
                    setAllData(r,dom)
                },
                null,
                false);

        }
    }
    function setAllData(res,dom)
    {
        dom.D3SelectList.allc = res.data.length;
        dom.D3SelectList.values_count = 0;
        dom.D3SelectList.data = {};
        D3Api.SelectListCtrl.updateState = false;
        for(var i = 0, c = res.data.length; i < c; i++)
        {
            D3Api.SelectListCtrl.addValue(dom, res.data[i][dom.D3SelectList.fields[0]], res.data[i][dom.D3SelectList.fields[1]]);
        }
        D3Api.SelectListCtrl.updateState = true;
        updateState(dom);
    }
    function setAllDataUseDom(dom)
    {
        dom.D3SelectList.values_count = 0;
        dom.D3SelectList.data = {};
        var res = D3Api.getAllDomBy(dom.D3Form.DOM,'[name="'+dom.D3SelectList.name+'_Item"][isclone]');
        D3Api.SelectListCtrl.updateState = false;
        for(var i = 0, c = res.length; i < c; i++)
        {
            D3Api.SelectListCtrl.addValue(dom, D3Api.SelectListItemCtrl.getValue(res[i]), D3Api.SelectListItemCtrl.getCaption(res[i]));
        }
        D3Api.SelectListCtrl.updateState = true;
        updateState(dom);
    }
    this.unCheckAll = function(dom)
    {
        D3Api.SelectListCtrl.updateState = false;
        for(var value in dom.D3SelectList.data)
        {
            if(!dom.D3SelectList.data.hasOwnProperty(value)){
                continue;
            }
            var item = D3Api.SelectListCtrl.getItemByValue(dom,value);

            if(!item)
                continue;

            D3Api.setControlPropertyByDom(item, 'state', false);
        }
        D3Api.SelectListCtrl.updateState = true;
        dom.D3SelectList.values_count = 0;
        dom.D3SelectList.data = {};
        updateState(dom);
    }
    this.getValue = function(dom,all)
    {
        var res = [];
        for(var v in dom.D3SelectList.data)
        {
            if(!dom.D3SelectList.data.hasOwnProperty(v)){
                continue;
            }
            if(dom.D3SelectList.pdata[v] === undefined || all)
                res.push(v);
        }
        return res.join(';');
    }
    this.setValue = function(dom, value, captionObj)
    {
        var vls = value.split(';');

        for(var i = 0, c = vls.length; i < c; i++)
        {
            D3Api.SelectListCtrl.addValue(dom, vls[i], captionObj && captionObj[vls[i]]);
        }
    }
    this.getPermanentValue = function(dom)
    {
        var res = [];
        for(var v in dom.D3SelectList.pdata)
        {
            if(dom.D3SelectList.pdata.hasOwnProperty(v)){
                res.push(v);
            }

        }
        return res.join(';');
    }
    this.setPermanentValue = function(dom,value)
    {
        var vls = value.split(';');

        for(var i = 0, c = vls.length; i < c; i++)
        {
            D3Api.SelectListCtrl.addPermanentValue(dom,vls[i]);
        }
    }
    this.getCaption = function(dom)
    {
        var res = [];
        for(var v in dom.D3SelectList.data)
        {
            if(dom.D3SelectList.data.hasOwnProperty(v)){
                res.push(dom.D3SelectList.data[v]);
            }
        }
        return res.join(';');
    }
    this.getData = function(dom)
    {
        return dom.D3SelectList.data;
    }
    this.addValue = function(dom,value,caption,internal)
    {
        if(D3Api.empty(value))
            return;
        if(dom.D3SelectList.data[value] === undefined)
            dom.D3SelectList.values_count++;

        dom.D3SelectList.data[value] = (caption === undefined)?dom.D3SelectList.data[value]:caption;

        if(dom.D3SelectList.data[value] === undefined)
            dom.D3SelectList.data[value] = null;

        updateState(dom);
        if(internal)
            return;
        var item = D3Api.SelectListCtrl.getItemByValue(dom,value);

        if(!item)
            return;

        D3Api.setControlPropertyByDom(item, 'state', true);
    }
    this.delValue = function(dom,value,internal)
    {
        if(D3Api.empty(value))
            return;
        if(dom.D3SelectList.data[value] !== undefined)
            dom.D3SelectList.values_count--;
        dom.D3SelectList.data[value] = undefined;
        dom.D3SelectList.pdata[value] = undefined;
        delete dom.D3SelectList.data[value];
        delete dom.D3SelectList.pdata[value];
        updateState(dom);
        if(internal)
            return;
        var item = D3Api.SelectListCtrl.getItemByValue(dom,value);

        if(!item)
            return;

        D3Api.setControlPropertyByDom(item, 'state', false);
        D3Api.setControlPropertyByDom(item, 'readonly', false);
    }
    this.addPermanentValue = function(dom,value)
    {
        if(D3Api.empty(value))
            return;
        if(dom.D3SelectList.data[value] === undefined)
            D3Api.SelectListCtrl.addValue(dom,value);

        dom.D3SelectList.pdata[value] = true;

        //Выключить галочку
        var item = D3Api.SelectListCtrl.getItemByValue(dom,value);
        if(!item)
            return;
        D3Api.setControlPropertyByDom(item, 'readonly', true);
    }
    this.getItemByValue = function(dom,value)
    {
        return D3Api.getDomBy(dom.D3Form.DOM, '[cmptype="SelectListItem"][selectlist="'+dom.D3SelectList.name+'"][item_value="'+value+'"]');
    }
    this.getState = function(dom)
    {
        return dom.D3SelectList.state;
    }
    this.setState = function(dom,state)
    {
        dom.D3SelectList.state = state;
    }
}

D3Api.controlsApi['SelectList'] = new D3Api.ControlBaseProperties(D3Api.SelectListCtrl);
D3Api.controlsApi['SelectList']['value']={get:D3Api.SelectListCtrl.getValue,set: D3Api.SelectListCtrl.setValue};
D3Api.controlsApi['SelectList']['permanent_value']={get:D3Api.SelectListCtrl.getPermanentValue,set: D3Api.SelectListCtrl.setPermanentValue};
D3Api.controlsApi['SelectList']['caption']={get:D3Api.SelectListCtrl.getCaption};
D3Api.controlsApi['SelectList']['data']={get:D3Api.SelectListCtrl.getData};
D3Api.controlsApi['SelectList']['state']={get:D3Api.SelectListCtrl.getState, set:D3Api.SelectListCtrl.setState};

D3Api.SelectListItemCtrl = new function()
{
    this.init = function(dom)
    {
        var sl = D3Api.getProperty(dom, 'selectlist', '');
        D3Api.addClass(dom, 'SelectListItem');
        dom.D3SelectListItem = {selectlist: dom.D3Form.getControl(sl)};
    }
    this.getValue = function(dom)
    {
        return D3Api.getProperty(dom,'item_value');
    }
    this.setValue = function(dom,value)
    {
        D3Api.setProperty(dom,'item_value',value);
    }
    this.getCaption = function(dom)
    {
        return D3Api.getProperty(dom,'item_caption');
    }
    this.setCaption = function(dom,value)
    {
        D3Api.setProperty(dom,'item_caption',value);
    }
    this.getState = function(dom)
    {
        return dom.checked;
    }
    this.setState = function(dom,state)
    {
        dom.checked = state;
        //SelectList update
        if(!dom.D3SelectListItem.selectlist)
            return;

        if(state)
            D3Api.SelectListCtrl.addValue(dom.D3SelectListItem.selectlist,D3Api.SelectListItemCtrl.getValue(dom),D3Api.SelectListItemCtrl.getCaption(dom),true);
        else
            D3Api.SelectListCtrl.delValue(dom.D3SelectListItem.selectlist,D3Api.SelectListItemCtrl.getValue(dom),true);
    }
    this.onMouseDown = function(dom)
    {
        D3Api.stopEvent();
    }
    this.onMouseClick = function(dom) {
        D3Api.SelectListItemCtrl.setState(dom, dom.checked);
        dom.D3SelectListItem.selectlist.D3Base.callEvent(
            (dom.checked) ? 'onselect' : 'onunselect', D3Api.SelectListItemCtrl.getValue(dom)
        );

        var D3SelectList = dom.D3SelectListItem.selectlist.D3SelectList;
        if (D3SelectList.type === 'tree' && D3SelectList.selectChilds === true) {
            this.checkChilds(dom);
        }
    }
    this.checkChilds = function(DOM) {
        var row = D3Api.getControlByDom(DOM, 'TreeRow'),
            tree = D3Api.getControlByDom(DOM, 'Tree'),
            checked = DOM.checked;

        checkChild(row, tree, checked);

        function checkChild(row, tree, checked) {
            var rowKey = D3Api.TreeCtrl.getValue(row),
                childs = D3Api.getAllDomBy(tree, '[parentvalue="' + rowKey + '"]');

            childs.forEach(function(child) {
                var input = D3Api.getDomBy(child, '[cmptype="SelectListItem"]');

                input.checked = checked;
                D3Api.SelectListItemCtrl.setState(input, input.checked);

                if (!D3Api.hasClass(child, 'nochilds')) {
                    checkChild(child, tree, checked);
                }
            });
        }
    }
    this.getInput = function SelectListItem_getInput(_dom)
    {
        return D3Api.getChildTag(_dom,'input',0);
    }
    this.getReadonly = function SelectListItem_getReadonly(_dom)
    {
        return D3Api.hasProperty(D3Api.SelectListItemCtrl.getInput(_dom),'readonly');
    }
    this.setReadonly = function SelectListItem_setReadonly(_dom,_value)
    {
        if (_value)
        {
            D3Api.SelectListItemCtrl.getInput(_dom).setAttribute('readonly','readonly');
            D3Api.SelectListItemCtrl.getInput(_dom).setAttribute('disabled','disabled');
        }else
        {
            D3Api.SelectListItemCtrl.getInput(_dom).removeAttribute('readonly','readonly');
            D3Api.SelectListItemCtrl.getInput(_dom).removeAttribute('disabled','disabled');
        }
    }
}

D3Api.controlsApi['SelectListItem'] = new D3Api.ControlBaseProperties(D3Api.SelectListItemCtrl);
D3Api.controlsApi['SelectListItem']['value']={get:D3Api.SelectListItemCtrl.getValue,set: D3Api.SelectListItemCtrl.setValue};
D3Api.controlsApi['SelectListItem']['caption']={get:D3Api.SelectListItemCtrl.getCaption, set:D3Api.SelectListItemCtrl.setCaption};
D3Api.controlsApi['SelectListItem']['state']={get:D3Api.SelectListItemCtrl.getState, set:D3Api.SelectListItemCtrl.setState};
D3Api.controlsApi['SelectListItem']['readonly']={get:D3Api.SelectListItemCtrl.getReadonly, set:D3Api.SelectListItemCtrl.setReadonly};
D3Api.PopupMenuCtrl = new function()
{
    this.init = function(dom)
    {
        if(!D3Api.BROWSER.msie)
            dom.style.zIndex = 10;
        var jm = D3Api.getProperty(dom,'join_menu',false) || (D3Api.getProperty(dom,'join_menu_var',false) ? dom.D3Form.getVar(D3Api.getProperty(dom,'join_menu_var','')) : false);
        if(jm)
        {
            var jmc = dom.D3Form.getControl(jm);
            if(!jmc)
                return;
            var joinGroupName = D3Api.getProperty(dom,'join_group',false) || 'additionalMainMenu';
            var groupAmm = D3Api.getDomByAttr(jmc, 'name', joinGroupName);
            if(!groupAmm)
                return;
            D3Api.BaseCtrl.initEvent(dom,'onpopup','coords,show',undefined,jmc);
            var items = D3Api.PopupMenuCtrl.getItems(dom,true);
            for(var i = 0, c = items.length; i < c; i++)
                D3Api.PopupMenuCtrl.addItemDom(groupAmm, items[i]);
            return;
        }
        D3Api.PopupMenuCtrl.setWaitAction(dom,D3Api.getProperty(dom,'onpopup_action',false));
        dom.D3Store.popupObjects = [];

        var po = D3Api.getProperty(dom,'popupobject',false);
        if (po)
        {
            var pod = dom.D3Form.getControl(po);
            if (pod)
            {
                D3Api.PopupMenuCtrl.setPopupObject(dom,pod);
            }
        }

        D3Api.BaseCtrl.initEvent(dom,'onpopup','coords,show');
        this.init_focus(dom);
        var ctrls = D3Api.getAllDomBy(dom.D3Form.currentContext || dom.D3Form.DOM,'[popupmenu="'+D3Api.getProperty(dom,'name','')+'"]');

        for(var i = 0, c = ctrls.length; i < c; i++)
        {
            D3Api.PopupMenuCtrl.setPopupObject(dom,ctrls[i]);
        }

        D3Api.addDom(dom.D3Form.DOM, dom);

        for(var collectionGroup = D3Api.getAllDomBy(dom, '[cont="groupitem"][separator]'), i = 0; i < collectionGroup.length; i++) {
            var placeSep = D3Api.getProperty(collectionGroup[i], 'separator'),
                     sep = D3Api.createDom('<div class="item separator" item_split="true" cmptype="PopupItem"></div>');
            dom.D3Form.parse(sep);
            if(!collectionGroup[i].children.length) D3Api.addClass(sep, 'ctrl_hidden');
            collectionGroup[i].D3Store.separator = (placeSep === 'before') && D3Api.insertBeforeDom(collectionGroup[i], sep) ||
                                                   (placeSep === 'after')  && D3Api.insertAfterDom(collectionGroup[i], sep)  ||
                                                   null;
        }
    }
    this.getPopupObject = function PopupMenuCtrl_GetPopupObject(dom)
    {
        return dom.D3Store.popupObject;
    }
    this.setPopupObject = function PopupMenuCtrl_SetPopupObject(dom,objDom)
    {
        if (dom.D3Store.popupObjects.indexOf(objDom) >= 0)
        {
            return;
        }
        function popup(e)
        {
            var evt = D3Api.getEvent(e);
            var coords = getClientEventCoords(evt);

            if((evt.button && evt.button == 2) || (evt.which && evt.which == 3))
            {
                    dom.D3Store.popupObject = objDom || dom.D3Store.popupObject;
                    D3Api.PopupMenuCtrl.show(dom,coords);
                    D3Api.stopEvent(evt);
            }
        }

        if (objDom)
        {
            dom.D3Store.popupObjects.push(objDom);
            D3Api.addEvent(objDom,'mousedown',popup);
        }
    }
    this.show = function PopupMenuCtrl_Show(dom,coords)
    {
        if(dom.D3Store.waitAction)
        {
            D3Api.addClass(dom, 'waitAction');
            dom.D3Form.getAction(dom.D3Store.waitAction).execute();
        }else
        {
            D3Api.removeClass(dom, 'waitAction');
            var reqAmount = 0;
            var reqUids = {};
            if(dom.D3Store.uidBReq)
            {
                D3Api.Base.removeEvent('onRequestServerBegin',dom.D3Store.uidBReq);
            }
            if(dom.D3Store.uidEReq)
            {
                D3Api.Base.removeEvent('onRequestServerEnd',dom.D3Store.uidEReq);
            }
            dom.D3Store.uidBReq = D3Api.Base.addEvent('onRequestServerBegin', function(reqObj,reqUid){
                if(reqAmount == 0)
                    D3Api.addClass(dom, 'waitAction');
                reqAmount++;
                reqUids[reqUid] = true;
            });
            dom.D3Store.uidEReq = D3Api.Base.addEvent('onRequestServerEnd', function(reqObj,reqUid){
                if(reqUids[reqUid])
                    reqAmount--;
                if(reqAmount > 0)
                    return;

                if(dom.D3Store.uidBReq)
                {
                    D3Api.Base.removeEvent('onRequestServerBegin',dom.D3Store.uidBReq);
                    dom.D3Store.uidBReq = null;
                }
                if(dom.D3Store.uidEReq)
                {
                    D3Api.Base.removeEvent('onRequestServerEnd',dom.D3Store.uidEReq);
                    dom.D3Store.uidEReq = null;
                }

                if(dom.D3Store.hideFunc == null)
                    return;

                var res = dom.D3Base.callEvent('onpopup',coords,true);
                if(res === false)
                {
                    dom.D3Store.hideFunc();
                    return;
                }
                D3Api.removeClass(dom, 'waitAction');
                calcPos();
            });
            var res = dom.D3Base.callEvent('onpopup',coords);
            if(res === false)
                return;

            if(reqAmount == 0)
            {
                if(dom.D3Store.uidBReq)
                {
                    D3Api.Base.removeEvent('onRequestServerBegin',dom.D3Store.uidBReq);
                    dom.D3Store.uidBReq = null;
                }
                if(dom.D3Store.uidEReq)
                {
                    D3Api.Base.removeEvent('onRequestServerEnd',dom.D3Store.uidEReq);
                    dom.D3Store.uidEReq = null;
                }
            }
        }
        D3Api.removeClass(dom, 'notactive');
        var iact = D3Api.getAllDomBy(dom, '.item.active');
        for(var i = 0, c = iact.length; i < c; i++)
            D3Api.removeClass(iact[i], 'active');

        var calcPos = function(){
            var sX = D3Api.getBodyScrollLeft();
            var sY = D3Api.getBodyScrollTop();
            D3Api.showDomBlock(dom);
            var el_size = D3Api.getAbsoluteClientRect(dom);
            el_size.x = coords.left-5;
            el_size.y = coords.top-5;

            var page = D3Api.getPageWindowSize();

            var h = page.windowHeight+sY;
            var mcY = el_size.y+el_size.height;

            if (mcY-h > 0)
                el_size.y -=mcY-h+7;

            var w = page.windowWidth+sX;
            var mcX = el_size.x+el_size.width;

            if (mcX-w > 0)
                el_size.x -=mcX-w+7;

            dom.style.left = el_size.x+'px';
            dom.style.top  = el_size.y+'px';
        }
        calcPos();
        dom.D3Store.hideFunc = function(event)
        {
            if(event)
            {
                var t = D3Api.getEventTarget(event);
                t = D3Api.getControlByDom(t, 'PopupMenu');
                if(t == dom)
                    return;
            }
            D3Api.setDomDisplayDefault(dom);
            dom.D3Store.selected_item = null;
            dom.D3Store.parent_item = new Array();
            //setTimeout(function(){D3Api.hideDom(dom)},100);
            D3Api.removeEvent(document,"mousedown",dom.D3Store.hideFunc,true);
            dom.D3Store.hideFunc = null;
            D3Api.stopEvent(event);
        }

        D3Api.addEvent(document,"mousedown",dom.D3Store.hideFunc,true);
        //setTimeout(function(){D3Api.setDomDisplayDefault(dom)},1000);
    }
    function getClientEventCoords(evt)
    {
            var coords = {left:0, top:0};

            coords.left = evt.clientX;
            coords.top = evt.clientY;

            return coords;
    }
    this.showPopupMenu = function(event,anyDom,menuName)
    {
        var ctrl = D3Api.getControlByDom(anyDom);
        var menu = ctrl.D3Form.getControl(menuName);
        if (menu)
        {
            menu.D3Store.popupObject = ctrl || menu.D3Store.popupObject;
            var evt = D3Api.getEvent(event);
            var coords = getClientEventCoords(evt);
            D3Api.PopupMenuCtrl.show(menu,coords);
        }
    }
    this.addItemDom = function(dom,itemDom,itemCont)
    {
        if(itemCont)
        {
            itemCont = D3Api.getDomByAttr(itemCont, 'cont', 'menu');
        }else
            itemCont = dom;
        D3Api.addDom(itemCont, itemDom);
    }
    this.getItems = function(dom,rootOnly,onlySeparators)
    {
        return D3Api.getAllDomBy(dom, '[cmptype="PopupItem"'+(rootOnly?'][rootitem="true"':'')+(onlySeparators===true?'][item_split="true"':'')+']');
    }
    this.getEnabled = function(dom)
    {
        return D3Api.hasClass(dom, 'disable');
    }
    this.setEnabled = function(dom,value)
    {
        var items = D3Api.PopupMenuCtrl.getItems(dom,true);

        for(var i = 0, c = items.length; i < c; i++)
        {
            D3Api.setControlPropertyByDom(items[i], 'enabled', value, true);
        }
        if(D3Api.getBoolean(value))
            D3Api.removeClass(dom,'disable');
        else
            D3Api.addClass(dom,'disable');
        return true;
    }
    this.getWaitAction = function(dom)
    {
        return dom.D3Store.waitAction;
    }
    this.setWaitAction = function(dom,value)
    {
        if(dom.D3Store.waitAction)
            dom.D3Form.getAction(dom.D3Store.waitAction).removeEvent('onafter_execute',dom.D3Store.waitActionAUid);
        if(D3Api.empty(value))
        {
            dom.D3Store.waitAction = value;
            return true;
        }
        var act = dom.D3Form.getAction(value);
        if(!act)
            return false;

        dom.D3Store.waitAction = value;
        //Значит в загрузке
        dom.D3Store.waitActionAUid = act.addEvent('onafter_execute',function(){
            if(!dom.D3Store.hideFunc)
                return;

            var res = dom.D3Base.callEvent('onpopup');
            if(res === false)
            {
                dom.D3Store.hideFunc();
                return;
            }

            D3Api.removeClass(dom, 'waitAction');
        });
    }
    this.addGroupItem = function(dom, item, name) {
        name = (typeof name === 'string') ? 'name="' + name + '"' : '';
        var groupitem = D3Api.createDom('<div ' + name + ' class="popupGroupItem" cont="groupitem" cmptype="PopupGroupItem"></div>');
        dom.D3Form.parse(groupitem);
        item = typeof item === 'string' && D3Api.getDomByAttr(dom, 'name', item) || typeof item === 'object' && item || null;
        if(item)
            return D3Api.insertAfterDom(item, groupitem);
        return D3Api.addDom(dom, groupitem);
    };
    this.addItem = function(dom,attrs,rootItem,rootGroup,boolBefore,posItem)
    {
        posItem = typeof posItem === 'string' && D3Api.getDomByAttr(dom, 'name', posItem) || typeof posItem === 'object' && posItem || null;
        if(!rootItem)
            rootItem = posItem && posItem.D3Store.parentItem?posItem.D3Store.parentItem:dom;
        else if(typeof(rootItem) == 'string')
            rootItem = D3Api.getDomByAttr(dom, 'name', rootItem);
        else
            rootItem = rootItem;
        rootGroup = typeof rootGroup === 'string' && D3Api.getDomByAttr(rootItem, 'name', rootGroup) || null;

        var rootItemCont = rootItem;
        if (D3Api.getProperty(rootItem, 'cmptype') == 'PopupItem')
        {
            D3Api.addClass(rootItem, 'haveItems');
            var submenu = D3Api.getDomByAttr(rootItem, 'cont', 'menu');
            if(!submenu)
            {
                var rootItemNew = (rootItem.outerHTML)?D3Api.createDom(rootItem.outerHTML):rootItem.cloneNode(true);
                D3Api.insertBeforeDom(rootItem, rootItemNew);
                D3Api.removeDom(rootItem);
                rootItem = null;
                rootItem = rootItemNew;
                var itemCont = D3Api.getDomByAttr(rootItem, 'cont', 'item');
                D3Api.setProperty(itemCont, 'onmouseover', ((attrs['onmouseover']) ? attrs['onmouseover']+';' : '') + 'D3Api.PopupItemCtrl.hoverItem(this);');
                D3Api.setProperty(itemCont, 'onclick', 'D3Api.PopupItemCtrl.hoverItem(this,true);');
                dom.D3Form.parse(rootItem);

                submenu = D3Api.createDom('<div class="popupMenu subItems" cont="menu"></div>');
                D3Api.addDom(rootGroup || rootItem,submenu);
            }
            rootItemCont = submenu;
        }
        var attrStr = 'cmptype="PopupItem" '+(rootItemCont == dom?'rootitem="true" ':'');
        var events = '';
        var itemText = '';
        var item;
        if(attrs['caption'] && attrs['caption'] == '-')
        {
            itemText = '<div class="item separator" '+attrStr+(attrs['name'] && attrs['name']!=''?' name="'+attrs['name']+'"':'')+' item_split="true" ></div>';
        }else
        {
            if(attrs['onclick'])
            {
                events += ' onclick="'+attrs['onclick']+'; D3Api.PopupItemCtrl.clickItem(this);"';
                attrs['onclick'] = undefined;
                delete attrStr['onclick'];
            }
            if(attrs['onmouseover'])
            {
                events += ' onmouseover="'+attrs['onmouseover']+'; D3Api.PopupItemCtrl.hoverItem(this);"';
                attrs['onmouseover'] = undefined;
                delete attrs['onmouseover'];
            }
            else {
                events += ' onmouseover="D3Api.PopupItemCtrl.hoverItem(this);"';
            }
            for(var a in attrs)
            {
                if(attrs.hasOwnProperty(a)){
                    attrStr += ' '+a+'="'+attrs[a]+'"';
                }
            }
            itemText = '<div class="item" '+attrStr+' ><table style="width:100%" cmpparse="PopupItem" '+events+' cont="item"><tr><td class="itemCaption"><img src="'+(attrs['icon'] || '')+'" cont="itemIcon" class="itemIcon"/><span cont="itemCaption">'+attrs['caption']+'</span></td><td class="caret">&nbsp;&nbsp;</td></tr></table></div>';
        }
        item = D3Api.createDom(itemText);
        if(!item)
            return null;
        dom.D3Form.parse(item);
        var rootEl = rootGroup || rootItemCont;
        if(posItem)
        {
            if(boolBefore)
                D3Api.insertBeforeDom(posItem, item);
            else
                D3Api.insertAfterDom(posItem, item);
        }else
        {
            if(boolBefore && rootEl.firstChild)
                D3Api.insertBeforeDom(rootEl.firstChild, item);
            else
                D3Api.addDom(rootEl, item);
            if(rootGroup && rootGroup.D3Store && rootGroup.D3Store.separator) {
                D3Api.removeClass(rootGroup.D3Store.separator, 'ctrl_hidden');
            }
        }
        item.D3Store.parentItem = rootItem;
        dom.D3Base.callEvent('onitem_add',item,rootEl);
        return item;
    }
    this.deleteItem = function(dom,itemDom)
    {
        var rootEl = itemDom.parentNode;
        if(dom.D3Base.callEvent('onitem_delete',itemDom,rootEl) !== false)
            D3Api.removeDom(itemDom);
    }
    this.defaultAction = function(dom)
    {
        var item = D3Api.getDomBy(dom,'[cmptype="PopupItem"][default="true"]>table[cont="item"]');

        if (item) {
            item.dispatchEvent(new CustomEvent('click'));
        }
    }
    this.CtrlKeyDown = function(dom, e)
    {
        switch (e.keyCode) {
            case 40: //стрелка вниз
                D3Api.PopupMenuCtrl.setNextItem(dom, 1);
                D3Api.stopEvent(e)
                break;
            case 38: //стрелка вверх
                D3Api.PopupMenuCtrl.setNextItem(dom, -1);
                D3Api.stopEvent(e)
                break;
            case 39: //стрелка вправо
                var submenu = D3Api.getDomByAttr(D3Api.PopupMenuCtrl.getSelectedItem(dom), 'cont', 'menu');
                if(submenu)
                {
                    if(!dom.D3Store.parent_item)
                        dom.D3Store.parent_item = new Array();
                    dom.D3Store.parent_item.push(D3Api.PopupMenuCtrl.getSelectedItem(dom));
                    dom.D3Store.selected_item = null;
                    D3Api.PopupMenuCtrl.setNextItem(dom, 1);
                }
                D3Api.stopEvent(e)
                break;
            case 37: //стрелка влево
                if(!dom.D3Store.parent_item)
                    break;
                var parent_item = dom.D3Store.parent_item[dom.D3Store.parent_item.length - 1];

                if(!parent_item)
                    break;
                D3Api.PopupItemCtrl.hoverItem(parent_item);
                dom.D3Store.parent_item.pop();
                var items = D3Api.PopupMenuCtrl.getItemsOfActiveMenu(dom);
                for(var i = 0; i < items.length; i++) {
                    if (items[i] == parent_item) {
                        dom.D3Store.selected_item = i+1;
                        D3Api.PopupMenuCtrl.setNextItem(dom, -1);
                        break;
                    }
                }
                D3Api.stopEvent(e)
                break;
            case 13://Enter
                var selected_item=D3Api.PopupMenuCtrl.getSelectedItem(dom);
                var cont_item = D3Api.getDomByAttr(selected_item, 'cont', 'item');
                cont_item.click();
                D3Api.stopEvent(e)
                break;
            case 27: //Esc
                dom.D3Store.hideFunc();
                if(dom.D3Form.lastFocusControl)
                    dom.D3Form.lastFocusControl.focus();
                D3Api.stopEvent(e)
                break;
        }
    }
    ///delta = 1 движение вниз по меню
    ///delta = -1 движение вверх по меню
    this.setNextItem = function(dom, delta)
    {
        var n = dom.D3Store.selected_item;

        if(n === undefined || n === null)
            n = 0;
        else
        {
            n += delta;
        }

        n = this.setSelectedItemIndex(dom, n);
        if(n && D3Api.hasClass(D3Api.PopupMenuCtrl.getSelectedItem(dom), 'separator'))
        {
            n += delta;
            n = this.setSelectedItemIndex(dom, n);
        }

        return n;
    };
    this.setSelectedItemIndex = function(dom, index)
    {
        var active_menu_items = D3Api.PopupMenuCtrl.getItemsOfActiveMenu(dom);
        if(active_menu_items && index != -1 && index !== false &&
            index < active_menu_items.length &&
            active_menu_items[index])
        {
            dom.D3Store.selected_item = index;
            D3Api.PopupItemCtrl.hoverItem(active_menu_items[index]);
        }

        return dom.D3Store.selected_item;
    }
    this.getSelectedItem = function(dom)
    {
        return D3Api.PopupMenuCtrl.getItemsOfActiveMenu(dom)[dom.D3Store.selected_item];
    }
    this.getItemsOfActiveMenu = function(dom)
    {
        if(!dom.D3Store.parent_item || dom.D3Store.parent_item.length == 0)
        {
            return  D3Api.PopupMenuCtrl.getItems(dom, true);
        }
        else
        {
            var submenu = D3Api.getDomByAttr(dom.D3Store.parent_item[dom.D3Store.parent_item.length - 1], 'cont', 'menu');
            if(!submenu)
                return;

            return D3Api.PopupMenuCtrl.getItems(submenu);
        }
    }
}
D3Api.controlsApi['PopupMenu'] = new D3Api.ControlBaseProperties(D3Api.PopupMenuCtrl);
D3Api.controlsApi['PopupMenu']['popupobject']={get:D3Api.PopupMenuCtrl.getPopupObject,set: D3Api.PopupMenuCtrl.setPopupObject};
D3Api.controlsApi['PopupMenu']['enabled']={get:D3Api.PopupMenuCtrl.getEnabled,set: D3Api.PopupMenuCtrl.setEnabled};
D3Api.controlsApi['PopupMenu']['onpopup_action']={get:D3Api.PopupMenuCtrl.getWaitAction,set: D3Api.PopupMenuCtrl.setWaitAction};
D3Api.controlsApi['PopupMenu']['item']={set: D3Api.PopupMenuCtrl.setSelectedItemIndex};

D3Api.PopupItemCtrl = new function()
{
    this.clickItem = function(dom)
    {
        var m = D3Api.getControlByDom(dom, 'PopupMenu');

        m.D3Store.hideFunc && m.D3Store.hideFunc();
    }
    this.hoverItem = function(dom,click)
    {
        var event = D3Api.getEvent();
        if(D3Api.BROWSER.msie && !click) {
            var toElement = event.relatedTarget || event.fromElement;
            while(toElement && toElement !== dom) {
                toElement = toElement.parentNode;
            }
            if(toElement === dom) return;
        }
        var item = D3Api.getControlByDom(dom, 'PopupItem');
        var toogle = D3Api.hasClass(item, 'active');
        if(D3Api.getEventTarget() != D3Api.getEventCurrentTarget() && toogle && event.type != 'click' && event.type != 'keydown')
            return;
        var menu = D3Api.getDomByDomAttr(dom, 'cont', 'menu');
        if(!menu)
            return;
        D3Api.removeClass(menu, 'notactive');
        var iact = D3Api.getAllDomBy(menu, '.item.active');
        for(var i = 0, c = iact.length; i < c; i++)
            D3Api.removeClass(iact[i], 'active');

        if(toogle)
            return;

        D3Api.addClass(item, 'active');

        var submenu = D3Api.getDomByAttr(item, 'cont', 'menu');
        if(!submenu)
            return;
        D3Api.addClass(menu, 'notactive');
        D3Api.removeClass(submenu, 'notactive');

        var rect = D3Api.getAbsoluteClientRect(item);


        var sX = D3Api.getBodyScrollLeft();
        var sY = D3Api.getBodyScrollTop();
        var el_size = D3Api.getAbsoluteClientRect(submenu);

        var page = D3Api.getPageWindowSize();

        var h = page.windowHeight+sY;
        var mcY = rect.y+el_size.height;

        var dY = 0;
        if (mcY-h > 0)
            dY = -(mcY-h);

        var w = page.windowWidth+sX;
        var mcX = rect.x+rect.width+el_size.width;

        var dX = rect.width-5;
        if (mcX-w > 0)
            dX = -(el_size.width-5);

        submenu.style.left = dX+'px';
        submenu.style.top  = dY+'px';
        submenu.style.zIndex = 10;
    }
    this.setVisible = function PopupItem_setVisible(_dom, _value)
    {
        D3Api.BaseCtrl.setVisible(_dom,_value);
        var items = _dom.parentNode.childNodes, item = false, splitItem = null, isSplit = false;

        for(var i = 0, c = items.length; i < c; i++)
        {
            if(D3Api.hasProperty(items[i],'item_split'))
            {
                if(!item)
                {
                    if(splitItem)
                    {
                        if(splitItem != _dom) D3Api.BaseCtrl.setVisible(splitItem, true);
                    }
                    D3Api.BaseCtrl.setVisible(items[i],false);
                }else
                {
                    splitItem = items[i];
                    item = false;
                }
            }else if(['PopupItem','PopupGroupItem'].indexOf(D3Api.getProperty(items[i],'cmptype')) != -1 && D3Api.BaseCtrl.getVisible(items[i]))
            {
                item = true;
                if(splitItem)
                {
                    if(splitItem != _dom) D3Api.BaseCtrl.setVisible(splitItem, true);
                    splitItem = null;
                }
            }
        }
        if(splitItem)
            D3Api.BaseCtrl.setVisible(splitItem,false);
    }
    this.getCaption = function PopupItemCtrl_getCaption(dom)
    {
        var cont = D3Api.getDomByAttr(dom, 'cont', 'itemCaption');
        return D3Api.getTextContent(cont);
    }
    this.setCaption = function PopupItemCtrl_setCaption(dom,value)
    {
        var cont = D3Api.getDomByAttr(dom, 'cont', 'itemCaption');
        D3Api.addTextNode(cont, D3Api.empty(value) ? '' : value, true);
    }
    this.getIcon = function PopupItemCtrl_getIcon(dom)
    {
        var cont = D3Api.getDomByAttr(dom, 'cont', 'itemIcon');
        return cont.src;
    }
    this.setIcon = function PopupItemCtrl_setIcon(dom,value)
    {
        var cont = D3Api.getDomByAttr(dom, 'cont', 'itemIcon');
        cont.src = D3Api.empty(value) ? '' : value;
    }
}
D3Api.controlsApi['PopupItem'] = new D3Api.ControlBaseProperties(D3Api.PopupItemCtrl);
D3Api.controlsApi['PopupItem']['visible'].set = D3Api.PopupItemCtrl.setVisible;
D3Api.controlsApi['PopupItem']['caption'] = {get: D3Api.PopupItemCtrl.getCaption, set: D3Api.PopupItemCtrl.setCaption};
D3Api.controlsApi['PopupItem']['icon'] = {get: D3Api.PopupItemCtrl.getIcon, set: D3Api.PopupItemCtrl.setIcon};

D3Api.PopupGroupItemCtrl = new function()
{

}

D3Api.controlsApi['PopupGroupItem'] = new D3Api.ControlBaseProperties(D3Api.PopupGroupItemCtrl);
D3Api.ImageCtrl = new function()
{
    this.init = function(dom)
    {
        dom.D3Store.isFileLob = D3Api.getBoolean(D3Api.getProperty(dom,'lob',false));
        dom.D3Store.mType = D3Api.getProperty(dom,'mtype','');
        this.init_focus(dom);
    }
    this.setSource = function(dom,value)
    {
        dom.src = (dom.D3Store.isFileLob?'-file_lob?mtype='+dom.D3Store.mType+'&id=':'')+value;
        if(D3Api.empty(value))
            D3Api.addClass(dom,'ctrl_hidden');
        else
            D3Api.removeClass(dom,'ctrl_hidden');
    }
    this.getSource = function(dom)
    {
        return controlDom.D3Store._properties_['src'] || controlDom.D3Store._properties_['value'];
    }
}

D3Api.controlsApi['Image'] = new D3Api.ControlBaseProperties(D3Api.ImageCtrl);
D3Api.controlsApi['Image']['src'] = {get:D3Api.ImageCtrl.getSource,set:D3Api.ImageCtrl.setSource};
D3Api.controlsApi['Image']['value'] = D3Api.controlsApi['Image']['src'];
D3Api.TextAreaCtrl = new function()
{
    this.init = function(_dom)
    {
        var ta = D3Api.getChildTag(_dom,'textarea',0);
        D3Api.addEvent(ta, 'change', function(event){
            D3Api.setControlPropertyByDom(_dom,'value',D3Api.TextAreaCtrl.getValue(_dom),undefined,true);
            D3Api.stopEvent(event);
        }, true);
        this.init_focus(ta);
        _dom.D3Store.trim = D3Api.getProperty(_dom,'trim',false) == 'true';
        D3Api.BaseCtrl.initEvent(_dom,'onchange');
        _dom.D3Base.addEvent('onchange_property',function(property,value){
            if(property == 'value')
            {
                //D3Api.execDomEvent(_dom,'onchange');
                _dom.D3Base.callEvent('onchange');
            }
        });
    }
    this.setValue = function TextArea_SetValue(_dom,_value)
    {
        _dom = D3Api.getChildTag(_dom,'textarea',0);
        _dom.value = (_value == null)?'':_value;
    }

    this.getValue = function TextArea_GetValue(_dom)
    {
        var ta = D3Api.getChildTag(_dom,'textarea',0);
        var res = ta.value;
        if(_dom.D3Store.trim)
        {
            res = D3Api.stringTrim(res);
        }

        return res;
    }
    this.setEnabled = function TextArea_SetEnabled(_dom, _value )
    {
        var ta = D3Api.getChildTag(_dom,'textarea',0);
        //делаем активным
        if (_value)
        {
            ta.removeAttribute('disabled');
        }//делаем неактивным
        else
        {
            ta.setAttribute('disabled','disabled');
        }
        D3Api.BaseCtrl.setEnabled(_dom,_value);
    }
    this.getInput = function TextArea_getInput(_dom)
    {
        return D3Api.getChildTag(_dom,'textarea',0);
    }
}

D3Api.controlsApi['TextArea'] = new D3Api.ControlBaseProperties(D3Api.TextAreaCtrl);
D3Api.controlsApi['TextArea']['value']={get:D3Api.TextAreaCtrl.getValue,set:D3Api.TextAreaCtrl.setValue};
D3Api.controlsApi['TextArea']['enabled'].set = D3Api.TextAreaCtrl.setEnabled;
D3Api.controlsApi['TextArea']['input']={get: D3Api.TextAreaCtrl.getInput, type: 'dom'};
D3Api.ButtonEditCtrl = new function ButtonEditCtrl() {
    this.init = function(dom) {
        var kind = D3Api.getProperty(dom, 'kind', 'normal');
        dom.D3Store[kind] = (kind === 'tagged')    ? dom.D3Form.getRepeater(D3Api.getProperty(dom, 'items_repeatername')) :
                            (kind === 'multiline') ? D3Api.getChildTag(dom, 'textarea', 0) :
                            D3Api.getChildTag(dom, 'input', 0);

        if(dom.D3Store.tagged) {
            dom.D3Store.tagged.addEvent('onafter_repeat', function(container) {
                if(!D3Api.isChildOf(dom, container)) return;
                D3Api.setControlPropertyByDom(dom, 'value', D3Api.ButtonEditCtrl.getValue(dom));
            });
            dom.D3Form.addEvent('oncreate', function() {
                var textarea = D3Api.getChildTag(dom, 'textarea', 0);
                if(!textarea) return;
                var masVC = D3Api.JSONparse(textarea.value);
                D3Api.removeDom(textarea);
                dom.D3Form.closureContext(dom.D3Form.getClone(dom));
                for(var i = 0; i < masVC.length; i++) {
                    D3Api.ButtonEditCtrl.addTagItem(dom, masVC[i].value, masVC[i].caption);
                }
                D3Api.setControlPropertyByDom(dom, 'value', D3Api.ButtonEditCtrl.getValue(dom));
                dom.D3Form.unClosureContext();
            });
        }
        else {
            var input = D3Api.ButtonEditCtrl.getInput(dom);
            D3Api.addEvent(input, 'change', function(e) {

                D3Api.setControlPropertyByDom(dom, 'value', D3Api.ButtonEditCtrl.getValue(dom), undefined, true);
                D3Api.ButtonEditCtrl.validate(dom);
                D3Api.stopEvent(e);
            }, true);
            this.init_focus(input);
            D3Api.BaseCtrl.initEvent(dom, 'onvalidate', 'value', 'D3Api.ButtonEditCtrl.onValidateDefault(this,value);');

            var va = D3Api.getProperty(dom, 'validate_action', false);
            if(va) dom.D3Store.validateAction = dom.D3Form.getAction(va);

            if(D3Api.hasProperty(input, 'placeholder') && !('placeholder' in document.createElement('input'))) {
                input.placeholder = D3Api.getProperty(input, 'placeholder') || '';
                blur(input);
                D3Api.addEvent(input, 'focus', function(e) {
                    focus(D3Api.getEventTarget(e));
                }, true);
                D3Api.addEvent(input, 'blur', function(e) {
                    blur(D3Api.getEventTarget(e));
                }, true);
            }
        }
        dom.D3Base.addEvent('onchange_property', function(property, value) {
            if (property == 'value') {
                dom.D3Base.callEvent('onchange');
            }
        });
        D3Api.BaseCtrl.initEvent(dom, 'onchange');
    };
    function focus(i) {
        if(!D3Api.hasClass(i, 'placeholder')) return;
        i.value = '';
        D3Api.removeClass(i, 'placeholder');
    }
    function blur(i) {
        if(!i.placeholder || i.value != '') return;
        i.value = i.placeholder;
        D3Api.addClass(i, 'placeholder');
    }
    this.validate = function(dom) {
        dom.D3Base.callEvent('onvalidate', D3Api.ButtonEditCtrl.getCaption(dom));
    };
    this.onValidateDefault = function(dom, value) {
        if(dom.D3Store.validateAction && !dom.D3Store._alreadyValidValue && value != '') {
            dom.D3Store.validateAction.execute(function() {
                var d = dom.D3Store.validateAction.getData();
                if(!D3Api.empty(d.rvalue)) {
                    D3Api.setControlPropertyByDom(dom, 'value', d.rvalue, undefined, true);
                    D3Api.ButtonEditCtrl.setCaption(dom, d.rcaption, undefined, true);
                }
                else D3Api.setControlPropertyByDom(dom, 'value', '', undefined, true);
            });
        }
        else if(value == '') {
            D3Api.setControlPropertyByDom(dom, 'value', '', undefined, true);
        }
        dom.D3Store._alreadyValidValue = null;
    };
    this.getValue = function ButtonEdit_getValue(dom) {
        if(dom.D3Store.tagged) {
            for(var clones = dom.D3Store.tagged.clones(), value = [], i = 0; i < clones.length; i++) {
                value.push(D3Api.TagItemCtrl.getValue(clones[i]));
            }
            return value.join(';');
        }
        else if(D3Api.hasProperty(dom, 'onlycaption')) {
            return D3Api.ButtonEditCtrl.getCaption(dom);
        }
        else {
            return D3Api.getProperty(dom, 'keyvalue', '');
        }
    };
    this.setValue = function ButtonEdit_setValue(dom, value) {
        if(value == null) value = '';
        if(dom.D3Store.tagged) {
            var objVC = {};
            if(typeof value === 'object') {
                objVC = D3Api.mixin({}, value);
                value = Object.keys(objVC).join(';');
            }
            else if(value !== '') {
                var masVal = String(value).split(';');
                for(var i = 0; i < masVal.length; i++) objVC[masVal[i]] = '';
                masVal = null;
            }
            for(var clones = dom.D3Store.tagged.clones(), i = 0; i < clones.length; i++) {
                var val = D3Api.TagItemCtrl.getValue(clones[i]);
                if(val in objVC) {
                    objVC[val] = null;
                    continue;
                }
                dom.D3Store.tagged.removeClone(clones[i]);
            }
            for(var val in objVC) {
                if(objVC.hasOwnProperty(val) && objVC[val] !== null){
                    D3Api.ButtonEditCtrl.addTagItem(dom, val, objVC[val]);
                }
            }
        }
        else if(D3Api.hasProperty(dom, 'onlycaption')) {
            D3Api.ButtonEditCtrl.setCaption(dom, value);
        }
        D3Api.setProperty(dom, 'keyvalue', String(value));
        return true;
    };

    /* Обновляем caption через разыменование записи раздела */
    this.setValueShowInfo = function ButtonEdit_setValueShowInfo(dom, value) {
        D3Api.setControlPropertyByDom(dom, 'value', value, undefined, D3Api.isUserEvent()); // для того чтобы запускалось событие onchange, также для правильной отработки DependencesCtrl, все завязано на "value"
        var unit = D3Api.getProperty(dom,'unit');

        if (unit && value){
            D3Api.unitShowInfo(dom.D3Form, unit, value, function(result){
                D3Api.setControlPropertyByDom(dom, 'caption', result.data);
            });
        }
    };

    this.addTagItem = function(dom, value, caption) {
        if(!dom.D3Store.tagged) return;
        var data = {}, fields = dom.D3Store.tagged.controls[0].datafields;
        data[fields.value] = String(value);
        data[fields.caption] = String(caption);
        dom.D3Store.tagged.addClone(data);
    };
    this.clear = function(dom) {
        var message = D3Api.getProperty(dom, 'clearbuttonmessage');
        var clearFunc = function(){
            if(dom.D3Store.tagged) {
                dom.D3Store.tagged.removeAllClones();
            }
            else {
                D3Api.setControlPropertyByDom(dom, 'caption', '', undefined, true);
            }
            D3Api.setControlPropertyByDom(dom, 'value', '', undefined, true);
        }
        if(message)
        {
            D3Api.confirm(message,clearFunc);
        }else
            clearFunc();
    };
    this.getData = function ButtonEdit_getData(dom) {
        return dom.D3Store.data;
    };
    this.setData = function ButtonEdit_setData(dom, data) {
        return dom.D3Store.data = (data && typeof data === 'object') ? data : undefined;
    };
    this.getCaption = function ButtonEdit_getCaption(dom) {
        if(dom.D3Store.tagged) {
            for(var clones = dom.D3Store.tagged.clones(), value = [], i = 0; i < clones.length; i++) {
                value.push(D3Api.TagItemCtrl.getCaption(clones[i]));
            }
            value = value.join(';');
        }
        else {
            var input = D3Api.ButtonEditCtrl.getInput(dom),
                value = D3Api.hasClass(input, 'placeholder') ? '' : input.value;
            if(dom.D3Store.multiline && D3Api.getProperty(input, 'wrap') === 'off') value = value.split('\n').join(';');
        }
        return value;
    };
    this.setCaption = function ButtonEdit_setCaption(dom, value) {
        value = (value == null) ? '' : String(value);
        if(dom.D3Store.tagged) {
            value = value.split(';');
            for(var clones = dom.D3Store.tagged.clones(), i = 0; i < clones.length; i++) {
                D3Api.TagItemCtrl.setCaption(clones[i], value[i] || '');
            }
        }
        else {
            var input = D3Api.ButtonEditCtrl.getInput(dom);
            if(dom.D3Store.multiline && D3Api.getProperty(input, 'wrap') === 'off') value = value.split(';').join('\n');
            D3Api.removeClass(input, 'placeholder');
            input.value = value;
            if('placeholder' in document.createElement('input')) return;
            blur(input);
            input.blur();
        }
    };
    this.getInput = function ButtonEdit_getInput(dom) {
        return dom.D3Store.multiline || dom.D3Store.normal;
    };
    this.getReadonly = function ButtonEdit_getReadonly(dom) {
        var input = D3Api.ButtonEditCtrl.getInput(dom);
        return input && D3Api.hasProperty(input, 'readonly');
    };
    this.setReadonly = function ButtonEdit_setReadonly(dom, value) {
        var input = D3Api.ButtonEditCtrl.getInput(dom);
        if(!input) return;
        if(D3Api.getBoolean(value)) {
            input.setAttribute('readonly', 'readonly');
        }
        else {
            input.removeAttribute('readonly');
        }
    };
    this.setEnabled = function ButtonEdit_setEnabled(dom, value) {
        D3Api.BaseCtrl.setEnabled(dom, value);
        var input = D3Api.ButtonEditCtrl.getInput(dom);
        if(!input) return;
        if(D3Api.getBoolean(value)) {
            input.removeAttribute('disabled');
        }
        else {
            input.setAttribute('disabled', 'disabled');
        }
    };
    this.getMaskProperty = function()
    {
        return 'caption';
    }
    this.CtrlKeyDown = function(dom, e)
    {
        switch (e.keyCode)
        {
            case 115: //f4
                var button = D3Api.getDomByAttr(dom, 'class', 'ctrl_ButtonEdit_ButGuide');
                button.click();
                D3Api.stopEvent(e);
                break;
            case 46: //Del
                D3Api.ButtonEditCtrl.clear(dom);
                D3Api.stopEvent(e);
                break;
        }
    }
};
D3Api.controlsApi['ButtonEdit'] = new D3Api.ControlBaseProperties(D3Api.ButtonEditCtrl);
D3Api.controlsApi['ButtonEdit']['height'] = undefined;
D3Api.controlsApi['ButtonEdit']['value'] = {get: D3Api.ButtonEditCtrl.getValue, set: D3Api.ButtonEditCtrl.setValue};
D3Api.controlsApi['ButtonEdit']['valueShowInfo'] = {set: D3Api.ButtonEditCtrl.setValueShowInfo};
D3Api.controlsApi['ButtonEdit']['caption'] = {get: D3Api.ButtonEditCtrl.getCaption, set: D3Api.ButtonEditCtrl.setCaption};
D3Api.controlsApi['ButtonEdit']['data'] = {get: D3Api.ButtonEditCtrl.getData, set: D3Api.ButtonEditCtrl.setData};
D3Api.controlsApi['ButtonEdit']['input'] = {get: D3Api.ButtonEditCtrl.getInput, type: 'dom'};
D3Api.controlsApi['ButtonEdit']['readonly'] = {get: D3Api.ButtonEditCtrl.getReadonly, set: D3Api.ButtonEditCtrl.setReadonly};
D3Api.controlsApi['ButtonEdit']['enabled'].set = D3Api.ButtonEditCtrl.setEnabled;

D3Api.TagItemCtrl = new function() {
    this.init = function(dom) {
        dom.D3Store.captionDom = D3Api.getDomByAttr(dom, 'cont', 'caption');
    };
    this.getValue = function TagItem_getValue(dom) {
        return D3Api.getProperty(dom, 'value', '');
    };
    this.setValue = function TagItem_setValue(dom, value) {
        value = (value == null) ? '' : String(value);
        D3Api.setProperty(dom, 'value', value);
    };
    this.getCaption = function TagItem_getCaption(dom) {
        return dom.D3Store.captionDom && D3Api.getTextContent(dom.D3Store.captionDom);
    };
    this.setCaption = function TagItem_setCaption(dom, value) {
        if(!dom.D3Store.captionDom) return;
        value = (value == null) ? '' : String(value);
        D3Api.addTextNode(dom.D3Store.captionDom, value, true);
        D3Api.setProperty(dom, 'title', value);
    };
    this.clear = function(dom) {
        var parent = D3Api.getControlByDom(dom, 'ButtonEdit'),
            repeatername = D3Api.getProperty(dom, 'repeatername');
        if(!parent || !repeatername) return;
        var repeater = dom.D3Form.getRepeater(repeatername);
        if(!repeater) return;
        repeater.removeClone(dom.D3Form.getClone(dom, repeatername));
        D3Api.setControlPropertyByDom(parent, 'value', D3Api.ButtonEditCtrl.getValue(parent), undefined, true);
    };
};
D3Api.controlsApi['TagItem'] = new D3Api.ControlBaseProperties(D3Api.TagItemCtrl);
D3Api.controlsApi['TagItem']['value'] = {get: D3Api.TagItemCtrl.getValue, set: D3Api.TagItemCtrl.setValue};
D3Api.controlsApi['TagItem']['caption'] = {get: D3Api.TagItemCtrl.getCaption, set: D3Api.TagItemCtrl.setCaption};
D3Api.PageControlCtrl = new function()
{
    this.init = function PageControlCreate(dom)
    {
        this.init_focus(dom);
        dom.D3Store.uniqId = D3Api.getProperty(dom,'uniqid','');
        D3Api.PageControlCtrl.setActiveIndex(dom,D3Api.getProperty(dom,'activeindex',0));
        D3Api.BaseCtrl.initEvent(dom,'onpagechange','showIndex,hideIndex');
        D3Api.BaseCtrl.initEvent(dom,'onpageshow','pageIndex');
        D3Api.BaseCtrl.initEvent(dom,'onpagehide','pageIndex');
        dom.D3Form.addEvent('onResize',function(){D3Api.PageControlCtrl.resize(dom)});
        dom.D3Store.ShowIndex=0;
        D3Api.PageControlCtrl.CalckTabSheetHead(dom);
        D3Api.PageControlCtrl.resize(dom);
    }

    this.CalckTabSheetHead= function(dom)
    {
        dom.D3Store.HeadWidth=0;
        var ul_dom= D3Api.getDomByAttr(dom, 'cont', 'PageControl_head');
        dom.D3Store.TabSheetHeads = D3Api.getAllDomBy(ul_dom, '[cmptype="TabSheet"]');
        for( var i=0;i<dom.D3Store.TabSheetHeads.length;i++)
        {
           if(D3Api.getControlPropertyByDom(dom.D3Store.TabSheetHeads[i],'visible'))
             dom.D3Store.HeadWidth=dom.D3Store.HeadWidth+dom.D3Store.TabSheetHeads[i].offsetWidth;
        }
    }

    this.resize = function(dom) {
        var ul_dom = D3Api.getDomByAttr(dom, 'cont', 'PageControl_head');
        var scroll_next = D3Api.getDomByAttr(dom, 'cont', 'ScrollNext');
        var scroll_prior = D3Api.getDomByAttr(dom, 'cont', 'ScrollPrior');
        var div_dom = D3Api.getDomByAttr(dom, 'cont', 'div_ul');
        if (div_dom.offsetWidth < dom.D3Store.HeadWidth) {
            if ((-1 * ul_dom.offsetLeft + div_dom.offsetWidth) < dom.D3Store.HeadWidth) {
                D3Api.showDomBlock(scroll_next);
            } else {
                D3Api.hideDom(scroll_next);
            }

            if (ul_dom.offsetLeft == '0') {
                D3Api.hideDom(scroll_prior);
            } else {
                D3Api.showDomBlock(scroll_prior);
            }
        } else {
            D3Api.hideDom(scroll_next);
            D3Api.hideDom(scroll_prior);
            D3Api.setStyle(ul_dom, 'left', '0');
            dom.D3Store.ShowIndex = 0;
        }
    };

    this.ScrollNext = function(dom)
    {
         var page_control=D3Api.getControlByDom(dom, 'PageControl');
         var ul_dom=  D3Api.getDomByAttr(page_control, 'cont', 'PageControl_head');
         var div_dom= D3Api.getDomByAttr(page_control, 'cont', 'div_ul');
         var scroll_lenght=0;
         if (page_control.D3Store.ShowIndex==0) scroll_lenght=-20;
         while ((scroll_lenght<Math.round(div_dom.offsetWidth/2))&&(page_control.D3Store.ShowIndex<page_control.D3Store.TabSheetHeads.length))
             {
                 if(D3Api.getControlPropertyByDom(page_control.D3Store.TabSheetHeads[page_control.D3Store.ShowIndex],'visible'))
                    scroll_lenght=scroll_lenght+page_control.D3Store.TabSheetHeads[page_control.D3Store.ShowIndex].offsetWidth;
                 page_control.D3Store.ShowIndex++;
             }
         D3Api.setStyle(ul_dom,'left',(ul_dom.offsetLeft-scroll_lenght)+'px');
         D3Api.PageControlCtrl.resize(page_control);
    }
    this.ScrollPrior = function(dom)
    {
         var page_control=D3Api.getControlByDom(dom, 'PageControl');
         var ul_dom=  D3Api.getDomByAttr(page_control, 'cont', 'PageControl_head');
         var div_dom= D3Api.getDomByAttr(page_control, 'cont', 'div_ul');
         var scroll_lenght=0;
         while ((scroll_lenght<Math.round(div_dom.offsetWidth/2))&&(page_control.D3Store.ShowIndex>0))
             {
                 page_control.D3Store.ShowIndex--;
                 if(D3Api.getControlPropertyByDom(page_control.D3Store.TabSheetHeads[page_control.D3Store.ShowIndex],'visible'))
                    scroll_lenght=scroll_lenght+page_control.D3Store.TabSheetHeads[page_control.D3Store.ShowIndex].offsetWidth;
             }
         if (page_control.D3Store.ShowIndex==0)
             D3Api.setStyle(ul_dom,'left','0');
         else
             D3Api.setStyle(ul_dom,'left',(ul_dom.offsetLeft+scroll_lenght)+'px');
         D3Api.PageControlCtrl.resize(page_control);
    }
    this.getActiveIndex = function(dom)
    {
        return dom.D3Store.activeIndex;
    }
    this.setActiveIndex = function(dom,index)
    {
        index = +index;
        if (index === dom.D3Store.activeIndex)
            return;
        if (dom.D3Store.activeIndex != undefined)
        {
            var tab = D3Api.getDomBy(dom, '.tab'+dom.D3Store.activeIndex+'_'+dom.D3Store.uniqId);
            D3Api.removeClass(tab, 'active');
            var page = D3Api.getDomBy(dom, '.page'+dom.D3Store.activeIndex+'_'+dom.D3Store.uniqId);
            dom.D3Base.callEvent('onpagehide', dom.D3Store.activeIndex);
            D3Api.hideDom(page);
        }
        tab = D3Api.getDomBy(dom, '.tab'+index+'_'+dom.D3Store.uniqId);
        D3Api.addClass(tab, 'active');
        page = D3Api.getDomBy(dom, '.page'+index+'_'+dom.D3Store.uniqId);
        D3Api.showDomBlock(page);
        dom.D3Base.callEvent('onpageshow', index);
        var hInd = dom.D3Store.activeIndex;
        dom.D3Store.activeIndex = index;
        dom.D3Base.callEvent('onpagechange',index,hInd);
        D3Api.resize();
    }
    this.showTab = function showTab(dom)
    {
        var pc = D3Api.getControlByDom(dom, 'PageControl');
        var index = D3Api.getProperty(dom, 'pageindex', 0);
        this.setActiveIndex(pc,index);
    }
    this.getPageByIndex = function(dom,index)
    {
        index = index || dom.D3Store.activeIndex;
        var page = D3Api.getDomBy(dom, '.page'+index);
        if (!page)
            D3Api.debug_msg('Закладка с индесом '+index+' не найдена.');
        return page;
    }
    this.getTabByIndex = function(dom,index)
    {
        if(D3Api.isUndefined(index))
            index = dom.D3Store.activeIndex;

        var tab = D3Api.getDomByAttr(dom, 'pageindex', index);
        if (!tab)
            D3Api.debug_msg('Кнопка закладки с индесом '+index+' не найдена.');
        return tab;
    }
    this.CtrlKeyDown = function(dom, e)
    {
        switch (e.keyCode)
        {
            case 33: //PageUp
            case 38: //стрелка вверх
            case 37: //стрелка влево
                var activeIndex = D3Api.PageControlCtrl.getActiveIndex(dom);
                var flag = false;

                while (!flag)
                {
                    var nextTab = D3Api.PageControlCtrl.getTabByIndex(dom, activeIndex-1);

                    if(nextTab)
                    {
                        if(D3Api.BaseCtrl.getVisible(nextTab))
                        {
                            D3Api.PageControlCtrl.showTab(nextTab);
                            flag = true;
                        }
                    }
                    else
                        flag = true;

                    activeIndex = nextTab;
                }
                D3Api.stopEvent(e);
                break;
            case 34: //PageDown
            case 40: //стрелка вниз
            case 39: //стрелка вправо
                var activeIndex = D3Api.PageControlCtrl.getActiveIndex(dom);
                var flag = false;

                while (!flag)
                {
                    var nextTab = D3Api.PageControlCtrl.getTabByIndex(dom, activeIndex+1);

                    if(nextTab)
                    {
                        if(D3Api.BaseCtrl.getVisible(nextTab))
                        {
                            D3Api.PageControlCtrl.showTab(nextTab);
                            flag = true;
                        }
                    }
                    else
                        flag = true;

                    activeIndex = nextTab;
                }
                D3Api.stopEvent(e);
                break;
        }
    }
}
D3Api.controlsApi['PageControl'] = new D3Api.ControlBaseProperties(D3Api.PageControlCtrl);
D3Api.controlsApi['PageControl']['activeIndex']={get:D3Api.PageControlCtrl.getActiveIndex,set:D3Api.PageControlCtrl.setActiveIndex};

D3Api.TabSheetCtrl = new function()
{
    this.setVisible = function(dom, value)
    {
        D3Api.BaseCtrl.setVisible(dom,value);

        var pc = D3Api.getControlByDom(dom, 'PageControl');
        var ind = D3Api.getProperty(dom, 'pageindex', false);
        var page = D3Api.getDomByAttr(pc, 'cont', 'page'+ind+'_'+pc.D3Store.uniqId);

        if(!page)
            return;
        D3Api.BaseCtrl.setVisible(page,value);
        D3Api.PageControlCtrl.CalckTabSheetHead(pc);
        D3Api.PageControlCtrl.resize(pc);
    }
    this.getIndex = function(dom)
    {
        return D3Api.getProperty(dom, 'pageindex', null);
    }
    this.getCaption = function(dom)
    {
        var cc = D3Api.getDomByAttr(dom, 'cont', 'tabcaption');
        return D3Api.getTextContent(cc);
    }
    this.setCaption = function(dom,value)
    {
        var cc = D3Api.getDomByAttr(dom, 'cont', 'tabcaption');
        D3Api.addTextNode(cc, value, true);
        return true;
    }
}

D3Api.controlsApi['TabSheet'] = new D3Api.ControlBaseProperties(D3Api.TabSheetCtrl);
D3Api.controlsApi['TabSheet']['visible'].set = D3Api.TabSheetCtrl.setVisible;
D3Api.controlsApi['TabSheet']['index']={get:D3Api.TabSheetCtrl.getIndex};
D3Api.controlsApi['TabSheet']['caption']={get: D3Api.TabSheetCtrl.getCaption, set: D3Api.TabSheetCtrl.setCaption};
D3Api.UnitEditCtrl = new function UnitEditCtrl()
{
    this.callComposition = function(dom,name,data,addOnClose,permanent_filter)
    {
        //TODO: Completer add
        if(permanent_filter)
        {
            for(var ds in permanent_filter)
            {
                if(!permanent_filter.hasOwnProperty(ds)){
                    continue;
                }
                for(var f in permanent_filter[ds])
                {
                    if(!permanent_filter[ds].hasOwnProperty(f)){
                        continue;
                    }
                    var fObj = permanent_filter[ds][f];
                    if(!(fObj instanceof Object))
                    {
                        permanent_filter[ds][f] = {
                            value : permanent_filter[ds][f]
                        }
                        fObj = permanent_filter[ds][f];
                    }
                    var valFunc = 'getValue';
                    var prop = '';

                    if(fObj.value)
                    {
                        fObj.value = ''+fObj.value;
                        if(fObj.value.indexOf(':') != -1)
                        {
                            var val = fObj.value.split(':');
                            fObj.value = val[0];
                            prop = val[1];
                            valFunc = 'getControlProperty';
                        }
                    }
                    var val = fObj.value;

                    if(val && dom.D3Form.vars[val] !== undefined)
                    {
                        val = dom.D3Form.getVar(val);
                    }else if(val && dom.D3Form.controlExist(val))
                    {
                        val = dom.D3Form[valFunc](val,prop)
                    }

                    if(D3Api.isUndefined(val))
                        val = fObj.const;

                    fObj.value = (fObj.mode?fObj.mode: '=')+val;
                }
            }
            data.onprepare = function()
            {
                for(var ds in permanent_filter)
                {
                    if(!permanent_filter.hasOwnProperty(ds)){
                        continue;
                    }
                    for(var f in permanent_filter[ds])
                    {
                        if(permanent_filter[ds].hasOwnProperty(f)){
                            this.getDataSet(ds).addFilterPermanent(f,permanent_filter[ds][f].value);
                        }
                    }
                }
            }
        }
        data.onclose = [D3Api.UnitEditCtrl.setSelectResult(dom),addOnClose];
        D3Api.showForm(name,undefined,data);
    }
    this.setSelectResult = function(dom)
    {
        return function(res)
        {
            if(res)
            {
                if (res[res.name + '_fulldata'] != null && dom.D3Store) {
                    dom.D3Store._fulldata = res[res.name + '_fulldata'];
                }
                var unit = D3Api.getProperty(dom,'unit');
                var show_info = D3Api.getProperty(dom,'show_info');

                if(res[res.name + '_data'] != undefined)
                    D3Api.setControlPropertyByDom(dom, 'data', res[res.name + '_data'], undefined, true);
                D3Api.setControlPropertyByDom(dom,'focus',true);

                if (show_info && unit){
                    if(res[res.name + '_id'] != undefined)
                        D3Api.setControlPropertyByDom(dom, 'valueShowInfo', res[res.name + '_id'], undefined, true);
                }
                else{
                    if(res[res.name + '_id'] != undefined)
                        D3Api.setControlPropertyByDom(dom, 'value', res[res.name + '_id'], undefined, true);
                    if(res[res.name] != undefined)
                        D3Api.setControlPropertyByDom(dom, 'caption', res[res.name], undefined, true);
                }
            }
        };
    }
};
D3Api.DependencesCtrl = new function()
{
    this.init = function(dom)
    {
        dom.D3Dependences = {};
        dom.D3Dependences.name = D3Api.getProperty(dom,'name') || D3Api.getUniqId('d');
        D3Api.DependencesCtrl.setCondition(dom,D3Api.getProperty(dom,'condition',false));
        dom.D3Dependences.repeater = dom.D3Form.getRepeater(D3Api.getProperty(dom,'repeatername'));
        dom.D3Dependences.required = {};
        dom.D3Dependences.depend ={};

        var req = D3Api.getProperty(dom, 'required', '').split(';');
        var dep = D3Api.getProperty(dom, 'depend', '').split(';');

        if(dom.D3Dependences.repeater)
        {
            dom.D3Dependences.repeater.addEvent('onafter_clone',function(){registerRequiredDepend(dom,req,dep)});
            dom.D3Dependences.repeater.addEvent('onclone_remove',function(){D3Api.DependencesCtrl.refresh(dom);});
        }else
        {
            if(dom.D3Form.currentContext && D3Api.hasProperty(dom.D3Form.currentContext,'isclone') && D3Api.hasProperty(dom.D3Form.currentContext,'repeatername'))
            {
                var rep = dom.D3Form.getRepeater(D3Api.getProperty(dom.D3Form.currentContext,'repeatername'));
                rep.addEventOnce('onclone_remove',function(){
                    for(var name in dom.D3Dependences.depend)
                    {
                        if(dom.D3Dependences.depend.hasOwnProperty(name)){
                            refreshDepend(dom,name,true);
                        }

                    }
                });
            }
            registerRequiredDepend(dom,req,dep);
        }
    };
    function registerRequiredDepend(dom,req,dep)
    {
        for(var i = 0, ic = req.length; i < ic; i++)
        {
            D3Api.DependencesCtrl.addRequiredControl(dom, req[i], false);
        }
        for(var i = 0, ic = dep.length; i < ic; i++)
        {
            D3Api.DependencesCtrl.addDependControl(dom, dep[i], false);
        }
        D3Api.DependencesCtrl.refresh(dom);
    }
    this.addRequiredControl = function(dom,name,refresh)
    {
        if(refresh == undefined)
            refresh = true;
        if(D3Api.empty(name))
            return;

        var desc = name.split(':');

        name = desc[0];
        var warn = D3Api.getUniqId('w');
        var onlyWarn = false;
        //Просто проверка без предупреждения
        if(name[0] == '?')
        {
            warn = false;
            name = name.substr(1);
        }else if(name[0] == '!') //Только предупреждение
        {
            onlyWarn = true;
            name = name.substr(1);
        }

        if (dom.D3Dependences.required[name] && !dom.D3Dependences.repeater)
            return;

        if(warn && dom.D3Dependences.required[name])
            warn = dom.D3Dependences.required[name].warning;

        var ctrl = dom.D3Form.getControl(name);
        if(!ctrl)
            return;

        if(D3Api.getOption('showDependence',false) && !onlyWarn)
        {
            D3Api.addClass(ctrl, 'ctrl_dependence');
        }

        if (!ctrl.D3Dependences) {
            ctrl.D3Dependences = {};
        }
        if (!ctrl.D3Dependences.dependencesWarning) {
            ctrl.D3Dependences.dependencesWarning = {};
        }
        if (ctrl.D3Dependences.dependencesWarningAll == null) {
            ctrl.D3Dependences.dependencesWarningAll = 0;
        }

        if(warn)
        {
            //Устанавливаем счетчик предупреждений
            ctrl.D3Dependences.dependencesWarning[warn] = 0;
        }
        //Любые свойства
        var prop = D3Api.BaseCtrl.callMethod(ctrl,'getDependencesProperty') || 'value';
        if (desc[1])
        {
            prop = desc[1];
        }
        //Проверки
        var chk = '';
        if (desc[2])
        {
            chk = dom.D3Form.execDomEventFunc(ctrl, {func: desc[2], args: 'value'});
        }
        dom.D3Dependences.required[name] = {eventInput: null, event: '', property: prop, value: '', check: chk, warning: warn, onlyWarning: onlyWarn, errorState: null};

        dom.D3Dependences.required[name].value = D3Api.getControlPropertyByDom(ctrl, prop);

        dom.D3Dependences.required[name].event = ctrl.D3Base.addEvent('onchange_property',dom.D3Form.closure(
            function(property,value)
            {
                if(property == prop)
                {
                    if(dom.D3Dependences.required[name])
                    {
                        value = D3Api.getControlPropertyByDom(ctrl, property);
                        dom.D3Dependences.required[name].value = value;
                    }
                    D3Api.DependencesCtrl.refresh(dom);
                }
                if(property == 'error')
                {
                    dom.D3Dependences.required[name].errorState = null;
                    ctrl.D3Store.D3MaskParams && (dom.D3Dependences.required[name].errorState = !ctrl.D3Form.getControlProperty(ctrl,'error') && ctrl.D3Store.D3MaskParams.valid()&&!value);
                    D3Api.DependencesCtrl.refresh(dom);
                }
            }));
        var input = dom.D3Form.getControlProperty(ctrl,'input');
        if(input)
        {
            dom.D3Dependences.required[name].eventInput = D3Api.addEvent(input,'keyup',function(closeureContext){return function(){
                if(dom.D3Dependences.timer)
                {
                    clearTimeout(dom.D3Dependences.timer);
                    dom.D3Dependences.timer = null;
                }
                dom.D3Dependences.timer = setTimeout(function(){
                    dom.D3Form.closureContext(closeureContext);
                    if (dom.D3Dependences.required[name]) {
                        dom.D3Dependences.required[name].value = D3Api.getControlPropertyByDom(ctrl, prop);
                        dom.D3Dependences.required[name].errorState = null;
                        ctrl.D3Store.D3MaskParams && (dom.D3Dependences.required[name].errorState = !ctrl.D3Form.getControlProperty(ctrl,'error') && ctrl.D3Store.D3MaskParams.valid());
                    }
                    D3Api.DependencesCtrl.refresh(dom);
                    dom.D3Form.unClosureContext();
                },500);
            }}(dom.D3Form.currentContext),true);
        }
        if(refresh)
            D3Api.DependencesCtrl.refresh(dom);
    };
    this.removeRequiredControl = function(dom,name)
    {
        if (!dom.D3Dependences.required[name])
            return;

        var ctrl = dom.D3Form.getControl(name);
        if(D3Api.getOption('showDependence',false))
        {
            D3Api.removeClass(ctrl, 'ctrl_dependence');
        }
        if (dom.D3Dependences.required[name].warning)
        {
            //Убрать предупреждение с контрола
            if(ctrl.D3Dependences.dependencesWarning[dom.D3Dependences.required[name].warning] == 1)
            {
                ctrl.D3Dependences.dependencesWarningAll--;
                if(ctrl.D3Dependences.dependencesWarningAll == 0)
                    D3Api.setControlPropertyByDom(ctrl, 'warning', false);
            }
            delete ctrl.D3Dependences.dependencesWarning[dom.D3Dependences.required[name].warning];
        }

        ctrl.D3Base.removeEvent('onchange_property', dom.D3Dependences.required[name].event);
        if(dom.D3Dependences.required[name].eventInput)
            D3Api.removeEvent(dom.D3Form.getControlProperty(ctrl,'input'),'keyup', dom.D3Dependences.required[name].eventInput);
        dom.D3Dependences.required[name] = null;
        delete dom.D3Dependences.required[name];

        D3Api.DependencesCtrl.refresh(dom);
    };
    this.addDependControl = function(dom,name,refresh)
    {
        if(refresh == undefined)
            refresh = true;
        if(D3Api.empty(name))
            return;
        var desc = name.split(':');

        name = desc[0];

        if (dom.D3Dependences.depend[name])
            return;

        //Любые свойства
        var prop = 'enabled';
        if (desc[1])
        {
            prop = desc[1];
        }
        //Проверки
        var res = '';
        if (desc[2])
        {
            res = desc[2];
        }
        var depuid = D3Api.getUniqId('d');
        var ctrl = dom.D3Form.getControl(name);
        if(!ctrl.D3DependencesDepend || !ctrl.D3DependencesDepend[dom.D3Dependences.name])
        {
            ctrl.D3DependencesDepend = ctrl.D3DependencesDepend || {}
            ctrl.D3DependencesDepend[dom.D3Dependences.name] = {};
        }
        ctrl.D3DependencesDepend[dom.D3Dependences.name][depuid] = true;

        dom.D3Dependences.depend[name] = {property: prop, result: res, control: ctrl, depuid: depuid};

        if(refresh)
        {
            if(dom.D3Dependences.lastResult != undefined)
            {
                refreshDepend(dom,name,dom.D3Dependences.lastResult);
            }else
                D3Api.DependencesCtrl.refresh(dom);
        }
    };
    this.getDependControlList = function(dom)
    {
        if (!dom || !dom.D3Dependences || !dom.D3Dependences.required)
            return;

        var requiredArray = Object.keys(dom.D3Dependences.required);
        return requiredArray;
    };
    this.removeDependControl = function(dom,name)
    {
        if (!dom.D3Dependences.depend[name])
            return;

        refreshDepend(dom,name,true);

        dom.D3Dependences.depend[name].control.D3DependencesDepend[dom.D3Dependences.name][dom.D3Dependences.depend[name].depuid] = null;
        delete dom.D3Dependences.depend[name].control.D3DependencesDepend[dom.D3Dependences.name][dom.D3Dependences.depend[name].depuid];

        dom.D3Dependences.depend[name] = null;
        delete dom.D3Dependences.depend[name];
        //TODO: Вернуть состояние ? какое (должен позаботиться разработчик сам)
    };
    this.refresh = function(dom)
    {
        var sW = !dom.D3Dependences.condition;
        var result = true, rD = {};
        if(dom.D3Dependences.repeater)
        {
            var clns = dom.D3Dependences.repeater.clones();
            for(var i = 0, ic = clns.length; i < ic; i++)
            {
                dom.D3Form.closureContext(clns[i]);
                for(var name in dom.D3Dependences.required)
                {
                    if(!dom.D3Dependences.required.hasOwnProperty(name)){
                        continue;
                    }
                    //Проверки
                    if (!checkRequired(dom,name,undefined,sW))
                    {
                        rD[name] = false;
                        result = 0;
                    }else
                        rD[name] = 1;
                }
                dom.D3Form.unClosureContext();
            }
        }else
        {
            for(var name in dom.D3Dependences.required)
            {
                if(!dom.D3Dependences.required.hasOwnProperty(name)){
                    continue;
                }
                if (!checkRequired(dom,name,dom.D3Dependences.required[name].value,sW,dom.D3Dependences.required[name].errorState))
                {
                    rD[name] = false;
                    result = 0;
                }else
                    rD[name] = 1;
            }
        }
        if(dom.D3Dependences.condition)
        {
            result = dom.D3Dependences.condition(rD);

            for(var n in rD)
            {
                if(rD.hasOwnProperty(n)){
                    setWarningState(dom,n,result||rD[n]);
                }

            }
        }

        var bChange = (dom.D3Dependences.lastResult !== result);
        dom.D3Dependences.lastResult = result;

        for(var name in dom.D3Dependences.depend)
        {
            if(dom.D3Dependences.depend.hasOwnProperty(name)){
                refreshDepend(dom,name,result);
            }
        }

        if (bChange) {
            dom.D3Base.callEvent('onchange_property', 'value');
        }
    };
    function refreshDepend(dom,name,result)
    {
        if (dom.D3Dependences.depend[name].result != '')
        {
            result = dom.D3Form.execDomEventFunc(dom, {func:dom.D3Dependences.depend[name].result,args:'result'})(result);
        }
        var ctrl = dom.D3Dependences.depend[name].control;
        ctrl.D3DependencesDepend[dom.D3Dependences.name][dom.D3Dependences.depend[name].depuid] = result;
        result = true;
        for(var d in ctrl.D3DependencesDepend)
        {
            if(!ctrl.D3DependencesDepend.hasOwnProperty(d)){
                continue;
            }
            for (var du in ctrl.D3DependencesDepend[d]){
                if(ctrl.D3DependencesDepend[d].hasOwnProperty(du)){
                    result = result && ctrl.D3DependencesDepend[d][du];
                }
            }

        }
        D3Api.setControlPropertyByDom(ctrl,dom.D3Dependences.depend[name].property,result);
    }
    function checkRequired(dom,name,value,setWarning,error)
    {
        value = value || dom.D3Form.getControlProperty(name,dom.D3Dependences.required[name].property);
        var res = (!D3Api.isUndefined(error))?error:!dom.D3Form.getControlProperty(name,'error');
        //Проверки
        if(!dom.D3Dependences.required[name].onlyWarning)
        {
            if (dom.D3Dependences.required[name].check != '')
            {
                if(!dom.D3Dependences.required[name].check(value))
                    res = false;
            }else if(!value)
                res = false;
        }
        if(setWarning)
            setWarningState(dom,name,res);
        return res;
    }
    function setWarningState(dom,name,state)
    {
        if (dom.D3Dependences.required[name].warning)
        {
            var ctrl = dom.D3Form.getControl(name);
            if(!ctrl.D3Dependences)
                return;
            if(!state)
            {
                //Увеличиваем счетчик
                if(ctrl.D3Dependences.dependencesWarning[dom.D3Dependences.required[name].warning] == 0)
                {
                    ctrl.D3Dependences.dependencesWarning[dom.D3Dependences.required[name].warning] = 1;
                    ctrl.D3Dependences.dependencesWarningAll++;
                }
                D3Api.setControlPropertyByDom(ctrl, 'warning', true);
            }else
            {
                if(ctrl.D3Dependences.dependencesWarning[dom.D3Dependences.required[name].warning] == 1)
                {
                    ctrl.D3Dependences.dependencesWarning[dom.D3Dependences.required[name].warning] = 0;
                    ctrl.D3Dependences.dependencesWarningAll--;
                }
                if(ctrl.D3Dependences.dependencesWarningAll == 0)
                    D3Api.setControlPropertyByDom(ctrl, 'warning', false);
            }
        }
    }
    this.setCondition = function(dom,value)
    {
        dom.D3Dependences.condition = null;
        if(!value) return;

        value = value.replace(/([a-z][a-z_0-9]+)/ig,'R.$1');
        dom.D3Dependences.condition = new Function('R','return !!('+value+')');
    };
    this.getValue = function (dom) {
        return dom.D3Dependences.lastResult;
    };
};

D3Api.controlsApi['Dependences'] = new D3Api.ControlBaseProperties(D3Api.DependencesCtrl);
D3Api.controlsApi['Dependences']['condition'] = {set: D3Api.DependencesCtrl.setCondition};
D3Api.controlsApi['Dependences']['value'] = {get: D3Api.DependencesCtrl.getValue};
D3Api.RangeCtrl = new function()
{
    this.init = function(dom)
    {
        var uid = D3Api.getProperty(dom,'uniqid');
        dom.D3Range = {uid: uid};
        dom.D3Range.page = 1;
        dom.D3Range.pages = 1;
        dom.D3Range.lastPage = false;
        dom.D3Range.lastAmount = 0;
        dom.D3Range.lastNotEmptyPage = 0;
        dom.D3Range.viewPages = D3Api.getProperty(dom, 'pages', 3);
        dom.D3Range.viewPagesRange = Math.floor(dom.D3Range.viewPages/2);
        dom.D3Range.amount = D3Api.getProperty(dom, 'default_amount', 10);
        dom.D3Range.dataset = dom.D3Form.getDataSet(D3Api.getProperty(dom, 'dataset'));
        dom.D3Range.keyfield = D3Api.getProperty(dom, 'keyfield', 1);
        dom.D3Range.count = D3Api.getBoolean(D3Api.getProperty(dom, 'count', 'true'));
        dom.D3Range.show_count = D3Api.getBoolean(D3Api.getProperty(dom, 'show_count', 'false'));
        dom.D3Range.show_select = D3Api.getProperty(dom, 'selectlist', false);
        if(dom.D3Range.show_select)
        {
            dom.D3Form.setCaption('range_select_'+dom.D3Range.uid,'Отмечено: 0');
            dom.D3Form.addControlEvent(dom.D3Range.show_select,'onupdate',function(){
                dom.D3Form.setCaption('range_select_'+dom.D3Range.uid,'Отмечено: '+this.D3SelectList.values_count);
            });
        } else {
            D3Api.addClass(dom.D3Form.getControl('range_select_' + dom.D3Range.uid), 'ctrl_hidden');
        }

        D3Api.BaseCtrl.initEvent(dom, 'onamount');
        dom.D3Base.callEvent('onamount', dom.D3Range.amount);

        var locate = D3Api.getProperty(dom, 'locate', '');
        if(locate)
        {
            locate = locate.split(':');
            dom.D3Range.locateField = locate[0];
            dom.D3Range.locateControl = locate[1];
            dom.D3Range.locateControlProperty = locate[2] || 'locate';
            dom.D3Range.dataset.addEvent('onbefore_refresh',function(){D3Api.RangeCtrl.setLocate(dom)});
        }
        dom.D3Range.innerRefresh = false;
        dom.D3Range.dataset.addEvent('onbefore_refresh',function(reqtype){
            if(!dom.D3Range.innerRefresh && reqtype != 'mode')
            {
                dom.D3Range.pages = 1;
                dom.D3Range.lastPage = false;
                dom.D3Range.lastAmount = 0;
                dom.D3Range.lastNotEmptyPage = 0;
                D3Api.RangeCtrl.setRange(dom, 1, undefined, false);
            }
        });
        dom.D3Range.dataset.addEvent('onrefresh',function(){D3Api.RangeCtrl.paint(dom)});
        dom.D3Range.btnPage = D3Api.getDomByAttr(dom, 'cont', 'btnpage');
        dom.D3Range.btnsCont = D3Api.getDomByAttr(dom, 'cont', 'btnpagecont');
        D3Api.removeDom(dom.D3Range.btnPage);
        dom.D3Range.amCont = D3Api.getDomByAttr(dom, 'cont', 'range_amount');
        dom.D3Range.goCont = D3Api.getDomByAttr(dom, 'cont', 'range_go');
        dom.D3Range.psCont = D3Api.getDomByAttr(dom, 'cont', 'range_pages');
        dom.D3Range.amCont.onclick = showTip(dom.D3Range.amCont.lastChild);
        dom.D3Range.goCont.onclick = showTip(dom.D3Range.goCont.lastChild);
        dom.D3Range.amCont.firstChild.innerHTML = dom.D3Range.amount;
        D3Api.RangeCtrl.setRange(dom,dom.D3Range.page,undefined,false);
    };
    function showTip(dom)
    {
        D3Api.setProperty(dom,'cont','tip');
        return function ()
        {
            var range = D3Api.getControlByDom(dom, 'Range');
            if(range.D3Range._currentTip)
                return;
            range.D3Range._currentTip = dom;
            dom._hideFunc = function(event)
            {
                if(event !== false)
                {
                    var t = D3Api.getEventTarget(event);
                    if(D3Api.getDomByDomAttr(t, 'cont', 'tip',20) == dom)
                    {
                        return;
                    }
                    D3Api.stopEvent(event);
                }
                D3Api.setDomDisplayDefault(dom);
                D3Api.removeEvent(document,"mousedown",dom._hideFunc,true);
                range.D3Range._currentTip = null;
            }
            D3Api.addEvent(document,"mousedown",dom._hideFunc,true);
            D3Api.showDomBlock(dom);
            var ed = D3Api.getDomBy(dom,'.ctrl_edit');

            ed && D3Api.setControlPropertyByDom(ed,'focus',true);
        }
    }
    this.setLocate = function(dom)
    {
        var lv = dom.D3Form.getControlProperty(dom.D3Range.locateControl,dom.D3Range.locateControlProperty);
        if(dom.D3Range.locateField && lv)
            dom.D3Range.dataset.setLocate(dom.D3Range.locateField,lv);
    }
    function addPage(dom,num,cap,showOnly)
    {
        var page = dom.D3Range.btnPage.cloneNode(true);
        page.innerHTML = cap || num;
        page._cap = cap || num;
        page._num = num;
        page._so = showOnly === undefined ? page._cap != page._num : showOnly;
        if(dom.D3Range.page == num)
            D3Api.addClass(page, 'active');
        D3Api.addDom(dom.D3Range.btnsCont, page);
        page.onclick = function () {
            D3Api.RangeCtrl.page(dom,this._num, this._so);
        };
        if (!page._so) {
            var s = (+num - 1) * dom.D3Range.amount;
            var sp;

            if (dom.D3Range.count) {
                sp = (s + dom.D3Range.amount > dom.D3Range.dataset.getAllCount()) ? dom.D3Range.dataset.getAllCount() : s + dom.D3Range.amount;
            } else {
                sp = s + ((num >= dom.D3Range.page) ? dom.D3Range.dataset.getAllCount() : dom.D3Range.amount);
            }

            page.title = 'с ' + (s + 1) + ' по ' + sp;
        }
        return page;
    }
    this.getCountRows = function (dom,callback)
    {
        dom.D3Range.dataset.refreshByMode('count',{},function(ds,data){
            var allCount = data[0].count || data[0].COUNT;
            dom.D3Range.pages = Math.ceil(allCount/dom.D3Range.amount);
            dom.D3Range.lastPage = true;
            dom.D3Range.lastAmount = allCount % dom.D3Range.amount;
            dom.D3Range.lastNotEmptyPage = dom.D3Range.pages;
            if (typeof callback === 'function') {
                callback();
            }
        });
    }
    this.paint = function(dom,showPage)
    {
        dom.D3Range.page = dom.D3Range.dataset.getRangePage()+1;
        dom.D3Range.pages = (!dom.D3Range.count)?Math.max(dom.D3Range.page,dom.D3Range.pages):Math.ceil(dom.D3Range.dataset.getAllCount()/dom.D3Range.amount);

        dom.D3Form.setValue('range_page_'+dom.D3Range.uid,'');
        dom.D3Form.setValue('range_amount_'+dom.D3Range.uid,'');
        D3Api.clearDom(dom.D3Range.btnsCont);

        if(dom.D3Range.pages > dom.D3Range.viewPages+4)
        {
            showPage = showPage ||dom.D3Range.page;
            addPage(dom,'1');
            var pst = 3;
            if(showPage>=dom.D3Range.viewPages+2)
            {
                pst = Math.min(showPage - dom.D3Range.viewPagesRange,dom.D3Range.pages-dom.D3Range.viewPages-1);
                addPage(dom,Math.max(pst-dom.D3Range.viewPagesRange-1,1),'...');
            }else
                addPage(dom,'2');

            for(var i = pst, c = pst+dom.D3Range.viewPages; i < c; i++)
            {
                addPage(dom,i);
            }

            if(dom.D3Range.pages > pst+dom.D3Range.viewPages+1)
            {
                addPage(dom,Math.min(pst+dom.D3Range.viewPages+dom.D3Range.viewPagesRange,dom.D3Range.pages),'...');
            }else
                addPage(dom,dom.D3Range.pages-1);
            addPage(dom,dom.D3Range.pages);
        }else
        {
            for(var i = 0; i < dom.D3Range.pages; i++)
            {
                var p = i+1;
                addPage(dom,p);
            }
        }

        dom.D3Range.goCont.firstChild.innerHTML = dom.D3Range.dataset.getRangePage()+1;
        var c = dom.D3Range.dataset.getCount();
        if(c == 0)
        {
            if(dom.D3Range.lastNotEmptyPage == dom.D3Range.page-1)
            {
                dom.D3Range.lastPage = true;
                dom.D3Range.lastAmount = dom.D3Range.amount;
            }
            dom.D3Range.pages = dom.D3Range.lastNotEmptyPage;
            D3Api.RangeCtrl.setRange(dom,dom.D3Range.pages,undefined);
            if(dom.D3Range.pages === 0) {
                dom.D3Range.psCont.innerHTML = 1;
            }
            showCount(dom);
            return;
        }else if(c < dom.D3Range.amount)
        {
            dom.D3Range.lastPage = true;
            dom.D3Range.lastAmount = dom.D3Range.dataset.getCount();
        }
        dom.D3Range.lastNotEmptyPage = dom.D3Range.pages;
        if(!dom.D3Range.lastPage && !dom.D3Range.count)
        {
            addPage(dom, dom.D3Range.pages+1, '...', false);
            // addPage(dom, dom.D3Range.pages+1, '>>', false,1);
            dom.D3Range.psCont.innerHTML = dom.D3Range.pages + '+';
            D3Api.addClass(dom.D3Range.psCont,'ctrl_range_from_pages');
            dom.D3Range.psCont.onclick = function()
            {
                D3Api.RangeCtrl.getCountRows(dom,function () {
                    D3Api.RangeCtrl.paint(dom);
                });
            }
        }else
        {
            dom.D3Range.psCont.innerHTML = dom.D3Range.pages;
            D3Api.removeClass(dom.D3Range.psCont,'ctrl_range_from_pages');
            dom.D3Range.psCont.onclick = null;
        }
        dom.D3Range.innerRefresh = false;
        showCount(dom);
    }
    function showCount(dom)
    {
        if (dom.D3Range.show_count) {
            dom.D3Form.setCaption('range_count_'+dom.D3Range.uid,'Всего: '+((!dom.D3Range.count)?(dom.D3Range.pages-(dom.D3Range.lastAmount?1:0))*dom.D3Range.amount+dom.D3Range.lastAmount:dom.D3Range.dataset.getAllCount()));
        } else {
            D3Api.addClass(dom.D3Form.getControl('range_count_' + dom.D3Range.uid), 'ctrl_hidden');
        }
    }
    function goPage()
    {
        var range = D3Api.getControlByDom(this, 'Range');
        D3Api.RangeCtrl.page(range,this._num);
    }
    this.go = function(dom,delta)
    {
        D3Api.RangeCtrl.setRange(dom,dom.D3Range.page+delta);
    }
    this.goLastPage = function(dom)
    {
        if ((dom.D3Range.dataset.getCount()/dom.D3Range.amount) > 0) {
            D3Api.RangeCtrl.getCountRows(dom,function () {
                D3Api.RangeCtrl.setRange(dom,dom.D3Range.pages);
            });
        }
    }
    this.amount = function (dom, amount) {
        dom.D3Base.callEvent('onamount', amount);
        D3Api.RangeCtrl.setRange(dom, 1, amount);
    };
    this.page = function(dom,page,showOnly)
    {
        if(showOnly)
        {
            D3Api.RangeCtrl.paint(dom,page);
            return;
        }
        D3Api.RangeCtrl.setRange(dom,page);
    }
    this.setRange = function(dom,page,amount,refresh)
    {
        dom.D3Range.innerRefresh = (refresh === undefined)?true:refresh;
        page = parseInt(page);
        page = (isNaN(page))?dom.D3Range.page:page;
        if(dom.D3Range.innerRefresh && (page < 1 || (page > dom.D3Range.pages && dom.D3Range.count) || (!dom.D3Range.count && dom.D3Range.lastPage && page > dom.D3Range.pages)))
        {
            dom.D3Range.innerRefresh = false;
            return true;
        }
        dom.D3Range.page = page;
        amount = parseInt(amount);
        amount = (isNaN(amount))?dom.D3Range.amount:amount;
        if(amount <= 0)
        {
            amount = 1;
        }
        if(!dom.D3Range.count)
        {
            if(amount != dom.D3Range.amount)
            {
                var cAmount = (dom.D3Range.pages-1)*dom.D3Range.amount+((dom.D3Range.lastAmount>0)?+dom.D3Range.lastAmount:+dom.D3Range.amount);
                dom.D3Range.pages = Math.ceil(cAmount / amount);
                if(dom.D3Range.lastAmount > 0)
                    dom.D3Range.lastAmount = cAmount % amount;
                if(dom.D3Range.pages < dom.D3Range.page)
                    dom.D3Range.page = dom.D3Range.pages;
            }
        }
        dom.D3Range.amount = +amount;
        if(dom.D3Range._currentTip)
            dom.D3Range._currentTip._hideFunc(false);
        dom.D3Range.amCont.firstChild.innerHTML = dom.D3Range.amount;
        dom.D3Range.goCont.firstChild.innerHTML = dom.D3Range.page;
        dom.D3Range.dataset.setRange(dom.D3Range.page-1,dom.D3Range.amount,dom.D3Range.innerRefresh,dom.D3Range.keyfield,dom.D3Range.count);
    }
    this.onChangeAmount = function(event,dom,amount)
    {
        D3Api.stopEvent(event);
        var range = D3Api.getControlByDom(dom, 'Range');

        D3Api.RangeCtrl.amount(range,amount);
    }
    this.onKeyPressAmount = function(ed)
    {
        var e = D3Api.getEvent();
        if(e.keyCode != 13)
            return;

        var range = D3Api.getControlByDom(ed, 'Range');
        D3Api.RangeCtrl.amount(range,D3Api.getControlPropertyByDom(ed, 'value'));
    }
    this.onKeyPressPage = function(ed)
    {
        var e = D3Api.getEvent();
        if(e.keyCode != 13)
            return;

        var range = D3Api.getControlByDom(ed, 'Range');
        D3Api.RangeCtrl.page(range,D3Api.getControlPropertyByDom(ed, 'value'));
    }
}

D3Api.controlsApi['Range'] = new D3Api.ControlBaseProperties(D3Api.RangeCtrl);
D3Api.MaskCtrl = new function()
{
    //TODO: Если несколько зависимостей действуют на один контрол depend
    this.init = function(dom)
    {
        var ctrls = D3Api.getProperty(dom, 'controls', '').split(';');

        for(var i = 0, ic = ctrls.length; i < ic; i++)
        {
            if (!ctrls[i]) {
                continue;
            }

            var ctrl = dom.D3Form.getControl(ctrls[i]);

            if (!ctrl || ctrl.D3Store.D3MaskParams) { //Маска уже назначена
                continue;
            }

            var mt = D3Api.getProperty(ctrl, 'mask_type', '');
            var mp = {
                maskTemplate: D3Api.getProperty(ctrl, 'mask_template', undefined),
                maskOriginal: D3Api.getProperty(ctrl, 'mask_original', undefined),
                maskCheckRegular: D3Api.getProperty(ctrl, 'mask_check_regular', undefined),
                maskCheckFunction: D3Api.getProperty(ctrl, 'mask_check_function', undefined),
                maskTemplateRegular: D3Api.getProperty(ctrl, 'mask_template_regular', undefined),
                maskTemplateFunction: D3Api.getProperty(ctrl, 'mask_template_function', undefined),
                maskCharReplace: D3Api.getProperty(ctrl, 'mask_char_replace', undefined)
            }
            var me = D3Api.getProperty(ctrl, 'mask_empty', 'true') != 'false';
            var ms = D3Api.getProperty(ctrl, 'mask_strip', 'false') != 'false';
            var mff = D3Api.getProperty(ctrl, 'mask_fill_first', 'false') != 'false';
            var mc = D3Api.getProperty(ctrl, 'mask_clear', 'false') != 'false';
            D3Api.MaskCtrl.registerControl(dom, ctrl,mt,mp,me,ms,mff,mc);
        }
    }

    this.decimalSeparator = (1.1).toLocaleString().substring(1, 2);
    this.thousandSeparator = (1000).toLocaleString().substring(1, 2);

    var maskTypes = {
        time : {
            maskTemplate: '99:99',
            maskOriginal: '00:00',
            maskCheckRegular: '^(([0-1][0-9])|(2[0-3]))\:[0-5][0-9]$',
            maskReplaceSpace: true
        },
        hoursminutes : {
            maskCharReplace: ',:.: :',
            maskCheckRegular: '^\\d+(\\:\\d+)?$',
            maskTemplateRegular: '^\\d+((\\:\\d+)|\\:)?$'
        },
        date : {
            maskTemplate: '99.99.9999',
            maskOriginal: '00.00.0000',
            maskTemplateRegular: '^(([0-3]?)|((([0-2]\\d)|(3[01]))\\.?)|((([0-2]\\d)|(3[01]))\\.((0\\d?)|(1[012]?)))|((([0-2]\\d)|(3[01]))\\.((0\\d)|(1[012]))\\.\\d{0,4}))$',
            maskTemplateFunction: 'return ('+(function(value)
                                {
                                    var d = String(value).split('.');
                                    //if (d[0] == '00' || d[1] == '00' || d[2] == '0000')
                                    //    return false;
                                    var fullcheck = false;
                                    if(value.indexOf('_') != -1 )
                                    {
                                        var y = parseInt(d[2]);
                                        if(y > 9)
                                        {
                                            y = parseInt(d[2].substr(0,2));
                                            if(y < 10 || y > 29)
                                                return false;
                                        }else if (y < 1 || y > 2)
                                            return false;

                                        return true;
                                    }else
                                        fullcheck = true;
                                    if(+d[2] < 1000)
                                        return false;
                                    if(+d[2] > 2999)
                                        return false;
                                    var date = new Date(d[2],d[1]-1,d[0],0,0,0);
                                    if(fullcheck)
                                    {
                                        return +d[0] == date.getDate() && +d[1] == date.getMonth()+1 && +d[2] == date.getFullYear();
                                    }else
                                        return !isNaN(date.valueOf());
                                }).toString()+')(value)',
            maskReplaceSpace: true
        },
        datetime : {
            maskTemplate: '99.99.9999 99:99',
            maskOriginal: '00.00.0000 00:00',
            maskTemplateRegular: /^(\d{2})\.(\d{2})\.(\d{4})\s(\d{2}):(\d{2})$/,
            maskTemplateFunction: 'return ('+(function(value)
                                {
                                    var result = true;
                                    var date = new Date();
                                    value = value.split(/\D+/);

                                    if (value[0] && (value[0] > 31 || value[0].length == 2 && value[0] < 1)) { // day
                                        result = false;
                                    }
                                    if (value[1] && (value[1] > 12 || value[1].length == 2 && value[1] < 1)) { // month
                                        result = false;
                                    }
                                    if (value[2] && (value[2].length == 4 && value[2] < 1)) { // year
                                        result = false;
                                    }

                                    if (value[3] && value[3] > 23) { // hour
                                        result = false;
                                    }
                                    if (value[4] && value[4] > 59) { // minute
                                        result = false;
                                    }

                                    return result;
                                }).toString()+')(value)'
        },
        number : {
            maskCheckRegular: '^\\d+$',
            maskReplaceSpace: true
        },
        signnumber : {
            maskCheckRegular: '^-?\\d+$',
            maskTemplateRegular: '^-?\\d*$',
            maskReplaceSpace: true
        },
        fnumber: {
            maskCharReplace: ',.',
            maskCheckRegular: '^\\d+(\\.\\d+)?$',
            maskTemplateRegular: '^\\d+((\\.\\d+)|\\.)?$',
            maskReplaceSpace: true
        },
        signfnumber: {
            maskCharReplace: ',.',
            maskCheckRegular: '^-?\\d+(\\.\\d+)?$',
            maskTemplateRegular: '^-?\\d*((\\.\\d+)|\\.)?$',
            maskReplaceSpace: true
        },
        /* маска для числа с разделителем из локали */
        fnumberlocal: {
            maskCharReplace: this.decimalSeparator == ',' ? '.,' : null,
            maskCheckRegular: '^(\\'+this.thousandSeparator+'?|\\d+)+(\\'+this.decimalSeparator+'\\d+)?$',
            maskTemplateRegular: '^\\d+((\\'+this.decimalSeparator+'\\d+)|\\'+this.decimalSeparator+')?$',
            maskReplaceSpace: true
        },
        /* маска для числа с разделителем из локали с учетом отрицательных чисел */
        signfnumberlocal: {
            maskCharReplace: this.decimalSeparator == ',' ? '.,' : null,
            maskCheckRegular: '^-?(\\'+this.thousandSeparator+'?|\\d+)+(\\'+this.decimalSeparator+'\\d+)?$',
            maskTemplateRegular: '^-?\\d*((\\'+this.decimalSeparator+'\\d+)|\\'+this.decimalSeparator+')?$',
            maskReplaceSpace: true
        },
        alpha : {
            maskCheckRegular: '^[a-zA-Zа-яА-Я]+$'
        },
        alphanumber : {
            maskCheckRegular: '^[a-zA-Zа-яА-Я0-9]+$'
        },
        numberlen: function(min,max)
        {
            return {
               maskTemplateRegular: "^\\d{0,"+max+"}$",
               maskCheckRegular:    "^\\d{"+min+","+max+"}$",
               maskReplaceSpace: true
            };
        },
        signnumberlen: function(min,max)
        {
            return {
               maskTemplateRegular: "^-?\\d{0,"+max+"}$",
               maskCheckRegular:    "^-?\\d{"+min+","+max+"}$",
               maskReplaceSpace: true
            };
        },
        fnumberlen: function(maxBeforeComma,maxAfterComma)
        {
            return {
                maskCharReplace: ',.',
                maskCheckRegular: '^\\d{0,'+maxBeforeComma+'}(\\.\\d{0,'+maxAfterComma+'})?$',
                maskTemplateRegular: '^\\d{0,'+maxBeforeComma+'}((\\.\\d{0,'+maxAfterComma+'})|\\.)?$' ,
                maskReplaceSpace: true
            };
        },
        maxlen: function(max)
        {
            return {
               maskTemplateRegular: "^.{0,"+max+"}$",
               maskCheckRegular:    "^.{0,"+max+"}$",
               maskReplaceSpace: true
            };
        },
    }
    /**
     * maskType - тип маски date time number alpha ....
     *
     * maskParams - оъект со следующими свойствами:
     * ///
     * maskTemplate - шаблон маски 9 - цифра, a - буква, x - цифра или буква
     * maskOriginal - значения которые будут подставлены для проверки, если не указано(undefined) то будет использовано maskTemplate
     * maskCheckRegular - регулярное выражение для проверки введенного значения с шаблоном
     * maskCheckFunction - тоже только функция, входной параметр значение которое надо проверить, на выходе true или false
     * maskTemplateRegular - используется когда невозможно четко определить шаблон. Регулярное выражение для предварительной проверки во время ввода
     * maskTemplateFunction - тоже только функция
     * maskReplaceSpace - автозамена пробелов при paste
     * ///
     * maskEmpty - значение может быть пустым. По умалчанию true
     */
    this.registerControl = function(dom,control,maskType,maskParams,maskEmpty,maskStrip,maskFillFirst,maskClear)
    {
        var input = D3Api.BaseCtrl.callMethod(control,'getInput');
        var maskProperty = D3Api.BaseCtrl.callMethod(control,'getMaskProperty') || 'value';

        if (!input)
        {
            D3Api.debug_msg('Невозможно применить маску. Отсутствует метод getInput. Контрол: '+D3Api.BaseCtrl.getName(control));
            return false;
        }
        if(maskType)
        {
            var mt = maskType.split(':');
            var args = [];
            if(mt.length > 1)
            {
                maskType = mt[0];
                args = mt[1].split(',');
            }
        }
        if(!((maskType && maskTypes[maskType]) || (maskParams && (maskParams.maskCheckRegular||maskParams.maskCheckFunction||maskParams.maskTemplate ))))
        {
            D3Api.debug_msg('Невозможно применить маску. Не указаны обязательные параметры. Контрол: '+D3Api.BaseCtrl.getName(control));
            return false;
        }

        if(maskType)
        {
            maskParams = D3Api.mixin({},(maskTypes[maskType] instanceof Function)?maskTypes[maskType].apply(this, args):maskTypes[maskType]);
        }
        maskParams.maskEmpty = maskEmpty;
        maskParams.maskStrip = maskStrip;
        maskParams.maskFillFirst = maskFillFirst;
        maskParams.maskClear = maskClear;
        maskParams.maskProperty = maskProperty;
        control.D3Store.D3MaskParams = maskParams;
        new maskInit(control,input);
    }
    this.unRegisterControl = function()
    {

    }
    this.setParam = function(control,paramName,value)
    {
        if(!control || !control.D3Store.D3MaskParams)
        {
            D3Api.debug_msg('У контрола нет назначенной маски.');
        }

        switch(paramName)
        {
            case 'mask_template':
                    control.D3Store.D3MaskParams.maskTemplate = value;
                break;
            case 'mask_original':
                    control.D3Store.D3MaskParams.maskOriginal = value;
                break;
            case 'mask_check_regular':
                    control.D3Store.D3MaskParams.maskCheckRegular = new RegExp(value);
                break;
            case 'mask_check_function':
                    control.D3Store.D3MaskParams.maskCheckFunction = control.D3Form.execDomEventFunc(control, {func: value, args: 'value'});
                break;
            case 'mask_template_regular':
                    control.D3Store.D3MaskParams.maskTemplateRegular = new RegExp(value);
                break;
            case 'mask_template_function':
                    control.D3Store.D3MaskParams.maskTemplateFunction = control.D3Form.execDomEventFunc(control, {func: value, args: 'value'});
                break;
            case 'mask_empty':
                    control.D3Store.D3MaskParams.maskEmpty = value;
                break;
            case 'mask_strip':
                    control.D3Store.D3MaskParams.maskStrip = value;
                break;
            case 'mask_fill_first':
                    control.D3Store.D3MaskParams.maskFillFirst = value;
                break;
            case 'mask_clear':
                    control.D3Store.D3MaskParams.maskClear = value;
                break;
            case 'mask_char_replace':
                    control.D3Store.D3MaskParams.maskCharReplace = value;
                break;
            case 'mask_type':
                    if(value)
                    {
                        var mt = value.split(':');
                        var args = [];
                        if(mt.length > 1)
                        {
                            value = mt[0];
                            args = mt[1].split(',');
                        }
                    }
                    control.D3Store.D3MaskParams.maskTemplate='';
                    control.D3Store.D3MaskParams.maskOriginal='';
                    control.D3Store.D3MaskParams.maskCheckRegular='';
                    control.D3Store.D3MaskParams.maskCheckFunction='';
                    control.D3Store.D3MaskParams.maskCharReplace='';
                    control.D3Store.D3MaskParams.maskTemplateRegular='';
                    control.D3Store.D3MaskParams.maskTemplateFunction='';
                    control.D3Store.D3MaskParams.maskReplaceSpace=false;
                    D3Api.mixin(control.D3Store.D3MaskParams,(maskTypes[value] instanceof Function)?maskTypes[value].apply(control, args):maskTypes[value]);
                    maskParamsInit(control.D3Store.D3MaskParams,control);
                break;
        }
    }
    function maskInit(control,input)
    {
        var maskParams = control.D3Store.D3MaskParams;
        maskParams.valid = function(){
            var value = getControlValueMask();
            return checkValue(value);
        };
        var keyPress = false;
	var keyDownValue='';
	var keyDownStartPosition=0;
        var keyDownEndPosition=0;
        function charCodeEvent(evt)
        {
		if (evt.charCode)
                {
                        return evt.charCode;
                }
                else if (evt.keyCode)
                {
                        return evt.keyCode;
                }
                else if (evt.which)
                {
                        return evt.which;
                }
                else
                {
                        return 0;
                }
	}
        var onClick = function()
        {
                if (!D3Api.empty(maskParams.maskTemplate))
                    selectNext(getSelectionStart());
	}
        var onKeyPress = function (e)
        {
            if(!keyPress)
                return;
                var ch = charCodeEvent(e);
                ch = String.fromCharCode(ch);
                if(maskParams.maskCharReplace)
                {
                    if(typeof(maskParams.maskCharReplace) == 'string')
                    {
                        var chars = maskParams.maskCharReplace;
                        maskParams.maskCharReplace = {};
                        maskParams.maskCharSearch = '';
                        for(var i = 0, c = chars.length; i < c; i+=2)
                        {
                            maskParams.maskCharReplace[chars[i]] = chars[i+1] ? chars[i+1] : '';
                            maskParams.maskCharSearch += chars[i];
                        }
                    }
                    var ind = maskParams.maskCharSearch.indexOf(ch);
                    if(ind != -1)
                        ch = maskParams.maskCharReplace[maskParams.maskCharSearch[ind]];
                }
		if(!D3Api.empty(maskParams.maskTemplate))
                {
			if(updateValue(ch,keyDownStartPosition,keyDownStartPosition+1))
                            selectNext(keyDownStartPosition+1);
			D3Api.stopEvent(e);
                        return;
		}
                if((!D3Api.empty(maskParams.maskTemplateRegular) || !D3Api.empty(maskParams.maskTemplateFunction)))
                {
			if (updateValue(ch,keyDownStartPosition,keyDownEndPosition))
                            setCursorPos(keyDownStartPosition+1);
			D3Api.stopEvent(e);
			return;
		}
	}

    var onPaste = function (e) {
        clipboardData = e.clipboardData || window.clipboardData;
        pastedData = clipboardData.getData('Text');
        var bg = getSelectionStart();
        var en = getSelectionEnd();

        if(!D3Api.empty(maskParams.maskReplaceSpace) && maskParams.maskReplaceSpace === true)
        {
            pastedData = pastedData.replace(/\s/gm,'');
        }

        if(!D3Api.empty(maskParams.maskCharReplace))
        {
            var pastedData_temp = '';
            if(typeof(maskParams.maskCharReplace) == 'string' || (typeof(maskParams.maskCharReplace) == 'object'))
            {
                if(typeof(maskParams.maskCharReplace) == 'string') {
                    var chars = maskParams.maskCharReplace;
                    maskParams.maskCharReplace = {};
                    maskParams.maskCharSearch = '';
                    for (var i = 0, c = chars.length; i < c; i += 2) {
                        maskParams.maskCharReplace[chars[i]] = chars[i + 1] ? chars[i + 1] : '';
                        maskParams.maskCharSearch += chars[i];
                    }
                }
                var ch = '';
                var ind = 0;
                for(var i = 0; i < pastedData.length; i++)
                {
                    ch = pastedData.substr(i,1);
                    ind = maskParams.maskCharSearch.indexOf(ch);
                    if(ind != -1){
                        ch = maskParams.maskCharReplace[maskParams.maskCharSearch[ind]];
                    }
                    pastedData_temp = pastedData_temp + ch;
                }
            }
            pastedData = pastedData_temp.length > 0 ? pastedData_temp : pastedData;
        }

        if(!D3Api.empty(maskParams.maskTemplate)) {
            var templ_value = wearMask(pastedData);
            if (templ_value.length > 0) {
                bg = 0;
                if (updateValue(templ_value, bg, bg + templ_value.length))
                    selectNext(bg + templ_value.length);
                D3Api.stopEvent(e);
                return;
            };
        }
        if((!D3Api.empty(maskParams.maskTemplateRegular) || !D3Api.empty(maskParams.maskTemplateFunction)))
        {
            if (updateValue(pastedData,bg,en))
                setCursorPos(bg+1);
            D3Api.stopEvent(e);
            return;
        }
    };

	var onKeyDown = function (e)
        {
                keyPress = false;
            if (e.ctrlKey) return;
            	var bg = getSelectionStart();
		var en = getSelectionEnd();
		var keyCode=e.keyCode;
                if (!D3Api.empty(maskParams.maskTemplate))
                {
                    switch(keyCode){
                            case 8://backspace
                            case 46://dell
                                    var tpl = maskParams.maskTemplate;
                                    var tplstr = '';
                                    for(var i = bg; i < en; i++)
                                    {
                                        if("9ax".indexOf(tpl.charAt(i))>=0)
                                        {
                                            tplstr += '_';
                                        }else
                                        {
                                            tplstr += tpl.charAt(i);
                                        }
                                    }
                                    var v = setUpdValue(getControlValueMask(),tplstr,bg,en);
                                    setControlValueMask(v);
                                    if(checkTemplateValue(v))
                                    {
                                        onWarningSuccess();
                                    }else
                                    {
                                        onWarningError();
                                    }
                                    if (keyCode == 8)
                                        selectPrev(bg||1);
                                    else
                                        selectNext(bg+1);

                                    D3Api.stopEvent(e);
                                    break;
                            case 33://PgUp
                            case 36:{//Home
                                    selectFirst();onWarningSuccess();
                                    D3Api.stopEvent(e);
                                    break;
                            }
                            case 34://PgDown
                            case 35:{//End
                                    selectLast();onWarningSuccess();
                                    D3Api.stopEvent(e);
                                    break;
                            }
                            case 40://down
                            case 39:{//right
                                    selectNext(bg+1);onWarningSuccess();
                                    D3Api.stopEvent(e);
                                    break;
                            }
                            case 38://Up
                            case 37:{//Left
                                    selectPrev(bg);onWarningSuccess();
                                    D3Api.stopEvent(e);
                                    break;
                            }
                            default:{
                                    if(keyCode>31 || keyCode == 0){     // keyCode = 0 - если браузер не может идентифицировать клавишу
                                            keyDownValue=getControlValueMask();
                                            keyDownStartPosition=bg;
                                            keyDownEndPosition=en;
                                            keyPress = true;
                                    }
                            }
                    }
                    return;
                }
		if (!D3Api.empty(maskParams.maskTemplateRegular) || !D3Api.empty(maskParams.maskTemplateFunction))
                {
			switch(keyCode){
				case 8://backspace
				case 46://del button keydown
				case 36://Home
				case 35://End
				case 40://down
				case 39://right
				case 38://Up
				case 37:{//Left
					if (checkTemplateValue(getControlValueMask()))
                                        {
						onWarningSuccess();
					}else
                                        {
						onWarningError();
					}
					break;
				}
				default:{
					if(keyCode>31 || keyCode == 0){    // keyCode = 0 - если браузер не может идентифицировать клавишу
						keyDownValue=getControlValueMask();
						keyDownStartPosition=bg;
						keyDownEndPosition=en;
                                                keyPress = true;
					}
				}
			}
			return;
		}
	}

        var onFocus = function (e)
        {
            if (D3Api.getProperty(input,'readonly','false') == 'true')
            {
                input.blur();
                return;
            }
            D3Api.addClass(control, 'ctrl_mask');
            var value = getControlValueMask();
            value = prepareMask(value);

            if(!checkValue(value))
            {
                onWarningError();
            }else
            {
                onWarningSuccess();
            }

            setControlValueMask(value);
            selectFirst(value);
	}
        var onBlur = function ()
        {
            var value = getControlValueMask();
            var stripVal = value;
            if (maskParams.maskTemplateFunction)
                stripVal = stripValue(value);
            if(!checkValue(stripVal))
            {
                    onBlurError(stripVal);
                    return;
            }else
            {
                    onBlurSuccess();
            }
            value = stripValue(value);

            var input = D3Api.BaseCtrl.callMethod(control, 'getInput');
            var selectionStart = input.selectionStart;
            var selectionEnd = input.selectionEnd;

            D3Api.setControlPropertyByDom(control, maskParams.maskProperty, value,undefined,true);

            input.selectionStart = selectionStart;
            input.selectionEnd = selectionEnd;
	};
        var onChangeProperty = function(propertyName, propertyValue)
	{
		if (propertyName == maskParams.maskProperty)
		{
                        propertyValue = D3Api.getControlPropertyByDom(control, maskParams.maskProperty,true);
			if(!checkValue(propertyValue)){
				onBlurError(propertyValue);
			}else{
				onBlurSuccess();
			}
                        propertyValue = stripValue(propertyValue);
                        setControlValueMask(propertyValue);
		}
	}
        var onGetProperty = function(propertyName, propertyValueRef)
	{
		if (propertyName == maskParams.maskProperty)
		{
			propertyValueRef.value = stripValue(propertyValueRef.value);
		}
	}
        var prepareMask = function(value)
        {
            if(!maskParams.maskTemplate)
                return value;
            var tpl = maskParams.maskTemplate;
            var iv = 0;
            var rvalue = '';
            for(var i = 0, c = tpl.length; i < c; i++)
            {
                if("9ax".indexOf(tpl.charAt(i))>=0)
                {
                    if(iv < value.length)
                    {
                        rvalue += value.charAt(iv);
                        iv++;
                    }else
                        rvalue += '_';
                }else
                {
                    rvalue += tpl.charAt(i);
                    if(tpl.charAt(i) == value.charAt(iv))
                        iv++;
                }
            }

            return rvalue;
        }
        var checkValueByTemplate = function(value)
        {
            if(!maskParams.maskTemplate)
                return true;

            var tpl = maskParams.maskTemplate;
            var ch = '';
            for(var i = 0, u = 0, c = tpl.length; i < c; i++)
            {
                ch = value.charAt(i);
                switch(tpl.charAt(i))
                {
                    case '9':
                            if(!(/[0-9]/i).test(ch) && ch != '_')
                                return false;
                        break;
                    case 'a':
                            if(!(/[a-zA-Zа-яА-Я]/i).test(ch) && ch != '_')
                                return false;
                        break;
                    case 'x':
                            if(!(/[a-zA-Zа-яА-Я0-9]/i).test(ch) && ch != '_')
                                return false;
                        break;
                    default:
                            if(ch != '_' && ch != tpl.charAt(i) && ch != '_')
                                return false;
                        break;
                }
            }
            return true;
        }
        var stripValue = function(value)
        {
            if(!maskParams.maskTemplate)
                return value;
            var tpl = maskParams.maskTemplate;
            var org = maskParams.maskOriginal;
            var rvalue = '';
            var clear = true;
            value = value || '';
            for(var i = 0, c = org.length; i < c; i++)
            {
                if(value.charAt(i) == '_')
                {
                    if(!maskParams.maskStrip)
                        rvalue +=org.charAt(i);
                }else
                {
                    if (i < value.length)
                    {
                        if(value.charAt(i) != org.charAt(i) || (value.charAt(i) == org.charAt(i) && org.charAt(i) != tpl.charAt(i)) )
                            clear = false;
                        if(value.charAt(i) != org.charAt(i) || org.charAt(i) != tpl.charAt(i) || !maskParams.maskClear)
                            rvalue += value.charAt(i);
                    }else if(!maskParams.maskStrip)
                        rvalue +=org.charAt(i);
                }
            }
            return (clear)?'':rvalue;
        }
        var checkValue = function (value){
		if (value == null) value = '';
                var notStripValue = value;
                value = stripValue(value);
		return  (maskParams.maskEmpty && value.length == 0)
                        ||
                        ((checkValueByTemplate(notStripValue) || maskParams.maskCheckRegular || maskParams.maskCheckFunction) && (!maskParams.maskCheckRegular || maskParams.maskCheckRegular.test(value)) &&
                        (!maskParams.maskCheckFunction || maskParams.maskCheckFunction(notStripValue||value)));
	}
        var checkTemplateValue = function (value){
		if (value == null) value = '';
                var notStripValue = value;
                value = stripValue(value);
		return  (maskParams.maskEmpty && value.length == 0)
                        ||
                        ((checkValueByTemplate(notStripValue) || maskParams.maskTemplateRegular || maskParams.maskTemplateFunction) && (!maskParams.maskTemplateRegular || maskParams.maskTemplateRegular.test(value)) &&
                        (!maskParams.maskTemplateFunction || maskParams.maskTemplateFunction(notStripValue||value)));
	}
        var updateValue = function (updValue,b,e)
        {
		var outValue='';
		var check=false;
		outValue=setUpdValue(getControlValueMask(),updValue,b,e);
                if(check = checkTemplateValue(outValue))
                {
                        setControlValueMask(outValue);
                        onWarningSuccess();
                }else
                {
                        onWarningError();
                }
                return check;
	}
	var onWarningError=function (){
                D3Api.addClass(control, 'ctrl_mask_warning');
		//_setControlProperty(domObject,'color','#f88');
	}
	var onWarningSuccess=function (){
                D3Api.removeClass(control, 'ctrl_mask_warning');
		//_setControlProperty(domObject,'color','#8f8');
	}

	var onBlurError=function (_value){
                //TODO: Изменить поведение
                D3Api.removeClass(control, 'ctrl_mask');
                D3Api.removeClass(control, 'ctrl_mask_warning');
                D3Api.setControlPropertyByDom(control, 'error', true);
	}
	var onBlurSuccess=function (){
                D3Api.removeClass(control, 'ctrl_mask');
                D3Api.removeClass(control, 'ctrl_mask_warning');
                D3Api.setControlPropertyByDom(control, 'error', false);
	}
	var setUpdValue=function (value,updValue,startPosition,endPosition){
		return value.substring(0,startPosition)+updValue+value.substring(endPosition);
	}
        var wearMask=function (value)
        {
		var outValue ='';
		var template = maskParams.maskTemplate;
		var ch = '';
		for(var i = 0, u = 0, c = template.length; i < c; i++)
                {
			ch = value.charAt(u);
			switch(template.charAt(i))
                        {
				case '9':{
					if(!(/[0-9]/i).test(ch))
                                        {
						outValue += '_';
					}else
                                        {
						outValue += ch;
					}
					u++;
					break;
				}
				case 'a':{
					if(!(/[a-zA-Zа-яА-Я]/i).test(ch))
                                        {
						outValue += '_';
					}else
                                        {
						outValue += ch;
					}
					u++;
					break;
				}
				case 'x':{
					if(!(/[a-zA-Zа-яА-Я0-9]/i).test(ch))
                                        {
						outValue += '_';
					}else
                                        {
						outValue += ch;
					}
					u++;
					break;
				}
				default:{
					outValue += template.charAt(i);
				}
			}
		}
		return outValue;
	}
        var getEmptyValue=function (startPosition, endPosition)
        {
		if(!maskParams.maskTemplate)
                    return '';
		var template = maskParams.maskTemplate;
		var outValue='';
		for(var index=startPosition;index<endPosition;index++)
                {
			if("9ax".indexOf(template.charAt(index)) < 0)
                            outValue += template.charAt(index);
                        else
                            outValue += '_';
		}
		return outValue;
	}



        var selectFirst=function ()
        {
		selectNext(0);
	}
	var selectLast=function ()
        {
		selectPrev(getControlValueMask().length);
	}
	var selectPrev=function (start)
        {
		if(maskParams.maskStrip || maskParams.maskTemplate)
                {
			for(var i = start-1; i >= 0; i--)
                        {
                            if("9ax".indexOf(maskParams.maskTemplate.charAt(i)) >= 0)
                            {
                                    setSelection(i,i+1);
                                    break;
                            }
			}
		}else
                {
			if(start != 0)
                        {
				setSelection(start-1,start);
			}
		}
	}
	var selectNext=function (start)
        {
		if(maskParams.maskStrip || maskParams.maskTemplate)
                {
                    if(start >= maskParams.maskTemplate.length)
                        start=maskParams.maskTemplate.length-1;
                    for(var i = start, c = maskParams.maskTemplate.length; i < c; i++)
                    {
                        if("9ax".indexOf(maskParams.maskTemplate.charAt(i)) >= 0)
                        {
                            setSelection(i,i+1);
                            break;
                        }
                    }
		}else
                {
                    setSelection(start,start+1);
		}
	}
	var setSelection=function(a, b)
        {
                try{input.focus();}catch(e){}
		if(input.setSelectionRange) {
			input.setSelectionRange(a, b);
		} else if(input.createTextRange) {
			var r = input.createTextRange();
			r.collapse();
			r.moveStart("character", a);
			r.moveEnd("character", (b - a));
			r.select();
		}
	}
	var getSelectionStart=function()
        {
		var p = 0;
                try{input.focus();}catch(e){}
		if(input.selectionStart !== undefined)
                {
                    p = input.selectionStart;
		} else if(document.selection)
                {
			var r = document.selection.createRange().duplicate();
			r.moveEnd("character", input.value.length);
			p = input.value.lastIndexOf(r.text);
			if(r.text == "") p = input.value.length;
		}
		return p;
	}
	var getSelectionEnd=function()
        {
		var p = 0;
                try{input.focus();}catch(e){}
		if(input.selectionEnd !== undefined)
                {
			p=input.selectionEnd;
		} else if(document.selection)
                {
			var r = document.selection.createRange().duplicate();
			r.moveStart("character", -input.value.length);
			p = r.text.length;
		}
		return p;
	}
        var setCursorPos = function(pos)
        {
		try{input.focus();}catch(e){}
		if(input.setSelectionRange)
                {
			input.setSelectionRange(pos, pos);
		} else if(input.createTextRange)
                {
			var r = input.createTextRange();
			r.moveStart("character", pos);
			r.moveEnd("character", pos+1);
			r.collapse();
			r.select();
		}
	}
        var setControlValueMask = function(value)
        {
            input.value = value;
        }
        var getControlValueMask = function()
        {
            var res = D3Api.getControlPropertyByDom(control, maskParams.maskProperty, true);
            if (D3Api.empty(res))
                res = '';
            return res;
        }

        maskParamsInit(maskParams,control);

        D3Api.addEvent(input,'click',onClick);
        D3Api.addEvent(input,'keydown',onKeyDown);
        D3Api.addEvent(input,'keypress',onKeyPress);
        D3Api.addEvent(input,'focus',onFocus);
        D3Api.addEvent(input,'blur',onBlur);
        D3Api.addEvent(input,'paste',onPaste);

        control.D3Base.addEvent('onchange_property', onChangeProperty);
        control.D3Base.addEvent('onget_property', onGetProperty);

        var value = getControlValueMask();
        if(!checkValue(value))
        {
                onBlurError(value);
        }
    }//MaskInit
    function maskParamsInit(maskParams,control)
    {
         if(maskParams.maskOriginal == undefined)
            maskParams.maskOriginal = maskParams.maskTemplate;

        if(maskParams.maskCheckRegular)
            maskParams.maskCheckRegular = new RegExp(maskParams.maskCheckRegular);
        if(maskParams.maskCheckFunction)
            maskParams.maskCheckFunction = control.D3Form.execDomEventFunc(control, {func: maskParams.maskCheckFunction, args: 'value'});

        if(maskParams.maskTemplateRegular)
            maskParams.maskTemplateRegular = new RegExp(maskParams.maskTemplateRegular);
        if(maskParams.maskTemplateFunction)
            maskParams.maskTemplateFunction = control.D3Form.execDomEventFunc(control, {func: maskParams.maskTemplateFunction, args: 'value'});

        if(maskParams.maskTemplate == undefined && maskParams.maskTemplateRegular == undefined && maskParams.maskTemplateFunction == undefined)
        {
            if(maskParams.maskCheckRegular)
                maskParams.maskTemplateRegular = maskParams.maskCheckRegular;
            else if(maskParams.maskCheckFunction)
                maskParams.maskTemplateFunction = maskParams.maskCheckFunction;
        }else if(maskParams.maskTemplate != undefined && maskParams.maskTemplateRegular != undefined && maskParams.maskTemplateFunction != undefined)
        {
            if(maskParams.maskCheckRegular == undefined)
                maskParams.maskCheckRegular = maskParams.maskTemplateRegular;
            if(maskParams.maskCheckFunction == undefined)
                maskParams.maskCheckFunction = maskParams.maskTemplateFunction;
        }
    }
}

D3Api.controlsApi['Mask'] = new D3Api.ControlBaseProperties(D3Api.MaskCtrl);




D3Api.UnitViewCtrl = new function()
{
    this.showSettings = function(id)
    {
        if(D3Api.empty(id)) return;

        D3Api.showForm('System/composition',undefined,{request:{unit:'show_method_cols', composition:'settings', parent_var:'METHOD_ID'}, vars: {METHOD_ID: id}});
    }
}
D3Api.ShowMethodSettingsCtrl = new function()
{
    this.init = function(dom)
    {
        if(D3Api.globalClientData.get('SHOWMETPRIV') != 1)
            D3Api.removeDom(dom);
    }
}

D3Api.controlsApi['ShowMethodSettings'] = new D3Api.ControlBaseProperties(D3Api.ShowMethodSettingsCtrl);
D3Api.CompositionCtrl = new function()
{
    this.init = function(dom)
    {
        if(D3Api.globalClientData.get('COMPPRIV') != 1)
            dom.D3Form.setControlProperty('composition_settings','visible',false);
    }
    this.showSettings = function(id)
    {
        if(D3Api.empty(id)) return;

        D3Api.showForm('System/composition',undefined,{request:{unit:'composition', composition:'settings', parent_var:'COMPOSITION_ID'}, vars: {COMPOSITION_ID: id}});
    }
}

D3Api.controlsApi['CompositionContainer'] = new D3Api.ControlBaseProperties(D3Api.CompositionCtrl);
D3Api.LocateCtrl = new function()
{
    this.init = function(dom)
    {
        dom.D3Locate = {structure: D3Api.getProperty(dom, 'structure', ''), locate: D3Api.getProperty(dom, 'locate', ''), locate_field: D3Api.getProperty(dom, 'locate_field', ''), locate_value: D3Api.getProperty(dom, 'locate_value', ''), primary: D3Api.getProperty(dom, 'primary', '')};
    }
    this.setStructure = function(dom,value)
    {
        //Структура завмисимости датасетов, например: DS1;DS2:DS1:pid=id;DS3:DS2:pid=id:pid2=uid
        //Синтаксис: Master:Detail:varname1[=detail_filed]=master_filed:varname2[=detail_filed]=master_filed:...:varnameN[=detail_filed]=master_filed
        //Master - основной датасет
        //Detail - подчиненный датасет
        //varname - имя переменной в запросе (например если связь parent_field = :pid, то varname - pid)
        //detail_field - поле которое будет использоваться для получения значения(для master_field) и позиционирования мастера
        //master_filed - поле которое является родительским, по этому полю будет происходить обратное позиционирование
        dom.D3Locate.structure = value;
    }
    this.setLocateField = function(dom,value)
    {
        dom.D3Locate.locate_field = value;
    }
    this.setLocateValue = function(dom,value)
    {
        dom.D3Locate.locate_value = value;
    }
    this.setPrimary = function(dom,value)
    {
        dom.D3Locate.primary = value;
    }
    this.setLocate = function(dom,value)
    {
        dom.D3Locate.locate = value;
    }
    this.locate = function(dom)
    {
        dom.D3Form.beginRequest();
        dom.D3Form.sendRequest(D3Api.getProperty(dom,'name'), {type: 'Locate', params: dom.D3Locate});
        dom.D3Form.refreshDataSet(dom.D3Locate.primary, undefined, undefined, false, true, true);
        dom.D3Form.endRequest(true);
    }
}

D3Api.controlsApi['Locate'] = new D3Api.ControlBaseProperties(D3Api.LocateCtrl);
D3Api.controlsApi['Locate']['structure'] = {set: D3Api.LocateCtrl.setStructure};
D3Api.controlsApi['Locate']['locate'] = {set: D3Api.LocateCtrl.setLocate};
D3Api.controlsApi['Locate']['locate_field'] = {set: D3Api.LocateCtrl.setLocateField};
D3Api.controlsApi['Locate']['locate_value'] = {set: D3Api.LocateCtrl.setLocateValue};
D3Api.controlsApi['Locate']['primary'] = {set: D3Api.LocateCtrl.setPrimary};
D3Api.CompleterCtrl = new function()
{
    this.init = function(dom)
    {
        dom.D3Completer = {};
        var ctrls = D3Api.getProperty(dom, 'controls', '');

        if(ctrls == '')
            return false;

        ctrls = ctrls.split(';');
        var input = null;
        for(var i = 0, c = ctrls.length; i < c; i++)
        {
            input = dom.D3Form.getControlProperty(ctrls[i], 'input');

            if (!input) {
                var domParent = dom.parentElement;

                while (domParent.parentElement) {
                    domParent = domParent.parentElement;
                }

                dom.D3Form.closureContext(domParent);
                input = dom.D3Form.getControlProperty(ctrls[i], 'input');
                dom.D3Form.unClosureContext();
            }

            if (input) {
                D3Api.addEvent(input,'keyup',function(ctrl){return function(event){onKeyUp(event,dom,ctrl)}}(dom.D3Form.getControl(ctrls[i])));
                D3Api.addEvent(input,'keydown',function(event){onKeyDown(event,dom)},true);
            }
        }
        dom.D3Completer.controls = ctrls;
        dom.D3Completer.setdata = D3Api.getProperty(dom, 'setdata', null);
        if(dom.D3Completer.setdata != null)
        {
            var sd = dom.D3Completer.setdata.split(';');
            dom.D3Completer.setdata = [];
            for(var i = 0 , c = sd.length; i < c; i++)
            {
                var pf = sd[i].split(':');
                dom.D3Completer.setdata.push({prop: pf[0],field:pf[1]});
            }
        }
        D3Api.BaseCtrl.initEvent(dom,'onselect','data');
        dom.D3Completer.showfiled = D3Api.getProperty(dom, 'showfield', '');
        dom.D3Completer.dataset = dom.D3Form.getDataSet(D3Api.getProperty(dom,'dataset'));
        dom.D3Completer.maxitems = +D3Api.getProperty(dom,'maxitems',0);
        dom.D3Completer.minlength = +D3Api.getProperty(dom,'minlength',3);
        dom.D3Completer.timeout = +D3Api.getProperty(dom,'timeout',500);
        dom.D3Completer.hintDom = D3Api.getDomByAttr(dom, 'cont', 'hint');
        dom.D3Completer.mask = D3Api.getProperty(dom, 'mask', '%*%');
        dom.D3Completer.timer = null;
        dom.D3Completer.lastValue = input && input.value;
        dom.D3Completer.currentItem = null;
        D3Api.hideDom(dom);
    };
    function onKeyDown(event,dom)
    {
        var input = D3Api.getEventCurrentTarget(event);
        if(D3Api.showedDom(dom))
        {
            //38 top
            //40 down
            //13 enter
            var delta = 0;
            switch (event.keyCode)
            {
                    case 9:
                        dom.D3Completer.hideFunc();
                        break;
                    case 38:
                            if(!dom.D3Completer.currentItem)
                            {
                                D3Api.CompleterCtrl.setCurrentItem(dom);
                                return;
                            }
                            if(dom.D3Completer.currentItem.previousSibling)
                                D3Api.CompleterCtrl.setCurrentItem(dom,dom.D3Completer.currentItem.previousSibling);
                        break;
                    case 40:
                            if(!dom.D3Completer.currentItem)
                            {
                                D3Api.CompleterCtrl.setCurrentItem(dom);
                                return;
                            }
                            if(!D3Api.hasProperty(dom.D3Completer.currentItem.nextSibling,'isD3repeater'))
                                D3Api.CompleterCtrl.setCurrentItem(dom,dom.D3Completer.currentItem.nextSibling);
                        break;
                    case 13:
                            if(dom.D3Completer.currentItem)
                            {
                                D3Api.CompleterCtrl.clickItem(dom.D3Completer.currentItem);
                                return;
                            }
                        break;
                    default:
                        break;
            }

        }
    }
    function onKeyUp(event,dom,ctrl)
    {
        if(event.keyCode == 13){
            if(D3Api.getProperty(ctrl, 'keyvalue')){
                clearTimeout(dom.D3Completer.timer);
                dom.style["display"] = "none";
            }
            return;
        }
        var input = D3Api.getEventCurrentTarget(event);
        dom.D3Completer.currentCtrl = ctrl;

        if (input.value.length >= dom.D3Completer.minlength && dom.D3Completer.lastValue != input.value) {
            if(dom.D3Completer.timer)
            {
                clearTimeout(dom.D3Completer.timer);
                dom.D3Completer.timer = null;
            }
            dom.D3Completer.lastValue = input.value;
            dom.D3Completer.timer = setTimeout(function () {
                D3Api.CompleterCtrl.show(dom);
            }, dom.D3Completer.timeout);
            D3Api.CompleterCtrl.setValue(dom, input.value);
        } else if (dom.D3Completer.lastValue != input.value) {
            dom.D3Completer.lastValue = input.value;
            D3Api.hideDom(dom);
        }
    }
    this.show = function(dom)
    {
        dom.D3Form.setVar(D3Api.getProperty(dom,'name'), D3Api.CompleterCtrl.getValue(dom));
        dom.D3Completer.dataset.addEventOnce('onafter_refresh', function () {
            D3Api.CompleterCtrl.afterSetItems(dom);
        });
        dom.D3Form.closureContext(dom.D3Form.getClone(dom));
        dom.D3Completer.dataset.refresh();
        dom.D3Form.unClosureContext();
    };
    this.setItemData = function(item,data,field)
    {
        item.innerHTML = data[field];
    };
    this.setCurrentItem = function(dom,item)
    {
        item = item || D3Api.getDomBy(dom, '.ctrl_completer_item');
        if(dom.D3Completer.currentItem)
            D3Api.removeClass(dom.D3Completer.currentItem,'active');
        if(D3Api.hasProperty(item,'isD3repeater'))
            return;
        dom.D3Completer.currentItem = item;
        D3Api.addClass(dom.D3Completer.currentItem,'active');
    };
    this.clearCurrentItem = function(dom)
    {
        if(!dom.D3Completer.currentItem) return;
        D3Api.removeClass(dom.D3Completer.currentItem,'active');
        dom.D3Completer.currentItem = null;
    };
    this.afterSetItems = function(cmpl)
    {
        //var cmpl = D3Api.getControlByDom(item, 'Completer');

        D3Api.CompleterCtrl.setCurrentItem(cmpl);

        //проверка перхода фокуса на другой компонент
        //нужна так как запрос может выполнится после потери фокуса.
        var activeElement = D3Api.getControlByDom(document.activeElement);

        if (cmpl.D3Completer.currentCtrl !== activeElement) {
            D3Api.hideDom(cmpl);
            return;
        }

        if(cmpl.D3Completer.dataset.getCount()<=0)
        {
            D3Api.hideDom(cmpl);
            //return;
        }
        if(cmpl.D3Completer.maxitems > 0 && cmpl.D3Completer.dataset.getCount() > cmpl.D3Completer.maxitems)
            D3Api.showDomBlock(cmpl.D3Completer.hintDom);
        else
            D3Api.hideDom(cmpl.D3Completer.hintDom);

        D3Api.hideDom(cmpl);
        var sX = D3Api.getBodyScrollLeft();
        var sY = D3Api.getBodyScrollTop();

        var page = D3Api.getPageWindowSize();

        //var ctrl = cmpl.D3Form.getControl(cmpl.D3Completer.currentCtrl);
        var ctrl = cmpl.D3Completer.currentCtrl;
        cmpl.style["minWidth"] = (ctrl.offsetWidth-2) + "px";
        cmpl.style["width"] = 'auto';

        var cb_rect = D3Api.getAbsoluteClientRect(ctrl);

        cmpl.style.height = "";

        D3Api.showDomBlock(cmpl);

        var drop_rect = D3Api.getAbsoluteClientRect(cmpl);
        drop_rect.x = cb_rect.x;
        drop_rect.y = cb_rect.y+cb_rect.height;

        var h = page.windowHeight+sY;
        var w = page.windowWidth+sX;

        //Растояние внизу окна
        var dH = h - drop_rect.y;
        //Растояние вверху окна
        var uH = cb_rect.y - sY;

        var mcY = drop_rect.y+drop_rect.height;
        var mcX = drop_rect.x+drop_rect.width;

        if (mcY-h > 0)
        {
            //Если выходит за нижний край
            if(dH > uH)
                drop_rect.height = dH;
            else
            {
                if(drop_rect.height > uH)
                    drop_rect.height = uH;
                drop_rect.y -=drop_rect.height+cb_rect.height;
            }

        }

        if (mcX-w > 0)
            drop_rect.x -=mcX-w;

        cmpl.style.height = drop_rect.height +'px';
        cmpl.style.width = drop_rect.width+'px';

        cmpl.style.left = drop_rect.x +'px';
        cmpl.style.top = drop_rect.y+'px';

        if(cmpl.D3Completer.hideFunc)
            return;

        cmpl.D3Completer.hideFunc = function(event)
        {
            D3Api.hideDom(cmpl);
            D3Api.removeEvent(document,"click",cmpl.D3Completer.hideFunc,true);
            cmpl.D3Completer.hideFunc = null;
            if(event)
                D3Api.stopEvent(event);
        };

        D3Api.addEvent(document,"click",cmpl.D3Completer.hideFunc,true);

    };
    this.clickItem = function(item)
    {
        var cmpl = D3Api.getControlByDom(item, 'Completer');
        if(!cmpl || !cmpl.D3Completer.currentCtrl)
            return;
        if(cmpl.D3Completer.setdata == null)
        {
            D3Api.setControlPropertyByDom(cmpl.D3Completer.currentCtrl,'value',item.clone.data[cmpl.D3Completer.showfiled],undefined,true);
        }else
        {
            for(var id = 0, cd = cmpl.D3Completer.setdata.length; id < cd; id++)
            {
                cmpl.D3Completer.currentCtrl.D3Store._alreadyValidValue = true;
                D3Api.setControlPropertyByDom(cmpl.D3Completer.currentCtrl,cmpl.D3Completer.setdata[id].prop,item.clone.data[cmpl.D3Completer.setdata[id].field],undefined,true);
            }
        }
        cmpl.D3Base.callEvent('onselect',item.clone.data);
        cmpl.D3Completer.hideFunc();
    };
    this.setValue = function(dom,value)
    {
        D3Api.setProperty(dom, 'keyvalue', (dom.D3Completer.mask)?dom.D3Completer.mask.replace('*',value):value);
    };
    this.getValue = function(dom)
    {
        return D3Api.getProperty(dom, 'keyvalue');
    }
};

D3Api.controlsApi['Completer'] = new D3Api.ControlBaseProperties(D3Api.CompleterCtrl);
D3Api.controlsApi['Completer']['value'] = {get: D3Api.CompleterCtrl.getValue, set: D3Api.CompleterCtrl.setValue};

D3Api.StatGridCtrl = new function()
{
    this.cellsCount = 0;
    this.init = function StatGridCtrl_OnCreate(dom)
    {
        var row = D3Api.getDomByAttr(dom, 'cont', 'statgridrow');
        dom.D3StatGrid = {groups: [],groupCols: {}, summ: {}, haveSumm: false};
        dom.D3Store.row = row;
        dom.D3Store.rowTpl = row.D3Repeater;
        dom.D3Store.rowTpl.setTargetDom();
        D3Api.StatGridCtrl.cellsCount = dom.D3Store.rowTpl.DOM.cells.length;
        D3Api.showDom(dom.D3Store.rowTpl.DOM, true);
        D3Api.addClass(dom.D3Store.rowTpl.DOM, 'lasttr');
        dom.D3Store.rowTpl.addEvent('onafter_clone',function(data,clone){
            D3Api.removeClass(clone, 'lasttr');
        });
        dom.D3Store.rootDom = dom.D3Store.rowTpl.targetDOM.parentNode;
        this.init_focus(dom);
        D3Api.BaseCtrl.initEvent(dom,'onchange');

        var summs = D3Api.getAllDomBy(dom, '[summ_type]');
        var ind,capDom;

        for(var i = 0, c = summs.length; i < c; i++)
        {
            ind = D3Api.getProperty(summs[i], 'index');
            capDom = D3Api.getDomBy(dom, '[cont="statgridcolumns"] [index="'+ind+'"] td.caption');
            dom.D3StatGrid.summ[ind] = dom.D3StatGrid.summ[ind] || [];
            dom.D3StatGrid.summ[ind].push(
            {
                caption: D3Api.getProperty(summs[i],'summ_caption',(capDom)?D3Api.getTextContent(capDom):''),
                field: D3Api.getProperty(summs[i], 'field'),
                type: D3Api.getProperty(summs[i], 'summ_type'),
                before: D3Api.getProperty(summs[i], 'summ_before',''),
                after: D3Api.getProperty(summs[i], 'summ_after',''),
                fixed: D3Api.getProperty(summs[i], 'summ_fixed','')
            });
            dom.D3StatGrid.haveSumm = true;
        }
        dom.D3Store.cols = [];
        dom.D3Store.currentGroupField = '';
        dom.D3Store.keyField = D3Api.getProperty(dom,'keyfield');
        dom.D3Store.dataSetName = D3Api.getProperty(dom, 'dataset', '');
        dom.D3Store.dataSet = dom.D3Form.getDataSet(dom.D3Store.dataSetName);
        dom.D3Store.dataCont = D3Api.getDomByAttr(dom, 'cont', 'statgriddatacont');
        dom.D3Store.excel = D3Api.getBoolean(D3Api.getProperty(dom, 'excel', 'false'));
        dom.D3Store.useActiveRow = D3Api.getBoolean(D3Api.getProperty(dom, 'activerow', 'false'));
        dom.D3Store.popupMenu = D3Api.getProperty(dom, 'popupmenu') || D3Api.getProperty(dom, 'popupmenu_actions');
        dom.D3Store.show_selectcount = D3Api.getBoolean(D3Api.getProperty(dom,'show_selectcount','false'));
        if(dom.D3Store.show_selectcount && dom.D3Form.controlExist(D3Api.getProperty(dom,'name')+'_SelectList'))
        {
            var ftr_txt = D3Api.getDomByAttr(dom, 'cont', 'statgridfootertext');
            ftr_txt.innerHTML = 'Отмечено: 0';
            dom.D3Form.addControlEvent(D3Api.getProperty(dom,'name')+'_SelectList','onupdate',function(){
                ftr_txt.innerHTML = 'Отмечено: '+this.D3SelectList.values_count;
            });
        }

        dom.D3Store._conts_ = {};
        dom.D3Store._conts_.data = D3Api.getDomByAttr(dom, 'cont', 'statgriddata');
        dom.D3Store._conts_.datacont = D3Api.getDomByAttr(dom, 'cont', 'statgriddatacont');
        dom.D3Store._conts_.columns = D3Api.getDomByAttr(dom, 'cont', 'statgridcolumns');
        dom.D3Store._conts_.columnscont = D3Api.getDomByAttr(dom, 'cont', 'statgridcolumnscont');
        dom.D3Store._conts_.filters = D3Api.getDomByAttr(dom, 'cont', 'statgridfilter');
        dom.D3Store._conts_.filterpanel = D3Api.getDomByAttr(dom, 'cont', 'statgridfilterpanel');
        dom.D3Store.repeaterName = D3Api.BaseCtrl.getName(dom) + '_repeater';

        var statgriddatainfo = D3Api.getDomByAttr(dom, 'cont', 'statgriddatainfo');
        var showfilter = D3Api.getProperty(dom, 'showfilter', 'false') != 'false';

        if (statgriddatainfo && dom.D3Store.dataSet) {
            var repeater = dom.D3Form.getRepeater(dom.D3Store.repeaterName);

            if (dom.D3Store._conts_.filters && showfilter) {
                D3Api.addTextNode(statgriddatainfo, 'Необходимо установить фильтр', true);
                D3Api.showDomBlock(statgriddatainfo);
            }

            dom.D3Store.dataSet.addEvent('onbefore_refresh', function () {
                if (repeater.clones().length > 0) {
                    return;
                }
                D3Api.addTextNode(statgriddatainfo, 'В ожидании...', true);
                D3Api.showDomBlock(statgriddatainfo);
            });
            dom.D3Store.dataSet.addEvent('onafter_refresh', function () {
                if (repeater.clones().length > 0) {
                    D3Api.setDomDisplayDefault(statgriddatainfo);
                } else {
                    D3Api.addTextNode(statgriddatainfo, 'Нет данных', true);
                    D3Api.showDomBlock(statgriddatainfo);
                }
            });
            repeater.addEvent('onafter_clone', function () {
                D3Api.setDomDisplayDefault(statgriddatainfo);
            });
        }
        var cols = D3Api.getAllDomBy(dom.D3Store._conts_.columns, 'td[column_name]');
        for (var i = 0, c = cols.length; i < c; i++) {
            var f = D3Api.getProperty(cols[i], 'cont');
            var colInfo = {
                name: D3Api.getProperty(cols[i], 'column_name'),
                field: f,
                caption: D3Api.getTextContent(cols[i]),
                align: undefined,
                doms: [],
                defaultShow: true,
                SortOrder:'',
                _show: true,
                Summary:[],
                Grouped:0
            };
            var cls = D3Api.getAllDomBy(dom, '[column_name="' + colInfo.name + '"][index]');
            for (var ii = 0, cc = cls.length; ii < cc; ii++) {
                if(cls[ii].nodeName == 'COL'){
                    colInfo.width = cls[ii].width;
                    colInfo.defaultShow = D3Api.getProperty(cls[ii], 'profile_hidden', '') != 'true';
                }
                else if(cls[ii].nodeName == 'TD' && D3Api.hasClass(cls[ii], 'column_data')){
                    colInfo.align = cls[ii].style.textAlign;
                }
                colInfo.doms.push({parentNode: cls[ii].parentNode, col: cls[ii]});
            }
            dom.D3Store.cols.push(colInfo);
        }
        var pM,pMAPI;
        pM = pM || dom.D3Form.getControl(dom.D3Store.popupMenu);
        if(pM)
        {
            pMAPI = pMAPI || D3Api.getControlAPIByDom(pM);
            var items = pMAPI.getItems(pM,true);
            var itemsSeparators = pMAPI.getItems(pM,true,true);
            if(items.length - itemsSeparators.length == 0)
            {
                var componentname = D3Api.getProperty(dom,'name',false);
                var refAction = '';
                if(componentname)
                    refAction += 'setControlProperty(\''+componentname+'\', \'locate\', getValue(\''+componentname+'\'));';
                refAction += 'refreshDataSet(\''+dom.D3Store.dataSetName+'\');';
                pMAPI.addItem(pM,{name:dom.D3Store.profilePM, onclick: refAction, caption: 'Обновить'},null,null,true);
            }
        }

        if(dom.D3Store.excel)
        {
            pM = pM || dom.D3Form.getControl(dom.D3Store.popupMenu);
            pMAPI = pMAPI || D3Api.getControlAPIByDom(pM);
            var items = pMAPI.getItems(pM,true);
            pMAPI.addItem(pM,{caption: 'Выгрузить в Excel', onclick: 'D3Api.StatGridCtrl.exportXLS(getControl(\''+dom.D3Store.popupMenu+'\').D3Store.popupObject);'}, null, 'system');
        }
        dom.D3Form.getDataSet(dom.D3Store.dataSetName).addEvent(
            'onbefore_refresh',
            function()
            {
                if(dom.D3Store.currentGroupField !== undefined)
                {
                    if(!dom.D3Store.currentGroupField && dom.D3StatGrid.groups[0] && dom.D3StatGrid.groups[0].field)
                        dom.D3Store.currentGroupField = dom.D3StatGrid.groups[0].field;
                    else if(!dom.D3Store.currentGroupField)
                        dom.D3Store.currentGroupField = undefined;

                    if(dom.D3Store.currentGroupField)
                    {
                        for(var ind in dom.D3StatGrid.summ)
                        {
                            if(!dom.D3StatGrid.summ.hasOwnProperty(ind)){
                                continue;
                            }
                            for(var i = 0, c = dom.D3StatGrid.summ[ind].length; i < c; i++)
                                dom.D3Store.dataSet.addGroupSumm(dom.D3StatGrid.summ[ind][i].field, dom.D3StatGrid.summ[ind][i].type, dom.D3StatGrid.summ[ind][i].fixed);
                        }
                        this.addGroup(dom.D3Store.currentGroupField);
                    }
                }else if(!dom.D3Store.currentParent)
                    dom.D3StatGrid.loadedSumm = false;

            }
        );
        if(dom.D3Store._conts_.filters)
        {
            if (showfilter) {
                D3Api.StatGridCtrl.toggleFilter(dom);
            }
            D3Api.StatGridCtrl.activateFilter(dom);
        }else
            dom.D3Form.refreshDataSet(dom.D3Store.dataSetName);

    }
    this.openProfile = function(dom)
    {
        var statgrid = D3Api.getControlByDom(dom, 'StatGrid');
        var pcont = D3Api.getDomByAttr(statgrid, 'cont', 'grid_params_cont');
        if(pcont.D3Container && pcont.D3Container.currentForm)
            return;
        //Получим параметры
        var statgridname = D3Api.getProperty(statgrid, 'name');
        var params = statgrid.D3Form.getParamsByName('StatGrid', statgridname);
        var range;
        if(statgrid.D3Store.range){
            range = statgrid.D3Store.range.D3Range.amount;
        }
        // параметры для CustomFilter-а по-умолчанию
        var params_cf = statgrid.D3Form.getParamsByName('CustomFilter', 'cf_' + statgridname);
        params_cf.dataset = statgrid.D3Store.dataSetName;
        if(params.profiles instanceof Array){
            params.profiles = {};
        }
        D3Api.showDomBlock(pcont);
        /** для D3 проектов не подоганял.**/
        D3Api.showForm('Components/GridTree/params', null, {
            modal_form: true,
            vars: {
                formhash: statgrid.D3Form.getFormParamsHash(),
                componentname: statgridname,
                data: params,
                range: range,
                data_cf: params_cf,
                cols: statgrid.D3Store.cols,
                element: statgrid,
                typeComponent: 'StatGrid'
            },
            onclose: function (res){
                statgrid.D3Form.setValue('cf_' + statgridname, params_cf);
                D3Api.setDomDisplayDefault(pcont);
                if(!res) return;
                D3Api.StatGridCtrl.setProfile(statgrid);
            }
        });
    }

    this._getDefaultParams = function (){
        return {
            profiles: {
                /*
                 * profile: {
                 *      cols : {
                 *          name: {
                 *              order: 0,
                 *              show: true,
                 *              width: 100,
                 *              align: 'left'
                 *          }
                 *      }
                 * }
                 */
            },   //Профили
            profile: ''     //Выбранный профиль
        };
    };
    this.stopPopup = function (e){
        var evt = D3Api.getEvent(e);

        if((evt.button && evt.button == 2) || (evt.which && evt.which == 3)){
            D3Api.stopEvent(e);
        }
    };
    function hideColDoms(col){
        for (var i = 0, c = col.doms.length; i < c; i++) {
            if(col.doms[i].col.nodeName === 'TD' && D3Api.getProperty(col.doms[i].col, 'keep')){
                D3Api.addDom(col.doms[i].parentNode, col.doms[i].col);
                D3Api.hideDom(col.doms[i].col);
                D3Api.setProperty(col.doms[i].col, 'hidden', 'true');
            }else
                D3Api.removeDom(col.doms[i].col);
        }
        col._show = false;
    };

    function hideAllColDoms(cols){
        for (var i = 0, c = cols.length; i < c; i++) {
            hideColDoms(cols[i])
        }
    };
    function showAllColDoms(cols){
        for (var i = 0, c = cols.length; i < c; i++) {
            showColDoms(cols[i])
        }
    }

    function showColDoms(col, params){
        for (var i = 0, c = col.doms.length; i < c; i++) {
            if(!params && !col.defaultShow)
                continue;

            var beforeDom = null;
            if(col.doms[i].col.nodeName === 'TD'){
                var beforeDom = D3Api.getDomByAttr(col.doms[i].parentNode, 'hidden', 'true');
            }

            if(beforeDom)
                D3Api.insertBeforeDom(beforeDom, col.doms[i].col);
            else
                D3Api.addDom(col.doms[i].parentNode, col.doms[i].col);

            if(D3Api.getProperty(col.doms[i].col, 'keep')){
                D3Api.setDomDisplayDefault(col.doms[i].col);
                D3Api.removeProperty(col.doms[i].col, 'hidden');
            }
            if(col.doms[i].col.nodeName === 'COL')
                col.doms[i].col.width = (!params || params.width === undefined) ? col.width : params.width;
            else if(D3Api.hasClass(col.doms[i].col, 'column_data') || D3Api.hasClass(col.doms[i].col, 'grid__wf-column'))
                col.doms[i].col.style.textAlign = (!params || params.align === undefined) ? col.align : params.align;
        }
        col._show = true;
    }

    function generateMenuProfiles(dom, profile){
        var gName = D3Api.getProperty(dom, 'name');
        var params = dom.D3Form.getParamsByName('StatGrid', gName);
        if(params.profiles instanceof Array){
            params.profiles = {};
        }
        profile = profile || params.profile;
        var pM = dom.D3Form.getControl(dom.D3Store.popupMenu);
        var pMAPI = D3Api.getControlAPIByDom(pM);
        var items = pMAPI.getItems(dom.D3Store.profilePMItem);
        for (var i = 0, c = items.length - 1; i < c; i++) {
            pMAPI.deleteItem(pM, items[i]);
        }
        var sortP = [];
        for (var p in params.profiles) {
            if(params.profiles.hasOwnProperty(p)){
                sortP.push(p);
            }
        }
        sortP.sort();
        var sp = false;
        for (var i = 0, c = sortP.length; i < c; i++) {
            var p = sortP[i];
            sp = true;
            var pj = p;
            pj = pj.split('"').join('&quot;').split("'").join("\\'");
            var item = pMAPI.addItem(pM, {
                onclick: 'D3Api.StatGridCtrl.setProfile(getControl(\'' + gName + '\'),\'' + pj + '\',true,false);D3Api.addClass(this, \'statgrid_profile_active_item\');D3Api.setControlPropertyByDom(this,\'icon\',\'~CmpGrid/arrow_right\');',
                caption: p
            }, dom.D3Store.profilePMItem);
            if(p == profile){
                D3Api.addClass(item, 'statgrid_profile_active_item');
                D3Api.setControlPropertyByDom(item, 'icon', '~CmpGrid/arrow_right');
            }
        }
        if(sp){
            pMAPI.addItem(pM, {caption: '-'}, dom.D3Store.profilePMItem);
        }
        pMAPI.addItemDom(pM, items[items.length - 1], dom.D3Store.profilePMItem);
    }
    this.setProfile = function (dom, profile, refresh, genmenu){
        var statgrid = D3Api.getControlByDom(dom, 'StatGrid');
        var isRefresh = false;
        genmenu = genmenu === undefined || genmenu;
        var gName = D3Api.getProperty(dom, 'name');
        var params = dom.D3Form.getParamsByName('StatGrid', gName);
        if(params.profiles instanceof Array)
            params.profiles = {};
        profile = profile || params.profile || 'По умолчанию';
        params.profile = profile.replace(/&quot;/g, '"');
        if(genmenu){
            generateMenuProfiles(dom, profile);
        }else{
            var item = D3Api.getDomBy(dom.D3Store.profilePMItem, '[class*="statgrid_profile_active_item"]');
            if(item){
                D3Api.removeClass(item, 'statgrid_profile_active_item');
                D3Api.setControlPropertyByDom(item, 'icon', '');
            }
        }
        dom.D3Store.currentProfile = profile;
        profile = params.profiles[profile];
        if(!profile){
            hideAllColDoms(dom.D3Store.cols);
            showAllColDoms(dom.D3Store.cols);
            dom.D3Store.currentProfile = '';
        }else{
            var order = [];
            var orderTmp = [];
            isRefresh = dom.D3StatGrid.groups.length > 0;
            for(var i = 0 ; i < dom.D3StatGrid.groups.length ; i++){
                if(profile.cols[dom.D3StatGrid.groups[i].field].show == '0'){
                    D3Api.StatGridCtrl.delGroupField(dom,dom.D3StatGrid.groups[i].field,false);
                }
            }
            if(profile.cols){
                for (var prop in profile.cols) {
                    if(profile.cols.hasOwnProperty(prop)){
                        orderTmp[profile.cols[prop].order] = {name: prop, show: profile.cols[prop].show, colsAfter: []};
                    }
                }

                var fieldBefore = '';
                for (var i = 0, c = dom.D3Store.cols.length; i < c; i++) {
                    var cl = dom.D3Store.cols[i];
                    var found = false;
                    /* ищем есть ли она в профиле */
                    for (var i1 = 0, c1 = orderTmp.length; i1 < c1; i1++) {
                        if(orderTmp[i1] && orderTmp[i1].name == cl.name){
                            orderTmp[i1].index = i;
                            found = true;
                        }
                    }
                    if(found){
                        fieldBefore = cl.name;
                    }
                    else{
                        if(fieldBefore == ''){ /* если разработчик поставил ее в самое начало */
                            orderTmp[-1] = {name: cl.name, show: 1, index: i, colsAfter: []}
                        }
                        else{
                            /* ищем предыдущую колонку */
                            for (var i1 = -1, c1 = orderTmp.length; i1 <= c1; i1++) {
                                if(orderTmp[i1] && orderTmp[i1].name == fieldBefore){
                                    orderTmp[i1].colsAfter.push(i);
                                }
                            }
                        }
                    }
                    hideColDoms(cl)
                }
                var grs = dom.D3StatGrid.groups;
                /* формируем правильный порядок */
                for (var i = -1, c = orderTmp.length; i <= c; i++) {
                    if(orderTmp[i] === undefined){
                        continue;
                    }
                    if(orderTmp[i] && orderTmp[i].show == 1 && orderTmp[i].index >= 0){
                        var isGrouping = false;
                        /** ищем все поля группируемых полей **/
                        for(var j = 0;grs && j < grs.length;j++){
                            if(grs[j].field == orderTmp[i].name){
                                isGrouping = true;
                                break;
                            }
                        }
                        if(!isGrouping){
                            order.push(orderTmp[i].index);
                        }
                    }
                    if(orderTmp[i].colsAfter && orderTmp[i].colsAfter.length > 0){
                        for (var i1 = 0, c1 = orderTmp[i].colsAfter.length; i1 < c1; i1++) {
                            order.push(orderTmp[i].colsAfter[i1]);
                        }
                    }
                }
            }

            for (var i = 0, c = order.length; i < c; i++) {
                if(order[i] === undefined){
                    continue;
                }

                dom.D3Store.cols[order[i]]._order = i;
                showColDoms(dom.D3Store.cols[order[i]], (profile && profile.cols) ? profile.cols[dom.D3Store.cols[order[i]].name] : undefined);
            }
            var cols = D3Api.getAllDomBy(dom.D3Store._conts_.columns, 'col[fcol]');
            var colWidth = 0;
            var emptyCols = [];
            for (var i = 0, c = cols.length; i < c; i++) {
                colWidth += +cols[i].width;
                if(+cols[i].width <= 0)
                    emptyCols.push(D3Api.getProperty(cols[i], 'fcol'));
            }
            if(dom.D3Store._conts_.datacont.clientWidth < colWidth && emptyCols.length > 0){
                for (var i = 0, c = emptyCols.length; i < c; i++) {
                    var ecols = D3Api.getAllDomBy(dom, 'col[fcol="' + emptyCols[i] + '"]');
                    for (var j = 0, l = ecols.length; j < l; j++) {
                        ecols[j].width = 100;
                    }
                }
            }
        }
        if(profile && profile.amount){
            if(dom.D3Store.range && dom.D3Store.range.D3Range){
                if(dom.D3Store.range.D3Range.amount != profile.amount){
                    dom.D3Form.callControlMethod(dom.D3Store.range, 'amount', profile.amount);
                    refresh = false;
                }
            }else if(dom.D3Store.range){
                D3Api.setProperty(dom.D3Store.range, 'default_amount', profile.amount);
                refresh = false;
            }
        }
        if(refresh === undefined || refresh){
            dom.D3Form.getRepeater(dom.D3Store.repeaterName).repeat(true, dom);
        }
        dom.D3Form.saveParams();
        dom.D3Base.callEvent('onprofile_change', params.profile)

        if(isRefresh)
            D3Api.StatGridCtrl.refreshData(statgrid);
    };
    this.onShow = function StatGridCtrl_OnShow(dom)
    {
        var dna = [];
        var pn = dom;
        while(pn && pn.nodeName != '#document')
        {
            if (pn.style.display == 'none')
            {
                pn.style.display = '';
                dna.push(pn);
            }
            pn = pn.parentNode;
        }

        D3Api.StatGridCtrl.resize(dom);
        D3Api.addEvent(dom.D3Store._conts_.datacont,'scroll',function(){D3Api.StatGridCtrl.resize(dom)},true);
        dom.D3Form.addEvent('onResize',function(){D3Api.StatGridCtrl.resize(dom)});

        for(var i=0; i<dna.length; i++)
        {
            dna[i].style.display = 'none';
        }
        dna = null;
    }
    this.resize = function(dom)
    {
        dom.D3Store._conts_.columns.style.width = (dom.D3Store._conts_.data.offsetWidth+18)+'px';
        dom.D3Store._conts_.columns.style.tableLayout = 'fixed';
        dom.D3Store._conts_.columnscont.scrollLeft = dom.D3Store._conts_.datacont.scrollLeft;
        if(dom.D3Store._conts_.filters)
        {
            dom.D3Store._conts_.filters.style.width = dom.D3Store._conts_.data.offsetWidth+'px';
            dom.D3Store._conts_.filters.style.top = dom.D3Store._conts_.datacont.scrollTop+'px';
            dom.D3Store._conts_.filterpanel.style.left = dom.D3Store._conts_.datacont.scrollLeft + 'px';
            dom.D3Store._conts_.filterpanel.style.width = dom.D3Store._conts_.datacont.clientWidth+'px';
        }
    }
    this.addGroupField = function(dom,field,index,refresh)
    {
        var statgrid = D3Api.getControlByDom(dom, 'StatGrid');
        if (statgrid.D3StatGrid.groups.length >= D3Api.StatGridCtrl.cellsCount - 1) {
            D3Api.notify('Сообщение', 'Нельзя осуществить группировку по последней колонке', 2000);
            return;
        }
        D3Api.showDom(statgrid.D3Store.dataCont,false);

        statgrid.D3StatGrid.groups.push({field: field, caption: D3Api.getTextContent(dom)});

        var cols = D3Api.getAllDomBy(statgrid, '[cont="'+field+'"]');

        statgrid.D3StatGrid.groupCols[field] = {cellIndex: index, cols: []};
        var newCol;
        for(var i = 0, c = cols.length; i < c; i++)
        {
            var newCol = document.createElement(cols[i].tagName);
            newCol.width = 10;
            newCol.className = 'groupcell';
            if(cols[i].tagName.toLowerCase() == 'td')
                newCol.innerHTML = '&nbsp;';
            D3Api.setProperty(newCol,'cont','groupcell');
            cols[i].parentNode.insertBefore(newCol, cols[i].parentNode.firstChild);
            statgrid.D3StatGrid.groupCols[field].cols.push({parent: cols[i].parentNode, col: cols[i]});
            D3Api.removeDom(cols[i]);
        }

        D3Api.StatGridCtrl.renderGroup(statgrid);
        statgrid.D3Store.currentGroupField = '';
        if(refresh)
            D3Api.StatGridCtrl.refreshData(statgrid);
        D3Api.StatGridCtrl.resize(statgrid);
    }
    this.delGroupField = function(dom,field,refresh)
    {
        var statgrid = D3Api.getControlByDom(dom, 'StatGrid');

        D3Api.showDom(statgrid.D3Store.dataCont,false);

        var index = statgrid.D3StatGrid.groupCols[field].cellIndex;
        var cols = statgrid.D3StatGrid.groupCols[field].cols;

        for(var i = 0, c = cols.length; i < c; i++)
        {
            var child = cols[i].parent.childNodes[index];
            while(child && (D3Api.getProperty(child,'cont',false) == 'groupcell' || (index - D3Api.getProperty(child,'index')) > 0 ))
                child = child.nextSibling;
            if(!child)
                child = cols[i].parent.lastChild;

            if(D3Api.getProperty(child,'cont',false) == 'groupcell')
            {
                cols[i].parent.replaceChild(cols[i].col, child);
            }else
            {
                D3Api.removeDom(cols[i].parent.firstChild);
                if(+D3Api.getProperty(child,'index') > +index)
                    cols[i].parent.insertBefore(cols[i].col, child);
                else
                    cols[i].parent.appendChild(cols[i].col);
            }
        }
        D3Api.StatGridCtrl.renderGroup(statgrid,field);
        statgrid.D3Store.currentGroupField = '';
        if(refresh)
            D3Api.StatGridCtrl.refreshData(statgrid);
        D3Api.StatGridCtrl.resize(statgrid);
    }
    this.renderGroup = function(dom,delField)
    {
        if(dom.D3StatGrid.groups.length <= 0 || (dom.D3StatGrid.groups.length == 1 && delField == dom.D3StatGrid.groups[0].field))
        {
            dom.D3StatGrid.groups = [];
            D3Api.removeClass(dom,'withgroups');
            return;
        }
        D3Api.addClass(dom,'withgroups');
        var gr = D3Api.getDomByAttr(dom, 'cont', 'statgridgroups');
        var grInfo = [];
        var grDelIndex = null;
        for(var i = 0, c = dom.D3StatGrid.groups.length; i < c; i++)
        {
            if(delField && delField == dom.D3StatGrid.groups[i].field)
            {
                grDelIndex = i;
                continue;
            }
            grInfo.push('<div class="groupfield" onclick="D3Api.StatGridCtrl.delGroupField(this,\''+dom.D3StatGrid.groups[i].field+'\',true)">'+dom.D3StatGrid.groups[i].caption+'</div>');
        }
        gr.innerHTML = 'Группировка: '+grInfo.join('->');

        D3Api.addClass(dom,'withgroups');
        if(grDelIndex!==null)
            dom.D3StatGrid.groups.splice(grDelIndex,1);
    }
    this.refreshData = function(dom)
    {
        dom.D3Form.refreshDataSet(dom.D3Store.dataSetName);
    }
    this.setStatGridData = function StatGridCtrl_SetStatGridData(dom,data)
    {
        if(dom.D3Store.currentGroupSummData)
        {
            var itogo = [];
            var col = [];
            for(var ind in dom.D3StatGrid.summ)
            {
                if(!dom.D3StatGrid.summ.hasOwnProperty(ind)){
                    continue;
                }
                col = [];
                for(var i = 0, c = dom.D3StatGrid.summ[ind].length; i < c; i++)
                    col.push(dom.D3StatGrid.summ[ind][i].before + (data[0][dom.D3StatGrid.summ[ind][i].type+'_'+dom.D3StatGrid.summ[ind][i].field] || '0') + dom.D3StatGrid.summ[ind][i].after);
                itogo.push(((dom.D3StatGrid.summ[ind][0].caption)?dom.D3StatGrid.summ[ind][0].caption+': ':'') + col.join(', '));
            }
            var ftr = D3Api.getDomByAttr(dom, 'cont', 'statgridfootersumm');
            ftr.innerHTML = 'Всего: '+data[0]['_cnt_']+((itogo.length>0)?' ИТОГО: '+itogo.join('; '):'');

            dom.D3StatGrid.loadedSumm = true;
            dom.D3Store.currentGroupSummData = false;
            D3Api.StatGridCtrl.resize(dom);
            return;
        }
        dom.D3Store.currentGroupSummData = false;
        if(dom.D3StatGrid.groups.length > 0 && dom.D3Store.currentGroupField == dom.D3StatGrid.groups[0].field)
        {
            var rows = D3Api.getAllDomBy(dom, '[cont="grouprow"]');
            for(var i = 0, c = rows.length; i < c; i++)
            {
                D3Api.removeDom(rows[i]);
            }
            dom.D3Store.rowTpl.removeAllClones();
        }else if(dom.D3StatGrid.groups.length == 0)
        {
            var rows = D3Api.getAllDomBy(dom, '[cont="grouprow"]');
            for(var i = 0, c = rows.length; i < c; i++)
            {
                D3Api.removeDom(rows[i]);
            }
            dom.D3Store.rowTpl.removeAllClones();
        }else if(!dom.D3Store.currentParent)
        {
            dom.D3Store.currentGroupField = dom.D3StatGrid.groups[0].field;
            this.refreshData(dom);
            return;
        }
        var allRows = 0;
        if(dom.D3Store.currentGroupField === undefined)//Данные
        {
            var keyParentUid = '';
            if(dom.D3Store.currentParent)
            {
                dom.D3Store.rootDom.insertBefore(dom.D3Store.rowTpl.targetDOM,dom.D3Store.currentParent.nextSibling);
                keyParentUid = D3Api.getUniqId('guid');
                D3Api.setProperty(dom.D3Store.currentParent,'groupuid',keyParentUid);
            }
            dom.D3Store.currentFirstRow = null;
            for(var i = 0, c = data.length; i < c; i++)
            {
                var clone = dom.D3Store.rowTpl.addClone(data[i]);
                if(!dom.D3Store.currentFirstRow)
                    dom.D3Store.currentFirstRow = clone;
                D3Api.setProperty(clone,'groupkeyparentuid',keyParentUid);
            }
            //Итоги
            if(dom.D3Store.currentParent && dom.D3StatGrid.haveSumm)
            {
                var clone = dom.D3Store.rowTpl.addClone({});
                D3Api.addClass(clone, 'groupsumm');
                D3Api.removeProperty(clone, 'cmptype');
                D3Api.removeProperty(clone, 'onmousedown');
                D3Api.setProperty(clone,'groupkeyparentuid',keyParentUid);
                var ind,itgcol;
                for(var i = 0, c = clone.cells.length; i < c; i++)
                {
                    var sl = D3Api.getDomByAttr(clone.cells[i], 'cmptype', 'SelectListItem');
                    if(sl)
                        D3Api.removeDom(sl);
                    ind = D3Api.getProperty(clone.cells[i], 'index', false);
                    if(ind === false || !dom.D3StatGrid.summ[ind])
                        continue;

                    itgcol = [];
                    for(var ic = 0, cc = dom.D3StatGrid.summ[ind].length; ic < cc; ic++)
                        itgcol.push(dom.D3StatGrid.summ[ind][ic].before + (dom.D3Store.currentParent.groupRowData[dom.D3StatGrid.summ[ind][ic].type+'_'+dom.D3StatGrid.summ[ind][ic].field] || '0') + dom.D3StatGrid.summ[ind][ic].after);
                    clone.cells[i].innerHTML = itgcol.join('<br/>');
                }
            }
            allRows = data.length;
        }else//Группы
        {
            var grIndex = (dom.D3Store.currentParent)?+D3Api.getProperty(dom.D3Store.currentParent,'groupindex')+1:0;
            var groupCont = null;
            var keyParent = '';
            if (dom.D3Store.currentParent)
            {
                groupCont = dom.D3Store.currentParent.nextSibling;
                keyParent = D3Api.getProperty(dom.D3Store.currentParent,'groupkey');
            }else
            {
                groupCont = dom.D3Store.rootDom.firstChild;
            }

            for(var i = 0, c = data.length; i < c; i++)
            {
                var row = document.createElement('tr');
                row.className = 'grouprow';
                var cl = row.insertCell(0);
                cl.className = 'groupdatacell';
                cl.colSpan = grIndex+1;
                cl = row.insertCell(-1);
                cl.className = 'groupdatacell caption';
                cl.colSpan= dom.D3Store.row.cells.length-grIndex-1;
                var itogi = '',col;
                for(var ind in dom.D3StatGrid.summ)
                {
                    if(!dom.D3StatGrid.summ.hasOwnProperty(ind)){
                        continue;
                    }
                    col = [];
                    for(var ic = 0, cc = dom.D3StatGrid.summ[ind].length; ic < cc; ic++)
                        col.push(dom.D3StatGrid.summ[ind][ic].before + (data[i][dom.D3StatGrid.summ[ind][ic].type+'_'+dom.D3StatGrid.summ[ind][ic].field] || '0') + dom.D3StatGrid.summ[ind][ic].after);

                    itogi += ' ( '+((dom.D3StatGrid.summ[ind][0].caption)?dom.D3StatGrid.summ[ind][0].caption+': ':'') + col.join(', ') +' )';
                }
                var groupdatacell = data[i][dom.D3Store.currentGroupField];
                if (groupdatacell === null) {
                    groupdatacell = '';
                }
                cl.innerHTML = '<div class="grouptoggle" onclick="D3Api.StatGridCtrl.toggleGroup(this)"></div>'+groupdatacell +' ('+data[i]['_cnt_']+')'+itogi;
                allRows += +data[i]['_cnt_'];
                D3Api.setProperty(row,'cont','grouprow');
                D3Api.setProperty(row,'groupindex',grIndex);
                D3Api.setProperty(row,'groupkey',data[i][dom.D3Store.currentGroupField]);
                D3Api.setProperty(row,'groupkeyparent',keyParent);
                D3Api.setProperty(row,'groupkeyparenthash',MD5.hex_md5(keyParent));
                row.groupRowData = data[i];
                dom.D3Store.rootDom.insertBefore(row,groupCont);
            }
        }
        if(dom.D3Store.currentParent)
        {
            dom.D3Store.currentParent.loaded = true;
        }else if(!dom.D3StatGrid.haveSumm)
        {
            var ftr = D3Api.getDomByAttr(dom, 'cont', 'statgridfootersumm');
            ftr.innerHTML = 'Всего: '+allRows;
        }
        dom.D3Store.currentParent = null;
        dom.D3Store.currentGroupField = undefined;
        D3Api.showDom(dom.D3Store.dataCont,true);
        if(!dom.D3StatGrid.loadedSumm && dom.D3StatGrid.haveSumm)
        {
            for(var ind in dom.D3StatGrid.summ)
            {
                if(!dom.D3StatGrid.summ.hasOwnProperty(ind)){
                    continue;
                }
                for(var i = 0, c = dom.D3StatGrid.summ[ind].length; i < c; i++)
                    dom.D3Store.dataSet.addGroupSumm(dom.D3StatGrid.summ[ind][i].field, dom.D3StatGrid.summ[ind][i].type, dom.D3StatGrid.summ[ind][i].fixed);
            }
            dom.D3Store.currentGroupSummData = true;
            this.refreshData(dom);
        }
        D3Api.StatGridCtrl.resize(dom);
    }
    this.toggleGroup = function StatGridCtrl_toggleGroup(dom)
    {
        var row = D3Api.getDomByDomAttr(dom, 'cont', 'grouprow');
        var statgrid = D3Api.getControlByDom(row, 'StatGrid');
        D3Api.toggleClass(row, 'opened', 'closed');
        if(row.loaded)
        {
            showNode(statgrid,row);
            return;
        }
        var grIndex = +D3Api.getProperty(row,'groupindex');
        //Добавляем фильтры для этого уровня и следующую группу
        if(statgrid.D3StatGrid.groups.length > grIndex+1)
            statgrid.D3Store.currentGroupField = statgrid.D3StatGrid.groups[grIndex+1].field;
        else
            statgrid.D3Store.currentGroupField = undefined;
        var key,parentKey;
        statgrid.D3Store.currentParent = row;
        do
        {
            key = D3Api.getProperty(row,'groupkey');
            parentKey = D3Api.getProperty(row,'groupkeyparent');
            statgrid.D3Store.dataSet.addFilter(statgrid.D3StatGrid.groups[grIndex].field,'='+key);
            grIndex--;
            row = D3Api.getDomBy(statgrid.D3Store.rootDom,'[groupindex="'+grIndex+'"][groupkey='+D3Api.JSONstringify(parentKey)+']');
        }while(row && grIndex>=0)

        D3Api.StatGridCtrl.refreshData(statgrid);
        D3Api.StatGridCtrl.resize(statgrid);
    }
    function showNode(statgrid,row,show)
    {
        //Показать всех потомков группы
        var key = D3Api.getProperty(row,'groupkey');
        var grIndex = +D3Api.getProperty(row,'groupindex');
        var chn = D3Api.getAllDomBy(statgrid, '[groupindex="'+(grIndex+1)+'"][groupkeyparenthash="'+MD5.hex_md5(key)+'"]');

        if(show === undefined)
            show = !D3Api.showedDom(row)?false:(D3Api.hasClass(row, 'opened')?true:(D3Api.hasClass(row, 'closed')?false:null));

        if (show == null)
            return;

        for(var i = 0, c = chn.length; i < c; i++)
        {
            D3Api.showDom(chn[i], show);
            showNode(statgrid,chn[i]);
        }
        if(chn.length>0)
            return;

        key = D3Api.getProperty(row,'groupuid');
        var chn = D3Api.getAllDomBy(statgrid, '[cont="statgridrow"][groupkeyparentuid="'+key+'"]');
        for(var i = 0, c = chn.length; i < c; i++)
        {
            D3Api.showDom(chn[i], show);
        }
    }
    this.setActiveRow = function StatGridCtrl_SetActiveRow(dom,onchange)
    {
	var _con = D3Api.getControlByDom(dom, 'StatGrid');

	if (_con.D3Store.activeRow == dom && !onchange)
        {
            return;
        }

	rowActivate(dom);
    }
    function rowActivate(dom)
    {
        if (!D3Api.hasProperty(dom, 'keyvalue'))
            return;
        var _con = D3Api.getControlByDom(dom, 'StatGrid');
        if (_con.D3Store.activeRow)
            D3Api.removeClass(_con.D3Store.activeRow, 'active');
	D3Api.addClass(dom, 'active');
        if(dom.clone)
            D3Api.StatGridCtrl.setData(_con,dom.clone.data);
	else
            D3Api.StatGridCtrl.setData(_con,{});

        _con.D3Store.activeRow = dom;
	D3Api.StatGridCtrl.setValue(_con, D3Api.getProperty(dom, 'keyvalue'));

	//D3Api.execDomEvent(_con,'onchange');
        _con.D3Base.callEvent('onchange');
    }
    this.setCurrentActiveRow = function StatGridCtrl_SetActiveRow(dom)
    {
        var data = D3Api.getDomByAttr(dom, 'cont', 'statgriddata');
        if (data.rows.length < 2)
        {
            if (dom.D3Store.activeRow)
            {
                D3Api.StatGridCtrl.setValue(dom,null);
                dom.D3Store.activeRow.className = '';
                dom.D3Store.activeRow = null;
                D3Api.StatGridCtrl.setData(dom,{});
                //D3Api.execDomEvent(dom,'onchange');
                dom.D3Base.callEvent('onchange');
            }
            return;
        }
        var actRow = dom.D3Store.currentFirstRow || data.rows[0];
        var kv = D3Api.StatGridCtrl.getValue(dom);
        var lv = D3Api.StatGridCtrl.getLocate(dom);
        //Попробуем найти у датасета
        if (!lv)
        {
            var ds = dom.D3Form.getDataSet(dom.D3Store.dataSetName);
            if(ds.getPosition() != 0)
            {
                var d = ds.getData();
                if (d && !dom.D3Store.toggleNodeFlag)
                {
                    lv = d[D3Api.getProperty(dom,'keyfield','')];
                }
            }
        }
        if (kv || lv)
        {
            actRow = dom.D3Store.currentFirstRow ||  D3Api.getDomByAttr(data, 'keyvalue', lv) || D3Api.getDomByAttr(data, 'keyvalue', kv) || actRow;
        }
        if(!actRow.parentNode || D3Api.getProperty(actRow,'isd3repeater',false))
            actRow = data.rows[0];

        rowActivate(actRow);

        if(!dom.D3Store.toggleNodeFlag)
        {
            var cont = D3Api.getDomByAttr(dom, 'cont', 'statgriddatacont');
            cont.scrollTop = actRow.offsetTop-25;
            D3Api.StatGridCtrl.setLocate(dom,'');
        }
        dom.D3Store.toggleNodeFlag = false;
    }
    this.getValue = function StatGridCtrl_GetValue(dom)
    {
        return D3Api.getProperty(dom, 'keyvalue', '');
    }
    this.setValue = function StatGridCtrl_SetValue(dom,value)
    {
        return D3Api.setProperty(dom, 'keyvalue', value);
    }
    this.getLocate = function StatGridCtrl_GetLocate(dom)
    {
        return D3Api.getProperty(dom, 'locatevalue', '');
    }
    this.setLocate = function StatGridCtrl_SetLocate(dom,value)
    {
        D3Api.setProperty(dom, 'locatevalue', value);
        if (!D3Api.empty(value))
            dom.D3Form.getDataSet(dom.D3Store.dataSetName).addEventOnce('onbefore_refresh', function(){
                var lv = D3Api.getProperty(dom, 'locatevalue');
                if(!D3Api.empty(lv))
                    this.setLocate(D3Api.getProperty(dom,'keyfield',''),lv);
            });
    }
    this.getData = function StatGridCtrl_GetData(dom)
    {
        if (dom.D3Store.data)
            return dom.D3Store.data;
        return [];
    }
    this.setData = function StatGridCtrl_SetData(dom,value)
    {
        return dom.D3Store.data = value;
    }
    this.getCaption = function StatGridCtrl_GetCaption(dom)
    {
        return D3Api.StatGridCtrl.getReturnValue(dom.D3Store.activeRow);
    }
    this.setCaption = function StatGridCtrl_SetCaption(dom,value)
    {

    }
    this.getTitle = function StatGridCtrl_GetTitle(dom)
    {
        var cont = D3Api.getDomByAttr(dom, 'cont', 'statgridcaptioncontent');
        return D3Api.getTextContent(cont);
    }
    this.setTitle = function StatGridCtrl_SetTitle(dom, value)
    {
        var cont = D3Api.getDomByAttr(dom, 'cont', 'statgridcaptioncontent');
        D3Api.addTextNode(cont, D3Api.empty(value) ? '' : value, true);
    }
    this.headerSizerInit = function StatGridCtrl_HeaderSizerInit(tr)
    {
        tr._header = true;
        D3Api.addEvent(tr,'mousemove',D3Api.StatGridCtrl.onHeaderMove,true);
        D3Api.addEvent(tr,'mousedown',D3Api.StatGridCtrl.onHeaderBeginSizeEC,true);
    }
    this._oldData = null;
    this.onHeaderBeginSizeEC = function(event)
    {
        D3Api.StatGridCtrl.onHeaderMove(event);
        var target = event.srcElement || event.target;

        if (!target.parentNode._header || !target._canSize)
            return;

        var c = D3Api.StatGridCtrl.getCol(target);
        var nsc = c.nextSibling;
        var nst = target.nextSibling;
        while (nsc && !D3Api.showedDom(nsc))
        {
            nsc = nsc.nextSibling;
            nst = target.nextSibling;
        }
        if(!nsc)
            return;

        var statgrid = D3Api.getControlByDom(target, 'StatGrid');

        D3Api.StatGridCtrl._oldData = {width: target.offsetWidth, pos: event.pageX, col: D3Api.getAllDomBy(statgrid, '[fcol="'+D3Api.getProperty(c,'fcol')+'"]'), rcol: D3Api.getAllDomBy(statgrid, '[fcol="'+D3Api.getProperty(nsc,'fcol')+'"]'), rwidth: nst.offsetWidth, W: target.offsetWidth+nst.offsetWidth};

        for(var i =0, ic = D3Api.StatGridCtrl._oldData.col.length; i < ic; i++)
        {
            D3Api.StatGridCtrl._oldData.col[i].width = target.offsetWidth;
            D3Api.StatGridCtrl._oldData.rcol[i].width = nst.offsetWidth;
        }

        window.captureEvents(Event.MOUSEMOVE | Event.MOUSEUP);

        window.onmousemove = D3Api.StatGridCtrl.onHeaderSizeEC;
        window.onmouseup = D3Api.StatGridCtrl.onHeaderEndSizeEC;
    }
    this.onHeaderSizeEC = function StatGridCtrl_OnHeaderSize(event)
    {
        var W = D3Api.StatGridCtrl._oldData.W;

        var nW = D3Api.StatGridCtrl._oldData.width + event.pageX - D3Api.StatGridCtrl._oldData.pos;
        var rNW = D3Api.StatGridCtrl._oldData.rwidth - event.pageX + D3Api.StatGridCtrl._oldData.pos;
        for(var i =0, ic = D3Api.StatGridCtrl._oldData.col.length; i < ic; i++)
        {
            D3Api.StatGridCtrl._oldData.col[i].width = nW;
            D3Api.StatGridCtrl._oldData.rcol[i].width = rNW;
            if (D3Api.StatGridCtrl._oldData.col[i].width < 10)
            {
                D3Api.StatGridCtrl._oldData.col[i].width = 10;
                D3Api.StatGridCtrl._oldData.rcol[i].width = W-10;
            }
            if (D3Api.StatGridCtrl._oldData.rcol[i].width < 10)
            {
                D3Api.StatGridCtrl._oldData.rcol[i].width = 10;
                D3Api.StatGridCtrl._oldData.col[i].width = W-10;
            }
        }
    }
    this.onHeaderEndSizeEC = function StatGridCtrl_OnHeaderEndSize(event)
    {
        D3Api.StatGridCtrl._oldData = null;
        window.onmousemove = null;
        window.onmouseup = null;
        window.releaseEvents(Event.MOUSEMOVE | Event.MOUSEUP);
    }
    this.getCol = function StatGridCtrl_getCol(th)
    {
        var t = th.parentNode;
        while (t.nodeName != 'TABLE')
            t = t.parentNode;

        var cg = D3Api.getChildTag(t, 'colgroup', 0);

        return cg.childNodes[th.cellIndex];
    }
    this.onHeaderMove = function StatGridCtrl_OnHeaderMove(event)
    {
        var target = event.srcElement || event.target;

        if (!target.parentNode._header)
            return;
        if (target.parentNode.cells.length-1 == target.cellIndex || target._sizeChange)
            return;

        var s = D3Api.getAbsoluteClientRect(target,true,true);

        if ((s.width+s.x - event.pageX)<=5)
        {
            target.style.cursor = 'e-resize';
            target._canSize = true;
        }else
        {
            target.style.cursor = '';
            target._canSize = false;
        }
    }
    this.toggleFilter = function(dom)
    {
        var statgrid = D3Api.getControlByDom(dom, 'StatGrid');

        if(!statgrid.D3Store._conts_.filters) return;

        var filter = statgrid.D3Store._conts_.filters

        D3Api.toggleClass(filter, 'filter-block', 'filter-none');

        if(D3Api.hasProperty(dom,'fhead_uid'))
        {
            var ctrl = D3Api.getDomByAttr(filter,'fdata_uid',D3Api.getProperty(dom,'fhead_uid'));
            D3Api.setControlPropertyByDom(ctrl, 'focus', true);
        }

        D3Api.StatGridCtrl.resize(statgrid);
    }
    this.hideFilter = function(dom)
    {
        var statgrid = D3Api.getControlByDom(dom, 'StatGrid');
        if(!statgrid.D3Store._conts_.filters) return;
        var filter = statgrid.D3Store._conts_.filters;
        D3Api.toggleClass(filter, 'filter-block', 'filter-none', true);
        D3Api.StatGridCtrl.resize(statgrid);
    }
    this.searchFilter = function(dom,hide)
    {
        var statgrid = D3Api.getControlByDom(dom, 'StatGrid');
        D3Api.StatGridCtrl.activateFilter(dom);
        statgrid.D3Form.refreshDataSet(statgrid.D3Store.dataSetName);
        if(hide)
            D3Api.StatGridCtrl.hideFilter(statgrid);
    }
    this.activateFilter = function(dom)
    {
        var statgrid = D3Api.getControlByDom(dom, 'StatGrid');
        var fItems = D3Api.getAllDomBy(statgrid,'[fdata_uid]');
        var fItAct = {};
        for(var i = 0, ic = fItems.length; i < ic; i++)
        {
            var duid = D3Api.getProperty(fItems[i], 'fdata_uid');
            var ctrl = D3Api.getDomByAttr(statgrid, 'fhead_uid', duid);
            if (!D3Api.empty(D3Api.getControlPropertyByDom(fItems[i], 'value')))
            {
                D3Api.addClass(ctrl, 'active');
                fItAct[duid] = true;
            }else if (!fItAct[duid])
                D3Api.removeClass(ctrl, 'active');
        }
    }
    this.clearFilter = function(dom,refresh,hide)
    {
        var statgrid = D3Api.getControlByDom(dom, 'StatGrid');
        var fi = D3Api.getAllDomBy(statgrid, "[filteritem]");
        for(var i = 0, c = fi.length; i < c; i++)
        {
            if (D3Api.getProperty(fi[i], "cmptype") == "ButtonEdit") {
                statgrid.D3Form.setCaption(fi[i], '');
            }
            statgrid.D3Form.setValue(fi[i], '');
        }
        if(refresh)
            statgrid.D3Form.refreshDataSet(statgrid.D3Store.dataSetName);
        if(hide)
            D3Api.StatGridCtrl.hideFilter(statgrid);
    }
    this.getReturnValue = function StatGridCtrl_GetReturnValue(dom)
    {
        return D3Api.getProperty(dom, 'returnvalue', '');
    }
    this.setReturnValue = function StatGridCtrl_SetReturnValue(dom,value)
    {
        return D3Api.setProperty(dom, 'returnvalue', value);
    }
    this.filterKeyPress = function(filterItem)
    {
        var e = D3Api.getEvent();
        if(e.keyCode != 13)
            return;

        D3Api.StatGridCtrl.searchFilter(filterItem,true);
    }
    this.exportXLS = function(dom)
    {
        var statgrid = D3Api.getControlByDom(dom, 'StatGrid');
        var sl = D3Api.hasProperty(statgrid, 'selectlist');
        var expdata = D3Api.getDomByAttr(statgrid, 'cont', 'statgriddata');
        expdata = expdata.cloneNode(true);


        var statcolcaption = D3Api.getDomByAttr(statgrid, 'cont', 'statgridcolumnscaption');
        statcolcaption = statcolcaption.cloneNode(true);
        var allcells = statcolcaption.cells.length;

        for(var i = 0; i < allcells; i++)
            D3Api.addTextNode(statcolcaption.cells[i],D3Api.getTextContent(statcolcaption.cells[i]),true);

        D3Api.insertBeforeDom(expdata.rows[0], statcolcaption);

        if(sl)
        {
            var slnodes = D3Api.getAllDomBy(expdata, 'colgroup>col[index="0"], tr>td[index="0"]');
            for(var i = 0, c = slnodes.length; i < c; i++)
                D3Api.removeDom(slnodes[i]);
            allcells--;
        }

        if(D3Api.hasClass(statgrid,'withgroups'))
        {
            var groups = expdata.insertRow(0);
            var cellgroup = groups.insertCell(0);
            cellgroup.style.width = statgrid.offsetWidth+'px';
            cellgroup.className = 'sg_groups';
            D3Api.setProperty(cellgroup,'colspan',allcells);
            var statgroups = D3Api.getDomByAttr(statgrid, 'cont', 'statgridgroups');
            D3Api.addTextNode(cellgroup, D3Api.getTextContent(statgroups) , true);
        }
        var head = expdata.insertRow(0);
        var cellcaption = head.insertCell(0);
        cellcaption.style.width = statgrid.offsetWidth+'px';
        cellcaption.className = 'sg_caption';
        D3Api.setProperty(cellcaption,'colspan',allcells);
        var statcaption = D3Api.getDomByAttr(statgrid, 'cont', 'statgridcaption');
        D3Api.addTextNode(cellcaption, D3Api.getTextContent(statcaption) , true);

        var footer = expdata.insertRow(-1);
        var cellfooter = footer.insertCell(0);
        cellfooter.className = 'sg_footer';
        D3Api.setProperty(cellfooter,'colspan',allcells);
        var statfooter = D3Api.getDomByAttr(statgrid, 'cont', 'statgridfooter');
        D3Api.addTextNode(cellfooter, D3Api.getTextContent(statfooter) , true);

        var data = {type: 'StatGrid', params: {action:'export',content: expdata.innerHTML}};
        statgrid.D3Form.sendRequest('statgrid', data, false, function(r,r2){D3Api.downloadFile(r2.statgrid.export_file,'export.xls',true,'application/excel');});
    }
    this.setVisible = function(dom,value)
    {
        D3Api.BaseCtrl.setVisible(dom,value);
        if(D3Api.getBoolean(value))
            D3Api.StatGridCtrl.resize(dom);
    }
}
D3Api.controlsApi['StatGrid'] = new D3Api.ControlBaseProperties(D3Api.StatGridCtrl);
D3Api.controlsApi['StatGrid']['value']={get:D3Api.StatGridCtrl.getValue,set: D3Api.StatGridCtrl.setValue};
D3Api.controlsApi['StatGrid']['data']={get:D3Api.StatGridCtrl.getData};
D3Api.controlsApi['StatGrid']['locate']={get:D3Api.StatGridCtrl.getLocate,set: D3Api.StatGridCtrl.setLocate};
D3Api.controlsApi['StatGrid']['caption']={get:D3Api.StatGridCtrl.getCaption,set:D3Api.StatGridCtrl.setCaption};
D3Api.controlsApi['StatGrid']['title']={get:D3Api.StatGridCtrl.getTitle,set:D3Api.StatGridCtrl.setTitle};
D3Api.controlsApi['StatGrid']['returnValue']={get:D3Api.StatGridCtrl.getReturnValue,set: D3Api.StatGridCtrl.setReturnValue};
D3Api.controlsApi['StatGrid']['visible'].set = D3Api.StatGridCtrl.setVisible;

D3Api.StatGridRowCtrl = new function()
{
    this.getRowData = function(dom)
    {
        if(dom.clone)
            return dom.clone.data;
        else
            return {};
    }
}

D3Api.controlsApi['StatGridRow'] = new D3Api.ControlBaseProperties(D3Api.StatGridRowCtrl);
D3Api.controlsApi['StatGridRow']['value']={get:D3Api.StatGridCtrl.getValue,set: D3Api.StatGridCtrl.setValue};
D3Api.controlsApi['StatGridRow']['data']={get:D3Api.StatGridRowCtrl.getRowData};
D3Api.controlsApi['StatGridRow']['returnValue']={get:D3Api.StatGridCtrl.getReturnValue,set: D3Api.StatGridCtrl.setReturnValue};
D3Api.FileCtrl = new function()
{
    this.init = function(dom) {
        dom.D3File = {
            name: D3Api.getProperty(dom, 'name'),
            filename: D3Api.getProperty(dom, 'caption', ''),
            userdata: D3Api.getProperty(dom, 'userdata',false) == 'true',
            view: D3Api.getProperty(dom, 'view'),
            keyfield: D3Api.getProperty(dom, 'keyfield'),
            filefield: D3Api.getProperty(dom, 'filefield'),
            func: D3Api.getProperty(dom, 'view'),
            dbid: '',
            extentions:D3Api.getProperty(dom,'extentions'),
            max_size:D3Api.getProperty(dom,'max_size'),
            ctype: D3Api.getProperty(dom, 'ctype'),
            storage: D3Api.getProperty(dom, 'storage'),
            source: D3Api.getProperty(dom, 'source'),
            file_store: D3Api.getProperty(dom, 'file_store')
        };
        dom.D3FileInput = D3Api.getChildTag(dom, 'input', 0);
        if (dom.D3FileInput) {
            D3Api.addEvent(dom.D3FileInput, 'change', function(event) {
                D3Api.stopEvent(event);
            }, true);
        }
        this.init_focus(dom);
        var v = D3Api.getProperty(dom, 'value');
        if (v) {
            D3Api.FileCtrl.setValue(dom,v);
        }
        var c = D3Api.getProperty(dom, 'caption');
        if (c) {
            D3Api.FileCtrl.setCaption(dom,c);
        }
        D3Api.BaseCtrl.initEvent(dom,'onload');
        D3Api.BaseCtrl.initEvent(dom,'onsave','filelink');
        D3Api.BaseCtrl.initEvent(dom,'onbefore_delete');
        D3Api.BaseCtrl.initEvent(dom,'ondelete','dbId');
        D3Api.BaseCtrl.initEvent(dom,'onfileupload','filename,fileuid');
    }
    this.sendFile = function sendFile(file,cmp) {
            var uri = D3Api.getOption('path','')+'request.php?file_action=load&ctype=text/html';
            var xhr = new XMLHttpRequest();
            var fd = new FormData();

            xhr.upload.addEventListener("progress", function(e) {
                if (e.lengthComputable) {
                  var percentage = Math.round((e.loaded * 100) / e.total);
                  D3Api.setControlPropertyByDom(cmp,'progress',percentage);
                }
              }, false);
            xhr.upload.addEventListener("load", function(e) {
                D3Api.setControlPropertyByDom(cmp,'progress',100);
            }, false);
            xhr.open("POST", uri, true);

            var systemUserToken = D3Api.globalClientData.get('systemUserToken');
            if (systemUserToken) {
                xhr.setRequestHeader('X-User-Token', systemUserToken);
            }

            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4)
                   if (xhr.status == 200) {
                    // Handle response.
                    var result=JSON.parse(xhr.responseText);
                    if (result.file.error) {
                        D3Api.notify('Загрузка файла.',result.file.error);
                        D3Api.FileCtrl.clear(cmp);
                        return;
                    }
                    D3Api.setControlPropertyByDom(cmp, 'caption', result.file.filename);
                    D3Api.setControlPropertyByDom(cmp, 'value', result.file.fileuid);
                    cmp.D3Base.callEvent('onfileupload',result.file.filename,result.file.fileuid);
                } else {
                    D3Api.notify('Ошибка загрузки файла.',xhr.status+' '+xhr.statusText);
                    D3Api.setControlPropertyByDom(cmp, 'value', '');
                }
            };

            fd.append('file', file);
            // Initiate a multipart/form-data upload
            fd.append('request', D3Api.JSONstringify({
                file: {type: 'File',params: cmp.D3File}
             }));
             xhr.send(fd);
    }

    this.fileLoad = function File_loadFile(input) {
        if (FormData !== undefined) {
            var cmp = D3Api.getControlByDom(input, 'File');
            D3Api.getDomBy(cmp,'.file_select span').innerHTML = "Загрузка...";
            var filesArray = input.files;
            for (var i=0; i<filesArray.length; i++) {
                this.sendFile(filesArray[i],cmp);
            }
        } else {
            var targetName='frame'+(new Date().getTime());
            var iframe=document.createElement('IFRAME');
            iframe.style.display='none';
            iframe.width='0px';
            iframe.height='0px';
            iframe.frameborder='0';
            iframe.id=targetName;
            iframe.name=targetName;
            document.body.appendChild(iframe);
            var file = D3Api.getControlByDom(input, 'File');
            input.form.request.value = D3Api.JSONstringify({
                file: {type: 'File',params: file.D3File}
            });
            input.form.target=targetName;
            input.form.action=D3Api.getOption('path','')+'request.php?file_action=load&ctype=text/html';
            input.form.submit();

            iframe.onload=function () {
                    if (!iframe.parentNode)
                        return;
                    var result=JSON.parse(D3Api.getTextContent(this.contentDocument.body));
                    D3Api.removeDom(iframe);
                    if (result.file.error) {
                       D3Api.notify('Загрузка файла.',result.file.error);
                       input.value = '';
                       return;
                    }
                    D3Api.setControlPropertyByDom(file, 'caption', result.file.filename);
                    D3Api.setControlPropertyByDom(file, 'value', result.file.fileuid);
                    file.D3Base.callEvent('onfileupload',result.file.filename,result.file.fileuid);
            }
            iframe.onreadystatechange = iframe.onload;
        }
    }
    this.fileSave = function(dom) {
        var file = D3Api.getControlByDom(dom, 'File');
        if(file.D3File.userdata) {
            file.D3Form.setVar('fileLink_'+file.D3File.name,null);
            file.D3Form.executeAction('saveAction_'+file.D3File.name,function() {
                var fl = file.D3Form.getVar('fileLink_'+file.D3File.name);
                file.D3Form.setVar('fileLink_'+file.D3File.name,null);
                if (!fl) {
                    D3Api.notify('Информация.','Файл не может быть сохранен.');
                    return;
                }
                openFile(fl,file.D3File);
            },
            function() {
                D3Api.notify('Информация.','Ошибка при полученнии ссылки для скачивания.')
            }
            );
        } else {
            var req = {
                file: {type: 'File', params: D3Api.mixin({},file.D3File), source: file.D3File.source}
            };
            req.file.params.filename = req.file.params.savefilename || req.file.params.filename;
            D3Api.requestServer({
                url: 'request.php',
                async: true,
                method: 'POST',
                urlData: {file_action: 'save'},
                data: {request: D3Api.JSONstringify(req)},
                onSuccess: function(res) {
                    var result=JSON.parse(res);
                    if (!D3Api.empty(result.file.error)) {
                        D3Api.notify('Информация.',result.file.error);
                    }
                    if (!D3Api.empty(result.file.link)) {
                        openFile(result.file.link,file.D3File);
                    }
                },
                onError: function(res) {
                    D3Api.notify('Информация.','Ошибка при полученнии ссылки для скачивания.');
                }

            });
        }
    }
    function openFile(link,info) {
        if (link)
            window.open(D3Api.getOption('path','')+link+(info.view?'&fileview=1':'')+(info.ctype?'&filetype='+info.ctype:''));
        else
            D3Api.notify('Информация.','Файл не может быть сохранен.')
    }
    this.setValue = function File_setValue(dom,value) {
        if (!dom.D3File.fileuid && !value) {
            dom.D3File.dbid = null;
        }
        dom.D3File.fileuid = value;
        if (value == '') {
            dom.D3FileInput.form.reset();
            D3Api.getDomBy(dom,'.file_select span').innerHTML = "Выбрать...";
            D3Api.getDomBy(dom,'.file_select .percent').innerHTML = "";
        }
        if(dom.D3File.fileuid)
            D3Api.FileCtrl.fileInfo(dom,'show');
    }
    this.getValue = function File_getValue(dom) {
        var dbid = D3Api.FileCtrl.getDBId(dom);
        return ((dom.D3File.fileuid) ? dom.D3File.fileuid : '') +
               ((dom.D3File.filename) ? ':' + dom.D3File.filename : ((dbid) ? ':' : '')) +
               ((dbid) ? ':' + dbid : '');
    }
    this.setCaption = function File_setCaption(dom,value) {
        dom.D3File.filename = value;
        var fn = D3Api.getDomByAttr(dom, 'cont', 'filename');
        D3Api.addTextNode(fn,(dom.D3File.filename !== undefined)?dom.D3File.filename:'',true);
    }
    this.getCaption = function File_getCaption(dom) {
        return dom.D3File.filename;
    }
    this.setFileName = function File_setFileName(dom,value) {
        dom.D3File.savefilename = value;
    }
    this.getFileName = function File_getFileName(dom) {
        return dom.D3File.savefilename;
    }
    this.setMaxSize = function File_setMaxSize(dom,value) {
        dom.D3File.max_size = value;
    }
    this.getMaxSize = function File_getMaxSize(dom) {
        return dom.D3File.max_size;
    }
    this.getFileStoreMode = function File_getFileStoreMode(dom){
        return dom.D3File.file_store;
    }
    this.fileInfo = function File_showInfo(dom,state) {
        var fl = D3Api.getDomByAttr(dom, 'cont', 'fileloader');
        var fi = D3Api.getDomByAttr(dom, 'cont', 'fileinfo');
        if (state == 'show') {
            var fn = D3Api.getDomByAttr(dom, 'cont', 'filename');
            D3Api.addTextNode(fn,(dom.D3File.filename !== undefined)?dom.D3File.filename:'',true);
            D3Api.hideDom(fl);
            D3Api.setDomDisplayDefault(fi);
        } else {
            D3Api.hideDom(fi);
            D3Api.setDomDisplayDefault(fl);
        }

    }
    this.fileDelete = function File_delete(dom) {
        var file = D3Api.getControlByDom(dom, 'File');
        var req = {
            file: {type: 'File', params: file.D3File}
        }
        var fileUid = file.D3File.fileuid;
        if(file.D3Base.callEvent('onbefore_delete') === false)
            return;
        D3Api.requestServer({
                url: 'request.php',
                async: true,
                method: 'POST',
                urlData: {file_action: 'delete'},
                data: {request: D3Api.JSONstringify(req)},
                onSuccess: function(res) {
                    var result=JSON.parse(res);
                    var fileDBUid = null;
                    if(result.file.result == 'db') {
                        fileDBUid = fileUid;
                        D3Api.FileCtrl.setDBId(file, fileUid);
                    }
                    file.D3Base.callEvent('ondelete',fileDBUid);
                }
             });
        D3Api.FileCtrl.clear(file);
    }
    this.clear = function(dom) {
        D3Api.setControlPropertyByDom(dom, 'caption', '');
        D3Api.setControlPropertyByDom(dom, 'value', '');
        D3Api.setControlPropertyByDom(dom, 'filename', '');

        D3Api.FileCtrl.fileInfo(dom,'hide');
    }
    this.getDBId = function(dom) {
        return dom.D3File.dbid;
    };
    this.setDBId = function(dom, value) {
        dom.D3File.dbid = value && String(value) || null;
    };
    this.setReadonly = function(dom,value) {
        var del = D3Api.getDomBy(dom,'.file_delete');
        if (value === false) {
            del && D3Api.setDomDisplayDefault(del);
        } else {
            del && D3Api.hideDom(del);
        }
    };
    this.setProgress = function(dom,value) {
        //console.log(value);
        var fs = D3Api.getDomBy(dom,'.file_select');
        var prg = D3Api.getDomBy(dom,'.progress');
        var prc = D3Api.getDomBy(dom,'.percent');
        prc.innerHTML = value+'%';
        if (value == 100) value = 0;
        if (value) {
            D3Api.addClass(fs,'loading');
        } else {
            D3Api.removeClass(fs,'loading');
        }
        prg.style.width = value+'%';
    }
    this.CtrlKeyDown = function(dom, e) {
        switch (e.keyCode) {
            case 45: //Insert
                D3Api.FileCtrl.fileSave(dom);
                D3Api.stopEvent(e);
                break;
            case 46: //DEL
                D3Api.FileCtrl.fileDelete(dom);
                D3Api.stopEvent(e);
                break;
        }
    }
}

D3Api.controlsApi['File'] = new D3Api.ControlBaseProperties(D3Api.FileCtrl);
D3Api.controlsApi['File']['readonly']={set:D3Api.FileCtrl.setReadonly};
D3Api.controlsApi['File']['value']={get:D3Api.FileCtrl.getValue,set:D3Api.FileCtrl.setValue};
D3Api.controlsApi['File']['caption']={get:D3Api.FileCtrl.getCaption, set:D3Api.FileCtrl.setCaption};
D3Api.controlsApi['File']['filename']={get:D3Api.FileCtrl.getFileName, set:D3Api.FileCtrl.setFileName};
D3Api.controlsApi['File']['progress']={set:D3Api.FileCtrl.setProgress};
D3Api.controlsApi['File']['max_size']={get:D3Api.FileCtrl.getMaxSize,set:D3Api.FileCtrl.setMaxSize};
D3Api.controlsApi['File']['file_store']={get:D3Api.FileCtrl.getFileStoreMode};
D3Api.controlsApi['File']['height'] = undefined;
D3Api.FormCtrl = new function(){
    this.init = function(dom)
    {
        var fd = dom.D3Form.formData.sized;
        var sized = D3Api.getBoolean(D3Api.getProperty(dom,'sized',!!fd));
        if(fd)
        {
            fd.height && D3Api.setControlPropertyByDom(dom,'height',fd.height);
            fd.width && D3Api.setControlPropertyByDom(dom,'width',fd.width);
        }
        D3Api.FormCtrl.setSized(dom,sized);
    }
    function domInsertEvent(formDom)
    {
        D3Api.FormCtrl.setSized(formDom,formDom.D3Store.sized);
    }
    function domRemoveEvent(formDom)
    {
        if(formDom.D3Store.sized)
        {
            D3Api.removeClass(formDom.D3Form.container.DOM,'formSizedContainer');
        }
        formDom.D3Store.frameDom && D3Api.removeDom(formDom.D3Store.frameDom);
    }
    function domDestroyEvent(formDom)
    {
        var cf = formDom.D3Form.container.currentForm;
        if(cf && cf.DOM && cf.DOM.D3Store && !cf.DOM.D3Store.sized)
        {
            D3Api.removeClass(formDom.D3Form.container.DOM,'formSizedContainer');
        }
        formDom.D3Store.frameDom && D3Api.removeDom(formDom.D3Store.frameDom);
    }
    this.getSized = function(dom)
    {
        return !!dom.D3Store.sized;
    }
    function setFormCaption(caption)
    {
        var cDom = D3Api.getDomByAttr(this.DOM.D3Store.frameDom,'cont','caption');

        if(cDom) {
            D3Api.addTextNode(cDom, caption, true);
            D3Api.setProperty(cDom,'title',caption);
        }

    }
    this.setSized = function(dom,value)
    {
        dom.D3Store.sized = value;
        if(dom.D3Store.sized)
        {
            D3Api.addClass(dom,'formSized');
            D3Api.addClass(dom.D3Form.container.DOM,'formSizedContainer');
            !dom.D3Store.sizedUidIns && (dom.D3Store.sizedUidIns = dom.D3Form.addEvent('onform_dominsert',domInsertEvent));
            !dom.D3Store.sizedUidRem && (dom.D3Store.sizedUidRem = dom.D3Form.addEvent('onform_domremove',domRemoveEvent));
            !dom.D3Store.sizedUidDes && (dom.D3Store.sizedUidDes = dom.D3Form.addEvent('onform_destroy',domDestroyEvent));
            !dom.D3Store.sizedUidResize && (dom.D3Store.sizedUidResize = dom.D3Form.addEvent('onResize',function(){calcPos(dom)}));
            !dom.D3Store.sizedUidCaption && (dom.D3Store.sizedUidCaption = dom.D3Form.addEvent('onformcaption',setFormCaption));
            if(!dom.D3Store.frameDom)
            {
                dom.D3Store.frameDom = D3Api.createDom('<div class="formFrame"><div class="frameCaption" cont="caption"></div><div class="frameClose" cmpparse="true" onclick="close();">X</div></div>');
                dom.D3Form.parse(dom.D3Store.frameDom);
                setFormCaption.call(dom.D3Form,dom.D3Form.getFormCaption());
            }
            D3Api.insertBeforeDom(dom,dom.D3Store.frameDom);
            calcPos(dom);
        }else
        {
            D3Api.removeClass(dom,'formSized');
            D3Api.removeClass(dom.D3Form.container.DOM,'formSizedContainer');
            dom.D3Form.removeEvent('onform_dominsert',dom.D3Store.sizedUidIns);
            dom.D3Store.sizedUidIns = null;
            dom.D3Form.removeEvent('onform_domremove',dom.D3Store.sizedUidRem);
            dom.D3Store.sizedUidRem = null;
            dom.D3Form.removeEvent('onform_destroy',dom.D3Store.sizedUidDes);
            dom.D3Store.sizedUidDes = null;
            dom.D3Form.removeEvent('onResize',dom.D3Store.sizedUidResize);
            dom.D3Store.sizedUidResize = null;
            D3Api.setStyle(dom,'margin-top','0');
            dom.D3Store.frameDom && D3Api.removeDom(dom.D3Store.frameDom);
        }
    }
    function calcPos(dom)
    {
        var contSize = D3Api.getAbsoluteClientRect(dom.D3Form.container.DOM);
        var frmSize = D3Api.getAbsoluteClientRect(dom);
        var frameBorderTop = +D3Api.getStyle(dom.D3Store.frameDom,'padding-top').replace('px','');
        var frameBorderLeft = +D3Api.getStyle(dom.D3Store.frameDom,'padding-left').replace('px','');
        var mTop = (contSize.height- frmSize.height+ frameBorderTop )/2;

        D3Api.setStyle(dom,'margin-top',(mTop<frameBorderTop?frameBorderTop:mTop)+'px');

        dom.D3Store.frameDom.style.height = frmSize.height+"px";
        dom.D3Store.frameDom.style.width = frmSize.width+"px";
        dom.D3Store.frameDom.style.top = (mTop<frameBorderTop?0:(mTop-frameBorderTop))+"px";
        dom.D3Store.frameDom.style.left = (frmSize.x-frameBorderLeft)+"px";
    }

    /**
     * Проверка прав на просмотр и редактирование записи раздела
     * @param dom - форма
     * @param unit - раздел
     * @param primary - значение primary записи раздела
     * @param isView - значение режима просмотра на форме
     * @param onSuccess - callback-функция
     */
    this.checkPrivs = function(dom, unit, primary, isView, onSuccess){
        var req = {
            checkPrivs: {type: 'Form', params: {
                unitcode: unit,
                id: primary,
                is_view: isView ? true : null
            }}
        };

        D3Api.requestServer({
            url: 'request.php',
            method: 'POST',
            urlData:{action: 'privs'},
            data: {request: D3Api.JSONstringify(req)},
            contextObj:dom,
            onSuccess: function(resp) {
                r = JSON.parse(resp);
                if (r.view != "1") {
                    D3Api.notify('Сообщение сервера', 'Нет права на просмотр записи', {modal: true});
                    dom.close();
                    return false;
                }
                dom.formEditMode = r.edit == "1" ? true : false;
                if (typeof onSuccess === 'function') onSuccess.call(dom, r);
            }
        });
    }

    /* Помечаем пользовательское событие onCreate как завершенное */
    this.setCreated = function(dom){
        dom.isCreated = true;
    }
}

D3Api.controlsApi['Form'] = new D3Api.ControlBaseProperties(D3Api.FormCtrl);
D3Api.controlsApi['Form']['sized'] = {get:D3Api.FormCtrl.getSized, set:D3Api.FormCtrl.setSized};D3Api.RadioGroupCtrl = new function RadioGroupCtrl()
{
    this.init = function(_dom)
    {
        D3Api.BaseCtrl.initEvent(_dom,'onchange');
        _dom.D3Base.addEvent('onchange_property',function(property,value){
           if(property == 'value')
               _dom.D3Base.callEvent('onchange');
               //D3Api.execDomEvent(_dom,'onchange');
        });
        this.init_focus(_dom);
    }
    this.setEnabled = function RadioGroup_setEnabled(_dom, _value)
    {
        var items = D3Api.getAllDomBy(_dom,'div[cmptype="RadioItem"]');
        for(var i = 0, c = items.length; i < c; i++)
        {
            var input = D3Api.getChildTag(items[i], 'input', 0);
            //делаем активным
            if (D3Api.getBoolean(_value))
            {
                input.setAttribute('disabled',false);
                input.removeAttribute('disabled');
            }//делаем неактивным
            else
            {
                input.setAttribute('disabled','disabled');
            }
            D3Api.BaseCtrl.setEnabled(items[i], _value);
        }
        D3Api.BaseCtrl.setEnabled(_dom, _value);
    }
    this.getValue = function RadioGroup_getValue(_dom)
    {
        return D3Api.getProperty(_dom,'keyvalue','');
    }
    this.setValue = function RadioGroup_setValue(_dom, _value)
    {
        _value = (_value == null)?'':_value;

        //TODO: Сделать циклом, если в значении "
        var inp = D3Api.getDomBy(_dom, 'input[value='+D3Api.JSONstringify(''+_value)+']');
        if(inp)
        {
            inp.checked = true;
            D3Api.setProperty(_dom,'keyvalue',_value);
        }
    }
    this.getCaption = function RadioGroup_getCaption(_dom)
    {
        return D3Api.getProperty(_dom,'caption','');
    }
    this.setCaption = function RadioGroup_setCaption(_dom, _value)
    {
        _value = (_value == null)?'':_value;
        D3Api.setProperty(_dom,'caption',_value);

        var items = D3Api.getAllDomBy(_dom, '[cmptype="RadioItem"]');
        var inp = null;
        for(var i = 0, c = items.length; i < c; i++)
        {
            if(_value == D3Api.RadioItemCtrl.getCaption(items[i]))
            {
                inp = D3Api.RadioItemCtrl.getInput(items[i]);
                break;
            }
        }
        if(inp)
            inp.checked = true;
    }
}
D3Api.controlsApi['RadioGroup'] = new D3Api.ControlBaseProperties(D3Api.RadioGroupCtrl);
D3Api.controlsApi['RadioGroup']['value']={get:D3Api.RadioGroupCtrl.getValue,set: D3Api.RadioGroupCtrl.setValue};
D3Api.controlsApi['RadioGroup']['enabled'].set = D3Api.RadioGroupCtrl.setEnabled;
D3Api.controlsApi['RadioGroup']['caption']={get:D3Api.RadioGroupCtrl.getCaption,set: D3Api.RadioGroupCtrl.setCaption};

D3Api.RadioItemCtrl = new function RadioItemCtrl()
{
    this.init = function(_dom)
    {
        var radioGroup = D3Api.getControlByDom(_dom, 'RadioGroup');
        var inp = D3Api.RadioItemCtrl.getInput(_dom);
        D3Api.addEvent(_dom, 'mouseup', function(event){
            if (event.cancelBubble || inp.disabled || inp.readOnly) {
                return false;
            }
            D3Api.stopEvent(event);
            inp.checked = !inp.checked;
            D3Api.setControlPropertyByDom(radioGroup,'value',D3Api.RadioItemCtrl.getValue(_dom),undefined,true);
            D3Api.setControlPropertyByDom(radioGroup,'caption',D3Api.RadioItemCtrl.getCaption(_dom),undefined,true);
        }, true);
    }
    this.getInput = function RadioItem_getInput(_dom)
    {
        return D3Api.getChildTag(_dom,'input',0);
    }
    this.setEnabled = function RadioItem_setEnabled(_dom, _value)
    {
        var input = D3Api.RadioItemCtrl.getInput(_dom);
        //делаем активным
        if (D3Api.getBoolean(_value))
        {
            input.removeAttribute('disabled');
        }//делаем неактивным
        else
        {
            input.setAttribute('disabled','disabled');
        }
        D3Api.BaseCtrl.setEnabled(_dom, _value);
    }
    this.getValue = function RadioItem_getValue(_dom)
    {
        var input = D3Api.RadioItemCtrl.getInput(_dom);

        return input.value;
    }
    this.setValue = function RadioItem_setValue(_dom, _value)
    {
        var input = D3Api.CheckBoxCtrl.getInput(_dom);

        input.value = _value;
    }
    this.getChecked = function RadioItem_getChecked(_dom)
    {
        var input = D3Api.RadioItemCtrl.getInput(_dom);

        return input.checked;
    }
    this.setChecked = function RadioItem_setChecked(_dom, _value)
    {
        var input = D3Api.CheckBoxCtrl.getInput(_dom);

        input.checked = _value;
    }

    this.setCaption = function RadioItem_setCaption(_dom, _value)
    {
        var cdom = D3Api.getDomByAttr(_dom, 'cont', 'caption');
        D3Api.addTextNode(cdom, _value, true);
    }

    this.getCaption = function RadioItem_getCaption(_dom)
    {
        var cdom = D3Api.getDomByAttr(_dom, 'cont', 'caption');
        return (cdom) ? D3Api.getTextContent(cdom) : '';
    }
    this.CtrlKeyDown = function(dom, e)
    {
        switch (e.keyCode)
        {
            case 32: //Space
            case 13: //Space
                D3Api.RadioItemCtrl.setChecked(dom, true);
                break;
        }

    }
}
D3Api.controlsApi['RadioItem'] = new D3Api.ControlBaseProperties(D3Api.RadioItemCtrl);
D3Api.controlsApi['RadioItem']['value']={get:D3Api.RadioItemCtrl.getValue,set: D3Api.RadioItemCtrl.setValue};
D3Api.controlsApi['RadioItem']['caption']={get:D3Api.RadioItemCtrl.getCaption,set: D3Api.RadioItemCtrl.setCaption};
D3Api.controlsApi['RadioItem']['enabled'].set = D3Api.RadioItemCtrl.setEnabled;
D3Api.controlsApi['RadioItem']['checked']={get:D3Api.RadioItemCtrl.getChecked,set: D3Api.RadioItemCtrl.setChecked};
D3Api.ChartsCtrl = new function() {
    this.isReady = false;
    this.init = function(dom)
    {
        D3Api.include_js('Components/Charts/js/crossfilter.js',function(){
            D3Api.include_js('Components/Charts/js/d3.js',function(){
                D3Api.include_js('Components/Charts/js/dc.js',function(){
                    D3Api.ChartsCtrl.isReady = true;
                });
            });
        });
        dom.D3Store.chart = {};
        var ta = D3Api.getChildTag(dom,'textarea',0);
        dom.D3Store.chart.settings = ta && ta.value || '';
        ta && D3Api.removeDom(ta);
        dom.D3Store.chart.type = D3Api.getProperty(dom,'type','bar');
        dom.D3Store.chart.datamethod = D3Api.getProperty(dom,'datamethod','');
        dom.D3Store.chart.dimension = D3Api.getProperty(dom,'dimension','');
        dom.D3Store.chart.group = D3Api.getProperty(dom,'group','');
        dom.D3Store.chart.reduce = D3Api.getProperty(dom,'reduce','count');

        dom.D3Store.dataSetName = D3Api.getProperty(dom, 'dataset', '');

        dom.D3Store.dataSetName && dom.D3Form.getDataSet(dom.D3Store.dataSetName).addEvent('onafter_refresh', function() {
            D3Api.ChartsCtrl.parseData(dom, this.data)
        });

        dom.D3Form.addEvent('onResize', function() {
            D3Api.ChartsCtrl.parseData(dom, dom.D3Form.getDataSet(dom.D3Store.dataSetName).data);
        });
    }
    this.setType = function Charts_SetType(dom,value)
    {
      return D3Api.setProperty(dom, 'type', value);
    }
    this.getType = function Charts_GetType(dom)
    {
      return D3Api.getProperty(dom, 'type', '');
    }
    this.parseData = function(dom, data)
    {
        if(!D3Api.ChartsCtrl.isReady)
        {
            setTimeout(function(){D3Api.ChartsCtrl.parseData(dom,data)},100);
            return;
        }
        var chartData = {};
        if(dom.D3Store.chart.datamethod)
        {
            if(dom.D3Form.existsFunction(dom.D3Store.chart.datamethod))
                dom.D3Form.callFunction(dom.D3Store.chart.datamethod,data,chartData);
            else
                D3Api.debug_msg('Метод "'+dom.D3Store.chart.datamethod+'" для подготовки данных на форме не определен.')
        }else if(dom.D3Store.chart.dimension)
        {
            //Подготавливаем данные сами
            var d = crossfilter(data);
            chartData.values = d.dimension(function(d){return d[dom.D3Store.chart.dimension];});
            chartData.groups = chartData.values.group();
            if(dom.D3Store.chart.group)
            {
                switch(dom.D3Store.chart.reduce)
                {
                    case 'sum':
                            chartData.groups.reduceSum(function(d){return d[dom.D3Store.chart.group || dom.D3Store.chart.dimension];});
                        break;
                    case 'count':
                    default:
                            chartData.groups.reduceCount(function(d){return d[dom.D3Store.chart.group || dom.D3Store.chart.dimension];});
                        break;
                }
            }
        }else
        {
            D3Api.debug_msg('Не указаны параметры для формирования данных.')
            return;
        }
        var chart = null;
        switch (dom.D3Store.chart.type)
        {
            case 'bar': chart = dc.barChart(dom);
                        chart.margins({top: 10, right: 10, bottom: 20, left: 40})
                            .dimension(chartData.values)
                            .group(chartData.groups)
                            .transitionDuration(500)
                            .centerBar(true);
                break;
            case 'pie': chart = dc.pieChart(dom);
                        chart.dimension(chartData.values)
                            .group(chartData.groups)
                            .transitionDuration(500);
                break;
            case 'rowbar': chart = dc.rowChart(dom);
                           chart.dimension(chartData.values)
                                .group(chartData.groups)
                                .transitionDuration(500);
                break;
        }
        var size = D3Api.getAbsoluteSize(dom);
        chart.width(size.width)
            .height(size.height);

        try
        {
            if(dom.D3Store.chart.settings)
                eval(dom.D3Store.chart.settings);
        }catch(e)
        {
            D3Api.debug_msg(e)
        }
        chart.render();
        dom.D3Store.chart.chart = chart;
    }
}

D3Api.controlsApi['Charts'] = new D3Api.ControlBaseProperties(D3Api.ChartsCtrl);
D3Api.controlsApi['Charts']['type'] = { get:D3Api.ChartsCtrl.getType,set:D3Api.ChartsCtrl.setType };
D3Api.controlsApi['Charts']['datamethod'] = { get:D3Api.ChartsCtrl.getDataMethod,set:D3Api.ChartsCtrl.setDataMethod };
D3Api.controlsApi['Charts']['settings'] = { get:D3Api.ChartsCtrl.getSettings,set:D3Api.ChartsCtrl.setSettings };
D3Api.UnitPropCtrl = new function()
{
    this.execute = function(dom,onsuccess,onerror,sync,force)
    {
        dom.D3Form.executeAction('ACT_'+D3Api.getProperty(dom,'name',''),onsuccess,onerror,sync,force);
    }
    this.bindCtrl = function(dom, bind_action, prop_code, ctrl_name, property)
    {
        var ba = bind_action.split(';');
        for(var i = 0, c = ba.length; i < c; i++)
        {
            if(ba[i] == '') continue;
            var pars = {
                    get: '>#'+prop_code,
                    srctype: 'ctrl',
                    src: ctrl_name+':'+property
                };
            if(ba[i].indexOf('.') == -1)
            {
                dom.D3Form.getAction(ba[i]).addSysInfoParam(pars);
            }else
            {
                var path = ba[i].split('.');
                var obj = dom.D3Form.getAction(path[0]);
                if(obj)
                {
                    obj = obj.sysinfo;
                    for(var p = 1; p < path.length && obj; p++)
                    {
                        obj = obj.childs[path[p]];
                    }
                    obj && obj.params.push(pars);
                }
            }
        }
    }
    this.getUnitPropsCount = function(dom)
    {
        return D3Api.getProperty(dom, 'unitprops_count', 0);
    }
    this.refresh = function(dom)
    {
        dom.D3Form.refreshDataSet(D3Api.getProperty(dom,'dataset',''));
    }
}
D3Api.controlsApi['UnitProps'] = new D3Api.ControlBaseProperties(D3Api.UnitPropCtrl);
D3Api.controlsApi['UnitProps']['count'] = {get: D3Api.UnitPropCtrl.getUnitPropsCount};
D3Api.FieldSetCtrl = new function() {
    this.init = function(dom) {
        dom.D3Store.legend = D3Api.getChildTag(dom, 'legend', 0);
    };
    this.getCaption = function(dom) {
        return D3Api.getTextContent(dom.D3Store.legend);
    };
    this.setCaption = function(dom, value) {
        value = (D3Api.empty(value)) ? '' : String(value);
        D3Api.addTextNode(dom.D3Store.legend, value, true);
        return value;
    };
};
D3Api.controlsApi['FieldSet'] = new D3Api.ControlBaseProperties(D3Api.FieldSetCtrl);
D3Api.controlsApi['FieldSet']['caption'] = {get: D3Api.FieldSetCtrl.getCaption, set: D3Api.FieldSetCtrl.setCaption};
D3Api.ExpanderCtrl = new function() {
    var _this = this;
    this.init = function(dom) {
        dom.D3Store.mode = D3Api.getProperty(dom, 'mode', 'horizontal');
        dom.D3Store.height = D3Api.getProperty(dom, 'hgt');
        dom.D3Store.width = D3Api.getProperty(dom, 'wdt','auto');
        dom.D3Store.caption_hide = D3Api.getProperty(dom, 'caption_hide');
        dom.D3Store.caption_show = D3Api.getProperty(dom, 'caption_show');
        dom.D3Store.value = D3Api.hasClass(dom, 'show');
        dom.D3Store.captionCont = D3Api.getAllDomBy(dom, '[cont="captionCont"]');
        dom.D3Store.captionCont = dom.D3Store.captionCont[dom.D3Store.captionCont.length-1];
        D3Api.BaseCtrl.initEvent(dom, 'onchange');
        this.init_focus(dom);
    };
    this.getValue = function Expander_getValue(dom) {
        return dom.D3Store.value;
    };
    this.setValue = function Expander_setValue(dom, value) {
        value = (value === undefined) ? !dom.D3Store.value : !!value;
        if(dom.D3Store.value !== value) {
            if(dom.D3Store.value = value) {
                if(dom.D3Store.mode == 'horizontal')
                    D3Api.setStyle(dom, 'height', dom.D3Store.height);
                else if(dom.D3Store.mode == 'vertical')
                    D3Api.setStyle(dom, 'width', dom.D3Store.width);

                D3Api.addClass(dom, 'show');
                if(dom.D3Store.caption_hide || dom.D3Store.caption_show) {
                    _this.setCaption(dom, dom.D3Store.caption_hide);
                }
            }
            else {
                D3Api.removeClass(dom, 'show');
                if(dom.D3Store.mode == 'horizontal')
                    D3Api.setStyle(dom, 'height', '');
                else if(dom.D3Store.mode == 'vertical')
                    D3Api.setStyle(dom, 'width', '');

                if(dom.D3Store.caption_hide || dom.D3Store.caption_show) {
                    _this.setCaption(dom, dom.D3Store.caption_show);
                }
            }
            D3Api.resize();
            dom.D3Base.callEvent('onchange');
        }
        return value;
    };
    this.getCaption = function Expander_getCaption(dom) {
        return D3Api.getTextContent(dom.D3Store.captionCont);
    };
    this.setCaption = function Expander_setCaption(dom, value) {
        value = (D3Api.empty(value)) ? '' : String(value);
        D3Api.addTextNode(dom.D3Store.captionCont, value, true);
        return value;
    };
    this.getCaptionHide = function Expander_getCaptionHide(dom) {
        return dom.D3Store.caption_hide;
    };
    this.setCaptionHide = function Expander_setCaptionHide(dom, value) {
        return dom.D3Store.caption_hide = (D3Api.empty(value)) ? undefined : String(value);
    };
    this.getCaptionShow = function Expander_getCaptionShow(dom) {
        return dom.D3Store.caption_show;
    };
    this.setCaptionShow = function Expander_setCaptionShow(dom, value) {
        return dom.D3Store.caption_show = (D3Api.empty(value)) ? undefined : String(value);
    };
    this.CtrlKeyDown = function(dom, e)
    {
        switch (e.keyCode)
        {
            case 39: //стрелка вправо - развернуть
            case 32://пробел
                D3Api.ExpanderCtrl.setValue(dom, true) ;
                D3Api.stopEvent(e);
                break;
            case 37: //стрелка влево - свернуть
            case 8: // Backspase
                D3Api.ExpanderCtrl.setValue(dom, false) ;
                D3Api.stopEvent(e);
                break;
        }
    }
};
D3Api.controlsApi['Expander'] = new D3Api.ControlBaseProperties(D3Api.ExpanderCtrl);
D3Api.controlsApi['Expander']['value'] = {get: D3Api.ExpanderCtrl.getValue, set: D3Api.ExpanderCtrl.setValue};
D3Api.controlsApi['Expander']['caption'] = {get: D3Api.ExpanderCtrl.getCaption, set: D3Api.ExpanderCtrl.setCaption};
D3Api.controlsApi['Expander']['captionHide'] = {get: D3Api.ExpanderCtrl.getCaptionHide, set: D3Api.ExpanderCtrl.setCaptionHide};
D3Api.controlsApi['Expander']['captionShow'] = {get: D3Api.ExpanderCtrl.getCaptionShow, set: D3Api.ExpanderCtrl.setCaptionShow};
D3Api.CellLabelCtrl = new function() {
    this.getCaption = function CellLabel_getCaption(dom) {
        var cells = dom.rows[0].cells, result = '';
        for(var i = 0; i < cells.length; i++)
            result += cells[i].firstChild.innerHTML;
        return result;
    }
    this.setCaption = function CellLabel_setCaption(dom, value) {
        var cells = dom.rows[0].cells, result = '';
        value = (D3Api.empty(value)) ? '' : String(value);
        for(var i = 0; i < cells.length; i++)
            result += cells[i].firstChild.innerHTML = value.charAt(i);
        return result;
    };
};
D3Api.controlsApi['CellLabel'] = new D3Api.ControlBaseProperties(D3Api.CellLabelCtrl);
D3Api.controlsApi['CellLabel']['caption'] = {get: D3Api.CellLabelCtrl.getCaption, set: D3Api.CellLabelCtrl.setCaption};
D3Api.controlsApi['CellLabel']['width'] = undefined;
D3Api.controlsApi['CellLabel']['height'] = undefined;
D3Api.LinksViewerCtrl = new function(){
/*
 value - должно быть в виде массива json-ов
 [
  {source: "Microsoft", target: "Amazon", link_type: "licensing", source_type: '', target_type: ''},
  {source: "Microsoft", target: "HTC", link_type: "licensing", source_type: '', target_type: ''},
  {source: "Samsung", target: "Apple", link_type: "suit", source_type: '', target_type: ''},
  {source: "Motorola", target: "Apple", link_type: "suit", source_type: '', target_type: ''}
 ]
 стрелка будет идти от source в target и к данным объектам будут применены соответствующие стили source_type, target_type и link_type

 применяются svg стили
    Для линка: если link_type="link_style_name"
    #link_style_name{
     стиль стрелки(только треугольника)
    }
    link.link_style_name{
     стиль линии
    }
    Для вершин source и target: если source_type="source_style_name"
    circle.source_style_name{
     стиль вершины
    }
 */
    this.isReady = false;

    this.init = function(dom){
        D3Api.include_js('Components/LinksViewer/js/d3v3.5.6.js'/*'http://d3js.org/d3.v3.min.js'*/, function(){ D3Api.LinksViewerCtrl.isReady = true;});
    }

    this.setCaption = function(_dom,_value){
        console.log('setCaption');
    }

    this.getCaption = function(_dom){
        console.log('getCaption');
    }

    this.setValue = function(_dom,_value){
        if(!D3Api.LinksViewerCtrl.isReady /*|| !_dom.clientHeight*/){
            setTimeout(function(){ D3Api.LinksViewerCtrl.setValue(_dom,_value);}, 100)
            return;
        }

        _dom['LinksViewer_value'] = _value;


        var links = _value;
        var _types = [];

        for(var i = 0; i < links.length; i++){
            if(_types.indexOf(links[i].link_type) == -1){
                _types.push(links[i].link_type);
            }
        }

        var nodes = {};

        // Compute the distinct nodes from the links.
        links.forEach(function(link) {
          link.source = nodes[link.source] || (nodes[link.source] = {name: link.source, type: link.source_type});
          link.target = nodes[link.target] || (nodes[link.target] = {name: link.target, type: link.target_type});
        });

        var width = _dom.clientWidth,
            height = _dom.clientHeight;

        var force = d3.layout.force()
            .nodes(d3.values(nodes))
            .links(links)
            .size([width, height])
            .linkDistance(150)/*длина стрелки (линии)*/
            .charge(-1200)/*скученность значков, чем меньше число тем на большей дистанции кружки др от друга*/
            .on("tick", tick)
            .start();

        var svg;
        if(svg = _dom.querySelector("svg")) _dom.removeChild(svg);

        svg = d3.select(_dom).append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("class", 'linkviewver-svg');

        //if(!D3Api.hasClass(svg, 'linkviewver-svg')) D3Api.addClass(svg, 'linkviewver-svg');

        // Per-type markers, as they don't inherit styles.
        // заготовка разных видов стрелок (в зависимости от стилей)
        svg.append("defs").selectAll("marker")
            .data(_types)
          .enter().append("marker")
            .attr("id", function(d) { return d; })
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 15)
            .attr("refY", -1.5)
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr("orient", "auto")
          .append("path")
            .attr("d", "M0,-5L10,0L0,5");

        var path = svg.append("g").selectAll("path")
            .data(force.links())
          .enter().append("path")
            .attr("class", function(d) { return "link " + d.link_type; })
            .attr("marker-end", function(d) { return "url(#" + d.link_type + ")"; });

        var circle = svg.append("g").selectAll("circle")
            .data(force.nodes())
          .enter().append("circle")
            .attr("r", 6)
            .attr("class", function(d) { return "circle " + d.type; })
            .call(force.drag);

        var text = svg.append("g").selectAll("text")
            .data(force.nodes())
          .enter().append("text")
            .attr("x", 8)
            .attr("y", ".31em")
            .text(function(d) { return d.name; });

        // Use elliptical arc path segments to doubly-encode directionality.
        function tick() {
          path.attr("d", linkArc);
          circle.attr("transform", transform);
          text.attr("transform", transform);
        }

        function linkArc(d) {
          var dx = d.target.x - d.source.x,
              dy = d.target.y - d.source.y,
              dr = Math.sqrt(dx * dx + dy * dy);
          return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
        }

        function transform(d) {
          return "translate(" + d.x + "," + d.y + ")";
        }
    }

    this.getValue = function(_dom){
        return _dom.LinksViewer_value;
    }

}

D3Api.controlsApi['LinksViewer'] = new D3Api.ControlBaseProperties(D3Api.LinksViewerCtrl);
D3Api.controlsApi['LinksViewer']['value']={get:D3Api.LinksViewerCtrl.getValue,set:D3Api.LinksViewerCtrl.setValue};
D3Api.RepeaterStylerCtrl = new function()
{
    this.init = function(_dom){
        var _rname = _dom.getAttribute('repeatername');
        var _r = _dom.D3Form.getRepeater(_rname);
        var _json = JSON.parse(_dom.firstChild.value);

        var _f = function(json){

            return function(data,clone){D3Api.RepeaterStylerCtrl.setClass(data,clone,json);};

        };

        _r.addEvent('onafter_clone', _f(_json));
    }

    this.setClass = function(_repeaterStylerctrl_data, _repeaterStylerctrl_clone, _repeaterStylerctrl_json){
        var params = [], args = [];
        for (var _repeaterStylerctrl_i in _repeaterStylerctrl_data){
            if(!_repeaterStylerctrl_data.hasOwnProperty(_repeaterStylerctrl_i)){
                continue;
            }
            params.push(_repeaterStylerctrl_i);
            args.push(_repeaterStylerctrl_data[_repeaterStylerctrl_i]);
        }


        for ( var _repeaterStylerctrl_i = 0; _repeaterStylerctrl_i <  _repeaterStylerctrl_json['specs'].length; _repeaterStylerctrl_i++){
            var _repeaterStylerctrl_arr_replace = [];
            var _repeaterStylerctrl_c = _repeaterStylerctrl_json['specs'][_repeaterStylerctrl_i];
            var _repeaterStylerctrl_cond = _repeaterStylerctrl_c['cond'];

            if(!(_repeaterStylerctrl_c['cond'] instanceof Function))
            {
                var _repeaterStylerctrl_r;
                //сначало ищем все даты в кавычках с определением типа, например '01.01.2015'::d
                var _repeaterStylerctrl_regexp = /(['"])(.+?)\1::(\w+)/ig; //["'01.01.2015 15:45'::ms", "'", "01.01.2015 15:45", "ms"],[""01.01.2012"::d", """, "01.01.2012", "d"]
                while(_repeaterStylerctrl_r = _repeaterStylerctrl_regexp.exec(_repeaterStylerctrl_cond)){
                    _repeaterStylerctrl_arr_replace.push([_repeaterStylerctrl_r[0], _repeaterStylerctrl_r[1]+_repeaterStylerctrl_r[2]+_repeaterStylerctrl_r[1], _repeaterStylerctrl_r[3]]);
                }
                //затем ищем переменные с определением типа, например ddate_bgn::ms
                var _repeaterStylerctrl_regexp = /([a-z]\w*)::(\w+)|(systemdate)/ig; //["ddate_bgn::ms", "ddate_bgn", "ms", undefined], ["systemdate", undefined, undefined, "systemdate"]
                while(_repeaterStylerctrl_r = _repeaterStylerctrl_regexp.exec(_repeaterStylerctrl_cond)){
                    _repeaterStylerctrl_arr_replace.push([_repeaterStylerctrl_r[0], _repeaterStylerctrl_r[3]?'\''+_repeaterStylerctrl_r[3]+'\'':(_repeaterStylerctrl_r[1]=='systemdate'?"'systemdate'":_repeaterStylerctrl_r[1]), _repeaterStylerctrl_r[2]]);
                }

                //делаем замену в строке условия
                for(var _repeaterStylerctrl_ii = 0; _repeaterStylerctrl_ii < _repeaterStylerctrl_arr_replace.length; _repeaterStylerctrl_ii++){
                  _repeaterStylerctrl_cond = _repeaterStylerctrl_cond.replace(_repeaterStylerctrl_arr_replace[_repeaterStylerctrl_ii][0], 'D3Api.dateToNum(' + _repeaterStylerctrl_arr_replace[_repeaterStylerctrl_ii][1] + ',' + (_repeaterStylerctrl_arr_replace[_repeaterStylerctrl_ii][2]?'\''+_repeaterStylerctrl_arr_replace[_repeaterStylerctrl_ii][2]+'\'':"'d'") + ')');

                }

                _repeaterStylerctrl_c['cond'] = new Function(params.join(','),'return '+_repeaterStylerctrl_cond+';');
            }
            if(_repeaterStylerctrl_c['cond'].apply(null,args)) {

                if(_repeaterStylerctrl_c['selector']){
                    var _repeaterStylerctrl_list = D3Api.getAllDomBy(_repeaterStylerctrl_clone, _repeaterStylerctrl_c['selector']);

                    for(var l = 0; l < _repeaterStylerctrl_list.length; l++){

                        D3Api.addClass(_repeaterStylerctrl_list[l], 'repeaterstyler');
                        D3Api.addClass(_repeaterStylerctrl_list[l], _repeaterStylerctrl_c['class']);
                    }
                }else{
                    D3Api.addClass(_repeaterStylerctrl_clone, _repeaterStylerctrl_c['class']);
                }
                D3Api.addClass(_repeaterStylerctrl_clone, 'repeaterstyler');
            }

        }
    }
}

D3Api.controlsApi['RepeaterStyler'] = new D3Api.ControlBaseProperties(D3Api.RepeaterStylerCtrl);
D3Api.CodeEditorCtrl = new function() {
    this.init = function(dom)
    {
        D3Api.include_js(D3Api.getOption('path', '')+'external/codemirror510/codemirror-compressed.js',function(){/*основной скрипт*/
             /*css, html, js, php, xml, sql*/
                CodeMirror.defaults['lineNumbers']  = true;/*номера строк*/
                CodeMirror.defaults['autofocus']    = true;/*автофокус*/
                CodeMirror.defaults['theme']        = 'default';/*тема оформления*/

                $textarea       = D3Api.getChildTag(dom,'textarea',0);
                $params         = D3Api.getChildTag(dom,'span',0);

                $params_text    = {};
                if ($params && $params.innerText) {
                    $params_text    = JSON.parse($params.innerText);
                }
                dom.D3Store.CodeMirror = CodeMirror.fromTextArea($textarea, $params_text);

                D3Api.BaseCtrl.initEvent(dom,'onchange');
                dom.D3Base.addEvent('onchange_property',function(property,value){
                    if(property == 'value')
                    {
                        dom.D3Base.callEvent('onchange');
                    }
                });
                dom.D3Store.CodeMirror.on("change", function() {
                    dom.D3Base.callEvent('onchange_property','value');
                });
        });

    }
    this.setValue = function CodeEditor_SetValue(_dom,_value)
    {
        if(!_dom.D3Store.CodeMirror)
        {
            clearTimeout(_dom.D3Base._timeout);
            _dom.D3Base._timeout = setTimeout(function(){D3Api.CodeEditorCtrl.setValue(_dom,_value)},100);
            return;
        }
           _dom.D3Store.CodeMirror.setValue(_value);
           delete _dom.D3Base._timeout;
    }

    this.getValue = function CodeEditor_GetValue(_dom)
    {
        var res = '';
        if (_dom.D3Store.CodeMirror)
        {
            res = D3Api.stringTrim(_dom.D3Store.CodeMirror.getValue());
        }
        return res;
    }
    this.onReadyExecute = function(dom,func)
    {
        if(!dom.D3Store.CodeMirror)
        {
            clearTimeout(dom.D3Base._timeoutReadyExecute);
            var args = arguments;
            dom.D3Base._timeoutReadyExecute = setTimeout(function(){D3Api.CodeEditorCtrl.onReadyExecute.apply(D3Api.CodeEditorCtrl,args);},100);
            return;
        }
        dom.D3Base._timeoutReadyExecute = null;
        delete dom.D3Base._timeoutReadyExecute;
        if(func instanceof Function)
            func.apply(dom,Array.prototype.slice.call(arguments, 2));
    }
    this.getEditor = function(dom)
    {
        return dom.D3Store.CodeMirror;
    }
}
D3Api.controlsApi['CodeEditor'] = new D3Api.ControlBaseProperties(D3Api.CodeEditorCtrl);
D3Api.controlsApi['CodeEditor']['value']={get:D3Api.CodeEditorCtrl.getValue,set:D3Api.CodeEditorCtrl.setValue};
D3Api.controlsApi['CodeEditor']['editor']={get:D3Api.CodeEditorCtrl.getEditor};
D3Api.CKEditorCtrl = new function() {
    this.init = function(dom)
    {
        D3Api.include_js(D3Api.getOption('path', '')+'external/ckeditor/ckeditor.js',function(){/*основной скрипт*/
             /*css, html, js, php, xml, sql*/
                $textarea       = D3Api.getChildTag(dom,'textarea',0);
                if (CKEDITOR.instances.wysiwyg_editor) {
                    CKEDITOR.instances.wysiwyg_editor.destroy(true);
                }
                dom.D3Store.CKEDITOR = CKEDITOR.replace($textarea);
                dom.D3Base.addEvent('onchange_property',function(property,value){
                    if(property == 'value')
                    {
                        dom.D3Base.callEvent('onchange');
                    }
                });
                dom.D3Store.CKEDITOR.on("change", function() {
                    dom.D3Base.callEvent('onchange_property','value');
                });
        });

    }
    this.setValue = function CKEditor_SetValue(_dom,_value)
    {
        if(!_dom.D3Store.CKEDITOR || _dom.D3Store.CKEDITOR.status != 'ready')
        {
            clearTimeout(_dom.D3Base._timeout);
            _dom.D3Base._timeout = setTimeout(function(){D3Api.CKEditorCtrl.setValue(_dom,_value)},100);
            return;
        }
        _dom.D3Store.CKEDITOR.setData(_value);
        delete _dom.D3Base._timeout;
    }

    this.getValue = function CKEditor_GetValue(_dom)
    {
        var res = '';
        if (_dom.D3Store.CKEDITOR)
        {
            res = D3Api.stringTrim(_dom.D3Store.CKEDITOR.getData());
        }
        return res;
    }
    this.getEditor = function(dom)
    {
        return dom.D3Store.CKEDITOR;
    }
}
D3Api.controlsApi['CKEditor'] = new D3Api.ControlBaseProperties(D3Api.CKEditorCtrl);
D3Api.controlsApi['CKEditor']['value']={get:D3Api.CKEditorCtrl.getValue,set:D3Api.CKEditorCtrl.setValue};
D3Api.controlsApi['CKEditor']['editor']={get:D3Api.CKEditorCtrl.getEditor};
D3Api.CustomFilterCtrl = new function()
{
    this.init = function(dom)
    {
        var dt = dom.D3Form.getParamsByName('CustomFilter',D3Api.getProperty(dom,'name'));
        if (!dt){
            dt = D3Api.JSONparse(D3Api.getChildTag(dom,'textarea',0).value);
        }
        dom.D3Form.addEventOnce('oncreate',function(){
            D3Api.CustomFilterCtrl.setValue(dom,dt);
        });
    }
    this.setValue = function(dom,data)
    {
        dom.D3Store.dataSetName = data.dataset;
        if (data.mode){
            if (dom.D3Store.mode && dom.D3Store.mode !== data.mode){
                D3Api.removeClass(dom,data.mode);
            }
            dom.D3Store.mode = data.mode;
            D3Api.addClass(dom,data.mode);
        }
        var n = D3Api.getProperty(dom,'name');
        var rep = dom.D3Form.getRepeater('repeater_'+n);
        rep.removeAllClones();
        if(data.items)
        {
            if(rep)
            {
                for(var i = 0, c = data.items.length; i < c; i++)
                {
                    var item = data.items[i];
                    var cl = rep.addClone(item);
                    cl.style.cssText = item.style;
                }
            }
        }
    }
    this._getDefaultParams = function()
    {
        return {dataset :'',
                mode :'horizontal',
                items: []
        };
    }
    this.onClickItem = function(dom)
    {
        var cf = D3Api.getControlByDom(dom, 'CustomFilter');

	if (cf.D3Store.activeItem == dom)
        {
            // сброс текущего фильтра
            D3Api.removeClass(dom, 'active');
            lastFilters = cf.D3Store.activeItem.clone.data.fields;
            if(lastFilters)
            {
                var dataset = cf.D3Form.getDataSet(cf.D3Store.dataSetName);
                for(var i = 0, c = lastFilters.length; i < c; i++)
                {
                    dataset.addFilterPermanent(lastFilters[i].field);
                }
            }
            cf.D3Store.activeItem = null;
        } else {
            var lastFilters = null;
            if (cf.D3Store.activeItem) {
                lastFilters = cf.D3Store.activeItem.clone.data.fields;
                D3Api.removeClass(cf.D3Store.activeItem, 'active');
            }
            D3Api.addClass(dom, 'active');

            cf.D3Store.activeItem = dom;

            var dataset = cf.D3Form.getDataSet(cf.D3Store.dataSetName);

            if(lastFilters)
            {
                for(var i = 0, c = lastFilters.length; i < c; i++)
                {
                    dataset.addFilterPermanent(lastFilters[i].field);
                }
            }
            var filters = cf.D3Store.activeItem.clone.data.fields;

            for(var i = 0, c = filters.length; i < c; i++)
            {
                dataset.addFilterPermanent(filters[i].field,filters[i].value);
            }
        }
        dataset.refresh();
    }
}

D3Api.controlsApi['CustomFilter'] = new D3Api.ControlBaseProperties(D3Api.CustomFilterCtrl);
D3Api.controlsApi['CustomFilter']['value']={set: D3Api.CustomFilterCtrl.setValue};
D3Api.StoredValuesCtrl = new function()
{
    // раскладка значений по контролам
    this.setParamVals = function(dom,item,name)
    {

        if (!D3Api.isUserEvent()) {
            if (item !== undefined) {
                if (item.clone.data.is_default === '1'){
                    dom.D3Form.setValue('svc_exp_'+name,true);
                }
                else {
                    dom.D3Form.setCaption('svc_combobox_'+name,''); //сброс автоматически установленного первого значения из комбика, если он не по-умолчанию
                    return;
                }
            }
            else {
                return;
            }
        }
        dom.D3Form.setValue('svc_chk_'+name,item.clone.data.is_default);
        if (item.clone){
            var data_ = JSON.parse(item.clone.data.paramvals).pv;
            for(var i = 0,j = data_.length; i < j; i++){
                if(dom.D3Form.controlExist(data_[i].p)){
                    dom.D3Form.setValue(data_[i].p,data_[i].v);
                }
            }
        }
    };
    // сохранение параметров контролов
    this.saveParamVals = function(dom,name,params)
    {
        var ctrl_name,ctrl_value,s_selector = '';
        var pva = new Array;
        if(params && params !== ''){
            var ba = params.split(';');
            for(var i = 0, c = ba.length; i < c; i++){
                if(ba[i] === '') continue;
                s_selector += ',[name="'+ba[i]+'"]';
            }
            s_selector = s_selector.substring(1);
        } else {
            s_selector =    '[name][cmptype="Edit"],'+
                            '[name][cmptype="TextArea"],'+
                            '[name][cmptype="ComboBox"],'+
                            '[name][cmptype="DateEdit"],'+
                            '[name][cmptype="CheckBox"],'+
                            '[name][cmptype="RadioGroup"]';
        }
        var ctrls = D3Api.getAllDomBy(dom.D3Form.DOM,s_selector);
        for (var i = 0,j = ctrls.length; i < j; i++){
            if (dom.D3Form !== ctrls[i].D3Form) continue;
            ctrl_name = ctrls[i].getAttribute("name");
            ctrl_value = dom.D3Form.getValue(ctrl_name);
            if(ctrl_value && ctrl_name !== 'svc_combobox_'+name && ctrl_name !== 'svc_chk_'+name){
                   pva[pva.length] = {p:ctrl_name,v:ctrl_value};
            }
        }
        dom.D3Form.setVar('svc_var_paramval_'+name,D3Api.JSONstringify({pv:pva}));
        dom.D3Form.executeAction('action_svc_'+name+'_save',function(){dom.D3Form.refreshDataSet('ds_svc_'+name);});
    };
};
D3Api.controlsApi['StoredValues'] = new D3Api.ControlBaseProperties(D3Api.StoredValuesCtrl);
D3Api.HyperLinkCtrl = new function(){

    this.init = function(dom)
    {
        this.init_focus(dom);
    }
    this.setCaption = function(_dom,_value)
    {
         _dom.innerHTML =_value;
    }
    this.getCaption = function(_dom)
    {
        return _dom.innerHTML;
    }
    this.setValue= function(_dom,_value)
    {
        D3Api.setProperty(_dom,'keyvalue',_value);
    }
    this.getValue= function(_dom)
    {
        return D3Api.getProperty(_dom,'keyvalue','');
    }
    this.setLink = function(_dom,_value)
    {
        D3Api.setProperty(_dom,'href',_value);
    }
    this.getLink = function(_dom)
    {
        return D3Api.getProperty(_dom,'href', '');
    }
    this.setTitle= function(_dom,_value)
    {
        D3Api.setProperty(_dom,'title',_value);
    }
    this.getTitle= function(_dom)
    {
        return D3Api.getProperty(_dom,'title','');
    }
    this.setUnit= function(_dom,_value)
    {
        D3Api.setProperty(_dom,'unit',_value);
    }
    this.getUnit= function(_dom)
    {
        return D3Api.getProperty(_dom,'unit','');
    }
    this.setOnClose= function(_dom,_value)
    {
        D3Api.setProperty(_dom,'onclose',_value);
    }
    this.getOnClose= function(_dom)
    {
        return D3Api.getProperty(_dom,'onclose','');
    }
    this.setComposition = function(_dom,_value)
    {
        D3Api.setProperty(_dom,'composition',_value);
    }
    this.getComposition = function(_dom)
    {
        return D3Api.getProperty(_dom,'composition');
    }
    this.setCompMethod = function(_dom,_value)
    {
        D3Api.setProperty(_dom,'method',_value);
    }
    this.getCompMethod = function(_dom)
    {
        return D3Api.getProperty(_dom,'method');
    }
    this.setIsView = function(_dom,_value)
    {
        D3Api.setProperty(_dom,'is_view',_value);
    }
    this.getIsView = function(_dom)
    {
        return D3Api.getProperty(_dom,'is_view');
    }
    this.setNewThread = function(_dom,_value)
    {
        D3Api.setProperty(_dom,'newthread',_value);
    }
    this.getNewThread = function(_dom)
    {
        return D3Api.getProperty(_dom,'newthread') === 'true';
    }
    this.setEmptyValue = function(_dom,_value)
    {
        D3Api.setProperty(_dom,'emptyvalue',_value);
    }
    this.getEmptyValue = function(_dom)
    {
        return D3Api.getProperty(_dom,'emptyvalue') === 'true';
    }
    this.setCompVars = function(_dom,_value)
    {
        D3Api.setProperty(_dom,'comp_vars',_value);
    }
    this.getCompVars = function(_dom)
    {
        return D3Api.getProperty(_dom,'comp_vars','');
    }
    this.setCompRequest = function(_dom,_value)
    {
        D3Api.setProperty(_dom,'comp_request',_value);
    }
    this.getCompRequest = function(_dom)
    {
        return D3Api.getProperty(_dom,'comp_request','');
    }
    this.setKeyValueControl = function(_dom,_value)
    {
        D3Api.setProperty(_dom,'keyvaluecontrol',_value);
    }
    this.getKeyValueControl = function(_dom)
    {
        return D3Api.getProperty(_dom,'keyvaluecontrol');
    }
    this.setTarget = function(_dom,_value)
    {
        D3Api.setProperty(_dom,'target',_value);
    }
    this.getTarget = function(_dom)
    {
        return D3Api.getProperty(_dom,'target','');
    }
    this.CtrlKeyDown = function(dom, e)
    {
        switch (e.keyCode)
        {
            case 32: //Enter
                dom.click();
                D3Api.stopEvent(e);
                break;
        }
    };

    this.onClick = function(dom)
    {
        var unit = this.getUnit(dom);
        var keyvaluecontrol = this.getKeyValueControl(dom);
        var composition = this.getComposition(dom);
        var method = this.getCompMethod(dom);
        var is_view = this.getIsView(dom);
        var comp_vars = this.getCompVars(dom);
        var comp_request = this.getCompRequest(dom);
        var newthread = this.getNewThread(dom);
        var emptyvalue = this.getEmptyValue(dom);
        var target = this.getTarget(dom);
        var link = this.getLink(dom);
        var id;
        var onclose = this.getOnClose(dom);
        var onclose_func = onclose ? dom.D3Form.execDomEventFunc(dom,onclose) : undefined;
        var append_filter = D3Api.getProperty(dom,'append_filter','');

        if (link.length > 0) return true; // если указан href - ничего не делаем, дальше вызывается стандартный клик по ссылке

        if (!keyvaluecontrol)
            id = this.getValue(dom);
        else{
            //берем значение из привязанного контрола
            if (!dom.D3Form.controlExist(keyvaluecontrol)){
                D3Api.notify('Внимание!', 'Контрол со значением не найден!', { modal: true });
                D3Api.stopEvent();
                return false;
            }
            id = dom.D3Form.getValue(keyvaluecontrol);
        }

        // проверяем обязателен ли id
        if (!id && !emptyvalue){
            D3Api.notify('Внимание!', 'Значение не выбрано!', { 'expires':2000 });
            D3Api.stopEvent();
            return false;
        }

        if (!unit){ // не указан раздел - переходим по ссылке, указанной в value
            link = id;
            D3Api.HyperLinkCtrl.setLink(dom, link);
            return true;
            //.. дальше вызывается стандартный клик по ссылке
        }
        else{ // раздел указан
            if (target == '_blank'){
                link = '?unit='+unit+(composition ? '&composition='+composition : '')+(method ? '&method='+method : '')+(id ? '&id='+id : '');
                D3Api.HyperLinkCtrl.setLink(dom, link);
                return true;
                //.. дальше вызывается стандартный клик по ссылке
            }
        }

        var vars = {};
        var request = {};

        // протаскиваем доп. переменные
        if (comp_vars){
            this.parseCompVars(dom,comp_vars,vars);
        }
        if (comp_request){
            this.parseCompVars(dom,comp_request,request);
        }

        if (append_filter) {
            var obj_tmp = append_filter.split(';');
            var res = [];

            for (var i = 0; i < obj_tmp.length; i++) {
                var obj = obj_tmp[i].split(':');

                if (obj[0] == 'ctrl') res[i] = dom.D3Form.getValue(obj[1]);
                else if (obj[0] == 'const') res[i] = obj[1];
                else if (obj[0] == 'var') {
                    var varName = obj[1].split('.');
                    if (!varName[1]) res[i] = dom.D3Form.getVar(varName[0]);
                    else res[i] = dom.D3Form.getVar(varName[0]) ? dom.D3Form.getVar(varName[0])[varName[1]] : '';
                }
                else res[i] = obj[0];
            }

            var result = {append_filter: res.join(';')};
            Object.assign(request,result);
        }

        var params = {
            composition: composition,
            method: method,
            request: request,
            vars: vars,
            isView : is_view,
            container: D3Api.MainDom,
            thread: newthread,
            newthread: newthread,
            onclose: onclose_func
        };

        D3Api.openFormByUnit(dom.D3Form, unit, id, params);
    };

    this.parseCompVars = function(dom, source, dest){
        var sourceData = source.split(';'); // массив всех переменных

        for (var i = 0; i < sourceData.length; i++){
            var data = sourceData[i].split(':'); // формируем массив [0=>NAME, 1=TYPE, 2=>VALUE]

            if (!data[2])                value = data[1]; // если данные в формате NAME:VALUE - считаем константой
            else if (data[1] == 'const') value = data[2]; // константа
            else if (data[1] == 'ctrl')  value = dom.D3Form.getValue(data[2]); // из контрола
            else if (data[1] == 'var'){
                var sourceVarName = data[2].split('.'); //для объектов

                if (!sourceVarName[1]) value = dom.D3Form.getVar(sourceVarName[0]);// не объект
                else value = dom.D3Form.getVar(sourceVarName[0]) ? dom.D3Form.getVar(sourceVarName[0])[sourceVarName[1]] : null; // объект
            }

            // преобразуем к boolean
            if (value === 'false') value = false;
            if (value === 'true')  value = true;

            var destVarName = data[0].split('.'); // имя переменной или объекта

            if (!destVarName[1]) dest[destVarName[0]] = value; // не объект
            else{ // объект
                if (!dest[destVarName[0]]) dest[destVarName[0]] = {};
                dest[destVarName[0]][destVarName[1]] = value;
            }
        }
    }
};

D3Api.controlsApi['HyperLink'] = new D3Api.ControlBaseProperties(D3Api.HyperLinkCtrl);
D3Api.controlsApi['HyperLink']['caption']={get:D3Api.HyperLinkCtrl.getCaption,set:D3Api.HyperLinkCtrl.setCaption};
D3Api.controlsApi['HyperLink']['value']={get:D3Api.HyperLinkCtrl.getValue,set:D3Api.HyperLinkCtrl.setValue};
D3Api.controlsApi['HyperLink']['title']={get:D3Api.HyperLinkCtrl.getTitle,set:D3Api.HyperLinkCtrl.setTitle};
D3Api.controlsApi['HyperLink']['unit']={get:D3Api.HyperLinkCtrl.getUnit,set:D3Api.HyperLinkCtrl.setUnit};
D3Api.controlsApi['HyperLink']['composition']={get:D3Api.HyperLinkCtrl.getComposition,set:D3Api.HyperLinkCtrl.setComposition};
D3Api.controlsApi['HyperLink']['method']={get:D3Api.HyperLinkCtrl.getCompMethod,set:D3Api.HyperLinkCtrl.setCompMethod};
D3Api.controlsApi['HyperLink']['is_view']={get:D3Api.HyperLinkCtrl.getIsView,set:D3Api.HyperLinkCtrl.setIsView};
D3Api.controlsApi['HyperLink']['newthread']={get:D3Api.HyperLinkCtrl.getNewThread,set:D3Api.HyperLinkCtrl.setNewThread};
D3Api.controlsApi['HyperLink']['emptyvalue']={get:D3Api.HyperLinkCtrl.getEmptyValue,set:D3Api.HyperLinkCtrl.setEmptyValue};
D3Api.controlsApi['HyperLink']['comp_vars']={get:D3Api.HyperLinkCtrl.getCompVars,set:D3Api.HyperLinkCtrl.setCompVars};
D3Api.controlsApi['HyperLink']['comp_request']={get:D3Api.HyperLinkCtrl.getCompRequest,set:D3Api.HyperLinkCtrl.setCompRequest};
D3Api.controlsApi['HyperLink']['keyvaluecontrol']={get:D3Api.HyperLinkCtrl.getKeyValueControl,set:D3Api.HyperLinkCtrl.setKeyValueControl};
D3Api.controlsApi['HyperLink']['target']={get:D3Api.HyperLinkCtrl.getTarget,set:D3Api.HyperLinkCtrl.setTarget};
D3Api.controlsApi['HyperLink']['href']={get:D3Api.HyperLinkCtrl.getLink,set:D3Api.HyperLinkCtrl.setLink};
D3Api.controlsApi['HyperLink']['onclose']={get:D3Api.HyperLinkCtrl.getOnClose,set:D3Api.HyperLinkCtrl.setOnClose};/**
 * @attr dataset         - DataSet, на который будет наложен фильтр
 * @attr fields          - поля, на которые будут наложены условия фильтрации DataSet'a
 *                         если поиск простой -  указываются прсевдонимы, если используется функция расширения, то поля указываются вместе с алиасами;
 * @attr afiltervar      - имя переменной фильтра в DataSet'е, указывается при afilterfunction
 * @attr afilterfunction - функция для получения фильтрации, должна принимать 3 параметра (список полей, значения поиска, с учетом регистра)
 *                         к примеру (select core.tst(ps_search_fields varchar,ps_search_value varchar,pn_register_use numeric))
 *                       - если атрибу не указан, то используется стандартная фильтрация, но по нескольким полям
 *                         при использовании компоннета у DataSet'a, указанного в атрибуте dataset, необходимо использовать "compile=true"
 *                         в нужном месте запроса добавить блок
 *                         @if (:<значение из атрибута afiltervar>) {
 *                           and
 *                           @echo :<значение из атрибута afiltervar>
 *                         @}
 * Пример компонента:
 * простой поиск
 *   <cmpAdditionalFilter name="search" dataset="DS" fields="caption;code" />
 * с сипользованием функции расширения
 *   <cmpAdditionalFilter name="search" dataset="DS" fields="t.caption;s.code" afilterfunction="core.tst" afiltervar="a_filter_sql"/>
 *   DataSet:
 *   @if (:a_filter_sql) {
 *     and
 *     @echo :a_filter_sql
 *   @}
 */
D3Api.AdditionalFilterCtrl = new function()
{
    this.init = function(dom)
    {
        var ds_name     = D3Api.getProperty(dom, 'dataset', false),
            fields      = D3Api.getProperty(dom, 'fields', false),
            afiltervar  = D3Api.getProperty(dom, 'afiltervar', false),
            afilterctrl = D3Api.getProperty(dom, 'name');
        if (!ds_name || !fields){
            return;
        }
        var f_function  = D3Api.getProperty(dom, 'afilterfunction', false),  //функция БД для получения условий фильтрации DataSet'a
            ds          = dom.D3Form.getDataSet(ds_name);
        if(f_function){
            ds.afilter = {};
            ds.afilter.afilterfunction = f_function;
            ds.afilter.afilterreguse   = 0;
            ds.afilter.afilterfields   = fields;
            ds.afilter.afiltervar      = afiltervar;
            ds.afilter.afilterctrl     = afilterctrl;
        }else{
            ds.addFilterItem(afilterctrl+'_afilter_edit', 'value', fields, true, 'none', 'both', 'text_af');
        }
    };
    this.filterKeyPress = function(dom)
    {
        var e = D3Api.getEvent();
        if(e.keyCode != 13)
            return;
        D3Api.AdditionalFilterCtrl.search(dom);
    };
    this.search = function(dom)
    {
        var afilter  = D3Api.getControlByDom(dom, 'AdditionalFilter');
        var ds_name  = D3Api.getProperty(afilter,'dataset');
        afilter.D3Form.refreshDataSet(ds_name);
    };
    this.setCaseFilter = function(dom){
        var afilter     = D3Api.getControlByDom(dom, 'AdditionalFilter');
        var ds_name     = D3Api.getProperty(afilter,'dataset'),
            f_function  = D3Api.getProperty(afilter,'afilterfunction', false),
            ds          = afilter.D3Form.getDataSet(ds_name);
        if(f_function){
            ds.sysinfo.properties['afilterreguse']    = D3Api.CheckBoxCtrl.getValue(dom)?1:0;
        }else{
            ds.filters.ctrl_add_filter.u = !D3Api.CheckBoxCtrl.getValue(dom);
        }
        if(D3Api.AdditionalFilterCtrl.getValue(afilter)){
            D3Api.AdditionalFilterCtrl.search(dom);
        }
    };
    this.getEdit = function AdditionalFilter_getEdit(_dom)
    {
        return D3Api.getChildTag(_dom,'div', 0);
    }
    this.getValue = function AdditionalFilter_getValue(_dom)
    {
        var edit = D3Api.AdditionalFilterCtrl.getEdit(_dom);
        return D3Api.EditCtrl.getValue(edit);
    }

    this.setValue = function AdditionalFilter_setValue(_dom,_value)
    {
        if (_value === undefined) _value = null;
        var edit = D3Api.AdditionalFilterCtrl.getEdit(_dom);
        D3Api.EditCtrl.setValue(edit, _value);
    }
};
D3Api.controlsApi['AdditionalFilter'] = new D3Api.ControlBaseProperties(D3Api.AdditionalFilterCtrl);
D3Api.controlsApi['AdditionalFilter']['value']={get:D3Api.AdditionalFilterCtrl.getValue,set: D3Api.AdditionalFilterCtrl.setValue};D3Api.InfoAboutRecordCtrl = new function()
{
    this.init = function(dom)
    {
        this.init_focus(dom);

        D3Api.BaseCtrl.initEvent(dom,'onchange');
        dom.D3Base.addEvent('onchange_property',function(property,value){
            if (property == 'value')
            {
                dom.D3Base.callEvent('onchange');
            };
        });
    };

    this.setValue = function(dom,value)
    {
        D3Api.setProperty(dom,'keyvalue',value);
    };

    this.getValue = function(dom)
    {
        return D3Api.getProperty(dom,'keyvalue','');
    };

    this.getUnit = function (dom) {
        return D3Api.getProperty(dom,'unit','');
    };

    this.setUnit = function (dom, value) {
        D3Api.setProperty(dom,'unit',value);
    };

    this.openInfoAboutRecordForm = function (dom) {
        dom.D3Form.openForm('System/Logs/logs_by_unit', {
            vars: {
                data:{
                    unit_id: D3Api.InfoAboutRecordCtrl.getValue(dom),
                    unitcode: D3Api.InfoAboutRecordCtrl.getUnit(dom)
                }
            }
        }, D3Api.MainDom);
    };

    this.setVisible = function (dom) {
        dom.D3Form.setVisible(dom, D3Api.InfoAboutRecordCtrl.getValue(dom));
    };
};
D3Api.controlsApi['InfoAboutRecord'] = new D3Api.ControlBaseProperties(D3Api.InfoAboutRecordCtrl);
D3Api.controlsApi['InfoAboutRecord']['value'] = {get: D3Api.InfoAboutRecordCtrl.getValue, set: D3Api.InfoAboutRecordCtrl.setValue};
D3Api.controlsApi['InfoAboutRecord']['unit'] = {get: D3Api.InfoAboutRecordCtrl.getUnit, set: D3Api.InfoAboutRecordCtrl.setUnit};



D3Api.InfoBoxCtrl = new function () {
    this.setCaption = function (dom, value){
        var textContainer = D3Api.getAllDomBy(dom,'.infobox_Ctrl_text')[0];
        if (textContainer)
            value = value ? value.replace(/\\n/g,'<br/>') : value;
            textContainer.innerHTML = value;
    };

    this.getCaption = function(dom)
    {
        var textContainer = D3Api.getAllDomBy(dom,'.infobox_Ctrl_text')[0];
        return textContainer ? textContainer.innerHTML : null;
    }
};

D3Api.controlsApi['InfoBox'] = new D3Api.ControlBaseProperties(D3Api.InfoBoxCtrl);
D3Api.controlsApi['InfoBox']['caption']={get:D3Api.InfoBoxCtrl.getCaption,set:D3Api.InfoBoxCtrl.setCaption};
D3Api.ToolbarCtrl = new function()
{
    this.init = function(dom)
    {
        D3Api.BaseCtrl.initEvent(dom,'onchange');
        dom.D3Base.addEvent('onchange_property',function(property,value){
            if (property == 'value')
            {
                dom.D3Base.callEvent('onchange');
            };
        });
    };

    this.setValue= function(dom,value)
    {
        D3Api.setProperty(dom,'value',value);
    };

    this.getValue= function(dom)
    {
        return D3Api.getProperty(dom,'value','');
    };
    this.setUnitcode= function(dom,value)
    {
        D3Api.setProperty(dom,'unitcode',value);
    };

    this.getUnitcode= function(dom)
    {
        return D3Api.getProperty(dom,'unitcode','');
    };


    this.onChangeToolbar = function (dom) {
        if(D3Api.getProperty(dom,'df','')){
            dom.D3Form.refreshDataSet('DS_toolbar_status_list_'+ D3Api.getProperty(dom,'name',''));
        };
        if(D3Api.getProperty(dom,'sttf','')){
            dom.D3Form.refreshDataSet('DS_toolbar_sttf_list_'+ D3Api.getProperty(dom,'name',''));
        };
        if(D3Api.getProperty(dom,'info','')){
            dom.D3Form.setValue('info_about_record_'+ D3Api.getProperty(dom,'name',''), dom.D3Form.getValue(D3Api.getProperty(dom,'name','')));
        };

    };

    this.statusHistory = function (dom) {
        dom.D3Form.openForm('df/df_status_history', {
            vars: {
                identifier: dom.D3Form.getValue(D3Api.getProperty(dom,'toolbar',''))
            }
        },D3Api.MainDom);
    };

    this.onChangeDf = function (dom, callback) {
        if(!D3Api.isUserEvent())return;
        var ctrl = dom.D3Form.getControlProperty(D3Api.getProperty(dom,'name',''),'data');

        if (!ctrl.actioncode) return;
        if(ctrl.use_dialog==1){
            if(dom.modeValues){
                dom.D3Form.setValue(dom,dom.modeValues.old_value);
            }
            dom.D3Form.getValue(D3Api.getProperty(dom,'toolbar',''));
            dom.D3Form.openForm('df/df_dialog_generate', {
                request:{
                    df_flow_id:ctrl.df_flow_id,
                    actioncode:ctrl.actioncode,
                    unitcode:ctrl.unitcode,
                    id:dom.D3Form.getValue(D3Api.getProperty(dom,'toolbar',''))
                },
                modal_form: true,
                onclose: function (result) {
                    if (result) {
                        dom.D3Form.refreshDataSet('DS_toolbar_status_list_'+ D3Api.getProperty(dom,'toolbar',''), function () {
                            if (typeof callback === 'function'){
                                callback();
                            };
                        });
                    }
                }
            },D3Api.MainDom);
        }else{
            var req = {
                toolbar:{
                    type: 'Toolbar',
                    params: {
                        unitcode: ctrl.unitcode,
                        actioncode: ctrl.actioncode,
                        id: dom.D3Form.getValue(D3Api.getProperty(dom,'toolbar',''))
                    }
                }
            };
            D3Api.requestServer({
                                    url: 'request.php',
                                    method: 'POST',
                                    urlData:{
                                        action: 'toolbarDfSetStatus'
                                    },
                                    data: {
                                        request: D3Api.JSONstringify(req)
                                    },
                                    contextObj:dom,
                                    onSuccess: function(res) {
                                        if(res.match(/(?:MESSAGE_TEXT:)([\s\S]+?)(?:PG_EXCEPTION_DETAIL:|$)/)){
                                            dom.D3Form.setValue(D3Api.getProperty(dom,'name',''), '');
                                            D3Api.alert_msg(res);
                                            return;
                                        }
                                        var result = JSON.parse(res);
                                        if(result['toolbarDfSetStatus'].error){
                                            D3Api.alert_msg(result['toolbarDfSetStatus'].error);
                                            dom.D3Form.setValue(D3Api.getProperty(dom,'name',''), '');
                                            return;
                                        };
                                        dom.D3Form.refreshDataSet('DS_toolbar_status_list_'+ D3Api.getProperty(dom,'toolbar',''), function () {
                                            if (typeof callback === 'function'){
                                                callback();
                                            };
                                        });
                                    },
                                    onError: function (res) {
                                        D3Api.alert_msg(res);
                                    }
                                });
        }
    };
    this.onChangeSttf = function (dom) {
        if(!D3Api.isUserEvent())return;
        var data = dom.D3Form.getControlProperty(D3Api.getProperty(dom,'name',''), 'data')
        if(!data.code)return;

        dom.D3Form.openForm('StatisticForms/sttf_generate', {
            request: {
                sttf_id: data.id,
                sttf_synchronous: 1
            },
            vars: {
                sttf_data: {
                    id: dom.D3Form.getValue(D3Api.getProperty(dom,'toolbar','')),
                }
            }
        }, D3Api.MainDom);
        dom.D3Form.setValue(D3Api.getProperty(dom,'name',''), '');

    }
};

D3Api.controlsApi['Toolbar'] = new D3Api.ControlBaseProperties(D3Api.ToolbarCtrl);
D3Api.controlsApi['Toolbar']['value'] = {get: D3Api.ToolbarCtrl.getValue, set: D3Api.ToolbarCtrl.setValue};
D3Api.controlsApi['Toolbar']['unitcode'] = {get: D3Api.ToolbarCtrl.getUnitcode, set: D3Api.ToolbarCtrl.setUnitcode};
D3Api.controlsApi['ToolbarItemGroup'] = new D3Api.ControlBaseProperties(D3Api.ToolbarCtrl);

D3Api.DialogCtrl = new function()
{
    this.init = function(dom)
    {
    };

    this.setValue= function(dom,value)
    {
        var ctrlName = D3Api.getProperty(dom,'name','');
        var domTextControl = D3Api.getDomByName(dom, ctrlName +'_text');
        D3Api.LabelCtrl.setCaption(domTextControl, value);
    };

    this.getValue= function(dom)
    {
        var ctrlName = D3Api.getProperty(dom,'name','');
        var domTextControl = D3Api.getDomByName(dom, ctrlName +'_text');
        return D3Api.LabelCtrl.getCaption(domTextControl);
    };

    this.setVisible = function (dom, value) {
        var ctrlName = D3Api.getProperty(dom,'name','');
        if(!ctrlName)return 'Компонент с именем ' + ctrlName + ' не найден!';
        if(value){
            D3Api.addClass(D3Api.getDomByName(D3Api.MainDom, ctrlName), "active");
            D3Api.addClass(D3Api.getDomByName(D3Api.MainDom, ctrlName + "_background"), "active");
        }else {
            D3Api.removeClass(D3Api.getDomByName(D3Api.MainDom, ctrlName), "active");
            D3Api.removeClass(D3Api.getDomByName(D3Api.MainDom, ctrlName + "_background"), "active");
        };
    };

    this.setCaption = function (dom, value) {
        var ctrlName = D3Api.getProperty(dom,'name','');
        var domTextControl = D3Api.getDomByName(dom, ctrlName +'_caption');
        D3Api.LabelCtrl.setCaption(domTextControl, value);
    };

    this.getCaption = function (dom) {
        var ctrlName = D3Api.getProperty(dom,'name','');
        var domTextControl = D3Api.getDomByName(dom, ctrlName +'_caption');
        return D3Api.LabelCtrl.getCaption(domTextControl);
    };
};

D3Api.controlsApi['Dialog'] = new D3Api.ControlBaseProperties(D3Api.DialogCtrl);
D3Api.controlsApi['Dialog']['value'] = {get: D3Api.DialogCtrl.getValue, set: D3Api.DialogCtrl.setValue};
D3Api.controlsApi['Dialog']['visible'] = {set: D3Api.DialogCtrl.setVisible};
D3Api.controlsApi['Dialog']['caption'] = {get:D3Api.DialogCtrl.getCaption, set: D3Api.DialogCtrl.setCaption};})();D3Api.SYS_CACHE_UID = "c582d9baca1a0d8e698097a4f741e7270";D3Api.SYS_CONFIG = {"formCache":false,"showDependence":false};D3Api.SYS_CONFIG.debug = 1;D3Api.startInit = function (){};


//--------------------------------------------
function getBaseProperties()
{
    function cloneObj(obj)
    {
 	if(typeof obj !== 'object')
 	{
   		return obj;
 	}
        var ncl = {};
        if (obj instanceof Array)ncl = new Array();
 	var nv;
 	for(var prName in obj)
 	{
            if(obj.hasOwnProperty(prName))
            {
                nv = obj[prName];
                if(nv && typeof v === 'object') ncl[prName] = cloneObj(nv); else ncl[prName] = nv;
            }
	}
 	return ncl;
    }

    return cloneObj(D3Api.ControlBaseProperties);
}
function isObject(_object) {
    return (_object instanceof Object) || (window['Node'] && _object instanceof window['Node']);
};
function isExistsControlByName(_controlName,skip){
	return getPage(skip).isExistsControlByName(_controlName,false);
}

function getPage(skip) {
    if (skip == null) {
        skip = 0;
    }else{
        if(skip > 0){
            console.warn('%cУстаревшее: Параметр skip является устаревшим.',"color: yellow; font-style: italic; background-color: green; padding: 2px;");
        }
    }
    var _page = SYS_pages[SYS_pages.length - skip - 1];
    if (!isObject(_page)) {
        _page = SYS_pages_window[SYS_pages_window.length - 1];
        if (!isObject(_page)) {
            _page = new DNullPage();
        }
    }
    while (skip > 0) {
        _page = _page.prevPage;
        skip--;
    }
    return _page;
}
//--------------------------------------------