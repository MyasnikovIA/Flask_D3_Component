from Components.BaseCtrl import *


class Label(BaseCtrl):

    def __init__(self, PageInfo={}, attrs={}, innerText="", parent=None):
        self.events = {}
        self.classCSS = []
        self.style = getDomAttrRemove('style', None, self.attrs);
        self.PageInfo = PageInfo
        self.CmpType = 'Label';
        if 'cmptype' in attrs:
            del attrs['cmptype']
        self.printTag = 'span';
        self.attrs = attrs.copy()
        self.innerHtml = innerText
        # ============== INIT Html Class =========================
        if 'class' not in self.attrs:
            self.classCSS = ['label', ]
        else:
            self.classCSS = [i for i in attrs['class'].split(" ")]
            del self.attrs['class']
        if ('label' not in self.classCSS):
            self.classCSS.append('label')
        # ========================================================
        self.name = RemoveArrKeyRtrn(self.attrs, 'name',self.genName())
        self.format = RemoveArrKeyRtrn(self.attrs, 'format')
        self.caption = RemoveArrKeyRtrn(self.attrs, 'caption')
        self.before_caption = ArrKeyRtrn(self.attrs, 'before_caption');
        self.after_caption = ArrKeyRtrn(self.attrs, 'after_caption');
        if (self.caption == '_'):
            self.caption = '';
        self.note = ""
        note = RemoveArrKeyRtrn(self.attrs, 'note')
        if len(note) > 0:
            note_style = []
            note_offset = RemoveArrKeyRtrn(self.attrs, 'note_offset')
            if len(note_offset) > 0:
                note_style.append(f'bottom:{note_offset};')
            note_size = RemoveArrKeyRtrn(self.attrs, 'note_size')
            if len(note_size) > 0:
                note_style.append(f'font-size:{note_size};')
            note_width = RemoveArrKeyRtrn(self.attrs, 'note_width')
            if len(note_width) > 0:
                note_style.append(f'min-width:{note_width};')
            self.note = f'<span class="labelNote" style="{note_style}">{note}</span>';
        if ('format' in self.attrs) and ('onformat' not in self.attrs):
            self.attrs['onformat'] = f'D3Api.LabelCtrl.format(this, {self.attrs["format"]}, arguments[0]);'
        self.data = getDomAttrRemove('data', None, self.attrs);


    def Show(self):
        eventsStr = "  ".join(f"{k}='{v}'" for k, v in self.attrs.items() if k[:2] == "on")
        atr = "  ".join(f"{k}='{v}'" for k, v in self.attrs.items() if not k[:2] == "on")
        if len(self.classCSS) > 0:
            classCSSStr = f""" class='{' '.join(self.classCSS)}'"""
        else:
            classCSSStr = ""
        showtext = f"""
                <span  cmptype="{self.CmpType}" name="{self.name}" {classCSSStr}  {self.style} {eventsStr} {self.data}> {self.before_caption}{self.caption}{self.after_caption}{self.note} {atr}"""
        self.sysinfo = []
        self.sysinfo.append("<scriptfile>Components/Label/js/Label.js</scriptfile>")
        self.sysinfo.append("<cssfile>Components/Label/css/Label.css</cssfile>")
        return f"</{self.printTag}>",[showtext], self.sysinfo, ""
