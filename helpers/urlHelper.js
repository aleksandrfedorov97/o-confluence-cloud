var urlHelper = {};

urlHelper.getFileUrl = function (request) {
    var url = request.context.localBaseUrl + "onlyoffice-download";
    url = url + "?clientKey=" + request.context.clientKey;
    url = url + "&pageId=" + request.query.pageId;
    url = url + "&attachmentId=" + request.query.attachmentId;
    return url;
}

urlHelper.getCallbackUrl = function (request) {
    var url = request.context.localBaseUrl + "onlyoffice-callback";
    url = url + "?clientKey=" + request.context.clientKey;
    url = url + "&pageId=" + request.query.pageId;
    url = url + "&attachmentId=" + request.query.attachmentId;
    return url;
}

module.exports = urlHelper;