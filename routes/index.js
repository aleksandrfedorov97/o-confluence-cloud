export default function routes(app, addon) {
    // Redirect root path to /atlassian-connect.json,
    // which will be served by atlassian-connect-express.
    app.get('/', (req, res) => {
        res.redirect('/atlassian-connect.json');
    });

    

    // This is an example route used by "generalPages" module (see atlassian-connect.json).
    // Verify that the incoming request is authenticated with Atlassian Connect.
    app.get('/onlyoffice-editor', addon.authenticate(), (req, res) => {
        // Rendering a template is easy; the render method takes two params: the name of the component or template file, and its props.
        // Handlebars and jsx are both supported, but please note that jsx changes require `npm run watch-jsx` in order to be picked up by the server.
        const clientKey = req.context.clientKey;
        console.log(req.context);
        
        
        res.render(
          'onlyoffice-editor.hbs', // change this to 'hello-world.jsx' to use the Atlaskit & React version
          {
            title: 'Atlassian Connect', 
            editorConfig: JSON.stringify({
              width: '100%',
              height: '100%',
              type: 'desktop',
              documentType: 'word',
              document: {
                title: 'sample.docx',
                url: req.context.localBaseUrl + 'onlyoffice-download?clientKey=' + req.context.clientKey,
                fileType: 'docx'
              }
            })
            //, browserOnly: true // you can set this to disable server-side rendering for react views
          }
        );
    });

    app.get('/onlyoffice-download', (req, res) => {

      console.log("111111");
      console.log(req.query.clientKey);
      var httpClient = addon.httpClient({
        clientKey: req.query.clientKey  
      });

      console.log(httpClient);

      httpClient.get({
        url: '/rest/api/content/229379/child/attachment/9371650/download'
      }, function(err, response, body) {
        res.statusCode = 302;		
        res.setHeader("location", "https://" + response.client._host + response.req.path);
        res.send(body);
      });
   
        // httpClient.get({
        //     url: '/rest/api/content/229379/child/attachment/9371650/download'
        // }, function(err, response, body){
        //   // res.statusCode = 302;		
				//   // res.setHeader("location", response.request.uri.href);
        //   // res.send(body);

        //   // var Readable = require('stream').Readable
        //   // var s = new Readable();
        //   // s.push(body);    
        //   // s.push(null); 
        //   // res.setHeader("Content-Length", 11435);
        //   // res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        //   // res.setHeader("Content-Disposition", "attachment; filename*=UTF-8\'\'" + "sample.docx");
        //   // s.pipe(res);
        // });
    });

    // Add additional route handlers here...
}
