<div cmptype="Form" >
     <!--
        D3Api.showForm('Tutorial/Action/ActionPythonScript');
     -->
    <cmpScript name="ffffff">
        <![CDATA[
            Form.onRunModule = function() {
               setVar("form_params","fffffffff")
               executeAction('checkHelpRight', function(){
                    alert(getVar('can_edit'));
               });
            }
        ]]>
    </cmpScript>
    <cmpAction name="checkHelpRight" query_type="server_python">
         can_edit = [1,2,3,4,5,form_params]
         varNoVisible=[1,2,3,4,5]
        <cmpActionVar name="form_params"    src="form_params"   srctype="var"/>
        <cmpActionVar name="can_edit"       src="can_edit"      srctype="var" put=""/>
    </cmpAction>
    <cmpButton name='test' caption="Form.onRunModule" onclick="Form.onRunModule()" />
</div>

