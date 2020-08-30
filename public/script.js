const socket = io("/");
const myVideo = document.createElement("video");
const videoGrid = document.getElementById("video-grid");
myVideo.muted = true;

const peer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "443",
});

let myVideoStream;

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream);
    });

    const messageInput = $("input");

    $("html").keydown((e) => {
      if (e.which === 13 && messageInput.val().length !== 0) {
        socket.emit("message", messageInput.val());
        messageInput.val("");
      }
    });

    socket.on("create-message", (message) => {
      $(".messages").append(`<li class="message"><b>user</b><br/>${message}</li>`);
      scrollToBottom();
    });
  });

const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
};

const connectToNewUser = (userId, stream) => {
  const call = peer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
};

const scrollToBottom = () => {
  const chatWindow = $(".main__chat_window");
  chatWindow.scrollTop(chatWindow.prop("scrollHeight"));
};

const toggleMute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    myVideoStream.getAudioTracks()[0].enabled = true;
    setMuteButton();
  }
};

const setMuteButton = () => {
  const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
    `;
  document.querySelector(".main__mute_button").innerHTML = html;
};

const setUnmuteButton = () => {
  const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
    `;
  document.querySelector(".main__mute_button").innerHTML = html;
};

const toggleVideo = () => {
  const enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  } else {
    myVideoStream.getVideoTracks()[0].enabled = true;
    setStopVideo();
  }
};

const setPlayVideo = () => {
  const html = `
      <i class="stop fas fa-video-slash"></i>
      <span>Play Video</span>
      `;
  document.querySelector(".main__video_button").innerHTML = html;
};

const setStopVideo = () => {
  const html = `
      <i class="fas fa-video"></i>
      <span>Stop Video</span>
      `;
  document.querySelector(".main__video_button").innerHTML = html;
};

peer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id);
});
