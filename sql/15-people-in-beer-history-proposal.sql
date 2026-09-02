-- UNEXECUTED SQL PROPOSAL — HUMAN REVIEW AND MANUAL EXECUTION REQUIRED

BEGIN;

INSERT INTO tags (name)
VALUES
    ('Australia'),
    ('Japan'),
    ('Beer Writing'),
    ('Brewing Education'),
    ('Breweries'), ('Brewing Science'), ('Burton-on-Trent'),
    ('Canada'), ('Carlsberg'), ('Chicago'), ('Containers'),
    ('Denmark'), ('Fermentation'), ('Guinness'), ('Homebrewing'),
    ('Hops'), ('Ireland'), ('Lager'), ('Laws'), ('Malt'),
    ('Measurement'), ('Modern Craft Beer'), ('People'), ('Prohibition'),
    ('Quality Control'), ('Science'), ('Temperance'), ('United Kingdom'),
    ('USA'), ('Women in Beer History')
ON CONFLICT (name) DO NOTHING;

INSERT INTO events (
    id, title, description, event_date, date_precision, category, sources
)
VALUES
(
    '39915d61-b1db-4091-8582-c9c24720f73b',
    'William Sealy Gosset Publishes “The Probable Error of a Mean” as “Student”',
    $$In March 1908, William Sealy Gosset published “The Probable Error of a Mean” in Biometrika under the name “Student.” Gosset worked for Guinness in Dublin, where costly brewery and barley experiments often produced only small sets of observations. His paper supplied a way to reason about uncertainty when a population’s variability had to be estimated from a small sample.

The work grew from practical statistical problems at Guinness rather than from an academic post. It became the foundation of what is now called Student’s t-distribution and helped make carefully designed small-sample experiments useful in brewing, agriculture, and many other fields. Guinness permitted technical publication while requiring employees to use pen names; the surviving evidence supports the corporate policy, but not a more specific story about why Gosset chose the word “Student.”$$,
    '1908-03-01', 'month', 'People',
    $$Gosset, William Sealy (“Student”). “The Probable Error of a Mean.” Biometrika 6, no. 1 (March 1908): 1–25.
https://doi.org/10.2307/2331554

Ziliak, Stephen T. “Guinnessometrics: The Economic Foundation of ‘Student’s’ t.” Journal of Economic Perspectives 22, no. 4 (2008): 199–216.
https://doi.org/10.1257/jep.22.4.199

Physiological Society. “The Strange Origins of the Student’s t-Test.”
https://www.physoc.org/magazine-articles/the-strange-origins-of-the-students-t-test/$$
),
(
    'bcc21c2d-2d5a-4fc7-b72e-6a7e7ac584ea',
    'J. C. Jacobsen Establishes the Carlsberg Laboratory',
    $$In 1875, brewer Jacob Christian Jacobsen established the Carlsberg Laboratory beside his Copenhagen brewery. He intended the laboratory to investigate the chemistry of beer and the physiology of the organisms involved so that brewing quality could rest on systematic research rather than experience alone.

The institution gave brewing science a durable organizational base. Its chemical and physiological departments later supported Emil Christian Hansen’s work with pure yeast cultures, Johan Kjeldahl’s method for nitrogen analysis, and S. P. L. Sørensen’s pH scale. Jacobsen thus mattered not only as Carlsberg’s founder but as the patron who made scientific research part of the brewery’s permanent structure.$$,
    '1875-01-01', 'year', 'People',
    $$Carlsberg Foundation. “Timeline of the Foundation’s History.”
https://carlsbergfondet.dk/en/about-the-foundation/our-history/timeline-of-the-foundation-s-history/

Carlsberg Group. “Our Rich Heritage.”
https://carlsberggroup.com/who-we-are/about-the-carlsberg-group/our-rich-heritage/

Carlsberg Foundation. “Charter of the Carlsberg Foundation.”
https://www.carlsbergfondet.dk/media/zsudknxa/the-carlsberg-foundation-charter.pdf$$
),
(
    '9be64ee1-501d-475a-8738-f49870cd182a',
    'Johan Kjeldahl Introduces a New Method for Nitrogen Analysis',
    $$In 1883, Johan Kjeldahl, head of chemistry at the Carlsberg Laboratory, published a new method for determining nitrogen in organic substances. The procedure digested a sample in sulfuric acid and measured the resulting ammonia, providing a practical route to estimating the nitrogen—and, by convention, protein—content of agricultural and food materials.

Kjeldahl developed the method amid the laboratory’s investigations of grain, germination, and brewing raw materials, where nitrogenous compounds affected malting and beer production. The technique was not confined to beer: its adaptability made it a long-lived standard in food, agricultural, and environmental analysis.$$,
    '1883-01-01', 'year', 'People',
    $$Kjeldahl, Johan. “Neue Methode zur Bestimmung des Stickstoffs in organischen Körpern.” Zeitschrift für analytische Chemie 22 (1883): 366–382.
https://doi.org/10.1007/BF01338151

Carlsberg Laboratory. Carlsberg Laboratoriet 1876–1901.
https://tekniskkulturarv.dk/book/d7901035-ad50-4c31-8898-935ab05f440b/carlsberg-laboratoriet-1876-1901.pdf

Sáez-Plaza, Purificación, et al. “An Overview of the Kjeldahl Method of Nitrogen Determination. Part I.” Critical Reviews in Analytical Chemistry 43, no. 4 (2013): 178–223.
https://doi.org/10.1080/10408347.2012.751786$$
),
(
    'a3ded352-08bd-4aa5-b1f4-88e850892395',
    'Joseph Williams Lovibond Introduces the Tintometer',
    $$In 1887, Salisbury brewer and maltster Joseph Williams Lovibond introduced the Tintometer, an instrument that compared a sample with combinations of calibrated colored-glass standards. His work began with a brewery quality problem: judging beer color by eye was subjective, yet consistent color was a useful sign of consistent materials and process.

Lovibond secured a British patent in 1886 and a corresponding United States patent in 1887 for apparatus that standardized and measured color intensity. His glass standards and instruments helped turn color comparison into a repeatable measurement used well beyond brewing. The later brewing notation °L descends from Lovibond standards, but it should not be confused with every feature of his original three-color Tintometer system.$$,
    '1887-01-01', 'year', 'People',
    $$Lovibond, Joseph Williams. “Colorimeter.” U.S. Patent 363,835, issued May 31, 1887.
https://patents.google.com/patent/US363835A/en

Smithsonian National Museum of American History. “Lovibond Tintometer.”
https://americanhistory.si.edu/collections/object/nmah_381

The Brewery History Society. “The Lovibond Family and Their Breweries.” Newsletter 87 (December 2019).
https://www.breweryhistory.com/newsletter/NL087_Dec2019forwebsite.pdf$$
),
(
    '4ef27715-bc43-47f2-9a8c-1cfaf9bddfad',
    'Ernest Stanley Salmon Selects the Hop Later Released as Brewer’s Gold',
    $$In 1919, Ernest Stanley Salmon selected seedling C9a in the hop-breeding program at Wye College in Kent. Its maternal plant, BB1, came from a wild hop collected near Morden, Manitoba, and had been pollinated by an English male. Salmon was seeking useful traits through systematic crossing and long-term field evaluation rather than relying only on established English varieties.

After years of trials, C9a was released in 1934 as Brewer’s Gold. Its comparatively high alpha-acid potential and mixed North American–European ancestry made it an important breeding resource. Brewer’s Gold entered the pedigrees of many later bittering cultivars, although individual descendant relationships require cultivar-specific evidence.$$,
    '1919-01-01', 'year', 'People',
    $$Salmon, E. S. “Two New Hops: Brewer’s Favourite and Brewer’s Gold.” Journal of the South-Eastern Agricultural College 34 (1934): 93–105.

United States Department of Agriculture, Agricultural Research Service. “Brewer’s Gold (19001).”
https://www.ars.usda.gov/ARSUserFiles/2450/hopcultivars/19001.html

Patzak, Josef, et al. “Phytochemical Characterization of Wild Hops Germplasm Resources from the Maritimes Region of Canada.” Frontiers in Plant Science 10 (2019).
https://doi.org/10.3389/fpls.2019.01438$$
),
(
    'cbf857ff-f79e-463c-acb4-4908772c5ef1',
    'Peter Hemings Takes Charge of Brewing and Malting at Monticello',
    $$In 1813, Peter Hemings, an enslaved craftsman at Monticello, learned brewing and assumed responsibility for its brewing and malting operations. Surviving letters record Thomas Jefferson’s judgment that Hemings learned the work “with entire success” and was capable of instructing another brewer.

Hemings’s responsibilities joined several skilled occupations: he had already worked as a cook and later also practiced tailoring. The documentary record identifies him as the person directing Monticello’s beer and malt production, while also making clear that his labor and expertise were controlled under slavery. The evidence supports his skill and authority within the operation without requiring an unsupported claim that he was the first Black brewer in the United States.$$,
    '1813-01-01', 'year', 'People',
    $$Thomas Jefferson Foundation. “Peter Hemings.” Monticello Encyclopedia.
https://www.monticello.org/encyclopedia/peter-hemings

Thomas Jefferson to James Madison, April 11, 1820. Founders Online, National Archives.
https://founders.archives.gov/documents/Jefferson/03-15-02-0497$$
),
(
    'f2034e4c-3315-4d90-bc26-d6b38124d7ac',
    'Jack McAuliffe, Suzy Denison, and Jane Zimmerman Found New Albion Brewing Company',
    $$In October 1976, Jack McAuliffe, Suzanne “Suzy” Denison, and Jane Zimmerman founded New Albion Brewing Company in Sonoma, California. McAuliffe brought brewing plans and equipment-building experience; Denison and Zimmerman supplied capital and shared the work required to establish the small brewery. Denison’s surviving oral history describes securing permits, construction, brewing, and deliveries among her responsibilities.

New Albion began production in 1977 with improvised, small-scale equipment and closed in 1982 after struggling to finance expansion. It is widely treated as a foundational modern American microbrewery because it demonstrated a post-Prohibition model for very small, independently operated production and influenced later brewers. That significance belongs to the three founders and their collaborators, not to McAuliffe alone.$$,
    '1976-10-01', 'month', 'People',
    $$Smithsonian National Museum of American History. “Oral History Interview with Suzanne ‘Suzy’ Denison.” American Beer Brewing Oral History Collection.
https://americanhistory.si.edu/collections/archival-item/sova-nmah-ac-1595-ref27

Smithsonian National Museum of American History. American Beer Brewing Oral History Collection, finding aid.
https://sirismm.si.edu/EADpdfs/NMAH.AC.1595.pdf

Elzinga, Kenneth G., Carol Horton Tremblay, and Victor J. Tremblay. “Craft Beer in the United States: History, Numbers, and Geography.” Journal of Wine Economics 10, no. 3 (2015): 242–274.
https://doi.org/10.1017/jwe.2015.22$$
),
(
    'df9186f6-4a95-4a32-9510-352669b0d478',
    'Seibei Nakagawa Brings German Lager Training to the Kaitakushi Brewery',
    $$In September 1876, the government-run Kaitakushi Beer Brewery opened in Sapporo with Seibei Nakagawa as its technical brewer. Nakagawa had completed 26 months of brewing and malting training at the Berliner Brauerei-Gesellschaft’s Fürstenwalde works before returning to Japan in 1875.

Nakagawa applied that training to brewery planning, equipment and raw-material decisions, and cold fermentation. His explanation that lager brewing required abundant ice and a cool climate helped support the decision to build in Hokkaido rather than Tokyo. The episode is a well-documented transfer of German brewing knowledge into Japan’s emerging industrial beer sector, without depending on a disputed “first Japanese brewer” label.$$,
    '1876-09-01', 'month', 'People',
    $$Sapporo Breweries. “1876 Kaitakushi Brewery Opens.”
https://www.sapporobeer.jp/english/company/history/1876.html

Sapporo Beer Museum. “Second Floor Gallery.”
https://www.sapporobeer.jp/brewery/s_museum/pdf/2ndfloor_gallery_english.pdf

Hunter, Janet, and Cornelia Storz, eds. Institutional and Technological Change in Japan’s Economy: Past and Present. Routledge, 2006.
https://www.econstor.eu/bitstream/10419/251151/1/9780203028018.pdf$$
),
(
    '4251f518-0277-45d8-af09-578634e5ec42',
    'James Squire Produces Hops from a Vine Cultivated in New South Wales',
    $$In 1806, brewer, publican, and farmer James Squire produced hops from a vine cultivated near his brewery at Kissing Point in New South Wales. The surviving historical account describes a single productive vine that became the basis of a plantation reaching about five acres and producing roughly 1,500 pounds of hops by 1812.

Squire’s cultivation mattered because imported ingredients were expensive and uncertain in the young colony. Locally grown hops helped connect agriculture with a more regular local brewing trade. The evidence makes Squire an early and demonstrably successful Australian hop grower; it does not require treating every broader claim about absolute priority as settled.$$,
    '1806-01-01', 'year', 'People',
    $$Walsh, G. P. “Squire, James (1754–1822).” Australian Dictionary of Biography, National Centre of Biography, Australian National University.
https://adb.anu.edu.au/biography/squire-james-2688

Historical Records of Australia, Series I, Volume 5.
https://nla.gov.au/nla.obj-2713828065

Sydney Gazette and New South Wales Advertiser, May 21, 1812. National Library of Australia, Trove.
https://trove.nla.gov.au/newspaper/title/3$$
),
(
    '9b6c786c-fb4f-4e72-a0f6-564855e221e9',
    'Pauline Sabin Organizes Women for Prohibition Reform',
    $$In May 1929, Pauline Morton Sabin founded the Women’s Organization for National Prohibition Reform in Chicago. A Republican organizer who had once supported Prohibition, Sabin argued that weak enforcement and widespread evasion were fostering lawlessness and disrespect for government rather than protecting families.

The organization challenged the claim that American women spoke with one voice for continued Prohibition. It built a national volunteer network that mobilized women for repeal and became a prominent part of the broader anti-Prohibition coalition. Its advocacy contributed to the political climate for the Twenty-first Amendment, but neither Sabin nor her organization alone caused repeal.$$,
    '1929-05-01', 'month', 'People',
    $$Library of Congress. “Women’s Organization for National Prohibition Reform Records.”
https://findingaids.loc.gov/repositories/19/resources/5047

Hagley Museum and Library. “Women’s Organization for National Prohibition Reform.”
https://www.hagley.org/research/news/hagley-vault/today-were-joining-women-womens-organization-national-prohibition-reform

Neumann, Caryn E. “The End of Gender Solidarity: The History of the Women’s Organization for National Prohibition Reform in the United States, 1929–1933.” Journal of Women’s History 9, no. 2 (1997): 31–51.
https://doi.org/10.1353/jowh.2010.0492$$
),
(
    '657788fa-66d6-49a2-8198-b7c586ef66f7',
    'Leopold Nathan and Hans Bolze Patent an Enclosed Brewing System',
    $$In 1908, Leopold Nathan and Hans Bolze received a United States patent for beer-brewing apparatus designed around closed, sterilizable vessels and controlled transfers. Nathan’s wider system integrated fermentation and conditioning while limiting contact with air and contamination. Its vessels used cylindrical bodies with tapered lower sections that aided sediment collection and removal.

Nathan’s work was an important early stage in the development of enclosed vertical fermentation technology. Later cylindroconical tanks adopted related geometry and operational advantages, but modern CCT practice emerged through further changes in vessel scale, cooling, cleaning, pressure control, and process design. The patent therefore marks a significant precursor, not the solitary invention of the modern CCT.$$,
    '1908-09-29', 'date', 'People',
    $$Nathan, Leopold, and Hans Bolze. “Beer Brewing.” U.S. Patent 899,756, issued September 29, 1908.
https://patents.google.com/patent/US899756

Nathan, Leopold. “Art of Brewing Beer.” U.S. Patent 1,280,280, issued October 1, 1918.
https://patents.google.com/patent/US1280280A/en

Briggs, Dennis E., et al. Brewing: Science and Practice. Woodhead Publishing, 2004.$$
),
(
    'afc9089d-bf46-4811-894f-6b863d9418a3',
    'Susannah Oland Buys Out a Brewery Partner and Joins Her Sons in Management',
    $$In 1877, Susannah Oland used an inheritance to buy George Fraser’s interest in the Nova Scotia brewery operated by Fraser, Oland and Company. The partnership was reorganized as S. Oland, Sons and Company, formally placing her name and capital at the center of the family business she managed with her sons.

Family tradition attributes the brewery’s original ale recipe to Susannah, but little evidence survives of her operational role before her husband’s death in 1870. The firmer 1877 record documents investment, ownership, and management rather than a romanticized lone-founder story. Her intervention helped stabilize an Oland enterprise that survived an 1878 fire and became part of a long Canadian brewing dynasty.$$,
    '1877-01-01', 'year', 'People',
    $$Cahill, Barry. “Oland, John Culverwell.” Dictionary of Canadian Biography, vol. 16.
https://www.biographi.ca/en/bio/9092

Guildford, Janet. “Whate’er the Duty of the Hour Demands: The Work of Middle-Class Women in Halifax, 1840–1880.” Histoire sociale/Social History 39, no. 77 (2006): 1–25.
https://hssh.journals.yorku.ca/index.php/hssh/article/download/4726/3920/4588

Nova Scotia Archives. “Oland and Son Limited fonds.”
https://archives.novascotia.ca/$$
),
(
    '6b47b7e8-fb88-454b-bcd1-5f38362e02e3',
    'Horace T. Brown Helps Form Burton’s Bacterium Club',
    $$In 1876, brewery chemist Horace Tabberer Brown joined other Burton-on-Trent scientists in forming the Bacterium Club. The group provided a forum for investigating microorganisms and other technical problems at a time when chemistry and microbiology were becoming increasingly important to producing stable, reproducible beer.

The Bacterium Club developed into the Laboratory Club in 1886 and helped prepare the institutional ground for the Institute of Brewing in 1890. Brown went on to publish influential research on fermentation, carbohydrates, water, and barley. The 1876 meeting is therefore a defensible milestone for both his career and the emergence of organized professional brewing science in Britain.$$,
    '1876-01-01', 'year', 'People',
    $$Brown, Horace T. “Scientific Method in Brewing Practice.” Journal of the Institute of Brewing 22 (1916): 257–277.
https://www.ibd.org.uk/media/uzcihpyi/horace-brown-1916.pdf

Garfield, Simon. “Johann Peter Griess FRS (1829–88): Victorian Brewer and Synthetic Dye Chemist.” Notes and Records of the Royal Society 70, no. 1 (2016): 65–80.
https://doi.org/10.1098/rsnr.2015.0050

Institute of Brewing and Distilling. “Our History.”
https://www.ibd.org.uk/about-us/our-history/$$
),
(
    '53c1f1b7-b26b-4dd2-8985-2fb38a5c3271',
    'John Ewald Siebel Establishes a Zymotechnic Institute in Chicago',
    $$In 1868, German-trained chemist John Ewald Siebel founded John E. Siebel’s Chemical Laboratory and the Zymotechnic Institute in Chicago. “Zymotechnic” referred to the applied science of fermentation: the enterprise combined chemical analysis, investigation, and instruction for brewing and other fermentation industries.

The laboratory soon developed into a research station and brewing school, and its name changed as the institution evolved. By bringing laboratory service and formal technical education together, Siebel helped create a durable base for professional brewing education in the United States. Calling the 1868 organization by its later modern name would obscure that institutional development.$$,
    '1868-01-01', 'year', 'People',
    $$Siebel Institute of Technology. “The Siebel Institute of Technology History, Part 1: John Ewald Siebel.”
https://www.siebelinstitute.com/news/school-news/the-siebel-institute-of-technology-history-part-1-john-ewald-siebel-lifes

Hannafan, John. “The Siebel Institute of Technology History.” MBAA Technical Quarterly 57, no. 4 (2020).
https://doi.org/10.1094/TQ-57-4-1204-01

Chicago Magazine. “A Short History of Siebel: Chicago’s Beer School.” June 21, 2011.
https://www.chicagomag.com/chicago-magazine/july-2011/chicagos-best-craft-beer-a-short-history-of-siebel-chicagos-beer-school/$$
),
(
    '1860ca10-d2cc-4982-b20c-337e3e2169bb',
    'Fred Eckhardt Publishes A Treatise on Lager Beers',
    $$In 1970, Portland writer and homebrewer Fred Eckhardt published A Treatise on Lager Beers, a compact manual for Americans and Canadians making beer at home. Written when federal law still had not restored an explicit homebrewing exemption, it translated brewing procedure into practical guidance for hobbyists working outside professional breweries.

The book circulated through a small but growing homebrewing culture and became an early reference point for the movement that preceded federal legalization in 1978. Eckhardt later expanded his influence as a beer and sake writer, educator, judge, and advocate. The Treatise is best described as an influential early modern American homebrewing book, not as an uncontested first.$$,
    '1970-01-01', 'year', 'People',
    $$Eckhardt, Fred. A Treatise on Lager Beers: How to Make Good Beer at Home. Portland, OR: Hobby Winemaker, 1970. Library of Congress Control Number 70147918.
https://lccn.loc.gov/70147918

Oregon State University Libraries, Special Collections and Archives Research Center. “Fred Eckhardt Oral History Interview.” Oregon Hops and Brewing Archives.
https://scarc.library.oregonstate.edu/ohba.html

Elzinga, Kenneth G., Carol Horton Tremblay, and Victor J. Tremblay. “Craft Beer in the United States: History, Numbers, and Geography.” Journal of Wine Economics 10, no. 3 (2015): 242–274.
https://doi.org/10.1017/jwe.2015.22$$
);

