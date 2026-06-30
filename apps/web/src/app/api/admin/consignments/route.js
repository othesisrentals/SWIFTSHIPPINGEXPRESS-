import sql from "@/app/api/utils/sql";

// Get all consignments for admin dashboard
export async function GET(request) {
  try {
    const result = await sql`
      SELECT 
        id,
        tracking_code,
        customer_name,
        customer_email,
        customer_phone,
        origin_address,
        destination_address,
        service_type,
        status,
        weight_kg,
        dimensions,
        pickup_date,
        estimated_delivery,
        actual_delivery,
        created_at
      FROM consignments 
      ORDER BY created_at DESC
    `;

    return Response.json(result);

  } catch (error) {
    console.error('Failed to fetch consignments:', error);
    return Response.json(
      { error: 'Failed to fetch consignments' },
      { status: 500 }
    );
  }
}

// Create new consignment
export async function OPTIONS(request) {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}

export async function POST(request) {

  try {
    const body = await request.json();
    const {
      trackingCode,
      customerName,
      customerEmail,
      customerPhone,
      originAddress,
      destinationAddress,
      serviceType,
      status,
      weightKg,
      dimensions,
      pickupDate,
      estimatedDelivery
    } = body;

    // Validate required fields
    if (!trackingCode || !customerName || !originAddress || !destinationAddress || !serviceType) {
      return Response.json(
        { error: 'Tracking code, customer name, origin, destination, and service type are required' },
        { status: 400 }
      );
    }

    // Check if tracking code already exists
    const existing = await sql`
      SELECT id FROM consignments WHERE tracking_code = ${trackingCode.toUpperCase()}
    `;

    if (existing.length > 0) {
      return Response.json(
        { error: 'Tracking code already exists' },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO consignments (
        tracking_code, 
        customer_name, 
        customer_email,
        customer_phone,
        origin_address, 
        destination_address, 
        service_type, 
        status,
        weight_kg,
        dimensions,
        pickup_date,
        estimated_delivery,
        updated_at
      )
      VALUES (
        ${trackingCode.toUpperCase()}, 
        ${customerName}, 
        ${customerEmail || null},
        ${customerPhone || null},
        ${originAddress}, 
        ${destinationAddress}, 
        ${serviceType},
        ${status || 'Pickup Scheduled'},
        ${weightKg || null},
        ${dimensions || null},
        ${pickupDate || null},
        ${estimatedDelivery || null},
        CURRENT_TIMESTAMP
      )
      RETURNING *
    `;

    return Response.json(result[0]);

  } catch (error) {
    console.error('Failed to create consignment:', error);
    return Response.json(
      { error: 'Failed to create consignment' },
      { status: 500 }
    );
  }
}

// Update existing consignment
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const {
      trackingCode,
      customerName,
      customerEmail,
      customerPhone,
      originAddress,
      destinationAddress,
      serviceType,
      status,
      weightKg,
      dimensions,
      pickupDate,
      estimatedDelivery,
      actualDelivery
    } = body;

    // Ensure the consignment exists
    const existing = await sql`SELECT id FROM consignments WHERE id = ${id}`;
    if (existing.length === 0) {
      return Response.json({ error: 'Consignment not found' }, { status: 404 });
    }

    const result = await sql`
      UPDATE consignments SET
        tracking_code = ${trackingCode ? trackingCode.toUpperCase() : undefined},
        customer_name = ${customerName},
        customer_email = ${customerEmail || null},
        customer_phone = ${customerPhone || null},
        origin_address = ${originAddress},
        destination_address = ${destinationAddress},
        service_type = ${serviceType},
        status = ${status},
        weight_kg = ${weightKg || null},
        dimensions = ${dimensions || null},
        pickup_date = ${pickupDate || null},
        estimated_delivery = ${estimatedDelivery || null},
        actual_delivery = ${actualDelivery || null},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;

    return Response.json(result[0]);

  } catch (error) {
    console.error('Failed to update consignment:', error);
    return Response.json({ error: 'Failed to update consignment' }, { status: 500 });
  }
}

// Delete a consignment
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const existing = await sql`SELECT id FROM consignments WHERE id = ${id}`;
    if (existing.length === 0) {
      return Response.json({ error: 'Consignment not found' }, { status: 404 });
    }
    await sql`DELETE FROM consignments WHERE id = ${id}`;
    return Response.json({ message: 'Consignment deleted' });
  } catch (error) {
    console.error('Failed to delete consignment:', error);
    return Response.json({ error: 'Failed to delete consignment' }, { status: 500 });
  }
}