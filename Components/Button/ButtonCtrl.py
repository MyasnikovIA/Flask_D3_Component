from Components.BaseCtrl import *


class Button(BaseCtrl):
    """
    <div  onclick="Form.runDataSet()" cmptype="Button" name="cmp5f7b4c4706deb" title=""  tabindex="0" class="ctrl_button box-sizing-force" style="width: 255px;">
       <div class="btn_caption btn_center minwidth" >запустить runDataSet</div>
    </div>

    <button type="button" class="btn btn-primary">Primary</button>
    """

    def __init__(self, PageInfo={}, attrs={}, innerText="", parent=None):
        self.events={}
        self.style = []
        self.classCSS = []
        if 'style' in attrs:
            self.style = [i for i in RemoveArrKeyRtrn(attrs, 'style').split(";")]
        self.PageInfo = PageInfo
        self.CmpType = 'Button';
        if 'cmptype' in attrs:
            del attrs['cmptype']
        self.printTag = 'div';
        self.attrs = attrs.copy()
        if innerText == None:
            self.innerHtml = ""
        else:
            self.innerHtml = innerText
        # ====================================================
        # ====================================================
        # ====================================================
        self.nominwidth = RemoveArrKeyRtrn(self.attrs, 'nominwidth')
        self.popupmenu = RemoveArrKeyRtrn(self.attrs, 'popupmenu')
        self.caption = RemoveArrKeyRtrn(self.attrs, 'caption')
        # ============== ICON Button =========================
        self.icon = RemoveArrKeyRtrn(attrs, 'icon')
        if len(self.icon) > 0:
            self.icon = f'''<div class="btn_icon"><img src="{self.icon}" class="btn_icon_img"/></div>'''
        # ====================================================
        if ('onlyicon' in self.attrs) or (('caption' in self.attrs) and (len(attrs['caption'] == 0))):
            self.classCSS.append('onlyicon')
        # ============== INIT Html Class =========================
        if 'class' not in self.attrs:
            self.classCSS = ['ctrl_button', 'box-sizing-force']
        else:
            self.classCSS = [i for i in attrs['class'].split(" ")]
            del self.attrs['class']
        if ('ctrl_button' not in self.classCSS):
            self.classCSS.append('ctrl_button')
        if ('box-sizing-force' not in self.classCSS):
            self.classCSS.append('box-sizing-force')
        # ========================================================
        if 'name' not in self.attrs:
            self.attrs['name'] = self.genName()
        # ========================================================
        if len(self.popupmenu) > 0 and ('onclick' not in self.attrs):
            self.attrs['onclick'] = f"D3Api.ButtonCtrl.showPopupMenu(this,'{self.popupmenu}');"
        elif len(self.popupmenu) > 0 and ('onclick' in self.attrs):
            self.attrs['onclick'] = f"""{self.attrs['onclick']} D3Api.ButtonCtrl.showPopupMenu(this,'{self.popupmenu}'); """
        self.data = getDomAttrRemove('data', None, self.attrs);


    def Show(self):
        eventsStr = "  ".join(f"{k}='{v}'" for k, v in self.attrs.items() if k[:2] == "on")
        atr = "  ".join(f"{k}='{v}'" for k, v in self.attrs.items() if not k[:2] == "on")
        if len(self.classCSS) > 0:
            classCSSStr = f""" class='{' '.join(self.classCSS)}'"""
        else:
            classCSSStr = ""

        minwidth = ""
        if len(self.nominwidth)>0:
            minwidth="minwidth"

        popupmenuCss=""
        popupmenuTag = ""
        if len(self.popupmenu) > 0:
            popupmenuCss = ' style="display: inline-block;" '
            popupmenuTag = """<i class="fas fa-angle-down" style="padding-left: 5px;float: right;padding-top: 4px"></i>"""
        showtext = f"""
                <div  cmptype="{self.CmpType}" {eventsStr} tabindex="0" {classCSSStr} style="{" ".join(self.style)}" {self.data} >
                        {self.icon}
                    <div class="btn_caption btn_center {minwidth}" {popupmenuCss}>{self.caption}{self.innerHtml}</div>
                        {popupmenuTag}
                </div>
          """
        self.sysinfo = []
        self.sysinfo.append("<scriptfile>Components/Button/js/Button.js</scriptfile>")
        self.sysinfo.append("<cssfile>Components/Button/css/Button.css</cssfile>")
        return f"</{self.printTag}>",[showtext], self.sysinfo, ""
