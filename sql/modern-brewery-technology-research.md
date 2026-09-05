# Modern brewery technology: research and publication package

Prepared September 5, 2026. **Unexecuted editorial proposal: no historical records have been added, updated, or published.** The companion SQL proposes ten new events and one in-place Nathan update. Matching Beer Map assignments are prepared locally in `src/lib/mapLocations.ts`.

## Decisions across all thirteen requested topics

| Topic | Decision | Final milestone |
|---|---|---|
| 1. Nathan | Update existing event; do not duplicate | September 29, 1908 |
| 2. Clean in place | Defer standalone event; explain its enabling role in the Asahi event | No adequately established brewery adoption milestone |
| 3. Ziemann automation | Add, replacing disputed 1955 claim | Heineken installation, 1958 |
| 4. Large-scale CCVs | Add with narrower, accurate tank terminology | Asahi outdoor tanks, March 1965 |
| 5. High-gravity brewing | Add a documented application, not an invented first | Sandwalls, 1975 |
| 6. Computerized control | Add | Siemens PLC recipe system, 1983 |
| 7. Rainier unitank | Add separately | Development, 1968 |
| 8. Hop pellets | Add | Žatec conversion, 1973 |
| 9. Hop extracts | Add a liquid-CO₂ industrial milestone | Carlton and United, 1980 |
| 10. Centrifugal clarification | Defer standalone event | No adequately established adoption milestone |
| 11. Stainless steel | Add a company-specific manufacturing milestone | Ziemann complete stainless brewhouse, 1961 |
| 12. Tunnel pasteurization | Add a company-specific mechanization milestone | Sander Hansen, 1937 |
| 13. Sterile filling | Add | Krones, 1992 |

No two retained events are merged. CIP receives contextual coverage in the outdoor-tank entry, not a separately dated invention claim. Pelletization and extraction remain separate mechanical and solvent processes. Early centralized control and PLC recipe control remain separate developments. Tunnel treatment of packaged beer and sterile filling of unpasteurized beer remain separate preservation strategies.

## Duplicate audit and existing-entry extension decisions

Read the live `timeline-data.json` and public read-only Supabase records. All **527 active entries** agreed on IDs, titles, descriptions, dates, and sources; twelve archived records were also considered for exact-event risk. Searched full titles/descriptions/sources, date neighborhoods, named inventors and companies, and conceptual variants for vessels, hygiene, cooling, filtration, centrifugation, automation, hop processing, packaging, dispense, measurement, quality, and industrial production. This was a corpus-wide search, not just the four Storylines. Reviewed all timeline titles and the relevant conceptual candidates.

Verified the live Hops, Lager, Measurement and Quality Control, and Packaging/Dispense/Supply Storyline pages. They exposed respectively 20, 69, 16, and 18 event links; their subject overlap was checked against the same complete live event records. Public REST event-tag pagination was not used as a complete tag inventory: the published payload supplies the complete attached event tags. The current Storyline configuration has no standalone “Science” or “Technology” Storyline, and no industrialization Storyline matching that proposed label. Science is a category/tag. No new Storylines or tags are proposed, and advertising tags are not used merely because a manufacturer is involved.

