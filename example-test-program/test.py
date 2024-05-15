import zmq

# Port and context setup
context = zmq.Context()
port = 5555

# Connect to socket on port 5555
print("Connecting to the socket on PORT:", port, "...\n")
socket = context.socket(zmq.REQ)
socket.connect("tcp://localhost:5555")

num_songs = 0

while num_songs <= 0:
    try:
        num_songs = int(input("Please input the amount of songs you would like to return (1-100): "))
        if num_songs <= 0 or num_songs > 100:
            num_songs = 0
            print("\nNumber is not in specified range. Please try again. \n")

    except ValueError:
        print("Incorrect input, please type in an integer between 1 and 100.\n")
        num_songs = 0

genres = ["acoustic","afrobeat","alt-rock","alternative","ambient","anime",
"black-metal","bluegrass","blues","bossanova","brazil","breakbeat",
"british","cantopop","chicago-house","children","chill","classical",
"club","comedy","country","dance","dancehall","death-metal","deep-house",
"detroit-techno","disco","disney","drum-and-bass","dub","dubstep","edm"
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

print("\nAvailable Genres: ", genres)

genres_input = []
user_input = ""

print('\nPlease enter a genre in the list above.\nYou may enter up to 5 genres.\nTo end genre input enter "0""')

while len(genres_input) < 5:
    user_input = input("\nEnter a genre: ")

    if user_input == "0" and len(genres_input) > 0:
        break

    elif user_input in genres:
        genres_input.append(user_input)
        print("\nCurrent Genres", genres_input)

    else:
        print("\nGenre was not found in list. Please check spelling and try again.")

# Format the request
print("\nSending request with current parameters: \n   Number of Songs: ", num_songs, "\n   Genres", genres_input)
parameters = {
    'limit_songs': num_songs,
    'selected_genres': genres_input
}

# Send the request to port 5555 using zmq in a json format
socket.send_json(parameters)

# Receive message in a json format
# Array received with songs array at ind 0 and length at ind 1.
# Since the original code is in Node.js format, it sent it in a byte string, which we must decode as follows.
reply = socket.recv_json()
print(reply)

# Print Song objects
for i, song in enumerate(reply):
    print(f"Song Object # {i + 1}: {song}")

