# this assumes you've already fetched image filenames via OpenRefine, SPARQL, or whatever
# useful background: https://stackoverflow.com/questions/34393884/how-to-get-image-url-property-from-wikidata-item-by-api?utm_medium=organic&utm_source=google_rich_qa&utm_campaign=google_rich_qa

import hashlib
import pandas as pd
import re

infile = 'ecco_metadata_recon3_100kto150k.csv' # replace with original csv; must have a column called 'image'
outfile = 'output.csv' #replace with desired output filename

def wikidata_image_url(filename):
    if not filename:
        return ''
    else:
        filename = filename.encode('utf-8')
        directory = hashlib.md5(filename).hexdigest()[0]  + "/" + hashlib.md5(filename).hexdigest()[0] + hashlib.md5(filename).hexdigest()[1] + "/"
        fileurl = str('https://upload.wikimedia.org/wikipedia/commons/') + directory + filename.decode("utf-8")
        return fileurl
    
def get_volNum(volumeGroup):
    volNum = re.search(r'Volume\s\d+', volumeGroup)
    if volNum is not None:
        volNum = volNum.group(0).split()[1]
        return volNum
    else:
        return ''

def get_numVols(volumeGroup):
    #numVols = re.search(r'Volume\s\d+\s+\\t\\t\\t\s\d+', volumeGroup)
    numVols = re.search(r'Volume\s\d+\s+\d+', volumeGroup)
    #print(volumeGroup)
    if numVols is not None:
        numVols = numVols.group(0).split()[2]
        #print(numVols)
        return numVols
    else:
        return ''

df = pd.read_csv(infile)
cols = ['documentID', 'pubDate', 'pubYearNum','birthFinal', 'deathFinal', 'totalPages']
for col in cols:
    df[col] = df[col].apply(lambda x: int(x) if x == x else "")
df.fillna('',inplace=True)
df['image_url'] = df['image filename'].apply(wikidata_image_url) # adds new column called 'image_url' to end of each row
df['volNum'] = df['volumeGroup'].apply(get_volNum) #Adds volNum
df['numVols'] = df['volumeGroup'].apply(get_numVols) #Adds numVols
df.to_csv(outfile, index=False)