from Components.BaseCtrl import BaseCtrl

class ColorEdit(BaseCtrl):
    """
        <div cmptype="ColorEdit" name="font_color"><input type="hidden" />
            <select onchange="ColorEdit_SetValue(this.parentNode, this.value)">
                <option value="" style="background: #ffffff"></option>
                <option value="#ff0000" style="background:#ff0000"></option>
                <option value="-1" style="background: #ffffff">другой</option>
            </select>
            <span class="color_select_icon" style="display:none;"
                    onclick="if (this.parentNode.CSObject == undefined) {
                                ColorEdit_Init(this.parentNode);
                             }
                             this.parentNode.CSObject.toggle_color_select()">
                &nbsp;&nbsp;&nbsp;&nbsp;
            </span>
        </div>

        <div cmptype="sysinfo" style="display:none;">
            <scriptfile>Components/ColorEdit/js/ColorEdit.1601951602.js</scriptfile>
            <cssfile>Components/ColorEdit/css/ColorEdit</cssfile>
        </div>
    """
    def __init__(self, PageInfo={}, attrs={}, innerText=""):
            self.style = []
            self.classCSS = []
            self.sysinfo = []
            if 'style' in attrs:
                self.style = [i for i in attrs['style'].split(";")]
                del attrs['style']
            for name in self.argsToStyleList:
                if name in attrs:
                    self.style.append(f"{name}:{attrs[name]}")
                    del attrs[name]

            self.PageInfo = PageInfo
            self.CmpType = 'ColorEdit';
            if 'cmptype' in attrs:
                del attrs['cmptype']
            self.printTag = 'div';
            self.attrs = attrs.copy()

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
            if 'title' not in self.attrs:
                self.attrs['title'] = ''
            if ('format' in self.attrs) and ('onformat' not in self.attrs):
                self.attrs['onformat'] = f'D3Api.EditCtrl.format(this, {self.attrs["format"]}, arguments[0]);';
            self.events = "  ".join(f"{k}='{v}'" for k, v in self.attrs.items() if k[:2] == "on")
            listProp = ['readonly','disabled','placeholder','maxlength']
            self.elProp = "  ".join(f"{k}='{v}'" for  k, v in self.attrs.items() if k in listProp)

    def Show(self):
        res = []
        atr = "  ".join(f"{k}='{v}'" for k, v in self.attrs.items())
        res.append(f"""
            <div cmptype="ColorEdit" name="font_color"><input type="hidden" />
                <select onchange="ColorEdit_SetValue(this.parentNode, this.value)">
                    <option value="" style="background: #ffffff"></option>
                    <option value="#ff0000" style="background:#ff0000"></option>
                    <option value="-1" style="background: #ffffff">другой</option>
                </select>
                <span class="color_select_icon" style="display:none;"
                        onclick="if (this.parentNode.CSObject == undefined){"{ColorEdit_Init(this.parentNode);}"}
                                 this.parentNode.CSObject.toggle_color_select()">
                    &nbsp;&nbsp;&nbsp;&nbsp;
                </span>
        """)
        self.sysinfo=[]
        self.sysinfo.append("<scriptfile>Components/ColorEdit/js/ColorEdit.js</scriptfile>")
        self.sysinfo.append("<cssfile>Components/ColorEdit/css/ColorEdit</cssfile>")
        return f"</div>", res, self.sysinfo, ""
