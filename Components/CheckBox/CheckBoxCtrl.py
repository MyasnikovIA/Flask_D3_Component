from Components.BaseCtrl import BaseCtrl


class CheckBox(BaseCtrl):
    """
       <div  name="testNam" cmptype="CheckBox" title="" valuechecked="1" valueunchecked="0"  class=""         >
           <label>
             <input type="checkbox"  /><span>запустить runDataSet</span>
           </label>
       </div>

       <div class="form-check">
         <input type="checkbox" class="form-check-input"  />
         <cmpLabel class="form-check-label" >Check me out</cmpLabel>
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
        self.CmpType = 'CheckBox';
        if 'cmptype' in attrs:
            del attrs['cmptype']
        self.printTag = 'div';
        self.attrs = attrs.copy()
        self.innerHtml = innerText
        if 'valuechecked' not in self.attrs:
            self.attrs['valuechecked'] = "1"
        if 'valueunchecked' not in self.attrs:
            self.attrs['valueunchecked'] = "0"
        if 'title' not in self.attrs:
            self.attrs['title'] = ""
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
        if 'form-check' not in self.classCSS:
            self.classCSS.append('form-check')
        listProp = ['readonly','disabled','placeholder','maxlength']
        self.elProp = "  ".join(f"{k}='{v}'" for  k, v in self.attrs.items() if k in listProp)

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
        res.append(f""" <input type="checkbox" class="form-check-input" {self.elProp} />""")
        if self.innerHtml != None:
            res.append(f""" <span class="form-check-label"  style="padding-left: 15px;" >{self.innerHtml}</span>""")
        return f"</{self.printTag}>", res ,[], ""
