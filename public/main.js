const socket = io.connect('http://195.201.86.124:3000');

// dom
const message = document.querySelector('#message'),
    handle = document.querySelector('#name'),
    btn = document.querySelector('#send'),
    output = document.querySelector('#output'),
    feedback = document.querySelector('#feedback'),
    clean = document.querySelector('#clean');
user1 = document.querySelector('#user1');
user2 = document.querySelector('#user2');
// event



// socket.emit('chat_list', {
//     user_id: 123
// });


socket.on('chat_list', data => {
    console.log(data,"======================")
    output.innerHTML += `<p>${data.toString()}</p>`;
});

socket.emit('chat', {
    sender_id: 123,
    recipient_id: 1234,
    message_body: 'Saurabh_prashant'
});
// socket.on('chat', data => {
//     console.log(data)
//     output.innerHTML += `<p><strong>${data.name}:</strong>${data.messages}</p>`;
// });
btn.addEventListener('click', () => {


    // if (message.value != '' && handle.value != '') {
    //     socket.emit('chat', {
    //         message: message.value,
    //         handle: handle.value,
    //         name: 'Saurabh_prashant'
    //     });
    // } else {
    //     alert('All fields are required!');
    // }
    // message.value = '';
});

message.addEventListener('keypress', () => {
    socket.emit('typing', handle.value);
});

// socket.on('chat', data => {
//     console.log(data)
//     output.innerHTML += `<p><strong>${data.name}:</strong>${data.messages}</p>`;
// });

let timer = setTimeout(makeNoTypingState, 1000);
socket.on('typing', data => {
    feedback.innerHTML = `<p><em>${data} is typing a message...</em></p>`;
    clearTimeout(timer);
    timer = setTimeout(makeNoTypingState, 1000);
});

function makeNoTypingState() {
    feedback.innerHTML = "";
}