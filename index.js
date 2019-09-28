

function init(){
    const buttonRead = document.querySelector("#switch-to-reader-btn");
    const buttonWrite = document.querySelector("#switch-to-input-btn");
    const cube = document.querySelector(".cube");

    const textInput = document.querySelector("#reader-text-input");
    const wordOutput = document.querySelector("#reader-text-output")

    const pauseUnpauseButton = document.querySelector("#pause-unpause-button");

    const reader = new Reader({
        outputFunc: (word) => wordOutput.innerHTML = word,
        onPauseFunc: () => pauseUnpauseButton.classList.remove("pause-btn")
    });
    

    pauseUnpauseButton.addEventListener("click", () => {
        if(reader.isReading()){
            console.log("pause read")
            reader.pauseRead();
            pauseUnpauseButton.classList.remove("pause-btn")
        }else{
            console.log("start read")
            if(!reader.isAtEnd()){
                reader.startRead()
                pauseUnpauseButton.classList.add("pause-btn")
            }          
        }        
    });

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
}


// https://autoprefixer.github.io/ http://pleeease.io/play/
// 
/* 
    TODO 
    * reader and reader options in seperate class   x
        - move out reader to seperated file
        - add reader options 
        - more reader controls => to start, jump sentence start, jump next sentece, 
        - wpm
        - settings 
    * fix blurriness                                x
    * add header
    * add rest of the page
    * clean and comment js / css
    * test cross browser

*/


/* 
    pause when comma

*/

class Reader{
    constructor(settings){
        this.settings = Object.assign({
                wpm: 300
            },
            settings)
        
        console.log(this.settings)

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

    getCurrentWord(){
        return this.current.words[this.current.wordIndex];
    }

    startRead(){
        this.reading = true;
        this.read();
    }

    pauseRead(){
        console.log("pause read");
        this.reading = false;

        if(this.settings.onPauseFunc){
            this.settings.onPauseFunc();
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