from Components.BaseCtrl import BaseCtrl



class Label(BaseCtrl):
    """
      <label for="exampleInputPassword1">Password</label>
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
        self.CmpType = 'Label';
        if 'cmptype' in attrs:
            del attrs['cmptype']
        self.printTag = 'label';
        self.attrs = attrs.copy()
        self.innerHtml = innerText
        if 'caption' in self.attrs:
            self.innerHtml = self.attrs['caption']
            del self.attrs['caption']
        if 'name' not in self.attrs:
            self.attrs['name'] = self.genName()
        if 'class' not in self.attrs:
            self.classCSS = []
        else:
            self.classCSS = [i for i in attrs['class'].split(" ")]
            del self.attrs['class']

    def Show(self):
         res = []
         res.append(f'\n<{self.printTag}   cmptype="{self.CmpType}" ')
         for atr in self.attrs:
             res.append(f""" {atr}='{str(self.attrs[atr])}' """)
         if len(self.style) > 0:
             res.append(' style="')
             for elem in self.style:
                 res.append(f"""{elem};""")
             res.append('"')
         if len(self.classCSS) > 0:
             res.append(f""" class='{' '.join(self.classCSS)}'""")
         res.append(" >")
         if self.innerHtml != None:
             res.append(f"{self.innerHtml}")
         return f"</{self.printTag}>", res, [],""
