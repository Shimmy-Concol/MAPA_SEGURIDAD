function drawGraph(in_data){

	var vertex = {};
	var edges;
	var graph = [];

//	$.ajax({
//
//		type: 'GET',
//		url: in_url,
//		success: function(data){

			 
			edges = in_data;
			
	
			edges.forEach(function(edge){
				edge.NUM_A = vertex[edge.NUM_A] || ( vertex[edge.NUM_A] = {name: edge.NUM_A} );
				edge.NUM_B = vertex[edge.NUM_B] || ( vertex[edge.NUM_B] = {name: edge.NUM_B} );
				graph.push( {source: edge.NUM_A, target: edge.NUM_B, type: "suit"} );
				
			});

			var w = 1100;
			var h = 580;
		
			var force = d3.layout.force()
				.nodes(d3.values(vertex))
				.links(graph)
				.size([w, h])
				.linkDistance(300)
				.charge(-100)
				.on("tick", tick)
				.start();

			var svg = d3.select("#graphOriginal").append("svg:svg")
				.attr("width", w)
				.attr("height", h);

			svg.append("svg:defs").selectAll("marker")
				.data(["suit", "licensing", "resolved"])
				.enter().append("svg:marker")
				.attr("id", String)
				.attr("viewBox", "0 -5 10 10")
				.attr("refX", 15)
				.attr("refY", -1.5)
				.attr("markerWidth", 6)
				.attr("markerHeight", 6)
				.attr("orient", "auto")
				.append("svg:path")
				.attr("d", "M0,-5L10,0L0,5");

			var path = svg.append("svg:g").selectAll("path")
			    .data(force.links())
			    .enter().append("svg:path")
			    .attr("class", function(d) { return "link " + d.type; })
			    .attr("marker-end", function(d) { return "url(#" + d.type + ")"; });

			var circle = svg.append("svg:g").selectAll("circle")
			    .data(force.nodes())
			    .enter().append("svg:circle")
			    .attr("r", 6)
			    .call(force.drag);

			var text = svg.append("svg:g").selectAll("g")
			    .data(force.nodes())
			    .enter().append("svg:g");

			text.append("svg:text")
			    .attr("x", 8)
			    .attr("y", ".31em")
			    .attr("class", "shadow")
			    .text(function(d) { return d.name; });

			text.append("svg:text")
			    .attr("x", 8)
			    .attr("y", ".31em")
			    .text(function(d) { return d.name; });

			function tick() {
				path.attr("d", function(d) {
					var dx = d.target.x - d.source.x,
	  				dy = d.target.y - d.source.y,
	  				dr = Math.sqrt(dx * dx + dy * dy);
					return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
				});

				circle.attr("transform", function(d) {
				    return "translate(" + d.x + "," + d.y + ")";
				});

				text.attr("transform", function(d) {
				    return "translate(" + d.x + "," + d.y + ")";
				});

			}

//		}

//	});

};


function conversion(in_datos){
	var arreglo = [];
	
	arreglo.push({"NUM_A": in_datos[0].T0, "NUM_B":in_datos[0].T1});
	arreglo.push({"NUM_A":in_datos[0].T1, "NUM_B":in_datos[0].T2});
	arreglo.push({"NUM_A":in_datos[0].T2, "NUM_B":in_datos[0].T3});
	arreglo.push({"NUM_A":in_datos[0].T3, "NUM_B":in_datos[0].T4});
	arreglo.push({"NUM_A":in_datos[0].T4, "NUM_B":in_datos[0].T5});
	arreglo.push({"NUM_A":in_datos[0].T5, "NUM_B":in_datos[0].T6});
	arreglo.push({"NUM_A":in_datos[0].T6, "NUM_B":in_datos[0].T0});
	
	return arreglo;
}