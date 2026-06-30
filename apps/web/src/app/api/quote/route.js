import sql from "@/app/api/utils/sql";

export async function POST(request) {
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

    // Insert quote request
    const result = await sql`
      INSERT INTO quote_requests (name, email, phone, service_type, origin, destination, description)
      VALUES (${name}, ${email}, ${phone || ''}, ${serviceType || ''}, ${origin}, ${destination}, ${description || ''})
      RETURNING id, created_at
    `;

    return Response.json({
      success: true,
      message: 'Quote request submitted successfully! Our team will contact you within 24 hours.',
      id: result[0].id
    });

  } catch (error) {
    console.error('Quote request submission error:', error);
    return Response.json(
      { error: 'Failed to submit quote request' },
      { status: 500 }
    );
  }
}