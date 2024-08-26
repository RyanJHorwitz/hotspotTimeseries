import React, { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowUp, faArrowDown, faCaretRight, faCircleInfo, faTimesCircle, faRepeat } from '@fortawesome/free-solid-svg-icons' 
import "./App.css";

function App() {
  
  // Initialize App Mode States
  const [species, setSpecies] = useState("")
  const [savannah, setSavannah] = useState("")
  const [forest, setForest] = useState("")

  // Initialize Function States
  const savannahFrames = 44
  const forestFrames = 19
  const [frames, setFrames] = useState(savannahFrames)

  const [count, setCount] = useState(0)

  const [carHeight, setCarHeight] = useState(0)
  
  const [spSwitch, setSpSwitch] = useState("savannah")
  
  const [popupOpen, setpopupOpen] = useState(false)

  // Set Dictionaries
  const [uiDict, setUiDict] = useState({})
  const [popupDict, setPopupdict] = useState({})

  useEffect(() => {
    setUiDict({
      app: document.getElementsByClassName("App")[0],
      welcome: document.getElementById("welcome"),
      timeline: document.getElementById("timelineContainer"),
      upOuter: document.getElementById("scrubUpOuter"),
      upInner: document.getElementById("scrubUpInner"),
      upIcon: document.getElementById("scrubArrowUp"),
      downOuter: document.getElementById("scrubDownOuter"),
      downInner: document.getElementById("scrubDownInner"),
      downIcon: document.getElementById("scrubArrowDown"),
      speciesButton: document.getElementById("speciesButton"),
    })

    setPopupdict({
      infoButton: document.getElementById("info"),
      fullBox: document.getElementById("popup"),
      innerBox: document.getElementById("popupInner"),
      close: document.getElementById("close"),
      summary: document.getElementById("summaryContainer"),
      controls: document.getElementById("controlsContainer"),
      interpretation: document.getElementById("interpretationContainer"),
      methods: document.getElementById("methodsContainer"),
      textBox: document.getElementById("textContainer"),
    })

  }, [])

  // Set initial focus
  useEffect(() => {

    if (uiDict.welcome) {
      uiDict.welcome.focus()
    }

  }, [uiDict])

  
  // Fetch Images
  const fetchJSON = async (jsonUrl) => {
    const res = await fetch(jsonUrl);
    const resjson = await res.json()
    return (resjson);
  }

  useEffect(() => {

    fetchJSON("http://localhost:8000/data/savannah.json")
      .then((data) => setSpecies(data));

    fetchJSON("http://localhost:8000/data/forest.json")
      .then((data) => setForest(data));

  }, [])

  // JSON to array of JSON
  let arr = []
  if (typeof(species) === "object") {
    Object.keys(species).forEach(function(key) {
      arr.push(species[key]);
    });
  };

  // Set up timeline
  let yearArr = []
  arr.forEach(function(key) {
    yearArr.push(key.year)
  })
  let minTimeline = Math.min(...yearArr)
  let maxTimeline = Math.max(...yearArr)

  let nYears = maxTimeline - minTimeline + 1
  let yearBlocks = []
  if (isFinite(minTimeline)) {
    let uniqueYears = Array(nYears).fill().map((element, index) => index + minTimeline)
    uniqueYears.forEach(function(key) {
      if (key % 2 === 0) {
        yearBlocks.push(<div aria-hidden="true" key={`${key}`} className={`timelineYears even`}><span>{uniqueYears[key - minTimeline]}</span></div>)
      } else {
        yearBlocks.push(<div aria-hidden="true" key={`${key}`} className={`timelineYears odd`}><span>{uniqueYears[key - minTimeline]}</span></div>)
      }
    })
  }

  // Calculate progress bar height
  let monthBlocks = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  let yearOne = 0
  let monthOne = 0
  let barHeight = []
  if (isFinite(minTimeline)) {
    let timelineHeight = uiDict.timeline.clientHeight
    yearOne = timelineHeight / nYears
    monthOne = yearOne / 12
    
    arr.forEach(function(key) {
      barHeight.push(((key.year - minTimeline) * yearOne) + (monthBlocks.findIndex(x => x === key.month) * monthOne))
    })
  }

  useEffect(() => {

    const resizeWindow = () => {
      
      setCarHeight(6)

    }

    window.addEventListener("resize", resizeWindow)
    return () => {
      window.addEventListener("resize", resizeWindow)
    }
      
  }, [setCarHeight])

  // FUNCTIONS
  // Handle Switch to Forest Dataset
  const handleForest = () => {

    console.log(document.getElementById("im"))

    if (spSwitch === "savannah") {
      setSavannah(species)
      setSpecies(forest)
      setSpSwitch("forest")
      setCount(0)
      setFrames(forestFrames)
      uiDict.app.classList.add("theme-forest")
      uiDict.app.classList.remove("theme-savannah")
    } else {
      setForest(species)
      setSpecies(savannah)
      setSpSwitch("savannah")
      setCount(0)
      setFrames(savannahFrames)
      uiDict.app.classList.add("theme-savannah")
      uiDict.app.classList.remove("theme-forest")
    }
  }

  // Handle slide change and direction
  const handleSlide = (e) => {
    if (e.target.id === "scrubUpInner" || e.target.id === "scrubUpOuter" || e.target.id === "scrubArrowUp") {
      setCount((val) => val <= 0 ? val : val - 1);
      uiDict.upOuter.blur()
    }
    if (e.target.id === "scrubDownInner" || e.target.id === "scrubDownOuter" || e.target.id === "scrubArrowDown") {
      setCount((val) => val >= (frames - 1) ? val : val + 1);
      uiDict.downOuter.blur()
    }
  }

  // Set up info popup
  const handleOpenPopup = () => {
    popupDict.infoButton.classList.add("infoClicked")
    popupDict.infoButton.classList.remove("infoDefault")
    popupDict.fullBox.classList.add("popupOpened")
    popupDict.fullBox.classList.remove("popupClosed")
    popupDict.innerBox.classList.add("innerOpened")
    popupDict.innerBox.classList.remove("innerClosed")
    popupDict.close.classList.add("closeOpened")
    popupDict.close.classList.remove("closeClosed")
    setpopupOpen(true)
    popupDict.textBox.tabIndex = "1"
    popupDict.textBox.focus()
  }

  const handleClosePopup = () => {
    popupDict.infoButton.classList.add("infoDefault")
    popupDict.infoButton.classList.remove("infoClicked")
    popupDict.fullBox.classList.add("popupClosed")
    popupDict.fullBox.classList.remove("popupOpened")
    popupDict.innerBox.classList.add("innerClosed")
    popupDict.innerBox.classList.remove("innerOpened")
    popupDict.close.classList.add("closeClosed")
    popupDict.close.classList.remove("closeOpened")
    popupDict.close.classList.remove("tabClose")
    popupDict.summary.classList.remove("tabInfoBox")
    popupDict.controls.classList.remove("tabInfoBox")
    popupDict.interpretation.classList.remove("tabInfoBox")
    popupDict.methods.classList.remove("tabInfoBox")
    popupDict.textBox.scrollTo(0, 0)
    setpopupOpen(false)
    popupDict.textBox.blur()
    popupDict.textBox.tabIndex = "-1"
  }
  
  // Callback Functions
  const callbackForest = useCallback(handleForest, [setSavannah, species, setSpecies, forest, setSpSwitch, setCount, setFrames, spSwitch, savannah, uiDict])
  const callbackOpenPopup = useCallback(handleOpenPopup, [popupDict])
  const callbackClosePopup = useCallback(handleClosePopup, [popupDict])

  // Set Keyboard Controls
  useEffect(() => {
    const keydownCallback = (e) => {
      switch (e.keyCode) {
        case 38:
          setCount((val) => val <= 0 ? val : val - 1);
          uiDict.upInner.classList.add("keydownBg")
          uiDict.upInner.classList.remove("hoverBgLeft")
          uiDict.upIcon.classList.add("keydownArrow")
          document.activeElement.blur()
          break;
        case 40:
          setCount((val) => val >= (frames - 1) ? val : val + 1);
          uiDict.downInner.classList.add("keydownBg")
          uiDict.downInner.classList.remove("hoverBgRight")
          uiDict.downIcon.classList.add("keydownArrow")
          document.activeElement.blur()
          break;
        case 39:
        case 37:
          if (spSwitch === "savannah") {
            setSavannah(species)
            setSpecies(forest)
            setSpSwitch("forest")
            setCount(0)
            setFrames(forestFrames)
            uiDict.app.classList.add("theme-forest")
            uiDict.app.classList.remove("theme-savannah")
          } else {
            setForest(species)
            setSpecies(savannah)
            setSpSwitch("savannah")
            setCount(0)
            setFrames(savannahFrames)
            uiDict.app.classList.add("theme-savannah")
            uiDict.app.classList.remove("theme-forest")
          }
          uiDict.speciesButton.classList.add("spSwitchActive")
          uiDict.speciesButton.blur()
          document.activeElement.blur()
          break;
        default:
          setCount((val) => val);
        break;
      }
    }

    const keyupCallback = (e) => {
      switch (e.keyCode) {
        case 38:
          uiDict.upInner.classList.remove("keydownBg")
          uiDict.upInner.classList.add("hoverBgLeft")
          uiDict.upIcon.classList.remove("keydownArrow")
          break;
        case 40:
          uiDict.downInner.classList.remove("keydownBg")
          uiDict.downInner.classList.add("hoverBgRight")
          uiDict.downIcon.classList.remove("keydownArrow")
          break;
        case 39:
        case 37:
          uiDict.speciesButton.classList.remove("spSwitchActive")
          break;
        default:
            setCount((val) => val);
          break;
      }
    }

    if (popupOpen === false) {
      document.addEventListener("keydown", keydownCallback);
      document.addEventListener("keyup", keyupCallback);
      return () => {
        document.removeEventListener('keydown', keydownCallback);
        document.removeEventListener('keyup', keyupCallback);
      };
    }

  }, [frames, forest, savannah, species, spSwitch, popupOpen, count, uiDict]);
    
  useEffect(() => {
    const popupKeyboard = (e) => {
      switch(e.keyCode) {
        case 73:
          if (popupOpen === false) {
            callbackOpenPopup()
          } else {
            callbackClosePopup()
          }
          break;
        default:
          break
      }
    }
    document.addEventListener("keydown", popupKeyboard);
    return () => {
      document.removeEventListener("keydown", popupKeyboard);
    };
  }, [popupOpen, callbackOpenPopup, callbackClosePopup])

  // Accessibility Controls (Tab Navigation)
  useEffect(() => {
    const tabNavDown = (e) => {
      switch(e.keyCode) {
        case 13:
          if (document.activeElement.id === "speciesButton") {
            callbackForest()
            uiDict.speciesButton.classList.add("tabActive")
          }
          if (document.activeElement.id === "scrubUpInner") {
            setCount((val) => val <= 0 ? val : val - 1);
            uiDict.upInner.classList.add("tabActive")
          }
          if (document.activeElement.id === "scrubDownInner") {
            setCount((val) => val >= (frames - 1) ? val : val + 1);
            uiDict.downInner.classList.add("tabActive")
          }
          if (document.activeElement.id === "info") {
            if (popupOpen === false) {
              callbackOpenPopup()
            }
          }
          break;
        default:
          break;
      }
    }

    const tabNavUp = (e) => {
      switch(e.keyCode) {
        case 13:
          if (document.activeElement.id === "speciesButton") {
            uiDict.speciesButton.classList.remove("tabActive")
          }
          if (document.activeElement.id === "scrubUpInner") {
            uiDict.upInner.classList.remove("tabActive")
          }
          if (document.activeElement.id === "scrubDownInner") {
            uiDict.downInner.classList.remove("tabActive")
          }
          break;
        default:
          break;
      }
    }

    let increment = 0
    let shiftActive = false
    const tabCloseDown = (e) => {
      if (e.shiftKey) {
        shiftActive = true
      } else {
        shiftActive = false
      }
      switch(e.keyCode) {
        case 9:
          e.preventDefault()
          if (shiftActive) {
            increment = increment - 1
          } else {
            increment = increment + 1
          }
          if (Math.abs(increment%5) === 1) {
            popupDict.close.classList.add("tabClose")
            popupDict.summary.classList.remove("tabInfoBox")
            popupDict.controls.classList.remove("tabInfoBox")
            popupDict.interpretation.classList.remove("tabInfoBox")
            popupDict.methods.classList.remove("tabInfoBox")
            popupDict.textBox.scrollTo(0,0)
            popupDict.summary.tabIndex = "-1"
            popupDict.controls.tabIndex = "-1"
            popupDict.methods.tabIndex = "-1"
            popupDict.interpretation.tabIndex = "-1"
            popupDict.close.tabIndex = "0"
            popupDict.close.role = "combobox"
            popupDict.close.focus()
          } else if (Math.abs(increment%5) === 2) {
            popupDict.close.classList.remove("tabClose")
            popupDict.summary.classList.add("tabInfoBox")
            popupDict.controls.classList.remove("tabInfoBox")
            popupDict.interpretation.classList.remove("tabInfoBox")
            popupDict.methods.classList.remove("tabInfoBox")
            popupDict.summary.scrollIntoView({behavior: 'smooth', block: 'end', inline: 'nearest'})
            popupDict.close.tabIndex = "-1"
            popupDict.controls.tabIndex = "-1"
            popupDict.methods.tabIndex = "-1"
            popupDict.interpretation.tabIndex = "-1"
            popupDict.summary.tabIndex = "0"
            popupDict.summary.focus()
          } else if (Math.abs(increment%5) === 3) {
            popupDict.close.classList.remove("tabClose")
            popupDict.summary.classList.remove("tabInfoBox")
            popupDict.controls.classList.add("tabInfoBox")
            popupDict.interpretation.classList.remove("tabInfoBox")
            popupDict.methods.classList.remove("tabInfoBox")
            popupDict.controls.scrollIntoView({behavior: 'smooth', block: 'end', inline: 'nearest'})
            popupDict.close.tabIndex = "-1"
            popupDict.summary.tabIndex = "-1"
            popupDict.methods.tabIndex = "-1"
            popupDict.interpretation.tabIndex = "-1"
            popupDict.controls.tabIndex = "0"
            popupDict.controls.focus()
          } else if (Math.abs(increment%5) === 4) {
            popupDict.close.classList.remove("tabClose")
            popupDict.summary.classList.remove("tabInfoBox")
            popupDict.controls.classList.remove("tabInfoBox")
            popupDict.interpretation.classList.add("tabInfoBox")
            popupDict.methods.classList.remove("tabInfoBox")
            popupDict.interpretation.scrollIntoView({behavior: 'smooth', block: 'end', inline: 'nearest'})
            popupDict.close.tabIndex = "-1"
            popupDict.summary.tabIndex = "-1"
            popupDict.controls.tabIndex = "-1"
            popupDict.methods.tabIndex = "-1"
            popupDict.interpretation.tabIndex = "0"
            popupDict.interpretation.focus()
          } else if (Math.abs(increment%5) === 0) {
            popupDict.close.classList.remove("tabClose")
            popupDict.summary.classList.remove("tabInfoBox")
            popupDict.controls.classList.remove("tabInfoBox")
            popupDict.interpretation.classList.remove("tabInfoBox")
            popupDict.methods.classList.add("tabInfoBox")
            popupDict.methods.scrollIntoView({behavior: 'smooth', block: 'end', inline: 'nearest'})
            popupDict.close.tabIndex = "-1"
            popupDict.summary.tabIndex = "-1"
            popupDict.controls.tabIndex = "-1"
            popupDict.methods.tabIndex = "-1"
            popupDict.methods.tabIndex = "0"
            popupDict.methods.focus()
          }
          break;
        case 13:
          if (Math.abs(increment%5) === 1) {
            callbackClosePopup()
            popupDict.close.classList.remove("tabClose")
            popupDict.summary.classList.remove("tabInfoBox")
            popupDict.controls.classList.remove("tabInfoBox")
            popupDict.methods.classList.remove("tabInfoBox")
            popupDict.interpretation.classList.remove("tabInfoBox")
            popupDict.textBox.scrollTo(0, 0)
            popupDict.infoButton.focus()
          }
          break;
        default:
          break;
      }
    }

    const tabCloseUp = (e) => {
      switch(e.keyCode) {
        case 13:
          popupDict.close.classList.remove("tabClose")
          break;
        case 9:
          e.preventDefault()
          break;
        default:
          break;
      }
    }

    if (popupOpen === false) {
      document.addEventListener("keydown", tabNavDown);
      document.addEventListener("keyup", tabNavUp);
      return () => {
        document.removeEventListener("keydown", tabNavDown);
        document.removeEventListener("keyup", tabNavUp);
      };
    } else {
      document.addEventListener("keydown", tabCloseDown);
      document.addEventListener("keydown", tabCloseUp);
      return () => {
        document.removeEventListener("keydown", tabCloseUp);
        document.removeEventListener("keydown", tabCloseDown);
      }
    }

  }, [callbackForest, setCount, frames, popupOpen, popupDict, callbackOpenPopup, callbackClosePopup, uiDict])

  // Return Statement
  return (
    <div className="App theme-savannah">
      <div id="uiContainer">
        <div id="hiddenAriaText">
          <div tabIndex={"0"} aria-hidden="true" id="welcome" aria-label="Welcome! This interactive figure shows how the location of elephant poaching hotspots has changed over time. Press tab to proceed." autoFocus></div>
        </div>
        <div id="speciesContainer">
          <span aria-hidden="true">Species: <span id="speciesText">{spSwitch === "savannah" ? "Savannah" : "Forest"}</span></span>
          <div tabIndex={"0"} aria-hidden="true" id="speciesButton" className="speciesSwitch" role="combobox" aria-expanded="false" aria-controls="speciesButton" aria-label={`Africa contains two species of elephants: savannah and forest. The visual is currently set to mode, ${spSwitch}. Press Enter to switch modes to the other species or Tab to continue.`}><FontAwesomeIcon icon={ faRepeat } onClick={ function() {handleForest(); uiDict.speciesButton.blur()} } /></div>
        </div>
        <div id="slideContainer" aria-hidden="true">
          <div id="leftBorder"></div>
          <div id="slide">
          {arr.length > 0 & window.innerHeight <= 600 ? 
            <img id="im" src={arr[count].imgURL} alt=""></img> :
            arr.length > 0 & window.innerHeight > 600 & window.innerHeight <= 1600 ?
           <img id="im" src={arr[count].imgURLLarge} alt=""></img> :
           arr.length > 0 & window.innerHeight > 600 & window.innerHeight > 1600 ?
           <img id="im" src={arr[count].imgURLXL} alt=""></img> :"" }
          </div>
          <div id="rightBorder"></div>
        </div>
        <div id="visualContainer">
          <div id="progressContainer" aria-hidden="true">
            <div id="progressBarLeft" style={{height: barHeight[count]}}></div>
            <div id="progressBarMiddle" style={{height: barHeight[count]}}></div>
            <div id="progressBarRight" style={{height: barHeight[count]}}></div>
            <FontAwesomeIcon id="caret" icon={ faCaretRight } style={{top: barHeight[count] - carHeight}} />
          </div>
          <div id="timelineContainer" aria-hidden="true">
            {isFinite(minTimeline) ? yearBlocks : ""}
          </div>
          {/*<div id="slideContainer" aria-hidden="true">
            {arr.length > 0 ? 
              <img id="slide" src={arr[count].imgURL} alt=""></img> 
            : ""}
          </div>*/}
          <div id="buttonContainer">
            <div id="scrubDownOuter" onClick={handleSlide} aria-hidden="true"></div>
            <div tabIndex={"0"} aria-hidden="true" id="scrubDownInner" className="hoverBgRight" role="combobox" aria-expanded="false" aria-controls="scrubDownInner" aria-label={`Current seizure: ${arr.length > 0 ? arr[count].seizure : ""}. ${arr.length > 0 ? arr[count].alt : ""}. Press enter to move forward in time or tab to continue.`}  onClick={handleSlide}><FontAwesomeIcon id="scrubArrowDown" className="scrubArrow" icon={ faArrowDown } /></div>
            <div id="scrubMiddle" aria-hidden="true"></div>
            <div id="scrubUpOuter" onClick={handleSlide} aria-hidden="true"></div>
            <div tabIndex={"0"} aria-hidden="true" id="scrubUpInner" className="hoverBgLeft" role="combobox" aria-expanded="false" aria-controls="scrubUpInner" aria-label={`Press enter to move back in time or tab to continue. Current seizure: ${arr.length > 0 ? arr[count].seizure : ""}.`} onClick={handleSlide}><FontAwesomeIcon id="scrubArrowUp" className="scrubArrow" icon={ faArrowUp } /></div>
          </div>
        </div>
        <div id="popup" className="popupClosed">
          <div id="popupInner" className="innerClosed">
              <div id="textContainer" tabIndex={"-1"} aria-label="Press tab to navigate through popup window.">
                <div id="summaryContainer" className="popupBoxFormat" aria-hidden="true">
                  <span className="popupText">
                    Summary: This interactive figure shows how the location of elephant poaching
                    hotspots has changed over time.
                  </span>
                </div>
                <div id="controlsContainer" className="popupBoxFormat" aria-hidden="true">
                  <span className="popupText">
                    Controls: To navigate between time frames, click the up and down arrows 
                    on the figure or use the up and down keys on your keyboard
                    (<FontAwesomeIcon className="controlsIcons" icon={ faArrowUp } />
                    <FontAwesomeIcon className="controlsIcons" icon={ faArrowDown } />).
                    To toggle between species of elephants between forest and savannah, 
                    click the "switch" button or use the left and right keys on your keyboard
                    (<FontAwesomeIcon className="controlsIcons" icon={ faRepeat } />).
                  </span>
                </div>
                <div id="interpretationContainer" className="popupBoxFormat" aria-hidden="true">
                  <span className="popupText">
                    Understanding Seizures: Names (top-left of the figure) are defined by a 3-letter 
                    ISO-code representing the country where a shipment of ivory was seized.  It is separated by
                    a comma, then the month and year of seizure.  Lastly, it is separated by
                    a final comma, then the weight of the seizure.  For example, SGP, 06-02, 6.5t
                    is a 6.5t seizure from Singapore in June 2002.
                  </span>
                </div>
                <div id="methodsContainer" className="popupBoxFormat" aria-hidden="true">
                  <span id="methodsText" className="popupText">
                    Methods: The Center for Environmental Forensic Science (CEFS) samples 
                    seizures of elephant ivory from across Africa and Asia. Using genetic 
                    information from these sampled tusks, CEFS scientists are able to identify 
                    where in Africa each sample originated and, in turn, where seizure elephants 
                    were poached.  We display these locations as hotspots, calculated as the 
                    cumulative kernel density of seizures over time.
                  </span>
                </div>
              </div>
              <FontAwesomeIcon id="close" className="closeClosed" icon={ faTimesCircle } onClick={handleClosePopup} aria-hidden="true" aria-label="Press enter to close popup window and return to main figure." />
          </div>
        </div>
        <div id="headerContainer">
          <span aria-hidden="true" className="seizureName">{arr.length > 0 ? arr[count].seizure : ""}</span>
          <span><FontAwesomeIcon tabIndex={"0"} aria-hidden="true" id="info" className="infoDefault" icon={ faCircleInfo } onClick={handleOpenPopup} role="combobox" aria-expanded="false" aria-controls="info" aria-label="Information Button. Press enter to open popup box containing background information on this figure." /></span>
        </div>
      </div>
    </div>
  );
}

export default App

// aria-label="Welcome! This interactive figure shows how the location of elephant poaching hotspots has changed over time. Press tab to proceed."