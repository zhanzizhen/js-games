在网上搜到这两个小游戏，觉得很有趣，改进了一下。发出来共享

**1.打飞机游戏**

```js
var z = document.createElement('script'); 
z.type='text/javascript'; document.body.appendChild(z);
z.src='https://zhanzizhen.github.io/js-games/airplane.js'; 
```
     
将以上粘贴到控制台输出，关掉控制台，静待片刻便有小飞机出现，以下是控制键:

 - space ：发射导弹摧毁网页的element
 - top:前进
 - left,right:控制方向

**2.粘灰尘游戏**

```js
var i,s,ss=['https://zhanzizhen.github.io/js-games/dirty.js','https://ajax.googleapis.com/ajax/libs/jquery/1.5.1/jquery.min.js'];
for(i=0;i<ss.length;i++){
  s=document.createElement('script');
  s.src=ss[i];
  document.body.appendChild(s);
}
```
    

将以上粘贴到控制台输出，关掉控制台，静待片刻便有小球出现，用鼠标右键带动小球向前滚动。

**\*提示\***

有些页面有csp限制，无法加载脚本，所以玩不了，比如github。




----------


*打飞机原址：https://kickassapp.com/
粘灰尘原址：http://kathack.com/*
