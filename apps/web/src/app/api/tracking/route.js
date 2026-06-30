import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const trackingCode = searchParams.get('code');

    if (!trackingCode) {
      return Response.json(
        { error: 'Tracking code is required' },
        { status: 400 }
      );
    }

    const result = await sql`
      SELECT 
        tracking_code,
        customer_name,
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
      WHERE tracking_code = ${trackingCode.toUpperCase()}
    `;

    if (result.length === 0) {
      return Response.json(
        { error: 'Tracking code not found' },
        { status: 404 }
      );
    }

    const shipment = result[0];
    
    // Calculate progress percentage based on status
    const getProgressPercentage = (status) => {
      switch (status) {
        case 'Pickup Scheduled': return 10;
        case 'In Transit': return 40;
        case 'Customs': return 70;
        case 'Out for Delivery': return 90;
        case 'Delivered': return 100;
        default: return 0;
      }
    };

    // Create timeline with statuses
    const timeline = [
      {
        status: 'Pickup Scheduled',
        completed: ['Pickup Scheduled', 'In Transit', 'Customs', 'Out for Delivery', 'Delivered'].includes(shipment.status),
        timestamp: shipment.pickup_date
      },
      {
        status: 'In Transit',
        completed: ['In Transit', 'Customs', 'Out for Delivery', 'Delivered'].includes(shipment.status),
        timestamp: shipment.status === 'In Transit' ? new Date() : null
      },
      {
        status: 'Customs',
        completed: ['Customs', 'Out for Delivery', 'Delivered'].includes(shipment.status),
        timestamp: shipment.status === 'Customs' ? new Date() : null
      },
      {
        status: 'Out for Delivery',
        completed: ['Out for Delivery', 'Delivered'].includes(shipment.status),
        timestamp: shipment.status === 'Out for Delivery' ? new Date() : null
      },
      {
        status: 'Delivered',
        completed: shipment.status === 'Delivered',
        timestamp: shipment.actual_delivery
      }
    ];

    return Response.json({
      ...shipment,
      progress_percentage: getProgressPercentage(shipment.status),
      timeline
    });

  } catch (error) {
    console.error('Tracking lookup error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}