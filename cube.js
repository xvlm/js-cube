
/****************************************
* HTML立方体插件 v1.6.1
* By Paris chen https://github.com/parischen/js-cube
**/
var Cube;
var cubeDiv = document.getElementById("cube");
(function () {
    /*******************
    *     |+y
    *     |
    *     0----- +x
    *    /
    *   /+z
    ******************/
    function Point(x, y, z) {
        this.update = function () {
            this.rx = x;
            this.ry = y;
            this.deepth = z;	//无限远
        };
        this.rotate = function (radX, radY, radZ) {
            var _x, _y, _z;
            var sin, cos;
            if (radX) {
                sin = Math.sin(radX);
                cos = Math.cos(radX);
                _y = cos * y - sin * z;
                _z = cos * z + sin * y;
                y = _y;
                z = _z;
            }
            if (radY) {
                sin = Math.sin(radY);
                cos = Math.cos(radY);
                _x = cos * x - sin * z;
                _z = cos * z + sin * x;
                x = _x;
                z = _z;
            }
            if (radZ) {
                sin = Math.sin(radZ);
                cos = Math.cos(radZ);
                _x = cos * x - sin * y;
                _y = cos * y + sin * x;
                x = _x;
                y = _y;
            }
            this.update();
        };
        this.update();
    }
    /*****************************
    *   p1--------p2
    *   |          |
    *   p3--------p4
    *****************************/
    function Face(P1, P2, P3, P4) {
        /***************************************************
        *    P(x,y) + [a,b,c,d,tx,ty]
        * => P(ax+by+tx, cx+dy+ty)
        ***************************************************/
        this.getMatrix = function () {
            var tx = P1.rx;
            var ty = P1.ry;
            var a = (P2.rx - tx) / 2;
            var b = (ty - P2.ry) / 2;
            var c = (P3.rx - tx) / 2;
            var d = (ty - P3.ry) / 2;
            return [a, b, c, d, tx, ty];
        };
        this.getDeepth = function () {
            return P1.deepth + P4.deepth;
        };
        this.getBlockX = function () {
            return Math.min(P1.rx, P2.rx, P3.rx, P4.rx);
        };
        this.getBlockY = function () {
            return Math.max(P1.ry, P2.ry, P3.ry, P4.ry);
        };
    }
    Cube = function () {
        /*******************
        *    4-------5
        *   /|      /|
        *  0-------1 |
        *  | |     | |
        *  | 7- - -|-6
        *  |/      |/
        *  3-------2
        *******************/
        var R = 100;
        var P =
            [
                new Point(-1, +1, +1),
                new Point(+1, +1, +1),
                new Point(+1, -1, +1),
                new Point(-1, -1, +1),
                new Point(-1, +1, -1),
                new Point(+1, +1, -1),
                new Point(+1, -1, -1),
                new Point(-1, -1, -1)
            ];
        var F =
            [
                new Face(P[0], P[1], P[3], P[2]), //前
                new Face(P[1], P[5], P[2], P[6]), //右
                new Face(P[5], P[4], P[6], P[7]), //后
                new Face(P[4], P[0], P[7], P[3]), //左
                new Face(P[4], P[5], P[0], P[1]), //上
                new Face(P[3], P[2], P[7], P[6])  //下
            ];
        var cx, cy;
        var bLight;
        var arrInfo = [];
        var KEY_NAME;
        var ver = navigator.userAgent;
        var isIE = /MSIE/.test(ver);
        var isFF = /Firefox/.test(ver);
        var RAD = Math.PI / 180;
        /**
        * 初始化
        */
        function Init() {
            var FILTER_NAME = "DXImageTransform.Microsoft.Matrix";
            var div, sty, flt;
            for (var i = 0; i < 6; i++) {
                div = document.createElement("div");

                //document.body.appendChild(div);
                cubeDiv.appendChild(div);
                ///console.log(document.getElementById("u106_img"));
                sty = div.style;
                sty.position = "absolute";
                switch (i) {
                    case 0:
                        sty.background = "#6cc7cc";
                        break;
                    case 1:
                        sty.background = "#519599";
                        break;
                    case 2:
                        sty.background = "#6cc7cc";
                        break;
                    case 3:
                        sty.background = "#519599";
                        break;
                    case 4:
                        sty.background = "#3d7073";
                        break;
                    default:
                        sty.background = "#3d7073";
                        break;
                }

                sty.border = "#FFF 1px solid";
                if (isIE) {
                    //IE Filter
                    sty.filter = "progid:" + FILTER_NAME + "(sizingMethod='auto expand')";
                    flt = div.filters[FILTER_NAME];
                }
                else {
                    //CSS3 transform
                    if (!KEY_NAME) {
                        if (sty.MozTransform != null)			//FireFox
                            KEY_NAME = "MozTransform";
                        else if (sty.WebkitTransform != null)	//Chrome,Safari
                            KEY_NAME = "WebkitTransform";
                        else if (sty.OTransform != null)			//Opera
                            KEY_NAME = "OTransform";
                        else
                            throw new Error("浏览器不支持");
                    }
                    //调整参照点
                    sty[KEY_NAME + "Origin"] = "0% 0%";
                }
                arrInfo[i] = { div: div, sty: sty, flt: flt };
            }
        }
        function setLight(i, val) {
            var obj = arrInfo[i].fltElem;
            if (!obj)
                return;
            //obj.opacity=100;
            //obj.opacity = isIE? val*100: val;
        }
        function apply(id, visible, opacity) {
            var info = arrInfo[id];
            var sty = info.sty;
            if (visible)
                sty.display = "block";
            else
                return sty.display = "none";
            var face = F[id];
            var m = face.getMatrix(R);
            //0.123456
            for (var i = 0; i < 6; i++)
                m[i] = ((m[i] * 1e6) >> 0) / 1e6;
            if (isIE) {
                //IE Matrix滤镜
                var flt = info.flt;
                flt.M11 = m[0];
                flt.M21 = m[1];
                flt.M12 = m[2];
                flt.M22 = m[3];
                //flt.Dx = cx + R * m[4];
                //flt.Dy = cy - R * m[5];
                sty.pixelLeft = cx + R * face.getBlockX();
                sty.pixelTop = cy - R * face.getBlockY();
            }
            else {
                //CSS3
                m[4] = cx + R * m[4];
                m[5] = cy - R * m[5];
                if (isFF) {
                    m[4] += "px";
                    m[5] += "px";
                }
                sty[KEY_NAME] = "matrix(" + m.join(",") + ")";
            }
        }
        function draw() {
            var deepth = [];
            var z, i;
            // 深度排序
            for (i = 0; i < 6; i++)
                deepth[i] = { id: i, val: F[i].getDeepth() };
            deepth.sort(function (a, b) { return b.val - a.val });
            //正面
            for (i = 0; i < 3; i++) {
                apply(deepth[i].id, true);
                if (bLight) {
                    z = (deepth[i].val + 2) / 4;
                    setLight(deepth[i].id, z * z);
                }
            }
            //隐面
            for (i = 3; i < 6; i++)
                apply(deepth[i].id, false);
        }
        function updateSize(sty) {
            var D = Math.round(R + R);
            if (!isIE)	//解决边框分离
                D -= 2;
            sty.width = D + "px";
            sty.height = D + "px";
        }
        /**
        * setLocate:
        *   页面中定位立方体。
        *   (cx, cy)为立方体中心点坐标
        */
        this.setLocate = function (_cx, _cy) {
            cx = _cx;
            cy = _cy;
            draw();
        };
        /**
        * setFace:
        *   立方体贴面。
        *   id: 立方体面编号
        *   elem: 页面中的HTML元素
        */
        this.setFace = function (id, elem) {
            var faceInfo = arrInfo[id];
            if (!faceInfo)
                throw new Error("无效的面ID");
            try {
                if (faceInfo.elem)
                    faceInfo.div.replaceChild(elem, faceInfo.elem);
                else
                    faceInfo.div.appendChild(elem);
                //透明度
                if (isIE) {
                    elem.style.filter = "alpha";
                    faceInfo.fltElem = elem.filters["alpha"];
                }
                else {
                    faceInfo.fltElem = elem.style;
                }
                faceInfo.elem = elem;
            }
            catch (e) {
                throw new Error("无效的DOM元素");
            }
        };
        /**
        * setRadius:
        *   设置立方体每个面的半径长度
        */
        this.setRadius = function (r) {
            R = r;
            for (var i = 0; i < 6; i++)
                updateSize(arrInfo[i].sty);
            draw();
        };
        /**
        * rotate:
        *   旋转立方体。
        *   angleX: 绕X轴旋转angleX角度
        *   ...
        */
        this.rotate = function (angleX, angleY, angleZ) {
            for (var i = 0; i < 8; i++)
                P[i].rotate(RAD * angleX, RAD * angleY, RAD * angleZ);
            draw();
        };
        /**
        * setLight:
        *   设置是否开启光亮
        */
        this.setLight = function (v) {
            bLight = v;
            if (!v)
                for (var i = 0; i < 6; i++)
                    setLight(i, 0);
        };
        Init();
    };
    Cube.FACE_FRONT = 0;
    Cube.FACE_RIGHT = 1;
    Cube.FACE_BACK = 2;
    Cube.FACE_LEFT = 3;
    Cube.FACE_TOP = 4;
    Cube.FACE_BOTTOM = 5;
})()	//End Module

