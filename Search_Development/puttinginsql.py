from nltk.tokenize import sent_tokenize, word_tokenize
from nltk.stem import PorterStemmer
from nltk.corpus import stopwords
from pathlib import Path
from collections import Counter
import string
import pymongo

# create word processors, i.e., stemmer, punctuation remover
ps = PorterStemmer()
stops = set(stopwords.words("english")) | set(stopwords.words("french")) | set(stopwords.words("german"))
punc = str.maketrans({key: None for key in string.punctuation})
# create mongo database
client = pymongo.MongoClient("mongodb+srv://searchhackathon:searchhackathon@search-hackathon-gr4pq.mongodb.net/test")
db = client.test
coll = db.collection

FILENAME = '000001'

contents = Path('testfiles/' + FILENAME + '.txt').read_text() # get all data from this file
wordlist = [] # where we store all the words from this file

sent_text = sent_tokenize(contents) # split text file into sentences
for sentence in sent_text:
    sentence = sentence.translate(punc) # remove punctuation
    words = word_tokenize(sentence) # split each sentence into words
    words = [ps.stem(word) for word in words] # stem words
    words = [word for word in words if word not in stops] # remove stopwords
    words = [word.lower() for word in words] # lowercase everything
    wordlist.extend(words)

# now we have all the words in this file
wordcount = Counter(wordlist) # count words
print(wordcount)

for word in wordcount:
    if (coll.find_one({'word': word}) == None):
        coll.insert_one({'word': word, 'counts': {FILENAME: wordcount[word]}})
    else:
        coll.update({'word': word}, {'$set': {'counts.' + FILENAME: wordcount[word]}})
