const socket = io.connect(location.href);

// dom
const message = document.querySelector('#message'),
    handle = document.querySelector('#name'),
    btn = document.querySelector('#send'),
    outputList = document.querySelector('#outputList'),
    output = document.querySelector('#output')
feedback = document.querySelector('#feedback'),
    clean = document.querySelector('#clean');
sender = document.querySelector('#sender');
user2 = document.querySelector('#user2');

btn.addEventListener('click', () => {
    if (message.value != '' && handle.value != '') {
        socket.emit('chat', {
            sender_id: sender.value,
            recipient_id: handle.value,
            message_body: message.value
        });
    } else {
        alert('All fields are required!');
    }
    message.value = '';
});

message.addEventListener('keypress', () => {
    socket.emit('typing', handle.value);
});

socket.on('chat', data => {
    console.log(data, 'chatchatchatchatchatchat')
    output.innerHTML += `<p><strong>${data.sender_id}:</strong>${data.message_body}</p>`;
});

// let timer = setTimeout(makeNoTypingState, 1000);
// socket.on('typing', data => {
//     feedback.innerHTML = `<p><em>${data} is typing a message...</em></p>`;
//     clearTimeout(timer);
//     timer = setTimeout(makeNoTypingState, 1000);
// });

// function makeNoTypingState() {
//     feedback.innerHTML = "";
// }