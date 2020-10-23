from flask_socketio import SocketIO, emit
from flask import Flask, render_template, request
import mimetypes
import json
import importlib
import os
import io
from contextlib import redirect_stdout
from inspect import getfullargspec
from getform import *

# import inspect

__author__ = 'MyasnikovIA'
global APPFLASK
APPFLASK = Flask(__name__)
APPFLASK.config['SECRET_KEY'] = 'secret!'
APPFLASK.config['DEBUG'] = True
APPFLASK.config['HOST'] = '0.0.0.0'

global SESSION
SESSION = {}

socketio = SocketIO(APPFLASK, async_mode=None, logger=True, engineio_logger=True)


# =========================================================================================================
# =====================  Обработка Socket IO  =============================================================
# HTML:
#    <script src="static/js/jquery.min.js"></script>
#    <script type="text/javascript" src="static/js/socket.io.min.js"></script>
#    <script src="static/js/application.js"></script>
# JS:
#   sendServer('control.test.MyTestFun', function(msg) { $('#mycontent').text(msg); }, 111, 2222222)
# =========================================================================================================

@socketio.on('message', namespace='/socket_controller')
def message_from_socketio(message):
    """обработка запуска Python функции из JS кода"""
    if 'FunName' in message:
        defName = message['FunName']
        if '.' in defName:

            packName = defName[:defName.rfind('.')]
            defName = defName[defName.rfind('.') + 1:]
            meth = importlib.import_module(packName)
            with io.StringIO() as buf, redirect_stdout(buf):
                if hasattr(meth, defName):
                    function_name = getattr(meth, defName)
                    try:
                        # infoMeth = inspect.getfullargspec(function_name)
                        infoMeth = getfullargspec(function_name)
                        funArgsNameList = infoMeth.args
                        funArgsDefaultsList = infoMeth.defaults
                        del infoMeth
                        rgsVar = {}
                        indDef = -1
                        for nam in funArgsNameList:
                            indDef += 1
                            if message['args'][indDef]:
                                rgsVar[nam] = message['args'][indDef]
                            elif funArgsDefaultsList[indDef]:
                                rgsVar[nam] = funArgsDefaultsList[indDef]
                            else:
                                rgsVar[nam] = None
                        del indDef, funArgsNameList, funArgsDefaultsList
                        res = function_name(**rgsVar)
                        del meth, function_name, rgsVar
                    except Exception:
                        socketio.emit('javascript', {'eval': f""" console.log("error run","{defName}","{message}") """},
                                      namespace='/socket_controller')
                        return
                    if res == None:
                        socketio.emit(message['FunName'], buf.getvalue(), namespace='/socket_controller')
                    else:
                        socketio.emit(message['FunName'], res, namespace='/socket_controller')
                else:
                    socketio.emit(message['FunName'], {'eval': f""" console.log("No def","{message}") """},
                                  namespace='/socket_controller')
                    return
            socketio.emit(message['FunName'], {'eval': f""" console.log("{message}") """},
                          namespace='/socket_controller')
        else:
            socketio.emit('javascript', {'eval': f""" console.log("error","{message}") """},
                          namespace='/socket_controller')


@socketio.on('connect', namespace='/socket_controller')
def socket_connect():
    """обработка нового подключения"""
    print('Client connected', request.sid)


@socketio.on('disconnect', namespace='/socket_controller')
def socket_disconnect():
    """обработка отключения"""
    print('Client disconnected', request.sid)


# =========================================================================================================
# =========================================================================================================


@APPFLASK.errorhandler(404)
def not_found(error):
    the_path = request.query_string
    expansion = the_path[the_path.rfind(".") + 1:].lower()
    if expansion == 'frm':  # обработка  страниц с расширением '*.frm' не дописано
        pass
    return render_template('404.html', **locals()), 404


@APPFLASK.route('/')
def index():
    return render_template('index.html')

