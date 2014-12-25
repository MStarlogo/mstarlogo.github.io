// 不需要jQuery
var button_label0 = '获取视频';
var button_label1 = '正在获取';
var result_label0 = '等待提交...';
var result_label1 = '<div class="progress progress-striped active"><div class="bar" style="width: 100%;">loading...</div></div>';
var input_placeholder = '在这里粘贴视频页面的地址...(包含http://)';
var msg = "请用右键“目标另存为”或用快车下载\n【提示：大部分视频无法使用迅雷下载】";
var msg_filenamecopyed = "已复制文件名: ";
var msg_copyed = '已复制到剪切板';
var msg_xml = 'XML格式的输出所有视频，目前免费';
var msg_ckxml = 'xml格式for ckplayer，只显示第一个清晰度';

if(typeof baseurl == 'undefined')  baseurl = 'https://www.flvxz.com';

String.prototype.trim= function(){  
    // 用正则表达式将前后空格  
    // 用空字符串替代。  
    return this.replace(/(^\s*)|(\s*$)/g, "");  
}
String.prototype.queryString = function(key){
    var sValue=this.match(new RegExp("[\?\&]"+key+"=([^\&]*)(\&?)","i"));
    return sValue ? sValue[1]:sValue
}

String.prototype.setKeyValue = function(key,value){
    if(this.queryString(key) != null){
        var reg = new RegExp("([\?\&])(" + key + "=)([^\&]*)(\&?)","i");
        return this.replace(reg,"$1$2" + value + "$4");
    }else{
        var add = arguments[2];
        if(add === true){
            return this + (this.indexOf("?") > -1 ? "&" : "?") + key + "=" + value;
        }
        else{
        	return this;
        }
    }
}
function isIE(){
    var b = document.createElement('b')
    b.innerHTML = '<!--[if IE]><i></i><![endif]-->'
    return b.getElementsByTagName('i').length === 1
}

