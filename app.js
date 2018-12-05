var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var rooms = []

var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123',
    database: 'usersDb'
});


io.on('connection', socket => {
    socket.on('chat', data => {
        let sender_id = data.sender_id
        let recipient_id = data.recipient_id
        let identifier = data.identifier;
        if (!identifier) {
            if (sender_id < recipient_id) {
                identifier = `user_${sender_id}:user_${recipient_id}`
            } else {
                identifier = `user_${recipient_id}:user_${sender_id}`
            }
        }
        let message_data = { sender_id: sender_id, recipient_id: recipient_id, identifier: identifier, message_body: data.message_body, message_time: new Date() }
        connection.connect();
        let query = connection.query(`INSERT into message_chat SET ?`, message_data, function(err, data) {
            connection.query(`select DISTINCT sender_id, identifier from message_chat where recipient_id= ?`, [recipient_id], function(err, data) {
                socket.emit('chat_list', data)
                socket.emit('chat', message_data);
            })
            connection.end();
            // socket.emit('chat_list', data)
        })
        console.log(query.sql)
    });

    socket.on('chat_list', data => {
        console.log(data)
        let recipient_id = data.user_id;
        connection.connect();
        connection.query(`select DISTINCT sender_id, identifier from message_chat where recipient_id=? ORDER BY message_time DESC`, [recipient_id], function(err, data) {
            socket.emit('chat_list', data)
        })
        connection.end();
    })

    socket.on('typing', data => {
        socket.broadcast.emit('typing', data); // return data
    });
});

// listen
http.listen(process.env.PORT || 3000, () => {
    console.log('Running', process.env.PORT || 3000);
});