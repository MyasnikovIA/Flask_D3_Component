<div cmptype="Form" oncreate="Form.onCreate()"   >
    <!--
       D3Api.showForm('Tutorial/DataSet/DataSetPythonScript');
    -->
    <cmpScript name="ffffff">
        <![CDATA[
            Form.onCreate = function() {
              setVar('form_params','VarFromWebForm_INIT');
            }
            Form.onRunDataSet = function() {
                setVar('form_params','VarFromWebForm');
                refreshDataSet('DB_MyDataSet');
            }
        ]]>
    </cmpScript>

    <cmpDataSet name="DB_MyDataSet" query_type="server_python" activateoncreate="true" >
        bb=f"form_params = {form_params} "
        data = []
        data.append({"id":1,"FULLNAME":f"text1 {form_params}"})
        data.append({"id":2,"FULLNAME":"text2"})
        data.append({"id":3,"FULLNAME":"text3"})
        data.append({"id":4,"FULLNAME":"text4"})
        data.append({"id":5,"FULLNAME":"text5"})
        <cmpDataSetVar name="form_params" src="form_params" srctype="var"/>
    </cmpDataSet>

    <div repeat = "0"  dataset = "DB_MyDataSet"  >
        <cmpLabel data="caption:id"></cmpLabel>
        <cmpEdit  data="value:FULLNAME" />
    </div>
    <cmpComboBox class="form-control" name="MySel">
         <cmpComboItem dataset="DB_MyDataSet" repeat="0" data="value:id;caption:FULLNAME"/>
    </cmpComboBox>
    <br/>
    <cmpButton name='test' caption="onRunDataSet" onclick="Form.onRunDataSet()"/>
</div>


