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