| Existing event | Overlap and extension decision |
|---|---|
| Nathan and Bolze, 1908 (`657788fa-66d6-49a2-8198-b7c586ef66f7`) | Exact duplicate. Extend/correct in place as detailed below; SQL includes this update. |
| Refrigeration at the Vienna Brewing Congress, 1873 (`5f0294c1-7c14-4ad4-a5db-30a61f83369f`) and compressed-ammonia refrigeration, 1876 (`b9a15e3a-56b5-43e6-b5f3-7cbf2c4255ad`) | Earlier enabling technology, not postwar outdoor tank adoption. Leave unchanged; later context belongs in the new Asahi event. |
| Enzinger beer filtration, 1878 (`234e4ec0-c71e-4f15-9083-f9f16a41d1a1`) | Filter technology is not disc-stack clarification. Do not append a poorly dated centrifuge history to this inventor’s event. Leave unchanged. |
| Pasteur’s fermentation work, 1857 (`726b430e-c62f-4aa1-b923-5e0863ade1f8`) and Studies on Beer, 1876 (`f7049922-4fd0-4809-94dc-ce421b1eb10a`) | Scientific foundations, not continuous packaged-beer processing or 1992 filling equipment. Both already explain significance; leave unchanged. |
| Ayinger new brewery, 1999 (`ae654f40-f5d0-4a5b-b5dc-bcc628e49f77`) | Mentions later extensive automation. Keep the brewery-opening event focused; the 1958 and 1983 developments warrant their own dates. |
| Speidel Braumeister, 2003 (`ba0dc046-f09c-4650-a1d8-d2b2181706fe`) | Programmable small-scale brewing, distinct product and audience. Leave unchanged. |
| Asahi Super Dry, March 1987 (`c36c96a3-571d-40be-8a7e-31db54e05b71`) | Product/market milestone, not 1965 tank installations. Leave unchanged; no unsupported direct causal claim linking the tanks to Super Dry. |
| Guinness’s last wooden cask, 1963 (`0a62f1b4-c063-4c84-b9e5-d185ac22c005`) | Aluminum-keg/wooden-cask transition, not stainless brewery construction. Leave unchanged; do not reinterpret a metal-cask transition as proof of stainless tanks. |
| Owens bottle machine, 1903 (`145fc8aa-f8da-4c96-8bf5-321ea92ab1c7`) and KeyKeg, 2012 (`b3d2f0aa-d71c-4510-a60d-a28afd8bc588`) | Container manufacture and dispense/storage technology, distinct from tunnel preservation and sterile beer filling. Leave unchanged. |
| Mechanical hop harvesting, Cascade’s release, and Torpedo IPA, 2009 (`8d33eb4c-daba-48fd-af2f-91a28bf1ad32`) | Harvesting, plant breeding, and dry-hop equipment respectively; none covers pellet production or commercial CO₂ extraction. Leave unchanged. |

Generic references to filtering/unfiltered beer, modern stainless equipment, brewery openings, or industrial brewing in other entries do not recount the retained milestones. No existing entry for Siemens/Braumat, Rainier’s unitank, Sander Hansen, Krones’ 1992 filler, or the retained Ziemann milestones was found. Conceptual duplicate checks cannot be replaced by SQL title checks; repeat this editorial check if publication is substantially delayed.

## Nathan: proposed correction and enrichment

Retain the existing title, **Leopold Nathan and Hans Bolze Patent an Enclosed Brewing System**, exact date **September 29, 1908**, category **People**, UUID, all tags, and existing map assignment (United States patent jurisdiction). Retain the complete second paragraph distinguishing precursor from modern CCT adoption. Correct “Beer Brewing” to the patent’s actual title, “Process of Brewing Beer,” and replace the generic apparatus summary with its filed-1901 process, enamel-lined jacketed vessel, agitator, and fermentation/young-beer treatment. This clarifies that the grant is not an isolated claim to every later conical tank.

The existing 1918 patent citation is preserved; no new claim is based on uninspected details of that patent. Briggs’s retained book citation gains the inspected page range. The 1908 primary patent and Briggs’s discussion of Nathan support the revision. No tag or related-entry mutation is necessary: existing Brewing Science, Fermentation, Containers, and People tags already describe it.

On September 29, 1908, Leopold Nathan and Hans Bolze received U.S. Patent 899,756, “Process of Brewing Beer,” following an application filed in 1901. Their process used closed, sterilizable equipment, including an enamel-lined vessel with a heating-and-cooling jacket and an agitator. It sought to control fermentation and accelerate the treatment of young beer. Nathan’s wider work developed enclosed vertical vessels with cylindrical bodies and conical bases, connecting fermentation control with sediment removal and conditioning.

Nathan’s work was an important early stage in the development of enclosed vertical fermentation technology. Later cylindroconical tanks adopted related geometry and operational advantages, but modern CCT practice emerged through further changes in vessel scale, cooling, cleaning, pressure control, and process design. The patent therefore marks a significant precursor, not the solitary invention of the modern CCT.

Sources:

Nathan, Leopold, and Hans Bolze. “Process of Brewing Beer.” U.S. Patent 899,756, issued September 29, 1908.
https://patents.google.com/patent/US899756

Nathan, Leopold. “Art of Brewing Beer.” U.S. Patent 1,280,280, issued October 1, 1918.
https://patents.google.com/patent/US1280280A/en

Briggs, Dennis E., et al. Brewing: Science and Practice. Woodhead Publishing, 2004, pp. 514–517.

## Retained new events: text, sources, date assessment, and map

All new events use category **Science**. Dates below use year precision, except Asahi’s month precision. Stored January 1 / March 1 values are precision anchors, not claims that the event happened on that day. Descriptions and source blocks below are the same proposals supplied in SQL.

