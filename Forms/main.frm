<div cmptype="Form" class="Main ActiveDashBoard box-sizing-force"  oncreate="Form.onCreate()" name="MAINFORM" title="Тестовое окно" >
    <cmpScript name="ffffff">
        <![CDATA[
            Form.onCreate = function() {
               setVar("form_params","dddddddd");
               refreshDataSet('DB_MyDataSet');
            }
            Form.MySendJS = function() {
                openD3Form('main',true)
            }
        ]]>
    </cmpScript>

    <cmpButton id='test' caption="запустить Модальное окно " btn="outline-primary" onclick="Form.MySendJS()" ></cmpButton>

    <cmpDataSet name="DB_MyDataSet" query_type="server_python">
         aa=1111
         data = []
         data.append({"id":1,"FULLNAME":"Текст из Python  кода 1"})
         data.append({"id":2,"FULLNAME":"Текст из Python  кода 2"})
         data.append({"id":3,"FULLNAME":"Текст из Python  кода 3"})
         data.append({"id":4,"FULLNAME":"Текст из Python  кода 4"})
         data.append({"id":5,"FULLNAME":"Текст из Python  кода 5"})
         data
        <cmpDataSetVar name="form_params"    src="form_params"   srctype="var"/>
    </cmpDataSet>


        <cmpComboBox class="form-control" name="MySel">
            <cmpComboItem caption="" value=""/>
            <cmpComboItem caption="2" value="2"/>
            <cmpComboItem caption="3" value="3"/>
            <cmpComboItem caption="4" value="4"/>
            <cmpComboItem dataset="DB_MyDataSet" repeat="0" data="value:id;caption:FULLNAME"/>
        </cmpComboBox>

<!-- ===============================            -->
</div>

