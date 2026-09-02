-- UNEXECUTED SQL PROPOSAL — HUMAN REVIEW AND MANUAL EXECUTION REQUIRED
-- Proposes 18 nonduplicate events: 10 Living Fermentation Traditions and 8 Beer from Field to Brewery.
-- It also applies one narrowly scoped tag used by the separately proposed Storyline configuration.

BEGIN;

INSERT INTO tags (name) VALUES
('Agriculture'),('Barley'),('Beer Writing'),('Brewing Science'),('China'),
('Colonial Power and Informal Brewing'),('Colonialism'),('Community'),
('Early Beer History'),('Events'),('Fermentation'),('Finland'),('Guyana'),
('Homebrewing'),('Honduras'),('Hops'),('Indigenous Brewing'),('Japan'),
('Korea'),('Kveik'),('Labor'),('Laws'),('Living Fermentation Traditions'),
('Malt'),('Norway'),('Packaging'),('People'),('Sahti'),('Science'),
('Sorghum'),('Traditional African Beer'),('United Kingdom'),('USA'),
('Uganda'),('Women in Beer History'),('Yeast'),('Zimbabwe')
ON CONFLICT (name) DO NOTHING;

INSERT INTO events
    (id,title,description,event_date,historical_year,date_precision,category,sources)