### Sander Hansen Develops an Automated Tunnel Pasteurizer — 1937

UUID: `8940c34b-36f2-47de-8a71-b756769d478b`. Tags: Science, Packaging, Pasteurization, Quality Control, Denmark.

In 1937, Danish equipment manufacturer Sander Hansen developed an automated tunnel pasteurizer, according to its company chronology. The milestone belongs to the mechanization of packaged-beer production: sealed containers could move continuously through controlled heating and cooling stages instead of being handled in separate batches.

Tunnel pasteurization treats beer after packaging, helping control spoilage organisms in both the beer and the filled container. Its integration into bottling, and later canning, lines supported high-throughput production and longer distribution chains. Subsequent developments improved heat recovery and temperature control. This industrial application extended the earlier science of pasteurization; it did not originate that science or establish that Sander Hansen invented every form of continuous beer pasteurization.

**Source assessment:** 1937 is supported by the manufacturer’s retrospective chronology, inspected in a reproduced brochure, not an independently verified global first. The library supports the process distinction, not the date. Later brochure controls are not attributed to the 1937 machine.

**Beer Map:** `denmark` — Country of equipment manufacturer; first installation site is not established.

**Sources:**

Sander Hansen / Krones. Pasteurisation Technology: From Innovation to Implementation, company chronology, p. 3; undated brochure issued after March 2000. Inspected reproduction.
https://www.scribd.com/document/735203521/pasteurtechnik-e

University of Chicago Library. “Pasteurization,” Something’s Brewing.
https://www.lib.uchicago.edu/collex/exhibits/somethings-brewing/brewing-technology/pasteurization/

### Ziemann Installs Centralized Brewhouse Control at Heineken — 1958

UUID: `90a0d491-a4cb-4996-bed6-043b7dd1b93f`. Tags: Science, Quality Control, Netherlands.

In 1958, Ziemann installed a multistory block brewhouse at Heineken’s new brewery in ’s-Hertogenbosch, Netherlands. The installation combined automatic regulation with a central illuminated control panel recording important operating data. It provided a concrete example of brewhouse operations becoming centrally supervised rather than depending entirely on individual manual adjustments around the plant.

This development joined process equipment, measurement, and control in an integrated installation. It preceded the later use of programmable controllers and software recipes: centralized automatic regulation did not yet mean a modern computerized brewery. Heineken’s installation illustrates the postwar transition toward more coordinated industrial brewing without requiring a claim that one company invented all brewery automation.

**Source assessment:** Replaces proposed 1955 milestone: current Ziemann history says 1955, but its 2016 VDI presentation says 1965. Grub documents this installation in 1958. Heineken independently verifies the brewery opening on September 4, 1958, not the precise commissioning day of the controls; therefore year precision.

**Beer Map:** `s_hertogenbosch` — City of Heineken brewhouse installation.

**Sources:**

Grub, Volker. Ziemann Brauereianlagen: Vom Handwerksbetrieb zum Weltunternehmen. Verlag Regionalkultur, 2023, p. 78. Publisher’s excerpt.
https://verlag-regionalkultur.de/presse/bib/bib_05-414-4.pdf

Heineken Collection Foundation. “Feest in Den Bosch. Opening van de Heineken’s bierbrouwerij in ’s-Hertogenbosch,” inventory 15330, 1958.
https://www.heinekencollection.com/nl/collectie/15330

### Ziemann Builds Its First Complete Stainless-Steel Brewhouse — 1961

UUID: `3b33597c-1f32-4dcb-8783-8f84b1821571`. Tags: Science, Quality Control, Germany.

In 1961, German brewery-equipment manufacturer Ziemann built its first complete stainless-steel brewhouse. This company milestone marks a concrete stage in the gradual replacement of traditional brewery materials, rather than a single moment when the entire industry adopted stainless steel.

Stainless steel offered durable surfaces resistant to corrosion by beer and avoided the fragile protective linings needed inside ordinary steel tanks. With suitable fabrication and surface finishing, it supported hygienic vessels and pipework that could withstand repeated cleaning. Its use spread across brewhouses, fermentation tanks, valves, and packaging equipment. Together with improved welding and vessel design, stainless steel became a foundation for pressure-capable fermentation tanks and clean-in-place systems in modern breweries.

**Source assessment:** The 1961 complete-brewhouse date rests on Grub, p. 81; independent technical literature supports significance. This is explicitly Ziemann’s first complete stainless brewhouse, not the first stainless tank, keg, or worldwide conversion. No customer is named in the inspected passage.