/**
* Update: 2011-9-2
*/
var MyFace =
    [
        {
            id: Cube.FACE_FRONT,
            logo: "images/activity.png",
            url: "http://www.google.com/search?q=%s",
            btn: "成本统计分析"
        },
        {
            id: Cube.FACE_BACK,
            logo: "images/set-line.png",
            url: "http://www.google.com/images?q=%s",
            btn: "业务统计分析"
        },
        {
            id: Cube.FACE_LEFT,
            logo: "images/mail.png",
            url: "http://www.google.cn/music/search?q=%s",
            btn: "用户统计分析"
        },
        {
            id: Cube.FACE_BOTTOM,
            logo: "images/attachment.png",
            url: "http://maps.google.com/maps?q=%s",
            btn: "深蓝亿康"
        },
        {
            id: Cube.FACE_RIGHT,
            logo: "images/chart.png",
            url: "http://news.google.com/news/search?q=%s",
            btn: "IBM"
        },
        {
            id: Cube.FACE_TOP,
            logo: "images/Members.png",
            url: "http://video.google.com/search?q=%s",
            btn: "银联"
        }
    ];


function getpos(e) {
    var t = e.offsetTop;
    var l = e.offsetLeft;
    var height = e.offsetHeight;
    while (e = e.offsetParent) {
        t += e.offsetTop;
        l += e.offsetLeft;
    }
    return { top: t, left: l };
}
var oCube;
var cx, cy;
var dx, dy;
var r = 80;
var ar = 0;
//var cubeDiv = getpos(cubeDiv);
// document.getElementById("u106_img").onmousemove = function(e)
// {
// e = e || event
// dx = e.clientX - cx-cubDiv.left;
// dy = e.clientY - cy-cubDiv.top;
// };
// document.getElementById("u106_img").onmouseout = function(e)
// {
// e = e || event
// dx = 0;
// dy = 0;
// };


