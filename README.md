在网上搜到这两个小游戏，觉得很有趣，但原来的链接不能用了，小改了一下，发出来共享

**1.打飞机游戏**


      var z = document.createElement('script'); 
      z.type='text/javascript'; document.body.appendChild(z);
      z.src='http://hi.kickassapp.com/kickass.js'; 
      

将以上粘贴到控制台输出，关掉控制台，静待片刻便有小飞机出现，以下是控制键:

 - space ：发射导弹摧毁网页的element
 - top:前进
 - left,right:控制方向

**2.粘灰尘游戏**


    var i,s,ss=['http://kathack.com/js/kh.js','http://ajax.googleapis.com/ajax/libs/jquery/1.5.1/jquery.min.js'];
    for(i=0;i<ss.length;i++){
    	s=document.createElement('script');
    	s.src=ss[i];
    	document.body.appendChild(s);
    }
    

将以上粘贴到控制台输出，关掉控制台，静待片刻便有小球出现，用鼠标右键带动小球向前滚动。

**\*提示\***

由于浏览器的安全限制，在https页面上默认不能对http请求资源，chrome上你会出现'Mixed Content'的报错提示.


解决方法是：

 1. 找个http页面然后愉快玩耍
 
 2. 点击chrome地址栏右边的那个小图标，点击允许加载脚本，然后愉快玩耍。



----------


*打飞机原址：https://kickassapp.com/
粘灰尘原址：http://kathack.com/*