VALUES
(
'51cfd1be-6bb3-4187-8004-6de627ded7fc',
'People at Shangshan Brew a Rice-Based Fermented Beverage',
$$Between approximately 8000 and 7000 BCE, people at Shangshan in China’s Lower Yangzi region used pottery vessels to prepare a fermented beverage in which rice was a principal ingredient. Microscopic residues include rice and other plant starches showing gelatinization and enzymatic alteration, together with yeast and Monascus mold particles consistent with a qu-type fermentation starter.

The evidence connects early rice exploitation with deliberate fermentation, but it does not establish a modern beer recipe or prove why every vessel was used. The study’s authors cautiously interpret the beverage as part of early experiments in brewing and possible ceremonial feasting.$$,
NULL,-8000,'century','Science',
$$Liu, Li, et al. “Identification of 10,000-Year-Old Rice Beer at Shangshan in the Lower Yangzi River Valley of China.” Proceedings of the National Academy of Sciences 121, no. 51 (2024): e2412274121.
https://doi.org/10.1073/pnas.2412274121

Stanford Archaeology Center. “Identification of 10,000-Year-Old Rice Beer at Shangshan.”
https://archaeology.stanford.edu/research/publications$$
),
(
'a4459550-4d30-4523-bc90-c4f67d9d1865',
'Fermented Maize Drinks Are Placed in Elite Tombs at Copan',
$$During the Late Classic period, approximately 600–900 CE, vessels deposited in elite contexts at Copan in present-day Honduras held fermented maize beverages. Microbotanical analysis found maize starch damage consistent with fermentation; tuber and chili residues indicate that some drinks may have contained additional ingredients.

The evidence supports fermented maize drink as one element of Classic Maya ritual practice, including offerings that connected the living with ancestors or gods. Because the sampled vessels came from elite and funerary contexts, the findings should not be generalized into a complete account of everyday Maya drinking.$$,
NULL,750,'century','Science',
$$Chen, Ran, et al. “Fermented Maize Beverages as Ritual Offerings: Investigating Elite Drinking during Classic Maya Period at Copan, Honduras.” Journal of Anthropological Archaeology 65 (2022): 101373.
https://doi.org/10.1016/j.jaa.2021.101373$$
),
(
'85e5ca8c-67dd-40ab-a5d0-be1abc27425b',
'Japan Prohibits Unlicensed Household Alcohol Brewing',
$$By 1900, Japan’s national government had prohibited private brewing for household use as it consolidated alcohol production under a licensing and excise system. The restriction applied broadly to alcoholic fermentation rather than specifically to European-style beer and protected a liquor tax that had become a major source of state revenue.

Household production did not disappear immediately, but it became illicit. The measure is significant to beer history because it separated licensed commercial brewing from domestic fermentation and helps explain why Japan’s modern homebrewing culture developed under unusually restrictive legal conditions.$$,
'1900-01-01',NULL,'year','Laws',
$$U.S. Department of State, Office of the Historian. “Annual Message of the Japanese Minister for Foreign Affairs,” 1898, reporting passage of the prohibition on private brewing for domestic use.
https://history.state.gov/historicaldocuments/frus1898/d365

Francks, Penelope. “Inconspicuous Consumption: Sake, Beer, and the Birth of the Consumer in Japan.” University of Tokyo economic-history workshop paper, 2007.
https://www.cirje.e.u-tokyo.ac.jp/research/workshops/history/history_paper2007/Sep18.pdf$$
),
(
'ee24e369-7207-4c93-9029-6a3917a1bf44',
'Colonial Korea’s Liquor Tax Ordinance Restricts Home Brewing',
$$In 1916, the Japanese Government-General of Korea promulgated a liquor tax ordinance that required brewing licenses and made alcohol produced for household use without a license subject to enforcement as illicit liquor. The system converted longstanding domestic production into taxable, regulated activity and sharply narrowed the legal space for household fermentation.

The ordinance affected a broad Korean alcohol culture that included cloudy grain beverages made with nuruk starters. Its importance lies not in claiming that tradition vanished at once, but in showing how colonial revenue policy criminalized practices through which brewing knowledge had been maintained and transmitted.$$,
'1916-01-01',NULL,'year','Laws',
$$Encyclopedia of Korean Culture, Academy of Korean Studies. “Crackdown on Illicit Liquor.”
https://encykorea.aks.ac.kr/Article/E0079977

National Institute of Korean History. Official Gazette of the Government-General of Korea, Liquor Tax Ordinance materials, 1916.
https://db.history.go.kr/modern/gb/level.do?levelId=gb_1916_09_13_a12350_0240

Yook, Hyun-kyun. “The Government-General of Korea’s Control of Home-Brewed Liquor and the Construction of Illicit Liquor as a Problem.” Korean research record ART002818717.
https://www.kci.go.kr/kciportal/ci/sereArticleSearch/ciSereArtiView.kci?sereArticleSearchBean.artiId=ART002818717$$
),
(
'7e7d0196-85a7-4e48-b36e-a6b0bd64101b',
'Heinrich’s Chibuku Begins Brewing Opaque Sorghum Beer in Rhodesia',
$$In 1962, Heinrich’s Chibuku Breweries began producing opaque sorghum beer in Southern Rhodesia, entering a market shaped by municipal monopolies and restrictions on African beer. The company adapted a beverage category rooted in household cereal fermentation to commercial production while keeping the beer microbiologically active and locally distributed because of its short shelf life.

Chibuku’s history complicates any simple opposition between “traditional” and industrial beer. Commercial process control and packaging widened distribution, yet the business also operated through colonial racial regulation and competed with municipal brewing and informal sellers.$$,
'1962-01-01',NULL,'year','Breweries',
$$Chimhete, Nathaniel. “Heinrich’s Chibuku Breweries and the Informalization of the African Beer Industry in Salisbury, Rhodesia, 1962–1979.” African Economic History 51, no. 1 (2023): 48–75.
https://doi.org/10.3368/aeh.51.1.48

Mawonike, R., et al. “Process Improvement of Opaque Beer (Chibuku) Based on Multivariate Cumulative Sum Control Chart.” Journal of the Institute of Brewing 124 (2018).
https://doi.org/10.1002/jib.466$$
),
(
'1efda31e-570f-4f80-a30d-f9ad8aff29af',
'Odd Nordland Publishes a National Study of Norwegian Farmhouse Brewing',
$$In 1969, Norwegian ethnologist Odd Nordland published Brewing and Beer Traditions in Norway: The Social Anthropological Background of the Brewing Industry. The book drew substantially on detailed questionnaires sent to home brewers by Norwegian Ethnological Research in 1952 and 1957.

Nordland documented raw materials, equipment, yeast-keeping, brewing processes, and the social obligations surrounding farmhouse beer while those practices were receding. The work preserved evidence that later brewers and researchers used to understand surviving traditions without treating modern industrial beer as their inevitable endpoint.$$,
'1969-01-01',NULL,'year','People',
$$Nordland, Odd. Brewing and Beer Traditions in Norway: The Social Anthropological Background of the Brewing Industry. Oslo: Universitetsforlaget, 1969. Library of Congress Control Number 71472977.
https://openlibrary.org/books/OL5769962M/Brewing_and_beer_traditions_in_Norway

Norwegian Ethnological Research questionnaire documentation summarized in Garshol, Lars Marius. “Norwegian Ethnological Research.”
https://www.garshol.priv.no/blog/300.html$$
),
(
'5179a898-46e1-4248-ab99-0a55925cd2bb',
'The European Union Registers Sahti as a Traditional Speciality Guaranteed',
$$On February 9, 2002, European Commission Regulation 244/2002 registered Sahti as a Traditional Speciality Guaranteed. The protection tied commercial use of the name to a registered traditional method rather than to production within one narrowly bounded place.

Sahti remained a living Finnish farmhouse tradition as well as a small commercial category. Its specification preserved features such as a grain-based wort, distinctive mashing and filtration practices, juniper use in some variants, and fermentation without reducing a regionally varied household tradition to a claim of unchanged antiquity.$$,
'2002-02-09',NULL,'date','Laws',
$$European Commission. Commission Regulation (EC) No. 244/2002 of 8 February 2002, registering the name Sahti; effective February 9, 2002.
https://eur-lex.europa.eu/LexUriServ/LexUriServ.do?uri=OJ:L:2002:039:0011:0011:EN:PDF

Ekberg, Jukka, and Brian Gibson. “Physicochemical Characterization of Sahti, an ‘Ancient’ Beer Style Indigenous to Finland.” Journal of the Institute of Brewing 121, no. 3 (2015): 464–473.
https://doi.org/10.1002/jib.246$$
),
(
'7d0849dc-a8e0-4ccd-becd-620a1579c259',
'Genomic Research Identifies Kveik as a Distinct Domesticated Yeast Group',
$$On September 12, 2018, researchers published genomic and brewing analyses of kveik cultures maintained by farmhouse brewers in western Norway. The sampled yeasts formed a genetically related group distinct from the principal industrial beer-yeast lineages and shared traits including rapid warm fermentation, strong flocculation, and domestication-associated loss of phenolic flavor production.

The research did not “discover” kveik, which farming communities had preserved and reused for generations. Instead, it gave scientific definition to a living yeast tradition and helped explain why these cultures behave differently from standard commercial ale strains.$$,
'2018-09-12',NULL,'date','Science',
$$Preiss, Richard, et al. “Traditional Norwegian Kveik Are a Genetically Distinct Group of Domesticated Saccharomyces cerevisiae Brewing Yeasts.” Frontiers in Microbiology 9 (2018): 2137.
https://doi.org/10.3389/fmicb.2018.02137

PubMed record 30258422.
https://pubmed.ncbi.nlm.nih.gov/30258422/$$
),
(
'81a5d15f-211f-478b-a0a3-ea72ae657bd6',
'Lewis Daly Publishes an Ethnography of Makushi Parakari Brewing',
$$In 2019, anthropologist Lewis Daly published an in-depth study of parakari, a cassava beer made by Makushi communities in southern Guyana. Brewers cultivate a Rhizopus mold on cassava, using fungal saccharification before alcoholic fermentation—a technological pathway distinct from malting grain or adding industrial enzymes.

Daly treated fermentation as both a technical system and a social and ecological practice. The study is historically valuable because it documents brewers’ knowledge and interpretation of a living Amazonian tradition rather than presenting cassava beer only through an outside recipe or a generalized account of Indigenous alcohol.$$,
'2019-01-01',NULL,'year','People',
$$Daly, Lewis. “The Nature of Sweetness: An Indigenous Fermentation Complex in Amazonian Guyana.” In Alcohol and Humans: A Long and Social Affair, edited by Robin Dunbar and Kimberly Hockings, 130–146. Oxford University Press, 2019.
https://doi.org/10.1093/oso/9780198842460.003.0009

UCL Discovery record and open-access version of record.
https://discovery.ucl.ac.uk/id/eprint/10146863/$$
),
(
'f74e2556-98b4-400c-b680-b5bef718468f',
'South Korea Ends the Crackdown on Alcohol Brewed for Household Use',
$$In 1995, changes to South Korea’s liquor-tax regime ended the enforcement system that had treated unlicensed alcohol made for household consumption as illicit liquor. The reform reopened legal space for families to make grain-based drinks, including forms of takju commonly associated with makgeolli.

Legalization did not restore recipes and skills automatically. Decades of colonial licensing, post-liberation enforcement, grain restrictions, and industrial standardization had already reduced many household traditions, making the reform a starting point for recovery rather than a return to an untouched past.$$,
'1995-01-01',NULL,'year','Laws',
$$Encyclopedia of Korean Culture, Academy of Korean Studies. “Crackdown on Illicit Liquor,” identifying 1995 as the abolition year.
https://encykorea.aks.ac.kr/Article/E0079977

Koreana, Korea Foundation. “Guardians of Heritage,” discussion of the 1995 permission for private household brewing.
https://www.koreana.or.kr/koreana/na/ntt/selectNttInfo.do?bbsId=1115&nttSn=52805

Republic of Korea. Liquor Tax Act amendment, Act No. 4956 of August 4, 1995, effective October 1, 1995.
https://law.go.kr/LSW/lsRvsRsnListP.do?chrClsCd=010102&lsId=001566$$
),
(
'391b7246-5cc8-42dd-81a2-67995b0164d6',
'Chevallier Barley Spreads from a Suffolk Farm Selection',
$$In 1820, unusually promising barley plants were preserved and multiplied at Debenham in Suffolk. The best-supported account credits laborer John Andrews with growing the grain and his landlord, Charles Chevallier, with recognizing and propagating it; the precise origin of the initial seed remains unresolved.

Distributed more widely after several years of multiplication, Chevallier became the dominant British malting barley of the nineteenth century and spread internationally. Its success shows how farmer selection, seed circulation, agronomic performance, and malt quality jointly shaped brewing raw materials before formal genetic breeding programs.$$,
'1820-01-01',NULL,'year','People',
$$Hagenblad, Jenny, et al. “Chevalier Barley: The Influence of a World-Leading Malting Variety.” Crop Science 62 (2022): 1771–1784.
https://doi.org/10.1002/csc2.20668

Looseley, M. E., et al. “Mapping of Agronomic Traits, Disease Resistance and Malting Quality in a Wide Cross of Two-Row Barley Cultivars.” PLOS ONE 14, no. 7 (2019): e0219042.
https://doi.org/10.1371/journal.pone.0219042$$
),
(
'7081f145-0053-4f98-8351-c12dab7da28d',
'English Hop Growers Establish the Hops Marketing Board',
$$In 1932, Parliament approved the Hops Marketing Scheme under the Agricultural Marketing Act 1931. The scheme organized English growers into a statutory marketing board with collective control over the sale of their crop, responding to unstable prices, imports, and the bargaining power of brewers and merchants.

The board made hop supply a matter of agricultural organization rather than only brewery purchasing. It stabilized a regulated grower market for decades, although the monopoly structure remained contested and was ultimately dismantled in the context of European competition rules.$$,
'1932-01-01',NULL,'year','Laws',
$$UK Parliament, House of Commons. “Agricultural Marketing Act, 1931: Hops Marketing Scheme.” Hansard, July 4, 1932.
https://api.parliament.uk/historic-hansard/commons/1932/jul/04/agricultural-marketing-act-1931

UK Parliament, House of Lords. “Hops Marketing Scheme, 1932.” Hansard, July 6, 1932.
https://hansard.parliament.uk/lords/1932-07-06/debates/2f197698-6a51-4111-a64c-e4281bca8eb4/HopsMarketingScheme1932

UK Parliament, House of Lords. “Hops Marketing Bill [HL].” Hansard, November 17, 1981.
https://hansard.parliament.uk/Lords/1981-11-17/debates/3820b3b9-5881-4624-aba3-edaa74ff1197/HopsMarketingBillHl$$
),
(
'bef68171-05b9-4172-abb1-3b2f86bf4962',
'The Malt Research Institute Coordinates American Barley Improvement',
$$In 1938, the Malt Research Institute was established in Madison, Wisconsin, to coordinate evaluation of malting barley and support research serving growers, maltsters, and brewers. It funded work at the federal cereal-crops laboratory and helped build a precompetitive system for testing agronomic performance alongside malting and brewing quality.

The institute was a predecessor of later national malting-barley organizations. Its formation institutionalized the idea that an adequate barley supply depended on cooperation among agriculture, public research, malting, and brewing rather than on brewery specifications alone.$$,
'1938-01-01',NULL,'year','Science',
$$Bamforth, Charles W. “Beer and Brewing Education in the United States.” Brewery History 121 (2006): 81–93.
https://www.breweryhistory.com/journal/archive/121/bh-121-081.htm

American Malting Barley Association. “US Malting Barley Variety Development Programs,” noting the 1938 foundation as the Malt Research Institute.
https://www.mbaa.com/districts/Northwest/mash/Documents/The%20Future%20of%20Malting%20Barley%20in%20North%20America.pdf$$
),
(
'ed127863-c258-421b-94ff-8ed4a79d39f5',
'Mechanical Hop Pickers Rapidly Replace Hand Labor in Yakima',
$$Between 1940 and 1941, the number of mechanical hop pickers operating in Washington’s Yakima County rose from two to thirty-eight. A Farm Security Administration survey photograph recorded that a fifteen-person machine crew could replace approximately one hundred hand pickers for comparable hours of work.

Mechanization reduced growers’ dependence on large seasonal workforces and transformed the labor system behind American hop production. It improved harvesting capacity while eliminating many picking jobs formerly filled by migrant workers, women, and children.$$,
'1941-01-01',NULL,'year','Science',
$$Library of Congress, Farm Security Administration/Office of War Information Collection. Russell Lee, “Portable-Type Hop Picker at Work in the Fields, Yakima County, Washington,” 1941.
https://www.loc.gov/pictures/item/2017815757/

Kopp, Peter A. Hoptopia: A World of Agriculture and Beer in Oregon’s Willamette Valley. University of California Press, 2016.
https://www.ucpress.edu/book/9780520277489/hoptopia$$
),
(
'8ebe4a2f-9c26-4681-9fa8-da057d31b552',
'Farmworkers Organize Strikes in Yakima Valley Hop Fields',
$$In 1971, United Farm Workers Organizing Committee activists and Mexican American farmworkers organized strikes at major hop ranches in Washington’s Yakima Valley. The action spread across roughly fourteen or fifteen ranches amid disputes over union recognition, wages, working conditions, and alleged intimidation by growers.

The strikes make visible the people who cultivated and harvested brewing ingredients after mechanization. Beer’s agricultural supply chain still depended on seasonal labor, and the campaign connected hop production to the wider Chicano and farmworker movements of the period.$$,
'1971-01-01',NULL,'year','People',
$$University of Washington, Seattle Civil Rights and Labor History Project. Oscar Rosales Castañeda, “UFWOC Yakima Valley Hop Strikes: 1971,” with digitized contemporary coverage and oral-history references.
https://depts.washington.edu/civilr/farmwk_ch7.htm

Washington State University Libraries. Irwin Nash Images of Migrant Labor Digital Collection.
https://content.libraries.wsu.edu/digital/collection/nash$$
),
(
'e7e92153-5bea-41db-bac1-68571a4d7e57',
'Fusarium Head Blight Devastates Northern Plains Malting Barley',
$$Beginning in 1993, a severe Fusarium head blight epidemic struck wheat and barley in the Red River Valley and northern Great Plains. Infected barley suffered yield and quality losses and could contain deoxynivalenol, or vomitoxin, making much of the crop unacceptable to maltsters and brewers.

From 1993 through 1997, North Dakota barley producers alone lost an estimated $200 million in revenue. The crisis shifted brewery and malt-house purchasing toward other regions and intensified research into disease resistance, crop management, and reliable toxin testing.$$,
'1993-01-01',NULL,'year','Events',
$$U.S. Department of Agriculture, Agricultural Research Service. “The Scab Epidemic in Wheat and Barley.”
https://www.ars.usda.gov/midwest-area/stpaul/cereal-disease-lab/docs/fusarium-head-blight/fhb-epidemic-in-wheat-and-barley-overview/

U.S. General Accounting Office. U.S. Agriculture: Grain Fungus Creates Financial Distress for North Dakota Barley Producers. RCED-99-59, 1999.
https://www.gao.gov/assets/rced-99-59.pdf$$
),
(
'b5f3fe2d-4d4f-41ec-9af0-2373a20153d5',
'Nile Breweries Launches a Lager Built Around Ugandan Sorghum',
$$In December 2001, Nile Breweries launched Eagle Lager in Uganda using Epuripur sorghum selected through cooperation with Uganda’s National Agricultural Research Organisation and technical trials of candidate grains. Beginning with the 2002 cropping season, the project multiplied seed and developed a contract system that guaranteed purchases when farmers met specified quality standards.

The project linked an alternative brewing grain to smallholder agriculture and industrial lager production. It created market opportunities but also placed seed, quality, and purchasing decisions within a brewery-led supply chain, so its development effects should not be treated as automatic or uniformly distributed.$$,
'2001-12-01',NULL,'month','Breweries',
$$van Wijk, Jeroen, et al. “An Institutional Diagnostics of Agricultural Innovation: Public-Private Partnerships and Smallholder Production in Uganda.” NJAS: Wageningen Journal of Life Sciences 84 (2018): 6–12.
https://doi.org/10.1016/j.njas.2017.10.006

Mackintosh, Ian. “Eagle Lager: A Sorghum Success Story on Many Levels.” INTSORMIL presentation, 2010.
https://digitalcommons.unl.edu/intsormilpresent/23/$$
),
(
'7da72244-07e8-4966-a360-affef61ef6dc',
'An International Consortium Publishes an Ordered Barley Genome Resource',
$$On October 17, 2012, the International Barley Genome Sequencing Consortium published an integrated physical, genetic, and functional map of barley’s approximately 5.1-gigabase genome. The resource anchored most of the genome to a high-resolution genetic map and identified tens of thousands of high-confidence genes and extensive variation among accessions.

The publication did not complete every part of a reference genome, but it gave crop scientists a new platform for gene discovery and genome-assisted breeding. For brewing, that supports more targeted work on yield, disease resistance, climate adaptation, and the grain and malting traits required by maltsters and brewers.$$,
'2012-10-17',NULL,'date','Science',
$$International Barley Genome Sequencing Consortium. “A Physical, Genetic and Functional Sequence Assembly of the Barley Genome.” Nature 491 (2012): 711–716.
https://doi.org/10.1038/nature11543$$
);

