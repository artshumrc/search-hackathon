// Stopwords from: https://www.textfixer.com/tutorials/common-english-words.txt
const DEFAULT_STOPWORDS = 'a,able,about,across,after,all,almost,also,am,among,an,and,any,are,as,at,be,because,been,but,by,can,cannot,could,dear,did,do,does,either,else,ever,every,for,from,get,got,had,has,have,he,her,hers,him,his,how,however,i,if,in,into,is,it,its,just,least,let,like,likely,may,me,might,most,must,my,neither,no,nor,not,of,off,often,on,only,or,other,our,own,rather,said,say,says,she,should,since,so,some,than,that,the,their,them,then,there,these,they,this,tis,to,too,twas,us,wants,was,we,were,what,when,where,which,while,who,whom,why,will,with,would,yet,you,your'.split(',');

const LOOKUP_DEFAULT_STOPWORD = DEFAULT_STOPWORDS.reduce((dict, word, index) => {
  dict[word] = true;
  return dict;
}, {});

const TF_WEIGHTS = ['raw-count', 'log-count', 'proportional-to-max-tf', 'proportional-to-doc-len'];

/**
 * Returns term frequency for a given text.
 *
 * @param text Passage text to analyze for term frequency
 * @param normalizer Function that will normalize the text (e.g. punctuation, case, etc)
 * @param tokenizer Function that will split the text into tokens/terms
 * @param stopwords Array of terms that should be ignored
 * @returns {{tf: {}, max_tf: number, doc_len}}
 */
function termFrequency(text, normalizer, tokenizer, stopwords) {
  let normalized_text = normalizer(text);
  let words = tokenizer(normalized_text);
  let lookup_custom_stopword = stopwords.reduce((dict,word) => {
    dict[word] = true;
    return dict;
  }, {});

  let tf = {}, max_tf = 0;
  for(let i = 0, len = words.length; i < len; i++) {
    let word = words[i];
    if(word.length == 0 || LOOKUP_DEFAULT_STOPWORD[word] === true || lookup_custom_stopword[word] == true) {
      continue;
    }
    if(!tf.hasOwnProperty(word)) { tf[word] = 0; }
    tf[word]++;
    if(tf[word] > max_tf) {
      max_tf = tf[word];
    }
  }

  return {tf: tf, max_tf: max_tf, doc_len: words.length};
}

/**
 * Merges term frequency statistics from more than one text.
 *
 * Returns an object that maps each term to its numeric frequency,
 * which is determined by the weighting scheme (e.g. raw count, logarithmic
 * count, etc).
 *
 * @param tfs Array of term frequency statistics objects.
 * @param weight String used to identify the weighting scheme for terms.
 * @returns {}
 */
function mergeTermFrequencies(tfs, weight) {
  if(tfs.length == 0) {
    return null;
  }

  let merge = {};
  for(let i = 0, len = tfs.length; i < len; i++) {
    for(let term in tfs[i].tf) {
      if(!tfs[i].tf.hasOwnProperty(term)) { continue; }
      if(!merge.hasOwnProperty(term)) {
        merge[term] = {'freq': [], 'max_tf': [], 'doc_len': []};
      }
      merge[term].freq.push(tfs[i].tf[term]);
      merge[term].max_tf.push(tfs[i].max_tf);
      merge[term].doc_len.push(tfs[i].doc_len);
    }
  }

  let tf = {};
  for(let term in merge) {
    if(!merge.hasOwnProperty(term)) { continue; }
    if(!tf.hasOwnProperty(term)) { tf[term] = 0; }

    switch(weight) {
      case 'proportional-to-max-tf':
        for(let i = 0, len = merge[term].freq.length; i < len; i++) {
          tf[term] += (merge[term].freq[i] / merge[term].max_tf[i]);
        }
        break;
      case 'proportional-to-doc-len':
        for(let i = 0, len = merge[term].freq.length; i < len; i++) {
          tf[term] += (merge[term].freq[i] / merge[term].doc_len[i]);
        }
        break;
      case 'log-count':
        let product = 1;
        for (let i = 0, len = merge[term].freq.length; i < len; i++) {
          product *= merge[term].freq[i];
        }
        tf[term] = Math.log10(product);
        break;
      case 'raw-count':
      default:
        for (let i = 0, len = merge[term].freq.length; i < len; i++) {
          tf[term] += merge[term].freq[i];
        }
        break;
    }
  }

  return tf;
}

/**
 * Returns the inverse document frequency for a set of term frequency
 * statistics associated with individual texts.
 *
 * @param tfs
 * @returns {{df: {}, num_docs}}
 */
function inverseDocumentFrequency(tfs) {
  let df = {};
  for(let i = 0, len = tfs.length; i < len; i++) {
    let tf = tfs[i].tf;
    for(let term in tf) {
      if(!tf.hasOwnProperty(term)) { continue; }
      if(!df.hasOwnProperty(term)) { df[term] = 0; }
      df[term]++;
    }
  }
  return {df: df, num_docs: tfs.length};
}

function applyTfIdf(tf, df) {
  let tf_idf = {};
  for(let term in tf) {
    if(!tf.hasOwnProperty(term)) { continue; }
    tf_idf[term] = tf[term] * Math.log10(1 + (df.num_docs / df.df[term]));
  }
  return tf_idf;
}

/**
 * Analyzes a set of passage texts and returns frequency statistics
 * and the top keywords associated with those texts, as determined
 * by the frequency statistics.
 *
 * @param passageTexts
 * @param passageParams
 * @returns {{frequency: {}, keywords: []}}
 */
function analyze(passageTexts, passageParams) {
  let weight = passageParams.weight;
  let limit = Number(passageParams.limit);
  let stopwords = passageParams.stopwords;
  let useIdf = passageParams.useIdf;

  // validate params
  if(TF_WEIGHTS.indexOf(weight) === -1) {
    weight == 'count';
  }
  if(isNaN(limit)) {
    limit = 10;
  }
  if(!Array.isArray(stopwords)) {
    if(typeof stopwords == 'string') {
      stopwords = stopwords.split(/\s+/);
    } else {
      stopwords = [];
    }
  }

  // collect term frequencies
  let normalizer = (text) => text.replace(/[^a-zA-Z0-9 ']/g,"").toLowerCase();
  let tokenizer = (text) => text.split(/\s+/);
  let tfs = passageTexts.map((text) => termFrequency(text, normalizer, tokenizer, stopwords));
  let tf = mergeTermFrequencies(tfs, weight);
  if(useIdf) {
    let df = inverseDocumentFrequency(tfs);
    let tf_idf = applyTfIdf(tf, df);
    tf = tf_idf;
  }

  // collect terms ordered by frequency
  let terms = Object.keys(tf);
  terms.sort((a, b) => {
    if(tf[a] > tf[b]) {
      return -1;
    } else if(tf[a] == tf[b]) {
      return tf[a] < tf[b] ? -1 : 1;
    } else {
      return 1;
    }
  });
  let top_terms = terms.slice(0, limit);

  return {
    frequency: tf,
    keywords: top_terms
  };
}


module.exports = {
  STOPWORDS: DEFAULT_STOPWORDS,
  TF_WEIGHTS: TF_WEIGHTS,
  analyze: analyze
};