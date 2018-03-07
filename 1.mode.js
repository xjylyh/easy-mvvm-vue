// 发布订阅模式  先订阅  再有发布 [fn1.fn2.fn3]

//绑定的方法 都有一个update属性
function Dep(){
    this.subs = [];//事件池
}
Dep.prototype.addsub = function(sub){//订阅
    this.subs.push(sub);
}
Dep.prototype.notify = function(){
    this.subs.forEach(sub=>sub.update());
}

function watcher(fn){
    this.fn = fn;
}
watcher.prototype.update = function(){
    this.fn();
}

let watch = new watcher(function(){//监听函数
    console.log('fabu');
})

let dep = new Dep();
dep.addsub(watch);
dep.addsub(watch);
console.log(dep.subs);
dep.notify();