const sb=supabase.createClient(window.SUPABASE_URL,window.SUPABASE_ANON_KEY);
const $=id=>document.getElementById(id);let leads=[];
function msg(el,t,err=false){el.textContent=t;el.className="message"+(err?" error":"")}
function login(){ $("loginPanel").hidden=false;$("dashboardPanel").hidden=true}
function dashboard(u){$("loginPanel").hidden=true;$("dashboardPanel").hidden=false;$("userEmail").textContent=u?.email||""}
async function load(){
 msg($("dashboardMessage"),"Loading leads…");
 const {data,error}=await sb.from("leads").select("*").order("created_at",{ascending:false});
 if(error){msg($("dashboardMessage"),error.message,true);return}
 leads=data||[];render();msg($("dashboardMessage"),"Updated "+new Date().toLocaleTimeString());
}
function esc(v){return String(v??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}
function render(){
 const q=$("searchInput").value.toLowerCase(), st=$("statusFilter").value;
 const rows=leads.filter(x=>(!st||x.status===st)&&[x.name,x.business,x.email,x.phone,x.service,x.message,x.status].filter(Boolean).join(" ").toLowerCase().includes(q));
 $("leadCount").textContent=rows.length+" lead"+(rows.length===1?"":"s");
 $("leadsBody").innerHTML=rows.length?rows.map(x=>`<tr data-id="${esc(x.id)}"><td><b>${esc(x.name)}</b><small>${x.created_at?new Date(x.created_at).toLocaleString():""}</small></td><td>${esc(x.business)}</td><td><a href="tel:${esc(x.phone)}">${esc(x.phone)}</a><small>${esc(x.email)}</small></td><td>${esc(x.service)}</td><td class="messagecell">${esc(x.message)}</td><td><select class="status">${["new","contacted","qualified","won","lost"].map(s=>`<option ${x.status===s?"selected":""}>${s}</option>`).join("")}</select></td><td><textarea class="notes" rows="2" placeholder="Add notes…">${esc(x.notes)}</textarea><button class="save">Save</button></td></tr>`).join(""):`<tr><td colspan="7" class="empty">No matching leads.</td></tr>`;
 document.querySelectorAll(".save").forEach(b=>b.onclick=save);
}
async function save(e){
 const r=e.target.closest("tr"),id=r.dataset.id;e.target.disabled=true;e.target.textContent="Saving…";
 const {data,error}=await sb.from("leads").update({status:r.querySelector(".status").value,notes:r.querySelector(".notes").value.trim()}).eq("id",id).select().single();
 if(error){alert(error.message);e.target.disabled=false;e.target.textContent="Save";return}
 const i=leads.findIndex(x=>String(x.id)===String(id));if(i>=0)leads[i]=data;
 e.target.textContent="Saved";setTimeout(()=>{e.target.disabled=false;e.target.textContent="Save"},900);
}
$("loginForm").onsubmit=async e=>{e.preventDefault();msg($("loginMessage"),"Signing in…");const {data,error}=await sb.auth.signInWithPassword({email:$("email").value.trim(),password:$("password").value});if(error){msg($("loginMessage"),error.message,true);return}dashboard(data.user);load()};
$("logoutBtn").onclick=async()=>{await sb.auth.signOut();login()};
$("refreshBtn").onclick=load;$("searchInput").oninput=render;$("statusFilter").onchange=render;
sb.auth.onAuthStateChange((_,s)=>s?dashboard(s.user):login());
(async()=>{const {data}=await sb.auth.getSession();if(data.session){dashboard(data.session.user);load()}else login()})();