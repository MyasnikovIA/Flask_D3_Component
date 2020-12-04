function rememberWindowSize(_type) {
    let d3frm = getPage().d3Form;

    if (!d3frm) {
        getPage().getContainer().rememberSize(_type);
    } else {
        d3frm.DWindow.rememberSize(_type);
    }
}
function getWindowXml() {
    let window = '<div name="overlow" class="win_overlow"></div>';
	window += '<div class="window" name="modal_win">' +
        '<div name="header" class="window__header">' +
            '<div class="window__title" name="label" draggable="false"></div>' +
            '<div class="window__buttons">' +
                '<div class="button more" name="moreButton"></div>' +
                '<div class="button maximize" name="maximizedButton"></div>' +
                '<div class="button close" name="closeButton"></div>' +
            '</div>' +
        '</div>' +
        '<div class="window__body" name="win_content"></div>' +
        '<div class="window__settings" name="settings">' +
            '<div class="line">' +
                '<label name="changeThemeButton" class="toggler">' +
                    '<input class="toggler__input" type="checkbox">' +
                    '<span class="toggler__label">Старая тема окна</span>' +
                '</label>' +
            '</div>' +
            '<div class="line">' +
                '<div class="link" onclick="rememberWindowSize(event);">Сохранить размеры окна</div>' +
            '</div>' +
        '</div>' +
        '<div name="s_bottom" class="window__resizer bottom"></div>' +
        '<div name="e_middle" class="window__resizer right"></div>' +
        '<div name="sizer" class="window__resizer bottom-right"></div>' +
        '<div name="helpButton" style="display: none;"></div>' +
        '<div name="infoButton" style="display: none;">' +
    '</div>';

    return window;
}
function DWindow(_otladka) {
    DListener.call(this);
    if (!_otladka) _otladka = 0;
    this.IsComposition = false;

    var h_header = 0; //высота заголовка окна
    var h_statusbar = 0; //высота статусной строки окна
    var w_content = 0; //ширина рамки основного контейнера
    var close_type = 0;

    var modal_win,
		header,
		label,
		loader,
		maximizedbutton,
		closebutton,
		helpbutton,
		win_content,
		sw_bottom,
		s_bottom,
        sizer,
		w_middle,
		e_middle,
        morebutton,
        settings,
        changethemebutton;

    this.setCaption = function(_caption) {
        label.innerHTML = _caption;
    }
    this.getCaption = function(_caption) {
        return label.innerHTML;
    }
    this.setConfirmOnClose = function(_type) {
        if (_type == 1) close_type = 1;
    }
    this.setMaxSizeStyle = function() {
        addClass(modal_win, 'window_max_size');
    }
    this.clearMaxSizeStyle = function() {
        removeClass(modal_win, 'window_max_size');
    }
    var CloseButtonOnClick = function() {
        if (close_type == 1) {
            if (!confirm('Закрыть окно без сохранения данных?')) return;
        }
        removeEvent(document, 'keydown', docEscPushEvent);
        this.dispatchEvent('onclose');
    }
    var EscapeButtonOnClick = function() {
        removeEvent(document, 'keydown', docEscPushEvent);
        closeWindow();
    }
    var body;
    this.getWinContent = function() {
        return win_content;
    }
	this.GetMainDOM = function() {
        return modal_win;
    }
    this.parse = function(_dom) {
        if (hasProperty(_dom, 'name') && quickGetProperty(_dom, 'name')) {
            eval(quickGetProperty(_dom, 'name').toLowerCase() + '=_dom;');
        }

        for (var index = 0; index < _dom.childNodes.length; index++) {
            this.parse(_dom.childNodes[index]);
        }
    };

    var left = 0;
    var top = 0;
    this.setPosition = function(_left, _top) {
        _left = Math.max(_left, 0);
        _top = Math.max(_top, 0);
        _setPosition.call(this, _left, _top);
        left = _left;
        top = _top;
    }
    var _setPosition = function(_left, _top) {
        setDomPos(modal_win, _left, _top);
    }
    this.setCenterPosition = function() {
        var size = getDocumentSize();
        var w = getAbsoluteClientRect(modal_win);
        this.setPosition(size.width / 2 - w.width / 2, size.height / 2 - w.height / 2);
    }
    this.minWidth = 250;
    this.minHeight = 100;
    var width = this.minWidth;
    var height = this.minHeight;
    this.size = {width: width, height: height};
    this.setSize = function(_width, _height) {
        _setSize.call(this, _width, _height);
    };
    var _setSize = function (_width, _height) {
        if (_width == null)  _width = this.size.width;
        if (_height == null) _height = this.size.height;

        var wpx = _width,
            hpx = _height,
            wpx_c = _width,
            hpx_c = _height;

        if (_width != 'auto' && (!_width.indexOf || _width.indexOf('%') == -1)) {
            _width=Math.max(_width, this.minWidth);
            wpx = _width + 'px';
            wpx_c = (_width - 20) + 'px';
        }

        if (_height != 'auto' && (!_height.indexOf || _height.indexOf('%') == -1)) {
            _height = Math.max(_height, this.minHeight);
            hpx = _height + 'px';
            hpx_c = (_height - 47) + 'px';
        }

        this.size.width = _width;
        this.size.height = _height;

        setDomSizeNoPx(modal_win, wpx, hpx);
        //setDomSizeNoPx(win_content, wpx_c, hpx_c);
        runCalcSize(modal_win, modal_win);
        this.dispatchEvent('onresize');
    };
    var container = document.createElement('div');
    var docMoveEvent, docUpEvent, docResizeEvent, docResizeUpEvent, docEscPushEvent;
    var oldLeft = new Number(0);
    var oldTop = new Number(0);
    var captureX = new Number(0);
    var captureY = new Number(0);
    var _setDragOnMouseDown = function(e) {
        if (e.target.classList.contains('button')) {
            return;
        }

        var pos = getAbsolutePos(modal_win);
        oldLeft = pos.x;
        oldTop = pos.y;
        captureX = e.pageX || e.x;
        captureY = e.pageY || e.y;
        var _windowObject = this;
        this._removeDocEvent();
        addClass(document.body, 'noselect');
        addClass(modal_win, 'noselect');
        addEvent(document, 'mousemove', docMoveEvent = function(e) {
            _windowObject._onMove(e || window.event);
        });
        addEvent(document, 'mouseup', docUpEvent = function(e) {
            _windowObject._onMouseUp(e || window.event);
        });
    }
    this._onMove = function(evt) {
        this.setPosition(oldLeft - captureX + parseInt(evt.pageX || evt.x), oldTop - captureY + parseInt(evt.pageY || evt.y));
    }
    this._onMouseUp = function() {
        this._removeDocEvent();
    }
    this._removeDocEvent = function() {
        if (docMoveEvent && docUpEvent) {
            removeClass(document.body, 'noselect');
            removeClass(modal_win, 'noselect');
            removeEvent(document, 'mousemove', docMoveEvent);
            removeEvent(document, 'mouseup', docUpEvent);
        }
    }
    this.fixedSize = false;
    var maximized = false;
    var _setMaximaizeOnDblClick = function(e, type) {
        if (type === 1 && e.target.classList.contains('button')) {
            return;
        }

        if (this.fixedSize) return;
        var _h, _w;
        if (maximized) {
            this.setPosition(left, top);
            this.setSize(width, height);
            _w = width;
            _h = height;
        } else {
            this.rec = getAbsoluteRect(modal_win);
            width = Math.max(this.rec.width, this.minWidth);
            height = Math.max(this.rec.height, this.minHeight);
            var docSize = getDocumentSize();
            _setPosition.call(this, 0, 0);
            _setSize.call(this, docSize.width, docSize.height);
            _w = docSize.width;
            _h = docSize.height;
        }
        maximized = !maximized;
    }
    this._getDistance = function(e) {
        var _windowObject = this;
        var _w = _windowObject.rec.width, _h = _windowObject.rec.height;
        if (!this.type) this.type = 'se';
        if (this.type == 'se' || this.type == 'e') _w = Math.max(_windowObject.rec.width + (e.clientX - this.mX), this.minWidth);
        if (this.type == 'se' || this.type == 's') _h = Math.max(_windowObject.rec.height + (e.clientY - this.mY), this.minHeight);
        _setSize.call(this, _w, _h);
    }
    var _setResizeOnMouseDown = function(e) {
        var _windowObject = this;
        if (_windowObject.fixedSize) return;
        _windowObject.mX = e.clientX;
        _windowObject.mY = e.clientY;
        _windowObject.rec = getAbsoluteRect(modal_win);
        _windowObject._stopDistance();
        addClass(document.body, 'noselect');
        addClass(modal_win, 'noselect');
        addEvent(document, 'mousemove', docResizeEvent = function(e) {
            _windowObject._getDistance(e || window.event);
        });
        addEvent(document, 'mouseup', docResizeUpEvent = function(e) {
            maximized = false;
            _windowObject._stopDistance();
        });
    }
    this._stopDistance = function() {
        if (docResizeEvent && docResizeUpEvent) {
            removeClass(document.body, 'noselect');
            removeClass(modal_win, 'noselect');
            removeEvent(document, 'mousemove', docResizeEvent);
            removeEvent(document, 'mouseup', docResizeUpEvent);
        }
    }
    this.Loading = function(_loading) {
        /*if(_loading)statusbar.innerHTML = "Подождите идет загрузка... ";
        else statusbar.innerHTML = "";*/
        setDomVisible(loader, _loading);
    }
    this.getContainer = function() {
        return win_content;
    }
    var ReloadButtonOnClick = function() {
        this.dispatchEvent('onreload');
        getPage().form.FilterItems = new Array();
    }
    this.init = function() {
        container.innerHTML = getWindowXml(_otladka);
        this.parse(container);
        var _windowObject = this;
        this.setVisible(false);

        document.onkeydown = function(e) {
            if (e.keyCode == 27 || window.event == 27) {
                var close_but = document.querySelectorAll('[name=closeButton]');
                var len_win_close = close_but.length;
                if (len_win_close != 0) close_but[len_win_close - 1].click();
                stopEvent(e);
            }
        };

        setDomVisible(helpbutton, false);
        infobutton.onclick = openInfoWindow;
        //infobutton.style.display = "none";

        closebutton.onclick = function() {
            CloseButtonOnClick.call(_windowObject);
        };
        header.onmousedown = function(e) {
            _setDragOnMouseDown.call(_windowObject, e || window.event);
        };
        header.ondblclick = function(e) {
            _setMaximaizeOnDblClick.call(_windowObject, e || window.event, 1);
        };
        s_bottom.onmousedown = function(e) {
            _windowObject.type = 's';
            _setResizeOnMouseDown.call(_windowObject, e || window.event);
        };
        e_middle.onmousedown = function(e) {
            _windowObject.type = 'e';
            _setResizeOnMouseDown.call(_windowObject, e || window.event);
        };
        sizer.onmousedown = function(e) {
            _windowObject.type = 'se';
            _setResizeOnMouseDown.call(_windowObject, e || window.event);
        };
        maximizedbutton.onclick = function(e) {
            _setMaximaizeOnDblClick.call(_windowObject, e || window.event, 2);
        };
        morebutton.onclick = function() {
            let winSettings = getPage().form.getFormSettings()._WINDOW_,
                checked = winSettings && winSettings.theme && winSettings.theme === 'bars';
            changethemebutton.getElementsByTagName('input')[0].checked = checked;
            settings.classList.toggle('showed');

            const clickOutside = e => {
                if (!e.target.closest('.window__settings')) {
                    if (!e.target.closest('.button.more')) {
                        settings.classList.remove('showed');
                    }
                    document.removeEventListener('mousedown', clickOutside);
                }
            };

            if (settings.classList.contains('showed')) {
                document.addEventListener('mousedown', clickOutside);
            }
        };
        changethemebutton.onclick = function() {
            let theme = 'new';
            if (changethemebutton.getElementsByTagName('input')[0].checked) {
                theme = 'bars';
            }
            changeFormTheme(theme);
        };

        this.setMaxSizeStyle();

        /*if (window.debugUrlParam) {
            infobutton.style.display = '';
        }*/
    };
    var isShowing = false;
    this.show = function() {
        var _div = document.createElement('div');
        document.body.appendChild(_div);
        var size = getAbsolutePos(_div);
        document.body.removeChild(_div);
        document.body.appendChild(container);
    }
    this.hide = function() {
        removeDomObject(container);
    }
    this.setVisible = function(v) {
        if (v) {
            removeClass(modal_win, 'hidden');
            addClass(modal_win, 'showed');
        } else {
            removeClass(modal_win, 'showed');
            addClass(modal_win, 'hidden');
        }
    }
    //call
    this.init();
    this.close = function() {
        this.hide();
    }
    this.refresh = function() {
        body.align = 'left';
        setTimeout(function() {
            body.align = '';
        }, 0);
    }
    //Для отладки:
    this.rememberSize = function(event) {
        var f = getPage().form;
        if (!f.canSaveFormSettings()) {
            alert('Окно не поддерживает сохранение размера.');
            return false;
        }
        var ws = getAbsoluteSize(modal_win);

        if (f.isComposition) {
            executeAction(getVar('ComponentName') + '_comp_rights', function() {
                if (getVar('Composition_UPD_RIGHT') == 1) {
                    executeAction(getVar('ComponentName') + '_comp_select', function() {
                        setVar('Composition_WIDTH', ws.width);
                        setVar('Composition_HEIGHT', ws.height);
                        executeAction(getVar('ComponentName') + '_comp_update');
                    });
                }
            });
        }
        var wSt = f.getFormSettings('_WINDOW_');

        if (event.shiftKey && confirm("Сбросить сохраненные настройки окна?")) {
            f.deleteFormSettings('_WINDOW_');
            return;
        }
        var ws = getAbsoluteSize(modal_win);
        wSt['width'] = ws.width;
        wSt['height'] = ws.height;
    }
    this.showHelpEvent = function(ev) {
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

        if (typeof (_error) != 'string') {
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
        if (soapSeparatorIndex != -1) {
            var soapRegExpMatch = _error.replace(/[\n\r]+/g, ' ').match(/SoapFault exception: (.+)\sin\s.*Stack trace/);
            if (soapRegExpMatch && soapRegExpMatch[1]) {
                textError += soapRegExpMatch[1];
            }
        }
        var exceptionRegExpMatch = _error.match(/^(?:.*:\s*)*(?:(?:ORA|PLS)-\d{1,5}:\ )([^\r\n]+)(?:[\r\n]|ORA)?/);
        if (exceptionRegExpMatch && exceptionRegExpMatch[1]) {
            textError = exceptionRegExpMatch[1];
        }
        if (!textError) {
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
        return openWindow({name: 'Error/OracleErrorWindow', vars: this.getErrorParts()}, true);
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
            function() {
            },
            null,
            false,
            false
        );
    }
    this.parse = function(_dom) {
        if (hasProperty(_dom, 'name')) {
            eval(quickGetProperty(_dom, 'name').toLowerCase() + '=_dom;');
        }

        for (var index = 0; index < _dom.childNodes.length; index++) {
            this.parse(_dom.childNodes[index]);
        }
    }
    this.show = function() {
        win.setSize(400, 280);
        win.fixedSize = true;
        win.setCaption('Информация');
        win.addListener('onclose', function() {
            win.close();
        }, this, false);
        win.getContainer().innerHTML = getErrorWindowBodyXML();
        win.show();
        this.parse(win.getContainer());
        closebutton.focus();

        closebutton.onclick = function() {
            win.dispatchEvent('onclose');
            win.close();
        }

        if (getConfigValue('taskTracker/url')) {
            crtaskbutton.onclick = this.createTask;
            crtaskbutton.style.display = 'inline-block';
        }

        errormemo.value = _error;
        win.setVisible(true);
        win.setCenterPosition();
        return win;
    }
}
function getConfirmWindowBodyXML() {
    return '<table style="width:100%;height:100%;" class="form-table" cellpadding="5" cellspacing="5" border="0"><tbody><tr><td valign="top" colspan="2"><span name="alerttext"></span></td></tr><tr><td><input type="Button" value="OK" name="okbutton"/></td><td><input type="Button" value="Отмена" name="closebutton"/></td></tr></tbody></table>'
};
function DConfirmWindow(_alert, _okfunction, _cancelfunction) {
    var win = new DWindow();
    var closebutton;
    var alerttext;
    var okbutton;
    this.parse = function(_dom) {
        if (hasProperty(_dom, 'name')) {
            eval(quickGetProperty(_dom, 'name').toLowerCase() + '=_dom;');
        }
        for (var index = 0; index < _dom.childNodes.length; index++) {
            this.parse(_dom.childNodes[index]);
        }
    }
    this.show = function() {
        win.setSize(280, 160);
        win.fixedSize = true;
        //win.setCaption('');
        win.addListener('onclose', function() {
            win.close();
        }, this, false);
        win.getContainer().innerHTML = getConfirmWindowBodyXML();
        win.show();
        this.parse(win.getContainer());
        closebutton.onclick = function() {
            if (_cancelfunction != false) {
                _cancelfunction.call(this);
            }
            win.close();
        }
        okbutton.onclick = function() {
            if (_okfunction != false) {
                _okfunction.call(this);
            }
            win.close();
        }
        alerttext.innerHTML = _alert;
        win.setVisible(true);
        win.setCenterPosition();
    }
}
function getAlertWindowBodyXML() {
    return '<table style="width:100%;height:100%;" cellpadding="5" cellspacing="5" border="0"><tbody><tr><td valign="top"><span name="alerttext"></span></td></tr><tr><td align="center"><input type="Button" value="OK" name="okbutton"/></td></tr></tbody></table>'
};
function DAlertWindow(_message, _okfunction, _object) {
    var win = new DWindow();
    var alerttext;
    var okbutton;
    this.parse = function(_dom) {
        if (hasProperty(_dom, 'name')) {
            eval(quickGetProperty(_dom, 'name').toLowerCase() + '=_dom;');
        }
        for (var index = 0; index < _dom.childNodes.length; index++) {
            this.parse(_dom.childNodes[index]);
        }
    }
    this.show = function() {
        win.setSize(280, 160);
        win.fixedSize = true;
        //win.setCaption('');
        win.addListener('onclose', function() {
            win.close();
        }, this, false);
        win.getContainer().innerHTML = getAlertWindowBodyXML();
        win.show();
        this.parse(win.getContainer());
        okbutton.onclick = function() {
            win.close();
            win.dispatchEvent('onclose');
        }
        alerttext.innerHTML = _message;
        win.setVisible(true);
        win.setCenterPosition();
        if (_okfunction)
            win.addListener('onclose', _okfunction, _object, false);
    }
}