WITH event_tag_names(event_id,tag_name) AS (VALUES
('51cfd1be-6bb3-4187-8004-6de627ded7fc','China'),('51cfd1be-6bb3-4187-8004-6de627ded7fc','Early Beer History'),('51cfd1be-6bb3-4187-8004-6de627ded7fc','Fermentation'),('51cfd1be-6bb3-4187-8004-6de627ded7fc','Living Fermentation Traditions'),
('a4459550-4d30-4523-bc90-c4f67d9d1865','Honduras'),('a4459550-4d30-4523-bc90-c4f67d9d1865','Early Beer History'),('a4459550-4d30-4523-bc90-c4f67d9d1865','Fermentation'),('a4459550-4d30-4523-bc90-c4f67d9d1865','Indigenous Brewing'),('a4459550-4d30-4523-bc90-c4f67d9d1865','Living Fermentation Traditions'),
('85e5ca8c-67dd-40ab-a5d0-be1abc27425b','Japan'),('85e5ca8c-67dd-40ab-a5d0-be1abc27425b','Homebrewing'),('85e5ca8c-67dd-40ab-a5d0-be1abc27425b','Laws'),('85e5ca8c-67dd-40ab-a5d0-be1abc27425b','Living Fermentation Traditions'),
('ee24e369-7207-4c93-9029-6a3917a1bf44','Korea'),('ee24e369-7207-4c93-9029-6a3917a1bf44','Colonialism'),('ee24e369-7207-4c93-9029-6a3917a1bf44','Homebrewing'),('ee24e369-7207-4c93-9029-6a3917a1bf44','Indigenous Brewing'),('ee24e369-7207-4c93-9029-6a3917a1bf44','Laws'),('ee24e369-7207-4c93-9029-6a3917a1bf44','Living Fermentation Traditions'),('ee24e369-7207-4c93-9029-6a3917a1bf44','Colonial Power and Informal Brewing'),
('7e7d0196-85a7-4e48-b36e-a6b0bd64101b','Zimbabwe'),('7e7d0196-85a7-4e48-b36e-a6b0bd64101b','Colonialism'),('7e7d0196-85a7-4e48-b36e-a6b0bd64101b','Sorghum'),('7e7d0196-85a7-4e48-b36e-a6b0bd64101b','Traditional African Beer'),('7e7d0196-85a7-4e48-b36e-a6b0bd64101b','Living Fermentation Traditions'),('7e7d0196-85a7-4e48-b36e-a6b0bd64101b','Colonial Power and Informal Brewing'),
('1efda31e-570f-4f80-a30d-f9ad8aff29af','Norway'),('1efda31e-570f-4f80-a30d-f9ad8aff29af','Beer Writing'),('1efda31e-570f-4f80-a30d-f9ad8aff29af','Homebrewing'),('1efda31e-570f-4f80-a30d-f9ad8aff29af','Living Fermentation Traditions'),
('5179a898-46e1-4248-ab99-0a55925cd2bb','Finland'),('5179a898-46e1-4248-ab99-0a55925cd2bb','Sahti'),('5179a898-46e1-4248-ab99-0a55925cd2bb','Laws'),('5179a898-46e1-4248-ab99-0a55925cd2bb','Living Fermentation Traditions'),
('7d0849dc-a8e0-4ccd-becd-620a1579c259','Norway'),('7d0849dc-a8e0-4ccd-becd-620a1579c259','Kveik'),('7d0849dc-a8e0-4ccd-becd-620a1579c259','Yeast'),('7d0849dc-a8e0-4ccd-becd-620a1579c259','Brewing Science'),('7d0849dc-a8e0-4ccd-becd-620a1579c259','Living Fermentation Traditions'),
('81a5d15f-211f-478b-a0a3-ea72ae657bd6','Guyana'),('81a5d15f-211f-478b-a0a3-ea72ae657bd6','Indigenous Brewing'),('81a5d15f-211f-478b-a0a3-ea72ae657bd6','Fermentation'),('81a5d15f-211f-478b-a0a3-ea72ae657bd6','Living Fermentation Traditions'),
('f74e2556-98b4-400c-b680-b5bef718468f','Korea'),('f74e2556-98b4-400c-b680-b5bef718468f','Homebrewing'),('f74e2556-98b4-400c-b680-b5bef718468f','Indigenous Brewing'),('f74e2556-98b4-400c-b680-b5bef718468f','Laws'),('f74e2556-98b4-400c-b680-b5bef718468f','Living Fermentation Traditions'),('f74e2556-98b4-400c-b680-b5bef718468f','Colonial Power and Informal Brewing'),
('391b7246-5cc8-42dd-81a2-67995b0164d6','United Kingdom'),('391b7246-5cc8-42dd-81a2-67995b0164d6','Agriculture'),('391b7246-5cc8-42dd-81a2-67995b0164d6','Barley'),('391b7246-5cc8-42dd-81a2-67995b0164d6','Malt'),('391b7246-5cc8-42dd-81a2-67995b0164d6','People'),
('7081f145-0053-4f98-8351-c12dab7da28d','United Kingdom'),('7081f145-0053-4f98-8351-c12dab7da28d','Agriculture'),('7081f145-0053-4f98-8351-c12dab7da28d','Hops'),('7081f145-0053-4f98-8351-c12dab7da28d','Laws'),
('bef68171-05b9-4172-abb1-3b2f86bf4962','USA'),('bef68171-05b9-4172-abb1-3b2f86bf4962','Agriculture'),('bef68171-05b9-4172-abb1-3b2f86bf4962','Barley'),('bef68171-05b9-4172-abb1-3b2f86bf4962','Brewing Science'),('bef68171-05b9-4172-abb1-3b2f86bf4962','Malt'),
('ed127863-c258-421b-94ff-8ed4a79d39f5','USA'),('ed127863-c258-421b-94ff-8ed4a79d39f5','Agriculture'),('ed127863-c258-421b-94ff-8ed4a79d39f5','Hops'),('ed127863-c258-421b-94ff-8ed4a79d39f5','Labor'),
('8ebe4a2f-9c26-4681-9fa8-da057d31b552','USA'),('8ebe4a2f-9c26-4681-9fa8-da057d31b552','Agriculture'),('8ebe4a2f-9c26-4681-9fa8-da057d31b552','Hops'),('8ebe4a2f-9c26-4681-9fa8-da057d31b552','Labor'),('8ebe4a2f-9c26-4681-9fa8-da057d31b552','People'),
('e7e92153-5bea-41db-bac1-68571a4d7e57','USA'),('e7e92153-5bea-41db-bac1-68571a4d7e57','Agriculture'),('e7e92153-5bea-41db-bac1-68571a4d7e57','Barley'),('e7e92153-5bea-41db-bac1-68571a4d7e57','Malt'),
('b5f3fe2d-4d4f-41ec-9af0-2373a20153d5','Uganda'),('b5f3fe2d-4d4f-41ec-9af0-2373a20153d5','Agriculture'),('b5f3fe2d-4d4f-41ec-9af0-2373a20153d5','Sorghum'),('b5f3fe2d-4d4f-41ec-9af0-2373a20153d5','Colonial Power and Informal Brewing'),
('7da72244-07e8-4966-a360-affef61ef6dc','Agriculture'),('7da72244-07e8-4966-a360-affef61ef6dc','Barley'),('7da72244-07e8-4966-a360-affef61ef6dc','Brewing Science'),('7da72244-07e8-4966-a360-affef61ef6dc','Malt')
)
INSERT INTO event_tags(event_id,tag_id)
SELECT event_tag_names.event_id::uuid,tags.id
FROM event_tag_names JOIN tags ON tags.name=event_tag_names.tag_name
ON CONFLICT DO NOTHING;

