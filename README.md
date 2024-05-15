# playlist-maker
Makes a playlist based off a given list of genres. Uses Spotify API. 

## Technologies in Microservice
Node.js, Javascript, ZeroMQ


## Instructions
See [Spotify Web API](https://developer.spotify.com/documentation/web-api) for more in depth instructions for completing up to step 5.
1. You must first set up a Spotify account and log in.
2. Navigate to [Your Dashboard](https://developer.spotify.com/dashboard) and create a new App. 
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
See [ZeroMQ Documentation](https://zeromq.org/get-started/) for information how to import the module/package and use.

Using ZeroMQ, as long as you bind to port 5555 and send a request to that port on your local machine, all you have to do is send an array object as the message using ZeroMQ. Here is an example of a request set up and sent to the microservice. You will need to send the number of songs (max 100) and the genres (max 5). The genres are defined in the **genres.txt** file. 

### Python Example Request/Receive: 
You need to install the python package by using `pip install pyzmq`.

```
# Import ZeroMQ package
import zmq

# Context setup
context = zmq.Context()

# Connect to socket on port 5555
print("Connecting to the socket on PORT: 5555...\n")
sock = context.sock(zmq.REQ)
sock.connect("tcp://localhost:5555")

# Set up request here with defined variables
request = {
    'limit_songs': NUMBER_SONGS,    // Define number of songs you want. MIN 1 and MAX 100.
    'selected_genres': [ARRAY_GENRES]  // Define your genres in an array. MAX 5. (Ex: ['anime', 'classical'])
}

# Send the request in JSON format
sock.sent_json(request)

# Reply is in JSON format so we have to convert it back to Python object from JSON using .recv_json()
reply = sock.recv_json()

# Process response here...
print(f'Response: {data}')

```

### Node.js Example Request/Receive: 
You need to install the Node.js package by using `npm i zmq` and then start the program using `npm start`.

```
// Import ZeroMQ node module
const zmq = require('zeromq');

async function runRequest() {
    console.log('Connecting to playlist-service…');

    //  Connect to socket on port 5555
    const sock = new zmq.Request();
    sock.connect('tcp://localhost:5555');

    // Set up your request here with defined variables
    const request = {
        limit_songs: NUMBER_SONGS,    // Define number of songs you want. MAX 100.
        selected_genres: [ARRAY_GENRES]  // Define your genres in an array. MAX 5. (Ex: ['anime', 'classical'])
    };

    // Send the request in JSON format using stringify()
    sock.send(JSON.stringify(request));

    // The response object is a JSON object that is a array (list) of track dictionary objects. 
    const [response] = await sock.receive();
    
     // You will need to parse the object back into a string.
    data = JSON.parse(response.toString())

    // Process response here...
    console.log('Response: ${data}')
}

runRequest();
```

## Data Received From Microservice
Spotify returns a huge amount of amount of data. See [Spotify - Get Recommendations](https://developer.spotify.com/documentation/web-api/reference/get-recommendations) to see how the response data is formatted. The microservice already has a function that processed the data which returns an array object of songs. Each song object is a dictionary which has 5 parameters as follows: 

```
received_data = {
    name: NAME,
    album: ALBUM,
    artist_name: ARTIST,
    duration: DURATION,
    link_url: SPOTIFY_LINK
}
```

## UML Diagram
![UML Diagram](public/images/UML%20Diagram_playlist-generator.png)

## Post Data Processing from Spotify API
Here is an example piece of code I used to extract the song name, album name, artist title, duration, and spotify link from the response data. The function returns an array that contains a dictionary of the song information at ind[0] and the length at ind[1]. This function is already called in the microservice. You can modify this to extract more data types from the original track object as needed.

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