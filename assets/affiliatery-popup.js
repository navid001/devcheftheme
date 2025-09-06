let settings = {
  isEnabled: false
}

if (settings.isEnabled) {
  let htmlString = ``
  let modalObj =`${htmlString}`
  let styles = `/* The Modal (background) */
.af-modal {
  overflow: hidden;
  /*display: none; !* Hidden by default *!*/
  position: fixed; /* Stay in place */
  z-index: 100; /* Sit on top */
  left: 0;
  top: 0;
  width: 100%; /* Full width */
  height: 100%; /* Full height */
  /*overflow: auto; !* Enable scroll if needed *!*/
  background-color: rgb(0,0,0); /* Fallback color */
  background-color: rgba(0,0,0,0.4); /* Black w/ opacity */
}

/* Modal Content/Box */
.af-modal-content {
  /*background-color: #fefefe;*/
  margin: 10% auto; /* 15% from the top and centered */
  /*padding: 20px;*/
  /*border: 1px solid #888;*/
  width: max-content; /* Could be more or less, depending on screen size */
  position: relative;
}

/* The Close Button */
.close {
  color: #aaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
  position: absolute;
  right: 7px;
  top: 3px;
  z-index: 4;
}

.close:hover,
.close:focus {
  color: black;
  text-decoration: none;
  cursor: pointer;
}

body {
  background-color: transparent;
}
`
  modalObj= modalObj +`<style>${styles}</style>`
  let modalCss=`.affiliatery-modal {
  position: fixed;
  height: 100%;
  width: 100%;
  top: 0;
  left: 0;
  z-index: 999999999;
  overflow: hidden;
  visibility: visible;
}`
  let modalSheet = document.createElement("style")
  modalSheet.type = "text/css"
  modalSheet.innerText = modalCss
  document.head.appendChild(modalSheet)

  let iframe = document.createElement('iframe');
  iframe.style.visibility = "visible";
  iframe.style.opacity = "1";
  iframe.style.zIndex = "99999";
  iframe.style.border = "none";
  iframe.className = "affiliatery-modal"
  iframe.srcdoc = modalObj
  document.body.appendChild(iframe);
  window.closeAffModal=()=>{
    console.log("Close PopUp");
    iframe.style.visibility = "hidden";
    iframe.style.opacity = "0";
    iframe.style.zIndex = "-1";
  }
}
