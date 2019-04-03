

/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/

// There are three sections, Text Strings, Skill Code, and Helper Function(s).
// This code includes helper functions for compatibility with versions of the SDK prior to 1.0.9, which includes the dialog directives.


/*
Next Update:
1. Add Glo Labels support.
2. 
3. Implementing Alexa Presentation Language for Alexa supported devices all over.
*/


let speechOutput;
let cardText;
let reprompt;
let welcomeOutput = "Welcome to Glo Boards! Say 'list all boards' and select a board from the list.";
let welcomeReprompt = "Say 'list all boards' to select a board from the available boards.";
let cardTitle = "Glo Boards";
var nextInvocation = ["What would you like to do next?", "What would you like to do now?", "What next?", "Anything else?", "What action would you like to do next?"];
var byeTexts = ["See you soon!", "See you later!", "Come back soon!", "Bye bye!", "Until next time!"];
var rateUs = [""," Don't forget to rate the skill on store.", "", ""];

// 2. Skill Code =======================================================================================================
"use strict";
const Alexa = require('alexa-sdk');
const APP_ID = "";  // TODO replace with your app ID (OPTIONAL).
var http = require('https');
var http3 = require('https');
var http2 = require('request');
speechOutput = '';
const handlers = {
	'LaunchRequest': function () {
        if(typeof this.event.context.System.user.accessToken === 'undefined'){
            // this.emit(':SignIn');
            speechOutput = 'Welcome to Glo Boards! Please, link your account by opening the Alexa app on your mobile device.';
            //any intent slot variables are listed here for convenience
            this.emit(':tell', speechOutput, 'Please, link your GitKraken account by opening the Alexa app on your mobile device.');
            this.emit(':tellWithLinkAccountCard', 'Please, link your GitKraken account by opening the Alexa app on your mobile device.');
            // speechOutput = "Welcome to Glo Boards! Please, say 'sign in' to complete authentication with your GitKraken account.";
            // reprompt = "Please, say 'sign in' to continue authentication.";
            // this.emit(':askWithCard', speechOutput, reprompt, cardTitle, speechOutput);
        }
        else{

            var body, data, string, string2;
            
            // API execution starts
            var reqheaders = {
                'Content-Type' : 'application/json',
                'Authorization': 'Bearer '+this.event.context.System.user.accessToken
            };
            // the post options
            var optionspost = {
                host : 'gloapi.gitkraken.com',
                port : 443,
                path : '/v1/glo/boards',
                method : 'GET',
                headers : reqheaders
            };
            // console.log("Entered IF");
            http.get(optionspost, response => {
                body = "";
                response.on('data', (chunk) => { body += chunk })
                response.on('end', () => {
                    data = JSON.parse(body);
                    // Check for Authentication
                    console.log("Response: "+response.statusCode);
                    if(response.statusCode == 401){
                        // this.emit('SignIn');
                        speechOutput = 'Welcome to Glo Boards! Please, link your account by opening the Alexa app on your mobile device.';
                        //any intent slot variables are listed here for convenience
                        this.emit(':tell', speechOutput, 'Please, link your GitKraken account by opening the Alexa app on your mobile device.');
                        this.emit(':tellWithLinkAccountCard', 'Please, link your GitKraken account by opening the Alexa app on your mobile device.');
                    }
                    else if(response.statusCode == 200){
                        var boardNames = [];
                        if(!isEmpty(data) && typeof this.attributes['currentBoardName'] !== 'undefined'){
                            for(var i=0;i<data.length;i++){
                                boardNames.push(data[i].name.toLowerCase());
                            }
                            // console.log("Board Names: "+boardNames);
                            // console.log("Is Present: "+(boardNames.indexOf(this.attributes['currentBoardName'].toLowerCase())>-1));
                            if(boardNames.indexOf(this.attributes['currentBoardName'].toLowerCase()) > -1){
                                console.log("Normal Launch");
                                welcomeOutput = "Welcome back, You are on "+this.attributes['currentBoardName']+" project.";
                                welcomeReprompt = "You can now fetch list of tasks due, add, move and delete a card, or manage your boards and columns."
                                this.emit(':askWithCard', welcomeOutput, welcomeReprompt, cardTitle, welcomeOutput);
                            }
                            else if(!(boardNames.indexOf(this.attributes['currentBoardName'].toLowerCase()) > -1)){
                                this.emit(':askWithCard', welcomeOutput, welcomeReprompt, cardTitle, welcomeOutput);
                            }
                            else{
                                console.log("No current board found.");
                                this.emit(':askWithCard', welcomeOutput, welcomeReprompt, cardTitle, welcomeOutput);
                                // this.emit('ListBoards');
                            }
                        }
                        else{
                            console.log("No current board found.");
                            this.emit(':askWithCard', welcomeOutput, welcomeReprompt, cardTitle, welcomeOutput);
                            // this.emit('ListBoards');
                        }
                    }
                    
                }); //res end close

            }); //http get close
            //API execution ends
 
        }
        
        // this.emit(':ListBoards');
        
        
	},
    'SignIn': function () {
        CardTitle = "Glo Boards";
        reprompt = 'To select board say, "Select a board" and say board name.';
        var body, data, string, string2;
        
        // API execution starts
        var reqheaders = {
            'Content-Type' : 'application/json',
            'Authorization': 'Bearer '+this.event.context.System.user.accessToken
        };
        // the post options
        var optionspost = {
            host : 'gloapi.gitkraken.com',
            port : 443,
            path : '/v1/glo/user',
            method : 'GET',
            headers : reqheaders
        };
        // console.log("Entered IF");
        http.get(optionspost, response => {
            body = "";
            response.on('data', (chunk) => { body += chunk })
            response.on('end', () => {
                // Check for Authentication
                if(response.statusCode == 401){
                    speechOutput = 'Please, link your account by opening the Alexa app on your mobile device.';
                    //any intent slot variables are listed here for convenience
                    this.emit(':tell', speechOutput, 'Please, link your GitKraken account by opening the Alexa app on your mobile device.');
                    this.emit(':tellWithLinkAccountCard', 'Please, link your GitKraken account by opening the Alexa app on your mobile device.');
                }
                data = JSON.parse(body);
                if(data.id !== 'undefined'){
                    speechOutput = "You are already logged in. Say 'select a board' to start working on your project. "+nextInvocation[Math.floor(Math.random()*nextInvocation.length)];
                    this.emit(':askWithCard', speechOutput, reprompt, cardTitle, speechOutput);
                }
                else{
                    speechOutput = 'Please, link your account by opening the Alexa app on your mobile device.';
                    //any intent slot variables are listed here for convenience
                    this.emit(':tell', speechOutput, 'Please, link your GitKraken account by opening the Alexa app on your mobile device.');
                    this.emit(':tellWithLinkAccountCard', 'Please, link your GitKraken account by opening the Alexa app on your mobile device.');
                }
            });
        }); //http call closed
    },
    'ListBoards': function () {
        // SignIn Check
        if(this.event.context.System.user.accessToken === ''){
            // this.emit('SignIn');
            speechOutput = 'Welcome to Glo Boards! Please, link your account by opening the Alexa app on your mobile device.';
            //any intent slot variables are listed here for convenience
            this.emit(':tell', speechOutput, 'Please, link your GitKraken account by opening the Alexa app on your mobile device.');
            this.emit(':tellWithLinkAccountCard', 'Please, link your GitKraken account by opening the Alexa app on your mobile device.');
        }
        cardTitle = 'List Boards';
        speechOutput = '';
        cardText = '';
        reprompt = 'To select board say, "Select a board" and say board name.';
        var body, data, string, string2;
        var boardNames = [];
        var set = 0;
        // API execution starts
        var reqheaders = {
            'Content-Type' : 'application/json',
            'Authorization': 'Bearer '+this.event.context.System.user.accessToken
        };
        // the post options
        var optionspost = {
            host : 'gloapi.gitkraken.com',
            port : 443,
            path : '/v1/glo/boards',
            method : 'GET',
            headers : reqheaders
        };

        http.get(optionspost, response => {
            body = "";
            response.on('data', (chunk) => { body += chunk })
            response.on('end', () => {
                // Check for Authentication
                if(response.statusCode == 401){
                    // this.emit('SignIn');
                    speechOutput = 'Welcome to Glo Boards! Please, link your account by opening the Alexa app on your mobile device.';
                    //any intent slot variables are listed here for convenience
                    this.emit(':tell', speechOutput, 'Please, link your GitKraken account by opening the Alexa app on your mobile device.');
                    this.emit(':tellWithLinkAccountCard', 'Please, link your GitKraken account by opening the Alexa app on your mobile device.');
                }
                data = JSON.parse(body);
                string = '';
                string2 = '';
                for(var i=0;i<data.length;i++){
                    boardNames.push(data[i].name);
                    set++;
                    if(i>0){
                        string += ',<break strength="strong"/> '+parseInt(+i + +1)+'. '+data[i].name;
                        string2 += ', '+parseInt(+i + +1)+'. '+data[i].name;
                    }
                    else{
                        string += '<break strength="strong"/> '+parseInt(+i + +1)+". "+data[i].name;
                        string2 += ' '+parseInt(+i + +1)+". "+data[i].name;
                    }
                }
                if(set > 0){
                    speechOutput = "Hi! You can select one of these boards "+string+". Say, 'select a board' to set an active working board.";
                    cardText = "Boards you can work on are "+string2+".";
                    this.emit(':askWithCard', speechOutput, reprompt, cardTitle, cardText);
                }
                else{
                    speechOutput = "Hi! You don't have any board linked with your account. You can say, 'add board' to create a board in your GitKraken Glo account.";
                    reprompt = "Say, 'add a board' to create a new board in GitKraken Glo."
                    cardText = "No board available. Say, 'add board' to create a board.";
                    this.emit(':askWithCard', speechOutput, reprompt, cardTitle, cardText);
                }
                
            //  console.log(BoardNameSlot);
            }); //res end close

        }); //http get close
        //API execution ends

        //Your custom intent handling goes here
        
//      speechOutput = "This is a place holder response for the intent named ListBoards. This intent has no slots. Anything else?";
//      this.emit(":ask", speechOutput, speechOutput);
    },
	'SelectBoard': function () {
        // SignIn Check
        if(this.event.context.System.user.accessToken === ''){
            // this.emit('SignIn');
            speechOutput = 'Welcome to Glo Boards! Please, link your account by opening the Alexa app on your mobile device.';
            //any intent slot variables are listed here for convenience
            this.emit(':tell', speechOutput, 'Please, link your GitKraken account by opening the Alexa app on your mobile device.');
            this.emit(':tellWithLinkAccountCard', 'Please, link your GitKraken account by opening the Alexa app on your mobile device.');
        }
		//any intent slot variables are listed here for convenience
        let filledSlots = delegateSlotCollection.call(this);
		let BoardNameSlotRaw = this.event.request.intent.slots.BoardName.value;
// 		console.log(BoardNameSlotRaw);
		let BoardNameSlot = resolveCanonical(this.event.request.intent.slots.BoardName);
// 		console.log(BoardNameSlot);
		let BoardNumberSlotRaw = this.event.request.intent.slots.BoardNumber.value;
// 		console.log(BoardNumberSlotRaw);
		let BoardNumberSlot = resolveCanonical(this.event.request.intent.slots.BoardNumber);
// 		console.log(BoardNumberSlot);
		
		cardTitle = 'Select Board';
        reprompt = nextInvocation[Math.floor(Math.random()*nextInvocation.length)]+" Ask for help to explore more options.";

        var body, data, string;
        var boardNames = [];

        
		// API execution starts
        var reqheaders = {
            'Content-Type' : 'application/json',
            'Authorization': 'Bearer '+this.event.context.System.user.accessToken
        };
        // the post options
        var optionspost = {
            host : 'gloapi.gitkraken.com',
            port : 443,
            path : '/v1/glo/boards',
            method : 'GET',
            headers : reqheaders
        };

        http.get(optionspost, response => {
            body = "";
            response.on('data', (chunk) => { body += chunk })
            response.on('end', () => {
                // Check for Authentication
                if(response.statusCode == 401){
                    // this.emit('SignIn');
                    speechOutput = 'Welcome to Glo Boards! Please, link your account by opening the Alexa app on your mobile device.';
                    //any intent slot variables are listed here for convenience
                    this.emit(':tell', speechOutput, 'Please, link your GitKraken account by opening the Alexa app on your mobile device.');
                    this.emit(':tellWithLinkAccountCard', 'Please, link your GitKraken account by opening the Alexa app on your mobile device.');
                }
                data = JSON.parse(body);
                console.log("User Board: "+BoardNameSlotRaw.toLowerCase());
                for(var i=0;i<data.length;i++){
                    boardNames.push(data[i].name.toLowerCase());
                    console.log("Board Name: "+data[i].name.toLowerCase());
                    // console.log("Board Name: "+data[i].id);
                    if(data[i].name.toLowerCase() == BoardNameSlotRaw.toLowerCase()){
                        this.attributes['currentBoardID'] = data[i].id;
                        this.attributes['currentBoardName'] = data[i].name.toLowerCase();
                        console.log("Current BoardName: "+this.attributes['currentBoardName']);
                        speechOutput = "You have selected "+BoardNameSlotRaw+". "+nextInvocation[Math.floor(Math.random()*nextInvocation.length)];
                        reprompt = "You can select an action to perform on "+BoardNameSlotRaw+" project. Say 'help' to learn more actions.";
                        this.emit(':askWithCard', speechOutput, reprompt, cardTitle, speechOutput);
                    }
                }
                
                if(typeof BoardNameSlotRaw !== 'undefined' || BoardNameSlotRaw !== ''){
                    this.emit("ListBoards");
                }
                else if(!(boardNames.indexOf(BoardNameSlotRaw) > -1)){
                    speechOutput = "No board named "+BoardNameSlotRaw+" exists. "+nextInvocation[Math.floor(Math.random()*nextInvocation.length)];
                    reprompt = nextInvocation[Math.floor(Math.random()*nextInvocation.length)]+" Ask for help to explore more options.";
                    this.emit(':askWithCard', speechOutput, reprompt, cardTitle, speechOutput);
                }
                // string = '';
                // for(var i=0;i<data.length;i++){
                //     if(i>0){
                //         string += ', '+i+'. '+data[i].name;
                //     }
                //     else{
                //         string += i+". "+data[i].name;
                //     }
                // }
                // if (this.event.request.intent.slots.BoardName.value && !this.event.request.intent.slots.BoardName.value) {
                //     speechOutput = "These are the following boards "+string+". Select 1 of them by saying their name.";
                //     this.emit(':askWithCard', 'BoardName', speechOutput, reprompt, cardTitle, speechOutput);
                // }
            // 	console.log(BoardNameSlot);
            }); //res end close

        }); //http get close
        //API execution ends
		
		//Your custom intent handling goes here
// 		speechOutput = "This is a place holder response for the intent named SelectBoard. This intent has 2 slots, which are BoardName, and BoardNumber. Anything else?";
// 		this.emit(":ask", speechOutput, speechOutput);
    },
    'AddBoard': function () {
        // SignIn Check
        if(this.event.context.System.user.accessToken === ''){
            // this.emit('SignIn');
            speechOutput = 'Welcome to Glo Boards! Please, link your account by opening the Alexa app on your mobile device.';
            //any intent slot variables are listed here for convenience
            this.emit(':tell', speechOutput, 'Please, link your GitKraken account by opening the Alexa app on your mobile device.');
            this.emit(':tellWithLinkAccountCard', 'Please, link your GitKraken account by opening the Alexa app on your mobile device.');
        }
        //delegate to Alexa to collect all the required slot values
       let filledSlots = delegateSlotCollection.call(this);
        speechOutput = '';
        //any intent slot variables are listed here for convenience

        let BoardNameSlotRaw = this.event.request.intent.slots.BoardName.value;
        console.log(BoardNameSlotRaw);
        let BoardNameSlot = resolveCanonical(this.event.request.intent.slots.BoardName);
        console.log(BoardNameSlot);

        cardTitle = 'Add Board';
        speechOutput = '';
        reprompt = nextInvocation[Math.floor(Math.random()*nextInvocation.length)]+" Ask for help to explore more options.";
        var body, body2, data, data2, string;

        var datastring = '{\"name\": \"'+BoardNameSlotRaw+'\"}';
        
        // API execution starts
        var reqheaders = {
            'accept': 'application/json',
            'Content-Type' : 'application/json',
            'Authorization': 'Bearer '+this.event.context.System.user.accessToken
        };

        var optionspost2 = {
            url : 'https://gloapi.gitkraken.com/v1/glo/boards/',
            method : 'POST',
            headers : reqheaders,
            body: datastring
        };
        console.log("BoardName:" + BoardNameSlotRaw);
        var that = this;
        http2.post(optionspost2, callback);
        function callback(err,res,body2){
            // body2 = "";
            // res.on('data', (chunk) => { body2 += chunk })
            // res.on('end', () => {
            console.log("Status Code: "+res.statusCode);
            if(!err && res.statusCode == 201 && body2){
                data = JSON.parse(body2);
                // set currentUserID
                if(typeof that.attributes['currentUserID'] === 'undefined'){
                    that.attributes['currentUserID'] = data.created_by.id;
                }
                // board check set current Board
                if(typeof that.attributes['currentBoardID'] === 'undefined'){
                    that.attributes['currentBoardID'] = data.id;
                    that.attributes['currentBoardName'] = data.name.toLowerCase();
                    speechOutput = 'Your board '+BoardNameSlotRaw+' has been created and set as your working board. '+nextInvocation[Math.floor(Math.random()*nextInvocation.length)];
                    that.emit(':askWithCard', speechOutput, reprompt, cardTitle, speechOutput);
                }
                else{
                    speechOutput = 'Your board '+BoardNameSlotRaw+' has been created. '+nextInvocation[Math.floor(Math.random()*nextInvocation.length)];
                    that.emit(':askWithCard', speechOutput, reprompt, cardTitle, speechOutput);
                }
            }
            else if(!err && res.statusCode == 400){
                speechOutput = 'Your board '+BoardNameSlotRaw+' cannot be created due to some unknown reason. P.s. You can only create 10 boards in a day. '+nextInvocation[Math.floor(Math.random()*nextInvocation.length)];
                that.emit(':askWithCard', speechOutput, reprompt, cardTitle, speechOutput);
            }
            // Check for Authentication
            else if(!err && res.statusCode == 401){
                // that.emit('SignIn');
                speechOutput = 'Welcome to Glo Boards! Please, link your account by opening the Alexa app on your mobile device.';
                //any intent slot variables are listed here for convenience
                that.emit(':tell', speechOutput, 'Please, link your GitKraken account by opening the Alexa app on your mobile device.');
                that.emit(':tellWithLinkAccountCard', 'Please, link your GitKraken account by opening the Alexa app on your mobile device.');
            }
            else {
                speechOutput = "Sorry for inconvenience, there was an error while processing your request. Please try opening Glo Boards again.";
                that.emit(':tell', speechOutput, 'Please try launching Glo Boards again.');
            }
        }

        //Your custom intent handling goes here
        // speechOutput = "This is a place holder response for the intent named AddBoard, which includes dialogs. This intent has one slot, which is BoardName. Anything else?";
        // this.emit(':ask', speechOutput, speechOutput);
    },
    'DeleteBoard': function () {
        // SignIn Check
        if(this.event.context.System.user.accessToken === ''){
            // this.emit('SignIn');
            speechOutput = 'Welcome to Glo Boards! Please, link your account by opening the Alexa app on your mobile device.';
            //any intent slot variables are listed here for convenience
            this.emit(':tell', speechOutput, 'Please, link your GitKraken account by opening the Alexa app on your mobile device.');
            this.emit(':tellWithLinkAccountCard', 'Please, link your GitKraken account by opening the Alexa app on your mobile device.');
        }
        // if(typeof this.attributes['currentBoardID'] === 'undefined'){
        //     this.emit("SelectBoard");
        // }

        //any intent slot variables are listed here for convenience
        let filledSlots = delegateSlotCollection.call(this);
        let BoardNameSlotRaw = this.event.request.intent.slots.BoardName.value;
        console.log(BoardNameSlotRaw);
        let BoardNameSlot = resolveCanonical(this.event.request.intent.slots.BoardName);
        console.log(BoardNameSlot);

        cardTitle = 'Delete Board';
        speechOutput = '';
        reprompt = nextInvocation[Math.floor(Math.random()*nextInvocation.length)]+' Ask for help to explore more options.';
        var body, body2, data, data2, string;
        // current board check
        if(typeof this.attributes['currentBoardID'] === 'undefined'){
            speechOutput = "You have not selected a board. Please say 'list all board' to list available boards and select one from it.";
            cardText = "Say 'list all boards' to get available boards.";
            this.emit(':askWithCard', speechOutput, reprompt, cardTitle, cardText);
            // this.emit("SelectBoard");
        }
        else{
            // API execution starts
            var reqheaders = {
                'accept': 'application/json',
                'Content-Type' : 'application/json',
                'Authorization': 'Bearer '+this.event.context.System.user.accessToken
            };
            var reqheaders2 = {
                'accept': '*/*',
                'Authorization': 'Bearer '+this.event.context.System.user.accessToken
            };
            // the post options
            var optionspost = {
                host : 'gloapi.gitkraken.com',
                port : 443,
                path : '/v1/glo/boards',
                method : 'GET',
                headers : reqheaders
            };
            var ColumnName;
            http.get(optionspost, response => {
                body = "";
                response.on('data', (chunk) => { body += chunk })
                response.on('end', () => {
                    // Check for Authentication
                    if(response.statusCode == 401){
                        // this.emit('SignIn');
                        speechOutput = 'Welcome to Glo Boards! Please, link your account by opening the Alexa app on your mobile device.';
                        //any intent slot variables are listed here for convenience
                        this.emit(':tell', speechOutput, 'Please, link your GitKraken account by opening the Alexa app on your mobile device.');
                        this.emit(':tellWithLinkAccountCard', 'Please, link your GitKraken account by opening the Alexa app on your mobile device.');
                    }
                    data = JSON.parse(body);
                    console.log('Data: '+JSON.stringify(data));
                    var boardNames = [];
                    var set = 0;
                    for(var i=0;i<data.length;i++){
                        set++;
                        boardNames.push(data[i].name.toLowerCase());
                        // console.log("Set Cnt: "+set);
                        // console.log("Board Cnt: "+data.length);
                        // console.log("Boards : "+boardNames);
                        if(data[i].name.toLowerCase() === BoardNameSlotRaw.toLowerCase() && this.event.request.intent.confirmationStatus === 'CONFIRMED'){
                            var optionspost2 = {
                                url : 'https://gloapi.gitkraken.com/v1/glo/boards/'+data[i].id,
                                method : 'DELETE',
                                headers : reqheaders2
                            };
                            // console.log("BoardID: "+data[i].id);
                            // console.log("BoardName:" + BoardNameSlotRaw);
                            var that = this;
                            http2.del(optionspost2, callback);
                            function callback(err,res,body2){
                                // body2 = "";
                                // res.on('data', (chunk) => { body2 += chunk })
                                // res.on('end', () => {
                                console.log("Status Code: "+res.statusCode);
                                if(!err && res.statusCode == 204 ){
                                    // data2 = JSON.parse(body2);
                                    // console.log('Data2: '+JSON.stringify(data2));
                                    console.log("Post Options: "+JSON.stringify(optionspost2));
                                    // code
                                    // console.log('Success: '+CardNameSlotRaw+' ColumnName: '+ColumnName);
                                    speechOutput = "Your board "+BoardNameSlotRaw+" has been deleted successfully. "+nextInvocation[Math.floor(Math.random()*nextInvocation.length)];
                                    that.emit(':askWithCard', speechOutput, reprompt, cardTitle, speechOutput);
                                    // console.log('Successful execution');
                                }
                                else if(!err && res.statusCode == 400 ){
                                    // data2 = JSON.parse(body2);
                                    // console.log('Data2: '+JSON.stringify(data2));
                                    console.log("Post Options: "+JSON.stringify(optionspost2));
                                    speechOutput = "Board "+BoardNameSlotRaw+" is not valid, please check your board name. "+nextInvocation[Math.floor(Math.random()*nextInvocation.length)];
                                    that.emit(':askWithCard', speechOutput, reprompt, cardTitle, speechOutput);
                                }
                                else if(!err && res.statusCode == 404 ){
                                    // data2 = JSON.parse(body2);
                                    // console.log('Data2: '+JSON.stringify(data2));
                                    console.log("Post Options: "+JSON.stringify(optionspost2));
                                    speechOutput = "Cannot find Board "+BoardNameSlotRaw+", please check your board name. "+nextInvocation[Math.floor(Math.random()*nextInvocation.length)];
                                    that.emit(':askWithCard', speechOutput, reprompt, cardTitle, speechOutput);
                                }
                                // Check for Authentication
                                else if(!err && res.statusCode == 401){
                                    // that.emit('SignIn');
                                    speechOutput = 'Welcome to Glo Boards! Please, link your account by opening the Alexa app on your mobile device.';
                                    //any intent slot variables are listed here for convenience
                                    that.emit(':tell', speechOutput, 'Please, link your GitKraken account by opening the Alexa app on your mobile device.');
                                    that.emit(':tellWithLinkAccountCard', 'Please, link your GitKraken account by opening the Alexa app on your mobile device.');
                                }
                                else{
                                    // code
                                    // data2 = JSON.parse(body2);
                                    // console.log('Data2: '+JSON.stringify(data2));
                                    console.log("Post Options: "+JSON.stringify(optionspost2));
                                    speechOutput = "Sorry something went wrong. To try again say delete a board. "+nextInvocation[Math.floor(Math.random()*nextInvocation.length)];
                                    that.emit(':askWithCard', speechOutput, reprompt, cardTitle, speechOutput);
                                }
                                // this.emit(':askWithCard', speechOutput, reprompt, cardTitle, speechOutput);
                                // });
                            }
                        }
                        else if(data[i].name.toLowerCase() === BoardNameSlotRaw.toLowerCase() && this.event.request.intent.confirmationStatus !== 'CONFIRMED'){
                            console.log("Found Name: "+data[i].name.toLowerCase());
                            console.log("Entered Name: "+BoardNameSlotRaw.toLowerCase());
                            speechOutput = "Cancelled deleting board "+BoardNameSlotRaw+". "+nextInvocation[Math.floor(Math.random()*nextInvocation.length)];
                            this.emit(':askWithCard', speechOutput, reprompt, cardTitle, speechOutput);
                        }
                        else if(this.event.request.intent.confirmationStatus === 'CONFIRMED' && !(boardNames.indexOf(BoardNameSlotRaw.toLowerCase()) > -1) && set === data.length){
                            console.log("Found Name: "+data[i].name.toLowerCase());
                            console.log("Entered Name: "+BoardNameSlotRaw.toLowerCase());
                            speechOutput = "Cannot find Board "+BoardNameSlotRaw+", please check if your board "+BoardNameSlotRaw+" exists. "+nextInvocation[Math.floor(Math.random()*nextInvocation.length)];
                            this.emit(':askWithCard', speechOutput, reprompt, cardTitle, speechOutput);
                        }
                        else if(this.event.request.intent.confirmationStatus !== 'CONFIRMED' && !(boardNames.indexOf(BoardNameSlotRaw.toLowerCase()) > -1) && set === data.length){
                            console.log("Found Name: "+data[i].name.toLowerCase());
                            console.log("Entered Name: "+BoardNameSlotRaw.toLowerCase());
                            speechOutput = "Cancelled deleting board "+BoardNameSlotRaw+", please check if your board "+BoardNameSlotRaw+" exists. "+nextInvocation[Math.floor(Math.random()*nextInvocation.length)];
                            this.emit(':askWithCard', speechOutput, reprompt, cardTitle, speechOutput);
                        }
                    }
                }); //res end close

            }); //http get close
            //API execution ends
        }

        //Your custom intent handling goes here
        // speechOutput = "This is a place holder response for the intent named DeleteBoard. This intent has one slot, which is BoardName. Anything else?";
        // this.emit(":ask", speechOutput, speechOutput);
    },
    'ListColumns': function () {
        // SignIn Check
        if(this.event.context.System.user.accessToken === ''){
            // this.emit('SignIn');
            speechOutput = 'Welcome to Glo Boards! Please, link your account by opening the Alexa app on your mobile device.';
            //any intent slot variables are listed here for convenience
            this.emit(':tell', speechOutput, 'Please, link your GitKraken account by opening the Alexa app on your mobile device.');
            this.emit(':tellWithLinkAccountCard', 'Please, link your GitKraken account by opening the Alexa app on your mobile device.');

        }
        // if(typeof this.attributes['currentBoardID'] === 'undefined'){
        //     this.emit("SelectBoard");
        // }
        //any intent slot variables are listed here for convenience
        
        cardTitle = 'List Columns';
        speechOutput = '';
        reprompt = nextInvocation[Math.floor(Math.random()*nextInvocation.length)]+' Ask for help if you want to find new options.';
        cardText = '';
        var body, data, string, string2;

        // current board check
        if(typeof this.attributes['currentBoardID'] === 'undefined'){
            speechOutput = "You have not selected a board. Please say 'list all board' to list available boards and select one from it.";
            cardText = "Say 'list all boards' to get available boards.";
            this.emit(':askWithCard', speechOutput, reprompt, cardTitle, cardText);
            // this.emit("SelectBoard");
        }
        else{
            // API execution starts
            var reqheaders = {
                'accept': 'application/json',
                'Content-Type' : 'application/json',
                'Authorization': 'Bearer '+this.event.context.System.user.accessToken
            };
            // the post options
            var optionspost = {
                host : 'gloapi.gitkraken.com',
                port : 443,
                path : '/v1/glo/boards/'+this.attributes['currentBoardID']+'?fields=columns&fields=name',
                method : 'GET',
                headers : reqheaders
            };

            http.get(optionspost, response => {
                body = "";
                response.on('data', (chunk) => { body += chunk })
                response.on('end', () => {
                    // Check for Authentication
                    if(response.statusCode == 401){
                        // this.emit('SignIn');
                        speechOutput = 'Welcome to Glo Boards! Please, link your account by opening the Alexa app on your mobile device.';
                        //any intent slot variables are listed here for convenience
                        this.emit(':tell', speechOutput, 'Please, link your GitKraken account by opening the Alexa app on your mobile device.');
                        this.emit(':tellWithLinkAccountCard', 'Please, link your GitKraken account by opening the Alexa app on your mobile device.');
                    }
                    data = JSON.parse(body);
                    string = '';
                    for(var i=0;i<data.columns.length;i++){
                        if(i>0){
                            string += ',<break strength="strong"/> '+parseInt(+i + +1)+'. '+data.columns[i].name;
                            string2 += ', '+parseInt(+i + +1)+'. '+data.columns[i].name;
                        }
                        else{
                            string += '<break strength="strong"/> '+parseInt(+i + +1)+". "+data.columns[i].name;
                            string2 += ' '+parseInt(+i + +1)+". "+data.columns[i].name;
                        }
                    }
                    if(data.columns.length > 1){
                        speechOutput = "List of columns in "+this.attributes['currentBoardName']+" are "+string+". "+nextInvocation[Math.floor(Math.random()*nextInvocation.length)];
                        cardText = "List of columns in "+this.attributes['currentBoardName']+" are "+string2+".";
                        this.emit(':askWithCard', speechOutput, reprompt, cardTitle, cardText);
                    }
                    else if(data.columns.length < 1){
                        speechOutput = "There are no columns in board "+this.attributes['currentBoardName']+". You can say 'add column' to add a column. "+nextInvocation[Math.floor(Math.random()*nextInvocation.length)];
                        cardText = "There are no columns in board "+this.attributes['currentBoardName']+".";
                        this.emit(':askWithCard', speechOutput, reprompt, cardTitle, cardText);
                    }
                    else{
                        speechOutput = "Column in "+this.attributes['currentBoardName']+" is "+string+". "+nextInvocation[Math.floor(Math.random()*nextInvocation.length)];
                        cardText = "Column in "+this.attributes['currentBoardName']+" is "+string2+".";
                        this.emit(':askWithCard', speechOutput, reprompt, cardTitle, cardText);
                    }
                //  console.log(BoardNameSlot);
                }); //res end close

            }); //http get close
            //API execution ends
        }

        //Your custom intent handling goes here
        // speechOutput = "This is a place holder response for the intent named ListColumns. This intent has no slots. Anything else?";
        // this.emit(":ask", speechOutput, speechOutput);
    },
    'AddColumn': function () {
        // SignIn Check
        if(this.event.context.System.user.accessToken === ''){
            // this.emit('SignIn');
            speechOutput = 'Welcome to Glo Boards! Please, link your account by opening the Alexa app on your mobile device.';
            //any intent slot variables are listed here for convenience
            this.emit(':tell', speechOutput, 'Please, link your GitKraken account by opening the Alexa app on your mobile device.');
            this.emit(':tellWithLinkAccountCard', 'Please, link your GitKraken account by opening the Alexa app on your mobile device.');
        }
        // if(typeof this.attributes['currentBoardID'] === 'undefined'){
        //     this.emit("SelectBoard");
        // }

        //delegate to Alexa to collect all the required slot values
       let filledSlots = delegateSlotCollection.call(this);
        speechOutput = '';
        //any intent slot variables are listed here for convenience

        let ColumnNameSlotRaw = this.event.request.intent.slots.ColumnName.value;
        console.log(ColumnNameSlotRaw);
        let ColumnNameSlot = resolveCanonical(this.event.request.intent.slots.ColumnName);
        console.log(ColumnNameSlot);

        cardTitle = 'Add Column';
        speechOutput = '';
        reprompt = nextInvocation[Math.floor(Math.random()*nextInvocation.length)]+' Ask for help to explore more options.';
        var body, body2, data, data2, string;
        
        // current board check
        if(typeof this.attributes['currentBoardID'] === 'undefined'){
            speechOutput = "You have not selected a board. Please say 'list all board' to list available boards and select one from it.";
            cardText = "Say 'list all boards' to get available boards.";
            this.emit(':askWithCard', speechOutput, reprompt, cardTitle, cardText);
            // this.emit("SelectBoard");
        }
        else{
            // API execution starts
            var reqheaders = {
                'accept': 'application/json',
                'Content-Type' : 'application/json',
                'Authorization': 'Bearer '+this.event.context.System.user.accessToken
            };
            // the post options
            // var optionspost = {
            //     host : 'gloapi.gitkraken.com',
            //     port : 443,
            //     path : '/v1/glo/boards?fields=columns&fields=name',
            //     method : 'GET',
            //     headers : reqheaders
            // };

            if(ColumnNameSlotRaw.toLowerCase() != ""){
                var datastring = '{\"name\": \"'+ColumnNameSlotRaw+'\"}';
                var optionspost2 = {
                    url : 'https://gloapi.gitkraken.com/v1/glo/boards/'+this.attributes["currentBoardID"]+'/columns',
                    method : 'POST',
                    headers : reqheaders,
                    body: datastring
                };
                console.log("BoardID:" + this.attributes['currentBoardID']);
                var that = this;
                http2.post(optionspost2, callback);
                function callback(err,res,body2){
                    // body2 = "";
                    // res.on('data', (chunk) => { body2 += chunk })
                    // res.on('end', () => {
                    console.log("Status Code: "+res.statusCode);
                    if(!err && res.statusCode == 201 && body2){
                        data2 = JSON.parse(body2);
                        console.log('Data2: '+JSON.stringify(data2));
                        console.log("Post Options: "+JSON.stringify(optionspost2));
                        if(typeof that.attributes["currentUserID"] === 'undefined'){
                            that.attributes["currentUserID"] = data2.created_by.id;
                        }
                        // code
                        console.log('Success: '+ColumnNameSlotRaw);
                        speechOutput = "Your column "+ColumnNameSlotRaw+" has been added to "+that.attributes['currentBoardName']+" successfully. "+nextInvocation[Math.floor(Math.random()*nextInvocation.length)];
                        that.emit(':askWithCard', speechOutput, reprompt, cardTitle, speechOutput);
                        console.log('Successful execution');
                    }
                    // Check for Authentication
                    else if(!err && res.statusCode == 401){
                        // that.emit('SignIn');
                        speechOutput = 'Welcome to Glo Boards! Please, link your account by opening the Alexa app on your mobile device.';
                        //any intent slot variables are listed here for convenience
                        that.emit(':tell', speechOutput, 'Please, link your GitKraken account by opening the Alexa app on your mobile device.');
                        that.emit(':tellWithLinkAccountCard', 'Please, link your GitKraken account by opening the Alexa app on your mobile device.');
                    }
                    else if(!err && res.statusCode == 404){
                        that.emit('SelectBoard');
                    }
                    else if(!err && res.statusCode == 400){
                        that.emit('SelectBoard');
                    }
                    else{
                        // code
                        speechOutput = "Sorry something went wrong. To try again say add a column.";
                        that.emit(':askWithCard', speechOutput, reprompt, cardTitle, speechOutput);
                    }
                    // this.emit(':askWithCard', speechOutput, reprompt, cardTitle, speechOutput);
                    // });
                }   
            } // API execution ends
        }

        //Your custom intent handling goes here
        // speechOutput = "This is a place holder response for the intent named AddColumn, which includes dialogs. This intent has one slot, which is ColumnName. Anything else?";
        // this.emit(':ask', speechOutput, speechOutput);
    },
    'DeleteColumn': function () {
        // SignIn Check
        if(this.event.context.System.user.accessToken === ''){
            // this.emit('SignIn');
            speechOutput = 'Welcome to Glo Boards! Please, link your account by opening the Alexa app on your mobile device.';
            //any intent slot variables are listed here for convenience
            this.emit(':tell', speechOutput, 'Please, link your GitKraken account by opening the Alexa app on your mobile device.');
            this.emit(':tellWithLinkAccountCard', 'Please, link your GitKraken account by opening the Alexa app on your mobile device.');
        }

        // if(typeof this.attributes['currentBoardID'] === 'undefined'){
        //     this.emit("SelectBoard");
        // }
        //delegate to Alexa to collect all the required slot values
       let filledSlots = delegateSlotCollection.call(this);
        speechOutput = '';
        //any intent slot variables are listed here for convenience

        let ColumnNameSlotRaw = this.event.request.intent.slots.ColumnName.value;
        console.log(ColumnNameSlotRaw);
        let ColumnNameSlot = resolveCanonical(this.event.request.intent.slots.ColumnName);
        console.log(ColumnNameSlot);

        cardTitle = 'Delete Column';
        speechOutput = '';
        reprompt = nextInvocation[Math.floor(Math.random()*nextInvocation.length)]+' Ask for help to explore more options.';
        var body, body2, data, data2, string;
        
        // current board check
        if(typeof this.attributes['currentBoardID'] === 'undefined'){
            speechOutput = "You have not selected a board. Please say 'list all board' to list available boards and select one from it.";
            cardText = "Say 'list all boards' to get available boards.";
            this.emit(':askWithCard', speechOutput, reprompt, cardTitle, cardText);
            // this.emit("SelectBoard");
        }
        else{
            // API execution starts
            var reqheaders = {
                'accept': 'application/json',
                'Content-Type' : 'application/json',
                'Authorization': 'Bearer '+this.event.context.System.user.accessToken
            };
            var reqheaders2 = {
                'accept': '*/*',
                'Authorization': 'Bearer '+this.event.context.System.user.accessToken
            };
            // the post options
            var optionspost = {
                host : 'gloapi.gitkraken.com',
                port : 443,
                path : '/v1/glo/boards/'+this.attributes['currentBoardID']+'?fields=columns&fields=name',
                method : 'GET',
                headers : reqheaders
            };
            var ColumnName;
            http.get(optionspost, response => {
                body = "";
                response.on('data', (chunk) => { body += chunk })
                response.on('end', () => {
                    // Check for Authentication
                    if(response.statusCode == 401){
                        // this.emit('SignIn');
                        speechOutput = 'Welcome to Glo Boards! Please, link your account by opening the Alexa app on your mobile device.';
                        //any intent slot variables are listed here for convenience
                        this.emit(':tell', speechOutput, 'Please, link your GitKraken account by opening the Alexa app on your mobile device.');
                        this.emit(':tellWithLinkAccountCard', 'Please, link your GitKraken account by opening the Alexa app on your mobile device.');
                    }
                    data = JSON.parse(body);
                    console.log('Data: '+JSON.stringify(data));
                    var columnNames = [];
                    var set = 0;
                    for(var i=0;i<data.columns.length;i++){
                        if(data.name.toLowerCase() === this.attributes['currentBoardName'].toLowerCase()){
                            // for(var j=0;j<data[i].columns.length;j++){
                                set++;
                                columnNames.push(data.columns[i].name.toLowerCase());
                                // console.log("Set: "+set);
                                // console.log("Column Len: "+data.columns.length);
                                // console.log("Column Name: "+columnNames);
                                if(data.columns[i].name.toLowerCase() === ColumnNameSlotRaw.toLowerCase() && this.event.request.intent.confirmationStatus === 'CONFIRMED'){
                                    var optionspost2 = {
                                        url : 'https://gloapi.gitkraken.com/v1/glo/boards/'+this.attributes["currentBoardID"]+'/columns/'+data.columns[i].id,
                                        method : 'DELETE',
                                        headers : reqheaders2
                                    };
                                    // console.log("ColumnID: "+data.columns[i].name);
                                    // console.log("ColumnName:" + ColumnNameSlotRaw);
                                    var that = this;
                                    http2.del(optionspost2, callback);
                                    function callback(err,res,body2){
                                        // body2 = "";
                                        // res.on('data', (chunk) => { body2 += chunk })
                                        // res.on('end', () => {
                                        console.log("Status Code: "+res.statusCode);
                                        if(!err && res.statusCode == 204 ){
                                            // data2 = JSON.parse(body2);
                                            // console.log('Data2: '+JSON.stringify(data2));
                                            console.log("Post Options: "+JSON.stringify(optionspost2));
                                            // code
                                            // console.log('Success: '+CardNameSlotRaw+' ColumnName: '+ColumnName);
                                            speechOutput = "Your column "+ColumnNameSlotRaw+" has been deleted successfully from board "+that.attributes['currentBoardName']+". "+nextInvocation[Math.floor(Math.random()*nextInvocation.length)];
                                            that.emit(':askWithCard', speechOutput, reprompt, cardTitle, speechOutput);
                                            // console.log('Successful execution');
                                        }
                                        else if(!err && res.statusCode == 400 ){
                                            // data2 = JSON.parse(body2);
                                            // console.log('Data2: '+JSON.stringify(data2));
                                            console.log("Post Options: "+JSON.stringify(optionspost2));
                                            speechOutput = "Column "+ColumnNameSlotRaw+" is not valid, please check your whether column name exists in "+that.attributes['currentBoardName']+". "+nextInvocation[Math.floor(Math.random()*nextInvocation.length)];
                                            that.emit(':askWithCard', speechOutput, reprompt, cardTitle, speechOutput);
                                        }
                                        else if(!err && res.statusCode == 404 ){
                                            // data2 = JSON.parse(body2);
                                            // console.log('Data2: '+JSON.stringify(data2));
                                            console.log("Post Options: "+JSON.stringify(optionspost2));
                                            speechOutput = "Cannot find Column "+ColumnNameSlotRaw+", please check if your column name exists in "+that.attributes['currentBoardName']+". "+nextInvocation[Math.floor(Math.random()*nextInvocation.length)];
                                            that.emit(':askWithCard', speechOutput, reprompt, cardTitle, speechOutput);
                                        }
                                        // Check for Authentication
                                        else if(!err && res.statusCode == 401){
                                            // that.emit('SignIn');
                                            speechOutput = 'Welcome to Glo Boards! Please, link your account by opening the Alexa app on your mobile device.';
                                            //any intent slot variables are listed here for convenience
                                            that.emit(':tell', speechOutput, 'Please, link your GitKraken account by opening the Alexa app on your mobile device.');
                                            that.emit(':tellWithLinkAccountCard', 'Please, link your GitKraken account by opening the Alexa app on your mobile device.');
                                        }
                                        else{
                                            // code
                                            // data2 = JSON.parse(body2);
                                            // console.log('Data2: '+JSON.stringify(data2));
                                            console.log("Post Options: "+JSON.stringify(optionspost2));
                                            speechOutput = "Sorry something went wrong. To try again say delete a column.";
                                            that.emit(':askWithCard', speechOutput, reprompt, cardTitle, speechOutput);
                                        }
                                        // this.emit(':askWithCard', speechOutput, reprompt, cardTitle, speechOutput);
                                        // });
                                    }
                                }
                                else if(data.columns[i].name.toLowerCase() === ColumnNameSlotRaw.toLowerCase() && this.event.request.intent.confirmationStatus !== 'CONFIRMED'){
                                    console.log("Found Name: "+data.columns[i].name.toLowerCase());
                                    console.log("Entered Name: "+ColumnNameSlotRaw.toLowerCase());
                                    speechOutput = "Cancelled deleting column "+ColumnNameSlotRaw+". "+nextInvocation[Math.floor(Math.random()*nextInvocation.length)];
                                    this.emit(':askWithCard', speechOutput, reprompt, cardTitle, speechOutput);
                                }
                                else if(this.event.request.intent.confirmationStatus === 'CONFIRMED' && !(columnNames.indexOf(ColumnNameSlotRaw.toLowerCase()) > -1) && set === data.columns.length){
                                    console.log("Found Name: "+data.columns[i].name.toLowerCase());
                                    console.log("Entered Name: "+ColumnNameSlotRaw.toLowerCase());
                                    speechOutput = "Cannot find Column "+ColumnNameSlotRaw+", please check if your column name exists in "+this.attributes['currentBoardName']+". "+nextInvocation[Math.floor(Math.random()*nextInvocation.length)];
                                    this.emit(':askWithCard', speechOutput, reprompt, cardTitle, speechOutput);
                                }
                                else if(this.event.request.intent.confirmationStatus !== 'CONFIRMED' && !(columnNames.indexOf(ColumnNameSlotRaw.toLowerCase()) > -1) && set === data.columns.length){
                                    console.log("Found Name: "+data.columns[i].name.toLowerCase());
                                    console.log("Entered Name: "+ColumnNameSlotRaw.toLowerCase());
                                    speechOutput = "Cancelled deleting column "+ColumnNameSlotRaw+", please check if your column name exists in "+this.attributes['currentBoardName']+". "+nextInvocation[Math.floor(Math.random()*nextInvocation.length)];
                                    this.emit(':askWithCard', speechOutput, reprompt, cardTitle, speechOutput);
                                }
                            // }
                        }
                    }
                }); //res end close

            }); //http get close
            //API execution ends
        }

        //Your custom intent handling goes here
        // speechOutput = "This is a place holder response for the intent named DeleteColumn, which includes dialogs. This intent has one slot, which is ColumnName. Anything else?";
        // this.emit(':ask', speechOutput, speechOutput);
    },
	'AddCard': function () {
        // SignIn Check
        if(this.event.context.System.user.accessToken === ''){
            // this.emit('SignIn');
            speechOutput = 'Welcome to Glo Boards! Please, link your account by opening the Alexa app on your mobile device.';
            //any intent slot variables are listed here for convenience
            this.emit(':tell', speechOutput, 'Please, link your GitKraken account by opening the Alexa app on your mobile device.');
            this.emit(':tellWithLinkAccountCard', 'Please, link your GitKraken account by opening the Alexa app on your mobile device.');
        }
		//delegate to Alexa to collect all the required slot values
        let filledSlots = delegateSlotCollection.call(this);
    	//any intent slot variables are listed here for convenience
    
    	let DueDateSlotRaw = this.event.request.intent.slots.DueDate.value;
    	console.log(DueDateSlotRaw);
    	let DueDateSlot = resolveCanonical(this.event.request.intent.slots.DueDate);
    	console.log(DueDateSlot);
    	let CardNameSlotRaw = this.event.request.intent.slots.CardName.value;
    	console.log(CardNameSlotRaw);
    	let CardNameSlot = resolveCanonical(this.event.request.intent.slots.CardName);
    	console.log(CardNameSlot);
    	let ColumnNameSlotRaw = this.event.request.intent.slots.ColumnName.value;
    	console.log(ColumnNameSlotRaw);
    	let ColumnNameSlot = resolveCanonical(this.event.request.intent.slots.ColumnName);
    	console.log(ColumnNameSlot);
    	let CardDescriptionSlotRaw = this.event.request.intent.slots.CardDescription.value;
    	console.log(CardDescriptionSlotRaw);
    	let CardDescriptionSlot = resolveCanonical(this.event.request.intent.slots.CardDescription);
    	console.log(CardDescriptionSlot);
    	
    	cardTitle = 'Add Card';
        speechOutput = '';
        reprompt = nextInvocation[Math.floor(Math.random()*nextInvocation.length)]+' Ask for help to explore more options.';
        var body, body2, data, data2, string;
        
        // current board check
        if(typeof this.attributes['currentBoardID'] === 'undefined'){
            speechOutput = "You have not selected a board. Please say 'list all board' to list available boards and select one from it.";
            cardText = "Say 'list all boards' to get available boards.";
            this.emit(':askWithCard', speechOutput, reprompt, cardTitle, cardText);
            // this.emit("SelectBoard");
        }
        else{
        	// API execution starts
            var reqheaders = {
                'accept': 'application/json',
                'Content-Type' : 'application/json',
                'Authorization': 'Bearer '+this.event.context.System.user.accessToken
            };
            // the post options
            var optionspost = {
                host : 'gloapi.gitkraken.com',
                port : 443,
                path : '/v1/glo/boards?fields=columns&fields=name',
                method : 'GET',
                headers : reqheaders
            };
            var ColumnName;
            http.get(optionspost, response => {
                body = "";
                response.on('data', (chunk) => { body += chunk })
                response.on('end', () => {
                    // Check for Authentication
                    if(response.statusCode == 401){
                        // this.emit('SignIn');
                        speechOutput = 'Welcome to Glo Boards! Please, link your account by opening the Alexa app on your mobile device.';
                        //any intent slot variables are listed here for convenience
                        this.emit(':tell', speechOutput, 'Please, link your GitKraken account by opening the Alexa app on your mobile device.');
                        this.emit(':tellWithLinkAccountCard', 'Please, link your GitKraken account by opening the Alexa app on your mobile device.');
                    }
                    data = JSON.parse(body);
                    console.log('Data: '+JSON.stringify(data));
                    var boardNames = [];
                    var set = 0;
                    for(var i=0;i<data.length;i++){
                        //for loop - Boards
                        var columnNames = [];
                        var setCol = 0;
                        boardNames.push(data[i].name.toLowerCase());
                        set++;
                        if(data[i].columns.length > 0){
                            for(var j=0;j<data[i].columns.length;j++){
                                //for loop - columns
                                columnNames.push(data[i].columns[j].name.toLowerCase());
                                setCol++;
                                if(data[i].name.toLowerCase() === this.attributes['currentBoardName'] && data[i].columns[j].name.toLowerCase() === ColumnNameSlotRaw.toLowerCase()){    
                                    var datastring = '{\"name\": \"'+CardNameSlotRaw+'\",\"description\": {\"text\": \"'+CardDescriptionSlotRaw+'\"},\"column_id\": \"'+data[i].columns[j].id+'\"}';
                                    ColumnName = data[i].columns[j].name;
                                    var optionspost2 = {
                                        url : 'https://gloapi.gitkraken.com/v1/glo/boards/'+this.attributes["currentBoardID"]+'/cards',
                                        method : 'POST',
                                        headers : reqheaders,
                                        body: datastring
                                    };
                                    console.log("BoardID:" + this.attributes['currentBoardID']);
                                    var that = this;
                                    http2.post(optionspost2, callback);
                                    function callback(err,res,body2){
                                        // body2 = "";
                                        // res.on('data', (chunk) => { body2 += chunk })
                                        // res.on('end', () => {
                                        console.log("Status Code: "+res.statusCode);
                                        if(!err && res.statusCode == 201 && body2){
                                            data2 = JSON.parse(body2);
                                            console.log('Data2: '+JSON.stringify(data2));
                                            console.log("Post Options: "+JSON.stringify(optionspost2));
                                            if(typeof that.attributes["currentUserID"] === 'undefined'){
                                                that.attributes["currentUserID"] = data2.created_by.id;
                                            }
                                            // code
                                            console.log('Success: '+CardNameSlotRaw+' ColumnName: '+ColumnName);
                                            speechOutput = "Your card "+CardNameSlotRaw+" has been added to column "+ColumnName+" successfully. "+nextInvocation[Math.floor(Math.random()*nextInvocation.length)];
                                            that.emit(':askWithCard', speechOutput, reprompt, cardTitle, speechOutput);
                                            console.log('Successful execution');
                                        }
                                        // Check for Authentication
                                        else if(!err && res.statusCode == 401){
                                            // that.emit('SignIn');
                                            speechOutput = 'Welcome to Glo Boards! Please, link your account by opening the Alexa app on your mobile device.';
                                            //any intent slot variables are listed here for convenience
                                            that.emit(':tell', speechOutput, 'Please, link your GitKraken account by opening the Alexa app on your mobile device.');
                                            that.emit(':tellWithLinkAccountCard', 'Please, link your GitKraken account by opening the Alexa app on your mobile device.');
                                        }
                                        else{
                                            // code
                                            speechOutput = "Sorry something went wrong. To try again say add a card.";
                                            that.emit(':askWithCard', speechOutput, reprompt, cardTitle, speechOutput);
                                        }
                                        // this.emit(':askWithCard', speechOutput, reprompt, cardTitle, speechOutput);
                                        // });
                                    }   
                                }
                                else if(!(boardNames.indexOf(data[i].name.toLowerCase()) > -1) && !(columnNames.indexOf(ColumnNameSlotRaw.toLowerCase()) > -1) && setCol === data[i].columns.length && set === data.length){
                                    //cannot find column - Check does not work
                                    speechOutput = "Your card "+CardNameSlotRaw+" cannot be created, as column "+ColumnNameSlotRaw+" was not found. "+nextInvocation[Math.floor(Math.random()*nextInvocation.length)];
                                    this.emit(':askWithCard', speechOutput, reprompt, cardTitle, speechOutput);
                                }
                                else if((boardNames.indexOf(data[i].name.toLowerCase()) > -1) && !(columnNames.indexOf(ColumnNameSlotRaw.toLowerCase()) > -1) && setCol === data[i].columns.length && set === data.length){
                                    //cannot find column - Check does not work
                                    speechOutput = "Your card "+CardNameSlotRaw+" cannot be created, as column "+ColumnNameSlotRaw+" was not found. "+nextInvocation[Math.floor(Math.random()*nextInvocation.length)];
                                    this.emit(':askWithCard', speechOutput, reprompt, cardTitle, speechOutput);
                                }
                            }// for loop columns
                        }// if before column loop
                        else {
                            //cannot find column - Check does not work
                            speechOutput = "You don't have any column named "+ColumnNameSlotRaw+" in your board "+this.attributes['currentBoardName']+". Please, say 'add a column' to create column "+ColumnNameSlotRaw+". "+nextInvocation[Math.floor(Math.random()*nextInvocation.length)];
                            this.emit(':askWithCard', speechOutput, reprompt, cardTitle, speechOutput);
                        }
                    }// for loop boards
                    // speechOutput = "These are the following boards "+string+". To select a board say, Select board name.";
                    // this.emit(':askWithCard', speechOutput, reprompt, cardTitle, speechOutput);
                // 	console.log(BoardNameSlot);
                }); //res end close

            }); //http get close
            //API execution ends
        }

		//Your custom intent handling goes here
// 		speechOutput = "This is a place holder response for the intent named AddCard, which includes dialogs. This intent has 4 slots, which are DueDate, CardName, ColumnName, and CardDescription. Anything else?";
// 		this.emit(':ask', speechOutput, speechOutput);
	},
    'MoveCard': function () {
        // SignIn Check
        if(this.event.context.System.user.accessToken === ''){
            // this.emit('SignIn');
            speechOutput = 'Welcome to Glo Boards! Please, link your account by opening the Alexa app on your mobile device.';
            //any intent slot variables are listed here for convenience
            this.emit(':tell', speechOutput, 'Please, link your GitKraken account by opening the Alexa app on your mobile device.');
            this.emit(':tellWithLinkAccountCard', 'Please, link your GitKraken account by opening the Alexa app on your mobile device.');
        }
        //delegate to Alexa to collect all the required slot values
       let filledSlots = delegateSlotCollection.call(this);
        speechOutput = '';
        //any intent slot variables are listed here for convenience

        let CardNameSlotRaw = this.event.request.intent.slots.CardName.value;
        console.log(CardNameSlotRaw);
        let CardNameSlot = resolveCanonical(this.event.request.intent.slots.CardName);
        console.log(CardNameSlot);
        let FromColumnSlotRaw = this.event.request.intent.slots.FromColumn.value;
        console.log(FromColumnSlotRaw);
        let FromColumnSlot = resolveCanonical(this.event.request.intent.slots.FromColumn);
        console.log(FromColumnSlot);
        let ToColumnSlotRaw = this.event.request.intent.slots.ToColumn.value;
        console.log(ToColumnSlotRaw);
        let ToColumnSlot = resolveCanonical(this.event.request.intent.slots.ToColumn);
        console.log(ToColumnSlot);

        cardTitle = 'Move Card';
        speechOutput = '';
        reprompt = nextInvocation[Math.floor(Math.random()*nextInvocation.length)]+' Ask for help to explore more options.';
        var body, body2, data, data2, string, datastring;

        // current board check
        if(typeof this.attributes['currentBoardID'] === 'undefined'){
            speechOutput = "You have not selected a board. Please say 'list all board' to list available boards and select one from it.";
            cardText = "Say 'list all boards' to get available boards.";
            this.emit(':askWithCard', speechOutput, reprompt, cardTitle, cardText);
            // this.emit("SelectBoard");
        }
        else{
            // API execution starts
            var reqheaders = {
                'accept': 'application/json',
                'Content-Type' : 'application/json',
                'Authorization': 'Bearer '+this.event.context.System.user.accessToken
            };
            // the post options
            var optionspost = {
                host : 'gloapi.gitkraken.com',
                port : 443,
                path : '/v1/glo/boards/'+this.attributes['currentBoardID']+'?fields=columns&fields=name',
                method : 'GET',
                headers : reqheaders
            };
            // the post options
            var optionspost3 = {
                host : 'gloapi.gitkraken.com',
                port : 443,
                path : '/v1/glo/boards/'+this.attributes['currentBoardID']+'/cards?fields=column_id&fields=name',
                method : 'GET',
                headers : reqheaders
            };

            http.get(optionspost, response => {
                body = "";
                response.on('data', (chunk) => { body += chunk })
                response.on('end', () => {
                    console.log("Status Code: "+response.statusCode);
                    // Check for Authentication
                    if(response.statusCode == 401){
                        // this.emit('SignIn');
                        speechOutput = 'Welcome to Glo Boards! Please, link your account by opening the Alexa app on your mobile device.';
                        //any intent slot variables are listed here for convenience
                        this.emit(':tell', speechOutput, 'Please, link your GitKraken account by opening the Alexa app on your mobile device.');
                        this.emit(':tellWithLinkAccountCard', 'Please, link your GitKraken account by opening the Alexa app on your mobile device.');
                    }
                    // Check for board
                    if(response.statusCode == 404 || response.statusCode == 400){
                        this.emit('SelectBoard');
                    }
                    console.log('Data1 : '+body);
                    data = JSON.parse(body);

                    http3.get(optionspost3, response => {
                        body2 = "";
                        response.on('data', (chunk) => { body2 += chunk })
                        response.on('end', () => {
                            // Check for Authentication
                            if(response.statusCode == 401){
                                // this.emit('SignIn');
                                speechOutput = 'Welcome to Glo Boards! Please, link your account by opening the Alexa app on your mobile device.';
                                //any intent slot variables are listed here for convenience
                                this.emit(':tell', speechOutput, 'Please, link your GitKraken account by opening the Alexa app on your mobile device.');
                                this.emit(':tellWithLinkAccountCard', 'Please, link your GitKraken account by opening the Alexa app on your mobile device.');
                            }
                            data2 = JSON.parse(body2);
                            console.log('Data2 : '+JSON.stringify(data2));
                            var FromColNames = [];
                            var setFromCol = 0;
                            for(var i=0;i<data.columns.length;i++){
                                //From Column Data from Current Board
                                var ToColNames = [];
                                var setToCol = 0;
                                FromColNames.push(data.columns[i].name.toLowerCase());
                                setFromCol++;
                                // console.log("FromCol Set Cnt: "+setFromCol);
                                // console.log("FromCol Data Len: "+data.columns.length);
                                // console.log("FromCol Data: "+FromColNames);
                                // if(data.columns[i].name.toLowerCase() === FromColumnSlotRaw.toLowerCase()){
                                    for(var j=0;j<data.columns.length;j++){
                                    //To Column Data from Current Board
                                        var cardNames = [];
                                        var setCard = 0;
                                        ToColNames.push(data.columns[j].name.toLowerCase());
                                        setToCol++;
                                        // console.log("ToCol Set Cnt: "+setToCol);
                                        // console.log("ToCol Data Len: "+data.columns.length);
                                        // console.log("ToCol Data: "+ToColNames);
                                    // if(data.columns[j].name.toLowerCase() === ToColumnSlotRaw.toLowerCase()){
                                        for(var k=0;k<data2.length;k++){
                                            //Cards Data from Current Board
                                            cardNames.push(data2[k].name.toLowerCase());
                                            setCard++;
                                            // console.log("Card Set Cnt: "+setCard);
                                            // console.log("Card Data Len: "+data2.length);
                                            // console.log("Card Data: "+cardNames);
                                            if(data.columns[i].name.toLowerCase() === FromColumnSlotRaw.toLowerCase() && data.columns[j].name.toLowerCase() === ToColumnSlotRaw.toLowerCase() && data2[k].name.toLowerCase() === CardNameSlotRaw.toLowerCase() && data.columns[i].id === data2[k].column_id){
                                                datastring = "{\"column_id\":\""+data.columns[j].id+"\"}";
                                                var optionspost2 = {
                                                    url : 'https://gloapi.gitkraken.com/v1/glo/boards/'+this.attributes['currentBoardID']+'/cards/'+data2[k].id,
                                                    method : 'POST',
                                                    headers : reqheaders,
                                                    body: datastring
                                                };
                                                console.log('Post Option: '+optionspost2);
                                                var that = this;
                                                http2.post(optionspost2,callback);
                                                function callback(err,res,body3){
                                                    if(!err && res.statusCode == 200 && body3){
                                                        speechOutput = "Your card "+CardNameSlotRaw+" has been moved from column "+FromColumnSlotRaw+" to column "+ToColumnSlotRaw+" successfully. "+nextInvocation[Math.floor(Math.random()*nextInvocation.length)];
                                                        that.emit(':askWithCard', speechOutput, reprompt, cardTitle, speechOutput);
                                                    }
                                                    else if(!err && res.statusCode == 400 ){
                                                        // data2 = JSON.parse(body2);
                                                        // console.log('Data2: '+JSON.stringify(data2));
                                                        // console.log("Post Options: "+JSON.stringify(optionspost2));
                                                        speechOutput = "Card "+CardNameSlotRaw+" is not valid, please check your whether card exists in "+that.attributes['currentBoardName']+". "+nextInvocation[Math.floor(Math.random()*nextInvocation.length)];
                                                        that.emit(':askWithCard', speechOutput, reprompt, cardTitle, speechOutput);
                                                    }
                                                    else if(!err && res.statusCode == 404 ){
                                                        // data2 = JSON.parse(body2);
                                                        // console.log('Data2: '+JSON.stringify(data2));
                                                        // console.log("Post Options: "+JSON.stringify(optionspost2));
                                                        speechOutput = "Cannot find card "+CardNameSlotRaw+", please check if your card exists in "+that.attributes['currentBoardName']+". "+nextInvocation[Math.floor(Math.random()*nextInvocation.length)];
                                                        that.emit(':askWithCard', speechOutput, reprompt, cardTitle, speechOutput);
                                                    }
                                                    // Check for Authentication
                                                    else if(!err && res.statusCode == 401){
                                                        // that.emit('SignIn');
                                                        speechOutput = 'Welcome to Glo Boards! Please, link your account by opening the Alexa app on your mobile device.';
                                                        //any intent slot variables are listed here for convenience
                                                        that.emit(':tell', speechOutput, 'Please, link your GitKraken account by opening the Alexa app on your mobile device.');
                                                        that.emit(':tellWithLinkAccountCard', 'Please, link your GitKraken account by opening the Alexa app on your mobile device.');
                                                    }
                                                    else if(err){
                                                        console.log("Error: "+err);
                                                    }
                                                }// callback close
                                            } //if check close
                                            else if(data.columns[i].name.toLowerCase() === FromColumnSlotRaw.toLowerCase() && data.columns[j].name.toLowerCase() === ToColumnSlotRaw.toLowerCase() && data2[k].name.toLowerCase() === CardNameSlotRaw.toLowerCase() && data.columns[i].id !== data2[k].column_id){
                                                // Correct wrong condition where card is not present in correct column 
                                                console.log("Found Name: "+data2[k].name.toLowerCase());
                                                console.log("Entered Name: "+CardNameSlotRaw.toLowerCase());
                                                speechOutput = "Cannot find card "+CardNameSlotRaw+", please check if your card exists in "+FromColumnSlotRaw+" column. "+nextInvocation[Math.floor(Math.random()*nextInvocation.length)];
                                                this.emit(':askWithCard', speechOutput, reprompt, cardTitle, speechOutput);
                                            }
                                            else if(!(cardNames.indexOf(CardNameSlotRaw.toLowerCase()) > -1) && (FromColNames.indexOf(FromColumnSlotRaw.toLowerCase()) > -1) && setCard === data2.length && setFromCol === data.columns.length){
                                                //Card not present in column
                                                console.log("Found Name: "+data2[k].name.toLowerCase());
                                                console.log("Entered Name: "+CardNameSlotRaw.toLowerCase());
                                                speechOutput = "Cannot find card "+CardNameSlotRaw+", please check if your card exists in "+FromColumnSlotRaw+" column. "+nextInvocation[Math.floor(Math.random()*nextInvocation.length)];
                                                this.emit(':askWithCard', speechOutput, reprompt, cardTitle, speechOutput);
                                            }
                                            else if((cardNames.indexOf(CardNameSlotRaw.toLowerCase()) > -1) && !(FromColNames.indexOf(FromColumnSlotRaw.toLowerCase()) > -1) && setCard === data2.length && setFromCol === data.columns.length){
                                                //Column containing card not present on board 
                                                // console.log("Found Name: "+data2[k].name.toLowerCase());
                                                console.log("Entered Name: "+FromColumnSlotRaw.toLowerCase());
                                                console.log("Found Column: "+data.columns[i].name.toLowerCase());
                                                speechOutput = "Cannot find column "+FromColumnSlotRaw+", please check if your column exists in "+this.attributes['currentBoardName']+". "+nextInvocation[Math.floor(Math.random()*nextInvocation.length)];
                                                this.emit(':askWithCard', speechOutput, reprompt, cardTitle, speechOutput);
                                            }
                                            else if(!(cardNames.indexOf(CardNameSlotRaw.toLowerCase()) > -1) && !(FromColNames.indexOf(FromColumnSlotRaw.toLowerCase()) > -1) && setCard === data2.length && setFromCol === data.columns.length){
                                                //card and Column containing card not present on board 
                                                // console.log("Found Name: "+data2[k].name.toLowerCase());
                                                console.log("Entered Name: "+FromColumnSlotRaw.toLowerCase());
                                                console.log("Found Column: "+data.columns[i].name.toLowerCase());
                                                speechOutput = "Cannot find column "+FromColumnSlotRaw+" and card "+CardNameSlotRaw+", please check if your column exists in "+this.attributes['currentBoardName']+". "+nextInvocation[Math.floor(Math.random()*nextInvocation.length)];
                                                this.emit(':askWithCard', speechOutput, reprompt, cardTitle, speechOutput);
                                            }
                                            else if((cardNames.indexOf(CardNameSlotRaw.toLowerCase()) > -1) && !(ToColNames.indexOf(ToColumnSlotRaw.toLowerCase()) > -1) && setCard === data2.length && setToCol === data.columns.length){
                                                //column to which card is to be moved not present
                                                // console.log("Found Name: "+data2[k].name.toLowerCase());
                                                console.log("Entered Name: "+ToColumnSlotRaw.toLowerCase());
                                                console.log("Found Column: "+data.columns[j].name.toLowerCase());
                                                speechOutput = "Cannot find column "+ToColumnSlotRaw+", please check if your column exists in "+this.attributes['currentBoardName']+". "+nextInvocation[Math.floor(Math.random()*nextInvocation.length)];
                                                this.emit(':askWithCard', speechOutput, reprompt, cardTitle, speechOutput);
                                            }
                                            else if(!(cardNames.indexOf(CardNameSlotRaw.toLowerCase()) > -1) && !(ToColNames.indexOf(ToColumnSlotRaw.toLowerCase()) > -1) && setCard === data2.length && setToCol === data.columns.length){
                                                //card and Column to which card is to be moved not present on board 
                                                // console.log("Found Name: "+data2[k].name.toLowerCase());
                                                console.log("Entered Name: "+ToColumnSlotRaw.toLowerCase());
                                                console.log("Found Column: "+data.columns[j].name.toLowerCase());
                                                speechOutput = "Cannot find column "+ToColumnSlotRaw+" and card "+CardNameSlotRaw+", please check if your column exists in "+this.attributes['currentBoardName']+". "+nextInvocation[Math.floor(Math.random()*nextInvocation.length)];
                                                this.emit(':askWithCard', speechOutput, reprompt, cardTitle, speechOutput);
                                            }
                                            else if(!(cardNames.indexOf(CardNameSlotRaw.toLowerCase()) > -1) && !(FromColNames.indexOf(FromColumnSlotRaw.toLowerCase()) > -1) && !(ToColNames.indexOf(ToColumnSlotRaw.toLowerCase()) > -1) && setCard === data2.length && setToCol === data.columns.length){
                                                //card column to which card is to be moved and column containing card not present on board 
                                                // console.log("Found Name: "+data2[k].name.toLowerCase());
                                                console.log("Entered Name: "+ToColumnSlotRaw.toLowerCase());
                                                console.log("Found Column: "+data.columns[j].name.toLowerCase());
                                                speechOutput = "Cannot find column "+ToColumnSlotRaw+" and card "+CardNameSlotRaw+", please check if your columns and card exists in "+this.attributes['currentBoardName']+". "+nextInvocation[Math.floor(Math.random()*nextInvocation.length)];
                                                this.emit(':askWithCard', speechOutput, reprompt, cardTitle, speechOutput);
                                            }
                                        }// For Cards List
                                    // }// if check ToColumn
                                        // else{ -- check does not work
                                        //     speechOutput = "Your card "+CardNameSlotRaw+" cannot be moved to column "+ToColumnSlotRaw+" as the column does not exist. What would you like to do next?";
                                        //     this.emit(':askWithCard', speechOutput, reprompt, cardTitle, speechOutput);
                                        // }
                                    }// For To Column List
                                // }// if check FromColumn
                                // else{ -- check does not work
                                //     speechOutput = "Your card "+CardNameSlotRaw+" cannot be moved from column "+FromColumnSlotRaw+" as the column does not exist. What would you like to do next?";
                                //     this.emit(':askWithCard', speechOutput, reprompt, cardTitle, speechOutput);
                                // }
                            }// For From Column Lists
                        }); //res end close
                    }); //http get close

                }); //res end close

            }); //http get close
            //API execution ends
        }

        //Your custom intent handling goes here
        // speechOutput = "This is a place holder response for the intent named MoveCard, which includes dialogs. This intent has 3 slots, which are CardName, FromColumn, and ToColumn. Anything else?";
        // this.emit(':ask', speechOutput, speechOutput);
    },
    'DeleteCard': function () {
        // SignIn Check
        if(this.event.context.System.user.accessToken === ''){
            // this.emit('SignIn');
            speechOutput = 'Welcome to Glo Boards! Please, link your account by opening the Alexa app on your mobile device.';
            //any intent slot variables are listed here for convenience
            this.emit(':tell', speechOutput, 'Please, link your GitKraken account by opening the Alexa app on your mobile device.');
            this.emit(':tellWithLinkAccountCard', 'Please, link your GitKraken account by opening the Alexa app on your mobile device.');
        }

        // if(typeof this.attributes['currentBoardID'] === 'undefined'){
        //     this.emit("SelectBoard");
        // }

        //delegate to Alexa to collect all the required slot values
        let filledSlots = delegateSlotCollection.call(this);
        speechOutput = '';
        //any intent slot variables are listed here for convenience

        let CardNameSlotRaw = this.event.request.intent.slots.CardName.value;
        console.log(CardNameSlotRaw);
        let CardNameSlot = resolveCanonical(this.event.request.intent.slots.CardName);
        console.log(CardNameSlot);

        cardTitle = 'Delete Card';
        speechOutput = '';
        reprompt = nextInvocation[Math.floor(Math.random()*nextInvocation.length)]+' Ask for help to explore more options.';
        var body, body2, data, data2, string;
        
        if(typeof this.attributes['currentBoardID'] === 'undefined'){
            speechOutput = "You have not selected a board. Please say 'list all board' to list available boards and select one from it.";
            cardText = "Say 'list all boards' to get available boards.";
            this.emit(':askWithCard', speechOutput, reprompt, cardTitle, cardText);
            // this.emit("SelectBoard");
        }
        else{
            // API execution starts
            var reqheaders = {
                'accept': 'application/json',
                'Content-Type' : 'application/json',
                'Authorization': 'Bearer '+this.event.context.System.user.accessToken
            };
            var reqheaders2 = {
                'accept': '*/*',
                'Authorization': 'Bearer '+this.event.context.System.user.accessToken
            };
            // the post options
            var optionspost = {
                host : 'gloapi.gitkraken.com',
                port : 443,
                path : '/v1/glo/boards/'+this.attributes['currentBoardID']+'/cards?fields=board_id&fields=column_id&fields=name',
                method : 'GET',
                headers : reqheaders
            };
            http.get(optionspost, response => {
                body = "";
                response.on('data', (chunk) => { body += chunk })
                response.on('end', () => {
                    // Check for Authentication
                    if(response.statusCode == 401){
                        // this.emit('SignIn');
                        speechOutput = 'Welcome to Glo Boards! Please, link your account by opening the Alexa app on your mobile device.';
                        //any intent slot variables are listed here for convenience
                        this.emit(':tell', speechOutput, 'Please, link your GitKraken account by opening the Alexa app on your mobile device.');
                        this.emit(':tellWithLinkAccountCard', 'Please, link your GitKraken account by opening the Alexa app on your mobile device.');
                    }
                    data = JSON.parse(body);
                    console.log('Data: '+JSON.stringify(data));
                    var cardNames = [];
                    var set = 0;
                    for(var i=0;i<data.length;i++){
                        set++;
                        cardNames.push(data[i].name.toLowerCase());
                        console.log("Set: "+set);
                        console.log("Card Len: "+data.length);
                        console.log("Card Name: "+cardNames);
                        console.log("Data Name: "+data[i].name.toLowerCase());
                        if(data[i].name.toLowerCase() == CardNameSlotRaw.toLowerCase() && data[i].board_id == this.attributes["currentBoardID"] && this.event.request.intent.confirmationStatus === 'CONFIRMED'){
                            var optionspost2 = {
                                url : 'https://gloapi.gitkraken.com/v1/glo/boards/'+this.attributes["currentBoardID"]+'/cards/'+data[i].id,
                                method : 'DELETE',
                                headers : reqheaders2
                            };
                            console.log("CardID: "+data[i].name);
                            console.log("CardName:" + CardNameSlotRaw);
                            var that = this;
                            http2.del(optionspost2, callback);
                            function callback(err,res,body2){
                                // body2 = "";
                                // res.on('data', (chunk) => { body2 += chunk })
                                // res.on('end', () => {
                                console.log("Status Code: "+res.statusCode);
                                if(!err && res.statusCode == 204 ){
                                    // data2 = JSON.parse(body2);
                                    // console.log('Data2: '+JSON.stringify(data2));
                                    console.log("Post Options: "+JSON.stringify(optionspost2));
                                    // code
                                    // console.log('Success: '+CardNameSlotRaw+' ColumnName: '+ColumnName);
                                    speechOutput = "Your card "+CardNameSlotRaw+" has been deleted successfully from board "+that.attributes['currentBoardName']+". "+nextInvocation[Math.floor(Math.random()*nextInvocation.length)];
                                    that.emit(':askWithCard', speechOutput, reprompt, cardTitle, speechOutput);
                                    // console.log('Successful execution');
                                }
                                else if(!err && res.statusCode == 400 ){
                                    // data2 = JSON.parse(body2);
                                    // console.log('Data2: '+JSON.stringify(data2));
                                    console.log("Post Options: "+JSON.stringify(optionspost2));
                                    speechOutput = "Card "+CardNameSlotRaw+" is not valid, please check your whether card exists in "+that.attributes['currentBoardName']+". "+nextInvocation[Math.floor(Math.random()*nextInvocation.length)];
                                    that.emit(':askWithCard', speechOutput, reprompt, cardTitle, speechOutput);
                                }
                                else if(!err && res.statusCode == 404 ){
                                    // data2 = JSON.parse(body2);
                                    // console.log('Data2: '+JSON.stringify(data2));
                                    console.log("Post Options: "+JSON.stringify(optionspost2));
                                    speechOutput = "Cannot find card "+CardNameSlotRaw+", please check if your card exists in "+that.attributes['currentBoardName']+". "+nextInvocation[Math.floor(Math.random()*nextInvocation.length)];
                                    that.emit(':askWithCard', speechOutput, reprompt, cardTitle, speechOutput);
                                }
                                // Check for Authentication
                                else if(!err && res.statusCode == 401){
                                    // that.emit('SignIn');
                                    speechOutput = 'Welcome to Glo Boards! Please, link your account by opening the Alexa app on your mobile device.';
                                    //any intent slot variables are listed here for convenience
                                    that.emit(':tell', speechOutput, 'Please, link your GitKraken account by opening the Alexa app on your mobile device.');
                                    that.emit(':tellWithLinkAccountCard', 'Please, link your GitKraken account by opening the Alexa app on your mobile device.');
                                }
                                else{
                                    // code
                                    // data2 = JSON.parse(body2);
                                    // console.log('Data2: '+JSON.stringify(data2));
                                    console.log("Post Options: "+JSON.stringify(optionspost2));
                                    speechOutput = "Sorry something went wrong. To try again say delete a card.";
                                    that.emit(':askWithCard', speechOutput, reprompt, cardTitle, speechOutput);
                                }
                                // this.emit(':askWithCard', speechOutput, reprompt, cardTitle, speechOutput);
                                // });
                            }
                        }
                        else if(data[i].name.toLowerCase() == CardNameSlotRaw.toLowerCase() && this.event.request.intent.confirmationStatus !== 'CONFIRMED'){
                            console.log("Found Name: "+data[i].name.toLowerCase());
                            console.log("Entered Name: "+CardNameSlotRaw.toLowerCase());
                            speechOutput = "Cancelled deleting card "+CardNameSlotRaw+". "+nextInvocation[Math.floor(Math.random()*nextInvocation.length)];
                            this.emit(':askWithCard', speechOutput, reprompt, cardTitle, speechOutput);
                        }
                        else if(this.event.request.intent.confirmationStatus === 'CONFIRMED' && !(cardNames.indexOf(CardNameSlotRaw.toLowerCase()) > -1) && set === data.length){
                            console.log("Found Name: "+data[i].name.toLowerCase());
                            console.log("Entered Name: "+CardNameSlotRaw.toLowerCase());
                            speechOutput = "Cannot find card "+CardNameSlotRaw+", please check if your card exists in "+this.attributes['currentBoardName']+". "+nextInvocation[Math.floor(Math.random()*nextInvocation.length)];
                            this.emit(':askWithCard', speechOutput, reprompt, cardTitle, speechOutput);
                        }
                        else if(this.event.request.intent.confirmationStatus !== 'CONFIRMED' && !(cardNames.indexOf(CardNameSlotRaw.toLowerCase()) > -1) && set === data.length){
                            console.log("Found Name: "+data[i].name.toLowerCase());
                            console.log("Entered Name: "+CardNameSlotRaw.toLowerCase());
                            speechOutput = "Cancelled deleting card "+CardNameSlotRaw+", please check if your card exists in "+this.attributes['currentBoardName']+". "+nextInvocation[Math.floor(Math.random()*nextInvocation.length)];
                            this.emit(':askWithCard', speechOutput, reprompt, cardTitle, speechOutput);
                        }
                    }// for close
                }); //res end close

            }); //http get close
            //API execution ends
        }

        //Your custom intent handling goes here
        // speechOutput = "This is a place holder response for the intent named DeleteCard, which includes dialogs. This intent has one slot, which is CardName. Anything else?";
        // this.emit(':ask', speechOutput, speechOutput);
    },
    'TasksDue': function () {
        // SignIn Check
        if(this.event.context.System.user.accessToken === ''){
            // this.emit('SignIn');
            speechOutput = 'Welcome to Glo Boards! Please, link your account by opening the Alexa app on your mobile device.';
            //any intent slot variables are listed here for convenience
            this.emit(':tell', speechOutput, 'Please, link your GitKraken account by opening the Alexa app on your mobile device.');
            this.emit(':tellWithLinkAccountCard', 'Please, link your GitKraken account by opening the Alexa app on your mobile device.');
        }

        //delegate to Alexa to collect all the required slot values
       let filledSlots = delegateSlotCollection.call(this);
        speechOutput = '';
        //any intent slot variables are listed here for convenience
        let DueDateSlotRaw = this.event.request.intent.slots.DueDate.value;
        console.log(DueDateSlotRaw);
        let DueDateSlot = resolveCanonical(this.event.request.intent.slots.DueDate);
        console.log(DueDateSlot);

        cardTitle = 'Tasks Due';
        speechOutput = '';
        reprompt = nextInvocation[Math.floor(Math.random()*nextInvocation.length)]+' Ask for help to explore more options.';
        cardText = '';
        var body, body2, data, data2, string, string2;
        if(typeof this.attributes['currentBoardID'] === 'undefined'){
            speechOutput = "You have not selected a board. Please say 'list all board' to list available boards and select one from it.";
            cardText = "Say 'list all boards' to get available boards.";
            this.emit(':askWithCard', speechOutput, reprompt, cardTitle, cardText);
            // this.emit("SelectBoard");
        }
        else{
            // API execution starts
            var reqheaders = {
                'accept': 'application/json',
                'Content-Type' : 'application/json',
                'Authorization': 'Bearer '+this.event.context.System.user.accessToken
            };
            // the post options
            var optionspost = {
                host : 'gloapi.gitkraken.com',
                port : 443,
                path : '/v1/glo/boards/'+this.attributes['currentBoardID']+'/cards?fields=assignees&fields=column_id&fields=created_by&fields=due_date&fields=description&fields=name',
                method : 'GET',
                headers : reqheaders
            };

            http.get(optionspost, response => {
                body = "";
                response.on('data', (chunk) => { body += chunk })
                response.on('end', () => {
                    // Check for Authentication
                    if(response.statusCode == 401){
                        // this.emit('SignIn');
                        speechOutput = 'Welcome to Glo Boards! Please, link your account by opening the Alexa app on your mobile device.';
                        //any intent slot variables are listed here for convenience
                        this.emit(':tell', speechOutput, 'Please, link your GitKraken account by opening the Alexa app on your mobile device.');
                        this.emit(':tellWithLinkAccountCard', 'Please, link your GitKraken account by opening the Alexa app on your mobile device.');
                    }
                    data = JSON.parse(body);
                    console.log('Data: '+JSON.stringify(data));
                    console.log('Current User: '+this.attributes['currentUserID']);
                    string = "";
                    var cnt = 0;
                    for(var i=0;i<data.length;i++){
                        if(typeof data[i].due_date !== 'undefined' && data[i].due_date !== null){
                            var dueDate = data[i].due_date.replace(/[T][^T]*[Z$]/, "");
                            console.log("Due Date : "+dueDate);
                            if(dueDate === DueDateSlotRaw){
                                cnt++;
                                if(typeof this.attributes['currentUserID'] !== 'undefined'){
            
                                        if(cnt>0){
                                            // if(typeof data[i].description.text !== 'undefined'){
                                            //     string += ',<break strength="strong"/> Card '+parseInt(cnt)+'. '+data[i].name+' for '+data[i].description.text+'.';
                                            //     string2 += ', Card '+parseInt(cnt)+'. '+data[i].name+' for '+data[i].description.text+'.';
                                            // }
                                            // else{
                                                string += ',<break strength="strong"/> Card '+parseInt(cnt)+'. '+data[i].name+'.';
                                                string2 += ', Card '+parseInt(cnt)+'. '+data[i].name+'.';
                                            // }
                                        }
                                        else{
                                            // if(typeof data[i].description.text !== 'undefined'){
                                            //     string += '<break strength="strong"/> Card '+parseInt(cnt)+'. '+data[i].name+' for '+data[i].description.text+'.';
                                            //     string2 += ' Card '+parseInt(cnt)+'. '+data[i].name+' for '+data[i].description.text+'.';
                                            // }
                                            // else{
                                                string += '<break strength="strong"/> Card '+parseInt(cnt)+'. '+data[i].name+'.';
                                                string2 += ' Card '+parseInt(cnt)+'. '+data[i].name+'.';
                                            // }
                                        }
                                    }
                                }
                                else{
                                    for(var j=0;j<data[i].assignees.length;j++){
                                        if(data[i].assignees[j].id === this.attributes['currentUserID']){
                                            if(cnt>0){
                                                // if(typeof data[i].description.text !== 'undefined'){
                                                //     string += ',<break strength="strong"/> Card '+parseInt(cnt)+'. '+data[i].name+' for '+data[i].description.text+'.';
                                                //     string2 += ', Card '+parseInt(cnt)+'. '+data[i].name+' for '+data[i].description.text+'.';
                                                // }
                                                // else{
                                                    string += ',<break strength="strong"/> Card '+parseInt(cnt)+'. '+data[i].name+'.';
                                                    string2 += ', Card '+parseInt(cnt)+'. '+data[i].name+'.';
                                                // }
                                            }
                                            else{
                                                // if(typeof data[i].description.text !== 'undefined'){
                                                //     string += '<break strength="strong"/> Card '+parseInt(cnt)+'. '+data[i].name+' for '+data[i].description.text+'.';
                                                //     string2 += ' Card '+parseInt(cnt)+'. '+data[i].name+' for '+data[i].description.text+'.';
                                                // }
                                                // else{
                                                    string += '<break strength="strong"/> Card '+parseInt(cnt)+'. '+data[i].name+'.';
                                                    string2 += ' Card '+parseInt(cnt)+'. '+data[i].name+'.';
                                                // }
                                            }
                                        }
                                    }
                                }
                            } // due date
                        } // for data.length
                    if(data.message !== 'undefined'){
                        speechOutput = "You have not selected a board. Please say 'list all board' to list available boards and select one from it.";
                        cardText = "Say 'list all boards' to get available boards.";
                    }
                    console.log('Counter: '+cnt);
                    if(cnt>0){
                        speechOutput = 'The cards due on '+DueDateSlotRaw+' are'+string+' '+nextInvocation[Math.floor(Math.random()*nextInvocation.length)];
                        cardText = 'The cards due on '+DueDateSlotRaw+' are'+string2+' '+nextInvocation[Math.floor(Math.random()*nextInvocation.length)];
                    }
                    else if(cnt == 0){
                        speechOutput = "Sorry no card were due on "+DueDateSlotRaw+". "+nextInvocation[Math.floor(Math.random()*nextInvocation.length)];
                        cardText = "Sorry no card were due on "+DueDateSlotRaw+". "+nextInvocation[Math.floor(Math.random()*nextInvocation.length)];
                    }

                    this.emit(':askWithCard', speechOutput, reprompt, cardTitle, cardText);

                });
            });
        }

        //Your custom intent handling goes here
        // speechOutput = "The tasks due date is"+DueDateSlotRaw+". This intent has one slot, which is DueDate. Anything else?";
        // this.emit(':ask', speechOutput, speechOutput);
    },
	'AMAZON.HelpIntent': function () {
		speechOutput = 'You can perform following basic operations on GitKraken Glo boards: List, Add or Delete Boards, columns, Cards. Or Move a card from one column to another and get tasks or cards due for a particular date like tomorrow.';
		reprompt = ""+nextInvocation[Math.floor(Math.random()*nextInvocation.length)];
        CardTitle = 'Glow Boards Help';

		this.emit(':askWithCard', speechOutput, reprompt, cardTitle, speechOutput);
	},
   'AMAZON.CancelIntent': function () {
		speechOutput = 'Your action has been cancelled. See you later!';
        cardTitle = "Glo Bright!"
		this.emit(':tellWithCard', speechOutput, cardTitle, speechOutput);
	},
   'AMAZON.StopIntent': function () {
		speechOutput = byeTexts[Math.floor(Math.random()*byeTexts.length)]+rateUs[Math.floor(Math.random()*rateUs.length)];
		cardTitle = "Glo Bye!"
        this.emit(':tellWithCard', speechOutput, cardTitle, speechOutput);
   },
   'SessionEndedRequest': function () {
		speechOutput = 'Your session ended abruptly for some reason.';
		//this.emit(':saveState', true);//uncomment to save attributes to db on session end
		cardTitle = "Glo Boards!"
        this.emit(':tellWithCard', speechOutput, cardTitle, speechOutput);
   },
	'AMAZON.NavigateHomeIntent': function () {
        speechOutput = '';

		//any intent slot variables are listed here for convenience


		//Your custom intent handling goes here
		speechOutput = "Welcome to Glo Boards. What would you like to do next?";
        reprompt = nextInvocation[Math.floor(Math.random()*nextInvocation.length)]+" Ask for help to explore more options.";
        cardTitle = "Glo Home";
		this.emit(":askWithCard", speechOutput, reprompt, cardTitle, speechOutput);
    },
	'AMAZON.FallbackIntent': function () {
		speechOutput = '';

		//any intent slot variables are listed here for convenience


		//Your custom intent handling goes here
		speechOutput = "Sorry I did not understand that, ask for help to explore more options. "+nextInvocation[Math.floor(Math.random()*nextInvocation.length)];
        reprompt = nextInvocation[Math.floor(Math.random()*nextInvocation.length)]+" Ask for help to explore more options.";
        cardTitle = "Glo Home.";
        this.emit(":askWithCard", speechOutput, reprompt, cardTitle, speechOutput);
    },	
	'Unhandled': function () {
        speechOutput = "Welcome to Glo Boards. "+nextInvocation[Math.floor(Math.random()*nextInvocation.length)];
        reprompt = nextInvocation[Math.floor(Math.random()*nextInvocation.length)]+" Ask for help to explore more options.";
        cardTitle = "Glo Home!";
        this.emit(":askWithCard", speechOutput, reprompt, cardTitle, speechOutput);
    }
};

