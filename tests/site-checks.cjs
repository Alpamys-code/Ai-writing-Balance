/* Run with NODE_PATH pointing to a node_modules directory containing jsdom. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {JSDOM,VirtualConsole} = require("jsdom");
const root = path.resolve(__dirname,"..");
const html = fs.readFileSync(path.join(root,"index.html"),"utf8");
const tick = () => new Promise(resolve=>setTimeout(resolve,0));

function setup(endpoint="",fetcher) {
  const errors=[];const vc=new VirtualConsole();vc.on("jsdomError",error=>errors.push(error));
  const dom=new JSDOM(html,{url:"https://alpamys-code.github.io/Ai-writing-Balance/",runScripts:"outside-only",virtualConsole:vc,pretendToBeVisual:true});
  const w=dom.window;let calls=0;
  w.HTMLElement.prototype.scrollIntoView=function(){};
  w.matchMedia=()=>({matches:true});
  w.fetch=async(...args)=>{calls++;if(fetcher)return fetcher(...args);throw new Error("Unexpected network request");};
  w.eval(fs.readFileSync(path.join(root,"config.js"),"utf8"));
  w.SCRIBE_CONFIG.coach.endpoint=endpoint;
  w.eval(fs.readFileSync(path.join(root,"script.js"),"utf8"));
  w.eval(fs.readFileSync(path.join(root,"coach.js"),"utf8"));
  return {dom,w,d:w.document,errors,calls:()=>calls};
}
const draft="I believe students should learn to write their own essays because explaining a reason is part of learning. For example, planning an argument helps a writer notice missing evidence. However, a useful tool can ask questions without replacing that work.";
const feedback={kind:"assessment",scorable:true,message:"An approximate review.",overall:6,criteria:Object.fromEntries(["taskResponse","coherenceCohesion","lexicalResource","grammarAccuracy"].map(k=>[k,{band:6,reason:"The draft states a position.",strength:"A position is identifiable.",improvement:"Develop an example.",quote:"I believe"}])),strengths:["A position is identifiable."],improvements:["Develop an example."],nextStep:"Choose one reason and explain its supporting example."};
const questionReply={kind:"question",answer:"Give each paragraph one clear job and connect it to your main position.",nextStep:"Label each paragraph's role."};

(async()=>{
  const site=setup();const {d,w}=site;
  assert.equal(d.querySelectorAll("h1").length,1);
  const ids=[...d.querySelectorAll("[id]")].map(el=>el.id);
  assert.equal(new Set(ids).size,ids.length,"IDs must be unique");
  for(const anchor of d.querySelectorAll('a[href^="#"]')) assert.ok(d.querySelector(anchor.getAttribute("href")),`Missing anchor ${anchor.href}`);
  for(const node of d.querySelectorAll("[src],link[href]")) {
    const ref=node.getAttribute("src")||node.getAttribute("href");
    if(!ref || /^(https?:|data:|#)/.test(ref))continue;
    assert.ok(fs.existsSync(path.resolve(root,ref)),`Missing file ${ref}`);
  }
  for(const image of d.querySelectorAll("img")) assert.ok(image.alt.length>8);
  assert.equal(d.documentElement.lang,"en");
  assert.equal(d.querySelector('meta[name="viewport"]').content,"width=device-width, initial-scale=1.0");
  assert.ok(d.querySelector('link[rel="canonical"]').href.endsWith("/Ai-writing-Balance/"));
  assert.equal(d.querySelectorAll(".review-card").length,4);
  d.getElementById("reviewsMore").click();
  assert.equal(d.querySelectorAll(".review-card").length,10);
  assert.equal(d.getElementById("reviewsMore").getAttribute("aria-expanded"),"true");
  assert.equal(d.querySelectorAll(".demo-tag").length,10);
  d.getElementById("reviewsMore").click();assert.equal(d.querySelectorAll(".review-card").length,4);
  d.querySelector('[data-condition="assisted"]').click();assert.match(d.getElementById("conditionPanel").textContent,/23/);
  d.querySelector('[data-zone="red"]').click();assert.match(d.getElementById("zoneDetailTitle").textContent,/outsource/);
  d.querySelector('[data-essay-tab="template"]').click();assert.ok(d.querySelector('[data-essay-panel="template"]').classList.contains("active"));
  d.querySelector(".menu-toggle").click();assert.equal(d.querySelector(".menu-toggle").getAttribute("aria-expanded"),"true");
  d.getElementById("feedbackFab").click();assert.equal(d.getElementById("feedbackOverlay").getAttribute("aria-hidden"),"false");
  d.dispatchEvent(new w.KeyboardEvent("keydown",{key:"Escape"}));assert.equal(d.getElementById("feedbackOverlay").getAttribute("aria-hidden"),"true");
  assert.equal(d.getElementById("fbSubmitBtn").disabled,true,"Disconnected form must not pretend to submit");
  assert.equal(d.querySelector('label[for="fbPublicConsent"] span').textContent,"I consent to having my review displayed publicly.");
  assert.doesNotMatch(fs.readFileSync(path.join(root,"script.js"),"utf8"),/rating=gt\.4|rating > 4/);
  const field=d.getElementById("coachEssay");const form=d.getElementById("coachForm");
  d.getElementById("coachTask").value="Should artificial intelligence be used in schools?";
  field.value="Too short";form.dispatchEvent(new w.Event("submit",{cancelable:true}));
  assert.match(d.getElementById("coachNotice").textContent,/20 words/);
  field.value=draft;field.dispatchEvent(new w.Event("input"));
  assert.match(d.getElementById("coachWordCount").textContent,/words/);
  for(const focus of ["structure","argument","grammar","vocabulary"]) {
    d.querySelector(`[data-focus="${focus}"]`).click();
    form.dispatchEvent(new w.Event("submit",{cancelable:true}));
    assert.equal(d.getElementById("coachResponse").hidden,true);
    assert.match(d.getElementById("coachNotice").textContent,/not connected yet/);
  }
  field.value+=" Added revision.";field.dispatchEvent(new w.Event("input"));
  assert.equal(d.getElementById("coachResponse").hidden,true,"Do not leave stale feedback after editing");
  assert.equal(site.calls(),0,"Unconnected service must not send drafts or invent results");assert.deepEqual(site.errors,[]);site.dom.window.close();

  let payload;
  const live=setup("https://coach.example/api/coach",async(url,options)=>{
    payload=JSON.parse(options.body);return {ok:true,json:async()=>payload.action==="question"?questionReply:feedback};
  });
  live.d.getElementById("coachEssay").value=draft;
  live.d.getElementById("coachTask").value="Should artificial intelligence be used in schools?";
  live.d.getElementById("coachForm").dispatchEvent(new live.w.Event("submit",{cancelable:true}));await tick();
  assert.equal(payload.essay,draft);assert.equal(payload.action,"assess");
  assert.match(live.d.getElementById("coachResponseMode").textContent,/AI TASK 2 ESTIMATE/);
  assert.equal(live.d.querySelectorAll(".coach-criterion").length,4);
  assert.match(live.d.querySelector(".coach-band-summary").textContent,/6\.0/);
  live.d.getElementById("coachEssay").value="";
  live.d.querySelector('[data-focus="grammar"]').click();await tick();
  assert.equal(payload.action,"question");assert.equal(payload.focus,"grammar");assert.equal(payload.essay,"");
  assert.match(live.d.querySelector(".coach-answer").textContent,/paragraph/);
  assert.equal(live.d.getElementById("coachSubmit").disabled,false);assert.deepEqual(live.errors,[]);live.dom.window.close();

  const failed=setup("https://coach.example/api/coach",async()=>{throw new Error("Network unavailable");});
  failed.d.getElementById("coachEssay").value=draft;
  failed.d.getElementById("coachTask").value="Should artificial intelligence be used in schools?";
  failed.d.getElementById("coachForm").dispatchEvent(new failed.w.Event("submit",{cancelable:true}));await tick();
  assert.equal(failed.d.getElementById("coachResponse").hidden,true,"Never substitute a canned review");
  assert.match(failed.d.getElementById("coachNotice").textContent,/Network unavailable/);
  assert.equal(failed.d.getElementById("coachSubmit").disabled,false);assert.deepEqual(failed.errors,[]);failed.dom.window.close();
  console.log("PASS: document/asset links, 4/10 reviews, consent, tabs/modals, real AI question dispatch, 4-criterion rendering and failure without fake feedback.");
})().catch(error=>{console.error(error);process.exitCode=1;});
