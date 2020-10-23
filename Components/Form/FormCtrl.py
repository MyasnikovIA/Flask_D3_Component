from Components.BaseCtrl import BaseCtrl


class Form(BaseCtrl):
    """
        <div   cmptype="Form">

        </div>
    """
    def __init__(self, PageInfo={}, attrs={}, innerText=""):
        self.style = []
        if 'style' in attrs:
            self.style = [i for i in attrs['style'].split(";")]
            del attrs['style']
        for name in self.argsToStyleList:
            if name in attrs:
                self.style.append(f"{name}:{attrs[name]}")
                del attrs[name]

        self.PageInfo = PageInfo
        self.CmpType = 'Form';
        if 'cmptype' in attrs:
            del attrs['cmptype']
        self.printTag = 'div';
        self.attrs = attrs.copy()
        self.innerHtml = innerText
        if 'name' not in self.attrs:
            self.attrs['name'] = self.genName()
    def Show(self):
         res = []
         name = self.attrs.get('name', self.genName())
         if not ('name' in self.attrs):
             self.attrs['name'] = self.attrs.get('name', self.genName())
         res.append(f'\n<{self.printTag}   cmptype="{self.CmpType}" ')
         for atr in self.attrs:
             res.append(f""" {atr}='{str(self.attrs[atr])}' """)
         if len(self.style) > 0:
             res.append(' style="')
             for elem in self.style:
                 res.append(f"""{elem};""")
             res.append('"')
         res.append(">")
         if self.innerHtml != None:
             res.append(f"{self.innerHtml}")
         return f"</{self.printTag}>", res, [],""


