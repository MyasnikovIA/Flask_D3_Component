<div cmptype="Form" class="Main ActiveDashBoard box-sizing-force"  oncreate="Form.onCreate()" name="MAINFORM" >
    <cmpScript name="ffffff">
        <![CDATA[
            Form.onCreate = function() {
              // openForm('main_old');
              // alert(1)
            }
            Form.MySendPHP = function() {
               setVar("form_params","fffffffff")
               executeAction('checkHelpRight', function(){
                    alert(getVar('can_edit'));
                    alert(getVar('console'));
               });
               // alert("MySendPHP 222");
            }

            Form.MyrunShellScript = function() {
               setVar("url_ping","www.google.ru")
               executeAction('runShellScript', function(){
                    alert(getVar('console'));
               });
            }
            Form.MyrunShellScript2 = function() {
               executeAction('runShellScript2', function(){
                    alert(getVar('console'));
               });
            }


            Form.MyrunPythonFunction = function() {
               setVar("arg1","www.google.ru")
               executeAction('runPythonFunction', function(){
                    alert(getVar('retarg2'));
                    alert(getVar('console'));
               });
            }

            Form.InputTest = function() {
               setValue('inputTest',"kkkkkkkkkkkkkkk");
               alert(getValue('inputTest'));
            }

        ]]>
    </cmpScript>
     <cmpButton caption="запустить Action" onclick="Form.MySendPHP()"></cmpButton>
     <cmpButton caption="запустить PythonFunction" onclick="Form.MyrunPythonFunction()"></cmpButton>
<br/>
     <cmpEdit caption="запустить Action" value="dddddd" name="inputTest"></cmpEdit>
     <cmpButton caption="Edit" onclick="Form.InputTest();"></cmpButton>


     <cmpAction name="checkHelpRight" query_type="server_python">
         print('ddddddddddddddd')
         can_edit = 123
         a=[1,2,3,4,5]
         for b in a:
            print(b)
        <cmpActionVar name="form_params"    src="form_params"   srctype="var"/>
        <cmpActionVar name="file_path"      src="file_path"     srctype="var" put=""/>
        <cmpActionVar name="can_edit"       src="can_edit"      srctype="ctrl" put=""/>
        <cmpActionVar name="console"        src="console"       srctype="ctrl" put=""/>
    </cmpAction>

    <cmpEdit  value="dddddd" name="can_edit"></cmpEdit>

<br/>

     <cmpButton caption="запустить MyrunShellScript" onclick="Form.MyrunShellScript()"></cmpButton>
     <cmpButton caption="запустить MyrunShellScript" onclick="Form.MyrunShellScript2()"></cmpButton>



    <cmpAction name="runShellScript" query_type="server_shell">
        ping www.yandex.ru
        <cmpActionVar name="url_ping"  src="url_ping"   srctype="var"/>
        <cmpActionVar name="console"   src="console"    srctype="var" put=""/>
    </cmpAction>
    <cmpAction name="runShellScript2" query_type="server_shell">
        ping www.google.ru
        <cmpActionVar name="url_ping"  src="url_ping"   srctype="var"/>
        <cmpActionVar name="console"   src="console"    srctype="var" put=""/>
    </cmpAction>


     <cmpAction name="runPythonFunction" action="testScript.test.runScriptFromWeb">
        <cmpActionVar name="arg1"      src="arg1"      srctype="var"/>
        <cmpActionVar name="retarg2"   src="retarg2"   srctype="var" put=""/>
        <cmpActionVar name="console"   src="console"   srctype="var" put=""/>
    </cmpAction>

    <cmpTextArea value="dddddd" name="console" height="320px" width="240px" left="200px"></cmpTextArea>


</div>

