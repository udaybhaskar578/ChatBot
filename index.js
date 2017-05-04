var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var Yelp = require('yelp');
const Student = require('./Data/FBTemplateData/student.js');
var YelpService = require('./Services/yelpservice.js');
var app = express();


//Yelp Initialization 
var yelp = new Yelp({
  consumer_key: 'M33oLit1ilchda_3Eat1dw',
  consumer_secret: 'iUt0IU_O8XnyuI_wz4WaKCsgezw',
  token: '_j9XrUyNOs7TsY6q7Ry2A5p1Dc5fYhEV',
  token_secret: 'CusdwqDsHGrMJtLmtDxmm84c14g',
});

var introductionText = `I am chat bot in development phase, \n I can help you 
out in the following ways\n1.Send me your zipcode, I'll tell weather at
 your place\n2.Know restaurants nearby, just say #######(Kind of Restaurants 
 / Malls) in #####(zip/place)`

// Facebook Page Token
var token = `EAAa3gAjGZCyUBAB9gk0sZB2Rm6Y6m2qO8c2YI1XsZB1JKEyQxgqZA0f73C3cMZAz1
eIgmn0bLqMVoEGVsMATHgLSZCWfuP6CAsZC90u8sMnWeMRA545V7q92brd8dyNa4a4wETczPllmLugf
EOpuij5ChgI9bCDnGKVT1iYqOf9TQZDZD`

// Code to set the port number and listen to the port number
app.set('port', (process.env.PORT || 3000))
app.listen(app.get('port'), function() {
   console.log('Listening on port %d', app.get('port'))
   console.log(isNaN('95112'))
    var student = new Student('Tolani', 23, 'ddr1234');
    console.log('The student name is ' + student.getStudentName());
    


})

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// Process application/json
app.use(bodyParser.json())

// Index route
app.get('/', function (req, res) {


 res.send('Hello world, I am a chat bot')
})


app.get('/helloworld/', function (req, res) {
    res.send('Hello world, I am a chat bot')
})


// for Facebook verification
app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === 'SaiUdayBhaskarMudivarty') {
        res.send(req.query['hub.challenge'])
    }
    res.send('Error, wrong token')
})


// WebHook Response
app.post('/webhook/', function (req, res) {
    messaging_events = req.body.entry[0].messaging
    for (i = 0; i < messaging_events.length; i++) {
        event = req.body.entry[0].messaging[i]
        sender = event.sender.id

        if (event.message && event.message.text) {
            text = event.message.text.toLowerCase()
            if (text === 'hi' || text === 'hello') {
                getUserName(sender,function(result){
                    sendTextMessage(sender, "Hi, "+ result)
                    sendTextMessage(sender,introductionText) 
                })
                continue
            }else if (text === 'yelp' ) {
                sendGenericMessage(sender);
                continue
            }else if(text.includes(" in ")){
                var res = text.split("in");
                getYelpResults(res[0],res[1],function(response){
                    sendTemplatedMessage(sender,result);
                });

            }
            else if(text.length ==5 && !isNaN(text)){
                getWeather(text,function(result){
                    sendTextMessage(sender, "Weather: \n" + result)
               })
               continue
            }else{
                sendTextMessage(sender, "Parroting the text entered: " + text.substring(0, 200))
                continue
            }
            
        }
        if (event.postback) {
            text = JSON.stringify(event.postback)
            sendTextMessage(sender, "Postback received: "+text.substring(0, 200), token)
            continue
        }
    }
    res.sendStatus(200)
})


function getYelpResults(term,location,sortby=2,limit=5,callback){
    yelp.search({ term: term, location: location ,sort:sortby, limit:limit})
    .then(function (data) {
        var keysArray = Object.keys(data);
        var businesses = data[keysArray[2]]
        YelpService.convertYelpDataToFBTemplate(businesses,function(result){
            callback(result);
        });
    })
    .catch(function (err) {
    console.error(err);
    });
}

// Function to compute the weather at given zip code
function getWeather(zipcode,callback){
    var url = "https://api.apixu.com/v1/current.json?key=7f8bda56cf5749b4afd10635170104&q="+zipcode;
    // console.log(url)
    request({
        url: url,
        json: true
        }, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            callback("Location: "+body.location.name+"\nTemperature: "+body.current.temp_f); 
        }else{
            callback("error")
        }
    })
}

function getUserName(eventSenderId,callback){
    var urls='https://graph.facebook.com/v2.6/1362584033807727?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token=EAAa3gAjGZCyUBAB9gk0sZB2Rm6Y6m2qO8c2YI1XsZB1JKEyQxgqZA0f73C3cMZAz1eIgmn0bLqMVoEGVsMATHgLSZCWfuP6CAsZC90u8sMnWeMRA545V7q92brd8dyNa4a4wETczPllmLugfEOpuij5ChgI9bCDnGKVT1iYqOf9TQZDZD'
    var url = 'https://graph.facebook.com/v2.6/'+eventSenderId+'?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token='+token;
    request({
        url: url,
        json: true
        }, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            callback(body.first_name+" "+body.last_name)
        }else{
            callback("error")
        }
    })
}


