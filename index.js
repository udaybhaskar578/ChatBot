var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();

// Facebook Page Token
var token = "EAAa3gAjGZCyUBAB9gk0sZB2Rm6Y6m2qO8c2YI1XsZB1JKEyQxgqZA0f73C3cMZAz1eIgmn0bLqMVoEGVsMATHgLSZCWfuP6CAsZC90u8sMnWeMRA545V7q92brd8dyNa4a4wETczPllmLugfEOpuij5ChgI9bCDnGKVT1iYqOf9TQZDZD"

// Code to set the port number and listen to the port number
app.set('port', (process.env.PORT || 3000))
app.listen(app.get('port'), function() {
   console.log('Listening on port %d', app.get('port'))
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
        senderName = ""
        
        if (event.message && event.message.text) {
            text = event.message.text.toLowerCase()
            if (text === 'hi' || text === 'hello') {
                //sendGenericMessage(sender)
                getUserName(sender,function(result){
                    sendTextMessage(sender, "Hi, "+ result)
                })
                
                continue
            }
            else if(text.length ==5){
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


// Send an test message back as two cards.

function sendGenericMessage(sender) {
    messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "Meditation",
                    "subtitle": "Gives happiness",
                    "image_url": "http://www.oplexcareers.com/wp-content/uploads/2016/06/Meditation.jpg",
                    "buttons": [{
                        "type": "web_url",
                        "url": "https://www.facebook.com/groups/aichatbots/",
                        "title": "Programming Material"
                    }, {
                        "type": "web_url",
                        "url": "https://www.reddit.com/r/Chat_Bots/",
                        "title": "Chatbots on Reddit"
                    },{
                        "type": "web_url",
                        "url": "https://twitter.com/aichatbots",
                        "title": "Chatbots on Twitter"
                    }],
                }, {
                    "title": "Chatbots FAQ",
                    "subtitle": "Asking the Deep Questions",
                    "image_url": "https://tctechcrunch2011.files.wordpress.com/2016/04/facebook-chatbots.png?w=738",
                    "buttons": [{
                        "type": "postback",
                        "title": "What's the benefit?",
                        "payload": "Chatbots make content interactive instead of static",
                    },{
                        "type": "postback",
                        "title": "What can Chatbots do",
                        "payload": "One day Chatbots will control the Internet of Things! You will be able to control your homes temperature with a text",
                    }, {
                        "type": "postback",
                        "title": "The Future",
                        "payload": "Chatbots are fun! One day your BFF might be a Chatbot",
                    }],
                },  {
                    "title": "Learning More",
                    "subtitle": "Aking the Deep Questions",
                    "image_url": "http://www.brandknewmag.com/wp-content/uploads/2015/12/cortana.jpg",
                    "buttons": [{
                        "type": "postback",
                        "title": "AIML",
                        "payload": "Checkout Artificial Intelligence Mark Up Language. Its easier than you think!",
                    },{
                        "type": "postback",
                        "title": "Machine Learning",
                        "payload": "Use python to teach your maching in 16D space in 15min",
                    }, {
                        "type": "postback",
                        "title": "Communities",
                        "payload": "Online communities & Meetups are the best way to stay ahead of the curve!",
                    }],
                }]  
            } 
        }
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


//   $.ajax({
//   type: 'GET',
//   url: 'https://api.apixu.com/v1/current.json?key=7f8bda56cf5749b4afd10635170104&q=95112',
//   async: false,
//   dataType: 'json',
//   success: function (data) {
//     alert("Bombay");
//   }
// });


// For getting User Name Using Match API in messenger platform

