import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

const LS_API_KEY = process.env.LEMONSQUEEZY_API_KEY!;
const LS_STORE_ID = process.env.LEMONSQUEEZY_STORE_ID!;

const VARIANT_IDS = {
  monthly: process.env.LEMONSQUEEZY_MONTHLY_VARIANT_ID!, 
  yearly: process.env.LEMONSQUEEZY_YEARLY_VARIANT_ID!,   
};
console.log('🔍 Variant IDs:', VARIANT_IDS);
console.log('🔍 Store ID:', LS_STORE_ID);
console.log('🔍 Using API Key:', LS_API_KEY.substring(0, 10) + '...');

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan } = await request.json(); // 'monthly' or 'yearly'

    if (!['monthly', 'yearly'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const variantId = VARIANT_IDS[plan as keyof typeof VARIANT_IDS];

    if (!variantId) {
      return NextResponse.json({ error: 'Plan not configured' }, { status: 500 });
    }

    const response = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LS_API_KEY}`,
        'Content-Type': 'application/vnd.api+json',
        'Accept': 'application/vnd.api+json',
      },
      body: JSON.stringify({
        data: {
          type: 'checkouts',
          attributes: {
            checkout_data: {
              email: user.email,
              name: user.name || undefined,
              custom: {
                user_id: user.id,
              },
            },
            product_options: {
              redirect_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.trystrideai.com'}/premium/callback`,
            },
          },
          relationships: {
            store: {
              data: {
                type: 'stores',
                id: LS_STORE_ID,
              },
            },
            variant: {
              data: {
                type: 'variants',
                id: variantId,
              },
            },
          },
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Lemon Squeezy checkout error:', JSON.stringify(data));
      return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 });
    }

    const checkoutUrl = data.data.attributes.url;

    return NextResponse.json({ url: checkoutUrl });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}