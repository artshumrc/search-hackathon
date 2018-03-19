library(tm)
library(slam)
library(plyr)

searchname <- "final.principle.search.1"

words <- c("principle",
          "nature",
          "knowledge",
          "science",
          "reason",
          "general",
          "philosophy",
          "whole",
          "true",
          "system",
          "foundation",
	  "proposition",
	  "philosopher",
	  "maxim",
	  "genius",
	  "discovery",
	  "hypothesis",
	  "hypotheses")

words <- stemDocument(words)

metadata.all <- read.csv(file = "~/shared_space/sosadetz/smaller.metadata/ecco.metadata.smaller.csv",
                         sep = ",")[,1:7]

for (i in 1:3) {

print("read in")
  
tdm <- readRDS(paste("tdm",
		i,
		".Rds", 
    sep = ""))

print("start analysis")

rowTotals <- row_sums(tdm)
tdm <- tdm[rowTotals > 300,]

# Reset colTotals and rowTotals for new dtm
colTotals <- col_sums(tdm)
rowTotals <- row_sums(tdm)
colnames(tdm)

subset_keyword <- function(w) {
  tdm[, colnames(tdm) %in% w]
}

keywords <- subset_keyword(words)

individual_keywords <- lapply(words, subset_keyword)
names(individual_keywords) <- words

## What follows are three different sum commands. Do these all do different things, 
## or is there repetition?
sort(apply(keywords, 1, sum))

for(keyword in individual_keywords) {
  sort(apply(keyword, 1, sum))
}

keywords.count <- apply(keywords, 1, sum)

#keywords.tf <- sort(keywords.count/rowTotals)

keyword_counts <- lapply(individual_keywords, function(x) apply(x, 1, sum))
names(keyword_counts) <- names(individual_keywords)
#keyword_tfs <- lapply(keyword_counts, function(x) sort(x/rowTotals))
#names(keyword_tfs)<- names(keyword_counts)

#keywords.tfidf<- weightTfIdf(keywords)
#total.keywords.tfidf <- sort(apply(keywords.tfidf, 1, sum))

         
## Ideally, you would perform the tf-idf function on the entire combined dataset at this point.
## Difficulty doing that because of the for loop, so you can't
## calculate N and total docs w/ keywords until later

## I'm not convinced this step is necessary. You're keying to documentID later on.
textNames <- sort(names(rowTotals))
text.names.stripped <- gsub("\\..*", "", textNames)
documentID <- as.integer(text.names.stripped)

texts <- data.frame(textNames, documentID)
texts <- merge(texts, metadata.all)

print("combine and focus results")

metadata <- data.frame(texts[c("textNames", 
                               "documentID",
                               "authorGroup",
                               "titleGroup")],
                       totalWordsChunk = rowTotals[textNames],
                       keywordsCount = keywords.count[textNames],
                       #keywordsTf = keywords.tf[textNames],
                       #keywordsTfIdf = total.keywords.tfidf[textNames],
                       setNames(lapply(keyword_counts, function(x) x[textNames]),
                                paste(names(keyword_counts), ".count", sep = "")),
                       #setNames(lapply(keyword_tfs, function(x) x[textNames]),
                        #        paste(names(keyword_tfs), ".tf", sep = "")),
                       texts[c("pubDate",
                               "language",
                               "volumeGroup",
                               "publicationPlace")]
)

metadata.sorted <- metadata[order(metadata$keywordsCount, decreasing = TRUE), ]

name <- paste("results",i,sep="")
assign(name, metadata.sorted)
}

metadata.full <- rbind(results1, results2, results3)
metadata.complete <- metadata.full[order(metadata.full$keywordsCount, decreasing = TRUE), ]

## Reorder columns
#metadata.complete <- metadata.complete[c("textNames",
#                       "documentID",
#                       "authorGroup",
#                       "titleGroup",
#                       "totalWordsChunk",
#                       "keywordsCount",
#                       "keywordsTf",
#                       "keywordsTfIdf",
#                      sort(grep("\\.", names(metadata), value = TRUE)),
#                      c("pubDate",
#                      "language",
#                      "volumeGroup",
#                      "publicationPlace"))]
  
metadata.focussed <- metadata.complete[metadata.complete$keywordsCount > 7, ]
                        
write.csv(metadata.focussed,
          file=paste("~/shared_space/sosadetz/run.condor/run.condor.metadata/",
                     searchname,
                     ".csv", sep = ""))

