from Components.BaseCtrl import *


class Edit(BaseCtrl):

    def __init__(self, PageInfo={}, attrs={}, innerText="", parent=None):
        self.CmpType = 'Charts';
        if 'cmptype' in attrs:
            del attrs['cmptype']
        self.printTag = 'div';
        self.style = []
        if 'style' in attrs:
            self.style = [i for i in RemoveArrKeyRtrn(attrs, 'style').split(";")]
        self.attrs = attrs.copy()
        self.innerHtml = innerText
        # ============== INIT Html Class =========================
        if 'class' not in self.attrs:
            self.classCSS = ['ctrl_chart']
        else:
            self.classCSS = [i for i in attrs['class'].split(" ")]
            del self.attrs['class']
        if ('ctrl_chart' not in self.classCSS):
            self.classCSS.append('ctrl_chart')
        # ========================================================
        self.name = RemoveArrKeyRtrn(self.attrs, 'name', self.genName())
        self.required = getDomAttr('required', '', self.attrs);
        self.depend = getDomAttr('depend', '', self.attrs);
        self.repeatername = getDomAttr('repeatername', None, self.attrs);
        self.condition = getDomAttr('condition', None, self.attrs);

    def Show(self):
        eventsStr = "  ".join(f"{k}='{v}'" for k, v in self.attrs.items() if k[:2] == "on")
        if len(self.classCSS) > 0:
            classCSSStr = f""" class='{' '.join(self.classCSS)}'"""
        else:
            classCSSStr = ""
        showtext = f"""
                   <div {self.name}  {eventsStr}  style="{" ".join(self.style)} {classCSSStr} >
                        <textarea style="display:none">{self.innerHtml}</textarea>
        """
        self.sysinfo = []
        self.sysinfo.append("<scriptfile>Components/Charts/js/Charts.js</scriptfile>")
        self.sysinfo.append("<cssfile>Components/Charts/css/Charts.css</cssfile>")
        self.sysinfo.append("<cssfile>Components/Charts/css/dc.css</cssfile>")
        return f"</{self.printTag}>", [showtext], self.sysinfo, ""
