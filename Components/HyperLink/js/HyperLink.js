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
D3Api.controlsApi['HyperLink']['onclose']={get:D3Api.HyperLinkCtrl.getOnClose,set:D3Api.HyperLinkCtrl.setOnClose};