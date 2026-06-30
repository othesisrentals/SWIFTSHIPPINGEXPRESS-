
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const trackingCode = searchParams.get('code');

    if (!trackingCode) {
      return Response.json(
        { error: 'Tracking code is required' },
        { status: 400 }
      );
    }

    // Mock shipment data
    const mockShipment = {
      tracking_code: trackingCode.toUpperCase(),
      customer_name: 'John Doe',
      origin_address: '123 Main St, New York, NY 10001, USA',
      destination_address: '456 Park Ave, Los Angeles, CA 90001, USA',
      service_type: 'Air Freight',
      status: 'In Transit',
      weight_kg: 25,
      dimensions: '30x40x20 cm',
      pickup_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      estimated_delivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      actual_delivery: null,
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
    
    // Calculate progress percentage based on status
    const getProgressPercentage = (status: string) => {
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
        completed: ['Pickup Scheduled', 'In Transit', 'Customs', 'Out for Delivery', 'Delivered'].includes(mockShipment.status),
        timestamp: mockShipment.pickup_date
      },
      {
        status: 'In Transit',
        completed: ['In Transit', 'Customs', 'Out for Delivery', 'Delivered'].includes(mockShipment.status),
        timestamp: mockShipment.status === 'In Transit' ? new Date().toISOString() : null
      },
      {
        status: 'Customs',
        completed: ['Customs', 'Out for Delivery', 'Delivered'].includes(mockShipment.status),
        timestamp: mockShipment.status === 'Customs' ? new Date().toISOString() : null
      },
      {
        status: 'Out for Delivery',
        completed: ['Out for Delivery', 'Delivered'].includes(mockShipment.status),
        timestamp: mockShipment.status === 'Out for Delivery' ? new Date().toISOString() : null
      },
      {
        status: 'Delivered',
        completed: mockShipment.status === 'Delivered',
        timestamp: mockShipment.actual_delivery
      }
    ];

    return Response.json({
      ...mockShipment,
      progress_percentage: getProgressPercentage(mockShipment.status),
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
