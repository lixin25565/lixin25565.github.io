// ***************** 全局变量 ******************************

// 本地视频流
let stream = null;
// 本地Video使用的流
let localStream = null;

// 点对点连接对象PeerConnection
let connection = null;

// 房间号
let roomID = '';

// socket对象
let socket = null;

// ***************** 获取页面元素 ******************************
// 获取显示本地端视频 video
const localVideo = document.getElementById('local-video')
// 获取显示对端视频 video
const remoteVideo = document.getElementById('remote-video')
// 获取拨通按钮
const callBtn = document.getElementById('call-btn')
// 获取挂断按钮
const hangupBtn = document.getElementById('hangup-btn')
// 获取分享桌面复选框
const displayBox = document.getElementById('display')
// 获取roomID文本框
const room = document.getElementById('room-id')
// 获取拨通容器
const callContainer = document.getElementById('call-container')

// 获取静音
const micBtn = document.getElementById('mic-btn')

// 获取关闭摄像头
const cameraBtn = document.getElementById('camera-btn')

// 获取挂断容器
const hangupContainer = document.getElementById('hangup-container')

// 通话背景
let bg = document.getElementsByClassName('center')[0]


// *********************** 事件处理 *************************

// 拨通按钮 点击事件
callBtn.onclick = function () {

    let args = {
        video: {
            width: 551,
            height: 445,
        },
        // display: true,
        audio: true
    }

    let devices = navigator.mediaDevices

    devices.getMediaTracks(args)
        .then(function (tracks) {

            bg.setAttribute('class', 'center');

            stream = devices.mixTracks({ video: tracks.video, audio: tracks.audio })
            localVideo.srcObject = stream
            socket_conn()

        }).catch(function (error) {

            alert("请设置开放权限！")
            callContainer.hidden = false
            hangupContainer.hidden = true

        })

    callContainer.hidden = true
    hangupContainer.hidden = false
}

hangupBtn.onclick = function () {
    socket.emit('离开', roomID)

    socket.disconnect()
    connection.close()
    clear()
}

function socket_conn() {
    roomID = room.value
    socket = io.connect('https://ybc-case-test.zhenguanyu.com/')
    socket.emit('加入', roomID)

    socket.on('已加入', function () {
        console.log('已加入')

        // 创建连接对象
        connection = new YBCPeerConnection()

        // 绑定传输的流
        connection.sendStream(stream)

        connection.receiveStream(function (stream) {
            remoteVideo.srcObject = stream
        })

    })

    socket.on('对方加入', function () {
        console.log('对方加入')

        // 获取offer
        connection.getOffer(function (offer) {
            socket.emit('提议', roomID, offer)
        })

    })
    socket.on('双方就绪', function () {
        console.log('双方就绪')
        // 获取地址
        connection.getAddress(function (address) {
            socket.emit('地址', roomID, address)
        })

    })

    socket.on('地址', function (data) {
        // 保存地址
        connection.saveAddress(data)
    })

    socket.on('提议', function (data) {
        // 保存offer
        connection.saveOffer(data)
        // 获取answer
        connection.getAnswer(function (answer) {
            socket.emit('回应', roomID, answer)
        })

    })
    socket.on('回应', function (data) {
        // 保存answer
        connection.saveAnswer(data)
    })

    socket.on('房间已满', function () {
        console.log('房间已满')
        socket.disconnect()
        clear()
        alert('房间人满了')
    })

    socket.on('已离开', function () {
        console.log('已离开')

    })

    socket.on('对方离开', function () {
        console.log('对方离开')
        remoteVideo.srcObject = null
    })


}

// ****************** 封装函数 *********************

/**
 *  功能名：clear 
 *  功能：停止本地流， 改变UI显示。
 */
function clear() {
    let tracks = stream.getTracks()
    for (let i = 0; i < tracks.length; i++) {
        tracks[i].stop()
    }

    // UI改变为挂断状态
    callContainer.hidden = false
    hangupContainer.hidden = true
    room.value = ''

    micBtn.src = 'static/images/turnOnMicrophone.png'
    cameraBtn.src = "static/images/turnOnCamera.png"
    bg.setAttribute('class', 'center mute');

}

// ************************ 测试 代码******************************
let audio_flag = false
micBtn.onclick = function () {

    // stream.getAudioTracks()[0].enabled = audio_flag
    // audio_flag = !audio_flag

    let tracks = stream.getAudioTracks()

    for (let i = 0; i < tracks.length; i++) {

        if (tracks[i].enabled == true) {
            tracks[i].enabled = false
        } else {
            tracks[i].enabled = true
        }

    }


    if (stream.getAudioTracks()[0].enabled) {
        micBtn.src = 'static/images/turnOnMicrophone.png'
        bg.setAttribute('class', 'center');
    } else {
        micBtn.src = 'static/images/turnOffMicrophone.png'
        bg.setAttribute('class', 'center mute');
    }

}


let video_flag = false
cameraBtn.onclick = function () {

    // stream.getVideoTracks()[0].enabled = video_flag
    // video_flag = !video_flag

    let tracks = stream.getVideoTracks()

    for (let i = 0; i < tracks.length; i++) {
        console.log(123)
        if (tracks[i].enabled == true) {
            console.log(123)
            tracks[i].enabled = false
        } else {
            console.log(321)
            tracks[i].enabled = true
        }

    }

    if (stream.getVideoTracks()[0].enabled) {
        cameraBtn.src = "static/images/turnOnCamera.png"
    } else {
        cameraBtn.src = "static/images/turnOffCamera.png"
    }

}