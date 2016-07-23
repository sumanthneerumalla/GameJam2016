function response( req, data )
{
	console.log( "response: " + data );
}

function CommsLoop()
{
	setTimeout( CommsLoop, 100 );
	QueueOperation('query', response );
}


setTimeout( CommsLoop, 100 );