function sendTextMessage(sender, text) {
    messageData = {
        text:text
    }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}

function sendTemplatedMessage(sender, messageData) {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}


// Send an test message back as two cards.
function sendGenericMessage(sender) {
    var messageData = {
        "attachment":{
            "type":"template",
            "payload":{
                "template_type":"generic",
                "elements":[{
                    "title":"Avatar's Restaurant",
                    "subtitle":"4.5/5",
                    "image_url":"https://s3-media3.fl.yelpcdn.com/bphoto/gbWsbvTI3T-jJUMh7Vhs5g/ms.jpg",
                    "buttons":[{
                        "type":"web_url",
                        "url":"https://www.yelp.com/biz/avatars-restaurant-sausalito?adjust_creative=M33oLit1ilchda_3Eat1dw&utm_campaign=yelp_api&utm_medium=api_v2_search&utm_source=M33oLit1ilchda_3Eat1dw",
                        "payload":null,
                        "title":"View on Yelp!!!"
                    },
                    {
                        "type":"phone_number",
                        "url":null,
                        "payload":"4153328083",
                        "title":"Call"
                    }
                    ]
                },
                {
                    "title":"Curry Leaf",
                    "subtitle":"4.5/5",
                    "image_url":"https://s3-media4.fl.yelpcdn.com/bphoto/F74K-bnfRGvRDBCmilffew/ms.jpg",
                    "buttons":[{
                        "type":"web_url",
                        "url":"https://www.yelp.com/biz/curry-leaf-san-francisco?adjust_creative=M33oLit1ilchda_3Eat1dw&utm_campaign=yelp_api&utm_medium=api_v2_search&utm_source=M33oLit1ilchda_3Eat1dw",
                        "payload":null,
                        "title":"View on Yelp!!!"
                    },{
                        "type":"phone_number",
                        "url":null,
                        "payload":"4154404293",
                        "title":"Call"
                    }
                    ]
                }
                ]
            }
        }
    };
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}



//Message Generic Template
// {
//                     "title": "Meditation",
//                     "subtitle": "Gives happiness",
//                     "image_url": "http://www.oplexcareers.com/wp-content/uploads/2016/06/Meditation.jpg",
//                     "buttons": [{
//                         "type": "web_url",
//                         "url": "https://www.yelp.com/biz/avatars-restaurant-sausalito?adjust_creative=M33oLit1ilchda_3Eat1dw&utm_campaign=yelp_api&utm_medium=api_v2_search&utm_source=M33oLit1ilchda_3Eat1dw",
//                         "title": "View this on yelp"
//                     }, {
//                         "type": "phone_number",
//                         ""payload":"+15105551234"",
//                         "title": "Call Restaurant"
//                     }],
//                 }

// Yelp Object Response
// { is_claimed: true,
//     rating: 4.5,
//     mobile_url: 'https://m.yelp.com/biz/curry-leaf-san-francisco?adjust_creative=M33oLit1ilchda_3Eat1dw&utm_campaign=yelp_api&utm_medium=api_v2_search&utm_source=M33oLit1ilchda_3Eat1dw',
//     rating_img_url: 'https://s3-media2.fl.yelpcdn.com/assets/2/www/img/99493c12711e/ico/stars/v1/stars_4_half.png',
//     review_count: 370,
//     name: 'Curry Leaf',
//     rating_img_url_small: 'https://s3-media2.fl.yelpcdn.com/assets/2/www/img/a5221e66bc70/ico/stars/v1/stars_small_4_half.png',
//     url: 'https://www.yelp.com/biz/curry-leaf-san-francisco?adjust_creative=M33oLit1ilchda_3Eat1dw&utm_campaign=yelp_api&utm_medium=api_v2_search&utm_source=M33oLit1ilchda_3Eat1dw',
//     categories: [ [Object], [Object], [Object] ],
//     menu_date_updated: 1493358366,
//     phone: '4154404293',
//     snippet_text: 'LOVE this place. Friendly, fast service and flavorful food. The lamb biryani was one of the best I\'ve ever had, and definitely the best I\'ve had in the...',
//     image_url: 'https://s3-media4.fl.yelpcdn.com/bphoto/F74K-bnfRGvRDBCmilffew/ms.jpg',
//     snippet_image_url: 'https://s3-media1.fl.yelpcdn.com/photo/KVOmCb0xW2ZktVuB52WEyg/ms.jpg',
//     display_phone: '+1-415-440-4293',
//     rating_img_url_large: 'https://s3-media4.fl.yelpcdn.com/assets/2/www/img/9f83790ff7f6/ico/stars/v1/stars_large_4_half.png',
//     menu_provider: 'eat24',
//     id: 'curry-leaf-san-francisco',
//     is_closed: false,
//     location:
//      { cross_streets: 'Chestnut St & Taylor St',
//        city: 'San Francisco',
//        display_address: [Object],
//        geo_accuracy: 8,
//        neighborhoods: [Object],
//        postal_code: '94133',
//        country_code: 'US',
//        address: [Object],
//        coordinate: [Object],
//        state_code: 'CA' } }