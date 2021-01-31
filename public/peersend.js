var peer = new Peer();

window.addEventListener("load", (event) => {
    let display = document.getElementById("disp");
    let remote = document.getElementById("remote");
    var peer = new Peer();

    peer.on("open", function (id) {
        document.getElementById("id-holder").innerHTML = id;
    });

    document.getElementById("clicker").addEventListener("click", (e) => {
        let remotePeerId = document.getElementById("id").value;
        document.getElementById("id-holder").innerHTML = "Connecting";
        callPeer(remotePeerId);
    });

    peer.on("connection", (conn) => {
        conn.on("data", (data) => {
            // Will print 'hi!'
            console.log(conn.open);
            remote.innerHTML = data.toString();
        });
    });

    function callPeer(id) {
        const conn = peer.connect(id);
        conn.on("open", () => {
            let video = document.getElementById("vid"); // video is the id of video tag
            navigator.mediaDevices
                .getUserMedia({ video: true, audio: false })
                .then(function (stream) {
                    video.srcObject = stream;
                    video.play();
                })
                .catch(function (err) {
                    console.log("An error occurred! " + err);
                });

            let height = 480;
            let width = 640;
            let src = new cv.Mat(height, width, cv.CV_8UC4);
            let cap = new cv.VideoCapture(video);
            const FPS = 30;
            function processVideo() {
                let begin = Date.now();
                cap.read(src);
                let frame = resizeImg(src, 50);
                frame = grayify(frame);
                let characters = asciify(frame);
                conn.send(characters);

                // schedule next one.'
                //let delay = 1000 / FPS - (Date.now() - begin);
                //setTimeout(processVideo, 2000);
                //processVideo()
            }
            setInterval(() => {
                processVideo();
            }, 15);
            const chars = [
                ".",
                ",",
                ":",
                ";",
                "+",
                "*",
                "?",
                "%",
                "S",
                "#",
                "@",
            ];

            function resizeImg(img, newWidth) {
                let newMat = new cv.Mat();
                var width = img["cols"];
                var height = img["rows"];
                let ratio = height / width;
                let newHeight = Math.floor(newWidth * ratio * 0.75);

                cv.resize(img, newMat, new cv.Size(newWidth, newHeight));
                return newMat;
            }

            function grayify(img) {
                let newMat = new cv.Mat();
                cv.cvtColor(img, newMat, cv.COLOR_RGBA2GRAY);
                return newMat;
            }

            function asciify(img) {
                let data = img.data;
                let characters = "";
                var characterLine = "";
                for (var rows = 0; rows < img.rows; rows++) {
                    for (var cols = 0; cols < img.cols; cols++) {
                        let pixel = data[rows * img.cols + cols];
                        let newChar = chars[Math.floor(pixel / 25)];
                        characterLine += newChar;
                    }

                    //console.log(characters)
                    characterLine += "\n";
                    characters += characterLine;
                    characterLine = "";
                }
                display.innerHTML = characters;
                return characters;
            }
        });
    }
});