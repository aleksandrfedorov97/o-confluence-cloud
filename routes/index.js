const axios = require("axios");
const documentHelper = require("../helpers/documentHelper.js");
const urlHelper = require("../helpers/urlHelper.js");

const {
    getAppProperty,
    setAppProperty,
    getAttachmentInfo,
    getUserInfo,
    checkPermissions,
    updateContent,
    getFileDataFromUrl
} = require("../helpers/requestHelper.js");

const {
    getJwtSecret,
    getJwtHeader
} = require("../helpers/jwtManager.js");

export default function routes(app, addon) {
    // Redirect root path to /atlassian-connect.json,
    // which will be served by atlassian-connect-express.
    app.get('/', (req, res) => {
        res.redirect('/atlassian-connect.json');
    });

    app.get('/configure', [addon.authenticate(), addon.authorizeConfluence({ application: ["administer"] })], async (req, res) => {
        const httpClient = addon.httpClient(req);

        const context = {
            title: "ONLYOFFICE",
            docApiUrl: await urlHelper.getDocApiUrl(addon, httpClient),
            jwtSecret: await getJwtSecret(addon, httpClient),
            jwtHeader: await getJwtHeader(addon, httpClient)
        };

        res.render(
            'configure.hbs',
            context
        );
    });

    app.post('/configure', [addon.authenticate(true), addon.authorizeConfluence({ application: ["administer"] })], async (req, res) => {
        const httpClient = addon.httpClient(req);

        if (!req.body.docApiUrl || !req.body.jwtSecret || !req.body.jwtSecret) {
            res.status(400).send();
            return;
        }

        try {
            setAppProperty(httpClient, "docApiUrl", req.body.docApiUrl);
            setAppProperty(httpClient, "jwtSecret", req.body.jwtSecret);
            setAppProperty(httpClient, "jwtHeader", req.body.jwtHeader);
        } catch (error) {
            res.status(500).send("Internal error");
        }

        res.status(200).send();
    });

    app.get('/onlyoffice-editor', addon.authenticate(), async (req, res) => {

        const httpClient = addon.httpClient(req);
        const userAccountId = req.context.userAccountId;
        const localBaseUrl = req.context.localBaseUrl;
        const clientKey = req.context.clientKey
        const pageId = req.query.pageId;
        const attachmentId = req.query.attachmentId;

        let context = {
            title: "ONLYOFFICE",
            docApiUrl: await urlHelper.getDocApiUrl(addon, httpClient)
        };

        try {
            const canRead = await checkPermissions(httpClient, userAccountId, attachmentId, "read");
            if (!canRead) {
                res.status(403).send("Forbidden: you don't have access to this content");
                return;
            }

            const userInfo = await getUserInfo(httpClient, userAccountId);
            const attachmentInfo = await getAttachmentInfo(httpClient, pageId, attachmentId);

            const fileType = documentHelper.getFileExtension(attachmentInfo.title);
            const documentType = documentHelper.getDocumentType(fileType);

            if (!documentType) {
                context.error = `Sorry, this file format is not supported (${fileType})`;
            } else {
                const permissionEdit = await checkPermissions(httpClient, userAccountId, attachmentId, "update");
                const editorConfig = documentHelper.getEditorConfig(clientKey, localBaseUrl, attachmentInfo, userInfo, permissionEdit);

                context.editorConfig = JSON.stringify(editorConfig);
            }
        } catch (error) {
            console.log(error);
            res.status(500).send("Internal error"); // ToDo: error
        }

        res.render(
            'onlyoffice-editor.hbs',
            context
        );
    });

    app.get('/onlyoffice-download', (req, res) => {

      var httpClient = addon.httpClient({
        clientKey: req.query.clientKey
      });

      httpClient.get({
        url: `/rest/api/content/${req.query.pageId}/child/attachment/${req.query.attachmentId}/download`
      }, function(err, response, body) {
        res.statusCode = 302;		
        res.setHeader("location", response.request.uri.href);
        res.send(body);

        // var Readable = require('stream').Readable
        // var s = new Readable();
        // s.push(body);    
        // s.push(null); 
        // res.setHeader("Content-Length", 11435);
        // res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        // res.setHeader("Content-Disposition", "attachment; filename*=UTF-8\'\'" + "sample.docx");
        // s.pipe(res);
      });
    });

    app.post('/onlyoffice-callback', async (req, res) => {

        const body = req.body;

        if (body.status == 1) {

        } else if (body.status == 2 || body.status == 3) { // MustSave, Corrupted
            const httpClient = addon.httpClient({
                clientKey: req.query.clientKey
            });
            
            const userAccountId = body.actions[0].userid;
            const pageId = req.query.pageId;
            const attachmentId = req.query.attachmentId;
                
            const fileData = await getFileDataFromUrl(body.url);
            const error = await updateContent(httpClient, userAccountId, pageId, attachmentId, fileData);
        
        } else if (body.status == 6 || body.status == 7) { // MustForceSave, CorruptedForceSave

        }

        res.json({ error: 0 });
    });
}
