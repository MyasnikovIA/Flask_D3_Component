var SYS_ROOTDOM =
    window.addEventListener || window.attachEvent
        ? window
        : document.addEventListener
        ? document
        : null;
var _GET_ = returnGET();

function showAllProperty(_dO){
	for(var _pN in _dO){
        if(_dO.hasOwnProperty(_pN)){
            alert(_pN+'='+_dO[_pN]);
        }

    }
}
function onContextMenuBody(event)
{
    event = event || window.event;

    var target = getEventTarget(event);

    return (target.value != undefined);
}

/**
 * Проверяет объект на пустоту
 * @param obj
 * @returns {boolean}
 *
 * @see https://stackoverflow.com/questions/679915/how-do-i-test-for-an-empty-javascript-object
 */
function isEmptyObject(obj) {
    if (typeof obj === "undefined")
        return true;
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop)) {
            return false;
        }
    }

    return JSON.stringify(obj) === JSON.stringify({});
}
function isObject(_object){
    return (_object instanceof Object) || (Node && _object instanceof Node);
}
function isNodeList(_object){
    return _object instanceof NodeList;
}
function isUndefined(_object){
    return typeof(_object)=='undefined';
}
function inArray(array, item) {
    return [].indexOf.call(array, item) != -1;
}
function hasProperty(_dO,_pN){
    if (_dO == null){
    	return false;
    }
	if (typeof _dO['hasAttribute']==='function'){
        return _dO.hasAttribute(_pN);
    }
	if (_dO.attributes){
        return typeof(_dO.attributes[_pN.toLowerCase()])!='undefined';
    }
	return false;
}
function quickGetProperty(_dO,_pN){
    return _dO.attributes[_pN.toLowerCase()].value;
}
function getProperty(_dO,_pN,_dV){
    if(hasProperty(_dO,_pN)){
        return quickGetProperty(_dO,_pN);
    }
    return _dV;
}
function setAttribute(_dO,_aN,_aV){
    _dO.setAttribute(_aN,_aV);
}
function emptyFunction(){}
function nullFunction(){
    return null;
}
var SYS_ControlActions=new Array();
SYS_ControlActions['clone']=new Array();
SYS_ControlActions['clone']['value']={
    set:function (_domObject,_value){
        _domObject.setAttribute('value',_value,false);
        },
    get:function(_domObject){
        return getProperty(_domObject,'value',null);
    }
}
SYS_ControlActions['clone']['data']={
    set:function (_domObject,_data){
        if(!isObject(_domObject.clone)){
            showError('Объект не является наследником клонируемого обьекта');
        }
        _domObject.clone.data=_data;
    },
    get:function (_domObject){
        if(!isObject(_domObject.clone)){
            showError('Объект не является наследником клонируемого обьекта');
            return new Array();
        }
        return _domObject.clone.data
    }
}
function setControlValue(_dO,_v){
    _setControlProperty(_dO,'value',_v);
}
function getControlValue(_dO){
    return _getControlProperty(_dO,'value');
}
function setControlCaption(_dO,_c){
    _setControlProperty(_dO,'caption',_c);
}
function getControlCaption(_dO){
    return _getControlProperty(_dO,'caption');
}
function showError(_message,_error){
    return _SYS_ERROR_OBJECT.showError(_message,_error,true);
}
function showOracleError(_message,_error){
    _SYS_ERROR_OBJECT.showOracleError(_message,_error);
    return null;
}
function showXmlError(_xml){
    _SYS_ERROR_OBJECT.showXmlError(_xml);
}
function showOracleXmlError(_xml,_invars){
    _SYS_ERROR_OBJECT.showOracleXmlError(_xml,_invars);
}
function confirmWindow(_message,_okfunction,_cancelfunction){
    var win = new DConfirmWindow(_message,_okfunction,_cancelfunction);
    win.show();
}
function alertWindow(_message,_okfunction){
    var win = new DAlertWindow(_message,_okfunction);win.show();
}
//------------------------------------------
function wndResize()
{
     runCalcSize();
     D3Api.resize();
     /*
    if(window.SYS_current_theme == 'bars'){
        var h = document.getElementById('_header');
        var c = document.getElementById('_mainContainer');
        if (h && c)
            c.style.height = (window.innerHeight-h.offsetHeight-5)+'px';
        runCalcSize();
        if(window['D3Api'])
            D3Api.resize();
    }else if(window.SYS_current_theme == 'new'){
        runCalcSize();
        D3Api.resize();
    }
    */
}

function setWindowCaption(_caption,skip){
	getPage(skip).setPageCaption(_caption);
}
function setConfirmOnCloseFunction(_type,skip){
	if(_type == 1){
        getPage(skip).setPageConfirmOnClose();
    }
}
function getWindowCaption(skip){
	return getPage(skip).getPageCaption();
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
function closeWindow(skip,page,res){
    var p = (page)?page:getPage(skip);
    if('form' in p && !p.destroyed){
        p.form.beforeClose();
        p.beforeClose(res);
        p.getContainer().close();
        p.close(res);
        removePage(skip,p);
        p.afterClose(res);
        p.destroyAll(skip,p);
        clearSelection();
        p = null;
        delete p;
    }
}
function executeModule(_moduleName,
                       _callBackAcceptMethod,
                       _callBackCancelMethod,
                       _callBackObject,
                       async,
                       skip,
                       silent) {
	return getPage(skip).executeModule(_moduleName,
                                       _callBackAcceptMethod,
                                       _callBackCancelMethod,
                                       _callBackObject,
                                       async,
                                       silent);
}
function executeAction(_actionName,
                       _callBackAcceptMethod,
                       _callBackCancelMethod,
                       _callBackObject,
                       async,
                       skip,
                       silent) {
	return getPage(skip).executeServerAction(_actionName,
                                             _callBackAcceptMethod,
                                             _callBackCancelMethod,
                                             _callBackObject,
                                             async,
                                             silent);
}
function setValue(_controlName,_value,skip){
	getPage(skip).setValue(_controlName,_value);
}
function getValue(_controlName,skip){
	return getPage(skip).getValue(_controlName);
}
function setVar(_name,_value,skip){
	getPage(skip).setVar(_name,_value);
}
function getVar(_name,skip){
	return getPage(skip).getVar(_name);
}
function setCaption(_controlName,_caption,skip){
	getPage(skip).setCaption(_controlName,_caption);
}
function getCaption(_controlName,skip){
	return getPage(skip).getCaption(_controlName);
}
function setHint(_controlName,_hint,skip){
    getPage(skip).setHint(_controlName,_hint);
}
function getHint(_controlName,skip){
    return getPage(skip).getHint(_controlName);
}
function setEnabled(_controlName,_value,skip){
    getPage(skip).setEnabled(_controlName,_value);
}
function getEnabled(_controlName,skip){
    return getPage(skip).getEnabled(_controlName);
}
function refreshDataSet(_dataSetName,instead,skip){
	if(instead==null){
        instead=true;
    }
	return getPage(skip).refreshDataSet(_dataSetName,instead);
}
function getDataSet(_dataSetName,_show_error,skip){
    return getPage(skip).getDataSet(_dataSetName,_show_error);
}
function base(skip){
    console.warn('%cУстаревшее: base().ИмяФункции() является устаревшим. Используйте Form.ИмяФункции()',"color: yellow; font-style: italic; background-color: blue; padding: 2px;");
    return getPage(skip).getNamespace();
}
function reloadWindow(skip){
	getPage(skip).reload();
};

function openInfoWindow() {
    var currentForm = getPage().d3Form ? getPage().d3Form : getPage().form;
    var isReport = currentForm.name.split('/')[1] === 'showReport';

    if (isReport) {
        var iframe = getPage().form.containerForm.querySelector('iframe');
        currentForm = iframe.contentDocument.querySelector('[cmptype=Form]').form;
    };

    openWindow({
        name: 'System/InfoAboutForm/InfoAboutForm',
        vars: {
            'mainForm': currentForm.name,
            'userForms': getPage().d3Form ?  D3Api.MainDom.userForms : currentForm.userForms,
            'subForms': getPage().d3Form ?  D3Api.MainDom.subForms : currentForm.subForms,
        }
    }, true);
};

function requestDataSetCount(_dataSetName,
                             _callBackFunction,
                             _callBackObject,
                             skip){
	getPage(skip).requestDataSetCount(_dataSetName,
                                      _callBackFunction,
                                      _callBackObject);
}
function getControlByName(_controlName,skip,_show_error){
	return getPage(skip).getControlByName(_controlName,_show_error);
}

function isExistsControlByName(_controlName,skip){
	return getPage(skip).isExistsControlByName(_controlName,false);
}

function setControlProperty(_controlName,_propertyName,_propertyValue,skip){
	getPage(skip).setControlProperty(_controlName,_propertyName,_propertyValue);
}
function getControlProperty(_controlName,_propertyName,skip){
	return getPage(skip).getControlProperty(_controlName,_propertyName);
}
function _setControlProperty(_domObject,_propertyName,_propertyValue) {
    var cmpType = getProperty(_domObject, 'cmptype', 'unknownControl');
    if (SYS_ControlActions[cmpType] == undefined || SYS_ControlActions[cmpType][_propertyName] == undefined) {
        showError('Отсутствует обработчик для установки свойства ' + cmpType + '::' + _propertyName);
        return;
    }
    SYS_ControlActions[cmpType][_propertyName].set(_domObject, _propertyValue);
}
function _getControlProperty(_domObject,_propertyName) {
    //	return SYS_ControlActions[getProperty(_domObject,'cmptype','unknownControl')][_propertyName].get(_domObject);
    var cmpType = getProperty(_domObject, 'cmptype', 'unknownControl');
    if (SYS_ControlActions[cmpType] == undefined || SYS_ControlActions[cmpType][_propertyName] == undefined) {
        showError('Отсутствует обработчик для получения свойства ' + cmpType + '::' + _propertyName);
        return;
    }
    var valueGet = SYS_ControlActions[cmpType][_propertyName].get(_domObject);
    var ref = {value: valueGet};
    var _controlName = getProperty(_domObject, 'name', '');
    if (_controlName != '') {
        getPageByDom(_domObject).dispatchEvent('ongetproperty' + _controlName, _domObject, _controlName, _propertyName, ref);
    }
    return ref.value;
}
function getAbsolutePos(_dO) {
    var SL = 0,
        ST = 0;
    var is_div = /^div$/i.test(_dO.tagName);
    if (is_div && _dO.scrollLeft) {
        SL = _dO.scrollLeft;
    }

    if (is_div && _dO.scrollTop) {
        ST = _dO.scrollTop;
    }
    var r = {
        x: _dO.offsetLeft - SL,
        y: _dO.offsetTop - ST
    };
    if (_dO.offsetParent) {
        var tmp = getAbsolutePos(_dO.offsetParent);
        r.x += tmp.x;
        r.y += tmp.y;
    }
    return r;
}
function getDocumentSize() {
    var div = document.createElement('DIV');
    var s = div.style;
    s.position = 'absolute';
    s.right = s.bottom = s.width = s.height = '0px';
    document.body.appendChild(div);
    var pos = getAbsolutePos(div);
    document.body.removeChild(div);
    return {
        width: pos.x,
        height: pos.y
    };
}
function setDomSize(_dom,_width,_height) {
    _dom.style.width = _width + 'px';
    _dom.style.height = _height + 'px';
}
function setDomSizeNoPx(_dom,_width,_height) {
    _dom.style.width = _width;
    _dom.style.height = _height;
}
function setDomSizePercent(_dom,_width,_height) {
    _dom.style.width = _width + '%';
    _dom.style.height = _height + '%';
}
function setDomPos(_dom,_left,_top) {
    _dom.style.left = _left + 'px';
    _dom.style.top = _top + 'px';
}
function setDomVisible(_dom,_visible) {
    _dom.style.display = (_visible) ? '' : 'none';
}
function addEvent(_dom,_eN,_cF,_capture) {
    if (_dom.addEventListener) {
        _dom.addEventListener(_eN, _cF, (_capture == null) ? false : _capture);
    } else {
        _dom.attachEvent('on' + _eN, _cF);
    }
}
function removeEvent(_dom,_eN,_cF,_capture) {
    if (_dom.removeEventListener) {
        _dom.removeEventListener(_eN, _cF, (_capture == null) ? false : _capture);
    } else {
        _dom.detachEvent('on' + _eN, _cF);
    }
}
function addClass(c,className) {
    var re = new RegExp("(^|\\s)" + className + "(\\s|$)", "g")
    if (c.className == undefined) {
        c.className = className;
        return;
    }
    if (re.test(c.className)) {
        return
    }
    c.className = (c.className + " " + className)
        .replace(/\s+/g, " ")
        .replace(/(^ | $)/g, "")
}
function removeClass(c,className){
    var re = new RegExp("(^|\\s)" + className + "(\\s|$)", "g")
    if (c.className == undefined)
        return;
    c.className = c.className
        .replace(re, "$1")
        .replace(/\s+/g, " ")
        .replace(/(^ | $)/g, "")
}
function toogleClass(c,className1,className2) {
    if (hasClass(c, className1)) {
        removeClass(c, className1);
        addClass(c, className2);
    } else {
        removeClass(c, className2);
        addClass(c, className1);
    }
}
function hasClass(c,className) {
    if (c.className == undefined)
        return;
    if (!className)
        return hasClass2(c);
    return (c.className.search('\\b' + className + '\\b') != -1);
}
function hasClass2(obj) {
    var result = false;
    if (obj.getAttributeNode("class") != null) {
        result = obj.getAttributeNode("class").value;
    }
    return result;
}
function DBrowser() {
    var agt = navigator.userAgent.toLowerCase();
    //0 index
    this.nav = ((agt.indexOf('mozilla') != -1) && (agt.indexOf('spoofer') == -1)
        && (agt.indexOf('compatible') == -1) && (agt.indexOf('opera') == -1)
        && (agt.indexOf('webtv') == -1) && (agt.indexOf('hotjava') == -1));
    //1 index
    this.ie = ((agt.indexOf("msie") != -1) && (agt.indexOf("opera") == -1));
    //2 index
    this.opera = (agt.indexOf("opera") != -1);
    //chrome
    this.chrome = (agt.indexOf('chrome') != -1);
    //firefox
    this.ff = (agt.indexOf('firefox') != -1);
    this.safari = (agt.indexOf('safari') != -1);

    if (this.ff || this.chrome) {
        var re_ver = new RegExp((this.ff ? 'firefox' : 'chrome') + '\/([0-9]+)');
        this.version = +agt.match(re_ver)[1];
    }
}
var BROWSER	= new DBrowser();
var endl="\n";
var _SYS_ERROR_OBJECT=new DError();
var parseXML=emptyFunction;
if(BROWSER.ie || BROWSER.safari || BROWSER.opera) {
    isNodeList = function (_object) {
        return _object.length != undefined;
    }
}
if(BROWSER.ie) {
    isObject = function (_object) {
        return typeof (_object) == 'object';
    }
}


if(BROWSER.ie) {
    parseXML = function (_xmlText) {
        var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
        xmlDoc.async = "false";
        xmlDoc.loadXML(_xmlText);
        return xmlDoc;
    }
} else {
    parseXML = function (_xmlText) {
        var parser = new DOMParser();
        return parser.parseFromString(_xmlText, "text/xml");
    }
}
function getEvent(e) {
    return e || window.event;
}
function getEventTarget(e) {
    e = e || window.event;
    return e.srcElement || e.target;
}
if(!Array.prototype.push) {
    Array.prototype.push = function (element) {
        this[this.length] = element;
    }
}
function getChildTag(_dom,_tagName,_index) {
    if (_index == -1) {
        return _dom.getElementsByTagName(_tagName).pop();
    } else
        return _dom.getElementsByTagName(_tagName)[_index];
}
var unknownControl_SetCaption = emptyFunction;
var unknownControl_SetValue = emptyFunction;
var unknownControl_GetValue = function () {
    return null;
}
var unknownControl_GetCaption=function () {
    return null;
}
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
}
function removeDomObject(_dom) {
    if (!_dom.parentNode){
        return;
    }
    _dom.parentNode.removeChild(_dom);
}

//class DEvent
function DEvent(_method,_object) {
    this.call = function () {
        _method.apply(_object, arguments);
    }
}
var SYS_RequestObject = null;
var SYS_countRequests = 0;
var SYS_blockRequests = false;
//Количество форм в состоянии показа
var SYS_countShowState = null;
function incSYS_countRequests() {
    SYS_countRequests++;
}
function decSYS_countRequests() {
    SYS_countRequests--;
    if (SYS_countRequests <= 0) {
        if (SYS_countShowState <= 0)
            SYS_Event('showEnd');
    }
}
function incSYS_countShowState() {
    if (SYS_countShowState == null) SYS_countShowState = 0;
    SYS_countShowState++;
}
function decSYS_countShowState() {
    SYS_countShowState--;
    if (SYS_countShowState <= 0 && SYS_countRequests <= 0)
        SYS_Event('showEnd');
}
function SYS_setShowEndEvent(func) {
    if (SYS_countShowState != null && SYS_countShowState <= 0 && SYS_countRequests <= 0) {
        func.call(this);
    } else
        SYS_addEvent('showEnd', func);
}
var SYS_Events = {};
function SYS_addEvent(eventName,func) {
    if (SYS_Events[eventName])
        SYS_Events[eventName].push(func);
    else
        SYS_Events[eventName] = [func];
}
function SYS_clearEvent(eventName) {
    SYS_Events[eventName] = [];
}
function SYS_Event(eventName) {
    if (!SYS_Events[eventName])
        return;

    var args = Array.prototype.slice.call(arguments, 1);
    for (var i = 0; i < SYS_Events[eventName].length; i++)
        SYS_Events[eventName][i].apply(this, args);
}
function parseDataToUrl(_Data, _PropName) {
    if (_PropName == undefined) _PropName = null;

    var urlData = '';

    for (var _propertyName in _Data) {
        if (!_Data.hasOwnProperty(_propertyName)) {
            continue
        }
        if (isObject(_Data[_propertyName])) {
            var l_PropName = _PropName != null ? _PropName + '[' + _propertyName + ']' : _propertyName;
            urlData += parseDataToUrl(_Data[_propertyName], l_PropName);
        } else {
            if (_PropName != null) urlData += '&' + _PropName + '[' + _propertyName + ']=' + encodeURIComponent(_Data[_propertyName]);
            else urlData += '&' + _propertyName + '=' + encodeURIComponent(_Data[_propertyName]);
        }
    }
    return urlData;
}
//Можно установить заголовки запроса, после каждого запроса обнуляется
var globalRequestHeaders = {};
var _uniq = 0;
function getUniqId(prefix) {
    if (_uniq > 9999999)
        _uniq = 0;
    prefix = prefix || '';
    return prefix + (_uniq++) + (new Date()).getTime();
}
function requestServer(_definedPostMethod,
                       _phpFile,
                       _baseParam,
                       _baseValue,
                       _data,
                       _acceptCallBackMethod,
                       _cancelCallBackMethod,
                       _callBackObject,
                       onlyXml,
                       async) {
    var promise = new Promise(function (resolve, reject) {
        if (SYS_blockRequests)
            return false;

        var silentRequest = _data.silent;
        delete _data.silent;
        if (!silentRequest){
            incSYS_countRequests();
        }
        var req = getRequestObject();
        if (!req)
            return false;
        var url = _phpFile + '.php?' + _baseParam + '=' + _baseValue + '&theme=' + window.SYS_current_theme + '&cache=' + D3Api.SYS_CACHE_UID;

        if ('cache_enabled' in D3Api) {
            url += '&cache_enabled=' + D3Api.cache_enabled;
        }

        if('session_cache' in D3Api){
            url += '&session_cache=' + D3Api.session_cache;
        }

        if(_phpFile !== 'getform' && _callBackObject instanceof DForm && 'formCache' in _callBackObject && _callBackObject.formCache){
            var formCache = _callBackObject.formCache;
            url += "&FormCache="+formCache;
        }
        var requestData = '';
        var postData = '';

        /*более не актуальный все данные передаются методом post*/
        if (_definedPostMethod) {
            postData += parseDataToUrl(_data);
        } else {
            requestData += parseDataToUrl(_data);
            postData = null;
        }
        if (async == null)
            async = true;
        req.open(_definedPostMethod ? 'POST' : 'GET', url + requestData, async);

        if (_definedPostMethod) {
            req.setRequestHeader("Method", "POST " + url + " HTTP/1.1");
            req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
        }
        for (var rh in globalRequestHeaders) {
            if (globalRequestHeaders.hasOwnProperty(rh)) {
                req.setRequestHeader(rh, globalRequestHeaders[rh]);
            }
        }
        globalRequestHeaders = {};
        var reqUid = getUniqId('req');
        var func = function () {
            if (req.readyState != 4) return;
            if (req.status == 0) {
                SYS_blockRequests = true;
                decSYS_countRequests();
                showError('Сервер недоступен. Повторите попытку позднее.')
                    .addListener('onclose', function () {
                        SYS_blockRequests = false;
                    }, this, true);
                return;
            }
            if (!silentRequest)
                decSYS_countRequests();

            if (req.status == 200) {
                if ((silentRequest || checkErrorRequest(req, _phpFile)) && _acceptCallBackMethod instanceof Function)
                    (new DEvent(_acceptCallBackMethod, _callBackObject)).call(((onlyXml) ? req.responseXML : req.responseText), {
                        resolve: resolve,
                        reject: reject
                    },req);
            } else if (_cancelCallBackMethod instanceof Function) {
                (new DEvent(_cancelCallBackMethod, _callBackObject)).call((onlyXml) ? req.responseXML : req.responseText, req.status,req);
            }
            SYS_Event('onRequestServerEnd', req, reqUid, silentRequest);
            delete req;
        }
        if (async)
            req.onreadystatechange = func;
        try {
            SYS_Event('onRequestServerBegin', req, reqUid, silentRequest);
            req.send(postData);
        } catch (e) {
        }
        SYS_RequestObject = req;
        if (!async) func();
    });
    return promise;
}
function requestServerMultiDataSets(_sysid,
                                    _formName,
                                    formData,
                                    _datas,
                                    callBackAcceptMethod,
                                    callBackCancelMethod,
                                    callBackObject) {
    var _data = {};
    var dsName = '';
    var _propertyName;
    var _baseValue = _formName;
    _baseValue += parseDataToUrl(formData);
    /*for(_propertyName in formData){
        _baseValue+='&'+_propertyName+'='+formData[_propertyName];
    }*/
    _data['_sysid'] = _sysid;
    for (var index = 0; index < _datas.length; index++) {
        dsName = 'ds' + index;
        if (callBackObject && callBackObject.getSysInfoByAttr) {
            _data[dsName + '[Form]'] = /*callBackObject.getSysInfoByAttr(_datas[index].DataSet,'formname')||*/_formName;
        } else {
            _data[dsName + '[Form]'] = _formName;
        }

        for (_propertyName in formData) {
            if (formData.hasOwnProperty(_propertyName)) {
                _data[dsName + '[' + _propertyName + ']'] = formData[_propertyName];
            }

        }
        for (_propertyName in _datas[index]) {
            if (_datas[index].hasOwnProperty(_propertyName)) {
                _data[dsName + '[' + _propertyName + ']'] = _datas[index][_propertyName];
            }
        }
    }
    return requestServer(true,
                                         'getmultidata',
                                         'Form',
                                         _baseValue,
                                         _data,
                                         callBackAcceptMethod,
                                         callBackCancelMethod,
                                         callBackObject,
                                         true);
}

