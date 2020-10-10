/*
Copyright Alex Leone, David Nufer, David Truong, 2011-03-11. kathack.com

javascript:var i,s,ss=['http://kathack.com/js/kh.js','http://ajax.googleapis.com/ajax/libs/jquery/1.5.1/jquery.min.js'];for(i=0;i!=ss.length;i++){s=document.createElement('script');s.src=ss[i];document.body.appendChild(s);}void(0);

*/
var BORDER_STYLE = "1px solid #bbb",
    CSS_TRANSFORM = null,
    CSS_TRANSFORM_ORIGIN = null,
    POSSIBLE_TRANSFORM_PREFIXES = ['-webkit-', '-moz-', '-o-', '-ms-', ''],
    khFirst = false;

/* When running twice on one page, update pick-uppable nodes instead of
 * creating more.
 */
if (!window.khNodes) {
    khFirst = true;
    window.khNodes = new StickyNodes();
}

function getCssTransform() {
    var i, d = document.createElement('div'), pre;
    for (i = 0; i < POSSIBLE_TRANSFORM_PREFIXES.length; i++) {
        pre = POSSIBLE_TRANSFORM_PREFIXES[i];
        d.style.setProperty(pre + 'transform', 'rotate(1rad) scaleX(2)', null);
        if (d.style.getPropertyValue(pre + 'transform')) {
            CSS_TRANSFORM = pre + 'transform';
            CSS_TRANSFORM_ORIGIN = pre + 'transform-origin';
            return;
        }
    }
    alert("Your browser doesn't support CSS tranforms!");
    throw "Your browser doesn't support CSS tranforms!";
}
getCssTransform();

/**
 * Returns true if the circle intersects the element rectangle.
 * 0  |   1   |   2
 * ------------------
 * 3  |   4   |   5
 * ------------------
 * 6  |   7   |   9
 */
function circleGridObjInt(cx, cy, cr, cr2, go) {
    var dx, dy;
    if (cx < go.left) {
        dx = go.left - cx;
        if (cy < go.top) { /* zone 0. */
            dy = go.top - cy;
            return ((dx * dx + dy * dy) <= cr2);
        } else if (cy <= go.bottom) { /* zone 3. */
            return (dx <= cr);
        } else { /* zone 6. */
            dy = cy - go.bottom;
            return ((dx * dx + dy * dy) <= cr2);
        }
    } else if (cx <= go.right) {
        if (cy < go.top) { /* zone 1. */
            return ((go.top - cy) <= cr);
        } else if (cy <= go.bottom) { /* zone 4. */
            return true;
        } else { /* zone 7. */
            return ((cy - go.bottom) <= cr);
        }
    } else {
        dx = cx - go.right;
        if (cy < go.top) { /* zone 2. */
            dy = go.top - cy;
            return ((dx * dx + dy * dy) <= cr2);
        } else if (cy <= go.bottom) { /* zone 5. */
            return (dx <= cr);
        } else { /* zone 9. */
            dy = cy - go.bottom;
            return ((dx * dx + dy * dy) <= cr2);
        }
    }
}

/**
 * Returns [x,y] where the rectangle is closest to (cx, cy).
 * 0  |   1   |   2
 * ------------------
 * 3  |   4   |   5
 * ------------------
 * 6  |   7   |   9
 */
function getClosestPoint(cx, cy, go) {
    var dx, dy;
    if (cx < go.left) {
        dx = go.left - cx;
        if (cy < go.top) { /* zone 0. */
            return [go.left, go.top];
        } else if (cy <= go.bottom) { /* zone 3. */
            return [go.left, cy];
        } else { /* zone 6. */
            return [go.left, go.bottom];
        }
    } else if (cx <= go.right) {
        if (cy < go.top) { /* zone 1. */
            return [cx, go.top];
        } else if (cy <= go.bottom) { /* zone 4. */
            return [cx, cy];
        } else { /* zone 7. */
            return [cx, go.bottom];
        }
    } else {
        dx = cx - go.right;
        if (cy < go.top) { /* zone 2. */
            return [go.right, go.top];
        } else if (cy <= go.bottom) { /* zone 5. */
            return [go.right, cy];
        } else { /* zone 9. */
            return [go.right, go.bottom];
        }
    }
}

/**
 * Returns the "volume" of the grid object.
 */
function gridObjVol(go) {
    return go.w * go.h * Math.min(go.w, go.h);
}

