/* Scribe AI calls a real model service only. There are no local/fake assessments. */
(function(){
  "use strict";
  const essay=document.getElementById("coachEssay"),task=document.getElementById("coachTask"),form=document.getElementById("coachForm");
  if(!essay||!task||!form)return;
  const submit=document.getElementById("coachSubmit"),notice=document.getElementById("coachNotice"),mode=document.getElementById("coachMode"),response=document.getElementById("coachResponse"),buttons=[...document.querySelectorAll(".coach-question")];
  const endpoint=String(window.SCRIBE_CONFIG?.coach?.endpoint||"").trim();
  const criteria={taskResponse:"Task Response",coherenceCohesion:"Coherence and Cohesion",lexicalResource:"Lexical Resource",grammarAccuracy:"Grammatical Range and Accuracy"};
  let busy=false,controller=null,revision=0;
  const words=text=>(text.match(/[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu)||[]).length;
  mode.textContent=endpoint?"AI service configured · ready to connect":"AI connection pending · no assessment is generated";
  function edited(){revision++;controller?.abort();document.getElementById("coachWordCount").textContent=`${words(essay.value)} words`;if(!response.hidden){response.hidden=true;notice.textContent="Your text changed. Send it again for updated feedback.";}else if(!busy)notice.textContent="";}
  essay.addEventListener("input",edited);task.addEventListener("input",edited);
  function textElement(tag,text,className){const el=document.createElement(tag);el.textContent=text;if(className)el.className=className;return el;}
  function valid(data,action){
    const str=(x,n)=>typeof x==="string"&&x.trim().length>0&&x.length<=n;
    if(!data||!str(data.nextStep,240))return false;
    if(action==="question")return data.kind==="question"&&str(data.answer,1800);
    if(data.kind!=="assessment"||typeof data.scorable!=="boolean"||!str(data.message,400))return false;
    for(const key of Object.keys(criteria)){const c=data.criteria?.[key];if(!c||!str(c.reason,300)||!str(c.strength,220)||!str(c.improvement,250)||typeof c.quote!=="string"||c.quote.length>100||(c.quote&&!essay.value.includes(c.quote)))return false;if(data.scorable?(!Number.isInteger(c.band)||c.band<0||c.band>9):c.band!==null)return false;}
    if(![data.strengths,data.improvements].every(list=>Array.isArray(list)&&list.length>=1&&list.length<=3&&list.every(x=>str(x,220))))return false;
    const expected=data.scorable?Math.round(Object.keys(criteria).reduce((n,k)=>n+data.criteria[k].band,0)/4*2)/2:null;
    return data.overall===expected;
  }
  function render(data,action){
    const container=document.getElementById("coachObservations");container.replaceChildren();
    document.getElementById("coachResponseMode").textContent=action==="assess"?"AI TASK 2 ESTIMATE · NOT AN OFFICIAL IELTS RESULT":"SCRIBE AI ANSWER";
    document.getElementById("coachResponseTitle").textContent=action==="assess"?"Your essay review":"Let's work on your writing";
    if(action==="question")container.append(textElement("p",data.answer,"coach-answer"));
    else{
      const summary=textElement("div","","coach-band-summary");
      summary.append(textElement("span",data.scorable?"Estimated Task 2 band":"No band estimate"),textElement("strong",data.overall===null?"—":data.overall.toFixed(1)),textElement("p",data.message));container.append(summary);
      const grid=textElement("div","","coach-criteria-grid");
      for(const[key,label]of Object.entries(criteria)){
        const item=data.criteria[key],article=textElement("article","","coach-criterion");
        article.append(textElement("h4",label),textElement("span",item.band===null?"Diagnostic feedback":`Band ${item.band} / 9`,"criterion-band"),textElement("p",item.reason));
        if(item.quote)article.append(textElement("blockquote",item.quote));
        article.append(textElement("p",`Strength: ${item.strength}`,"criterion-strength"),textElement("p",`Improve: ${item.improvement}`,"criterion-improve"));grid.append(article);
      }
      container.append(grid);
      for(const[label,list]of [["Your strengths",data.strengths],["Priorities for improvement",data.improvements]]){
        container.append(textElement("h4",label,"coach-list-title"));const ul=document.createElement("ul");ul.className="coach-feedback-list";list.forEach(item=>ul.append(textElement("li",item)));container.append(ul);
      }
    }
    document.getElementById("coachNextStep").textContent=data.nextStep;
    response.hidden=false;response.focus({preventScroll:true});response.scrollIntoView({behavior:window.matchMedia?.("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"nearest"});
  }
  async function send(action,focus){
    if(busy)return;
    const draft=essay.value.trim(),question=task.value.trim();notice.textContent="";
    if(action==="assess"&&question.length<10){notice.textContent="Please paste the essay question first so the AI can assess Task Response.";task.focus();return;}
    if(action==="assess"&&words(draft)<20){notice.textContent="Please add at least 20 words from your own essay. A complete Task 2 response normally needs at least 250 words.";essay.focus();return;}
    if(draft.length>12000||question.length>1500){notice.textContent="Please shorten the text to fit the field limits.";return;}
    if(!endpoint){notice.textContent="Scribe AI is not connected yet. No draft was sent and no assessment was generated.";return;}
    busy=true;const version=revision;controller=new AbortController();
    submit.disabled=true;buttons.forEach(b=>b.disabled=true);form.setAttribute("aria-busy","true");response.hidden=true;
    submit.textContent=action==="assess"?"Assessing your essay…":"Asking Scribe AI…";mode.textContent="Connecting to the AI…";
    const timeout=setTimeout(()=>controller?.abort(),60000);
    try{
      const url=new URL(endpoint,location.href);if(url.protocol!=="https:"&&!["localhost","127.0.0.1"].includes(url.hostname))throw new Error("The AI service address is invalid.");
      const res=await fetch(url.href,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action,focus,task:question,essay:draft}),signal:controller.signal,credentials:"omit"});
      if(!res.ok){let message;try{message=(await res.json()).error;}catch{}throw new Error(typeof message==="string"?message.slice(0,240):"The AI service is unavailable. Please try later.");}
      const data=await res.json();if(version!==revision)return;
      if(!valid(data,action))throw new Error("The AI returned an incomplete review. Please try again.");
      mode.textContent="Connected · real AI feedback";mode.classList.add("is-live");render(data,action);
    }catch(error){
      mode.classList.remove("is-live");mode.textContent="AI request did not complete";
      notice.textContent=version!==revision?"Your text changed. Send it again when you are ready.":error.name==="AbortError"?"The AI took too long. Your text is still here; please try again.":error.message;
      // Deliberately no canned/rule-based substitute for a failed model request.
    }finally{clearTimeout(timeout);controller=null;busy=false;submit.disabled=false;buttons.forEach(b=>b.disabled=false);submit.textContent="Assess my essay";form.removeAttribute("aria-busy");}
  }
  buttons.forEach(button=>button.addEventListener("click",()=>send("question",button.dataset.focus)));
  form.addEventListener("submit",event=>{event.preventDefault();send("assess");});
})();
