var markers = [], markers2 = [],ident_bound, heatmap, coordenada_calor = [], indicador=0;
var circulo=[];
var zona = {}, color,poligonos=[];
var oModel = new sap.ui.model.json.JSONModel();
var infor,pb;
var infowindow = new google.maps.InfoWindow({maxWidth: 250});
var activo_filtro = 0;


pb = progressBar();

function initialize(){	
var mapOptions = {
    zoom: 5,
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

	  
	  if(map.getZoom() >= 7 && indicador == 0){
		  indicador = 1;
		  heatmap.setMap(null);
		  pinta_poligonos(map);
		  pinta_marcador(map);
	  }
	  if(map.getZoom() <= 6 && indicador == 1){
		  indicador = 0;
		  pinta_poligonos(null);
		  pinta_marcador(null);
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
	var icono;
	ident_bound = 1;
	var bounds = new google.maps.LatLngBounds();
	
	
	markers = [];
	for(var i in in_coordenada.d.results){
		var parametro;
		var coordenada = new google.maps.LatLng(in_coordenada.d.results[i].LATITUDE, in_coordenada.d.results[i].LONGITUDE);
		coordenada_calor.push(coordenada);
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
			 	zIndex:index,
			 	map: null});
		
		markers.push(marker);	

			
			google.maps.event.addListener(marker, 'click', function(marker,i) {
				return function(){
				var info = [this.title, this.numero, this.position.lat(), this.position.lng()];
				if(activo_filtro == 0){
					accion_click(info,marker);
				}else{
					click_Offiltro(info,marker);
				}
			}}(marker,i));
	};
	

}




function reinicia(){
	activo_filtro = 0;
	  if(map.getZoom() >= 7 && indicador == 2){
		  indicador = 1;
	  }
	  if(map.getZoom() <= 6 && indicador == 2){
		map.setZoom(7);
		indicador = 1;
		pinta_marcador(null);
		genera_coordenadas(marker_principal);
		reset_poligono(true);
		pinta_marcador(map);
	  }else{
		pinta_marcador(null);
		genera_coordenadas(marker_principal);
		reset_poligono(true);
		pinta_marcador(map);
	  }
	
}



function filtro_persona(in_param){
	activo_filtro = 1;
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
		url:"/seguridad/map/map/UI/servicio.xsodata/coordenadas?$format=json&$select=LATITUDE,LONGITUDE,SUBOPCION,PHONENUMBER_B,PHONENUMBER&$filter=LATITUDE lt 33 and LONGITUDE lt -86 and PHONENUMBER eq '"+in_param+"'",
		success:function(coordenadas){
			pinta_marcador(null);
			genera_coordenadas(coordenadas);
			poligono_persona(in_param);
			pinta_marcador(map);
			indicador = 2;
		}
	});	
}


function pinta_marcador(entrada){
	var personas = [];
	for(var i = 0; i < markers.length; i++){
		if(markers[i].title != 'Sujeto')
			markers[i].setMap(entrada);
		else
			personas.push(markers[i]);
	};

	for(var l = 0; l < personas.length; l++){
		if(personas[l].title == "Sujeto"){
			personas[l].setMap(entrada);
		}
	}
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
			    url: '/seguridad/map/map/UI/servicio.xsodata/coordenadas?$format=json&$select=VENTA&$filter=LATITUDE eq '+info[2]+'M and LONGITUDE eq ' + info[3]+"M"+" and SUBOPCION eq '"+info[0]+"'",
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
//				    url: '/seguridad/map/map/UI/servicio.xsodata/analisis?$format=json&$select=FULLNAME,TA_TOKEN,IDPERSONA&$filter=PHONENUMBER eq '+"'" +info[1]+"' and TA_TYPE eq 'AGRESIVIDAD_ALTA' or TA_TYPE eq 'AGRESIVIDAD_MEDIA' &$orderby=TA_TOKEN",
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


function click_Offiltro(info,marker){
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



function zona_caliente(){	    	
	    	var punto_calor = new google.maps.MVCArray(coordenada_calor);	    	
	    	heatmap = new google.maps.visualization.HeatmapLayer({data:punto_calor,radius:20});	    	
	    	heatmap.setMap(map);
}

google.maps.event.addDomListener(window, 'load', initialize);