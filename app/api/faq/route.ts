import { NextResponse } from 'next/server';

import connectDB from '@/lib/db';
import '@/lib/models';
import { FAQ } from '@/lib/models';
import { adminAuth } from '@/lib/middleware';

import type {
  CreateFAQRequest,
  CreateFAQResponse,
  ErrorResponse,
  GetAllFAQsResponse,
} from '@/types/dto/faq';

/* ======================================================
   Formatter (temporary local)
   → later move to lib/formatters/faq.ts
====================================================== */
function formatFAQ(doc: any) {
  const obj = doc?.toObject ? doc.toObject() : doc;

  return {
    _id: obj._id.toString(),
    faqQuestion: obj.faqQuestion,
    faqAnswer: obj.faqAnswer,
    createdAt:
      obj.createdAt instanceof Date
        ? obj.createdAt.toISOString()
        : obj.createdAt,
    updatedAt:
      obj.updatedAt instanceof Date
        ? obj.updatedAt.toISOString()
        : obj.updatedAt,
  };
}

/* ======================================================
   GET /api/faq
   Public – Get all FAQs
====================================================== */
export async function GET(_request: Request) {
  try {
    await connectDB();

    const faqs = await FAQ.find({}).sort({ createdAt: -1 });

    return NextResponse.json<GetAllFAQsResponse>(
      {
        success: true,
        data: faqs.map(formatFAQ),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    return NextResponse.json<ErrorResponse>(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

/* ======================================================
   POST /api/faq
   Admin only – Create FAQ
====================================================== */
export async function POST(request: Request) {
  // 🔒 Admin protection
  const authResponse = await adminAuth(request);
  if (authResponse) return authResponse;

  try {
    await connectDB();

    const body: CreateFAQRequest = await request.json();

    const { faqQuestion, faqAnswer } = body || {};

    // 🔹 Validation
    if (!faqQuestion?.trim() || !faqAnswer?.trim()) {
      return NextResponse.json<ErrorResponse>(
        {
          message:
            'faqQuestion and faqAnswer are required and must be non-empty',
        },
        { status: 400 }
      );
    }

    const newFAQ = await FAQ.create({
      faqQuestion: faqQuestion.trim(),
      faqAnswer: faqAnswer.trim(),
    });

    return NextResponse.json<CreateFAQResponse>(
      {
        success: true,
        message: 'FAQ created successfully',
        data: formatFAQ(newFAQ),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating FAQ:', error);
    return NextResponse.json<ErrorResponse>(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
