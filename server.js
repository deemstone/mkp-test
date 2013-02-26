var connect = require('connect');
//var route = require('router')();
var http = require('http'),
	socketio = require('socket.io');
//定义一些路径 
var pub = __dirname;

var app = connect();
app.use(connect.static(pub));
app.use(connect.errorHandler({ dump: true, stack: true }));
app.use(connect.query());
//TODO: 每次启动随机生成6位数字做管理员身份校验
//app.use(connect.session({secret: 'webpager', key: 'sid', cookie: { maxAge: 60000*60 }, store: sessionStore }));
//判断session
app.use(function(req, res, next){
	var pathname = req._parsedUrl.pathname;
	console.log();
	if( pathname == '/' || /\/checkin\//.test(pathname) ){
		return next();
	}

	//此客户目前使用的连接模式
	//var c = req._parsedUrl.query.match(/(\d)/)[1];
	//if( c ){
	//	req.session['c'] = c;
	//}

	return next();
});
//app.use(route);

var server = http.createServer(app);
server.listen(8000);

/* =========== socket.io ============= */

var io = socketio.listen(server);

io.set('transports', ['websocket']);
io.set('log level', 1);

io.sockets.on('connection', function (socket) {
	socket.emit('color', colors);
});

//取自维基百科http://zh.wikipedia.org/wiki/%E9%A2%9C%E8%89%B2%E5%88%97%E8%A1%A8
var ColorLibrary = [ '#E6C3C3', '#BC8F8F', '#F08080', '#CD5C5C', '#A52A2A', '#B22222', '#800000', '#8B0000', '#E60000', '#FF0000', '#FF4D40', '#FFE4E1', '#FA8072', '#FF2400', '#FF6347', '#E9967A', '#FF7F50', '#FF4500', '#FFA07A', '#FF4D00', '#A0522D', '#FF8033', '#A16B47', '#E69966', '#4D1F00', '#FFF5EE', '#8B4513', '#D2691E', '#CC5500', '#FF7300', '#FFDAB9', '#F4A460', '#B87333', '#FAF0E6', '#FFB366', '#CD853F', '#704214', '#CC7722', '#FFE4C4', '#F28500', '#FF8C00', '#FAEBD7', '#D2B48C', '#DEB887', '#FFEBCD', '#FFDEAD', '#FF9900', '#FFEFD5', '#CCB38C', '#996B1F', '#FFE4B5', '#FDF5E6', '#F5DEB3', '#FFE5B4', '#FFA500', '#FFFAF0', '#DAA520', '#B8860B', '#4D3900', '#E6C35C', '#FFBF00', '#FFF8DC', '#E6B800', '#FFD700', '#FFFACD', '#F0E68C', '#EEE8AA', '#BDB76B', '#E6D933', '#FFFDD0', '#FFFFF0', '#F5F5DC', '#FFFFE0', '#FAFAD2', '#FFFF99', '#CCCC4D', '#FFFF4D', '#808000', '#FFFF00', '#FFFF00', '#697723', '#CCFF00', '#6B8E23', '#9ACD32', '#556B2F', '#8CE600', '#ADFF2F', '#99E64D', '#7CFC00', '#7FFF00', '#73B839', '#99FF4D', '#66FF00', '#66FF59', '#F0FFF0', '#8FBC8F', '#90EE90', '#98FB98', '#36BF36', '#228B22', '#32CD32', '#006400', '#008000', '#00FF00', '#22C32E', '#16982B', '#73E68C', '#50C878', '#4DE680', '#127436', '#A6FFCC', '#2E8B57', '#3CB371', '#F5FFFA', '#00FF80', '#00A15C', '#00FA9A', '#66CDAA', '#7FFFD4', '#0DBF8C', '#66FFE6', '#33E6CC', '#30D5C8', '#20B2AA', '#48D1CC', '#E0FFFF', '#E0FFFF', '#AFEEEE', '#2F4F4F', '#008080', '#008B8B', '#00FFFF', '#AFDFE4', '#00CED1', '#5F9EA0', '#00808C', '#B0E0E6', '#006374', '#ADD8E6', '#7AB8CC', '#4798B3', '#00BFFF', '#87CEEB', '#87CEFA', '#00477D', '#003153', '#4682B4', '#F0F8FF', '#708090', '#778899', '#1E90FF', '#004D99', '#007FFF', '#5686BF', '#B0C4DE', '#0047AB', '#5E86C1', '#6495ED', '#4D80E6', '#003399', '#082567', '#002FA7', '#2A52BE', '#4169E1', '#24367D', '#0033FF', '#0D33FF', '#F8F8FF', '#E6E6FA', '#CCCCFF', '#191970', '#000080', '#00008B', '#0000CD', '#0000FF', '#5C50E6', '#483D8B', '#6A5ACD', '#7B68EE', '#6640FF', '#B399FF', '#9370DB', '#6633CC', '#8674A1', '#5000B8', '#B8A1CF', '#8A2BE2', '#8B00FF', '#4B0080', '#9932CC', '#9400D3', '#7400A1', '#D94DFF', '#E680FF', '#BA55D3', '#E6CFE6', '#D8BFD8', '#CCA3CC', '#DDA0DD', '#EE82EE', '#800080', '#8B008B', '#FF00FF', '#F400A1', '#DA70D6', '#FFB3E6', '#B85798', '#FF66CC', '#C71585', '#FF0DA6', '#FF007F', '#CC0080', '#E63995', '#FF1493', '#E68AB8', '#FF80BF', '#FF69B4', '#470024', '#FF73B3', '#E6005C', '#FFD9E6', '#990036', '#FFF0F5', '#DB7093', '#DE3163', '#FF8099', '#DC143C', '#FFC0CB', '#FFB6C1', '#FFB3BF', '#E32636' ];
var ColorNum = ColorLibrary.length;
var colors = ['', '', ''];  //三个分组的颜色
(function(){
	var _recall = arguments.callee;
	//random change colors
	var c1 = Math.ceil(Math.random() * ColorNum);
	var c2 = (c1 + 20) % ColorNum;
	var c3 = (c2 + 20) % ColorNum;
	//主要是保证别取到列表外面，否则返回undefined逻辑错误
	colors[0] = ColorLibrary[c1 - 0];
	colors[1] = ColorLibrary[c2];
	colors[2] = ColorLibrary[c3];
	io.sockets.emit('color', colors);
	console.log('change color ', colors)
	setTimeout(_recall, 3000);
})();

//处理各种错误
process.on('uncaughtException', function(err)
{
    console.log("\nError!!!!");
    console.log(err.stack);
});

