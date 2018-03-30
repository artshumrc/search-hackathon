import csv, re
file = "ecco_data_combined_metadata.csv"

possible_non_persons = []
likely_persons = []

with open(file) as name_csv:
    reader = csv.DictReader(name_csv)
    for row in reader:        
        if re.search('[1-9]{4}-[1-9]{4}', row["authorGroup"]) is not None: # look for birth/death date ranges, as in "Pufendorf, Samuel, Freiherr von           1632           1694           1632-1694"         
            likely_persons += [row]
            #print("Is this a person?")
            #print(row["authorGroup"])
        elif re.search('[\w\s]+\.\s[\w\s]*', row["authorGroup"]) is None: # look for hierarchical names, like "England and Wales. Parliament. House of Commons"   
            likely_persons += [row]
            #print("Is this a person?")
            #print(row["authorGroup"])
        elif re.search('[\w\s]+\.\s[\w\s]*', row["authorGroup"]) is None:
            likely_persons += [row]
            #print("Is this a person?")
            #print(row["authorGroup"])
        else:
            possible_non_persons += [row] #to do: write a function for filtering specific stopwords, such as "company"
            #print("Is this a non-person?")
            #print(row["authorGroup"])