exports.handler = (event, context) => {
    const alexa = Alexa.handler(event, context);
    alexa.appId = APP_ID;
    // To enable string internationalization (i18n) features, set a resources object.
    //alexa.resources = languageStrings;
    alexa.registerHandlers(handlers);
	alexa.dynamoDBTableName = 'glo-boards'; //uncomment this line to save attributes to DB
    alexa.execute();
};

//    END of Intent Handlers {} ========================================================================================
// 3. Helper Function  =================================================================================================

function resolveCanonical(slot){
	//this function looks at the entity resolution part of request and returns the slot value if a synonyms is provided
	let canonical;
    try{
		canonical = slot.resolutions.resolutionsPerAuthority[0].values[0].value.name;
	}catch(err){
	    console.log(err.message);
	    canonical = slot.value;
	};
	return canonical;
};

function delegateSlotCollection(){
  console.log("in delegateSlotCollection");
  console.log("current dialogState: "+this.event.request.dialogState);
    if (this.event.request.dialogState === "STARTED") {
      console.log("in Beginning");
	  let updatedIntent= null;
	  // updatedIntent=this.event.request.intent;
      //optionally pre-fill slots: update the intent object with slot values for which
      //you have defaults, then return Dialog.Delegate with this updated intent
      // in the updatedIntent property
      //this.emit(":delegate", updatedIntent); //uncomment this is using ASK SDK 1.0.9 or newer
	  
	  //this code is necessary if using ASK SDK versions prior to 1.0.9 
	  if(this.isOverridden()) {
			return;
		}
		this.handler.response = buildSpeechletResponse({
			sessionAttributes: this.attributes,
			directives: getDialogDirectives('Dialog.Delegate', updatedIntent, null),
			shouldEndSession: false
		});
		this.emit(':responseReady', updatedIntent);
		
    } else if (this.event.request.dialogState !== "COMPLETED") {
      console.log("in not completed");
      // return a Dialog.Delegate directive with no updatedIntent property.
      //this.emit(":delegate"); //uncomment this is using ASK SDK 1.0.9 or newer
	  
	  //this code necessary is using ASK SDK versions prior to 1.0.9
		if(this.isOverridden()) {
			return;
		}
		this.handler.response = buildSpeechletResponse({
			sessionAttributes: this.attributes,
			directives: getDialogDirectives('Dialog.Delegate', null, null),
			shouldEndSession: false
		});
		this.emit(':responseReady');
		
    } else {
      console.log("in completed");
      console.log("returning: "+ JSON.stringify(this.event.request.intent));
      // Dialog is now complete and all required slots should be filled,
      // so call your normal intent handler.
      return this.event.request.intent;
    }
}


