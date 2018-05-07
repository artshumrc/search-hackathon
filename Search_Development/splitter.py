import os
import sys
from collections import Counter
from nltk.tokenize import sent_tokenize, word_tokenize
from nltk.stem import PorterStemmer
from nltk.corpus import stopwords
import string

ps = PorterStemmer()
stops = set(stopwords.words("english")) | set(stopwords.words("french")) | set(stopwords.words("german"))
punc = str.maketrans({key: None for key in string.punctuation})

def splitter(n, s):
    pieces = s.split()
    return (" ".join(pieces[i:i+n]) for i in range(0, len(pieces), n))

def cleaner(s):
    s = s.translate(punc) # remove punctuation
    s = s.lower() # lowercase words
    words = word_tokenize(s) # split each sentence into words
    words = [word for word in words if word not in stops] # remove stopwords
    words = [ps.stem(word) for word in words] # stem words
    return words


# Get input and output directories
user_input_dir = "ecco.data.alltext/clean2" # input("Please specify path to input directory:")
if os.path.isdir(user_input_dir):
    input_path = user_input_dir
else:
    print("Invalid path.")
    sys.exit()
file_list = [x for x in os.listdir(input_path) if x.endswith(".txt")][49835:]
print("{}{}".format(len(file_list)," files"))

if not os.path.exists(user_input_dir + "/output"):
    os.makedirs(input_path + "/output")


# Get files
file_num = 0;
for filename in file_list:
    file_num += 1
    print("{}{}{}{}".format("Number ",file_num,": ",filename))

    # Make a subdirectory
    subdir = filename[:filename.find(".")]
    print(input_path + "/output/" + subdir)
    if not os.path.exists(input_path + "/output/" + subdir):
        os.makedirs(input_path + "/output/" + subdir)

    # Process the file
    f = open(input_path + "/" + filename,"r")
    text = f.read()
    chunk = 0
    for piece in splitter(1000, text):
        chunk += 1
        file = open(input_path + "/output" + "/" + subdir + "/" + str(chunk).zfill(6) + ".txt", "w")
        file.write(piece)
        file.close()
        countfile = open(input_path + "/output" + "/" + subdir + "/" + str(chunk).zfill(6) + ".vol.tsv", "w")
        wordcounts = Counter(cleaner(piece))
        for word in wordcounts:
            countfile.write(word + "\t" + str(wordcounts[word]) + "\n")
        countfile.close()
    print("{}{}".format(chunk," chunks processed"))
