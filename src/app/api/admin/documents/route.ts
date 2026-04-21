import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const documents = await prisma.document.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(documents);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const title = formData.get("title") as string;
    const isAdminOnly = formData.get("isAdminOnly") === "true";
    const memberId = formData.get("memberId") as string;
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // In a real application, you would upload the file to a storage service (S3, Cloudinary, etc.)
    // For this demonstration, we'll use a placeholder URL
    const fileUrl = `/uploads/${Date.now()}-${file.name}`;
    const fileType = file.type.includes("pdf") ? "PDF" : "JPG";

    const document = await prisma.document.create({
      data: {
        title,
        fileUrl,
        fileType,
        isAdminOnly,
        memberId: memberId || null,
      },
    });

    return NextResponse.json(document);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
