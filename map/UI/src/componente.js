var oLabel1 = new sap.ui.commons.Label({ text: "Filtro por tema:", labelFor: oAutoComplete});
oLabel1.setDesign(sap.ui.commons.LabelDesign.Bold);
oLabel1.placeAt("panel_uno");

var oModel2 = new sap.ui.model.json.JSONModel();
jQuery.ajax({   
    url: '/seguridad/map/map/UI/servicio.xsodata/analisis?$format=json&$select=TA_TOKEN&$filter=TA_TYPE eq \'AGRESIVIDAD_ALTA\' or TA_TYPE eq \'AGRESIVIDAD_MEDIA\'&$orderby=TA_TOKEN',   
    method: 'GET',   
    dataType: 'json',   
    success: function(telefonos){
    	jQuery.sap.require("sap.ui.model.json.JSONModel");
    	oModel2.setData(telefonos.d.results);
    }
});  

var oAutoComplete = new sap.ui.commons.AutoComplete({
	tooltip: "Introducir texto para filtrar.",
	width: "150px",
	maxPopupItems: 5,
	visible:true,
	items: {
		path: "/",
		template: new sap.ui.core.ListItem({text: "{TA_TOKEN}"})
	},
	change: function(oEvent){
		var texto = oAutoComplete.getValue();
		marcador_busqueda(texto);
	    
	}
}).placeAt("panel_uno");
oAutoComplete.setModel(oModel2);


function desactiva_campo(){
	oAutoComplete.setEditable(false);
}

function activa_campo(){
	oAutoComplete.setEditable(true);
	oAutoComplete.setValue("");
}