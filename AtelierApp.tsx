'use client';

import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase";
import { Shirt, Sparkles, Layers3, UserRound, Plus, Search, Heart, CloudSun, CalendarDays, Check, LogOut, X, Upload, WandSparkles } from "lucide-react";

type Item = { id:string; name:string; category:string; color:string; size:string|null; fit:string|null; tags:string[]; image_url:string|null; created_at:string };
type Outfit = { id:string; name:string; item_ids:string[]; occasion:string|null; aesthetic:string|null; notes:string|null; favorite:boolean; worn_at:string|null; created_at:string };

const categories = ["Top","Bottom","Shoes","Outerwear","Accessory"];
const demoItems: Item[] = [
 {id:"demo1",name:"Black knit polo",category:"Top",color:"Black",size:"M",fit:"Slim",tags:["minimal","office","evening"],image_url:null,created_at:""},
 {id:"demo2",name:"Indigo bootcut jeans",category:"Bottom",color:"Indigo",size:"29x30",fit:"Bootcut",tags:["heritage","casual","2000s"],image_url:null,created_at:""},
 {id:"demo3",name:"Cognac suede Chelsea boots",category:"Shoes",color:"Cognac",size:"10",fit:"Regular",tags:["heritage","smart casual"],image_url:null,created_at:""},
 {id:"demo4",name:"Cream long-sleeve shirt",category:"Top",color:"Cream",size:"M",fit:"Tailored",tags:["office","quiet luxury"],image_url:null,created_at:""},
 {id:"demo5",name:"Dark brown western boots",category:"Shoes",color:"Dark brown",size:"10",fit:"Regular",tags:["heritage","night out"],image_url:null,created_at:""}
];