document.onmouseover = function (e) {
    e = e || event;
    e = e.target || e.srcElement;
    if (e.tagName == "INPUT")
        e.style.borderColor = "red";
}
document.onmouseout = function (e) {
    e = e || event;
    e = e.target || e.srcElement;
    if (e.tagName == "INPUT")
        e.style.borderColor = "#666";
}
document.onkeydown = function (e) {
    e = e || event;
    var dom = e.target || e.srcElement;
    if (dom.tagName == "INPUT" && e.keyCode == 13)
        DoSearch(dom.nextSibling);
}
window.onload = function () {
    var i, oFace;
    oCube = new Cube();
    for (i = 0; i < 6; i++) {
        oFace = document.createElement("div");
        oFace.className = "face";
        oFace.innerHTML = "<a href='javascript:btnClick(" + i + ")'><img id='elimg" + i + "'src='" + MyFace[i].logo + "' onselectstart=\"return false;\" ondragstart=\"return false;\"/></a>";
        document.body.appendChild(oFace);
        oCube.setFace(MyFace[i].id, oFace);
    }
    oCube.setRadius(r);
    oCube.setLight(true);
    oCube.rotate(20, 20, 0);
    setInterval(OnTimer, 16);

     window.onresize = function () {
        //var de = document.documentElement;
        
        cx = cubeDiv.clientWidth / 2;
        cy = cubeDiv.clientHeight / 2;
        oCube.setLocate(cx, cy);
    };

    onresize();
    for (i = 0; i < 6; i++) {
        var element = document.getElementById("elimg" + i);
        addListener(element, "mousedown", nodrag);
    }

   
};
var ver = navigator.userAgent;
var isIE = /IE/.test(ver);
var isFF = /Firefox/.test(ver);
//if(isFF)
//document.addEventListener("DOMMouseScroll", handleScroll, false);
//else
//document.onmousewheel = handleScroll;
function handleScroll(e) {
    e = e || event;
    var d = isFF ? -e.detail : e.wheelDelta;
    ar += (d < 0 ? -10 : 10);
    if (ar > 100)
        ar = 100;
    else if (ar < -100)
        ar = -100;
    if (isIE) {
        e.returnValue = false;
    }
    else {
        e.preventDefault();
        e.stopPropagation();
    }
}
function OnTimer() {
    //var aX = dy / 100;
    //var aY = -dx / 100;
    var aX = dy / 20;
    var aY = -dx / 20;
    if (aX || aY)
        oCube.rotate(aX, aY);
    if (ar < 0)
        ar++ , r--;
    else if (ar > 0)
        ar-- , r++;
    else
        return;
   
    oCube.setRadius(r);
}
function DoSearch(btn) {
    var word = btn.previousSibling.value;
    var id = btn.getAttribute("tid");
    var url = MyFace[id].url.replace("%s", encodeURI(word));
    window.open(url);
}


