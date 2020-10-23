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
