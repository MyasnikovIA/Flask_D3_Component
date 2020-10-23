from Components.BaseCtrl import BaseCtrl



class Button(BaseCtrl):
    """
    <div  onclick="Form.runDataSet()" cmptype="Button" name="cmp5f7b4c4706deb" title=""  tabindex="0" class="ctrl_button box-sizing-force" style="width: 255px;">
       <div class="btn_caption btn_center minwidth" >запустить runDataSet</div>
    </div>

    <button type="button" class="btn btn-primary">Primary</button>
    """
    def __init__(self, PageInfo={}, attrs={}, innerText=""):
        self.style = []
        self.classCSS=[]
        if 'style' in attrs:
            self.style = [i for i in attrs['style'].split(";")]
            del attrs['style']
        for name in self.argsToStyleList:
            if name in attrs:
                self.style.append(f"{name}:{attrs[name]}")
                del attrs[name]

        self.PageInfo = PageInfo
        self.CmpType = 'Button';
        if 'cmptype' in attrs:
            del attrs['cmptype']
        self.printTag = 'span';
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
        if ('btn' in self.attrs):
            self.classCSS.append('btn')
            self.classCSS.append(f'btn-{self.attrs["btn"]}')
            del self.attrs['btn']
        else:
            if 'btn' not in self.classCSS:
                self.classCSS.append('btn')
                self.classCSS.append('btn-primary')

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
         return f"</{self.printTag}>", res, [], ""
