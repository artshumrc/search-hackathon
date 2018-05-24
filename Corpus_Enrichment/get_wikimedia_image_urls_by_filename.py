# this assumes you've already fetched image filenames via OpenRefine, SPARQL, or whatever
# useful background: https://stackoverflow.com/questions/34393884/how-to-get-image-url-property-from-wikidata-item-by-api?utm_medium=organic&utm_source=google_rich_qa&utm_campaign=google_rich_qa

import hashlib
import pandas as pd

infile = 'example.csv' # replace with original csv; must have a column called 'image'
outfile = 'output.csv' #replace with desired output filename

def wikidata_image_url(filename):
    if not filename:
        return ''
    else:
        filename = filename.encode('utf-8')
        directory = hashlib.md5(filename).hexdigest()[0]  + "/" + hashlib.md5(filename).hexdigest()[0] + hashlib.md5(filename).hexdigest()[1] + "/"
        fileurl = str('https://upload.wikimedia.org/wikipedia/commons/') + directory + filename.decode("utf-8")
        return fileurl

df = pd.read_csv(infile)
df.fillna('',inplace=True)
df['image_url'] = df['image'].apply(wikidata_image_url) # adds new column called 'image_url' to end of each row
df.to_csv(outfile, index=False)
