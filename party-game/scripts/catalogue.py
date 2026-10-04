#!/usr/bin/env python3
"""Rebuild a source-mapped catalogue without editing the legacy library."""
import csv, hashlib, json, re, subprocess
from pathlib import Path

APP = Path(__file__).resolve().parents[1]
ROOT = APP.parent
FAMILIES = ['armors','backgrounds','campaigns','character_sheets','classes','encounters',
 'equipment','factions','feats','hazards','jobs','locations','magic_items',
 'miscellaneous_objects','monsters','npcs','quests','races','rules','skills','spells','treasure','weapons','brand','design']
assets = {}
files = []
theme_words = {
 'dating':['dating','romance','date','flirt','ghost','relationship','social','mixer','charm','overshar','attract','tinder','situationship'],
 'cryptocon':['crypto','invest','startup','founder','pitch','finance','network','blockchain'],
 'coworking':['cowork','nomad','travel','wifi','coffee','hostel','visa','remote','burnout','tropic']}
tag_words = {
 'first_impressions':['first impression','dating','date','flirt','attract','tinder'],
 'wellness':['yoga','wellness','therapy','spiritual','healing','meditation'],
 'tech':['tech','code','wifi','software','algorithm','laptop'],
 'money':['money','crypto','cash','wealth','invest','bill','finance'],
 'boundaries':['boundary','boundaries','ghost','overshar','relationship','consent'],
 'status':['influence','clout','fame','status','luxury','instagram'],
 'travel':['travel','nomad','country','countries','visa','tourist'],
 'nightlife':['party','bar','night','alcohol','club','drink'],
 'awkward':['awkward','cringe','small talk','silence','embarrass'],
 'office':['office','corporate','meeting','work','email']}

def slug(s):
 return re.sub(r'[^a-z0-9]+','_',s.lower()).strip('_')

def classify(text):
 t=text.lower()
 tags=[key for key,words in tag_words.items() if any(w in t for w in words)]
 campaigns=[key for key,words in theme_words.items() if any(w in t for w in words)]
 return tags or ['social'], campaigns or ['general']

def add(key,name,family,kind,text,ref,jokes=None,candidates=None):
 tags,campaigns=classify(name+' '+text)
 if key not in assets:
  assets[key]={'id':key,'name':name,'family':family,'assetType':kind,'sourceRefs':[],
   'variants':[],'originalJokes':[],'tags':tags,'campaigns':campaigns,
   'comicPremise':(jokes or [name])[0][:300], 'visualMotifs':[name]+tags[:3],
   'adaptationStatus':'candidate' if family not in ['rules','brand','design'] else 'reference',
   'classificationStatus':'inferred','candidates':candidates or [],'relatedIds':[]}
 a=assets[key]; a['sourceRefs'].append(ref); a['variants'].append({'sourceRef':ref,'text':text})
 a['originalJokes']=list(dict.fromkeys(a['originalJokes']+(jokes or [])))
 a['tags']=sorted(set(a['tags']+tags)); a['campaigns']=sorted(set(a['campaigns']+campaigns))

def markdown_text(path):
 # Gate large document reads through docpipe; cache is local and disposable.
 if path.stat().st_size < 8000:
  return path.read_text()
 result=subprocess.run(['docpipe','convert',str(path),'--profile','markdown_canonical','--json',
  '--out',str(APP/'.cache'/'docpipe')],capture_output=True,text=True,check=True)
 report=json.loads(result.stdout.strip().splitlines()[-1])['report']
 return (Path(report['package_dir'])/'document.md').read_text()

paths=sorted([p for f in FAMILIES for p in (ROOT/f).rglob('*') if p.is_file()]+[ROOT/'ddn_palette_swatch.png'])
for path in paths:
 if path.suffix.lower() not in ['.csv','.md','.png','.svg','.jpg','.jpeg','.webp','.html']:
  continue
 rel=path.relative_to(ROOT).as_posix(); family=path.parts[len(ROOT.parts)] if '/' in rel else 'brand'
 digest=hashlib.sha256(path.read_bytes()).hexdigest()
 files.append({'path':rel,'sha256':digest,'bytes':path.stat().st_size})
 ref={'path':rel,'sha256':digest}
 if path.suffix=='.csv':
  rows=list(csv.DictReader(path.open(newline='')))
  for n,row in enumerate(rows,2):
   row={k if k is not None else '_extra_columns':v for k,v in row.items()}
   if not row.get('name','').strip(): continue
   name=row['name'].strip()
   identity=row.get('id') or next((v for k,v in row.items() if k and k.endswith('_id') and v and k not in ['class_id','location_id','faction_id']),None) or slug(name)
   key='source_'+family+'_'+slug(identity)
   jokes=[row[k].strip() for k in ['flavor_text','description','setup_text','personality','notes','features','feature','benefits'] if row.get(k,'').strip()]
   candidates=[]
   if family in ['classes','backgrounds','feats']:
    candidates=[{'id':key+':card','name':name,'type':'class' if family=='classes' else 'trait','field':'row'}]
   if family=='classes':
    for feature in (row.get('features') or '').split(';'):
     fname=feature.strip().split('|')[0].partition(':')[2]
     if fname: candidates.append({'id':key+':'+slug(fname),'name':fname,'type':'trait','field':'features'})
   add(key,name,family,'record',json.dumps(row,ensure_ascii=False,sort_keys=True),dict(ref,row=n),jokes,candidates)
 elif path.suffix=='.md':
  body=markdown_text(path)
  sections=re.split(r'(?m)^(#{1,6} .+)$',body)
  if sections[0].strip(): add('source_doc_'+slug(rel)+'_intro',path.stem,family,'prose',sections[0],ref,[sections[0][:500]])
  for i in range(1,len(sections),2):
   heading=sections[i].lstrip('# ').strip(); body=sections[i+1] if i+1<len(sections) else ''
   key='source_doc_'+slug(rel)+'_'+slug(heading)
   add(key,heading,family,'prose',body,dict(ref,heading=heading),[body.strip()[:500]] if body.strip() else [])
 else:
  name=path.stem.replace('_',' ')
  add('source_visual_'+slug(rel),name,family,'visual',rel,ref)

# Match duplicate representations by normalized title, retaining every source variant.
def normalize(name): return re.sub(r'^(the|a|an)_','',slug(re.sub(r'^\d+[.)]?\s*','',name)))
groups={}
for asset in assets.values(): groups.setdefault(normalize(asset['name']),[]).append(asset['id'])
for group in groups.values():
 for key in group: assets[key]['relatedIds']=[x for x in group if x!=key]
result={'schemaVersion':1,'classification':'inferred; editorial review required before playable approval',
 'files':files,'assets':sorted(assets.values(),key=lambda a:a['id']),
 'coverage':{f:sum(1 for a in assets.values() if a['family']==f) for f in FAMILIES}}
target=APP/'content'/'catalogue.json'; target.parent.mkdir(parents=True,exist_ok=True)
target.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'files':len(files),'assets':len(assets),'candidates':sum(len(a['candidates']) for a in assets.values()),'coverage':result['coverage']}))
