from Components.BaseCtrl import BaseCtrl


class DataSetVar(BaseCtrl):
    def __init__(self, PageInfo={}, attrs={}, innerText=""):
        self.PageInfo = PageInfo
        self.CmpType = 'var'
        self.printTag = 'var'
        self.innerHtml = innerText
        self.attrs = attrs.copy()
        if (('put' in self.attrs) and (len(self.attrs['put']) == 0)):
            self.attrs['put'] = f"{self.attrs['name']}"
        if (('put' not in self.attrs) and (('get' not in self.attrs) or (len(self.attrs['put']) == 0))):
            self.attrs['get'] = f"{self.attrs['name']}"
        if 'src' not in self.attrs:
            self.attrs['src'] = self.attrs['name']
        del self.attrs['name']

    def Show(self):
        if self.attrs['srctype'] == 'session':
            return "", [], [], ""
        self.sysinfo = []
        self.elProp = "  ".join(f"{k}='{v}'" for k, v in self.attrs.items())
        self.sysinfo.append(f"""\n<{self.printTag}  {self.elProp} ></{self.printTag}>""")
        return "", [], self.sysinfo, ""
