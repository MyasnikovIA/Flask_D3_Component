function rememberWindowSize(_type){
    var d3frm = getPage().d3Form;
	if(empty(d3frm)){
        var d=getPage().getContainer().rememberSize(_type);
	} else {
        d3frm.DWindow.rememberSize(_type)
	}
}

function getWindowXml(_otladka){
	if(!_otladka || empty(document.getElementById('roleComposition').value) || empty(document.getElementById('roleShow').value)) _otladka=0;
	var s = '<div name="overlow" class="win_overlow"></div>' +
				'<table class="window WinContent" name="modal_win" style="left:0;top0; border-collapse: collapse; border-spacing: 2px;">' +
					'<tbody>' +
						'<tr >' +
							'<td class="WinContentLeftTop" style=" display: table-cell;vertical-align: inherit; padding: 0; "></td>' +
							'<td class="WinContentTop" style=" display: table-cell;vertical-align: inherit; padding: 0; "></td>' +
							'<td class="WinContentRightTop" style=" display: table-cell;vertical-align: inherit; padding: 0; "></td>' +
						'</tr>' +
	      				'<tr name="header" class="headerTitle">' +
							'<td class="WinContentLeft" style=" display: table-cell;vertical-align: inherit; padding: 0; "></td>' +
							'<td style=" display: table-cell;vertical-align: inherit; padding: 0; ">' +
								'<div class="headerContainer"> ' +
									  '<div class="WinTitle Title" name="label" draggable="false"></div>' +
									  '<div class="win_btn_container">' +
									  		'<!--img name="loader" class="w-loading" src="Images/WIN_s.gif" onclick="abortLoading();"/-->' +
									 		'<div name="infoButton" class="win_info">' +
									    		'<svg id="icon-info" viewBox="-4 -4 28 28">' +
									      		'<title>Структура файла</title>' +
									     		'<path d="M12.432 0c1.34 0 2.010 0.912 2.010 1.957 0 1.305-1.164 2.512-2.679 ' +
														 '2.512-1.269 0-2.009-0.75-1.974-1.99 0-1.043 0.881-2.479 ' +
														 '2.643-2.479zM8.309 20c-1.058 0-1.833-0.652-1.093-3.524l1.214-5.092c0.211-0.814 ' +
														 '0.246-1.141 0-1.141-0.317 0-1.689 0.562-2.502 1.117l-0.528-0.88c2.572-2.186 ' +
													     '5.531-3.467 6.801-3.467 1.057 0 1.233 1.273 0.705 3.23l-1.391 5.352c-0.246' +
														 ' 0.945-0.141 1.271 0.106 1.271 0.317 0 1.357-0.392 2.379-1.207l0.6 0.814c-2.502' +
											             ' 2.547-5.235 3.527-6.291 3.527z"></path>' +
									    		'</svg>' +
									 		'</div>' +
		                                    '<div name="helpButton" class="win_help" title="Справка"></div>' +
										    '<div name="rememberWinSize" ' +
											     'class="win_remembersize" ' +
											     'onclick="rememberWindowSize(event);" ' +
											     'title="Запомнить новый размер окна"></div>' +
						                    '<div name="maximizedButton" class="window-control win_maximize"></div>' +
										    '<div name="closeButton" class="window-control win_close"></div>' +
			                        '</div>' +
								'</div>' +
		                    '</td>' +
							'<td class="WinContentRight">' +
							'</td>' +
						'</tr>' +
					    '<tr>' +
							'<td class="WinContentLeft" name="w_middle" style=" display: table-cell;vertical-align: inherit; padding: 0; "></td>' +
		                    '<td class="BodyContent" style="vertical-align: top; display: table-cell;vertical-align: inherit; padding: 0; ">' +
								'<div name="win_content" style="-webkit-box-sizing: border-box;"></div>' +
							'</td>' +
		                    '<td class="WinContentRight" name="e_middle" style="cursor:e-resize;display: table-cell;vertical-align: inherit; padding: 0; "></td>' +
						'</tr>' +
						'<tr>' +
							'<td class="WinContentLeftBottom" name="sw_bottom" style=" display: table-cell;vertical-align: inherit; padding: 0; "></td>' +
							'<td class="WinContentBottom" name="s_bottom" style=" display: table-cell;vertical-align: inherit; padding: 0; "></td>' +
							'<td class="WinContentRightBottom" name="sizer" style=" display: table-cell;vertical-align: inherit; padding: 0; "></td>' +
						'</tr>' +
				    '</tbody>' +
		        '</table>';
	return s;
}
//class DWindow
function DWindow(_otladka){
	DListener.call(this);
	//contatants
	if(!_otladka) _otladka=0;
	this.IsComposition = false;
	var h_header = 0; //высота заголовка окна
	var h_statusbar = 0; //высота статусной строки окна
	var w_content = 0; //ширина рамки основного контейнера
	var close_type = 0;
	var modal_win, header, label, loader, maximizedbutton, closebutton, helpbutton, win_content, sw_bottom, s_bottom, /*statusbar,*/ sizer,w_middle,e_middle;
	//убрано reloadbutton,  т.к. сбивает Listener'ы с модальных окон
	this.setCaption=function (_caption){
		label.innerHTML=_caption;
	}
	this.getCaption=function (_caption){
		return label.innerHTML;
	}
	this.setConfirmOnClose=function(_type){
		if(_type == 1) close_type = 1;
	}
        this.setMaxSizeStyle = function(){
            addClass(modal_win,'window_max_size');
        }
        this.clearMaxSizeStyle = function(){
            removeClass(modal_win,'window_max_size');
        }
	var CloseButtonOnClick=function(){
		if(close_type == 1)
		{
			if(!confirm('Закрыть окно без сохранения данных?')) return;
		}
		removeEvent(document, 'keydown',docEscPushEvent);
        	this.dispatchEvent('onclose');
    	}
	var EscapeButtonOnClick=function()
	{
		removeEvent(document, 'keydown',docEscPushEvent);
		closeWindow();	
	}
    var body;
    this.getWinContent = function()
	{
		return win_content;
	}
	this.GetMainDOM = function()
	{
		return modal_win;
	}	
	this.parse=function (_dom){
		if(hasProperty(_dom,'name')){
			eval(quickGetProperty(_dom,'name').toLowerCase()+'=_dom;');
		}
		for(var index=0;index<_dom.childNodes.length;index++){
			this.parse(_dom.childNodes[index]);
		}
	}
	var left=0;var top=0;
	this.setPosition=function (_left,_top){_left=Math.max(_left,0);_top=Math.max(_top,0);_setPosition.call(this,_left,_top);left=_left;top=_top;}
	var _setPosition=function (_left,_top){setDomPos(modal_win,_left,_top);}
        this.setCenterPosition = function()
        {
            var size = getDocumentSize();
            var w = getAbsoluteClientRect(modal_win);
            this.setPosition(size.width / 2 - w.width / 2, size.height / 2 - w.height / 2);
        }
	this.minWidth=250;this.minHeight=100;
	var width=this.minWidth;var height=this.minHeight;
        this.size = {width: width, height: height};
	this.setSize=function (_width,_height){
		_setSize.call(this,_width,_height);
	}
	var _setSize=function (_width,_height){
		if (_width == null)
                    _width = this.size.width;
                if (_height == null)
                    _height = this.size.height;
                var wpx = _width, hpx = _height, wpx_c = _width,hpx_c = _height;
                if (_width != 'auto' && (!_width.indexOf || _width.indexOf('%') == -1))
                {
                    _width=Math.max(_width,this.minWidth);		
                    wpx = _width+'px';
                    wpx_c = (_width-20)+'px';
                }
                if (_height != 'auto' && (!_height.indexOf || _height.indexOf('%') == -1))
                {
                    _height=Math.max(_height,this.minHeight);
                    hpx = _height+'px';
                    hpx_c = (_height-47)+'px';
                }
                this.size.width = _width;
                this.size.height = _height;
                
		setDomSizeNoPx(modal_win,wpx,hpx);
                setDomSizeNoPx(win_content,wpx_c,hpx_c);
                runCalcSize(modal_win,modal_win);
                this.dispatchEvent('onresize');
	}
	var container=document.createElement('div');
	var docMoveEvent, docUpEvent, docResizeEvent, docResizeUpEvent, docEscPushEvent;
	var oldLeft=new Number(0);
	var oldTop=new Number(0);
	var captureX=new Number(0);
	var captureY=new Number(0);
	var _setDragOnMouseDown=function (evt){
		var pos=getAbsolutePos(modal_win);
		oldLeft=pos.x;oldTop=pos.y;
		captureX=evt.pageX||evt.x;captureY=evt.pageY||evt.y;
		var _windowObject=this;
		this._removeDocEvent();
                addClass(document.body,'noselect');
                addClass(modal_win,'noselect');
		addEvent(document,'mousemove',docMoveEvent=function (e){_windowObject._onMove(e||window.event);});
		addEvent(document,'mouseup',docUpEvent=function (e){_windowObject._onMouseUp(e||window.event);});
	}
	this._onMove=function (evt){this.setPosition(oldLeft-captureX+parseInt(evt.pageX||evt.x),oldTop-captureY+parseInt(evt.pageY||evt.y));}
	this._onMouseUp=function (){this._removeDocEvent();}
	this._removeDocEvent=function (){
		if(docMoveEvent && docUpEvent){
                        removeClass(document.body,'noselect');
                        removeClass(modal_win,'noselect');
			removeEvent(document,'mousemove',docMoveEvent);
			removeEvent(document,'mouseup',docUpEvent);
		}
	}
	this.fixedSize=false;
	var maximized=false;
	var _setMaximaizeOnDblClick=function (){
		if(this.fixedSize)return;
		var _h,_w;
		if(maximized){
			this.setPosition(left,top);
			this.setSize(width,height);			
			_w = width;
			_h = height;
		}else{
			this.rec = getAbsoluteRect(modal_win);
			width=Math.max(this.rec.width,this.minWidth);
			height=Math.max(this.rec.height,this.minHeight);
			var docSize=getDocumentSize();
			_setPosition.call(this,0,0);
			_setSize.call(this,docSize.width,docSize.height);		
			_w = docSize.width;
			_h = docSize.height;
		}
		maximized=!maximized;
	}
	this._getDistance=function (e)
	{
		var _windowObject=this;
		var _w = _windowObject.rec.width, _h = _windowObject.rec.height;
		if(!this.type) this.type = 'se';
		if(this.type== 'se' || this.type == 'e')_w = Math.max(_windowObject.rec.width+(e.clientX - this.mX),this.minWidth);
		if(this.type== 'se' || this.type == 's') _h = Math.max(_windowObject.rec.height+(e.clientY - this.mY),this.minHeight);
		_setSize.call(this,_w,_h);
	}
	var _setResizeOnMouseDown=function (e)
	{
		var _windowObject=this;
		if(_windowObject.fixedSize)return;
		_windowObject.mX = e.clientX;
		_windowObject.mY = e.clientY;
		_windowObject.rec = getAbsoluteRect(modal_win);
		_windowObject._stopDistance();
                addClass(document.body,'noselect');
                addClass(modal_win,'noselect');
		addEvent(document,'mousemove',docResizeEvent=function (e){_windowObject._getDistance(e||window.event);});
		addEvent(document,'mouseup',docResizeUpEvent=function (e){maximized=false;_windowObject._stopDistance();});
	}
	this._stopDistance = function()
	{
		if(docResizeEvent && docResizeUpEvent){
                        removeClass(document.body,'noselect');
                        removeClass(modal_win,'noselect');
			removeEvent(document,'mousemove',docResizeEvent);
			removeEvent(document,'mouseup',docResizeUpEvent);
		}
	}
	this.Loading=function (_loading){
		/*if(_loading)statusbar.innerHTML = "Подождите идет загрузка... ";
		else statusbar.innerHTML = "";*/
		setDomVisible(loader,_loading);
	}
	this.getContainer=function (){
		return win_content;
	}
	var ReloadButtonOnClick=function (){
		this.dispatchEvent('onreload');
		getPage().form.FilterItems=new Array();
	}
	this.init=function (){
		container.innerHTML=getWindowXml(_otladka);this.parse(container);
		//events
		var _windowObject=this;
        this.setVisible(false);
		//addEvent(document,'keydown', docEscPushEvent=function(e){if(e.keyCode == 27 || window.event == 27) EscapeButtonOnClick.call(_windowObject);}); обработка клавиши Esc
           // Будет работать пока не повесят новый keydown на document
            document.onkeydown = function(e) {
                if(e.keyCode == 27 || window.event == 27) {
                    var close_but = document.querySelectorAll('[name=closeButton]');
                    var len_win_close = close_but.length;
                    if (len_win_close != 0) close_but[len_win_close-1].click();
                    stopEvent(e);
                }
            };
       setDomVisible(helpbutton, false);
		infobutton.onclick = openInfoWindow;
		infobutton.style.display = "none";

		closebutton.onclick=function (e){CloseButtonOnClick.call(_windowObject);}
		header.onmousedown=function (e){_setDragOnMouseDown.call(_windowObject,e||window.event);}
		header.ondblclick=function (e){_setMaximaizeOnDblClick.call(_windowObject,e||window.event);};
		
		sw_bottom.onmousedown=function (e){_windowObject.type='s';_setResizeOnMouseDown.call(_windowObject,e||window.event);}
		s_bottom.onmousedown=function (e){_windowObject.type='s';_setResizeOnMouseDown.call(_windowObject,e||window.event);}
		w_middle.onmousedown=header.onmousedown;w_middle.ondblclick=header.ondblclick;
		e_middle.onmousedown=function (e){_windowObject.type='e';_setResizeOnMouseDown.call(_windowObject,e||window.event);};
		
		sizer.onmousedown=function (e){_windowObject.type='se';_setResizeOnMouseDown.call(_windowObject,e||window.event);}
		maximizedbutton.onclick=header.ondblclick;
		//reloadbutton.onclick=function (e){ReloadButtonOnClick.call(_windowObject);} т.к. сбивает Listener'ы с модальных окон
                this.setMaxSizeStyle();

		if (window.debugUrlParam) {
			infobutton.style.display = '';
		};
    }
	var isShowing=false;
	this.show=function (){
		var _div=document.createElement('div');
		document.body.appendChild(_div);
		var size=getAbsolutePos(_div);
		document.body.removeChild(_div);

		document.body.appendChild(container);
	}
	this.hide=function (){
            removeDomObject(container);
        }
        this.setVisible = function(v)
        {
            if(v)
            {
                removeClass(modal_win,'hidden');
                addClass(modal_win,'showed');
            }else
            {
                removeClass(modal_win,'showed');
                addClass(modal_win,'hidden');
            }
        }
	//call
	this.init();
	this.close=function (){
		this.hide();
	}
	this.refresh=function (){
		body.align='left';setTimeout(function (){body.align='';},0);
	}
	//Для отладки:
	this.rememberSize = function(event)
	{
            var f = getPage().form;
            if(!f.canSaveFormSettings())
            {
                alert('Окно не поддерживает сохранение размера.');
                return false;
            }    
            var ws = getAbsoluteSize(modal_win);

            if(f.isComposition)
            {
            	executeAction(getVar('ComponentName')+'_comp_rights', function()
            	{
            		if(getVar('Composition_UPD_RIGHT') == 1)
            		{
	            		executeAction(getVar('ComponentName')+'_comp_select', function()
		                {
		                    setVar('Composition_WIDTH',ws.width);
		                    setVar('Composition_HEIGHT',ws.height);
		                    executeAction(getVar('ComponentName')+'_comp_update');
		                });
	            	}
            	});
            }
                var wSt = f.getFormSettings('_WINDOW_');

                if (event.shiftKey && confirm("Сбросить сохраненные настройки окна?"))
                {
                    f.deleteFormSettings('_WINDOW_');
                    return;
                }
                var ws = getAbsoluteSize(modal_win);
                wSt['width'] = ws.width;
                wSt['height'] = ws.height;
	}
        this.showHelpEvent = function(ev)
        {
            setDomVisible(helpbutton, true);
            helpbutton.onclick = ev;
        }
}
function DOracleErrorWindow(_error) {
	this.sqlSeparator = '\nSQL:';
	this.plSqlSeparator = '\nPL/SQL:';
	this.offsetSeparator = 'OFFSET:';
	this.paramsSeparator = 'PARAMS:';
    this.soapSeparator = 'SoapFault';

    this.getErrorParts = function() {
        var page = getPage(),
			form = page.d3Form ? page.d3Form.name : getPage().form.name;

        if (typeof(_error) != 'string') {
        	var defaultCaption = 'Неизвестная ошибка.';

            return {
                textError: defaultCaption,
                sqlError: null,
                paramsError: null,
                msgError: defaultCaption + '\nНа форме ' + form
			}
        }
        var separatorIndex = _error.indexOf(this.sqlSeparator),
			sqlSeparatorIndex = separatorIndex === -1 ? _error.indexOf(this.plSqlSeparator) : separatorIndex,
        	offsetSeparatorIndex = _error.indexOf(this.offsetSeparator),
        	paramsSeparatorIndex = _error.indexOf(this.paramsSeparator),
            soapSeparatorIndex = _error.indexOf(this.soapSeparator);

        var textError = sqlSeparatorIndex != -1 ? _error.substring(sqlSeparatorIndex, 0) : '';
        if(soapSeparatorIndex != -1) {
            var soapRegExpMatch = _error.replace(/[\n\r]+/g, ' ').match(/SoapFault exception: (.+)\sin\s.*Stack trace/);
            if(soapRegExpMatch && soapRegExpMatch[1]) {
                textError += soapRegExpMatch[1];
            }
        }
        var exceptionRegExpMatch = _error.match(/^(?:.*:\s*)*(?:(?:ORA|PLS|ОШИБКА|ERROR)(?:-\d{1,5}:|:)\ )\s*([^\r\n]+)(?:[\r\n]|ORA)?/);
        if (exceptionRegExpMatch && exceptionRegExpMatch[1]) {
            textError = exceptionRegExpMatch[1];
		}
        if(!textError) {
            textError += _error.slice(0, paramsSeparatorIndex);
        }
        return {
            textError: textError,
            sqlError: _error.substring(
            	sqlSeparatorIndex + (separatorIndex === -1 ? 8 : 5),
				offsetSeparatorIndex === -1 ? undefined : offsetSeparatorIndex
			),
            paramsError: _error.substring(paramsSeparatorIndex + 7),
            msgError: _error + '\nНа форме ' + form
		}
    }
    this.show = function() {
        return openWindow({ name: 'Error/OracleErrorWindow', vars: this.getErrorParts() }, true);
    }
}
function getErrorWindowBodyXML() {
    return '<table style="width:100%;height:100%;" cellpadding="5" cellspacing="5" border="0"><tbody><tr><td valign="top" style="height:200px;"><textarea style="padding:0px 0px 0px 0px;width:100%;height:100%;" readOnly="true" name="errorMemo"></textarea></td></tr><tr><td align="center"><input type="Button" value="Создать задачу" style="display:none;" name="crtaskbutton"/><input type="Button" value="OK" name="closebutton"/></td></tr></tbody></table>'
}
function DErrorWindow(_error) {
	var win = new DWindow(),
		errormemo,
		closebutton,
		crtaskbutton;

	this.createTask = function() {
		requestServerModule(
            false,
			'System/system',
			{
			    Module: 'userenv'
            },
			function(userEnv) {
				var url = getConfigValue('taskTracker/url'),
                    windowCaption = encodeURIComponent(getWindowCaption(0)),
                    result = _error.substring(0, 2000) + (_error.length > 2000 ? '...' : '');

                url = url + '?issue[subject]=Ошибка на форме' + (windowCaption ? ' "' + windowCaption + '"' : '')
                      + '&issue[status_id]=7'
                      + '&issue[category_id]=321'
                      + '&issue[custom_field_values][1]=Ошибка'
					  + '&issue[description]='
					  + encodeURIComponent(
					      userEnv
					      + '\nМесто вызова: '
					      + '\nОжидаемый результат: '
					      + '\nДействительный результат: {{collapse()\n<pre>' + result + '</pre>\n}}'
					  );

                window.open(url);
			},
			function() {},
			null,
            false,
            false
        );
	}
	this.parse = function(_dom) {
		if (hasProperty(_dom, 'name')) {
			eval(quickGetProperty(_dom,'name').toLowerCase() + '=_dom;');
		}

		for (var index = 0; index < _dom.childNodes.length; index++) {
			this.parse(_dom.childNodes[index]);
		}
	}
	this.show = function() {
		win.setSize(400, 280);
		win.fixedSize = true;
		win.setCaption('Информация');
		win.addListener('onclose', function (){ win.close(); }, this, false);
		win.getContainer().innerHTML=getErrorWindowBodyXML();
		win.show();
		this.parse(win.getContainer());
		closebutton.focus();

		closebutton.onclick = function() {
            win.dispatchEvent('onclose');
            win.close();
        }

		if (getConfigValue('taskTracker/url')) {
			crtaskbutton.onclick = this.createTask;
			crtaskbutton.style.display='inline-block';
		}

		errormemo.value=_error;
        win.setVisible(true);
        win.setCenterPosition();
        return win;
	}
}
//<input type="button" name="saveerrbutton"/>
/*
function getOracleErrorWindowBodyXML(){return '<table width="100%" style="height:100%"><tr><td style="padding:20px 20px 20px 20px;height:50px;width:100%;"><div name="caption" style="overflow:auto;height:50px;width:100%;"></div></td></tr><tr><td align="right" style="padding:5px 5px 5px 5px;" valign="top"><input type="button" name="saveerrbutton"/><input type="button" name="viewdetailbutton"/><input type="button" name="gobutton" value="Продолжить"/></td></tr><tr name="errormemocontainer" style="display:none;height:180px;"><td valign="top" style="height:180px;"><textarea readonly="true" name="errormemo" style="height:180px;width:480px"></textarea></td></tr></table>';}
function DOracleErrorWindow(_error){
	var win=new DWindow();
	var errormemo;
	var viewdetailbutton;
	var saveerr;
	var gobutton;
	var caption;
	var errormemocontainer;
	this.SQLErrStr;
	this.ParamsErrStr;
	this.parse=function (_dom){if(hasProperty(_dom,'name')){eval(quickGetProperty(_dom,'name').toLowerCase()+'=_dom;');}for(var index=0;index<_dom.childNodes.length;index++){this.parse(_dom.childNodes[index]);}}
	this.Separator='ORA-20103:';
	this.SQLSeparator='\nSQL:';
	this.OFFSETSeparator='OFFSET:';
	this.ParamsSeparator='PARAMS:';
	this.getErrorString=function (_oraMessage){
		        var _caption='Неизвестная ошибка.';
				if(typeof(_oraMessage)!='string') return _caption;
				var Strings=_oraMessage.split('\n');
		        var index=new Number();
		        var len=new Number(Strings.length);
		        var pos=new Number();
		        for(index=0;index<len;index++){
		            pos=Strings[index].indexOf(this.Separator);
		            if(pos!=-1){
		            	_caption=Strings[index].substring(pos+this.Separator.length);
		            }
		        }
		        return _caption;
	}
	this.getSQLErrorString=function (_oraMessage)
	{
		var _SQLString = 'null';
		if(typeof(_oraMessage)!='string') return _SQLString;
		var _startStr = _oraMessage.indexOf(this.SQLSeparator) + 5;
		var _endStr   = _oraMessage.indexOf(this.OFFSETSeparator);
		_SQLString    = _oraMessage.substring(_startStr, _endStr);
		return _SQLString;
	}
	this.getParamsErrorString=function (_oraMessage)
	{
		var _ParamsString = 'null';
		if(typeof(_oraMessage)!='string') return _SQLString;
		var _startStr = _oraMessage.indexOf(this.ParamsSeparator) + 7;
		_ParamsString    = _oraMessage.substring(_startStr);
		return _ParamsString;
	}
	var isShowDetail=false;
	this.ViewDetail=function (){
		if(isShowDetail){
			errormemocontainer.style.display='none';
			viewdetailbutton.value='Подробнее';
			win.setSize(530,160);
		}else{
			errormemocontainer.style.display='';
			viewdetailbutton.value='Скрыть';
			win.setSize(530,400);
		}
		isShowDetail=!isShowDetail;
	}
	this.SaveErr = function()
	{
		this.SQLErrStr = this.getSQLErrorString(_error);
		this.ParamsErrStr = this.getParamsErrorString(_error);
		setVar('msgError', errormemo.value);
		setVar('sqlError', this.SQLErrStr);
		setVar('paramsError', this.ParamsErrStr);
		setVar('textError', caption.innerHTML);
		executeAction('saveErrorToDB', null,null,null,true,0);
	}
	this.show=function (){
		win.setSize(500,160);
		win.fixedSize=true;
		win.setCaption('Ошибка сервера');
		win.addListener('onclose',function (){win.close();},this,false);
		win.getContainer().innerHTML=getOracleErrorWindowBodyXML();
		win.show();
		this.parse(win.getContainer());
		caption.innerHTML=this.getErrorString(_error);
		gobutton.onclick=function (){win.close();}
		var _objectWindow=this;
		saveerrbutton.value='Сохранить';
		saveerrbutton.onclick=function (){_objectWindow.SaveErr();}
		viewdetailbutton.value='Подробнее';
		viewdetailbutton.onclick=function (){_objectWindow.ViewDetail();}
		if(typeof(_error)!='string') _error='Неизвестная ошибка';
		_error = _error.replace(/<br\/>/g, '\n');
		errormemo.value=_error+"\nНа форме "+getPage().form.name;
	}
}*/
function getConfirmWindowBodyXML(){return '<table style="width:100%;height:100%;" class="form-table" cellpadding="5" cellspacing="5" border="0"><tbody><tr><td valign="top" colspan="2"><span name="alerttext"></span></td></tr><tr><td><input type="Button" value="OK" name="okbutton"/></td><td><input type="Button" value="Отмена" name="closebutton"/></td></tr></tbody></table>'};
function DConfirmWindow(_alert,_okfunction,_cancelfunction){
	var win=new DWindow();
	var closebutton;
	var alerttext;
	var okbutton;
	this.parse=function (_dom){if(hasProperty(_dom,'name')){eval(quickGetProperty(_dom,'name').toLowerCase()+'=_dom;');}for(var index=0;index<_dom.childNodes.length;index++){this.parse(_dom.childNodes[index]);}}
	this.show=function (){
		win.setSize(280,160);
		win.fixedSize=true;
		//win.setCaption('');
		win.addListener('onclose',function (){win.close();},this,false);
		win.getContainer().innerHTML=getConfirmWindowBodyXML();
		win.show();
		this.parse(win.getContainer());
		closebutton.onclick = function (){if(_cancelfunction!=false){_cancelfunction.call(this);}win.close();}
		okbutton.onclick    = function (){if(_okfunction!=false){_okfunction.call(this);}win.close();}
		alerttext.innerHTML = _alert;
                win.setVisible(true);
                win.setCenterPosition();
	}
}

