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
