
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, subject, message, callbackRequested } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return Response.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    // Mock insert - just return success!
    return Response.json({
      success: true,
      message: 'Thank you for your message. We will get back to you soon!',
      id: 1
    });

  } catch (error) {
    console.error('Contact form submission error:', error);
    return Response.json(
      { error: 'Failed to submit contact form' },
      { status: 500 }
    );
  }
}