-- Connect existing and previously proposed events to the requested Storyline.
-- The join through events makes this safe if a previously proposed UUID is not yet present.
WITH storyline_event_ids(event_id) AS (VALUES
('cbf857ff-f79e-463c-acb4-4908772c5ef1'), -- Peter Hemings at Monticello
('e3710307-70e2-4b6b-966b-4b22ede9a8e0'), -- San Miguel concession
('8086a668-b68b-491d-9a21-f673644f938d'), -- colonial Qingdao
('4105917a-3d85-429a-ba3f-0a7e627e190c'), -- Natal Native Beer Act / Durban System
('cc56c125-66f3-4f66-a5ac-ec2820e3d37a'), -- Kenya Breweries
('5f7f8140-8361-4358-870f-0b8e36244230'), -- 1929 Durban boycott
('19021c05-8920-4d10-a0fa-c79997ee9fea'), -- Star Lager in Lagos
('7cd6ebfe-0c68-43f7-a8a4-cc7a842f71e1'), -- Cato Manor boycott
('2560ee38-b17c-4b7e-9854-35ac3940da82'), -- Upper Volta women’s sorghum-beer economy
('32a43f61-3bfa-4d2f-a4bd-872751c93415'), -- Nigerian malt-import ban
('57f75266-58be-4629-914d-7f9c52726e75')  -- South African traditional-beer regulation
)
INSERT INTO event_tags(event_id,tag_id)
SELECT e.id,t.id
FROM storyline_event_ids s
JOIN events e ON e.id=s.event_id::uuid
JOIN tags t ON t.name='Colonial Power and Informal Brewing'
ON CONFLICT DO NOTHING;

