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