function StickyNodes() {
    var domNodes = [],
        grid = [],
        GRIDX = 100,
        GRIDY = 100,
        REPLACE_WORDS_IN = {
            a: 1, b: 1, big: 1, body: 1, cite:1, code: 1, dd: 1, div: 1,
            dt: 1, em: 1, font: 1, h1: 1, h2: 1, h3: 1, h4: 1, h5: 1, h6: 1,
            i: 1, label: 1, legend: 1, li: 1, p: 1, pre: 1, small: 1,
            span: 1, strong: 1, sub: 1, sup: 1, td: 1, th: 1, tt: 1
        };

    function addDomNode(el) {
        if (el !== undefined && el !== null) {
            el.khIgnore = true;
            el.style.border = BORDER_STYLE;
            domNodes.push(el);
        }
    }
    this.addDomNode = addDomNode;

    this.addWords = function (el) {
        var textEls = [];
        
        function shouldAddChildren(el) {
            return el.tagName && REPLACE_WORDS_IN[el.tagName.toLowerCase()];
        }
        
        function buildTextEls(el, shouldAdd) {
            var i, len;
            if (shouldAdd && el.nodeType === Node.TEXT_NODE &&
                    el.nodeValue.trim().length > 0) {
                textEls.push(el);
                return;
            }
            if (!el.childNodes || el.khIgnore) {
                return;
            }
            shouldAdd = shouldAddChildren(el);
            for (i = 0, len = el.childNodes.length; i < len; i++) {
                buildTextEls(el.childNodes[i], shouldAdd);
            }
        }
        
        function wordsToSpans(textEl) {
            var p = textEl.parentNode,
                words = textEl.nodeValue.split(/\s+/),
                ws = textEl.nodeValue.split(/\S+/),
                i, n, len = Math.max(words.length, ws.length);
            /* preserve whitespace for pre tags. */
            if (ws.length > 0 && ws[0].length === 0) {
                ws.shift();
            }
            for (i = 0; i < len; i++) {
                if (i < words.length && words[i].length > 0) {
                    n = document.createElement('span');
                    n.innerHTML = words[i];
                    p.insertBefore(n, textEl);
                    addDomNode(n);
                }
                if (i < ws.length && ws[i].length > 0) {
                    n = document.createTextNode(ws[i]);
                    p.insertBefore(n, textEl);
                }
            }
            p.removeChild(textEl);
        }
        
        buildTextEls(el, shouldAddChildren(el));
        textEls.map(wordsToSpans);
    };
    
    /* includes el. */
    this.addTagNames = function (el, tagNames) {
        var tname = el.tagName && el.tagName.toLowerCase(),
            i, j, els, len;
        if (el.khIgnore) {
            return;
        }
        if (tagNames.indexOf(tname) !== -1) {
            addDomNode(el);
        }
        if (!el.getElementsByTagName) {
            return;
        }
        for (i = 0; i < tagNames.length; i++) {
            els = el.getElementsByTagName(tagNames[i]);
            for (j = 0, len = els.length; j < len; j++) {
                if (!els[j].khIgnore) {
                    addDomNode(els[j]);
                }
            }
        }
    };
    
    this.finalize = function (docW, docH) {
        var xi, yi, i, len, startXI, startYI, el, go, off, w, h,
            endXI = Math.floor(docW / GRIDX) + 1,
            endYI = Math.floor(docH / GRIDY) + 1;
        /* initialize grid. */
        grid = new Array(endXI);
        for (xi = 0; xi < endXI; xi++) {
            grid[xi] = new Array(endYI);
        }
        /* add nodes into grid. */
        for (i = 0, len = domNodes.length; i < len; i++) {
            el = domNodes[i];
            if (el.khPicked) {
                continue;
            }
            off = jQuery(el).offset();
            w = jQuery(el).width();
            h = jQuery(el).height();
            go = {
                el: domNodes[i], /* dom element. */
                left: off.left,
                right: off.left + w,
                top: off.top,
                bottom: off.top + h,
                w: w,
                h: h,
                x: off.left + (w / 2),    /* center x. */
                y: off.top + (h / 2),    /* center y. */
                diag: Math.sqrt(((w * w) + (h * h)) / 4), /* center to corner */
               
                /* these are for removing ourselves from the grid. */
                arrs: [], /* which arrays we're in (grid[x][y]). */
                idxs: []  /* what indexes. */
            };
            startXI = Math.floor(go.left / GRIDX);
            startYI = Math.floor(go.top / GRIDY);
            endXI = Math.floor((go.left + go.w) / GRIDX) + 1;
            endYI = Math.floor((go.top + go.h) / GRIDY) + 1;
            for (xi = startXI; xi < endXI; xi++) {
                for (yi = startYI; yi < endYI; yi++) {
                    if (grid[xi] === undefined) {
                        grid[xi] = [];
                    }
                    if (grid[xi][yi] === undefined) {
                        grid[xi][yi] = [go];
                    } else {
                        grid[xi][yi].push(go);
                    }
                    go.arrs.push(grid[xi][yi]);
                    go.idxs.push(grid[xi][yi].length - 1);
                }
            }
        }
    };
    
    function removeGridObj(go) {
        var i;
        for (i = 0; i < go.arrs.length; i++) {
            go.arrs[i][go.idxs[i]] = undefined;
        }
        go.el.style.visibility = "hidden";
        go.el.khPicked = true;
        delete go.arrs;
        delete go.idxs;
    }
    
    /**
     * cb(gridObj) -> boolean true if the object should be removed.
     */
    this.removeIntersecting = function (x, y, r, cb) {
        var xi, yi, arr, i, r2 = r * r, go,
            startXI = Math.floor((x - r) / GRIDX),
            startYI = Math.floor((y - r) / GRIDY),
            endXI = Math.floor((x + r) / GRIDX) + 1,
            endYI = Math.floor((y + r) / GRIDY) + 1;
        for (xi = startXI; xi < endXI; xi++) {
            if (grid[xi] === undefined) {
                continue;
            }
            for (yi = startYI; yi < endYI; yi++) {
                arr = grid[xi][yi];
                if (arr === undefined) {
                    continue;
                }
                for (i = 0; i < arr.length; i++) {
                    go = arr[i];
                    if (go !== undefined &&
                            circleGridObjInt(x, y, r, r2, go) &&
                            cb(go)) {
                        removeGridObj(go);
                    }
                }
            }
        }
    };
}

