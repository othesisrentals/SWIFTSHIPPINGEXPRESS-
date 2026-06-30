import sql from "@/app/api/utils/sql";

export async function POST(request) {
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

    // Insert contact submission
    const result = await sql`
      INSERT INTO contact_submissions (name, email, subject, message, callback_requested)
      VALUES (${name}, ${email}, ${subject || ''}, ${message}, ${callbackRequested || false})
      RETURNING id, created_at
    `;

    return Response.json({
      success: true,
      message: 'Thank you for your message. We will get back to you soon!',
      id: result[0].id
    });

  } catch (error) {
    console.error('Contact form submission error:', error);
    return Response.json(
      { error: 'Failed to submit contact form' },
      { status: 500 }
    );
  }
}