var d3 = require('d3');

module.exports.prettify = function prettify(tag) {
  return tag.replace(/_/g, " ");
}

module.exports.idify = function idify(tag) {
  return tag.replace(/[^a-z0-9_]/ig,"");
}

module.exports.collide = function collide(tags, radiusScale, maxRadius) {
		var padding = 7;
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
		                r = radiusScale(d.count) + radiusScale(quad.point.count) + padding;
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