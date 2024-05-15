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
        i++; 
    }
    // Increase index

    

    return [playlist, playlist.length]
};

module.exports = { makePlaylistArray };