-- UNEXECUTED SQL PROPOSAL — HUMAN REVIEW AND MANUAL EXECUTION REQUIRED
-- This transaction proposes 23 distinct events selected after comparison with the complete live timeline.

BEGIN;

INSERT INTO tags (name) VALUES
('Apartheid'),('Beer Distribution'),('Breweries'),('China'),('Colonialism'),('Ethiopia'),('Events'),
('Industry Consolidation'),('Japan'),('Kenya'),('Labor'),('Laws'),('Malt'),
('Nigeria'),('Packaging'),('People'),('Philippines'),('Quality Control'),
('Science'),('South Africa'),('Traditional African Beer'),('USA'),
('Styles'),('United Kingdom'),('Women in Beer History')
ON CONFLICT (name) DO NOTHING;

INSERT INTO events
    (id,title,description,event_date,historical_year,date_precision,category,sources)
VALUES
(
'c9287f0d-4968-491d-b6d8-abb83ce5e51d',
'People at Jiahu Produce a Mixed Fermented Beverage from Rice, Honey, and Fruit',
$$By approximately 7000–6600 BCE, people at Jiahu in China’s Henan province were producing a fermented beverage containing rice, honey, and hawthorn fruit and/or grapes. Chemical analysis of residues absorbed into pottery jars identified this mixture; it was not simply a barley beer and is better described as a mixed fermented beverage.

The finding extends the timeline’s account of early fermentation beyond Southwest Asia. It demonstrates deliberate cereal fermentation in Neolithic China while preserving the important distinction between this mixed drink and later grain beers.$$,
NULL,-6800,'century','Science',
$$McGovern, Patrick E., et al. “Fermented Beverages of Pre- and Proto-Historic China.” Proceedings of the National Academy of Sciences 101, no. 51 (2004): 17593–17598.
https://doi.org/10.1073/pnas.0407921102

PubMed. “Fermented Beverages of Pre- and Proto-Historic China.”
https://pubmed.ncbi.nlm.nih.gov/15590771/$$
),
(
'e466350c-db9b-4c1d-9e9e-8016c7377998',
'Brewers at Mijiaya Use Barley, Millet, and Tubers',
$$Between approximately 3400 and 2900 BCE, people at Mijiaya in northern China used specialized pottery to brew a grain beverage. Starch, phytolith, and chemical residues indicate a recipe including broomcorn millet, barley, Job’s tears, and tubers, together with heating, mashing, fermentation, and filtration.

The evidence is the earliest direct archaeological demonstration currently identified for in-place beer production in China. The presence of barley is especially notable because the grain appears in this brewing context before it became an important regional food crop.$$,
NULL,-3200,'century','Science',
$$Wang, Jiajing, et al. “Revealing a 5,000-y-old Beer Recipe in China.” Proceedings of the National Academy of Sciences 113, no. 23 (2016): 6444–6448.
https://doi.org/10.1073/pnas.1601465113$$
),
(
'e3710307-70e2-4b6b-966b-4b22ede9a8e0',
'La Fábrica de Cerveza de San Miguel Receives a Brewing Concession in Manila',
$$On March 14, 1890, Enrique María Barretto de Ycaza received a Spanish royal patent granting exclusive rights for twenty years to produce beer in the Philippines. The concession supported La Fábrica de Cerveza de San Miguel, whose mechanized Manila brewery used refrigeration to make beer locally rather than depend entirely on imported supplies.

The event belongs to the history of colonial privilege as well as industrial brewing. San Miguel subsequently became a major Philippine producer, but the original grant was a state-backed commercial concession rather than a modern patent based on examination of a novel brewing invention.$$,
'1890-03-14',NULL,'date','Breweries',
$$San Miguel Archive. “Patente de Invencion (Patent of Invention).”
https://www.sanmiguelarchive.org/exhibits/a-story-in-objects/birth-of-a-brewery/patente-de-invencion-patent-of-invention

National Historical Commission of the Philippines. “Fabrica de Cerveza de San Miguel.”
https://philhistoricsites.nhcp.gov.ph/registry_database/fabrica-de-cerveza-d-san-miguel/$$
),
(
'8086a668-b68b-491d-9a21-f673644f938d',
'The Germania Brewery Opens in Colonial Qingdao',
$$In 1903, German and British investors established the Germania-Brauerei in Qingdao, then the administrative center of Germany’s leased territory at Jiaozhou Bay. German-trained brewers and imported technology produced European-style beer initially aimed largely at colonial consumers.

The brewery later passed through Japanese and Chinese control and became associated with Tsingtao beer. Its founding illustrates how brewing technology, consumer markets, and imperial power interacted in the creation of China’s modern beer industry.$$,
'1903-01-01',NULL,'year','Breweries',
$$Liu, Qunyi. “‘This Beer Tastes Really Good’: Nationalism, Consumer Culture and Development of the Beer Industry in Qingdao, 1903–1993.” Chinese Historical Review 14, no. 1 (2007): 29–58.
https://doi.org/10.1179/tcr.2007.14.1.29

Zang, Xiaolin. Heritage Conservation and Urban Development in Qingdao.
https://research-portal.uu.nl/files/64738316/1-xiaolinzangdissertation.pdf$$
),
(
'cc56c125-66f3-4f66-a5ac-ec2820e3d37a',
'Kenya Breweries Begins Production in Nairobi',
$$Kenya Breweries was incorporated on September 8, 1922, and brewed its first batch on December 14. Founded by George and Charles Hurst during British colonial rule, the company supplied European-style lager from Nairobi and later marketed its principal beer as Tusker.

The brewery became an important base for industrial beer production in East Africa. Its history also sits alongside, rather than replacing, the region’s older fermented-grain traditions.$$,
'1922-12-14',NULL,'date','Breweries',
$$East African Breweries Limited. “Our Heritage.”
https://www.eabl.com/our-business/heritage

East African Breweries Limited. Annual Report 2024.
https://www.eabl.com/sites/default/files/documents/EABL%202024%20Annual%20Report%20-%20Webpage%20View_0.pdf$$
),
(
'bb23a18a-e240-4a8a-a22e-a8c4186bf7fc',
'St. George Brewery Opens in Addis Ababa',
$$In 1922, St. George Brewery was established in Addis Ababa during the reign of Empress Zewditu. It formed part of a wider period of urban infrastructure and industrial development connected to Ethiopia’s new capital and its railway link to Djibouti.

Bottled beer initially remained expensive and socially restricted compared with established Ethiopian fermented drinks. The brewery nevertheless marked the beginning of sustained industrial lager production in Ethiopia and later encouraged domestic malting-barley development.$$,
'1922-01-01',NULL,'year','Breweries',
$$Bekele, Shiferaw, and Anne Mager. “Beer, Modernity and the Politics of Nation-Building in Ethiopia.” Journal of the Brewery History Society 185 (2021).
https://breweryhistory.com/journal/archive/185/Ethiopia.pdf

Agricultural Reviews. “Malting Barley Production and Research in Ethiopia.”
https://arccjournals.com/journal/agricultural-reviews/DF-534$$
),
(
'19021c05-8920-4d10-a0fa-c79997ee9fea',
'Nigerian Brewery Produces Star Lager in Lagos',
$$In June 1949, Nigerian Brewery Limited began producing Star Lager at Iganmu in Lagos. The company combined capital from trading firms with Heineken technical assistance, creating a locally manufactured lager intended to substitute for imported European beer.

Star’s launch was a major step in Nigeria’s industrial brewing economy, though it did not begin Nigerian alcohol production or erase long-established indigenous drinks. Its production joined colonial commercial networks, technical transfer, local employment, and marketing ideas about modern urban consumption.$$,
'1949-06-01',NULL,'month','Breweries',
$$Akinyoade, Anselm. “The Use of Local Raw Materials in Beer Brewing: Heineken in Nigeria.” Journal of the Institute of Brewing 122, no. 4 (2016): 682–692.
https://doi.org/10.1002/jib.383

Heap, Simon. “Before ‘Star’: The Import Substitution of Western-Style Alcohol in Nigeria, 1870–1970.” African Economic History 24 (1996): 69–89.
https://www.jstor.org/stable/3601845$$
),
(
'45989067-23cd-4817-ab67-05d94f5835df',
'Chicago’s Lager Beer Riot Challenges Nativist Liquor Enforcement',
$$On April 21, 1855, protesters and police clashed in Chicago after Mayor Levi Boone’s administration raised liquor-license costs and enforced Sunday closing rules against taverns. German immigrants regarded the measures as attacks on their businesses, social customs, and political standing; one person died and dozens were arrested.

The Lager Beer Riot shows that beer regulation could become a conflict over immigration, religion, class, and municipal power. It also helped make Chicago’s German community a more organized force in city politics.$$,
'1855-04-21',NULL,'date','Events',
$$Encyclopedia of Chicago. “Lager Beer Riot.” A project of the Chicago History Museum, Newberry Library, and Northwestern University.
https://www.encyclopedia.chicagohistory.org/pages/703.html
$$
),
(
'c1ce64af-6429-48a5-b55b-52feddc86e04',
'Brewery Workers Form a National Union in Baltimore',
$$On August 29, 1886, delegates meeting in Baltimore founded the National Union of United Brewery Workmen. The organization brought brewery workers together across local and craft divisions at a time when large urban breweries depended on increasingly specialized wage labor.

The union campaigned over hours, pay, workplace authority, and the conditions under which workers sometimes lived at breweries. Its formation makes organized labor visible as a force in industrial beer history rather than treating brewery growth solely as an achievement of owners and brands.$$,
'1886-08-29',NULL,'date','People',
$$University of Pittsburgh Library System. “International Union of United Brewery Workers, Local No. 22 Records, 1887–1892.”
https://historicpittsburgh.org/islandora/object/pitt%3AUS-PPiU-ais198810

Schlüter, Hermann. The Brewing Industry and the Brewery Workers’ Movement in America. Cincinnati, 1910.
https://library.si.edu/digital-library/book/brewingindustryb00schl$$
),
(
'4105917a-3d85-429a-ba3f-0a7e627e190c',
'Natal’s Native Beer Act Enables Municipal Beer Monopolies',
$$In 1908, Natal legislation authorized municipalities to monopolize the brewing and sale of African beer. Durban opened its first municipal beer hall in 1909 and used beer revenue to finance hostels, policing, and other parts of a racially segregated system of urban administration.

The monopoly displaced or criminalized many African women who earned income by brewing and selling beer. Known as the Durban System, it turned an indigenous drink into both a revenue source and an instrument for controlling Black urban labor.$$,
'1908-01-01',NULL,'year','Laws',
$$Durban Local History Museums. “Our History: The Durban System.”
https://durbanhistorymuseums.org.za/our-history

La Hausse, Paul. “The Struggle for the City: Alcohol, the Ematsheni and Popular Culture in Durban, 1902–1936.” University of Cape Town, 1984.
https://open.uct.ac.za/bitstream/handle/11427/17888/thesis_hum_1984_la_hausse_paul.pdf$$
),
(
'5f7f8140-8361-4358-870f-0b8e36244230',
'African Workers Boycott Durban’s Municipal Beer Halls',
$$In June 1929, African workers in Durban boycotted municipal beer halls as part of a wider challenge to the city’s beer monopoly and racial administration. Demonstrations developed into violent confrontations in which six African people were killed and more than one hundred people were injured.

The protest connected beer directly to urban taxation, labor control, and political organization. Opposition centered not on beer itself but on a municipal system that restricted independent brewing and made Black consumers finance institutions used to govern them.$$,
'1929-06-01',NULL,'month','Events',
$$South African History Online. “Grey Street Complex Timeline, 1800–1999.”
https://sahistory.org.za/article/grey-street-complex-timeline-1800-1999

South African History Online. “Chapter 7: Gumede Keeps the Bright Fire Burning, 1928–29.”
https://sahistory.org.za/archive/chapter-7-gumede-keeps-bright-fire-burning-1928-29$$
),
(
'9646bbd8-d1c3-4739-8220-d98e05cacaef',
'Milwaukee Brewery Workers Begin a Citywide Strike',
$$On May 14, 1953, more than 7,000 employees at six Milwaukee breweries stopped work after contract negotiations failed. Brewery Workers Local 9 sought higher wages, shorter hours, improved pensions and health benefits, and additional holidays as new machinery increased productivity.

The strike halted production at Schlitz, Pabst, Blatz, Miller, Gettelman, and Independent Milwaukee for 76 days. Agreements reached in late July brought wage and benefit gains, demonstrating how organized workers helped shape the economics of America’s leading brewing city.$$,
'1953-05-14',NULL,'date','People',
$$University of Wisconsin–Milwaukee Libraries. “City Brewery Strike Is in Its Seventh Day.” WTMJ-TV News Archive, May 20, 1953.
https://uwm.edu/wtmjsearch/wtmjnewsarchive/47197/

Milwaukee Record. “Remembering the Great Milwaukee Brewery Strike of 1953.”
https://milwaukeerecord.com/food-drink/remembering-the-great-milwaukee-brewery-strike-of-1953/$$
),
(
'7cd6ebfe-0c68-43f7-a8a4-cc7a842f71e1',
'Women at Cato Manor Lead a Municipal Beer-Hall Boycott',
$$On June 17, 1959, African women demonstrated at the Cato Manor beer hall near Durban, emptied municipal beer, and pressed men to join a boycott. Women opposed police destruction of independent stills, the loss of brewing income, household spending in municipal halls, and the wider system of racial control and forced removal.

The action spread into a broader cycle of protest across Natal. Beer was central because home production supported women’s livelihoods while municipal sales financed apartheid-era administration.$$,
'1959-06-17',NULL,'date','People',
$$South African History Online. “The Cato Manor Riots Begin Due to the ‘Beer Issue’ and Looming Forced Removals.”
https://sahistory.org.za/dated-event/cato-manor-riots-begin-due-beer-issue-and-looming-forced-removals

South African History Online. “Women’s Revolts in Natal: 1959.”
https://sahistory.org.za/article/womens-revolts-natal-1959$$
),
(
'f1a5446c-69f1-49fa-9440-e2a1411e521a',
'Coors Brewery Workers Strike as a Broad Boycott Coalition Grows',
$$In April 1977, members of Brewery Workers Local 366 struck Coors in Golden, Colorado, beginning a 21-month labor-management confrontation. The dispute joined an older Mexican American and union boycott of Coors with support from civil-rights, women’s-rights, and gay and lesbian organizations.

The coalition made beer purchasing a form of political participation and linked workplace conflict to discrimination and civil liberties. The strike ended in 1978, while elements of the boycott continued until a 1987 agreement.$$,
'1977-04-01',NULL,'month','People',
$$Brantley, Allyson P. Brewing a Boycott: How a Grassroots Coalition Fought Coors and Remade American Consumer Activism. University of North Carolina Press, 2021.
https://academic.oup.com/north-carolina-scholarship-online/book/42493

National Park Service. “American Latino Theme Study: Labor.”
https://www.nps.gov/articles/latinothemelabor.htm

Smithsonian National Museum of American History. “Boycott Coors.”
https://www.si.edu/object/boycott-coors%3Anmah_1817426$$
),
(
'6ebd8e53-7fe4-469e-b625-303c6919898a',
'Repeal-Era States Build the American Three-Tier Distribution System',
$$Beginning in 1933, states rebuilding alcohol regulation after national Prohibition generally separated producers, wholesalers, and retailers through licensing or monopoly-control systems. These arrangements sought to prevent tied houses and concentrated supplier control over retail outlets.

There was no single uniform national three-tier statute: each state constructed its own rules under the authority restored by the Twenty-first Amendment. The resulting systems became a defining structure of the American beer market, shaping which breweries could reach retailers and consumers.$$,
'1933-01-01',NULL,'year','Laws',
$$National Research Council and Institute of Medicine. Reducing Underage Drinking: A Collective Responsibility. National Academies Press, 2004.
https://www.ncbi.nlm.nih.gov/books/NBK37589/

U.S. Department of Justice, Economic Analysis Group. “Competition in the Beer Industry and the Three-Tier System.”
https://www.justice.gov/media/1179606/dl?inline=$$
),
(
'a3d91022-072b-4ef8-bce3-484671bbdd07',
'Coors Introduces an All-Aluminum Beer Can',
$$In January 1959, Coors introduced a seamless all-aluminum beer can in a Colorado test market after several years of development. Aluminum made the package lighter and resistant to rust, while manufacturing the cans within the brewery demonstrated a new approach to large-scale beverage packaging.

The early container still required an opener; easy-open systems developed separately. Coors’s experiment helped establish aluminum as a practical alternative to steel and contributed to its later dominance in beer packaging.$$,
'1959-01-01',NULL,'month','Science',
$$Chemical & Engineering News. “Continuous Process Turns Out Aluminum Cans.” January 19, 1959.
https://doi.org/10.1021/cen-v037n003.p048

Smithsonian National Museum of American History. “Coors Aluminum Can, 1959.”
https://americanhistory.si.edu/collections/object/nmah_1299546$$
),
(
'32a43f61-3bfa-4d2f-a4bd-872751c93415',
'Nigeria’s Barley-Malt Import Ban Accelerates Sorghum Brewing Research',
$$On January 1, 1988, Nigeria’s federal government prohibited imports of barley malt. Industrial breweries had to reformulate lager and malt-drink production around locally available grains, particularly sorghum and maize, while developing new malting, enzyme, and process techniques.

The policy was economically and technically disruptive, but it accelerated research and investment in African raw materials. Later policy reversals reopened malt imports, yet sorghum retained an important place in Nigerian industrial brewing.$$,
'1988-01-01',NULL,'date','Laws',
$$Akinyoade, Anselm. “The Use of Local Raw Materials in Beer Brewing: Heineken in Nigeria.” Journal of the Institute of Brewing 122, no. 4 (2016): 682–692.
https://doi.org/10.1002/jib.383

Taylor, J. R. N., and K. G. Dewar. “Developments in Sorghum Food Technologies.” Advances in Food and Nutrition Research 43 (2001): 217–264.
https://oar.icrisat.org/992/1/RA_00221.pdf$$
),
(
'ae88f5c8-731a-4fbb-a53e-3613918506a3',
'Britain’s Beer Orders Restrict Large Brewery Tied Estates',
$$In December 1989, the British government issued the measures commonly called the Beer Orders. Large brewing groups owning more than 2,000 licensed premises were required to dispose of or release ties on excess pubs, and tied tenants gained rights to offer a guest cask-conditioned beer and purchase specified non-beer drinks independently.

The orders attempted to increase competition in a pub market dominated by vertically integrated brewers. Their consequences were mixed: brewery ownership fell, but large pub-owning companies subsequently became powerful intermediaries.$$,
'1989-12-01',NULL,'month','Laws',
$$United Kingdom. The Supply of Beer (Tied Estate) Order 1989, SI 1989/2390.
https://www.legislation.gov.uk/uksi/1989/2390/pdfs/uksi_19892390_en.pdf

House of Commons Business and Enterprise Committee. “Pub Companies.” 2009.
https://publications.parliament.uk/pa/cm200809/cmselect/cmberr/26/2604.htm$$
),
(
'15086b28-c388-42fa-8879-6a9512fb11d0',
'South African Breweries Acquires Miller to Form SABMiller',
$$In 2002, South African Breweries acquired Miller Brewing Company from Philip Morris and adopted the name SABMiller. The transaction joined a brewer with extensive African and emerging-market operations to a major United States producer and made the combined company the world’s second-largest brewer by reported lager volume.

The deal illustrates how formerly national brewing companies were becoming transcontinental portfolios. It also prepared SABMiller to take part in the next phase of global beer-industry consolidation.$$,
'2002-01-01',NULL,'year','Breweries',
$$South African Breweries. “Proposed Transaction Between SAB and Philip Morris Regarding Miller.” May 30, 2002.
https://www.sec.gov/Archives/edgar/vprr/0204/02042002.pdf

Altria Group. “Our Heritage.”
https://www.altria.com/About-Altria/Our-Heritage$$
),
(
'd5c76557-68bb-425b-bde6-fe17fd3af063',
'Interbrew and AmBev Combine to Create InBev',
$$On August 27, 2004, Belgium’s Interbrew and Brazil’s AmBev completed their combination to form InBev. The structure connected large European, Canadian, and Latin American brewing businesses and assembled international and national brands under one corporate group.

The combination was a decisive stage in the globalization of brewery ownership. It also demonstrates that modern consolidation did not flow only outward from the United States or Europe: AmBev and its Brazilian brands were central to the new company.$$,
'2004-08-27',NULL,'date','Breweries',
$$InBev. “Interbrew and AmBev Complete Combination to Establish InBev.” August 27, 2004.
https://www.ab-inbev.com/content/dam/universaltemplate/ab-inbev/news/press-releases/public/2004/8/139-ENGLISH.pdf

AmBev. Form 6-K, May 24, 2004.
https://www.sec.gov/Archives/edgar/data/1113172/000111317204000041/abv20040524_6k.htm$$
),
(
'7002888d-fb14-4106-be2f-65a398c1e644',
'InBev Acquires Anheuser-Busch',
$$On November 18, 2008, InBev completed its $52 billion acquisition of Anheuser-Busch, creating Anheuser-Busch InBev. The transaction placed Budweiser, Bud Light, Stella Artois, Beck’s, and numerous regional brands within a single international group.

Regulators did not treat the combination as competitively neutral. The United States required divestiture of Labatt’s American business because of concerns in several upstate New York markets, illustrating how global mergers could produce specific local competition problems.$$,
'2008-11-18',NULL,'date','Breweries',
$$U.S. Department of Justice. “Justice Department Requires Divestiture in InBev’s Acquisition of Anheuser-Busch.” November 14, 2008.
https://www.justice.gov/archive/opa/pr/2008/November/08-at-1008.html

Anheuser-Busch InBev. “InBev Completes Acquisition of Anheuser-Busch.” November 18, 2008.
https://www.sec.gov/Archives/edgar/data/310569/000095013708013967/c47821exv99w1.htm$$
),
(
'b22cc46b-5e52-4f97-bb96-1e026a006531',
'AB InBev Completes Its Acquisition of SABMiller',
$$On October 10, 2016, Anheuser-Busch InBev completed its acquisition of SABMiller. The transaction joined the world’s two largest brewing groups and ended SABMiller’s separate corporate existence, while required divestitures redistributed major businesses and brand rights among other brewers.

The acquisition marked an extreme concentration of international beer ownership. Its significance lies not in a new beer style but in the global control of production, distribution, agricultural purchasing, and brand portfolios.$$,
'2016-10-10',NULL,'date','Breweries',
$$Anheuser-Busch InBev. Form 8-K, October 10, 2016.
https://www.sec.gov/Archives/edgar/data/764180/000076418016000196/form8-ksabmillerabinbevtra.htm

U.S. Department of Justice. “Justice Department Requires Anheuser-Busch InBev to Divest U.S. Business of SABMiller.” July 20, 2016.
https://www.justice.gov/opa/pr/justice-department-requires-anheuser-busch-inbev-divest-us-business-sabmiller$$
),
(
'c36c96a3-571d-40be-8a7e-31db54e05b71',
'Asahi Super Dry Triggers Japan’s Dry-Beer Boom',
$$In March 1987, Asahi Breweries launched Asahi Super Dry, presenting a highly attenuated lager through the sensory idea of karakuchi, or “dry” taste. The product’s rapid success prompted competing launches and a wider Japanese dry-beer boom; national beer consumption rose sharply during 1987.

The event shows consumer research, yeast selection, process control, and branding working together to reshape a mature lager market. Its importance is the documented market transformation, not a universal claim that no earlier beer had ever been described as dry.$$,
'1987-03-01',NULL,'month','Styles',
$$Asahi Group Holdings. “Beer Development: Asahi Super Dry.”
https://www.asahigroup-holdings.com/en/rd/product/superdry.html

Kirin Brewery. “The 1987 Dry-Beer Boom.” Kirin Museum of History.
https://museum.kirinholdings.com/history/column/bd097_1987.html$$
);

