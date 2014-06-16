var conn = $.db.getConnection();

var pstmt = conn.prepareStatement( "select * from seguridad.circular" );

var rs = pstmt.executeQuery();
$.response.contentType = "text/plain";

if (!rs.next()) {
	$.response.setBody( "Failed to retreive data" ); 
	$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
} 
else { 
	$.response.setBody("Response: " + rs.getString(1) + " " +  rs.getString(2) + " " + rs.getString(3) + " " + rs.getString(4) );
}

rs.close();
pstmt.close();