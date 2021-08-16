const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
myVideo.muted = true;

var peer = new Peer(undefined, {
	path: '/peerjs',
	host: '/',
	port: 3030,
});

// get user camera and audio
let myVideoStream;
navigator.mediaDevices
	.getUserMedia({
		video: true,
		audio: true,
	})
	.then((stream) => {
		myVideoStream = stream;
		// myVideo is container in HTML
		// stream is received through the camera and mic
		// Step 2
		addVideoStream(myVideo, stream);

		peer.on('call', (call) => {
			console.log('peer on call');
			call.answer(stream);
			// If you are joining and you want to get other people video feed
			const video = document.createElement('video');
			call.on('stream', (userVideoStream) => {
				addVideoStream(video, userVideoStream);
			});
		});

		// Step 3 - when user starts to connect
		socket.on('user-connected', (userId) => {
			console.log('user connected');
			connectToNewUser(userId, stream);
		});

		let text = $('input');

		$('html').keydown((e) => {
			if (e.which == 13 && text.val().length !== 0) {
				socket.emit('message', text.val());
				text.val('');
			}
		});

		socket.on('createMessage', (message) => {
			$('ul').append(`<li class="message"><b>user</b><br/>${message}</li>`);
			scrollToBottom();
		});
	});

// Step 1
peer.on('open', (id) => {
	console.log('peer on open join room');
	socket.emit('join-room', ROOM_ID, id);
});

// Step 4
const connectToNewUser = (userId, stream) => {
	console.log('connectToNewUser');
	const call = peer.call(userId, stream);
	// adds the new users video feed to our own video feed
	const video = document.createElement('video');
	call.on('stream', (userVideoStream) => {
		addVideoStream(video, userVideoStream);
	});
};

const addVideoStream = (video, stream) => {
	console.log('addVideoStream');
	video.srcObject = stream;
	// when we load all the data, play the video
	video.addEventListener('loadedmetadata', () => {
		video.play();
	});
	videoGrid.append(video);
};

const scrollToBottom = () => {
	let d = $('.main__chat_window');
	d.scrollTop(d.prop('scrollHeight'));
};

const muteUnmute = () => {
	const enabled = myVideoStream.getAudioTracks()[0].enabled;
	if (enabled) {
		myVideoStream.getAudioTracks()[0].enabled = false;
		setUnmuteButton();
	} else {
		setMuteButton();
		myVideoStream.getAudioTracks()[0].enabled = true;
	}
};

const playStop = () => {
	console.log('object');
	let enabled = myVideoStream.getVideoTracks()[0].enabled;
	if (enabled) {
		setPlayVideo();
		myVideoStream.getVideoTracks()[0].enabled = false;
	} else {
		setStopVideo();
		myVideoStream.getVideoTracks()[0].enabled = true;
	}
};

const setMuteButton = () => {
	const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `;
	document.querySelector('.main__mute_button').innerHTML = html;
};

const setUnmuteButton = () => {
	const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `;
	document.querySelector('.main__mute_button').innerHTML = html;
};

const setStopVideo = () => {
	const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
  `;
	document.querySelector('.main__video_button').innerHTML = html;
};

const setPlayVideo = () => {
	const html = `
  <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
  `;
	document.querySelector('.main__video_button').innerHTML = html;
};
