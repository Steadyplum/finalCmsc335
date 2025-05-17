const express = require('express');
const path = require('path');
require("dotenv").config({
    path: path.resolve(__dirname, ".env"),
});
const { MongoClient, ServerApiVersion } = require("mongodb");
const fs = require('fs');
const bodyParser = require("body-parser");
const app = express();
const taskRouter = require('./routes/tasks');
const uri = process.env.MONGO_CONNECTION_STRING;
const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });
let collection;

async function initialConnect() {
    try {
        await client.connect();
        const db = client.db("tasks");
        collection = db.collection("apps");
        app.locals.collection = collection;
    } catch (e) {
        console.error(e);
    }
}

app.use('/', taskRouter);
app.use(express.static(__dirname + '/templates'));

app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'templates'));

app.listen(3000, () => {
    console.log(`Web server started and running at http://localhost:3000/`);
    initialConnect().catch(console.error);
    setTimeout(() => {
        console.log(prompt);
    }, 100);
});
const prompt = "Type stop to shutdown the server: ";
process.stdin.setEncoding("utf8");
process.stdin.on("readable", () => {
    const dataInput = process.stdin.read();
    if (dataInput !== null) {
        const command = dataInput.toString().trim();
        if (command === "stop") {
            process.stdout.write("Shutting down the server\n");
            client.close(); 
            process.exit(0);
        } else {
            process.stdout.write(`Invalid command: ${command}\n`);
        }
        process.stdout.write(prompt);
        process.stdin.resume();
    }
});

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/edit", (req, res) => {
    res.render("edit");
});

app.post("/edit", async (req, res) => {
    const { task, description, days, time } = req.body;
    const newTask = { task, description, days, time };
    try {
        await collection.insertOne(newTask);
        res.redirect("/weekly");
    } catch (e) {
        console.error(e);
    }
});

app.post("/delete", async (req, res) => {
    const { taskName } = req.body;
    try {
        await collection.deleteOne({ task: taskName });
        res.redirect("/weekly");
    } catch (e) {
        console.error(e);
    }
});

app.post("/clear", async (req, res) => {
    try {
        await collection.deleteMany({});
        res.redirect("/weekly");
    } catch (e) {
        console.error(e);
    }
}
);
