const session_id = "demo123"

function sendEvent(type){

fetch("http://127.0.0.1:8000/events",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
session_id:session_id,
event_type:type,
severity:"MEDIUM"
})
})

}

/////////////////////////////////////////////////
// TAB SWITCH DETECTION
/////////////////////////////////////////////////

document.addEventListener("visibilitychange",()=>{

if(document.hidden){
sendEvent("TAB_SWITCH")
}

})

/////////////////////////////////////////////////
// COPY DETECTION
/////////////////////////////////////////////////

document.addEventListener("copy",()=>{

sendEvent("COPY")

})

/////////////////////////////////////////////////
// PASTE DETECTION
/////////////////////////////////////////////////

document.addEventListener("paste",()=>{

sendEvent("PASTE")

})

/////////////////////////////////////////////////
// DEVTOOLS DETECTION
/////////////////////////////////////////////////

let devtoolsOpen = false

setInterval(()=>{

const threshold = 160
const detected = window.outerWidth - window.innerWidth > threshold

if(detected && !devtoolsOpen){

sendEvent("DEVTOOLS_OPEN")
devtoolsOpen = true

}

if(!detected){

devtoolsOpen = false

}

},2000)
/////////////////////////////////////////////////
// AUTOMATION DETECTION
/////////////////////////////////////////////////

if(navigator.webdriver){

sendEvent("AUTOMATION_DETECTED")

}