**Beer Map:** `germany` — Country of equipment manufacturer; customer and installation site are not established.

**Sources:**

Grub, Volker. Ziemann Brauereianlagen: Vom Handwerksbetrieb zum Weltunternehmen. Verlag Regionalkultur, 2023, p. 81. Publisher’s excerpt.
https://verlag-regionalkultur.de/presse/bib/bib_05-414-4.pdf

Kissmeyer, Anders Brinch. “Fermentation Vessels.” The Oxford Companion to Beer.
https://www.beerandbrewing.com/dictionary/YCCmYUmOuv

Briggs, Dennis E., Chris A. Boulton, Peter A. Brookes, and Roger Stevens. Brewing: Science and Practice. Woodhead Publishing, 2004, pp. 516–517.

### Asahi Installs Large Outdoor Fermentation and Lagering Tanks — 1965-03

UUID: `ef9375a2-1f88-4e1f-9cae-b310da867646`. Tags: Science, Fermentation, Containers, Lager, Japan.

In March 1965, Asahi installed outdoor fermentation and storage tanks at its Nishinomiya, Azumabashi, and Hakata plants in Japan. These large vertical vessels represented a practical step away from fermentation and lagering tanks housed in extensive refrigerated cellars. Asahi’s design used a sloping bottom for yeast collection; it should not be treated as identical to the steep conical bottom of every later cylindroconical fermenter.

The wider postwar transition depended on advances in stainless-steel fabrication, insulated vessels, cooling jackets, pressure management, and process control. Clean-in-place methods circulated cleaning solutions through tanks and pipework without dismantling them, making large closed systems easier to maintain hygienically. These developments turned earlier enclosed-vessel concepts, including Nathan’s, into workable industrial systems and helped breweries expand capacity outdoors.

**Source assessment:** Asahi supplies month and three sites; Oxford independently describes the 1965 sloping-bottom design. Omit Asahi’s worldwide-first claim because earlier outdoor/vertical developments complicate it. Enabling technologies describe the wider transition, not a verified equipment specification for each March 1965 tank.

**Beer Map:** `japan` — Country containing the three documented Asahi installations.

**Sources:**

Asahi Group Holdings. “Asahi Group’s History,” March 1965.
https://www.asahigroup-holdings.com/en/company/history/

Kissmeyer, Anders Brinch. “Fermentation Vessels.” The Oxford Companion to Beer.
https://www.beerandbrewing.com/dictionary/YCCmYUmOuv

Kissmeyer, Anders Brinch. “Cleaning in Place (CIP).” The Oxford Companion to Beer.
https://www.beerandbrewing.com/dictionary/KkUPn95e3d

Briggs, Dennis E., et al. Brewing: Science and Practice. Woodhead Publishing, 2004, pp. 514–517.

### Rainier Develops the Unitank for Fermentation and Maturation — 1968

UUID: `1cd871dd-91e5-4a36-9dab-4b25ed03e4ab`. Tags: Science, Fermentation, Containers, Lager, USA.

In 1968, Rainier Brewery in Seattle developed a vessel known as the unitank for carrying out fermentation and maturation in the same tank. Its relatively squat proportions and shallow conical bottom distinguished it from the taller Nathan-type vessel. Cooling equipment handled both the heat released during fermentation and the subsequent chilling needed for maturation.

The unitank joined stages commonly divided between fermentation and lagering cellars, reducing the need to transfer beer between vessels. Its name described a way of organizing production as well as a tank design. Although unitanks became closely associated with cylindroconical fermenters, the two terms emphasize different things: one-vessel processing and vessel geometry. Rainier’s development was therefore a distinct step within the longer history of enclosed fermentation.

**Source assessment:** Briggs dates the Rainier development to 1968, while Oxford describes large numbers installed around 1970; development and later scale are compatible. Lewis attributes the term to Rainier in 1968. Do not claim independently established first-ever use of the word. Knudsen/Vacano’s 1972 original was not inspected and is not a standalone evidentiary source.

**Beer Map:** `seattle` — City of Rainier Brewery’s unitank development.

**Sources:**

Briggs, Dennis E., et al. Brewing: Science and Practice. Woodhead Publishing, 2004, p. 514; references Knudsen and Vacano (1972).

Lewis, Ashton. “Feeling the Pressure, Tips for Unitank Users.” Brew Your Own.
https://byo.com/articles/feeling-the-pressure-tips-for-unitank-users/

