if(typeof(SYS_ControlActions) === 'undefined'){ SYS_ControlActions={}; }
if(typeof(SYS_ControlActions['Edit']) == 'undefined'){ SYS_ControlActions['Edit']=getBaseProperties();}
SYS_ControlActions['Edit']['value']={set:Edit_SetValue,get:Edit_GetValue};
SYS_ControlActions['Edit']['caption']={set:Edit_SetCaption,get:Edit_GetCaption}
SYS_ControlActions['Edit']['enabled']={set:Edit_SetEnabled,get:D3Api.BaseCtrl.getEnabled};
SYS_ControlActions['Edit']['color']={set:Edit_SetColor,get:Edit_GetColor};
SYS_ControlActions['Edit']['input']={get:function (_domObject){return edit_getInput(_domObject);}};
SYS_ControlActions['Edit']['hint']={set:D3Api.setHint,get:D3Api.getHint};
SYS_ControlActions['Edit']['visible']={set:Edit_SetVisible,get:Edit_GetVisible};

function edit_getInput(_domObject){	
	return getChildTag(_domObject.rows[0].cells[0], 'input', 0);
}
function edit_getControl(_domObject){
	var parent_ctrl=_domObject.parentNode;
	var i=0;
	while(D3Api.getProperty(parent_ctrl, 'cmptype', null)!='Edit' && i<5){
		parent_ctrl = parent_ctrl.parentNode;
		i++;
	}
	return parent_ctrl;
}
function Edit_SetValue(_domObject,_value)
{
	if (hasProperty(_domObject,'unit'))
		_domObject.setAttribute('keyvalue', _value);
	else
		edit_getInput(_domObject).value=_value;
}

function Edit_GetValue(_domObject)
{
	var _value;
	if (hasProperty(_domObject,'unit')) 
		_value = D3Api.getProperty(_domObject,'keyvalue', '');
	else
		_value = edit_getInput(_domObject).value;		
	return _value;
}

function Edit_SetCaption(_domObject,_value)
{
	edit_getInput(_domObject).value=_value;
}

function Edit_GetCaption(_domObject)
{
	return edit_getInput(_domObject).value;
}

function Edit_onExit(_dom)
{
	if (_getControlProperty(_dom, 'enabled'))Edit_Validate(_dom);
}

function Edit_Validate(_dom)
{
	_action_name =D3Api.getProperty(_dom, 'validateaction', null);
	name = D3Api.getProperty(_dom, 'name', null);
	if (_action_name) executeAction(_action_name,function (){if (_getControlProperty(_dom, 'enabled')){setControlProperty(name, 'color', '');UnitEdit_Valid(_dom, true);}},function (){if (_getControlProperty(_dom, 'enabled')){UnitEdit_Valid(_dom, false); setControlProperty(name, 'color', 'red');}},_dom);
}

function Edit_SetEnabled(_dom, _state /*true/false типа boolean!!!*/)
{
	if (_getControlProperty(_dom, 'enabled') != _state)
	{
		var input = edit_getInput(_dom);
		//делаем активным
		if (_state)
		{
		  input.removeAttribute('readonly');
		  input.className = 'input-ctrl';
		  _dom.setAttribute('enabled', 'true');
		  Edit_Validate(_dom);
		}//делаем неактивным
		else
		{
		  input.setAttribute('readonly','true');
		  input.className = 'input-ctrl disable';
		  _dom.setAttribute('enabled', 'false');
		}
	}
}

function Edit_SetColor(_dom, _color)
{
	edit_getInput(_dom).style.backgroundColor = _color;
}

function Edit_GetColor(_dom)
{
	return edit_getInput(_dom).style.backgroundColor;
}
function Edit_SetVisible(_domObject,_visible){
	edit_getControl(_domObject).style.display=(_visible)?'inline-table':'none';
}
function Edit_GetVisible(_domObject){
	return edit_getControl(_domObject).style.display!='none';
}