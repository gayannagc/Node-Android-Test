var mongodb = require("mongodb");
var ObjectID = mongodb.ObjectID;
var crypto = require("crypto");
var express = require("express");
var bodyParser = require("body-parser");

//password utils , function to generate random salts
var genRandomString = function(length){
    return crypto.randomBytes(Math.ceil(length/2))
    .toString('hex')
    .slice(0,length);

}

var sha512 = function(password,salt){
    var hash = crypto.createHash('sha512', salt);
    hash.update(password);
    var value = hash.digest('hex');
    return {
        salt : salt,
        passwordHash : value
    }
}

function saltHashPassword(userPassword){
    var salt = genRandomString(16);
    var passwordData = sha512(userPassword,salt);
    return passwordData;
}

function checkHashPassword(userPassword,salt){
    var passwordData = sha512(userPassword,salt);
    return passwordData;
}
//create express services
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));

//create mongodb client
var MongoClient = mongodb.MongoClient;
//mongodb url
var url = "mongodb://localhost:27017"

MongoClient.connect(url,{useNewUrlParser:true}, function(err,client){
    if(err){
        console.log("unable to connect to mongodb", err);
    }else{

        app.post('/register', function(request,response,next){
            var post_data = request.body;

            var plaint_password = post_data.password;
            var hash_data =saltHashPassword(plaint_password);
            var password = hash_data.passwordHash;
            var salt = hash_data.salt;
           
            var name = post_data.name;
            var email = post_data.email;

            var inserJson = {
                'email' : email,
                'password' : password,
                'salt' : salt,
                'name' : name


            }

            var db = client.db('testdb');
            db.collection('user')
            .find({'email':email}).count(function(err,number){
                if(number != 0){
                    response.json("email already exists");
                    console.log('email already exists');
                }else{
                    db.collection('user')
                    .insertOne(inserJson, function(err,res){
                        response.json("registration successful");
                        console.log('registration successful');
                    })
                }
            })


        })

        app.post('/login', function(request,response,next){
            var post_data = request.body;

            var email = post_data.email;
            var userPassweord = post_data.password;

            
            var db = client.db('testdb');
            db.collection('user')
            .find({'email':email}).count(function(err,number){
                if(number == 0){
                    //res.json("email does not exists");
                    console.log('email does not exists');
                }else{
                    db.collection('user')
                    .findOne({'email' : email}, function(err,user){
                        var salt = user.salt;
                        var hashed_password = checkHashPassword(userPassweord,salt);
                        var encrypted_password = user.password;
                        if(encrypted_password == hashed_password.passwordHash){
                            response.json("login successful");
                            console.log('login successful');
                        }else{
                            response.json("wrong password");
                            console.log("wrong password");
                        }
                    })
                }
            })
        })




        app.listen(3000, ()=>{
            console.log("connected to mongodb");
        })
    }
})