export default function AtelierApp() {
 const [tab,setTab] = useState("Wardrobe");
 const [items,setItems] = useState<Item[]>([]);
 const [outfits,setOutfits] = useState<Outfit[]>([]);
 const [user,setUser] = useState<any>(null);
 const [email,setEmail] = useState("");
 const [password,setPassword] = useState("");
 const [notice,setNotice] = useState("Connect Supabase to save your private wardrobe across devices.");
 const [search,setSearch] = useState("");
 const [filter,setFilter] = useState("All");
 const [showAdd,setShowAdd] = useState(false);
 const [newName,setNewName] = useState("");
 const [newCategory,setNewCategory] = useState("Top");
 const [newColor,setNewColor] = useState("");
 const [newSize,setNewSize] = useState("");
 const [newFit,setNewFit] = useState("");
 const [newTags,setNewTags] = useState("minimal, office");
 const [newFile,setNewFile] = useState<File|null>(null);
 const [occasion,setOccasion] = useState("Everyday");
 const [aesthetic,setAesthetic] = useState("Heritage");
 const [weather,setWeather] = useState("Mild");
 const [temp,setTemp] = useState("70");
 const [dress,setDress] = useState("Smart casual");
 const [mood,setMood] = useState("Confident");
 const [generated,setGenerated] = useState<string[][]>([]);
 const [outfitName,setOutfitName] = useState("New outfit");
 const [wishlist,setWishlist] = useState<string[]>([]);
 const [wishText,setWishText] = useState("");
 const [history,setHistory] = useState<string[]>([]);
 const supa = useMemo(()=>{ try{return supabaseBrowser()}catch{return null} },[]);

 useEffect(()=>{ if(!supa) return; supa.auth.getUser().then(({data})=>{setUser(data.user); if(data.user) load(data.user.id)}); const {data:listener}=supa.auth.onAuthStateChange((_e,session)=>{setUser(session?.user??null); if(session?.user) load(session.user.id); else {setItems([]);setOutfits([])}}); return ()=>listener.subscription.unsubscribe(); },[]);
 async function load(uid:string){ if(!supa)return; const a=await supa.from("wardrobe_items").select("*").eq("user_id",uid).order("created_at",{ascending:false}); if(!a.error)setItems(a.data as Item[]); const b=await supa.from("outfits").select("*").eq("user_id",uid).order("created_at",{ascending:false}); if(!b.error)setOutfits(b.data as Outfit[]); }
 async function auth(signup:boolean){ if(!supa){setNotice("Add Supabase credentials to .env.local, then restart the app.");return;} const r=signup?await supa.auth.signUp({email,password}):await supa.auth.signInWithPassword({email,password}); setNotice(r.error?.message ?? (signup?"Check your email to confirm your account.":"Signed in.")); if(r.data.user){setUser(r.data.user);load(r.data.user.id)} }
 async function importStarterWardrobe(){ 
   const response=await fetch("/wardrobe-seed.json"); 
   const catalog=await response.json() as Array<{name:string;category:string;color:string;size?:string|null;fit:string;tags:string[];brand?:string;verification?:string;source_note?:string}>;
   const rows=catalog.map(x=>({id:`seed-${Math.random().toString(36).slice(2)}`,name:x.name,category:x.category,color:x.color,size:null,fit:x.fit||null,tags:[...(x.tags||[]),...(x.verification==="needs_confirmation"?["verify ownership"]:[])],image_url:null,created_at:""} as Item));
   if(user&&supa){
     const dbRows=catalog.map(x=>({user_id:user.id,name:x.name,category:x.category,color:x.color,size:null,fit:x.fit||null,tags:[...(x.tags||[]),...(x.verification==="needs_confirmation"?["verify ownership"]:[])],image_url:null}));
     const result=await supa.from("wardrobe_items").insert(dbRows).select("*");
     if(result.error){setNotice("Could not import catalog: "+result.error.message);return;}
     setItems(v=>[...(result.data as Item[]),...v]);
   } else {
     setItems(v=>{const existing=new Set(v.map(x=>x.name.toLowerCase()));return [...rows.filter(x=>!existing.has(x.name.toLowerCase())),...v]});
     setNotice("Starter catalog imported for this session. Entries are candidates from saved notes/lookbooks, not all verified owned. Sign in with Supabase to save across devices.");
   }
 }
 async function addItem(){ if(!newName.trim())return; const tags=newTags.split(",").map(x=>x.trim()).filter(Boolean); let image_url:string|null=null;
   if(user && supa){ if(newFile){const path=`${user.id}/${Date.now()}-${newFile.name.replace(/[^a-zA-Z0-9._-]/g,"_")}`;const up=await supa.storage.from("wardrobe-images").upload(path,newFile,{upsert:false});if(up.error){setNotice(up.error.message);return;} image_url=supa.storage.from("wardrobe-images").getPublicUrl(path).data.publicUrl;}
    const row={user_id:user.id,name:newName.trim(),category:newCategory,color:newColor||"Unspecified",size:newSize||null,fit:newFit||null,tags,image_url};
    const r=await supa.from("wardrobe_items").insert(row).select("*").single();if(r.error){setNotice(r.error.message);return;}setItems(v=>[r.data as Item,...v]);
   } else {setItems(v=>[{id:`local-${Date.now()}`,name:newName.trim(),category:newCategory,color:newColor||"Unspecified",size:newSize||null,fit:newFit||null,tags,image_url,created_at:""},...v]);setNotice("Saved in this session only. Sign in with Supabase for persistent cross-device storage.");}
   setShowAdd(false);setNewName("");setNewColor("");setNewSize("");setNewFit("");setNewTags("minimal, office");setNewFile(null);
 }
 async function deleteItem(id:string){if(user&&supa){const r=await supa.from("wardrobe_items").delete().eq("id",id);if(r.error){setNotice(r.error.message);return;}}setItems(v=>v.filter(x=>x.id!==id));}
 function makeOutfits(){ const tops=items.filter(x=>x.category==="Top"), bottoms=items.filter(x=>x.category==="Bottom"), shoes=items.filter(x=>x.category==="Shoes"), outer=items.filter(x=>x.category==="Outerwear"); const looks:string[][]=[];
  for(let i=0;i<Math.min(12,Math.max(tops.length,1)*Math.max(bottoms.length,1)*Math.max(shoes.length,1));i++){const t=tops[i%Math.max(tops.length,1)],b=bottoms[(i+Math.floor(i/Math.max(tops.length,1)))%Math.max(bottoms.length,1)],s=shoes[(i*2)%Math.max(shoes.length,1)];const ids=[t?.id,b?.id,s?.id].filter(Boolean) as string[];if(ids.length>=2&&!history.includes(ids.join("|"))&&!looks.some(l=>l.join("|")===ids.join("|")))looks.push(ids);if(looks.length>=4)break;}
  setGenerated(looks);setTab("Style Me");if(!looks.length)setNotice("Add at least a top, a bottom, and shoes to build more complete looks.");
 }
 async function saveOutfit(ids:string[]){if(!ids.length)return;const row={name:outfitName||`${aesthetic} look`,item_ids:ids,occasion,aesthetic,notes:`${weather}, ${temp}°F, ${dress}, ${mood}`,favorite:false,user_id:user?.id};if(user&&supa){const r=await supa.from("outfits").insert(row).select("*").single();if(r.error){setNotice(r.error.message);return;}setOutfits(v=>[r.data as Outfit,...v]);}else setOutfits(v=>[{...row,id:`local-${Date.now()}`,worn_at:null,created_at:""} as Outfit,...v]);setHistory(v=>[...v,ids.join("|")]);setNotice(user?"Outfit saved to your account.":"Outfit saved locally for this session.");setTab("Outfits");}
 async function toggleFavorite(o:Outfit){const next=!o.favorite;if(user&&supa){await supa.from("outfits").update({favorite:next}).eq("id",o.id);}setOutfits(v=>v.map(x=>x.id===o.id?{...x,favorite:next}:x));}
 async function markWorn(o:Outfit){const now=new Date().toISOString();if(user&&supa)await supa.from("outfits").update({worn_at:now}).eq("id",o.id);setOutfits(v=>v.map(x=>x.id===o.id?{...x,worn_at:now}:x));setHistory(v=>[...v,o.item_ids.join("|")]);}
 const visible=items.filter(i=>(filter==="All"||i.category===filter)&&`${i.name} ${i.color} ${i.tags.join(" ")}`.toLowerCase().includes(search.toLowerCase()));
 const itemById=(id:string)=>items.find(x=>x.id===id);
 return <main className="app">
  <header className="topbar"><a className="wordmark" onClick={()=>setTab("Wardrobe")}>ATELIER<span>.</span></a><div className="topright"><span className="eyebrow">YOUR PERSONAL STYLE ARCHIVE</span>{user?<button className="iconbtn" onClick={()=>supa?.auth.signOut()} title="Sign out"><LogOut size={17}/></button>:<button className="textbtn" onClick={()=>setTab("Profile")}>Sign in <span>↗</span></button>}</div></header>
  <section className="intro"><div><p className="eyebrow">THE WELL-DRESSED LIFE, CONSIDERED</p><h1>Wear what you<br/><i>already own.</i></h1><p className="sub">A thoughtful wardrobe. Better combinations. Your style, in one place.</p></div><div className="intro-mark">A<span> / </span>01</div></section>
  <div className="desktopnav">{["Wardrobe","Style Me","Outfits","Profile"].map((t,i)=><button key={t} className={tab===t?"navactive":""} onClick={()=>setTab(t)}>{[<Shirt size={16} key="a"/>,<Sparkles size={16} key="b"/>,<Layers3 size={16} key="c"/>,<UserRound size={16} key="d"/>][i]}{t}</button>)}</div>
  <div className="notice">{notice}</div>
  {tab==="Wardrobe"&&<section className="content"><div className="sectionhead"><div><p className="eyebrow">01 / THE ARCHIVE</p><h2>Your wardrobe<span className="count">{items.length.toString().padStart(2,"0")} PIECES</span></h2></div><div className="headactions"><button className="secondary" onClick={importStarterWardrobe}><Layers3 size={15}/> Import wardrobe list</button><button className="primary" onClick={()=>setShowAdd(true)}><Plus size={16}/> Add piece</button></div></div>
   <div className="toolbar"><div className="searchbox"><Search size={16}/><input placeholder="Search pieces, colors, tags…" value={search} onChange={e=>setSearch(e.target.value)}/></div><div className="filters">{["All",...categories].map(c=><button key={c} onClick={()=>setFilter(c)} className={filter===c?"chip selected":"chip"}>{c}</button>)}</div></div>
   {visible.length?<div className="itemgrid">{visible.map((item,i)=><article className="itemcard" key={item.id}><div className={`itemimage shade${i%6}`}>{item.image_url?<img src={item.image_url} alt={item.name}/>:<div className="placeholder"><Shirt size={34} strokeWidth={1}/><span>{item.category.toUpperCase()}</span></div>}<button className="delete" title="Remove item" onClick={()=>deleteItem(item.id)}><X size={14}/></button></div><div className="itemmeta"><div><h3>{item.name}</h3><p>{item.color} {item.size?`· ${item.size}`:""}</p></div><span className="category">{item.category}</span></div><div className="tags">{(item.tags||[]).map(t=><span key={t}>{t}</span>)}</div></article>)}</div>:<div className="empty"><Shirt size={32}/><h3>Your archive starts here.</h3><p>Add your first piece and build outfits from what you own.</p><button className="primary" onClick={()=>setShowAdd(true)}><Plus size={16}/> Add first piece</button></div>}
  </section>}
  {tab==="Style Me"&&<section className="content"><div className="sectionhead"><div><p className="eyebrow">02 / THE STYLING ROOM</p><h2>Style me.</h2><p className="muted">Build combinations from your own wardrobe.</p></div><Sparkles size={25}/></div><div className="filtersform">
   <label>Occasion<select value={occasion} onChange={e=>setOccasion(e.target.value)}>{["Everyday","Office","Date night","Dinner","Club / nightlife","Travel","Event"].map(x=><option>{x}</option>)}</select></label>
   <label>Aesthetic<select value={aesthetic} onChange={e=>setAesthetic(e.target.value)}>{["Heritage","Office siren","Quiet luxury","2000s metrosexual","Minimal","Western","Streetwear","Preppy"].map(x=><option>{x}</option>)}</select></label>
   <label>Weather<select value={weather} onChange={e=>setWeather(e.target.value)}>{["Hot","Warm","Mild","Cool","Cold","Rainy"].map(x=><option>{x}</option>)}</select></label>
   <label>Temperature °F<input type="number" value={temp} onChange={e=>setTemp(e.target.value)}/></label>
   <label>Dress code<select value={dress} onChange={e=>setDress(e.target.value)}>{["Casual","Smart casual","Business casual","Business formal","Cocktail","Black tie"].map(x=><option>{x}</option>)}</select></label>
   <label>Mood<select value={mood} onChange={e=>setMood(e.target.value)}>{["Confident","Relaxed","Romantic","Bold","Understated","Playful"].map(x=><option>{x}</option>)}</select></label>
  </div><button className="primary wide" onClick={makeOutfits}><WandSparkles size={17}/> Generate distinct outfits</button>
  {generated.length>0&&<div className="lookgrid">{generated.map((ids,i)=><article className="lookcard" key={ids.join("-")}><p className="eyebrow">LOOK 0{i+1} · {aesthetic.toUpperCase()}</p><div className="lookpieces">{ids.map(id=>{const it=itemById(id);return <div className="lookpiece" key={id}>{it?.image_url?<img src={it.image_url} alt={it.name}/>:<Shirt size={20}/>}<span>{it?.name}</span></div>})}</div><input className="outfitname" value={outfitName} onChange={e=>setOutfitName(e.target.value)} aria-label="Outfit name"/><button className="primary wide" onClick={()=>saveOutfit(ids)}>Save this outfit</button></article>)}</div>}</section>}
  {tab==="Outfits"&&<section className="content"><div className="sectionhead"><div><p className="eyebrow">03 / YOUR EDITS</p><h2>Saved outfits<span className="count">{outfits.length.toString().padStart(2,"0")} LOOKS</span></h2></div><CalendarDays size={23}/></div>{outfits.length?<div className="lookgrid">{outfits.map((o,i)=><article className="lookcard" key={o.id}><div className="outfitrow"><p className="eyebrow">LOOK 0{i+1}</p><button className="iconbtn" onClick={()=>toggleFavorite(o)}><Heart size={18} fill={o.favorite?"currentColor":"none"}/></button></div><h3>{o.name}</h3><p className="muted">{o.aesthetic} · {o.occasion}</p><div className="saveditems">{o.item_ids.map(id=>{const it=itemById(id);return it?<span key={id}>{it.name}</span>:null})}</div><p className="tiny">{o.worn_at?`Worn ${new Date(o.worn_at).toLocaleDateString()}`:"Not worn yet"}</p><button className="secondary wide" onClick={()=>markWorn(o)}><Check size={15}/> Mark as worn</button></article>)}</div>:<div className="empty"><Layers3 size={32}/><h3>Your next signature look.</h3><p>Generate a combination and save it here.</p><button className="primary" onClick={()=>setTab("Style Me")}>Go to Style Me ↗</button></div>}
  <div className="wishlist"><p className="eyebrow">THE WISHLIST</p><h3>Pieces worth considering</h3><div className="wishadd"><input value={wishText} onChange={e=>setWishText(e.target.value)} placeholder="Add a missing piece…"/><button className="secondary" onClick={()=>{if(wishText.trim()){setWishlist(v=>[...v,wishText.trim()]);setWishText("")}}}>Add</button></div>{wishlist.map((w,i)=><div className="wishrow" key={`${w}-${i}`}>{w}<button onClick={()=>setWishlist(v=>v.filter((_,j)=>j!==i))}>Remove</button></div>)}</div></section>}
  {tab==="Profile"&&<section className="content profile"><p className="eyebrow">04 / YOUR ACCOUNT</p><h2>Your style, <i>kept private.</i></h2><p className="muted">Sign in to keep your wardrobe, outfit edits, and favorites synced across devices.</p><div className="authbox"><label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 8 characters"/></label><div className="authactions"><button className="primary" onClick={()=>auth(false)}>Sign in</button><button className="secondary" onClick={()=>auth(true)}>Create account</button></div><p className="tiny">Your account is managed by Supabase. Never share your password.</p></div><div className="featurelist"><p><Check size={16}/> Private wardrobe and photo storage</p><p><Check size={16}/> Saved outfits and wear history</p><p><Check size={16}/> Same account on phone and desktop</p><p><CloudSun size={16}/> Weather-aware styling filters</p></div></section>}
  <footer><span>ATELIER<span className="dot">.</span></span><span>LESS, BUT BETTER.</span><span>WARDROBE / STYLE / REPEAT</span></footer>
  <nav className="bottomnav">{["Wardrobe","Style Me","Outfits","Profile"].map((t,i)=><button key={t} className={tab===t?"navactive":""} onClick={()=>setTab(t)}>{[<Shirt size={19} key="a"/>,<Sparkles size={19} key="b"/>,<Layers3 size={19} key="c"/>,<UserRound size={19} key="d"/>][i]}<span>{t}</span></button>)}</nav>
  {showAdd&&<div className="modalback" onClick={()=>setShowAdd(false)}><div className="modal" onClick={e=>e.stopPropagation()}><div className="modalhead"><div><p className="eyebrow">ADD TO YOUR ARCHIVE</p><h2>New piece</h2></div><button className="iconbtn" onClick={()=>setShowAdd(false)}><X/></button></div><label>Item photo<div className="uploadbox"><Upload size={20}/><span>{newFile?newFile.name:"Choose a clothing photo"}</span><input type="file" accept="image/*" onChange={e=>setNewFile(e.target.files?.[0]||null)}/></div></label><label>Item name<input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="e.g. Black knit polo" required/></label><div className="twofields"><label>Category<select value={newCategory} onChange={e=>setNewCategory(e.target.value)}>{categories.map(c=><option>{c}</option>)}</select></label><label>Color<input value={newColor} onChange={e=>setNewColor(e.target.value)} placeholder="Black"/></label><label>Size<input value={newSize} onChange={e=>setNewSize(e.target.value)} placeholder="M / 29x30"/></label><label>Fit<input value={newFit} onChange={e=>setNewFit(e.target.value)} placeholder="Slim / bootcut"/></label></div><label>Style tags <span className="muted">(comma separated)</span><input value={newTags} onChange={e=>setNewTags(e.target.value)} placeholder="heritage, office, date night"/></label><button className="primary wide" onClick={addItem}><Plus size={16}/> Save piece</button></div></div>}
 </main>;
}