metadata.literary <- metadata.focussed[grep("Adams, John|Addison, Joseph|Akenside, Mark|Arbuthnot, John|Astell, Mary|Ayscough|Barbauld|Barker, Jane|Barrow, Isaac|Behn, Aphra|Mrs. Behn|Bentley, Richard|Berkeley, George|Betterton, Thomas|Bickerstaff, Isaac|Blackmore, Richard|Blair, Hugh|Blake, William|Bolingbroke|Boswell, James|Brand, Hannah|Brooke, Frances|Brooke, Henry|Brown, Charles Brockden|Buffon|Bulstrode|Burney, Fanny|Burney, Charles|Burns, Robert|Burke, Edmund|Butler, Samuel|Carey, Henry|Carter, Elizabeth|Newcastle|Cavendish|Centlivre|Chatterton, Thomas|Churchill|Cibber, Colley|Cibber|Cleland, John|Coleridge, Samuel|Collier, Jane|Collins, William|Collyer, Mary|Congreve, William|Cowley|Cowper, William|Crabbe, George|Cradock, Joseph|Craven, Elizabeth|Cugoano|Cunningham, John|Dampier, Samuel|Darwin, Erasmus|Defoe, Daniel|Dennis, John|Dibdin, Charles|Diderot, Denis|Doddridge, Philip|Dodington, George|Dryden, John|Dyer, John|Edgeworth, Maria|Edwards, Jonathan|Equiano|Etherege, George|Farquhar, George|Farmer, Richard|Ferguson, Adam|Fielding, Henry|Fielding, Sarah|Fontenelle|Franklin, Benjamin|Garrick, David|Gay, John|Gerard, Alexander|Gibbon, Edward|Giffard, Henry|Gilpin, William|Godwin, William|Goethe|Goldsmith, Oliver|Gray, Thomas|Griffith, Mrs.|Hamilton, Alexander|Hartley, David|Hartson, Hall|Hawkins, John|Hayley, William|Hays, Mary|Haywood, Eliza|Hill, Aaron|Hitchcock, Robert|Hobbes, Thomas|Hogarth, William|Holcroft, Thomas|Homer|Hume, David|Hutton, Charles|Hutchinson|Hutcheson|Inchbald, Mrs|Jardine, Alexander|Jefferson, Thomas|Jephson, Robert|Johnson, Samuel|Johnstone, Robert|Jones, Henry|Jurin, James|Kames, Henry|Kant|Kelly, Hugh|Kemble, John|King, Thomas|Laclos|Langley, Gilbert|Law, William|Leapor|Lee, Sophia|Leland, Thomas|Lennox, Charlotte|Lettsom, John|Lesage|Lessing|Lewis|Lillo, George|Lloyd, Robert|Locke, John|Macdonald, John|Mackenzie, Henry|Macklin, Charles|MacNally, Leonard|Macpherson, James|Malthus|Mandeville, Bernard|Manley|Marat, Jean|Marra, John|Mason, William|Mendez, Moses|Metastasio|Montagu|Moore, Edward|More|Morton, Thomas|Moxon|Oldys, William|Otway|Paine, Thomas|Paley, William|Palmer, Samuel|Parnell, Thomas|Pennant, Thomas|Pennington|Philadelphos|Philips, Ambrose|Pindar|Pilkington|Pilon|Pinkterton, John|Piozzi|Pittis, William|Pix|Polesworth, Humphrey|Pope, Alexander|Popple, William|Pott, Percivall|Pratt|Price, Uvedal|Priestley, Joseph|Psalmanazer|Pulteney, Richard|Purney, Thomas|Ramsay, Allan|Radcliffe|Reid, Thomas|Reeve|Reresby|Reynolds|Richardson, Samuel|Rickman, John|Ritson, Joseph|Rivers, David|Robespierre|Robinson|Rochester|Rousseau|Rowe, Nicholas|Rowson, Susanna|Savage|Scott, Sarah|Shaftesbury|Sharp, Granville|Shenstone, William|Sheridan|Shiells|Sidney|Smart, Christopher|Smith, Adam|Smith, Charlotte|Smollett, Tobias|South, Robert|Spence, Joseph|Spence, Thomas|Spinoza|Leibniz|Stanyan, Temple|Stedman, John|Steele, Richard|Sterne, Laurence|Stevens, George|Swift, Jonathan|Taylor|Thelwall, John|Theobald|Tickell, Richard|Tillotson|Theobald|Thomson, James|Told, Silas|Trusler, John|Vanbrugh|Vaughan, Thomas|Volney|Voltaire|Wakefield, Gilbert|Waldron|Wallis, John|Walpole|Warburton, William|Warton, Joseph|Watts, Isaac|Webb, William|Webster|Wesley, John|West, Richard|Whiston, William|Whitehead, William|Wigstead, Henry|Wilkinson, Tate|Williams, Helen|Winchilsea|Wollstonecraft|Woolston, Thomas|Wordsworth, William|Wycherley, William|Yearsley|Young, Edward", metadata.focussed$authorGroup), ]

write.csv(metadata.literary,
          file=paste("~/shared_space/sosadetz/run.condor/run.condor.metadata/",
                     searchname,
                     ".literary.csv", sep = ""))
