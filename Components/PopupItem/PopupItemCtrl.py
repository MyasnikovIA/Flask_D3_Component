from Components.BaseCtrl import BaseCtrl

class PopupItem(BaseCtrl):
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
        self.CmpType = 'PopupItem';
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
         self.sysinfo=[]
         res = []
         res.append(f'<li><div>{self.innerHtml}</div></li>')
         clstag = """</li>"""
         return clstag, res, self.sysinfo,""