COMMIT;

-- Read-only verification queries to run after manual execution.
SELECT id,title,event_date,historical_year,date_precision,category
FROM events
WHERE id IN (
'51cfd1be-6bb3-4187-8004-6de627ded7fc','a4459550-4d30-4523-bc90-c4f67d9d1865','85e5ca8c-67dd-40ab-a5d0-be1abc27425b','ee24e369-7207-4c93-9029-6a3917a1bf44','7e7d0196-85a7-4e48-b36e-a6b0bd64101b','1efda31e-570f-4f80-a30d-f9ad8aff29af','5179a898-46e1-4248-ab99-0a55925cd2bb','7d0849dc-a8e0-4ccd-becd-620a1579c259','81a5d15f-211f-478b-a0a3-ea72ae657bd6','f74e2556-98b4-400c-b680-b5bef718468f','391b7246-5cc8-42dd-81a2-67995b0164d6','7081f145-0053-4f98-8351-c12dab7da28d','bef68171-05b9-4172-abb1-3b2f86bf4962','ed127863-c258-421b-94ff-8ed4a79d39f5','8ebe4a2f-9c26-4681-9fa8-da057d31b552','e7e92153-5bea-41db-bac1-68571a4d7e57','b5f3fe2d-4d4f-41ec-9af0-2373a20153d5','7da72244-07e8-4966-a360-affef61ef6dc')
ORDER BY COALESCE(historical_year,EXTRACT(YEAR FROM event_date)::integer),event_date,title;

