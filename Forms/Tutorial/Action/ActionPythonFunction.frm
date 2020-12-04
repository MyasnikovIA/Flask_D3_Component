<div cmptype="Form">
    <!--
       D3Api.showForm('Tutorial/Action/ActionPythonFunction');
    -->
    <cmpScript name="ffffff">
        <![CDATA[
            Form.onRunModule = function() {
               setVar("arg1","fffffffff")
               setVar("retarg2","***********")
               executeAction('runPythonFunction', function(){
                    console.log('return',getVar('return'));
                    console.log('retarg2',getVar('retarg2'));
               });
            }
        ]]>
    </cmpScript>
    <cmpAction name="runPythonFunction" action="Tutorial.Action.pyScript.tutorialPyScript.runScriptFromWeb">
        <cmpActionVar name="arg1" src="arg1" srctype="var"/>
        <cmpActionVar name="retarg2" src="retarg2" srctype="var" put=""/>
        <cmpActionVar name="console" src="console" srctype="var" put=""/>
        <cmpActionVar name="return" src="return" srctype="var" put=""/>
    </cmpAction>
    <cmpLabel caption="Forms/Tutorial/Action/pyScript/tutorialPyScript.py"/>
    <cmpButton name='test' caption="runPythonFunction Tutorial.Action.pyScript.tutorialPyScript.runScriptFromWeb" onclick="Form.onRunModule()"/>
</div>