function randomData() {
    return Math.round(Math.random() * 1000);
}


var tmr = (new Date()).getTime();
function drag(obj, e) {
    e = e ? e : window.event;
    var setx = e.clientX, sety = e.clientY;
    if (document.addEventListener) {
        document.addEventListener('mousemove', inFmove, true);
        document.addEventListener('mouseup', inFup, true);
    } else if (document.attachEvent) {
        document.attachEvent('onmousemove', inFmove);
        document.attachEvent('onmouseup', inFup);
    }
    function inFmove(e) {
        tmr2 = (new Date).getTime();
        if (tmr2 - tmr < 100) return false;
        tmr = tmr2;
        dx = (e.clientX - setx);
		dy = (e.clientY - sety);
        // console.log(dx);
        // cc.roll('ry', (e.clientX - setx) / 50);
        // setx = e.clientX;
        // cc.roll('rx', (e.clientY - sety) / 50);
        // sety = e.clientY;
        // cc.paint();
        return false;
    }
    function inFup() {
        dx = 0;
		dy = 0;
        if (document.removeEventListener) {
            document.removeEventListener('mousemove', inFmove, true);
            document.removeEventListener('mouseup', inFup, true);
        } else if (document.detachEvent) {
            document.detachEvent('onmousemove', inFmove);
            document.detachEvent('onmouseup', inFup);
        }
    } // shawl.qiu script
}

var isDrag = false;

function addListener(element, e, fn) {
    element.addEventListener(e, fn, false);
}
function nodrag(e) {
    var e = e || window.event;
    var element = e.srcElement || e.target;
    if (e.preventDefault) e.preventDefault();
    else e.returnvalue = false;
}