WITH event_tag_names (event_id, tag_name) AS (
    VALUES
    ('39915d61-b1db-4091-8582-c9c24720f73b','People'), ('39915d61-b1db-4091-8582-c9c24720f73b','Guinness'), ('39915d61-b1db-4091-8582-c9c24720f73b','Brewing Science'), ('39915d61-b1db-4091-8582-c9c24720f73b','Measurement'), ('39915d61-b1db-4091-8582-c9c24720f73b','Quality Control'), ('39915d61-b1db-4091-8582-c9c24720f73b','Ireland'),
    ('bcc21c2d-2d5a-4fc7-b72e-6a7e7ac584ea','People'), ('bcc21c2d-2d5a-4fc7-b72e-6a7e7ac584ea','Carlsberg'), ('bcc21c2d-2d5a-4fc7-b72e-6a7e7ac584ea','Brewing Science'), ('bcc21c2d-2d5a-4fc7-b72e-6a7e7ac584ea','Science'), ('bcc21c2d-2d5a-4fc7-b72e-6a7e7ac584ea','Quality Control'), ('bcc21c2d-2d5a-4fc7-b72e-6a7e7ac584ea','Denmark'),
    ('9be64ee1-501d-475a-8738-f49870cd182a','People'), ('9be64ee1-501d-475a-8738-f49870cd182a','Carlsberg'), ('9be64ee1-501d-475a-8738-f49870cd182a','Brewing Science'), ('9be64ee1-501d-475a-8738-f49870cd182a','Measurement'), ('9be64ee1-501d-475a-8738-f49870cd182a','Quality Control'), ('9be64ee1-501d-475a-8738-f49870cd182a','Malt'), ('9be64ee1-501d-475a-8738-f49870cd182a','Denmark'),
    ('a3ded352-08bd-4aa5-b1f4-88e850892395','People'), ('a3ded352-08bd-4aa5-b1f4-88e850892395','Brewing Science'), ('a3ded352-08bd-4aa5-b1f4-88e850892395','Measurement'), ('a3ded352-08bd-4aa5-b1f4-88e850892395','Quality Control'), ('a3ded352-08bd-4aa5-b1f4-88e850892395','Malt'), ('a3ded352-08bd-4aa5-b1f4-88e850892395','United Kingdom'),
    ('4ef27715-bc43-47f2-9a8c-1cfaf9bddfad','People'), ('4ef27715-bc43-47f2-9a8c-1cfaf9bddfad','Hops'), ('4ef27715-bc43-47f2-9a8c-1cfaf9bddfad','Science'), ('4ef27715-bc43-47f2-9a8c-1cfaf9bddfad','United Kingdom'),
    ('cbf857ff-f79e-463c-acb4-4908772c5ef1','People'), ('cbf857ff-f79e-463c-acb4-4908772c5ef1','USA'),
    ('f2034e4c-3315-4d90-bc26-d6b38124d7ac','People'), ('f2034e4c-3315-4d90-bc26-d6b38124d7ac','USA'), ('f2034e4c-3315-4d90-bc26-d6b38124d7ac','Breweries'), ('f2034e4c-3315-4d90-bc26-d6b38124d7ac','Modern Craft Beer'), ('f2034e4c-3315-4d90-bc26-d6b38124d7ac','Homebrewing'),
    ('df9186f6-4a95-4a32-9510-352669b0d478','People'), ('df9186f6-4a95-4a32-9510-352669b0d478','Japan'), ('df9186f6-4a95-4a32-9510-352669b0d478','Lager'), ('df9186f6-4a95-4a32-9510-352669b0d478','Brewing Science'),
    ('4251f518-0277-45d8-af09-578634e5ec42','People'), ('4251f518-0277-45d8-af09-578634e5ec42','Australia'), ('4251f518-0277-45d8-af09-578634e5ec42','Hops'),
    ('9b6c786c-fb4f-4e72-a0f6-564855e221e9','People'), ('9b6c786c-fb4f-4e72-a0f6-564855e221e9','USA'), ('9b6c786c-fb4f-4e72-a0f6-564855e221e9','Laws'), ('9b6c786c-fb4f-4e72-a0f6-564855e221e9','Prohibition'), ('9b6c786c-fb4f-4e72-a0f6-564855e221e9','Women in Beer History'), ('9b6c786c-fb4f-4e72-a0f6-564855e221e9','Temperance'),
    ('657788fa-66d6-49a2-8198-b7c586ef66f7','People'), ('657788fa-66d6-49a2-8198-b7c586ef66f7','Brewing Science'), ('657788fa-66d6-49a2-8198-b7c586ef66f7','Fermentation'), ('657788fa-66d6-49a2-8198-b7c586ef66f7','Containers'),
    ('afc9089d-bf46-4811-894f-6b863d9418a3','People'), ('afc9089d-bf46-4811-894f-6b863d9418a3','Canada'), ('afc9089d-bf46-4811-894f-6b863d9418a3','Women in Beer History'), ('afc9089d-bf46-4811-894f-6b863d9418a3','Breweries'),
    ('6b47b7e8-fb88-454b-bcd1-5f38362e02e3','People'), ('6b47b7e8-fb88-454b-bcd1-5f38362e02e3','United Kingdom'), ('6b47b7e8-fb88-454b-bcd1-5f38362e02e3','Burton-on-Trent'), ('6b47b7e8-fb88-454b-bcd1-5f38362e02e3','Brewing Science'), ('6b47b7e8-fb88-454b-bcd1-5f38362e02e3','Fermentation'), ('6b47b7e8-fb88-454b-bcd1-5f38362e02e3','Quality Control'),
    ('53c1f1b7-b26b-4dd2-8985-2fb38a5c3271','People'), ('53c1f1b7-b26b-4dd2-8985-2fb38a5c3271','USA'), ('53c1f1b7-b26b-4dd2-8985-2fb38a5c3271','Chicago'), ('53c1f1b7-b26b-4dd2-8985-2fb38a5c3271','Brewing Science'), ('53c1f1b7-b26b-4dd2-8985-2fb38a5c3271','Brewing Education'),
    ('1860ca10-d2cc-4982-b20c-337e3e2169bb','People'), ('1860ca10-d2cc-4982-b20c-337e3e2169bb','USA'), ('1860ca10-d2cc-4982-b20c-337e3e2169bb','Homebrewing'), ('1860ca10-d2cc-4982-b20c-337e3e2169bb','Modern Craft Beer'), ('1860ca10-d2cc-4982-b20c-337e3e2169bb','Beer Writing')
)
INSERT INTO event_tags (event_id, tag_id)
SELECT event_tag_names.event_id::uuid, tags.id
FROM event_tag_names
JOIN tags ON tags.name = event_tag_names.tag_name
ON CONFLICT DO NOTHING;