function getAlertWindowBodyXML(){return '<table style="width:100%;height:100%;" cellpadding="5" cellspacing="5" border="0"><tbody><tr><td valign="top"><span name="alerttext"></span></td></tr><tr><td align="center"><input type="Button" value="OK" name="okbutton"/></td></tr></tbody></table>'};
function DAlertWindow(_message,_okfunction,_object){
	var win=new DWindow();
	var alerttext;
	var okbutton;
	this.parse=function (_dom){if(hasProperty(_dom,'name')){eval(quickGetProperty(_dom,'name').toLowerCase()+'=_dom;');}for(var index=0;index<_dom.childNodes.length;index++){this.parse(_dom.childNodes[index]);}}
	this.show=function (){
		win.setSize(280,160);
		win.fixedSize=true;
		//win.setCaption('');
		win.addListener('onclose',function (){win.close();},this,false);
		win.getContainer().innerHTML=getAlertWindowBodyXML();
		win.show();
		this.parse(win.getContainer());
		okbutton.onclick    = function (){win.close();win.dispatchEvent('onclose');}
		alerttext.innerHTML = _message;
                win.setVisible(true);
                win.setCenterPosition();
		if(_okfunction)
			win.addListener('onclose',_okfunction,_object,false);
	}
}

//----------------------------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------------------------


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


function DDocument(dom) {
    /*
        <div id="D3MainContainer" class="D3MainContainer">
            <div class="slider hidden" style="width:400px;position:absolute;right:0;top:55px;z-index: 100;">
        </div>
    */
    var body = (dom) ? dom : document.getElementById('D3MainContainer');
    var maindom = (dom) ? dom : document.getElementById('D3MainContainer');
    var loadingIndicate = (dom) ? (document.getElementById('_mainIndicateLoader') || {style: {}}) : {style: {}};
    var title = (dom) ? false : document.getElementById('_titleContainer');
    this.GetMainDOM = function () {
            return maindom;
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