Kissmeyer, Anders Brinch. “Fermentation Vessels.” The Oxford Companion to Beer.
https://www.beerandbrewing.com/dictionary/YCCmYUmOuv

### Žatec Converts Its Hop-Processing Line to Type 90 Pellets — 1973

UUID: `db044422-0cf2-4cd7-abac-cc7c093a127a`. Tags: Science, Hops, Czech Republic.

In 1973, the Chmelařství operation in Žatec, then Czechoslovakia, converted its hop-powder line to produce Type 90 pellets. The line had opened in 1971, but breweries found loose powder awkward to store and handle. Compressing milled hops into pellets answered those practical demands and established a documented stage in the commercial development of processed Czech hops.

Pellets reduced bulk and made hop transport, storage, and dosing more manageable. Their production was mechanical: dried hops were milled and compressed, rather than having their bitter substances and oils separated by a solvent. As protective packaging improved, excluding oxygen and light also helped preserve hop quality. Pelletization connected agricultural production with the increasingly standardized handling needs of industrial breweries.

**Source assessment:** Date is a transparent arithmetic inference: the bilingual contemporary retrospective says powder line 1971, converted two years later. It does not say pellets started in 1971. Mostecká’s new plant opened in 1993 and is a different site. Packaging improvements are subsequent/general, not all assigned to 1973.

**Beer Map:** `zatec` — City of the hop-processing line at Chmelařské náměstí.

**Sources:**

Podsedník, Jan, Jr. “Chmelařství, Cooperative Žatec, and 20 Years of Hop Pellet Processing in the Mostecká Complex.” Czech Hops / Český chmel 2013, pp. 5–6. Hosted by the Czech Ministry of Agriculture.
https://mze.gov.cz/public/web/file/263155/Cesky_chmel_web.pdf

Hopsteiner. “Processing and Logistics.”
https://hopsteiner.us/processing-and-logistics/

### Sandwalls Adopts High-Gravity Brewing to Expand Capacity — 1975

UUID: `8cba964a-f1b1-4e8e-85e7-241cfcd4abc7`. Tags: Science, Fermentation, Quality Control, Sweden.

In 1975, technical manager William Frank introduced high-gravity brewing at Sandwalls Ångbryggeri in Borås, Sweden. Brewers produced and fermented wort stronger than the beer intended for sale, then adjusted it to sales strength with carefully treated, deoxygenated water. The application followed the technique’s development in industrial brewing during the late 1960s.

Producing more concentrated beer increased the saleable output obtainable from existing brewing and cellar equipment, reducing the tank space needed per unit of finished beer. Sandwalls used the method as part of a wider capacity expansion that also involved other plant improvements. The economic advantage came with new demands: yeast had to perform in stronger wort, dilution water had to avoid introducing oxygen, and brewers had to maintain the intended flavor and foam.

**Source assessment:** The exact 1975 application is first-person retrospective evidence from Frank, repeated within one report, not multiple independent witnesses. Stewart independently supports the process and tradeoffs. No sufficiently documented named late-1960s first adopter was established. Do not attribute all Sandwalls output growth to HGB alone.

**Beer Map:** `boras` — City of the documented Sandwalls application.

**Sources:**

Frank, William. Udvikling af teknologi til nedbrygning i mikrobryggerier. Danish Environmental Protection Agency, 2018, p. 5, appendix 8, and appendix 9, “High Gravity Brewing in Small Breweries,” Scandinavian Brewers’ Review 75 (2018).
https://www2.mst.dk/Udgiv/publikationer/2018/08/978-87-93710-56-6.pdf

Stewart, G. G. “High-Gravity Brewing and Distilling—Past Experiences and Future Prospects.” Journal of the American Society of Brewing Chemists 68(1), 2010, pp. 1–9. Abstract inspected via Heriot-Watt University.
https://researchportal.hw.ac.uk/en/publications/high-gravity-brewing-and-distilling-past-experiences-and-future-p/

### Carlton and United Commissions a Liquid-CO₂ Hop-Extraction Plant — 1980

UUID: `349d595e-7b3d-4df9-9b64-c474ea18736c`. Tags: Science, Hops, Australia.

In 1980, Carlton and United Breweries commissioned a commercial plant in Australia for extracting hops with liquid carbon dioxide. The company’s scientists reported work progressing from laboratory and pilot equipment to commercial-scale extraction. Their research formed part of an international move toward CO₂ processing, including earlier work by Britain’s Brewing Research Foundation and Distillers Company.

