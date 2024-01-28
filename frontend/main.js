const socket=io("http://localhost:3000/",{transports:["websocket"]})


let chats=document.querySelector(".chats");
let users_list=document.querySelector('.users-list');
let users_count=document.querySelector('.users-count');
let msg_send=document.querySelector("#user-send");
let user_msg=document.querySelector('#user-msg');

let username=localStorage.getItem('name');

//when user joined it will called.
socket.emit('new-user-joined',username);

//notified that user is joined
socket.on('user-connected',(socket_name)=>{
   userJoinLeft(socket_name,'joined');
})

//function to create joined/left status 

function userJoinLeft(name, status) {
    let div = document.createElement("div");
    div.classList.add("user-join");

    let content = `<p style="font-size: 0.9rem; color: $dark-grey;"> <b>${name}</b>${status} the chat</p>`;
    div.innerHTML = content;

    div.style.backgroundColor = "white";
    div.style.borderRadius = "50px";
    div.style.width = "max-content";
    div.style.padding = "7px 20px";
    div.style.margin = "0 auto";
    div.style.marginBottom = "15px";

    chats.appendChild(div);
    chats.scrollTop = chats.scrollHeight;
}



//called when user left
socket.on('user-disconnected',(user)=>{
 userJoinLeft(user,'Left')
});


//update user list and user count.
socket.on('user-list',(users)=>{
  users_list.innerHTML="";
  users_arr=Object.values(users);
  for(i=0;i<users_arr.length;i++){
    let pTag=document.createElement('p');
    pTag.innerText=users_arr[i];
    users_list.appendChild(pTag);
  }
  users_count.innerHTML=users_arr.length;
})

//for sending message
msg_send.addEventListener("click",()=>{
    let data={
        user:username,
        msg:user_msg.value
    };
    if(user_msg.value!=''){
        appnedMessage(data,'outgoing');
        socket.emit('message',data);
        user_msg.value='';
    }
});

function appnedMessage(data,status){
   let div=document.createElement('div')  ;
   div.classList.add('message',status);
   const timestamp = new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });

    let content = `
      <img class="img" src="${data.image}" alt="image">
      <div>
        <h5>${data.user}</h5>
        <p>${data.msg}</p>
        <div class="message-timestamp">${timestamp}</div>
      </div>
    `;
   div.innerHTML=content;
   chats.appendChild(div);

   chats.scrollTop = chats.scrollHeight;

}

// socket.on('message',(data)=>{
//     appnedMessage(data,'incoming');
// })
socket.on('message', (data) => {
    appnedMessage(data, 'incoming');
    chats.scrollTop = chats.scrollHeight;
});