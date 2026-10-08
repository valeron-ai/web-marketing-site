const contactDialog=document.getElementById('contactDialog'),contactOpen=document.getElementById('contactOpen'),contactClose=document.getElementById('contactClose'),copyAddress=document.getElementById('copyAddress'),contactAddress=document.getElementById('contactAddress'),copyStatus=document.getElementById('copyStatus');
contactOpen.addEventListener('click',()=>{copyStatus.textContent='';contactDialog.showModal()});
contactClose.addEventListener('click',()=>contactDialog.close());
contactDialog.addEventListener('click',e=>{const b=contactDialog.getBoundingClientRect();if(e.target===contactDialog&&(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom))contactDialog.close()});
contactDialog.addEventListener('close',()=>contactOpen.focus());
copyAddress.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(contactAddress.value);copyStatus.textContent='Address copied.'}catch{contactAddress.focus();contactAddress.select();copyStatus.textContent='Address selected. Copy it with your keyboard or touch menu.'}});
contactAddress.addEventListener('click',()=>contactAddress.select());