def mimeType(pathFile):
    extList = {"py": "text/html", "psp": "text/html", "css": "text/css", "js": "application/x-javascript",
                     "xml": "text/xml", "dtd": "text/xml", "txt": "text/plain", "inf": "text/plain",
                     "nfo": "text/plain",
                     "php": "text/plain", "html": "text/html", "csp": "text/html", "htm": "text/html",
                     "shtml": "text/html",
                     "shtm": "text/html", "stm": "text/html", "sht": "text/html", "sht": "text/html",
                     "csp": "text/html",
                     "mac": "text/html", "cls": "text/html", "jpg": "image/jpeg", "cos": "text/html",
                     "mpeg": "video/mpeg",
                     "mpg": "video/mpeg", "mpe": "video/mpeg", "ai": "application/postscript", "zip": "application/zip",
                     "zsh": "text/x-script.zsh", "x-png": "image/png", "xls": "application/x-excel",
                     "xlm": "application/excel",
                     "wav": "audio/x-wav", "txt": "text/plain", "tiff": "image/tiff", "tif": "image/x-tiff",
                     "text": "text/plain",
                     "swf": "application/x-shockwave-flash", "sprite": "application/x-sprite",
                     "smil": "application/smil",
                     "sh": "text/x-script.sh", "rtx": "text/richtext", "rtf": "text/richtext",
                     "pyc": "application/x-bytecode.python",
                     "png": "image/png", "pic": "image/pict", "mp3": "video/mpeg", "mp2": "video/mpeg",
                     "movie": "video/x-sgi-movie",
                     "mov": "video/quicktime", "mjpg": "video/x-motion-jpeg", "mime": "www/mime",
                     "mif": "application/x-mif",
                     "midi": "audio/midi", "js": "application/javascript", "jpeg": "image/jpeg", "jps": "image/x-jps",
                     "jam": "audio/x-jam",
                     "jav": "text/plain", "java": "text/x-java-source", "htm": "text/html", "html": "text/html",
                     "gzip": "application/x-gzip", "gif": "image/gif", "gl": "video/gl", "csh": "text/x-script.csh",
                     "css": "text/css", "bsh": "application/x-bsh", "bz": "application/x-bzip",
                     "bz2": "application/x-bzip2",
                     "c": "text/plain", "c++": "text/plain", "cat": "application/vnd.ms-pki.seccat", "cc": "text/plain",
                     "htmls": "text/html", "bmp": "image/bmp", "bm": "image/bmp", "avi": "video/avi",
                     "avs": "video/avs-video",
                     "au": "audio/basic", "arj": "application/arj", "art": "image/x-jg", "asf": "video/x-ms-asf",
                     "asm": "text/x-asm",
                     "asp": "text/asp"}
    ext = pathFile[pathFile.rfind('.')+1:]
    if ext in extList:
       return extList[ext]
    return "text/html"

def sendCostumBin(pathFile):
    if os.path.isfile(pathFile):
        with open(pathFile, "rb") as f:
            return f.read(), mimeType(pathFile)
    else:
        return f"File {pathFile} not found", mimeType(".txt")


@APPFLASK.route('/<path:the_path>', methods=['GET', 'POST'])
def all_other_routes(the_path):
    """
        Обработка всех запросов от пользователя
    """
    rootDir = os.path.dirname(__file__)


    if '~Cmp' in the_path:
        bin , mime = sendCostumBin(os.path.abspath(os.path.join(os.path.dirname(__file__), 'Components', the_path[the_path.find("~Cmp")+4:])))
        return bin, 200, {'content-type': mime}

    if 'Components/' in the_path:
        bin , mime = sendCostumBin(os.path.abspath(os.path.join(os.path.dirname(__file__), the_path)))
        return bin, 200, {'content-type': mime}

    if the_path == "getform.php":
        formName = getParam('Form')
        cache = getParam('cache')
        dataSetName = getParam('DataSet', "")
        frm = getParsedForm(formName, cache, dataSetName)
        return frm, 200

    if the_path == "request.php":
        formName = getParam('Form')
        cache = getParam('cache')
        queryActionObject = json.loads(request.form['request'])
        resultTxt = "111"
        for name in queryActionObject:
            resultTxt = getRunAction(formName, cache, name, queryActionObject[name])
        return resultTxt, 200

    #
    if (the_path == "d3theme.css") or (the_path == "d3api.js"):
        expansion = the_path[the_path.rfind(".") + 1:].lower()
        mime = mimetypes.guess_type(os.path.abspath(os.path.join(rootDir, 'templates', the_path)))[0]
        htmlContent = [render_template(the_path, **globals())]
        for filename in os.listdir(os.path.abspath(os.path.join(rootDir, 'Components'))):
            if filename[:2] == '__':
                continue
            if filename.rfind('.') != -1:
                continue
            compDir = os.path.abspath(
                os.path.join(rootDir, 'Components', filename, expansion, f"{filename}.{expansion}"))
            if os.path.isfile(compDir):
                with open(compDir, "r") as flib:
                    htmlContent.append(flib.read())
        return "\n".join(htmlContent), 200, {'content-type': mime}

    htmlContent = ""
    if os.path.isfile(os.path.abspath(os.path.join(rootDir, 'templates', the_path))):
        mime = mimetypes.guess_type(os.path.abspath(os.path.join(rootDir, 'templates', the_path)))[0]
        expansion = the_path[the_path.rfind(".") + 1:].lower()
        if expansion == "ico":
            with open(os.path.abspath(os.path.join(rootDir, the_path)), "rb") as f:
                htmlContent = f.read()
        else:
            htmlContent = render_template(the_path, **globals())
        # htmlContent = render_template(the_path, request=request)
    elif os.path.isfile(os.path.abspath(os.path.join(rootDir, 'static', the_path))):
        mime = mimetypes.guess_type(os.path.abspath(os.path.join(rootDir, 'static', the_path)))[0]
        htmlContent = APPFLASK.send_static_file(the_path)
    else:
        return render_template('404.html', **globals()), 404
    if htmlContent != "":
        return htmlContent, 200, {'content-type': mime}
    return None


if __name__ == '__main__':
    mimetypes.init()
    socketio.run(APPFLASK, port=8080)
