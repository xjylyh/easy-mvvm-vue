function Vue(options={}){
    this.$options = options;
    var data = this._data = options.data;
    observer(data);
    for(let key in data){
        Object.defineProperty(this,key,{
            enumerable:true,
            get(){
                return this._data[key]
            },
            set(newval){
                this._data[key] = newval;
            }
        })
    }
    new Compole(options.el,this);
}

function observer(data){
    if(typeof data!=='object') return;
    return new classObserver(data);
}

function classObserver(data){
    for(let key in data){
        let val = data[key];
        observer(val);
        Object.defineProperty(data,key,{
            enumerable:true,
            get(){
                return val;
            },
            set(newval){
                if(val===newval) return;
                val = newval;
                observer(val);
            }
        })
    }
}

function Compole(el,vm){
    vm.$el = document.querySelector(el);
    let fragment = document.createDocumentFragment();
    while(child = vm.$el.firstChild){//将替换范围之内的东西拿到内存中
        fragment.appendChild(child);
    }
    repl(fragment);
    function repl(fragment){
        Array.from(fragment.childNodes).forEach((node)=>{//循环每一层dom
            let text = node.textContent;
            let reg = /\{\{(.*)\}\}/;
            if(node.nodeType === 3 && reg.test(text)){
                let arr = RegExp.$1.split('.');
                let val = vm;
                arr.forEach((k)=>{//vm.info.name
                    val = val[k];
                })
                node.textContent = text.replace(reg,val);
            }
            if(node.childNodes){
                repl(node);
            }
        })
    }
    vm.$el.appendChild(fragment);
}