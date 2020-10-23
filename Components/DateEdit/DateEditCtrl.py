from Components.BaseCtrl import BaseCtrl

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
        self.CmpType = 'DateEdit';
        if 'cmptype' in attrs:
            del attrs['cmptype']
        self.printTag = 'div';
        self.attrs = attrs.copy()
        if 'name' not in self.attrs:
            self.attrs['name'] = self.genName()
        if 'title' not in self.attrs:
            self.attrs['title'] = ""
        if 'shows_time' in self.attrs:
            self.attrs['mask_type'] = "datetime"
            del self.attrs['shows_time']
        else:
            self.attrs['mask_type'] = "date"
        self.readonly=""
        if 'readonly' in self.attrs:
            self.readonly = ' readonly="readonly" '
            del self.attrs['readonly']
        self.disabled=""
        if 'disabled' in self.attrs:
            self.disabled = ' disabled="disabled" '
            del self.attrs['disabled']
        self.placeholder=""
        if 'placeholder' in self.attrs:
            self.placeholder = f' placeholder="{self.attrs["placeholder"]}"'
            del self.attrs['placeholder']
        self.value=""
        if 'value' in self.attrs:
            self.value = f' value="{self.attrs["value"]}" '
            del self.attrs['value']
        if 'class' not in self.attrs:
            self.classCSS = ["ctrl_dateEdit","editControl"]
        else:
            self.classCSS = [i for i in attrs['class'].split(" ")]
            del self.attrs['class']
        if 'ctrl_dateEdit' not in  self.classCSS:
            self.classCSS.append('ctrl_dateEdit')
        if 'editControl' not in  self.classCSS:
            self.classCSS.append('editControl')
        self.events = "  ".join(f"{k}='{v}'" for  k, v in self.attrs.items() if k[:2] == "on")

    def Show(self):
        res = []
        atr = "  ".join(f'{k}="{v}"' for k, v in self.attrs.items())
        res.append(f"""
          <div class="{" ".join(self.classCSS)}"  cmptype="{self.CmpType}"  style="{" ".join(self.style)}"  {atr} >
               <div class="editControlInner">
                   <input  cmpparse="true"  type="text" {self.readonly}{self.disabled}{self.placeholder}{self.value} {self.events}/>
               </div>
               <div cmpparse="DateEdit"  onclick="return D3Api.DateEditCtrl.showCalendar(this);"  class="img-calendar" title="Выбрать из календаря"></div>
               <div cmptype="Base" name="{self.attrs['name']}_showCalendar"></div>
           </div>
           <div  cmptype="Mask"   name="mask{self.attrs['name']}"   controls="{self.attrs['name']}"  style="display:none">
        """)
        return f"</div>", res, [],""