WITH event_tag_names(event_id,tag_name) AS (VALUES
('c9287f0d-4968-491d-b6d8-abb83ce5e51d','China'),('c9287f0d-4968-491d-b6d8-abb83ce5e51d','Science'),
('e466350c-db9b-4c1d-9e9e-8016c7377998','China'),('e466350c-db9b-4c1d-9e9e-8016c7377998','Science'),('e466350c-db9b-4c1d-9e9e-8016c7377998','Malt'),
('e3710307-70e2-4b6b-966b-4b22ede9a8e0','Philippines'),('e3710307-70e2-4b6b-966b-4b22ede9a8e0','Colonialism'),('e3710307-70e2-4b6b-966b-4b22ede9a8e0','Breweries'),
('8086a668-b68b-491d-9a21-f673644f938d','China'),('8086a668-b68b-491d-9a21-f673644f938d','Colonialism'),('8086a668-b68b-491d-9a21-f673644f938d','Breweries'),
('cc56c125-66f3-4f66-a5ac-ec2820e3d37a','Kenya'),('cc56c125-66f3-4f66-a5ac-ec2820e3d37a','Colonialism'),('cc56c125-66f3-4f66-a5ac-ec2820e3d37a','Breweries'),
('bb23a18a-e240-4a8a-a22e-a8c4186bf7fc','Ethiopia'),('bb23a18a-e240-4a8a-a22e-a8c4186bf7fc','Breweries'),
('19021c05-8920-4d10-a0fa-c79997ee9fea','Nigeria'),('19021c05-8920-4d10-a0fa-c79997ee9fea','Colonialism'),('19021c05-8920-4d10-a0fa-c79997ee9fea','Breweries'),
('45989067-23cd-4817-ab67-05d94f5835df','USA'),('45989067-23cd-4817-ab67-05d94f5835df','Laws'),('45989067-23cd-4817-ab67-05d94f5835df','Labor'),
('c1ce64af-6429-48a5-b55b-52feddc86e04','USA'),('c1ce64af-6429-48a5-b55b-52feddc86e04','Labor'),('c1ce64af-6429-48a5-b55b-52feddc86e04','People'),
('4105917a-3d85-429a-ba3f-0a7e627e190c','South Africa'),('4105917a-3d85-429a-ba3f-0a7e627e190c','Colonialism'),('4105917a-3d85-429a-ba3f-0a7e627e190c','Laws'),('4105917a-3d85-429a-ba3f-0a7e627e190c','Traditional African Beer'),('4105917a-3d85-429a-ba3f-0a7e627e190c','Women in Beer History'),
('5f7f8140-8361-4358-870f-0b8e36244230','South Africa'),('5f7f8140-8361-4358-870f-0b8e36244230','Labor'),('5f7f8140-8361-4358-870f-0b8e36244230','Colonialism'),('5f7f8140-8361-4358-870f-0b8e36244230','Traditional African Beer'),
('9646bbd8-d1c3-4739-8220-d98e05cacaef','USA'),('9646bbd8-d1c3-4739-8220-d98e05cacaef','Labor'),('9646bbd8-d1c3-4739-8220-d98e05cacaef','People'),
('7cd6ebfe-0c68-43f7-a8a4-cc7a842f71e1','South Africa'),('7cd6ebfe-0c68-43f7-a8a4-cc7a842f71e1','Labor'),('7cd6ebfe-0c68-43f7-a8a4-cc7a842f71e1','Apartheid'),('7cd6ebfe-0c68-43f7-a8a4-cc7a842f71e1','Women in Beer History'),('7cd6ebfe-0c68-43f7-a8a4-cc7a842f71e1','Traditional African Beer'),('7cd6ebfe-0c68-43f7-a8a4-cc7a842f71e1','People'),
('f1a5446c-69f1-49fa-9440-e2a1411e521a','USA'),('f1a5446c-69f1-49fa-9440-e2a1411e521a','Labor'),('f1a5446c-69f1-49fa-9440-e2a1411e521a','People'),
('6ebd8e53-7fe4-469e-b625-303c6919898a','USA'),('6ebd8e53-7fe4-469e-b625-303c6919898a','Laws'),('6ebd8e53-7fe4-469e-b625-303c6919898a','Beer Distribution'),
('a3d91022-072b-4ef8-bce3-484671bbdd07','USA'),('a3d91022-072b-4ef8-bce3-484671bbdd07','Packaging'),('a3d91022-072b-4ef8-bce3-484671bbdd07','Science'),
('32a43f61-3bfa-4d2f-a4bd-872751c93415','Nigeria'),('32a43f61-3bfa-4d2f-a4bd-872751c93415','Laws'),('32a43f61-3bfa-4d2f-a4bd-872751c93415','Malt'),('32a43f61-3bfa-4d2f-a4bd-872751c93415','Science'),
('ae88f5c8-731a-4fbb-a53e-3613918506a3','United Kingdom'),('ae88f5c8-731a-4fbb-a53e-3613918506a3','Laws'),('ae88f5c8-731a-4fbb-a53e-3613918506a3','Beer Distribution'),
('15086b28-c388-42fa-8879-6a9512fb11d0','South Africa'),('15086b28-c388-42fa-8879-6a9512fb11d0','USA'),('15086b28-c388-42fa-8879-6a9512fb11d0','Industry Consolidation'),('15086b28-c388-42fa-8879-6a9512fb11d0','Breweries'),
('d5c76557-68bb-425b-bde6-fe17fd3af063','Industry Consolidation'),('d5c76557-68bb-425b-bde6-fe17fd3af063','Breweries'),
('7002888d-fb14-4106-be2f-65a398c1e644','USA'),('7002888d-fb14-4106-be2f-65a398c1e644','Industry Consolidation'),('7002888d-fb14-4106-be2f-65a398c1e644','Breweries'),
('b22cc46b-5e52-4f97-bb96-1e026a006531','Industry Consolidation'),('b22cc46b-5e52-4f97-bb96-1e026a006531','Breweries'),
('c36c96a3-571d-40be-8a7e-31db54e05b71','Japan'),('c36c96a3-571d-40be-8a7e-31db54e05b71','Quality Control'),('c36c96a3-571d-40be-8a7e-31db54e05b71','Styles')
)
INSERT INTO event_tags(event_id,tag_id)
SELECT event_tag_names.event_id::uuid,tags.id
FROM event_tag_names JOIN tags ON tags.name=event_tag_names.tag_name
ON CONFLICT DO NOTHING;

