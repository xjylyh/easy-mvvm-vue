function xjy(options = {}){
    this.$options = options;//将所有属性挂载在$options
    //this._data
    var data = this._data = this.$options.data;

    observer(data);
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
    console.log(options.el);
    new Compole(options.el,this);
}
//观察对象给对象增加Object.defineProperty()
function observer(data){
    if(typeof data!=='object') return;
    return new classObserver(data);//返回一个observer类
}

function classObserver(data){//主要逻辑
    for(let key in data){//将data中的数据通过object.defineProperty方式定义属性
        let val = data[key];
        //if(typeof val === 'object'){//这里再observer方法中做了对象检测的处理，所以注释掉;
            observer(val);
        //}
        Object.defineProperty(data,key,{
            enumerable:true,
            get(){
                return val;
            },
            set(newval){//当值发生更改
                if(newval === val){//当设置的值和之前的值储存地址一样
                    return;
                }
                val = newval;//如果以后再次获取值的时候就可以返回设置的值
                observer(newval);
            }
        })
    }
}

//vue的特点其中一个就是不能新增不存在的属性，原因是没有get和set。我理解，也就是说vue中的所有对象都被Object.defineProperty加上了get和set
//深度响应->每次赋予一个新对象时都会对其进行数据劫持


function Compole(el,xjy){
    //el表示替换的范围，在这个范围之外不必管他
    xjy.$el = document.querySelector(el);
    console.log(xjy.$el);
    let fragment = document.createDocumentFragment();
    while(child = xjy.$el.firstChild){//将替换范围之内的东西拿到内存中
        fragment.appendChild(child);
    }
    rpls(fragment);

    function rpls(fragment){//匹配元素节点进行替换
        Array.from(fragment.childNodes).forEach((node)=>{//循环每一层dom
            let text = node.textContent;
            let reg = /\{\{(.*)\}\}/;
            if(node.nodeType === 3 && reg.test(text)){
                console.log(RegExp.$1);
                let arr = RegExp.$1.split('.');
                let val = xjy;
                console.log(val);
                arr.forEach((k)=>{//xjy.info.name
                    val = val[k];
                })
                node.textContent = text.replace(reg,val);
            }
            if(node.childNodes){
                rpls(node);
            }
        })
    }



    xjy.$el.appendChild(fragment);
};

