<div cmptype="Form" oncreate="Form.onCreate()"  onshow="Form.onShow()"  caption="Дочернее окно">
    <!--
       D3Api.showForm('Tutorial/DataSet/DataSetPythonScript');
    -->
    <cmpScript name="ffffff">
        <![CDATA[
            Form.onCreate = function() {
               console.log('AGENT_ID',getVar("AGENT_ID"));
            }
            Form.onShow = function(){
                console.log('AGENT_ID',getVar("AGENT_ID"));
                setValue('ImputComponrntParent',getVar("AGENT_ID"));
            }

            Form.onRunDataSet = function() {
                setVar('form_params','VarFromWebForm');
                refreshDataSet('DB_MyDataSet');
            }
            Form.OnButtonOk = function() {
                 close({'return': getValue('MySel'), 'return_txt': getCaption('MySel') , 'ModalResult': 1 });
            }
        ]]>
    </cmpScript>

    <cmpDataSet name="DB_MyDataSet" query_type="server_python" activateoncreate="true" >
        data = []
        data.append({"id":1,"FULLNAME":"text1"})
        data.append({"id":2,"FULLNAME":"text2"})
        data.append({"id":3,"FULLNAME":"text3"})
        data.append({"id":4,"FULLNAME":"text4"})
        data.append({"id":5,"FULLNAME":"text5"})
    </cmpDataSet>
 <br/> <cmpLabel caption="Значение из родительского окна"/> <cmpEdit name="ImputComponrntParent" value=""/>
 <br/> <cmpComboBox class="form-control" name="MySel">
         <cmpComboItem dataset="DB_MyDataSet" repeat="0" data="value:id;caption:FULLNAME"/>
    </cmpComboBox>
    <br/>
    <cmpButton name='test' caption="Load Combobox DataSet" onclick="Form.onRunDataSet()"/>

  <br/>  <br/>
		<cmpButton  name="ButtonOk" onclick="Form.OnButtonOk();" caption="Сохранить" />
		<cmpButton onclick="closeWindow();" caption="Отмена" />


</div>


