# this assumes you've already fetched image filenames via OpenRefine, SPARQL, or whatever
# useful background: https://stackoverflow.com/questions/34393884/how-to-get-image-url-property-from-wikidata-item-by-api?utm_medium=organic&utm_source=google_rich_qa&utm_campaign=google_rich_qa

import hashlib
filename = 'Ned_Ward_by_Michael_Vandergucht.jpg'.encode('utf-8') # replace string with any wikimedia filename
directory = hashlib.md5(filename).hexdigest()[0]  + "/" + hashlib.md5(filename).hexdigest()[0] + hashlib.md5(filename).hexdigest()[1] + "/"
fileurl = str('https://upload.wikimedia.org/wikipedia/commons/') + directory + filename.decode("utf-8")
