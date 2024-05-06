// Modules import
const fs = require('fs');
const TOKEN_PATH = './token/access_token.txt';
const REFRESH_TOKEN_PATH = './token/refresh_token.txt'

function saveAccessToken (token){
    try {
        fs.writeFileSync(TOKEN_PATH, token)

        console.log('Access Token Saved!\n')
    } catch (error) {
        console.log('Error saving to file. Error: ', error)
    }
};

function saveRefreshToken (token){
    try {
        fs.writeFileSync(REFRESH_TOKEN_PATH, token)

        console.log('Refresh Token Saved!\n')
    } catch (error) {
        console.log('Error saving to file. Error: ', error)
    }
};

function readAccessToken () {
    return fs.readFileSync(TOKEN_PATH, 'utf8')
};


function readRefreshToken () {
    return fs.readFileSync(REFRESH_TOKEN_PATH, 'utf8')
};

module.exports = { saveAccessToken, readAccessToken, saveRefreshToken, readRefreshToken };