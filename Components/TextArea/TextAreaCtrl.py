from Components.BaseCtrl import BaseCtrl


class TextArea(BaseCtrl):
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
        if 'style' in attrs:
            self.style = [i for i in attrs['style'].split(";")]
            del attrs['style']
        for name in self.argsToStyleList:
            if name in attrs:
                self.style.append(f"{name}:{attrs[name]}")
                del attrs[name]

        self.PageInfo = PageInfo
        self.CmpType = 'TextArea';
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
            self.classCSS = ['ctrl_edit', 'editControl', 'box-sizing-force']
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
        listProp = ['readonly', 'disabled', 'placeholder', 'maxlength']
        self.elProp = "  ".join(f"{k}='{v}'" for k, v in self.attrs.items() if k in listProp)
        self.value = ""
        if 'value' in self.attrs:
            self.value = f' value="{self.attrs["value"]}" '
            del self.attrs['value']
        if 'class' not in self.attrs:
            self.classCSS = []
        else:
            self.classCSS = [i for i in attrs['class'].split(" ")]
            del self.attrs['class']
        self.events = "  ".join(f"{k}='{v}'" for k, v in self.attrs.items() if k[:2] == "on")

    def Show(self):
        res = []
        atr = "  ".join(f"{k}='{v}'" for k, v in self.attrs.items())
        res.append(f"""
              <div  cmptype="{self.CmpType}"  {atr}    class="{" ".join(self.classCSS)}" >
                     <textarea cmpparse="{self.CmpType}" {self.elProp} {self.events}>{self.value}{self.innerText}</textarea>
        """)
        self.sysinfo = []
        self.sysinfo.append("<scriptfile>Components/TextArea/js/TextArea.js</scriptfile>")
        self.sysinfo.append("<cssfile>Components/TextArea/css/TextArea.css</cssfile>")
        return f"</{self.printTag}>", res, self.sysinfo, ""
