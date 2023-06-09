export function wifuTalk(str) {
    let parentElement = document.getElementById("output");
    parentElement.innerHTML = "";
    let element = document.createElement("span");
    element.innerText = str;
    element.classList.add("fade-in-long");
    parentElement.appendChild(element);

    if ('speechSynthesis' in window) {
        let utterance = new SpeechSynthesisUtterance(str);
        speechSynthesis.speak(utterance);
    } else {
        console.log("Speech Synthesis is not Supported 😞 ")
    }
}

export function online(str) {
    document.getElementById('online').innerText = str;
}

export function showMsg(player, msg) {
    const element = document.createElement("div");
    element.id = "msg";
    element.innerHTML = `<b> ${player} : </b>${msg}`
    element.classList.add("fade-in");
    document.getElementById("msg-holder").appendChild(element);
}

export function hideOtherExcept(button) {
    let buttons = document.getElementsByClassName("game-btn");
    if (button == "rock") {
        buttons[1].style = "scale: 0;";
        buttons[2].style = "scale: 0;";
    }
    else if (button == "paper") {
        buttons[0].style = "scale: 0;";
        buttons[2].style = "scale: 0;";
    }
    else if (button == "scissors") {
        buttons[0].style = "scale: 0;";
        buttons[1].style = "scale: 0;";
    }
}

export function showButtons() {
    let buttons = document.getElementsByClassName("game-btn");
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].style = "scale: 1";
    }
}

export function speakMsg(msg) {
    if ('speechSynthesis' in window) {
        let voices = getVoices();
        let rate = 1, pitch = 1, volume = 1;
        let text = msg;
      
        speak(text, voices[100], rate, pitch, volume)
    } else {
        console.log("Speech Synthesis is not Supported 😞 ")
    }
}
function getVoices() {
    let voices = speechSynthesis.getVoices();
    if(!voices.length){
      // some time the voice will not be initialized so we can call spaek with empty string
      // this will initialize the voices 
      let utterance = new SpeechSynthesisUtterance("");
      speechSynthesis.speak(utterance);
      voices = speechSynthesis.getVoices();
    }
    console.log(voices)
    return voices;
  }
  
  
  function speak(text, voice, rate, pitch, volume) {
    // create a SpeechSynthesisUtterance to configure the how text to be spoken 
    let speakData = new SpeechSynthesisUtterance();
    speakData.volume = volume; // From 0 to 1
    speakData.rate = rate; // From 0.1 to 10
    speakData.pitch = pitch; // From 0 to 2
    speakData.text = text;
    speakData.lang = 'en';
    speakData.voice = voice;
    
    // pass the SpeechSynthesisUtterance to speechSynthesis.speak to start speaking 
    speechSynthesis.speak(speakData);
  
  }