function requestServerMultiDataSetsThread(_sysid,
                                          _formName,
                                          formData,
                                          _datas,
                                          callBackObject) {

    var promise = new Promise(function (resolve, reject) {
        var infoThread = D3Api.MULTI_REQUEST;//информация об отправляемых запросах(потоках)
        if (!infoThread) {
            infoThread = {"MAX_THREAD": "", "MAX_REQUEST": ""};
        }
        _datas = D3Api.DataChunk(_datas, +infoThread['MAX_REQUEST']);
        var cnt = _datas.length;
        if (!infoThread['MAX_THREAD']) {
            infoThread['MAX_THREAD'] = cnt;
        }
        var currThread = 0;
        var nResult = 0;
        var res = [];
        var error = null;
        var status = null;

        function ExecuteMultiDataSet() {
            if (!error) {
                if (currThread >= +infoThread['MAX_THREAD']) {
                    return;
                }
                var remove = _datas.splice(0, 1);
                if (remove && remove.length > 0) {
                    ++currThread;
                    if (Array.isArray(remove)) {
                        remove = remove[0];
                    }
                    requestServerMultiDataSets(_sysid,
                        _formName,
                        formData,
                        remove,
                        function(_xml){
                            --currThread;
                            ++nResult;
                            res.push(_xml);
                            ExecuteMultiDataSet();
                        },
                        function(_xml,_status){
                            error = _xml;
                            status = _status;
                            --currThread;
                            ++nResult;
                            ExecuteMultiDataSet();

                        },
                        callBackObject);
                    ExecuteMultiDataSet();
                } else {
                    if (nResult >= cnt) {
                        resolve(res);
                    }

                }
            } else {
                reject({
                    'xml': error,
                    'status': status
                });
            }
        }
        ExecuteMultiDataSet();
    });
    return promise;
}
function requestServerMultiActions(_formName,
                                   formData,
                                   _datas,
                                   callBackAcceptMethod,
                                   callBackCancelMethod,
                                   callBackObject) {
    var _data = {};
    var actName = '';
    var _propertyName;
    var _baseValue = _formName;
    _baseValue += parseDataToUrl(formData);
    for (var index = 0; index < _datas.length; index++) {
        actName = 'act' + index;
        _data[actName + '[Form]'] = /*callBackObject.getSysInfoByAttr(_datas[index].Action,'formname')||*/_formName;
        for (_propertyName in formData) {
            if (formData.hasOwnProperty(_propertyName)) {
                _data[actName + '[' + _propertyName + ']'] = formData[_propertyName];
            }
        }
        for (_propertyName in _datas[index]) {
            if (_datas[index].hasOwnProperty(_propertyName)) {
                _data[actName + '[' + _propertyName + ']'] = _datas[index][_propertyName];
            }
        }
    }
    return requestServer(true,
                                         'getmultiaction',
                                         'Form',
                                         _baseValue,
                                         _data,
                                         callBackAcceptMethod,
                                         callBackCancelMethod,
                                         callBackObject,
                                         true);
}
function requestServerForm(_n,_a,_c,_o,_p){
    return  requestServer(true,
                                          'getform',
                                          'Form',
                                          _n,
                                          _p||{},
                                          _a,
                                          _c,
                                          _o);
}
function requestServerDataSet(_n,_d,_a,_c,_o,async) {
    return requestServer(true, 'getdata', 'Form', _n, _d, _a, _c, _o, true, async);
}
function requestServerAction(_definedPostMethod,_n,_d,_a,_c,_o,async) {
    return requestServer(true, 'action', 'Form', _n, _d, _a, _c, _o, true, async);
}
function requestServerModule(_definedPostMethod,_n,_d,_a,_c,_o,_xml,async){
    return requestServer(true,'getmodule','Form',_n,_d,_a,_c,_o,_xml,async);
}
var SYS_including_css_files = new Array();
var includeingfiles = new Array();
function SYS_include_css(_fileName,_not_theme, id) {
    if (typeof (SYS_including_css_files[_fileName]) != 'undefined') return;
    var objHead = document.getElementsByTagName('head')[0];
    var objStyle = document.createElement('link');
    objStyle.rel = 'stylesheet';
    objStyle.type = 'text/css';

    if (!empty(id)) {
        objStyle.setAttribute("id", id);
    }

    if(_not_theme === true){
        objStyle.href = _fileName + ((_fileName.indexOf('.css') != -1) ? '' : '.css');
    }else{
        objStyle.href = _fileName + ((SYS_current_theme != '') ? '_' : '') + SYS_current_theme + ((_fileName.indexOf('.css') != -1) ? '' : '.css');
    }
    objHead.appendChild(objStyle);
    SYS_including_css_files[_fileName] = objStyle;
}
function setNewTheme(_nameTheme) {
    window.SYS_current_theme = _nameTheme;
    var loadedCssFiles = new Array();
    for (var _fileName in SYS_including_css_files) {
        if (!SYS_including_css_files.hasOwnProperty(_fileName)) {
            continue;
        }
        removeDomObject(SYS_including_css_files[_fileName]);
        delete SYS_including_css_files[_fileName];
        loadedCssFiles.push(_fileName);
    }
    for (var index = 0; index < loadedCssFiles.length; index++) {
        SYS_include_css(loadedCssFiles[index]);
    }
}
function setDefaultTheme() {
    if (window.SYS_current_theme == '') return;
    setNewTheme('');
}
function SYS_include_js(_fileName,
                        callBackAccept,
                        callBackCancel,
                        callBackObject) {
    callBackAccept = callBackAccept || emptyFunction;
    callBackCancel = callBackCancel || emptyFunction;
    if (includeingfiles[_fileName] == true) return false;
    includeingfiles[_fileName] = false;
    var objHead = document.getElementsByTagName('head')[0];
    var objScript = document.createElement('script');
    objScript.type = 'text/javascript';
    objScript.src = _fileName;
    objScript.src = objScript.src.replace('.js', ((window.SYS_current_theme != '') ? '_' : '') + window.SYS_current_theme + '.js');
    objScript.onload = function () {
        if (includeingfiles[_fileName]) return;
        includeingfiles[_fileName] = true;
        (new DEvent(callBackAccept, callBackObject)).call(_fileName);
        this.onload = emptyFunction;
        this.onreadystatechange = emptyFunction;
    }
    objScript.onreadystatechange = function () {
        if (this.readyState == 'loaded' || this.readyState == 'complete') {
            if (includeingfiles[_fileName]) return;
            includeingfiles[_fileName] = true;
            (new DEvent(callBackAccept, callBackObject)).call(_fileName);
            this.onload = emptyFunction;
            this.onreadystatechange = emptyFunction;
        }
    }
    objHead.appendChild(objScript);
    return true;
}
//class DError
function DError() {
    this.isShowError = true;
    this.isGenerateUserException = false;
    this.isGenerateStandartException = false;
    this.showXmlError = function (_xml) {
        if (!isObject(_xml)) {
            if (_xml != null)
                return this.showError(_xml);
            else return false;
        } else {
            try {
                return this.showError(_xml.textContent || _xml.text);
            } catch (e) {
                return this.showError(_xml, e);
            }
        }
    }
    this.showOracleXmlError = function (_xml, _invars) {
        if (_invars == null) _invars = '';

        if (isObject(_xml) || _xml == '[object Element]') {
            try {
                return this.showOracleError((_xml.textContent || _xml.text) + ' \nPARAMS: ' + _invars);
            } catch (e) {
                return this.showOracleError(_xml, e);
            }
        } else {
            return this.showOracleError(_xml + ' \nPARAMS: ' + _invars);
        }
    }
    this.showOracleError = function (_message, _error) {
        /*if (_message != _message.replace(/\r/g, '')) alert(123);
        else alert(321)	*/
        if (!this.isShowError) return true;
        if (this.isGenerateUserException) throw new Error(_message);
        if (this.isGenerateStandartException) throw _error;
        var win = new DOracleErrorWindow(_message);
        win.show();
        return true;
    }
    this.showError = function (_message, _error, _backwin) {
        if (!this.isShowError) return true;
        if (this.isGenerateUserException) throw new Error(_message);
        if (this.isGenerateStandartException) throw _error;
        var win = new DErrorWindow(_message);

        if (_backwin === undefined || _backwin)
            return win.show();
        return true;
    }
    this.hideError = function () {
        //empty code
    }
}
//class DDataSetControl
function DDataSetControl(_type,_dom) {
    this.type = _type;
    this.dom = _dom;
}
//class DControlEvent
function DControlEvent(_dom,_event,objectForm) {
    // здесь вызываются функции на события dom
    var dom = _dom;
    var event = _event;
    var ObjectForm = objectForm;
    this.call = function (Form, args) {
        addStackPage(ObjectForm.page);
        var res = true;
        var formname = dom && dom.getAttribute && dom.getAttribute('formname');
        var Form = objectForm.getNamespace();
        if (typeof event == 'function') {
            eval('try{res= (' + event + ').call(dom);}catch(e){showScriptError(e, {formname: formname, script: event})};');
        } else {
            eval('try{ res= (function (){' + event + ';}).call(dom);}catch(e){showScriptError(e, {formname: formname, script: event})};');
        }

        removeStackPage();
        return res;
    }
}
function DataSetXmlDataToCount(_xml,showError) {
    var count = -1;
    if(!_xml){
        D3Api.debug_msg('данные не пришли.');
        return;
    }
    var _counts = _xml.childNodes;
    for (var index = 0; index < _counts.length; index++) {
        if (_counts[index].nodeName.toLowerCase() == 'count') {
            count = parseInt(_counts[index].textContent || _counts[index].text || '');
        }
    }
    if (count == -1) {
        return DataSetXmlDataToArray(_xml, 0, showError).length;
    }
    return count;
}
function DataSetXmlDataToArray(_xml,_count,showError) {
    if(!_xml){
        D3Api.debug_msg('данные не пришли.');
        return;
    }
    var result = new Array();
    result.sys_error = false;
    var _rows = _xml.childNodes;
    var _invars = '';
    var rndex = new Number(0);
    var _fields = new Array();
    var fndex = new Number();
    for (var index = 0; (index < _rows.length) && ((rndex < _count) || (_count == 0)); index++) {
        if (_rows[index].nodeName == 'row') {
            _fields = _rows[index].childNodes;
            result[rndex] = new Array();
            for (fndex = 0; fndex < _fields.length; fndex++) {
                if (_fields[fndex].nodeName != '#text'){
                    var vresult = _fields[fndex].textContent||_fields[fndex].text||'';
                    vresult = vresult.replace(/^\s*/,'').replace(/\s*$/,'');
                    result[rndex][_fields[fndex].nodeName]=vresult;
                }
            }
            rndex++;
        }
        if (_rows[index].nodeName == 'info') {
            result['info'] = {};
            for (var inf = 0; inf < _rows[index].childNodes.length; inf++) {
                if (_rows[index].childNodes[inf].nodeName != '#text'){
                    var vresult = _rows[index].childNodes[inf].textContent||_rows[index].childNodes[inf].text||'';
                    vresult = vresult.replace(/^\s*/,'').replace(/\s*$/,'');
                    result['info'][_rows[index].childNodes[inf].nodeName]=vresult;
                }
            }
        }
        if (_rows[index].nodeName == 'inarray') {
            _invars = _invars + _params[index].textContent || _params[index].text || '';
        }
        if (_rows[index].nodeName == 'Error' && showError) {
            var _invars_story = '';
            if (typeof (_rows[index].children) != 'undefined') {
                var _len = _rows[index].children.length;
                for(var jnd=0;jnd<_len;jnd++)
                {
                    var jtem = _rows[index].children[jnd];
                    if(jtem.nodeName=='vars'){
                        _invars_story = jtem.textContent||jtem.text||'';
                    }
                }
            }
            _invars = _invars + _invars_story;
            showOracleXmlError(_rows[index], _invars);
        }
    }
    return result;
}
function XmlDataToArray(_xml,showError) {
    if(!_xml){
        D3Api.debug_msg('данные не пришли.');
        return;
    }
    var result = new Array();
    var _invars = '';
    result.sys_error = false;
    var _params = _xml.childNodes;
    var document = _xml.ownerDocument;
    if (document.querySelector('multidata')) {
        result.multidata = true;
        if (document.querySelector('Error')) {
            result.sys_error = true;
        }
    }
    for (var index = 0; index < _params.length; index++) {
        if (_params[index].nodeName == '#text') continue;

        if (_params[index].nodeName == 'inarray') {
            _invars = _invars + _params[index].textContent || _params[index].text || '';
        }

        if (_params[index].nodeName == 'Error') {
            if (showError && !("multidata" in result)) {
                showOracleXmlError(_params[index], _invars);
            }
            result.sys_error = true;
            result.sys_error_message = _params[index].textContent;
        } else {
            if (_params[index].nodeName == 'notifymsg') {
                result[_params[index].nodeName] = [];
                var msg = _params[index].childNodes;
                for (var j = 0, len = msg.length; j < len; j++) {
                    if (msg[j].nodeName == '#text') {
                        continue;
                    }
                    result[_params[index].nodeName].push(msg[j].textContent || msg[j].text || '');
                }
            } else if (_params[index].nodeName == 'badgemsg') {
                result[_params[index].nodeName] = [];

                var badges = _params[index].childNodes;
                for (var j = 0; j < badges.length; j++) {
                    if (badges[j].nodeType !== 1) {
                        continue;
                    }
                    var msg = badges[j].childNodes, struct = {};
                    for (var k = 0, len = msg.length; k < len; k++) {
                        if (msg[k].nodeName == '#text') {
                            continue;
                        }
                        struct[msg[k].nodeName] = msg[k].textContent || _params[index].text || '';
                    }
                    result[_params[index].nodeName].push(struct);
                }
            } else {
                if(_params[index].hasAttribute('is_array')){
                    result[_params[index].nodeName] = [];
                    var child = _params[index].children;
                    for(var i = 0,len = child.length ; i < len ; i++){
                        if(child[i].nodeName == '#text'){
                            continue;
                        }
                        if(child[i].hasAttribute('is_array')){
                            var ch = child[i].children;
                            var num = result[_params[index].nodeName].push({});
                            for(var j = 0,jlen = ch.length ; j < jlen ; j++){
                                if(ch[j].nodeName == '#text'){
                                    continue;
                                }
                                result[_params[index].nodeName][num - 1][ch[j].nodeName] = ch[j].textContent||ch[j].text||'';
                            }
                        }else{
                            result[_params[index].nodeName].push(child[i].textContent||_params[i].text||'');
                        }
                    }
                }else{
                    result[_params[index].nodeName]=_params[index].textContent||_params[index].text||'';
                }
            }
        }
    }
    return result;
}
//class DDataSetControlContainer
function DDataSetControlContainer(_dom,_form) {
    this.isRepeater = false;
    this.isDetail = false;
    this.isChild = false;
    this.countDetails = 0;
    this.dom = _dom;
    this.form = _form;
    this.activateOnCreate = false;
    this.cancelActivateOnCreate = false;
    this.controls = new Array();
    this.fillControlData = function (_dataArray) {
        var control;
        for (var index = 0; index < this.controls.length; index++) {
            control = this.controls[index];
            switch (control.type) {
                case 0: {
                    if (typeof _dataArray[quickGetProperty(control.dom, 'datafield')] != "undefined") {
                        var val = _dataArray[quickGetProperty(control.dom, 'datafield')] || '';
                        _setControlProperty(control.dom, 'value', val);
                        var name = getProperty(control.dom, 'name');
                        if (!empty(name)) {
                            this.form.page.dispatchEvent('onchangeproperty' + name, control.dom, name, 'value', val);
                        }
                    }
                    break;
                }
                case 1: {
                    _setControlProperty(control.dom, 'caption', _dataArray[quickGetProperty(control.dom, 'captionfield')] || '');
                    break;
                }
                case 2: {
                    _setControlProperty(control.dom, 'hint', _dataArray[quickGetProperty(control.dom, 'hintfield')] || '');
                    break;
                }
            }
        }
    }
    this.getControlCount = function () {
        var count = 0;
        for (var index = 0; index < this.repeaters.length; index++) {
            count += this.repeaters[index];
        }
        return count + this.controls.length;
    }
    this.addControl = function (_dom) {
        if (hasProperty(_dom, 'datafield')) {
            this.controls.push(new DDataSetControl(0, _dom));
        }
        if (hasProperty(_dom, 'captionfield')) {
            this.controls.push(new DDataSetControl(1, _dom));
        }
        if (hasProperty(_dom, 'hintfield')) {
            this.controls.push(new DDataSetControl(2, _dom));
        }
        if (hasProperty(_dom, 'loadoncreate')) {
            this.activateOnCreate = true;
        }
    }
    this.repeaters = new Array();
    this.addRepeaterByDom = function (_dom, _form, _stopRepeate) {
        var _repeater = new DDataSetRepeater(_dom, _form);
        _repeater.dataset = this;
        return this.addRepeater(_repeater, false, _stopRepeate);
    }
    this.addRepeater = function (_repeater, _isDetail, _stopRepeate) {
        this.repeaters.push(_repeater);
        _repeater.isDetail = _isDetail;
        _repeater.stopRepeate = _stopRepeate;
        if (_isDetail)
            this.countDetails++;
        return _repeater;
    }
}
//class DClonePostData
function DClonePostData(_group) {
    this.controlsData = new Array();
    this.childsData = new Array();
    this.group = _group;
}

function getSrcValuesToXML(_tmpPostObject,clone) {
    var text = '';
    for (var index = 0; index < _tmpPostObject.params.length; index++) {
        param = _tmpPostObject.params[index];
        if (typeof (param.get) == 'undefined') continue;
        ignorenull = param.ignorenull;
        if (!empty(clone)) control = clone.controls[param.src];//если собираем от клона
        else control = getControlByName(param.src);//если собираем от контрола
        switch (param.srctype.toLowerCase()) {
            case 'ctrl': {
                if (!isObject(control)) {
                    showError('В клонируемом объекте компонент [' + param.src + '] не найден');
                    continue;
                }
                value = getControlValue(control);
                break;
            }
            case 'ctrlcaption': {
                if (!isObject(control)) {
                    showError('В клонируемом объекте компонент [' + param.src + '] не найден');
                    continue;
                }
                value = getControlCaption(control);
                break;
            }
            case 'var': {
                value = getVar(param.src);
                break;
            }
            case 'data': {
                value = this.data[param.src];
                break;
            }
            default: {
                value = param.src;
            }
        }
        if (!empty(value) || ignorenull) {
            if (empty(value)) value = '';
            _controlName = param.get;
            text += '<' + _controlName + '>' + ((typeof (value) == 'string') ? escapeXml(value) : value) + '</' + _controlName + '>';
        }
    }
    return text;

}
//class DClone
var SYS_clones_uid = 0;
function DClone(_clone,_form) {
    this.clone = _clone;
    this.labels = new Array();
    this.data = new Array();
    this.parentClone = null;
    this.type = 0;//0 - из базы, 1 - добавленные вновь
    this.group = getProperty(_clone, 'groupname', 'unknown');
    this.clones = new Array();
    this.rclones = new Array();
    this.uid = SYS_clones_uid++;
    this.addClone = function (_clone) {
        this.clones.push(_clone);
        _clone.parentClone = this;
        return _clone;
    }
    this.removeCloneByIndex = function (_index) {
        if (!isObject(this.clones[_index])) return;
        var clone = this.clones[_index].remove();
        if (clone.type == 0) this.rclones.push(clone);
        this.clones.splice(_index, 1);
    }
    this.removeClone = function (_clone) {
        this.removeCloneByIndex(this.clones.indexOf(_clone));
    }
    this.form = _form;
    this.controls = {};
    this.rclones = new Array();
    this.remove = function () {
        while (this.clones.length != 0) {
            this.clones[0].remove();
            this.clones.splice(0, 1);
        }
        for (var name in this.controls) {
            if (this.controls.hasOwnProperty(name)) {
                this.form.page.dispatchEvent('removeCloneControl' + name, name, this.controls[name]);
            }
        }
        removeDomObject(this.clone);
        return this;
    }
    this.parse = function () {
        this.form.parseCloneObject(this, this.clone);
        this.callControlEvents();
    }
    this.callControlEvents = function () {
        this.callControlsEvent("onpostclone");
    }
    this.callControlsEvent = function (event_name) {
        for (var name_prop in this.controls) {
            if (!this.controls.hasOwnProperty(name_prop)) {
                continue;
            }
            var control = this.controls[name_prop];
            if (control == this.clone)
                continue;
            if (hasProperty(control, event_name)) {
                _clone = getProperty(control, event_name, "");
                if (!empty(_clone)) {
                    clone_func = function () {
                        eval(_clone);
                    }
                    clone_func.call(control);
                }
            }
        }
    }

    this.getPostData = function (_tmpPostObject) {
        if (_tmpPostObject.propertyes.group != this.group) return '';
        var name = _tmpPostObject.propertyes.name;
        var resultXml = '<' + name + '>';

        resultXml += '<_clone_id>' + this.uid + '</_clone_id>';
        var control;
        var value = '';
        var param;
        var _controlName;
        var ignorenull;
        resultXml += getSrcValuesToXML(_tmpPostObject, this);
        var jndex = 0;
        //		alert(_tmpPostObject.propertyes.group+'='+_tmpPostObject.childs.length);
        var _tmpPostChildObject;
        for (var _tmpName in _tmpPostObject.childs) {
            if (!_tmpPostObject.childs.hasOwnProperty(_tmpName)) {
                continue;
            }
            _tmpPostChildObject = _tmpPostObject.childs[_tmpName];
            switch (_tmpPostChildObject.type.toLowerCase()) {
                case 'add': {
                    for (jndex = 0; jndex < this.clones.length; jndex++) {
                        if (this.clones[jndex].type != 0)
                            resultXml += this.clones[jndex].getPostData(_tmpPostChildObject);
                    }
                    break;
                }
                case 'upd': {
                    for (jndex = 0; jndex < this.clones.length; jndex++) {
                        if (this.clones[jndex].type != 1)
                            resultXml += this.clones[jndex].getPostData(_tmpPostChildObject);
                    }
                    break;
                }
                case 'del': {
                    for (jndex = 0; jndex < this.rclones.length; jndex++) {
                        resultXml += this.rclones[jndex].getPostData(_tmpPostChildObject);
                    }
                    break;
                }
                default: {
                    for (jndex = 0; jndex < this.clones.length; jndex++) {
                        resultXml += this.clones[jndex].getPostData(_tmpPostChildObject);
                    }
                }
            }
        }
        return resultXml + '</' + name + '>';
    }
}
//class DDataSetRepeater
function DDataSetRepeater(_dom,_form) {
    DDataSetControlContainer.call(this, _dom, _form);
    this.isRepeater = true;
    this.isLoadOne = false;
    this.distinctField = getProperty(_dom, 'distinct', '');
    this.isDistinct = this.distinctField != '';
    _dom.style.display = "none";
    //_dom.style.visibility='hidden';
    _dom.setAttribute("clone", true, false);
    _dom.setAttribute('sample', true, false);
    if (!hasProperty(_dom, 'cmptype')) {
        _dom.setAttribute('cmptype', 'clone', false);
    }
    this.isClearData = getProperty(_dom, 'clear', 'false') == 'true';
    this.isSortData = getProperty(_dom, 'sort', 'false') == 'true';
    var onclone = getProperty(_dom, 'onclone', '');
    if (onclone != '') {
        var Form = this.form.getNamespace();
        eval('onclone=function (_dataArray){' + onclone + ';}');
        this.onclone = onclone;
    } else {
        this.onclone = null;
    }
    var onpostclone = getProperty(_dom, 'onpostclone', '');
    if (onpostclone != '') {
        var Form = this.form.getNamespace();
        eval('onpostclone=function (_clone,_dataArray){' + onpostclone + ';}');
        this.onpostclone = onpostclone;
    } else {
        this.onpostclone = null;
    }
    this.count = parseInt(quickGetProperty(_dom, 'repeate'));
    this.from = parseInt(getProperty(_dom, 'repeate_from', 0));
    //_dom.removeAttribute("repeate");
    //_dom.removeAttribute("dataset");
    this.clone = new DClone(_dom, _form);
    this.parentRepeater = null;
    this.dataset = null;
    this.parentField = null;
    this.keyField = null;
    this.parentFieldsData = new Array();
    if (hasProperty(_dom, 'keyfield')) {
        this.keyField = quickGetProperty(_dom, 'keyfield');
        _dom.removeAttribute("keyfield", false);
    }
    if (hasProperty(_dom, 'parentfield')) {
        this.parentFieldsData[0] = quickGetProperty(_dom, 'parentfield');
        _dom.removeAttribute("parentfield");
    }
    if (hasProperty(_dom, 'parentFieldsData')) {
        var _object = {};
        eval('_object=' + quickGetProperty(_dom, 'parentFieldsData'));
        for (var _propertyName in _object) {
            if (_object.hasOwnProperty(_propertyName)) {
                this.parentFieldsData[parseInt(_propertyName)] = _object[_propertyName];
            }
        }
        _dom.removeAttribute('parentFieldsData', false);
    }
    if (hasProperty(_dom, 'groupname')) {
        this.form.registerRepeaterGroup(quickGetProperty(_dom, 'groupname'), this);
    }
    if (hasProperty(_dom, 'name')) {
        this.form.registerRepeaterByName(quickGetProperty(_dom, 'name'), this);
        this.addControl(_dom);
        //_dom.removeAttribute('name');
    }
    this.data = [];/*инициализация переменной. Если оставить null, то если во вложенном репитере нет данных (activateoncreate=flase), возникала ошибка в fillRepeater(this.data.length)*/
    this.childCount = 0;
    this.killClones = function () {
        while (this.clone.clones.length != 0) {
            this.clone.removeCloneByIndex(0);
        }
        this.clone.rclones = new Array();
    }
    this.callDetailEvent = function () {
        this.childCount--;
        if (this.childCount == 0) {
            if (this.parentRepeater != null) {
                if (this.isDetail) {
                    this.parentRepeater.callDetailEvent();
                } else {
                    this.fillRepeater();
                    if (!this.isLoadOne) {
                        this.parentRepeater.callDetailEvent();
                    }
                }
            } else {
                this.fillRepeater();
            }
        }
    }
    this.fillRepeater = function (_parentValuesData) {
        if (hasProperty(this.dom, 'inclone')) return false;

        if (!empty(getVar('stopRepeate')) && getVar('stopRepeate') == true && this.stopRepeate == true) return false;
        if (empty(_parentValuesData)) _parentValuesData = new Array();
        this.killClones();
        var camount = 0;
        var clones = new Array();
        var childClones = new Array();
        var cndex = 0;
        var childValuesData = new Array();
        var jndex = new Number();
        var _continue = false;
        var distinctValue;
        var distincts = new Array();
        var _data;
        var _repeater;
        var _isSortFind = false;
        for (var index = this.from; index < this.data.length && (camount < this.count || this.count == 0); index++, camount++) {
            _data = this.data[index];
            if (this.parentFieldsData.length != 0) {
                _continue = false;
                for (jndex = 0; jndex < this.parentFieldsData.length; jndex++) {
                    if (this.parentFieldsData[jndex] == undefined)
                        continue;
                    if (_parentValuesData[jndex] != _data[this.parentFieldsData[jndex]]) {
                        _continue = true;
                        break;
                    }
                }
                if (!_continue && this.isDistinct) {
                    if (distincts[distinctValue = _data[this.distinctField]]) continue;
                    distincts[distinctValue] = true;
                }
                if (_continue) {
                    if (this.isSortData) {
                        if (_isSortFind) {
                            return clones;
                        }
                    }
                    continue;
                }
                _isSortFind = true;
            } else if (this.isDistinct) {
                if (distincts[distinctValue = _data[this.distinctField]]) continue;
                distincts[distinctValue] = true;
            }
            childClones = new Array();
            childValuesData = new Array(_data[this.keyField] || null);
            for (jndex = 0; jndex < _parentValuesData.length; jndex++) {
                childValuesData.push(_parentValuesData[jndex]);
            }

            for (var rndex = 0; rndex < this.repeaters.length; rndex++) {
                _repeater = this.repeaters[rndex];
                if (_repeater.isDetail) {
                    childClones = childClones.concat(_repeater.fillRepeater(childValuesData));
                }
            }
            clones.push(this.addClone(_data, this.dom, this.parentRepeater == null));
            for (cndex = 0; cndex < childClones.length; cndex++) {
                removeDomObject(childClones[cndex]);
            }
            if (this.isClearData) {
                this.data.splice(index, 1);
                index--;
                //_data.skip=true;
            }
        }
        return clones;
    }
    this.addCloneByUser = function (_dataArray, _domObject, _labelName) {
        var container = this.clone;
        var _dom = this.dom;
        if (isObject(_domObject.clone)) {
            container = _domObject.clone;
            if (_labelName != null) {
                _dom = container.labels[_labelName];
            } else {
                _dom = _domObject;
            }
        }
        if (this.count != 0)
            if (this.count <= container.clones.length) return;

        var childValuesData = new Array(_dataArray[this.keyField]);
        var childClones = new Array();
        var _repeater;
        for (var rndex = 0; rndex < this.repeaters.length; rndex++) {
            if ((_repeater = this.repeaters[rndex]).isDetail)
                childClones = this.repeaters[rndex].fillRepeater(childValuesData);
        }
        var cloneObject = new DClone(this.addClone(_dataArray, _dom, false), this.form);
        container.clones.push(cloneObject);
        cloneObject.data = _dataArray;
        cloneObject.parse();
        cloneObject.type = 1;
        cloneObject.parentClone = container;
        if (this.onpostclone != null) {
            this.form.setSubstitutionControls(this.controls);
            this.onpostclone.call(_dom, cloneObject.clone, _dataArray);
            this.form.stopSubstitutionControls();
        }
        while (childClones.length != 0) {
            removeDomObject(childClones[0]);
            childClones.splice(0, 1);
        }
        return cloneObject;
    }
    this.addClone = function (_dataArray, _domObject, _parsing) {
        var cloneObject;
        this.fillControlData(_dataArray);
        if (this.onclone != null) {
            this.form.setSubstitutionControls(this.controls);
            this.onclone.call(_dom, _dataArray);
            this.form.stopSubstitutionControls();
        }
        var clone = this.dom.cloneNode(true);
        clone.style.display = '';
        clone.removeAttribute("sample");
        if (_domObject.parentNode){
            _domObject.parentNode.insertBefore(clone, _domObject);
        }
        if (_parsing) {
            this.clone.addClone(cloneObject = new DClone(clone, this.form));
            cloneObject.parse();
            cloneObject.data = _dataArray;

            if (this.onpostclone != null) {
                this.form.setSubstitutionControls(this.controls);
                this.onpostclone.call(_domObject, clone, _dataArray);
                this.form.stopSubstitutionControls();
            }
        }

        return clone;
    }
    this.setData = function (_dataArray) {
        this.data = _dataArray;

        if (!this.isLoadOne) {
            this.childCount += this.repeaters.length + 1;
        } else {
            this.childCount += this.countDetails + 1;
        }
        this.callDetailEvent();
        this.isLoadOne = true;
    }
}
//class DDataSetContainer
function DDataSetContainer(_name,_dom,_form) {
    DDataSetControlContainer.call(this, _dom, _form);
    this.name = _name;
    this.data = null;
    var events = {
        afterrefresh: new Array(),
        insteadrefresh: new Array(),
        onrefresh: new Array(),
        before_refresh: new Array()
    };
    this.getEventsCount = function (_eventName) {
        return events[_eventName].length;
    }
    this.addEvent = function (_eventName, _dom) {
        events[_eventName].push(new DControlEvent(_dom, quickGetProperty(_dom, _eventName), this.form));
    }
    this.addEventListener = function (_eventName, _listener, dom) {
        events[_eventName].push(new DControlEvent(dom, _listener, this.form));
    }
    this.callEvents = function (_eventName) {
        var args = new Array();
        for (var andex = 1; andex < arguments.length; andex++) {
            args.push(arguments[andex]);
        }
        var result = true;
        for (var index = 0; index < events[_eventName].length; index++) {
            result = events[_eventName][index].call(null, args) && result;
        }
        return result;
    }
    this.setLocalData = function (dataArray, needEvents) {
        this.data = dataArray;
        if (needEvents || needEvents == undefined) {
            if (this.getEventsCount('onrefresh') != 0) {
                this.callEvents('onrefresh', this.data, this.controls);
            }
            if (this.data.length != 0) {
                this.fillControlData(this.data[0]);
            }
            var repeater;
            for (var index = 0; index < this.repeaters.length; index++) {
                repeater = this.repeaters[index];
                repeater.setData(this.data)
            }
            this.callEvents('afterrefresh');
        }
    }
    this.setData = function (_data, showError) {
        if (_data instanceof Array) {
            this.data = _data;
        } else {
            this.data = DataSetXmlDataToArray(_data, 0, showError);
        }
        if (this.data.sys_error) {
            return;
        }

        //Переворот данных
        var sysinfo = this.form.getSysInfoByName(this.name);
        if (sysinfo && sysinfo.ColumnsField && sysinfo.ValuesField) {
            var index = 0;
            if (sysinfo.PrimaryField) {
                var ndata = {};
                for (var i = 0; i < this.data.length; i++) {
                    var key = this.data[i][sysinfo.PrimaryField];
                    var field = this.data[i][sysinfo.ColumnsField];
                    var value = this.data[i][sysinfo.ValuesField];
                    if (!ndata[key]) {
                        ndata[key] = {data: this.data[i]};
                        ndata[key].data[sysinfo.PrimaryField] = key;
                        index++;
                    } else {
                        this.data[i] = null;
                    }
                    ndata[key].data[field] = value;
                }
                this.data = this.data.filter(function(e) {
                    return e !== null;
                });
            } else {   //Одна строка
                for (var i = 0; i < this.data.length; i++) {
                    var tmp = this.data[i];
                    this.data[i] = new Array(); //Используется не поназначению, не меняю дабы ничего не сломать
                    this.data[0][tmp[sysinfo.ColumnsField]] = tmp[sysinfo.ValuesField]
                }
                this.data.splice(1);
                index = 1;
            }
            if (this.data['info']) {
                this.data['info'].rowcount = index;
            }
        } else if (sysinfo && sysinfo.ColumnsField) //Поворот всех данных строки -> столбцы
        {
            var dataNew = new Array();
            var ParName = "";
            var j;
            for (var i = 0; i < this.data.length; i++) {
                j = 0;
                for (var z in this.data[i]) {
                    if (!this.data[i].hasOwnProperty(z)) {
                        continue
                    }
                    if (z == sysinfo.ColumnsField)
                        continue;
                    ParName = this.data[i][sysinfo.ColumnsField];
                    if (dataNew[j] == null) dataNew[j] = {};
                    dataNew[j][ParName] = this.data[i][z];
                    j++;
                }
            }
            this.data.splice(0);
            for (var d in this.data) {
                if (!this.data.hasOwnProperty(d)) {
                    continue
                }
                dataNew[d] = this.data[d];
            }

            this.data = dataNew;
            this.data.info.rowcount = this.data.length;
        }

        if (this.getEventsCount('onrefresh') != 0) {
            this.callEvents('onrefresh', this.data, this.controls);
        }
        if (this.data.length != 0) {
            this.fillControlData(this.data[0]);
        }
        var repeater;
        for (var index = 0; index < this.repeaters.length; index++) {
            repeater = this.repeaters[index];
            repeater.setData(this.data)
        }
    }
}