Hop extracts concentrated bitter resins and aromatic oils while leaving much of the plant material behind, supporting controlled additions in industrial brewing. Extraction itself was much older: the significant change was the solvent and the practical scale. Liquid CO₂ offered an alternative to earlier organic solvents amid concern about residues in food. It was distinct from mechanical pelletization and from extraction with supercritical CO₂, another route developing around the same period.

**Source assessment:** Institutional history supplies commissioning year; the 1980 CUB-authored paper independently demonstrates contemporary commercial work but is company-affiliated. Biendl dates industrial liquid-CO₂ extraction in England to 1979 and supercritical extraction in Germany to 1980, conflicting with the Australian history’s world-first claim. Omit that claim and select the documented Australian application, not invention of extracts.

**Beer Map:** `australia` — Country of Carlton and United’s commercial extraction plant; precise site is not established.

**Sources:**

Australian Academy of Technological Sciences and Engineering. Technology in Australia 1788–1988, brewing section, p. 123. University of Melbourne digital edition.
https://www.austehc.unimelb.edu.au/tia/123.html

Bodkin, C. L., B. J. Clarke, T. E. Kavanagh, P. M. Moulder, J. D. Reitze, and R. N. Skinner. “Preparation and Analysis of Liquid CO₂ Hop Extracts.” Journal of the American Society of Brewing Chemists 38(4), 1980, pp. 137–142.
https://www.agraria.com.br/extranet_2016/uploads/AgromalteArquivo/extrato_co2___ing_1601582229447.pdf

Biendl, Martin. “40 Years of Total Resin Extract—Useful Information from A to X (Part 1).” Brauwelt International 2022/I, pp. 12–15.
https://hopsteiner.us/wp-content/uploads/2022/04/Total-Resin-Extract-Part-1.pdf

### Siemens Introduces Recipe-Controlled PLC Automation with Braumat — 1983

UUID: `851cb77b-3a24-43bb-9c56-dc813ba0652b`. Tags: Science, Quality Control, Germany.

In 1983, German engineering company Siemens introduced a recipe-controlled brewery automation system based on programmable logic controllers and marketed as Braumat. Siemens dates its earlier controller-based automation systems to 1973. The 1983 development brought brewing recipes and programmed process sequences into the control of brewery equipment.

Earlier control rooms had already centralized instruments and automated individual operations. PLC-based systems made sequences programmable, allowing a recipe to coordinate process steps and operating settings instead of requiring operators to reproduce each step through switchboards and separate controls. Braumat represents a documented stage in brewing’s transition toward software-directed production, with greater scope for repeating batches consistently. It was part of that broader transition, rather than the beginning of all brewery automation.

**Source assessment:** Siemens is the sufficient primary source for its own 1973/1983 chronology, not independent proof of worldwide priority. Specialist braumat.de history places earlier product roots/branding in the 1970s and has an inconsistent 1982/1983 table. The title dates the PLC recipe system described by Siemens, not first coinage of the brand. No unverified pneumatic architecture, early GUI, or customer is added.

**Beer Map:** `germany` — Country of automation supplier; no first customer installation is asserted.

**Sources:**

Siemens. “500 Years of the German Purity Law: Siemens in the Brewing Industry,” historical pictures, “Braumat: Brewery and Automation,” 2016.
https://press.siemens.com/global/en/feature/500-years-german-purity-law-siemens-brewing-industry

Grub, Volker. Ziemann Brauereianlagen: Vom Handwerksbetrieb zum Weltunternehmen. Verlag Regionalkultur, 2023, p. 78 (earlier centralized automatic control).
https://verlag-regionalkultur.de/presse/bib/bib_05-414-4.pdf

### Krones Builds Its First Sterile Beer Filler — 1992

UUID: `316dca4a-6c53-4488-a2ee-a3a49f177bc2`. Tags: Science, Packaging, Quality Control, Germany.

In 1992, German equipment manufacturer Krones built its first machine for sterile beer filling. Using electropneumatic filling valves, it flushed bottles with steam before filling to sterilize them. The system addressed breweries seeking better microbiological shelf stability while avoiding conventional heat treatment of the beer and its possible effects on flavor.

This approach protected the filling stage from contamination; sterilizing an empty bottle did not itself remove microorganisms already present in the incoming beer. Successful aseptic packaging also required microbiologically controlled beer and hygienic handling through closure. The machine therefore belongs to the development of alternatives to conventional beer pasteurization, without implying a process entirely free of heat: the bottles were steam-treated. Nor should it be confused with flash-pasteurizing the beer before aseptic filling.

