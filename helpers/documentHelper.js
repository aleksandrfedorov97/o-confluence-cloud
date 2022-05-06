const urlHelper = require("./urlHelper.js");

var documentHelper = {};

const SUPPORTED_FORMATS = {
    "djvu": {"type": "word"},
    "doc": {"type": "word"},
    "docm": {"type": "word"},
    "docx": {"type": "word", "edit": true},
    "dot": {"type": "word"},
    "dotm": {"type": "word"},
    "dotx": {"type": "word"},
    "epub": {"type": "word"},
    "fb2": {"type": "word"},
    "fodt": {"type": "word"},
    "html": {"type": "word"},
    "mht": {"type": "word"},
    "odt": {"type": "word"},
    "ott": {"type": "word"},
    "oxps": {"type": "word"},
    "pdf": {"type": "word"},
    "rtf": {"type": "word"},
    "txt": {"type": "word"},
    "xps": {"type": "word"},
    "xml": {"type": "word"},

    "csv": {"type": "cell"},
    "fods": {"type": "cell"},
    "ods": {"type": "cell"},
    "ots": {"type": "cell"},
    "xls": {"type": "cell"},
    "xlsm": {"type": "cell"},
    "xlsx": {"type": "cell", "edit": true},
    "xlt": {"type": "cell"},
    "xltm": {"type": "cell"},
    "xltx": {"type": "cell"},

    "fodp": {"type": "slide"},
    "odp": {"type": "slide"},
    "otp": {"type": "slide"},
    "pot": {"type": "slide"},
    "potm": {"type": "slide"},
    "potx": {"type": "slide"},
    "pps": {"type": "slide"},
    "ppsm": {"type": "slide"},
    "ppsx": {"type": "slide"},
    "ppt": {"type": "slide"},
    "pptm": {"type": "slide"},
    "pptx": {"type": "slide", "edit": true}
};

documentHelper.getFileExtension = function (fileName) {
    var parts = fileName.toLowerCase().split(".");

    return parts.pop();
}

documentHelper.getDocumentType = function (extension) {
    return SUPPORTED_FORMATS[extension]["type"];
}

documentHelper.getEditorConfig = function (clientKey, localBaseUrl, attachmentInfo, userInfo) {

    let fileType = documentHelper.getFileExtension(attachmentInfo.title);
    let callbackUrl = urlHelper.getCallbackUrl(localBaseUrl, clientKey, attachmentInfo.container.id, attachmentInfo.id);

    return {
        type: "desktop",
        width: "100%",
        height: "100%",
        documentType: documentHelper.getDocumentType(fileType),
        document: {
            title: attachmentInfo.title,
            url: urlHelper.getFileUrl(localBaseUrl, clientKey, attachmentInfo.container.id, attachmentInfo.id),
            fileType: fileType,
            key: null,
            info: {
                owner: attachmentInfo.history.createdBy.displayName,
                uploaded: attachmentInfo.history.createdDate
            },
            permissions: {
                edit: true,
            }
        },
        editorConfig: {
            callbackUrl: callbackUrl,
            mode: "edit",
            lang: "en",
            user: {
                id: userInfo.accountId,
                name: userInfo.displayName
            },
        }
    };
}

module.exports = documentHelper;