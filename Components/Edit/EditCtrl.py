from Components.BaseCtrl import BaseCtrl

class Edit(BaseCtrl):
    """
          <div  name="IS_MAIN" cmptype="Edit" title=""  class="ctrl_edit editControl box-sizing-force"  style=";width: 100%;">
              <div class = "edit-input">
                 <input cmpparse="Edit" type="text" value="" onchange="D3Api.stopEvent();"/>
              </div>
          </div>
    """
    def __init__(self, PageInfo={}, attrs={}, innerText=""):
            self.style = []
            self.classCSS = []

            self.style =["vertical-align:bottom; width:114px;  display:inline-table;"]
            if 'style' in attrs:
                self.style.extend([i for i in attrs['style'].split(";")])
                del attrs['style']
            for name in self.argsToStyleList:
                if name in attrs:
                    self.style.append(f"{name}:{attrs[name]}")
                    del attrs[name]

            self.PageInfo = PageInfo
            self.CmpType = 'Edit';
            if 'cmptype' in attrs:
                del attrs['cmptype']
            self.printTag = 'table';
            self.attrs = attrs.copy()

            if 'title' not in self.attrs:
                self.attrs['title'] = ""
            if 'caption' in self.attrs:
                self.innerHtml = self.attrs['caption']
                del self.attrs['caption']
            if 'class' not in self.attrs:
                self.classCSS = ['editControl']
            else:
                self.classCSS = [i for i in attrs['class'].split(" ")]
                del self.attrs['class']
            if 'editControl' not in self.classCSS:
                self.classCSS.append('editControl')
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
            <table  cmptype="{self.CmpType}" {atr} class="{" ".join(self.classCSS)}" cellspacing="0" cellpadding="0" style="{" ".join(self.style)}" >
                <tr>
                    <td class="td_edit_control">
                        <input type="text" cmpparse="Edit" value="{self.value}"  {self.events} class="input-ctrl"/>
                    </td>
                </tr>
        """)
        self.sysinfo = []
        self.sysinfo.append("<scriptfile>Components/Edit/js/Edit.js</scriptfile>")
        self.sysinfo.append("<cssfile>Components/Edit/css/Edit.css</cssfile>")
        return f"</{self.printTag}>", res, self.sysinfo, ""