//class DPostObject
function DPostObject() {
    this.propertyes = new Array();
    this.params = new Array();
    this.childs = new Array();
}
function execEventForm(idForm,funcBody) {
    var f = document.getElementById(idForm);
    f.form.execEventFunc.call(this, funcBody);
}
//class DForm
function DForm(_name,_page) {
    this.name = _name;
    this.container = new DNullContainer();
    this.page = _page;
    var repeatersGroup = new Array();
    var repeaters = new Array();
    this.stateReloadForm = false;

    //События, которые оборачиваются внутренним обработчиком
    var execDomEvents = new Array(
        'onclick',
        'onchange',
        'onfocus',
        'onblur',
        'onmousedown',
        'onmouseup',
        'onkeypress',
        'onmouseover',
        'onmouseout',
        'onkeyup');
    ////////////////////////////////////////////////////////
    //Функция для замыкания
    var execEventFunc = function (funcBody, event) {
        // здесь вызываются функции на события dom, например открытие формы
        var Form = namespace;
        var dom = this;
        var formname = dom && dom.getAttribute && dom.getAttribute('formname');
        var container = dom && dom.getAttribute && dom.getAttribute('container');
        var template_field = dom && dom.getAttribute && dom.getAttribute('template_field');
        var tabsheet = dom && dom.closest('[cmptype="TabSheet"]');

        var templates_code = dom && dom.closest('[templates_code]');
        templates_code = templates_code && templates_code.getAttribute('templates_code');
        var visit_tab = dom && dom.closest('[vistab]');
        visit_tab = visit_tab && visit_tab.getAttribute('vistab');

        try{
            eval('(function(){with(Form){' + funcBody + '}}).call(this, event)');
        } catch(e) {
            showScriptError(e, {
                formname: formname,
                script: funcBody,
                container: container,
                visit_tab: visit_tab,
                templates_code: templates_code,
                template_field: template_field,
                tabsheet: tabsheet
            });
        }
    };
    this.execEventForm = execEventFunc;
    //Для дом событий
    var execDomEventFunc = function (dom, funcBody) {
        return function (event) {
            execEventFunc.call(dom, funcBody, event)
        };
    }
    ///////////////////////////////////////////////////////
    this.getRepeaterByName = function (_repeaterName) {
        return repeaters[_repeaterName];
    }
    this.getRepeaterByGroupName = function (_groupName) {
        return repeatersGroup[_groupName];
    }
    this.GetRepiters = function () {
        return repeaters;
    }
    this.addRepeaterClone = function (_groupName, _dataArray, _domObject, _labelName) {
        var _repeater = repeatersGroup[_groupName];
        if (!isObject(_repeater)) {
            showError('Группа [' + _groupName + '] не найдена');
            return null;
        }
        return _repeater.addCloneByUser(_dataArray, _domObject, _labelName);
    }
    this.removeRepeaterClone = function (_groupName, _domObject, _index) {
        var _clone = _domObject.clone;
        var error = false;
        if (!isObject(_clone)) {
            var _repeater = repeatersGroup[_groupName];
            if (!isObject(_repeater)) {
                error = true;
            } else {
                _clone = _repeater.clone;
            }
        } else {
            if ((_clone.group == _groupName) && (_index == null)) {
                _index = _clone.parentClone.clones.indexOf(_clone);
                _clone = _clone.parentClone;
            }
        }
        if (error) {
            showError('Объект [' + getProperty(_domObject, 'name', 'unknownName') + '] не может найти клонируемый объект в группе [' + _groupName + ']');
            return;
        }
        if (_index == null) _index = _clone.clones.length - 1;
        if (_index == -1) return;
        _clone.removeCloneByIndex(_index);
    }
    this.registerRepeaterByName = function (_nameRepeater, _repeater) {
        repeaters[_nameRepeater] = _repeater;
    }
    this.getCloneObjectsByRepeater = function (_repeater, _nameControl) {
        var controls = new Array();
        for (var index = 0; index < _repeater.clone.clones.length; index++) {
            controls.push(_repeater.clone.clones[index].controls[_nameControl]);
        }
        return controls;
    }
    this.getCloneObjectsByRepeaterName = function (_nameRepeater, _nameControl) {
        var _repeater;
        if (typeof (_repeater = repeaters[_nameRepeater]) != 'object') {
            showError('Repeater с именем ' + _nameRepeater + ' не зарегистрирован на форме.');
            return new Array();
        }
        return this.getCloneObjectsByRepeater(_repeater, _nameControl);
    }
    var groupsClone = new Array();
    this.registerRepeaterGroup = function (_groupName, _repeater) {
        repeatersGroup[_groupName] = _repeater;
        groupsClone[_groupName] = _repeater.clone;
    }
    var getPostXml = function (_tmpPostObject) {
        var _repeater = repeatersGroup[_tmpPostObject.propertyes.group];
        var resultXml = '';
        var name = '';
        if (empty(_repeater)) {
            name = _tmpPostObject.propertyes.name;
            resultXml = '<' + name + '>';
            resultXml += getSrcValuesToXML(_tmpPostObject, null);
            resultXml += '</' + name + '>';
        } else {
            var _clone = _repeater.clone;

            var jndex = new Number();
            switch (_tmpPostObject.type.toLowerCase()) {
                case 'add': {
                    for (jndex = 0; jndex < _clone.clones.length; jndex++) {
                        if (_clone.clones[jndex].type != 0)
                            resultXml += _clone.clones[jndex].getPostData(_tmpPostObject);
                    }
                    break;
                }
                case 'upd': {
                    for (jndex = 0; jndex < _clone.clones.length; jndex++) {
                        if (_clone.clones[jndex].type != 1)
                            resultXml += _clone.clones[jndex].getPostData(_tmpPostObject);
                    }
                    break;
                }
                case 'del': {
                    for (jndex = 0; jndex < _clone.rclones.length; jndex++) {
                        if (_clone.rclones[jndex].type == 0)
                            resultXml += _clone.rclones[jndex].getPostData(_tmpPostObject);
                    }
                    break;
                }
                default: {
                    for (jndex = 0; jndex < _clone.clones.length; jndex++) {
                        resultXml += _clone.clones[jndex].getPostData(_tmpPostObject);
                    }
                }
            }
        }
        return resultXml;
    }
    this.takePropertyCloneControl = function (_clone, _domObject) {
        _domObject.clone = _clone;
        var _controlName;
        if (hasProperty(_domObject, "name")) {
            _clone.controls[_controlName = quickGetProperty(_domObject, 'name')] = _domObject;
            this.page.dispatchEvent('createCloneControl' + _controlName, _controlName, _domObject);
        }
        //events
    }
    this.parseCloneObject = function (_clone, _domObject) {
        if (hasProperty(_domObject, "cmptype")) {
            this.takePropertyCloneControl(_clone, _domObject);
        }
        if (hasProperty(_domObject, 'label')) {
            _clone.labels[quickGetProperty(_domObject, 'label')] = _domObject;
        }
        var _tmpNode;
        var _cloneObject;
        for (var index = 0; index < _domObject.children.length; index++) {
            _tmpNode = _domObject.children[index];
            if (_tmpNode.nodeName == '#text') continue;
            if (hasProperty(_tmpNode, 'sample')) {
                if (hasProperty(_tmpNode, 'inclone')) {
                    var chc = _domObject.children.length - 1;
                    _tmpNode.removeAttribute('inclone');
                    var DS = this.getDataSet(getProperty(_tmpNode, 'dataset', ''));

                    var _repeater = DS.addRepeaterByDom(_tmpNode, this, false);
                    _repeater.addControl(_tmpNode);
                    if (hasProperty(_tmpNode, 'afterrefresh')) {
                        DS.addEvent('afterrefresh', _tmpNode);
                    }
                    if (hasProperty(_tmpNode, 'insteadrefresh')) {
                        DS.addEvent('insteadrefresh', _tmpNode);
                    }
                    if (hasProperty(_tmpNode, 'onrefresh')) {
                        DS.addEvent('onrefresh', _tmpNode);
                    }
                    if (hasProperty(_tmpNode, 'before_refresh')) {
                        DS.addEvent('before_refresh', _tmpNode);
                    }
                    _repeater.setData(DS.data);

                    if (chc == index)
                        break;
                } else {
                    removeDomObject(_tmpNode);
                    index--;
                }
                continue;
            }
            if (hasProperty(_tmpNode, 'trash')) continue;

            if (hasProperty(_tmpNode, 'clone')) {
                _cloneObject = _clone.addClone(new DClone(_tmpNode, this));
                _cloneObject.parse();
                continue;
            }
            //if(typeof((_tmpNode).nodeName)=='#text')continue;
            this.parseCloneObject(_clone, _tmpNode);
        }
    }
    var associateControls = new Array();
    var currentControls = associateControls;
    this.isExistsControlByName = function (_controlName, _show_error) {
        if (_controlName == '') return false;
        if (!isObject(currentControls[_controlName])) {
            if (!isObject(associateControls[_controlName])) {
                if (_show_error || _show_error == null) {
                    showError('Компонент с именем ' + _controlName + ' не  зарегистрирован на форме ' + this.name);
                }
                return false;
            }
            return true;
        }
        return true;
    }
    var ObjectForm = this;
    this.getControlByName = function (_controlName, _show_error) {
        if (!this.isExistsControlByName(_controlName, _show_error)) return null;
        return currentControls[_controlName] || associateControls[_controlName];
    }
    this.setHint = function (_controlName, _hint) {
        if (this.isExistsControlByName(_controlName)) {
            var _dom = currentControls[_controlName] || associateControls[_controlName];
            _setControlProperty(_dom, 'hint', _hint);
        }
    }
    this.getHint = function (_controlName) {
        if (this.isExistsControlByName(_controlName))
            return _getControlProperty(currentControls[_controlName] || associateControls[_controlName], 'hint');
        return null;
    }


    this.setEnabled = function (_controlName, _value) {
        if (this.isExistsControlByName(_controlName)) {
            var _dom = currentControls[_controlName] || associateControls[_controlName];
            _setControlProperty(_dom, 'enabled', _value);
            this.page.dispatchEvent('onchangeproperty' + _controlName, _dom, _controlName, 'enabled', _value);
        }
    }
    this.getEnabled = function (_controlName) {
        if (this.isExistsControlByName(_controlName))
            return _getControlProperty(currentControls[_controlName] || associateControls[_controlName], 'enabled');
        return null;
    }

    this.setCaption = function (_controlName, _caption) {
        if (this.isExistsControlByName(_controlName)) {
            var _dom = currentControls[_controlName] || associateControls[_controlName];
            _setControlProperty(_dom, 'caption', _caption);
            this.page.dispatchEvent('onchangeproperty' + _controlName, _dom, _controlName, 'caption', _caption);
        }
    }
    this.getCaption = function (_controlName) {
        if (this.isExistsControlByName(_controlName))
            return _getControlProperty(currentControls[_controlName] || associateControls[_controlName], 'caption');
        return null;
    }
    this.setValue = function (_controlName, _value) {
        if (this.isExistsControlByName(_controlName)) {
            var _dom = currentControls[_controlName] || associateControls[_controlName];
            _setControlProperty(_dom, 'value', _value);
            this.page.dispatchEvent('onchangeproperty' + _controlName, _dom, _controlName, 'value', _value);
        }
    }
    this.getValue = function (_controlName) {
        if (this.isExistsControlByName(_controlName))
            return _getControlProperty(currentControls[_controlName] || associateControls[_controlName], 'value');
        return null;
    }
    this.setControlProperty = function (_controlName, _propertyName, _propertyValue) {
        if (this.isExistsControlByName(_controlName)) {
            var _dom = currentControls[_controlName] || associateControls[_controlName];
            _setControlProperty(_dom, _propertyName, _propertyValue);
            this.page.dispatchEvent('onchangeproperty' + _controlName, _dom, _controlName, _propertyName, _propertyValue);
        }
    }
    this.getControlProperty = function (_controlName, _propertyName) {
        if (this.isExistsControlByName(_controlName))
            return _getControlProperty(currentControls[_controlName] || associateControls[_controlName], _propertyName);
        return null;
    }
    this.vars = new Array();
    this.setVar = function (_paramName, _paramValue) {
        this.vars[_paramName] = _paramValue;
    }
    this.getVar = function (_paramName) {
        if (typeof (this.vars[_paramName]) != 'undefined') {
            return this.vars[_paramName];
        }
        return null;
    }

    var eventsControl = {
        onshow: new Array(),
        oncreate: new Array(),
        onclose: new Array(),
        onreload: new Array(),
        LoadDataSets: new Array()
    };
    var callEvents = function (_eventName) {
        addStackPage(this.page);
        var events = eventsControl[_eventName];
        for (var index = 0; index < events.length; index++) {
            events[index].call(namespace);
        }
        removeStackPage();
    }
    this.addEvents = function (_eventName, funcString) {
        eventsControl[_eventName].push(new DControlEvent(null, funcString, this));
    }
    this.callEvents = function (_eventName) {
        callEvents(_eventName);
    }

    var DataSets = new Array();
    var scriptfiles = new Array();
    var cssfiles = new Array();
    var runScripts = new Array();
    var namespace = new Object();
    this.getNamespace = function () {
        return namespace;
    }
    this.existsFunction = function (name) {
        return namespace[name] instanceof Function;
    }
    this.callFunction = function (name) {
        try {
            return namespace[name].apply(this);
        } catch (e) {
            var formname = this.getAttribute('formname');
            showScriptError(e, {formname: formname, script: (namespace[name] || '').toString()});
        }
    }
    var sysinfo = new Array();
    var SYS_info_types = new Array();

    var any_loadinfo = function (sys_array, _dom, propertyes, params, addprop) {
        var _tmpPostObjectName = '';
        var attributes = new Array();
        for (var index = 0; index < _dom.attributes.length; index++) {
            attributes[_dom.attributes[index].name] = _dom.attributes[index].value;
        }
        if (typeof (attributes['name']) == 'undefined') {
            showError('Имя объекта не указано');
            return;
        }
        if (sys_array == sysinfo && sys_array[attributes['name']]) {
            console.log('Дублирование системных компонентов на форме. Компонент: ' + attributes['name']);
        }
        var _tmpPostObject = sys_array[attributes['name']] = new DPostObject();
        for (var _propertyName in propertyes) {
            if (!propertyes.hasOwnProperty(_propertyName)) {
                continue;
            }
            if (typeof (attributes[propertyes[_propertyName]]) != 'undefined') {
                _tmpPostObject.propertyes[_propertyName] = attributes[propertyes[_propertyName]];
            }
        }
        for (var _propertyName in addprop) {
            if (!addprop.hasOwnProperty(_propertyName)) {
                continue;
            }
            if (typeof (attributes[_propertyName]) != 'undefined') {
                _tmpPostObject[_propertyName] = attributes[_propertyName];
            } else {
                _tmpPostObject[_propertyName] = addprop[_propertyName];
            }
        }

        var _nodes = _dom.childNodes;
        var _node;
        var _nodeName = '';
        for (var index = new Number(0); index < _nodes.length; index++) {
            _node = _nodes[index];
            if ((_nodeName = _node.nodeName.toLowerCase()) == '#text') continue;
            SYS_info_types[_nodeName].call(this, _node, params, _tmpPostObject);
        }
        _tmpPostObject['attrs'] = attributes;
    }
    SYS_info_types['var'] = function (_dom, params, _tmpPostObject) {
        var _object = {ignorenull: false};
        var attributes = new Array();
        for (var andex = 0; andex < _dom.attributes.length; andex++) {
            attributes[_dom.attributes[andex].name] = _dom.attributes[andex].value;
        }
        if (typeof (attributes['ignorenull']) != 'undefined') {
            _object.ignorenull = attributes['ignorenull'] != 'false';
        }

        for (var jndex = 0; jndex < params.length; jndex++) {
            if (typeof (attributes[params[jndex]]) != 'undefined') {
                _object[params[jndex]] = attributes[params[jndex]];
            }
        }
        _tmpPostObject.params.push(_object);
    }
    SYS_info_types['subaction'] = function (_dom, params, _tmpPostObject) {
        any_loadinfo.call(this, _tmpPostObject.childs, _dom, {
            group: 'group',
            name: 'name'
        }, new Array('get', 'src', 'put', 'srctype'), {type: 'upd'});
    }
    SYS_info_types['module'] = function (_dom) {
        any_loadinfo.call(this, sysinfo, _dom, {}, new Array('get', 'src', 'put', 'srctype'), {
            showerror: true,
            responsetype: 'xml',
            mode: 'get',
            type: '0'
        });
    }
    SYS_info_types['dataset'] = function (_dom) {
        any_loadinfo.call(this, sysinfo, _dom, {
            DataSet: 'name',
            mode: 'mode',
            ColumnsField: 'columns_field',
            ValuesField: 'values_field',
            PrimaryField: 'primary_field'
        }, new Array('get', 'srctype', 'src'), {activateoncreate: true, showerror: true})
    }
    SYS_info_types['action'] = function (_dom) {
        any_loadinfo.call(this, sysinfo, _dom, {}, new Array('get', 'src', 'put', 'srctype'), {
            showerror: true,
            mode: 'get'
        });
    }
    SYS_info_types['scriptfile'] = function (_dom) {
        var _name = _dom.textContent || _dom.text;
        scriptfiles[_name] = false;
    }
    SYS_info_types['cssfile'] = function (_dom) {
        var _name = _dom.textContent || _dom.text;
        cssfiles[_name] = false;
    }
    SYS_info_types['parsererror'] = function (_dom) {
        showError(_dom.textContent || _dom.text);
    }
    SYS_info_types['sysinfo'] = function (_dom) {
        var _node;
        for (var index = new Number(0); index < _dom.childNodes.length; index++) {
            _node = _dom.childNodes[index];
            if (_node.nodeName != '#text') SYS_info_types[_node.nodeName.toLowerCase()].call(this, _node)
        }
    }
    SYS_info_types['report'] = function (_dom) {
        any_loadinfo.call(this, sysinfo, _dom, {ID: 'id'}, new Array('get', 'src', 'srctype'), {type: '0'});
    }
    SYS_info_types['formgetparam'] = function (_dom) {
        this.formSettingsGetParam.push(_dom.textContent || _dom.text);
    }
    SYS_info_types['formparam'] = function (_dom) {
        this.formSettingsState.push(_dom.textContent || _dom.text);
    }
    SYS_info_types['help'] = function (_dom) {
        this.helpShow = true;
        this.helpUrl = _dom.textContent || _dom.text || '';
        this.helpAbsPath = _dom.attributes[0].value;
        this.helpUid = _dom.attributes[1].value;
    }
    this.parseSystemInfo = function (_dom) {
        var _tmpInfo = parseXML('<sysinfo>' + _dom.innerHTML + '</sysinfo>');
        for (var index = new Number(0); index < _tmpInfo.childNodes.length; index++) {
            _node = _tmpInfo.childNodes[index];
            if (_node.nodeName != '#text') SYS_info_types[_node.nodeName.toLowerCase()].call(this, _node);
        }
        removeDomObject(_dom);
    }
    this.addSystemInfo = function (_nameInfoObject, _data) {
        /*можно передавать _nameInfoObject с иерархией через : Актуально для action:subaction*/
        var _nameInfoObjectArr = _nameInfoObject.split(':');
        var b = true;
        var sysInfoArr = sysinfo;
        var i = 0;
        var _tmpPostObject = null;
        while (i < _nameInfoObjectArr.length && b) {
            if (isObject(sysInfoArr[_nameInfoObjectArr[i]])) {
                _tmpPostObject = sysInfoArr[_nameInfoObjectArr[i]];
                sysInfoArr = _tmpPostObject.childs;
            } else {
                b = false;
            }
            i++;
        }
        if (!isObject(_tmpPostObject)) {
            _tmpPostObject = sysinfo[_nameInfoObjectArr[0]] = new DPostObject();
        }
        var addparam = true;
        for (var i = 0, len = _tmpPostObject.params; i < len; i++) {
            if (_tmpPostObject.params.get == _data.get) {
                addparam = false;//параметр уже добавлен.
                console.info('параметр ' + _data.get + 'уже добавлен для компонента ' + _nameInfoObject);
                break;
            }
        }
        if (addparam) {
            _tmpPostObject.params.push(_data);
        }
    }
    this.getPropertySysInfoByName = function (_nameObject, _propertyName, _defaultValue) {
        if (!isObject(sysinfo[_nameObject])) return _defaultValue;
        return sysinfo[_nameObject][_propertyName];
    }
    this.setPropertySysInfoByName = function (_nameObject, _propertyName, _Value) {
        if (!isObject(sysinfo[_nameObject])) return;
        sysinfo[_nameObject][_propertyName] = _Value;
    }
    this.getSysInfoByAttr = function (_nameInfoObject, _key_name) {
        var _tmpPostObject = sysinfo[_nameInfoObject] || new DPostObject();
        if (_tmpPostObject['attrs']) {
            if (Object.keys(_tmpPostObject['attrs']).indexOf(_key_name) > -1) {
                return _tmpPostObject['attrs'][_key_name];
            } else {
                return null;
            }
        }
    }
    this.getSysInfoByName = function (_nameInfoObject) {
        var _tmpPostObject = sysinfo[_nameInfoObject] || new DPostObject();
        var resultArray = new Array();
        for (var propertyName in _tmpPostObject.propertyes) {
            if (_tmpPostObject.propertyes.hasOwnProperty(propertyName)) {
                resultArray[propertyName] = _tmpPostObject.propertyes[propertyName];
            }
        }

        var param;
        var value = null;
        var ignorenull = false;
        ;
        for (var index = new Number(0); index < _tmpPostObject.params.length; index++) {
            param = _tmpPostObject.params[index];
            if (typeof (param.get) == 'undefined') continue;
            ignorenull = param.ignorenull;
            switch (param.srctype.toLowerCase()) {
                case 'var': {
                    value = this.getVar(param.src);
                    break;
                }
                case 'ctrl': {
                    value = this.getValue(param.src);
                    var _dom = this.getControlByName(param.src, true);
                    if (getProperty(_dom, 'filteritem', '') == 'true')
                        value = FilterItem_GetValue(_dom, value);
                    break;
                }
                case 'ctrlcaption': {
                    value = this.getCaption(param.src);
                    break;
                }
                case 'ctrlhint': {
                    value = this.getHint(param.src);
                    break;
                }
                default: {
                    value = param.src;
                }
            }

            if ((value != null && value.toString() != '') || ignorenull || param.get.substr(0, 1) == '*') {
                if (value == null) value = '';
                resultArray[param.get] = value;
            }
        }
        for (var _childName in _tmpPostObject.childs) {
            if (_tmpPostObject.childs.hasOwnProperty(_childName)) {
                resultArray[_childName] = getPostXml.call(this, _tmpPostObject.childs[_childName]);
            }
        }
        return resultArray;
    }
    this.takePropertyControl = function (_dom, _container) {
        if (hasProperty(_dom, 'name')) {
            associateControls[quickGetProperty(_dom, 'name')] = _dom;
        }
        if (_container != null){
            _container.addControl(_dom);
        }
        if (hasProperty(_dom, 'onshow')){
            eventsControl.onshow.push(execDomEventFunc(_dom, quickGetProperty(_dom, 'onshow')));
        }
        if (hasProperty(_dom, 'oncreate')){
            eventsControl.oncreate.push(execDomEventFunc(_dom, quickGetProperty(_dom, 'oncreate')));
        }
        if (hasProperty(_dom, 'onclose')){
            eventsControl.onclose.push(execDomEventFunc(_dom, quickGetProperty(_dom, 'onclose')));
        }
        if (hasProperty(_dom, 'onreload')){
            eventsControl.onreload.push(execDomEventFunc(_dom, quickGetProperty(_dom, 'onreload')));
        }
        for (var i = 0; i < execDomEvents.length; i++){
            if (hasProperty(_dom, execDomEvents[i])){
                _dom[execDomEvents[i]] = execDomEventFunc(_dom, quickGetProperty(_dom, execDomEvents[i]));
            }
        }
    }
    this.parse = function (_dom, _container, _dataset) {
        var count = 0;
        if (hasProperty(_dom, 'cmptype')) {
            _dom.jsParent = this;
            var _cmptype = quickGetProperty(_dom, 'cmptype');
            switch (_cmptype.toLowerCase()) {
                case 'sysinfo': {
                    this.parseSystemInfo(_dom);
                    count++;
                    break;
                }
                case 'script': {
                    this.parseScript(_dom);
                    count++;
                    break;
                }
                case 'title': {
                    this.container.setCaption(_dom.innerHTML);
                    removeDomObject(_dom);
                    count++;
                    break;
                }
                case 'frminfo':
                case 'frmetalon': {
                    return 0;
                }
                default: {
                    this.takePropertyControl(_dom, _container);
                }
            }
        }
        var _tmpNodes = _dom.childNodes;
        var _tmpNode;
        var _tmpContainer = _container;
        var _tmpNameDataSet = '';
        var _tmpDataSet = _dataset;
        //		var _repeater;
        for (var index = 0; index < _tmpNodes.length; index++) {
            _tmpContainer = _container;
            if (typeof ((_tmpNode = _tmpNodes[index]).nodeName) == '#text') continue;
            if (hasProperty(_tmpNode, 'dataset')) {
                if (typeof (DataSets[_tmpNameDataSet = quickGetProperty(_tmpNode, 'dataset')]) != 'object') {
                    DataSets[_tmpNameDataSet] = new DDataSetContainer(_tmpNameDataSet, _tmpNode, this);
                }
                _tmpDataSet = _tmpContainer = DataSets[_tmpNameDataSet];
                if (hasProperty(_tmpNode, 'repeate')) {
                    var _stopclone = false;
                    var _withoutParent = hasProperty(_tmpNode, 'withoutParent');
                    if (hasProperty(_tmpNode, 'stopclone')) {
                        _stopclone = (quickGetProperty(_tmpNode, 'stopclone') == 'true');
                    }
                    _tmpContainer = _tmpContainer.addRepeaterByDom(_tmpNode, this, _stopclone);
                    if (_container && _container.isRepeater && !_withoutParent) {
                        _container.addRepeater(_tmpContainer, hasProperty(_tmpNode, 'detail'), false, _stopclone);
                        _tmpContainer.parentRepeater = _container;
                        //_tmpNode.removeAttribute("detail",false);
                    }
                }
            }
            if (hasProperty(_tmpNode, 'afterrefresh')) {
                _tmpDataSet.addEvent('afterrefresh', _tmpNode);
            }
            if (hasProperty(_tmpNode, 'insteadrefresh')) {
                _tmpDataSet.addEvent('insteadrefresh', _tmpNode);
            }
            if (hasProperty(_tmpNode, 'onrefresh')) {
                _tmpDataSet.addEvent('onrefresh', _tmpNode);
            }
            if (hasProperty(_tmpNode, 'before_refresh')) {
                _tmpDataSet.addEvent('before_refresh', _tmpNode);
            }

            index -= this.parse(_tmpNode, _tmpContainer, _tmpDataSet);
        }
        return count;
    }

    this.parseScript = function (_dom) {
        // сохраняем максимально все параметры скрипта, чтоб можно было вывести в сообщении для отладки
        // здесь вызываются скрипты с рисованных форм обернутые в <component type="Script">
        var parentDom = _dom && _dom.closest('[formname]');
        var tabsheet = _dom && _dom.closest('[cmptype="TabSheet"]');
        var template_field = _dom && _dom.getAttribute && _dom.getAttribute('template_field');
        var templates_code = _dom && _dom.closest('[templates_code]');
        templates_code = templates_code && templates_code.getAttribute('templates_code');
        var visit_tab = _dom && _dom.closest('[vistab]');
        visit_tab = visit_tab && visit_tab.getAttribute('vistab');
        var formname = parentDom && parentDom.getAttribute('formname');
        runScripts.push({
            script: _dom.value,
            formname: formname,
            templates_code: templates_code,
            template_field: template_field,
            visit_tab: visit_tab,
            tabsheet: tabsheet
        });
        removeDomObject(_dom);
    }
    var includeScriptAccept = function (_fileName) {
        scriptfiles[_fileName] = true;
        countLoadScript--;
        if (countLoadScript <= 0) {
            //из-за асинхронности, при запросе с формы на oncreate, сюда вклинивался датасет и вызывал onshow
            //сейчас в любом случае в этот момент onshow не вызовется
            this.requestsCount++;
            // если какойто скрипт отвалился - полностью прекращаем выполнение
            if (!this.processRunScripts()) {
                return;
            }
            this.startActionsGroup();
            callEvents.call(this, 'oncreate');
            this.page.dispatchEvent('oncreate');
            this.formCreate();
            this.endActionsGroup();
            this.prepareLoadDataSets();
            this.requestsCount--;
            this.loadDataSets();
        }
    }
    var includeScriptCancel = function (_fileName) {
        showError('Не  удалось подгрузить файл ' + _fileName + endl + 'Возможно некоторые компоненты будут работать некорректно');
        if (confirm('Продолжить загрузку без остановки скрипта?')) {
            includeScriptAccept.call(this, _fileName);
            return;
        }
    }
    var countLoadScript = new Number(0);
    this.processIncludes = function () {
        var _fileName = '';
        for (_fileName in scriptfiles) {
            if (scriptfiles.hasOwnProperty(_fileName)) {
                if (SYS_include_js(_fileName, includeScriptAccept, includeScriptCancel, this)) countLoadScript++;
            }
        }
        if (countLoadScript <= 0) {
            this.requestsCount++;
            // если какойто скрипт отвалился - полностью прекращаем выполнение
            if (!this.processRunScripts()) {
                return;
            }
            this.startActionsGroup();
            callEvents.call(this, 'oncreate');
            this.page.dispatchEvent('oncreate');
            this.formCreate();
            this.endActionsGroup();
            this.prepareLoadDataSets();
            this.requestsCount--;
            this.loadDataSets();
        }
        for (_fileName in cssfiles) {
            if (cssfiles.hasOwnProperty(_fileName)) {
                SYS_include_css(_fileName, true);
            }
        }
    }
    var requestFormAccept = function (_html,_prom,_peq) {
        var formCache = _peq.getResponseHeader('FormCache');
        this.formCache = formCache;
        if (this.formData._openWindowData) {
            this.page.window_size = null;
            var owd = this.formData._openWindowData;
            delete this.formData._openWindowData;
            this.isComposition = owd.isComposition;
            if (owd.modal && !isObject(owd.modal)) {
                try {
                    var win = new DWindow(owd.otladka);
                    win.IsComposition = owd.isComposition;

                    if (owd.width && owd.height)
                        this.page.window_size = {width: owd.width, height: owd.height};
                    var pageW = this.page;
                    win.addListener('onreload', function () {
                        reloadWindow(0, pageW);
                    }, null, false);
                    win.addListener('onclose', function () {
                        closeWindow(0, pageW);
                    }, null, false);
                    this.page.setContainer(win);
                    this.page.modal = true;
                } catch (e) {
                    alert('not including window.js');
                    return;
                }
            } else if (owd.modal && isObject(owd.modal)) {
                this.page.setContainer(new DDocument(owd.modal));
            } else if (!owd.modal) {
                this.page.setContainer(new DDocument());
                 /*
                if(window.SYS_current_theme == 'bars'){
                    var _page = getPage();
                    while (SYS_pages_window.length != 0) {
                        removePage(0);
                    }
                    SYS_lastPage = _page;
                    SYS_pages_window.push(_page);
                    var index = 0;
                    while (index < SYS_pages.length) {
                        if (SYS_pages[index] != _page) {
                            SYS_pages.splice(index, 1);
                        } else {
                            index++;
                        }
                    }
                }
                */
            }
            if (!owd.notAddPage)
                addPage(this.page);
        }

        if (!isObject(this.container)) {
            showError('Неверный контейнер для формы ' + this.name + endl + ' [object].container=' + this.container);
        }
        this.container.show();

        addStackPage(this.page);
         /*
        if (SYS_current_theme === 'bars') {
            this.container.getContainer().innerHTML = _html ? _html : '<div></div>';
            var l_MainDOM = this.container.getContainer().childNodes[0];
        } else {
            this.container.getContainer().insertAdjacentHTML('afterbegin', _html ? _html : '<div></div>');
            var container = this.container.getContainer();
            var l_MainDOM = container.childNodes[0];
        }
        */
            this.container.getContainer().insertAdjacentHTML('afterbegin', _html ? _html : '<div></div>');
            var container = this.container.getContainer();
            var l_MainDOM = container.childNodes[0];

        // задаем размер окна указанный в атрибуде window_size основого тега
        var window_size = undefined;
        if (l_MainDOM.attributes['window_size'] != undefined)
            window_size = l_MainDOM.attributes['window_size'];
        this.page.force_windowsize = false;
        if (this.page.modal && l_MainDOM.attributes['mwindow_size'] != undefined) {
            this.page.force_windowsize = true;
            window_size = l_MainDOM.attributes['mwindow_size'];
        }
        this.version = parseFloat(getProperty(l_MainDOM, 'version', '1'));
        if (this.version < 2.5 && getProperty(this.container.getContainer(), 'report', 'false') != 'true') {
            if (l_MainDOM.nodeName.toUpperCase() != 'DIV') {
                var d = document.createElement('div');
                this.container.getContainer().appendChild(d);
                d.appendChild(l_MainDOM);
                l_MainDOM = d;
            }
            addClass(l_MainDOM, 'formBackground');
        }
        // -----
        if (window_size != undefined && this.page.window_size == null) {
            var l_WndSizeArr = window_size.value.split('x');
            if (l_WndSizeArr[0] != 'undefined') {
                if (l_WndSizeArr.length < 2) l_WndSizeArr[1] = 500
                this.page.window_size = {width: l_WndSizeArr[0], height: l_WndSizeArr[1]}
            }
        }

        this.containerForm = l_MainDOM;
        if (!this.formData.nooverflow && !this.formData.rep_paramnooverflow) {
            this.containerForm.style.overflow = 'auto';
        }
        l_MainDOM.form = this;
        this.uniqID = 'Form_' + (new Date()).getTime();
        GLOBAL_CURRENT_FORM = this.uniqID;
        l_MainDOM.id = this.uniqID;

        this.parse(this.container.getContainer())

        /*
        if (SYS_current_theme === 'bars') {
            this.parse(this.container.getContainer())
        } else {
            // Временный фикс композиций
            var compositionsScripts = container.querySelectorAll(
                ':scope > [cmptype="Script"]'
            )
            if (compositionsScripts.length > 0) {
                compositionsScripts.forEach(function (e) {
                    l_MainDOM.appendChild(e)
                })
            }
            var compositionsSysInfo = container.querySelectorAll(
                ':scope > [cmptype="sysinfo"]'
            )
            if (compositionsSysInfo.length > 0) {
                compositionsSysInfo.forEach(function (e) {
                    l_MainDOM.appendChild(e)
                })
            }

            this.parse(l_MainDOM)
        }
        */

        //this.setSizePos();
        this.showHelp();
        removeStackPage();
        if (this.page.modal) {
            this.setSizePos();
        } else {
            this.container.setVisible(true);
        }
        this.processIncludes();

        function stopEventDragStart(e) {
            e = e || window.event;
            if (e.target.tagName === 'IMG') {
                if (e.preventDefault) {
                    e.preventDefault();
                } else {
                    e.returnValue = false
                }
                return false;
            } else if (e.target.tagName === 'A') {
                e.dataTransfer.setData("Text", e.target.textContent);
            }
            return true;
        }

        this.containerForm.addEventListener('dragstart', stopEventDragStart);
    }
    this.setSizePos = function (onlySize) {
        var size = getDocumentSize();
        if (this.page.modal) {
            if (this.page.window_size && this.page.window_size.width != undefined && this.page.window_size.height != undefined) {
                var _hneed = false;
                var _wneed = false;
                if (this.page.window_size.width != 'auto' && (!this.page.window_size.width.indexOf || this.page.window_size.width.indexOf('%') == -1))
                    var l_Width = Math.min(this.page.window_size.width, size.width);
                else {
                    var l_Width = this.page.window_size.width;
                    _wneed = true;
                }
                if (this.page.window_size.height != 'auto' && (!this.page.window_size.height.indexOf || this.page.window_size.height.indexOf('%') == -1))
                    var l_Height = Math.min(this.page.window_size.height, size.height);
                else {
                    var l_Height = this.page.window_size.height;
                    _hneed = true;
                }

                this.page.getContainer().setSize(l_Width, l_Height);

                if (_wneed || _hneed) {
                    this.page.getContainer().clearMaxSizeStyle();
                    var rws = getAbsoluteSize(this.page.getContainer().GetMainDOM());
                    l_Width = (_wneed) ? rws.width : l_Width;
                    l_Height = (_hneed) ? rws.height : l_Height;
                    this.page.window_size = false;
                }
                if (!onlySize)
                    this.page.getContainer().setPosition(size.width / 2 - l_Width / 2, size.height / 2 - l_Height / 2);
            }
            if (this.containerForm) {
                this.containerForm.style.overflow = '';
                setDomSizeNoPx(this.containerForm, '', '100%');
                if (this.page.window_size)
                    this.page.getContainer().clearMaxSizeStyle();
                var ws = getAbsoluteSize(this.page.getContainer().GetMainDOM());
                var s = getAbsoluteRect(this.containerForm);

                var dh = this.containerForm.scrollHeight - s.height;
                var dw = this.containerForm.scrollWidth - s.width;
                if (dw > 0) dw += 7;

                var l_Width = Math.min(ws.width + dw, size.width);
                var l_Height = Math.min(ws.height + dh, size.height);
                this.page.getContainer().clearMaxSizeStyle();
                this.page.getContainer().setSize(l_Width, l_Height);
                if (!onlySize)
                    this.page.getContainer().setPosition(size.width / 2 - l_Width / 2, size.height / 2 - l_Height / 2);
                this.containerForm.style.overflow = 'auto';
            } else {
                this.page.getContainer().setSize(400, 300);
                if (!onlySize)
                    this.page.getContainer().setPosition(size.width / 2 - 400 / 2, size.height / 2 - 300 / 2);
            }
            this.page.getContainer().setVisible(true);
            return;
        } else {
            setDomSizeNoPx(this.container.GetMainDOM(), '', '');
            var form_height = this.containerForm.style.height;
            if (this.page.window_size && this.containerForm) {
                var hpx = this.page.window_size.height;

                if (hpx != 'auto' && (!hpx.indexOf || hpx.indexOf('%') == -1)) {
                    hpx = hpx + 'px';
                    setDomSizeNoPx(this.containerForm, '', hpx);
                } else {
                    if (hpx == '100%')
                        setDomSizeNoPx(this.container.GetMainDOM(), '', '100%');
                    else
                        setDomSizeNoPx(this.container.GetMainDOM(), '', '');
                    setDomSizeNoPx(this.containerForm, '', hpx);
                }
            } else if (form_height == '100%') {
                setDomSizeNoPx(this.container.GetMainDOM(), '', '100%');
            } else if (form_height && (form_height.indexOf || form_height.indexOf('%') > 0)) {
                setDomSizeNoPx(this.containerForm, '', form_height);
            }
            this.container.setVisible(true);
        }
        runCalcSize(this.container.GetMainDOM(), this.container.GetMainDOM());
    }
    this.setSizeTrunc = function (onlySize) {
        if (this.page.modal) {
            this.page.getContainer().setSize(0, 0);
            this.setSizePos(onlySize);
        }
    }
    var requestFormCancel = function (_xml, _status) {
        this.setSizePos();
        if (_xml){
            showXmlError(_xml);
        }
    }
    this.formData = {};
    this.getUrlFormDataRecurs = function (_Data, _PropName) {
        if (_Data instanceof Function)
            return '';
        if (_PropName == undefined) _PropName = null;

        var urlFormData = '';

        for (var _propertyName in _Data) {
            if (!_Data.hasOwnProperty(_propertyName)) {
                continue
            }
            if (_propertyName == '_openWindowData') {
                if (!empty(_Data[_propertyName]['modal']) && _Data[_propertyName]['modal'] == true) {
                    urlFormData += '&modal=1';
                }
                continue;
            }
            if (isObject(_Data[_propertyName])) {
                var l_PropName = _PropName != null ? _PropName + '[' + _propertyName + ']' : _propertyName;
                urlFormData += this.getUrlFormDataRecurs(_Data[_propertyName], l_PropName);
            } else {
                if (_PropName != null) {
                    urlFormData += '&' + _PropName + '[' + _propertyName + ']=' + encodeURIComponent(_Data[_propertyName]);
                } else {
                    urlFormData += '&' + _propertyName + '=' + encodeURIComponent(_Data[_propertyName]);
                }
            }
        }
        return urlFormData;
    }
    this.getUrlFormData = function () {
        if (!empty(this.page) && empty(this.formData['_openWindowData']) && !empty(this.page.modal) && this.page.modal == true) {
            this.formData['modal'] = '1';
        }
        return this.getUrlFormDataRecurs(this.formData);
    }
    this.requestForm = function () {
        if (this.name[0] == '#' || this.id) {
            this.id = this.id || this.name.substr(1);
            this.name = this.id;
            var el = document.getElementById(this.id);
            if (el) {
                requestFormAccept.call(this, el.innerHTML);
            }
        } else{
            requestServerForm(this.name + this.getUrlFormData(), requestFormAccept, requestFormCancel, this);
        }

    }
    this.callScriptFunction = function (fName, args) {
        if (namespace[fName]) {
            namespace[fName].apply(namespace, args);
        }
    }
    this.processRunScripts = function () {
        // результат удачности выполнения скриптов. если какойто скрипт отвалился - полностью прекращаем выполнение
        var result = true;
        var getSysFuncFromUserFunc = function (_function) {
            // здесь обрабатываются функции вызванные из функций (например base().afterCheck внутри base().OkButton())
            return function () {
                addStackPage(ObjectForm.page);
                try {
                    var result = _function.apply(this, arguments);
                } catch (e) {
                    showScriptError(e, {formname: ObjectForm.name, script: _function});
                }
                removeStackPage();
                return result;
            };
        }
        var Form = namespace;

        run = run.bind(this);
        run(0, 1);

        function run(index, repCount) {
            try {
                for (; index < runScripts.length; index++) {
                    if (!result) {
                        break;
                    }
                    eval('try {' + runScripts[index].script + '} catch(e) {showScriptError(e, runScripts[index])}');
                }
                for (var _propertyName in Form) {
                    if (!Form.hasOwnProperty(_propertyName)) {
                        continue;
                    }
                    if (typeof (Form[_propertyName]) == 'function') {
                        Form[_propertyName] = getSysFuncFromUserFunc(Form[_propertyName]);
                    }
                }
            } catch (e) {
                if (e.name === 'NS_ERROR_NOT_AVAILABLE' && repCount < 10) {
                    setTimeout(run, 500, index, repCount + 1);
                } else {
                    result = false;
                    showScriptError(e, runScripts[index]);
                    return;
                }
            }
        }
        return result;
    }
    var requestServerDataSetAccept = function (_xml, promiseObj) {
        if (!this.page) {
            //форму успели закрыть
            return;
        }
        this.requestsCount--;
        if(!_xml){
            D3Api.debug_msg('данные не пришли.');
            return;
        }
        var _nodes = _xml.childNodes;
        if (!isNodeList(_nodes)) {
            showError(_nodes);

            return;
        }
        addStackPage(this.page);
        var _node;
        var jndex;
        var _dataset;
        var _dataArray = [];
        for (var index = 0; index < _nodes.length; index++) {
            _node = _nodes[index];
            switch (_node.nodeName.toLowerCase()) {
                case 'dataset': {
                    for (jndex = 0; jndex < _node.attributes.length; jndex++) {
                        if (_node.attributes[jndex].name == 'name') {
                            loadingDataSets[_node.attributes[jndex].value] = false;
                            _dataArray = DataSetXmlDataToArray(_node, 0, Boolean(this.getPropertySysInfoByName(_node.attributes[jndex].value, 'showerror', 'true') != 'false'));
                            (_dataset = DataSets[_node.attributes[jndex].value]).setData(_node, Boolean(this.getPropertySysInfoByName(_node.attributes[jndex].value, 'showerror', 'true') != 'false'));
                            _dataset.callEvents('afterrefresh');
                            if (this.loadDataSets) {
                                stackDataSets.splice(0, 1);
                                this.loadDataSets();
                            }
                            break;
                        }
                    }
                    break;
                }
                case 'parsererror':
                case 'error': {
                    showXmlError(_node);
                    break;
                }
            }
        }
        if (promiseObj && 'resolve' in promiseObj) {
            promiseObj.resolve(_dataArray);
        }
        removeStackPage();
    }
    var requestServerDataSetCancel = function (_xml, _status) {
        if (!this.page) {
            /**
             * форму успели закрыть
             **/
            return;
        }
        this.requestsCount--;
        addStackPage(this.page);
        showXmlError(_xml);
        stackDataSets.splice(0, 1);
        this.loadDataSets();
        removeStackPage();
    }
    var stackDataSets = new Array();
    var isShowing = false;
    var isCreated = false;
    var isShowed = false;
    var isSized = false;
    this.requestsCount = 0;
    this.loadDataSets = function () {
        if (this.requestsCount == 0) {
            if (!isShowing) {
                isShowing = true;
                this.startActionsGroup();
                callEvents.call(this, 'onshow');
                this.page.dispatchEvent('onshow');
                isShowed = true;
                this.endActionsGroup();
                decSYS_countShowState();
                if (this.requestsCount == 0) {
                    isSized = true;
                    this.setSizePos();
                }
            } else if (!isSized) {
                isSized = true;
                this.setSizePos();
            }
            return;
        }
    }
    this.getDataSet = function (_dataSetName, _show_error) {
        var dataSet = DataSets[_dataSetName];
        if (!isObject(dataSet) && (_show_error || _show_error == null)) {
            showError('DataSet с именем ' + _dataSetName + ' не найден на форме ' + this.name + ' или он не имеет связи с компонентами формы');
            return;
        }
        return dataSet
    }
    var loadingDataSets = new Array();
    this.refreshDataSet = function (_dataSetName, instead) {
        var dataSet = DataSets[_dataSetName];
        if (!isObject(dataSet)) {
            showError('DataSet с именем ' + _dataSetName + ' не найден на форме ' + this.name + ' или он не имеет связи с компонентами формы');
            return;
        }
        if (dataSet.getEventsCount('insteadrefresh') == 0) {
            instead = false;
        }
        if (instead) {
            dataSet.callEvents('insteadrefresh');
            return;
        }
        if (dataSet.getEventsCount('before_refresh') > 0) {
            if (dataSet.callEvents('before_refresh') === false)
                return;
        }
        loadingDataSets[_dataSetName] = true;
        var _data = this.getSysInfoByName(_dataSetName);
        _data.DataSet = _dataSetName;
        if (startMultiRequest) {
            this.addMultiData({DATA: _data, TYPE: 'datasetrange'});
            return;
        }
        var page = this;
        this.requestsCount++;
        var name = /*this.getSysInfoByAttr(_dataSetName,'formname')||*/this.name;
        return requestServerDataSet(name + this.getUrlFormData() + '&baseForm=' + this.name, _data, requestServerDataSetAccept, requestServerDataSetCancel, this);
    }
    var requestServerMultiDataSetsAccept = function (_xml) {
        if(!_xml){
            D3Api.debug_msg('данные не пришли.');
            return;
        }
        var _nodes = _xml.childNodes;
        if (!isObject(_nodes)) {
            showError(_nodes);
            return;
        }
        var index = 0;
        var _node;
        while ((_node = _nodes[index]).nodeName != 'multidata' && index < _nodes.length) index++;
        var _sysid = 0;
        for (index = 0; index < _node.attributes.length; index++) {
            if (_node.attributes[index].name == 'sysid') {
                _sysid = parseInt(_node.attributes[index].value) - 1;
                break;
            }
        }
        _nodes = _node.childNodes;
        if (!isObject(_nodes)) {
            showError('В ответе от сервера не найдено ни одного источника данных');
            return;
        }
        var _data;
        var jndex;
        var sourceCode;
        addStackPage(this.page);
        var _name;
        var _id;
        var countAttributes = 0;
        for (index = 0; index < _nodes.length; index++) {
            _node = _nodes[index];
            if (!_node.attributes) continue;
            countAttributes = 0;
            _id = 0;
            for (jndex = 0; jndex < _node.attributes.length; jndex++) {
                if (_node.attributes[jndex].name == 'name') {
                    _name = _node.attributes[jndex].value;
                    countAttributes++;
                }
                if (_node.attributes[jndex].name == 'sysid') {
                    _id = parseInt(_node.attributes[jndex].value);
                    countAttributes++;
                }
                if (countAttributes >= 2) break;
            }
            if (countAttributes < 1) continue;//not found all attributes
            _data = this.getMultiData(_sysid, _id);
            if (!isObject(_data)) continue;

            sourceCode = _node.nodeName.toLowerCase();
            //alert(sourceCode+'='+_data.TYPE);
            var _dataset;
            switch (_data.TYPE.toLowerCase()) {
                case 'datasetrange': {
                    if (sourceCode == 'dataset') {
                        loadingDataSets[_name] = false;
                        (_dataset = DataSets[_name]).setData(_node, Boolean(this.getPropertySysInfoByName(_name, 'showerror', 'true') != 'false'));
                        _dataset.callEvents('afterrefresh');
                        break;
                    }
                    break;
                }
                case 'datasetcount': {
                    if (sourceCode == 'dataset') {
                        if (_data._callBackFunction instanceof Function) _data._callBackFunction.call(_data._callBackObject, DataSetXmlDataToCount(_node, Boolean(this.getPropertySysInfoByName(_name, 'showerror', 'true') != 'false')));
                    }
                    break;
                }
                default: {
                    showError('Неизвестный тип ' + _data.TYPE + '.');
                }
            }
            if (_dataset.data.sys_error)
                break;
        }
        removeStackPage();
    }
    var requestServerMultiDataSetsCancel = function (_xml, _status) {
        this.requestsCount--;
        addStackPage(this.page);
        showXmlError(_xml);
        //multiDatas=new Array();
        this.loadDataSets();
        removeStackPage();
    }
    var startMultiRequest = false;
    this.startMultiDataSetsGroup = function () {
        startMultiRequest = true;
        multiDatas[multiDatas.length] = new Array();
    }
    this.endMultiDataSetsGroup = function (_callBackAcceptMethod) {

        startMultiRequest = false;
        this.refreshMultiDataSets(_callBackAcceptMethod);
    }
    var multiDatas = new Array();
    this.addMultiData = function (_data) {
        var multiData = multiDatas[multiDatas.length - 1];
        _data.DATA._sysid = multiData.length;
        multiData.push(_data);
    }
    this.getMultiData = function (_indexMultiData, _indexData) {
        return multiDatas[_indexMultiData][_indexData];
    }
    this.removeMultiData = function (_indexMultiData) {
        multiDatas.splice(_indexMultiData, 1);
    }
    this.refreshMultiDataSets = function (_callBackAcceptMethod) {
        if (multiDatas.length == 0) {
            return;//если ни одного датасета не нужно то выходим
        }

        var _datas = new Array();
        var _lastdatas = new Array();
        var _data;
        var _id = multiDatas.length;
        var multiData = multiDatas[_id - 1];
        for (var index = 0; index < multiData.length; index++) {
            _data = multiData[index];
            //запрос данных для DS к-е заканчиваются на _dataset в первую очередь
            if (hasstr_dataset(_data.DATA.DataSet)) {
                _datas.push(_data.DATA);
            } else {
                _lastdatas.push(_data.DATA);
            }
        }
        for (var i = 0; i < _lastdatas.length; i++) {
            _datas.push(_lastdatas[i]);
        }
        if (_datas.length == 0) {
            return;
        }
        this.requestsCount++;
        var promise = requestServerMultiDataSetsThread(_id,
            this.name,
            this.formData,
            _datas,
            this);
        var that = this;
        promise.then(function (_result) {
            for (var i = 0, len = _result.length; i < len; i++) {
                requestServerMultiDataSetsAccept.call(that, _result[i]);
            }
            that.requestsCount--;
            that.loadDataSets();
            if (_callBackAcceptMethod instanceof Function) _callBackAcceptMethod.call();
        }, function (_obj) {
            requestServerMultiDataSetsCancel(_obj['xml'], _obj['status']);
        }).catch(function(e) {
            // todo formname
            showScriptError(e, {formname: that.name, script: (_callBackAcceptMethod || '').toString()});
        });
    }

    var requestDataSetCountAccept = function (_xml, _callBackFunction, _callBackObject) {
        this.requestsCount--;
        if(!_xml){
            D3Api.debug_msg('данные не пришли.');
            return;
        }
        var _nodes = _xml.childNodes;
        if (!isNodeList(_nodes)) {
            showError(_nodes);
            return;
        }
        addStackPage(this.page);
        var _node;
        var jndex;
        var count = 0;
        var _name;
        for (var index = 0; index < _nodes.length; index++) {
            _node = _nodes[index];
            switch (_node.nodeName.toLowerCase()) {
                case 'dataset': {
                    for (jndex = 0; jndex < _node.attributes.length; jndex++) {
                        if (_node.attributes[jndex].name == 'name') {
                            _name = _node.attributes[jndex].value;
                            count = DataSetXmlDataToCount(_node, Boolean(this.getPropertySysInfoByName(_node.attributes[jndex].value, 'showerror', 'true') != 'false'));
                            stackDataSets.splice(0, 1);
                            this.loadDataSets();
                            break;
                        }
                    }
                    break;
                }
                case 'parsererror':
                case 'error': {
                    showXmlError(_node);
                    break;
                }
            }
        }
        if (_callBackFunction instanceof Function) _callBackFunction.call(_callBackObject, count);
        removeStackPage();
    }
    var requestDataSetDataAccept = function (_xml, _acceptCallBackFunction, _cancelCallBackFunction, _callBackObject, promiseObj) {
        this.requestsCount--;
        if(!_xml){
            D3Api.debug_msg('данные не пришли.');
            return;
        }
        var _nodes = _xml.childNodes;
        if (!isNodeList(_nodes)) {
            showError(_nodes);
            return;
        }
        addStackPage(this.page);
        var _node;
        var jndex;
        var _dataArray = new Array();

        for (var index = 0; index < _nodes.length; index++) {
            _node = _nodes[index];
            switch (_node.nodeName.toLowerCase()) {
                case 'dataset': {
                    for (jndex = 0; jndex < _node.attributes.length; jndex++) {
                        if (_node.attributes[jndex].name == 'name') {
                            _dataArray = DataSetXmlDataToArray(_node, 0, Boolean(this.getPropertySysInfoByName(_node.attributes[jndex].value, 'showerror', 'true') != 'false'))
                            if (_dataArray.sys_error) {
                                if (_cancelCallBackFunction instanceof Function) _cancelCallBackFunction.call(_callBackObject, new Array());
                            } else {
                                if (_acceptCallBackFunction instanceof Function) _acceptCallBackFunction.call(_callBackObject, _dataArray);
                            }
                            break;
                        }
                    }
                    break;
                }
                case 'parsererror':
                case 'error': {
                    showXmlError(_node);
                    break;
                }
            }
        }
        if (promiseObj && 'resolve' in promiseObj) {
            promiseObj.resolve(_dataArray);
        }
        this.loadDataSets();
        removeStackPage();
    }
    this.requestDataSetData = function (_dataSetName, _data, _acceptCallBackFunction, _cancelCallBackFunction, _callBackObject, async) {
        if (!isObject(DataSets[_dataSetName])) {
            if (!isObject(sysinfo[_dataSetName])) {
                showError('DataSet с именем ' + _dataSetName + ' не найден на форме ' + this.name);
                return;
            }
        }
        var _sys_data = this.getSysInfoByName(_dataSetName);
        _data.DataSet = _dataSetName;
        for (var _propertyName in _data) {
            if (_data.hasOwnProperty(_propertyName)) {
                _sys_data[_propertyName] = _data[_propertyName];
            }
        }
        this.requestsCount++;
        return requestServerDataSet(this.name + this.getUrlFormData(), _sys_data, function (_xml, promise) {
                requestDataSetDataAccept.call(this, _xml, _acceptCallBackFunction, _cancelCallBackFunction, _callBackObject, promise);
            },
            function (_xml) {
                showXmlError(_xml);
                addStackPage(this.page);
                if (_cancelCallBackFunction instanceof Function)
                    _cancelCallBackFunction.call(_callBackObject, 0);
                removeStackPage();
            }, this, async);
    }
    this.requestDataSetCount = function (_dataSetName, _callBackFunction, _callBackObject) {
        if (!isObject(DataSets[_dataSetName])) {
            showError('DataSet с именем ' + _dataSetName + ' не найден на форме ' + this.name);
            return;
        }
        var _data = this.getSysInfoByName(_dataSetName);
        _data.mode = 'Count';
        _data.DataSet = _dataSetName;
        if (startMultiRequest) {
            this.addMultiData({
                DATA: _data,
                TYPE: 'datasetcount',
                _callBackFunction: _callBackFunction,
                _callBackObject: _callBackObject
            });
            return;
        }
        this.requestsCount++;
        requestServerDataSet(this.name + this.getUrlFormData(), _data, function (_xml) {
            requestDataSetCountAccept.call(this, _xml, _callBackFunction, _callBackObject);
        }, function (_xml) {
            showXmlError(_xml);
            addStackPage(this.page);
            if (_callBackFunction instanceof Function) _callBackFunction.call(_callBackObject, 0);
            removeStackPage();
            stackDataSets.splice(0, 1);
            this.loadDataSets();
        }, this);
    }
    this.prepareLoadDataSets = function () {
        var that = this;
        this.startMultiDataSetsGroup();
        for (var _tmpNameDataSet in DataSets) {
            if (DataSets.hasOwnProperty(_tmpNameDataSet)) {
                if ((DataSets[_tmpNameDataSet].getControlCount() != 0 || DataSets[_tmpNameDataSet].activateOnCreate) && Boolean(this.getPropertySysInfoByName(_tmpNameDataSet, 'activateoncreate', 'true') != 'false') && !DataSets[_tmpNameDataSet].cancelActivateOnCreate) {
                    this.refreshDataSet(_tmpNameDataSet, true);
                    //stackDataSets.push(_tmpNameDataSet);
                }
            }
        }
        this.endMultiDataSetsGroup(function () {
            that.callEvents('LoadDataSets', null);
        });
    }
    var isSubstitutionControls = false;
    this.setSubstitutionControls = function (_controls) {
        isSubstitutionControls = true;
        currentControls = _controls;
    }
    this.stopSubstitutionControls = function () {
        isSubstitutionControls = false;
        currentControls = associateControls;
    }
    var ActionGroups = 0;
    var ActionsData = [];
    var ActionsUid = 0;
    var ActionsUidData = {};
    var AllActionGroups = [];
    var AllAcceptMethods = [];
    var AllBackMethods = [];

    var startDataSetsGroup = [];
    var AllAcceptMethodsDataSet = [];
    var AllBackMethodsDataSet = [];

    /**AllActionGroup - true  Добавлять в очередь как асинхронные так и синхронные**/
    this.startActionsGroup = function (AllActionGroup) {
        if (ActionGroups < 0) {
            ActionGroups = 1;
        } else {
            ActionGroups++;
        }
        AllActionGroups.push(AllActionGroup || false);
    }
    this.addActionData = function (_actionName, _extData) {
        //Очереди нет
        if (ActionGroups == 0)
            return false;
        //Уникальный номер action
        var _data = this.getSysInfoByName(_actionName);
        _data.Action = _actionName
        _data._sysid = ActionsUid++;
        //Добавляем данные action для отправки на сервер
        ActionsData.push(_data);
        //Добавляем данные action для последующей обработки, когда придет ответ
        ActionsUidData[_data._sysid] = _extData;
        return true;
    }

    function callAcceptMethods(_callMethods) {
        for (var i = 0, len = _callMethods.length; i < len; i++) {
            _callMethods[i].call(null);
        }
        AllAcceptMethods = [];
        AllBackMethods = [];
    }

    this.endActionsGroup = function (_callBackAcceptMethod, _callBackCancelMethod) {
        AllActionGroups.splice(ActionGroups - 1, 1);
        ActionGroups--;
        if (typeof _callBackAcceptMethod == 'function') {
            AllAcceptMethods.push(_callBackAcceptMethod);
        }
        if (typeof _callBackCancelMethod == 'function') {
            AllBackMethods.push(_callBackCancelMethod);
        }
        if (ActionGroups == 0 && ActionsData.length > 0) {
            //Отправляем запрос
            requestServerMultiActions(this.name, this.formData, ActionsData, requestServerMultiActionsAccept, requestServerMultiActionsCancel, this);
            //Обнуляем очередь
            ActionsData = [];
        }
    }
    var requestServerMultiActionsAccept = function (_xml, _callBackAcceptMethod, _callBackCancelMethod) {
        if(!_xml){
            D3Api.debug_msg('данные не пришли.');
           return;
        }
        var _nodes = _xml.childNodes;
        if (!isObject(_nodes)) {
            showError(_nodes);
            return;
        }
        var index = 0;
        var _node;
        while (index < _nodes.length && (_node = _nodes[index]).nodeName != 'multidata')
            index++;

        _nodes = _node.childNodes;
        if ((_node.nodeName != 'multidata') || !isObject(_nodes)) {
            showError('В ответе от сервера не найдено ни одного источника данных');
            return;
        }
        var resError = {};

        addStackPage(this.page);
        for (index = 0; index < _nodes.length; index++) {
            _node = _nodes[index];
            if (_node.nodeName.toLowerCase() != 'actiondata')
                continue;
            var error = _node.querySelector('Error');
            var action = _node.querySelector('Action');
            if (error && action) {
                resError[action.attributes['name'].value] = error.textContent;
            }
            var uid = _node.getAttribute('sysid');
            if (ActionsUidData[uid]) {
                var status = (_node.firstChild) ? _node.firstChild.getAttribute('status') : '';
                if (ActionsUidData[uid].callAccept)
                    ActionsUidData[uid].callAccept(_node);
                if (ActionsUidData[uid].callCancel && status == 'cancel')
                    ActionsUidData[uid].callCancel(_node);
                delete ActionsUidData[uid];
            }
        }
        var msg = '';
        for (var i in resError) {
            if (resError.hasOwnProperty(i)) {
                if (("showerror" in sysinfo[i]) && sysinfo[i]['showerror'] == 'false') {
                    continue;
                }
                msg += i + ':\n' + resError[i] + '\n';
            }
        }
        if (Object.keys(resError).length > 0) {
            callAcceptMethods.call(null, AllBackMethods);
        } else {
            callAcceptMethods.call(null, AllAcceptMethods);
        }
        if (msg != '') {
            var error = new DError();
            error.showOracleError(msg);
        }
        removeStackPage();

    }
    var showDbmsNotifyMessage = function (_arr) {
        for (var i = 0, len = _arr.length; i < len; i++) {
            var obj = JSON.parse(_arr[i]);
            D3Api.notify('Системное сообщение.', obj, {subform: 'System/notify/log', vars: obj.vars, expires: 10000});
        }

    }
    var setBadgeMenuCount = function(badgemsgs) {
        D3Api.setBadges(badgemsgs);
    }
    var requestServerMultiActionsCancel = function (_xml, _callBackCancelMethod) {
        addStackPage(this.page);
        callAcceptMethods.call(null, AllBackMethods);
        showXmlError(_xml);
        removeStackPage();
    }
    var executeServerSubActions = function (_xmlSubAction) {
        var _nodes = _xmlSubAction.childNodes;
        if (!isNodeList(_nodes)) {
            showError(_nodes);
            return;
        }

        for (var index = 0; index < _nodes.length; index++) {
            var _node = _nodes[index];
            if (_node.nodeName.toLowerCase() == 'subaction' && _node.getAttribute) {
                var subAct = sysinfo[_node.getAttribute('name')];
                var subDatas = _node.childNodes;
                var repeater = repeatersGroup[subAct.propertyes.group];
                if (!isNodeList(_nodes) || !subAct || !repeater)
                    continue;

                for (var sindex = 0; sindex < subDatas.length; sindex++) {
                    var _subnode = subDatas[sindex];
                    if (_subnode.nodeName.toLowerCase() == 'subdata' && _node.getAttribute) {
                        var clone_id = _subnode.getAttribute('id');
                        for (var cindex = 0; cindex < repeater.clone.clones.length; cindex++) {
                            if (repeater.clone.clones[cindex].uid == clone_id) {
                                var resultArray = XmlDataToArray(_subnode, true);
                                if (resultArray.sys_error) {
                                    break;
                                }
                                this.setSubstitutionControls(repeater.clone.clones[cindex].controls);
                                var _tmpParam, _value;
                                for (var pndex = 0; pndex < subAct.params.length; pndex++) {
                                    if (typeof ((_tmpParam = subAct.params[pndex]).put) == 'undefined') {
                                        continue;
                                    }
                                    _value = resultArray[_tmpParam.put];
                                    if (typeof (_value) == 'undefined') {
                                        _value = '';
                                    }
                                    switch (_tmpParam.srctype) {
                                        case 'var': {
                                            this.setVar(_tmpParam.src, _value);
                                            break;
                                        }
                                        case 'ctrl': {
                                            this.setValue(_tmpParam.src, _value);
                                            break;
                                        }
                                        case 'ctrlcaption': {
                                            this.setCaption(_tmpParam.src, _value);
                                            break;
                                        }
                                        case 'ctrlhint': {
                                            this.setHint(_tmpParam.src, _value);
                                            break;
                                        }
                                    }
                                }
                                this.stopSubstitutionControls();
                                break;
                            }
                        }
                    }
                }
            }
        }
    }

    var executeServerActionAccept = function (_xml, _callBackAcceptMethod, _callBackCancelMethod, _callBackObject, _controls) {
        if (!this.page) {
            //форму успели закрыть
            return;
        }
        if (!_xml)
            var _nodes = [];
        else
            var _nodes = _xml.childNodes;
        if (!isNodeList(_nodes)) {
            showError(_nodes);
            return;
        }
        addStackPage(this.page);
        this.setSubstitutionControls(_controls);
        var _node;
        var resultArray = new Array();
        var index;
        var jndex;
        for (index = 0; index < _nodes.length; index++) {
            _node = _nodes[index];
            switch (_node.nodeName.toLowerCase()) {
                case 'action': {
                    for (jndex = 0; jndex < _node.attributes.length; jndex++) {
                        if (_node.attributes[jndex].name == 'name') {
                            var arr = resultArray[_node.attributes[jndex].value] = XmlDataToArray(_node, Boolean(this.getPropertySysInfoByName(_node.attributes[jndex].value, 'showerror', 'true') != 'false'));
                            if (("sys_error_message" in arr)) {
                                // колбэки неудачи экшнов/датасетов
                                if (_callBackCancelMethod instanceof Function) {
                                    try{
                                        _callBackCancelMethod.call(_callBackObject, arr);
                                    } catch(e) {
                                        showScriptError(e, {script: (_callBackCancelMethod || '').toString()});
                                    }
                                }
                                this.stopSubstitutionControls();
                                removeStackPage();
                                return;
                            }
                            var _actionInfo = sysinfo[_node.attributes[jndex].value];
                            var chAct = 0;
                            for (var subAct in _actionInfo.childs) {
                                if (!_actionInfo.childs.hasOwnProperty(subAct)) {
                                    continue;
                                }
                                sysinfo[subAct] = _actionInfo.childs[subAct];
                                chAct++;
                            }
                            if (chAct > 0) {
                                this.stopSubstitutionControls();
                                executeServerSubActions.call(this, _node);
                                this.setSubstitutionControls(_controls);
                            }
                            break;
                        }
                    }
                    break;
                }
                case 'parsererror':
                case 'error': {
                    showXmlError(_node);
                    break;
                }
            }

        }
        var _tmpPostObject;
        var pndex;
        var _tmpParam;
        var _value;
        var notifyMsg = "";
        // засовываю в массив названия всех форм экшнов, т.к. неясно какой из них может повлиять на catch
        var formnames = [];

        for (var _actionName in resultArray) {
            if (!resultArray.hasOwnProperty(_actionName)) {
                continue;
            }
            /**
             * startActionsGroup выполняется в рамках одной транзакции в случае если хотя бы в один экшн не выполнена но не проставлять не актуальные значения
             **/
            if (("multidata" in resultArray[_actionName]) && resultArray[_actionName]["sys_error"] == true) {
                break;
            }
            _tmpPostObject = sysinfo[_actionName] || new DPostObject();

            if (_tmpPostObject && _tmpPostObject.attrs && _tmpPostObject.attrs.formname) {
                formnames.push(_tmpPostObject.attrs.formname);
            }

            if (('notifymsg' in resultArray[_actionName]) && resultArray[_actionName]['notifymsg'].length > 0) {
                showDbmsNotifyMessage(resultArray[_actionName]['notifymsg'])

            }

            if ('badgemsg' in resultArray[_actionName]) {
                setBadgeMenuCount(resultArray[_actionName]['badgemsg']);
            }

            for (pndex = 0; pndex < _tmpPostObject.params.length; pndex++) {
                if (typeof ((_tmpParam = _tmpPostObject.params[pndex]).put) == 'undefined') {
                    continue;
                }
                _value = resultArray[_actionName][_tmpParam.put];
                if (typeof (_value) == 'undefined') {
                    _value = '';
                }
                switch (_tmpParam.srctype) {
                    case 'var': {
                        this.setVar(_tmpParam.src, _value);
                        break;
                    }
                    case 'ctrl': {
                        if(Array.isArray(_value)){
                            var _dom = this.getControlByName(_tmpParam.src,true);
                            var groupname = null;
                            if(_dom && _dom.hasAttribute('groupname')){
                                groupname = getProperty(_dom,'groupname');
                                var repeate = this.getRepeaterByGroupName(groupname);
                                if(repeate){
                                    repeate.setData(_value);
                                }
                            }else{
                                this.setValue(_tmpParam.src,_value);
                            }
                        }else{
                            this.setValue(_tmpParam.src,_value);
                        }
                        break;
                    }
                    case 'ctrlcaption': {
                        this.setCaption(_tmpParam.src, _value);
                        break;
                    }
                    case 'ctrlhint': {
                        this.setHint(_tmpParam.src, _value);
                        break;
                    }
                }
            }

        }
        // колбэки экшнов/датасетов
        if (_callBackAcceptMethod instanceof Function) {
            try{
                _callBackAcceptMethod.call(_callBackObject);
            } catch(e) {
                showScriptError(e, {formname: formnames.join(), script: (_callBackAcceptMethod || '').toString()});
            }
        }
        if (this.stopSubstitutionControls) {
            this.stopSubstitutionControls();
        }

        removeStackPage();
    }
    var executeServerActionCancel = function (_xml, _callBackCancelMethod, _callBackObject, _controls) {
        if (!this.page) {
            //форму успели закрыть
            return;
        }
        addStackPage(this.page);
        this.setSubstitutionControls(_controls);
        // колбэки неудачи экшнов/датасетов
        if (_callBackCancelMethod instanceof Function) {
            try{
                _callBackCancelMethod.call(_callBackObject);
            } catch(e){
                // todo formname
                showScriptError(e, {formname: this.name, script: (_callBackCancelMethod || '').toString()});
            }
        }
        this.stopSubstitutionControls();
        removeStackPage();
        showXmlError(_xml);
    }
    this.executeServerAction = function (_nameAction, _callBackAcceptMethod, _callBackCancelMethod, _callBackObject, async, silent) {
        if (sysinfo[_nameAction] === undefined) {
            console.error('Action с именем "' + _nameAction + '" не найден на форме "' + this.name + '".');
            return;
        }
        var _controls = currentControls;
        var self = this;
        //добавлять в очередь если ActionGroups(true) или запросы асинхронные
        var allGroups = AllActionGroups[ActionGroups - 1];
        if ((allGroups || (async || async == null)) && this.addActionData(_nameAction, {
            callAccept: function (_xml) {
                executeServerActionAccept.call(self, _xml, _callBackAcceptMethod, _callBackCancelMethod, _callBackObject, _controls);
            },
            callCancel: function (_xml) {
                executeServerActionCancel.call(self, _xml, _callBackCancelMethod, _callBackObject, _controls);
            }
        }))
            return;

        var _data = this.getSysInfoByName(_nameAction);
        _data['Action'] = _nameAction;
        _data['silent'] = !!silent;
        var name = /*this.getSysInfoByAttr(_nameAction,'formname')||*/this.name;
        return requestServerAction(Boolean(this.getPropertySysInfoByName(_nameAction, 'mode', 'get') != 'get'),
            name + this.getUrlFormData() + '&baseForm=' + this.name,
            _data,
            function (_xml) {
                executeServerActionAccept.call(this, _xml, _callBackAcceptMethod, _callBackCancelMethod, _callBackObject, _controls);
            },
            function (_xml) {
                executeServerActionCancel.call(this, _xml, _callBackCancelMethod, _callBackObject, _controls);
            },
            this,
            async);
    }
    var executeServerModuleAccept = function (_xml, _callBackAcceptMethod, _callBackCancelMethod, _callBackObject) {
        if (!this.page) {
            //форму успели закрыть
            return;
        }
        if(!_xml){
            D3Api.debug_msg('данные не пришли.');
            return;
        }
        var _nodes = _xml.childNodes;
        if (!isNodeList(_nodes)) {
            showError(_nodes);
            return;
        }
        addStackPage(this.page);
        var _node;
        var resultArray = new Array();
        var index;
        var jndex;
        for (index = 0; index < _nodes.length; index++) {
            _node = _nodes[index];
            switch (_node.nodeName.toLowerCase()) {
                case 'module': {
                    for (jndex = 0; jndex < _node.attributes.length; jndex++) {
                        if (_node.attributes[jndex].name == 'name') {
                            var arr = resultArray[_node.attributes[jndex].value] = XmlDataToArray(_node, Boolean(this.getPropertySysInfoByName(_node.attributes[jndex].value, 'showerror', 'true') != 'false'));
                            if (arr.sys_error) {
                                // колбэки неудачи экшнов/датасетов
                                if (_callBackCancelMethod instanceof Function) {
                                    try{
                                        _callBackCancelMethod.call(_callBackObject, arr);
                                    } catch(e) {
                                        showScriptError(e, {script: (_callBackCancelMethod || '').toString()});
                                    }
                                }
                                removeStackPage();
                                return;
                            }
                            break;
                        }
                    }
                    break;
                }
                case 'parsererror':
                case 'error': {
                    showXmlError(_node);
                    break;
                }
            }

        }
        var _tmpPostObject;
        var pndex;
        var _tmpParam;
        var _value;
        var notifyMsg = "";
        var formnanes = [];
        for (var _moduleName in resultArray) {
            if (!resultArray.hasOwnProperty(_moduleName)) {
                continue;
            }
            _tmpPostObject = sysinfo[_moduleName] || new DPostObject();
            if (_tmpPostObject && _tmpPostObject.attrs && _tmpPostObject.attrs.formname) {
                formnanes.push(_tmpPostObject.attrs.formname);
            }
            if ('notifymsg' in resultArray[_moduleName]) {

                showDbmsNotifyMessage(resultArray[_moduleName]['notifymsg'])

            }
            if ('badgemsg' in resultArray[_moduleName]) {
                setBadgeMenuCount(resultArray[_actionName]['badgemsg']);
            }

            for (pndex = 0; pndex < _tmpPostObject.params.length; pndex++) {
                if (typeof ((_tmpParam = _tmpPostObject.params[pndex]).put) == 'undefined') {
                    continue;
                }
                _value = resultArray[_moduleName][_tmpParam.put];
                if (typeof (_value) == 'undefined') {
                    _value = '';
                    //showError('Значение для ['+_tmpParam.srctype+']['+_tmpParam.src+'] не возвращено');
                    //_callBackCancelMethod.call(_callBackObject);
                    //removeStackPage();
                    //return;
                }
                switch (_tmpParam.srctype) {
                    case 'var': {
                        this.setVar(_tmpParam.src, _value);
                        break;
                    }
                    case 'ctrl': {
                        this.setValue(_tmpParam.src, _value);
                        break;
                    }
                    case 'ctrlcaption': {
                        this.setCaption(_tmpParam.src, _value);
                        break;
                    }
                    case 'ctrlhint': {
                        this.setHint(_tmpParam.src, _value);
                        break;
                    }
                }
            }

        }
        if (_callBackAcceptMethod instanceof Function) {
            try{
                _callBackAcceptMethod.call(_callBackObject);
            } catch(e) {
                showScriptError(e, {formname: formnanes.join(), script: (_callBackAcceptMethod || '').toString()});
            }
        }
        removeStackPage();
    }
    var executeServerModuleCancel = function (_xml, _callBackCancelMethod, _callBackObject) {
        if (!this.page) {
            //форму успели закрыть
            return;
        }
        addStackPage(this.page);
        if (_callBackCancelMethod instanceof Function) _callBackCancelMethod.call(_callBackObject);
        removeStackPage();
        var error = _xml instanceof XMLDocument ? _xml.querySelector('Error') : _xml;
        if (error) {
            showXmlError(error);
        }
    }
    this.executeModule = function (_moduleName, _callBackAcceptMethod, _callBackCancelMethod, _callBackObject, async, silent) {
        var isXml = Boolean(this.getPropertySysInfoByName(_moduleName, 'responsetype', 'xml') == 'xml');
        var si = this.getSysInfoByName(_moduleName);
        si['Module'] = _moduleName;
        si['silent'] = !!silent;
        var name = /*this.getSysInfoByAttr(_moduleName,'formname')||*/this.name;
        return requestServerModule(Boolean(this.getPropertySysInfoByName(_moduleName, 'mode', 'get') != 'get'),
            name + this.getUrlFormData() + '&baseForm=' + this.name,
            si,
            function (_xml) {
                if (isXml) {
                    executeServerModuleAccept.call(this, _xml, _callBackAcceptMethod, _callBackCancelMethod, _callBackObject);
                } else {
                    _callBackAcceptMethod.call(_callBackObject, _xml);
                }
            },
            function (_xml) {
                executeServerModuleCancel.call(this, _xml, _callBackCancelMethod, _callBackObject);
            },
            this,
            isXml,
            async);
    }
    this.show = function (_postData) {
        if (this.name == null) {
            showError('Имя формы не указано');
            return;
        }
        this.requestForm(_postData);
    }
    this.remove = function () {
        callEvents.call(this, 'onclose');
            var page = this.page,
                d3Form = page.d3Form;
            if (d3Form) {
                //d3Form.DOM.remove()
            } else {
                page.form.containerForm.remove();
            }
    }
    this.reload = function () {
        callEvents.call(this, 'onreload');
        this.saveFormSettings();
        if (this.page.modal)
            this.page.getContainer().setVisible(false);
        else
            this.container.setVisible(false);

        isCreated = false;
        isShowing = false;
        isShowed = false;
        this.formSettings = {};
        this.formSettingsChange = false;
        this.formSettingsGetParam = [];
        this.formSettingsState = [];

        this.helpShow = false;
        this.helpUrl = '';
        this.helpAbsPath = '';
        this.helpUid = '';

        this.containerForm.remove();

        this.FilterItems = new Array();
        this.SelectLists = new Array();
        loadingDataSets = new Array();
        stackDataSets = new Array();
        countLoadScript = new Number(0);
        isShowing = false;
        isSized = false;
        DataSets = new Array();
        scriptfiles = new Array();
        cssfiles = new Array();
        runScripts = new Array();
        namespace = new Object();
        sysinfo = new Array();
        this.vars = [];
        for (var key in this.formVarsOpen) {
            if (!this.formVarsOpen.hasOwnProperty(key)) {
                continue;
            }
            this.vars[key] = this.formVarsOpen[key];
        }
        multiDatas = new Array();
        this.requestsCount = 0;
        //callEvents=new Array();
        eventsControl = {
            onshow: new Array(),
            oncreate: new Array(),
            onclose: new Array(),
            onreload: new Array(),
            LoadDataSets: new Array()
        };
        //		vars=new Array();
        currentControls = associateControls = new Array();
        this.stateReloadForm = true;
        incSYS_countShowState();
        this.requestForm();
    }
    this.formCreate = function () {
        isCreated = true;
        this.loadFormSettings(false);
    }

    var func_beforeUnload = function () {
        ObjectForm.saveFormSettings();
        return 'Внимание!';
    }
    this.beforeClose = function () {
        this.saveFormSettings();

    }
    this.close = function () {
        this.container.close();
    }
    this.formSettings = {};
    this.formSettingsChange = false;
    this.formSettingsGetParam = [];
    this.formSettingsState = [];

    this.getFormSettings = function (ctrl) {
        if (ctrl) {
            this.formSettingsChange = true;
            var st = {};
            var c = this.getControlByName(ctrl, false);
            if (c) {
                var cmpType = quickGetProperty(c, 'cmptype');
                if (SYS_ControlActions[cmpType] && SYS_ControlActions[cmpType]['settings']) {
                    st = SYS_ControlActions[cmpType]['settings'].get(c);
                }
            }
            this.formSettings[ctrl] = mixinObjects(st, this.formSettings[ctrl]);
            return this.formSettings[ctrl];
        } else
            return this.formSettings;
    }
    this.deleteFormSettings = function (ctrl) {
        this.formSettingsChange = true;
        delete this.formSettings[ctrl];
    }
    this.canSaveFormSettings = function () {
        return this.formSettingsState.indexOf('notsave') == -1;
    }
    this.setFormSettings = function (r) {
        if (r)
            this.stringFormSettings = r;
        if (!isCreated) {
            var self = this;
            setTimeout(function () {
                self.setFormSettings()
            }, 100);
            return true;
        }
        var s = false;
        try {
            if (this.stringFormSettings) {
                s = JSON.parse(this.stringFormSettings);
            }
        } catch (e) {
        }
        this.stringFormSettings = '';

        if (s) {
            for (var ctrl in s) {
                if (!s.hasOwnProperty(ctrl)) {
                    continue;
                }
                if (ctrl == '_WINDOW_') {
                    this.formSettings[ctrl] = s[ctrl];
                    if (this.page.modal && s[ctrl]['width'] && s[ctrl]['height']) {
                        if (!this.page.window_size) this.page.window_size = {};
                        this.page.window_size.width = s[ctrl]['width'];
                        this.page.window_size.height = s[ctrl]['height'];
                    }
                    applyFormTheme.call(this, s[ctrl]['theme']);
                    continue;
                }
                var c = this.getControlByName(ctrl, false);
                if (c) {
                    this.formSettings[ctrl] = s[ctrl];
                    var cmpType = quickGetProperty(c, 'cmptype');
                    if (SYS_ControlActions[cmpType] && SYS_ControlActions[cmpType]['settings']) {
                        var res = SYS_ControlActions[cmpType]['settings'].set(c, this.formSettings[ctrl]);
                        if (!res) {
                            delete this.formSettings[ctrl];
                        }
                    }
                } else {
                    delete this.formSettings[ctrl];
                }
            }
            if (!s.hasOwnProperty('_WINDOW_')) {
                 applyFormTheme.call(this);
            }
        }else{
            applyFormTheme.call(this);
        }
    }
    this.saveFormSettings = function () {
        if (this.formSettingsChange && this.formSettingsState.indexOf('notsave') == -1 && (!_GET_['settings'] || _GET_['settings'] == '1')) {
            var fN = this.name;
            for (var i = 0; i < this.formSettingsGetParam.length; i++) {
                if (this.formData[this.formSettingsGetParam[i]])
                    fN += '/' + this.formData[this.formSettingsGetParam[i]];
            }
            /*
            requestServerModule(true, 'System/system', {
                Module: 'formSettings',
                form: fN,
                action: 'save',
                settings: JSON.stringify(this.formSettings),
                silent: true
            });
            */
        }
    }
    this.loadFormSettings = function (async) {
        if (!_GET_['settings'] || _GET_['settings'] == '1') {
            var fN = this.name;
            for (var i = 0; i < this.formSettingsGetParam.length; i++) {
                if (this.formData[this.formSettingsGetParam[i]])
                    fN += '/' + this.formData[this.formSettingsGetParam[i]];
            }
            /*
            requestServerModule(true, 'System/system', {
                Module: 'formSettings',
                form: fN,
                action: 'load',
                silent: true
            }, this.setFormSettings, null, this, false, async);
            */
        }
    }

    this.helpShow = false;
    this.helpUrl = '';
    this.helpAbsPath = '';
    this.helpUid = '';
    this.showHelp = function () {
        var helpBtn = document.getElementById('helpButton');
        if (helpBtn && !this.page.modal) {
            setDomVisible(helpBtn, false);
        }

        var rd = document.getElementById('roleDoc');
        var docPriv = rd ? !empty(rd.value) : false;
        if (this.name == 'System/help' || !this.helpShow || (!this.helpUrl && !docPriv))
            return;

        var formObj = this;
        var helpFunc = function () {
            if (docPriv) {
                openWindow({name: 'System/help', vars: {form: formObj}}, true);
            } else
                openHelpUrl(formObj.helpAbsPath + formObj.helpUrl);
        }
        if (this.page.modal) {
            var page = this.page;

            if (empty(page.d3Form)) {
                this.page.getContainer().showHelpEvent(helpFunc);
            } else {
                page.d3Form.DWindow.showHelpEvent(helpFunc);
            }
        } else if (helpBtn) {
            helpBtn.onclick = helpFunc;
            setDomVisible(helpBtn, true);
        }
    }
    this.destroyAllProperty = function () {
        DataSets = null;
        scriptfiles = null;
        cssfiles = null;
        runScripts = null;
        namespace = null;
        eventsControl = null;
        repeatersGroup = null;
        repeaters = null;
        groupsClone = null;
        getPostXml = null;
        associateControls = null;
        currentControls = null;
        ObjectForm = null;
        any_loadinfo = null;

        delete DataSets;
        delete scriptfiles;
        delete cssfiles;
        delete runScripts;
        delete namespace;
        delete eventsControl;
        delete repeatersGroup;
        delete repeaters;
        delete groupsClone;
        delete getPostXml;
        delete associateControls;
        delete currentControls;
        delete ObjectForm;
        delete any_loadinfo;

    }
}
function openHelpUrl(url) {
    window.open(url);
}
//-----------------------------------------------------------------------------------------------
function skip() {
    arguments.callee.caller.skip = true;
}
function DListenerObject(_object,_method,_capture) {
    var object = _object;
    var method = _method;
    var capture = _capture;
    this.isThis = function (_object, _method, _capture) {
        if (object != _object) return false;
        if (method != _method) return false;
        if (capture != _capture) return false;
        return true;
    }
    this._call = function (_eventArguments) {
        if (capture) method.skip = false;
        method.apply(object, _eventArguments);
        var skip = false;
        if (method['skip']) {
            var skip = Boolean(method.skip);
            delete method.skip;
        }
        return skip && capture;
    }
}
var GLOBAL_CURRENT_FORM = '';
//class DListener
function DListener() {
    //Когда создается форма(парс), устанавливается переменная GLOBAL_CURRENT_FORM
    this.formUID = GLOBAL_CURRENT_FORM;

    if (typeof (this.Events) != 'undefined') {
        // очищаем все события, кроме onafterclose
        for (var i in this.Events) {
            if (!this.Events.hasOwnProperty(i)) {
                continue;
            }
            if (i != 'onafterclose')
                delete this.Events[i];
        }
    } else {
        this.Events = new Array();
    }

    var getGroupEvents = function (_eventName) {
        var groupEvents = this.Events[_eventName];
        return (groupEvents instanceof Array) ? groupEvents : this.Events[_eventName] = new Array();
    }
    var getGroup = function (_eventName) {
        var groupEvents = this.Events[_eventName];
        if (!(groupEvents instanceof Array)) groupEvents = new Array();
        return groupEvents;
    }
    //public:
    this.addListener = function (_eventName, _method, _object, _capture) {
        var groupEvents = getGroup.call(this, _eventName);
        for (var _index = 0; _index < groupEvents.length; _index++) {
            if (groupEvents[_index].isThis(_object, _method, _capture)) {
                return false;
            }
        }
        return getGroupEvents.call(this, _eventName).splice((_capture) ? 0 : this.Events[_eventName].length, 0, new DListenerObject(_object, _method, _capture));
    }
    this.removeListener = function (_eventName, _method, _object, _capture) {
        var groupEvents = getGroup.call(this, _eventName);
        for (var _index = new Number(0); _index < groupEvents.length; _index++) {
            if (groupEvents[_index].isThis(_object, _method, _capture)) {
                //RemoveObjectPropertyes(groupEvents[_index]);
                groupEvents.splice(_index, 1);
            }
        }
    }
    this.dispatchEvent = function (_eventName) {
        var _eventArguments = new Array();
        for (var _index = new Number(1); _index < arguments.length; _index++) {
            _eventArguments[_index - 1] = arguments[_index];
        }
        var groupEvents = getGroup.call(this, _eventName);
        for (var _index = new Number(); _index < groupEvents.length; _index++) {
            if (groupEvents[_index]._call(_eventArguments)) return;
        }
    }
}
//-----------------------------------------------------------------------------------------------
function DNullContainer() {
    var loadingIndicate = document.getElementById('_mainIndicateLoader') || {style: {}};
    this.GetMainDOM = function () {
    }
    this.setVisible = function (v) {
    }
    this.getContainer = function () {
    }
    this.setCaption = function (_caption) {
    }
    this.show = function () {
    }
    this.close = function () {
    }
    this.refresh = function () {
    }
}
function DDocument(dom) {
    var body = (dom) ? dom : document.getElementById('_mainContainer');
    var maindom = (dom) ? dom : document.getElementById('mainContainerContent');
    var loadingIndicate = (dom) ? (document.getElementById('_mainIndicateLoader') || {style: {}}) : {style: {}};
    var title = (dom) ? false : document.getElementById('_titleContainer');
    this.GetMainDOM = function () {
        return body;
    }
    this.setVisible = function (v) {
        if (v) {
            removeClass(maindom, 'hidden');
            maindom.style.display = '';
            addClass(maindom, 'showed');
        } else {
            removeClass(maindom, 'showed');
            addClass(maindom, 'hidden');
        }
    }
    this.getContainer = function () {
        return body;
    }
    this.setCaption = function (_caption) {
            if (title) {
                title.innerHTML = _caption;
            }
    }
    this.show = function () {
       this.setCaption('');
    }
    this.close = function () {
        this.setVisible(false);
        maindom.style.height = '';
        body.innerHTML = '';
    }
    this.refresh = function () {
        body.align = 'left';
        setTimeout(function () {
            body.align = '';
        }, 0);
    }

    this.close();
}
function getMainForm(dom) {
    if (!dom){
        dom = document.getElementById('_mainContainer');
    }
    if (dom.form) {
        return dom.form
    }



    return false;
}
//class DNullPage
function DNullForm() {
    this.beforeClose = function () {
        if (typeof this.saveFormSettings == 'function') {
            this.saveFormSettings();
        }
    };
    this.vars = {};
    this.setVar = function (_paramName, _paramValue) {
        this.vars[_paramName] = _paramValue;
    };
    this.getVar = function (_paramName) {
        if (typeof (this.vars[_paramName]) != 'undefined') {
            return this.vars[_paramName];
        }
        return null;
    };
}

