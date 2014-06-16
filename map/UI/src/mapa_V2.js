var markers = [], markers2 = [], heatmap, coordenada_calor = [], indicador=0;
var zona = {}, color,poligonos=[];
var oModel = new sap.ui.model.json.JSONModel();
var infor,pb;
var infowindow = new google.maps.InfoWindow({maxWidth: 250});


pb = progressBar();

function initialize(){	
var mapOptions = {
    zoom: 4,
    zoomControl: true,
    streetViewControl: false,
    center: new google.maps.LatLng(20.520556, -99.895833),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  
  map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
  
  map.controls[google.maps.ControlPosition.RIGHT].push(pb.getDiv());
  
  google.maps.event.addListenerOnce(map, 'idle', datos_principales);
  //zona_riesgo();
 
  
  google.maps.event.addListener(map, 'zoom_changed', function() {

	  
	  if(map.getZoom() >= 6 && indicador == 0){
		  activa_campo();
		  indicador = 1;
		  heatmap.setMap(null);
		  pinta_poligonos(map);
		  set_marcador(map);
	  }
	  if(map.getZoom() <= 5 && indicador == 1){
		  desactiva_campo();
		  indicador = 0;
		  pinta_poligonos(null);
		  set_marcador(null);
		  heatmap.setMap(map);
	  }
	  
  });
} 

var marker_principal;
function datos_principales(){
	$.ajax({
	    xhr: function(){
	        var xhr = new window.XMLHttpRequest();
	      //Download progress
	        xhr.addEventListener("progress", function(evt){
	          if (evt.lengthComputable) {
//	        	  console.log(carga);
	        	pb.start(evt.total);
	            pb.updateBar(evt.loaded);
	            
	            	if(evt.loaded == evt.total){
	            	pb.hide();
	            	}
	          }
	        }, false);
	        return xhr;
	      },
		url:"/seguridad/map/map/UI/servicio.xsodata/phonenumber?$format=json",
		success:function(coordenadas){
			marker_principal = coordenadas;
			genera_coordenadas(coordenadas);
			zona_caliente();
			zona_riesgo();
		}
	});
}



function genera_coordenadas(in_coordenada){
	var marker;
	var icono,latlng_suj;
	var bounds = new google.maps.LatLngBounds();
	
	
	markers = [];
	for(var i in in_coordenada.d.results){
		var parametro,visible;
		var coordenada = new google.maps.LatLng(in_coordenada.d.results[i].LATITUDE, in_coordenada.d.results[i].LONGITUDE);
		coordenada_calor.push(coordenada);
		
		if(in_coordenada.d.results[i].SUBOPCION == 'Sujeto'){
			icono = '/seguridad/map/map/UI/imagen/icono.png';
			
			marker = new google.maps.Marker({
				icon: icono,
			 	position: coordenada,
			 	visible: true,
			 	title:in_coordenada.d.results[i].SUBOPCION,
			 	numero:in_coordenada.d.results[i].PHONENUMBER,
			 	zIndex: google.maps.Marker.MAX_ZINDEX + 1,
			 	map: null});
		
			markers.push(marker);	

			
			google.maps.event.addListener(marker, 'click', function(marker,i) {
				return function(){
				var info = [this.title, this.numero, this.position.lat(), this.position.lng()];
					accion_click(info,marker);
			}}(marker,i));
		}
	};
	

}




function reinicia(){
	activa_campo();
	  if(map.getZoom() >= 6 && indicador == 2){
		  indicador = 1;
	  }
	  if(map.getZoom() <= 5 && indicador == 2){
		map.setZoom(7);
		map.setCenter(new google.maps.LatLng(20.520556, -99.895833));
		indicador = 1;
		set_mark_filtro(null);
		genera_coordenadas(marker_principal);
		reset_poligono(true);
		set_marcador(map);
	  }else{
		set_mark_filtro(null);
		genera_coordenadas(marker_principal);
		reset_poligono(true);
		set_marcador(map);
	  }
	
}



function filtro_persona(in_param){
	$.ajax({
	    xhr: function(){
	        var xhr = new window.XMLHttpRequest();
	      //Download progress
	        xhr.addEventListener("progress", function(evt){
	          if (evt.lengthComputable) {
	            pb.start(evt.total);
	            pb.updateBar(evt.loaded);
	            	if(evt.loaded == evt.total){
	            	pb.hide();
	            	}
	          }
	        }, false);
	        return xhr;
	      },
		url:"/seguridad/map/map/UI/servicio.xsodata/coordenadas?$format=json&$select=LATITUDE,LONGITUDE,SUBOPCION,PHONENUMBER_B,PHONENUMBER&$filter=LATITUDE lt 33 and LONGITUDE lt -86 and PHONENUMBER eq '"+in_param+"'&$oderby=SUBOPCION asc",
		success:function(coordenadas){
			indicador = 2;
			desactiva_campo();
			set_marcador(null);
			pinta_mark_filtro(coordenadas);
			set_mark_filtro(map);
			poligono_persona(in_param);
		}
	});	
}



var mark_filtro = [];
function pinta_mark_filtro(in_coordenada){
	var marker;
	var icono;
	var bounds = new google.maps.LatLngBounds();
	
	
	mark_filtro = [];
	for(var i in in_coordenada.d.results){
		var coordenada = new google.maps.LatLng(in_coordenada.d.results[i].LATITUDE, in_coordenada.d.results[i].LONGITUDE);

		switch(in_coordenada.d.results[i].SUBOPCION){
		case 'Recargas':
			icono = '/seguridad/map/map/UI/imagen/recarga_V2.png';
			index = google.maps.Marker.MAX_ZINDEX;
		break;
		
		case 'Llamadas realizadas':
			icono = '/seguridad/map/map/UI/imagen/30_sal.png';
			index = google.maps.Marker.MAX_ZINDEX;
		break;
			
		case 'Llamadas recibidas':
			icono = '/seguridad/map/map/UI/imagen/30_ent.png';
			index = google.maps.Marker.MAX_ZINDEX;
		break;
		
		case 'Sujeto':
			icono = '/seguridad/map/map/UI/imagen/icono.png';
			index = google.maps.Marker.MAX_ZINDEX + 1;
		break;
		}
		
		
			marker = new google.maps.Marker({
				icon: icono,
			 	position: coordenada,
			 	title:in_coordenada.d.results[i].SUBOPCION,
			 	numero:in_coordenada.d.results[i].PHONENUMBER,
			 	zIndex: index,
			 	map: null});
		
		mark_filtro.push(marker);	

			
			google.maps.event.addListener(marker, 'click', function(marker,i) {
				return function(){
				var info = [this.title, this.numero, this.position.lat(), this.position.lng()];
					accion_click(info,marker);
			}}(marker,i));
			
			bounds.extend(coordenada);
	  		  map.fitBounds(bounds);

	};
}

function set_marcador(in_entrada){
	for(var i =0; i< markers.length; i++){
		markers[i].setMap(in_entrada);
	};	
}


function set_mark_filtro(in_entrada){
	for(var i =0; i< mark_filtro.length; i++){
		if(mark_filtro[i].title !== "Sujeto"){
			mark_filtro[i].setMap(in_entrada);
		}		
	};	
	
	for(var i =0; i< mark_filtro.length; i++){
		if(mark_filtro[i].title === "Sujeto"){
			mark_filtro[i].setMap(in_entrada);
		}		
	};
	
}





function zona_riesgo(){
	jQuery.ajax({   
	    xhr: function(){
	        var xhr = new window.XMLHttpRequest();
	      //Download progress
	        xhr.addEventListener("progress", function(evt){
	          if (evt.lengthComputable) {
	            pb.start(evt.total);
	            pb.updateBar(evt.loaded);
	            	if(evt.loaded == evt.total){
	            	pb.hide();
	            	}
	          }
	        }, false);
	        return xhr;
	      },
	    url: '/seguridad/map/map/UI/servicio.xsodata/riesgo?$format=json&$select=PHONENUMBER,LATITUDE,LONGITUDE,TA_TYPE,COUNTER&$filter=LATITUDE lt 33 and LONGITUDE lt -86',   
	    method: 'GET',   
	    dataType: 'json',   
	    success: function(riesgo){
	    	jQuery.sap.require("sap.ui.model.json.JSONModel");
	    	oModel.setData(riesgo.d.results);
	    	var yeison = oModel.getProperty("/");
	    	var lat, lon;
	    	var areas = [];
	    	
	    	for(var y in yeison){
	    		if(yeison[y].TA_TYPE == 'AGRESIVIDAD_MEDIA'){
	    			color = '#FFFF00';
	    		}
	    		
	    		if(yeison[y].TA_TYPE == 'AGRESIVIDAD_ALTA'){
	    			color = '#FF0000';
	    		}
	    		crea_poligono(yeison[y].PHONENUMBER,yeison[y].LATITUDE, yeison[y].LONGITUDE,color);
	    		
	    	};
	    }
	});
}


function accion_click(info,marker){
	var valor;
	var infobubble = new InfoBubble({maxWidth:300});


		switch(info[0]){
		case 'Recargas':
			valor = 0;
			jQuery.ajax({   
			    xhr: function(){
			        var xhr = new window.XMLHttpRequest();
			      //Download progress
			        xhr.addEventListener("progress", function(evt){
			          if (evt.lengthComputable) {
			            pb.start(evt.total);
			            pb.updateBar(evt.loaded);
			            	if(evt.loaded == evt.total){
			            	pb.hide();
			            	}
			          }
			        }, false);
			        return xhr;
			      },
			    url: "/seguridad/map/map/UI/servicio.xsodata/coordenadas?$format=json&$select=VENTA&$filter=PHONENUMBER eq '"+info[1]+"' and LATITUDE eq "+info[2]+'M and LONGITUDE eq ' + info[3]+"M"+" and SUBOPCION eq '"+info[0]+"'",
			    method: 'GET',   
			    dataType: 'json',   
			    success: function(informacion){
					for(var x in informacion.d.results){
					valor = informacion.d.results[x].VENTA + valor;
					};
					infor='<b>Venta total de recargas: </b><br>'+'$'+valor;
					infobubble.addTab('General', infor);
			    	if (!infobubble.isOpen()) {
			            infobubble.open(map, marker);
			          }			    	
			    	
			}});
		break;
		
		case 'Llamadas realizadas':				    			
		case 'Llamadas recibidas':
			
			var estilo = '<div class="marker">';
			jQuery.ajax({   
			    xhr: function(){
			        var xhr = new window.XMLHttpRequest();
			      //Download progress
			        xhr.addEventListener("progress", function(evt){
			          if (evt.lengthComputable) {
			            pb.start(evt.total);
			            pb.updateBar(evt.loaded);
			            	if(evt.loaded == evt.total){
			            	pb.hide();
			            	}
			          }
			        }, false);
			        return xhr;
			      },
			    url: '/seguridad/map/map/UI/servicio.xsodata/coordenadas?$format=json&$select=LUGAR,PHONENUMBER_B&$filter=LATITUDE eq '+info[2]+'M and LONGITUDE eq ' + info[3]+"M"+" and SUBOPCION eq '"+info[0]+"'",
			    method: 'GET',   
			    dataType: 'json',   
			    success: function(informacion){
			    	var lugares = '<b>Lugares de llamada:</b><br>';
			    	var telefonos = '<b>Llamadas telefónicas:</b><br>';
			    	var lugar;
					var textarea = '<textarea id="styled" rows="5" cols="20" readonly>';
					var textarea2 = '<textarea id="styled" rows="5" cols="20" readonly>';
			    	for(var x in informacion.d.results){
			    		if(informacion.d.results[x].LUGAR != lugar && informacion.d.results[x].LUGAR != undefined && informacion.d.results[x].LUGAR != null){
			    			lugar = informacion.d.results[x].LUGAR;
			    			textarea += '•'+informacion.d.results[x].LUGAR+'\n';
			    		}
			    		if(informacion.d.results[x].PHONENUMBER_B != undefined && informacion.d.results[x].PHONENUMBER_B != null){
			    			textarea2 +='•'+informacion.d.results[x].PHONENUMBER_B+'\n';
			    		}
		    		};
		    		
		    		
		    		textarea += '</textarea><br><div>';
		    		textarea2 += '</textarea><br><div>'+'<\div>';
		    		infor = estilo + lugares + textarea + telefonos + textarea2; 
		    		
		    		
		    		infobubble.addTab('General', infor);
			    	if (!infobubble.isOpen()) {
			            infobubble.open(map, marker);
			        }			    	
			    	
			}});
		break;
		
		case 'Sujeto':
			var estilo = '<div class="markers">';
			estilo += '<textarea id="styled" rows="10" readonly>';
			var telefono = info[1];
				jQuery.ajax({   
				    xhr: function(){
				        var xhr = new window.XMLHttpRequest();
				      //Download progress
				        xhr.addEventListener("progress", function(evt){
				          if (evt.lengthComputable) {
				            pb.start(evt.total);
				            pb.updateBar(evt.loaded);
				            	if(evt.loaded == evt.total){
				            	pb.hide();
				            	}
				          }
				        }, false);
				        return xhr;
				      },
				    url: '/seguridad/map/map/UI/servicio.xsodata/analisis?$format=json&$select=FULLNAME,TA_TYPE,IDPERSONA&$filter=PHONENUMBER eq '+"'" +info[1]+"'",
				    method: 'GET',   
				    dataType: 'json',   
				    success: function(informacion){
				    	var token = '<b>Temas:</b><br>';
				    	var tema;
				    	for(var x in informacion.d.results){
					    	if(informacion.d.results[x].TA_TYPE == 'AGRESIVIDAD_ALTA' || informacion.d.results[x].TA_TYPE == 'AGRESIVIDAD_MEDIA'){	
					    		if(informacion.d.results[x].TA_TYPE != tema){
					    			tema = informacion.d.results[x].TA_TYPE;
					    			estilo += '•' + tema + '\n';
					    		}
					    	}
				    	};
				    	
				    	
				    	
				    		var id = '<b>ID:</b><br>'+informacion.d.results[0].IDPERSONA+'<br>'+'<b>Nombre:</b><br>'+informacion.d.results[0].FULLNAME+'<br><br><b># telefónico:</b><br>'+telefono+'<br><br>';
		    				var botones = '<br><center><button id="btn" class="btn btn:hover" onclick="filtro_persona(\''+telefono+'\')">Filtrar</button>'+
		    				'<button id="btn" class="btn btn:hover" onclick="reinicia()">Reiniciar</button></center>';
		    				
				    		estilo += '</textarea></div>'+botones;
					    	infor = id + token + estilo;
					    	
					    	infobubble.addTab('General', infor);
				    		
				    		jQuery.ajax({   
				    		    xhr: function(){
				    		        var xhr = new window.XMLHttpRequest();
				    		      //Download progress
				    		        xhr.addEventListener("progress", function(evt){
				    		          if (evt.lengthComputable) {
				    		            pb.start(evt.total);
				    		            pb.updateBar(evt.loaded);
				    		            	if(evt.loaded == evt.total){
				    		            	pb.hide();
				    		            	}
				    		          }
				    		        }, false);
				    		        return xhr;
				    		      },
				    		    url: '/seguridad/map/map/UI/llamada_txt.xsjs?general= ' + telefono,
				    		    method: 'GET',   
				    		    dataType: 'json',   
				    		    success: function(resultado){
				    		    	var info_detalle = '<div class="markers">';
				    		    	info_detalle += '<b>Texto de llamada:</b> <br><textarea id="styleds" rows="10" readonly>';
				    		    	for(var i in resultado.llamada){
				    		    	info_detalle += '•'+resultado.llamada[i].TEXTO+'\n';	
				    		    	}


				    		    	info_detalle += '</textarea></div><br>';
				    		    	
				    		    	var lista_graph = '<div class="listado"> <b>Visualizar: </b> <br> <select id="stysel" class="stysel" onchange="grafico(\''+telefono+'\',this)">'+
				    		    	'<option selected value="x">Elegir opción</option>'+
				    		    	'<option value="grafo1">Llamadas circulares</option>'+
				    		    	'<option value="grafo2">Red de contactos</option>'+
				    		    	'</select><br>';
				    		    	
				    		    	info_detalle += lista_graph;
				    		    	
							    	infobubble.addTab('Detalle', info_detalle);
				    		    }
				    		});

				    	if (!infobubble.isOpen()) {
				            infobubble.open(map, marker);
				          }
				    	
				}});
		break;
		}
	
}

var datos;
function grafico(in_telefono,s){
	var tipo = s.options[s.selectedIndex].value;
	var oOverlayContainer = new sap.ui.ux3.OverlayContainer({openButtonVisible:false});
	var htmlGraph1;
	oOverlayContainer.attachClose(function(){
		htmlGraph1;
		oOverlayContainer.destroyContent();
	});
	var oOverlayContainer2 = new sap.ui.ux3.OverlayContainer({openButtonVisible:false});
	var htmlGraph2;
	oOverlayContainer2.attachClose(function(){
		htmlGraph2;
		oOverlayContainer2.destroyContent();
	});
	
	if(tipo == "grafo1"){
		var url = "/seguridad/map/map/UI/servicio.xsodata/input(telefono='"+in_telefono+"')/Results?$format=json&$top=1";
	}
	else if (tipo == "grafo2"){
		var url = "/seguridad/map/map/UI/servicio.xsodata/in_rel(IM_TELEFONO='"+in_telefono+"')/Results?$format=json"; 
	}

		$.ajax({
		    xhr: function(){
		        var xhr = new window.XMLHttpRequest();
		      //Download progress
		        xhr.addEventListener("progress", function(evt){
		          if (evt.lengthComputable) {
		            pb.start(evt.total);
		            pb.updateBar(evt.loaded);
		            	if(evt.loaded == evt.total){
		            	pb.hide();
		            	}
		          }
		        }, false);
		        return xhr;
		      },

			type: 'GET',
			url: url,
			success: function(data){
				
				if(data.d.results.length == 0){
					alert("No existen datos para el grafo");
				}else{
					
					if(tipo == "grafo1"){
						var edges=conversion(data.d.results);
					}
					else if (tipo == "grafo2"){
						var edges=data.d.results; 
					}
					
					htmlGraph1 = new sap.ui.core.HTML({
					    content: "<br><div id='graphOriginal' align='center'></div><br>",
					    preferDOM: false,
					
					    afterRendering : function(e) {
					        
					       drawGraph(edges);
					       
				       
					    }
					});

					oOverlayContainer.addContent(htmlGraph1);
					oOverlayContainer.open();
				}
			}
		});
}



function zona_caliente(){	    	
	    	var punto_calor = new google.maps.MVCArray(coordenada_calor);	    	
	    	heatmap = new google.maps.visualization.HeatmapLayer({data:punto_calor,radius:20});	    	
	    	heatmap.setMap(map);
	    	desactiva_campo();
}


function marcador_busqueda(in_texto){
	
	if(in_texto == ""){
		set_marcador(null);
		reinicia();
	}else{
	   $.ajax({
	    xhr: function(){
	        var xhr = new window.XMLHttpRequest();
	      //Download progress
	        xhr.addEventListener("progress", function(evt){
	          if (evt.lengthComputable) {
	            pb.start(evt.total);
	            pb.updateBar(evt.loaded);
	            	if(evt.loaded == evt.total){
	            	pb.hide();
	            	}
	          }
	        }, false);
	        return xhr;
	      },

		type: 'GET',
		url: "/seguridad/map/map/UI/servicio.xsodata/buscador?$format=json&$filter=TA_TOKEN eq '" + in_texto + "'",
		success: function(latlngs){
			indicador = 2;
			set_marcador(null);
			genera_coordenadas(latlngs);
			reset_poligono(false);
			for(var e in latlngs.d.results){
				
				var texto = latlngs.d.results[e].PHONENUMBER;
				console.log(texto);
				poligono_texto(texto);
			}
			set_marcador(map);
			
		}});
	}
}


google.maps.event.addDomListener(window, 'load', initialize);