function PlayerBall(parentNode, stickyNodes, ballOpts, sounds) {
    var x = 300, y = 300,
        vx = 0, vy = 0,
        radius = 20,
        lastR = 0, /**< optimization: only resize when necessary. */
        docW = 10000, docH = 10000,
        
        attached = [],
        attachedDiv, /* div to put attached nodes into. */
        canvas_el,
        canvas_ctx,
        color = ballOpts.color,
        
        accelTargetX = 0, accelTargetY = 0,
        accel = false,
        
        VOL_MULT = ballOpts.VOL_MULT,
        MAX_ATTACHED_VISIBLE = ballOpts.MAX_ATTACHED_VISIBLE,
        CHECK_VOLS = ballOpts.CHECK_VOLS,

        /**
         * which direction the ball is facing in the xy axis, in radians.
         * th: 0 is facing dead East
         * th: 1/2 PI is facing dead South
         * note that this is like regular th on a graph with y inverted.
         * Same rotation as css transform.
         */
        th = 0,
        
        /**
         * Ball angle in the rotation axis / z plane, in radians.
         * phi: 0 is pointing in the direction the ball is rolling.
         * phi: 1/2 PI is pointing straight up (out of the page).
         * note that forward rotation means phi -= 0.1.
         */
        phi = 0;
        
    this.init = function () {
        canvas_el = document.createElement('canvas');
        canvas_el.width = radius * 2;
        canvas_el.height = radius * 2;
        canvas_el.style.cssText = 'position: absolute; z-index: 500;';
        parentNode.appendChild(canvas_el);
        canvas_ctx = canvas_el.getContext('2d');
        
        attachedDiv = document.createElement('div');
        parentNode.appendChild(attachedDiv);
    };
    
    this.setRadius = function (r) {
        radius = r;
    };
    
    this.getState = function () {
        return {
            x: x,
            y: y,
            vx: vx,
            vy: vy,
            radius: radius,
            th: th,
            phi: phi,
        };
    };
    
    this.setState = function (s) {
        x = s.x;
        y = s.y;
        vx = s.vx;
        vy = s.vy;
        radius = s.radius;
        th = s.th;
        phi = s.phi;
    };
        
    this.setXY = function (sx, sy) {
        x = sx;
        y = sy;
    };
    
    this.setTh = function (sth) {
        th = sth;
    };
    
    this.setPhi = function (sphi) {
        phi = sphi;
    };

    this.setColor = function (c) {
        color = c;
    };
    
    this.setDocSize = function (w, h) {