function DNullPage(FormName) {
    this.setSubstitutionControls = emptyFunction;
    this.stopSubstitutionControls = emptyFunction;
    this.addRepeaterClone = emptyFunction;
    this.removeRepeaterClone = emptyFunction;
    this.getCloneObjectsByRepeaterName = emptyFunction;
    this.remove = emptyFunction;
    this.show = emptyFunction;
    this.getNamespace = function () {
        return {};
    }
    this.setContainer = emptyFunction;
    this.getContainer = function () {
        return new DDocument();
    }
    this.close = emptyFunction;
    this.isNullObject = true;
    this.executeServerAction = function () {
        return false;
    };
    this.getValue = function () {
        return null;
    }
    this.setValue = emptyFunction;
    this.setControlProperty = emptyFunction;
    this.getControlProperty = function () {
        return null;
    }
    this.setVar = function (_paramName, _paramValue) {
        this.form.vars[_paramName] = _paramValue;
    }
    this.getVar = function (_paramName) {
        if (typeof (this.form.vars[_paramName]) != 'undefined') {
            return this.form.vars[_paramName];
        }
        return null;
    }
    this.setCaption = emptyFunction;
    this.getCaption = function () {
        return null;
    }
    this.setHint = emptyFunction;
    this.getHint = function () {
        return null;
    }
    this.setEnabled = emptyFunction;
    this.getEnabled = function () {
        return null;
    }
    this.refreshDataSet = emptyFunction;
    this.reload = emptyFunction;
    this.requestDataSetCount = emptyFunction;
    this.addSystemInfo = emptyFunction;
    this.setFormData = emptyFunction;
    this.requestDataSetData = emptyFunction;
    this.prevPage = this;
    this.executeModule = emptyFunction;
    this.startMultiDataSetsGroup = emptyFunction;
    this.endMultiDataSetsGroup = emptyFunction;
    this.getRepaterByName = function () {
        return false;
    };
    this.memory = new Object();
    this.afterClose = emptyFunction;
    this.beforeClose = emptyFunction;
    var frm = new DForm();
    this.form = new DNullForm();
    if (!empty(FormName)) {
        this.form.__proto__ = new DForm(FormName, this)
    }
    var thForm = this.form;
    this.form.showHelp = function () {
        frm.showHelp.call(thForm)
    };
    this.destroyAll = function (skip, page) {
        var p = (page) ? page : getPage(skip);
        removePage(skip, p);
        frm.destroyAllProperty();
        for (var i in frm) {
            if (frm.hasOwnProperty(i)) {
                frm[i] = null;
                delete frm[i];
            }
        }
        for (var i in p) {
            if (p.hasOwnProperty(i)) {
                p[i] = null;
                delete p[i];
            }
        }
    };
}
function $$(_domObject,skip) {
    if (!isObject(_domObject.clone)){
        return;
    }
    getPage(skip).setSubstitutionControls(_domObject.clone.controls);
}
function _$$(skip) {
    getPage(skip).stopSubstitutionControls();
}
//class DPage()
function DPage(_formName) {
    this.destroyed = false
    DListener.call(this);
    this.form = new DForm(_formName, this);

    this.form.FilterItems = new Array(); //для хранения фильтров страницы
    this.form.SelectLists = new Array(); //для хранения selectlist страницы
    this.memory = new Object();
    this.setSubstitutionControls = function (_controls) {
        this.form.setSubstitutionControls(_controls);
    }
    this.stopSubstitutionControls = function () {
        this.form.stopSubstitutionControls();
    }
    this.addRepeaterClone = function (_groupName, _dataArray, _domObject, _labelName) {
        return this.form.addRepeaterClone(_groupName, _dataArray, _domObject, _labelName);
    }
    this.removeRepeaterClone = function (_groupName, _domObject, _index) {
        this.form.removeRepeaterClone(_groupName, _domObject, _index);
    }
    this.getCloneObjectsByRepeaterName = function (_nameRepeater, _nameControl) {
        return this.form.getCloneObjectsByRepeaterName(_nameRepeater, _nameControl);
    }
    this.setContainer = function (_container) {
        this.form.container = _container;
    }
    this.executeModule = function (_moduleName, _callBackAcceptMethod, _callBackCancelMethod, _callBackObject, async, silent) {
        if (_callBackAcceptMethod == null) _callBackAcceptMethod = emptyFunction;
        if (_callBackCancelMethod == null) _callBackCancelMethod = emptyFunction;
        return this.form.executeModule(_moduleName, _callBackAcceptMethod, _callBackCancelMethod, _callBackObject, async, silent);
    }
    this.getContainer = function () {
        return this.form.container;
    }
    this.show = function (_postData) {
        this.form.show(_postData);
    }
    this.getNamespace = function () {
        return this.form.getNamespace();
    }
    this.remove = function () {
        this.form.remove();
    }
    this.close = function (res, _dom) {
        this.destroyed = true;
        this.form.close();
        //		addStackPage(this);
        this.dispatchEvent('onclose', res, _dom);
        //		removeStackPage();
    }
    this.beforeClose = function (res) {
        this.dispatchEvent('onbeforeclose', res);
    }
    this.afterClose = function (res) {
        if (SYS_pages.length > 0) {
            var TMP_pages = SYS_pages;
            SYS_pages = [];
        }

        this.dispatchEvent('onafterclose', res);

        if (TMP_pages && TMP_pages.length > 0)
            SYS_pages = TMP_pages;
        TMP_pages = null;
    }
    this.executeServerAction = function (_actionName, _callBackAcceptMethod, _callBackCancelMethod, _callBackObject, async) {
        if (_callBackAcceptMethod == null) _callBackAcceptMethod = emptyFunction;
        if (_callBackCancelMethod == null) _callBackCancelMethod = emptyFunction;
        return this.form.executeServerAction(_actionName, _callBackAcceptMethod, _callBackCancelMethod, _callBackObject, async);
    }
    this.setValue = function (_controlName, _value) {
        this.form.setValue(_controlName, _value);
    }
    this.getValue = function (_controlName) {
        return this.form.getValue(_controlName);
    }
    this.setControlProperty = function (_controlName, _propertyName, _propertyValue) {
        this.form.setControlProperty(_controlName, _propertyName, _propertyValue);
    }
    this.getControlProperty = function (_controlName, _propertyName) {
        return this.form.getControlProperty(_controlName, _propertyName);
    }
    this.setVar = function (_name, _value) {
        this.form.setVar(_name, _value);
    }
    this.getVar = function (_name) {
        return this.form.getVar(_name);
    }
    this.setCaption = function (_controlName, _caption) {
        this.form.setCaption(_controlName, _caption);
    }
    this.getCaption = function (_controlName) {
        return this.form.getCaption(_controlName);
    }
    this.setEnabled = function (_controlName, _value) {
        this.form.setEnabled(_controlName, _value);
    }
    this.getEnabled = function (_controlName) {
        return this.form.getEnabled(_controlName);
    }
    this.setHint = function (_controlName, _hint) {
        this.form.setHint(_controlName, _hint);
    }
    this.getHint = function (_controlName) {
        return this.form.getHint(_controlName);
    }
    this.refreshDataSet = function (_dataSetName, instead) {
        return this.form.refreshDataSet(_dataSetName, instead);
    }
    this.getDataSet = function (_dataSetName, _show_error) {
        return this.form.getDataSet(_dataSetName, _show_error);
    }
    this.reload = function () {
        this.memory = new Object();
        this.form.reload();
        DListener.call(this);
    }
    this.getControlByName = function (_controlName, _show_error) {
        return this.form.getControlByName(_controlName, _show_error);
    }
    this.isExistsControlByName = function (_controlName) {
        return this.form.isExistsControlByName(_controlName, false);
    }
    this.requestDataSetCount = function (_dataSetName, _callBackFunction, _callBackObject) {
        this.form.requestDataSetCount(_dataSetName, _callBackFunction, _callBackObject);
    }
    this.addSystemInfo = function (_nameObject, _data) {
        this.form.addSystemInfo(_nameObject, _data);
    }
    this.setPropertySysInfoByName = function (_nameObject, _propertyName, _Value) {
        this.form.setPropertySysInfoByName(_nameObject, _propertyName, _Value);
    }
    this.setFormData = function (_data) {
        this.form.formData = _data;
    }
    this.setPageCaption = function (_caption) {
        this.getContainer().setCaption(_caption);
    }
    this.setPageConfirmOnClose = function () {
        this.getContainer().setConfirmOnClose(1);
    }
    this.getPageCaption = function () {
        return this.getContainer().getCaption instanceof Function ? this.getContainer().getCaption() : '';
    }
    this.requestDataSetData = function (_dataSetName, _data, _acceptCallBackFunction, _cancelCallBackFunction, _callBackObject, async) {
        return this.form.requestDataSetData(_dataSetName, _data, _acceptCallBackFunction, _cancelCallBackFunction, _callBackObject, async);
    }
    this.prevPage = null;
    this.startMultiDataSetsGroup = function () {
        this.form.startMultiDataSetsGroup();
    }
    this.endMultiDataSetsGroup = function (_callBackAcceptMethod) {
        this.form.endMultiDataSetsGroup(_callBackAcceptMethod);
    }
    this.startActionsGroup = function (async) {
        this.form.startActionsGroup(async);
    }
    this.endActionsGroup = function (_callBackAcceptMethod, _callBackCancelMethod) {
        this.form.endActionsGroup(_callBackAcceptMethod, _callBackCancelMethod);
    }
    this.getRepeaterByName = function (_repeaterName) {
        return this.form.getRepeaterByName(_repeaterName);
    }
    this.getRepeaterByGroupName = function (_groupName) {
        return this.form.getRepeaterByGroupName(_groupName);
    }
    this.setSizePos = function () {
        this.form.setSizePos();
    }
    this.destroyAll = function (skip, page) {
        var p = (page) ? page : getPage(skip);
        removePage(skip, p);
        p.form.destroyAllProperty();
        for (var i in p.form) {
            if (p.form.hasOwnProperty(i)) {
                p.form[i] = null;
                delete p.form[i];
            }
        }
        for (var i in p) {
            if (p.hasOwnProperty(i)) {
                p[i] = null;
                delete p[i];
            }
        }
    }
}
var SYS_pages = new Array();
var SYS_pages_window = new Array();
var SYS_lastPage = new DNullPage();
var SYS_reportParams = {};
function addStackPage(_page) {
    SYS_pages.push(_page);
    SYS_lastPage = _page;
}
function removeStackPage() {
    SYS_pages.splice(SYS_pages.length - 1, 1);
    SYS_lastPage = SYS_pages_window[SYS_pages_window.length - 1];
}
function addPage(_page) {
    var prev_page = null;
    if (SYS_pages_window.length > 0) {
        prev_page = SYS_pages_window[SYS_pages_window.length - 1];
    }
    if (empty(prev_page)) {
        prev_page = new DNullPage();
    }
    _page.prevPage = prev_page
    SYS_pages_window.push(_page);

    if (SYS_pages_store) {
        SYS_pages_store.dispatch({ type: 'ADD', value: _page });
    }
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
function removePage(skip,page) {
    var _page = (page) ? page : getPage(skip);
    if (SYS_pages_window.indexOf(_page) < 0) {
        return false;
    }

    if (SYS_pages_store) {
        SYS_pages_store.dispatch({ type: 'REMOVE', value: _page })
    }

    _page.remove();
    SYS_pages_window.splice(SYS_pages_window.indexOf(_page), 1);
    SYS_lastPage = SYS_pages_window[SYS_pages_window.length - 1];
    return _page;
}
function movePages(firstPageIndex, secondPageIndex) {
    if (firstPageIndex !== secondPageIndex) {
        var temp = SYS_pages_window[firstPageIndex];
        SYS_pages_window[firstPageIndex] = SYS_pages_window[secondPageIndex];
        SYS_pages_window[secondPageIndex] = temp;
    }
}
function addSystemInfo(_nameObject,_data,skip) {
    getPage(skip).addSystemInfo(_nameObject, _data);
}
function setPropertySysInfoByName(_nameObject,_propertyName,_Value,skip) {
    getPage(skip).setPropertySysInfoByName(_nameObject, _propertyName, _Value);
}
function $() {
    var evt = arguments.callee.caller.arguments[0] || window.event;
    var dom = evt.currentTarget || evt.srcElement;

    while (typeof (dom.jsParent) == 'undefined') {
        dom = dom.parentNode;
    }
    addStackPage(dom.jsParent.page);
}
function _$() {
    removeStackPage();
}
function abortLoading() {
    SYS_RequestObject.abort();
}
function requestDataSetData(_dataSetName,
                            _data,
                            _acceptCallBackFunction,
                            _cancelCallBackFunction,
                            _callBackObject,
                            async,
                            skip) {
    return getPage(skip).requestDataSetData(_dataSetName, _data, _acceptCallBackFunction, _cancelCallBackFunction, _callBackObject, async);
}
function getCloneObjectsByDom(_domObject,_nameControl) {
    var clone = _domObject.clone;
    if (!isObject(clone)) {
        showError('Данный объект [' + getProperty(_domObject, 'name', 'unknownName') + '] не принадлежит клонируемому объекту');
        return new Array();
    }
    var clones = clone.repeater.clone.clones;
    var controls = new Array();
    for (var index = 0; index < clones.length; index++) {
        controls.push(clones[index].controls[_nameControl]);
    }
    return controls;
}
function getCloneObjectsByRepeaterName(_nameRepeater,_nameControl,skip) {
    return getPage(skip).getCloneObjectsByRepeaterName(_nameRepeater, _nameControl);
}

/**
 * Возвращает клон в котором находится данный контрол
 * @param _control - DOM объект от которого идет поиск
 * @param repeaterName - имя репитера, клон которого ищется
 * @return DOM объект клона, иначе false
 */
function getCloneByNameFromControl(_control,repeaterName) {
    var c = _control;
    //Сначала ищем клон
    while (!c.clone && c.parentNode)
        c = c.parentNode;

    if (!c.parentNode && !c.clone)
        return false;
    c = c.clone;
    //Теперь по клонам
    while (c) {
        if (getProperty(c.clone, 'name', '') == repeaterName)
            return c.clone;
        c = c.parentClone;
    }

    return false;
}
function getControlByNameFromClone(_domObject,_nameControl,jump) {
    var _clone = _domObject.clone;
    if (!isObject(_clone)) {
        showError('Объект не является наследником клонируемого');
        return null;
    }
    if (jump == null) jump = 0;
    for (var index = 0; index < jump; index++) {
        _clone = _clone.parentClone;
        if (!isObject(_clone)) {
            showError('Объект не является наследником клонируемого');
            return null;
        }
    }

    var control;
    if (typeof (control = _clone.controls[_nameControl]) != 'object') {
        showError('Объект с именем ' + _nameControl + ' не зарегистрирован в клонируемом объекте');
        return null;
    }
    return control;
}
function getRepeaterByGroupName(_groupName,skip) {
    return getPage(skip).getRepeaterByGroupName(_groupName);
}
function addRepeaterClone(_groupName,_dataArray,_domObject,_labelName,skip) {
    return getPage(skip).addRepeaterClone(_groupName, _dataArray, _domObject, _labelName);
}
function removeRepeaterClone(_groupName,_domObject,_index,skip) {
    getPage(skip).removeRepeaterClone(_groupName, _domObject, _index);
}
function stopEvent(ev) {
    ev || (ev = window.event);
    if (ev.stopPropagation) {
        ev.preventDefault();
        ev.stopPropagation();
    } else {
        ev.cancelBubble = true;
        ev.returnValue = false;
    }
    return false;
}
function loadFile(_fileName) {
    window.location = 'getfile.php?file=' + _fileName;
}
function reloadURL() {
    location.reload();
}
function logOff() {
    var esia = getGlobalVar('int_esia');
    if ((typeof esia !== 'undefined' ) && (esia != null) && (''+getGlobalVar('int_esia')!={}) ) {
        window.open('webservice/esia/logout?callbackUrl=' + window.location, '_self');
        return;
    }
    /*
    requestServerModule(false,
        'System/system',
        {Module: 'logout'},
        function (_data) {
            reloadURL();

        },
        function () {
            showError('Не удалось выйти из системы');
        },
        null,
        true,
        false);
        */
}
function changeLPU() {
    /*
    requestServerModule(false,
        'System/system',
        {Module: 'changelpu'},
        function (_data) {
            reloadURL();
        },
        function () {
            showError('Не получилось сменить кабинет');
        },
        null,
        true,
        false);
    */
}

function GetDateWords() {
    return {
        'days': ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
        'months': [
            'января',
            'февраля',
            'марта',
            'апреля',
            'мая',
            'июня',
            'июля',
            'августа',
            'сентября',
            'октября',
            'ноября',
            'декабря']
    }
}

function AddDateLeadingZero(source) {
    return source < 10 ? '0' + source.toString() : source;
}

(function SysDateInit(window) {
    var date = new Date(),
        days = GetDateWords().days,
        months = GetDateWords().months;

    var timer = setInterval(function () {
        date.setSeconds(date.getSeconds() + 1);
    }, 1000);

    window.SysDateObj = {
        sync: function (_date) {
            _date = _date.split(/[\s.:]+/, 6);
            date = new Date(_date[2], _date[1] - 1, _date[0], _date[3], _date[4], _date[5]);
        },

        getDate: function () {
            return date;
        },

        toString: function () {
            var hours = date.getHours(),
                minutes = date.getMinutes();
            return days[date.getDay()] + ', ' + date.getDate() + ' ' + months[date.getMonth()] + ', '
                + AddDateLeadingZero(hours) + ':' + AddDateLeadingZero(minutes);
        },

        toFormattedString: function (format) {
            return DateToString(format, date);
        }
    };
})(window);

function DateToString(format, date) {
    var days = GetDateWords().days,
        months = GetDateWords().months;

    format = format.toUpperCase();
    return format.replace('DD', AddDateLeadingZero(date.getDate()))
        .replace('MM', AddDateLeadingZero(date.getMonth() + 1))
        .replace('YYYY', date.getFullYear())
        .replace('YY', ('' + date.getFullYear()).substr(2))
        .replace('DAY', days[date.getDay()])
        .replace('MONTH', months[date.getMonth()])
        .replace('HH24', AddDateLeadingZero(date.getHours()))
        .replace('MI', AddDateLeadingZero(date.getMinutes()))
        .replace('SS', AddDateLeadingZero(date.getSeconds()));
}

function SysDate(format) {
    return format ? SysDateObj.toFormattedString(format) : SysDateObj.getDate();
}
function getUserData() {
    /*
    requestServerModule(false, 'System/system', {
            Module: 'userenv'
        },
        function (env) {
            env = env.replace('$HTTP_HOST',location.host);
            openWindow({
                name: 'UniversalForms/text_area',
                vars: {
                    'in_value': env,
                    'window_caption': 'Скопировать в буфер обмена: Ctrl+C',
                    'select_on_focus': 1
                }
            }, true, 500, 250);
        },
        function () {
        },
        null, false, false);
    */
    return false;
}

//SYS_include_css('Styles/default');
function showReport(_reportName,_width,_height) {
    openWindow({name: 'Reports/showReport', modulename: _reportName}, true, _width, _height);
}
function createReport(_domObject,_params,_object, type)
{
    var skip = parseInt(getProperty(_domObject, 'skip', '0'));
    var _paramValue;
    var moduleName = _object.modulename;
    var _form = getPage(skip).form;
    var tagElement = 'iframe';
    if('_platform' in _object && 'noiframe' in _object && _object['noiframe'] == true && _object['_platform'] == 'd3'){
        //TODO:пока в m2 нет функционала.
        tagElement = 'div';
    }
    var iframe = document.createElement(tagElement);
    var url= {
        '_rep_code' : _object._rep_code,
        '_rep_id' : _object._rep_id
    }
    iframe.setAttribute('name',getProperty(_domObject,'name','unknownName'));
    if(tagElement == 'iframe'){
        iframe.setAttribute('height','940');
        iframe.setAttribute('scrolling','yes');
        iframe.setAttribute('frameborder','0');
        iframe.setAttribute('marginheight','0');
        iframe.setAttribute('marginwidth','0');
        iframe.setAttribute('autoheight','true');
    }
    iframe.setAttribute('style','background-Color:#FFFFFF;width:100%;height: inherit;');
    iframe.vars = {};/**переменные для передачи в отчет**/
    iframe.Events={
        'onshow':[],//событие для вызова как отчет загрузился
        'onresize':[]//событии для вызова при изменение размера всего документна
    }
    iframe.currWindow = window;
    if(!empty(moduleName)){
        _domObject.type = parseInt(_form.getPropertySysInfoByName(moduleName,'type','0'));
        if(!(+_domObject.type==1 || +_domObject.type == 5)){
            executeModule(moduleName,function (_data){_domObject.innerHTML=_data;},function (){_domObject.innerHTML='Не возможно построить отчет';},null,true,skip);
            return true;
        }
    }
    if(empty(moduleName)){
        _domObject.type=1;
        for(var index=0;index<_params.length;index++){
            if(_params[index].indexOf(':') > 0){
                var par = _params[index].split(':');
                iframe.vars[par[0]] = ((_object[par[1]])?_object[par[1]]:_form.getVar(par[1]));
            }
            else{
                _paramValue = _form.getVar(_params[index]);
                if (_paramValue === null) {
                    _paramValue = '';
                }
                iframe.vars[_params[index]] = ((_object[_params[index]])?_object[_params[index]]:_paramValue);
            }
        }
    }else if(+_domObject.type==1 || +_domObject.type == 5){
        var _data = _form.getSysInfoByName(moduleName);
        var _url = ''
        for(var _propertyName in _data){
            if(['_rep_id','_rep_code'].indexOf(_propertyName) > -1){
                url[_propertyName] = _data[_propertyName];
            }
            iframe.vars[_propertyName] = _data[_propertyName];
        }
    }
    var src = '';
    for(var prop in url){
        if(src != ''){
            src += "&";
        }
        src += prop+"="+url[prop];
    }
    var cache_enabled = 0;
    if('cache_enabled' in D3Api){
        if(src != ''){
            src += "&";
        }
        src += 'cache_enabled='+D3Api.cache_enabled;
    }
    if('session_cache' in D3Api){
        if(src != ''){
            src += "&";
        }
        src += 'session_cache='+D3Api.session_cache;
    }
    src = src.replace(/"/g, '&quot;');
    iframe.setAttribute('src','getreport.php?theme='+window.SYS_current_theme+'&'+src);
    _domObject.elementReport = iframe;
    _domObject.appendChild(iframe);
    if(tagElement == 'div'){
        if(_object['_platform'] == 'd3'){
            D3Api.showForm(_object['_path'],
                iframe, {
                    vars: iframe.vars,
                    onshow: function() {
                        iframe.subForm  = iframe.firstElementChild.D3Form;

                    }
                });
        }
    }else{
        iframe.Events['onresize'].push(function(_window){
            if('frameElement' in window && window.frameElement){
                iframe.style.height = _window.document.body.offsetHeight + 50 + 'px'
            }
        })
    }
}
function exportReportToXls(_reportName, extension, use_old_module) {
    if (!isExistsControlByName(_reportName, false))
        return false;
    var _domObject = getControlByName(_reportName);
    var frames = _domObject.getElementsByTagName('iframe');
    var ext_name = '';
    if (!empty(extension)) {
        ext_name = extension.toLowerCase();
    } else {
        ext_name = 'xls';
    }
    if (empty(use_old_module)) {
        use_old_module = false;
    }
    var f = 'Отчет.' + ext_name;
    var isStatReport = false;
    if (frames[0].contentWindow.$_REPORT_NAME){
        f = frames[0].contentWindow.$_REPORT_NAME + '.' + ext_name;
        if('$_REPORT_CODE' in frames[0].contentWindow && frames[0].contentWindow.$_REPORT_CODE == 'StatReportAll'){
            isStatReport = true;
        }
    }
    savePrintLogs(frames[0], 'EXCEL');

    var tpl = '';
    var reportForm = '';
    var report = frames[0].contentDocument.body.querySelector('[report="true"] div');

    if (!empty(report)) {
        tpl = report.getAttribute('template');
        var filename = f;
    }

    if (!empty(tpl) && !empty(report.D3Form)) // D3
    {
        reportForm = report.D3Form;
        var tbs = {};

        tbs['template'] = tpl;

        if (reportForm.existsFunction('prepareDataTBS')) {
            tbs['data'] = D3Api.JSONstringify(reportForm.callFunction('prepareDataTBS'));
        } else {
            var tbsData = {vars: {}};
            for (var v in reportForm.vars) {
                if (!reportForm.vars.hasOwnProperty(v)) {
                    continue
                }
                if (typeof (reportForm.vars[v]) == 'object')
                    continue;
                tbsData.vars[v] = reportForm.vars[v];
            }
            for (var a in reportForm.actions) {
                if (!reportForm.actions.hasOwnProperty(a)) {
                    continue;
                }
                tbsData[a] = reportForm.actions[a].data;
            }
            for (var d in reportForm.dataSets) {
                if (!reportForm.dataSets.hasOwnProperty(a)) {
                    continue;
                }
                tbsData[d] = reportForm.dataSets[d].data;
            }
            tbs['data'] = D3Api.JSONstringify(tbsData);
        }
        /*
        requestServerModule(true, 'System/system&Module=tbs', tbs, function (xml) {
            var resultArray = parseXmlResponse(xml, 'module');

            if (resultArray.sys_error)
                return;

            if (resultArray['filename'] != '') {
                document.location = 'getfile.php?file=' + resultArray['filename'] + '&filename=' + filename;
            } else {
                showError('Файл не указан.');
            }
        }, emptyFunction, null, true);
        */
    } else if (!empty(tpl) && !empty(report.form) && empty(report.D3Form)) // МИС
    {
        reportForm = report.form;
        var tbs = {};

        tbs['template'] = tpl;

        if (typeof (reportForm.getNamespace().prepareDataTBS) == 'function') {
            tbs['data'] = JSON.stringify(reportForm.getNamespace().prepareDataTBS());
        }
         /*
        requestServerModule(true, 'System/system&Module=tbs', tbs, function (xml) {
            var resultArray = parseXmlResponse(xml, 'module');

            if (resultArray.sys_error)
                return;

            if (resultArray['filename'] != '') {
                document.location = 'getfile.php?file=' + resultArray['filename'] + '&filename=' + filename;
            } else {
                showError('Файл не указан.');
            }
        }, emptyFunction, null, true);
        */
    } else {
        var body = frames[0].contentDocument.body;
        var stylesArray = frames[0].contentWindow._SYS_REPORT_STYLES ? frames[0].contentWindow._SYS_REPORT_STYLES.split(';') : undefined;
        /**
         * переводим картинки на  ссылки base64
         */
        var images = frames[0].contentDocument.images;
        for(var i = 0; i < images.length ; i++){
            var img = images[i];
            // Если данные уже закодированы в base64 то не будем их ломать
            if (img.naturalWidth === 0 || ~img.getAttribute('src').indexOf('data')) {
                continue;
            }
            var c = frames[0].contentDocument.createElement('canvas');
            c.height = img.naturalHeight;
            c.width = img.naturalWidth;
            var ctx = c.getContext('2d');

            ctx.drawImage(img,0,0,c.width,c.height);
            var base64String = c.toDataURL();
            img.src = base64String;
        }

        var moduleParams = {};
        var nativeFormatIndicator = report.querySelector('#NativeFormat');
        if (nativeFormatIndicator || isStatReport == true) {
            moduleParams['NATIVE'] = true;
            moduleParams['isStatReport'] = isStatReport;
            if(nativeFormatIndicator){
                moduleParams['RULES'] = nativeFormatIndicator.getAttribute('rules');
            }
        }
        if (use_old_module) {
            moduleParams['Module'] = 'saveToFileOld';
        }

        saveToFile(f, body, stylesArray, 'xls', moduleParams);
    }
}
function printReportByCode(_reportCode,_width,_height, _global, _caption, _settings) {
    if (_global == undefined) _global = 0;
    if (_settings == undefined) _settings = 0;
    return printReportByParam({_rep_code: _reportCode, caption: _caption}, _width, _height, _global, _settings);
}
function printReportById(_reportId,_width,_height, _global, _caption, _settings) {
    if (_global == undefined) _global = 0;
    if (_settings == undefined) _settings = 0;
    return printReportByParam({_rep_id: _reportId, caption: _caption}, _width, _height, _global, _settings);
}
function printReportByIdFromOtherLpu(_reportId, _lpu, _width,_height, _global, _caption, _settings) {
    if (_global == undefined) _global = 0;
    if (_settings == undefined) _settings = 0;
    return printReportByParam({
        _rep_id: _reportId,
        caption: _caption,
        _rep_lpu: _lpu
    }, _width, _height, _global, _settings);
}
function printReportByParam(_reportData,_width,_height, _global,_settings) {
    if (_global == undefined) _global = 0;
    if (_settings == undefined) _settings = 0;
    var _page = new DNullPage();
    //Учитываем отчет
    addReportInGroup();
     /*
    requestServerAction(true,
        'System/system&Action=isNeedReportParam',
        _reportData,
        function (_xml) {
            if(!_xml){
                D3Api.debug_msg('данные не пришли.');
                return;
            }
            var _nodes = _xml.childNodes;
            if (!isObject(_nodes)) {
                showError('Ответ от сервера не удовлетворяет условиям целостности');
                return;
            }
            var _node;
            for (var index = 0; index < _nodes.length; index++) {
                if ((_node = _nodes[index]).nodeName.toLowerCase() == 'action') {
                    var resultArray = XmlDataToArray(_node, true);
                    if (resultArray.sys_error) return;
                    _reportData.REP_TYPE = resultArray['REP_TYPE'];
                    _reportData.FLAG = resultArray['FLAG'];
                    if ((+resultArray['REP_TYPE'] == 3)){
                        window.open('getreport.php?_rep_id=' + resultArray['REP_ID']);
                        return;
                    }
					if(+resultArray['REP_TYPE'] == 10){
					    openD3Form('Lis/ReportConstruct/subforms/result', true, {
						    width : _width,
							height: _height,
							vars: {
							          report_id : resultArray['REP_ID'],
									  caption   : _reportData.caption
							      }
						});
						return;
					}
                    //Добавляем данные об отчете
                    if (addReportDataInGroup(_reportData, _global))
                        return;

                    if (resultArray['FLAG'] != '0' || +resultArray['REP_TYPE'] == 6) {
                        _reportData.name = 'Reports/run';
                        _reportData.vars = {SETTINGS: (_settings) ? true : false, _width: _width, _height: _height};
                        _page = openWindow(_reportData, true, 300, 300);
                    } else {
                        _reportData.name = 'Reports/showReport';
                        var l_Page = getPage();
                        if (l_Page.form)
                            for (var v_ind in l_Page.form.vars) {
                                if (!l_Page.form.vars.hasOwnProperty(v_ind)) {
                                    continue
                                }
                                if (v_ind.indexOf('rep_param') == 0) {
                                    _reportData[v_ind] = l_Page.form.vars[v_ind];
                                    if (_global == 1) {
                                        SYS_reportParams[v_ind] = l_Page.form.vars[v_ind];
                                    }
                                }
                            }

                        if (_global == 1) {
                            for (var v_ind_new in SYS_reportParams) {
                                if (SYS_reportParams.hasOwnProperty(v_ind_new)) {
                                    _reportData[v_ind_new] = SYS_reportParams[v_ind_new];
                                }
                            }
                        }

                        if (!empty(getVar('REP_ID'))) {
                            _reportData.REP_ID = getVar('REP_ID');
                        }

                        if (empty(_reportData._rep_code) && !empty(resultArray['REP_CODE'])) {
                            _reportData._rep_code = resultArray['REP_CODE'];
                        }

                        _reportData.vars = {SETTINGS: (_settings) ? true : false};
                        _reportData.onshow = function () {
                            if (getPage().getVar('modeIframe') == 'post' && getPage().submitIframe instanceof Function) {
                                getPage().submitIframe();
                            }
                        }
                        _page = openWindow(_reportData, true, _width, _height);

                    }
                }
            }
        },
        function (_xml, status) {
            showXmlError(_xml);
        },
        null, false);
     */
    return _page;
}
function printSubReportByCode(dom,_reportCode,_width,_height, _global, _caption,_formData) {
    if (_global == undefined) _global = 0;
    return printSubReportByParam(dom, {_rep_code: _reportCode, caption: _caption}, _width, _height, _global, _formData);
}
function printSubReportById(dom,_reportId,_width,_height, _global, _caption,_formData) {
    if (_global == undefined) _global = 0;
    return printSubReportByParam(dom, {_rep_id: _reportId, caption: _caption}, _width, _height, _global, _formData);
}
function printSubReportByParam(dom,_reportData,_width,_height, _global,_formData) {
    if (_global == undefined) _global = 0;
    var _page = new DNullPage();
    /*
    requestServerAction(true,
        'System/system&Action=isNeedReportParam',
        _reportData,
        function (_xml) {
            if(!_xml){
                D3Api.debug_msg('данные не пришли.');
                return;
            }
            var _nodes = _xml.childNodes;
            if (!isObject(_nodes)) {
                showError('Ответ от сервера не удовлетворяет условиям целостности');
                return;
            }
            var _node;
            var resultArray = new Array();
            for (var index = 0; index < _nodes.length; index++) {
                if ((_node = _nodes[index]).nodeName.toLowerCase() == 'action') {
                    var resultArray = XmlDataToArray(_node, true);
                    if (resultArray.sys_error) return;

                    _reportData.REP_TYPE = resultArray['REP_TYPE'];
                    _reportData.FLAG = resultArray['FLAG'];

                    if (+resultArray['REP_TYPE'] == 3) {
                        window.open('getreport.php?_rep_id=' + resultArray['REP_ID']);
                        return;
                    }
                    if (resultArray['FLAG'] != '0') {
                        _reportData.name = 'Reports/run';
                        _page = openWindow(_reportData, true, 300, 300);
                    } else {
                        for (var fd in _formData) {
                            if (!_formData.hasOwnProperty(fd)) {
                                continue;
                            }
                            _reportData[fd] = _formData[fd];
                        }
                        _reportData.name = 'Reports/showSubReport';

                        _reportData.vars = {};
                        var l_Page = getPage();
                        if (l_Page.form)
                            for (var v_ind in l_Page.form.vars) {
                                if (!l_Page.form.vars.hasOwnProperty(v_ind)) {
                                    continue;
                                }
                                if (v_ind.indexOf('rep_param') == 0) {
                                    _reportData[v_ind] = l_Page.form.vars[v_ind];
                                    if (_global == 1) {
                                        SYS_reportParams[v_ind] = l_Page.form.vars[v_ind];
                                    }
                                }

                                _reportData.vars[v_ind] = l_Page.form.vars[v_ind];
                            }

                        if (_global == 1) {
                            for (var v_ind_new in SYS_reportParams) {
                                if (SYS_reportParams.hasOwnProperty(v_ind_new)) {
                                    _reportData[v_ind_new] = SYS_reportParams[v_ind_new];
                                }
                            }
                        }

                        if (!empty(getVar('REP_ID'))) {
                            _reportData.REP_ID = getVar('REP_ID');
                        }

                        if (empty(_reportData._rep_code) && !empty(resultArray['REP_CODE'])) {
                            _reportData._rep_code = resultArray['REP_CODE'];
                        }

                        _page = openWindow(_reportData, dom, _width, _height, undefined, true);

                    }
                }
            }
        },
        function (_xml, status) {
            showXmlError(_xml);
        },
        null, false);
     */
    return _page;
}
var AcceptReport = false;
var ReportVarsPage = null;
var ReportsInGroup = 0;
var ReportsUid = 0;
var ReportsData = {};
var MultiReportSize = {};
function startMultiReportGroup(_width,_height,_skip) {
    AcceptReport = true;
    ReportVarsPage = getPage(_skip);
    MultiReportSize = {width: _width, height: _height, splice: false};
}
function addReportInGroup() {
    if (AcceptReport)
        ReportsInGroup++;
}
function addReportDataInGroup(_data,_global) {
    if ((!AcceptReport && ReportsInGroup == 0) || _data['FLAG'] != 0) {
        if (ReportsInGroup > 0) ReportsInGroup--;
        return false;
    }

    var ind = 'rep' + (ReportsUid++);
    ReportsData[ind] = {};
    for (var d in _data) {
        if (_data.hasOwnProperty(d)) {
            ReportsData[ind][d] = _data[d];
        }
    }

    //TODO: Возможно вынести в старт группы
    if (ReportVarsPage.form)
        for (var v_ind in ReportVarsPage.form.vars) {
            if (!ReportVarsPage.form.vars.hasOwnProperty(v_ind)) {
                continue;
            }
            if (v_ind.indexOf('rep_param') == 0) {
                ReportsData[ind][v_ind] = ReportVarsPage.form.vars[v_ind];
                if (_global == 1) {
                    SYS_reportParams[v_ind] = ReportVarsPage.form.vars[v_ind];
                }
            }
        }

    if (_global == 1) {
        for (var v_ind_new in SYS_reportParams) {
            if (SYS_reportParams.hasOwnProperty(v_ind_new)) {
                ReportsData[ind][v_ind_new] = SYS_reportParams[v_ind_new];
            }

        }
    }
    //////////

    if (!empty(ReportVarsPage.getVar('REP_ID'))) {
        ReportsData[ind].REP_ID = ReportVarsPage.getVar('REP_ID');
    }

    ReportsInGroup--;
    if (!AcceptReport && ReportsInGroup == 0)
        sendMultiReportGroup();

    return true;
}
function sendMultiReportGroup() {
    ReportsData.name = 'Reports/showMultiReport' + ((MultiReportSize.splice) ? 'Splice' : '');
    var win = openWindow(ReportsData, true, MultiReportSize.width, MultiReportSize.height);
    ReportVarsPage = null;
    ReportsData = {};
    MultiReportSize = {};
    return win;
}
function endMultiReportGroup(splice) {
    MultiReportSize.splice = splice;
    // 8-)
    if (ReportsUid > 9999999)
        ReportsUid = 0;
    if (AcceptReport) {
        AcceptReport = false;
        if (ReportsInGroup == 0)
            return sendMultiReportGroup();
    }
}
function execProcById(_ProcId, _Async) {
    if (_Async == undefined) _Async = true;
    execProcByParam({_up_id: _ProcId}, _Async);
}
function execProcByCode(_ProcCode, _Async) {
    if (_Async == undefined) _Async = true;
    execProcByParam({_up_code: _ProcCode}, _Async);
}
function execProcByParam(_Params, _Async) {
    _Params.name = 'UserProcs/run';
    _page = openWindow(_Params, true);
}
function printMultiReport(_reportsName,all) {

    if (!isExistsControlByName(_reportsName, false))
        return false;
    var _domObject = getControlByName(_reportsName);

    if (!all) {//печатать активную вкладку
        var tabname = getProperty(_domObject, 'activ_tabsheet', '');
        if (tabname != '') {
            printReport(tabname + '_TabSheet');
        }
    } else{//Все
        var tabbuttons = _domObject.querySelector('[cmptype="TabButtonContainer"]');
        var childs = tabbuttons.childNodes;
        var indx = 0;
        function setprint(){
            if(indx < childs.length){
                var tabname = getProperty(childs[indx], 'name', '');
                if(childs[indx].nodeType == 1){
                    printReport(tabname + '_TabSheet', true, function(){
                        ++indx;
                        setprint();
                    }, false, true);

                }else{
                    ++indx;
                    setprint();
                }
            }
        }
        setprint();
    }
}
function exportFromMultiReportToPdf(numReport) {
    exportReportToPdf("multireport", numReport - 1);
}
function exportFromReportToPdf(callback) {
    exportReportToPdf("report", 0, callback);
}
function exportReportToPdf(ctrlName, numReport, callback) {
    var filename = 'Отчет.pdf',
        frame = getControlByName(ctrlName).getElementsByTagName('iframe')[numReport],
        body = frame.contentDocument.body.cloneNode(true),
        images = body.querySelectorAll('img, image'),
        style = body.querySelectorAll('style'),
        options = body.querySelector('#PrintSetup');

    /*
     * atr.ps_shrinktofit - checkBox Сжать по ширине страницы
     * для стат отчетов
     * */
    if (options && options.attributes.ps_shrinktofit) {
        if (options.attributes.ps_shrinktofit.value == '1') {
            for (var i = 0; i < style.length; i++) {
                style[i].innerHTML = parseShrinktoFit(style[i].innerHTML);
            }
        }
    }
    removeNoPrint(body);
    base64EncodeImages(images);

    if (frame.contentWindow.$_REPORT_NAME)
        filename = frame.contentWindow.$_REPORT_NAME + '.pdf';

    exportRevertDomElementToHTML(body, 'pdf');

    getExportPdfFile(body.innerHTML, frame, ctrlName, filename, callback);
}

function base64EncodeImages(images) {
    if (images.length > 0) {
        var canvas = document.createElement("canvas");
        for (var i = 0; i < images.length; i++) {
            try {
                var img = images[i];
                if (img.naturalWidth === 0) {
                    continue; // image is not loaded yet
                }
                canvas.width = img.width;
                canvas.height = img.height;
                var ctx = canvas.getContext("2d");
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, img.dataset.canvasY || 0, img.width, img.dataset.canvasHeight || img.height);
                img.src = canvas.toDataURL("image/png");
            } catch (e) {
                var formname = dom && dom.getAttribute && dom.getAttribute('formname');
                showScriptError(e, {formname: formname, script: 'base64EncodeImages'});
            }
        }
        canvas = null;
    }
}
function removeNoPrint(domEl) {
    var noPrintElements = domEl.querySelectorAll('.no-print');
    for (var i = 0; i < noPrintElements.length; i++ ) {
        var noPrintEl = noPrintElements[i];
        noPrintEl.parentNode.removeChild(noPrintEl);
    }
}

function exportRevertDomElementToHTML(body,format) {

    for (var j = 0; j < body.childNodes.length; j++) {
        var _item = body.childNodes[j];
        if (_item.nodeType == 1)
            _item = revertDomElementToHTML(_item, format);
    }
}
function getPrintSetupOptions(frame, ctrlName) {
    var ps = frame.contentDocument.getElementById('PrintSetup');
    var options = [];

    if (!ps)
        ps = getControlByName(ctrlName);

    for (var i = 0, attrs = ps.attributes, n = attrs.length; i < n; i++) {
        options.push(attrs.item(i).nodeName + ':' + attrs.item(i).nodeValue);
    }
    return options;
}
function getExportPdfFile(body, frame, ctrlName, filename, callback) {
    var reportStyles = frame.contentWindow._SYS_REPORT_STYLES ? frame.contentWindow._SYS_REPORT_STYLES : '';
    setVar('BODY', body);
    setVar('CSS', 'Styles/default;Components/Report/css/Report;' + reportStyles);
    setVar('OPTIONS', getPrintSetupOptions(frame, ctrlName).join(';'));
    executeModule('htmlToPdf', function () {
        if (getVar('FILE') != '') {
            if (callback) {
                callback(getVar('FILE'), filename, 'application/pdf');
            } else {
                open('getfile.php?file=' + getVar('FILE') + '&type=application/pdf&filename=' + encodeURIComponent(filename));
            }
        }
    });
    savePrintLogs(frame, 'PDF');
}
function exportMultiReportToXls(_reportsName, extension) {
    if (!isExistsControlByName(_reportsName, false))
        return false;
    var _domObject = getControlByName(_reportsName);
    var tabname = getProperty(_domObject, 'activ_tabsheet', '');
    if (tabname != '') {
        exportReportToXls(tabname + '_TabSheet', extension, 0);
    }
}
function printReport(_reportName,_silent,_callback,_closeAfterPrint, _isMultiPrint) {
    if (!isExistsControlByName(_reportName, false)){
        return (_callback) ? _callback(false) : false;
    }

        var _domObject = getControlByName(_reportName);
        var frames = _domObject.getElementsByTagName('iframe');
        var reportFrame = frames[0];
        var contentWindow = reportFrame.contentWindow;
        var contentDocument = reportFrame.contentWindow.document;
        var paperData = null;
        var marginTop = null;
        var marginBottom = null;
        var marginRight = null;
        var marginLeft = null;
        var orientation = null;
        /**
         * Формирую css
         **/
        var ps = contentDocument.getElementById('PrintSetup');
        if(!ps){
            /**
             * не указаны настройки печати.
             * создадим новый и укажем значение по умолчанию
             **/
            ps = contentDocument.createElement('div');
            ps.id = 'PrintSetup';
            ps.setAttribute('ps_paperData','9');//размер бумаги A4

        }

        if(!('printing' in contentDocument)){
            //данный отчет ранее не печатался
            var styleSheets = contentDocument.styleSheets;
            for(var i = 0; i < styleSheets.length ; i++){
                if(styleSheets[i].href){
                    var style = contentDocument.createElement('style');
                    var text = '';
                    //стили загружены с помощью href, тогда формию новый стиль с содержимым
                    if(typeof styleSheets[i].rules === 'undefined') {
                        //FF 52.9
                        for(var j = 0; j < styleSheets[i].cssRules.length ; j++){
                            text += styleSheets[i].cssRules[j].cssText+'\n';
                        }
                    } else {
                        for(var j = 0; j < styleSheets[i].rules.length ; j++){
                            text += styleSheets[i].rules[j].cssText+'\n';
                        }
                    }
                    style.innerHTML = text;
                    contentDocument.body.appendChild(style);
                }
            }

            if (!reportFrame) {
                showError('Во время печати произошла ошибка.');
                return (_callback) ? _callback(false) : false;
            }
            savePrintLogs(reportFrame, 'PRINT');


            contentDocument.printing = true;
        }
        if(ps){
            paperData = getProperty(ps,'ps_paperData','');//размер бумаги
            marginTop = getProperty(ps,'ps_marginTop','');//верхний отступ
            marginBottom = getProperty(ps,'ps_marginBottom','');//нижний отступ
            marginRight = getProperty(ps,'ps_marginRight','');//правый отступ
            marginLeft = getProperty(ps,'ps_marginLeft','');//левый отступ
            orientation = getProperty(ps,'ps_orientation','portrait');//ориентация
            //проверим устанавливали мы ранее размер в стиль
            var styleSetup = contentDocument.getElementById('styleSetup');
            if((styleSetup && styleSetup.tagName.toLocaleLowerCase() == 'style')){
                styleSetup.remove();
            }
            /**
             * css https://www.w3.org/TR/css-page-3/#page-size
             *
             * jsprintsetup https://github.com/edabg/jsprintsetup/wiki
             */
            var styletext = '@page {\nsize:';
            switch (paperData) {
                case 'A3':
                case '8'://настройка из jsprintsetup
                    styletext += ' A3 ';
                    break;
                case 'A4':
                case '9'://настройка из jsprintsetup
                case '10'://настройка из jsprintsetup
                    styletext += ' A4 ';
                    break;
                case 'A5':
                case '11'://настройка из jsprintsetup
                    styletext += ' A5 ';
                    break;
            }
            /**
             * css отступы https://www.w3.org/TR/css-page-3/#margin-boxes
             */
            styletext += orientation+';\n';
            if(marginTop){
                styletext += 'margin-top: '+marginTop+'mm;\n';
            }
            if(marginBottom){
                styletext += 'margin-bottom: '+marginBottom+'mm;\n';
            }
            if(marginRight){
                styletext += 'margin-right: '+marginRight+'mm;\n';
            }
            if(marginLeft){
                styletext += 'margin-left: '+marginLeft+'mm;\n';
            }
            styletext += '}\n';

            /** удаляю скрипты из документа **/
            for(var i = 0; i < contentDocument.scripts.length;i++){
                contentDocument.scripts[i].remove();
            }
        }
        if(D3Api.misDesktopApp.isConnect()){
            D3Api.misDesktopApp.addEvent('onclose',function(_uid){
                D3Api.misDesktopApp.removeEvent(_uid);
                if(_callback){
                    _callback(true)
                };
            })
            /* перебираем все iframe и переводит в div*/
            var clone = mergeCopyDOM(contentDocument);
            var childs = clone.head.childNodes;
            for(var i = childs.length - 1 ; 0 <= i ; i--){
                if(childs[i].nodeType == 1){
                    if(['script','link'].indexOf(childs[i].nodeName.toLocaleLowerCase()) > -1){
                        childs[i].remove();
                    }
                }
            }
            var doc = new XMLSerializer().serializeToString(clone);
            //соединение к локальному приложению удалась. передаем отчет.
            D3Api.misDesktopApp.sendCustomMessage(JSON.stringify({
                doc:doc,
                paperdata: paperData,//размер бумаги
                orientation: orientation,//ориентация
                margintop:marginTop,//верхний отступ
                marginbottom:marginBottom,//нижний отступ
                marginright:marginRight,//правый отступ
                marginleft:marginLeft,//левый отступ
                param:'webprocess'
            }));
        }else{
            //соединение к локальному приложению не удалось. устанавливаем параметры печати и печатаем через браузер.
            styleSetup = contentDocument.createElement('style');
            styleSetup.id = 'styleSetup';
            styleSetup .innerHTML = styletext;
            /** Добавим в конец. настройки в приоритете. **/
            contentDocument.body.appendChild(styleSetup);
            /* перебираем все iframe и переводит в div*/
            var clone = mergeCopyDOM(contentDocument);
            var childs = clone.head.childNodes;
            for(var i = childs.length - 1 ; 0 <= i ; i--){
                if(childs[i].nodeType == 1){
                    if(['script','link'].indexOf(childs[i].nodeName.toLocaleLowerCase()) > -1){
                        childs[i].remove();
                    }
                }
            }
            var frame1 = document.createElement('iframe');
            frame1.setAttribute('style','background-Color:#FFFFFF;');
            frame1.name = 'frameReport';
            document.body.appendChild(frame1);
            var frameDoc = frame1.contentWindow || frame1.contentDocument.document || frame1.contentDocument;
            frameDoc.document.write('<!DOCTYPE html><html>'+clone.documentElement.innerHTML+'</html>');
            setTimeout(function(){
                frameDoc.print();
                frameDoc.document.close();
                frame1.remove();
            },500);

            if(_callback){
                _callback(true)
            };
        }
}

function startMultiDataSetsGroup(skip) {
    getPage(skip).startMultiDataSetsGroup();
}
function endMultiDataSetsGroup(skip,_callBackAcceptMethod,_callBackCancelMethod) {
    getPage(skip).endMultiDataSetsGroup(_callBackAcceptMethod, _callBackCancelMethod);
}
function startActionsGroup(skip,async) {
    getPage(skip).startActionsGroup(async);
}
function endActionsGroup(skip,_callBackAcceptMethod,_callBackCancelMethod) {
    getPage(skip).endActionsGroup(_callBackAcceptMethod, _callBackCancelMethod);
}
function revertDomElementToHTML(_domObject, format) {
    var val;
    if (empty(_domObject)) return;
    if (format && _domObject.hasAttribute('export_style')) {
        try {
            var exportStyle = JSON.parse(_domObject.getAttribute('export_style'));
            if (isObject(exportStyle)) {
                var formatExportStyle = exportStyle[format] || exportStyle['all'];
                formatExportStyle && _domObject.setAttribute('style', _domObject.getAttribute('style') + ';' + formatExportStyle, false);
            }
        } catch (e) {
            console.error("Ошибка при разборе export_style. Элемент: " + _domObject + ", ошибка:", e.message + ".");
        }
    }

    if (getProperty(_domObject, 'sample', null) == "true") {
        removeDomObject(_domObject);
        return document.createTextNode('');
    }

    if (_domObject.style) {
        if (_domObject.style.display == 'none') {
            return removeDomObject(_domObject);
        }
    }

    switch (getProperty(_domObject, 'cmptype', null)) {
        case 'Edit': {
            val = document.createTextNode(getControlValue(_domObject));
            break;
        }
        case 'DateEdit': {
            val = document.createTextNode(getControlValue(_domObject));
            break;
        }
        case 'CheckBox': {
            if (getControlValue(_domObject) == 0 || getControlValue(_domObject) == '0' || empty(getControlValue(_domObject))) {
                val = document.createTextNode('Нет');
            } else {
                val = document.createTextNode('Да');
            }
            break;
        }
        case 'Label': {
            val = document.createTextNode(getControlCaption(_domObject));
            break;
        }
        case 'Button': {
            val = document.createTextNode(getControlCaption(_domObject));
            break;
        }
        case 'HyperLink': {
            val = document.createTextNode(getControlCaption(_domObject));
            break;
        }
        case 'PopupMenu': {
            _domObject.style.display = "none";
            break;
        }
        default: {
            if (_domObject.nodeType === 1) {
                var current = _domObject.firstChild;
                while (current) {
                    if (current.nodeType !== 1) {
                        current = current.nextSibling;
                    } else {
                        var next = current.nextSibling;
                        revertDomElementToHTML(current, format);
                        current = next;
                    }
                }
            }
            val = _domObject;
        }
    }
    return val;
}

function removeScriptTag(html) {
    if (html.nodeType !== 1) return html;
    if (html.tagName.toLowerCase() === 'script') {
        html.remove();
        return null;
    }

    if (html.childNodes) {
        for (var i = 0; i < html.childNodes.length; i++) {
            html.childNodes[i] = removeScriptTag(html.childNodes[i]);
        }
    }

    return html;
}
//TODO: костыль до лучших времен.
function mergeCopyDOM(_source){
    var doc = _source;
    if(_source.nodeType != 9){
        doc = _source.ownerDocument;
    }
    /**
     * переводим картинки на  ссылки base64
     */
    var images = doc.images;
    for(var j = 0; j < images.length ; j++){
        if(!/data:([^>])+;base64/.test(images[j].src)){
            var c = doc.createElement('canvas');
            var img = images[j];
            img.onload = function () {
                c.height = img.naturalHeight;
                c.width = img.naturalWidth;
                var ctx = c.getContext('2d');

                ctx.drawImage(img,0,0,c.width,c.height);
                var base64String = c.toDataURL();
                img.src = base64String;
            };
        }
    }

    var clone = doc.cloneNode(true);
    function frameContent(_originSource,_cloneSource){
        var originIframe = _originSource.querySelectorAll('iframe');
        var cloneIframe = _cloneSource.querySelectorAll('iframe');
        for(var i = 0 ; i < originIframe.length ; i++){
            var winCln = originIframe[i].contentWindow;
            var documentCln = originIframe[i].contentDocument;
            /**
             * переводим картинки на  ссылки base64
             */
            var images = documentCln.images;
            for(var j = 0; j < images.length ; j++){
                if(!/data:([^>])+;base64/.test(images[j].src)){
                    var c = documentCln.createElement('canvas');
                    var img = images[j];
                    c.height = img.naturalHeight;
                    c.width = img.naturalWidth;
                    var ctx = c.getContext('2d');

                    ctx.drawImage(img,0,0,c.width,c.height);
                    var base64String = c.toDataURL();
                    img.src = base64String;
                }

            }
            var clnIframe = documentCln.body.cloneNode(true);
            if('$_REPORT_CODE' in winCln){
                clnIframe.setAttribute('report_code', winCln['$_REPORT_CODE'])
            }
            if('$_REPORT_NAME' in winCln){
                clnIframe.setAttribute('report_name', winCln['$_REPORT_NAME'])
            }
            cloneIframe[i].parentNode.insertBefore(clnIframe,cloneIframe[i])
            frameContent(documentCln.body,clnIframe);
            cloneIframe[i].remove();
        }
    }
    frameContent(doc,clone);
    //делаю ползунки невидимыми в компонентах Report
    var styleOverHidd = 'overflow: hidden;';
    var rprts = clone.querySelectorAll('*[cmptype="Report"]');
    for(var i = 0; i < rprts.length ; i++){
        var report = rprts[i];
        var height = parseInt(rprts[0].style.height)+50;

        if(!report.hasAttribute('style')){
            report.setAttribute('style',styleOverHidd+'height:'+height+'px;');
        }else{
            report.setAttribute('style',report.getAttribute('style')+';'+styleOverHidd+'height:'+height+'px;');
        }
    }
    //элемент body должен быть единственным. пробежимся по всем объектам и заменим с body на div
    var searchBody = false;//нашелся первый body
    function replaceBodyToDiv(_dom){
        if(_dom.nodeType == 9){
            _dom = _dom.body;
        }
        if(_dom.nodeType == 1){
            if(_dom.tagName.toLocaleLowerCase() == 'body'){
                if(searchBody){
                    //body ранее уже нашлось пора заменять.
                    var div = document.createElement('div');
                    for(var i = 0 ; i < _dom.childNodes.length ; i++){
                        div.appendChild(_dom.childNodes[i].cloneNode(true));
                    }
                    if(_dom.hasAttribute('report_code')){
                        div.setAttribute('report_code',_dom.getAttribute('report_code'));
                    }
                    if(_dom.hasAttribute('report_name')){
                        div.setAttribute('report_name',_dom.getAttribute('report_name'));
                    }
                    div.setAttribute('reportcontent','true');
                    _dom.parentNode.insertBefore(div,_dom);
                    _dom.remove();
                    _dom = div;
                }else{
                    searchBody = true;
                }
            }
            if(_dom.tagName.toLocaleLowerCase() != 'script'){
                var scripts = [];
                for(var i = 0 ; i < _dom.childNodes.length ; i++){
                    replaceBodyToDiv(_dom.childNodes[i]);
                    if(_dom.childNodes[i].nodeType == 1 && _dom.childNodes[i].tagName.toLocaleLowerCase() == 'script'){
                        scripts.push(_dom.childNodes[i]);
                    }
                }
                for(var i = 0 ; i < scripts.length ; i++){
                    scripts[i].remove();
                }
            }

        }
    }
    replaceBodyToDiv(clone);
    return clone;
}

function saveToFile(_filename,_source,_cssFiles,_format, moduleParams) {
    var styleSrc = '';
    var pageParam = {
        fitToHeight: true
    };
    _source = removeScriptTag(_source);
    if(moduleParams && 'isStatReport' in moduleParams && moduleParams['isStatReport'] == true){
        //статистический отчет
        var clone = D3Api.createClone({
            originSource: _source,
            sync: true,
            isDisplayNoneRemove: true
        });
        _source = [];
        //удаляем все скрипты
        var scripts = clone.querySelectorAll('*[cmptype="Script"]');

        for (var i = scripts.length - 1; 0 <= i; i--) {
            scripts[i].remove();
        }
        var printSetups = clone.querySelectorAll('#PrintSetup');
        if(printSetups.length > 0){
            if(hasProperty(printSetups[0],'ps_paperData')){
                pageParam['paperSize'] = getProperty(printSetups[0],'ps_paperData','9')
            }
            if(hasProperty(printSetups[0],'ps_orientation')){
                pageParam['orientation'] = getProperty(printSetups[0],'ps_orientation','portrait');
            }
            if(hasProperty(printSetups[0],'ps_marginTop')){
                pageParam['top'] = getProperty(printSetups[0],'ps_marginTop','1');
            }
            if(hasProperty(printSetups[0],'marginBottom')){
                pageParam['bottom'] = getProperty(printSetups[0],'marginBottom','1');
            }
            if(hasProperty(printSetups[0],'marginLeft')){
                pageParam['left'] = getProperty(printSetups[0],'marginLeft','0.75');
            }
            if(hasProperty(printSetups[0],'marginRight')){
                pageParam['right'] = getProperty(printSetups[0],'marginRight','0.75');
            }
        }
        for (var i = printSetups.length - 1; 0 <= i; i--) {
            printSetups[i].remove();
        }
        var printSetups = clone.querySelectorAll('#print-settings');
        for (var i = printSetups.length - 1; 0 <= i; i--) {
            printSetups[i].remove();
        }

        var splitcontents = clone.querySelectorAll('*[splitcontent="true"]');
        var splt_content = [];
        var splt_other = [];/* блок для не найденных по родителю */
        for(var i = 0; i < splitcontents.length ; i++){
            if(splitcontents[i].hasAttribute('isd3repeater')){
                continue;
            }
            var content = null;
            if(splitcontents[i].children.length == 1 && splitcontents[0].children[0].getAttribute('cmptype') == 'subreport'){
                content = splitcontents[i].children[0].querySelector('*[report="true"]');
            }else if(splitcontents[i].children.length > 1){
                content = splitcontents[i];
            }
            if(content){
                var id = splitcontents[i].getAttribute('content_id');
                var hid = splitcontents[i].getAttribute('content_hid');
                if(!hid){
                    splt_content.push({
                        id: id,
                        content:document.createDocumentFragment()
                    })
                    var dv = document.createElement('div');
                    dv.appendChild(D3Api.createClone({
                        originSource: content,
                        sync: true,
                        isDisplayNoneRemove: true
                    }));
                    splt_content[splt_content.length - 1].content.appendChild(dv);

                    for(var j = splt_other.length - 1; 0 <= j  ; j--){
                        for(var l = splt_content.length - 1; 0 <= l  ; l--){
                            if(splt_other[j].hid == splt_content[l].id){
                                splt_content[l].content.childNodes[0].appendChild( D3Api.createClone({
                                    originSource: splt_other[j].content,
                                    sync: true,
                                    isDisplayNoneRemove: true
                                }));
                                splt_other.splice(j, 1);
                                break;
                            }
                        }
                    }
                }else{
                    var isJoin = false;
                    for(var j = 0 ; j < splt_content.length ; j++){
                        if(splt_content[j].id == hid){
                            isJoin = true;
                            splt_content[j].content.childNodes[0].appendChild(D3Api.createClone({
                                originSource: content,
                                sync: true,
                                isDisplayNoneRemove: true
                            }));
                            break;
                        }
                    }
                    if(!isJoin){
                        splt_other.push({
                            id:id,
                            hid:hid,
                            content:content
                        })
                    }
                }
            }
        }
        var excel = new D3Api.Office.Spreadsheet.export('xlsx');
        for(var i = 0; i < splt_content.length ; i++){
            var content = splt_content[i].content.childNodes[0];
            excel.setContent({
                sheetname:'Лист'+(i),
                dom:content,
                autoWidth:true,
                pageSetup:pageParam
            });

        }
        excel.save('export');
        return true;
    }
    if (!Array.isArray(_source) && !empty(_source.childNodes)) {
        var clone = mergeCopyDOM(_source);
        clone.jsParent = getPage().form;

        removeNoPrint(clone);

        for (var j = 0; j < clone.childNodes.length; j++) {
            var _item = clone.childNodes[j];
            if (_item.nodeType == 1) {
                _item = revertDomElementToHTML(_item, _format);
            }
        }
        var stls = clone.getElementsByTagName('style');
        if (stls)
            stls = Array.prototype.slice.call(stls);
        var stl;
        while (stls && (stl = stls.shift())) {
            styleSrc += stl.textContent || stl.innerHTML;
            stl.parentNode.removeChild(stl)
        }
        _source = clone.firstElementChild.innerHTML;
    }
    var _data = {
        DATA: _source,
        STYLE: styleSrc,
        FORMAT: _filename.split('.').pop().toUpperCase()
    };
    if (typeof (_cssFiles) != 'undefined') {
        for (var index = 0; index < _cssFiles.length; index++) {
            _data['CSS[' + index + ']'] = _cssFiles[index];
        }
    }
    _data['Module'] = 'saveToFile';
    if (moduleParams !== undefined) {
        Object.assign(_data, moduleParams);
    }
    if(!moduleParams || (!('NATIVE' in moduleParams)) || moduleParams['NATIVE'] !== true){
        var excel = new D3Api.Office.Spreadsheet.export('html');
        excel.setContent({
            'sheetname':'Первый лист',
            'dom':_data['DATA'],
            'style':_data['STYLE']
        });
        excel.save(_filename);
    }else{
        /*
        requestServerModule(true, 'System/system', _data, function (_xml) {
            if(!_xml){
                D3Api.debug_msg('данные не пришли.');
                return;
            }
            var _nodes = _xml.childNodes;
            if (!isNodeList(_nodes)) {
                showError('Ответ от сервера не удовлетворяет условиям целостности');
                return;
            }
            var _node;
            var resultArray = new Array();
            for (var index = 0; index < _nodes.length; index++) {
                if ((_node = _nodes[index]).nodeName.toLowerCase() == 'module') {
                    resultArray = XmlDataToArray(_node, true);
                    if (resultArray.sys_error) {
                        return;
                    }
                    if (resultArray['ID'] != '') {
                        open('getfile.php?file=' + resultArray['ID'] + '&type=application/vnd.ms-excel&filename=' + encodeURIComponent(_filename));
                    }
                    return;
                }
            }

        }, function (_xml, _status) {
            showXmlError(_xml);
        }, null, true, true);
        */
    }
}

var supportedStyles = [
    'background-color',
    'border',
    'border-top',
    'border-bottom',
    'border-left',
    'border-right',
    'color',
    'number-format',
    'mso-number-format',
    'text-align',
    'vertical-align',
    'width',
    'overflow-wrap',
    'word-wrap',
];
var supportedTags = [
    'TH', 'TD', 'TABLE',
]
function inlineStyle(element) {
    if (supportedTags.indexOf(element.tagName) !== -1) {
        var styles = getComputedStyle(element);
        for (var styleName of supportedStyles) {
            if (styles.getPropertyValue(styleName)){
                element.style[styleName] = styles.getPropertyValue(styleName);
            }
        }
    }

    for (var j = 0; j < element.childNodes.length; j++) {
        var child = element.childNodes[j];
        if (child.nodeType === 1) {
            inlineStyle(child);
        }
    }
}

function parseShrinktoFit(s) {
    return s.replace(/padding:.+;/g, '') + '.stat_table {font-size: 8px;}';
}
function parseXmlResponse(_xml,_nameNode) {
    if (!isNodeList(_xml.childNodes) && !_xml.hasChildNodes()) {
        showError('Ответ от сервера не удовлетворяет условиям целостности');
        return;
    }
    var _nodes = _xml.childNodes;
    var _node;
    var resultArray = new Array();
    for (var index = 0; index < _nodes.length; index++) {
        if ((_node = _nodes[index]).nodeName.toLowerCase() == _nameNode) {
            resultArray = XmlDataToArray(_node, true);
            if (resultArray.sys_error) {
                break;
            }
            return resultArray;
        }
    }
    return resultArray;
}
/** функционал для выгрузки в эксел **/
function exportDataSetToExcel(_dataSetName,userFields,filename,_headerName,skip, _customFilter, _dataSetAsRange) {
    var _page = getPage(skip);
    if (typeof (_page.form) == 'undefined') return;
    if (typeof (_headerName) == 'undefined') _headerName = '';
    var data = _page.form.getSysInfoByName(_dataSetName);
    if(!userFields){
        return false;
    }
    var postData = {};
    postData.name = _headerName;
    postData.Form = _page.form.name;
    var url = '';
    for (var property in data) {
        if (data.hasOwnProperty(property)) {
            if (property != 'mode')
                url += '&' + property + '=' + encodeURIComponent(data[property]);
        }
    }

    if('mode' in data && (data['mode'] == 'Range' || _dataSetAsRange == true)){
        delete data['mode'];
    }
    if('_c' in data){
        delete data['_c'];
    }
    if('_s' in data){
        delete data['_s'];
    }
    data.DataSet = _dataSetName;
    requestServerDataSet(postData.Form + _page.form.getUrlFormData(), data, function(_xml, promiseObj){
        if (!_page) {
            //форму успели закрыть
            return;
        }
        if(!_xml){
            D3Api.debug_msg('данные не пришли.');
            return;
        }
        var _nodes = _xml.childNodes;
        if (!isNodeList(_nodes)) {
            showError(_nodes);
            return;
        }

        var excel = new D3Api.Office.Spreadsheet.export('xlsx');
        var sheet1 = excel.addSheet(filename||'Лист 1');
        /* устанавливаем значение в ячейку */
        function setCellValue(_coord, _value, _style){
            sheet1.setCellValue(_coord,_value).setStyleArray(_style||{
                border:{
                    'all': {
                        borderWidth: 1 ,
                        borderStyle: 'thin'
                    }
                },
                text:{
                    wraptext:true
                }
            });
        }
        var currentRow = 0;
        /* установим все кастом фильтры */
        if(_customFilter && Array.isArray(_customFilter)){
            for(var i = 0 ; i < _customFilter.length ; i++){

                setCellValue.apply(this, [
                    'A'+D3Api.Office.Spreadsheet.getRow(i),
                    _customFilter[i].name+':',
                    function(){
                        if('style' in _customFilter[i]){
                            if('name' in _customFilter[i].style){
                                return  _customFilter[i].style.name;
                            }
                        }
                        return undefined;
                    }()
                ]);
                setCellValue.apply(this, [
                    'B'+D3Api.Office.Spreadsheet.getRow(i),
                    _customFilter[i].value,
                    function(){
                        if('style' in _customFilter[i]){
                            if('value' in _customFilter[i].style){
                                return  _customFilter[i].style.value;
                            }
                        }
                        return undefined;
                    }()
                ]);
                ++currentRow;
            }
            setCellValue('A'+D3Api.Office.Spreadsheet.getRow(_customFilter.length + 1),'');
            setCellValue('B'+D3Api.Office.Spreadsheet.getRow(_customFilter.length + 1),'');
            ++currentRow;
        }
        /* установить заголовки к таблице*/
        var _cell = 0;
        if(Array.isArray(userFields)){
            for(var i = 0; i < userFields.length ; i++){


            }
            ++currentRow;
        }else if(typeof userFields == 'object'){

            for (var property in userFields) {
                if (userFields.hasOwnProperty(property)) {
                    if(typeof userFields[property] == 'string'){
                        setCellValue(D3Api.Office.Spreadsheet.getColumn(_cell)+D3Api.Office.Spreadsheet.getRow(currentRow),userFields[property]);
                    }else{
                        setCellValue(D3Api.Office.Spreadsheet.getColumn(_cell)+D3Api.Office.Spreadsheet.getRow(currentRow),userFields[property].caption);
                    }
                    ++_cell;
                }
            }
            ++currentRow;
        }
        /* установим автофильтр */
        sheet1.setAutoFilter('A'+(currentRow)+":"+D3Api.Office.Spreadsheet.getColumn(_cell - 1)+(currentRow));

        for (var index = 0; index < _nodes.length; index++) {
            var _node = _nodes[index];
            switch (_node.nodeName.toLowerCase()) {
                case 'dataset': {
                    for (var jndex = 0; jndex < _node.attributes.length; jndex++) {
                        if (_node.attributes[jndex].name == 'name') {
                            var _dataArray = DataSetXmlDataToArray(_node, 0, false);
                            var _sum = 'Всего: ' + _dataArray.length + ' записей.';
                            for(var i = 0; i < _dataArray.length ; i++){
                                _cell = 0;
                                for (var property in userFields) {
                                    if (userFields.hasOwnProperty(property)) {
                                        if(!(property in _dataArray[i])){
                                            _dataArray[i][property] = '';
                                        }
                                        setCellValue(D3Api.Office.Spreadsheet.getColumn(_cell)+D3Api.Office.Spreadsheet.getRow(currentRow + i),_dataArray[i][property]||'');
                                        ++_cell;
                                    }
                                }
                            }
                            sheet1.setCellValue(D3Api.Office.Spreadsheet.getColumn(0)+D3Api.Office.Spreadsheet.getRow(_dataArray.length + currentRow),_sum);
                        }
                    }
                }
            }
        }
        sheet1.setAutoWidth(true);
        sheet1.setSetupPage({
            fitToHeight:true
        })
        !empty(filename) ? excel.save(filename) : excel.save();
    }, null, _page);
}

function exportMultiDataSetToExcel(dataSetsArray, filename, skip) {
    var _page = getPage(skip);
    if (typeof (_page.form) === 'undefined') return;
    if (typeof (_headerName) === 'undefined') _headerName = '';
    var url = '';
    var postData = {};
    var load = false;
    for (var ds in dataSetsArray) {
        if (!dataSetsArray.hasOwnProperty(ds)) {
            continue;
        }
        var data = _page.form.getSysInfoByName(ds);
        for (var property in dataSetsArray[ds]) {
            if (!dataSetsArray[ds].hasOwnProperty(property)) {
                continue;
            }
            if (property == "_returnCount") {
                postData['userFields[' + ds + '][sysinfo][returnCount]'] = true;
                delete (property);
            } else {
                postData['userFields[' + ds + '][' + property + ']'] = dataSetsArray[ds][property];
            }
        }
        for (var property in data) {
            if (data.hasOwnProperty(property)) {
                if (property !== 'mode') postData['userFields[' + ds + '][sysinfo][' + property + ']'] = data[property];
            }
        }
    }
    postData.name = filename;
    postData.Form = _page.form.name;
    /*
    requestServerModule(true, 'System/system&Module=excel&multi=true' + _page.form.getUrlFormData() + url, postData, function (xml) {
        var resultArray = parseXmlResponse(xml, 'module');
        var loadFlag = false;
        if (resultArray.sys_error) return;
        if (resultArray['filename'] !== '' && resultArray['filename'] !== undefined) {
            if (!resultArray['returnCount']) {
                loadFlag = true;
            } else if (confirm('Выгружено ' + resultArray['returnCount'] + ' записей. Сохранить файл?')) {
                loadFlag = true;
            }
            if (loadFlag) {
                document.location = 'getfile.php?file=' + resultArray['filename'] + '&filename=' + encodeURIComponent(filename) + '.xls';
            }
        } else {
            showError('Файл не указан.');
        }
    }, emptyFunction, null, true);
    */
}
/** ***************************************** **/
function HideMainMenu() {
    var h = document.getElementById('_mainHeader');
    if (h) {
        removeClass(h, 'OpenHeader');
        removeClass(h, 'CloseHeader');
        addClass(h, 'HideHeader');
    }
    wndResize();
}
function ShowMainMenu() {
    var h = document.getElementById('_mainHeader');
    if (h) {
        removeClass(h, 'CloseHeader');
        removeClass(h, 'HideHeader');
        addClass(h, 'OpenHeader');
    }
    wndResize();
}

function runCalcSize(calc_dom,size_dom) {
    if (!calc_dom) calc_dom = document;
    if (!size_dom) size_dom = document;

    if (!calc_dom.querySelector || !calc_dom.querySelectorAll)
        return;

    if (!BROWSER.ff) {
        runCalcOnResize();
        return;
    }
    var cH = calc_dom.querySelectorAll('[calc_height]');
    var cW = calc_dom.querySelectorAll('[calc_width]');

    if (!cH.length && !cW.length) {
        runCalcOnResize();
        return;
    }
    var cacheSelect = {};

    function getS(cssSel, wh) {
        cacheSelect[cssSel] = (cacheSelect[cssSel]) ? cacheSelect[cssSel] : size_dom.querySelector(cssSel);
        return (!cacheSelect[cssSel]) ? 0 : ((wh == 'w') ? cacheSelect[cssSel].offsetWidth : cacheSelect[cssSel].offsetHeight);
    }

    for (var i = 0; i < cW.length; i++)
        cW[i].style.display = 'none';
    for (var i = 0; i < cH.length; i++)
        cH[i].style.display = 'none';

    for (var i = 0; i < cH.length; i++) {
        var h = cH[i].getAttribute('calc_height');
        var parent = cH[i].parentNode.offsetHeight;
        if (h != '')
            cH[i].style.height = eval(h.replace(/#(.+?)#/gi, 'getS("$1","h")')) + 'px';
    }
    for (var i = 0; i < cW.length; i++) {
        var w = cW[i].getAttribute('calc_width');
        var parent = cW[i].parentNode.offsetWidth;
        if (w != '')
            cW[i].style.width = eval(w.replace(/#(.+?)#/gi, 'getS("$1","w")')) + 'px';
    }

    for (var i = 0; i < cW.length; i++)
        cW[i].style.display = '';
    for (var i = 0; i < cH.length; i++)
        cH[i].style.display = '';

    runCalcOnResize();
}

function runCalcOnResize() {
    var cR = document.body.querySelectorAll('[calc_onresize]');

    for (var i = 0; i < cR.length; i++) {
        // если элемент не видим то смысла ресайзить его нет
        if (cR[i].offsetHeight === 0 || cR[i].offsetWidth === 0) {
            continue;
        }
        if (!cR[i].calcOnResize) {
            var cRE = getProperty(cR[i], 'calc_onresize', false);

            if (cRE) {
                cR[i].calcOnResize = new Function('dom', cRE);
            }
        }
        if (cR[i].calcOnResize instanceof Function) {
            try {
                cR[i].calcOnResize.call(cR[i]);
            } catch (e) {
            }
        }
    }
}

window._GLOBAL_VARS = {};

function getGlobalVar(name) {
    return window._GLOBAL_VARS[name];
}
function setGlobalVar(name,value) {
    window._GLOBAL_VARS[name] = value;
}
function deleteGlobalVar(name) {
    delete window._GLOBAL_VARS[name];
}

function openWindow(formData,modal,_width,_height,otladka,notAddPage) {
    if (!modal || isObject(modal)) {
        var infolink = document.querySelector('.infoLink');

        if (infolink) {
            infolink.style.display = '';
        };
        if (!modal) {
            SYS_pages = [];
            while (+SYS_pages_window.length) {
                closeWindow(null, getPage());
            }
        } else {
            /** вызывает printSubReportByParam передает саб.отчет, удалять страницу не нужно**/
            var f = getMainForm(modal);
            if (f) {
                f.beforeClose();
            }
        }
    }
    wndResize();
    if (!otladka) {
        otladka = 0;
    }
    var _formName = '';
    var _data = {};
    var _formVars = '';
    if (!isObject(formData)) {
        _formName = formData;
    } else {
        _formName = formData.name;
        delete formData['name'];
        _formVars = formData.vars;
        delete formData['vars'];
        _data = formData;
    }
    _data['_openWindowData'] = {
        modal: modal,
        width: _width,
        height: _height,
        otladka: otladka,
        notAddPage: notAddPage,
        isComposition: false
    };
    if (_formName == 'UniversalComposition/UniversalComposition') {
        _data['_openWindowData']['otladka'] = 2;
        _data['_openWindowData']['isComposition'] = true;
    }
    incSYS_countShowState();
    var page = new DPage(_formName);

    if (_data.oncreate) {
        page.addListener('oncreate', function (_func) {
            return function () {
                addStackPage(page);
                var result = _func.apply(page.form, arguments);
                removeStackPage();
                return result;
            }
        }(_data.oncreate));
        delete _data.oncreate;
    }
    if (_data.onshow) {
        page.addListener('onshow', function (_func) {
            return function () {
                addStackPage(page);
                var result = _func.apply(page.form, arguments);
                removeStackPage();
                return result;
            }
        }(_data.onshow));
        delete _data.onshow;
    }
    if (modal === true) {
        document.body.style.overflow = 'hidden';
        page.addListener('onclose', function () {
            if (!page.form.page.prevPage.modal) {
                document.body.style.overflow = 'auto';
            }
        });
    }
    page.setFormData(_data);
    page.form.formVarsOpen = {};
    if (isObject(_formVars)) {
        for (var key in _formVars) {
            if (!_formVars.hasOwnProperty(key)) {
                continue;
            }
            page.setVar(key, _formVars[key]);
            page.form.formVarsOpen[key] = _formVars[key];
        }
    }
    page.show({'vars': _formVars});

    page.addListener('onshow', function () {
        setTimeout(function () {
            if (window.SYS_Analytics) {
                SYS_Analytics.send(page);
            }
        }, 100);
    });
    page.addListener('onclose', function () {
        if (window.SYS_Analytics) {
            SYS_Analytics.send((!page.prevPage || Object.keys(page.prevPage).length === 0) ? page : page.prevPage);
        }
    });
    setTimeout(function(){
        /* попытаться выполнить последним */
        page.addListener('onafterclose', function () {
            /*
            requestServerModule(false, 'System/system', {
                Module: 'CacheSessDelete',
                formCache: page.form.formCache,
                silent: true
            });
            */
        });
    },0);

    return page;
}

function checkErrorRequest(r,file) {

    var errorRequest = {};
    var er = (r.responseXML) ? r.responseXML.getElementsByTagName('ERROR_REQUEST')[0] : false;
    if (!er){
        return true;
    }
    function openWinLog(){
        var formLogin = 'System/login';
            formLogin += '_new';
        //проверить была ли ранее открыта окно авторизации. если ранее уже открылась то повторно не открывать.
        // подобные ситуция происходит когда делают несколько паралельно или последовательно обращение к Action, DataSet, Module
        if(!('isOpenWinLogin' in D3Api) || D3Api.isOpenWinLogin === false){
            D3Api.isOpenWinLogin = true;
            openWindow(formLogin, true).addListener('onafterclose',function () {
                D3Api.isOpenWinLogin = false;
            });
        }

    }
    function openWinLPU() {
        if(window.SYS_current_theme == 'new'){
            openWindow({ name: 'System/login_new',vars: {LPU: true}},true);
        }else if(window.SYS_current_theme == 'bars'){
            openWindow('System/lpu', true);
        }
    }

    var st = er.textContent;

    var er_txt = r.responseXML.getElementsByTagName('Error')[0];

    //Отмена загрузки формы
    if (file == 'getform')
        decSYS_countShowState();


    switch (st) {
        case 'ERROR_LOGIN_DB':
            errorRequest['ERROR_LOGIN_DB'] = 1;
            setGlobalVar('errorRequest', errorRequest);
            if (er_txt) {
                showError(er_txt.textContent).addListener('onclose', function () {
                    openWinLog();
                }, this, true);
            } else
                openWinLog();
            break;
        case 'WARNING_PASSWORD_EXPIRE_DB':
            errorRequest['WARNING_PASSWORD_EXPIRE_DB'] = 1;
            setGlobalVar('errorRequest', errorRequest);
            if (er_txt) {
                showError(er_txt.textContent).addListener('onclose',
                    function () {
                        if(confirm('Сменить пароль сейчас?')) {
                            openWindow('System/change_password', true).addListener('onclose',
                                function () {
                                    openWinLog();
                                });
                        } else {
                            openWinLPU();
                        }
                    }, this, true);
            } else {
                if(confirm('Сменить пароль сейчас?')) {
                    openWindow('System/change_password', true);
                }
            }
            break;
        case 'WARNING_PASSWORD_UPDATE_DB':
            errorRequest['WARNING_PASSWORD_UPDATE_DB'] = 1;
            setGlobalVar('errorRequest', errorRequest);
            if (er_txt) {
                showError(er_txt.textContent).addListener('onclose',
                    function () {
                        if(confirm('Сменить пароль сейчас?')) {
                            openWindow('System/change_password', true).addListener('onclose',
                                function () {
                                    openWinLog();
                                });
                        } else {
                            openWinLPU();
                        }
                    }, this, true);
            } else {
                if(confirm('Сменить пароль сейчас?')) {
                    openWindow('System/change_password', true);
                }
            }
            break;
        case 'ERROR_LOGIN_LPU':
            errorRequest['ERROR_LOGIN_LPU'] = 1;
            setGlobalVar('errorRequest', errorRequest);
            if (er_txt) {
                showError(er_txt.textContent);
            } else {
                if(window.SYS_current_theme == 'new'){
                    openWindow({ name: 'System/login_new',vars: {LPU: true}},true);
                }else if(window.SYS_current_theme == 'bars'){
                    openWindow('System/lpu', true);
                }

            }
            break;
        case 'ERROR_USER_LOCKED':
            errorRequest['ERROR_USER_LOCKED'] = 1;
            setGlobalVar('errorRequest', errorRequest);
            if (er_txt) {
                showError(er_txt.textContent);
            } else
                openWinLog();
            break;
        case 'ERROR_USER_DISABLED':
            errorRequest['ERROR_USER_DISABLED'] = 1;
            setGlobalVar('errorRequest', errorRequest);
            if (er_txt) {
                showError(er_txt.textContent).addListener('onclose', function () {
                    openWinLog();
                }, this, true);
            } else
                openWinLog();
            break;
        case 'ERROR_OTHER_USER_LOGIN':
            errorRequest['ERROR_OTHER_USER_LOGIN'] = 1;
            setGlobalVar('errorRequest', errorRequest);
            if (er_txt) {
                showError(er_txt.textContent).addListener('onclose', function () {
                    openWinLog();
                }, this, true);
            } else
                openWinLog();
            break;
        case 'WARNING_DDL_STRUCT_UPDATE':
            openD3Form('System/say_hello', true);
            break;
        default:
            errorRequest['OTHER_ERROR'] = 1;
            setGlobalVar('errorRequest', errorRequest);
            showError('Ошибка при запросе:\n' + er_txt.textContent + '\nНеизвестный код ошибки ответа: ' + st);
            break;
    }
    return false;
}
function getConfigValue(name,defaultValue) {
    if (window.SYS_CONFIG === null)
        return defaultValue;
    if (name === undefined)
        return window.SYS_CONFIG;
    var path = name.split('/');
    var res = window.SYS_CONFIG;
    for (var i = 0, c = path.length; i < c; i++) {
        if (res[path[i]] !== undefined)
            res = res[path[i]];
        else
            return defaultValue;
    }
    return res;
}

/**
 * @deprecated use D3Api.showAlert
 * @param message
 * @param title
 * @param width
 * @param height
 * @param callback
 */
function showAlert(message, title, width, height, callback) {
    D3Api.showAlert(message, callback, {title: title});
}

/**
 * @deprecated use D3Api.showConfirm
 * @param message
 * @param title
 * @param width
 * @param height
 * @param confirmedCallback
 * @param cancelledCallback
 * @param type
 */
function showConfirm(message, title, width, height, confirmedCallback, cancelledCallback, type) {
    D3Api.showConfirm(message, confirmedCallback, cancelledCallback,
        {
            title: title,
            button_confirm_caption: type === "yesno" ? "Да" : null,
            button_cancel_caption: type === "yesno" ? "Нет" : null
        });
}

function openD3Form(name,modal,data) {
    //if (!window['D3Api']) {
    //    alert('Не установлен D3.');
    //    return;
    //}
    var _page = null;
    data = data || {};
    var cont = null;
    var oncreate = null;
    var onshow = null;
    var funcCloseD3Form = function () {
        if (!empty(_page.d3Form)) {
            if (!_page.d3Form.destroyed) {
                _page.d3Form.close()
            }
        }
        if(!empty(_page.form) && !empty(_page.form.page)){
            if(!_page.form.page.destroyed){
                _page.form.page.close()
            }
        }
    }
    if (modal) {
        if (!data['request']) {
            data['request'] = {}
        }
        data['request']['modal'] = 1;
        data.modal_form = false;
        cont = new DWindow();
        _page = new DPage(name);
        _page.modal = modal;
        if (!modal) {
            var infolink = document.querySelector('.infoLink');

            if (infolink) {
                infolink.style.display = '';
            };
        };
        oncreate = function (form) {
            _page.d3Form = form;
            _page.form.page = _page;
            _page.form.helpShow = true;
            _page.form.helpUid = 'Form=' + name;
            /*
            form.execScript("var hlpAct = createAction('getHelpInfo');\n" +
                "hlpAct.requestParams['form'] = 'System/get_help_info';\n" +
                "hlpAct.addSysInfoParam({put: 'helpurl', srctype: 'var', src: 'helpurl'});\n" +
                "hlpAct.addSysInfoParam({put: 'helpabspath', srctype: 'var', src: 'helpabspath'});\n" +
                "var _d = arguments[0];\n" +
                "hlpAct.execute(function(){_d.form.helpUrl = getVar('helpurl');_d.form.helpAbsPath = getVar('helpabspath');_d.form.showHelp();});\n"
                , [_page]);
             */
            _page.d3Form.DWindow = cont;
            _page.form.formCreate();
            cont.addListener('onclose', function () {
                funcCloseD3Form();
            }, null, false);
            cont.addListener('onresize', function () {
                D3Api.resize(true);
            }, null, false);
        };
        cont.getWinContent().D3FormCaption = {
            _setCaption: function (caption) {
                cont.setCaption(caption);
            },
            _setIcon: function () {
            },
            _show: function () {
            },
            _hide: function () {
            }
        }

        onshow = function (MainForm) {

            MainForm.setSizePos = function (onlySize, new_size) {
                if (new_size) {
                    data.width = new_size.width || data.width;
                    data.height = new_size.height || data.height;
                }

                var size = getDocumentSize();
                var pagesize = data.width || data.height;
                if (pagesize) {
                    var _hneed = false;
                    var _wneed = false;
                    if (data.width != 'auto' && (!data.width.indexOf || data.width.indexOf('%') == -1))
                        var l_Width = Math.min(data.width, size.width);
                    else {
                        var l_Width = data.width;
                        _wneed = true;
                    }
                    if (data.height != 'auto' && (!data.height.indexOf || data.height.indexOf('%') == -1))
                        var l_Height = Math.min(data.height, size.height);
                    else {
                        var l_Height = data.height;
                        _hneed = true;
                    }

                    cont.setSize(l_Width, l_Height);

                    if (_wneed || _hneed) {
                        cont.clearMaxSizeStyle();
                        var rws = getAbsoluteSize(cont.GetMainDOM());
                        l_Width = (_wneed) ? rws.width : l_Width;
                        l_Height = (_hneed) ? rws.height : l_Height;
                        pagesize = false;
                    }
                    if (!onlySize)
                        cont.setPosition(size.width / 2 - l_Width / 2, size.height / 2 - l_Height / 2);
                }
                MainForm.DOM.style.overflow = '';
                setDomSizeNoPx(MainForm.DOM, '', '100%');
                if (pagesize)
                    cont.clearMaxSizeStyle();
                var ws = getAbsoluteSize(cont.GetMainDOM());
                var s = getAbsoluteRect(MainForm.DOM);

                var dh = MainForm.DOM.scrollHeight - s.height;
                var dw = MainForm.DOM.scrollWidth - s.width;
                if (dw > 0) dw += 7;
                //if (dh > 0) dh+=2;
                cont.setSize(size.width, size.height);

                var l_Width = (_page.window_size && _page.window_size.width) || Math.min(ws.width + dw, size.width);
                var l_Height = (_page.window_size && _page.window_size.height) || Math.min(ws.height + dh, size.height);
                cont.clearMaxSizeStyle();
                cont.setSize(l_Width, l_Height);
                if (!onlySize)
                    cont.setPosition(size.width / 2 - l_Width / 2, size.height / 2 - l_Height / 2);
                MainForm.DOM.style.overflow = 'auto';

                cont.setVisible(true);
            }
            MainForm.setSizePos();
            D3Api.resize(true);
            if (window.SYS_Analytics) {
                SYS_Analytics.send(_page);
            }
        };
        SYS_lastPage = _page;
        addPage(_page);
    } else {
        SYS_pages = [];
        while (+SYS_pages_window.length) {
            closeWindow(null, getPage());
        }

        cont = new DDocument();
        incSYS_countShowState();
        _page = new DPage(name);
        //var _page=getPage();
        addPage(_page);
        SYS_lastPage = _page;
        var index = 0;
        while (index < SYS_pages.length) {
            if (SYS_pages[index] != _page) {
                SYS_pages.splice(index, 1);
            } else {
                index++;
            }
        }
        oncreate = function (form) {
            _page.d3Form = form;
            _page.form.page = _page;
            _page.form.helpShow = true;
            _page.form.helpUid = 'Form=' + name;
            /*
            form.execScript("var hlpAct = createAction('getHelpInfo');\n" +
                "hlpAct.requestParams['form'] = 'System/get_help_info';\n" +
                "hlpAct.addSysInfoParam({put: 'helpurl', srctype: 'var', src: 'helpurl'});\n" +
                "hlpAct.addSysInfoParam({put: 'helpabspath', srctype: 'var', src: 'helpabspath'});\n" +
                "var _d = arguments[0];\n" +
                "hlpAct.execute(function(){_d.form.helpUrl = getVar('helpurl');_d.form.helpAbsPath = getVar('helpabspath');_d.form.showHelp();});\n"
                , [_page]);
            _page.form.formCreate();
            */
        };
        onshow = function (MainForm) {

            MainForm.setSizePos = function () {
                setDomSizeNoPx(cont.GetMainDOM(), '', '');
                /*немодальное окно по умолчанию открыаем как 100%*/
                var hpx = data.height || MainForm.DOM.defaultHeight || '100%';

                if (hpx != 'auto' && (!hpx.indexOf || hpx.indexOf('%') == -1)) {
                    hpx = hpx + 'px';
                    setDomSizeNoPx(MainForm.DOM, '', hpx);
                } else {
                    if (hpx == '100%')
                        setDomSizeNoPx(cont.GetMainDOM(), '', '100%');
                    else
                        setDomSizeNoPx(cont.GetMainDOM(), '', '');
                    setDomSizeNoPx(MainForm.DOM, '', hpx);
                }

                cont.setVisible(true);
                runCalcSize(cont.GetMainDOM(), cont.GetMainDOM());
            }
            MainForm.setSizePos();
            D3Api.resize(true);
            if (window.SYS_Analytics) {
                SYS_Analytics.send(_page);
            }
            _page.dispatchEvent('onshow')
        };
        _page.reload = function () {
             var data = _page.form.data
             closeWindow(null, _page)
             var newPage = openD3Form(name, modal, data)
             newPage.form.data = data
        }
    }

    if (!data.oncreate) {
        data.oncreate = oncreate;
    } else if (data.oncreate instanceof Function) {
        data.oncreate = [data.oncreate, oncreate];
    } else if (data.oncreate instanceof Array) {
        data.oncreate.push(oncreate);
    }
    if (!data.onshow) {
        data.onshow = onshow;
    } else if (data.onshow instanceof Function) {
        data.onshow = [data.onshow, onshow];
    } else if (data.onshow instanceof Array) {
        data.onshow.push(onshow);
    }
    var onclose = function () {
        if (!_page.destroyed) {
            closeWindow(0, _page);
        }
    };
    if (!data.onclose) {
        data.onclose = onclose;
    } else if (data.onclose instanceof Function) {
        data.onclose = [onclose, data.onclose];
    } else if (data.onclose instanceof Array) {
        data.onclose.unshift(onclose);
    }
    cont.show();
    data.notthread = true;
    _page.addListener('onshow', function () {
        if (window.SYS_Analytics) {
            SYS_Analytics.send(_page);
        }
    });
    _page.addListener('onclose', function () {
        funcCloseD3Form();
        cont.close();
        if (window.SYS_Analytics) {
            SYS_Analytics.send((!_page.prevPage || Object.keys(_page.prevPage).length === 0) ? _page : _page.prevPage);
        }
    });
    D3Api.showForm(name, cont.getContainer(), data);

    return _page;
}
function savePrintLogs(iframe, type) {
    var reportWrapper = iframe.contentDocument.querySelector('[cmptype]');
    if (!isUndefined(reportWrapper) && reportWrapper != null && !isUndefined(reportWrapper.form)) {
        var get = reportWrapper.form.formVarsOpen;
        if (!empty(get['_REP_ID'])) {
            var reportId = get['_REP_ID'];
            delete get['_REP_ID'];
            /*
            requestServerModule(true, 'System/system&Module=savePrintLogs', {
                getArray: JSON.stringify(get),
                _REP_ID: reportId,
                _ACTION: type
            }, null, null, this, false, false);
            */
        }
    }
}
function showLegend(title, rows, width, height) {
    openD3Form("UniversalForms/legend", true, {vars: {title: title, rows: rows}, width: width, height: height});
}
function clearControl(/*ctrl1, ctrl2, ... , ctrlN*/) {
    var args, i, n,
        ctrl, cmptype, input;

    args = Array.prototype.slice.call(arguments);
    n = args.length;

    for (i = 0; i < n; i++) {
        ctrl = args[i];
        if (typeof ctrl === 'string') {
            ctrl = getControlByName(ctrl);
        }

        cmptype = getProperty(ctrl, 'cmptype', 'unknownControl');
        switch (cmptype) {
            case 'CheckBox':
                CheckBox_SetValue(ctrl, getProperty(ctrl, 'valueunchecked', ''));
                break;
            default:
                if (cmptype === 'ComboBox') {
                    if (empty(ctrl.options)) {
                        continue;
                    }
                }
                _setControlProperty(ctrl, 'value', '');
                if (SYS_ControlActions[cmptype] && SYS_ControlActions[cmptype]['caption']) {
                    _setControlProperty(ctrl, 'caption', '');
                }
        }

        /* fix для масок, навешанных событий */
        input = getDomBy(ctrl, 'input');
        if (input) {
            if (input.focus) {
                input.focus();
            }
            if (input.blur) {
                input.blur();
            }
        }
    }
}
function printLicInfo() {
    var lic_info_control = document.getElementById('sys_lic_info');
    if (!isObject(lic_info_control)) {
        showError('Не найден контейнер для информации о лицензии');
        return;
    }
    /*
    requestServerModule(false,
        'System/system',
        {Module: 'licinfo'},
        function (_licInfo) {
            var td = lic_info_control.parentNode;
            td.removeChild(lic_info_control);
            td.innerHTML = '<table id=sys_lic_info>' + _licInfo + '</table>' + td.innerHTML;
        },
        function () {
        }, null, false, false);
    */
}
function printNotify(selector) {
    if (!D3Api) {
        return;
    }
    var formNotify = 'System/notify';
    if(window.SYS_current_theme == 'new'){
        formNotify += '_new';
    }
    setTimeout(function () {
        var container = document.querySelector(selector);
        if (container && !container.D3Container) {
            D3Api.showForm(formNotify, container);
        }
    }, 100);
}

function getParentDomByName(dom, name) {
    var dom = dom;
    while (dom.getAttribute('name') != name) {
        if (dom.tagName.toLowerCase() == 'html')
            return false;
        dom = dom.parentNode;
    }
    return dom;
}

function mergeAllReportsIntoOneFrame(_rootDomObject) {
    var listOfReportFrames = _rootDomObject.querySelectorAll('iframe[name ^= "report"]');
    listOfReportFrames = [].map.call(listOfReportFrames, function (item) {
        return item.contentDocument.activeElement;
    });

    return function (isFinishedPrint) {
        if (!isFinishedPrint) {
            //для начала создадим отдельный div для отсальных отчетов и запихаем его в первый frame
            var div = document.createElement('div');
            div.className = 'other-report';
            listOfReportFrames[0].appendChild(div);

            var otherReportsBlock = listOfReportFrames[0].querySelector('.other-report');
            var reportsContent = '';
            for (var i = 1; i < listOfReportFrames.length; ++i) {
                reportsContent += "<span style='page-break-after: always;'></span>";
                reportsContent += listOfReportFrames[i].firstElementChild.outerHTML;
            }

            otherReportsBlock.innerHTML += reportsContent;
        } else {
            listOfReportFrames[0].getElementsByClassName('other-report')[0].remove();
        }
    }
}

function cacheFile() {
    var forms = {};
    var _callObjects = [];
    function calcFormHash(data) {
        return data.Form + '.' + MD5.hex_md5(D3Api.JSONstringify(data));
    }
    function openForm(){

        for(var j = 0;_callObjects.length - 1 >=  j;){
            if(forms[_callObjects[j].path].status != 'ready'){
                ++j;
                continue;
            }
            if(!empty(_callObjects[j].data)){
                for (var i in _callObjects[j].data) {
                    if (_callObjects[j].data.hasOwnProperty(i)) {
                        forms[_callObjects[j].path].onReadyObj[0].formData[i] = _callObjects[j].data[i];
                    }
                }
            }
            var hname = calcFormHash(forms[_callObjects[j].path].onReadyObj[0].formData.request);

            D3Api.Base.callEvent('onShowForm', _callObjects[j].path, _callObjects[j].dom, forms[_callObjects[j].path].onReadyObj[0].formData, hname);
            forms[_callObjects[j].path].onReadyObj[0].showDom = _callObjects[j].dom;
            forms[_callObjects[j].path].form = new D3Api.D3Form(_callObjects[j].path, forms[_callObjects[j].path].content);
            forms[_callObjects[j].path].form.callEvent('onload');

            var form = forms[_callObjects[j].path].form;
            for (var i = 0, c = forms[_callObjects[j].path].onReadyObj.length; i < c; i++) {
                if (i > 0) {
                    form = new D3Api.D3Form(_callObjects[j].path, forms[_callObjects[j].path].content);
                }
                form.show(forms[_callObjects[j].path].onReadyObj[i].formData, forms[_callObjects[j].path].onReadyObj[i].showDom);
            }
            _callObjects.splice(j, 1);
        }
    }
    this.set = function (_filePath,_callBack) {
        var data = {
            'request': {
                'Form': _filePath
            },
            '_contextForm_': undefined,
            '_currentContext_': null
        }
        var hname = calcFormHash(data.request);
        if((_filePath in forms)){
            if(typeof _callBack == 'function'){
                _callBack();
            }
            return false;
        }
        forms[_filePath] = {
            content: null,
            status: null,
            onReadyObj: [{
                formData: data
            }]
        }
        D3Api.requestServer({
            url: 'getform.php',
            method: 'POST',
            urlData: {
                'Form': _filePath
            },
            onSuccess: function (xml) {
                forms[_filePath]['status'] = 'ready';
                forms[_filePath]['content'] = xml;
                if(typeof _callBack == 'function'){
                    _callBack();
                }
            },
            onError: function () {},
            contextObj: {
                name: _filePath,
                hash: hname,
                thread: undefined
            },
            responseXml: false
        });
        return true;
    }
    this.open = function (_filePath, _dom, _data) {
        _callObjects.push({
            path: _filePath,
            dom: _dom,
            data: _data
        })
        this.set(_filePath,function(){

            openForm();
        });
    }
}

/* New theme */
function pagesReducer(state, action) {
  switch (action.type) {
    case '__INIT__':
      state = {
        pages: [],
        active: -1,
      }
      break
    case 'SET_ACTIVE':
      if (action.value) {
        movePages(
          SYS_pages_window.indexOf(action.value),
          SYS_pages_window.length - 1
        )
      }
      state.active = state.pages.indexOf(action.value)
      break
    case 'ADD':
      state.pages.push(action.value)
      if (!action.value.hasOwnProperty('modal') || !action.value.modal) {
        state.active = state.pages.length - 1
      }
      break
    case 'REMOVE':
      var index = state.pages.indexOf(action.value)
      if (!action.value.hasOwnProperty('modal') || !action.value.modal) {
        state.active = state.active === index ? -1 : index
      }
      state.pages.splice(index, 1)
      break
  }

  return state
}
function createPagesStore(pagesReducer, initialState) {
  var state = pagesReducer(initialState, { type: '__INIT__' })
  var subscribers = []

  return {
    dispatch(action) {
      state = pagesReducer(state, action)
      subscribers.forEach((sub) => sub(action.type))
    },
    subscribe(callback) {
      subscribers.push(callback)
    },
    getState() {
      return state
    },
    getActive() {
      return state.active >= 0 ? state.pages[state.active] : null
    },
  }
}
var SYS_pages_store = undefined
    SYS_pages_store = createPagesStore(pagesReducer, SYS_pages_window)

function getFormTheme() {
  var params =
    getPage().form.getFormSettings && getPage().form.getFormSettings('_WINDOW_')
  return params && params['theme']
}
function applyFormTheme(theme) {
  var page = this.page,
    d3form = page.d3Form;
  (d3form ? d3form.DOM : page.form.containerForm).setAttribute(
    'theme',
    theme || SYS_current_theme
  )
}
function changeFormTheme(theme) {
  var page = getPage(),
    form = page.form,
    d3form = getPage().d3Form,
    params = form.getFormSettings('_WINDOW_');
  (d3form ? d3form.DOM : form.containerForm).setAttribute(
    'theme',
    theme || SYS_current_theme
  )
  params['theme'] = theme
  form.saveFormSettings()
}

// принимает на вход инстанс Error и объект с данными для подсказки
function showScriptError(e, data = {}) {
    var lineNumber = e.lineNumber || (e.getLineNumber && e.getLineNumber()) || '';
    var columnNumber = e.columnNumber || (e.getColumnNumber && e.getColumnNumber()) || '';
    var helperInfo = data.formname ? 'На форме: ' + data.formname + '\n' : '';
    helperInfo += data.templates_code ? 'Код шаблона приема: ' + data.templates_code + '\n' : '';
    helperInfo += data.visit_tab ? 'Вкладка приема: ' + data.visit_tab + '\n' : '';
    helperInfo += data.container ? 'Контейнер вкладки приема: ' + data.container + '\n' : '';
    if (data.tabsheet) {
        var tabsheet_index = data.tabsheet.getAttribute('pageindex');
        var tabsheet_parent = data.tabsheet.closest('table');
        var tabsheet_ctrl = tabsheet_parent && tabsheet_parent.querySelectorAll('[cmptype="TabButton"]')[tabsheet_index - 1];
        var tabsheet_name = tabsheet_ctrl && tabsheet_ctrl.querySelector('.TabCenter').innerHTML;
        helperInfo += data.tabsheet ? 'Вкладка TabSheet: ' + tabsheet_name + ', "pageindex" вкладки:' + tabsheet_index + '\n' : '';
    }
    helperInfo += lineNumber ? 'Строка: ' + lineNumber + '\n' : '';
    helperInfo += columnNumber ? 'Столбец: ' + columnNumber + '\n' : '';
    showError('Ошибка' + '\n' + e.name +': ' + e.message + '\n' + helperInfo + 'При выполнении: ' + '\n' + data.script);
    console.error(e.stack || e.stacktrace || '');
};
function toggleHeader(_dom){
    toogleClass(_dom,'OpenHeader','CloseHeader');
    setGlobalVar('CloseHeader', D3Api.hasClass(_dom, 'CloseHeader'));
}