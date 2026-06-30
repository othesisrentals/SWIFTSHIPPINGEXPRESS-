import sql from "@/app/api/utils/sql";

// Update consignment
export async function PUT(request, { params }) {
  try {
    const id = params.id;
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
    // Build dynamic update query
    const result = await sql`
      UPDATE consignments SET
        tracking_code = ${trackingCode ? trackingCode.toUpperCase() : sql`tracking_code`},
        customer_name = ${customerName ?? sql`customer_name`},
        customer_email = ${customerEmail ?? sql`customer_email`},
        customer_phone = ${customerPhone ?? sql`customer_phone`},
        origin_address = ${originAddress ?? sql`origin_address`},
        destination_address = ${destinationAddress ?? sql`destination_address`},
        service_type = ${serviceType ?? sql`service_type`},
        status = ${status ?? sql`status`},
        weight_kg = ${weightKg ?? sql`weight_kg`},
        dimensions = ${dimensions ?? sql`dimensions`},
        pickup_date = ${pickupDate ?? sql`pickup_date`},
        estimated_delivery = ${estimatedDelivery ?? sql`estimated_delivery`},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;
    if (result.length === 0) {
      return Response.json({ error: 'Consignment not found' }, { status: 404 });
    }
    return Response.json(result[0]);
  } catch (error) {
    console.error('Failed to update consignment:', error);
    return Response.json({ error: 'Failed to update consignment' }, { status: 500 });
  }
}

// Delete consignment
export async function DELETE(request, { params }) {
  try {
    const id = params.id;
    const result = await sql`
      DELETE FROM consignments WHERE id = ${id} RETURNING *
    `;
    if (result.length === 0) {
      return Response.json({ error: 'Consignment not found' }, { status: 404 });
    }
    return Response.json({ message: 'Consignment deleted', id });
  } catch (error) {
    console.error('Failed to delete consignment:', error);
    return Response.json({ error: 'Failed to delete consignment' }, { status: 500 });
  }
}