// подключение express
const express = require("express");

const bodyParser = require("body-parser");

const fs = require('fs');

// создаем объект приложения
const app = express();

app.set('view engine', 'ejs');

// создаем парсер для данных application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

const WebSocketServer = require("ws");

// WebSocket-сервер на порту 8081
const webSocketServer = new WebSocketServer.Server({
    port: 8080
});
// определяем обработчик для маршрута "/"
app.get("/", function(request, response){
    let rows = fs.readFileSync("database.txt", 'utf-8').split('\n');
    response.render("index", {
        outputs: rows
    });

});
app.post("/a",function (request, response) {
    let dict = {};
    let output;
    let arrayOfLetters = request.body.NSP;
    let arrayOfNumbers = request.body.birthdate.split("");
    output = "";
    for(let i = 0; i < arrayOfLetters.length; i++) {
        arrayOfNumbers[i] = parseInt(arrayOfNumbers[i], 10);
        output += arrayOfLetters[i].repeat(arrayOfNumbers[i]);
        if (arrayOfLetters[i] in dict)
            dict[arrayOfLetters[i]] += arrayOfNumbers[i];
        else
            dict[arrayOfLetters[i]] = arrayOfNumbers[i];
    }
    let ent = 0;
    for(let key in dict) {
        dict[key] /= output.length;
        ent += dict[key] * Math.log(dict[key]);
    }
    let writeableStream = fs.createWriteStream("database.txt", {flags: 'a'});
    writeableStream.write('Output: ' + output + "\n");
    writeableStream.write('Entropy: ' + (-ent).toString()+ "\n");
    writeableStream.end();
    webSocketServer.clients.forEach((client) => {
        if (client.readyState === WebSocketServer.OPEN) {
            client.send(JSON.stringify({
                "output": output,
                "entropy": (-ent).toString()
            }));
        }
    });
});
// начинаем прослушивать подключения на 3000 порту
app.listen(3000);