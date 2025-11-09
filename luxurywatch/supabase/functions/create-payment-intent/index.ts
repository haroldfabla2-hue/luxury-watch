/**
 * Edge Function: create-payment-intent
 * Crea un Payment Intent de Stripe y registra el pedido en la base de datos
 */

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'false'
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { amount, currency = 'eur', cartItems, customerEmail, shippingAddress, billingAddress } = await req.json();

    console.log('Payment intent request received:', { amount, currency, cartItemsCount: cartItems?.length });

    // Validar parámetros requeridos
    if (!amount || amount <= 0) {
      throw new Error('Se requiere un monto válido');
    }

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      throw new Error('Se requieren artículos en el carrito');
    }

    // Validar estructura de artículos del carrito
    for (const item of cartItems) {
      if (!item.product_id || !item.quantity || !item.price || !item.product_name) {
        throw new Error('Cada artículo debe tener product_id, quantity, price y product_name');
      }
      if (item.quantity <= 0 || item.price <= 0) {
        throw new Error('La cantidad y precio deben ser positivos');
      }
    }

    // Obtener variables de entorno
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');

    if (!stripeSecretKey) {
      console.error('Clave secreta de Stripe no encontrada');
      throw new Error('Stripe no está configurado. Por favor configura STRIPE_SECRET_KEY en Supabase Secrets.');
    }

    if (!serviceRoleKey || !supabaseUrl) {
      throw new Error('Configuración de Supabase faltante');
    }

    console.log('Variables de entorno validadas, creando payment intent...');

    // Calcular monto total desde el carrito para verificar
    const calculatedAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (Math.abs(calculatedAmount - amount) > 0.01) {
      throw new Error('Discrepancia en el monto: el monto calculado no coincide con el proporcionado');
    }

    // Obtener usuario del header de autenticación si está disponible
    let userId = null;
    const authHeader = req.headers.get('authorization');
    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '');
        const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'apikey': serviceRoleKey
          }
        });
        if (userResponse.ok) {
          const userData = await userResponse.json();
          userId = userData.id;
          console.log('Usuario identificado:', userId);
        }
      } catch (error) {
        console.log('No se pudo obtener usuario del token:', error.message);
      }
    }

    // Preparar datos del Payment Intent de Stripe
    const stripeParams = new URLSearchParams();
    stripeParams.append('amount', Math.round(amount * 100).toString()); // Convertir a centavos
    stripeParams.append('currency', currency);
    stripeParams.append('payment_method_types[]', 'card');
    stripeParams.append('metadata[customer_email]', customerEmail || '');
    stripeParams.append('metadata[cart_items_count]', cartItems.length.toString());
    stripeParams.append('metadata[total_items]', cartItems.reduce((sum, item) => sum + item.quantity, 0).toString());
    stripeParams.append('metadata[user_id]', userId || '');

    // Crear Payment Intent con Stripe
    const stripeResponse = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: stripeParams.toString()
    });

    console.log('Respuesta de Stripe API status:', stripeResponse.status);

    if (!stripeResponse.ok) {
      const errorData = await stripeResponse.text();
      console.error('Error de Stripe API:', errorData);
      throw new Error(`Error de Stripe API: ${errorData}`);
    }

    const paymentIntent = await stripeResponse.json();
    console.log('Payment Intent creado exitosamente:', paymentIntent.id);

    // Crear registro de pedido en la base de datos
    const orderData = {
      user_id: userId,
      stripe_payment_intent_id: paymentIntent.id,
      status: 'pending',
      total_amount: amount,
      currency: currency,
      shipping_address: shippingAddress || null,
      billing_address: billingAddress || null,
      customer_email: customerEmail || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('Creando pedido en la base de datos...');

    const orderResponse = await fetch(`${supabaseUrl}/rest/v1/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(orderData)
    });

    if (!orderResponse.ok) {
      const errorText = await orderResponse.text();
      console.error('Error al crear pedido:', errorText);
      // Si falla la creación del pedido, cancelar el Payment Intent
      try {
        await fetch(`https://api.stripe.com/v1/payment_intents/${paymentIntent.id}/cancel`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${stripeSecretKey}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });
        console.log('Payment Intent cancelado debido a fallo en creación de pedido');
      } catch (cancelError) {
        console.error('Error al cancelar Payment Intent:', cancelError.message);
      }
      throw new Error(`Error al crear pedido: ${errorText}`);
    }

    const order = await orderResponse.json();
    const orderId = order[0].id;
    console.log('Pedido creado exitosamente:', orderId);

    // Crear items del pedido
    const orderItems = cartItems.map(item => ({
      order_id: orderId,
      product_id: item.product_id,
      quantity: item.quantity,
      price_at_time: item.price,
      product_name: item.product_name,
      product_image_url: item.product_image_url || null,
      created_at: new Date().toISOString()
    }));

    console.log('Creando items del pedido...');

    const orderItemsResponse = await fetch(`${supabaseUrl}/rest/v1/order_items`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderItems)
    });

    if (!orderItemsResponse.ok) {
      const errorText = await orderItemsResponse.text();
      console.error('Error al crear items del pedido:', errorText);
      console.warn('Pedido creado pero falló la creación de items');
    } else {
      console.log('Items del pedido creados exitosamente');
    }

    const result = {
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        orderId: orderId,
        amount: amount,
        currency: currency,
        status: 'pending'
      }
    };

    console.log('Creación de Payment Intent completada exitosamente');

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error al crear Payment Intent:', error);

    const errorResponse = {
      error: {
        code: 'PAYMENT_INTENT_FAILED',
        message: error.message,
        timestamp: new Date().toISOString()
      }
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
