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

var plaint_password= "gayan123";
var hash_data =saltHashPassword(plaint_password);
var password = hash_data.passwordHash;
var salt = hash_data.salt;
console.log('password: ',password);

var hashed_password = checkHashPassword(plaint_password,salt)
console.log(hashed_password.passwordHash);
console.log(hashed_password.passwordHash == password);