COMMIT;

-- Read-only verification queries to run after manual execution.
SELECT id,title,event_date,historical_year,date_precision,category
FROM events
WHERE id IN (
'c9287f0d-4968-491d-b6d8-abb83ce5e51d','e466350c-db9b-4c1d-9e9e-8016c7377998','e3710307-70e2-4b6b-966b-4b22ede9a8e0','8086a668-b68b-491d-9a21-f673644f938d','cc56c125-66f3-4f66-a5ac-ec2820e3d37a','bb23a18a-e240-4a8a-a22e-a8c4186bf7fc','19021c05-8920-4d10-a0fa-c79997ee9fea','45989067-23cd-4817-ab67-05d94f5835df','c1ce64af-6429-48a5-b55b-52feddc86e04','4105917a-3d85-429a-ba3f-0a7e627e190c','5f7f8140-8361-4358-870f-0b8e36244230','9646bbd8-d1c3-4739-8220-d98e05cacaef','7cd6ebfe-0c68-43f7-a8a4-cc7a842f71e1','f1a5446c-69f1-49fa-9440-e2a1411e521a','6ebd8e53-7fe4-469e-b625-303c6919898a','a3d91022-072b-4ef8-bce3-484671bbdd07','32a43f61-3bfa-4d2f-a4bd-872751c93415','ae88f5c8-731a-4fbb-a53e-3613918506a3','15086b28-c388-42fa-8879-6a9512fb11d0','d5c76557-68bb-425b-bde6-fe17fd3af063','7002888d-fb14-4106-be2f-65a398c1e644','b22cc46b-5e52-4f97-bb96-1e026a006531','c36c96a3-571d-40be-8a7e-31db54e05b71')
ORDER BY COALESCE(historical_year,EXTRACT(YEAR FROM event_date)::integer),event_date,title;

