function getAttachmentInfo(httpClient, pageId, attachmentId) {
    return new Promise((resolve, reject) => {
        // make sure the content ID is valid to prevent traversal
        if (!/^[A-Z0-9-]+$/i.test(pageId)) {
            reject(new Error("Invalid content ID"));
            return;
        }

        httpClient.get({
            url: `/rest/api/content/${pageId}/child/attachment?expand=history.lastUpdated,container`,
            json: true
        }, function(err, response, body) {
            if (err) {
                reject(err);
                return;
            }

            for(var i in body.results) {
                if (body.results[i].id == "att" + attachmentId) {
                    resolve(body.results[i]);
                }
            }

            resolve(null);
        });
    });
}

function getUserInfo(httpClient, userAccountId) {
    return new Promise((resolve, reject) => {
        httpClient.get({
            url: `/rest/api/user?accountId=${userAccountId}`,
            json: true
        }, function(err, response, body) {
            if (err) {
                reject(err);
                return;
            }

            resolve(body);
        })
    });
}

function checkPermissions(httpClient, accountId, contentId, operation) {
    return new Promise((resolve, reject) => {
        // make sure the content ID is valid to prevent traversal
        if (!/^[A-Z0-9-]+$/i.test(contentId)) {
            reject(new Error("Invalid content ID"));
            return;
        }

        httpClient.asUserByAccountId(accountId).post({
            url: `/rest/api/content/${encodeURIComponent(contentId)}/permission/check`,
            headers: {
                "X-Atlassian-Token": "no-check"
            },
            json: {
                subject: {
                    type: "user",
                    identifier: accountId
                },
                operation
            }
        }, function (err, httpResponse, body) {
            if (err) {
                reject(err);
                return;
            }

            if (body.errors && body.errors.length > 0) {
                reject(body.errors);
                return;
            }

            resolve(body.hasPermission);
        });
    });
}

function updateContent() {

}

module.exports = {
    getAttachmentInfo,
    getUserInfo,
    checkPermissions,
    updateContent
};