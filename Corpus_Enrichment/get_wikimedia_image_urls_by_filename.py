import hashlib
filename = 'Ned_Ward_by_Michael_Vandergucht.jpg'.encode('utf-8') # replace string with any wikimedia filename
directory = hashlib.md5(filename).hexdigest()[0]  + "/" + hashlib.md5(filename).hexdigest()[0] + hashlib.md5(filename).hexdigest()[1] + "/"
fileurl = str('https://upload.wikimedia.org/wikipedia/commons/') + directory + filename.decode("utf-8")
