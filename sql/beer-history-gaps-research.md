# Beer Chronicles: history gaps research and editorial proposal

Prepared September 5, 2026. **Execution update: the user explicitly approved the backup, exact SQL execution, verification, and rebuild/deployment bundle. The transaction subsequently committed seven new entries, four enrichments, and one existing-date correction.** The research and original proposal-stage verification below are retained as the review record; their unexecuted/pending statements describe that earlier stage. See the execution record at the end for the applied state.

## Complete-corpus duplicate audit

The canonical live `https://beer-chronicles.org/timeline-data.json` contained **537 active entries**. A fresh read-only public Supabase retrieval returned **549 total records, including 12 archived records**, with a complete `0–548/549` range, plus all **195 canonical tags**. Active UUIDs and all editorial fields in the live payload and database matched exactly. The entire corpus was searched across titles, full descriptions, and sources, including former company names, translations, technologies, alternative spellings, date variants, and broad regional/style terms. Plausible matches were read in full. Archived records were checked to avoid resurrecting an existing event under a new identity.

Search families included Miller/Lite/Meister Brau/light beer; Asahi/Super Dry/karakuchi/Japan; Artois/Piedboeuf/Interbrew/InBev/AB InBev/AmBev/Brahma/Antarctica/Quilmes; Dai-Nippon/Dainippon/Osaka/Nippon/Sapporo; rice/maize/corn/adjunct/six-row/Budweiser/American lager; Cuauhtémoc/Modelo/Mexico/Latin America; Baltic/porter/stout/Russia/imperial/Stockholm/Gothenburg/Lorent/Carnegie; Sahti/juniper/farmhouse/kveik; analytical/flavor/flavour/sensory/chromatography/density/oxygen/PCR/microbiology; Weihenstephan/Lintner/VLB/Siebel/Doemens/school/education; and hop pellets/extracts/CO₂/harvesting/storage.

Fresh live Storyline pages were inspected along with their member entries. Counts below are distinct published event UUIDs present in the retrieved pages; overlaps between Storylines are intentional.

