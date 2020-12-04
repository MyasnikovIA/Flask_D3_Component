from Components.BaseCtrl import *


class Edit(BaseCtrl):

    def __init__(self, PageInfo={}, attrs={}, innerText="", parent=None):
        self.PageInfo = PageInfo
        self.CmpType = 'Mask';
        if 'cmptype' in attrs:
            del attrs['cmptype']
        self.printTag = 'div';
        self.attrs = attrs.copy()
        self.name = RemoveArrKeyRtrn(self.attrs, 'name', self.genName())
        self.controls = RemoveArrKeyRtrn(self.attrs, 'controls')

    def Show(self):
        if len(self.classCSS) > 0:
            classCSSStr = f""" class='{' '.join(self.classCSS)}'"""
        else:
            classCSSStr = ""
        showtext = f"""
                <div  cmptype="{self.CmpType}" name="{self.name}" controls={self.controls } style="display:none" >"""
        self.sysinfo = []
        self.sysinfo.append("<scriptfile>Components/Mask/js/Mask.js</scriptfile>")
        self.sysinfo.append("<cssfile>Components/Mask/css/Mask.css</cssfile>")
        return f"</{self.printTag}>",[showtext], self.sysinfo, ""
