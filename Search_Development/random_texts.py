import os, random, shutil
num_texts = 250
for i in range(0, num_texts):
	filename = random.choice(os.listdir("/data/sosadetz/ecco.data.alltext"))
	while "clean" in filename or "vol" in filename or "csv" in filename or "tsv" in filename:
		filename = random.choice(os.listdir("/data/sosadetz/ecco.data.alltext"))
	shutil.copy2("/data/sosadetz/ecco.data.alltext/" + filename, "/data/sosadetz/ecco_testcorpora/"+str(num_texts))
	print(filename)