| Storyline | Published entries |
|---|---:|
| [advertising-branding-and-consumer-culture](https://beer-chronicles.org/storylines/advertising-branding-and-consumer-culture/) | 21 |
| [beer-laws-and-regulation](https://beer-chronicles.org/storylines/beer-laws-and-regulation/) | 53 |
| [brewing-empires-and-industry-consolidation](https://beer-chronicles.org/storylines/brewing-empires-and-industry-consolidation/) | 7 |
| [competitions-judging-and-style-taxonomy](https://beer-chronicles.org/storylines/competitions-judging-and-style-taxonomy/) | 21 |
| [hops](https://beer-chronicles.org/storylines/hops/) | 22 |
| [lager](https://beer-chronicles.org/storylines/lager/) | 71 |
| [malt](https://beer-chronicles.org/storylines/malt/) | 28 |
| [measurement-and-quality-control](https://beer-chronicles.org/storylines/measurement-and-quality-control/) | 22 |
| [pilsner](https://beer-chronicles.org/storylines/pilsner/) | 46 |
| [porter-stout-and-guinness](https://beer-chronicles.org/storylines/porter-stout-and-guinness/) | 33 |
| [vienna-lager](https://beer-chronicles.org/storylines/vienna-lager/) | 10 |
| [yeast](https://beer-chronicles.org/storylines/yeast/) | 13 |

There is no standalone published Storyline named “Living Fermentation Traditions” or “Brewing Education” in the current Storyline configuration. Their canonical tags and tagged records were checked across the full timeline. No new Storylines are proposed.

## Decisions for all twelve topic groups

| Requested topic | Decision and conceptual-duplicate reasoning |
|---|---|
| Miller Lite | Enrich the existing 1975 advertising/national-rollout entry. Its full text already explains category creation, positioning, celebrity advertising, and regional tests. Add the 1972 acquisition and reformulation context; add Lager. No second “light-beer revolution” entry. |
| Asahi Super Dry | Enrich the existing March 1987 entry with No. 318 yeast and the February 1988 competitor launches; add Lager. Preserve consumer-research and process-control context. No duplicate launch or separate “dry wars” event. |
| Global brewing groups | Add only the July 1, 1999 AmBev controlling-shareholder combination. Enrich the existing 2004 InBev event with the 1987 Belgian background. The 2008 and 2016 events already explain their transactions and regulatory consequences and stay unchanged. |
| Dai-Nippon formation | Add March 1906. The existing 1876 Nakagawa/Kaitakushi event explains technical knowledge transfer but does not cover national ownership consolidation. |
| Dai-Nippon breakup | Add September 1949. State-imposed postwar deconcentration is historically distinct from the 1906 private combination. Identify Nippon Breweries correctly; the Sapporo company name came later. |
| American rice/maize adjuncts | Enrich Budweiser’s existing 1876 launch. Explain the rice recipe, Conrad, six-row malt, and broader adjunct adaptation. No invented “first use of rice,” generic undated entry, or separate corn event. |
| Latin American industrial brewing | Merge the selected consolidation transition into the new AmBev event and its Quinsa/Quilmes background. Existing Mexican Vienna-lager and Modelo entries already explain immigration, regional adaptation, and an important industrial product. Do not append a list of famous brewery foundations. |
| Baltic porter | Add documented local production at Lorentska, Gothenburg, in 1817. Existing 1795 and 1844 entries cover British exports and imperial-stout terminology, not establishment of northern European production. Avoid claiming that a modern bottom-fermented style was invented in 1817. |
| Sahti | No new entry. Correct the existing registration event from February 9 to March 1, 2002, and explain adoption/publication/effective dates. Preserve its living-farmhouse account. |
| Post-1950 analysis | Add 1978 ASBC digital-density method and 1979 international flavor terminology. They document two different changes in routine quality control: instrumental measurement and standardized human sensory description. No list of loosely dated GC, oxygen-meter, or molecular “firsts.” |
| Formal education | Add only the 1865 dedicated Weihenstephan course. Existing Poupě and Siebel entries already supply informal practical-scientific teaching and the American laboratory/school model. VLB and Doemens are relevant institutions, but another foundation sequence is not needed for this selected arc. |
| Modern hop processing | No changes. The recent 1973 Žatec pellet and 1980 Australian liquid-CO₂ entries already explain distinct processing transitions. The 1941 Yakima mechanization and 2009 Torpedo entries cover harvesting and a later dosing application. |

## Existing-event overlap register

Every identifier below was matched against the current full record. The decisions do not depend solely on a similar title.

- **Miller Lite Launches the “Tastes Great, Less Filling” Campaign** — `e37b2c89-f38e-4a6e-9020-d266cf91b8c7`. Enrich; same commercial transition, retain UUID/title/date.
- **Asahi Super Dry Triggers Japan’s Dry-Beer Boom** — `c36c96a3-571d-40be-8a7e-31db54e05b71`. Enrich and add Lager; same product launch.
- **Interbrew and AmBev Combine to Create InBev** — `d5c76557-68bb-425b-bde6-fe17fd3af063`. Enrich with 1987 background; add Belgium and Brazil.
- **InBev Acquires Anheuser-Busch** — `7002888d-fb14-4106-be2f-65a398c1e644`. Leave unchanged: acquisition and antitrust consequences already covered.
- **AB InBev Completes Its Acquisition of SABMiller** — `b22cc46b-5e52-4f97-bb96-1e026a006531`. Leave unchanged: later global combination already covered.
- **South African Breweries Acquires Miller to Form SABMiller** — `15086b28-c388-42fa-8879-6a9512fb11d0`. Leave unchanged: explains the distinct SABMiller branch of consolidation.
- **Seibei Nakagawa Brings German Lager Training to the Kaitakushi Brewery** — `df9186f6-4a95-4a32-9510-352669b0d478`. Leave unchanged: 1876 technical training transfer is distinct from 1906/1949 ownership changes.
- **Beer Brewed Under The Name “Budweiser”** — `d06337d4-6c23-4b62-9a3b-4e7c896a66dd`. Enrich with American adjunct brewing; add Adjuncts.
- **Lager Beers Take Over In The US** — `75f744f8-353f-483c-9b09-3ce3b083b9f8`. Leave unchanged: broad 1870s lager adoption; Budweiser is the concrete adjunct example.
- **Vienna Lager Survives In Mexico** — `eef3d3d2-4314-4e69-bf39-f48f391a1269`. Leave unchanged: immigrant knowledge transfer and Mexican adaptation already covered.
- **Negra Modelo Is First Brewed** — `5f8ce0f2-5adf-4fb1-b5f7-3f9983ae1fc4`. Leave unchanged: Modelo opening/product and classification caveat already covered.
- **Thrale & Co. Exports Strong Porter to Russia’s Imperial Court** — `d1840135-89ba-46a1-9979-7b80c85e51fc`. Leave unchanged: London export evidence, distinct from local Swedish production.
- **Barclay Perkins Advertises Imperial Double Brown Stout** — `95733e20-eefc-47f6-a170-2b1ab4b97790`. Leave unchanged: imperial-stout advertising/terminology, distinct from local porter production.
- **The European Union Registers Sahti as a Traditional Speciality Guaranteed** — `5179a898-46e1-4248-ab99-0a55925cd2bb`. Correct effective date and source wording; preserve the tradition description.
- **Genomic Research Identifies Kveik as a Distinct Domesticated Yeast Group** — `7d0849dc-a8e0-4ccd-becd-620a1579c259`. Leave unchanged: Norwegian kveik genomics does not replace the existing Finnish Sahti event.
- **The American Society of Brewing Chemists Is Founded** — `81fc42e9-e588-4735-9967-da9e82f4d1fc`. Leave unchanged: ASBC institutional origins; later specific analytical methods are distinct.
- **John Ewald Siebel Establishes a Zymotechnic Institute in Chicago** — `53c1f1b7-b26b-4dd2-8985-2fb38a5c3271`. Leave unchanged: Siebel’s 1868 laboratory/institute already represented.
- **František Ondřej Poupě Establishes an Informal Brewing School in Brno** — `e9732758-c7e4-4e11-9770-853fcb6a5db5`. Leave unchanged: Poupě’s informal instruction is an earlier, different educational model.
- **Žatec Converts Its Hop-Processing Line to Type 90 Pellets** — `db044422-0cf2-4cd7-abac-cc7c093a127a`. Leave unchanged: recent pellet processing entry already covers handling/storage/dosing.
- **Carlton and United Commissions a Liquid-CO₂ Hop-Extraction Plant** — `349d595e-7b3d-4df9-9b64-c474ea18736c`. Leave unchanged: recent liquid-CO₂ extraction entry already distinguishes solvents and supercritical extraction.
- **Mechanical Hop Pickers Rapidly Replace Hand Labor in Yakima** — `ed127863-c258-421b-94ff-8ed4a79d39f5`. Leave unchanged: beer-specific hop harvesting mechanization already covered.

The new entries were also compared against one another: 1906 combination versus 1949 deconcentration are opposite institutional transitions; AmBev incorporates the relevant Latin American consolidation rather than duplicating it; 1978 density and 1979 sensory terminology measure different properties through different methods. New events contain only short earlier/later context, not another full account of an existing event.

## Source assessment and remaining uncertainty

- **Sahti:** the regulation itself was read in full. It was adopted February 8 and published February 9, 2002; Article 2 specifies the twentieth day after publication, **March 1**. The old source’s “effective February 9” wording is incorrect. No claim about an ancient origin is added.
- **Dai-Nippon:** Sapporo dates formation to March 1906 and commencement of operations to April 1. The proposal uses month precision for formation. Its 1949 account places the division in September. Asahi’s English timeline places a split item under January but the successor’s establishment under September; this disagreement is disclosed, not silently converted into a precise January decision date. September is used for the implemented separation described by Sapporo. The exact day is not asserted. Tanji’s scholarly English abstract independently corroborates the three-company merger; the Japanese article’s full text was not used for claims beyond that abstract. The attempted institutional-history book download was inaccessible and is not cited as inspected evidence.
- **AmBev:** the audited SEC filing explicitly dates controlling shareholders’ contribution to July 1, 1999, distinguishes later minority exchanges, and discusses the 2000 regulatory stage. Its April 7 approval wording differs from accounts dating the CADE decision to March 30. The event therefore does not pretend that every merger step happened on July 1 or assign an exact date to the regulatory decision. Quinsa’s 2003 combination is background, not a separate event.
- **Interbrew:** corporate histories often compress the 1987 transaction into “Interbrew formed.” AB InBev France calls the initial business Belbrew, subsequently Interbrew. The enrichment says “the business that became Interbrew,” avoiding an unsupported claim about the exact naming date.
- **Baltic porter:** Carlsberg dates Lorentska production to 1817, independently corroborated by Beernews’s report on the Gothenburg brewery museum and its surviving 1820 bottle. A business-history archive search also corroborated 1817, but its full page was blocked and is not relied upon as an inspected source. Stockholm 1774 was investigated but not retained: the inspected evidence did not establish a stronger exact milestone. BJCP expressly describes independent regional development, later changes to bottom fermentation, and the recent collective style name. Oxford’s Baltic porter article gives a simplified Carnegie account and questionable generalizations about present fermentation; these are not reproduced. Gothenburg is on Sweden’s west coast: this event represents the wider northern European porter tradition, not a claim that the city sits on the Baltic coast.
- **Density:** 1978 is independently listed for ASBC Beer-2B by Mettler Toledo and for Beer-2 by Anton Paar. The original historical method text was not accessible; this is the least direct dating evidence in the retained batch. LaBerge’s 1979 primary research abstract supplies contemporary beer-specific validation and the productivity/automation assessment. It does not establish universal industry adoption or an invention date. The date is retained at year precision with this limitation explicit.
- **Sensory analysis:** the 1979 paper’s text and author affiliations were inspected. Its joint institutional authorship is preserved instead of crediting one scientist with inventing sensory science. Oregon State corroborates lasting brewing-industry adoption. The 1979 international system is not conflated with the later ASBC-branded wheel edition. Competition judging and style guidelines already have separate entries.
- **Adjuncts:** Ogle’s historical account supplies the early Budweiser rice formulation; the Oxford excerpt independently explains six-row malt and rice/maize. Ogle’s wording about starch “absorbing” protein is not repeated; the proposed text correctly describes dilution. No exact first adjunct use, original percentage, or universal cost advantage is asserted. Later adjunct use outside American lager is already partly represented by the Nigerian sorghum and Ugandan lager entries; this proposal does not force a second generic maize/rice event.
- **Miller:** the principal inspected narrative is the detailed Molson Coors retrospective, which quotes period company material and contemporary reporting. The independent Encyclopedia of Chicago entry corroborates the 1972 brand sale in search indexing, but direct access failed; it is not added as though its full text had been inspected. Existing Smithsonian and company sources are preserved. No “first light beer” claim is made, and growth in all Miller beer is not misreported as Lite-only volume.
- **Super Dry:** Asahi’s technical history supports yeast selection; rival Kirin’s museum supports the 1987 launch, 1988 competitors, and the simultaneous economic boom. Current gene-analysis and post-2018 foam improvements are not projected back into 1987. The existing broad consumer-research statement is preserved, but the 5,000-consumer survey specifically associated with the preceding Asahi Nama project is not relabeled as a Super Dry-only survey. A quantified international impact is not added without adequate supporting evidence.
- **Education:** TUM’s anniversary account describes an initially craft-oriented, one-semester course; the academic history in Historisches Lexikon Bayerns corroborates the 1865 program and earlier teaching. The proposal does not claim university degrees or an engineering curriculum already existed in 1865. Additional VLB/Doemens foundations were not selected because the resulting arc already explains the principal transition, not because their institutions lacked historical significance.

## New entries: complete proposed text, taxonomy, and sources

### 1817-01-01 (year) — Lorentska Begins Porter Production in Gothenburg

UUID: `68a21222-c9dc-4217-a588-44e6cc1c5976`. Category: **Breweries**. Tags: Breweries, Porter, Sweden, Gothenburg.

In 1817, the Lorentska brewery began producing porter in Gothenburg, Sweden. David Carnegie took over the business in 1836, giving his name to a porter that became a lasting part of Swedish brewing. Local production illustrates how northern European brewers turned an imported British beer into a regional tradition.

The wider history of Baltic porter includes both British exports and local adaptation in Scandinavia, Finland, Poland, Russia, and neighboring markets. As lager brewing spread, many regional producers eventually adopted bottom fermentation, while others retained ale traditions. These changes occurred over generations: the Gothenburg milestone neither marks the invention of a single Baltic style nor establishes a switch to lager yeast in 1817. The collective name “Baltic porter” came much later.

**Sources**

Carlsberg Group. Carnegie Porter: production began at Lorentska in 1817; Carnegie takeover in 1836.
https://www.carlsberggroup.com/products/carnegie/carnegie-porter/

Karlsson, Ronny. “200-årig jäst grunden i nytt jubileumsöl.” Beernews, March 9, 2020; reporting on Göteborgs Bryggerimuseum’s surviving Lorents porter bottle.
https://www.beernews.se/articles/200-arig-jast-grunden-i-nytt-jubileumsol/

Beer Judge Certification Program. 2021 Beer Style Guidelines, 9C: Baltic Porter, History.
https://www.bjcp.org/style/2021/9/9C/baltic-porter/

**Beer Map:** gothenburg — City of the documented local porter production.

### 1865-01-01 (year) — Carl Lintner Establishes a Dedicated Brewing Course at Weihenstephan

UUID: `926dd3d4-8c49-4cbf-b596-ac8399a4d44d`. Category: **Science**. Tags: Science, Brewing Science, Brewing Education, Germany, Bavaria.

In 1865, Carl Lintner established a dedicated Brauer-Cursus at Weihenstephan in Bavaria. The initially one-semester course trained brewers within an educational institution and attracted students beyond Bavaria. It built on earlier combinations of practical brewery training and scientific lectures, rather than introducing scientific instruction into brewing for the first time.

The course became a foundation for Weihenstephan’s development as an international center of brewing education. Its later expansion into longer programs, laboratory work, and engineering qualifications helped make brewing a professional technical discipline. Students carried brewing knowledge into industrial breweries beyond Germany. The 1865 course was an early institutional step in this process; the later university and engineering qualifications should not be projected back onto its opening.

**Sources**

Technical University of Munich. “150 Jahre Brauwesen und Lebensmitteltechnologie in Weihenstephan.” October 15, 2015.
https://idw-online.de/de/news639503

Zarnkow, Martin, and Franz Meußdoerffer. “Bier.” Historisches Lexikon Bayerns, section on industrialization and scientific training.
https://www.historisches-lexikon-bayerns.de/Lexikon/Bier

Technical University of Munich. Interview with Martina Gastl on the Brauer Cursus Weihenstephan.
https://www.lll.tum.de/en/news/certificate-program-brauer-cursus-weihenstephan-interview/

**Beer Map:** freising — City containing Weihenstephan, where the brewing course was established.

### 1906-03-01 (month) — Three Major Japanese Brewers Combine to Form Dai-Nippon Beer

UUID: `c2469926-c733-4e68-b104-87e3dfb51974`. Category: **Breweries**. Tags: Breweries, Industry Consolidation, Japan, Lager.

In March 1906, Sapporo Beer, Nippon Beer, and Osaka Beer combined to form Dai-Nippon Beer. The new company brought the Sapporo, Yebisu, and Asahi brands under common ownership, with its head office in Tokyo. It began operations on April 1. Kirin remained outside the combination.

The merger followed intense competition among Japan’s major brewers and the introduction of beer taxation in 1901. Its organizers sought to reduce rivalry at home, develop overseas markets, and strengthen domestic supplies of ingredients and equipment. Dai-Nippon turned several major industrial breweries into a dominant national brewing organization while retaining their established brands. Its formation marked a different stage from the earlier transfer of European lager techniques to Japan; the postwar breakup would later reshape this concentrated industry.

**Sources**

Sapporo Breweries. Company History, Part 3: The Merger of Three Companies—The Birth of Dai-Nippon Beer.
https://www.sapporobreweries.com/en/who-we-are/history/history-01/

Asahi Group Holdings. Asahi Group’s History.
https://www.asahigroup-holdings.com/en/company/history/

Tanji, Yuichi. “大日本麦酒の経営と販売網” [Management and Sales Networks of Dai-Nippon Beer]. Socio-Economic History 67, no. 3 (2001): 255–278. English abstract inspected; corroborates the three-company merger and national distribution development.
https://doi.org/10.20624/sehs.67.3_255

**Beer Map:** tokyo — Head-office city of the newly combined brewing company.

### 1949-09-01 (month) — Dai-Nippon Beer Is Divided into Asahi and Nippon Breweries

UUID: `c172b78c-4ff2-4caa-8b7c-910259f20392`. Category: **Laws**. Tags: Laws, Industry Consolidation, Japan.

In September 1949, Dai-Nippon Beer was divided into Asahi Breweries and Nippon Breweries under Japan’s postwar policy against excessive economic concentration. The restructuring formed part of the economic reforms pursued during the Allied occupation. It dismantled the combined brewing organization established in 1906 and redistributed its breweries between two successor businesses.

Nippon Breweries initially promoted a new Nippon Beer brand rather than immediately restoring all its inherited names. It later revived Sapporo beer and changed its company name to Sapporo Breweries in 1964. The breakup therefore created the corporate foundations of postwar competition between Asahi and Sapporo, alongside Kirin, while the familiar modern brand landscape emerged gradually. It was a change in ownership and market organization, not the founding of the original Sapporo or Asahi brewing traditions.

**Sources**

Sapporo Breweries. Company History, Parts 4–5: The Breakup of Dai-Nippon and the Launch of Nippon Beer; Name Change—The Rebirth of Sapporo Breweries.
https://www.sapporobreweries.com/en/who-we-are/history/history-02/

Asahi Group Holdings. Asahi Group’s History.
https://www.asahigroup-holdings.com/en/company/history/

**Beer Map:** japan — Country whose postwar deconcentration policy divided the brewing company.

### 1978-01-01 (year) — ASBC Standardizes Digital Density Measurement for Beer

UUID: `245a1d93-a98e-432f-b69a-eb56e33b3051`. Category: **Science**. Tags: Science, Measurement, Quality Control, Brewing Science, USA.

In 1978, the American Society of Brewing Chemists’ Beer-2B method established digital density measurement as a standardized way to determine beer’s specific gravity. It brought an electronic laboratory technique into the shared analytical methods used by brewing laboratories, extending the much older practice of measuring wort and beer with hydrometers and pycnometers.

A Canadian Grain Commission study published in 1979 compared digital measurements with pycnometry for malt extracts and beer and found excellent agreement. It reported greater precision and productivity and the possibility of automating sampling and recording. Digital measurement thus offered a practical route toward faster, more reproducible laboratory control of brewing materials and finished beer. The milestone is a beer-specific analytical standard, not the invention of the general density meter or an assertion that every brewery adopted it in 1978.

**Sources**

Mettler Toledo. Standards and Norms for Density Meters and Refractometers: ASBC Beer-2B, Specific Gravity by Digital Density Meter (1978).
https://www.mt.com/us/en/home/perm-lp/product-organizations/ana/dere-regulations-and-standards.html

Anton Paar. Density Meters: applicable standards, ASBC Beer-2, Specific Gravity by Digital Density Meter (1978).
https://www.anton-paar.com/us-en/products/group/density-meter/

LaBerge, D. E. “Determination of Specific Gravity of Malt Extracts, Worts, and Beer.” Journal of the American Society of Brewing Chemists 37, no. 2 (1979): 105–106. Abstract.
https://doi.org/10.1094/ASBCJ-37-0105

**Beer Map:** united_states — Country of the society issuing the beer-analysis method.

### 1979-01-01 (year) — Brewing Organizations Publish a Shared Beer-Flavor Terminology

UUID: `4dd99583-d78b-452f-995f-b9a71c1bf2a1`. Category: **Science**. Tags: Science, Brewing Science, Quality Control.

In 1979, Morten Meilgaard, C. E. Dalgliesh, and J. F. Clapperton published a shared terminology for beer flavor developed by joint working groups of the European Brewery Convention, the American Society of Brewing Chemists, and the Master Brewers Association of the Americas. The system provided 44 broad terms and 78 more detailed terms, organized to help brewers identify and communicate distinct flavor notes.

The terminology and its flavor wheel gave trained tasting panels a common vocabulary across breweries and laboratories. Defined attributes helped connect sensory observations with production problems and analytical investigations, rather than reducing quality to whether a taster simply liked a beer. This was a lasting step in systematic brewery quality control, complementing chemical measurement and later sensory training. It was distinct from competition medals or rules defining beer styles.

**Sources**

Meilgaard, M. C., C. E. Dalgliesh, and J. F. Clapperton. “Beer Flavour Terminology.” Journal of the Institute of Brewing 85 (1979): 38–42.
https://doi.org/10.1002/j.2050-0416.1979.tb06826.x

Oregon State University. “Northwest Microbrew.” Oregon’s Agricultural Progress, Fall 2009; history and industry use of the Beer Flavor Wheel.
https://archive.progress.oregonstate.edu/fall-2009/northwest-microbrew

**Beer Map:** united_states — Country of Meilgaard’s Stroh Brewery affiliation in the published paper; united_kingdom — Country of Dalgliesh and Clapperton’s Brewing Research Foundation affiliation.

### 1999-07-01 (date) — Brahma and Antarctica’s Controlling Shareholders Form AmBev

UUID: `895f440c-8e6d-4bbc-acb8-0891be88f35c`. Category: **Breweries**. Tags: Breweries, Industry Consolidation, Brazil.

On July 1, 1999, the controlling shareholders of Brazil’s Brahma and Antarctica contributed their stakes to AmBev, a holding company joining two major brewing businesses. Further exchanges of minority shares and Brazilian competition approval followed during 1999–2000. The initial combination should therefore be distinguished from the later completion of its corporate and regulatory steps.

The transaction brought together longstanding Brazilian brands, breweries, and distribution businesses within a group operating across South America. AmBev subsequently expanded its regional position through its combination with Quinsa, associated with Quilmes, in 2003. This consolidation made Latin American brewing central to the next stage of global industry restructuring: AmBev combined with Belgium’s Interbrew to create InBev in 2004. The Brazilian group was a formative participant in that international expansion, not simply a collection of brands acquired after AB InBev already existed.

**Sources**

AmBev. Form 6-K, July 15, 2002, audited financial statements, Note 1: Our Group and Operations.
https://www.sec.gov/Archives/edgar/data/1113172/000111317202000018/abv15jul02.htm

AmBev Investor Relations. History: 1999–2000 formation, Quinsa combination in January 2003, and Interbrew transaction in 2004.
https://ri.ambev.com.br/en/overview/history/

**Beer Map:** brazil — Country of the Brahma–Antarctica combination.

## Existing entries: complete proposed updates

### Miller Lite Launches the “Tastes Great, Less Filling” Campaign

UUID: `e37b2c89-f38e-4a6e-9020-d266cf91b8c7`. Date: **1975-01-01**, precision year. Category: Events. Tags: Advertising, Branding, Events, Light Beer, USA, Lager.


In 1975, Miller Brewing launched Miller Lite nationally with an intensive advertising campaign built around the contrasting promises of great beer taste and a less filling drinking experience. Earlier commercials had been tested alongside the beer in regional markets beginning in 1973, but the nationwide rollout turned “Tastes Great, Less Filling” into the defining message of the new brand.

The campaign used retired athletes, entertainers, and other recognizable personalities to argue humorously over which benefit mattered more. By presenting light beer to established beer drinkers rather than primarily as a diet product, Miller helped create a major new segment of the American beer market. The long-running campaign also demonstrated the power of television, celebrity endorsement, repetition, and consumer identity in building a modern beer brand.

Miller had acquired the Lite trade name from Chicago’s Meister Brau business in 1972 and reformulated the beer before the regional tests. Earlier low-calorie beers therefore preceded Miller’s national launch. Miller’s achievement was to turn that existing product idea into a widely accepted mainstream category through brewing, distribution, and advertising. The success helped transform competition in the American lager market.

**Preserved and added sources**


Molson Coors. "Born in Chicago, Raised in Milwaukee: A New Look at the Origins of Miller Lite."
https://www.molsoncoorsblog.com/features/born-chicago-raised-milwaukee-new-look-origins-miller-lite

Molson Coors. "The Creation of Miller Lite."
https://www.molsoncoorsblog.com/features/creation-miller-lite

Molson Coors. "If You’ve Got the Time: The History of the High Life Beer Jingle."
https://www.molsoncoorsblog.com/features/if-youve-got-time-history-high-life-beer-jingle

Molson Coors. “Miller Lite’s ‘Great Taste, Less Filling’ Returns.” 2024.
https://www.molsoncoorsblog.com/miller-lite-all-stars-return

Smithsonian National Museum of American History. "Miller Lite Beer Can."
https://americanhistory.si.edu/collections/object/nmah_1297773


### Beer Brewed Under The Name “Budweiser”

UUID: `d06337d4-6c23-4b62-9a3b-4e7c896a66dd`. Date: **1876-01-01**, precision year. Category: Breweries. Tags: České Budějovice, Breweries, Branding, Pils, Lager, Czech Republic, USA, Budweiser, Adjuncts.

In 1876, Anheuser-Busch began making a beer in St. Louis under the name “Budweiser.” Adolphus Busch, Eberhard Anheuser’s son-in-law and business partner, used the name at a time when Budweiser could still be understood as a geographic or style designation connected to Budweis, the German name for České Budějovice in Bohemia.

The beer became a central American lager brand and later one of the most disputed beer names in the world. The Budweiser name connected Anheuser-Busch’s American lager to the reputation of Bohemian brewing, and it eventually led to long-running trademark conflicts with breweries from České Budějovice, including Budweiser Budvar.

The beer also exemplified an American adaptation of pale lager through rice adjuncts. Busch and his brewers developed the beer for wine and liquor merchant Carl Conrad using rice alongside barley malt. Across American brewing, rice and maize supplied starch while diluting the high protein content of domestic six-row barley malt, helping brewers produce paler, lighter-bodied beers with improved clarity. These techniques were developed before Prohibition and served brewing and market goals as well as economic ones; adjunct brewing was not simply a later cost-cutting departure from an all-malt American past.

**Preserved and added sources**

Wikipedia. "Budweiser-Streit."

https://de.wikipedia.org/wiki/Budweiser-Streit

Wikipedia. "Budweiser trademark dispute."

https://en.wikipedia.org/wiki/Budweiser_trademark_dispute

Immigrant Entrepreneurship. "Adolphus Busch."

https://www.immigrantentrepreneurship.org/entries/adolphus-busch/

Anheuser-Busch. "Heritage."

https://www.anheuser-busch.com/about/heritage

Ogle, Maureen. “Making Beer American: How Bohemian Lager Swept the Country.” All About Beer 27, no. 2, May 1, 2006.
https://allaboutbeer.com/article/making-beer-american/

Oxford University Press. “Another Lesson from Garrett Oliver: Rice in Beer.” Excerpt from The Oxford Companion to Beer, December 2, 2011.
https://blog.oup.com/2011/12/rice-in-beer/

### Asahi Super Dry Triggers Japan’s Dry-Beer Boom

UUID: `c36c96a3-571d-40be-8a7e-31db54e05b71`. Date: **1987-03-01**, precision month. Category: Styles. Tags: Styles, Japan, Quality Control, Lager.

In March 1987, Asahi Breweries launched Asahi Super Dry, presenting a highly attenuated lager through the sensory idea of karakuchi, or “dry” taste. The product’s rapid success prompted competing launches and a wider Japanese dry-beer boom; national beer consumption rose sharply during 1987.

The event shows consumer research, yeast selection, process control, and branding working together to reshape a mature lager market. Its importance is the documented market transformation, not a universal claim that no earlier beer had ever been described as dry.

Asahi selected its highly fermentative No. 318 yeast for the crisp finish associated with Super Dry. Karakuchi described that sensory positioning rather than a new fermentation category. Kirin, Suntory, and Sapporo introduced competing dry beers in February 1988. The ensuing “dry wars” made this a major competitive shift in Japan, although the wider economic boom also contributed to the growth of beer consumption.

**Preserved and added sources**

Asahi Group Holdings. “Beer Development: Asahi Super Dry.”
https://www.asahigroup-holdings.com/en/rd/product/superdry.html

Kirin Brewery. “The 1987 Dry-Beer Boom.” Kirin Museum of History.
https://museum.kirinholdings.com/history/column/bd097_1987.html

### Interbrew and AmBev Combine to Create InBev

UUID: `d5c76557-68bb-425b-bde6-fe17fd3af063`. Date: **2004-08-27**, precision date. Category: Breweries. Tags: Breweries, Industry Consolidation, Belgium, Brazil.

On August 27, 2004, Belgium’s Interbrew and Brazil’s AmBev completed their combination to form InBev. The structure connected large European, Canadian, and Latin American brewing businesses and assembled international and national brands under one corporate group.

The combination was a decisive stage in the globalization of brewery ownership. It also demonstrates that modern consolidation did not flow only outward from the United States or Europe: AmBev and its Brazilian brands were central to the new company.

The Belgian side had its own consolidation history: Artois and Piedboeuf combined in 1987 in the business that became Interbrew. Together with AmBev’s 1999 formation in Brazil, this earlier step explains how national brewing combinations supplied the building blocks for the transatlantic group, its 2008 acquisition of Anheuser-Busch, and the later SABMiller transaction.

**Preserved and added sources**

InBev. “Interbrew and AmBev Complete Combination to Establish InBev.” August 27, 2004.
https://www.ab-inbev.com/content/dam/universaltemplate/ab-inbev/news/press-releases/public/2004/8/139-ENGLISH.pdf

AmBev. Form 6-K, May 24, 2004.
https://www.sec.gov/Archives/edgar/data/1113172/000111317204000041/abv20040524_6k.htm

AB InBev France. “Patrimoine belge”: the 1987 Artois–Piedboeuf combination, initially named Belbrew and subsequently Interbrew.
https://www.ab-inbev.fr/patrimoine-belge

### The European Union Registers Sahti as a Traditional Speciality Guaranteed

UUID: `5179a898-46e1-4248-ab99-0a55925cd2bb`. Date: **2002-03-01**, precision date. Category: Laws. Tags: Laws, Finland, Sahti, Living Fermentation Traditions.

On March 1, 2002, European Commission Regulation 244/2002 entered into force, registering Sahti as a Traditional Speciality Guaranteed. The regulation had been adopted on February 8 and published on February 9. The protection tied commercial use of the name to a registered traditional method rather than to production within one narrowly bounded place.

Sahti remained a living Finnish farmhouse tradition as well as a small commercial category. Its specification preserved features such as a grain-based wort, distinctive mashing and filtration practices, juniper use in some variants, and fermentation without reducing a regionally varied household tradition to a claim of unchanged antiquity.

**Preserved and added sources**

European Commission. Commission Regulation (EC) No. 244/2002 of 8 February 2002, registering the name Sahti; published February 9, 2002; Article 2 provides for entry into force twenty days later, on March 1, 2002.
https://eur-lex.europa.eu/LexUriServ/LexUriServ.do?uri=OJ:L:2002:039:0011:0011:EN:PDF

Ekberg, Jukka, and Brian Gibson. “Physicochemical Characterization of Sahti, an ‘Ancient’ Beer Style Indigenous to Finland.” Journal of the Institute of Brewing 121, no. 3 (2015): 464–473.
https://doi.org/10.1002/jib.246

## Taxonomy, Storylines, links, and map readiness

All existing tags and sources are preserved except the explicitly corrected Sahti effective-date wording. **Brazil** is the only proposed new tag: it is a central, reusable country tag absent from the current canonical set. It is linked to the new AmBev record and existing InBev record in the same transaction. Sparse canonical tags connect the new porter to Porter/Stout/Guinness, the analytical entries to Measurement and Quality Control, and the corporate entries to Industry Consolidation. Lager is added to Miller Lite and Super Dry. Brewing Education remains an existing tag, without a new Storyline.

Eight assignments cover all seven new entries: Gothenburg city, Freising city, Tokyo city, Japan country, USA country for the ASBC method, USA and UK country scopes for the published sensory researchers’ affiliations, and Brazil country. Freising’s administrative coordinates (48.4008273, 11.7439565) were obtained from OpenStreetMap Nominatim on September 5, 2026; the marker is a city marker, not a guessed classroom/building. All other places reuse existing reviewed coordinates. The two sensory markers describe documented affiliations, not invented conference venues or a single discovery site.

The five existing records already have appropriate map coverage: Miller/USA; Super Dry/Japan; Budweiser/St. Louis; InBev/Belgium and Brazil; Sahti/Finland. The date correction propagates through the map builder from the updated event data. Absent draft events generate no markers.

Related-entry opportunities are already supported through the shared canonical tags: porter exports → Lorentska; Poupě → Weihenstephan → Siebel; Nakagawa → Dai-Nippon → postwar division → Super Dry; AmBev → InBev → AB InBev → SABMiller; saccharometry/ASBC → digital density; analytical standards → flavor terminology. No separate relationship table or unrequested Storyline mutation is included.

## SQL and publication

`sql/beer-history-gaps-proposal.sql` is the complete **unexecuted** proposal, locally saved under the repository’s ignored proposal-file convention. It uses the verified PostgreSQL schema, a transaction, fixed UUIDs, archived-inclusive UUID/title guards, locked existing rows with full stale-content checks, canonical-tag identity checks, duplicate-safe tag links, transaction verification, and post-commit read-only queries. These guards complement the conceptual audit; they cannot recognize conceptual duplicates by themselves. A rerun intentionally aborts rather than duplicating or overwriting.

The map code is prepared in `src/lib/mapLocations.ts`. Repository publication alone will not publish these entries. The user must manually apply the reviewed SQL, after which another authorized build/deployment must include the observed live records and their map assignments.

Verification completed before Git publication:

- Final read-only refresh still contained 537 active events and 195 tags, matching the audited published data; all 12 archived descriptions were also checked.
- PostgreSQL syntax: 18 statements parsed successfully with `pglast`; both PL/pgSQL blocks parsed successfully. No SQL was executed.
- Map validation: all seven proposed events produce the intended eight markers, dates, links, roles, and city/country precision; absent proposed events produce no markers. All five updated records retain existing map coverage, and the proposed Sahti date renders as March 1, 2002.
- `npm test`: 53 tests passed.
- `npm run lint`: passed.
- `npm run build`: passed, including TypeScript and static export of 593 pages using the current 537 live events. Proposed SQL data was still absent, as expected.
- `npm run typecheck`: passed.
- `npm run check:timeline-payload`: passed (537 events; 319.5 KiB gzip against the 384 KiB budget).
- `git diff --check`: passed.

The unrelated untracked editor backup `sql/modern-brewery-technology-proposal.sql~` was preserved. The local SQL proposal remains ignored and unexecuted.


## Approved execution record — September 5, 2026

The user approved the specific backup → exact SQL application → verification → timeline/map rebuild and deployment bundle in the conversation. This grants no standing permission for future backend actions. AGENTS.md and the beer-entry skill now require an explicit conversational request and affirmative answer before each described backend/Supabase action or bundle, including reads and data-reading builds. Once approved, only that scope may be executed.

- Before execution, the SQL SHA-256 matched the reviewed file: `95ddc8fba08a4c01f086f3950fbd0a99011810243cc948e2e967825e8f26c0e0`. The original SQL file was not changed or rerun.
- Created `supabase-backup/2026-09-05/beer-chronicles.dump` (543,123 bytes). Independently verified its checksum, PostgreSQL custom archive header, core tables, primary/foreign keys, and archived-versus-recorded-live counts: 549 events, 195 tags, 2,411 event-tag links. No restore was performed.
- Used the existing credential for the same Supabase project in memory, without displaying, copying to a new credential file, or committing it. The pooler connection identity was verified before the backup.
- `psql` returned success; the log confirms `INSERT 0 1` for Brazil, `INSERT 0 7` events, `UPDATE 5`, `INSERT 0 32` event-tag links, verification blocks, and `COMMIT`.
- A fresh read-only Supabase retrieval returned 556 total events (544 active) and 196 tags. All twelve affected records matched the approved title, description, date, precision, category, sources, and historical-year fields exactly.
- The initial incremental build generated 600 pages but retained an old 537-event static JSON route. Verification detected this before deployment; the generated `.next` cache was moved aside and the build repeated cleanly. The SQL transaction was not repeated.
- Clean production build passed with 600 pages. The exported timeline contains 544 active events; all twelve affected records and exact tag sets match the approved proposal. The exported map contains all affected entries and the eight intended new location assignments.
- Tests: 53 passed. ESLint, build TypeScript checks, skill validation, and `git diff --check` passed. The fresh timeline payload is 325.7 KiB gzip, below the 384 KiB budget.
- The original proposal file and unrelated editor backup remain outside Git. The verified database backup remains ignored. The execution record and explicit-approval instructions are included in the repository publication accompanying this approved deployment.
