var GenericTemplate = require('../Data/FBTemplateData/generictemplate.js')
var Button = require('../Data/FBTemplateData/button.js')
var Payload = require('../Data/FBTemplateData/payload.js')
var Element = require('../Data/FBTemplateData/element.js')

module.exports.getYelpService = function(){
    console.log("In the Yelp Service Model");
}

module.exports.convertYelpDataToFBTemplate = function(data){
//First Populate Elements and Then Add buttons
var payload;
populateElements(data,function(result){
payload = new Payload('generic',result);
});
var template = new GenericTemplate("template",payload);
var attachment = {
    attachment:{
        type:'template',
        payload
    }
}
console.log(JSON.stringify(attachment));
}

function populateElements(data,callback){
    var elements = new Array();
    // console.log(data);
    data.forEach(function(business) {
            var element = new Element();
            element.title = business['name'];
            element.subtitle = business['rating'] +"/5";
            element.image_url = business['image_url'];
            formatButtonsForYelp(business,function(result){
                element.buttons = result
            });
            elements.push(element);
    });

    callback(elements);
}

function formatButtonsForYelp(data,callback){
    var buttons = new Array();

    var viewButton = new Button("web_url","View on Yelp!!!");
    viewButton.url = data['url'];
    buttons.push(viewButton);
    var callButton = new Button("phone_number","Call");
    callButton.payload = data['phone'];
    buttons.push(callButton);
    callback(buttons);
}
