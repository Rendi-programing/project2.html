const STORAGE_KEY = 'todo_app_v1';
let tasks = [];
let filter = 'all';

const refs = {
  input: document.getElementById('taskInput'),
  addBtn: document.getElementById('addBtn'),
  list: document.getElementById('todoList'),
  filters: document.querySelectorAll('.filters button'),
  countText: document.getElementById('countText'),
  clearCompleted: document.getElementById('clearCompleted')
};

function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); }
function load(){ tasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,7); }

function addTask(text){
  const t = { id: uid(), text: text.trim(), completed:false };
  if(!t.text) return;
  tasks.unshift(t);
  save(); render();
}

function updateTask(id, changes){ tasks = tasks.map(t => t.id===id?{...t,...changes}:t); save(); render(); }
function removeTask(id){ tasks = tasks.filter(t => t.id!==id); save(); render(); }
function clearCompleted(){ tasks = tasks.filter(t => !t.completed); save(); render(); }
function applyFilter(list){ return filter==='active'?list.filter(t=>!t.completed):filter==='completed'?list.filter(t=>t.completed):list; }

function render(){
  const visible = applyFilter(tasks);
  refs.list.innerHTML = '';
  if(visible.length===0){
    const li=document.createElement('li'); li.className='small'; li.textContent='Belum ada tugas.';
    refs.list.appendChild(li);
  }
  visible.forEach(task => {
    const li=document.createElement('li');
    li.className='item'+(task.completed?' completed':'');

    const checkbox=document.createElement('input'); checkbox.type='checkbox'; checkbox.checked=task.completed;
    checkbox.onchange=()=>updateTask(task.id,{completed:checkbox.checked});

    const label=document.createElement('div'); label.className='label';
    const span=document.createElement('span'); span.textContent=task.text;
    label.appendChild(span);

    const editBtn=document.createElement('button'); editBtn.className='icon-btn'; editBtn.innerHTML='✏️';
    editBtn.onclick=()=>startEdit(task,li);

    const delBtn=document.createElement('button'); delBtn.className='icon-btn'; delBtn.innerHTML='🗑️';
    delBtn.onclick=()=>{ if(confirm('Hapus tugas ini?')) removeTask(task.id); };

    li.append(checkbox,label,editBtn,delBtn);
    refs.list.appendChild(li);
  });
  updateCount(); setActiveFilterButton();
}

function startEdit(task,li){
  li.innerHTML='';
  const input=document.createElement('input'); input.className='edit-input'; input.value=task.text;
  input.onkeydown=e=>{ if(e.key==='Enter') finishEdit(); if(e.key==='Escape') render(); };
  input.onblur=finishEdit;

  const saveBtn=document.createElement('button'); saveBtn.className='btn'; saveBtn.textContent='Simpan'; saveBtn.onclick=finishEdit;
  const cancelBtn=document.createElement('button'); cancelBtn.className='icon-btn'; cancelBtn.textContent='Batal'; cancelBtn.onclick=render;

  li.append(input,saveBtn,cancelBtn); input.focus();

  function finishEdit(){
    const newText=input.value.trim();
    if(newText===''){ if(confirm('Hapus tugas?')) removeTask(task.id); else render(); }
    else updateTask(task.id,{text:newText});
  }
}

function updateCount(){ const r=tasks.filter(t=>!t.completed).length; refs.countText.textContent=r+' tugas tersisa'; }
function setActiveFilterButton(){ refs.filters.forEach(btn=>btn.classList.toggle('active',btn.dataset.filter===filter)); }

refs.addBtn.onclick=()=>{ addTask(refs.input.value); refs.input.value=''; refs.input.focus(); };
refs.input.onkeydown=e=>{ if(e.key==='Enter'){ addTask(refs.input.value); refs.input.value=''; }};
refs.filters.forEach(btn=>btn.onclick=()=>{ filter=btn.dataset.filter; render(); });
refs.clearCompleted.onclick=()=>{ if(confirm('Hapus semua tugas selesai?')) clearCompleted(); };

load(); render();
