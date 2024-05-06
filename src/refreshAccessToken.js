const axios = require('axios');

/* 
    ***FUNCTION DOES NOT WORK CURRENTLY AND HAS NO CURRENT USE***
*/
async function refreshAccessToken(accessToken, CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN) {
    try {
        const response = await axios.get(TOKEN_ENDPOINT, {
            grant_type: 'refresh_token',
            refresh_token: REFRESH_TOKEN,
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET
        }, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        if (response.status === 200) {
            accessToken = response.data.access_token;
            console.log('Access Token refreshed:', accessToken);
            return accessToken;
        } else {
            console.error('Failed to refresh access token:', response.statusText);
        }
    } catch (error) {
        console.error('Error refreshing access token:', error.message);
    }
}

module.exports = {refreshAccessToken};