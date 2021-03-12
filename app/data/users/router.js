// Node constants
const express = require('express')
const mysql = require("mysql");

// App Constants
const db = require('../../config/database.js')
const stmts = require('./statements.js')
const router = express.Router()

// Data Constants
const mock = require('../../mock.js') // TODO: Remove this once all callbacks use database callbacks
const connection = mysql.createConnection(db.config)

router.route('')
    .get((req, res) => {
        const name = req.query.name
        const query = (name === undefined) ? stmts.getUsers : stmts.getUsersFiltered
        connection.connect((conErr) => {
            if (conErr) throw conErr
            connection.query(query, (name === undefined) ? undefined : name, (err, rows) => {
                if(err) throw err
                res.json(rows.map(user => {
                    delete user.password
                    delete user.wallet
                    return user
                }))
                connection.end()
                console.log("200".yellow, "GET /users".bold, ": ", "OK".bold.green)
            })
        })


    })
    .put(((req, res) => {
        if ("username" in req.body && "password" in req.body) {
            console.log("201".yellow, "PUT /users".bold, ": ", "OK".bold.green)
            return res.json({id: 1, name: req.body.username})
        } else {
            console.log("400".red, `PUT /users`.bold, ": ", "Malformed request");
            return res.status(400).send("The request body is incorrect");
        }
    }))

router.route('/:ouid')
    .get((req, res) => {
        const ouid = parseInt(req.params.ouid)
        const query = mock.users.filter(user => user.userId === ouid)
        switch (query.length) {
            case 1:
                console.log("200".green, `GET /users/${ouid}`.bold, ": ", "OK".bold.green)
                return res.json(query)
            case 0:
                console.log("404".red, `GET /users/${ouid}`.bold, ": ", "User was not found");
                return res.status(404).send(`The user with ID ${ouid} does not exist.`);
            default:
                console.log("500".bold.red, `GET /users/${ouid}`.bold, ": ", "Internal Server Error".bold.bgRed.white, "Server return non-compliant data: Data Integrity may be at risk!".bgRed.white)
                return res.status(500).send("Internal Server Error")
        }
    })
    //TODO: Mock doesn't have any authorization checks. Don't forget to implement this in DB Callback
    .patch((req, res) => {
        const ouid = parseInt(req.params.ouid)
        const user = mock.users.filter(user => user.userId === ouid)
        if (("username" in req.body || "newPassword" in req.body) && "password" in req.body) {
            switch (user.length) {
                case 1:
                    console.log("200".green, `GET /users/${ouid}`.bold, ": ", "OK".bold.green)
                    return res.json(user)
                case 0:
                    console.log("404".red, `GET /users/${ouid}`.bold, ": ", "User was not found");
                    return res.status(404).send(`The user with ID ${ouid} does not exist.`);
                default:
                    console.log("500".bold.red, `GET /users/${ouid}`.bold, ": ", "Internal Server Error".bold.bgRed.white, "Server return non-compliant data: Data Integrity may be at risk!".bgRed.white)
                    return res.status(500).send("Internal Server Error")
            }
        } else {
            console.log("400".red, `PUT /users`.bold, ": ", "Malformed request");
            return res.status(400).send("The request body is incorrect");
        }
    })

module.exports = router