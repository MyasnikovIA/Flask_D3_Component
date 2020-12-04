<div cmptype="Form" onshow="Form.onCreate()">
     <!--
        D3Api.showForm('Tutorial/ComboBox/ComboBoxDataSet');
     -->
    <cmpScript name="ffffff">
        <![CDATA[
            Form.onCreate = function() {
               setVar("form_params","dddddddd");
               refreshDataSet('DB_MyDataSet');
            }
        ]]>
    </cmpScript>
   <div  repeat="0"  name="cmp5fc742f86a9b7" repeatername="rep_5fc742f86a9cf" dataset="DB_MyDataSet"  >
        ss<cmpLabel  data="value:ID;caption:FULLNAME"/>
   </div>
    <cmpDataSet name="DB_MyDataSet" query_type="server_python" >
         aa=1111
         data = []
         data.append({"ID":1,"FULLNAME":"Текст из Python  кода 1"})
         data.append({"ID":2,"FULLNAME":"Текст из Python  кода 2"})
         data.append({"ID":3,"FULLNAME":"Текст из Python  кода 3"})
         data.append({"ID":4,"FULLNAME":"Текст из Python  кода 4"})
         data.append({"ID":5,"FULLNAME":"Текст из Python  кода 5"})
         data
        <cmpDataSetVar name="form_params"    src="form_params"   srctype="var"/>
    </cmpDataSet>
        <cmpComboBox class="form-control" name="MySel">
            <cmpComboItem caption="" value=""/>
            <cmpComboItem caption="2" value="2"/>
            <cmpComboItem caption="3" value="3"/>
            <cmpComboItem caption="4" value="4"/>
            <cmpComboItem dataset="DB_MyDataSet" repeat="0" data="value:ID;caption:FULLNAME"/>
        </cmpComboBox>

</div>