**Source assessment:** Krones’ own historical account explicitly supports 1992, steam treatment of bottles, electropneumatic valves, and the nonpasteurized-beer aim. Independent technical literature supports aseptic-filling requirements, not this date. No sterile-filter configuration or flash pasteurizer is asserted for the 1992 installation. “First” is strictly company-scoped.

**Beer Map:** `germany` — Country of filler manufacturer; first brewery customer is not established.

**Sources:**

Krones. “50 Years of Fillers Made by Krones,” section “Entering the Field of Sterile Filling.”
https://www.krones.com/en/company/press/magazine/backstage/50-years-of-fillers-made-by-krones.php

Briggs, Dennis E., et al. Brewing: Science and Practice. Woodhead Publishing, 2004, pp. 779–780, “Aseptic Filling.”

## Deferred topics and unresolved evidence

**Clean in place:** The available sources are insufficient to create or update a Beer Chronicles entry anchored to a specific brewery adoption milestone. Anders Brinch Kissmeyer’s [Oxford Companion account](https://www.beerandbrewing.com/dictionary/KkUPn95e3d) places commonplace CIP in the 1950s; Peter Thorman’s [Kersia brewery account](https://www.kersia.uk/media-centre/kersia-uk-s-brewing-team-cleaning-in-place/) emphasizes the 1960s. These support gradual adoption and may reflect different markets or definitions. J. L. H. R. Miller and A. A. D. Comrie’s 1960 paper, “Detergents and Sterilization in Breweries,” [DOI 10.1002/j.2050-0416.1960.tb06320.x](https://doi.org/10.1002/j.2050-0416.1960.tb06320.x), is a valuable contemporaneous lead, but its full text was not obtained. Its bibliographic existence does not prove a named first installation. General food/dairy CIP equipment dates do not establish brewery adoption. Rather than assign an arbitrary brewery or supplier-headquarters pin to a diffuse development, defer the standalone event and include the well-supported operating principle in Asahi’s broader context. Next useful evidence: a dated brewery installation report, plant archive, or contemporary engineering account.

**Centrifugal clarification:** The available sources are insufficient to create or update a Beer Chronicles entry anchored to a sufficiently established beer-specific adoption milestone. H. Hürlimann, “Centrifuges in the Brewery,” Journal of the Institute of Brewing 57(1), 1951, pp. 21–27, [DOI 10.1002/j.2050-0416.1951.tb01606.x](https://doi.org/10.1002/j.2050-0416.1951.tb01606.x), is an important early beer-specific source, but the full article was not obtained. Do not convert its publication date into a first installation date. Graham Stewart’s [“Seduced by Yeast” (2015)](https://www.asbcnet.org/publications/journal/vol/2015/Documents/ASBCJ-2015-0202-01.pdf) describes Labatt installations in the late 1970s and early 1980s: useful firsthand evidence of industrial adoption, but no sufficiently exact first plant/year for the proposed pin. Separators accelerate yeast removal/clarification and can improve throughput and recovery, while handling can stress yeast; they do not simply substitute for all filtration or microbial stabilization. Next useful evidence: full Hürlimann paper or a dated supplier/brewery commissioning archive. Do not use the general separator’s nineteenth-century invention date.

**Conflicting automation chronology:** [Ziemann’s current history](https://www.ziemann-holvrieka.com/en/our-history/) lists first automation in 1955, whereas Tobias Becher’s [2016 Ziemann VDI presentation](https://www.vdi.de/fileadmin/pages/vdi_de/redakteure/vor_ort/bv/nordbadisch-pfaelzischer-bv/netzwerke_fach-aks/energie/archiv_energie/Biernbrauen_Vortrag_public_29_06_16.pdf), p. 5, gives 1965 and assigns 1955 to stainless fermenters. This is why the proposal selects the specifically documented Heineken installation, rather than silently choosing either “first” date.

**Source access:** Inspected sources include full primary patent text, the publisher’s Grub excerpt, the government-hosted Czech and Danish publications, the contemporary CUB research paper, the full relevant Briggs book sections, the reproduced Sander Hansen brochure, the Siemens and Asahi histories, and Krones’ article (retrieved directly when browser indexing returned 403). The Stewart high-gravity source was inspected as an abstract, not full text. Supplier histories support company-scoped dates only; Sander Hansen’s original-host brochure and independent commissioning evidence remain unavailable. Retain its explicit attribution. No uninspected patent/paper cited as a research lead is used as sole support for a new historical claim.

## Beer Map, Storylines, and publication sequence

The map has ten matching UUID assignments: four city-level pins (’s-Hertogenbosch, Seattle, Žatec, Borås) and six country-level pins (Denmark; Germany for three supplier milestones; Japan for three Asahi installations; Australia). New coordinates for Borås, Denmark, ’s-Hertogenbosch, and Seattle were retrieved from OpenStreetMap Nominatim on September 5, 2026. Existing vetted place coordinates are reused elsewhere. These are settlement/administrative coordinates, never asserted factory doorways. Country markers explicitly identify manufacturer country versus installation country. A manufacturer pin must not be read as evidence of a first customer’s location.

Canonical tags connect the new quality-control events to **Measurement and Quality Control**, pellets/extracts to **Hops**, and vessel/packaging events to the existing **Packaging, Dispense, and the Beer Supply Chain** and **Lager** filters where supported. Existing shared tags supply related-event opportunities without creating unsupported causal links. No manual related-entry records or new Storylines are added.

1. Human reviews the complete SQL and these source limitations, then manually executes the proposal if approved. The SQL contains no deletion, no new tags, exact snapshot protection for Nathan, guarded insertions, all tag links, and read-only verification queries. It intentionally aborts if repeated.
2. Retain the proposed UUIDs: the local map assignments use those exact identities. If titles/dates change during review, map labels come from the resulting events automatically; if UUIDs or historical locations change, revise the assignments too.
3. After the authorized data change, an independently authorized build/deployment must include the map code and fetch the new live data. SQL alone cannot publish the map, and map code alone does not publish absent events. No commit, push, deployment, or SQL execution has been performed here.
4. Run the SQL verification queries and verify all ten events on the published timeline, their Storyline filters, and `/map/` after deployment.

The research report is a proposal artifact. The SQL filename follows the repository’s existing ignored `sql/*-proposal.sql` convention; preserve the local file for manual review rather than assuming it will be included in a future commit.

## Verification completed

- Compared the 527 active live database records with the published timeline payload: matching event IDs and reviewed editorial fields; no conflict found.
- Verified the four relevant live Storyline pages and reviewed their event links against the full published corpus.
- `npm run typecheck`: passed after adding map assignments.
- `npm run lint`: passed.
- `npm test`: 53 tests passed, zero failures.
- Temporary integration check using the real map builder: all ten proposed records produce one correctly labeled marker each; absent proposed records produce zero markers; grouped-map inclusion, supported precision, links, years, canonical tags, and actual Storyline membership passed. Nathan’s UUID, tags, existing map location, and second paragraph are preserved. The existing Containers filter also places the Asahi and Rainier events in “Barrel Aging, Wood, and Beer Containers”; that follows the current Storyline’s broader container scope.
- PostgreSQL parser (`pglast`, temporary environment): all 16 SQL statements and both PL/pgSQL blocks parsed successfully. Parsed insertion literals exactly match all ten reviewed event records. **This is syntax validation, not SQL execution or a live database test.**
- `git diff --check`: passed.
- Updated `.agents/skills/beer-entry/SKILL.md` to make batch map coverage, evidence, matching UUIDs, verification, and publication dependencies part of the default workflow.

No database mutation, static production build, browser rendering of unpublished events, commit, push, or deployment was performed. The map change only adds reviewed assignments to the existing rendering path; actual published presence must be checked after the human-approved publication sequence above.

## Publication follow-up — September 5, 2026

The user subsequently requested build, commit, and push. A clean `npm run build` succeeded (593 generated pages), and `npm run check:timeline-payload` passed with 537 events. The initial sandbox build failed because Turbopack could not bind a local port; moving its failed generated cache aside and rebuilding with approved permissions resolved that environment failure.

The build’s fresh live-data export contains all ten proposed UUIDs and the Nathan description matches the proposed revision. This confirms the database changes are now present; the assistant did not execute the SQL. All ten new UUIDs occur in the exported `out/map.html`. The earlier “unexecuted proposal” statements document preparation status at that stage; do not execute the one-time SQL again.

The map changes, existing map-workflow skill update, and this research record are ready for the requested commit/push. The ignored SQL proposal and editor backup remain local. Adding build/commit/push to the skill is reserved for the later skill update requested by the user.
