import csv, re
file = "ecco_data_combined_metadata.csv"

possible_non_persons = []
likely_persons = []

with open(file) as name_csv:
    reader = csv.DictReader(name_csv)
    for row in reader:
        if re.search('[1-9]{4}-[1-9]{4}', row["authorGroup"]) is None: # look for birth/death date ranges, as in "Pufendorf, Samuel, Freiherr von           1632           1694           1632-1694"           
            possible_non_persons += [row]
        elif re.search('[\w\s]+\.\s[\w\s]*', row["authorGroup"]) is None: # look for hierarchical names, like "England and Wales. Parliament. House of Commons"     
            possible_non_persons += [row]
        else: likely_persons += [row]
