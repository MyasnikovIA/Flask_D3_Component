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
