import * as Realm from "realm-web";
const app = new Realm.App({ id: "statcord-leaderboard-nqzqn" });
const credentials = Realm.Credentials.anonymous();

addEventListener("fetch", event => {
    event.respondWith(handleRequest(event))
})

async function handleRequest(event) {
    let req = await event.request.json();
    const user = await app.logIn(credentials);
    const mongo = user.mongoClient("mongodb-atlas");
    const collection = mongo.db("Guilds").collection(req.serverId);

    var jsonResponse = [];
    var jsonElement;
    var data;
    if (req.serverId.length != 19) {
        return new Response("Invalid Guild ID: " + req.serverId, {
            status: 400,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET,HEAD,POST,OPTIONS'
            }
        });
    }
    if (req.userId != null) {
        if (req.userId.length > 18 || req.userId.length < 17) {
            return new Response("Invalid User ID: " + req.userId, {
                status: 400,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET,HEAD,POST,OPTIONS'
                }
            });
        }
        if (await collection.findOne({ "id": req.userId }) != null) {
            data = [
                await collection.findOne({ "id": req.userId })
            ];
        } else {
            data = [];
        }
    } else {
        data = await collection.find();
    }
    for (const element of data) {
        var discordData = await getDiscordData(element.id);
        var discordDataJson = await discordData.json();
        jsonElement = {
            "id": element.id,
            "name": discordDataJson.username + "#" + discordDataJson.discriminator,
            "pfp": "https://cdn.discordapp.com/avatars/" + element.id + "/" + discordDataJson.avatar,
            "score": element.score
        };
        jsonResponse.push(jsonElement);
    };
    return new Response(JSON.stringify(jsonResponse), {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,HEAD,POST,OPTIONS'
        }
    });
}

async function getDiscordData(id) {
    return await fetch('https://discord.com/api/users/' + id, {
        method: 'GET',
        headers: {
            "Authorization": DISCORD_AUTH,
        }
    });
}