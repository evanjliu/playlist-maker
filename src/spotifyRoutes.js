// Routes

// Search tracks
spotify.searchTracks('Ruler in my Heart', { limit:10 })
.then(function(data) {
    console.log('Searching by "Ruler in my Heart');

    // Testing
    const items = data.body.tracks.items;
    for(let i = 0; i < items.length; i++) {
        console.log(items[i].name)
    };
}, function(err) {
    console.error(err);
});

// Getting genre seeds
let genreArr = [];
spotify.getAvailableGenreSeeds()
    .then(function(data) {
        let genreSeeds = data.body;

    for(let i = 0; i < genreSeeds.genres.length; i++){
        genreArr.push(genreSeeds.genres[i])
    }
        console.log(genreArr);
        fs.writeFileSync('genres.txt', JSON.stringify(genreArr));
    }, function(err) {
        console.log('Something went wrong!', err);
    });