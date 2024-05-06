// ZeroMQ and other modules
const zmq = require('zeromq');

// Import get token functions
// Currently refresh token does not work and is unused
const { getAccessToken } = require('./src/getToken');
const { refreshAccessToken } = require('./src/refreshAccessToken');
const { readAccessToken, saveAccessToken, readRefreshToken, saveRefreshToken } = require('./src/accessTokens');

// -----------------------------------------------------------------------------------------------------------
// Define Spotify credentials here
// INSTRUCTIONS TO GET SPOTIFY CLIENT CREDENTIALS: 
// URL: https://developer.spotify.com/documentation/web-api 
// 
// 1: Log into spotify account.
// 2: Create a developer app and select "Web API" when asked about which API you want to use.
// 3: Navigate to your account dashboard and copy/paste your CLIENT_ID and CLIENT_SECRET into these variables.
// -----------------------------------------------------------------------------------------------------------
const CLIENT_ID = 'YOUR_CLIENT_ID';
const CLIENT_SECRET = 'YOUR_CLIENT_SECRET';
const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';

// Spotify Web API and set up authentication
const SpotifyWebAPI = require('spotify-web-api-node');
const spotify = new SpotifyWebAPI({
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    redirectUri: 'http://www.spotify.com'
});

// ---------------------------------------
// FUNCTION TO CREATE PLAYLIST
// ---------------------------------------
async function createPlaylist() {
    console.log('Microservice is up and Running. \n\nNow waiting for messages...\n');

    // ZeroMQ sockets
    // Set up reply server, which replies to all messages send to port 5555 on local device
    const sock = new zmq.Reply();
    await sock.bind('tcp://*:5555');

    // Get Spotify Tokens from token text files if present
    console.log("Retrieving Access Token...\n")
    let myToken = readAccessToken();

    // If tokens were present, use those
    // If not present, get new tokens
    if (myToken.length > 0) {
        console.log('Current Access Token: ', myToken, '\n');
        spotify.setAccessToken(myToken);
    } else {
        // If no token found, get another new token
        console.log('No token was found. Fetching new token...\n')
        const myToken = await getAccessToken(CLIENT_ID, CLIENT_SECRET, TOKEN_ENDPOINT);

        // Set access token
        spotify.setAccessToken(myToken);

        // Save token to text file
        saveAccessToken(myToken);
        console.log('Current Access Token: ', myToken, '\n');
    }

    // Test Token
    // If token is expired, refresh token.
    // If token is incomplete or wrong, get a new token.
    try {
        const test = await spotify.searchTracks('Heat Waves', { limit: 3 })
        console.log('Testing Token...\n\nTest Data: ', test.body, '\n');

    } catch (error) {
        if (error.statusCode === 401) {
            // Attempt to get new token because the current one is expired or incorrect
            console.log('Token was expired or broken, attempting to get new token...\n')
            const myToken = await getAccessToken(CLIENT_ID, CLIENT_SECRET, TOKEN_ENDPOINT);

            // Set access token
            spotify.setAccessToken(myToken);

            // Save token to text file
            saveAccessToken(myToken);
            console.log('Current Access Token: ', myToken, '\n');

            // Test again
            const retest1 = await spotify.searchTracks('I want it that way', { limit: 3 })
            console.log('Testing Token...\n\nTest Data: ', retest1.body, '\n');
        }
    }

    console.log('Tests successful! Starting up playlist microservice and listening for messages...\n')

    // Token Refresh every hour
    // Spotify Tokens expire every hour, so it checks every hour to refresh.
    setInterval(async () => {
        console.log("Refreshing Access Token...\n");
        try {
            // Get new token
            const myToken = await getAccessToken(CLIENT_ID, CLIENT_SECRET, TOKEN_ENDPOINT);

            // Set access token
            spotify.setAccessToken(myToken);

            // Save token to the txt file
            saveAccessToken(myToken);

            // Test using new token
            const retest2 = await spotify.searchTracks("Lover's Oath", { limit: 3 });
            console.log('Testing Token...\n\nTest Data: ', retest2.body, '\n');

        } catch (error) {
            console.error('Refresh did not work, error: ', error);
            return;
        }

        console.log("Token Refreshed!\n\nReady for incoming requests on port 5555...\n\n")


    }, 3500000); // Refresh token every hour

    //-------------------------------------------------
    // Receive messages and process
    //-------------------------------------------------

    // Define variables
    let numSongs = 5;
    let genres = ['anime'];

    // Recieves ZeroMQ messages on port 5555.
    // For every message recieved, processes it and replies in the same port.
    for await (const [msg] of sock) {

        let request = JSON.parse(msg);
        console.log('Received Message' + ': ' + msg + '\n');

        // Set User parameters to values to be used to make API call
        numSongs = (request.limit_songs);
        genres = [request.selectedGenres];

        // Spotify Routes and API Calls
        try {
            spotify.getRecommendations({
            seed_genres: genres,
            limit: numSongs
            })

                .then(function (data) {

                    const items = data.body.tracks;

                    // Prints song name to console
                    for (let i = 0; i < items.length; i++) {
                        console.log(i + 1, ': Song Name - ', items[i].name)
                    };

                    // Send back the playlist with tracks info only. See:
                    // https://developer.spotify.com/documentation/web-api/reference/get-recommendations
                    // for how the tracks object is formatted.
                    sock.send(JSON.stringify(items));

                }), function (err) {
                    console.error('Something went wrong.', err);
                }
        } catch(error) {
            console.log('Attempting to get new token...\n')

            // Get new token
            const myToken = await getAccessToken(CLIENT_ID, CLIENT_SECRET, TOKEN_ENDPOINT);

            // Set access token
            spotify.setAccessToken(myToken);

            // Save token to the txt file
            saveAccessToken(myToken);

            // Test using new token
            const retest3 = await spotify.searchTracks("Ruler in my Heart", { limit: 3 });
            console.log('Testing Token...\n\nTest Data: ', retest3.body, '\n');

            console.log("Token Refreshed!\n\nPlease execute the request again on port 5555...\n\n")
        }
    };

}

createPlaylist();
