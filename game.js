function response( req, data )
{
	console.log( "response: " + data );
}

function CommsLoop()
{
	setTimeout( CommsLoop, 100 );

	var MyObject = { x:5 };

	QueueOperation(MyObject, response );
}


setTimeout( CommsLoop, 100 );
