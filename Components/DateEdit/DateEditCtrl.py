from Components.BaseCtrl import *

class DateEdit(BaseCtrl):
    """
          <div class="ctrl_dateEdit editControl"  name="ctrlDATE_BEGIN" cmptype="DateEdit" title="" style=""mask_type="date">
               <div class="editControlInner">
                   <input  cmpparse="true"  type="text"  />
               </div>
               <div cmpparse="DateEdit"  onclick="return D3Api.DateEditCtrl.showCalendar(this);"  class="img-calendar" title="Выбрать из календаря"></div>
               <div cmptype="Base" name="ctrlDATE_BEGIN_showCalendar"></div>
           </div>
           <div  cmptype="Mask"   name="cmp5f7de446e442f"   controls="ctrlDATE_BEGIN"  style="display:none">
         </div>

    """

    def __init__(self, PageInfo={}, attrs={}, innerText="",parent = None):
        self.style = []
        self.classCSS = []
        for name in self.argsToStyleList:
            if name in attrs:
                self.style.append(f"{name}:{attrs[name]}")
                del attrs[name]

        self.PageInfo = PageInfo
        self.CmpType = 'DateEdit';
        if 'cmptype' in attrs:
            del attrs['cmptype']
        self.printTag = 'div';
        self.attrs = attrs.copy()

        # self.style = [i for i in attrs['style'].split(";")]
        self.style = getDomAttrRemove('style', None, self.attrs);
        self.name = RemoveArrKeyRtrn(self.attrs, 'name', self.genName())
        self.title = getDomAttrRemove('title', None, self.attrs);
        self.shows_time = RemoveArrKeyRtrn(self.attrs, 'shows_time', '')
        if len(self.shows_time) > 0:
            self.shows_time = ' mask_type="datetime" shows_time="shows_time" '
        else:
            self.shows_time = ' mask_type="date" '
        self.readonly = getDomAttrRemove('readonly', None, self.attrs);
        self.disabled = getDomAttrRemove('disabled', None, self.attrs);
        self.placeholder = getDomAttrRemove('placeholder', None, self.attrs);
        self.value = getDomAttrRemove('value', None, self.attrs);

        if 'class' not in self.attrs:
            self.classCSS = ["ctrl_dateEdit","editControl"]
        else:
            self.classCSS = [i for i in attrs['class'].split(" ")]
            del self.attrs['class']
        if 'ctrl_dateEdit' not in  self.classCSS:
            self.classCSS.append('ctrl_dateEdit')
        if 'editControl' not in  self.classCSS:
            self.classCSS.append('editControl')


    def Show(self):
        eventsStr = "  ".join(f"{k}='{v}'" for k, v in self.attrs.items() if k[:2] == "on")
        atr = "  ".join(f"{k}='{v}'" for k, v in self.attrs.items() if not k[:2] == "on")
        showtext = f"""
          <div class="{" ".join(self.classCSS)}" name="{self.name}" cmptype="{self.CmpType}"  {self.style} {atr} {self.shows_time}   >
               <div class="editControlInner">
                   <input  cmpparse="true"  type="text" {self.readonly} {self.disabled} {self.placeholder} {self.value} {eventsStr}/>
               </div>
               <div cmpparse="DateEdit"  onclick="return D3Api.DateEditCtrl.showCalendar(this);"  class="img-calendar" title="Выбрать из календаря"></div>
               <div cmptype="Base" name="{self.name}_showCalendar"></div>
           </div>
           <div  cmptype="Mask"   name="mask{self.name}"   controls="{self.name}"  style="display:none">
        """
        self.sysinfo = []
        self.sysinfo.append("<scriptfile>Components/DateEdit/js/DateEdit.js</scriptfile>")
        self.sysinfo.append("<cssfile>Components/DateEdit/css/DateEdit.css</cssfile>")
        self.sysinfo.append("<scriptfile>Components/Mask/js/Mask.js</scriptfile>")
        self.sysinfo.append("<cssfile>Components/Mask/css/Mask.css</cssfile>")
        return f"</{self.printTag}>", [showtext], self.sysinfo, ""

