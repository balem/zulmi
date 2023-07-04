const IncomingForm = require("formidable").IncomingForm;
var express = require("express");
var router = express.Router();
const fs = require('fs-extra');
var cmd = require('node-cmd');
const db = require('../../modules/db/db');
require("dotenv-safe").load();
const pathToDestination = './uploads';

const MIME_TYPES_WHITELIST = ['image/jpeg', 'image/png', 'image/tiff', 'image/gif', 'image/bmp', 'application/msword', 'application/pdf', 'application/xml', 'application/vnd.oasis.opendocument.text'];

router.get("/documents_list", async function(req, res, next) {
  //busca os tipos de documentos do tipo de perfil informado
  //envia os tipos de documentos para a UI
});

router.post("/", async function(req, res, next) {
  var form = new IncomingForm();

  form.on("file", (field, file) => {
    //console.log(field);
    //console.log(file);
    // Do something with the file
    // e.g. save it to the database
    // you can access it using file.path
  });
  /*form.on("end", () => {
    res.status(200).send({ data: "success" });
  });*/
  form.parse(req, (err, fields, files) => {
    //console.log("FIELDS:" + JSON.stringify(fields));
    //console.log("FILES:" + JSON.stringify(files));

    //renomeia o arquivo
    const filename = fields.user_type + '_' + fields.user_id + '_' + Date.now() + '_' + files.file.name.replace(' ', '_');
    //console.log(filename);

    //transfere o arquivo 
    const finalFilePath = pathToDestination + '/' + filename;
    fs.move(files.file.path, finalFilePath, async (err) => {
      if (err) console.log('ERROR: ' + err);

      //verifica se o MIME TYPE do arquivo consta na whitelist
      var validMimeType = false;
      await MIME_TYPES_WHITELIST.map((type) => {
        if (type === files.file.type) {
          validMimeType = true;
        }
      });
      //console.log('MIME: ' + files.file.type + ' VALID? ' + validMimeType);

      //verifica o tipo de person
      let person_id = null;
      let company_id = null;
      let person_employee_info_id = null;
      switch (fields.user_type) {
        case "person":
          person_id = req.body.id;
          break;
        case "company":
          company_id = req.body.id;
          break;
        case "person_employee_info":
          person_employee_info_id = req.body.id;
          break;
    
        default:
          break;
      }
      
      if (validMimeType) {
        //salva no BD o registro
        db.pg.insert({identification: filename, person_id: person_id, company_id: company_id, person_employee_info_id: person_employee_info_id, path: finalFilePath})
        .table('document')
        .then(() => {
          res.status(200).send({ data: "success" });
        })
        .catch(function(e) {
          res.status(500).send({
            status: "error",
            data: e.message
          });
        });
      }

      //remove os arquivos do temp
      cmd.run('rm -rf ' + files.file.path);
    });
    

  });
});

module.exports = router;
