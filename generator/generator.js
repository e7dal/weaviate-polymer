#!/usr/bin/env node

/**                                                             
                 ▝       ▗              ▝▜                   ▗  
▖  ▖ ▄▖  ▄▖ ▗ ▗ ▗▄   ▄▖ ▗▟▄  ▄▖      ▄▖  ▐   ▄▖ ▗▄▄  ▄▖ ▗▗▖ ▗▟▄ 
▚▗▗▘▐▘▐ ▝ ▐ ▝▖▞  ▐  ▝ ▐  ▐  ▐▘▐     ▐▘▐  ▐  ▐▘▐ ▐▐▐ ▐▘▐ ▐▘▐  ▐  
▐▟▟ ▐▀▀ ▗▀▜  ▙▌  ▐  ▗▀▜  ▐  ▐▀▀  ▀▘ ▐▀▀  ▐  ▐▀▀ ▐▐▐ ▐▀▀ ▐ ▐  ▐  
 ▌▌ ▝▙▞ ▝▄▜  ▐  ▗▟▄ ▝▄▜  ▝▄ ▝▙▞     ▝▙▞  ▝▄ ▝▙▞ ▐▐▐ ▝▙▞ ▐ ▐  ▝▄ 
                                                                
https://github.com/ING-Internet-of-Things/weaviate-element
*/

/**
 * The generator file generates elements based on Magento 2 Swagger document and template file
 * Author: @e7dal
 */
var weaviateSwaggerUrl = "https://raw.githubusercontent.com/creativesoftwarefdn/weaviate/develop/swagger/weaviate-swagger.json";

/**
 * Do not edit under this line
 */
var request = require("request"),
    fs      = require('fs');

// reserve variable for restful URN inside this scope
var RESTfulUrn;

// template for documents
const templateSingle = fs.readFileSync("generator/templateSingle.txt", "utf8");

/**
 * Capitalize the first character
 * @param {*String} string 
 */
var capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Generate the HTML files
 * @param {*String} filename 
 * @param {*String} content 
 */
var generateDocument = (filename, content) => {
	console.log("====generateDocument====="+filename+"====");
	console.log("====generateDocument====="+content+"====");
	
    try {
        // write to file
        fs.writeFileSync(filename, content, 'utf8');
        console.log("write file: ", filename);
    }
    catch(err) {
        // Sh*t!
        console.error("ERROR => write file: ", filename);
    }
}

/**
 * Generate the Polymer element
 * @param {*String} pathUrn 
 * @param {*Obj} buildObj 
 */
var generatePolymerElement = (pathUrn, buildObj) => {
	console.log("====generateDocument====="+pathUrn+"====");
	console.log("====generateDocument===== buildObj ====");
	console.log(buildObj);
	
    //var elementNameArray = capitalizeFirstLetter(buildObj.operationId).match(/[A-Z]*[^A-Z]+/g);
    //    elementNameArray = elementNameArray.slice(0, -4);
    //var elementName      = elementNameArray.join("-").toLowerCase();
	var elementName      = buildObj.operationId;
    var documentName     = "weaviate-element-" + elementName + ".html";
    var documentContent  = templateSingle;
    var propertiesJs     = "";

    // edit pathUrn { & } to [[ & ]]
    pathUrn = pathUrn.replace('{', '[[').replace('}', ']]');
 
    // get all available query parameters to create properties
    for (var params in buildObj.parameters) {
        var paramObj = buildObj.parameters[params];
        if(paramObj.in === "path"){
            propertiesJs += paramObj.name + `: { type: String, notify: true },`;
        }
    }
    console.log("=== replacement values ===");
    console.log("%%URLPATH%% ==> " + RESTfulUrn + pathUrn);
    console.log("%%PROPERTIES%% ==>" + propertiesJs);
    console.log("%%HTMLNAME%% ==>" +   elementName);
    console.log("%%WEAVIATEID%% ==> "+ buildObj.operationId);
    console.log("%%DESCRIPTION%% ==> " + buildObj.description)
    
    // replace the RESTful url
    documentContent = documentContent
                        .replace(/%%URLPATH%%/g    , RESTfulUrn + pathUrn)
                        .replace(/%%PROPERTIES%%/g , propertiesJs)
                        .replace(/%%HTMLNAME%%/g   , elementName)
                        .replace(/%%WEAVIATEID%%/g , buildObj.operationId)
                        .replace(/%%DESCRIPTION%%/g, buildObj.description)
    
    // generate the actual documents
    generateDocument(documentName, documentContent);
}

/**
 * Get the operation Ids
 * @param {*String} pathKey 
 * @param {*Obj} pathKeyObject 
 */
var getOperationIds = (pathKey, pathKeyObject) => {
	console.log("====get operations====="+pathKey+"====");
	//TODO, just for graphql? if(pathKeyObject!= undefined && pathKey=="/graphql"){
	if(pathKeyObject!= undefined){
		if(pathKeyObject.get!=undefined){
			console.log('generate  get');
			generatePolymerElement(pathKey, pathKeyObject.get)
		}
		if(pathKeyObject.post!=undefined){
			console.log('generate  post');
			generatePolymerElement(pathKey, pathKeyObject.post)
		}
    }
    
}

/**
 * Get te path from the object
 * @param {*Obj} i input obj
 */
var getPaths = (i) => {
  //console.log("getPaths: i paths");
  //console.log(i.paths);
  for (var pathKey in i.paths) {
	  console.log("====get paths====="+pathKey+"====");
      if (i.paths.hasOwnProperty(pathKey)) {
          getOperationIds(pathKey, i.paths[pathKey])
      }
  }
}

/**
 * Start the request
 */
request({
    url: weaviateSwaggerUrl,
    json: true
}, function (error, response, body) {
    if (!error && response.statusCode === 200) {
        // make url available in global scope
        RESTfulUrn = body.basePath;
        console.log(body);
        // set the paths based on the body of the response
        getPaths(body);
    }
})
