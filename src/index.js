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
    const data = await collection.find();
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
            'Access-Control-Allow-Methods': 'GET,HEAD,POST,OPTIONS',
            'Access-Control-Max-Age': '86400',
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