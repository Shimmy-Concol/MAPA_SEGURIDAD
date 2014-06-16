var poligonos=[];
function crea_poligono(numero, lat, lon, color){
    var url = "/seguridad/map/map/UI/contiene.xsjs?lat=" + lat + "&lon=" + lon;
    
    var poligono;
    var crd = [];
    
    $.ajax({
	type: 'GET',
	url: url,
	
	success: function(data){
	    
	    data.coordinates[0][0].forEach(function(coord){
		crd.push(new google.maps.LatLng(coord[0], coord[1]));
		 
	    });
	    
	    
	    poligono = new google.maps.Polygon({
		paths: crd,
		strokeColor: color,
		strokeOpacity: 0.8,
		strokeWeight: 2,
		fillColor: color,
		fillOpacity: 0.35,
		identificacion: numero
	    });
	    

	    
	    poligonos.push(poligono);
	    
	}
    });
    
    return poligono;
    
    
  
};


function reset_poligono(in_hide){
	for(var i in poligonos){
		poligonos[i].setVisible(in_hide);
	};
}

function pinta_poligonos(in_estatus){
	for(var i in poligonos){
		poligonos[i].setMap(in_estatus);
	};
}

function poligono_persona(in_num){	
	for(var i in poligonos){
		if(poligonos[i].identificacion != in_num)
			poligonos[i].setVisible(false);
	}
}

function poligono_texto(in_num){
	for(var i in poligonos){
		if(poligonos[i].identificacion == in_num){			
			poligonos[i].setVisible(true);
		}
	}

}