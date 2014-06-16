var current_object1={};
var general = $.request.parameters.get("general");
var generalResponse=[];
$.response.contentType = "json";
var connection = $.db.getConnection("seguridad.map.map.UI::Anonymous_Access");

	var generales = connection.prepareStatement("select top 100 LLAMADA_TXT from SEGURIDAD.LLAMADAS_TXT where NUM_A = "+ general);
	var ResultRow1 = generales.executeQuery();
	while(ResultRow1.next()){
		current_object1={"TEXTO":ResultRow1.getString(1)};

		generalResponse.push(current_object1);
	}


		ResultRow1.close();
		generales.close();

$.response.setBody(JSON.stringify({llamada:generalResponse}));

	connection.close();