// 需要jQuery
(function ($) {

$(document).ready(function(){
	var supportPlaceholder = 'placeholder' in document.createElement('input');
	if(supportPlaceholder){
		// 设置placeholder属性
		$('#videoPageURI').attr('placeholder',input_placeholder);
	}
	else{
		// 用JS实现placeholder
		$('#videoPageURI').focus(function(){this.select();if(this.value==input_placeholder){this.value='';}});
		$('#videoPageURI').blur(function(){if(this.value==''){this.value=input_placeholder}});
	}
	$('#videoPageURI').change(function(){
		var videoPageURI = $('#videoPageURI').val();
		$('#videoPageURI').val(videoPageURI.trim());
		if(videoPageURI == '' || /^https?:/.test(videoPageURI)){
			$('#videoPageURI').parent().removeClass('control-group error');
			$('#fetchButton').attr('disabled',false);
		}
		else if(/^https?:/.test(urldecode(videoPageURI))){
			$('#videoPageURI').val(urldecode(videoPageURI));
			$('#videoPageURI').parent().removeClass('control-group error');
			$('#fetchButton').attr('disabled',false);
		}
		else{
			$('#videoPageURI').parent().addClass('control-group error');
			$('#fetchButton').attr('disabled',"disabled");
		}
	});
	//根据url的地址，执行init
	var videoPageURI = location.toString().queryString('url');
	$('#fetchButton').val(button_label0);
	if(videoPageURI==null){
		if(!supportPlaceholder) $('#videoPageURI').val(input_placeholder);
		$('#resultbox').hide();
	} else {
		if(videoPageURI.indexOf('http')===0){
			videoPageURI = urldecode(decodeURIComponent(videoPageURI));
		} else {
			videoPageURI = urldecode(videoPageURI);
			if(videoPageURI.indexOf('http')!==0 && videoPageURI.indexOf(':')===0) videoPageURI='http'+videoPageURI;
		}
		$('#videoPageURI').val(videoPageURI);
		getFlv();
	}
	$('#examplebox').show();
});
window.copyToClipboard = function(){ 
	if(window.clipboardData){ 
		window.clipboardData.clearData(); 
		var btn = $(this);
		var oldhtml = btn.html();
		window.clipboardData.setData("Text", $(this).attr('data-clipboard-text')); 
		return true;
	} 
	else{
		var clip = new ZeroClipboard(this);
		clip.on('complete', function(client, args) {
			var btn = $(this);
			var oldhtml = btn.html();
			$(this).html(msg_copyed).attr('disabled','disabled');
			setTimeout(function(){btn.html(oldhtml).attr('disabled',false);},1000);
		});
		return false;
	}
}
window.notify_finish = function(){
	$('a[rel="noreferrer"]').click(function(){
		if(isIE()) {var winobj=window.open($(this).attr('href'),"down");if(winobj==null) window.location=$(this).attr('href'); return false;}
	});
	$('.copyclipboard').each(function(){
		var clip = new ZeroClipboard(this);
		clip.on('complete', function(client, args) {
			var btn = $(this);
			var oldhtml = btn.html();
			$(this).html(msg_copyed).attr('disabled','disabled');
			setTimeout(function(){btn.html(oldhtml).attr('disabled',false);},1000);
		});
	});
}
window.getFlv = function() {
  var uri = $('#videoPageURI').val().trim();
  if( uri == null || uri == "" ) return;
  $('#fetchButton').attr('disabled',"disabled");
  $('#fetchButton').val(button_label1);
  $('#result').css('display','block');
  $('#result').html(result_label1);
  $('#visitoriginal').attr('href',uri);
  $('#resultbox').show();
  var encodedUri = urlencode(uri);
  var scriptUrl = baseurl + "/getFlv.php?url=" + encodedUri;
  //if($('#ggad').css('height')=='0px') scriptUrl = 'http://www.flvxz.com/js/adblocked.js';
	$.getScript(scriptUrl, function(){
		$('#fetchButton').attr('disabled',false);
		$('#fetchButton').val(button_label0);
	});
	//$.getScript("http://log.flvxz.com/?url="+urlencode(uri));
}
window.flvout = function(d,resultid){
	var r = $('#result');
	if(typeof resultid == "undefined"){
		if(r.html().indexOf('loading')>=0) r.html('');
		r.children('.flvxz_tobereplaced').remove();
		r.html(r.html()+d);
	}
	else{
		var tip = '......'; // 不能包含loading，因为#result判断用了loading
		var ri = $('#'+resultid);
		if(!ri[0]) r.html(r.html()+'<div id=\"'+resultid+'\">'+tip+'</div>');
		ri = $('#'+resultid); // 添加了resultid的div，重新获取
		if(ri.html()==tip) ri.html('');
		ri.children('.flvxz_tobereplaced').remove();
		ri.html(ri.html()+d);
	}
}
window.urlencode = function(uri){
	uri = uri.replace(/^(http:\/\/[^\/]*(?:youku|tudou|ku6|yinyuetai|letv|sohu|youtube|iqiyi|facebook|vimeo|cutv|cctv|pptv))xia.com\//,'$1.com/');
	uri = uri.replace(/^(http:\/\/[^\/]*(?:bilibili|acfun|pps))xia\.tv\//,'$1.tv/');
	uri = uri.replace(/^(https?:)\/\//,'$1##');
	uri = $.base64.btoa(uri);
	uri = uri.replace('+','-').replace('/','_');
	return uri;
}
window.urldecode = function(uri){
	var sharpPos;
	sharpPos = uri.indexOf('#');
	if(sharpPos>0) uri = uri.substring(0,sharpPos);
	if(/^[A-Za-z0-9=\+\/]+$/.test(uri)) uri = $.base64.atob(uri);
	else if(/^[A-Za-z0-9=\-_]+$/.test(uri)) uri = $.base64.atob(uri.replace('-','+').replace('_','/'));
	uri = uri.replace(/^(https?:)##/,'$1//');
	return uri;
}
window.parseFlv = function(){
	var uri=$('#videoPageURI').val().trim();
	uri = urlencode(uri);
	top.location = '?url=' + uri;
}

window.in_array = function(stringToSearch, arrayToSearch) {
    for (s = 0; s <arrayToSearch.length; s++) {
        thisEntry = arrayToSearch[s].toString();
        if (thisEntry == stringToSearch) {
            return true;
        }
    }
    return false;
}
window.youkupass = function(this_btn,vid){
	var pass = $(this_btn).prev().val();
	if(pass.length==0) return;
	$(this_btn).val('正在验证密码').attr('disabled', 'disabled');
	$.getScript(baseurl + "/youkupass.php?vid=" + vid + "&password=" + pass);	
}
window.youkulogin = function(this_btn,vid){
	var pass = $(this_btn).prev().val();
	var user = $(this_btn).prev().prev().val();
	if(user.length==0||pass.length==0) return;
	$(this_btn).val('正在验证密码').attr('disabled', 'disabled');
	$.getScript(baseurl + "/youkulogin.php?vid=" + vid + "&username=" + user + "&password=" + pass);	
}
window.tudoupass = function(this_btn,vid){
	var pass = $(this_btn).prev().val();
	if(pass.length==0) return;
	$(this_btn).val('正在验证密码').attr('disabled', 'disabled');
	$.getScript(baseurl + "/tudoupass.php?vid=" + vid + "&password=" + pass);	
}
window.v56pass = function(this_btn,vid,sid){
	var pass = $(this_btn).prev().val();
	if(pass.length == 0) return;
	$(this_btn).val('正在验证密码').attr('disabled', 'disabled');
	$.getScript(baseurl + "/getFlv.php?url=" + urlencode('http://www.56.com/fakeurl/vid/' + vid + "/sid/" + sid + "/password/" + pass));
}
window.kankan = function(vid,title){
	var arr = vid.split('_');
	$('#result_'+arr[2]).html('<span class="flvxz_tobereplaced">正在解析 '+title+'</span>');
	$.getScript(baseurl + "/kankan.php?vid=" + vid + '&title=' + encodeURIComponent(title) );	
}

}(jQuery));
