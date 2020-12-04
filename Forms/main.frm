<div cmptype="Form" class="Main ActiveDashBoard box-sizing-force"  oncreate="Form.onCreate()"  onshow="Form.onShow();" name="MAINFORM" title="Тестовое окно" >
    <cmpScript name="ffffff">
        <![CDATA[
            Form.onCreate = function() {
                setVar('form_params','Входная переменная из JS');
                setVar('ImputVar',' Импут Вар 1');
            }
            Form.onShow = function() {
                setCaption('MyLabelTest',"456756745674567");
            }

            Form.SetLab = function() {
                setCaption('LIC_DATE', "998776654544332121");
            }
            Form.MySendJS = function() {
               refreshDataSet('DB_MyDataSet', function(){
                      console.log( getDataSet('DB_MyDataSet') );
                      setValue("MyEdit","fffffffffff");
               });
            }
            Form.onRunModule = function() {
               setVar("form_params","fffffffff")
               executeAction('checkHelpRight', function(){
                    alert(getVar('can_edit'));
               });
               setValue("MyEdit","98989889")
            }
        ]]>
    </cmpScript>

    <component cmptype="Label" name="LIC_DATE"/>
    <cmpLabel name="MyLabelTest" caption="ddddddddd"></cmpLabel>
    <cmpEdit name="MyEdit"/>

    <cmpButton name='test' caption="запустить Модальное окно " onclick="Form.MySendJS()" ></cmpButton>

    <cmpLabel caption="ddddddddd"/>
   <br/>
    <cmpButton name='test' caption=" Form.SetLab" onclick=" Form.SetLab()" ></cmpButton>


   <div  repeat="0"  name="cmp5fc742f86a9b7" repeatername="rep_5fc742f86a9cf" dataset="DB_MyDataSet"  >
        <cmpLabel  data="value:id;caption:FULLNAME"/>
   </div>

    <cmpDataSet name="DB_MyDataSet" query_type="server_python"  activateoncreate="false"  >
         aa=form_params
         data = []
         data.append({"id":1,"FULLNAME":"Текст из Python  кода 1"})
         data.append({"id":2,"FULLNAME":"Текст из Python  кода 2"})
         data.append({"id":3,"FULLNAME":"Текст из Python  кода 3"})
         data.append({"id":4,"FULLNAME":"Текст из Python  кода 4"})
         data.append({"id":5,"FULLNAME":"Текст из Python  кода 5"})
         data
        <cmpDataSetVar name="form_params"    src="form_params"   srctype="var"/>
    </cmpDataSet>
    <cmpSubForm  path="mainSub"/>


    <cmpAction name="checkHelpRight" query_type="server_python">
         can_edit = [1,2,3,4,5,form_params]
         varNoVisible=[1,2,3,4,5]
        <cmpActionVar name="form_params"    src="form_params"   srctype="var"/>
        <cmpActionVar name="can_edit"       src="can_edit"      srctype="var" put=""/>
    </cmpAction>


    <cmpButton name='test' caption="Form.onRunModule" onclick="Form.onRunModule()" />


</div>

