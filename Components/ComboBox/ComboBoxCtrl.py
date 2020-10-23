from Components.BaseCtrl import BaseCtrl


class ComboBox(BaseCtrl):
    """

<div name="IS_MAIN" cmptype="ComboBox" title="" oncreate="" onpostclone="D3Api.ComboBoxCtrl.postClone(this);"
     class="ctrl_combobox editControl box-sizing-force" style=";width: 100%;">
    <div class="cmbb-input"><input cmpparse="ComboBox" onchange="D3Api.stopEvent()" type="text"
                                   onclick="D3Api.ComboBoxCtrl.downClick(this);"
                                   onkeydown="D3Api.ComboBoxCtrl.keyDownInput(this);"
                                   onkeyup="D3Api.ComboBoxCtrl.keyUpInput(this);"/></div>
    <div cmpparse="ComboBox" class="cmbb-button" onclick="D3Api.ComboBoxCtrl.downClick(this);"
         title="Выбрать из списка"></div>
    <div cmptype="Base" name="ComboItemsList_IS_MAIN">
        <div cmptype="ComboBoxDL" cont="cmbbdroplist" class="cmbb-droplist">
            <table>

                <tr cmptype="ComboItem" name="cmp5f7d8713a7528" comboboxname="IS_MAIN">
                    <td>
                        <div class="item_block">
                            <span class="btnOC" comboboxname="IS_MAIN"></span>
                            <span cont="itemcaption"></span>
                        </div>

                    </td>
                </tr>


                <tr cmptype="ComboItem" name="cmp5f7d8713a79e4" comboboxname="IS_MAIN" value="1">
                    <td>
                        <div class="item_block">
                            <span class="btnOC" comboboxname="IS_MAIN"></span>
                            <span cont="itemcaption">Основное вещество</span>
                        </div>

                    </td>
                </tr>


                <tr cmptype="ComboItem" name="cmp5f7d8713a7e9f" comboboxname="IS_MAIN" value="0">
                    <td>
                        <div class="item_block">
                            <span class="btnOC" comboboxname="IS_MAIN"></span>
                            <span cont="itemcaption">Дополнительное вещество</span>
                        </div>

                    </td>
                </tr>

            </table>
        </div>
    </div>
</div>


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
        self.CmpType = 'ComboBox';
        if 'cmptype' in attrs:
            del attrs['cmptype']
        self.printTag = 'select';
        self.attrs = attrs.copy()
        self.innerHtml = innerText
        self.title = " title='Выбрать из списка' "
        if 'title' in self.attrs:
            self.title = f''' title="{self.attrs['title']}" '''
            del self.attrs['title']
        if 'name' not in self.attrs:
            self.attrs['name'] = self.genName()
        if 'class' not in self.attrs:
            self.classCSS = ["ctrl_combobox editControl box-sizing-force"]
        else:
            self.classCSS = [i for i in attrs['class'].split(" ")]
            del self.attrs['class']
        if "ctrl_combobox editControl box-sizing-force" not in self.classCSS:
            self.classCSS.append("ctrl_combobox editControl box-sizing-force")
        if 'onpostclone' not in self.attrs:
            self.attrs['onpostclone'] = "D3Api.ComboBoxCtrl.postClone(this);"
        listProp = ['readonly','disabled','placeholder','maxlength']
        self.elProp = "  ".join(f"{k}='{v}'" for  k, v in self.attrs.items() if k in listProp)

    def Show(self):
        res = []
        atr = "  ".join(f'{k}="{v}"' for k, v in self.attrs.items())
        res.append(f'''
<div cmptype="{self.CmpType}"  {atr}
     class="{" ".join(self.classCSS)}" >
    <div class="cmbb-input"><input cmpparse="ComboBox" onchange="D3Api.stopEvent()" type="text" {self.elProp}
                                   onclick="D3Api.ComboBoxCtrl.downClick(this);"
                                   onkeydown="D3Api.ComboBoxCtrl.keyDownInput(this);"
                                   onkeyup="D3Api.ComboBoxCtrl.keyUpInput(this);"/></div>
    <div cmpparse="ComboBox" class="cmbb-button" onclick="D3Api.ComboBoxCtrl.downClick(this);" {self.title}></div>
    <div cmptype="Base" name="ComboItemsList_IS_MAIN">
        <div cmptype="ComboBoxDL" cont="cmbbdroplist" class="cmbb-droplist">
            <table>
        ''')
        return '</table></div></div></div>', res, [],""
