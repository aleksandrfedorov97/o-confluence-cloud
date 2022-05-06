const axios = require("axios");

const documentHelper = require("../helpers/documentHelper.js");
const urlHelper = require("../helpers/urlHelper.js");

const {
    getAttachmentInfo,
    getUserInfo,
    checkPermissions,
    updateContent
} = require("../helpers/requestHelper.js");

export default function routes(app, addon) {
    // Redirect root path to /atlassian-connect.json,
    // which will be served by atlassian-connect-express.
    app.get('/', (req, res) => {
        res.redirect('/atlassian-connect.json');
    });

    app.get('/onlyoffice-editor', addon.authenticate(), async (req, res) => {

        var httpClient = addon.httpClient(req);
        const userAccountId = req.context.userAccountId;
        const localBaseUrl = req.context.localBaseUrl;
        const clientKey = req.context.clientKey
        const pageId = req.query.pageId;
        const attachmentId = req.query.attachmentId;

        let canRead = await checkPermissions(httpClient, userAccountId, attachmentId, "read");
        if (!canRead) {
            res.status(403).send("Forbidden: you don't have access to this content");
            return;
        }

        let userInfo = await getUserInfo(httpClient, userAccountId);
        let attachmentInfo = await getAttachmentInfo(httpClient, pageId, attachmentId);
        let permissionEdit = await checkPermissions(httpClient, userAccountId, attachmentId, "update");

        var editorConfig = documentHelper.getEditorConfig(clientKey, localBaseUrl, attachmentInfo, userInfo, permissionEdit);

        res.render(
          'onlyoffice-editor.hbs',
          {
            title: "ONLYOFFICE", 
            editorConfig: JSON.stringify(editorConfig)
          }
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

      let body = req.body;

      if (body.status == 1) {

      } else if (body.status == 2 || body.status == 3) { // MustSave, Corrupted

          let file = await getFileData(body.url);

          //console.log(file);
      
          const formData = new FormData();
      
          formData.append("file", file.data);
          formData.append("minorEdit", "true");
          

          var httpClient = addon.httpClient({
            clientKey: req.query.clientKey
          });
    
          httpClient.post({
            headers: {
              "X-Atlassian-Token": "no-check",
              "Accept": "application/json"
            },
            multipartFormData: {
              file: [file.data]
            },
            url: `/rest/api/content/${req.query.pageId}/child/attachment/att${req.query.attachmentId}/data`
          }, function(err, response, body) {
            console.log(response);
          });
        
      } else if (body.status == 6 || body.status == 7) { // MustForceSave, CorruptedForceSave

      }

      res.json({ error: 0 });
    });

    async function getFileData(url) {
      const file = await axios({
        method: "get",
        responseType: "arraybuffer",
        headers: {
          'Content-Type': 'application/json'
        },
        url: url,
      });
      
      return file;
    }
}
