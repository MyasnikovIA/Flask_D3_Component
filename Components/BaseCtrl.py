import uuid


class BaseCtrl:
    printTag = ""
    CmpType = ""
    attrs = {}
    PageInfo = {}
    innerObject = []
    parent = None
    webElement = True
    innerHtml = []
    argsToStyleList = ["width", "height", "top", "left"]

    def __init__(self, PageInfo={}, attrs={}, innerText=""):
        pass

    def test(self):
        pass

    def genName(self):
        return str(uuid.uuid1()).replace("-", "")

