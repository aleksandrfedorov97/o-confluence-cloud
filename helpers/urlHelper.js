var urlHelper = {};

urlHelper.getFileUrl = function (localBaseUrl, clientKey, pageId, attachmentId) {
    var url = localBaseUrl + "onlyoffice-download";
    url = url + "?clientKey=" + clientKey;
    url = url + "&pageId=" + pageId;
    url = url + "&attachmentId=" + attachmentId;
    return url;
}

urlHelper.getCallbackUrl = function (localBaseUrl, clientKey, pageId, attachmentId) {
    var url = localBaseUrl + "onlyoffice-callback";
    url = url + "?clientKey=" + clientKey;
    url = url + "&pageId=" + pageId;
    url = url + "&attachmentId=" + attachmentId;
    return url;
}

module.exports = urlHelper;