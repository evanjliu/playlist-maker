# playlist-maker
Makes a playlist based off a given list of genres. Uses Spotify API. 

## Technologies
Node.js, Javascript, ZeroMQ

## Instructions
See [Spotify Web API](https://developer.spotify.com/documentation/web-api) for more in depth instructions for completing up to step 5.
1. You must first set up a Spotify account and log in.
2. Navigate to [Your Dashboad](https://developer.spotify.com/dashboard) and create a new App. 
3. For your new app settings, name it whatever you like. Just make sure to select the **"Web API"** in for the **Which API/SDKs are you planning to use?** question.
4. Navigate  go to your new app settings in your app dashboard.
5. Once in the settings tab, you can copy and paste the `CLIENT_ID` and `CLIENT_SECRET` into the app.js file.

## App.js
6. Open up ***app.js*** and copy over your client credentials into the variables listed as `CLIENT_ID` and `CLIENT_SECRET`.
7. Make sure you have Node.js installed. Follow [Node.js - How to Install](https://nodejs.org/en/learn/getting-started/how-to-install-nodejs)
8. Once you verified that Node.js is installed, open up an integrated terminal and install the required node packages: 
```
npm i
```
9. Then run the program using: 
```
npm start
```
10. As long as everything works, the program will confirm that a token was recieved and working!

## How to request
See [ZeroMQ Documentation](https://zeromq.org/get-started/) for informaiton how to import the modules and use.

Using ZeroMQ, as long as you bind to port 5555 and send a request to that port on your local machine, all you have ot do is send an array object as the message using ZeroMQ. Here is an example of a request set up and sent to the microservice. You will need to send the number of songs you want and the genres. The genres are defined in the **genres.txt** file. 

```
// Node.js dependencies
const zmq = require('zeromq');

async function runRequest() {
    console.log('Connecting to playlist-service…');

    //  Socket to talk to server
    const sock = new zmq.Request();
    sock.connect('tcp://localhost:5555');

    // Set up your request here with defined variables
    const request = {
        limit_songs,    // Define number of songs you want. MAX 100
        selectedGenres  // Define your genres in an array. See **genres.txt** to see the full list of genres available for Spotify. 
    };

    sock.send(request);

    const [response] = await sock.receive();

    // Process response here...
    console.log('Response:', response.data)
}

runRequest();
```

Once you recieve your response in the response variable. Spotify returns a huge amount of amount of data. See [Spotify - Get Recommendations](https://developer.spotify.com/documentation/web-api/reference/get-recommendations) to see how the response data is formatted. Here is an example piece of code I used to extract the song name, album name, artist title, duration, and spotify link from the response data. The fucntion returns an array that contains a dictionary of the song information at Ind 0 and the length at Ind 2. 

It takes in 2 parameters: the resulting response from the API call, the number of songs listed.

```
function makePlaylistArray(result, song_limit) {
            // Define variables
            let playlist = [];
            let cur_track = [];
            let duration = 0;
            let totalSeconds = 0;
            let minutes = 0;
            let seconds = 0;
            let final_duration = "";
            let name = "";
            let album = "";
            let artist = "";
            let link = "";
            let i = 0;

            // Process result and place needed information into playlist array
            while ((i < result.length) && (playlist.length < song_limit)) {
                // Get duration
                duration = result[i].duration_ms;
                

                totalSeconds = Math.floor(duration / 1000);

                // Calculate minutes and remaining seconds
                minutes = Math.floor(totalSeconds / 60);
                seconds = totalSeconds % 60;

                final_duration = minutes.toString() + ":" + seconds.toString().padStart(2, '0');

                // Get Name
                if (result[i].name){
                    name = result[i].name;
                } else {
                    name = "";
                }
                
                // Get album name
                if (result[i].album.name) {
                    album = result[i].album.name;
                } else {
                    album = "";
                }

                // Get artist_name 
                if (result[i].artists[0].name) {
                    artist = result[i].artists[0].name;
                } else {
                    artist = "";
                }

                if (result[i].external_urls.spotify) {
                    link = result[i].external_urls.spotify;
                } else {
                    link = ""
                }

                // Make current track dictionary
                cur_track = {
                    name: name,
                    album: album,
                    artist_name: artist,
                    duration: final_duration,
                    link_url: link
                };
                playlist.push(cur_track);
                
            }
            // Increase index
            i++;
            

            return [playlist, playlist.length]
};
```

Happy coding!