SELECT e.title,array_agg(t.name ORDER BY t.name) AS tags
FROM events e JOIN event_tags et ON et.event_id=e.id JOIN tags t ON t.id=et.tag_id
WHERE e.id IN (
'51cfd1be-6bb3-4187-8004-6de627ded7fc','a4459550-4d30-4523-bc90-c4f67d9d1865','85e5ca8c-67dd-40ab-a5d0-be1abc27425b','ee24e369-7207-4c93-9029-6a3917a1bf44','7e7d0196-85a7-4e48-b36e-a6b0bd64101b','1efda31e-570f-4f80-a30d-f9ad8aff29af','5179a898-46e1-4248-ab99-0a55925cd2bb','7d0849dc-a8e0-4ccd-becd-620a1579c259','81a5d15f-211f-478b-a0a3-ea72ae657bd6','f74e2556-98b4-400c-b680-b5bef718468f','391b7246-5cc8-42dd-81a2-67995b0164d6','7081f145-0053-4f98-8351-c12dab7da28d','bef68171-05b9-4172-abb1-3b2f86bf4962','ed127863-c258-421b-94ff-8ed4a79d39f5','8ebe4a2f-9c26-4681-9fa8-da057d31b552','e7e92153-5bea-41db-bac1-68571a4d7e57','b5f3fe2d-4d4f-41ec-9af0-2373a20153d5','7da72244-07e8-4966-a360-affef61ef6dc')
GROUP BY e.id,e.title ORDER BY e.title;

SELECT e.title
FROM events e JOIN event_tags et ON et.event_id=e.id JOIN tags t ON t.id=et.tag_id
WHERE t.name='Colonial Power and Informal Brewing'
ORDER BY COALESCE(e.historical_year,EXTRACT(YEAR FROM e.event_date)::integer),e.event_date,e.title;
