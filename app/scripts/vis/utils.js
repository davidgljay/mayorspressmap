var d3 = require('d3');

module.exports.prettify = function prettify(tag) {
  return tag.replace(/_/g, " ");
}

module.exports.idify = function idify(tag) {
  return tag.replace(/[^a-z0-9_]/ig,"");
}

module.exports.arrayify = function arrayify(object, keyname) {
	var results = [];
	for (var key in object) {
		object[key][keyname] = key;
		results.push(object[key]);
	}
	return results;
}

module.exports.med_date = function med_date(dates) {
	if (dates.length === 1) {
		return new Date(dates[0]).getTime();
	}
	else if (dates.length % 2 === 0) {
		return new Date(dates[dates.length/2]).getTime();
	} else {
		var mid = dates.length/2-.5;
		var median_millis = (new Date(dates[mid]).getTime() + new Date(dates[mid+1]).getTime())/2;
		return median_millis;
	}
}

module.exports.collide = function collide(tags, radiusScale, maxRadius) {
		var padding = 7;
		console.log(tags)
		return function(alpha) {
		    var quadtree = d3.geom.quadtree(tags);
		    return function(d) {
		        var r = radiusScale(d.count) + maxRadius + padding,
		            nx1 = d.x - r,
		            nx2 = d.x + r,
		            ny1 = d.y - r,
		            ny2 = d.y + r;
		        quadtree.visit(function(quad, x1, y1, x2, y2) {
		          if (quad.point && (quad.point !== d)) {
		            var x = d.x - quad.point.x,
		                y = d.y - quad.point.y,
		                l = Math.sqrt(x * x + y * y),
		                r = radiusScale(d.dates.length) + radiusScale(quad.point.dates.length) + padding;
		            if (l < r) {
		              l = (l - r) / l * alpha;
		              d.x -= x *= l;
		              d.y -= y *= l;
		              quad.point.x += x;
		              quad.point.y += y;
		            }
		          }
		          return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
		        });
        	};
		};
      };