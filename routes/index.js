const axios = require("axios");
const FormData = require("form-data");

const documentHelper = require("../helpers/documentHelper.js");
const urlHelper = require("../helpers/urlHelper.js");

export default function routes(app, addon) {
    // Redirect root path to /atlassian-connect.json,
    // which will be served by atlassian-connect-express.
    app.get('/', (req, res) => {
        res.redirect('/atlassian-connect.json');
    });

    app.get('/onlyoffice-editor', addon.authenticate(), (req, res) => {

      var httpClient = addon.httpClient(req);

      var editorConfig = {};

      httpClient.get({
        url: `/rest/api/content/${req.query.pageId}/child/attachment`
      }, function(err, response, body) {
        var dataAttachments = JSON.parse(body);

        for(var i in dataAttachments.results) {
          if (dataAttachments.results[i].id == "att" + req.query.attachmentId) {
            var fileName = dataAttachments.results[i].title;
            var key = dataAttachments.results[i].id;
            var url = urlHelper.getFileUrl(req);
            var callbackUrl = urlHelper.getCallbackUrl(req);

            editorConfig = documentHelper.getEditorConfig(fileName, null, url, callbackUrl);
            console.log(editorConfig);
          }
        }

        res.render(
          'onlyoffice-editor.hbs',
          {
            title: "ONLYOFFICE", 
            editorConfig: JSON.stringify(editorConfig)
          }
        );
      });
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
