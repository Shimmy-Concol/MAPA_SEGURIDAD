$.response.contentType="json";                                                                    
var output = "";                                                                                
var conn  = $.db.getConnection();

var lat = $.request.parameters.get('lat');
var lon = $.request.parameters.get('lon');
var qry = "select shape.ST_AsGeoJSON() from seguridad.mapshapes_mun where SHAPE.ST_CONTAINS(NEW ST_POINT("+lat+", "+lon+")) = 1"

var pstmt = conn.prepareStatement(qry);

var rs    = pstmt.executeQuery();

if (!rs.next())                                                                                   
{
    $.response.setBody( "Failed to retrieve data");
    $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
}

else                                                                                        
{                                                                                            
    output = rs.getString(1);                                                                                
}                                                                                         
rs.close();                                                                                   
pstmt.close();                                                                          
conn.close();                                                                 
$.response.setBody(output);