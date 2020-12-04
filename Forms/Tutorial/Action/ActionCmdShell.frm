<div cmptype="Form" >
     <!--
        D3Api.showForm('Tutorial/Action/ActionCmdShell');
     -->
    <cmpScript name="ffffff">
        <![CDATA[
            Form.onRunModule = function() {
               setVar("url_ping","www.google.ru")
               executeAction('runShellScript', function(){
                    alert(getVar('console'));
               });
            }
        ]]>
    </cmpScript>
    <cmpAction name="runShellScript" query_type="server_shell">
        ping www.yandex.ru
        <cmpActionVar name="url_ping"  src="url_ping"   srctype="var"/>
        <cmpActionVar name="console"   src="console"    srctype="var" put=""/>
    </cmpAction>
    <cmpButton name='test' caption="ActionCmdShell" onclick="Form.onRunModule()" />
</div>

