This repository contains supplementary data for the publication:  


Zbigniew Koza (UWr), Robert Lew (UAM), Emanuel Kulczycki (UAM), Piotr Stec (UO) 
***"How the national academic promotion system is controlled by old boys: An analysis of power distribution in Poland"***, to appear in SAGE Open (2023)


Please quote this paper if you are going to use the data from this repository. 


# Contents


The repository consists of the following directories:


- `ck-dane-historyczne` ("historical data on the CK")"


  - `skład`: The composition of the CK from 2011 to 2020 (three consecutive terms of office)
  - `sprawozdania`: Original CK reports for 2008 and 2011-2019


- `gender`: The data on the gender of participants in promotion proceedings, separately for habilitation and professorship proceedings


- `highly-cited`: The data on the participation of the most frequently cited Polish scientists in promotion procedures (cf.: Ioannidis et al., PLOS Biology, 17(8), 1–6, 2019)


- `uczestnictwa` ("memberships"):
Data on participation in promotion procedures, broken down by function (chairman, secretary, reviewer, habilitation committee member, and reviewer in the professorial procedure).


- `dane_ogólne` ("other data"): 


  - `kto_w_jakich_dyscyplinach_KH.csv`: 
    A mapping of pairs (`name`, `surname`) to disciplines under which they appear in the decisions on the appointment of habilitation committees, together with the number of such appointments. The mapping of a "pair" to distant disciplines suggests that this pair may correspond to several people.


  - `postępowania_z_przewagą_CK.csv` 


    A list of proceedings in which the decisions of the Central Commission on the appointment of habilitation committee identified cases of at least 4 pairs (`first name`, `surname`) consistent with the names and surnames of the members of the Central Commission in the term of office in which the decision was issued.


# Data format


## CSV files


The tables are stored in the CSV ("Comma-Separated Values") format, i.e., in files that can be read both as plain text and as spreadsheets in programs such as LibreOffice or Excel. 


-  Character encoding: UTF-8
-  Fractional separator: dot 
-  Column separator:  comma


## Other files


Other files are text files or PDF or HTML files downloaded from the Internet


# Comments


The tables contain data from publicly available documents of the Polish Central Commission for Degrees and Titles, retrieved from https://www.ck.gov.pl/. It was obtained by automatically converting scans of the CK decisions from files in PDF (raster) format to text files. This implies that they may contain errors in the spelling of names, assignment to disciplines, etc. Moreover, names and surnames cannot be linked to specific persons because the data does not distinguish between different persons with the same first name and surname. They also contain no information about possible name changes, and both names and surnames could have been distorted by both the CK staff and our software. In this sense, the data provided here does not refer to specific individuals. 


The authors made every effort to ensure that the data, especially those that may be related to personal data, are as close to the facts as possible, but because of the method of obtaining them, they do not guarantee their 100% accuracy. Any deviation from the facts is unintentional. 


Some table columns, such as "K50", are explained in the original article. Some table columns contain only numbers 0 or 1. In these cases, 0 means "no", 1 - "yes". 


Number 0 in the column containing the CK section number indicates that the person was not a CK member in the period analyzed here. 


Data on the composition of the Central Committee over three consecutive terms are incomplete because these compositions have evolved over time (e.g., as a result of a serious illness or death of members). The table contains "snapshots" of these compositions at selected times (for which we found reliable data). 


During document processing, only the original decisions on the composition of habilitation committees and teams of reviewers of professorial proceedings were considered. Any subsequent changes in these compositions were not considered. Each pair (`first name`, `last name`) was assigned a gender based on the value of the `first name` field. In very rare cases, this method fails and the gender is assigned the value 'unknown'. 


The CK reports were downloaded from the website of this defunct institution. For decades, the CK was the foundation of the academic promotion system in Poland, let at least so much of it stay in our memory for a little longer.
