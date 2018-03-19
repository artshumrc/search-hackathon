## set working directory
setwd("~/shared_space/sosadetz/original.data/texts")

## list file names
file.names <- list.files()

##delete this line when doing the whole run: for drawing sample
working.files <- files.names[1:5000]

## read them all; lapply to iterate over files
texts <- lapply(working.files, readLines)

## remove .txt ext from all files
working.files<- gsub(".txt", "", working.files)

## function to delete lines with < n words
removeIfShort <- function(texts, n=5) {
  nwords <- sapply(strsplit(texts, " "), length)
  texts[nwords > n]
}

## remove short lines from all
texts <- lapply(texts, removeIfShort, n = 5)

## produce a list in which each document (vector) is continuous, w/o para breaks
texts <- lapply(texts, paste, collapse = " ")

## split each vector into separate words
texts <- lapply(texts, function(x) unlist(strsplit(x, split = " +")))

split.n <- function(x) {
  split(x, ceiling(seq_along(x)/1000))
}

chunks <- lapply(texts, split.n)

setwd("~/shared_space/sosadetz/run.condor")


for(i in seq_along(chunks)) {
  for (j in seq_along(chunks[[i]])) {
    cat(text.chunks.1[[i]][[j]], 
        sep = " ", 
        file = paste("~/shared_space/sosadetz/run.condor/run.condor.chunks/", 
                     files.names[i], 
                     ".", 
                     j,  
                     ".txt", 
                     sep = ""))
  }}
