from Components.BaseCtrl import BaseCtrl

class Image(BaseCtrl):
    """

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
            self.CmpType = 'Image';
            if 'cmptype' in attrs:
                del attrs['cmptype']
            self.printTag = 'img';
            self.attrs = attrs.copy()
            if 'title' not in self.attrs:
                self.attrs['title'] = ""
            if 'class' not in self.attrs:
                self.classCSS = ['D3Image']
            else:
                self.classCSS = [i for i in attrs['class'].split(" ")]
                del self.attrs['class']
            if 'D3Image' not in self.classCSS:
                self.classCSS.append('D3Image')
            if 'src' not in self.attrs:
                self.classCSS.append('ctrl_hidden')
            if 'ctrl_hidden' in self.attrs:
                del self.attrs['ctrl_hidden']
            if 'name' not in self.attrs:
                self.attrs['name'] = self.genName()
            if 'tabindex' not in self.attrs:
                self.attrs['tabindex'] = 0

    def Show(self):
        res = []
        atr = "  ".join(f"{k}='{v}'" for k, v in self.attrs.items())
        res.append(f"""
             <img      {atr}  cmptype="Image"  class="{" ".join(self.classCSS)}" />
             """)
        return f"  ", res, [],""
