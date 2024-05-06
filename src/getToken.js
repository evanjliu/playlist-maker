const axios = require('axios');

async function getAccessToken(CLIENT_ID, CLIENT_SECRET, TOKEN_ENDPOINT) {
    try {
        const response = await axios.post(TOKEN_ENDPOINT,{
            grant_type: 'client_credentials',
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET
        }, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        if (response.status === 200) {
            console.log(response.data);
            
            // Extract token from object adn then return
            const accessToken = response.data.access_token;
            console.log('Access Token:', accessToken, '\n');
            return accessToken;
        } else {
            console.error('Failed to obtain access token:', response.statusText);
        }
    } catch (error) {
        console.error('Error obtaining access token:', error.message);
    }
};

module.exports = {getAccessToken};