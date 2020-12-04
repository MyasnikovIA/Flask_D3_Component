from Components.BaseCtrl import *


class Edit(BaseCtrl):

    def __init__(self, PageInfo={}, attrs={}, innerText="", parent=None):
        self.CmpType = 'Dependences';
        if 'cmptype' in attrs:
            del attrs['cmptype']
        self.printTag = 'div';
        self.attrs = attrs.copy()
        self.name = RemoveArrKeyRtrn(self.attrs, 'name', self.genName())
        self.required = getDomAttr('required', '', self.attrs);
        self.depend = getDomAttr('depend', '', self.attrs);
        self.repeatername = getDomAttr('repeatername', None, self.attrs);
        self.condition = getDomAttr('condition', None, self.attrs);

    def Show(self):
        showtext = f"""
	            <div cmptype="{self.CmpType}" name="{self.name}" {self.required} {self.depend} {self.repeatername} {self.condition} style="display:none">"""
        self.sysinfo = []
        self.sysinfo.append("<scriptfile>Components/Dependences/js/Dependences.js</scriptfile>")
        self.sysinfo.append("<cssfile>Components/Dependences/css/Dependences.css</cssfile>")
        return f"</{self.printTag}>",[showtext], self.sysinfo, ""
