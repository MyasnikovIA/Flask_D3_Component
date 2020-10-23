from Components.BaseCtrl import BaseCtrl

class Tree(BaseCtrl):
    """

        <div class="popupMenu"  cmptype="PopupMenu" name="pm5f7f341064277" title="" tabindex="0"  cont="menu"><div class="item waittext">Подождите...</div><div class="popupGroupItem" cont="groupitem" name="additionalMainMenu" cmptype="PopupGroupItem"></div><div class="popupGroupItem" cont="groupitem" name="system" cmptype="PopupGroupItem" separator="before"></div></div><div class="popupMenu"  cmptype="PopupMenu" name="pm5f7f341065096" title="" tabindex="0"  cont="menu"><div class="item waittext">Подождите...</div><div class="popupGroupItem" cont="groupitem" name="additionalMainMenu" cmptype="PopupGroupItem"></div><div class="popupGroupItem" cont="groupitem" name="system" cmptype="PopupGroupItem" separator="before"></div></div><div  name="font_color" cmptype="Tree" title=""  popupmenu_actions="pm5f7f341064277" menu_profile="pm5f7f341065096" class="tree box-sizing-force"  onrefresh="D3Api.TreeCtrl.setTreeData(this,args[0]);"  onshow="D3Api.TreeCtrl.onShow(this);"  onafter_refresh="D3Api.TreeCtrl.setCurrentActiveRow(this);" ><div class="tree_header box-sizing-force" cont="treecaption"><div class="btn_actions menuBtn" onclick="D3Api.PopupMenuCtrl.showPopupMenu(event,this,'pm5f7f341064277');"></div><div class="btn_actions profileBtn" onclick="D3Api.PopupMenuCtrl.showPopupMenu(event,this,'pm5f7f341065096');" title="Профиль"><span class="grid_label">Профиль</span></div><div class="tree_caption" cont="treecaptioncontent" title="Показать меню"></div></div><div class="tree_columns box-sizing-force" cont="treecolumnscont"><table class="tree_columns" cont="treecolumns"><colgroup></colgroup><tbody><tr oncreate="D3Api.TreeCtrl.headerSizerInit(this)" class="noselect" cont="treecolumnscaption"></tr></tbody></table></div><div class="tree_data_cont  box-sizing-force"><div class="tree_data box-sizing-force" cont="treedatacont" scrollable="true"><table class="tree_data" cont="treedata"><colgroup></colgroup><tbody><tr cmptype="TreeRow" class="node closed" cont="treerow" onlycreate="true" repeat="0"  popupmenu_actions="pm5f7f341064277" menu_profile="pm5f7f341065096" name="font_color_Row" repeatername="font_color_repeater" groupname="" ondblclick="var row = D3Api.TreeCtrl.getActiveRow(this); if(!row)return; D3Api.setEvent(event);D3Api.TreeCtrl.toggleNode(row);"  onmousedown="D3Api.TreeCtrl.setActiveRow(this);"><td class="column_data firstnode" </td></table></div></div><div cont="tree_params_cont" class="tree_params_cont box-sizing-force" onmousedown="D3Api.TreeCtrl.stopPopup(event);"></div><div class="tree_wait" cont="tree_wait"></div></div>



        <div class="popupMenu"  cmptype="PopupMenu" name="pm5f7f32af9d533" title="" tabindex="0"  cont="menu">
            <div class="item waittext">Подождите...</div>
                <div class="popupGroupItem" cont="groupitem" name="additionalMainMenu" cmptype="PopupGroupItem"></div>
                <div class="popupGroupItem" cont="groupitem" name="system" cmptype="PopupGroupItem" separator="before"></div>
            </div>
            <div class="popupMenu"  cmptype="PopupMenu" name="pm5f7f32af9dd35" title="" tabindex="0"  cont="menu">
            <div class="item waittext">Подождите...</div>
            <div class="popupGroupItem" cont="groupitem" name="additionalMainMenu" cmptype="PopupGroupItem"></div>
            <div class="popupGroupItem" cont="groupitem" name="system" cmptype="PopupGroupItem" separator="before"></div>
       </div>
       <div  cmptype="Tree" name="font_color" title=""  popupmenu_actions="pm5f7f32af9d533" menu_profile="pm5f7f32af9dd35" class="tree box-sizing-force"  onrefresh="D3Api.TreeCtrl.setTreeData(this,args[0]);"  onshow="D3Api.TreeCtrl.onShow(this);"  onafter_refresh="D3Api.TreeCtrl.setCurrentActiveRow(this);" >
          <div class="tree_header box-sizing-force" cont="treecaption">
          <div class="btn_actions menuBtn" onclick="D3Api.PopupMenuCtrl.showPopupMenu(event,this,'pm5f7f32af9d533');"></div>
          <div class="btn_actions profileBtn" onclick="D3Api.PopupMenuCtrl.showPopupMenu(event,this,'pm5f7f32af9dd35');" title="Профиль">
                <span class="grid_label">Профиль</span>
          </div>
          <div class="tree_caption" cont="treecaptioncontent" title="Показать меню"></div>
       </div>
       <div class="tree_columns box-sizing-force" cont="treecolumnscont">
           <table class="tree_columns" cont="treecolumns">
           <colgroup></colgroup><tbody><tr oncreate="D3Api.TreeCtrl.headerSizerInit(this)" class="noselect" cont="treecolumnscaption"></tr></tbody></table></div><div class="tree_data_cont  box-sizing-force"><div class="tree_data box-sizing-force" cont="treedatacont" scrollable="true"><table class="tree_data" cont="treedata"><colgroup></colgroup><tbody><tr cmptype="TreeRow" class="node closed" cont="treerow" onlycreate="true" repeat="0"  popupmenu_actions="pm5f7f32af9d533" menu_profile="pm5f7f32af9dd35" name="font_color_Row" repeatername="font_color_repeater" groupname="" ondblclick="var row = D3Api.TreeCtrl.getActiveRow(this); if(!row)return; D3Api.setEvent(event);D3Api.TreeCtrl.toggleNode(row);"  onmousedown="D3Api.TreeCtrl.setActiveRow(this);"><td class="column_data firstnode" </td></table></div></div><div cont="tree_params_cont" class="tree_params_cont box-sizing-force" onmousedown="D3Api.TreeCtrl.stopPopup(event);"></div><div class="tree_wait" cont="tree_wait"></div></div>

    """
    def __init__(self, PageInfo={}, attrs={}, innerText=""):
            self.style = []
            self.classCSS = []
            if 'style' in attrs:
                self.style = [i for i in attrs['style'].split(";")]
                del attrs['style']
            for name in self.argsToStyleList:
                if name in attrs:
                    self.style.append(f"{name}:{attrs[name]}")
                    del attrs[name]

            self.PageInfo = PageInfo
            self.CmpType = 'Tree';
            if 'cmptype' in attrs:
                del attrs['cmptype']
            self.printTag = 'div';
            self.attrs = attrs.copy()
            self.innerText = ""
            if innerText != None:
                self.innerText = innerText
            if 'title' not in self.attrs:
                self.attrs['title'] = ""
            if 'caption' in self.attrs:
                self.innerHtml = self.attrs['caption']
                del self.attrs['caption']
            if 'class' not in self.attrs:
                self.classCSS = ['ctrl_edit','editControl','box-sizing-force']
            else:
                self.classCSS = [i for i in attrs['class'].split(" ")]
                del self.attrs['class']
            if 'ctrl_edit' not in self.classCSS:
                self.classCSS.append('self.classCSS')
            if 'ctrl_edit' not in self.classCSS:
                self.classCSS.append('ctrl_edit')
            if 'editControl' not in self.classCSS:
                self.classCSS.append('editControl')
            if 'box-sizing-force' not in self.classCSS:
                self.classCSS.append('box-sizing-force')
            if 'value' in self.attrs:
                self.value = self.attrs['value']
            else:
                self.value = ""
            if 'name' not in self.attrs:
                self.attrs['name'] = self.genName()
            if ('format' in self.attrs) and ('onformat' not in self.attrs):
                self.attrs['onformat'] = f'D3Api.EditCtrl.format(this, {self.attrs["format"]}, arguments[0]);';
            listProp = ['readonly','disabled','placeholder','maxlength']
            self.elProp = "  ".join(f"{k}='{v}'" for  k, v in self.attrs.items() if k in listProp)
            self.value=""
            if 'value' in self.attrs:
                self.value = f' value="{self.attrs["value"]}" '
                del self.attrs['value']
            if 'class' not in self.attrs:
                self.classCSS = []
            else:
                self.classCSS = [i for i in attrs['class'].split(" ")]
                del self.attrs['class']
            self.events = "  ".join(f"{k}='{v}'" for  k, v in self.attrs.items() if k[:2] == "on")

    def Show(self):
        res = []
        atr = "  ".join(f"{k}='{v}'" for k, v in self.attrs.items())
        res.append(f"""
              <div  cmptype="{self.CmpType}"  {atr}    class="{" ".join(self.classCSS)}" >
                     <textarea cmpparse="{self.CmpType}" {self.elProp} {self.events}>{self.value}{self.innerText}</textarea>
        """)
        return f"</{self.printTag}>", res, [],""
