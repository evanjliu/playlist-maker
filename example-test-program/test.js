// Node.js dependencies
const zmq = require('zeromq');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function runRequest() {
    console.log('Connecting to playlist-service…');

    // Socket to talk to server
    const sock = new zmq.Request();
    sock.connect('tcp://localhost:5555');

    // Prompt user for the number of songs
    let numSongs = 0;
    while (numSongs <= 0 || numSongs > 100) {
        numSongs = await new Promise((resolve) => {
            rl.question("Please input the amount of songs you would like to return (1-100): ", (input) => {
                const num = parseInt(input);
                if (!isNaN(num) && num > 0 && num <= 100) {
                    resolve(num);
                } else {
                    console.log("Number is not in the specified range or is not an integer. Please try again.");
                    resolve(0);
                }
            });
        });
    }

    const genres = ["acoustic","afrobeat","alt-rock","alternative","ambient","anime",
    "black-metal","bluegrass","blues","bossanova","brazil","breakbeat",
    "british","cantopop","chicago-house","children","chill","classical",
    "club","comedy","country","dance","dancehall","death-metal","deep-house",
    "detroit-techno","disco","disney","drum-and-bass","dub","dubstep","edm",
    "electro","electronic","emo","folk","forro","french","funk","garage",
    "german","gospel","goth","grindcore","groove","grunge","guitar","happy",
    "hard-rock","hardcore","hardstyle","heavy-metal","hip-hop","holidays",
    "honky-tonk","house","idm","indian","indie","indie-pop","industrial",
    "iranian","j-dance","j-idol","j-pop","j-rock","jazz","k-pop","kids",
    "latin","latino","malay","mandopop","metal","metal-misc","metalcore",
    "minimal-techno","movies","mpb","new-age","new-release","opera",
    "pagode","party","philippines-opm","piano","pop","pop-film",
    "post-dubstep","power-pop","progressive-house","psych-rock","punk",
    "punk-rock","r-n-b","rainy-day","reggae","reggaeton","road-trip","rock"
    ,"rock-n-roll","rockabilly","romance","sad","salsa","samba","sertanejo"
    ,"show-tunes","singer-songwriter","ska","sleep","songwriter","soul",
    "soundtracks","spanish","study","summer","swedish","synth-pop","tango",
    "techno","trance","trip-hop","turkish","work-out","world-music"]

    console.log("\nAvailable Genres: ", genres);

    let genresInput = [];
    console.log('\nPlease enter a genre from the list above. You may enter up to 5 genres. To end genre input enter "0"');

    while (genresInput.length < 5) {
        const genre = await new Promise((resolve) => {
            rl.question("\nEnter a genre: ", (input) => {
                if (input === "0" && genresInput.length > 0) {
                    rl.close(); // Close the input stream
                    resolve(null);
                } else if (genres.includes(input)) {
                    genresInput.push(input);
                    console.log("\nCurrent Genres: ", genresInput);
                    resolve(input);
                } else {
                    console.log("\nGenre was not found in list. Please check spelling and try again.");
                    resolve(null);
                }
            });
        });
        if (!genre) break;
    }

    // Set up your request here with defined variables
    const request = JSON.stringify({
        limit_songs: numSongs,
        selected_genres: genresInput
    });

    await sock.send(request);

    const [response] = await sock.receive();
    const songs = JSON.parse(response.toString()); // Assuming response is a JSON string

    console.log('Received reply: ', songs);
    songs.forEach((song, index) => {
        console.log(`Song Object #${index + 1}: `, song);
    });
}

runRequest();
