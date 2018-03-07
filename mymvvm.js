function Vue(options={}){
    this.$options = options;
    var data = this._data = options.data;
    observe(data);
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

function observe(data){
    if(typeof data!=='object') return;
    return new classobserve(data);
}

function classobserve(data){
    let dep = new Dep();
    for(let key in data){
        let val = data[key];
        observe(val);
        Object.defineProperty(data,key,{
            enumerable:true,
            get(){
                Dep.target&&dep.addsub(Dep.target);
                return val;
            },
            set(newval){
                if(val===newval) return;
                val = newval;
                observe(val);
                dep.notify();
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
                new watcher(vm,RegExp.$1,function(newval){
                    node.textContent = text.replace(reg,newval);
                })
                node.textContent = text.replace(reg,val);
            }
            if(node.nodeType===1){
                let nodeAttrs = node.attributes;
                console.log(nodeAttrs);
                Array.from(nodeAttrs).forEach((attr)=>{
                    console.log(attr);
                    let name = attr.name;
                    let str = 'v-';
                    let exp = attr.value;
                    new watcher(vm,exp,function(newval){
                        node.value = newval;
                    })
                    if(exp.includes('.')){
                        let arr = exp.split('.');
                        let val = vm;
                        arr.forEach((k)=>{
                            val = val[k];
                        })
                        if(name.includes(name)){
                            node.value = val;
                        }
                        node.addEventListener('input',function(e){
                            let val = e.target.value;
                            console.log(val);
                            let vmm = vm;
                            vmm[arr[0]][arr[1]] = val;
                            console.log(vmm);
                        })
                    }else{
                        if(name.includes(name)){
                            node.value = vm[exp];
                        }
                        node.addEventListener('input',function(e){
                            let val = e.target.value;
                            vm[exp] = val;
                        })
                    }
                })
            }
            if(node.childNodes){
                repl(node);
            }
        })
    }
    vm.$el.appendChild(fragment);
}

function Dep(){
    this.subs = [];
}
Dep.prototype.addsub = function(sub){
    this.subs.push(sub);
}
Dep.prototype.notify = function(){
    this.subs.forEach((sub)=>{
        sub.update();
    })
}

function watcher(vm,exp,fn){
    this.vm = vm;
    this.exp = exp;
    this.fn = fn;
    Dep.target = this;
    let arr = exp.split('.');
    let val = vm;
    arr.forEach((k)=>{
        val = val[k];
    })
    Dep.target = null;
}
watcher.prototype.update = function(){
    let newval = this.vm;
    let exp = this.exp;
    let arr = exp.split('.');
    arr.forEach((k)=>{
        newval = newval[k];
    })
    this.fn(newval);
}