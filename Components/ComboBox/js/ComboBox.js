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

        var set_focus = D3Api.getProperty(_dom, 'focus', 'true');

        switch(mode)
        {
            //Скрываем записи, которые не подходят по фильтру
            case 'filter':
                    if(set_focus !== 'false') {
                        input.focus();
                        input.select();
                    }

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
