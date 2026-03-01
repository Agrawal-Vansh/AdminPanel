import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

import connectDB from '@/lib/db';
import '@/lib/models';
import { FAQ } from '@/lib/models';
import { adminAuth } from '@/lib/middleware';

import type {
  GetSingleFAQResponse,
  UpdateFAQRequest,
  UpdateFAQResponse,
  DeleteFAQResponse,
  ErrorResponse,
} from '@/types/dto/faq';

/* ======================================================
   Formatter
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
   Helper – unwrap async params (Next.js latest)
====================================================== */
async function getId(params: Promise<{ id: string }>) {
  return (await params).id;
}

/* ======================================================
   GET /api/faq/[id]
   Public – Get single FAQ
====================================================== */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const id = await getId(params);

    // Optional safety check (prevents cast errors)
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json<ErrorResponse>(
        { message: 'Invalid FAQ id' },
        { status: 400 }
      );
    }

    const faq = await FAQ.findById(id);

    if (!faq) {
      return NextResponse.json<ErrorResponse>(
        { message: 'FAQ not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<GetSingleFAQResponse>(
      {
        success: true,
        data: formatFAQ(faq),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching FAQ:', error);
    return NextResponse.json<ErrorResponse>(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

/* ======================================================
   PATCH /api/faq/[id]
   Admin only – Update FAQ
====================================================== */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // 🔒 Admin protection
  const authResponse = await adminAuth(request);
  if (authResponse) return authResponse;

  try {
    await connectDB();

    const id = await getId(params);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json<ErrorResponse>(
        { message: 'Invalid FAQ id' },
        { status: 400 }
      );
    }

    const body: UpdateFAQRequest = await request.json();

    const updates: Record<string, unknown> = {};

    if (body.faqQuestion?.trim()) {
      updates.faqQuestion = body.faqQuestion.trim();
    }

    if (body.faqAnswer?.trim()) {
      updates.faqAnswer = body.faqAnswer.trim();
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json<ErrorResponse>(
        { message: 'At least one field is required for update' },
        { status: 400 }
      );
    }

    const updatedFAQ = await FAQ.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    );

    if (!updatedFAQ) {
      return NextResponse.json<ErrorResponse>(
        { message: 'FAQ not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<UpdateFAQResponse>(
      {
        success: true,
        message: 'FAQ updated successfully',
        data: formatFAQ(updatedFAQ),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating FAQ:', error);
    return NextResponse.json<ErrorResponse>(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

/* ======================================================
   DELETE /api/faq/[id]
   Admin only – Delete FAQ
====================================================== */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // 🔒 Admin protection
  const authResponse = await adminAuth(request);
  if (authResponse) return authResponse;

  try {
    await connectDB();

    const id = await getId(params);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json<ErrorResponse>(
        { message: 'Invalid FAQ id' },
        { status: 400 }
      );
    }

    const deleted = await FAQ.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json<ErrorResponse>(
        { message: 'FAQ not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<DeleteFAQResponse>(
      {
        success: true,
        message: 'FAQ deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    return NextResponse.json<ErrorResponse>(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}