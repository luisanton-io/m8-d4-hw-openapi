import express from "express"
import path from "path"
import * as OpenApiValidator from "express-openapi-validator"
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express()
const apiSpec = path.join(__dirname, 'api.yaml');

app.use('/spec', express.static(apiSpec));
app.use(express.json());

let rooms = [
    {
        n: 3,
        guests: [
            {
                fullName: 'John Doe',
                email: 'john@doe.com',
                age: 30
            }
        ]
    }
]

app.use((_req, _res, next) => {
    console.log(rooms)
    next()
})

app.use(
    OpenApiValidator.default.middleware({
        apiSpec,
        validateRequests: true, // (default)
        validateResponses: true, // false by default
    })
);

app.get('/rooms', (req, res) => {
    res.status(200).send(rooms.map(r => r.n))
})

app.get('/rooms/:roomN', (req, res) => {
    try {
        const room = rooms.find(r => r.n === req.params.roomN)

        if (!room) throw new Error("Room not found: " + req.params.room)

        res.status(200).send(room.guests)
    } catch (error) {
        res.status(400).send({ message: "The room doesnt exist" })
    }
})

app.post('/rooms/:roomN', (req, res) => {
    try {
        const roomN = parseInt(req.params.roomN)

        rooms[roomN] = req.body
        res.status(201).send()

    } catch (error) {
        res.status(400).send()
    }
})

app.delete('/rooms/:roomN', (req, res) => {
    try {
        rooms = rooms.filter(r => r.n === req.params.roomN)
        res.status(201).send()
    } catch (error) {
        res.status(400).send()
    }
})



app.use((err, req, res, next) => {
    // format error
    res.status(err.status || 500).json({
        message: err.message,
        errors: err.errors,
    });
});

app.listen(3030, () => {
    console.log("Server listening on port 3030")
})