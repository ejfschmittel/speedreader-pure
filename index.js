
const MODE = {
    PURE_WPM: 'PURE_WPM', // mode using 3600 / wpm to figure out how long to show each word
    BALANCED: 'BALANCED', // mode using 3600 / wpm + balancing based on word length, position and sentence length
    CUSTOM: 'CUSTOM' // custom define balancing 
}

const defaultSettings = {
    wpm: 300,
    mode: MODE.PURE_WPM,
}

let cubeFlipped = false;
let optionsToggled = false;




function init(){
    const buttonRead = document.querySelector("#switch-to-reader-btn");
    const buttonWrite = document.querySelector("#switch-to-input-btn");
    const cube = document.querySelector(".cube");

    const textInput = document.querySelector("#reader-text-input");
    const wordOutput = document.querySelector("#reader-text-output")

    const optionsButton = document.querySelector("#options-button")
    const optionsWindow = document.querySelector("#options-window")

    const pauseUnpauseButton = document.querySelector("#pause-unpause-button");


    const wpmInput = document.querySelector("#wpm-input")
    wpmInput.value = defaultSettings.wpm;
    const applySettingsButton = document.querySelector("#apply-settings-button")

    const reader = new Reader({
        outputFunc: (word) => wordOutput.innerHTML = word,
        onPauseRead: () => pauseUnpauseButton.classList.remove("pause-btn"),
        onStartRead: () => pauseUnpauseButton.classList.add("pause-btn"),
    });
    

    pauseUnpauseButton.addEventListener("click", () => {
        if(reader.isReading()){
            console.log("pause read")
            reader.pauseRead();
            
        }else{
            console.log("start read")
            if(!reader.isAtEnd()){
                reader.startRead()
                
            }          
        }        
    });

    optionsButton.addEventListener("click", () => {
        // set to inverse boolean
        optionsToggled = !optionsToggled
        // update button content & trigger options panel
        if(optionsToggled){
            optionsButton.innerHTML = "close"
            optionsWindow.classList.add("options__options--show")
        }else{
            optionsButton.innerHTML = "options"
            optionsWindow.classList.remove("options__options--show")
        }
        

    })

    buttonRead.addEventListener("click", () => {
        // prep text

        if(textInput.value.trim() == ""){
            alert("you must enter some text");
            return null;
        }

        reader.setText(textInput.value);

        // flip cube
        cube.classList.add("cube__flip");                

        // start reading
         
    });

    buttonWrite.addEventListener("click", () => {
        reader.pauseRead();
        cube.classList.remove("cube__flip");
    });

    applySettingsButton.addEventListener("click", () => {
        const wpmValue = wpmInput.value
        reader.updateSettings({wpm: wpmValue})

        // close options window
        optionsToggled = false;
        optionsButton.innerHTML = "options"
        optionsWindow.classList.remove("options__options--show")
    })
}


class Reader{
    constructor(settings){
        this.settings = Object.assign(defaultSettings, settings)
        
        // init values 
        this.text = "";       
        this.textLength = 0;
        this.sentences = [];
        this.current = {
            sentenceIndex: 0,
            wordIndex: 0,
            sentenceLength: 0,
            words: []
        }
        
        this.reading = false;
        this.atEnd = false;
    }

    updateSettings(newSettings){
        this.settings = Object.assign(this.settings, newSettings)
        console.log(this.settings)
    }

    getCurrentWord(){
        return this.current.words[this.current.wordIndex];
    }

    startRead(){
        console.log("start read");     
        this.reading = true;
        if(this.settings.onStartRead){
            this.settings.onStartRead()
        }
        this.read();
    }

    pauseRead(){
        console.log("pause read");
        this.reading = false;
        if(this.settings.onPauseRead){
            this.settings.onPauseRead()
        }
    }

    read(){
        // get new word
        const word = this.getCurrentWord()
        console.log(word + "(" + this.current.wordIndex + "/"+ this.current.sentenceIndex +")")
        // display new word
        this.settings.outputFunc(word);

        // get timeout
        const timeout = this.getTimeout(word);
        
        if(this.reading){
            // if you can either move to next word or the following sentences
            if(this.updateTextPos(this.current.wordIndex+1) || this.updateTextPos(0, this.current.sentenceIndex+1)){
                // then continoue to read with the given timeout
                setTimeout(this.read.bind(this), timeout);
            }else{
                // reached end of text
                this.pauseRead()
                this.atEnd = true;
            }
        }             
    }

    getTimeout(word){
        const baseTime = 60 * 1000 / this.settings.wpm;
        // special (commas and shit)
        // word & sentece weight wpm (with adjusters)
        // pure wpm
        return 60 * 1000 / this.settings.wpm;
    }

    // checks if word and sentence are in bounds of the text and returns true or false wheter the update could be performed
    updateTextPos(wordIndex, sentenceIndex=this.current.sentenceIndex, forceFullUpdate=false){       
        // check if sentence is in bounds

        if(sentenceIndex < this.sentences.length && sentenceIndex >= 0 ){         
            // check if sentence is new
            if(this.current.sentenceIndex !== sentenceIndex || forceFullUpdate){
                this.current = {
                    sentenceIndex: sentenceIndex,
                    sentenceLength: this.sentences[sentenceIndex].length,
                    words: this.SentenceToWordsArray(this.sentences[sentenceIndex])
                }
            }
            
            // check if word is in bounds
            if(wordIndex < this.current.words.length && wordIndex >= 0){
                this.atEnd = false;
                this.current.wordIndex = wordIndex;
                return true;
            }
        }

        return false;
    }

    prepNewText(text){
        // set new text
        this.text = text;
        this.textLength = this.text.length
        this.sentences = this.textToSentencesArray(this.text)

        // set text pointer to (0, 0) and force full update of this.current
        this.updateTextPos(0,0, true);
        this.settings.outputFunc(this.getCurrentWord())

        // dev output
        console.log(this.textLength)
        console.log(this.sentences);
        console.log(this.current);       
    }

    textToSentencesArray(text){
        return text.match(/([^\.!\?]+[\.!\?]+)|([^\.!\?]+$)/g) || [];
    }

    SentenceToWordsArray(sentence){
        return sentence.match(/\S+/g) || [];
    }

    setText(text){
        if(text != this.text){
            this.prepNewText(text)
        }
    }

    isReading(){
        return this.reading;
    }

    isAtEnd(){
        return this.atEnd;
    }
}

document.onload = init(); 