function randomPhrase(array) {
    // the argument is an array [] of words or phrases
    let i = 0;
    i = Math.floor(Math.random() * array.length);
    return(array[i]);
}
function isSlotValid(request, slotName){
        let slot = request.intent.slots[slotName];
        //console.log("request = "+JSON.stringify(request)); //uncomment if you want to see the request
        let slotValue;

        //if we have a slot, get the text and store it into speechOutput
        if (slot && slot.value) {
            //we have a value in the slot
            slotValue = slot.value.toLowerCase();
            return slotValue;
        } else {
            //we didn't get a value in the slot.
            return false;
        }
}

//These functions are here to allow dialog directives to work with SDK versions prior to 1.0.9
//will be removed once Lambda templates are updated with the latest SDK

function createSpeechObject(optionsParam) {
    if (optionsParam && optionsParam.type === 'SSML') {
        return {
            type: optionsParam.type,
            ssml: optionsParam['speech']
        };
    } else {
        return {
            type: optionsParam.type || 'PlainText',
            text: optionsParam['speech'] || optionsParam
        };
    }
}

function buildSpeechletResponse(options) {
    let alexaResponse = {
        shouldEndSession: options.shouldEndSession
    };

    if (options.output) {
        alexaResponse.outputSpeech = createSpeechObject(options.output);
    }

    if (options.reprompt) {
        alexaResponse.reprompt = {
            outputSpeech: createSpeechObject(options.reprompt)
        };
    }

    if (options.directives) {
        alexaResponse.directives = options.directives;
    }

    if (options.cardTitle && options.cardContent) {
        alexaResponse.card = {
            type: 'Simple',
            title: options.cardTitle,
            content: options.cardContent
        };

        if(options.cardImage && (options.cardImage.smallImageUrl || options.cardImage.largeImageUrl)) {
            alexaResponse.card.type = 'Standard';
            alexaResponse.card['image'] = {};

            delete alexaResponse.card.content;
            alexaResponse.card.text = options.cardContent;

            if(options.cardImage.smallImageUrl) {
                alexaResponse.card.image['smallImageUrl'] = options.cardImage.smallImageUrl;
            }

            if(options.cardImage.largeImageUrl) {
                alexaResponse.card.image['largeImageUrl'] = options.cardImage.largeImageUrl;
            }
        }
    } else if (options.cardType === 'LinkAccount') {
        alexaResponse.card = {
            type: 'LinkAccount'
        };
    } else if (options.cardType === 'AskForPermissionsConsent') {
        alexaResponse.card = {
            type: 'AskForPermissionsConsent',
            permissions: options.permissions
        };
    }

    let returnResult = {
        version: '1.0',
        response: alexaResponse
    };

    if (options.sessionAttributes) {
        returnResult.sessionAttributes = options.sessionAttributes;
    }
    return returnResult;
}

function getDialogDirectives(dialogType, updatedIntent, slotName) {
    let directive = {
        type: dialogType
    };

    if (dialogType === 'Dialog.ElicitSlot') {
        directive.slotToElicit = slotName;
    } else if (dialogType === 'Dialog.ConfirmSlot') {
        directive.slotToConfirm = slotName;
    }

    if (updatedIntent) {
        directive.updatedIntent = updatedIntent;
    }
    return [directive];
}

function isEmpty(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }

    return true;
}