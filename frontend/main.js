const socket=io("https://chatapp-lbmi.onrender.com",{transports:["websocket"]})


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

document.getElementById("user-msg").addEventListener("keydown", function(event) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault(); // Prevents a newline character from being inserted
    document.getElementById("user-send").click(); // Trigger the click event on the send button
  }
});


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
        <div>
        <h5>${data.user}</h5>
        <p>${data.msg}</p>  </div>
         <div class="message-timestamp">${timestamp}</div>
     
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




const logout = async () => {
  try {
    // Display loading state or spinner here if needed

    const response = await fetch('https://chatapp-lbmi.onrender.com/user/logout', {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    // Clear loading state or spinner here

    if (response.ok) {
      // Handle successful logout
      console.log("Logout successful");
      window.location.href = 'index.html';
    } else {
      // Handle error response
      const data = await response.json();
      console.error("Logout failed:", data.err);

      // Display a user-friendly error message on the UI
      // Example: alert("Logout failed. Please try again.");
    }
  } catch (error) {
    console.error("Error during logout:", error);

    // Display a user-friendly error message on the UI
    // Example: alert("An unexpected error occurred. Please try again.");
  }
};

// Example button click event
document.getElementById("logout-btn").addEventListener("click", logout);
