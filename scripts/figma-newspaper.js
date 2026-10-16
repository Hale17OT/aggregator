// Run through the Desktop Bridge with fixtures, routeSvg, and config injected.
const page=figma.root.children.find(p=>p.name==='09 SC01–SC04 — Newspaper refinement');
await figma.setCurrentPageAsync(page);
const fonts={serif:{family:'Newsreader',style:'Regular'},ui:{family:'Manrope',style:'Regular'},heading:{family:'Newsreader',style:'Medium'},mast:{family:'UnifrakturMaguntia',style:'Book'}};
for(const font of Object.values(fonts))await figma.loadFontAsync(font);
const dark=config.theme==='Dark';const mobile=config.width<700;const tablet=config.width<1100&&!mobile;
const c=dark?{canvas:'#101715',text:'#F1F3ED',secondary:'#D1D9D0',muted:'#AEBCAF',border:'#35453D',brand:'#83D8B2',surface:'#23312B'}:{canvas:'#F6F3ED',text:'#18201E',secondary:'#4A5851',muted:'#626C65',border:'#D4D9D3',brand:'#17634D',surface:'#ECE7DD'};
function paint(hex){return {type:'SOLID',color:{r:parseInt(hex.slice(1,3),16)/255,g:parseInt(hex.slice(3,5),16)/255,b:parseInt(hex.slice(5,7),16)/255}};}
function box(parent,name,w,gap=0,horizontal=false,component=false){const n=component?figma.createComponent():figma.createFrame();parent.appendChild(n);n.name=name;n.resize(w,1);n.layoutMode=horizontal?'HORIZONTAL':'VERTICAL';n.primaryAxisSizingMode=horizontal?'FIXED':'AUTO';n.counterAxisSizingMode=horizontal?'AUTO':'FIXED';n.itemSpacing=gap;n.fills=[];n.clipsContent=false;return n;}
function text(parent,value,size=15,color=c.text,font='ui',line=1.5,align='LEFT'){const n=figma.createText();parent.appendChild(n);n.name=value.slice(0,80);n.fontName=fonts[font==='serif'&&size>=22?'heading':font];n.fontSize=size;n.lineHeight={value:size*line,unit:'PIXELS'};n.fills=[paint(color)];n.characters=value;n.resize(parent.width-parent.paddingLeft-parent.paddingRight,1);n.textAutoResize='HEIGHT';n.layoutSizingHorizontal='FILL';n.textAlignHorizontal=align;return n;}
function rule(parent){const n=figma.createRectangle();parent.appendChild(n);n.name='Fine editorial rule';n.resize(parent.width-parent.paddingLeft-parent.paddingRight,1);n.fills=[paint(c.border)];n.layoutSizingHorizontal='FILL';return n;}
function gap(parent,h){const n=figma.createFrame();parent.appendChild(n);n.name='Spacing';n.resize(1,h);n.fills=[];}
const components=await figma.getNodeByIdAsync('8:694');components.x=7000;components.resizeWithoutConstraints(11200,8000);
const componentX=config.slot*1800+40;
let section=page.children.find(n=>n.name===`SC01–SC04 / ${config.theme} / Refined newspaper`);
if(!section){section=figma.createSection();section.name=`SC01–SC04 / ${config.theme} / Refined newspaper`;section.x=0;section.y=dark?19000:4500;section.resizeWithoutConstraints(6500,14000);}
const margin=mobile?20:tablet?24:80;const contentWidth=config.width-margin*2;
const mast=box(components,`PublicationMasthead / ${config.width} / ${config.theme}`,contentWidth,0,false,true);mast.x=componentX;mast.y=380;mast.fills=[paint(c.canvas)];
const utility=box(mast,'Utility controls',contentWidth,0,true);utility.paddingTop=10;utility.paddingBottom=12;
text(utility,'Independent perspectives. Clear sources.',mobile?9:11,c.secondary);text(utility,dark?'Light theme':'Dark theme',mobile?9:11,c.text,'ui',1.5,'RIGHT');rule(mast);
const name=box(mast,'Centered publication name',contentWidth);name.paddingTop=13;name.paddingBottom=20;text(name,'The Aggregator',mobile?39:64,c.text,'mast',1.15,'CENTER');
rule(mast);const nav=box(mast,'Edition sections',contentWidth,mobile?16:32,true);nav.primaryAxisAlignItems='CENTER';nav.paddingTop=12;nav.paddingBottom=12;for(const label of ['HOME','CULTURE','LATEST UPDATES','THE BRIEFING']){const t=text(nav,label,mobile?10:12,c.text);t.layoutSizingHorizontal='HUG';t.textAutoResize='WIDTH_AND_HEIGHT';}rule(mast);
const edition=box(mast,'Edition date and disclosure',contentWidth);edition.paddingTop=12;edition.paddingBottom=18;if(mobile)text(edition,'Thursday, 8 October 2026\nFictional development edition · not live news',9,c.muted,'ui',1.6,'CENTER');else {edition.layoutMode='HORIZONTAL';edition.primaryAxisSizingMode='FIXED';edition.counterAxisSizingMode='AUTO';text(edition,'Thursday, 8 October 2026',10,c.muted);text(edition,'Fictional development edition · not live news',10,c.muted,'ui',1.6,'RIGHT');}
let mediaCount=0;
function makeMedia(parent,media,w,compact=false){
  const key=`EditorialMedia / ${media.id} / ${Math.round(w)} / ${config.theme} / ${compact?'Compact':'Captioned'}`;
  let master=components.children.find(n=>n.name===key);
  if(!master){master=box(components,key,w,7,false,true);master.x=componentX;master.y=800+mediaCount*850;mediaCount++;
    if(media.availability==='unavailable'){text(master,'Illustration unavailable. The story and its sources remain readable.',14,c.secondary);}
    else if(media.src.endsWith('.png')){const r=figma.createRectangle();master.appendChild(r);r.name=media.alt;r.resize(w,w*media.height/media.width);r.fills=[{type:'IMAGE',imageHash:'e7266635020419428bb60c866286e700f241b76f',scaleMode:'FIT'}];}
    else{const vector=figma.createNodeFromSvg(routeSvg);master.appendChild(vector);vector.name=media.alt;vector.rescale(w/1200);if(media.kind==='video')text(master,'▶  Play original illustrative route animation · 00:04',12,c.brand);}
    text(master,compact?'Fictional illustration · not evidence':`${media.caption} ${media.credit} · ${media.provenance}. Original asset ↗`,compact?9:11,c.muted,'ui',1.7);
  }
  const instance=master.createInstance();parent.appendChild(instance);return instance;
}
function brief(parent,article,summary=true,withImage=false){const row=box(parent,`StoryBrief / ${article.slug}`,parent.width-parent.paddingLeft-parent.paddingRight,withImage?16:0,withImage);
  let body=row;if(withImage){const thumb=box(row,'Thumbnail',mobile?96:120);makeMedia(thumb,article.leadMedia,thumb.width,true);body=box(row,'Headline and attribution',row.width-thumb.width-16);}
  else text(body,article.correction?'CORRECTION':article.topic.toUpperCase(),10,c.brand);
  text(body,article.headline,withImage?22:mobile?26:23,c.text,'serif',1.14);if(summary){gap(body,8);text(body,article.deck,mobile?14:12,c.secondary,'ui',1.7);}gap(body,8);text(body,`${article.sources.length} sources · Version ${article.version} · Mock reporting`,10,c.muted,'ui',1.7);gap(parent,20);rule(parent);gap(parent,20);return row;
}
function root(name,x){const f=box(section,name,config.width);f.x=x;f.y=40;f.counterAxisAlignItems='CENTER';f.paddingLeft=margin;f.paddingRight=margin;f.paddingTop=mobile?4:14;f.paddingBottom=40;f.fills=[paint(c.canvas)];const m=mast.createInstance();f.appendChild(m);return f;}
const home=root(`SC01.Home.${config.width}.${config.theme}.Newspaper`,config.x);
const article=root(`SC04.Article.${config.width}.${config.theme}.Newspaper`,config.x+config.width+120);
const fixture=fixtures[0];const secondary=[fixtures[2],fixtures[3],fixtures[1]];
const grid=box(home,'Opening editorial grid — mobile lead first',contentWidth,mobile?32:26,!mobile);grid.paddingTop=14;
const leftWidth=mobile?contentWidth:tablet?(contentWidth-28)/3:(contentWidth-52)/4.2;
const centerWidth=mobile?contentWidth:tablet?(contentWidth-28)*2/3:leftWidth*2.2;
let left,lead,right;
if(mobile){lead=box(grid,'Lead story',centerWidth);left=box(grid,'The briefing',leftWidth);right=box(grid,'Latest updates',contentWidth);}
else if(tablet){lead=box(grid,'Lead story',centerWidth);left=box(grid,'The briefing',leftWidth);right=box(home,'Latest updates',contentWidth);}
else{left=box(grid,'The briefing',leftWidth);lead=box(grid,'Lead story',centerWidth);right=box(grid,'Latest updates',leftWidth);lead.paddingLeft=22;lead.paddingRight=22;}
text(lead,'CULTURE / IN FOCUS',10,c.brand);gap(lead,12);const homeImage=makeMedia(lead,fixture.leadMedia,centerWidth-lead.paddingLeft-lead.paddingRight,true);gap(lead,18);const homeTitle=text(lead,fixture.headline,mobile?34:38,c.text,'serif',1.12);gap(lead,12);text(lead,fixture.deck,mobile?14:16,c.secondary,'ui',1.65);gap(lead,12);text(lead,'4 sources · 8 October, 14:00 UTC · Mock reporting',10,c.muted);gap(lead,24);rule(lead);gap(lead,18);brief(lead,fixtures[1],false,true);
text(left,'THE BRIEFING',12);gap(left,12);rule(left);gap(left,20);for(const item of secondary)brief(left,item);
text(right,'LATEST UPDATES',12);gap(right,12);rule(right);gap(right,20);
for(const item of [fixtures[3],fixtures[0],fixtures[2]]){text(right,'14:00 UTC',10,c.brand);gap(right,8);text(right,item.headline,mobile?25:22,c.text,'serif',1.14);gap(right,10);text(right,`${item.correction?'Corrected · ':''}4 sources`,10,c.muted);gap(right,20);rule(right);gap(right,20);}
text(right,'A NOTE ON THIS EDITION',10,c.brand);gap(right,10);text(right,'One invented town. Four related dispatches. Every source and illustration is a clearly labeled fixture.',12,c.secondary,'ui',1.7);
gap(home,36);rule(home);gap(home,18);text(home,'CULTURE / Community & shared spaces',12,c.brand);gap(home,24);
const culture=box(home,'Culture — varied editorial continuation',contentWidth,40,!mobile);const cultureLead=box(culture,'Image-led route explanation',mobile?contentWidth:(contentWidth-40)/2);makeMedia(cultureLead,fixture.inlineMedia[0].media,cultureLead.width,true);gap(cultureLead,16);text(cultureLead,'The route, the timetable, and the questions still open',30,c.text,'serif',1.14);text(cultureLead,'From the evening shuttle report · 4 sources',10,c.muted);const cultureBriefs=box(culture,'Text-led related dispatches',cultureLead.width);brief(cultureBriefs,fixtures[3]);brief(cultureBriefs,fixtures[1]);
// Article: title then image. Reading material is constrained to 720px below the image.
const opening=box(article,'Article opening',Math.min(contentWidth,1040));opening.layoutAlign='CENTER';opening.counterAxisAlignItems='CENTER';opening.paddingTop=12;opening.paddingBottom=36;
const headline=box(opening,'Centered H1',Math.min(opening.width,940));text(headline,fixture.headline,mobile?36:tablet?48:56,c.text,'serif',1.1,'CENTER');gap(opening,28);makeMedia(opening,fixture.leadMedia,Math.min(opening.width,960));
const reading=box(article,'Narrative — 720px maximum',Math.min(contentWidth,720));reading.layoutAlign='CENTER';text(reading,'CULTURE / THE EVENING EDITION',11,c.brand);gap(reading,12);text(reading,fixture.deck,24,c.text,'serif',1.4);gap(reading,20);text(reading,'Fictional development fixture. AI-assisted writing; simulated editorial review, not real publication.',11,c.muted);text(reading,'Version 1 · Published 8 Oct 2026, 14:00 UTC\nEvidence cutoff 8 Oct 2026, 12:00 UTC',11,c.muted);gap(reading,12);const sourceJump=text(reading,'Sources (4) ↓',13,c.brand);text(reading,'Standard       Brief',12,c.brand);gap(reading,20);rule(reading);
for(const block of fixture.variants.standard){gap(reading,24);text(reading,block.heading,30,c.text,'serif',1.14);gap(reading,16);text(reading,block.text,mobile?18:20,c.text,'serif',1.6);text(reading,block.sourceIds.map(s=>'['+s.split('-')[1]+']').join('  '),14,c.brand);for(const entry of fixture.inlineMedia.filter(e=>e.afterBlockIds.includes(block.id))){gap(reading,28);makeMedia(reading,entry.media,reading.width);}}
gap(reading,32);text(reading,'Two counts. Two different measures.',30,c.text,'serif');text(reading,'18 people waiting and 24 boardings cannot establish one unique-passenger total. Source 2 · Source 3',15,c.secondary);
gap(reading,48);rule(reading);const sourcesTitle=text(reading,'Sources and evidence',30,c.text,'serif');text(reading,'All 4 version-wide evidence items. Example-domain links are fictional; no real reporting was retrieved.',11,c.muted);
for(const source of fixture.sources){gap(reading,24);text(reading,`${source.ordinal}. ${source.title}`,20,c.text,'ui',1.4);text(reading,`${source.publisher} · ${source.author||'Author unavailable'}`,14,c.secondary);text(reading,'Published 8 Oct 2026, 09:00 UTC · Checked 12:00 UTC',11,c.muted);text(reading,`${source.kind} · evidence · Cited in this view`,11,c.muted);text(reading,`${source.url}${source.locator?'?t=72':''}`,12,c.brand);text(reading,'Return to citation ↑',12,c.brand);gap(reading,16);rule(reading);}
gap(reading,32);text(reading,'Corrections and version history',30,c.text,'serif');text(reading,'No corrections in this fictional version.\nVersion 1 · 8 Oct 2026, 14:00 UTC',14,c.secondary);
for(const f of [home,article]){gap(f,40);rule(f);gap(f,20);text(f,'The Aggregator · Fictional development edition. Original illustrations; real integrations disabled.',11,c.muted);}
const navAction=id=>[{trigger:{type:'ON_CLICK'},actions:[{type:'NODE',destinationId:id,navigation:'NAVIGATE',transition:null,preserveScrollPosition:false}]}];
await homeImage.setReactionsAsync(navAction(article.id));await homeTitle.setReactionsAsync(navAction(article.id));
await article.children[0].setReactionsAsync(navAction(home.id));
await sourceJump.setReactionsAsync([{trigger:{type:'ON_CLICK'},actions:[{type:'NODE',destinationId:sourcesTitle.id,navigation:'SCROLL_TO',transition:null,preserveScrollPosition:false}]}]);
section.resizeWithoutConstraints(6500,Math.max(section.height,home.height+100,article.height+100));
figma.viewport.scrollAndZoomIntoView([home,article]);
return {home:{id:home.id,width:home.width,height:home.height},article:{id:article.id,width:article.width,height:article.height},masthead:mast.id,theme:config.theme,width:config.width};