COMMIT;

-- Read-only verification queries to run after manual execution.

SELECT id, title, event_date, date_precision, category
FROM events
WHERE id IN (
    '39915d61-b1db-4091-8582-c9c24720f73b','bcc21c2d-2d5a-4fc7-b72e-6a7e7ac584ea','9be64ee1-501d-475a-8738-f49870cd182a','a3ded352-08bd-4aa5-b1f4-88e850892395','4ef27715-bc43-47f2-9a8c-1cfaf9bddfad','cbf857ff-f79e-463c-acb4-4908772c5ef1','f2034e4c-3315-4d90-bc26-d6b38124d7ac','df9186f6-4a95-4a32-9510-352669b0d478','4251f518-0277-45d8-af09-578634e5ec42','9b6c786c-fb4f-4e72-a0f6-564855e221e9','657788fa-66d6-49a2-8198-b7c586ef66f7','afc9089d-bf46-4811-894f-6b863d9418a3','6b47b7e8-fb88-454b-bcd1-5f38362e02e3','53c1f1b7-b26b-4dd2-8985-2fb38a5c3271','1860ca10-d2cc-4982-b20c-337e3e2169bb'
)
ORDER BY event_date, title;

SELECT e.id, e.title, array_agg(t.name ORDER BY t.name) AS tags
FROM events e
JOIN event_tags et ON et.event_id = e.id
JOIN tags t ON t.id = et.tag_id
WHERE e.id IN (
    '39915d61-b1db-4091-8582-c9c24720f73b','bcc21c2d-2d5a-4fc7-b72e-6a7e7ac584ea','9be64ee1-501d-475a-8738-f49870cd182a','a3ded352-08bd-4aa5-b1f4-88e850892395','4ef27715-bc43-47f2-9a8c-1cfaf9bddfad','cbf857ff-f79e-463c-acb4-4908772c5ef1','f2034e4c-3315-4d90-bc26-d6b38124d7ac','df9186f6-4a95-4a32-9510-352669b0d478','4251f518-0277-45d8-af09-578634e5ec42','9b6c786c-fb4f-4e72-a0f6-564855e221e9','657788fa-66d6-49a2-8198-b7c586ef66f7','afc9089d-bf46-4811-894f-6b863d9418a3','6b47b7e8-fb88-454b-bcd1-5f38362e02e3','53c1f1b7-b26b-4dd2-8985-2fb38a5c3271','1860ca10-d2cc-4982-b20c-337e3e2169bb'
)
GROUP BY e.id, e.title
ORDER BY e.title;

SELECT name, count(*)
FROM tags
WHERE name IN ('Australia','Japan','Beer Writing','Brewing Education')
GROUP BY name
HAVING count(*) <> 1;
