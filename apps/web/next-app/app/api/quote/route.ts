
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, serviceType, origin, destination, description } = body;

    // Validate required fields
    if (!name || !email || !origin || !destination) {
      return Response.json(
        { error: 'Name, email, origin, and destination are required' },
        { status: 400 }
      );
    }

    // Mock insert - just return success!
    return Response.json({
      success: true,
      message: 'Quote request submitted successfully! Our team will contact you within 24 hours.',
      id: 1
    });

  } catch (error) {
    console.error('Quote request submission error:', error);
    return Response.json(
      { error: 'Failed to submit quote request' },
      { status: 500 }
    );
  }
}
