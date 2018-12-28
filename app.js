var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var scrape = require('html-metadata');

// require('./libs/db-connection');

app.use('/public', express.static('public'));
app.set('view engine', 'ejs');

var Chat = require('./models/Chat');

var rooms = []

var mysql = require('mysql');
var pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'java@123',
    database: 'bumbag_staging_21'
});

// console.log(app)
app.get('/', (req, res) => {
    let data = { user1: "Saurabh", user2: "prashant" }
    let channel_name = data.user1 + "_" + data.user2;
    let users = { user_1: data.user1, user_2: data.user2 }
    let channel = rooms.filter(function (data) { return data.channel_name == channel_name })[0]
    let channel_data = { channel_name: channel_name, messages: [], users: users }
    if (!channel) {
        rooms.push(channel_data)
        res.render('index', { data: channel_data })
    } else {
        res.render('index', { data: channel })
    }
});

app.get('/nodescrap', (req, res) => {
    var url = req.query.url;
    scrape(url).then(function (metadata) {
        const desc = metadata.openGraph.description
        const title = metadata.openGraph.title
        const image = metadata.openGraph.image.url
        const data = {
            title,
            desc,
            image
        }
        res.json(data)
    });
})


io.on('connection', socket => {
    console.log('connected')
    socket.on('chat', data => {
        console.log(data)
        let sender_id = parseInt(data.sender_id)
        let recipient_id = parseInt(data.recipient_id)
        let identifier = data.identifier;
        if (!identifier) {
            if (sender_id < recipient_id) {
                identifier = `user_${sender_id}:user_${recipient_id}`
            } else {
                identifier = `user_${recipient_id}:user_${sender_id}`
            }
        }
        let message_data = { sender_id: sender_id, recipient_id: recipient_id, identifier: identifier, message_body: data.message_body, message_time: new Date(), unread: 1 }
        pool.getConnection(function (err, connection) {
            console.log(err)
            connection.query(`INSERT into message_chat SET ?`, message_data, function (err, data) {
                connection.query(`select DISTINCT sender_id, identifier from message_chat where recipient_id= ?`, [recipient_id], async function (err, data) {
                    connection.query(`SELECT A.logo,C.firstname, C.lastname FROM account_edit_customer_attribute as A INNER JOIN customer_entity as C ON A.customer_id = C.entity_id WHERE C.entity_id = ${sender_id}`, function (err, sender_data) {
                        message_data['sender_name'] = sender_data.length ? sender_data[0].firstname + " " + sender_data[0].lastname : "";
                        message_data['sender_img'] = sender_data.length ? sender_data[0].logo : 'default_profile_image.png';
                        connection.query(`SELECT A.logo,C.firstname, C.lastname FROM account_edit_customer_attribute as A INNER JOIN customer_entity as C ON A.customer_id = C.entity_id WHERE C.entity_id = ${recipient_id}`, function (err, recipient_data) {
                            message_data['recipient_name'] = recipient_data.length ? recipient_data[0].firstname + " " + recipient_data[0].lastname : "";
                            message_data['recipient_img'] = recipient_data.length ? recipient_data[0].logo : 'default_profile_image.png';
                            console.log(message_data)
                            io.sockets.emit('chat', message_data);
                        })
                        connection.release()
                    })
                })
                // socket.emit('chat_list', data)
            })
        })
    });

    socket.on('chat_list', data => {
        console.log(data, 'chat_listchat_listchat_listchat_list')
        let recipient_id = data.user_id;
        pool.getConnection(function (err, connection) {
            connection.query(`select DISTINCT sender_id, identifier from message_chat where recipient_id=? ORDER BY message_time DESC`, [recipient_id], function (err, data) {
                io.sockets.emit('chat_list', data)
            })
            connection.release();
        })
    })

    socket.on('unread', data => {
        console.log(data, "=====================")
        pool.getConnection(function (err, connection) {
            connection.query(`UPDATE message_chat SET unread=0 WHERE sender_id = ? AND identifier=?`, [parseInt(data.sender_id), data.identifier], function (err, response) {
                console.log(err, response, "00000000000000000000")
                io.sockets.emit('unread', false)
            })
            console.log(connection.query);
            connection.release()
        })
    })

    socket.on('typing', data => {
        socket.emit('typing', data); // return data
    });
});

// listen
http.listen(process.env.PORT || 3000, () => {
    console.log('Running', process.env.PORT || 3000);
});