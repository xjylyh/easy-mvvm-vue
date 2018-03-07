function xjy(options = {}){
    this.$options = options;//将所有属性挂载在$options
    //this._data
    var data = this._data = this.$options.data;

    observe(data);
//使用this代理this._data
    for(let key in data){
        Object.defineProperty(this,key,{
            enumerable:true,
            get(){
                return this._data[key];
            },
            set(newval){
                this._data[key] = newval;
            }
        })
    }
    initComputed.call(this);
    new Compole(options.el,this);
}

function initComputed(){
    let vm = this;
    let computed = vm.$options.computed;
    Object.keys(computed).forEach((k)=>{
        Object.defineProperty(vm,k,{
            get:typeof computed[k]==='function'?computed[k]:computed[k].get,
            set(){}
        })
    })
}

//观察对象给对象增加Object.defineProperty()
function observe(data){//observe->观察
    if(typeof data!=='object') return;
    return new classobserve(data);//返回一个observe类
}

function classobserve(data){//主要逻辑
    let dep = new Dep();
    for(let key in data){//将data中的数据通过object.defineProperty方式定义属性
        let val = data[key];
        //if(typeof val === 'object'){//这里再observe方法中做了对象检测的处理，所以注释掉;
            observe(val);
        //}
        Object.defineProperty(data,key,{
            enumerable:true,
            get(){
                Dep.target&&dep.addsub(Dep.target);//[watcher,...]
                return val;
            },
            set(newval){//当值发生更改
                if(newval === val){//当设置的值和之前的值储存地址一样
                    return;
                }
                val = newval;//如果以后再次获取值的时候就可以返回设置的值
                observe(newval);
                dep.notify();
            }
        })
    }
}

function Compole(el,xjy){
    //el表示替换的范围，在这个范围之外不必管他
    xjy.$el = document.querySelector(el);
    let fragment = document.createDocumentFragment();
    while(child = xjy.$el.firstChild){//将替换范围之内的东西拿到内存中
        fragment.appendChild(child);
    }
    rpls(fragment);

    function rpls(fragment){//匹配元素节点进行替换
        Array.from(fragment.childNodes).forEach((node)=>{//循环每一层dom
            console.log(node);
            let text = node.textContent;
            let reg = /\{\{(.*)\}\}/;
            if(node.nodeType === 3 && reg.test(text)){
                let arr = RegExp.$1.split('.');
                let val = xjy;
                arr.forEach((k)=>{//xjy.info.name
                    val = val[k];
                })
                new watcher(xjy,RegExp.$1,function(newval){//在函数中需要接受一个新值
                    node.textContent = text.replace(reg,newval);
                })
                //替换的逻辑
                node.textContent = text.replace(reg,val);
            }
            if(node.nodeType === 1){
                let nodeAttrs = node.attributes;
                Array.from(nodeAttrs).forEach((attr)=>{
                    let name = attr.name;
                    let str = 'v-';
                    let exp = attr.value;
                    if(name.includes(str)){
                        node.value = xjy[exp];
                    }
                    new watcher(xjy,exp,function(newval){
                        node.value = newval;
                    })
                    node.addEventListener('input',function(e){
                        let newval = e.target.value;
                        xjy[exp] = newval;
                    })
                })
            }
            if(node.childNodes){
                rpls(node);
            }
        })
    }
    xjy.$el.appendChild(fragment);
};

//vue的特点其中一个就是不能新增不存在的属性，原因是没有get和set。我理解，也就是说vue中的所有对象都被Object.defineProperty加上了get和set
//深度响应->每次赋予一个新对象时都会对其进行数据劫持


//发布订阅模式实现（简单的观察者模式）
//首先一定是   先有订阅   再有发布
function Dep(){
    this.subs = [];//首先需要一个对象池，在储存所有的订阅
}

Dep.prototype.addsub = function(sub){//完成订阅事件队列
    this.subs.push(sub);
}

Dep.prototype.notify = function(){
    this.subs.forEach((sub)=>{
        sub.update();
    });
}
//watcher
function watcher(vm,exp,fn){//定义一个观察者
    this.vm = vm;
    this.exp = exp;
    this.fn = fn;
    Dep.target = this;//将watcher添加到订阅中
    let val = vm;
    let arr = exp.split('.');
    arr.forEach((k)=>{
        val = val[k];
    })
    Dep.target = null;
}

watcher.prototype.update = function(){//自身的更新方法，也就是发布者需要调用的发布方法
    let val = this.vm;
    let exp = this.exp;
    let arr = exp.split('.');
    arr.forEach((k)=>{
        val = val[k]
    })
    this.fn(val);
}



