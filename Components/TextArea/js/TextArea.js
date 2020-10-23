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
