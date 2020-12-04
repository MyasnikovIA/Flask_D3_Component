    // https://github.com/miguelgrinberg/Flask-SocketIO

    //connect to the socket server.
    window.socket = io.connect('http://' + document.domain + ':' + location.port + '/socket_controller');

    /**
    *  Регистрация событие socket  для получения JS кода
    */
    window.socket.on('javascript', function(msg) {
        try{ eval(msg.eval) }catch (e) { console.log("Error: " + e); }
    });

    window.execRes = function(res){
        if (typeof res['eval'] != undefined){
            try {
              eval(res['eval'])
            }catch (e) {
              console.log('Error:',e); // передать объект исключения обработчику ошибок
            }
        }
    }
    /**
    *  Добавить одиночное событие socket события в очередь
    *  после получения данных с сервера  событие будет удалено
    */
    window.sendServer = function(name,funCollBack){
       var arr=new Array();
       if ((''+window.sendServer.arguments[1])=='[object Arguments]'){
          arr.push(window.sendServer.arguments[0]);
          for(var ind in window.sendServer.arguments){
             if (typeof window.sendServer.arguments[ind] == "function" ){
                funCollBack =  window.sendServer.arguments[ind]
             }
          }
          for(var ind in window.sendServer.arguments[1]){
            if (window.sendServer.arguments[1][ind]==undefined){
                continue;
            }
            if (typeof window.sendServer.arguments[1][ind] == "function" ){
                continue;
            }
            arr.push(window.sendServer.arguments[1][ind]); }
       }else{
          for( var ind in window.sendServer.arguments){
            if (window.sendServer.arguments[ind]==undefined){
                continue;
            }
            if(ind == 0) {continue;}
            if (typeof window.sendServer.arguments[ind] == "function" ){
                continue;
            }
            arr.push(window.sendServer.arguments[ind]);
          }
       }

       // window.localStorage.setItem(name,Date().toLocaleString());
       window.socket.send({'FunName':name,'args':arr});
       window.socket.on(name, function(msg) {
            if (typeof funCollBack == "function" ){
                funCollBack(msg);
            }else{
                window.execRes(msg);
            }
            window.socket.removeListener(name);
       });
    }