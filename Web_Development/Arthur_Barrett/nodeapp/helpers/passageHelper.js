// Stopwords from: https://www.textfixer.com/tutorials/common-english-words.txt
const STOPWORDS = 'a,able,about,across,after,all,almost,also,am,among,an,and,any,are,as,at,be,because,been,but,by,can,cannot,could,dear,did,do,does,either,else,ever,every,for,from,get,got,had,has,have,he,her,hers,him,his,how,however,i,if,in,into,is,it,its,just,least,let,like,likely,may,me,might,most,must,my,neither,no,nor,not,of,off,often,on,only,or,other,our,own,rather,said,say,says,she,should,since,so,some,than,that,the,their,them,then,there,these,they,this,tis,to,too,twas,us,wants,was,we,were,what,when,where,which,while,who,whom,why,will,with,would,yet,you,your'.split(',');

const LOOKUP_STOPWORD = STOPWORDS.reduce((dict, word, index) => {
  dict[word] = true;
  return dict;
}, {});

function analyze(passageTexts) {
  let word_frequency = {};

  for(let i = 0; i < passageTexts.length; i++) {
    let passageText = passageTexts[i];
    passageText = passageText.replace(/[^a-zA-Z0-9 ']/g,"").toLowerCase();
    let words = passageText.split(/\s+/);

    for(let j = 0; j < words.length; j++) {
      let word = words[j];
      if(word.length == 0 || LOOKUP_STOPWORD[word] === true) {
        continue;
      }
      if(!word_frequency.hasOwnProperty(word)) {
        word_frequency[word] = 0;
      }
      word_frequency[word]++;
    }
  }

  let keywords = [];
  for(word in word_frequency) {
    if(word_frequency.hasOwnProperty(word)) {
      keywords.push(word);
    }
  }

  // sort keywords: most frequent first
  keywords.sort((a, b) => {
    if(word_frequency[a] > word_frequency[b]) {
      return -1;
    } else if(word_frequency[a] == word_frequency[b]) {
      return word_frequency[a] < word_frequency[b] ? -1 : 1;
    } else {
      return 1;
    }
  });

  return {
    frequency: word_frequency,
    keywords: keywords
  };
}

module.exports = {
  STOPWORDS: STOPWORDS,
  analyze: analyze
};