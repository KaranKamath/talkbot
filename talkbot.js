/**
* Created by Karan on 1/22/2015.
*/

markovModel={};
wordsAfter={};
punctuations=['.', '!', '\'', '?', '\"', ':', ';'];

order=1;

function resetModel() {
    markovModel={};
    wordsAfter={};
}

function addToWordsAfter(word) {
    if(!wordsAfter.hasOwnProperty(word)) {
        wordsAfter[word]=1;
    } else {
        wordsAfter[word]+=1;
    }
}

function addToMarkovModel(currentWords, nextWord) {
    if(!markovModel.hasOwnProperty(currentWords)) {
        markovModel[currentWords] = {};
    }

    if(!markovModel[currentWords].hasOwnProperty(nextWord)) {
        markovModel[currentWords][nextWord] = 1;
    } else {
        freq = markovModel[currentWords][nextWord];
        markovModel[currentWords][nextWord] = freq+1;
    }
}

function populateModel(inputArray, reset, charBased) {
    if (reset) {
        resetModel();
    }

    if(!charBased) {
        populateWordModel(inputArray);
    } else{
        populateCharModel(inputArray);
    }
}

function populateWordModel(words) {

    l=words.length;

    for(i=0; i<l-order; i++) {
        currentWords='';
        nextWord='';
        for (j=0; j<order; j++) {
            currentWords+=(' ' + words[i+j]);
            currentWords=currentWords.trim();
        }

        nextWord=words[i+parseInt(order)];

        // Update Markov Model Mapping
        addToMarkovModel(currentWords, nextWord);

        // Update wordsAfter Mapping
        addToWordsAfter(currentWords);
    }
}

function populateCharModel(chars) {
    l=chars.length;
    for(i=0; i<l-order; i++) {
        currentChars='';
        nextChar='';
        for (j=0; j<order; j++) {
            currentChars+=chars[i+j];
        }

        nextChar=chars[i+parseInt(order)];

        // Update Markov Model Mapping
        addToMarkovModel(currentChars, nextChar);

        // Update wordsAfter Mapping
        addToWordsAfter(currentChars);
    }
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 * Function borrowed from http://stackoverflow.com/questions/1527803/generating-random-numbers-in-javascript-in-a-specific-range
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function chooseNext(current) {
    nextMap=markovModel[current];

    if (nextMap===undefined) {
        return null;
    }

    choiceProb=getRandomInt(0, wordsAfter[current]-1);
    sum=0;

    nextMapKeys=Object.keys(nextMap);
    for(i=0; i<nextMapKeys.length;i++){
        next=nextMapKeys[i];
        sum += nextMap[next];
        if (sum > choiceProb) {
            return next;
        }
    }
}

function genWords(start, numWords) {
    currentWord=start;
    outputString=start;

    while(numWords-- > 0) {
        nextWord=chooseNext(currentWord);
        if (nextWord===null) {
            nextWord=start;
            currentWord=start;
            outputString+=(' ' + nextWord);
        } else {
            outputString+=(' ' + nextWord);
            currentWord += (' ') + nextWord;
            currentWord=currentWord.split(' ').splice(1).join(' ');

        }
    }
    return outputString;
}

function genChars(start, numChars) {
    currentChar=start;
    outputString=start;

    while(numChars-- > 0) {
        nextChar=chooseNext(currentChar);
        if (nextChar===null) {
            nextChar=start;
            currentChar=start;
            outputString+=nextChar;
        } else {
            outputString+=nextChar;
            currentChar+=nextChar;
            currentChar=currentChar.substring(1);
        }
    }
    return outputString;
}

function separatePunctuation(str) {
    punctuations.forEach(function(punctuation) {
       str=str.replace(punctuation, (' ' + punctuation));
    });
    return str;
}

function combinePunctuation(str) {
    punctuations.forEach(function(punctuation) {
        str=str.replace((' '+ punctuation), punctuation);
    });
    return str;
}

function onTalkbotSubmit() {
    inputString=document.getElementById('inputString').value.trim();
    order=document.getElementById('order').value;
    charBased = document.getElementById('modelParam').value === 'Character';
    outputString="";

    if(!charBased) {
        inputString=separatePunctuation(inputString);
        words=inputString.split(' ');
        populateModel(words, true, charBased);
        outputString=genWords(words.splice(0, order).join(' ').trim(), parseInt(250)-parseInt(order));
        outputString=combinePunctuation(outputString);
    } else {
        chars=inputString.split('');
        populateModel(chars, true, charBased);
        outputString=genChars(inputString.substring(0, order), parseInt(2500)-parseInt(order));
    }

    console.log(markovModel);

    outputP = document.getElementById('talkbotOutput').innerHTML=outputString;
}