SELECT e.title,array_agg(t.name ORDER BY t.name) AS tags
FROM events e JOIN event_tags et ON et.event_id=e.id JOIN tags t ON t.id=et.tag_id
WHERE e.id IN (
'c9287f0d-4968-491d-b6d8-abb83ce5e51d','e466350c-db9b-4c1d-9e9e-8016c7377998','e3710307-70e2-4b6b-966b-4b22ede9a8e0','8086a668-b68b-491d-9a21-f673644f938d','cc56c125-66f3-4f66-a5ac-ec2820e3d37a','bb23a18a-e240-4a8a-a22e-a8c4186bf7fc','19021c05-8920-4d10-a0fa-c79997ee9fea','45989067-23cd-4817-ab67-05d94f5835df','c1ce64af-6429-48a5-b55b-52feddc86e04','4105917a-3d85-429a-ba3f-0a7e627e190c','5f7f8140-8361-4358-870f-0b8e36244230','9646bbd8-d1c3-4739-8220-d98e05cacaef','7cd6ebfe-0c68-43f7-a8a4-cc7a842f71e1','f1a5446c-69f1-49fa-9440-e2a1411e521a','6ebd8e53-7fe4-469e-b625-303c6919898a','a3d91022-072b-4ef8-bce3-484671bbdd07','32a43f61-3bfa-4d2f-a4bd-872751c93415','ae88f5c8-731a-4fbb-a53e-3613918506a3','15086b28-c388-42fa-8879-6a9512fb11d0','d5c76557-68bb-425b-bde6-fe17fd3af063','7002888d-fb14-4106-be2f-65a398c1e644','b22cc46b-5e52-4f97-bb96-1e026a006531','c36c96a3-571d-40be-8a7e-31db54e05b71')
GROUP BY e.id,e.title ORDER BY e.title;

SELECT name,count(*) FROM tags
WHERE name IN ('Apartheid','Beer Distribution','China','Colonialism','Ethiopia','Kenya','Labor','Nigeria','Philippines')
GROUP BY name HAVING count(*)<>1;
