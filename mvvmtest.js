function Vue(options = {}){
    this.$options = options;
    var data = this.data = this.$options.data;
    observe(data);
    new tempc(options.el,this);
}

function observe(data){
    if(typeof data!=='object') return;
    return new classObject(data);
}

function classObject(data){
    for(let key in data){
        let val = data[key];
        observe(val);
        Object.defineProperty(data,key,{
            enumerable:true,
            get(){
                return val;
            },
            set(newval){
                val = newval;
                observe(val);
            }
        })
    }
}
function tempc(el,vm){
    vm.$el = document.querySelector(el);
    let fragment = document.createDocumentFragment();
    while(child = vm.$el.firstChild){
        fragment.appendChild(child);
    }
    rpls(fragment);
    function rpls(fragment){
        Array.from(fragment.childNodes).forEach((node)=>{
            console.log(node.textContent);
        })
    }
}